import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Info, BookOpen } from 'lucide-react'
import PromptsListClient from './components/PromptsListClient'
import type { PromptWithUserEssay, PromptTopic } from '@/types/prompt'

export const metadata = {
  title: 'Write New Essay | IELTS Assistant',
  description: 'Choose from a library of IELTS Writing Task 2 prompts and practice with AI outline suggestions.',
}

export default async function PromptsPage() {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  // Fetch prompts with topic info
  const { data: promptsData } = await supabase
    .from('writing_prompts')
    .select('id, prompt_text, question_type, topic_id, created_by, created_at, updated_at, prompt_topics(id, name)')
    .order('created_at', { ascending: false })

  // Fetch topics for filter dropdown
  const { data: topicsData } = await supabase
    .from('prompt_topics')
    .select('id, name, created_at')
    .order('name', { ascending: true })

  // If authenticated, fetch user's essays linked to prompts
  let userEssayMap = new Map<string, { id: string; overall_score: number | null; created_at: string }>()

  if (user) {
    const { data: userEssays } = await supabase
      .from('essays')
      .select('id, prompt_id, overall_score, created_at')
      .eq('user_id', user.id)
      .not('prompt_id', 'is', null)
      .order('created_at', { ascending: false })

    if (userEssays) {
      for (const essay of userEssays) {
        if (essay.prompt_id && !userEssayMap.has(essay.prompt_id)) {
          userEssayMap.set(essay.prompt_id, {
            id: essay.id,
            overall_score: essay.overall_score,
            created_at: essay.created_at,
          })
        }
      }
    }
  }

  const prompts: PromptWithUserEssay[] = (promptsData || []).map((p) => ({
    ...p,
    prompt_topics: Array.isArray(p.prompt_topics) ? p.prompt_topics[0] : p.prompt_topics,
    user_essay: userEssayMap.get(p.id) || null,
  }))

  const topics: PromptTopic[] = topicsData || []

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-ocean-900 mb-2">Write New Essay</h1>
        <p className="text-ocean-600">
          Pick a prompt and start practicing — we recommend trying one per day for the best results.
        </p>
        {!user && (
          <div className="mt-4 flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm">
            <Info className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <span>Sign in to track your progress, save your writing sessions, and unlock AI outline suggestions.</span>
          </div>
        )}
      </div>

      {prompts.length === 0 ? (
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="py-16 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <p className="text-lg font-semibold text-slate-600">No prompts available yet.</p>
            <p className="text-sm text-slate-400 mt-1">Check back soon as our admins add new prompts.</p>
          </CardContent>
        </Card>
      ) : (
        <PromptsListClient
          prompts={prompts}
          topics={topics}
          isAuthenticated={!!user}
        />
      )}
    </div>
  )
}
