import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGroqClient, MODELS } from '@/lib/openai/client'
import { ESSAY_IMPROVEMENT_PROMPT } from '@/lib/openai/prompts'
import { rateLimiters, checkRateLimit } from '@/lib/rate-limit'
import { logger } from '@/lib/logger'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    // Check authentication (allow both users and guests)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    // Rate limiting for authenticated users (guests limited by 1-essay cap)
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
      return NextResponse.json(
        { error: 'Essay ID is required' },
        { status: 400 }
      )
    }

    // Fetch the essay (allow both authenticated and guest essays)
    let essayQuery = supabase
      .from('essays')
      .select('id, prompt, essay_content, overall_score, improved_essay, improvement_changes, is_guest')
      .eq('id', essay_id)

    // If authenticated, check user ownership
    if (user) {
      essayQuery = essayQuery.eq('user_id', user.id)
    } else {
      // If guest, allow access to guest essays
      essayQuery = essayQuery.eq('is_guest', true)
    }

    const { data: essay, error: essayError } = await essayQuery.single()

    if (essayError || !essay) {
      return NextResponse.json(
        { error: 'Essay not found' },
        { status: 404 }
      )
    }

    // Check if already improved
    if (essay.improved_essay) {
      return NextResponse.json({
        success: true,
        improved_essay: essay.improved_essay,
        changes: essay.improvement_changes || [], // Return stored changes or empty array for old essays
      })
    }

    // Call Groq to improve the essay (with key rotation)
    const groqClient = createGroqClient()
    const completion = await groqClient.chat.completions.create({
      model: MODELS.ESSAY_IMPROVEMENT,
      messages: [
        {
          role: 'system',
          content: ESSAY_IMPROVEMENT_PROMPT,
        },
        {
          role: 'user',
          content: `Essay Prompt: ${essay.prompt}\n\nStudent's Essay (Band ${essay.overall_score || 'N/A'}):\n${essay.essay_content}\n\nPlease provide an improved Band 8-9 version.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const result = JSON.parse(
      completion.choices[0].message.content || '{}'
    )

    logger.debug('=== IMPROVEMENT API DEBUG ===')
    logger.debug('OpenAI Response keys:', Object.keys(result))
    logger.debug('Has improved_essay:', !!result.improved_essay)
    logger.debug('Has changes:', !!result.changes)
    logger.debug('Changes type:', typeof result.changes)
    logger.debug('Changes is array:', Array.isArray(result.changes))

    const improved_essay = result.improved_essay
    const changes = result.changes || []

    logger.debug('Parsed changes count:', changes.length)
    logger.debug('Changes sample:', JSON.stringify(changes.slice(0, 3), null, 2))

    // Validate changes is an array
    if (!Array.isArray(changes)) {
      logger.error('WARNING: changes is not an array!', typeof changes)
    }

    // Save improved essay and changes to database
    const { data: updateData, error: updateError } = await supabase
      .from('essays')
      .update({
        improved_essay,
        improvement_changes: changes
      })
      .eq('id', essay_id)
      .select('id, improved_essay, improvement_changes')

    if (updateError) {
      logger.error('Error saving improved essay:', updateError)
      logger.error('Update error details:', JSON.stringify(updateError, null, 2))
      return NextResponse.json(
        { error: 'Failed to save improved essay' },
        { status: 500 }
      )
    }

    logger.debug('Database update successful:', !!updateData)
    logger.debug('Update data:', updateData)
    if (updateData && updateData[0]) {
      logger.debug('Has improvement_changes in DB:', !!updateData[0].improvement_changes)
      logger.debug('Changes count in DB:', updateData[0].improvement_changes?.length || 0)
      logger.debug('Saved changes to DB: YES')
    } else {
      logger.debug('Saved changes to DB: NO - updateData is empty')
    }
    logger.debug('=============================')

    return NextResponse.json({
      success: true,
      improved_essay,
      changes,
    })
  } catch (error) {
    logger.error('Error improving essay:', error)
    return NextResponse.json(
      { error: 'Failed to improve essay' },
      { status: 500 }
    )
  }
}
