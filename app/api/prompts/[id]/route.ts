import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()
    const { id } = params

    const [promptResult, outlinesResult] = await Promise.all([
      supabase
        .from('writing_prompts')
        .select('id, prompt_text, question_type, topic_id, created_by, created_at, updated_at, prompt_topics(id, name)')
        .eq('id', id)
        .single(),
      supabase
        .from('writing_prompt_outlines')
        .select('*')
        .eq('prompt_id', id)
        .single(),
    ])

    if (promptResult.error) {
      return NextResponse.json({ error: 'Prompt not found' }, { status: 404 })
    }

    return NextResponse.json({
      prompt: {
        ...promptResult.data,
        prompt_topics: Array.isArray(promptResult.data.prompt_topics)
          ? promptResult.data.prompt_topics[0]
          : promptResult.data.prompt_topics,
      },
      outlines: outlinesResult.data || null,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompt' }, { status: 500 })
  }
}
