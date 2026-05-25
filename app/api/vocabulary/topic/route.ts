import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { openaiClient, MODELS } from '@/lib/openai/client'
import { TOPIC_VOCAB_PROMPT } from '@/lib/openai/prompts'
import type { TopicVocabResponse } from '@/types/vocabulary'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    const { essay_id } = await request.json()

    if (!essay_id) {
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      )
    }

    // Fetch the essay prompt (allow both authenticated and guest essays)
    let essayQuery = supabase
      .from('essays')
      .select('prompt, user_id, is_guest')
      .eq('id', essay_id)

    if (user) {
      essayQuery = essayQuery.eq('user_id', user.id)
    } else {
      essayQuery = essayQuery.eq('is_guest', true)
    }

    const { data: essay, error: essayError } = await essayQuery.single()

    if (essayError || !essay) {
      return NextResponse.json({ error: 'Essay not found' }, { status: 404 })
    }

    // Guard: return existing vocab if already generated for this essay
    if (user) {
      const { data: existing } = await supabase
        .from('vocabulary')
        .select('id')
        .eq('user_id', user.id)
        .eq('essay_id', essay_id)
        .eq('vocab_type', 'topic')
        .limit(1)

      if (existing && existing.length > 0) {
        const { data: currentVocab } = await supabase
          .from('vocabulary')
          .select('*')
          .eq('user_id', user.id)
          .eq('essay_id', essay_id)
          .eq('vocab_type', 'topic')
        return NextResponse.json({ success: true, vocabulary: currentVocab })
      }
    }

    // Call OpenAI to generate topic vocabulary with prompt caching
    const completion = await openaiClient.chat.completions.create({
      model: MODELS.VOCABULARY,
      messages: [
        {
          role: 'system',
          content: [
            {
              type: 'text',
              text: TOPIC_VOCAB_PROMPT,
              // @ts-ignore - cache_control is beta feature
              cache_control: { type: 'ephemeral' }
            }
          ]
        },
        {
          role: 'user',
          content: `Essay Prompt: ${essay.prompt}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.6,
    })

    const result: TopicVocabResponse = JSON.parse(
      completion.choices[0].message.content || '{"vocabulary":[]}'
    )

    // Save vocabulary to database (only for authenticated users)
    if (user) {
      const vocabItems = result.vocabulary.map((item) => ({
        user_id: user.id,
        essay_id,
        vocab_type: 'topic' as const,
        original_word: null,
        suggested_word: item.word,
        definition: item.definition,
      }))

      const { data: savedVocab, error: vocabError } = await supabase
        .from('vocabulary')
        .insert(vocabItems)
        .select()

      if (vocabError) {
        console.error('Error saving vocabulary:', vocabError)
        return NextResponse.json(
          { error: 'Failed to save vocabulary' },
          { status: 500 }
        )
      }

      // Log token usage
      await supabase.from('token_usage').insert({
        user_id: user.id,
        request_type: 'vocab_topic',
        input_tokens: completion.usage?.prompt_tokens || 0,
        output_tokens: completion.usage?.completion_tokens || 0,
        model: MODELS.VOCABULARY,
      })

      return NextResponse.json({ success: true, vocabulary: savedVocab })
    } else {
      // For guests, return vocabulary without saving to database
      const guestVocab = result.vocabulary.map((item, index) => ({
        id: `guest-${essay_id}-topic-${index}`,
        essay_id,
        vocab_type: 'topic' as const,
        original_word: null,
        suggested_word: item.word,
        definition: item.definition,
        user_id: null,
        created_at: new Date().toISOString(),
      }))

      return NextResponse.json({ success: true, vocabulary: guestVocab, isGuest: true })
    }
  } catch (error) {
    console.error('Error generating topic vocabulary:', error)
    return NextResponse.json(
      { error: 'Failed to generate vocabulary' },
      { status: 500 }
    )
  }
}
