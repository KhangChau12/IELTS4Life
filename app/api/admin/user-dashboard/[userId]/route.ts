import { NextRequest, NextResponse } from 'next/server'
import { getAdminUser } from '@/lib/admin/auth'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(
  _req: NextRequest,
  { params }: { params: { userId: string } }
) {
  const adminUser = await getAdminUser()
  if (!adminUser?.profile || !['admin', 'dev'].includes(adminUser.profile.role)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  }

  const { userId } = params
  const supabase = createServiceRoleClient()

  const [profileResult, essaysResult, vocabResult, transactionsResult] = await Promise.all([
    supabase
      .from('profiles')
      .select(
        'full_name, email, role, subscription_status, subscription_end_date, invite_bonus_essays, quiz_total_attempts, quiz_total_correct, quiz_total_questions, created_at'
      )
      .eq('id', userId)
      .single(),

    supabase
      .from('essays')
      .select(
        'id, overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score, prompt, created_at'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    supabase.from('vocabulary').select('essay_id').eq('user_id', userId),

    supabase.from('payment_transactions').select('amount').eq('user_id', userId).eq('status', 'completed'),
  ])

  if (profileResult.error || !profileResult.data) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const profile = profileResult.data
  const essays = essaysResult.data || []
  const vocabulary = vocabResult.data || []

  const totalEssays = essays.length
  const essaysWithScores = essays.filter((e) => e.overall_score !== null)
  const averageScore =
    essaysWithScores.length > 0
      ? essaysWithScores.reduce((acc, e) => acc + (e.overall_score || 0), 0) /
        essaysWithScores.length
      : null
  const latestScore = essaysWithScores.length > 0 ? essaysWithScores[0].overall_score : null

  const totalSpent = (transactionsResult.data ?? []).reduce((sum, t) => sum + (t.amount || 0), 0)

  const totalVocabulary = vocabulary.length
  const vocabEssayIds = new Set(vocabulary.map((v) => v.essay_id).filter(Boolean))
  const essaysWithoutVocab = essays.filter((e) => !vocabEssayIds.has(e.id)).length

  const totalAttempts = profile.quiz_total_attempts ?? 0
  const totalCorrect = profile.quiz_total_correct ?? 0
  const totalQuestions = profile.quiz_total_questions ?? 0
  const avgQuizScore = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0

  const essaysAsc = [...essays].reverse()
  const criteriaOverTime = essaysAsc.map((essay, index) => ({
    essayNumber: index + 1,
    taskResponse: essay.task_response_score,
    coherence: essay.coherence_cohesion_score,
    vocabulary: essay.lexical_resource_score,
    grammar: essay.grammatical_accuracy_score,
  }))

  return NextResponse.json({
    profile,
    essays,
    stats: { totalEssays, averageScore, latestScore, totalSpent },
    userStats: {
      vocabulary: { total: totalVocabulary, essaysWithoutVocab },
      quiz: {
        totalAttempts,
        totalCorrect,
        totalQuestions,
        avgScore: Math.round(avgQuizScore * 10) / 10,
      },
      criteriaOverTime,
    },
  })
}
