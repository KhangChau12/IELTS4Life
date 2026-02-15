import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AdminDashboardClient } from '../components/AdminDashboardClient'

interface AdminStats {
  totalUsers: number
  ptnkUsers: number
  paidProUsers: number
  totalEssays: number
  totalInputTokens: number
  totalOutputTokens: number
  scoreDistribution: { [key: string]: number }
  avgOverallScore: number
  allUsers: Array<{
    id: string
    email: string
    created_at: string
    role: string
    essay_count: number
  }>
  essaysOverTime: Array<{
    date: string
    count: number
  }>
  totalVocabulary: number
  totalQuizAttempts: number
  totalCorrectAnswers: number
  totalQuestions: number
  avgQuizScore: number
  avgParaphraseScore: number
  avgTopicScore: number
  quizAttemptsOverTime: Array<{
    score: number
    total_questions: number
    vocab_type: string
    created_at: string
    percentage: number
  }>
  usersOverTime: Array<{
    date: string
    count: number
  }>
  totalInvitedUsers: number
  uniqueReferrers: number
  inviteConversionRate: number
}

async function getAdminStats(): Promise<AdminStats> {
  try {
    let baseUrl: string

    if (process.env.VERCEL_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`
    } else if (process.env.NODE_ENV === 'development') {
      baseUrl = 'http://localhost:3001'
    } else {
      baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://ielts4life.com'
    }

    const response = await fetch(`${baseUrl}/api/admin/stats`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch admin stats')
    }

    return response.json()
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return {
      totalUsers: 0,
      ptnkUsers: 0,
      paidProUsers: 0,
      totalEssays: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      scoreDistribution: {},
      avgOverallScore: 0,
      allUsers: [],
      essaysOverTime: [],
      totalVocabulary: 0,
      totalQuizAttempts: 0,
      totalCorrectAnswers: 0,
      totalQuestions: 0,
      avgQuizScore: 0,
      avgParaphraseScore: 0,
      avgTopicScore: 0,
      quizAttemptsOverTime: [],
      usersOverTime: [],
      totalInvitedUsers: 0,
      uniqueReferrers: 0,
      inviteConversionRate: 0,
    }
  }
}

export default async function StatisticsPage() {
  const stats = await getAdminStats()

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6 md:mb-8 animate-fadeInUp">
        <Link
          href="/admin"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 border border-ocean-200 text-ocean-600 hover:text-ocean-800 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent">
            Platform Statistics
          </h1>
          <p className="text-ocean-600 text-sm md:text-base lg:text-lg">
            Monitor system statistics and user activity
          </p>
        </div>
      </div>

      <AdminDashboardClient initialStats={stats} />
    </div>
  )
}
