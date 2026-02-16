import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { createGroqClient, MODELS } from '@/lib/openai/client'
import { OUTLINE_GENERATION_PROMPT } from '@/lib/openai/prompts'

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    // Auth required
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Check if outlines already exist (idempotent — no token spend)
    const { data: existing } = await supabase
      .from('writing_prompt_outlines')
      .select('*')
      .eq('prompt_id', id)
      .single()

    if (existing) {
      return NextResponse.json({ outlines: existing })
    }

    // Fetch the prompt
    const { data: prompt, error: promptError } = await supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type')
      .eq('id', id)
      .single()

    if (promptError || !prompt) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    // Generate outlines via Groq
    const groqClient = createGroqClient()
    const completion = await groqClient.chat.completions.create({
      model: MODELS.OUTLINE_GENERATION,
      messages: [
        {
          role: 'user',
          content: OUTLINE_GENERATION_PROMPT(prompt.question_type, prompt.prompt_text),
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    if (!result.outline_1 || !result.outline_2) {
      return NextResponse.json({ error: 'Failed to generate valid outlines' }, { status: 500 })
    }

    // Store using service role to bypass RLS (outlines are server-generated content)
    const serviceSupabase = createServiceRoleClient()
    const serviceDb = serviceSupabase as unknown as {
      from: (table: string) => {
        insert: (data: object) => { select: () => { single: () => Promise<{ data: unknown; error: unknown }> } }
      }
    }

    const { data: outlines, error: insertError } = await serviceDb
      .from('writing_prompt_outlines')
      .insert({
        prompt_id: id,
        outline_1: typeof result.outline_1 === 'string' ? result.outline_1 : JSON.stringify(result.outline_1),
        outline_2: typeof result.outline_2 === 'string' ? result.outline_2 : JSON.stringify(result.outline_2),
      })
      .select()
      .single()

    if (insertError) {
      // Race condition: another request inserted first — fetch the existing one
      const { data: existingAfterConflict } = await supabase
        .from('writing_prompt_outlines')
        .select('*')
        .eq('prompt_id', id)
        .single()

      if (existingAfterConflict) {
        return NextResponse.json({ outlines: existingAfterConflict })
      }
      return NextResponse.json({ error: 'Failed to save outlines' }, { status: 500 })
    }

    // Log token usage
    await supabase.from('token_usage').insert({
      user_id: user.id,
      request_type: 'outline_generation',
      input_tokens: completion.usage?.prompt_tokens || 0,
      output_tokens: completion.usage?.completion_tokens || 0,
      model: MODELS.OUTLINE_GENERATION,
    })

    return NextResponse.json({ outlines })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to generate outlines' }, { status: 500 })
  }
}
