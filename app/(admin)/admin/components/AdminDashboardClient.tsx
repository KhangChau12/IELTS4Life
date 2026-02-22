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
      {/* Header with Refresh Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-700 to-teal-600 bg-clip-text text-transparent">
            Dashboard Overview
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Last updated: {format(lastUpdate, 'MMM dd, yyyy HH:mm:ss')}
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* KPI Summary Cards - Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Total Users */}
        <Card className="border-l-4 border-l-cyan-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Users</CardTitle>
              <Users className="h-5 w-5 text-cyan-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-cyan-700">{formatNumber(stats.totalUsers)}</div>
            <p className="text-sm text-slate-500 mt-2">
              <span className="text-teal-600 font-semibold">{stats.totalInvitedUsers}</span> via referrals
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-cyan-600 font-semibold">{stats.ptnkUsers}</span> PTNK students
            </p>
          </CardContent>
        </Card>

        {/* Total Essays */}
        <Card className="border-l-4 border-l-teal-500 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-slate-600">Total Essays</CardTitle>
              <FileText className="h-5 w-5 text-teal-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-teal-700">{formatNumber(stats.totalEssays)}</div>
            <p className="text-sm text-slate-500 mt-2">
              Avg score: <span className="text-teal-600 font-semibold">{stats.avgOverallScore.toFixed(1)}</span>
              <span className="mx-2 text-slate-300">|</span>
              <span className="text-teal-700 font-semibold">{formatNumber(stats.essaysFromPrompts)}</span> from prompts
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts - 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Donut Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">User Distribution</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Score Distribution</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">Daily Essay Activity</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg text-slate-800">User Growth</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-cyan-700" />
              <CardTitle className="text-sm font-medium text-slate-700">Vocabulary & Quiz</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-cyan-600" />
              <CardTitle className="text-sm font-medium text-slate-700">Quiz Breakdown</CardTitle>
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
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-sm font-medium text-slate-700">Writing Prompts</CardTitle>
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
