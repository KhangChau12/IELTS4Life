import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import PromptWritingClient from './components/PromptWritingClient'
import type { PromptOutlines, EssayDraft, WritingPrompt } from '@/types/prompt'

interface PageProps {
  params: { promptId: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = createServerClient()
  const { promptId } = params

  const { data: prompt } = await supabase
    .from('writing_prompts')
    .select('prompt_text, question_type, prompt_topics(name)')
    .eq('id', promptId)
    .single()

  if (!prompt) {
    return { title: 'IELTS Writing Practice | IELTS4Life' }
  }

  const shortPrompt = prompt.prompt_text.length > 120
    ? prompt.prompt_text.slice(0, 117) + '...'
    : prompt.prompt_text

  const topicName = Array.isArray(prompt.prompt_topics)
    ? (prompt.prompt_topics[0] as { name: string } | undefined)?.name
    : (prompt.prompt_topics as { name: string } | null)?.name

  const title = topicName
    ? `IELTS Writing: ${topicName} — Practice & AI Scoring | IELTS4Life`
    : `IELTS Writing Task 2 Practice | IELTS4Life`

  return {
    title,
    description: `Practice IELTS Writing Task 2: "${shortPrompt}" — Get instant AI band score feedback.`,
    alternates: {
      canonical: `https://ielts4life.com/write/prompts/${promptId}`,
    },
    openGraph: {
      title,
      description: `Practice IELTS Writing Task 2 with AI scoring and outline suggestions.`,
      url: `https://ielts4life.com/write/prompts/${promptId}`,
    },
  }
}

export default async function PromptWritingPage({ params }: PageProps) {
  const supabase = createServerClient()
  const { promptId } = params

  // Detect guest vs authenticated — do NOT redirect guests
  const { data: { user } } = await supabase.auth.getUser()
  const isGuest = !user

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

  // Only fetch draft for authenticated users
  let draftData: EssayDraft | null = null
  if (user) {
    const { data } = await supabase
      .from('essay_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_id', promptId)
      .single()
    draftData = data as EssayDraft | null
  }

  // JSON-LD structured data for SEO
  const topicName = prompt.prompt_topics?.name
  const shortPrompt = prompt.prompt_text.length > 160
    ? prompt.prompt_text.slice(0, 157) + '...'
    : prompt.prompt_text

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: topicName
      ? `IELTS Writing Task 2: ${topicName}`
      : 'IELTS Writing Task 2 Practice Prompt',
    description: shortPrompt,
    educationalLevel: 'Advanced',
    learningResourceType: 'Practice Problem',
    inLanguage: 'en',
    url: `https://ielts4life.com/write/prompts/${promptId}`,
    provider: {
      '@type': 'Organization',
      name: 'IELTS4Life',
      url: 'https://ielts4life.com',
    },
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
        initialDraft={draftData}
        isGuest={isGuest}
      />
    </div>
  )
}
