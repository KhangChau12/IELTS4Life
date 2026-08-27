import { createServiceRoleClient } from '@/lib/supabase/service'
import { fetchOpenRouterKeyUsage, fetchOpenAICost } from '@/lib/openai/client'
import type { AdminStats } from '@/types/admin'

// Hardcoded USD->VND rate for converting OpenRouter's dollar-denominated usage into the
// site's VND-denominated revenue figures. Update here if the rate drifts significantly.
const USD_TO_VND = 26000

export async function fetchAdminStats(): Promise<AdminStats> {
  const serviceClient = createServiceRoleClient()

  const fourteenDaysAgo = new Date()
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
  fourteenDaysAgo.setHours(0, 0, 0, 0)
  const fourteenDaysAgoISO = fourteenDaysAgo.toISOString()

  const [
    allEssaysForScoringResult,
    essaysLast14DaysResult,
    allUsersWithEssaysResult,
    allUsersResult,
    quizStatsResult,
    inviteStatsResult,
    essaysWithPromptIdResult,
    paidProProfilesResult,
    completedTransactionsResult,
    vocabCountResult,
    promptCountResult,
    promptOutlineCountResult,
    essayCountResult,
    satisfactionResult,
    pendingPromptsCountResult,
    openRouterUsage,
    openAICost,
  ] = await Promise.all([
    serviceClient.from('essays').select('overall_score'),
    serviceClient.from('essays').select('created_at, prompt_id, writing_prompts(status)').gte('created_at', fourteenDaysAgoISO).order('created_at', { ascending: true }),
    serviceClient.from('profiles').select(`
      id,
      email,
      full_name,
      created_at,
      role,
      quiz_total_attempts,
      essays:essays(count)
    `).order('created_at', { ascending: false }),
    serviceClient.from('profiles').select('id, email, created_at').order('created_at', { ascending: true }),
    serviceClient.from('profiles').select('quiz_total_attempts, quiz_total_correct, quiz_total_questions'),
    serviceClient.from('profiles').select('invited_by'),
    serviceClient.from('essays').select('prompt_id, writing_prompts(status)').not('prompt_id', 'is', null),
    serviceClient.from('profiles')
      .select('id, email')
      .eq('subscription_status', 'active')
      .gt('subscription_end_date', new Date().toISOString()),
    serviceClient.from('payment_transactions')
      .select('user_id, amount, order_code')
      .eq('status', 'completed'),
    serviceClient.from('vocabulary').select('*', { count: 'exact', head: true }),
    serviceClient.from('writing_prompts').select('*', { count: 'exact', head: true }),
    serviceClient.from('writing_prompt_outlines').select('*', { count: 'exact', head: true }),
    serviceClient.from('essays').select('*', { count: 'exact', head: true }),
    serviceClient.from('profiles').select('satisfaction_rating, satisfaction_rated_at'),
    serviceClient.from('writing_prompts').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    fetchOpenRouterKeyUsage(),
    fetchOpenAICost(),
  ])

  // Separate parallel groups into named vars
  const quizStats = quizStatsResult.data ?? []
  const inviteStats = inviteStatsResult.data ?? []
  const allEssaysForScoring = allEssaysForScoringResult.data ?? []
  const essaysLast14Days = essaysLast14DaysResult.data ?? []
  const allUsersWithEssays = allUsersWithEssaysResult.data ?? []
  const allUsersList = allUsersResult.data ?? []
  const essaysWithPromptId = essaysWithPromptIdResult.data ?? []
  const paidProProfiles = paidProProfilesResult.data ?? []
  const completedTransactions = completedTransactionsResult.data ?? []

  const totalVocabulary = vocabCountResult.count ?? 0
  const totalPrompts = promptCountResult.count ?? 0
  const promptsWithOutlines = promptOutlineCountResult.count ?? 0
  const totalEssays = essayCountResult.count ?? 0
  const pendingPromptsCount = pendingPromptsCountResult.count ?? 0

  const satisfactionProfiles = satisfactionResult.data ?? []
  const satisfactionDistribution = {
    terrible:    satisfactionProfiles.filter(p => p.satisfaction_rating === 1).length,
    notForMe:    satisfactionProfiles.filter(p => p.satisfaction_rating === 2).length,
    needImprove: satisfactionProfiles.filter(p => p.satisfaction_rating === 3).length,
    allGood:     satisfactionProfiles.filter(p => p.satisfaction_rating === 4).length,
    totalRated:  satisfactionProfiles.filter(p => p.satisfaction_rated_at !== null).length,
  }

  // Score distribution — separate bands, no merging
  const scoreDistribution: { [key: string]: number } = {}
  for (const essay of allEssaysForScoring) {
    if (essay.overall_score) {
      const band = String(Math.floor(essay.overall_score))
      scoreDistribution[band] = (scoreDistribution[band] || 0) + 1
    }
  }

  // Average score
  const validScores = allEssaysForScoring.filter(e => e.overall_score !== null)
  const avgOverallScore =
    validScores.length > 0
      ? validScores.reduce((s, e) => s + (e.overall_score ?? 0), 0) / validScores.length
      : 0

  // Quiz stats — aggregated from pre-computed counters on profiles
  const totalQuizAttempts = quizStats.reduce((s, p) => s + (p.quiz_total_attempts ?? 0), 0)
  const totalCorrectAnswers = quizStats.reduce((s, p) => s + (p.quiz_total_correct ?? 0), 0)
  const totalQuestions = quizStats.reduce((s, p) => s + (p.quiz_total_questions ?? 0), 0)
  const avgQuizScore = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0

  // Paid Pro
  const paidProUsers = paidProProfiles.length
  const paidProEmailSet = new Set(paidProProfiles.map(p => p.email))

  // PTNK / Free counts (mutually exclusive: Paid Pro > PTNK > Free)
  const totalUsers = allUsersList.length
  const ptnkUsers = allUsersList.filter(u => u.email?.endsWith('@ptnk.edu.vn')).length
  const ptnkOnlyUsers = allUsersList.filter(
    u => u.email?.endsWith('@ptnk.edu.vn') && !paidProEmailSet.has(u.email)
  ).length
  const freeUsers = Math.max(0, totalUsers - paidProUsers - ptnkOnlyUsers)

  // Revenue
  const proTransactions = completedTransactions.filter(t => t.order_code?.startsWith('PRO'))
  const packTransactions = completedTransactions.filter(t => t.order_code?.startsWith('PACK'))
  const totalRevenue = completedTransactions.reduce((s, t) => s + (t.amount || 0), 0)
  const proRevenue = proTransactions.reduce((s, t) => s + (t.amount || 0), 0)
  const packRevenue = packTransactions.reduce((s, t) => s + (t.amount || 0), 0)

  // API cost — OpenRouter (scoring/improvement/guidance/outline/classify) + OpenAI (vocabulary),
  // both USD, last ~90 days only (not all-time — shown as a standalone reference figure, not
  // subtracted from the all-time Revenue card). Either source is 0 if its fetch failed — never
  // blocks stats.
  const openRouterCostQuarterUsd = openRouterUsage?.usageQuarterUsd ?? 0
  const openRouterCostMonthlyUsd = openRouterUsage?.usageMonthlyUsd ?? 0
  const openAICostQuarterUsd = openAICost?.costQuarterUsd ?? 0
  const openAICostMonthlyUsd = openAICost?.costMonthlyUsd ?? 0

  const apiCostVnd = Math.round((openRouterCostQuarterUsd + openAICostQuarterUsd) * USD_TO_VND)
  const apiCostMonthlyVnd = Math.round((openRouterCostMonthlyUsd + openAICostMonthlyUsd) * USD_TO_VND)
  const openRouterCostVnd = Math.round(openRouterCostQuarterUsd * USD_TO_VND)
  const openAICostVnd = Math.round(openAICostQuarterUsd * USD_TO_VND)

  // Referral stats
  const totalInvitedUsers = inviteStats.filter(p => p.invited_by !== null).length
  const uniqueReferrers = new Set(inviteStats.filter(p => p.invited_by !== null).map(p => p.invited_by)).size
  const inviteConversionRate = totalUsers > 0 ? (totalInvitedUsers / totalUsers) * 100 : 0

  // Total spent per user, from completed transactions
  const spentByUser = new Map<string, number>()
  for (const t of completedTransactions) {
    if (!t.user_id) continue
    spentByUser.set(t.user_id, (spentByUser.get(t.user_id) ?? 0) + (t.amount || 0))
  }

  // Users with essay counts
  const allUsers = (allUsersWithEssays ?? []).map(u => ({
    id: u.id,
    email: u.email,
    full_name: u.full_name ?? null,
    created_at: u.created_at,
    role: u.role,
    essay_count: Array.isArray(u.essays) ? (u.essays[0]?.count ?? 0) : 0,
    quiz_total_attempts: u.quiz_total_attempts ?? 0,
    total_spent: spentByUser.get(u.id) ?? 0,
  }))

  // User growth — smart bucketing (day/week/month)
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  const usersOverTime: Array<{ date: string; count: number }> = []

  if (allUsersList.length > 0) {
    const firstUserDate = new Date(allUsersList[0].created_at)
    firstUserDate.setHours(0, 0, 0, 0)
    const totalDays = Math.ceil((today.getTime() - firstUserDate.getTime()) / (1000 * 60 * 60 * 24))

    type BucketMode = 'day' | 'week' | 'month'
    const bucketMode: BucketMode = totalDays <= 60 ? 'day' : totalDays <= 365 ? 'week' : 'month'

    const getBucketKey = (d: Date): string => {
      if (bucketMode === 'day') return d.toISOString().split('T')[0]
      if (bucketMode === 'week') {
        const day = d.getDay()
        const diff = d.getDate() - day + (day === 0 ? -6 : 1)
        const monday = new Date(d)
        monday.setDate(diff)
        return monday.toISOString().split('T')[0]
      }
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
    }

    const bucketKeys: string[] = []
    const cursor = new Date(firstUserDate)
    while (cursor <= today) {
      const key = getBucketKey(cursor)
      if (!bucketKeys.length || bucketKeys[bucketKeys.length - 1] !== key) bucketKeys.push(key)
      if (bucketMode === 'day') cursor.setDate(cursor.getDate() + 1)
      else if (bucketMode === 'week') cursor.setDate(cursor.getDate() + 7)
      else cursor.setMonth(cursor.getMonth() + 1)
    }
    const todayKey = getBucketKey(today)
    if (!bucketKeys.includes(todayKey)) bucketKeys.push(todayKey)

    const bucketCounts = new Map<string, number>()
    let runningCount = 0
    let userIdx = 0
    for (const key of bucketKeys) {
      const bucketDate = new Date(key)
      if (bucketMode === 'day') bucketDate.setHours(23, 59, 59, 999)
      else if (bucketMode === 'week') { bucketDate.setDate(bucketDate.getDate() + 6); bucketDate.setHours(23, 59, 59, 999) }
      else { bucketDate.setMonth(bucketDate.getMonth() + 1); bucketDate.setDate(0); bucketDate.setHours(23, 59, 59, 999) }

      while (userIdx < allUsersList.length && new Date(allUsersList[userIdx].created_at) <= bucketDate) {
        runningCount++
        userIdx++
      }
      bucketCounts.set(key, runningCount)
    }
    for (const key of bucketKeys) {
      usersOverTime.push({ date: key, count: bucketCounts.get(key) || 0 })
    }

    const TARGET_POINTS = 6
    if (usersOverTime.length > TARGET_POINTS) {
      const sampled: typeof usersOverTime = []
      for (let i = 0; i < TARGET_POINTS; i++) {
        const idx = Math.round(i * (usersOverTime.length - 1) / (TARGET_POINTS - 1))
        sampled.push(usersOverTime[idx])
      }
      usersOverTime.length = 0
      usersOverTime.push(...sampled)
    }
  }

  // Essays over time — last 14 days, per-day count (total + from system prompts)
  const essaysOverTime: Array<{ date: string; count: number; prompt_count: number }> = []
  for (let i = 13; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayEssays = essaysLast14Days.filter(e => e.created_at.startsWith(dateStr))
    const count = dayEssays.length
    const prompt_count = dayEssays.filter(e => e.prompt_id !== null && (e.writing_prompts as { status?: string } | null)?.status === 'approved').length
    essaysOverTime.push({ date: dateStr, count, prompt_count })
  }

  const essaysFromPrompts = essaysWithPromptId.filter(e => (e.writing_prompts as { status?: string } | null)?.status === 'approved').length
  const essaysFromExternal = totalEssays - essaysFromPrompts

  // Written essay distribution — bucket users by how many essays they've written
  const writtenEssayDistribution = {
    '0':     allUsers.filter(u => u.essay_count === 0).length,
    '1-3':   allUsers.filter(u => u.essay_count >= 1 && u.essay_count <= 3).length,
    '4-6':   allUsers.filter(u => u.essay_count >= 4 && u.essay_count <= 6).length,
    '7-9':   allUsers.filter(u => u.essay_count >= 7 && u.essay_count <= 9).length,
    '10-12': allUsers.filter(u => u.essay_count >= 10 && u.essay_count <= 12).length,
    '12+':   allUsers.filter(u => u.essay_count > 12).length,
  }

  const avgEssaysPerUser = totalUsers > 0
    ? Math.round((totalEssays / totalUsers) * 10) / 10
    : 0

  return {
    totalUsers,
    ptnkUsers,
    ptnkOnlyUsers,
    paidProUsers,
    freeUsers,
    totalEssays,
    scoreDistribution,
    avgOverallScore: Math.round(avgOverallScore * 10) / 10,
    avgEssaysPerUser,
    writtenEssayDistribution,
    allUsers,
    essaysOverTime,
    totalVocabulary,
    totalQuizAttempts,
    totalCorrectAnswers,
    totalQuestions,
    avgQuizScore: Math.round(avgQuizScore * 10) / 10,
    usersOverTime,
    totalInvitedUsers,
    uniqueReferrers,
    inviteConversionRate: Math.round(inviteConversionRate * 10) / 10,
    totalPrompts,
    promptsWithOutlines,
    essaysFromPrompts,
    essaysFromExternal,
    satisfactionDistribution,
    totalRevenue,
    proRevenue,
    packRevenue,
    apiCostVnd,
    apiCostMonthlyVnd,
    openRouterCostVnd,
    openAICostVnd,
    totalTransactions: completedTransactions.length,
    proSubs: proTransactions.length,
    packPurchases: packTransactions.length,
    pendingPromptsCount,
  }
}
