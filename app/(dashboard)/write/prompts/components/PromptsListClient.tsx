'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { LayoutGrid, Layers, ChevronDown, CheckCircle } from 'lucide-react'
import PromptCard from './PromptCard'
import PromptFilters from './PromptFilters'
import ProgressBanner from './ProgressBanner'
import FeaturedPrompt from './FeaturedPrompt'
import type { PromptWithUserEssay, PromptTopic } from '@/types/prompt'

const INITIAL_VISIBLE = 6

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
  const [viewMode, setViewMode] = useState<'grouped' | 'grid'>('grouped')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const [flatVisibleCount, setFlatVisibleCount] = useState(12)

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

  const grouped = useMemo(() => {
    const map = new Map<string, PromptWithUserEssay[]>()
    for (const p of filtered) {
      const topicName = p.prompt_topics?.name || 'Uncategorized'
      if (!map.has(topicName)) map.set(topicName, [])
      map.get(topicName)!.push(p)
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b))
  }, [filtered])

  const completedCount = prompts.filter((p) => p.user_essay).length

  const handleReset = () => {
    setSelectedType('')
    setSelectedTopic('')
    setSearchQuery('')
    setShowWrittenOnly(false)
    setShowUnwrittenOnly(false)
  }

  const toggleGroupExpand = (groupName: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(groupName)) {
        next.delete(groupName)
      } else {
        next.add(groupName)
      }
      return next
    })
  }

  const hasActiveFilters = !!(selectedType || selectedTopic || searchQuery || showWrittenOnly || showUnwrittenOnly)

  return (
    <div>
      {/* Featured prompt */}
      {!hasActiveFilters && (
        <FeaturedPrompt prompts={prompts} isAuthenticated={isAuthenticated} />
      )}

      {/* Progress banner for authenticated users */}
      {isAuthenticated && (
        <ProgressBanner total={prompts.length} completed={completedCount} />
      )}

      {/* Filters */}
      <div className="mb-6">
        <PromptFilters
          topics={topics}
          selectedType={selectedType}
          selectedTopic={selectedTopic}
          searchQuery={searchQuery}
          showWrittenOnly={showWrittenOnly}
          showUnwrittenOnly={showUnwrittenOnly}
          isAuthenticated={isAuthenticated}
          onTypeChange={setSelectedType}
          onTopicChange={setSelectedTopic}
          onSearchChange={setSearchQuery}
          onWrittenOnlyChange={setShowWrittenOnly}
          onUnwrittenOnlyChange={setShowUnwrittenOnly}
          onReset={handleReset}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">No prompts found matching your filters.</p>
        </div>
      ) : (
        <>
          {/* Header with count and view toggle */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-500">
              {filtered.length} prompt{filtered.length !== 1 ? 's' : ''}
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === 'grouped' ? 'bg-ocean-50 text-ocean-700' : 'text-gray-400'}
                onClick={() => setViewMode('grouped')}
                title="Group by topic"
              >
                <Layers className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={viewMode === 'grid' ? 'bg-ocean-50 text-ocean-700' : 'text-gray-400'}
                onClick={() => { setViewMode('grid'); setFlatVisibleCount(12) }}
                title="Flat grid"
              >
                <LayoutGrid className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {viewMode === 'grouped' ? (
            <Accordion
              type="multiple"
              defaultValue={grouped.length > 0 ? [grouped[0][0]] : []}
            >
              {grouped.map(([topicName, groupPrompts]) => {
                const isExpanded = expandedGroups.has(topicName)
                const visiblePrompts = isExpanded ? groupPrompts : groupPrompts.slice(0, INITIAL_VISIBLE)
                const hasMore = groupPrompts.length > INITIAL_VISIBLE
                const completedInGroup = groupPrompts.filter((p) => p.user_essay).length

                return (
                  <AccordionItem key={topicName} value={topicName} className="border-b border-gray-200">
                    <AccordionTrigger className="hover:no-underline py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-ocean-900">{topicName}</span>
                        <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600 border-gray-300">
                          {groupPrompts.length} prompt{groupPrompts.length !== 1 ? 's' : ''}
                        </Badge>
                        {isAuthenticated && completedInGroup > 0 && (
                          <Badge variant="outline" className="text-xs bg-green-100 text-green-700 border-green-300">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            {completedInGroup} done
                          </Badge>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {visiblePrompts.map((prompt) => (
                          <PromptCard key={prompt.id} prompt={prompt} isAuthenticated={isAuthenticated} />
                        ))}
                      </div>
                      {hasMore && !isExpanded && (
                        <Button
                          variant="ghost"
                          onClick={() => toggleGroupExpand(topicName)}
                          className="mt-3 w-full text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50"
                        >
                          Show all {groupPrompts.length} prompts
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      )}
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filtered.slice(0, flatVisibleCount).map((prompt) => (
                  <PromptCard key={prompt.id} prompt={prompt} isAuthenticated={isAuthenticated} />
                ))}
              </div>
              {filtered.length > flatVisibleCount && (
                <Button
                  variant="ghost"
                  onClick={() => setFlatVisibleCount((prev) => prev + 12)}
                  className="mt-4 w-full text-ocean-600 hover:text-ocean-700 hover:bg-ocean-50"
                >
                  Show more ({filtered.length - flatVisibleCount} remaining)
                  <ChevronDown className="h-4 w-4 ml-1" />
                </Button>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
