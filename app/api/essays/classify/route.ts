import { NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { createOpenRouterClient, MODELS, OPENROUTER_FAST } from '@/lib/openai/client'
import { PROMPT_CLASSIFICATION_SYSTEM_PROMPT } from '@/lib/openai/prompts'
import { PROMPT_CLASSIFICATION_JSON_SCHEMA } from '@/lib/openai/schema'
import { QUESTION_TYPES } from '@/types/prompt'
import { logger } from '@/lib/logger'

export const maxDuration = 30

function normalizePromptText(text: string): string {
  return text.toLowerCase().replace(/\s+/g, ' ').trim()
}

export async function POST(request: Request) {
  let essay_id: string | null = null

  try {
    const body = await request.json()
    const { essay_id: eid, prompt_text } = body
    essay_id = eid ?? null

    if (!essay_id || !prompt_text) {
      return NextResponse.json({ error: 'essay_id and prompt_text are required' }, { status: 400 })
    }

    const supabase = createServiceRoleClient()

    // Guard: skip if already done — 'pending' may be stale from a killed serverless invocation
    const { data: existingEssay } = await supabase
      .from('essays')
      .select('prompt_classification_status')
      .eq('id', essay_id)
      .single()

    const skipStatuses = ['classified', 'invalid']
    if (skipStatuses.includes(existingEssay?.prompt_classification_status ?? '')) {
      return NextResponse.json({ classified: existingEssay?.prompt_classification_status === 'classified', skipped: true })
    }

    // Mark as pending immediately to prevent duplicate concurrent classify calls
    await supabase
      .from('essays')
      .update({ prompt_classification_status: 'pending' })
      .eq('id', essay_id)

    // Fetch all topics for the classification prompt
    const { data: topics, error: topicsError } = await supabase
      .from('prompt_topics')
      .select('id, name')
      .order('name')

    if (topicsError || !topics || topics.length === 0) {
      logger.error('[classify] Failed to fetch topics or no topics exist:', topicsError)
      await supabase
        .from('essays')
        .update({ prompt_classification_status: 'unclassified' })
        .eq('id', essay_id)
      return NextResponse.json({ error: 'Failed to fetch topics' }, { status: 500 })
    }

    const questionTypesList = Object.entries(QUESTION_TYPES).map(([key, label]) => ({ key, label }))

    // Call OpenRouter (DeepSeek V4 Flash) to classify the prompt (8s timeout to leave room for DB ops within serverless limit)
    const openRouterClient = createOpenRouterClient()
    const completion = await openRouterClient.chat.completions.create(
      {
        model: MODELS.ESSAY_SCORING,
        messages: [
          {
            role: 'system',
            content: PROMPT_CLASSIFICATION_SYSTEM_PROMPT(topics, questionTypesList),
          },
          {
            role: 'user',
            content: prompt_text,
          },
        ],
        response_format: { type: 'json_schema', json_schema: PROMPT_CLASSIFICATION_JSON_SCHEMA },
        temperature: 0.1,
        ...OPENROUTER_FAST,
      },
      { timeout: 8000 }
    )

    const raw = completion.choices[0].message.content || '{}'
    let result: { valid: boolean; topic_id: string | null; question_type: string | null; reason: string | null }

    try {
      result = JSON.parse(raw)
    } catch {
      logger.error('[classify] Failed to parse classification result:', raw)
      await supabase
        .from('essays')
        .update({ prompt_classification_status: 'invalid' })
        .eq('id', essay_id)
      return NextResponse.json({ classified: false, reason: 'parse_error' })
    }

    if (!result.valid) {
      await supabase
        .from('essays')
        .update({ prompt_classification_status: 'invalid' })
        .eq('id', essay_id)
      return NextResponse.json({ classified: false, reason: result.reason })
    }

    // Fetch topic name for denormalization (so essay survives prompt deletion)
    const topicName = topics.find(t => t.id === result.topic_id)?.name ?? null

    // Valid prompt — check for duplicates in writing_prompts (for admin queue)
    const normalized = normalizePromptText(prompt_text)

    const { data: existing } = await supabase
      .from('writing_prompts')
      .select('id, status, submitted_count')
      .eq('normalized_text', normalized)
      .single()

    let promptId: string | null = null

    if (existing) {
      promptId = existing.id
      await supabase
        .from('writing_prompts')
        .update({ submitted_count: existing.submitted_count + 1 })
        .eq('id', existing.id)
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('writing_prompts')
        .insert({
          prompt_text: prompt_text.trim(),
          normalized_text: normalized,
          question_type: result.question_type,
          topic_id: result.topic_id,
          status: 'pending',
          source: 'user_submission',
          submitted_count: 1,
          created_by: null,
        })
        .select('id')
        .single()

      if (!insertError && inserted) {
        promptId = inserted.id
      } else {
        logger.error('[classify] Failed to insert prompt (non-fatal):', insertError)
      }
    }

    await supabase
      .from('essays')
      .update({
        prompt_id: promptId,
        prompt_classification_status: 'classified',
        essay_topic_id: result.topic_id ?? null,
        essay_question_type: result.question_type ?? null,
        essay_topic_name: topicName,
      })
      .eq('id', essay_id)

    return NextResponse.json({
      classified: true,
      prompt_id: promptId,
      topic_id: result.topic_id,
      question_type: result.question_type,
      topic_name: topicName,
    })
  } catch (error) {
    logger.error('[classify] Unexpected error:', error)
    // Reset to unclassified so the client can retry — avoids essay stuck at 'pending'
    if (essay_id) {
      try {
        const supabase = createServiceRoleClient()
        await supabase
          .from('essays')
          .update({ prompt_classification_status: 'unclassified' })
          .eq('id', essay_id)
          .eq('prompt_classification_status', 'pending')
      } catch { /* best-effort */ }
    }
    return NextResponse.json({ error: 'Classification failed' }, { status: 500 })
  }
}
