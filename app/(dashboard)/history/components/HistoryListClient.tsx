'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookOpen, Calendar, Eye, FileText, LayoutGrid, List, SlidersHorizontal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EssayRow {
  id: string
  prompt: string
  overall_score: number | null
  task_response_score: number | null
  coherence_cohesion_score: number | null
  lexical_resource_score: number | null
  grammatical_accuracy_score: number | null
  created_at: string
  word_count: number
  has_vocab: boolean
}

interface HistoryListClientProps {
  essays: EssayRow[]
}

const scoreRanges = [
  { value: 'all', label: 'All scores' },
  { value: '8+', label: '8.0+' },
  { value: '7-8', label: '7.0 – 7.9' },
  { value: '6-7', label: '6.0 – 6.9' },
  { value: 'below-6', label: 'Below 6.0' },
]

const dateRanges = [
  { value: 'all', label: 'All time' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
]

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'highest', label: 'Highest score' },
  { value: 'lowest', label: 'Lowest score' },
]

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

function getScoreBg(score: number | null): string {
  if (score === null) return 'bg-slate-400'
  if (score >= 8) return 'bg-gradient-to-br from-amber-500 to-yellow-500'
  if (score >= 7) return 'bg-gradient-to-br from-green-500 to-emerald-600'
  if (score >= 6) return 'bg-gradient-to-br from-ocean-500 to-ocean-600'
  if (score >= 5) return 'bg-gradient-to-br from-yellow-500 to-amber-600'
  return 'bg-gradient-to-br from-red-500 to-rose-600'
}

function getScoreLabel(score: number | null): string {
  if (score === null) return 'Pending'
  if (score >= 8) return 'Very Good'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Competent'
  if (score >= 5) return 'Modest'
  return 'Limited'
}

const miniBarCriteria = [
  { label: 'Task', key: 'task_response_score' as const, color: 'bg-blue-400' },
  { label: 'Coh.', key: 'coherence_cohesion_score' as const, color: 'bg-green-400' },
  { label: 'Lex.', key: 'lexical_resource_score' as const, color: 'bg-amber-400' },
  { label: 'Gram.', key: 'grammatical_accuracy_score' as const, color: 'bg-pink-400' },
]

