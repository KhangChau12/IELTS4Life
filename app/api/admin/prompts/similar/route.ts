import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const questionType = searchParams.get('question_type')
    const topicId = searchParams.get('topic_id')

    if (!questionType || !topicId) {
      return NextResponse.json(
        { error: 'question_type and topic_id are required' },
        { status: 400 }
      )
    }

    const { data: prompts, error } = await supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type, created_at')
      .eq('question_type', questionType)
      .eq('topic_id', topicId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching similar prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
