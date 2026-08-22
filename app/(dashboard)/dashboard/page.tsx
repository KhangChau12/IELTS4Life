import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { ArrowRight } from 'lucide-react'
import { QUESTION_TYPES_DISPLAY } from '@/lib/constants'

export const metadata: Metadata = {
  title: 'My Dashboard | IELTS4Life',
  description:
    'Track your IELTS Writing progress — score trends, vocabulary growth, and personalized insights.',
  robots: { index: false, follow: false },
}
import { ScoreChart } from './components/ScoreChart'
import { VocabSnapshot, RecentVocabulary } from './components/VocabularyProgress'
import { StatsStrip } from './components/StatsStrip'
import { RecentEssaysTable } from './components/RecentEssaysTable'
import { DashboardPollWrapper } from './components/DashboardPollWrapper'
import { CoverageMap } from './components/CoverageMap'

async function getAllDashboardData(userId: string) {
  const supabase = createServerClient()

  // Run ALL queries in parallel
  const [profileResult, essaysResult, vocabResult, topicsResult, approvedPromptsResult] = await Promise.all([
    // Profile - full_name + pre-aggregated quiz counters (replaces vocabulary_quiz_attempts)
    supabase
      .from('profiles')
      .select('full_name, quiz_total_attempts, quiz_total_correct, quiz_total_questions, satisfaction_rated_at')
      .eq('id', userId)
      .single(),

    // Essays - select only needed columns, NO essay_content
    // (also pull denormalised classification fields for the Coverage Map)
    supabase
      .from('essays')
      .select(
        'id, overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score, prompt, created_at, essay_topic_id, essay_topic_name, essay_question_type'
      )
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),

    // Vocabulary - only need essay_id for counting
    supabase.from('vocabulary').select('essay_id').eq('user_id', userId),

    // All topics (canonical list for the Coverage Map)
    supabase.from('prompt_topics').select('id, name').order('name', { ascending: true }),

    // Approved prompts — used to suggest a concrete prompt for untouched topics/types
    supabase
      .from('writing_prompts')
      .select('id, prompt_text, topic_id, question_type, prompt_topics(name)')
      .eq('status', 'approved'),
  ])

  const userName = profileResult.data?.full_name || undefined
  const hasRated = !!profileResult.data?.satisfaction_rated_at
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

  // --- Coverage Map (topic + question type) ---
  // Counts every classified essay (paste OR /write) via denormalised fields.
  const topics = topicsResult.data || []
  const approvedPrompts = approvedPromptsResult.data || []

  // Per-topic / per-type essay counts from the user's classified essays
  const topicCounts = new Map<string, number>()
  const typeCounts = new Map<string, number>()
  essays.forEach((e) => {
    if (e.essay_topic_id) {
      topicCounts.set(e.essay_topic_id, (topicCounts.get(e.essay_topic_id) || 0) + 1)
    }
    if (e.essay_question_type) {
      typeCounts.set(e.essay_question_type, (typeCounts.get(e.essay_question_type) || 0) + 1)
    }
  })

  // Map each topic / type to a concrete approved prompt to power the "practice this" CTA.
  // Pick the first approved prompt that matches — good enough for a gap nudge.
  type PromptMeta = { id: string; text: string; topicName: string }
  const promptByTopic = new Map<string, PromptMeta>()
  const promptByType = new Map<string, PromptMeta>()
  approvedPrompts.forEach((p) => {
    const topicName = (Array.isArray(p.prompt_topics) ? p.prompt_topics[0] : p.prompt_topics as { name?: string } | null)?.name ?? ''
    const meta: PromptMeta = { id: p.id, text: p.prompt_text, topicName }
    if (p.topic_id && !promptByTopic.has(p.topic_id)) promptByTopic.set(p.topic_id, meta)
    if (p.question_type && !promptByType.has(p.question_type)) promptByType.set(p.question_type, meta)
  })

  const topicCoverage = topics.map((t) => {
    const meta = promptByTopic.get(t.id) || null
    return {
      key: t.id,
      label: t.name,
      count: topicCounts.get(t.id) || 0,
      suggestedPromptId: meta?.id || null,
      suggestedPromptText: meta?.text || null,
      suggestedTopicName: meta?.topicName || null,
    }
  })

  const typeCoverage = Object.entries(QUESTION_TYPES_DISPLAY).map(([key, label]) => {
    const meta = promptByType.get(key) || null
    return {
      key,
      label,
      count: typeCounts.get(key) || 0,
      suggestedPromptId: meta?.id || null,
      suggestedPromptText: meta?.text || null,
      suggestedTopicName: meta?.topicName || null,
    }
  })

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
    hasRated,
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
    coverage: {
      topics: topicCoverage,
      types: typeCoverage,
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

  const { userName, hasRated, essays, stats, userStats, coverage } = await getAllDashboardData(user.id)
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
    <div className="max-w-6xl mx-auto space-y-5 px-4 py-6">
      <DashboardPollWrapper shouldShow={stats.totalEssays >= 1 && !hasRated} />
      {/* Welcome Section */}
      <div>
        <h1 className="text-[26px] font-extrabold text-slate-900">Welcome back, {displayName}</h1>
        <p className="text-[13.5px] text-slate-500">Here&apos;s where your writing stands today.</p>
      </div>

      {/* Empty State - First Time User */}
      {stats.totalEssays === 0 && (
        <div className="rounded-2xl border border-ocean-100 bg-white p-8 text-center shadow-sm md:p-12">
          <h2 className="mb-2 text-xl font-extrabold text-slate-900 md:text-2xl">Start Your IELTS Journey!</h2>
          <p className="mx-auto mb-6 max-w-md px-4 text-sm text-slate-500 md:text-base">
            Submit your first essay to get AI-powered feedback, personalized vocabulary, and track your progress
          </p>
          <a
            href="/write"
            className="inline-flex items-center gap-2 rounded-lg bg-ocean-900 px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-ocean-800 md:px-6 md:py-3 md:text-base"
          >
            Write Your First Essay
            <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
          </a>
        </div>
      )}

      {/* Status strip — at-a-glance status (no boxes, one gradient band) */}
      {stats.totalEssays > 0 && (
        <StatsStrip
          totalEssays={stats.totalEssays}
          averageScore={stats.averageScore}
          latestScore={stats.latestScore}
        />
      )}

      {/* Coverage Map — next-action hook + question type / topic coverage */}
      {stats.totalEssays > 0 && <CoverageMap types={coverage.types} topics={coverage.topics} />}

      {/* Score progress + vocab/quiz snapshot — side by side */}
      {(chartData.length > 0 || stats.totalEssays > 0) && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
          {chartData.length > 0 && (
            <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
              <h3 className="text-[14.5px] font-extrabold text-slate-900">Score Progress</h3>
              <p className="mb-4 text-xs text-slate-400">Your improvement across every submitted essay</p>
              <ScoreChart data={chartData} criteriaOverTime={userStats.criteriaOverTime} />
            </div>
          )}
          {stats.totalEssays > 0 && (
            <VocabSnapshot
              totalWords={userStats.vocabulary.total}
              essaysWithoutVocab={userStats.vocabulary.essaysWithoutVocab}
              quizScore={userStats.quiz.avgScore}
              totalCorrect={userStats.quiz.totalCorrect}
              totalQuestions={userStats.quiz.totalQuestions}
              totalAttempts={userStats.quiz.totalAttempts}
            />
          )}
        </div>
      )}

      {/* Recent Vocabulary */}
      <RecentVocabulary totalWords={userStats.vocabulary.total} />

      {/* Recent Essays */}
      {recentEssays.length > 0 && (
        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <h3 className="text-[14.5px] font-extrabold text-slate-900">Recent Essays</h3>
          <p className="mb-1 text-xs text-slate-400">Your latest submissions at a glance</p>
          <RecentEssaysTable essays={recentEssays as any} />
        </div>
      )}
    </div>
  )
}
