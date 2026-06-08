import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'dev'].includes(profile?.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Fetch pending prompts with topic info + count of similar approved prompts
    const { data: pendingPrompts, error } = await supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type, topic_id, submitted_count, created_at, prompt_topics(id, name)')
      .eq('status', 'pending')
      .order('submitted_count', { ascending: false })
      .order('created_at', { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Total count for badge display
    const totalPending = pendingPrompts?.length ?? 0

    return NextResponse.json({ prompts: pendingPrompts ?? [], totalPending })
  } catch (error) {
    console.error('[admin/prompts/pending] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
