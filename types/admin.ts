export interface AdminStats {
  totalUsers: number
  ptnkUsers: number
  ptnkOnlyUsers: number
  paidProUsers: number
  freeUsers: number
  totalEssays: number
  scoreDistribution: { [key: string]: number }
  avgOverallScore: number
  avgEssaysPerUser: number
  writtenEssayDistribution: {
    '0': number
    '1-3': number
    '4-6': number
    '7-9': number
    '10-12': number
    '12+': number
  }
  allUsers: Array<{
    id: string
    email: string
    full_name: string | null
    created_at: string
    role: string
    essay_count: number
    quiz_total_attempts: number
  }>
  essaysOverTime: Array<{ date: string; count: number; prompt_count: number }>
  totalVocabulary: number
  totalQuizAttempts: number
  totalCorrectAnswers: number
  totalQuestions: number
  avgQuizScore: number
  usersOverTime: Array<{ date: string; count: number }>
  totalInvitedUsers: number
  uniqueReferrers: number
  inviteConversionRate: number
  totalPrompts: number
  promptsWithOutlines: number
  pendingPromptsCount: number
  essaysFromPrompts: number
  essaysFromExternal: number
  satisfactionDistribution: {
    terrible: number
    notForMe: number
    needImprove: number
    allGood: number
    totalRated: number
  }
  totalRevenue: number
  proRevenue: number
  packRevenue: number
  totalTransactions: number
  proSubs: number
  packPurchases: number
}
