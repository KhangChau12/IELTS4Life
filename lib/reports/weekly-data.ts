import { createServiceRoleClient } from '@/lib/supabase/service'
import { QUESTION_TYPES_DISPLAY } from '@/lib/constants'

export interface WeeklyReportData {
  userName: string
  essaysThisWeek: number
  avgScoreThisWeek: number | null
  scoreDelta: number | null
  newTopicsTouched: string[]
  newTypesTouched: string[]
  vocabAddedThisWeek: number
  dueFlashcardsCount: number
  quizAccuracy: number | null
}

/**
 * Gathers everything the weekly report email needs for one user.
 * Returns null when the user had zero essay/vocab activity in the window —
 * callers should treat that as "skip this user" rather than send an all-zero report.
 */
export async function getWeeklyReportData(
  userId: string,
  since: Date
): Promise<WeeklyReportData | null> {
  const supabase = createServiceRoleClient()
  const sinceIso = since.toISOString()
  const nowIso = new Date().toISOString()

  const [profileResult, essaysThisWeekResult, essaysBeforeResult, vocabThisWeekResult, dueFlashcardsResult] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('full_name, quiz_total_attempts, quiz_total_correct, quiz_total_questions')
        .eq('id', userId)
        .single(),

      supabase
        .from('essays')
        .select('overall_score, essay_topic_id, essay_topic_name, essay_question_type, created_at')
        .eq('user_id', userId)
        .gte('created_at', sinceIso),

      // Prior essays only needed to compute the "new this week" topic/type set and the score delta baseline
      supabase
        .from('essays')
        .select('overall_score, essay_topic_id, essay_question_type')
        .eq('user_id', userId)
        .lt('created_at', sinceIso),

      supabase
        .from('vocabulary')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', sinceIso),

      supabase
        .from('flashcards')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .lte('next_review_date', nowIso),
    ])

  const essaysThisWeek = essaysThisWeekResult.data || []
  const essaysBefore = essaysBeforeResult.data || []

  const vocabAddedThisWeek = vocabThisWeekResult.count || 0
  const dueFlashcardsCount = dueFlashcardsResult.count || 0

  if (essaysThisWeek.length === 0 && vocabAddedThisWeek === 0) {
    return null
  }

  const scoresThisWeek = essaysThisWeek
    .map((e) => e.overall_score)
    .filter((s): s is number => s !== null)
  const avgScoreThisWeek =
    scoresThisWeek.length > 0
      ? Math.round((scoresThisWeek.reduce((a, b) => a + b, 0) / scoresThisWeek.length) * 10) / 10
      : null

  const scoresBefore = essaysBefore
    .map((e) => e.overall_score)
    .filter((s): s is number => s !== null)
  const avgScoreBefore =
    scoresBefore.length > 0
      ? scoresBefore.reduce((a, b) => a + b, 0) / scoresBefore.length
      : null

  const scoreDelta =
    avgScoreThisWeek !== null && avgScoreBefore !== null
      ? Math.round((avgScoreThisWeek - avgScoreBefore) * 10) / 10
      : null

  // "New" this week = topic/type appears in this week's essays but never in prior essays
  const topicsTouchedBefore = new Set(
    essaysBefore.map((e) => e.essay_topic_id).filter((v): v is string => !!v)
  )
  const typesTouchedBefore = new Set(
    essaysBefore.map((e) => e.essay_question_type).filter((v): v is string => !!v)
  )

  const newTopicsTouched = Array.from(
    new Set(
      essaysThisWeek
        .filter((e) => e.essay_topic_id && e.essay_topic_name && !topicsTouchedBefore.has(e.essay_topic_id))
        .map((e) => e.essay_topic_name as string)
    )
  )

  const newTypesTouched = Array.from(
    new Set(
      essaysThisWeek
        .map((e) => e.essay_question_type)
        .filter((v): v is string => !!v && !typesTouchedBefore.has(v))
        .map((key) => QUESTION_TYPES_DISPLAY[key] ?? key)
    )
  )

  const totalQuestions = profileResult.data?.quiz_total_questions ?? 0
  const totalCorrect = profileResult.data?.quiz_total_correct ?? 0
  const quizAccuracy =
    totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 1000) / 10 : null

  return {
    userName: profileResult.data?.full_name || 'there',
    essaysThisWeek: essaysThisWeek.length,
    avgScoreThisWeek,
    scoreDelta,
    newTopicsTouched,
    newTypesTouched,
    vocabAddedThisWeek,
    dueFlashcardsCount,
    quizAccuracy,
  }
}
