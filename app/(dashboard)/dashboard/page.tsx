import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, Award, FileText, AlertCircle } from 'lucide-react'
import { ScoreChart } from './components/ScoreChart'
import { RecentEssaysTable } from './components/RecentEssaysTable'
import { ErrorHistory } from './components/ErrorHistory'
import { AISummaryButton } from './components/AISummaryButton'
import { VocabularyProgress } from './components/VocabularyProgress'
import { ScoreDistribution } from './components/ScoreDistribution'

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
        'id, overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score, task_response_errors, coherence_cohesion_errors, lexical_resource_errors, grammatical_accuracy_errors, prompt, created_at'
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
  const recentEssays = essays.slice(0, 5)
  const chartData = essays
    .filter((e) => e.overall_score !== null)
    .reverse()
    .map((e, index) => ({
      essayNumber: index + 1,
      score: e.overall_score,
      date: e.created_at,
    }))

  // Collect errors from all essays for error history
  interface ErrorsByCriterion {
    taskResponse: string[]
    coherenceCohesion: string[]
    lexicalResource: string[]
    grammaticalAccuracy: string[]
  }

  const errorsByCriterion: ErrorsByCriterion = {
    taskResponse: [],
    coherenceCohesion: [],
    lexicalResource: [],
    grammaticalAccuracy: [],
  }

  essays.forEach((essay) => {
    if (essay.task_response_errors) {
      errorsByCriterion.taskResponse.push(...essay.task_response_errors)
    }
    if (essay.coherence_cohesion_errors) {
      errorsByCriterion.coherenceCohesion.push(...essay.coherence_cohesion_errors)
    }
    if (essay.lexical_resource_errors) {
      errorsByCriterion.lexicalResource.push(...essay.lexical_resource_errors)
    }
    if (essay.grammatical_accuracy_errors) {
      errorsByCriterion.grammaticalAccuracy.push(...essay.grammatical_accuracy_errors)
    }
  })

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4">
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ocean-800 mb-2">
          Welcome back, {displayName}!
        </h1>
        <p className="text-ocean-600 text-base md:text-lg">
          Track your progress and improve your IELTS writing skills
        </p>
      </div>

      {/* Quick Stats Cards */}
      {stats.totalEssays > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <Card className="border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-100 to-cyan-100">
            <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-ocean-600 mb-1">Total Essays</p>
                  <p className="text-3xl md:text-4xl font-bold text-ocean-800">{stats.totalEssays}</p>
                </div>
                <div className="rounded-full bg-ocean-200/50 p-2 md:p-3">
                  <FileText className="h-6 w-6 md:h-8 md:w-8 text-ocean-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-200 shadow-lg bg-gradient-to-br from-emerald-100 to-teal-100">
            <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs md:text-sm font-medium text-emerald-600 mb-1">Average Band Score</p>
                  <p className="text-3xl md:text-4xl font-bold text-emerald-800">
                    {stats.averageScore?.toFixed(1) ?? '0.0'}
                  </p>
                </div>
                <div className="rounded-full bg-emerald-200/50 p-2 md:p-3">
                  <Award className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
            <ScoreChart data={chartData} />
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

      {/* Score Distribution Charts */}
      {stats.totalEssays > 0 && (
        <ScoreDistribution
          scoreDistribution={userStats.scoreDistribution}
          criteriaOverTime={userStats.criteriaOverTime}
          hasEssays={stats.totalEssays > 0}
        />
      )}

      {/* Recent Essays Table */}
      {recentEssays.length > 0 && (
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-ocean-800 flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Essays
            </CardTitle>
            <CardDescription>Your last 5 submitted essays</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentEssaysTable essays={recentEssays as any} />
          </CardContent>
        </Card>
      )}

      {/* Error History Section */}
      {essays.length > 0 && (
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-ocean-800 flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Error History
                </CardTitle>
                <CardDescription>
                  Review common issues across your essays
                </CardDescription>
              </div>
              <AISummaryButton />
            </div>
          </CardHeader>
          <CardContent>
            <ErrorHistory errors={errorsByCriterion} />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
