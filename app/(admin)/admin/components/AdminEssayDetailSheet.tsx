'use client'

import { useEffect, useState } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { AlertCircle, CheckCircle2, ChevronDown, FileText, BarChart2 } from 'lucide-react'

// ── Types ────────────────────────────────────────────────────────────────────

interface EssayDetail {
  id: string
  prompt: string
  essay_content: string
  created_at: string
  overall_score: number | null
  task_response_score: number | null
  coherence_cohesion_score: number | null
  lexical_resource_score: number | null
  grammatical_accuracy_score: number | null
  task_response_comment: string | null
  coherence_cohesion_comment: string | null
  lexical_resource_comment: string | null
  grammatical_accuracy_comment: string | null
  task_response_errors: string[] | null
  coherence_cohesion_errors: string[] | null
  lexical_resource_errors: string[] | null
  grammatical_accuracy_errors: string[] | null
  task_response_strengths: string[] | null
  coherence_cohesion_strengths: string[] | null
  lexical_resource_strengths: string[] | null
  grammatical_accuracy_strengths: string[] | null
}

interface CriterionData {
  name: string
  score: number | null
  comment: string | null
  errors: string[] | null
  strengths: string[] | null
}

interface AdminEssayDetailSheetProps {
  essayId: string | null
  onClose: () => void
}

// ── Score helpers (mirrors EssayResultsClient) ────────────────────────────────

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-500'
  if (score >= 8) return 'bg-gradient-to-r from-amber-500 to-yellow-500'
  if (score >= 7) return 'bg-green-600'
  if (score >= 5.5) return 'bg-yellow-600'
  return 'bg-red-600'
}

function getScoreBarColor(score: number | null): string {
  if (score === null) return 'bg-gray-300'
  if (score >= 8) return 'bg-gradient-to-r from-amber-400 to-yellow-400'
  if (score >= 7) return 'bg-green-500'
  if (score >= 5.5) return 'bg-yellow-500'
  return 'bg-red-500'
}

function formatCriterionScore(score: number | null, overallScore: number | null): string {
  if (score === null) return 'N/A'
  if (overallScore !== null && overallScore >= 8.0 && score >= 8) return `${score.toFixed(0)}+`
  return score.toFixed(1)
}

// ── String parsers (mirrors EssayResultsClient) ───────────────────────────────

