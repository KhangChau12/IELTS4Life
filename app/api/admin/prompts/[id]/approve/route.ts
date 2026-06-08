import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import type { QuestionType } from '@/types/prompt'

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

    const body = await request.json()
    const { topic_id, question_type, prompt_text } = body as { topic_id?: string; question_type?: QuestionType; prompt_text?: string }

    const updates: Record<string, unknown> = {
      status: 'approved',
      created_by: user.id,
    }

    if (topic_id) updates.topic_id = topic_id
    if (question_type) updates.question_type = question_type
    if (prompt_text?.trim()) {
      updates.prompt_text = prompt_text.trim()
      // Re-normalize since text changed
      updates.normalized_text = prompt_text.trim().toLowerCase().replace(/\s+/g, ' ').trim()
    }

    // Use service role for mutations — bypasses RLS which may block admin UPDATE
    const supabase = createServiceRoleClient()

    const { data: prompt, error } = await supabase
      .from('writing_prompts')
      .update(updates)
      .eq('id', params.id)
      .eq('status', 'pending')
      .select('id, prompt_text, question_type, topic_id, status, prompt_topics(name)')
      .single()

    if (error || !prompt) {
      return NextResponse.json({ error: error?.message ?? 'Prompt not found or not pending' }, { status: 404 })
    }

    // If admin changed topic or question_type, sync to classified essays
    if (topic_id || question_type) {
      const topicName = Array.isArray(prompt.prompt_topics)
        ? (prompt.prompt_topics[0] as { name?: string } | undefined)?.name ?? null
        : null

      const essayUpdates: Record<string, unknown> = {}
      if (topic_id) {
        essayUpdates.essay_topic_id = prompt.topic_id
        essayUpdates.essay_topic_name = topicName
      }
      if (question_type) {
        essayUpdates.essay_question_type = prompt.question_type
      }

      await supabase
        .from('essays')
        .update(essayUpdates)
        .eq('prompt_id', params.id)
    }

    return NextResponse.json({ prompt })
  } catch (error) {
    console.error('[admin/prompts/approve] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