export function HistoryListClient({ essays }: HistoryListClientProps) {
  const [scoreFilter, setScoreFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [compact, setCompact] = useState(false)

  const filteredEssays = useMemo(() => {
    const now = new Date()

    const matchesScore = (score: number | null) => {
      if (score === null) return scoreFilter === 'all'
      if (scoreFilter === '8+') return score >= 8
      if (scoreFilter === '7-8') return score >= 7 && score < 8
      if (scoreFilter === '6-7') return score >= 6 && score < 7
      if (scoreFilter === 'below-6') return score < 6
      return true
    }

    const matchesDate = (createdAt: string) => {
      if (dateFilter === 'all') return true
      const days = dateFilter === '7d' ? 7 : dateFilter === '30d' ? 30 : 90
      const created = new Date(createdAt)
      const diffInDays = (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
      return diffInDays <= days
    }

    const filtered = essays.filter(e => matchesScore(e.overall_score) && matchesDate(e.created_at))

    return filtered.sort((a, b) => {
      if (sortBy === 'highest') return (b.overall_score ?? -1) - (a.overall_score ?? -1)
      if (sortBy === 'lowest') return (a.overall_score ?? 10) - (b.overall_score ?? 10)
      const tA = new Date(a.created_at).getTime()
      const tB = new Date(b.created_at).getTime()
      return sortBy === 'oldest' ? tA - tB : tB - tA
    })
  }, [dateFilter, essays, scoreFilter, sortBy])

  const hasActiveFilters = scoreFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'newest'

  const clearFilters = () => {
    setScoreFilter('all')
    setDateFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="space-y-4">
      {/* ── Filter Toolbar ── flat, no CardHeader chrome */}
      <Card className="border-ocean-100 shadow-sm bg-ocean-50/50">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            {/* Count pill */}
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ocean-700 bg-ocean-100 rounded-full px-3 py-1.5 flex-shrink-0">
              <LayoutGrid className="h-3.5 w-3.5" />
              {filteredEssays.length} of {essays.length} essays
            </span>

            {/* Score filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-36">
                <SlidersHorizontal className="h-3 w-3 mr-1 text-ocean-400 flex-shrink-0" />
                <SelectValue placeholder="Score" />
              </SelectTrigger>
              <SelectContent>
                {scoreRanges.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Date filter */}
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-36">
                <Calendar className="h-3 w-3 mr-1 text-ocean-400 flex-shrink-0" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-36">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* View toggle + Reset — pushed to right */}
            <div className="flex items-center gap-1.5 sm:ml-auto">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-ocean-600 hover:bg-ocean-100"
                onClick={() => setCompact(v => !v)}
                title={compact ? 'Detailed view' : 'Compact view'}
              >
                {compact ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-slate-500 hover:text-slate-700"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Empty filter state ── */}
      {filteredEssays.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-14 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-600">No essays match the current filters.</p>
          </CardContent>
        </Card>
      ) : compact ? (
        /* ══════════════════════════════
           COMPACT MODE — single-line rows
           ══════════════════════════════ */
        <div className="space-y-1.5">
          {filteredEssays.map(essay => (
            <Card key={essay.id} className="border-ocean-100 shadow-sm hover:shadow-md transition-shadow duration-150 bg-white">
              <div className="flex items-center gap-3 px-4 py-3">
                {/* Score badge — small inline */}
                <Badge className={cn('text-sm font-bold text-white flex-shrink-0 px-2.5 py-0.5 rounded-lg border-0', getScoreBg(essay.overall_score))}>
                  {essay.overall_score?.toFixed(1) ?? '—'}
                </Badge>

                {/* Prompt */}
                <p className="flex-1 min-w-0 text-sm text-ocean-900 line-clamp-1 font-medium">
                  {essay.prompt}
                </p>

                {/* Date — hidden on xs */}
                <span className="text-xs text-ocean-400 flex-shrink-0 hidden sm:block">
                  {formatDate(essay.created_at)}
                </span>

                {/* Icon-only action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Link href={`/write/${essay.id}`}>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 border-ocean-200 hover:bg-ocean-50 text-ocean-600"
                      title="View Details"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/history/${essay.id}/vocabulary`}>
                    <Button
                      size="sm"
                      className={cn(
                        'h-8 w-8 p-0',
                        essay.has_vocab
                          ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                          : 'bg-gradient-to-br from-cyan-500 to-ocean-600 hover:from-cyan-600 hover:to-ocean-700 text-white'
                      )}
                      title={essay.has_vocab ? 'Study Vocabulary' : 'Generate Vocabulary'}
                    >
                      {essay.has_vocab
                        ? <BookOpen className="h-3.5 w-3.5" />
                        : <Sparkles className="h-3.5 w-3.5" />}
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* ══════════════════════════════
           DETAILED MODE — 3-zone cards
           ══════════════════════════════ */
        <div className="space-y-3 md:space-y-4">
          {filteredEssays.map(essay => (
            <Card
              key={essay.id}
              className="border-ocean-200 shadow-lg overflow-hidden relative bg-white hover:shadow-xl transition-shadow duration-200"
            >
              {/* Watermark icon — per project convention */}
              <BookOpen className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-[0.07] rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

              <div className="relative z-10 p-4 md:p-5">
                {/* Mobile: stacked — Desktop: 3 zones side by side */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">

                  {/* ── Zone 1: Score ── */}
                  <div className="flex sm:flex-col items-center sm:items-center sm:justify-center sm:w-[76px] gap-3 sm:gap-1.5 flex-shrink-0">
                    <div className={cn(
                      'h-16 w-16 rounded-2xl flex items-center justify-center font-bold text-white shadow-md flex-shrink-0',
                      getScoreBg(essay.overall_score)
                    )}>
                      <span className="text-2xl leading-none">
                        {essay.overall_score?.toFixed(1) ?? '?'}
                      </span>
                    </div>
                    <span className="text-[10px] text-ocean-500 font-semibold uppercase tracking-wide text-center">
                      {getScoreLabel(essay.overall_score)}
                    </span>
                  </div>

                  {/* ── Zone 2: Content ── */}
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    {/* Prompt */}
                    <p className="text-sm md:text-base font-semibold text-ocean-900 line-clamp-2 leading-snug">
                      {essay.prompt}
                    </p>

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-ocean-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(essay.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {essay.word_count} words
                      </span>
                    </div>

                    {/* Mini-bars — 4 criteria, no boxes */}
                    {essay.overall_score !== null && (
                      <div className="flex flex-wrap gap-3 mt-0.5">
                        {miniBarCriteria.map(({ label, key, color }) => {
                          const s = essay[key]
                          return (
                            <div key={label} className="flex flex-col items-start gap-0.5">
                              <span className="text-[9px] text-ocean-400 font-semibold uppercase tracking-wide">{label}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-10 h-1.5 bg-ocean-100 rounded-full overflow-hidden">
                                  <div
                                    className={cn('h-full rounded-full', color)}
                                    style={{ width: s !== null ? `${(s / 9) * 100}%` : '0%' }}
                                  />
                                </div>
                                <span className="text-[9px] font-bold text-ocean-600 w-5">{s?.toFixed(1) ?? '—'}</span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── Zone 3: Actions ── */}
                  <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:w-[120px]">
                    <Link href={`/write/${essay.id}`} className="flex-1 sm:flex-none">
                      <Button
                        size="sm"
                        className="w-full bg-ocean-600 text-white hover:bg-ocean-700 text-xs h-9"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Details
                      </Button>
                    </Link>

                    <div className="flex-1 sm:flex-none flex flex-col gap-1">
                      <Link href={`/history/${essay.id}/vocabulary`} className="w-full">
                        <Button
                          size="sm"
                          className={cn(
                            'w-full text-xs h-9',
                            essay.has_vocab
                              ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                              : 'bg-gradient-to-r from-cyan-500 to-ocean-600 hover:from-cyan-600 hover:to-ocean-700 text-white'
                          )}
                        >
                          {essay.has_vocab ? (
                            <>
                              <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                              Study Vocab
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
                              Generate Vocab
                            </>
                          )}
                        </Button>
                      </Link>

                      {/* Vocab ready indicator */}
                      {essay.has_vocab && (
                        <span className="flex items-center justify-center gap-1 text-[10px] text-cyan-600 font-medium">
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 inline-block" />
                          Vocab ready
                        </span>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
