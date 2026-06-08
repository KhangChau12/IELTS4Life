import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient()
    const { searchParams } = new URL(request.url)
    const topicId = searchParams.get('topicId')
    const questionType = searchParams.get('questionType')
    const excludeId = searchParams.get('excludeId') // optional: exclude a specific prompt

    if (!topicId || !questionType) {
      return NextResponse.json({ error: 'topicId and questionType are required' }, { status: 400 })
    }

    // Fetch topic name
    const { data: topic } = await supabase
      .from('prompt_topics')
      .select('id, name')
      .eq('id', topicId)
      .single()

    // Fetch same-topic approved prompts
    let sameTopicQuery = supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type, prompt_topics(id, name)')
      .eq('topic_id', topicId)
      .eq('status', 'approved')
      .limit(6)

    if (excludeId) sameTopicQuery = sameTopicQuery.neq('id', excludeId)

    const { data: sameTopicRaw } = await sameTopicQuery

    // Fetch same-type approved prompts
    let sameTypeQuery = supabase
      .from('writing_prompts')
      .select('id, prompt_text, question_type, prompt_topics(id, name)')
      .eq('question_type', questionType)
      .eq('status', 'approved')
      .limit(10)

    if (excludeId) sameTypeQuery = sameTypeQuery.neq('id', excludeId)

    const { data: sameTypeRaw } = await sameTypeQuery

    // Shuffle and pick N from array (Fisher-Yates)
    const pickRandom = <T>(arr: T[], count: number): T[] => {
      const copy = [...(arr ?? [])]
      for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]]
      }
      return copy.slice(0, count)
    }

    const sameTopicPrompts = pickRandom(sameTopicRaw ?? [], 4)
    // Exclude prompts already in sameTopicPrompts from sameType to avoid duplicates
    const sameTopicIds = new Set(sameTopicPrompts.map(p => p.id))
    const sameTypeFiltered = (sameTypeRaw ?? []).filter(p => !sameTopicIds.has(p.id))
    const sameTypePrompts = pickRandom(sameTypeFiltered, 4)

    return NextResponse.json({
      sameTopicPrompts,
      sameTypePrompts,
      topic: topic ?? null,
      questionType,
    })
  } catch (error) {
    console.error('[similar] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
