import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Auth check via RLS-aware client
    const authClient = createServerClient()
    const { data: { user }, error: authError } = await authClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await authClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'dev'].includes(profile?.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role for mutations — bypasses RLS which may block admin DELETE
    // essays.prompt_id has ON DELETE SET NULL (migration 028), so PostgreSQL
    // automatically nullifies it. essay_topic_id/question_type/topic_name stay on
    // the essay — user can still see classification + similar prompts.
    const supabase = createServiceRoleClient()

    const { error } = await supabase
      .from('writing_prompts')
      .delete()
      .eq('id', params.id)
      .eq('status', 'pending')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin/prompts/reject] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
