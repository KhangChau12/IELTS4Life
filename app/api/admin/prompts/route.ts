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

    let query = supabase
      .from('writing_prompts')
      .select('*, prompt_topics(id, name), profiles!created_by(email)')
      .order('created_at', { ascending: false })

    if (questionType) {
      query = query.eq('question_type', questionType)
    }
    if (topicId) {
      query = query.eq('topic_id', topicId)
    }

    const { data: prompts, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompts })
  } catch (error) {
    console.error('Error fetching prompts:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { prompt_text, question_type, topic_id } = body

    if (!prompt_text?.trim() || !question_type || !topic_id) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const { data: prompt, error } = await supabase
      .from('writing_prompts')
      .insert({
        prompt_text: prompt_text.trim(),
        question_type,
        topic_id,
        created_by: user.id,
      })
      .select('*, prompt_topics(id, name), profiles!created_by(email)')
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ prompt }, { status: 201 })
  } catch (error) {
    console.error('Error creating prompt:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
