'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, PenTool, Eye, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
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

interface PromptCardProps {
  prompt: PromptWithUserEssay
  isAuthenticated: boolean
}

export default function PromptCard({ prompt, isAuthenticated }: PromptCardProps) {
  const typeColor = QUESTION_TYPE_COLORS[prompt.question_type] || 'bg-gray-100 text-gray-800 border-gray-200'
  const typeName = QUESTION_TYPES[prompt.question_type] || prompt.question_type
  const hasEssay = !!prompt.user_essay
  const isNew = (Date.now() - new Date(prompt.created_at).getTime()) < 7 * 24 * 60 * 60 * 1000

  const writeHref = `/write/prompts/${prompt.id}`
  const resultHref = hasEssay ? `/write/${prompt.user_essay!.id}` : null

  return (
    <Link href={writeHref} className="block group">
      <Card className={cn(
        'border-ocean-200 shadow-lg overflow-hidden relative transition-all duration-200',
        'group-hover:shadow-xl group-hover:-translate-y-0.5 group-hover:border-ocean-300',
        hasEssay && 'bg-gradient-to-br from-green-50/40 to-white'
      )}>
        {/* Watermark icon */}
        {hasEssay ? (
          <CheckCircle className="absolute right-2 top-2 h-48 w-48 text-green-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(34,197,94,0.3))]" />
        ) : (
          <PenTool className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
        )}

        <CardContent className="p-5 relative z-10 flex flex-col h-full">
          {/* Badges row */}
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge variant="outline" className={`text-xs font-medium ${typeColor}`}>
              {typeName}
            </Badge>
            {prompt.prompt_topics?.name && (
              <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300 font-medium">
                {prompt.prompt_topics.name}
              </Badge>
            )}
            {isNew && !hasEssay && (
              <Badge variant="outline" className="text-xs bg-amber-100 text-amber-700 border-amber-200">
                NEW
              </Badge>
            )}
            {hasEssay && (
              <Badge className="text-xs bg-green-100 text-green-800 border-green-200 ml-auto">
                <CheckCircle className="h-3 w-3 mr-1" />
                Score: {prompt.user_essay!.overall_score ?? 'N/A'}
              </Badge>
            )}
          </div>

          {/* Prompt text */}
          <p className="text-sm text-ocean-800 line-clamp-4 mb-4 leading-relaxed flex-1">
            {prompt.prompt_text}
          </p>

          {/* Footer action line */}
          <div className="flex items-center justify-between pt-3 border-t border-ocean-100">
            {hasEssay ? (
              /* Completed: show "View result" on left, "Write again →" on right */
              <>
                <span
                  onClick={(e) => { e.preventDefault(); if (resultHref) window.location.href = resultHref }}
                  className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-ocean-500 transition-colors duration-200 cursor-pointer"
                >
                  <Eye className="h-3.5 w-3.5" />
                  View result
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-ocean-600 group-hover:font-medium transition-all duration-200">
                  Write again
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </>
            ) : (
              /* Not written: single "Click to write →" */
              <span className="inline-flex items-center gap-1 text-xs text-slate-400 group-hover:text-ocean-600 group-hover:font-medium transition-all duration-200 ml-auto">
                {isAuthenticated ? 'Click to write' : 'Try writing'}
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
