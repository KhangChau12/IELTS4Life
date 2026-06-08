'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { ChevronDown, BookOpen, X, Search, CheckCircle, PenTool } from 'lucide-react'
import { cn } from '@/lib/utils'
import PromptCard from './PromptCard'
import PromptSidebar from './PromptSidebar'
import FeaturedPrompt from './FeaturedPrompt'
import type { PromptWithUserEssay, PromptTopic } from '@/types/prompt'
import { QUESTION_TYPES } from '@/types/prompt'

const MOBILE_TYPE_COLORS: Record<string, { dot: string; active: string; inactive: string }> = {
  agree_disagree:           { dot: 'bg-cyan-400',    active: 'bg-cyan-100 text-cyan-800 border-cyan-300',    inactive: 'bg-white text-slate-600 border-slate-200' },
  advantages_disadvantages: { dot: 'bg-teal-400',    active: 'bg-teal-100 text-teal-800 border-teal-300',    inactive: 'bg-white text-slate-600 border-slate-200' },
  problem_solution:         { dot: 'bg-blue-400',    active: 'bg-blue-100 text-blue-800 border-blue-300',    inactive: 'bg-white text-slate-600 border-slate-200' },
  two_part_question:        { dot: 'bg-sky-400',     active: 'bg-sky-100 text-sky-800 border-sky-300',       inactive: 'bg-white text-slate-600 border-slate-200' },
  positive_negative:        { dot: 'bg-emerald-400', active: 'bg-emerald-100 text-emerald-800 border-emerald-300', inactive: 'bg-white text-slate-600 border-slate-200' },
  discussion_both_views:    { dot: 'bg-violet-400',  active: 'bg-violet-100 text-violet-800 border-violet-300',    inactive: 'bg-white text-slate-600 border-slate-200' },
  mixed_hybrid:             { dot: 'bg-slate-400',   active: 'bg-slate-100 text-slate-700 border-slate-300', inactive: 'bg-white text-slate-600 border-slate-200' },
}

const INITIAL_VISIBLE = 12

interface PromptsListClientProps {
  prompts: PromptWithUserEssay[]
  topics: PromptTopic[]
  isAuthenticated: boolean
}

