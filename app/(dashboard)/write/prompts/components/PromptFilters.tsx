'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic } from '@/types/prompt'
import { X, Search } from 'lucide-react'

interface PromptFiltersProps {
  topics: PromptTopic[]
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
  const hasActiveFilters = selectedType || selectedTopic || searchQuery || showWrittenOnly || showUnwrittenOnly

  return (
    <div className="flex flex-wrap gap-3 items-center">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search prompts..."
          className="w-64 pl-9 border-ocean-200"
        />
      </div>

      <Select value={selectedType || 'all'} onValueChange={(v) => onTypeChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-52 border-ocean-200">
          <SelectValue placeholder="All question types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All question types</SelectItem>
          {Object.entries(QUESTION_TYPES).map(([key, label]) => (
            <SelectItem key={key} value={key}>{label}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={selectedTopic || 'all'} onValueChange={(v) => onTopicChange(v === 'all' ? '' : v)}>
        <SelectTrigger className="w-44 border-ocean-200">
          <SelectValue placeholder="All topics" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All topics</SelectItem>
          {topics.map((topic) => (
            <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isAuthenticated && (
        <div className="flex gap-2">
          <Button
            variant={showWrittenOnly ? 'secondary' : 'outline'}
            size="sm"
            className={showWrittenOnly ? 'bg-green-100 text-green-800 border-green-300' : 'border-ocean-200'}
            onClick={() => { onWrittenOnlyChange(!showWrittenOnly); if (!showWrittenOnly) onUnwrittenOnlyChange(false) }}
          >
            Completed
          </Button>
          <Button
            variant={showUnwrittenOnly ? 'secondary' : 'outline'}
            size="sm"
            className={showUnwrittenOnly ? 'bg-orange-100 text-orange-800 border-orange-300' : 'border-ocean-200'}
            onClick={() => { onUnwrittenOnlyChange(!showUnwrittenOnly); if (!showUnwrittenOnly) onWrittenOnlyChange(false) }}
          >
            Not written
          </Button>
        </div>
      )}

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={onReset} className="text-gray-500">
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}
    </div>
  )
}
