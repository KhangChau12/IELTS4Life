'use client'

import { useRouter } from 'next/navigation'
import OutlinesPanel from './OutlinesPanel'
import WritingPanel from './WritingPanel'
import type { PromptOutlines, EssayDraft, WritingPrompt } from '@/types/prompt'

interface PromptWritingClientProps {
  prompt: WritingPrompt & { prompt_topics?: { id: string; name: string } }
  initialOutlines: PromptOutlines | null
  initialDraft: EssayDraft | null
}

export default function PromptWritingClient({
  prompt,
  initialOutlines,
  initialDraft,
}: PromptWritingClientProps) {
  const router = useRouter()

  const handleSubmitSuccess = (essayId: string) => {
    router.push(`/write/${essayId}`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left: Prompt + Outlines */}
      <div className="lg:overflow-y-auto">
        <OutlinesPanel prompt={prompt} initialOutlines={initialOutlines} />
      </div>

      {/* Right: Timer + Writing */}
      <div className="lg:overflow-y-auto">
        <WritingPanel
          promptId={prompt.id}
          promptText={prompt.prompt_text}
          initialDraft={initialDraft}
          onSubmitSuccess={handleSubmitSuccess}
        />
      </div>
    </div>
  )
}
