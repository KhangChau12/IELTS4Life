'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Lightbulb } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { QUESTION_TYPES } from '@/types/prompt'
import OutlinesPanel from './OutlinesPanel'
import WritingPanel from './WritingPanel'
import type { PromptOutlines, EssayDraft, WritingPrompt } from '@/types/prompt'

interface PromptWritingClientProps {
  prompt: WritingPrompt & { prompt_topics?: { id: string; name: string } }
  initialOutlines: PromptOutlines | null
  initialDraft: EssayDraft | null
  isGuest: boolean
}

export default function PromptWritingClient({
  prompt,
  initialOutlines,
  initialDraft,
  isGuest,
}: PromptWritingClientProps) {
  const router = useRouter()
  const [outlineOpen, setOutlineOpen] = useState(false)

  const handleSubmitSuccess = (essayId: string) => {
    router.push(`/score/${essayId}`)
  }

  const typeName = QUESTION_TYPES[prompt.question_type] || prompt.question_type

  return (
    <>
      {/* Desktop: side-by-side (left=outlines, right=writing) */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-6 h-full">
        <div className="lg:overflow-y-auto">
          <OutlinesPanel prompt={prompt} initialOutlines={initialOutlines} isGuest={isGuest} />
        </div>
        <div className="lg:overflow-y-auto">
          <WritingPanel
            promptId={prompt.id}
            promptText={prompt.prompt_text}
            initialDraft={initialDraft}
            onSubmitSuccess={handleSubmitSuccess}
            isGuest={isGuest}
          />
        </div>
      </div>

      {/* Mobile: prompt card first, writing panel, then collapsible outlines */}
      <div className="lg:hidden flex flex-col gap-4">
        {/* Prompt card — always visible on mobile */}
        <Card className="border-ocean-100">
          <CardContent className="px-4 py-3">
            <div className="flex flex-wrap gap-1.5 mb-2">
              <Badge variant="outline" className="text-[11px] bg-teal-50 text-teal-800 border-teal-200">
                {typeName}
              </Badge>
              {prompt.prompt_topics?.name && (
                <Badge variant="outline" className="text-[11px] bg-orange-50 text-orange-700 border-orange-200">
                  {prompt.prompt_topics.name}
                </Badge>
              )}
            </div>
            <p className="text-xs text-gray-700 leading-relaxed">{prompt.prompt_text}</p>
          </CardContent>
        </Card>

        <WritingPanel
          promptId={prompt.id}
          promptText={prompt.prompt_text}
          initialDraft={initialDraft}
          onSubmitSuccess={handleSubmitSuccess}
          isGuest={isGuest}
        />

        {/* Collapsible AI outlines toggle */}
        <div>
          <button
            onClick={() => setOutlineOpen((prev) => !prev)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-ocean-200 bg-ocean-50 text-ocean-700 text-sm font-medium hover:bg-ocean-100 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              AI Outline Suggestions
            </span>
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${outlineOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {outlineOpen && (
            <div className="mt-3">
              <OutlinesPanel prompt={prompt} initialOutlines={initialOutlines} isGuest={isGuest} />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
