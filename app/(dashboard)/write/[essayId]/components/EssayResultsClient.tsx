'use client'

import { useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Sparkles,
  Info,
  BarChart2,
  PenLine,
  ChevronDown,
  ChevronRight,
  TrendingUp,
  Target,
} from 'lucide-react'
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
} from 'recharts'
import { EssayImprovement } from './EssayImprovement'
import { VocabGenerateButtons } from './VocabGenerateButtons'
import { DetailedGuidance } from './DetailedGuidance'
import { GuestBanner } from '@/components/guest/GuestBanner'
import type { Essay } from '@/types/essay'

interface CriterionData {
  name: string
  score: number | null
  comment: string | null
  errors: string[] | null
  strengths: string[] | null
}

interface EssayResultsClientProps {
  essay: Essay
  essayId: string
  criteria: CriterionData[]
  summaryItems: string[]
  wordCount: number
  hasParaphrase: boolean
  hasTopic: boolean
  isGuest: boolean
}

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
  if (overallScore !== null && overallScore >= 8.0 && score >= 8) {
    return `${score.toFixed(0)}+`
  }
  return score.toFixed(1)
}

const CRITERION_SHORT: Record<string, string> = {
  'Task Response': 'Task',
  'Coherence & Cohesion': 'Coherence',
  'Lexical Resource': 'Lexical',
  'Grammatical Accuracy': 'Grammar',
}

const SEVERITY_BADGE: Record<string, { label: string; className: string }> = {
  MINOR:    { label: 'Minor',    className: 'bg-slate-100 text-slate-500 border border-slate-200' },
  MAJOR:    { label: 'Major',    className: 'bg-amber-50 text-amber-700 border border-amber-200' },
  CRITICAL: { label: 'Critical', className: 'bg-red-100 text-red-700 border border-red-200' },
}

function parseErrorString(error: string): { severity: string | null; main: string; better: string | null } {
  const severityMatch = error.match(/^\[(MINOR|MAJOR|CRITICAL)\]\s*/)
  const severity = severityMatch ? severityMatch[1] : null
  const withoutSeverity = severityMatch ? error.slice(severityMatch[0].length) : error
  const betterIndex = withoutSeverity.search(/[;,]?\s*✏\s*Better:/)
  if (betterIndex === -1) return { severity, main: withoutSeverity, better: null }
  const main = withoutSeverity.slice(0, betterIndex).trim()
  const better = withoutSeverity.slice(betterIndex).replace(/^[;,]?\s*✏\s*Better:\s*/, '').trim()
  return { severity, main, better }
}

