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

    // Fetch all needed data in parallel
    const [
      vocabularyResult,
      profileResult,
      essayScoresResult,
      allEssayIdsResult,
    ] = await Promise.all([
      supabase.from('vocabulary').select('essay_id').eq('user_id', user.id),
      supabase
        .from('profiles')
        .select('quiz_total_attempts, quiz_total_correct, quiz_total_questions')
        .eq('id', user.id)
        .single(),
      supabase
        .from('essays')
        .select('overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score')
        .eq('user_id', user.id),
      supabase.from('essays').select('id').eq('user_id', user.id),
    ])

    // Vocabulary stats
    const vocabulary = vocabularyResult.data ?? []
    const totalVocabulary = vocabulary.length

    const vocabularyByEssay: { [key: string]: number } = {}
    for (const vocab of vocabulary) {
      if (vocab.essay_id) {
        vocabularyByEssay[vocab.essay_id] = (vocabularyByEssay[vocab.essay_id] || 0) + 1
      }
    }

    const allEssays = allEssayIdsResult.data ?? []
    const essaysWithoutVocab = allEssays.filter(essay => !vocabularyByEssay[essay.id]).length

    // Quiz stats — read pre-aggregated counters from profile
    const profile = profileResult.data
    const totalQuizzes     = profile?.quiz_total_attempts  ?? 0
    const totalCorrect     = profile?.quiz_total_correct   ?? 0
    const totalQuestionsAll = profile?.quiz_total_questions ?? 0
    const avgQuizScore = totalQuestionsAll > 0 ? (totalCorrect / totalQuestionsAll) * 100 : 0

    // Score distribution for each criterion
    const essays = essayScoresResult.data ?? []
    const scoreDistribution = {
      overall:     {} as { [key: number]: number },
      taskResponse: {} as { [key: number]: number },
      coherence:   {} as { [key: number]: number },
      lexical:     {} as { [key: number]: number },
      grammar:     {} as { [key: number]: number },
    }

    for (const essay of essays) {
      if (essay.overall_score) {
        const s = Math.floor(essay.overall_score)
        scoreDistribution.overall[s] = (scoreDistribution.overall[s] || 0) + 1
      }
      if (essay.task_response_score) {
        const s = Math.floor(essay.task_response_score)
        scoreDistribution.taskResponse[s] = (scoreDistribution.taskResponse[s] || 0) + 1
      }
      if (essay.coherence_cohesion_score) {
        const s = Math.floor(essay.coherence_cohesion_score)
        scoreDistribution.coherence[s] = (scoreDistribution.coherence[s] || 0) + 1
      }
      if (essay.lexical_resource_score) {
        const s = Math.floor(essay.lexical_resource_score)
        scoreDistribution.lexical[s] = (scoreDistribution.lexical[s] || 0) + 1
      }
      if (essay.grammatical_accuracy_score) {
        const s = Math.floor(essay.grammatical_accuracy_score)
        scoreDistribution.grammar[s] = (scoreDistribution.grammar[s] || 0) + 1
      }
    }

    return NextResponse.json({
      vocabulary: {
        total: totalVocabulary,
        essaysWithoutVocab,
      },
      quiz: {
        totalAttempts: totalQuizzes,
        totalCorrect,
        totalQuestions: totalQuestionsAll,
        avgScore:           Math.round(avgQuizScore * 10) / 10,
        // No longer tracked per type after removing vocabulary_quiz_attempts table
        avgParaphraseScore: 0,
        avgTopicScore:      0,
      },
      scoreDistribution,
    })
  } catch (error) {
    console.error('Error fetching user stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
