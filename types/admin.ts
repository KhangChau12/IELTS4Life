export interface AdminStats {
  totalUsers: number
  ptnkUsers: number
  ptnkOnlyUsers: number
  paidProUsers: number
  freeUsers: number
  totalEssays: number
  scoreDistribution: { [key: string]: number }
  avgOverallScore: number
  allUsers: Array<{
    id: string
    email: string
    created_at: string
    role: string
    essay_count: number
  }>
  essaysOverTime: Array<{ date: string; count: number }>
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
  essaysFromPrompts: number
  essaysFromExternal: number
  totalRevenue: number
  proRevenue: number
  packRevenue: number
  totalTransactions: number
  proSubs: number
  packPurchases: number
}
