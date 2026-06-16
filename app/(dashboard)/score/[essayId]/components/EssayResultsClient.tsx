'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  AlertCircle,
  CheckCircle2,
  FileText,
  BookOpen,
  Info,
  BarChart2,
  PenLine,
  ChevronDown,
  ChevronRight,
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
import { PromptContextZone } from './PromptContextZone'
import { GuestBanner } from '@/components/guest/GuestBanner'
import { getScoreTone } from '@/lib/utils/score'
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
  initialClassificationStatus: 'pending' | 'classified' | 'invalid' | 'unclassified'
  initialPromptId: string | null
  initialTopicId: string | null
  initialQuestionType: string | null
  initialTopicName: string | null
}

function getScoreBarColor(score: number | null): string {
  if (score === null) return 'bg-slate-200'
  if (score >= 8) return 'bg-violet-400'
  if (score >= 7) return 'bg-teal-400'
  if (score >= 6) return 'bg-sky-400'
  if (score >= 5) return 'bg-orange-400'
  return 'bg-rose-400'
}

function getScoreHeaderTone(score: number | null): { bg: string; text: string; sub: string; infoBg: string; infoBorder: string; infoText: string; infoIcon: string } {
  if (score === null) return { bg: 'bg-slate-100', text: 'text-slate-700', sub: 'text-slate-500', infoBg: 'bg-slate-50', infoBorder: 'border-slate-200', infoText: 'text-slate-700', infoIcon: 'text-slate-500' }
  if (score >= 8) return { bg: 'bg-violet-100', text: 'text-violet-800', sub: 'text-violet-500', infoBg: 'bg-violet-50', infoBorder: 'border-violet-200', infoText: 'text-violet-800', infoIcon: 'text-violet-500' }
  if (score >= 7) return { bg: 'bg-teal-100',   text: 'text-teal-800',   sub: 'text-teal-500',   infoBg: 'bg-teal-50',   infoBorder: 'border-teal-200',   infoText: 'text-teal-800',   infoIcon: 'text-teal-500'   }
  if (score >= 6) return { bg: 'bg-sky-100',     text: 'text-sky-800',     sub: 'text-sky-500',     infoBg: 'bg-sky-50',     infoBorder: 'border-sky-200',     infoText: 'text-sky-800',     infoIcon: 'text-sky-500'     }
  if (score >= 5) return { bg: 'bg-orange-100', text: 'text-orange-800', sub: 'text-orange-500', infoBg: 'bg-orange-50', infoBorder: 'border-orange-200', infoText: 'text-orange-800', infoIcon: 'text-orange-500' }
  return                  { bg: 'bg-rose-100',   text: 'text-rose-800',   sub: 'text-rose-500',   infoBg: 'bg-rose-50',   infoBorder: 'border-rose-200',   infoText: 'text-rose-800',   infoIcon: 'text-rose-500'   }
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

const CRITERION_ACCENT: Record<string, { bar: string; bg: string; text: string; dot: string }> = {
  'Task Response':        { bar: 'bg-blue-500',    bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400' },
  'Coherence & Cohesion': { bar: 'bg-emerald-500', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  'Lexical Resource':     { bar: 'bg-amber-500',   bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400' },
  'Grammatical Accuracy': { bar: 'bg-pink-500',    bg: 'bg-pink-50',    text: 'text-pink-700',    dot: 'bg-pink-400' },
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
  const errorCount = criterion.errors?.length ?? 0
  const strengthCount = criterion.strengths?.length ?? 0
  const accent = CRITERION_ACCENT[criterion.name] ?? { bar: 'bg-ocean-500', bg: 'bg-ocean-50', text: 'text-ocean-700', dot: 'bg-ocean-400' }

  return (
    <div className={`border border-ocean-200 rounded-xl overflow-hidden shadow-sm transition-shadow duration-200 ${isExpanded ? 'shadow-md' : 'hover:shadow-md'}`}>
      <button
        onClick={onToggle}
        className={`w-full flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 sm:py-4 transition-colors text-left ${isExpanded ? accent.bg : 'bg-white hover:bg-ocean-50/60'}`}
      >
        {/* Left accent strip */}
        <div className={`w-1 self-stretch rounded-full flex-shrink-0 ${accent.bar} opacity-80`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <p className="font-semibold text-ocean-800 text-sm sm:text-[15px] leading-tight">{criterion.name}</p>
          </div>
          <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${getScoreBarColor(score)}`}
              style={{ width: `${barPercent}%` }}
            />
          </div>
        </div>

        <Badge className={`${getScoreTone(score).bg} ${getScoreTone(score).text} font-bold px-2.5 sm:px-3 py-1 text-sm sm:text-base flex-shrink-0 min-w-[2.5rem] text-center justify-center`}>
          {formatCriterionScore(score, overallScore)}
        </Badge>

        <ChevronDown
          className={`h-4 w-4 text-ocean-400 flex-shrink-0 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-ocean-100 px-3 sm:px-5 py-3 sm:py-4 space-y-3 sm:space-y-4 bg-white">
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
    <div className="mt-5 sm:mt-8 flex justify-end">
      <button
        onClick={onClick}
        className="flex items-center gap-2 text-xs sm:text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
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
  initialClassificationStatus,
  initialPromptId,
  initialTopicId,
  initialQuestionType,
  initialTopicName,
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

  useEffect(() => {
    const tabValues = TABS.map(t => t.value)
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= tabValues.length) {
        handleTabChange(tabValues[num - 1])
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab])

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
    <div className="max-w-6xl mx-auto space-y-4 sm:space-y-6">
      {isGuest && <GuestBanner />}

      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-4xl font-bold text-ocean-800 mb-1">Essay Results</h1>
        <p className="text-sm sm:text-base text-ocean-600">Detailed scoring and feedback for your IELTS essay</p>
      </div>

      {/* Prompt Context Zone — classification status + similar prompts */}
      <PromptContextZone
        essayId={essayId}
        promptText={essay.prompt}
        initialClassificationStatus={initialClassificationStatus}
        initialPromptId={initialPromptId}
        initialTopicId={initialTopicId}
        initialQuestionType={initialQuestionType}
        initialTopicName={initialTopicName}
      />

      {/* Tabbed content */}
      <Tabs value={activeTab} onValueChange={handleTabChange}>
        {/* Sticky tab bar */}
        <div className="sticky top-20 z-30 -mx-4 px-4 bg-ocean-50/95 backdrop-blur-sm border-b border-ocean-100">
          <div className="flex items-center">
            <TabsList className="flex-1 h-auto bg-transparent p-0 rounded-none border-0 gap-0">
              {TABS.map(({ value, label, Icon }, idx) => (
                <TabsTrigger
                  key={value}
                  value={value}
                  className="flex-1 flex items-center justify-center gap-1 sm:gap-2 rounded-none border-b-2 border-transparent px-1 sm:px-4 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-slate-500 transition-colors hover:text-ocean-700 hover:bg-ocean-100 data-[state=active]:border-ocean-600 data-[state=active]:text-ocean-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                  <span>{label}</span>
                  <span className="hidden sm:inline ml-0.5 text-[10px] text-ocean-300 font-mono">{idx + 1}</span>
                  {value === 'improvement' && isImprovementGenerating && visitedTabs.has('improvement') && (
                    <span className="h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-cyan-500 animate-pulse flex-shrink-0" />
                  )}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
        </div>

        {/* ── Score tab ── */}
        <TabsContent value="score" className="mt-4 sm:mt-6">
          <div className="flex flex-col md:flex-row gap-4 sm:gap-6">
            {/* Left column — sticky on desktop */}
            <div className="md:w-2/5 space-y-3 sm:space-y-4 md:sticky md:top-36 md:self-start">
              {/* Overall Score Card */}
              {(() => {
                const ht = getScoreHeaderTone(essay.overall_score)
                return (
                  <Card className="border-ocean-300 shadow-lg overflow-hidden">
                    <div className={`${ht.bg} p-4 sm:p-6`}>
                      <div className="text-center">
                        <h2 className={`text-sm sm:text-base font-semibold mb-1 ${ht.sub}`}>Overall Band Score</h2>
                        <div className={`text-4xl sm:text-5xl font-bold mb-1 ${ht.text}`}>
                          {essay.overall_score !== null
                            ? (essay.overall_score >= 8.0
                                ? `${Math.floor(essay.overall_score)}+`
                                : essay.overall_score.toFixed(1))
                            : 'N/A'}
                        </div>
                        <p className={`text-xs ${ht.sub}`}>IELTS Writing Task 2</p>
                      </div>
                    </div>

                    {essay.overall_score !== null && essay.overall_score >= 8.0 && (
                      <div className={`${ht.infoBg} border-t ${ht.infoBorder} p-3`}>
                        <div className="flex items-start gap-2">
                          <Info className={`h-4 w-4 mt-0.5 flex-shrink-0 ${ht.infoIcon}`} />
                          <p className={`text-xs leading-relaxed ${ht.infoText}`}>
                            At this level, scores often depend on examiner perception. Exceptional standard achieved.
                          </p>
                        </div>
                      </div>
                    )}
                  </Card>
                )
              })()}

              {/* Radar chart — horizontal 2-col layout on mobile */}
              <div className="flex flex-col sm:flex-col md:flex-col gap-3 sm:gap-4">
                <Card className="border-ocean-200 shadow-sm">
                  <CardHeader className="pb-2 pt-3 sm:pt-4 px-3 sm:px-4">
                    <CardTitle className="text-sm text-ocean-800">Criteria Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent className="px-1 sm:px-2 pb-3 sm:pb-4">
                    <ResponsiveContainer width="100%" height={180}>
                      <RadarChart data={radarData} margin={{ top: 8, right: 16, bottom: 8, left: 16 }}>
                        <PolarGrid stroke="#e2e8f0" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fontSize: 10, fill: '#1e4d7b' }}
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
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-ocean-700">
                  <p className="font-semibold text-ocean-800 text-sm mb-2">Score Guide</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-1 gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-violet-500 flex-shrink-0" />
                      <span><strong>8.0+:</strong> Very Good to Expert</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-teal-500 flex-shrink-0" />
                      <span><strong>7.0–7.9:</strong> Good</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-sky-500 flex-shrink-0" />
                      <span><strong>6.0–6.9:</strong> Competent</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-orange-400 flex-shrink-0" />
                      <span><strong>5.0–5.9:</strong> Modest</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                      <span><strong>&lt;5.0:</strong> Needs Improvement</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column — essay response */}
            <div className="md:w-3/5">
              <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
                <FileText className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                <CardHeader className="border-b border-slate-100 relative z-10 px-4 py-3 sm:px-6 sm:py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600" />
                    <CardTitle className="text-base sm:text-lg text-ocean-800">Your Essay</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6 relative z-10">
                  <p className="text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                    {essay.essay_content}
                  </p>
                  <p className="text-xs sm:text-sm text-ocean-600 mt-2">Word count: {wordCount} words</p>
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
        <TabsContent value="criteria" className="space-y-3 mt-4 sm:mt-6">
          <h2 className="text-xl sm:text-2xl font-bold text-ocean-800">Detailed Criteria Scores</h2>
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
        <TabsContent value="improvement" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
          <h2 className="text-xl sm:text-2xl font-bold text-ocean-800">Improved Essay Example</h2>
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
        <TabsContent value="vocab" className="mt-4 sm:mt-6">
          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-slate-100 px-4 sm:px-6 py-3 sm:py-4">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600" />
                <CardTitle className="text-base sm:text-lg text-ocean-800">Improve Your Vocabulary</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Generate paraphrase suggestions and discover topic-specific advanced vocabulary to enhance your writing.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 sm:pt-6 px-4 sm:px-6">
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
