'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Search, CheckCircle, PenTool, RotateCcw } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptWithUserEssay, PromptTopic } from '@/types/prompt'

const QUESTION_TYPE_COLORS: Record<string, { dot: string; active: string }> = {
  agree_disagree:           { dot: 'bg-cyan-400',    active: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  advantages_disadvantages: { dot: 'bg-teal-400',    active: 'bg-teal-50 text-teal-800 border-teal-200' },
  problem_solution:         { dot: 'bg-blue-400',    active: 'bg-blue-50 text-blue-800 border-blue-200' },
  two_part_question:        { dot: 'bg-sky-400',     active: 'bg-sky-50 text-sky-800 border-sky-200' },
  positive_negative:        { dot: 'bg-emerald-400', active: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  discussion_both_views:    { dot: 'bg-violet-400',  active: 'bg-violet-50 text-violet-800 border-violet-200' },
  mixed_hybrid:             { dot: 'bg-slate-400',   active: 'bg-slate-50 text-slate-700 border-slate-200' },
}

interface PromptSidebarProps {
  topics: PromptTopic[]
  prompts: PromptWithUserEssay[]
  selectedType: string
  selectedTopic: string
  searchQuery: string
  showWrittenOnly: boolean
  showUnwrittenOnly: boolean
  isAuthenticated: boolean
  onTypeChange: (value: string) => void
  onTopicChange: (value: string) => void
  onSearchChange: (value: string) => void
  onWrittenOnlyChange: (value: boolean) => void
  onUnwrittenOnlyChange: (value: boolean) => void
  onReset: () => void
}

export default function PromptSidebar({
  topics,
  prompts,
  selectedType,
  selectedTopic,
  searchQuery,
  showWrittenOnly,
  showUnwrittenOnly,
  isAuthenticated,
  onTypeChange,
  onTopicChange,
  onSearchChange,
  onWrittenOnlyChange,
  onUnwrittenOnlyChange,
  onReset,
}: PromptSidebarProps) {
  const hasActiveFilters = !!(selectedType || selectedTopic || searchQuery || showWrittenOnly || showUnwrittenOnly)

  // Count prompts per type for the sidebar
  const typeCounts = prompts.reduce<Record<string, number>>((acc, p) => {
    acc[p.question_type] = (acc[p.question_type] || 0) + 1
    return acc
  }, {})

  // Count prompts per topic
  const topicCounts = prompts.reduce<Record<string, number>>((acc, p) => {
    if (p.topic_id) acc[p.topic_id] = (acc[p.topic_id] || 0) + 1
    return acc
  }, {})

  return (
    <div className="flex flex-col gap-5">
      {/* Search */}
      <div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ocean-400 pointer-events-none" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search prompts..."
            className="h-9 text-sm pl-8 border-ocean-200 bg-white focus-visible:ring-ocean-300"
          />
        </div>
      </div>

      {/* Status filter — auth only */}
      {isAuthenticated && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Status</p>
          <div className="flex flex-col gap-1">
            <button
              onClick={() => onWrittenOnlyChange(!showWrittenOnly)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left border',
                showWrittenOnly
                  ? 'bg-green-50 text-green-800 border-green-200'
                  : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <CheckCircle className={cn('h-4 w-4 shrink-0', showWrittenOnly ? 'text-green-500' : 'text-slate-300')} />
              Completed
            </button>
            <button
              onClick={() => onUnwrittenOnlyChange(!showUnwrittenOnly)}
              className={cn(
                'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left border',
                showUnwrittenOnly
                  ? 'bg-amber-50 text-amber-800 border-amber-200'
                  : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
              )}
            >
              <PenTool className={cn('h-4 w-4 shrink-0', showUnwrittenOnly ? 'text-amber-500' : 'text-slate-300')} />
              Not written
            </button>
          </div>
        </div>
      )}

      {/* Question type */}
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Question Type</p>
        <div className="flex flex-col gap-0.5">
          <button
            onClick={() => onTypeChange('')}
            className={cn(
              'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
              !selectedType
                ? 'bg-ocean-100 text-ocean-800 font-semibold'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            )}
          >
            <span>All types</span>
            <span className="text-xs tabular-nums text-slate-400">{prompts.length}</span>
          </button>
          {Object.entries(QUESTION_TYPES).map(([key, label]) => {
            const colors = QUESTION_TYPE_COLORS[key]
            const isActive = selectedType === key
            const count = typeCounts[key] || 0
            return (
              <button
                key={key}
                onClick={() => onTypeChange(isActive ? '' : key)}
                className={cn(
                  'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left border',
                  isActive
                    ? cn('font-semibold', colors?.active || 'bg-ocean-50 text-ocean-800 border-ocean-200')
                    : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
                )}
              >
                <span className={cn('h-2 w-2 rounded-full shrink-0', colors?.dot || 'bg-slate-300')} />
                <span className="flex-1 leading-tight">{label}</span>
                <span className="text-xs tabular-nums text-slate-400 shrink-0">{count}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Topics */}
      {topics.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Topic</p>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => onTopicChange('')}
              className={cn(
                'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                !selectedTopic
                  ? 'bg-ocean-100 text-ocean-800 font-semibold'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
              )}
            >
              <span>All topics</span>
              <span className="text-xs tabular-nums text-slate-400">{prompts.length}</span>
            </button>
            {topics.map((topic) => {
              const isActive = selectedTopic === topic.id
              const count = topicCounts[topic.id] || 0
              return (
                <button
                  key={topic.id}
                  onClick={() => onTopicChange(isActive ? '' : topic.id)}
                  className={cn(
                    'flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors text-left border',
                    isActive
                      ? 'bg-orange-50 text-orange-800 border-orange-200 font-semibold'
                      : 'text-slate-600 border-transparent hover:bg-slate-50 hover:text-slate-800'
                  )}
                >
                  <span className="truncate pr-2">{topic.name}</span>
                  <span className="text-xs tabular-nums text-slate-400 shrink-0">{count}</span>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Reset */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-full h-8 text-xs text-slate-400 hover:text-slate-600 gap-1.5 border border-dashed border-slate-200 hover:border-slate-300"
        >
          <RotateCcw className="h-3 w-3" />
          Reset all filters
        </Button>
      )}
    </div>
  )
}
