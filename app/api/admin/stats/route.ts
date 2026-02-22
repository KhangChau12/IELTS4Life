import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic'

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

    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Use service role client for data queries to bypass RLS
    const serviceClient = createServiceRoleClient()

    // Calculate date range for 14 days ago
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    fourteenDaysAgo.setHours(0, 0, 0, 0)
    const fourteenDaysAgoISO = fourteenDaysAgo.toISOString()

    // Fetch statistics - individual queries to maintain type safety
    const countQueries = await Promise.all([
      serviceClient.from('profiles').select('*', { count: 'exact', head: true }),
      serviceClient.from('essays').select('*', { count: 'exact', head: true }),
      serviceClient.from('vocabulary').select('*', { count: 'exact', head: true }),
      serviceClient.from('writing_prompts').select('*', { count: 'exact', head: true }),
      serviceClient.from('writing_prompt_outlines').select('*', { count: 'exact', head: true }),
    ])
    const totalUsers = countQueries[0].count
    const totalEssays = countQueries[1].count
    const totalVocabulary = countQueries[2].count
    const totalPrompts = countQueries[3].count
    const promptsWithOutlines = countQueries[4].count

    const { data: tokenUsage } = await serviceClient.from('token_usage').select('*')
    const { data: allEssaysForScoring } = await serviceClient.from('essays').select('overall_score').order('created_at', { ascending: false })
    const { data: essaysLast14Days } = await serviceClient.from('essays').select('created_at').gte('created_at', fourteenDaysAgoISO).order('created_at', { ascending: true })
    const { data: allUsersWithEssays } = await serviceClient.from('profiles').select(`
      id,
      email,
      created_at,
      role,
      essays:essays(count)
    `).order('created_at', { ascending: false })
    const { data: allUsers } = await serviceClient.from('profiles').select('id, email, created_at').order('created_at', { ascending: true })
    const { data: quizAttempts } = await serviceClient.from('vocabulary_quiz_attempts').select('score, total_questions, vocab_type, created_at')
    const { data: inviteStats } = await serviceClient.from('profiles').select('invited_by')
    const { data: essaysWithPromptId } = await serviceClient.from('essays').select('prompt_id').not('prompt_id', 'is', null)

    // Calculate token statistics
    const totalInputTokens = tokenUsage?.reduce((sum, t) => sum + (t.input_tokens || 0), 0) || 0
    const totalOutputTokens = tokenUsage?.reduce((sum, t) => sum + (t.output_tokens || 0), 0) || 0

    // Calculate score distribution (merge Band 8 & 9)
    const scoreDistribution: { [key: string]: number } = {}
    allEssaysForScoring?.forEach((essay) => {
      if (essay.overall_score) {
        const score = Math.floor(essay.overall_score)
        // Merge Band 8 and 9 together
        const displayScore = score >= 8 ? 8 : score
        scoreDistribution[displayScore] = (scoreDistribution[displayScore] || 0) + 1
      }
    })

    // Calculate average scores
    const validScores = allEssaysForScoring?.filter((e) => e.overall_score !== null) || []
    const avgOverallScore =
      validScores.length > 0
        ? validScores.reduce((sum, e) => sum + (e.overall_score || 0), 0) / validScores.length
        : 0

    // Calculate vocabulary statistics
    const totalCorrectAnswers = quizAttempts?.reduce((sum, q) => sum + (q.score || 0), 0) || 0
    const totalQuestions = quizAttempts?.reduce((sum, q) => sum + (q.total_questions || 0), 0) || 0
    const avgQuizScore = totalQuestions > 0 ? (totalCorrectAnswers / totalQuestions) * 100 : 0

    // Quiz performance by vocab type
    const paraphraseQuizzes = quizAttempts?.filter(q => q.vocab_type === 'paraphrase') || []
    const topicQuizzes = quizAttempts?.filter(q => q.vocab_type === 'topic') || []

    const paraphraseCorrect = paraphraseQuizzes.reduce((sum, q) => sum + (q.score || 0), 0)
    const paraphraseTotal = paraphraseQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0)
    const avgParaphraseScore = paraphraseTotal > 0 ? (paraphraseCorrect / paraphraseTotal) * 100 : 0

    const topicCorrect = topicQuizzes.reduce((sum, q) => sum + (q.score || 0), 0)
    const topicTotal = topicQuizzes.reduce((sum, q) => sum + (q.total_questions || 0), 0)
    const avgTopicScore = topicTotal > 0 ? (topicCorrect / topicTotal) * 100 : 0

    // Quiz attempts over time
    const quizAttemptsOverTime = quizAttempts?.map(q => ({
      score: q.score,
      total_questions: q.total_questions,
      vocab_type: q.vocab_type,
      created_at: q.created_at,
      percentage: q.total_questions > 0 ? (q.score / q.total_questions) * 100 : 0
    })) || []

    // Calculate user tier statistics
    const ptnkUsers = allUsers?.filter(u => u.email?.endsWith('@ptnk.edu.vn')).length || 0
    // Pro users who are NOT PTNK (future paid subscribers)
    const paidProUsers = 0 // Currently we don't have paid subscriptions yet

    // Calculate referral/invite statistics
    const totalInvitedUsers = inviteStats?.filter(p => p.invited_by !== null).length || 0
    const uniqueReferrers = new Set(inviteStats?.filter(p => p.invited_by !== null).map(p => p.invited_by)).size
    const totalUsersCount = totalUsers || 0
    const inviteConversionRate = totalUsersCount > 0 ? (totalInvitedUsers / totalUsersCount) * 100 : 0

    // Format users with essay counts
    const usersWithEssayCounts = allUsersWithEssays?.map(user => ({
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      role: user.role,
      essay_count: Array.isArray(user.essays) ? user.essays[0]?.count || 0 : 0
    })) || []

    // User growth - full history with smart bucketing
    const today = new Date()
    today.setHours(23, 59, 59, 999)
    const userGrowthData: Array<{ date: string; count: number }> = []

    if (allUsers && allUsers.length > 0) {
      const firstUserDate = new Date(allUsers[0].created_at)
      firstUserDate.setHours(0, 0, 0, 0)
      const totalDays = Math.ceil((today.getTime() - firstUserDate.getTime()) / (1000 * 60 * 60 * 24))

      // Smart bucketing: day if <=60, week if <=365, month otherwise
      type BucketMode = 'day' | 'week' | 'month'
      const bucketMode: BucketMode = totalDays <= 60 ? 'day' : totalDays <= 365 ? 'week' : 'month'

      const getBucketKey = (d: Date): string => {
        if (bucketMode === 'day') return d.toISOString().split('T')[0]
        if (bucketMode === 'week') {
          // Start of week (Monday)
          const day = d.getDay()
          const diff = d.getDate() - day + (day === 0 ? -6 : 1)
          const monday = new Date(d)
          monday.setDate(diff)
          return monday.toISOString().split('T')[0]
        }
        // month
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-01`
      }

      // Build cumulative count per bucket - O(n) walk through sorted users
      const bucketCounts = new Map<string, number>()
      let runningCount = 0
      let userIdx = 0

      // Generate all bucket keys from start to today
      const bucketKeys: string[] = []
      const cursor = new Date(firstUserDate)
      while (cursor <= today) {
        const key = getBucketKey(cursor)
        if (!bucketKeys.length || bucketKeys[bucketKeys.length - 1] !== key) {
          bucketKeys.push(key)
        }
        if (bucketMode === 'day') cursor.setDate(cursor.getDate() + 1)
        else if (bucketMode === 'week') cursor.setDate(cursor.getDate() + 7)
        else cursor.setMonth(cursor.getMonth() + 1)
      }
      // Ensure today's bucket is included
      const todayKey = getBucketKey(today)
      if (!bucketKeys.includes(todayKey)) bucketKeys.push(todayKey)

      for (const key of bucketKeys) {
        // Parse bucket end date
        const bucketDate = new Date(key)
        if (bucketMode === 'day') bucketDate.setHours(23, 59, 59, 999)
        else if (bucketMode === 'week') {
          bucketDate.setDate(bucketDate.getDate() + 6)
          bucketDate.setHours(23, 59, 59, 999)
        } else {
          bucketDate.setMonth(bucketDate.getMonth() + 1)
          bucketDate.setDate(0) // last day of month
          bucketDate.setHours(23, 59, 59, 999)
        }

        // Count users up to this bucket's end
        while (userIdx < allUsers.length && new Date(allUsers[userIdx].created_at) <= bucketDate) {
          runningCount++
          userIdx++
        }
        bucketCounts.set(key, runningCount)
      }

      for (const key of bucketKeys) {
        userGrowthData.push({ date: key, count: bucketCounts.get(key) || 0 })
      }
    }

    // Essays over time - last 14 days (CUMULATIVE)
    const essaysGrowthData: Array<{ date: string; count: number }> = []

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      date.setHours(23, 59, 59, 999)
      const dateKey = date.toISOString().split('T')[0]

      const count = essaysLast14Days?.filter(essay => {
        const essayDate = new Date(essay.created_at)
        return essayDate <= date
      }).length || 0

      essaysGrowthData.push({ date: dateKey, count })
    }

    // Prompt statistics
    const essaysFromPrompts = essaysWithPromptId?.length || 0
    const essaysFromExternal = (totalEssays || 0) - essaysFromPrompts

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      ptnkUsers,
      paidProUsers,
      totalEssays: totalEssays || 0,
      totalInputTokens,
      totalOutputTokens,
      scoreDistribution,
      avgOverallScore: Math.round(avgOverallScore * 10) / 10,
      allUsers: usersWithEssayCounts,
      essaysOverTime: essaysGrowthData,
      // Vocabulary stats
      totalVocabulary: totalVocabulary || 0,
      totalQuizAttempts: quizAttempts?.length || 0,
      totalCorrectAnswers,
      totalQuestions,
      avgQuizScore: Math.round(avgQuizScore * 10) / 10,
      avgParaphraseScore: Math.round(avgParaphraseScore * 10) / 10,
      avgTopicScore: Math.round(avgTopicScore * 10) / 10,
      quizAttemptsOverTime,
      usersOverTime: userGrowthData,
      // Referral/Invite stats
      totalInvitedUsers,
      uniqueReferrers,
      inviteConversionRate: Math.round(inviteConversionRate * 10) / 10,
      // Prompt stats
      totalPrompts: totalPrompts || 0,
      promptsWithOutlines: promptsWithOutlines || 0,
      essaysFromPrompts,
      essaysFromExternal,
    })
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}
