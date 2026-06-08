'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic } from '@/types/prompt'
import { Search, BookOpen, CheckCircle, PenTool } from 'lucide-react'

interface PromptFiltersProps {
  topics: PromptTopic[]
  filteredCount: number
  totalCount: number
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

export default function PromptFilters({
  topics,
  filteredCount,
  totalCount,
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
}: PromptFiltersProps) {
  const hasActiveFilters = !!(selectedType || selectedTopic || searchQuery || showWrittenOnly || showUnwrittenOnly)

  return (
    <Card className="border-ocean-100 shadow-sm bg-ocean-50/50">
      <CardContent className="p-3 md:p-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Count pill */}
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ocean-700 bg-ocean-100 rounded-full px-3 py-1.5 flex-shrink-0">
            <BookOpen className="h-3.5 w-3.5" />
            {filteredCount} of {totalCount} prompts
          </span>

          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-ocean-400" />
            <Input
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search prompts..."
              className="h-8 text-xs w-48 sm:w-56 pl-8 border-ocean-200 bg-white"
            />
          </div>

          {/* Question type select */}
          <Select value={selectedType || 'all'} onValueChange={(v) => onTypeChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-44">
              <SelectValue placeholder="All question types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All question types</SelectItem>
              {Object.entries(QUESTION_TYPES).map(([key, label]) => (
                <SelectItem key={key} value={key}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Topic select */}
          <Select value={selectedTopic || 'all'} onValueChange={(v) => onTopicChange(v === 'all' ? '' : v)}>
            <SelectTrigger className="h-8 text-xs border-ocean-200 bg-white w-36">
              <SelectValue placeholder="All topics" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All topics</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Completion toggles */}
          {isAuthenticated && (
            <div className="flex gap-1.5">
              <Button
                variant={showWrittenOnly ? 'secondary' : 'outline'}
                size="sm"
                className={`h-8 text-xs ${showWrittenOnly ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200' : 'border-ocean-200 text-ocean-700 hover:bg-ocean-50'}`}
                onClick={() => { onWrittenOnlyChange(!showWrittenOnly); if (!showWrittenOnly) onUnwrittenOnlyChange(false) }}
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Button>
              <Button
                variant={showUnwrittenOnly ? 'secondary' : 'outline'}
                size="sm"
                className={`h-8 text-xs ${showUnwrittenOnly ? 'bg-orange-100 text-orange-800 border-orange-300 hover:bg-orange-200' : 'border-ocean-200 text-ocean-700 hover:bg-ocean-50'}`}
                onClick={() => { onUnwrittenOnlyChange(!showUnwrittenOnly); if (!showUnwrittenOnly) onWrittenOnlyChange(false) }}
              >
                <PenTool className="h-3 w-3 mr-1" />
                Not written
              </Button>
            </div>
          )}

          {/* Reset button — pushed to right */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            disabled={!hasActiveFilters}
            className="h-8 text-xs text-slate-500 hover:text-slate-700 sm:ml-auto"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
