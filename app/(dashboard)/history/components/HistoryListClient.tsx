'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Eye, FileText, LayoutGrid, List, Search, SlidersHorizontal } from 'lucide-react'

interface EssayRow {
  id: string
  prompt: string
  essay_content: string
  overall_score: number | null
  task_response_score: number | null
  coherence_cohesion_score: number | null
  lexical_resource_score: number | null
  grammatical_accuracy_score: number | null
  created_at: string
}

interface HistoryListClientProps {
  essays: EssayRow[]
}

const scoreRanges = [
  { value: 'all', label: 'All scores' },
  { value: '8+', label: '8.0+' },
  { value: '7-8', label: '7.0 - 7.9' },
  { value: '6-7', label: '6.0 - 6.9' },
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

const truncateText = (text: string, maxLength: number): string =>
  text.length <= maxLength ? text : `${text.substring(0, maxLength).trim()}...`

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

    const filtered = essays.filter((essay) => matchesScore(essay.overall_score) && matchesDate(essay.created_at))

    return filtered.sort((a, b) => {
      if (sortBy === 'highest') {
        return (b.overall_score ?? -1) - (a.overall_score ?? -1)
      }

      if (sortBy === 'lowest') {
        return (a.overall_score ?? 10) - (b.overall_score ?? 10)
      }

      const timeA = new Date(a.created_at).getTime()
      const timeB = new Date(b.created_at).getTime()
      return sortBy === 'oldest' ? timeA - timeB : timeB - timeA
    })
  }, [dateFilter, essays, scoreFilter, sortBy])

  const hasActiveFilters = scoreFilter !== 'all' || dateFilter !== 'all' || sortBy !== 'newest' || compact

  const clearFilters = () => {
    setScoreFilter('all')
    setDateFilter('all')
    setSortBy('newest')
    setCompact(false)
  }

  return (
    <div className="space-y-4">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <CardTitle className="text-ocean-800">Refine your history</CardTitle>
              <CardDescription>Filter by score and date, then switch between compact and detailed views.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={compact ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCompact((value) => !value)}
                className={compact ? 'bg-ocean-600 hover:bg-ocean-700' : 'border-slate-300'}
              >
                {compact ? <List className="mr-2 h-4 w-4" /> : <LayoutGrid className="mr-2 h-4 w-4" />}
                {compact ? 'Compact' : 'Detailed'}
              </Button>
              <Button variant="ghost" size="sm" onClick={clearFilters} disabled={!hasActiveFilters}>
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-600">
              <Search className="h-4 w-4 text-ocean-500" />
              <span>Showing {filteredEssays.length} of {essays.length} essays</span>
            </div>
            <Select value={scoreFilter} onValueChange={setScoreFilter}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue placeholder="Score range" />
              </SelectTrigger>
              <SelectContent>
                {scoreRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                {dateRanges.map((range) => (
                  <SelectItem key={range.value} value={range.value}>
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full border-slate-200 bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {filteredEssays.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-14 text-center">
            <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-slate-600">No essays match the current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {filteredEssays.map((essay) => {
            const score = essay.overall_score
            const scoreLabel = score !== null ? score.toFixed(1) : 'Pending'

            return (
              <Card key={essay.id} className={`border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md ${compact ? 'overflow-hidden' : ''}`}>
                <CardHeader className={compact ? 'p-4' : 'p-4 md:p-6'}>
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 space-y-2">
                      <CardTitle className={`${compact ? 'text-sm' : 'text-base md:text-lg'} text-slate-900`}>
                        {truncateText(essay.prompt, compact ? 80 : 120)}
                      </CardTitle>
                      <div className="flex flex-wrap items-center gap-2 text-xs md:text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {formatDate(essay.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <FileText className="h-3.5 w-3.5" />
                          {essay.essay_content.split(/\s+/).filter(Boolean).length} words
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 md:flex-col md:items-end">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-ocean-600 text-lg font-bold text-white shadow-sm">
                        {scoreLabel}
                      </div>
                      <span className="text-xs text-slate-500">Overall</span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className={compact ? 'px-4 pb-4 pt-0' : 'px-4 pb-4 pt-0 md:px-6'}>
                  <div className="space-y-3">
                    {score !== null && (
                      <div className={compact ? 'flex flex-wrap gap-2' : 'grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3'}>
                        {[
                          ['Task Response', essay.task_response_score],
                          ['Coherence', essay.coherence_cohesion_score],
                          ['Lexical', essay.lexical_resource_score],
                          ['Grammar', essay.grammatical_accuracy_score],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-lg bg-slate-50 px-3 py-2 text-center">
                            <div className="text-xs text-slate-500">{label}</div>
                            <Badge variant="secondary" className="mt-1 text-sm text-slate-800">
                              {value}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}

                    {!compact && (
                      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 md:p-4">
                        <p className="text-sm text-slate-700 line-clamp-3">{essay.essay_content}</p>
                      </div>
                    )}

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Link href={`/write/${essay.id}`} className="flex-1">
                        <Button className="w-full bg-ocean-600 text-white hover:bg-ocean-700">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                      </Link>
                      <Link href={`/history/${essay.id}/vocabulary`} className="sm:w-auto">
                        <Button variant="outline" className="w-full border-slate-300 text-slate-700 hover:bg-slate-50">
                          Vocabulary
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}