import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createOpenRouterClient, MODELS, OPENROUTER_FAST } from '@/lib/openai/client'
import { ESSAY_EDIT_LABEL_PROMPT } from '@/lib/openai/prompts'
import { ESSAY_EDIT_LABELS_JSON_SCHEMA } from '@/lib/openai/schema'
import { buildEssayDiff } from '@/lib/openai/essay-diff'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type { ImprovementChange } from '@/types/essay'

export const maxDuration = 30

// Step 2 of the improve pipeline. POST /api/essays/improve produces improved_essay;
// this route computes the {original, improved} highlight spans deterministically in
// code, then makes ONE cheap LLM call to label each span with a short reason.
export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const rateLimitResult = await checkRateLimit(user.id, rateLimiters.essays())
      if (!rateLimitResult.success) {
        return NextResponse.json(
          { error: 'Too many requests. Please try again later.' },
          { status: 429 }
        )
      }
    }

    const { essay_id } = await request.json()
    if (!essay_id) {
      return NextResponse.json({ error: 'Essay ID is required' }, { status: 400 })
    }

    let essayQuery = supabase
      .from('essays')
      .select('id, essay_content, improved_essay, improvement_changes, is_guest')
      .eq('id', essay_id)

    essayQuery = user ? essayQuery.eq('user_id', user.id) : essayQuery.eq('is_guest', true)

    const { data: essay, error: essayError } = await essayQuery.single()
    if (essayError || !essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Diff already computed (including the "no changes" case, stored as []).
    if (essay.improvement_changes !== null && essay.improvement_changes !== undefined) {
      return NextResponse.json({ success: true, changes: essay.improvement_changes })
    }

    // Rewrite not ready yet — the client should retry shortly.
    if (!essay.improved_essay) {
      return NextResponse.json({ error: 'Improved essay not ready' }, { status: 409 })
    }

    const hunks = buildEssayDiff(essay.essay_content, essay.improved_essay, { maxHunks: 20 })

    let changes: ImprovementChange[] = []
    if (hunks.length > 0) {
      const list = hunks
        .map((h, i) => `${i + 1}. ORIGINAL: "${h.original}"\n   IMPROVED: "${h.improved}"`)
        .join('\n')

      let reasons: string[] = []
      try {
        const client = createOpenRouterClient()
        const completion = await client.chat.completions.create({
          model: MODELS.ESSAY_IMPROVEMENT,
          messages: [
            { role: 'system', content: ESSAY_EDIT_LABEL_PROMPT },
            { role: 'user', content: list },
          ],
          response_format: { type: 'json_schema', json_schema: ESSAY_EDIT_LABELS_JSON_SCHEMA },
          temperature: 0.3,
          ...OPENROUTER_FAST,
        })
        const parsed = JSON.parse(completion.choices[0].message.content || '{}')
        if (Array.isArray(parsed.reasons)) reasons = parsed.reasons
      } catch (err) {
        // Labels are a nice-to-have — fall back to a generic reason rather than failing.
        logger.error('Edit labelling failed, using fallback reasons:', err)
      }

      changes = hunks.map((h, i) => ({
        original: h.original,
        improved: h.improved,
        reason: typeof reasons[i] === 'string' && reasons[i].trim() ? reasons[i].trim() : 'wording improved',
      }))
    }

    const { error: updateError } = await supabase
      .from('essays')
      .update({ improvement_changes: changes })
      .eq('id', essay_id)

    if (updateError) {
      logger.error('Error saving improvement changes:', updateError)
      // The highlight data is non-critical; still return it to the client.
      return NextResponse.json({ success: true, changes })
    }

    return NextResponse.json({ success: true, changes })
  } catch (error) {
    logger.error('Error computing essay diff:', error)
    return NextResponse.json({ error: 'Failed to compute improvements' }, { status: 500 })
  }
}
