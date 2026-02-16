import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import PromptWritingClient from './components/PromptWritingClient'
import type { PromptOutlines, EssayDraft, WritingPrompt } from '@/types/prompt'

interface PageProps {
  params: { promptId: string }
}

export async function generateMetadata({ params }: PageProps) {
  return {
    title: 'Write Essay | IELTS Assistant',
  }
}

export default async function PromptWritingPage({ params }: PageProps) {
  const supabase = createServerClient()
  const { promptId } = params

  // Auth required — redirect guests to login
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?redirect=/write/prompts/${promptId}`)
  }

  // Fetch prompt
  const { data: promptData, error: promptError } = await supabase
    .from('writing_prompts')
    .select('id, prompt_text, question_type, topic_id, created_by, created_at, updated_at, prompt_topics(id, name)')
    .eq('id', promptId)
    .single()

  if (promptError || !promptData) {
    redirect('/write/prompts')
  }

  const prompt: WritingPrompt & { prompt_topics?: { id: string; name: string } } = {
    ...promptData,
    prompt_topics: Array.isArray(promptData.prompt_topics)
      ? promptData.prompt_topics[0]
      : promptData.prompt_topics,
  }

  // Fetch outlines (may be null if not generated yet)
  const { data: outlinesData } = await supabase
    .from('writing_prompt_outlines')
    .select('*')
    .eq('prompt_id', promptId)
    .single()

  // Fetch user's draft (may be null)
  const { data: draftData } = await supabase
    .from('essay_drafts')
    .select('*')
    .eq('user_id', user.id)
    .eq('prompt_id', promptId)
    .single()

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <div className="mb-4">
        <nav className="text-sm text-gray-400 mb-2">
          <a href="/write/prompts" className="hover:text-ocean-600">Prompts</a>
          <span className="mx-2">/</span>
          <span className="text-gray-600">Write Essay</span>
        </nav>
      </div>

      <PromptWritingClient
        prompt={prompt}
        initialOutlines={(outlinesData as PromptOutlines) || null}
        initialDraft={(draftData as EssayDraft) || null}
      />
    </div>
  )
}
