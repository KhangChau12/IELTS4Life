'use client'

import { useState, useMemo } from 'react'
import PromptCard from './PromptCard'
import PromptFilters from './PromptFilters'
import type { PromptWithUserEssay, PromptTopic } from '@/types/prompt'

interface PromptsListClientProps {
  prompts: PromptWithUserEssay[]
  topics: PromptTopic[]
  isAuthenticated: boolean
}

export default function PromptsListClient({ prompts, topics, isAuthenticated }: PromptsListClientProps) {
  const [selectedType, setSelectedType] = useState('')
  const [selectedTopic, setSelectedTopic] = useState('')
  const [showWrittenOnly, setShowWrittenOnly] = useState(false)
  const [showUnwrittenOnly, setShowUnwrittenOnly] = useState(false)

  const filtered = useMemo(() => {
    return prompts.filter((p) => {
      if (selectedType && p.question_type !== selectedType) return false
      if (selectedTopic && p.topic_id !== selectedTopic) return false
      if (showWrittenOnly && !p.user_essay) return false
      if (showUnwrittenOnly && p.user_essay) return false
      return true
    })
  }, [prompts, selectedType, selectedTopic, showWrittenOnly, showUnwrittenOnly])

  const handleReset = () => {
    setSelectedType('')
    setSelectedTopic('')
    setShowWrittenOnly(false)
    setShowUnwrittenOnly(false)
  }

  return (
    <div>
      <div className="mb-6">
        <PromptFilters
          topics={topics}
          selectedType={selectedType}
          selectedTopic={selectedTopic}
          showWrittenOnly={showWrittenOnly}
          showUnwrittenOnly={showUnwrittenOnly}
          isAuthenticated={isAuthenticated}
          onTypeChange={setSelectedType}
          onTopicChange={setSelectedTopic}
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
          <p className="text-sm text-gray-500 mb-4">{filtered.length} prompt{filtered.length !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((prompt) => (
              <PromptCard key={prompt.id} prompt={prompt} isAuthenticated={isAuthenticated} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
