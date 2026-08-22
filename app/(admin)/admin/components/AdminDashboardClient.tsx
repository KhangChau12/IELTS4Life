'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { RefreshCw, Search, AlertTriangle, ThumbsDown, ChevronLeft, ChevronRight, Eye } from 'lucide-react'
import { UserDashboardSheet } from './UserDashboardSheet'
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

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

/** Flat metric cell for the dark status strip — no inner box, divider-separated. */
function MetricCell({
  label,
  value,
  hint,
  last = false,
}: {
  label: string
  value: string
  hint?: string
  last?: boolean
}) {
  return (
    <div
      className={`relative flex flex-col gap-1.5 px-5 ${!last ? 'border-r border-white/10' : ''}`}
    >
      <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">{label}</span>
      <span className="text-[28px] font-extrabold leading-none text-white tabular-nums">{value}</span>
      {hint && <span className="text-[11px] text-white/50">{hint}</span>}
    </div>
  )
}

export function AdminDashboardClient({ initialStats }: AdminDashboardClientProps) {
  const [stats, setStats] = useState<AdminStats>(initialStats)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedUser, setSelectedUser] = useState<AdminStats['allUsers'][number] | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

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

  const filteredUsers = useMemo(() => {
    const term = searchTerm.toLowerCase()
    return stats.allUsers.filter(
      (u) => u.email.toLowerCase().includes(term) || (u.full_name ?? '').toLowerCase().includes(term)
    )
  }, [stats.allUsers, searchTerm])

  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const negativeRatings = stats.satisfactionDistribution.terrible + stats.satisfactionDistribution.notForMe
  const negativeRatingPct =
    stats.satisfactionDistribution.totalRated > 0
      ? Math.round((negativeRatings / stats.satisfactionDistribution.totalRated) * 100)
      : 0

  // Written essay distribution — bar heights normalized against the largest bucket
  const distBuckets = [
    { label: '0', value: stats.writtenEssayDistribution['0'] },
    { label: '1–3', value: stats.writtenEssayDistribution['1-3'] },
    { label: '4–6', value: stats.writtenEssayDistribution['4-6'] },
    { label: '7–9', value: stats.writtenEssayDistribution['7-9'] },
    { label: '10–12', value: stats.writtenEssayDistribution['10-12'] },
    { label: '12+', value: stats.writtenEssayDistribution['12+'] },
  ]
  const maxBucket = Math.max(1, ...distBuckets.map((b) => b.value))
  const barColors = ['#e0f2fe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8']

  // Essay activity — last 14 days, area sparkline
  const activityMax = Math.max(1, ...stats.essaysOverTime.map((d) => d.count))
  const activityPoints = stats.essaysOverTime.map((d, i) => {
    const x = (i / Math.max(1, stats.essaysOverTime.length - 1)) * 560
    const y = 150 - (d.count / activityMax) * 140
    return { x, y }
  })
  const promptPoints = stats.essaysOverTime.map((d, i) => {
    const x = (i / Math.max(1, stats.essaysOverTime.length - 1)) * 560
    const y = 150 - (d.prompt_count / activityMax) * 140
    return { x, y }
  })
  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')
  const activityAreaPath = `${toPath(activityPoints)} L${activityPoints[activityPoints.length - 1]?.x ?? 0},190 L0,190 Z`

  // User mix donut geometry
  const donutTotal = Math.max(1, stats.freeUsers + stats.ptnkOnlyUsers + stats.paidProUsers)
  const CIRC = 2 * Math.PI * 44
  const freeFrac = Math.max(0, stats.freeUsers) / donutTotal
  const ptnkFrac = stats.ptnkOnlyUsers / donutTotal
  const proFrac = stats.paidProUsers / donutTotal
  const ptnkOffset = freeFrac * CIRC
  const proOffset = (freeFrac + ptnkFrac) * CIRC

  return (
    <div className="space-y-5">
      {/* ============ TOP BAR ============ */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-extrabold text-ocean-900 tracking-tight">Statistics</h1>
            <span className="rounded-[5px] bg-cyan-50 px-2 py-0.5 text-[11px] font-bold text-cyan-700">LIVE</span>
          </div>
          <p className="text-xs text-slate-500">Updated {format(lastUpdate, 'MMM d, yyyy · h:mm a')}</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={isRefreshing}
          variant="outline"
          className="gap-2 border-ocean-200 text-ocean-700 shadow-sm hover:bg-ocean-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* ============ METRICS STRIP ============ */}
      <div className="relative overflow-hidden rounded-2xl bg-ocean-900 px-2 py-5">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/[0.08] blur-2xl" />
        <div className="pointer-events-none absolute bottom-[-80px] left-[20%] h-44 w-44 rounded-full bg-cyan-300/10 blur-2xl" />

        <div className="relative z-10 grid grid-cols-2 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
          <MetricCell
            label="Total Users"
            value={formatNumber(stats.totalUsers)}
            hint={`${stats.paidProUsers} paid Pro · ${stats.ptnkUsers} PTNK`}
          />
          <MetricCell
            label="Total Essays"
            value={formatNumber(stats.totalEssays)}
            hint={`${stats.totalEssays > 0 ? Math.round((stats.essaysFromPrompts / stats.totalEssays) * 100) : 0}% from /write`}
          />
          <MetricCell
            label="Revenue"
            value={formatVND(stats.totalRevenue)}
            hint={`${stats.totalTransactions} transactions`}
          />
          <MetricCell
            label="Avg Essays / User"
            value={stats.avgEssaysPerUser.toFixed(1)}
            hint={`${stats.totalPrompts} prompts live`}
          />
          <MetricCell
            label="Avg Band Score"
            value={stats.avgOverallScore > 0 ? stats.avgOverallScore.toFixed(1) : '—'}
            hint="across all scored essays"
          />
          <MetricCell
            label="Satisfaction"
            value={
              stats.satisfactionDistribution.totalRated > 0
                ? `${Math.round(
                    ((stats.satisfactionDistribution.needImprove + stats.satisfactionDistribution.allGood) /
                      stats.satisfactionDistribution.totalRated) *
                      100
                  )}%`
                : '—'
            }
            hint={`positive · ${stats.satisfactionDistribution.totalRated} rated`}
            last
          />
        </div>
      </div>

      {/* ============ NEEDS ATTENTION ============ */}
      {(stats.pendingPromptsCount > 0 || (stats.satisfactionDistribution.totalRated >= 5 && negativeRatingPct >= 15)) && (
        <div className="flex flex-col gap-3 sm:flex-row">
          {stats.pendingPromptsCount > 0 && (
            <Link
              href="/admin/prompts/review"
              className="flex flex-1 items-center gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 transition-colors hover:bg-amber-100"
            >
              <AlertTriangle className="h-[18px] w-[18px] shrink-0 text-amber-700" />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-amber-900">
                  {stats.pendingPromptsCount} prompt{stats.pendingPromptsCount !== 1 ? 's' : ''} awaiting review
                </span>
                <span className="ml-1.5 text-xs text-amber-700">submitted by users, pending approval</span>
              </div>
              <span className="whitespace-nowrap text-xs font-bold text-amber-900">Review →</span>
            </Link>
          )}
          {stats.satisfactionDistribution.totalRated >= 5 && negativeRatingPct >= 15 && (
            <div className="flex flex-1 items-center gap-3 rounded-[10px] border border-red-200 bg-red-50 px-4 py-3">
              <ThumbsDown className="h-[18px] w-[18px] shrink-0 text-red-700" />
              <div className="flex-1">
                <span className="text-[13px] font-bold text-red-900">{negativeRatingPct}% rated "Terrible" or "Not for me"</span>
                <span className="ml-1.5 text-xs text-red-700">of {stats.satisfactionDistribution.totalRated} responses</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ============ PRIMARY ROW — activity trend (2/3) + revenue (1/3) ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm xl:col-span-2">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Essay Activity</h3>
              <p className="text-xs text-slate-400">Daily submissions, last 14 days</p>
            </div>
            <div className="flex gap-3.5 text-[11.5px] font-semibold text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-cyan-600" />
                Total
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-sm bg-indigo-300" />
                From prompts
              </span>
            </div>
          </div>
          {stats.essaysOverTime.length > 0 ? (
            <>
              <svg viewBox="0 0 560 190" className="h-[190px] w-full overflow-visible">
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0891b2" stopOpacity="0.22" />
                    <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <line x1="0" y1="10" x2="560" y2="10" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="60" x2="560" y2="60" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="110" x2="560" y2="110" stroke="#f1f5f9" strokeWidth="1" />
                <line x1="0" y1="160" x2="560" y2="160" stroke="#f1f5f9" strokeWidth="1" />
                <path d={activityAreaPath} fill="url(#gradTotal)" />
                <path d={toPath(activityPoints)} fill="none" stroke="#0891b2" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d={toPath(promptPoints)} fill="none" stroke="#a5b4fc" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                {activityPoints.length > 0 && (
                  <circle
                    cx={activityPoints[activityPoints.length - 1].x}
                    cy={activityPoints[activityPoints.length - 1].y}
                    r="4.5"
                    fill="#0891b2"
                  />
                )}
              </svg>
              <div className="mt-1.5 flex justify-between px-0.5">
                <span className="text-[10.5px] text-slate-300">
                  {format(new Date(stats.essaysOverTime[0].date + 'T00:00:00'), 'MMM d')}
                </span>
                <span className="text-[10.5px] text-slate-300">
                  {format(
                    new Date(stats.essaysOverTime[Math.floor(stats.essaysOverTime.length / 2)].date + 'T00:00:00'),
                    'MMM d'
                  )}
                </span>
                <span className="text-[10.5px] text-slate-300">
                  {format(
                    new Date(stats.essaysOverTime[stats.essaysOverTime.length - 1].date + 'T00:00:00'),
                    'MMM d'
                  )}
                </span>
              </div>
            </>
          ) : (
            <div className="flex h-[190px] items-center justify-center text-sm text-slate-300">No activity yet</div>
          )}
        </div>

        {/* Revenue */}
        <div className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900">Revenue</h3>
          <p className="mb-4 text-xs text-slate-400">All time</p>

          <div className="mb-4 flex items-baseline gap-2">
            <span className="text-[30px] font-extrabold text-slate-900 tabular-nums">{formatVND(stats.totalRevenue)}</span>
          </div>

          <div className="mb-3.5 flex h-2.5 overflow-hidden rounded-full">
            <div
              className="bg-cyan-600"
              style={{ width: `${stats.totalRevenue > 0 ? (stats.proRevenue / stats.totalRevenue) * 100 : 50}%` }}
            />
            <div
              className="bg-teal-300"
              style={{ width: `${stats.totalRevenue > 0 ? (stats.packRevenue / stats.totalRevenue) * 100 : 50}%` }}
            />
          </div>

          <div className="flex flex-1 flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="inline-block h-2 w-2 rounded-sm bg-cyan-600" />
                Pro subs
              </span>
              <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                {formatVND(stats.proRevenue)} <span className="font-medium text-slate-400">·{stats.proSubs}</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <span className="inline-block h-2 w-2 rounded-sm bg-teal-300" />
                Essay packs
              </span>
              <span className="text-[13px] font-bold text-slate-900 tabular-nums">
                {formatVND(stats.packRevenue)} <span className="font-medium text-slate-400">·{stats.packPurchases}</span>
              </span>
            </div>
          </div>

          <div className="mt-3.5 flex items-center justify-between border-t border-slate-100 pt-3.5">
            <span className="text-xs text-slate-400">Transactions</span>
            <span className="text-[13px] font-bold text-slate-700">{stats.totalTransactions}</span>
          </div>
        </div>
      </div>

      {/* ============ SECONDARY ROW — user mix (1/3) + essay distribution (2/3) ============ */}
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-900">User Mix</h3>
          <p className="mb-4 text-xs text-slate-400">By account type</p>

          <div className="flex items-center gap-4">
            <svg width="112" height="112" viewBox="0 0 112 112" className="shrink-0">
              <circle cx="56" cy="56" r="44" fill="none" stroke="#e0f2fe" strokeWidth="16" />
              {stats.ptnkOnlyUsers > 0 && (
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  fill="none"
                  stroke="#0891b2"
                  strokeWidth="16"
                  strokeDasharray={`${ptnkFrac * CIRC} ${CIRC}`}
                  strokeDashoffset={-ptnkOffset}
                  transform="rotate(-90 56 56)"
                  strokeLinecap="round"
                />
              )}
              {stats.paidProUsers > 0 && (
                <circle
                  cx="56"
                  cy="56"
                  r="44"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="16"
                  strokeDasharray={`${proFrac * CIRC} ${CIRC}`}
                  strokeDashoffset={-proOffset}
                  transform="rotate(-90 56 56)"
                  strokeLinecap="round"
                />
              )}
              <text x="56" y="52" textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a">
                {formatNumber(stats.totalUsers)}
              </text>
              <text x="56" y="68" textAnchor="middle" fontSize="9.5" fill="#94a3b8">
                users
              </text>
            </svg>
            <div className="flex flex-1 flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-sky-200" />
                  Free
                </span>
                <span className="text-[13px] font-bold text-slate-900 tabular-nums">{formatNumber(Math.max(0, stats.freeUsers))}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-600" />
                  PTNK
                </span>
                <span className="text-[13px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.ptnkOnlyUsers)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                  <span className="inline-block h-2 w-2 rounded-full bg-violet-600" />
                  Paid Pro
                </span>
                <span className="text-[13px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.paidProUsers)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm xl:col-span-2">
          <h3 className="text-sm font-extrabold text-slate-900">Essays Written per User</h3>
          <p className="mb-5 text-xs text-slate-400">Distribution across all users</p>

          <div className="flex h-[130px] items-end gap-4">
            {distBuckets.map((b, i) => (
              <div key={b.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[11.5px] font-bold text-slate-500 tabular-nums">{formatNumber(b.value)}</span>
                <div
                  className="w-full rounded-t-[5px]"
                  style={{
                    height: `${Math.max(4, (b.value / maxBucket) * 100)}%`,
                    backgroundColor: barColors[i],
                  }}
                />
                <span className="text-[11px] font-semibold text-slate-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============ COMPACT DATA GRID ============ */}
      <div className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {/* Vocabulary & Quiz */}
          <div className="border-b border-slate-100 px-5 py-4 sm:border-r xl:border-b-0">
            <span className="mb-3.5 block text-xs font-bold text-slate-700">Vocabulary & Quiz</span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Words generated</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.totalVocabulary)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Quiz attempts</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.totalQuizAttempts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Avg accuracy</span>
                <span className="text-[12.5px] font-bold text-emerald-600 tabular-nums">{stats.avgQuizScore}%</span>
              </div>
            </div>
          </div>

          {/* Writing Prompts */}
          <div className="border-b border-slate-100 px-5 py-4 xl:border-b-0 xl:border-r">
            <span className="mb-3.5 block text-xs font-bold text-slate-700">Writing Prompts</span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total live</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.totalPrompts)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">With outlines</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.promptsWithOutlines)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Usage rate</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">
                  {stats.totalEssays > 0 ? `${Math.round((stats.essaysFromPrompts / stats.totalEssays) * 100)}%` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* Referrals */}
          <div className="border-b border-slate-100 px-5 py-4 sm:border-r xl:border-b-0">
            <span className="mb-3.5 block text-xs font-bold text-slate-700">Referrals</span>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Total invited</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.totalInvitedUsers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Active referrers</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{formatNumber(stats.uniqueReferrers)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs text-slate-400">Conversion</span>
                <span className="text-[12.5px] font-bold text-slate-900 tabular-nums">{stats.inviteConversionRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>

          {/* Satisfaction */}
          <div className="px-5 py-4">
            <span className="mb-3.5 block text-xs font-bold text-slate-700">
              Satisfaction ({formatNumber(stats.satisfactionDistribution.totalRated)} rated)
            </span>
            {stats.satisfactionDistribution.totalRated > 0 ? (
              <>
                <div className="mb-2.5 flex h-2 overflow-hidden rounded-full">
                  <div
                    className="bg-red-300"
                    style={{ width: `${(stats.satisfactionDistribution.terrible / stats.satisfactionDistribution.totalRated) * 100}%` }}
                  />
                  <div
                    className="bg-orange-300"
                    style={{ width: `${(stats.satisfactionDistribution.notForMe / stats.satisfactionDistribution.totalRated) * 100}%` }}
                  />
                  <div
                    className="bg-green-300"
                    style={{ width: `${(stats.satisfactionDistribution.needImprove / stats.satisfactionDistribution.totalRated) * 100}%` }}
                  />
                  <div
                    className="bg-blue-300"
                    style={{ width: `${(stats.satisfactionDistribution.allGood / stats.satisfactionDistribution.totalRated) * 100}%` }}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-sm bg-blue-300" />
                      All good
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {Math.round((stats.satisfactionDistribution.allGood / stats.satisfactionDistribution.totalRated) * 100)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="flex items-center gap-1.5 text-[11.5px] text-slate-400">
                      <span className="inline-block h-1.5 w-1.5 rounded-sm bg-green-300" />
                      Need improve
                    </span>
                    <span className="text-xs font-bold text-slate-900 tabular-nums">
                      {Math.round((stats.satisfactionDistribution.needImprove / stats.satisfactionDistribution.totalRated) * 100)}%
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-xs text-slate-300">No ratings yet</p>
            )}
          </div>
        </div>
      </div>

      {/* ============ USERS TABLE ============ */}
      <div className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">All Users</h3>
            <p className="text-xs text-slate-400">
              {formatNumber(filteredUsers.length)} total
              {searchTerm && ` (filtered from ${formatNumber(stats.allUsers.length)})`}
            </p>
          </div>
          <div className="relative w-full sm:w-60">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:border-ocean-300 focus:outline-none focus:ring-1 focus:ring-ocean-300"
            />
          </div>
        </div>

        {paginatedUsers.length > 0 ? (
          <>
            {/* Mobile cards */}
            <div className="space-y-2 p-4 sm:hidden">
              {paginatedUsers.map((user) => (
                <div
                  key={user.id}
                  onClick={() => setSelectedUser(user)}
                  className="cursor-pointer rounded-lg border border-slate-100 bg-white p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="mb-1.5 flex flex-col gap-0.5">
                    {user.full_name && <p className="text-sm font-semibold text-slate-900">{user.full_name}</p>}
                    <p className="break-all text-xs text-slate-500">{user.email}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">{format(new Date(user.created_at), 'MMM d, yyyy')}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-cyan-700">{user.essay_count} essays</span>
                      <span className="text-slate-300">·</span>
                      <span className="font-semibold text-violet-600">{user.quiz_total_attempts} quizzes</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">Name</th>
                    <th className="px-5 py-2.5 text-left text-[11px] font-bold uppercase tracking-wide text-slate-400">Email</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">Essays</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">Quizzes</th>
                    <th className="px-5 py-2.5 text-right text-[11px] font-bold uppercase tracking-wide text-slate-400">Joined</th>
                    <th className="w-10 px-5 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      onClick={() => setSelectedUser(user)}
                      className="group cursor-pointer border-b border-slate-50 transition-colors last:border-b-0 hover:bg-slate-50"
                    >
                      <td className="px-5 py-2.5 text-[13px] font-semibold text-slate-900">
                        {user.full_name ?? <span className="italic text-slate-300">—</span>}
                      </td>
                      <td className="px-5 py-2.5 text-[12.5px] text-slate-500">{user.email}</td>
                      <td className="px-5 py-2.5 text-right text-[12.5px] font-bold text-slate-900 tabular-nums">
                        {user.essay_count}
                      </td>
                      <td className="px-5 py-2.5 text-right text-[12.5px] font-bold text-slate-900 tabular-nums">
                        {user.quiz_total_attempts}
                      </td>
                      <td className="px-5 py-2.5 text-right text-xs text-slate-400">
                        {format(new Date(user.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <Eye className="ml-auto h-3.5 w-3.5 text-slate-300 transition-colors group-hover:text-ocean-600" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3.5">
                <span className="text-xs text-slate-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredUsers.length)} of{' '}
                  {formatNumber(filteredUsers.length)} users
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </button>
                  <span className="px-2 text-xs font-medium text-slate-500">
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
                  >
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="py-12 text-center text-sm text-slate-400">
            {searchTerm ? 'No users found matching your search' : 'No users found'}
          </div>
        )}
      </div>

      {/* User Dashboard Sheet */}
      <UserDashboardSheet user={selectedUser} onClose={() => setSelectedUser(null)} />
    </div>
  )
}
