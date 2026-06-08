'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ProgressSummary } from '@/app/(dashboard)/dashboard/components/ProgressSummary'
import { ScoreChart } from '@/app/(dashboard)/dashboard/components/ScoreChart'
import { AdminEssayDetailSheet } from './AdminEssayDetailSheet'
import { format } from 'date-fns'
import {
  User,
  BookOpen,
  Brain,
  TrendingUp,
  FileText,
  GraduationCap,
  Eye,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'

interface AdminUser {
  id: string
  email: string
  essay_count: number
  quiz_total_attempts: number
  role: string
  created_at: string
}

interface UserDashboardSheetProps {
  user: AdminUser | null
  onClose: () => void
}

interface UserProfile {
  full_name: string | null
  email: string
  role: string
  subscription_status: string
  subscription_end_date: string | null
  invite_bonus_essays: number
  quiz_total_attempts: number
  quiz_total_correct: number
  quiz_total_questions: number
  created_at: string
}

interface Essay {
  id: string
  overall_score: number | null
  task_response_score: number | null
  coherence_cohesion_score: number | null
  lexical_resource_score: number | null
  grammatical_accuracy_score: number | null
  prompt: string
  created_at: string
}

interface DashboardData {
  profile: UserProfile
  essays: Essay[]
  stats: {
    totalEssays: number
    averageScore: number | null
    latestScore: number | null
  }
  userStats: {
    vocabulary: { total: number; essaysWithoutVocab: number }
    quiz: {
      totalAttempts: number
      totalCorrect: number
      totalQuestions: number
      avgScore: number
    }
    criteriaOverTime: Array<{
      essayNumber: number
      taskResponse: number | null
      coherence: number | null
      vocabulary: number | null
      grammar: number | null
    }>
  }
}

function getTierLabel(profile: UserProfile): { label: string; className: string } {
  if (
    profile.subscription_status === 'active' &&
    profile.subscription_end_date &&
    new Date(profile.subscription_end_date) > new Date()
  ) {
    return { label: 'Pro', className: 'bg-amber-100 text-amber-700 border-amber-300' }
  }
  if (profile.email?.endsWith('@ptnk.edu.vn')) {
    return { label: 'PTNK', className: 'bg-violet-100 text-violet-700 border-violet-300' }
  }
  return { label: 'Free', className: 'bg-ocean-100 text-ocean-700 border-ocean-300' }
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-500'
  if (score >= 8) return 'bg-gradient-to-r from-violet-500 to-purple-600'
  if (score >= 7) return 'bg-gradient-to-r from-emerald-500 to-green-600'
  if (score >= 6) return 'bg-gradient-to-r from-ocean-500 to-blue-600'
  if (score >= 5) return 'bg-gradient-to-r from-amber-500 to-orange-500'
  return 'bg-gradient-to-r from-red-500 to-rose-600'
}

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ocean-100 ${className}`} />
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6 p-6">
      <SkeletonBlock className="h-20" />
      <div className="grid grid-cols-3 gap-3">
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
        <SkeletonBlock className="h-16" />
      </div>
      <SkeletonBlock className="h-16" />
      <SkeletonBlock className="h-64" />
      <SkeletonBlock className="h-40" />
    </div>
  )
}

const ESSAYS_INITIAL = 5

export function UserDashboardSheet({ user, onClose }: UserDashboardSheetProps) {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedEssayId, setSelectedEssayId] = useState<string | null>(null)
  const [showAllEssays, setShowAllEssays] = useState(false)

  useEffect(() => {
    if (!user) {
      setData(null)
      setError(null)
      setSelectedEssayId(null)
      setShowAllEssays(false)
      return
    }

    setLoading(true)
    setError(null)
    setData(null)
    setShowAllEssays(false)

    fetch(`/api/admin/user-dashboard/${user.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load user data')
        return res.json()
      })
      .then((json: DashboardData) => setData(json))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id])

  const chartData =
    data?.essays
      .filter((e) => e.overall_score !== null)
      .slice()
      .reverse()
      .map((e, index) => ({
        essayNumber: index + 1,
        score: e.overall_score,
        date: e.created_at,
      })) ?? []

  const tier = data ? getTierLabel(data.profile) : null
  const displayName = data?.profile.full_name || user?.email?.split('@')[0] || 'User'
  const visibleEssays = data
    ? showAllEssays
      ? data.essays
      : data.essays.slice(0, ESSAYS_INITIAL)
    : []

  return (
    <>
      <Sheet open={!!user} onOpenChange={(open) => { if (!open) onClose() }}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col"
        >
          <SheetHeader className="px-5 pt-5 pb-4 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50 shrink-0">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-cyan-500 flex items-center justify-center text-white font-bold text-xl shrink-0">
                {(data?.profile.full_name || user?.email || '?')[0].toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <SheetTitle className="text-ocean-800 text-base font-bold leading-tight">
                  {displayName}
                </SheetTitle>
                <p className="text-xs text-ocean-500 mt-0.5 truncate">{user?.email}</p>

                <div className="flex flex-wrap items-center gap-1.5 mt-2">
                  {/* Role badge */}
                  <Badge
                    className={
                      user?.role === 'admin' || user?.role === 'dev'
                        ? 'bg-cyan-600 text-white text-xs'
                        : 'bg-ocean-200 text-ocean-800 text-xs'
                    }
                  >
                    {user?.role}
                  </Badge>

                  {/* Tier badge */}
                  {tier && (
                    <Badge variant="outline" className={`text-xs ${tier.className}`}>
                      {tier.label}
                    </Badge>
                  )}

                  {/* Join date */}
                  {user?.created_at && (
                    <span className="text-xs text-ocean-500">
                      Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick stat chips */}
            {data && (
              <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-ocean-100">
                <div className="flex items-center gap-1.5 text-xs text-ocean-700 bg-white border border-ocean-200 rounded-full px-3 py-1">
                  <FileText className="h-3.5 w-3.5 text-cyan-600" />
                  <span className="font-semibold">{data.stats.totalEssays}</span> essays
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ocean-700 bg-white border border-ocean-200 rounded-full px-3 py-1">
                  <BookOpen className="h-3.5 w-3.5 text-violet-500" />
                  <span className="font-semibold">{data.userStats.vocabulary.total}</span> vocab words
                </div>
                <div className="flex items-center gap-1.5 text-xs text-ocean-700 bg-white border border-ocean-200 rounded-full px-3 py-1">
                  <Brain className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="font-semibold">
                    {data.userStats.quiz.totalAttempts > 0
                      ? `${data.userStats.quiz.avgScore.toFixed(0)}%`
                      : '—'}
                  </span> quiz accuracy
                </div>
                {data.stats.averageScore !== null && (
                  <div className="flex items-center gap-1.5 text-xs text-ocean-700 bg-white border border-ocean-200 rounded-full px-3 py-1">
                    <GraduationCap className="h-3.5 w-3.5 text-amber-500" />
                    <span className="font-semibold">Band {data.stats.averageScore.toFixed(1)}</span> avg
                  </div>
                )}
              </div>
            )}
          </SheetHeader>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
            {loading && <LoadingSkeleton />}

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {data && !loading && (
              <>
                {/* Progress summary */}
                <ProgressSummary
                  totalEssays={data.stats.totalEssays}
                  averageScore={data.stats.averageScore}
                  latestScore={data.stats.latestScore}
                />

                {/* Empty state */}
                {data.stats.totalEssays === 0 && (
                  <Card className="border-ocean-200 bg-ocean-50">
                    <CardContent className="py-10 text-center">
                      <User className="h-10 w-10 mx-auto text-ocean-300 mb-3" />
                      <p className="text-ocean-600 text-sm">This user has not submitted any essays yet.</p>
                    </CardContent>
                  </Card>
                )}

                {/* Score chart */}
                {chartData.length > 0 && (
                  <Card className="border-ocean-200 shadow-sm overflow-hidden relative">
                    <TrendingUp className="absolute right-2 top-2 h-32 w-32 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                    <CardHeader className="relative z-10 pb-2">
                      <CardTitle className="text-ocean-800 text-sm">Score Progress</CardTitle>
                      <CardDescription className="text-xs">Overall + criteria over time</CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 overflow-hidden">
                      <ScoreChart data={chartData} criteriaOverTime={data.userStats.criteriaOverTime} />
                    </CardContent>
                  </Card>
                )}

                {/* Vocab & Quiz stats */}
                {data.stats.totalEssays > 0 && (
                  <Card className="border-ocean-200 shadow-sm overflow-hidden relative">
                    <BookOpen className="absolute right-2 top-2 h-32 w-32 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                    <CardHeader className="relative z-10 pb-2">
                      <CardTitle className="text-ocean-800 text-sm">Vocabulary & Quiz</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-2xl font-bold text-ocean-800">
                            {data.userStats.vocabulary.total}
                          </p>
                          <p className="text-xs text-ocean-500 mt-0.5">Words learned</p>
                        </div>
                        <div className="text-center border-x border-ocean-100">
                          <p className="text-2xl font-bold text-violet-700">
                            {data.userStats.quiz.totalAttempts}
                          </p>
                          <p className="text-xs text-ocean-500 mt-0.5">Quiz attempts</p>
                        </div>
                        <div className="text-center">
                          <p className="text-2xl font-bold text-emerald-600">
                            {data.userStats.quiz.totalAttempts > 0
                              ? `${data.userStats.quiz.avgScore.toFixed(0)}%`
                              : '—'}
                          </p>
                          <p className="text-xs text-ocean-500 mt-0.5">Accuracy</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Essays list */}
                {data.essays.length > 0 && (
                  <Card className="border-ocean-200 shadow-sm overflow-hidden relative">
                    <FileText className="absolute right-2 top-2 h-32 w-32 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                    <CardHeader className="relative z-10 pb-2">
                      <CardTitle className="text-ocean-800 text-sm">Essays</CardTitle>
                      <CardDescription className="text-xs">
                        Click "View" to see full scoring &amp; feedback
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10 space-y-2">
                      {visibleEssays.map((essay) => (
                        <div
                          key={essay.id}
                          className="flex items-center gap-2 sm:gap-3 p-2.5 border border-ocean-200 rounded-lg hover:bg-ocean-50 transition-colors"
                        >
                          <Badge className={`${getScoreColor(essay.overall_score)} text-white font-bold shrink-0 text-xs px-2 py-0.5`}>
                            {essay.overall_score?.toFixed(1) ?? 'N/A'}
                          </Badge>
                          <p className="flex-1 text-sm text-ocean-700 line-clamp-1 min-w-0">
                            {essay.prompt}
                          </p>
                          <span className="text-xs text-ocean-500 shrink-0 hidden sm:inline">
                            {format(new Date(essay.created_at), 'MMM d, yyyy')}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedEssayId(essay.id)}
                            className="shrink-0 h-7 text-xs px-2 border-ocean-300 text-ocean-700 hover:bg-ocean-100"
                          >
                            <Eye className="h-3.5 w-3.5 sm:mr-1" />
                            <span className="hidden sm:inline">View</span>
                          </Button>
                        </div>
                      ))}

                      {data.essays.length > ESSAYS_INITIAL && (
                        <button
                          onClick={() => setShowAllEssays((v) => !v)}
                          className="w-full flex items-center justify-center gap-1.5 text-xs text-ocean-500 hover:text-ocean-700 py-1.5 transition-colors"
                        >
                          {showAllEssays ? (
                            <><ChevronUp className="h-3.5 w-3.5" /> Show less</>
                          ) : (
                            <><ChevronDown className="h-3.5 w-3.5" /> Show {data.essays.length - ESSAYS_INITIAL} more</>
                          )}
                        </button>
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Nested essay detail sheet */}
      <AdminEssayDetailSheet
        essayId={selectedEssayId}
        onClose={() => setSelectedEssayId(null)}
      />
    </>
  )
}
