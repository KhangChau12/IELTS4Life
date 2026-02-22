'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Sparkles, PenTool, RefreshCw } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptWithUserEssay } from '@/types/prompt'

const QUESTION_TYPE_COLORS: Record<string, string> = {
  agree_disagree: 'bg-cyan-200 text-cyan-800 border-cyan-300',
  advantages_disadvantages: 'bg-teal-200 text-teal-800 border-teal-300',
  problem_solution: 'bg-blue-200 text-blue-800 border-blue-300',
  two_part_question: 'bg-sky-200 text-sky-800 border-sky-300',
  positive_negative: 'bg-emerald-200 text-emerald-800 border-emerald-300',
  discussion_both_views: 'bg-violet-200 text-violet-800 border-violet-300',
  mixed_hybrid: 'bg-slate-200 text-slate-700 border-slate-300',
}

interface FeaturedPromptProps {
  prompts: PromptWithUserEssay[]
  isAuthenticated: boolean
}

export default function FeaturedPrompt({ prompts, isAuthenticated }: FeaturedPromptProps) {
  const unwrittenPrompts = useMemo(
    () => prompts.filter((p) => !p.user_essay),
    [prompts]
  )

  // Pick a suggested prompt: prefer question types user has practiced least
  const suggestedPool = useMemo(() => {
    if (unwrittenPrompts.length === 0) return prompts
    if (!isAuthenticated) return unwrittenPrompts

    // Count completed essays per question type
    const typeCounts: Record<string, number> = {}
    for (const p of prompts) {
      if (p.user_essay) {
        typeCounts[p.question_type] = (typeCounts[p.question_type] || 0) + 1
      }
    }

    // Find the min count among types that have unwritten prompts
    const unwrittenTypes = Array.from(new Set(unwrittenPrompts.map((p) => p.question_type)))
    const minCount = Math.min(...unwrittenTypes.map((t) => typeCounts[t] || 0))

    // Filter to unwritten prompts of least-practiced types
    const leastPracticed = unwrittenPrompts.filter(
      (p) => (typeCounts[p.question_type] || 0) === minCount
    )

    return leastPracticed.length > 0 ? leastPracticed : unwrittenPrompts
  }, [prompts, unwrittenPrompts, isAuthenticated])

  const [index, setIndex] = useState(0)

  const featured = suggestedPool[index % suggestedPool.length]
  if (!featured) return null

  const typeColor = QUESTION_TYPE_COLORS[featured.question_type] || 'bg-gray-100 text-gray-800 border-gray-200'
  const typeName = QUESTION_TYPES[featured.question_type] || featured.question_type

  const handleAnother = () => {
    setIndex((prev) => (prev + 1) % suggestedPool.length)
  }

  return (
    <div className="bg-white border border-ocean-200 border-l-4 border-l-ocean-500 rounded-xl p-6 mb-6 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 bg-ocean-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
          <Sparkles className="h-3 w-3" />
          Suggested for you
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className={`text-xs font-medium ${typeColor}`}>
          {typeName}
        </Badge>
        {featured.prompt_topics?.name && (
          <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300 font-medium">
            {featured.prompt_topics.name}
          </Badge>
        )}
      </div>

      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        {featured.prompt_text}
      </p>

      <div className="flex items-center gap-3">
        <Button asChild size="sm" className="bg-ocean-600 hover:bg-ocean-700 text-white">
          <Link href={isAuthenticated ? `/write/prompts/${featured.id}` : `/login?redirect=/write/prompts/${featured.id}`}>
            <PenTool className="h-4 w-4 mr-1" />
            {isAuthenticated ? 'Start Writing' : 'Sign in to Write'}
          </Link>
        </Button>
        {suggestedPool.length > 1 && (
          <Button variant="ghost" size="sm" onClick={handleAnother} className="text-ocean-600 hover:text-ocean-700">
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Show me another
          </Button>
        )}
      </div>
    </div>
  )
}
