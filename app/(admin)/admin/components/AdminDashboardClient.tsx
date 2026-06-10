'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, FileText, RefreshCw, BookOpen, UserPlus, PenTool, DollarSign, BarChart3, MessageSquare } from 'lucide-react'
import { EnhancedUsersTable } from './EnhancedUsersTable'
import { UserDashboardSheet } from './UserDashboardSheet'
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts'
import { format } from 'date-fns'
import type { AdminStats } from '@/types/admin'

interface AdminDashboardClientProps {
  initialStats: AdminStats
}

function formatVND(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M₫`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K₫`
  }
  return `${amount}₫`
}

export function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminStats['allUsers'][number] | null>(null)

  const formatNumber = (num: number): string => num.toLocaleString('en-US')

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      const response = await fetch('/api/admin/stats', { cache: 'no-store' })
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

  const COLORS = {
    primary: '#0891b2',
    secondary: '#0e7490',
    tertiary: '#155e75',
    light: '#67e8f9',
    accent: '#14b8a6',
    accentDark: '#0d9488',
    violet: '#7c3aed',
    green: '#16a34a',
  }

  // Written essay distribution — users bucketed by essay count
  const writtenEssayDistributionData = [
    { range: '0',     users: stats.writtenEssayDistribution['0'] },
    { range: '1–3',   users: stats.writtenEssayDistribution['1-3'] },
    { range: '4–6',   users: stats.writtenEssayDistribution['4-6'] },
    { range: '7–9',   users: stats.writtenEssayDistribution['7-9'] },
    { range: '10–12', users: stats.writtenEssayDistribution['10-12'] },
    { range: '>12',   users: stats.writtenEssayDistribution['12+'] },
  ]

  // User distribution: Free | PTNK (non-paid) | Paid Pro — mutually exclusive
  const userTypeData = [
    { name: 'Free', value: Math.max(0, stats.freeUsers), color: COLORS.light },
    { name: 'PTNK', value: stats.ptnkOnlyUsers, color: COLORS.accent },
    { name: 'Paid Pro', value: stats.paidProUsers, color: COLORS.violet },
  ]

  // Daily essay activity — total essays + essays written from system prompts
  const dailyEssayActivityData = stats.essaysOverTime.map(item => ({
    date: format(new Date(item.date + 'T00:00:00'), 'MMM dd'),
    essays: item.count,
    fromPrompt: item.prompt_count,
  }))

  // User growth over time
  const satisfactionData = [
    { label: 'Terrible',     value: stats.satisfactionDistribution.terrible,    color: '#fca5a5' },
    { label: 'Not for me',   value: stats.satisfactionDistribution.notForMe,    color: '#fdba74' },
    { label: 'Need improve', value: stats.satisfactionDistribution.needImprove, color: '#86efac' },
    { label: 'All good',     value: stats.satisfactionDistribution.allGood,     color: '#93c5fd' },
  ]

  return (
    <div className="space-y-6">
      {/* Hero Overview */}
      <Card className="overflow-hidden border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-600 to-cyan-600 text-white relative">
        <CardContent className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="space-y-3">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Dashboard Overview</h1>
                <p className="text-sm md:text-base text-white/80 leading-relaxed max-w-xl">
                  Platform health, user growth, writing activity, and revenue at a glance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  Updated: {format(lastUpdate, 'MMM dd, yyyy HH:mm:ss')}
                </span>
              </div>
            </div>

            <Button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="self-start bg-white text-ocean-700 hover:bg-ocean-50 shadow-lg font-semibold"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh data
            </Button>
          </div>

          {/* 4 KPI cards */}
          <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {/* Total Users */}
            <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm overflow-hidden">
              <Users className="absolute right-2 top-2 h-20 w-20 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-[0.18em] text-white/70">Total Users</span>
                <div className="text-3xl md:text-4xl font-bold leading-none mt-3">{formatNumber(stats.totalUsers)}</div>
                <p className="mt-3 text-xs text-white/70">
                  <span className="font-semibold text-white">{stats.paidProUsers}</span> paid Pro ·{' '}
                  <span className="font-semibold text-white">{stats.ptnkUsers}</span> PTNK
                </p>
              </div>
            </div>

            {/* Total Essays */}
            <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm overflow-hidden">
              <FileText className="absolute right-2 top-2 h-20 w-20 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-[0.18em] text-white/70">Total Essays</span>
                <div className="text-3xl md:text-4xl font-bold leading-none mt-3">{formatNumber(stats.totalEssays)}</div>
                <p className="mt-3 text-xs text-white/70">
                  <span className="font-semibold text-white">{formatNumber(stats.essaysFromPrompts)}</span> from prompts ·{' '}
                  <span className="font-semibold text-white">{formatNumber(stats.totalEssays - stats.essaysFromPrompts)}</span> external
                </p>
              </div>
            </div>

            {/* Revenue */}
            <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm overflow-hidden">
              <DollarSign className="absolute right-2 top-2 h-20 w-20 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-[0.18em] text-white/70">Revenue</span>
                <div className="text-3xl md:text-4xl font-bold leading-none mt-3">{formatVND(stats.totalRevenue)}</div>
                <p className="mt-3 text-xs text-white/70">
                  <span className="font-semibold text-white">{stats.totalTransactions}</span> completed transactions
                </p>
              </div>
            </div>

            {/* Avg Essays per User */}
            <div className="relative rounded-2xl border border-white/10 bg-white/10 backdrop-blur-sm p-4 shadow-sm overflow-hidden">
              <PenTool className="absolute right-2 top-2 h-20 w-20 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
              <div className="relative z-10">
                <span className="text-xs uppercase tracking-[0.18em] text-white/70">Avg Essays / User</span>
                <div className="text-3xl md:text-4xl font-bold leading-none mt-3">{stats.avgEssaysPerUser.toFixed(1)}</div>
                <p className="mt-3 text-xs text-white/70">
                  <span className="font-semibold text-white">{stats.totalPrompts}</span> prompts ·{' '}
                  <span className="font-semibold text-white">{stats.promptsWithOutlines}</span> with outlines
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Charts — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Distribution Donut */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <Users className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50/60 relative z-10">
            <CardTitle className="text-lg text-ocean-900">User Distribution</CardTitle>
            <CardDescription className="text-ocean-600">By account type (mutually exclusive)</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
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
                  formatter={(value: number) => formatNumber(value)}
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4 justify-center text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.light }} />
                <span className="text-ocean-700">Free: <strong>{Math.max(0, stats.freeUsers)}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.accent }} />
                <span className="text-ocean-700">PTNK: <strong>{stats.ptnkOnlyUsers}</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS.violet }} />
                <span className="text-ocean-700">Paid Pro: <strong>{stats.paidProUsers}</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Written Essay Distribution */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <BarChart3 className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-teal-50/60 relative z-10">
            <CardTitle className="text-lg text-ocean-900">Written Essay Distribution</CardTitle>
            <CardDescription className="text-ocean-600">Users by number of essays written</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={writtenEssayDistributionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis
                  dataKey="range"
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
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  cursor={{ fill: '#f1f5f9' }}
                  formatter={(value: number) => [formatNumber(value), 'Users']}
                />
                <Bar dataKey="users" radius={[8, 8, 0, 0]} name="Users">
                  {writtenEssayDistributionData.map((_, index) => {
                    const barColors = ['#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']
                    return <Cell key={`cell-${index}`} fill={barColors[index]} />
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Activity Charts — side by side on large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Essay Activity */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <FileText className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50/60 relative z-10">
            <CardTitle className="text-lg text-ocean-900">Daily Essay Activity</CardTitle>
            <CardDescription className="text-ocean-600">New essays submitted per day (last 14 days)</CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="flex items-center gap-4 mb-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded-full" style={{ background: COLORS.primary }} />
                Total essays
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-6 rounded-full" style={{ background: COLORS.accent }} />
                From system prompts
              </span>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={dailyEssayActivityData}>
                <defs>
                  <linearGradient id="colorEssays" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorFromPrompt" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.accent} stopOpacity={0.35} />
                    <stop offset="95%" stopColor={COLORS.accent} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  formatter={(value: number, name: string) => [
                    value,
                    name === 'essays' ? 'Total Essays' : 'From Prompts',
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey="essays"
                  stroke={COLORS.primary}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorEssays)"
                  name="essays"
                />
                <Area
                  type="monotone"
                  dataKey="fromPrompt"
                  stroke={COLORS.accent}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFromPrompt)"
                  name="fromPrompt"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Feedback — Rating Distribution */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <MessageSquare className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-violet-50/60 relative z-10">
            <CardTitle className="text-lg text-ocean-900">User Feedback</CardTitle>
            <CardDescription className="text-ocean-600">
              Satisfaction ratings — {formatNumber(stats.satisfactionDistribution.totalRated)} user{stats.satisfactionDistribution.totalRated !== 1 ? 's' : ''} rated
            </CardDescription>
          </CardHeader>
          <CardContent className="relative z-10">
            {stats.satisfactionDistribution.totalRated === 0 ? (
              <div className="flex items-center justify-center h-[260px] text-ocean-400 text-sm">
                No ratings yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={satisfactionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="label" stroke="#64748b" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                    formatter={(value: number) => [formatNumber(value), 'Users']}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]} name="Users">
                    {satisfactionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Revenue */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <DollarSign className="absolute right-2 top-2 h-48 w-48 text-green-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(34,197,94,0.3))]" />
          <CardHeader className="border-b border-ocean-100 pb-3 bg-gradient-to-r from-ocean-50 to-green-50/60 relative z-10">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-700" />
              <CardTitle className="text-sm font-medium text-ocean-900">Revenue</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Pro subs</span>
              <span className="text-base font-semibold text-green-700">
                {formatVND(stats.proRevenue)}
                <span className="text-xs font-normal text-ocean-400 ml-1">({stats.proSubs})</span>
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Essay packs</span>
              <span className="text-base font-semibold text-teal-700">
                {formatVND(stats.packRevenue)}
                <span className="text-xs font-normal text-ocean-400 ml-1">({stats.packPurchases})</span>
              </span>
            </div>
            <div className="flex justify-between items-center border-t border-ocean-100 pt-3 mt-1">
              <span className="text-sm text-ocean-600">Total</span>
              <span className="text-lg font-bold text-green-800">{formatVND(stats.totalRevenue)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Transactions</span>
              <span className="text-base font-semibold text-ocean-700">{stats.totalTransactions}</span>
            </div>
          </CardContent>
        </Card>

        {/* Vocabulary & Quiz */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <BookOpen className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 pb-3 bg-gradient-to-r from-ocean-50 to-cyan-50/60 relative z-10">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-ocean-700" />
              <CardTitle className="text-sm font-medium text-ocean-900">Vocabulary & Quiz</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Total Words</span>
              <span className="text-lg font-bold text-ocean-800">{formatNumber(stats.totalVocabulary)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Quiz Attempts</span>
              <span className="text-lg font-bold text-ocean-700">{formatNumber(stats.totalQuizAttempts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Avg Quiz Score</span>
              <span className="text-lg font-bold text-teal-700">{stats.avgQuizScore}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Correct / Total</span>
              <span className="text-base font-semibold text-teal-800">
                {formatNumber(stats.totalCorrectAnswers)}/{formatNumber(stats.totalQuestions)}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Writing Prompts */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <PenTool className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 pb-3 bg-gradient-to-r from-ocean-50 to-violet-50/60 relative z-10">
            <div className="flex items-center gap-2">
              <PenTool className="h-5 w-5 text-ocean-600" />
              <CardTitle className="text-sm font-medium text-ocean-900">Writing Prompts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Total Prompts</span>
              <span className="text-lg font-bold text-teal-700">{formatNumber(stats.totalPrompts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">With Outlines</span>
              <span className="text-lg font-bold text-ocean-700">{formatNumber(stats.promptsWithOutlines)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Essays via Prompt</span>
              <span className="text-lg font-bold text-teal-800">{formatNumber(stats.essaysFromPrompts)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Prompt Usage</span>
              <span className="text-lg font-bold text-ocean-700">
                {stats.totalEssays > 0
                  ? `${((stats.essaysFromPrompts / stats.totalEssays) * 100).toFixed(0)}%`
                  : '—'}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Referral Program */}
        <Card className="overflow-hidden border-ocean-200 shadow-lg transition-shadow hover:shadow-xl relative">
          <UserPlus className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 pb-3 bg-gradient-to-r from-ocean-50 to-cyan-50/60 relative z-10">
            <div className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-ocean-600" />
              <CardTitle className="text-sm font-medium text-ocean-900">Referral Program</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-4 relative z-10">
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Total Invited</span>
              <span className="text-lg font-bold text-ocean-700">{formatNumber(stats.totalInvitedUsers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Active Referrers</span>
              <span className="text-lg font-bold text-teal-700">{formatNumber(stats.uniqueReferrers)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-ocean-600">Conversion Rate</span>
              <span className="text-lg font-bold text-ocean-800">{stats.inviteConversionRate.toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <EnhancedUsersTable
        users={stats.allUsers}
        onUserClick={(user) => setSelectedUser(user)}
      />

      {/* User Dashboard Sheet */}
      <UserDashboardSheet
        user={selectedUser}
        onClose={() => setSelectedUser(null)}
      />
    </div>
  )
}
