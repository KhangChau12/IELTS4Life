import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createOpenRouterClient, MODELS, OPENROUTER_FAST } from '@/lib/openai/client'
import { ESSAY_IMPROVEMENT_PROMPT, ESSAY_IMPROVEMENT_COMPRESS_PROMPT } from '@/lib/openai/prompts'
import { ESSAY_REWRITE_JSON_SCHEMA } from '@/lib/openai/schema'
import { buildEssayDiff } from '@/lib/openai/essay-diff'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'
import type OpenAI from 'openai'

export const maxDuration = 60

// A real Band 8-9 Task 2 essay is ~280-310 words. The prompt targets that; the
// code only steps in for a true balloon (essay blown far past the target).
const TARGET_MAX = 310
const COMPRESS_TRIGGER = 318

const wordCount = (s: string): number => (s.match(/[A-Za-z']+/g) || []).length

async function rewriteCall(
  client: OpenAI,
  system: string,
  user: string,
  temperature: number
): Promise<string> {
  const completion = await client.chat.completions.create({
    model: MODELS.ESSAY_IMPROVEMENT,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    response_format: { type: 'json_schema', json_schema: ESSAY_REWRITE_JSON_SCHEMA },
    temperature,
    ...OPENROUTER_FAST,
  })
  try {
    const parsed = JSON.parse(completion.choices[0].message.content || '{}')
    return typeof parsed.improved_essay === 'string' ? parsed.improved_essay.trim() : ''
  } catch {
    return ''
  }
}

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
      .select('id, prompt, essay_content, overall_score, improved_essay, improvement_changes, is_guest')
      .eq('id', essay_id)

    essayQuery = user ? essayQuery.eq('user_id', user.id) : essayQuery.eq('is_guest', true)

    const { data: essay, error: essayError } = await essayQuery.single()
    if (essayError || !essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Already rewritten — return it (changes may still be null; the client then
    // calls /api/essays/improve/diff to fill them in).
    if (essay.improved_essay) {
      return NextResponse.json({
        success: true,
        improved_essay: essay.improved_essay,
        changes: essay.improvement_changes || [],
      })
    }

    const client = createOpenRouterClient()
    const N = wordCount(essay.essay_content)
    const band = typeof essay.overall_score === 'number' ? essay.overall_score : 6
    const userMsg = `Essay Prompt: ${essay.prompt}\n\nStudent's Essay (Band ${essay.overall_score ?? 'N/A'}, ${N} words):\n${essay.essay_content}\n\nRewrite it to Band 8-9.`

    // ---- Pass 1: rewrite to Band 8-9 ----
    let improved = await rewriteCall(client, ESSAY_IMPROVEMENT_PROMPT, userMsg, 0.6)
    if (!improved) {
      return NextResponse.json({ error: 'Failed to improve essay' }, { status: 500 })
    }

    // Retry once (firmer) when the first pass came back wrong:
    //  - barely changed a sub-Band-8 essay (the diff finds almost nothing), or
    //  - dropped content: the rewrite is noticeably shorter than the original.
    const firstDiffCount = buildEssayDiff(essay.essay_content, improved, { maxHunks: 20 }).length
    const tooShort = wordCount(improved) < Math.min(N, 260) - 10
    if ((band < 8 && firstDiffCount < 5) || tooShort) {
      const note = tooShort
        ? `IMPORTANT: your previous attempt cut the essay to ${wordCount(improved)} words and lost content. Rewrite it again keeping every idea and staying at roughly ${Math.max(N, 280)} words.`
        : `IMPORTANT: your previous attempt barely changed the essay. This essay is Band ${band} and has clear weaknesses in vocabulary, phrasing, cohesion and grammar. Rewrite it properly this time — at least 15 real improvements.`
      const retry = await rewriteCall(client, `${ESSAY_IMPROVEMENT_PROMPT}\n\n${note}`, userMsg, 0.7)
      if (retry) {
        const retryTooShort = wordCount(retry) < Math.min(N, 260) - 10
        const retryDiffCount = buildEssayDiff(essay.essay_content, retry, { maxHunks: 20 }).length
        // take the retry if it fixed the problem we retried for
        if ((tooShort && !retryTooShort) || (!tooShort && retryDiffCount > firstDiffCount)) {
          improved = retry
        }
      }
    }

    // Compress guard: only for a true balloon. One pass is unreliable, so allow two.
    const ceiling = Math.max(TARGET_MAX, N)
    for (let pass = 0; pass < 2 && wordCount(improved) > Math.max(COMPRESS_TRIGGER, N + 15); pass++) {
      const shorter = await rewriteCall(
        client,
        ESSAY_IMPROVEMENT_COMPRESS_PROMPT.replace('{MAX}', String(ceiling)),
        improved,
        0.4
      )
      if (shorter && wordCount(shorter) < wordCount(improved)) improved = shorter
      else break
    }

    // Save the rewrite now (changes stay null so the client knows to call the diff route).
    const { error: updateError } = await supabase
      .from('essays')
      .update({ improved_essay: improved })
      .eq('id', essay_id)

    if (updateError) {
      logger.error('Error saving improved essay:', updateError)
      return NextResponse.json({ error: 'Failed to save improved essay' }, { status: 500 })
    }

    return NextResponse.json({ success: true, improved_essay: improved, changes: [] })
  } catch (error) {
    logger.error('Error improving essay:', error)
    return NextResponse.json({ error: 'Failed to improve essay' }, { status: 500 })
  }
}
