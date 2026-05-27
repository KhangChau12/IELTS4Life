import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGroqClient, MODELS } from '@/lib/openai/client'
import { ERROR_SUMMARY_PROMPT } from '@/lib/openai/prompts'
import type { ErrorSummary } from '@/types/user'

export async function POST() {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch last 15 errors from user's essays
    const { data: essays, error: essaysError } = await supabase
      .from('essays')
      .select('task_response_errors, coherence_cohesion_errors, lexical_resource_errors, grammatical_accuracy_errors')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(15)

    if (essaysError || !essays || essays.length === 0) {
      return NextResponse.json(
        { error: 'No essays found' },
        { status: 404 }
      )
    }

    // Collect all errors
    const allErrors: string[] = []
    essays.forEach((essay) => {
      if (essay.task_response_errors) allErrors.push(...(essay.task_response_errors as string[]))
      if (essay.coherence_cohesion_errors) allErrors.push(...(essay.coherence_cohesion_errors as string[]))
      if (essay.lexical_resource_errors) allErrors.push(...(essay.lexical_resource_errors as string[]))
      if (essay.grammatical_accuracy_errors) allErrors.push(...(essay.grammatical_accuracy_errors as string[]))
    })

    // Take up to 15 most recent errors
    const recentErrors = allErrors.slice(0, 15)

    if (recentErrors.length === 0) {
      return NextResponse.json(
        { error: 'No errors found' },
        { status: 404 }
      )
    }

    // Call Groq to summarize errors (with key rotation)
    const groqClient = createGroqClient()
    const completion = await groqClient.chat.completions.create({
      model: MODELS.ERROR_SUMMARY,
      messages: [
        {
          role: 'system',
          content: ERROR_SUMMARY_PROMPT,
        },
        {
          role: 'user',
          content: `Recent errors:\n${recentErrors.map((e, i) => `${i + 1}. ${e}`).join('\n')}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.5,
    })

    const summary: ErrorSummary = JSON.parse(
      completion.choices[0].message.content || '{}'
    )

    return NextResponse.json({ success: true, summary })
  } catch (error) {
    console.error('Error generating summary:', error)
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    )
  }
}
