'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, PenTool, RefreshCw, Clock } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptWithUserEssay } from '@/types/prompt'

const QUESTION_TYPE_COLORS: Record<string, string> = {
  agree_disagree:           'bg-cyan-200 text-cyan-800 border-cyan-300',
  advantages_disadvantages: 'bg-teal-200 text-teal-800 border-teal-300',
  problem_solution:         'bg-blue-200 text-blue-800 border-blue-300',
  two_part_question:        'bg-sky-200 text-sky-800 border-sky-300',
  positive_negative:        'bg-emerald-200 text-emerald-800 border-emerald-300',
  discussion_both_views:    'bg-violet-200 text-violet-800 border-violet-300',
  mixed_hybrid:             'bg-slate-200 text-slate-700 border-slate-300',
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

  // reason text + suggestion pool
  const { suggestedPool, reasonText } = useMemo(() => {
    if (unwrittenPrompts.length === 0) {
      return { suggestedPool: prompts, reasonText: "You've completed all prompts — try again!" }
    }
    if (!isAuthenticated) {
      return { suggestedPool: unwrittenPrompts, reasonText: 'A great place to start' }
    }

    const typeCounts: Record<string, number> = {}
    for (const p of prompts) {
      if (p.user_essay) {
        typeCounts[p.question_type] = (typeCounts[p.question_type] || 0) + 1
      }
    }

    const unwrittenTypes = Array.from(new Set(unwrittenPrompts.map((p) => p.question_type)))
    const minCount = Math.min(...unwrittenTypes.map((t) => typeCounts[t] || 0))
    const leastPracticed = unwrittenPrompts.filter(
      (p) => (typeCounts[p.question_type] || 0) === minCount
    )

    const leastPracticedPool = leastPracticed.length > 0 ? leastPracticed : unwrittenPrompts
    const leastType = leastPracticedPool[0]?.question_type
    const leastTypeName = leastType ? QUESTION_TYPES[leastType] : null
    const reason = leastTypeName && minCount === 0
      ? `You haven't tried ${leastTypeName} yet`
      : leastTypeName
        ? `You have fewer ${leastTypeName} essays — good to practice`
        : 'Based on your writing history'

    return { suggestedPool: leastPracticedPool, reasonText: reason }
  }, [prompts, unwrittenPrompts, isAuthenticated])

  const [index, setIndex] = useState(0)
  const featured = suggestedPool[index % suggestedPool.length]
  if (!featured) return null

  const typeName = QUESTION_TYPES[featured.question_type] || featured.question_type
  const typeColor = QUESTION_TYPE_COLORS[featured.question_type] || 'bg-slate-200 text-slate-700 border-slate-300'

  const handleAnother = () => setIndex((prev) => (prev + 1) % suggestedPool.length)

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-ocean-600 to-cyan-600 overflow-hidden relative mb-4 sm:mb-5">
      <PenTool className="absolute right-2 top-2 h-40 w-40 sm:h-48 sm:w-48 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />

      <CardContent className="relative z-10 p-4 sm:p-6">
        {/* Header row */}
        <div className="flex items-center justify-between gap-3 mb-2 sm:mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 text-white/70 text-xs">
            <Sparkles className="h-3 w-3 shrink-0" />
            <span className="font-medium">Suggested for you</span>
            <span className="text-white/40 hidden sm:inline">·</span>
            <span className="hidden sm:inline">{reasonText}</span>
          </div>
          <div className="flex items-center gap-1 text-white/50 text-xs shrink-0">
            <Clock className="h-3 w-3" />
            ~40 min
          </div>
        </div>

        {/* Reason — mobile only */}
        <p className="text-white/50 text-xs mb-2 sm:hidden">{reasonText}</p>

        {/* Type + topic badges */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <Badge className={`text-[11px] sm:text-xs font-medium border ${typeColor}`}>
            {typeName}
          </Badge>
          {featured.prompt_topics?.name && (
            <Badge className="text-[11px] sm:text-xs bg-white/20 text-white border-white/30 border font-medium">
              {featured.prompt_topics.name}
            </Badge>
          )}
        </div>

        {/* Prompt text */}
        <p className="text-sm sm:text-base text-white/95 leading-relaxed mb-4 sm:mb-5">
          {featured.prompt_text}
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 sm:gap-3">
          <Button asChild size="sm" className="bg-white text-ocean-700 hover:bg-ocean-50 font-semibold shadow-sm h-8 sm:h-9 text-xs sm:text-sm px-3 sm:px-4">
            <Link href={isAuthenticated ? `/write/${featured.id}` : `/login?redirect=/write/${featured.id}`}>
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
              {isAuthenticated ? 'Start Writing' : 'Sign in to Write'}
            </Link>
          </Button>
          {suggestedPool.length > 1 && (
            <Button variant="ghost" size="sm" onClick={handleAnother} className="text-white/70 hover:text-white hover:bg-white/10 gap-1 sm:gap-1.5 h-8 sm:h-9 text-xs sm:text-sm px-2 sm:px-3">
              <RefreshCw className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              Another
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export { QUESTION_TYPE_COLORS }
