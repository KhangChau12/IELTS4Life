import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createGroqClient, MODELS } from '@/lib/openai/client'
import { DETAILED_WRITING_GUIDANCE_PROMPT } from '@/lib/openai/prompts'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    // Check authentication (allow both users and guests)
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

    // Fetch the essay with all details (allow both authenticated and guest essays)
    let essayQuery = supabase
      .from('essays')
      .select(`
        id, prompt, essay_content, overall_score, improved_essay, detailed_guidance, is_guest,
        task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score,
        task_response_comment, coherence_cohesion_comment, lexical_resource_comment, grammatical_accuracy_comment,
        task_response_errors, coherence_cohesion_errors, lexical_resource_errors, grammatical_accuracy_errors,
        task_response_strengths, coherence_cohesion_strengths, lexical_resource_strengths, grammatical_accuracy_strengths
      `)
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

    // Check if guidance already exists
    if (essay.detailed_guidance) {
      return NextResponse.json({
        success: true,
        guidance: essay.detailed_guidance,
      })
    }

    // Prepare context for AI
    const context = {
      original_essay: essay.essay_content,
      prompt: essay.prompt,
      overall_score: essay.overall_score,
      improved_essay: essay.improved_essay || 'Not available',
      criteria_comments: {
        task_response: essay.task_response_comment,
        coherence_cohesion: essay.coherence_cohesion_comment,
        lexical_resource: essay.lexical_resource_comment,
        grammatical_accuracy: essay.grammatical_accuracy_comment,
      },
      criteria_scores: {
        task_response: essay.task_response_score,
        coherence_cohesion: essay.coherence_cohesion_score,
        lexical_resource: essay.lexical_resource_score,
        grammatical_accuracy: essay.grammatical_accuracy_score,
      },
      errors: {
        task_response: essay.task_response_errors || [],
        coherence_cohesion: essay.coherence_cohesion_errors || [],
        lexical_resource: essay.lexical_resource_errors || [],
        grammatical_accuracy: essay.grammatical_accuracy_errors || [],
      },
      strengths: {
        task_response: essay.task_response_strengths || [],
        coherence_cohesion: essay.coherence_cohesion_strengths || [],
        lexical_resource: essay.lexical_resource_strengths || [],
        grammatical_accuracy: essay.grammatical_accuracy_strengths || [],
      },
    }

    // Call Groq to generate detailed guidance (with key rotation)
    const groqClient = createGroqClient()
    const completion = await groqClient.chat.completions.create({
      model: MODELS.ESSAY_SCORING, // Use same model as scoring
      messages: [
        {
          role: 'system',
          content: DETAILED_WRITING_GUIDANCE_PROMPT,
        },
        {
          role: 'user',
          content: `Please analyze this essay and provide detailed, actionable guidance:

Essay Prompt: ${context.prompt}

Original Essay (Band ${context.overall_score}):
${context.original_essay}

Improved Version (Reference):
${context.improved_essay}

Scoring Details:
- Task Response (${context.criteria_scores.task_response}): ${context.criteria_comments.task_response}
- Coherence & Cohesion (${context.criteria_scores.coherence_cohesion}): ${context.criteria_comments.coherence_cohesion}
- Lexical Resource (${context.criteria_scores.lexical_resource}): ${context.criteria_comments.lexical_resource}
- Grammatical Accuracy (${context.criteria_scores.grammatical_accuracy}): ${context.criteria_comments.grammatical_accuracy}

Identified Errors:
Task Response: ${context.errors.task_response.join('; ') || 'None'}
Coherence & Cohesion: ${context.errors.coherence_cohesion.join('; ') || 'None'}
Lexical Resource: ${context.errors.lexical_resource.join('; ') || 'None'}
Grammatical Accuracy: ${context.errors.grammatical_accuracy.join('; ') || 'None'}

Identified Strengths:
Task Response: ${context.strengths.task_response.join('; ') || 'None'}
Coherence & Cohesion: ${context.strengths.coherence_cohesion.join('; ') || 'None'}
Lexical Resource: ${context.strengths.lexical_resource.join('; ') || 'None'}
Grammatical Accuracy: ${context.strengths.grammatical_accuracy.join('; ') || 'None'}

Provide personalized, specific guidance to help this student improve their next essay.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const guidance = JSON.parse(
      completion.choices[0].message.content || '{}'
    )

    // Save guidance to database
    const { error: updateError } = await supabase
      .from('essays')
      .update({
        detailed_guidance: guidance,
      })
      .eq('id', essay_id)

    if (updateError) {
      console.error('Error saving guidance:', updateError)
      return NextResponse.json(
        { error: 'Failed to save guidance' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      guidance,
    })
  } catch (error) {
    console.error('Error generating guidance:', error)
    return NextResponse.json(
      { error: 'Failed to generate guidance' },
      { status: 500 }
    )
  }
}
