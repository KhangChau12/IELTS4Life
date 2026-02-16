import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import type { PromptWithUserEssay } from '@/types/prompt'

export async function GET(request: Request) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)

    const questionType = searchParams.get('question_type')
    const topicId = searchParams.get('topic_id')
    const page = parseInt(searchParams.get('page') || '0')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = page * limit

    const { data: { user } } = await supabase.auth.getUser()

    // Build prompts query
    let query = supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type, topic_id, created_by, created_at, updated_at, prompt_topics(id, name)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (questionType) query = query.eq('question_type', questionType)
    if (topicId) query = query.eq('topic_id', topicId)

    const { data: prompts, error, count } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If authenticated, fetch user's essays linked to prompts
    let userEssayMap = new Map<string, { id: string; overall_score: number | null; created_at: string }>()

    if (user) {
      const { data: userEssays } = await supabase
        .from('essays')
        .select('id, prompt_id, overall_score, created_at')
        .eq('user_id', user.id)
        .not('prompt_id', 'is', null)
        .order('created_at', { ascending: false })

      if (userEssays) {
        for (const essay of userEssays) {
          if (essay.prompt_id && !userEssayMap.has(essay.prompt_id)) {
            userEssayMap.set(essay.prompt_id, {
              id: essay.id,
              overall_score: essay.overall_score,
              created_at: essay.created_at,
            })
          }
        }
      }
    }

    const promptsWithUserData: PromptWithUserEssay[] = (prompts || []).map((p) => ({
      ...p,
      prompt_topics: Array.isArray(p.prompt_topics) ? p.prompt_topics[0] : p.prompt_topics,
      user_essay: userEssayMap.get(p.id) || null,
    }))

    return NextResponse.json({ prompts: promptsWithUserData, total: count || 0 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prompts' }, { status: 500 })
  }
}
