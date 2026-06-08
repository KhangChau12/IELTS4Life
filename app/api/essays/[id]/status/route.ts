import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { data: essay, error } = await supabase
      .from('essays')
      .select('improved_essay, user_id, is_guest, guest_fingerprint, prompt_classification_status, prompt_id, essay_topic_id, essay_question_type, essay_topic_name')
      .eq('id', params.id)
      .single()

    if (error || !essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // For authenticated users, check ownership
    if (user && essay.user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    return NextResponse.json({
      has_improved_essay: !!essay.improved_essay,
      prompt_classification_status: essay.prompt_classification_status ?? 'unclassified',
      prompt_id: essay.prompt_id ?? null,
      essay_topic_id: essay.essay_topic_id ?? null,
      essay_question_type: essay.essay_question_type ?? null,
      essay_topic_name: essay.essay_topic_name ?? null,
    })
  } catch (error) {
    console.error('Error checking essay status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
