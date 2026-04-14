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

    const { data: vocabulary, error: vocabError } = await supabase
      .from('vocabulary')
      .select('id, user_id, essay_id, vocab_type, original_word, suggested_word, definition, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (vocabError) {
      return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
    }

    const essayIds: string[] = []
    const essayIdSet = new Set<string>()

    ;(vocabulary || []).forEach((item) => {
      if (!essayIdSet.has(item.essay_id)) {
        essayIdSet.add(item.essay_id)
        essayIds.push(item.essay_id)
      }
    })

    const selectedEssayIds = essayIds.slice(0, 2)

    if (selectedEssayIds.length === 0) {
      return NextResponse.json({ entries: [] })
    }

    const { data: essays, error: essayError } = await supabase
      .from('essays')
      .select('id, prompt, created_at')
      .eq('user_id', user.id)
      .in('id', selectedEssayIds)

    if (essayError) {
      return NextResponse.json({ error: 'Failed to fetch vocabulary' }, { status: 500 })
    }

    const grouped = new Map<string, typeof vocabulary>()

    ;(vocabulary || []).forEach((item) => {
      if (!grouped.has(item.essay_id)) {
        grouped.set(item.essay_id, [])
      }
      grouped.get(item.essay_id)?.push(item)
    })

    const essayMap = new Map((essays || []).map((essay) => [essay.id, essay]))

    const entries = selectedEssayIds
      .map((essayId) => {
        const essay = essayMap.get(essayId)

        if (!essay) {
          return null
        }

        return {
          essayId: essay.id,
          prompt: essay.prompt,
          createdAt: essay.created_at,
          vocabulary: grouped.get(essay.id) || [],
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))

    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Error fetching dashboard look back vocabulary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vocabulary' },
      { status: 500 }
    )
  }
}