const SEVERITY_BADGE: Record<string, { label: string; className: string }> = {
  MINOR:    { label: 'Minor',    className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  MAJOR:    { label: 'Major',    className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-700 border border-red-200' },
}

function parseErrorString(error: string) {
  const severityMatch = error.match(/^\[(MINOR|MAJOR|CRITICAL)\]\s*/)
  const severity = severityMatch ? severityMatch[1] : null
  const withoutSeverity = severityMatch ? error.slice(severityMatch[0].length) : error
  const betterIndex = withoutSeverity.search(/[;,]?\s*✏\s*Better:/)
  if (betterIndex === -1) return { severity, main: withoutSeverity, better: null }
  const main = withoutSeverity.slice(0, betterIndex).trim()
  const better = withoutSeverity.slice(betterIndex).replace(/^[;,]?\s*✏\s*Better:\s*/, '').trim()
  return { severity, main, better }
}

function parseStrengthString(strength: string) {
  const dashIdx = strength.indexOf(' — ')
  if (dashIdx === -1) return { label: strength, explanation: null }
  return { label: strength.slice(0, dashIdx), explanation: strength.slice(dashIdx + 3) }
}

function parseCommentSections(comment: string): string[] {
  return comment
    .split(/(?=Key strengths:|Main weaknesses:|To reach Band)/)
    .map(s => s.trim())
    .filter(Boolean)
}

// ── CriterionRow ─────────────────────────────────────────────────────────────

function CriterionRow({
  criterion,
  overallScore,
  isExpanded,
  onToggle,
}: {
  criterion: CriterionData
  overallScore: number | null
  isExpanded: boolean
  onToggle: () => void
}) {
  const score = criterion.score
  const barPercent = score !== null ? (score / 9) * 100 : 0
  const hasErrors = criterion.errors && criterion.errors.length > 0
  const hasStrengths = criterion.strengths && criterion.strengths.length > 0

  return (
    <div className="border border-ocean-200 rounded-xl overflow-hidden shadow-sm">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-ocean-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ocean-800 text-sm">{criterion.name}</p>
          <div className="mt-1.5 flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
                style={{ width: `${barPercent}%` }}
              />
            </div>
            <span className="text-xs text-ocean-600 font-medium whitespace-nowrap">
              {score !== null ? `${formatCriterionScore(score, overallScore)} / 9` : 'N/A'}
            </span>
          </div>
        </div>

        <Badge className={`${getScoreColor(score)} text-white font-bold px-2.5 py-0.5 text-sm flex-shrink-0`}>
          {formatCriterionScore(score, overallScore)}
        </Badge>

        <ChevronDown
          className={`h-4 w-4 text-ocean-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-ocean-100 px-4 py-4 space-y-4 bg-white">
          {criterion.comment && (() => {
            const sections = parseCommentSections(criterion.comment)
            return (
              <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3 space-y-1.5">
                {sections.map((section, i) => (
                  <p key={i} className="text-sm text-ocean-700 leading-relaxed">{section}</p>
                ))}
              </div>
            )
          })()}

          {hasStrengths && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wide flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" /> Strengths
              </p>
              <ul className="space-y-2">
                {criterion.strengths!.map((s, i) => {
                  const { label, explanation } = parseStrengthString(s)
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-green-500 mt-0.5 flex-shrink-0">✓</span>
                      <span className="text-green-800">
                        <span className="font-medium">{label}</span>
                        {explanation && (
                          <span className="text-green-700 font-normal"> — {explanation}</span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {hasErrors && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Areas for Improvement
              </p>
              <ul className="space-y-2.5">
                {criterion.errors!.map((e, i) => {
                  const { severity, main, better } = parseErrorString(e)
                  const badge = severity ? SEVERITY_BADGE[severity] : null
                  return (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <span className="text-red-400 mt-0.5 flex-shrink-0">•</span>
                      <span className="flex-1">
                        <span className="flex flex-wrap items-baseline gap-1.5">
                          {badge && (
                            <span className={`inline-block text-xs font-semibold px-1.5 py-0.5 rounded ${badge.className} flex-shrink-0`}>
                              {badge.label}
                            </span>
                          )}
                          <span className="text-red-800">{main}</span>
                        </span>
                        {better && (
                          <span className="mt-1 flex items-start gap-1 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded px-2 py-1">
                            <span className="flex-shrink-0 font-medium">✏</span>
                            <span className="italic">{better}</span>
                          </span>
                        )}
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {!hasStrengths && !hasErrors && (
            <div className="flex items-center gap-2 text-ocean-700 bg-ocean-50 border border-ocean-200 rounded-md p-3">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">No detailed feedback available</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-ocean-100 ${className}`} />
}

// ── Main component ────────────────────────────────────────────────────────────

const CRITERION_SHORT: Record<string, string> = {
  'Task Response': 'Task',
  'Coherence & Cohesion': 'Coherence',
  'Lexical Resource': 'Lexical',
  'Grammatical Accuracy': 'Grammar',
}

export function AdminEssayDetailSheet({ essayId, onClose }: AdminEssayDetailSheetProps) {
  const [data, setData] = useState<EssayDetail | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'score' | 'criteria'>('score')
  const [expandedCriterion, setExpandedCriterion] = useState<string | null>(null)

  useEffect(() => {
    if (!essayId) {
      setData(null)
      setError(null)
      setActiveTab('score')
      setExpandedCriterion(null)
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    fetch(`/api/admin/essays/${essayId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load essay')
        return res.json()
      })
      .then((json) => setData(json.essay))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [essayId])

  const criteria: CriterionData[] = data
    ? [
        { name: 'Task Response',        score: data.task_response_score,        comment: data.task_response_comment,        errors: data.task_response_errors,        strengths: data.task_response_strengths },
        { name: 'Coherence & Cohesion', score: data.coherence_cohesion_score,   comment: data.coherence_cohesion_comment,   errors: data.coherence_cohesion_errors,   strengths: data.coherence_cohesion_strengths },
        { name: 'Lexical Resource',     score: data.lexical_resource_score,     comment: data.lexical_resource_comment,     errors: data.lexical_resource_errors,     strengths: data.lexical_resource_strengths },
        { name: 'Grammatical Accuracy', score: data.grammatical_accuracy_score, comment: data.grammatical_accuracy_comment, errors: data.grammatical_accuracy_errors, strengths: data.grammatical_accuracy_strengths },
      ]
    : []

  const radarData = criteria.map(c => ({
    subject: CRITERION_SHORT[c.name] ?? c.name.split(' ')[0],
    score: c.score ?? 0,
    fullMark: 9,
  }))

  return (
    <Sheet open={!!essayId} onOpenChange={(open) => { if (!open) onClose() }}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0 flex flex-col"
      >
        {/* Header */}
        <SheetHeader className="px-5 pt-5 pb-3 border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50 shrink-0">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-ocean-100 p-2 shrink-0 mt-0.5">
              <FileText className="h-4 w-4 text-ocean-600" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-sm font-semibold text-ocean-800 line-clamp-2 leading-snug">
                {data?.prompt ?? (loading ? 'Loading…' : 'Essay Detail')}
              </SheetTitle>
              {data && (
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <Badge className={`${getScoreColor(data.overall_score)} text-white font-bold text-sm px-2.5 py-0.5`}>
                    Band {data.overall_score?.toFixed(1) ?? 'N/A'}
                  </Badge>
                  <span className="text-xs text-ocean-500">
                    {format(new Date(data.created_at), 'MMM d, yyyy · h:mm a')}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Tab switcher */}
          {data && (
            <div className="flex gap-1 mt-3 bg-ocean-100 rounded-lg p-1">
              {(['score', 'criteria'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-white text-ocean-800 shadow-sm'
                      : 'text-ocean-600 hover:text-ocean-800'
                  }`}
                >
                  {tab === 'score' ? <BarChart2 className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                  {tab === 'score' ? 'Score' : 'Criteria'}
                </button>
              ))}
            </div>
          )}
        </SheetHeader>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">
          {loading && (
            <div className="space-y-4">
              <SkeletonBlock className="h-24" />
              <SkeletonBlock className="h-48" />
              <SkeletonBlock className="h-32" />
            </div>
          )}

          {error && (
            <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {data && !loading && activeTab === 'score' && (
            <>
              {/* Overall score card */}
              <div className="rounded-2xl bg-gradient-to-br from-ocean-600 to-cyan-600 p-5 text-white text-center shadow-lg">
                <p className="text-sm font-medium opacity-80 mb-1">Overall Band Score</p>
                <p className="text-6xl font-bold tracking-tight">
                  {data.overall_score?.toFixed(1) ?? 'N/A'}
                </p>
                <p className="text-sm opacity-75 mt-1">out of 9.0</p>
              </div>

              {/* Radar chart */}
              <div className="h-[200px] sm:h-[260px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e0f2fe" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{ fill: '#0c4a6e', fontSize: 12, fontWeight: 500 }}
                    />
                    <Radar
                      name="Score"
                      dataKey="score"
                      stroke="#06b6d4"
                      fill="#06b6d4"
                      fillOpacity={0.25}
                      strokeWidth={2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 4 criteria mini score bars */}
              <div className="space-y-3">
                {criteria.map((c) => (
                  <div key={c.name} className="flex items-center gap-3">
                    <p className="text-xs font-medium text-ocean-700 w-28 shrink-0 leading-tight">{c.name}</p>
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${getScoreBarColor(c.score)}`}
                        style={{ width: c.score !== null ? `${(c.score / 9) * 100}%` : '0%' }}
                      />
                    </div>
                    <Badge className={`${getScoreColor(c.score)} text-white text-xs font-bold px-2 py-0.5 shrink-0`}>
                      {formatCriterionScore(c.score, data.overall_score)}
                    </Badge>
                  </div>
                ))}
              </div>

              {/* Essay content */}
              <div>
                <p className="text-xs font-semibold text-ocean-600 uppercase tracking-wide mb-2">Your Essay</p>
                <div className="max-h-[40vh] overflow-y-auto rounded-xl border border-ocean-200 bg-ocean-50 p-4">
                  <p className="text-sm text-ocean-800 leading-relaxed whitespace-pre-wrap">
                    {data.essay_content}
                  </p>
                </div>
              </div>
            </>
          )}

          {data && !loading && activeTab === 'criteria' && (
            <div className="space-y-3">
              {criteria.map((c) => (
                <CriterionRow
                  key={c.name}
                  criterion={c}
                  overallScore={data.overall_score}
                  isExpanded={expandedCriterion === c.name}
                  onToggle={() => setExpandedCriterion(prev => prev === c.name ? null : c.name)}
                />
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
