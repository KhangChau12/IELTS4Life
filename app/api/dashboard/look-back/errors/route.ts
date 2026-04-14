import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: essays, error } = await supabase
      .from('essays')
      .select(
        'task_response_errors, coherence_cohesion_errors, lexical_resource_errors, grammatical_accuracy_errors'
      )
      .eq('user_id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch error history' }, { status: 500 })
    }

    const errors = {
      taskResponse: [] as string[],
      coherenceCohesion: [] as string[],
      lexicalResource: [] as string[],
      grammaticalAccuracy: [] as string[],
    }

    essays?.forEach((essay) => {
      if (essay.task_response_errors) {
        errors.taskResponse.push(...essay.task_response_errors)
      }
      if (essay.coherence_cohesion_errors) {
        errors.coherenceCohesion.push(...essay.coherence_cohesion_errors)
      }
      if (essay.lexical_resource_errors) {
        errors.lexicalResource.push(...essay.lexical_resource_errors)
      }
      if (essay.grammatical_accuracy_errors) {
        errors.grammaticalAccuracy.push(...essay.grammatical_accuracy_errors)
      }
    })

    return NextResponse.json({ errors })
  } catch (error) {
    console.error('Error fetching dashboard look back errors:', error)
    return NextResponse.json(
      { error: 'Failed to fetch error history' },
      { status: 500 }
    )
  }
}