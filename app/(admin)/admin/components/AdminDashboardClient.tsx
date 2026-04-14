'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, FileText, Zap, RefreshCw, BookOpen, Award, Brain, UserPlus, TrendingUp as TrendingUpIcon, Target, PenTool } from 'lucide-react'
import { EnhancedUsersTable } from './EnhancedUsersTable'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { format } from 'date-fns'

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
  // Vocabulary stats
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
  // Referral stats
  totalInvitedUsers: number
  uniqueReferrers: number
  inviteConversionRate: number
  // Prompt stats
  totalPrompts: number
  promptsWithOutlines: number
  essaysFromPrompts: number
  essaysFromExternal: number
}

interface AdminDashboardClientProps {
  initialStats: AdminStats
}

export function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US')
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats', {
        cache: 'no-store',
      })
      if (response.ok) {
        const newStats = await response.json()
        setStats(newStats)
        setLastUpdate(new Date())
      }
    } catch (error) {
      console.error('Error refreshing stats:', error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Unified color palette - Ocean/Teal theme
  const COLORS = {
    primary: '#0891b2',      // cyan-600
    secondary: '#0e7490',    // cyan-700
    tertiary: '#155e75',     // cyan-800
    light: '#67e8f9',        // cyan-300
    lighter: '#a5f3fc',      // cyan-200
    accent: '#14b8a6',       // teal-500
    accentDark: '#0d9488',   // teal-600
  }

  // Prepare daily essay activity data (NEW essays per day)
  const dailyEssayActivityData = stats.essaysOverTime
    .slice(-14)
    .map((item, index, arr) => {
      const newEssays = index === 0 ? item.count : item.count - arr[index - 1].count
      return {
        date: format(new Date(item.date), 'MMM dd'),
        essays: newEssays
      }
    })

  // Prepare score distribution data
  const scoreDistributionData = [
    { band: 'Band 5', count: stats.scoreDistribution[5] || 0 },
    { band: 'Band 6', count: stats.scoreDistribution[6] || 0 },
    { band: 'Band 7', count: stats.scoreDistribution[7] || 0 },
    { band: 'Band 8-9', count: (stats.scoreDistribution[8] || 0) + (stats.scoreDistribution[9] || 0) },
  ]

  // User type distribution for donut chart
  const userTypeData = [
    { name: 'Free Users', value: stats.totalUsers - stats.ptnkUsers - stats.paidProUsers, color: COLORS.light },
    { name: 'PTNK Students', value: stats.ptnkUsers, color: COLORS.accent },
    { name: 'Paid Pro', value: stats.paidProUsers, color: COLORS.secondary },
  ]

  // User growth over time — detect bucket size for formatting
  const userGrowthSpanDays = stats.usersOverTime.length > 1
    ? Math.ceil((new Date(stats.usersOverTime[stats.usersOverTime.length - 1].date).getTime() - new Date(stats.usersOverTime[0].date).getTime()) / (1000 * 60 * 60 * 24))
    : 0
  const userGrowthBucket = userGrowthSpanDays <= 60 ? 'day' : userGrowthSpanDays <= 365 ? 'week' : 'month'
  const userGrowthDateFormat = userGrowthBucket === 'month' ? 'MMM yyyy' : 'MMM dd'
  const userGrowthLabel = userGrowthBucket === 'day'
    ? `Last ${stats.usersOverTime.length} days`
    : userGrowthBucket === 'week'
      ? `${Math.ceil(stats.usersOverTime.length)} weeks`
      : `${stats.usersOverTime.length} months`

  const userGrowthData = stats.usersOverTime.map(item => ({
    date: format(new Date(item.date), userGrowthDateFormat),
    users: item.count
  }))

  // Quiz performance over time
  const quizPerformanceData = stats.quizAttemptsOverTime
    ?.reduce((acc: any[], quiz) => {
      const date = format(new Date(quiz.created_at), 'MMM dd')
      const existing = acc.find((item) => item.date === date)
      if (existing) {
        existing.attempts += 1
        existing.totalPercentage += quiz.percentage
        existing.avgScore = existing.totalPercentage / existing.attempts
      } else {
        acc.push({
          date,
          attempts: 1,
          totalPercentage: quiz.percentage,
          avgScore: quiz.percentage,
        })
      }
      return acc
    }, [])
    .slice(-14) || []

  return (
    <div className="space-y-6">
      {/* Hero Overview */}
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-cyan-950 to-slate-900 text-white shadow-2xl">
        <CardContent className="relative p-6 md:p-8">
          <div className="absolute inset-0 opacity-25">
            <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-32 w-32 rounded-full bg-teal-400 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Zap className="h-3.5 w-3.5 text-cyan-300" />
                Admin / Dev Dashboard
              </div>
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
                  Dashboard Overview
                </h1>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-xl">
                  A cleaner look at platform health, user growth, writing activity, and prompt coverage.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-100">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  Updated: {format(lastUpdate, 'MMM dd, yyyy HH:mm:ss')}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  {formatNumber(stats.totalUsers)} users
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  {formatNumber(stats.totalEssays)} essays
                </span>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="self-start bg-white text-slate-950 hover:bg-slate-100 shadow-lg"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh data
            </Button>
          </div>

          <div className="relative mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-200">Total Users</span>
                <div className="rounded-xl bg-cyan-400/15 p-2 text-cyan-200">
                  <Users className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold leading-none">{formatNumber(stats.totalUsers)}</div>
              <p className="mt-3 text-xs text-slate-200">
                <span className="font-semibold text-white">{stats.totalInvitedUsers}</span> via referrals ·
                <span className="font-semibold text-white"> {stats.ptnkUsers}</span> PTNK
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-200">Total Essays</span>
                <div className="rounded-xl bg-teal-400/15 p-2 text-teal-200">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold leading-none">{formatNumber(stats.totalEssays)}</div>
              <p className="mt-3 text-xs text-slate-200">
                Avg score <span className="font-semibold text-white">{stats.avgOverallScore.toFixed(1)}</span> ·
                <span className="font-semibold text-white"> {formatNumber(stats.essaysFromPrompts)}</span> from prompts
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-200">Avg Quiz</span>
                <div className="rounded-xl bg-amber-400/15 p-2 text-amber-200">
                  <Award className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold leading-none">{stats.avgQuizScore}%</div>
              <p className="mt-3 text-xs text-slate-200">
                <span className="font-semibold text-white">{formatNumber(stats.totalQuizAttempts)}</span> quiz attempts
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm">
              <div className="flex items-center justify-between gap-3 mb-3">
                <span className="text-xs uppercase tracking-[0.18em] text-slate-200">Prompt Coverage</span>
                <div className="rounded-xl bg-violet-400/15 p-2 text-violet-200">
                  <Target className="h-4 w-4" />
                </div>
              </div>
              <div className="text-3xl md:text-4xl font-bold leading-none">{formatNumber(stats.totalPrompts)}</div>
              <p className="mt-3 text-xs text-slate-200">
                <span className="font-semibold text-white">{stats.promptsWithOutlines}</span> with outlines
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Donut Chart */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/60">
            <CardTitle className="text-lg text-slate-900">User Distribution</CardTitle>
            <CardDescription>By account type</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={userTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: any) => formatNumber(value)}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.light }}></div>
                <span className="text-slate-600">Free: <strong>{userTypeData[0].value}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.accent }}></div>
                <span className="text-slate-600">PTNK: <strong>{userTypeData[1].value}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.secondary }}></div>
                <span className="text-slate-600">Pro: <strong>{userTypeData[2].value}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Score Distribution Bar Chart */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-teal-50/60">
            <CardTitle className="text-lg text-slate-900">Score Distribution</CardTitle>
            <CardDescription>Essays by IELTS band</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={scoreDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="band"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  cursor={{ fill: '#f1f5f9' }}
                />
                <Bar
                  dataKey="count"
                  fill={COLORS.primary}
                  radius={[8, 8, 0, 0]}
                  name="Essays"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        {/* Daily Essay Activity */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-cyan-50/60">
            <CardTitle className="text-lg text-slate-900">Daily Essay Activity</CardTitle>
            <CardDescription>New essays submitted per day (Last 14 days)</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={dailyEssayActivityData}>
                <defs>
                  <linearGradient id="colorEssays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="essays"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEssays)"
                  name="New Essays"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-violet-50/60">
            <CardTitle className="text-lg text-slate-900">User Growth</CardTitle>
            <CardDescription>Total registered users ({userGrowthLabel})</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={userGrowthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#64748b"
                  style={{ fontSize: '12px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                  }}
                  formatter={(value: any) => formatNumber(value)}
                />
                <Line
                  type="monotone"
                  dataKey="users"
                  stroke={COLORS.accent}
                  strokeWidth={3}
                  dot={{ fill: COLORS.accent, r: 4 }}
                  activeDot={{ r: 6 }}
                  name="Total Users"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics - 5 cards in responsive grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Vocabulary & Quiz Stats */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-3 bg-gradient-to-r from-slate-50 to-cyan-50/60">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-700" />
              <CardTitle className="text-sm font-medium text-slate-900">Vocabulary & Quiz</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Words</span>
              <span className="text-lg font-bold text-cyan-800">{formatNumber(stats.totalVocabulary)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Quiz Attempts</span>
              <span className="text-lg font-bold text-cyan-700">{formatNumber(stats.totalQuizAttempts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Avg Quiz Score</span>
              <span className="text-lg font-bold text-teal-700">{stats.avgQuizScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Correct Answers</span>
              <span className="text-lg font-bold text-teal-800">{formatNumber(stats.totalCorrectAnswers)} / {formatNumber(stats.totalQuestions)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Quiz Breakdown */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-3 bg-gradient-to-r from-slate-50 to-teal-50/60">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-sm font-medium text-slate-900">Quiz Breakdown</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Paraphrase Score</span>
              <span className="text-lg font-bold text-cyan-700">{stats.avgParaphraseScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Topic Score</span>
              <span className="text-lg font-bold text-teal-700">{stats.avgTopicScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Overall Avg</span>
              <span className="text-lg font-bold text-cyan-800">{stats.avgQuizScore}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Prompt Stats */}
        <Card className="overflow-hidden border-slate-200/70 bg-white/90 shadow-sm transition-shadow hover:shadow-xl">
          <CardHeader className="border-b border-slate-100 pb-3 bg-gradient-to-r from-slate-50 to-violet-50/60">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-sm font-medium text-slate-900">Writing Prompts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Prompts</span>
              <span className="text-lg font-bold text-teal-700">{formatNumber(stats.totalPrompts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">With Outlines</span>
              <span className="text-lg font-bold text-cyan-700">{formatNumber(stats.promptsWithOutlines)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Essays (Prompt)</span>
              <span className="text-lg font-bold text-teal-800">{formatNumber(stats.essaysFromPrompts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Essays (External)</span>
              <span className="text-lg font-bold text-slate-600">{formatNumber(stats.essaysFromExternal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Referral Stats */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-sm font-medium text-slate-700">Referral Program</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total Invited</span>
              <span className="text-lg font-bold text-cyan-700">{formatNumber(stats.totalInvitedUsers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Active Referrers</span>
              <span className="text-lg font-bold text-teal-700">{formatNumber(stats.uniqueReferrers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Conversion Rate</span>
              <span className="text-lg font-bold text-cyan-800">{stats.inviteConversionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>

        {/* Token Usage */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-sm font-medium text-slate-700">Token Usage</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Input Tokens</span>
              <span className="text-lg font-bold text-teal-700">{formatNumber(stats.totalInputTokens)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Output Tokens</span>
              <span className="text-lg font-bold text-cyan-700">{formatNumber(stats.totalOutputTokens)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-600">Total</span>
              <span className="text-lg font-bold text-cyan-800">{formatNumber(stats.totalInputTokens + stats.totalOutputTokens)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <EnhancedUsersTable users={stats.allUsers} />
    </div>
  )
}
