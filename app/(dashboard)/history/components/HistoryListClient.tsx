'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BookMarked, BookOpen, Calendar, Eye, FileText, LayoutGrid, List, SlidersHorizontal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getScoreTone } from '@/lib/utils/score'

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

const vocabStatuses = [
  { value: 'all', label: 'All essays' },
  { value: 'with-vocab', label: 'Vocab ready' },
  { value: 'no-vocab', label: 'No vocab yet' },
]

const formatDate = (dateString: string): string =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })


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
  const [vocabFilter, setVocabFilter] = useState('all')
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

    const matchesVocab = (hasVocab: boolean) => {
      if (vocabFilter === 'with-vocab') return hasVocab
      if (vocabFilter === 'no-vocab') return !hasVocab
      return true
    }

    const filtered = essays.filter(e =>
      matchesScore(e.overall_score) &&
      matchesDate(e.created_at) &&
      matchesVocab(e.has_vocab)
    )

    return filtered.sort((a, b) => {
      if (sortBy === 'highest') return (b.overall_score ?? -1) - (a.overall_score ?? -1)
      if (sortBy === 'lowest') return (a.overall_score ?? 10) - (b.overall_score ?? 10)
      const tA = new Date(a.created_at).getTime()
      const tB = new Date(b.created_at).getTime()
      return sortBy === 'oldest' ? tA - tB : tB - tA
    })
  }, [dateFilter, essays, scoreFilter, sortBy, vocabFilter])

  const hasActiveFilters = scoreFilter !== 'all' || dateFilter !== 'all' || vocabFilter !== 'all' || sortBy !== 'newest'

  const clearFilters = () => {
    setScoreFilter('all')
    setDateFilter('all')
    setVocabFilter('all')
    setSortBy('newest')
  }

  return (
    <div className="space-y-4">
      {/* ── Filter Toolbar ── flat, no CardHeader chrome */}
      <Card className="border-ocean-100 shadow-sm bg-ocean-50/50">
        <CardContent className="p-3 md:p-4">
          {/* Row 1: count pill + view toggle + reset */}
          <div className="flex items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ocean-700 bg-ocean-100 rounded-full px-3 py-1.5 flex-shrink-0">
              <LayoutGrid className="h-3.5 w-3.5" />
              {filteredEssays.length} / {essays.length}
            </span>
            <div className="flex items-center gap-1.5 ml-auto">
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
                className="h-8 text-xs text-slate-500 hover:text-slate-700 px-2"
                onClick={clearFilters}
                disabled={!hasActiveFilters}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Row 2: 4 filters — 2×2 grid on mobile, single row on md+ */}
          <div className="grid grid-cols-2 md:flex md:flex-wrap gap-2">
            {/* Score filter */}
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-full md:w-32">
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
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-full md:w-32">
                <Calendar className="h-3 w-3 mr-1 text-ocean-400 flex-shrink-0" />
                <SelectValue placeholder="Date" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map(r => (
                  <SelectItem key={r.value} value={r.value} className="text-xs">{r.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Vocab status filter */}
            <Select value={vocabFilter} onValueChange={setVocabFilter}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-full md:w-32">
                <BookMarked className="h-3 w-3 mr-1 text-ocean-400 flex-shrink-0" />
                <SelectValue placeholder="Vocab" />
              </SelectTrigger>
              <SelectContent>
                {vocabStatuses.map(s => (
                  <SelectItem key={s.value} value={s.value} className="text-xs">{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-full md:w-32">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map(o => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">{o.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                <Badge
                  className={cn('text-sm font-bold flex-shrink-0 px-2.5 py-0.5 rounded-lg border-0', getScoreTone(essay.overall_score).bg, getScoreTone(essay.overall_score).text)}
                >
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
                  <Link href={`/score/${essay.id}`}>
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
                          : 'bg-violet-600 hover:bg-violet-700 text-white'
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
        <div className="space-y-3 md:space-y-4 ipad-lg:space-y-0 ipad-lg:grid ipad-lg:grid-cols-2 ipad-lg:items-start ipad-lg:gap-4 xl:block xl:space-y-4">
          {filteredEssays.map(essay => (
            <Card
              key={essay.id}
              className="border-ocean-200 shadow-lg overflow-hidden relative bg-gradient-to-r from-white to-ocean-50/40 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 xl:mb-0"
            >
              {/* Watermark icon */}
              <BookOpen className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-[0.07] rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

              <div className="relative z-10 p-3 sm:p-4 md:p-5">
                {/* Mobile & 2-col ipad-lg grid: score badge + actions on same row; content below */}
                {/* Wide single column (sm to <ipad-lg, and xl+): all 3 zones in a single row */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 ipad-lg:flex-col ipad-lg:items-stretch ipad-lg:gap-3 xl:flex-row xl:items-center xl:gap-5">

                  {/* ── Zone 1+3 combined on mobile & ipad-lg: score left, actions right ── */}
                  {/* On sm-to-<ipad-lg and xl+: Zone 1 is its own column */}
                  <div className="flex items-center justify-between sm:contents ipad-lg:flex ipad-lg:justify-between xl:contents">
                    {/* Zone 1: Score badge */}
                    <div className="flex items-center sm:flex-col sm:justify-center sm:w-[72px] gap-2 sm:gap-1.5 flex-shrink-0 ipad-lg:flex-row ipad-lg:w-auto xl:flex-col xl:w-[72px]">
                      <div
                        className={cn(
                          'h-12 w-12 sm:h-16 sm:w-16 rounded-xl sm:rounded-2xl flex items-center justify-center font-bold flex-shrink-0 ipad-lg:h-12 ipad-lg:w-12 ipad-lg:rounded-xl xl:h-16 xl:w-16 xl:rounded-2xl',
                          getScoreTone(essay.overall_score).bg,
                          getScoreTone(essay.overall_score).text,
                        )}
                      >
                        <span className="text-lg sm:text-2xl leading-none ipad-lg:text-lg xl:text-2xl">
                          {essay.overall_score?.toFixed(1) ?? '?'}
                        </span>
                      </div>
                      <span className="text-[10px] text-ocean-500 font-semibold uppercase tracking-wide sm:text-center ipad-lg:text-left xl:text-center">
                        {getScoreLabel(essay.overall_score)}
                      </span>
                    </div>

                    {/* Zone 3: Actions — visible on mobile & ipad-lg (hidden sm-to-<ipad-lg and xl+) */}
                    <div className="flex gap-2 flex-shrink-0 sm:hidden ipad-lg:flex xl:hidden">
                      <Link href={`/score/${essay.id}`}>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                          title="View Score"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link href={`/history/${essay.id}/vocabulary`}>
                        <Button
                          size="sm"
                          className={cn(
                            'h-8 px-3 text-xs font-medium',
                            essay.has_vocab
                              ? 'bg-gradient-to-r from-cyan-500 to-ocean-600 text-white'
                              : 'bg-gradient-to-r from-violet-500 to-purple-600 text-white'
                          )}
                        >
                          {essay.has_vocab ? (
                            <><BookOpen className="h-3.5 w-3.5 mr-1" />Vocab</>
                          ) : (
                            <><Sparkles className="h-3.5 w-3.5 mr-1" />Gen</>
                          )}
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* ── Zone 2: Content ── */}
                  <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
                    <p className="text-sm md:text-base font-semibold text-ocean-900 line-clamp-2 leading-snug">
                      {essay.prompt}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-ocean-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDate(essay.created_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {essay.word_count} words
                      </span>
                    </div>
                    {essay.overall_score !== null && (
                      <div className="flex flex-wrap gap-2.5 sm:gap-3 mt-0.5">
                        {miniBarCriteria.map(({ label, key, color }) => {
                          const s = essay[key]
                          return (
                            <div key={label} className="flex flex-col items-start gap-0.5">
                              <span className="text-[9px] text-ocean-400 font-semibold uppercase tracking-wide">{label}</span>
                              <div className="flex items-center gap-1.5">
                                <div className="w-8 sm:w-10 h-1.5 bg-ocean-100 rounded-full overflow-hidden">
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

                  {/* ── Zone 3: Actions — wide row only (hidden on mobile & ipad-lg 2-col grid, shown above there) ── */}
                  <div className="hidden sm:flex sm:flex-col gap-2 flex-shrink-0 sm:w-[130px] sm:pl-4 sm:border-l sm:border-ocean-100 ipad-lg:hidden xl:flex">
                    <Link href={`/score/${essay.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-9 text-xs border-ocean-200 text-ocean-700 hover:bg-ocean-50 hover:border-ocean-300 font-medium"
                      >
                        <Eye className="h-3.5 w-3.5 mr-1.5" />
                        View Score
                      </Button>
                    </Link>
                    <Link href={`/history/${essay.id}/vocabulary`}>
                      <Button
                        size="sm"
                        className={cn(
                          'w-full h-9 text-xs font-medium',
                          essay.has_vocab
                            ? 'bg-gradient-to-r from-cyan-500 to-ocean-600 hover:from-cyan-600 hover:to-ocean-700 text-white shadow-sm'
                            : 'bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white shadow-sm'
                        )}
                      >
                        {essay.has_vocab ? (
                          <><BookOpen className="h-3.5 w-3.5 mr-1.5" />Study Vocab</>
                        ) : (
                          <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Gen Vocab</>
                        )}
                      </Button>
                    </Link>
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