function parseStrengthString(strength: string): { label: string; explanation: string | null } {
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
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-ocean-50 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-ocean-800 text-sm">{criterion.name}</p>
          <div className="mt-2 flex items-center gap-3">
            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
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

        <Badge className={`${getScoreColor(score)} text-white font-bold px-3 py-1 text-sm flex-shrink-0`}>
          {formatCriterionScore(score, overallScore)}
        </Badge>

        <ChevronDown
          className={`h-4 w-4 text-ocean-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-ocean-100 px-5 py-4 space-y-4 bg-white">
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

function NextStepBanner({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <div className="mt-8 flex justify-end">
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
      >
        {label}
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  )
}

const TABS = [
  { value: 'score', label: 'Score', Icon: BarChart2 },
  { value: 'criteria', label: 'Criteria', Icon: CheckCircle2 },
  { value: 'improvement', label: 'Improvement', Icon: PenLine },
  { value: 'vocab', label: 'Vocab', Icon: BookOpen },
] as const

export function EssayResultsClient({
  essay,
  essayId,
  criteria,
  wordCount,
  hasParaphrase,
  hasTopic,
  isGuest,
}: EssayResultsClientProps) {
  const [activeTab, setActiveTab] = useState<string>('score')
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['score']))
  const [expandedCriteria, setExpandedCriteria] = useState<Set<string>>(new Set())
  const [isImprovementGenerating, setIsImprovementGenerating] = useState(false)

  function handleTabChange(value: string) {
    setActiveTab(value)
    setVisitedTabs(prev => {
      const next = new Set(prev)
      next.add(value)
      return next
    })
  }

  function toggleCriterion(name: string) {
    setExpandedCriteria(prev => {
      const next = new Set(prev)
      next.has(name) ? next.delete(name) : next.add(name)
      return next
    })
  }

  const scoredCriteria = criteria.filter(c => c.score !== null) as Array<CriterionData & { score: number }>
  const highestCriterion = scoredCriteria.reduce<(CriterionData & { score: number }) | null>((best, cur) => {
    if (!best || cur.score > best.score) return cur
    return best
  }, null)
  const lowestCriterion = scoredCriteria.reduce<(CriterionData & { score: number }) | null>((worst, cur) => {
    if (!worst || cur.score < worst.score) return cur
    return worst
  }, null)

  const radarData = criteria.map(c => ({
    subject: CRITERION_SHORT[c.name] ?? c.name.split(' ')[0],
    score: c.score ?? 0,
    fullMark: 9,
  }))

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {isGuest && <GuestBanner />}

      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-ocean-800 mb-1">Essay Results</h1>
        <p className="text-ocean-600">Detailed scoring and feedback for your IELTS essay</p>
      </div>

      {/* Quick Summary — 3 stat chips */}
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-cyan-600" />
            <h2 className="text-sm font-semibold text-ocean-800">Quick Summary</h2>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 rounded-lg p-3 text-center border border-cyan-100">
              <p className="text-2xl font-bold text-ocean-800">
                {essay.overall_score?.toFixed(1) ?? 'N/A'}
              </p>
              <p className="text-xs text-ocean-500 mt-0.5">Overall Band</p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center border border-green-100">
              <TrendingUp className="h-4 w-4 text-green-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-ocean-800 leading-tight">
                {highestCriterion ? (CRITERION_SHORT[highestCriterion.name] ?? highestCriterion.name) : '—'}
              </p>
              <p className="text-xs text-green-600 mt-0.5">
                {highestCriterion ? highestCriterion.score.toFixed(1) : ''}
              </p>
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center border border-amber-100">
              <Target className="h-4 w-4 text-amber-600 mx-auto mb-1" />
              <p className="text-sm font-semibold text-ocean-800 leading-tight">
                {lowestCriterion ? (CRITERION_SHORT[lowestCriterion.name] ?? lowestCriterion.name) : '—'}
              </p>
              <p className="text-xs text-amber-600 mt-0.5">
                {lowestCriterion ? lowestCriterion.score.toFixed(1) : ''}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabbed content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Sticky tab bar */}
        <div className="sticky top-20 z-30 -mx-4 px-4 bg-ocean-50/95 backdrop-blur-sm border-b border-ocean-100">
          <TabsList className="w-full h-auto bg-transparent p-0 rounded-none border-0 gap-0">
            {TABS.map(({ value, label, Icon }) => (
              <TabsTrigger
                key={value}
                value={value}
                className="flex-1 flex items-center justify-center gap-2 rounded-none border-b-2 border-transparent px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-ocean-700 hover:bg-ocean-100 data-[state=active]:border-ocean-600 data-[state=active]:text-ocean-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="hidden sm:inline">{label}</span>
                <span className="sm:hidden text-xs">{label}</span>
                {value === 'improvement' && isImprovementGenerating && visitedTabs.has('improvement') && (
                  <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── Score tab ── */}
        <TabsContent value="score" className="mt-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Left column — sticky on desktop */}
            <div className="md:w-2/5 space-y-4 md:sticky md:top-36 md:self-start">
              {/* Overall Score Card */}
              <Card className="border-ocean-300 shadow-lg overflow-hidden">
                <div className={`${essay.overall_score !== null && essay.overall_score >= 8.0
                  ? 'bg-amber-700'
                  : 'bg-ocean-700'} text-white p-6`}>
                  <div className="text-center">
                    <h2 className="text-base font-semibold mb-1 opacity-90">Overall Band Score</h2>
                    <div className="text-5xl font-bold mb-1">
                      {essay.overall_score !== null
                        ? (essay.overall_score >= 8.0
                            ? `${essay.overall_score.toFixed(1)}~9`
                            : essay.overall_score.toFixed(1))
                        : 'N/A'}
                    </div>
                    <p className="text-white/80 text-xs">IELTS Writing Task 2</p>
                  </div>
                </div>

                {essay.overall_score !== null && essay.overall_score >= 8.0 && (
                  <div className="bg-amber-50 border-t border-amber-200 p-3">
                    <div className="flex items-start gap-2">
                      <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-amber-800 leading-relaxed">
                        At this level, scores often depend on examiner perception. Exceptional standard achieved.
                      </p>
                    </div>
                  </div>
                )}
              </Card>

              {/* Radar chart */}
              <Card className="border-ocean-200 shadow-sm">
                <CardHeader className="pb-2 pt-4 px-4">
                  <CardTitle className="text-sm text-ocean-800">Criteria Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="px-2 pb-4">
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={radarData} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fontSize: 11, fill: '#1e4d7b' }}
                      />
                      <Radar
                        name="Score"
                        dataKey="score"
                        stroke="#1e4d7b"
                        fill="#1e4d7b"
                        fillOpacity={0.25}
                        strokeWidth={2}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Score Legend */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2 text-xs text-ocean-700">
                <p className="font-semibold text-ocean-800 text-sm">Score Guide</p>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-green-600 flex-shrink-0" />
                  <span><strong>7.0+:</strong> Good to Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-600 flex-shrink-0" />
                  <span><strong>5.5–6.5:</strong> Moderate to Competent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-600 flex-shrink-0" />
                  <span><strong>&lt;5.5:</strong> Needs Improvement</span>
                </div>
              </div>
            </div>

            {/* Right column — essay */}
            <div className="md:w-3/5">
              <Card className="border-ocean-200 shadow-lg">
                <CardHeader className="border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-ocean-600" />
                    <CardTitle className="text-ocean-800">Your Essay</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <h3 className="font-semibold text-ocean-800 mb-2">Prompt</h3>
                    <div className="bg-ocean-50 border border-ocean-200 rounded-md p-4">
                      <p className="text-ocean-700 leading-relaxed">{essay.prompt}</p>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-ocean-800 mb-2">Your Response</h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-md p-4 max-h-[60vh] overflow-y-auto">
                      <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                        {essay.essay_content}
                      </p>
                    </div>
                    <p className="text-sm text-ocean-600 mt-2">Word count: {wordCount} words</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <NextStepBanner
            label="See detailed criteria breakdown"
            onClick={() => handleTabChange('criteria')}
          />
        </TabsContent>

        {/* ── Criteria tab ── */}
        <TabsContent value="criteria" className="space-y-3 mt-6">
          <h2 className="text-2xl font-bold text-ocean-800">Detailed Criteria Scores</h2>
          {criteria.map((criterion) => (
            <CriterionRow
              key={criterion.name}
              criterion={criterion}
              overallScore={essay.overall_score}
              isExpanded={expandedCriteria.has(criterion.name)}
              onToggle={() => toggleCriterion(criterion.name)}
            />
          ))}

          <NextStepBanner
            label="View improved essay example"
            onClick={() => handleTabChange('improvement')}
          />
        </TabsContent>

        {/* ── Improvement tab — lazy mounted ── */}
        <TabsContent value="improvement" className="space-y-6 mt-6">
          <h2 className="text-2xl font-bold text-ocean-800">Improved Essay Example</h2>
          {visitedTabs.has('improvement') && (
            <>
              <EssayImprovement
                essayId={essayId}
                originalEssay={essay.essay_content}
                initialImprovedEssay={essay.improved_essay}
                initialChanges={essay.improvement_changes}
                onGeneratingChange={setIsImprovementGenerating}
              />
              <DetailedGuidance
                essayId={essayId}
                hasImprovedEssay={!!essay.improved_essay}
                initialGuidance={essay.detailed_guidance}
              />
            </>
          )}

          <NextStepBanner
            label="Generate vocabulary"
            onClick={() => handleTabChange('vocab')}
          />
        </TabsContent>

        {/* ── Vocab tab — lazy mounted ── */}
        <TabsContent value="vocab" className="mt-6">
          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-ocean-600" />
                <CardTitle className="text-ocean-800">Improve Your Vocabulary</CardTitle>
              </div>
              <CardDescription>
                Generate paraphrase suggestions and discover topic-specific advanced vocabulary to enhance your writing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {visitedTabs.has('vocab') && (
                <VocabGenerateButtons
                  essayId={essayId}
                  initialHasParaphrase={hasParaphrase}
                  initialHasTopic={hasTopic}
                />
              )}
            </CardContent>
          </Card>

          <NextStepBanner
            label="Back to your score"
            onClick={() => handleTabChange('score')}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
