import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, FileText } from 'lucide-react'
import { ScoreChart } from './components/ScoreChart'
import { VocabularyProgress } from './components/VocabularyProgress'
import { NextActionBanner } from './components/NextActionBanner'
import { ProgressSummary } from './components/ProgressSummary'
import { LookBackTabs } from './components/LookBackTabs'

async function getAllDashboardData(userId: string) {
  const supabase = createServerClient()

  // Run ALL queries in parallel
  const [profileResult, essaysResult, vocabResult, quizResult] = await Promise.all([
    // Profile - only need full_name
    supabase.from('profiles').select('full_name').eq('id', userId).single(),

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

    // Quiz attempts - only need score fields
    supabase
      .from('vocabulary_quiz_attempts')
      .select('score, total_questions, vocab_type')
      .eq('user_id', userId),
  ])

  const userName =
    profileResult.data?.full_name ||
    undefined

  const essays = essaysResult.data || []
  const vocabulary = vocabResult.data || []
  const quizAttempts = quizResult.data || []

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

  // --- Quiz Stats ---
  const totalQuizzes = quizAttempts.length
  const totalCorrectAnswers = quizAttempts.reduce((sum, q) => sum + (q.score || 0), 0)
  const totalQuestions = quizAttempts.reduce((sum, q) => sum + (q.total_questions || 0), 0)
  const avgQuizScore = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0

  const paraphraseQuizzes = quizAttempts.filter((q) => q.vocab_type === 'paraphrase')
  const topicQuizzes = quizAttempts.filter((q) => q.vocab_type === 'topic')

  const paraphraseCorrect = paraphraseQuizzes.reduce((sum, q) => sum + (q.score || 0), 0)
  const paraphraseTotal = paraphraseQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0)
  const avgParaphraseScore = paraphraseTotal > 0 ? (paraphraseCorrect / paraphraseTotal) * 100 : 0

  const topicCorrect = topicQuizzes.reduce((sum, q) => sum + (q.score || 0), 0)
  const topicTotal = topicQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0)
  const avgTopicScore = topicTotal > 0 ? (topicCorrect / topicTotal) * 100 : 0

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
        totalAttempts: totalQuizzes,
        totalCorrect: totalCorrectAnswers,
        totalQuestions,
        avgScore: Math.round(avgQuizScore * 10) / 10,
        avgParaphraseScore: Math.round(avgParaphraseScore * 10) / 10,
        avgTopicScore: Math.round(avgTopicScore * 10) / 10,
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

      {/* Quick Stats Cards - Hidden for now, keeping design simpler */}

      {/* Empty State - First Time User */}
      {stats.totalEssays === 0 && (
        <Card className="border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-50 to-cyan-50">
          <CardContent className="py-8 md:py-12 px-4 md:px-6">
            <div className="text-center">
              <FileText className="h-16 w-16 md:h-20 md:w-20 mx-auto mb-4 text-ocean-400" />
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
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-ocean-800 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Score Progress Over Time
            </CardTitle>
            <CardDescription>
              Track your improvement across all submitted essays
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScoreChart data={chartData} criteriaOverTime={userStats.criteriaOverTime} />
          </CardContent>
        </Card>
      )}

      {/* Vocabulary Learning Progress */}
      {stats.totalEssays > 0 && (
        <VocabularyProgress
          totalWords={userStats.vocabulary.total}
          essaysWithoutVocab={userStats.vocabulary.essaysWithoutVocab}
          quizScore={userStats.quiz.avgScore}
          paraphraseScore={userStats.quiz.avgParaphraseScore}
          topicScore={userStats.quiz.avgTopicScore}
          totalCorrect={userStats.quiz.totalCorrect}
          totalQuestions={userStats.quiz.totalQuestions}
        />
      )}

      {recentEssays.length > 0 && <LookBackTabs recentEssays={recentEssays as any} />}
    </div>
  )
}
