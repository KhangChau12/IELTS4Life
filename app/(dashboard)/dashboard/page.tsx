import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, FileText } from 'lucide-react'

export const metadata: Metadata = {
  title: 'My Dashboard | IELTS4Life',
  description:
    'Track your IELTS Writing progress — score trends, vocabulary growth, and personalized insights.',
  robots: { index: false, follow: false },
}
import { ScoreChart } from './components/ScoreChart'
import { VocabularyProgress } from './components/VocabularyProgress'
import { NextActionBanner } from './components/NextActionBanner'
import { ProgressSummary } from './components/ProgressSummary'
import { RecentEssaysTable } from './components/RecentEssaysTable'

async function getAllDashboardData(userId: string) {
  const supabase = createServerClient()

  // Run ALL queries in parallel
  const [profileResult, essaysResult, vocabResult] = await Promise.all([
    // Profile - full_name + pre-aggregated quiz counters (replaces vocabulary_quiz_attempts)
    supabase
      .from('profiles')
      .select('full_name, quiz_total_attempts, quiz_total_correct, quiz_total_questions')
      .eq('id', userId)
      .single(),

    // Essays - select only needed columns, NO essay_content
    supabase
      .from('essays')
      .select(
        'id, overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score, prompt, created_at'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    // Vocabulary - only need essay_id for counting
    supabase.from('vocabulary').select('essay_id').eq('user_id', userId),
  ])

  const userName = profileResult.data?.full_name || undefined
  const essays = essaysResult.data || []
  const vocabulary = vocabResult.data || []

  // --- Dashboard Stats ---
  const totalEssays = essays.length
  const essaysWithScores = essays.filter((e) => e.overall_score !== null)
  const averageScore =
    essaysWithScores.length > 0
      ? essaysWithScores.reduce((acc, e) => acc + (e.overall_score || 0), 0) / essaysWithScores.length
      : null
  const latestScore = essaysWithScores.length > 0 ? essaysWithScores[0].overall_score : null

  // --- Vocabulary Stats ---
  const totalVocabulary = vocabulary.length
  const vocabEssayIds = new Set(vocabulary.map((v) => v.essay_id).filter(Boolean))
  const essaysWithoutVocab = essays.filter((e) => !vocabEssayIds.has(e.id)).length

  // --- Quiz Stats — read pre-aggregated counters from profiles ---
  const totalAttempts      = profileResult.data?.quiz_total_attempts  ?? 0
  const totalCorrectAnswers = profileResult.data?.quiz_total_correct   ?? 0
  const totalQuestions     = profileResult.data?.quiz_total_questions ?? 0
  const avgQuizScore       = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0

  // --- Score Distribution ---
  const scoreDistribution = {
    overall: {} as { [key: number]: number },
    taskResponse: {} as { [key: number]: number },
    coherence: {} as { [key: number]: number },
    lexical: {} as { [key: number]: number },
    grammar: {} as { [key: number]: number },
  }

  essays.forEach((essay) => {
    if (essay.overall_score) {
      const score = Math.floor(essay.overall_score)
      scoreDistribution.overall[score] = (scoreDistribution.overall[score] || 0) + 1
    }
    if (essay.task_response_score) {
      const score = Math.floor(essay.task_response_score)
      scoreDistribution.taskResponse[score] = (scoreDistribution.taskResponse[score] || 0) + 1
    }
    if (essay.coherence_cohesion_score) {
      const score = Math.floor(essay.coherence_cohesion_score)
      scoreDistribution.coherence[score] = (scoreDistribution.coherence[score] || 0) + 1
    }
    if (essay.lexical_resource_score) {
      const score = Math.floor(essay.lexical_resource_score)
      scoreDistribution.lexical[score] = (scoreDistribution.lexical[score] || 0) + 1
    }
    if (essay.grammatical_accuracy_score) {
      const score = Math.floor(essay.grammatical_accuracy_score)
      scoreDistribution.grammar[score] = (scoreDistribution.grammar[score] || 0) + 1
    }
  })

  // --- Criteria Over Time (ascending order) ---
  const essaysAsc = [...essays].reverse()
  const criteriaOverTime = essaysAsc.map((essay, index) => ({
    essayNumber: index + 1,
    taskResponse: essay.task_response_score,
    coherence: essay.coherence_cohesion_score,
    vocabulary: essay.lexical_resource_score,
    grammar: essay.grammatical_accuracy_score,
  }))

  return {
    userName,
    essays,
    stats: { totalEssays, averageScore, latestScore },
    userStats: {
      vocabulary: { total: totalVocabulary, essaysWithoutVocab },
      quiz: {
        totalAttempts,
        totalCorrect: totalCorrectAnswers,
        totalQuestions,
        avgScore: Math.round(avgQuizScore * 10) / 10,
      },
      scoreDistribution,
      criteriaOverTime,
    },
  }
}

export default async function DashboardPage() {
  const supabase = createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/login')
  }

  const { userName, essays, stats, userStats } = await getAllDashboardData(user.id)
  const displayName = userName || user.email?.split('@')[0] || 'Student'

  // Prepare data for charts
  const recentEssays = essays
  const chartData = essays
    .filter((e) => e.overall_score !== null)
    .reverse()
    .map((e, index) => ({
      essayNumber: index + 1,
      score: e.overall_score,
      date: e.created_at,
    }))

  return (
    <div className="max-w-7xl mx-auto space-y-7 md:space-y-9 px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8 md:mb-10">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ocean-800 mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-ocean-600 text-base md:text-lg">
          Track your progress and improve your IELTS writing skills
        </p>
      </div>

      {/* Next Action Banner */}
      {stats.totalEssays >= 0 && (
        <NextActionBanner
          totalEssays={stats.totalEssays}
          essaysWithoutVocab={userStats.vocabulary.essaysWithoutVocab}
          avgScore={stats.averageScore}
          quizScore={userStats.quiz.avgScore}
        />
      )}

      {/* Progress Summary */}
      {stats.totalEssays > 0 && (
        <ProgressSummary
          totalEssays={stats.totalEssays}
          averageScore={stats.averageScore}
          latestScore={stats.latestScore}
        />
      )}

      {/* Empty State - First Time User */}
      {stats.totalEssays === 0 && (
        <Card className="border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-50 to-cyan-50 overflow-hidden relative">
          <FileText className="absolute right-2 bottom-2 h-52 w-52 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardContent className="py-8 md:py-12 px-4 md:px-6 relative z-10">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold text-ocean-800 mb-2">Start Your IELTS Journey!</h2>
              <p className="text-sm md:text-base text-ocean-600 mb-6 max-w-md mx-auto px-4">
                Submit your first essay to get AI-powered feedback, personalized vocabulary, and track your progress
              </p>
              <a
                href="/write"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-cyan-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-sm md:text-base font-semibold hover:from-ocean-700 hover:to-cyan-700 transition-all"
              >
                <FileText className="h-4 w-4 md:h-5 md:w-5" />
                Write Your First Essay
              </a>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Score Progress Chart */}
      {chartData.length > 0 && (
        <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
          <TrendingUp className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-ocean-800">Score Progress Over Time</CardTitle>
            <CardDescription>
              Track your improvement across all submitted essays
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ScoreChart data={chartData} criteriaOverTime={userStats.criteriaOverTime} />
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Learning Progress + Past Vocab (combined) */}
      {stats.totalEssays > 0 && (
        <VocabularyProgress
          totalWords={userStats.vocabulary.total}
          essaysWithoutVocab={userStats.vocabulary.essaysWithoutVocab}
          quizScore={userStats.quiz.avgScore}
          totalCorrect={userStats.quiz.totalCorrect}
          totalQuestions={userStats.quiz.totalQuestions}
          totalAttempts={userStats.quiz.totalAttempts}
        />
      )}

      {/* Recent Essays */}
      {recentEssays.length > 0 && (
        <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
          <FileText className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="relative z-10">
            <CardTitle className="text-ocean-800">Recent Essays</CardTitle>
            <CardDescription>Your latest submissions at a glance</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <RecentEssaysTable essays={recentEssays as any} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