export default function PromptsListClient({ prompts, topics, isAuthenticated }: PromptsListClientProps) {
  const [selectedType, setSelectedType] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showWrittenOnly, setShowWrittenOnly] = useState(false)
  const [showUnwrittenOnly, setShowUnwrittenOnly] = useState(false)
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE)

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (selectedType && p.question_type !== selectedType) return false
      if (selectedTopic && p.topic_id !== selectedTopic) return false
      if (showWrittenOnly && !p.user_essay) return false
      if (showUnwrittenOnly && p.user_essay) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        if (
          !p.prompt_text.toLowerCase().includes(q) &&
          !p.prompt_topics?.name?.toLowerCase().includes(q)
        ) return false
      }
      return true
    })
  }, [prompts, selectedType, selectedTopic, searchQuery, showWrittenOnly, showUnwrittenOnly])

  const hasActiveFilters = !!(selectedType || selectedTopic || searchQuery || showWrittenOnly || showUnwrittenOnly)

  const handleReset = () => {
    setSelectedType('')
    setSelectedTopic('')
    setSearchQuery('')
    setShowWrittenOnly(false)
    setShowUnwrittenOnly(false)
    setVisibleCount(INITIAL_VISIBLE)
  }

  const handleFilterChange = () => {
    setVisibleCount(INITIAL_VISIBLE)
  }

  // Active filter chips for display in main area
  const activeChips: { label: string; onRemove: () => void }[] = []
  if (selectedType) activeChips.push({ label: QUESTION_TYPES[selectedType as keyof typeof QUESTION_TYPES] || selectedType, onRemove: () => { setSelectedType(''); handleFilterChange() } })
  if (selectedTopic) {
    const topic = topics.find((t) => t.id === selectedTopic)
    if (topic) activeChips.push({ label: topic.name, onRemove: () => { setSelectedTopic(''); handleFilterChange() } })
  }
  if (showWrittenOnly) activeChips.push({ label: 'Completed', onRemove: () => { setShowWrittenOnly(false); handleFilterChange() } })
  if (showUnwrittenOnly) activeChips.push({ label: 'Not written', onRemove: () => { setShowUnwrittenOnly(false); handleFilterChange() } })

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar — desktop */}
      <aside className="hidden lg:block w-56 xl:w-64 shrink-0 sticky top-24 self-start">
        <PromptSidebar
          topics={topics}
          prompts={prompts}
          selectedType={selectedType}
          selectedTopic={selectedTopic}
          searchQuery={searchQuery}
          showWrittenOnly={showWrittenOnly}
          showUnwrittenOnly={showUnwrittenOnly}
          isAuthenticated={isAuthenticated}
          onTypeChange={(v) => { setSelectedType(v); handleFilterChange() }}
          onTopicChange={(v) => { setSelectedTopic(v); handleFilterChange() }}
          onSearchChange={(v) => { setSearchQuery(v); handleFilterChange() }}
          onWrittenOnlyChange={(v) => { setShowWrittenOnly(v); if (v) { setShowUnwrittenOnly(false) }; handleFilterChange() }}
          onUnwrittenOnlyChange={(v) => { setShowUnwrittenOnly(v); if (v) { setShowWrittenOnly(false) }; handleFilterChange() }}
          onReset={handleReset}
        />
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Featured prompt — hidden when filters active */}
        {!hasActiveFilters && (
          <FeaturedPrompt prompts={prompts} isAuthenticated={isAuthenticated} />
        )}

        {/* ── Mobile filter bar (< lg only) ── */}
        <div className="lg:hidden mb-4 flex flex-col gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400 pointer-events-none" />
            <Input
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); handleFilterChange() }}
              placeholder="Search prompts..."
              className="h-10 pl-9 border-ocean-200 bg-white focus-visible:ring-ocean-300"
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(''); handleFilterChange() }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Horizontal scroll — question type chips */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
            {/* "All" chip */}
            <button
              onClick={() => { setSelectedType(''); handleFilterChange() }}
              className={cn(
                'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                !selectedType
                  ? 'bg-ocean-600 text-white border-ocean-600'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-ocean-300 hover:text-ocean-700'
              )}
            >
              All types
            </button>

            {Object.entries(QUESTION_TYPES).map(([key, label]) => {
              const colors = MOBILE_TYPE_COLORS[key]
              const isActive = selectedType === key
              return (
                <button
                  key={key}
                  onClick={() => { setSelectedType(isActive ? '' : key); handleFilterChange() }}
                  className={cn(
                    'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                    isActive ? colors?.active : colors?.inactive,
                    !isActive && 'hover:border-ocean-200 hover:text-ocean-700'
                  )}
                >
                  <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', colors?.dot)} />
                  {label}
                </button>
              )
            })}
          </div>

          {/* Horizontal scroll — topic chips */}
          {topics.length > 0 && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none -mx-4 px-4">
              <button
                onClick={() => { setSelectedTopic(''); handleFilterChange() }}
                className={cn(
                  'flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  !selectedTopic
                    ? 'bg-orange-500 text-white border-orange-500'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-orange-300 hover:text-orange-700'
                )}
              >
                All topics
              </button>
              {topics.map((topic) => {
                const isActive = selectedTopic === topic.id
                return (
                  <button
                    key={topic.id}
                    onClick={() => { setSelectedTopic(isActive ? '' : topic.id); handleFilterChange() }}
                    className={cn(
                      'flex-shrink-0 inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                      isActive
                        ? 'bg-orange-100 text-orange-800 border-orange-300'
                        : 'bg-white text-slate-500 border-slate-200 hover:border-orange-200 hover:text-orange-700'
                    )}
                  >
                    {topic.name}
                  </button>
                )
              })}
            </div>
          )}

          {/* Status chips row — auth only */}
          {isAuthenticated && (
            <div className="flex gap-2">
              <button
                onClick={() => { setShowWrittenOnly(!showWrittenOnly); if (!showWrittenOnly) setShowUnwrittenOnly(false); handleFilterChange() }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  showWrittenOnly
                    ? 'bg-green-100 text-green-800 border-green-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-green-200 hover:text-green-700'
                )}
              >
                <CheckCircle className="h-3.5 w-3.5" />
                Completed
              </button>
              <button
                onClick={() => { setShowUnwrittenOnly(!showUnwrittenOnly); if (!showUnwrittenOnly) setShowWrittenOnly(false); handleFilterChange() }}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors',
                  showUnwrittenOnly
                    ? 'bg-amber-100 text-amber-800 border-amber-300'
                    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200 hover:text-amber-700'
                )}
              >
                <PenTool className="h-3.5 w-3.5" />
                Not written
              </button>
            </div>
          )}
        </div>

        {/* Result count divider */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
            <BookOpen className="inline h-3.5 w-3.5 mr-1 -mt-0.5 text-ocean-400" />
            {filtered.length} of {prompts.length} prompts
          </span>
          <div className="flex-1 h-px bg-ocean-100" />

          {/* Active filter chips — desktop only */}
          {activeChips.map((chip) => (
            <Badge
              key={chip.label}
              variant="outline"
              className="hidden lg:inline-flex text-xs bg-ocean-50 text-ocean-700 border-ocean-300 gap-1 pr-1.5 cursor-default"
            >
              {chip.label}
              <button
                onClick={chip.onRemove}
                className="ml-0.5 rounded-full hover:bg-ocean-200 p-0.5 transition-colors"
                aria-label={`Remove ${chip.label} filter`}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </Badge>
          ))}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-7 text-xs text-slate-400 hover:text-slate-600 px-2 shrink-0"
            >
              Clear all
            </Button>
          )}
        </div>

        {/* Prompt grid */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <BookOpen className="h-12 w-12 text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No prompts match the current filters.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your filters or search query.</p>
            <Button variant="ghost" size="sm" onClick={handleReset} className="mt-4 text-ocean-600 hover:text-ocean-700">
              Clear filters
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
              {filtered.slice(0, visibleCount).map((prompt) => (
                <PromptCard key={prompt.id} prompt={prompt} isAuthenticated={isAuthenticated} />
              ))}
            </div>
            {filtered.length > visibleCount && (
              <Button
                variant="ghost"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="mt-5 w-full text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50"
              >
                Show more ({filtered.length - visibleCount} remaining)
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
