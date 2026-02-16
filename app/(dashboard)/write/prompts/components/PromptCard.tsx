'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, PenTool, Eye } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptWithUserEssay } from '@/types/prompt'

const QUESTION_TYPE_COLORS: Record<string, string> = {
  agree_disagree: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  advantages_disadvantages: 'bg-teal-100 text-teal-800 border-teal-200',
  problem_solution: 'bg-blue-100 text-blue-800 border-blue-200',
  two_part_question: 'bg-sky-100 text-sky-800 border-sky-200',
  positive_negative: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  discussion_both_views: 'bg-violet-100 text-violet-800 border-violet-200',
  mixed_hybrid: 'bg-slate-100 text-slate-800 border-slate-200',
}

interface PromptCardProps {
  prompt: PromptWithUserEssay
  isAuthenticated: boolean
}

export default function PromptCard({ prompt, isAuthenticated }: PromptCardProps) {
  const typeColor = QUESTION_TYPE_COLORS[prompt.question_type] || 'bg-gray-100 text-gray-800 border-gray-200'
  const typeName = QUESTION_TYPES[prompt.question_type] || prompt.question_type
  const hasEssay = !!prompt.user_essay

  return (
    <Card className="hover:shadow-md transition-shadow border-ocean-100">
      <CardContent className="p-5">
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={`text-xs font-medium ${typeColor}`}>
            {typeName}
          </Badge>
          {prompt.prompt_topics?.name && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              {prompt.prompt_topics.name}
            </Badge>
          )}
          {hasEssay && (
            <Badge className="text-xs bg-green-100 text-green-800 border-green-200 ml-auto">
              <CheckCircle className="h-3 w-3 mr-1" />
              Score: {prompt.user_essay!.overall_score ?? 'N/A'}
            </Badge>
          )}
        </div>

        <p className="text-sm text-gray-700 line-clamp-3 mb-4 leading-relaxed">
          {prompt.prompt_text}
        </p>

        <div className="flex gap-2">
          {hasEssay ? (
            <>
              <Button asChild variant="outline" size="sm" className="text-ocean-600 border-ocean-300 hover:bg-ocean-50">
                <Link href={`/write/${prompt.user_essay!.id}`}>
                  <Eye className="h-4 w-4 mr-1" />
                  View Result
                </Link>
              </Button>
              <Button asChild size="sm" className="bg-ocean-600 hover:bg-ocean-700 text-white">
                <Link href={`/write/prompts/${prompt.id}`}>
                  <PenTool className="h-4 w-4 mr-1" />
                  Write Again
                </Link>
              </Button>
            </>
          ) : isAuthenticated ? (
            <Button asChild size="sm" className="bg-ocean-600 hover:bg-ocean-700 text-white">
              <Link href={`/write/prompts/${prompt.id}`}>
                <PenTool className="h-4 w-4 mr-1" />
                Start Writing
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm" className="bg-ocean-600 hover:bg-ocean-700 text-white">
              <Link href={`/login?redirect=/write/prompts/${prompt.id}`}>
                <PenTool className="h-4 w-4 mr-1" />
                Sign in to Write
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
