import { createServerClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { BookOpen, FileText } from 'lucide-react'
import { VocabularyList } from './components/VocabularyList'

interface EssayWithVocab {
  id: string
  prompt: string
  created_at: string
  overall_score: number | null
  hasParaphraseVocab: boolean
  hasTopicVocab: boolean
  paraphraseStatus: {
    hasViewed: boolean
    quizScore: number | null
    totalQuestions: number | null
  }
  topicStatus: {
    hasViewed: boolean
    quizScore: number | null
    totalQuestions: number | null
  }
}

async function getEssaysWithVocabulary(): Promise<EssayWithVocab[]> {
  const supabase = createServerClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Run all 4 queries in parallel instead of N+1 per essay
  const [essaysResult, vocabResult, viewsResult, quizResult] = await Promise.all([
    supabase
      .from('essays')
      .select('id, prompt, created_at, overall_score')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('vocabulary')
      .select('essay_id, vocab_type')
      .eq('user_id', user.id),
    supabase
      .from('vocabulary_views')
      .select('essay_id, vocab_type')
      .eq('user_id', user.id),
    supabase
      .from('vocabulary_quiz_attempts')
      .select('essay_id, vocab_type, score, total_questions, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  if (essaysResult.error || !essaysResult.data?.length) {
    return []
  }

  const essays = essaysResult.data
  const allVocab = vocabResult.data || []
  const allViews = viewsResult.data || []
  const allQuiz = quizResult.data || []

  // Build lookup sets for O(1) access
  const vocabSet = new Set(allVocab.map(v => `${v.essay_id}:${v.vocab_type}`))
  const viewsSet = new Set(allViews.map(v => `${v.essay_id}:${v.vocab_type}`))

  // Build quiz lookup: latest score per essay+type (already ordered by created_at desc)
  const quizMap = new Map<string, { score: number; total_questions: number }>()
  for (const q of allQuiz) {
    const key = `${q.essay_id}:${q.vocab_type}`
    if (!quizMap.has(key)) {
      quizMap.set(key, { score: q.score, total_questions: q.total_questions })
    }
  }

  return essays.map((essay) => {
    const paraphraseQuiz = quizMap.get(`${essay.id}:paraphrase`)
    const topicQuiz = quizMap.get(`${essay.id}:topic`)

    return {
      id: essay.id,
      prompt: essay.prompt,
      created_at: essay.created_at,
      overall_score: essay.overall_score,
      hasParaphraseVocab: vocabSet.has(`${essay.id}:paraphrase`),
      hasTopicVocab: vocabSet.has(`${essay.id}:topic`),
      paraphraseStatus: {
        hasViewed: viewsSet.has(`${essay.id}:paraphrase`),
        quizScore: paraphraseQuiz?.score ?? null,
        totalQuestions: paraphraseQuiz?.total_questions ?? null,
      },
      topicStatus: {
        hasViewed: viewsSet.has(`${essay.id}:topic`),
        quizScore: topicQuiz?.score ?? null,
        totalQuestions: topicQuiz?.total_questions ?? null,
      },
    }
  })
}

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function VocabularyPage() {
  const essays = await getEssaysWithVocabulary()

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6 md:mb-8 animate-fadeInUp">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-700 to-cyan-700 bg-clip-text text-transparent mb-2">Vocabulary Builder</h1>
        <p className="text-sm md:text-base text-ocean-600">
          Generate and practice vocabulary from your essays
        </p>
      </div>

      {essays.length === 0 ? (
        <Card className="border-ocean-200 card-premium shadow-colored animate-fadeInUp">
          <CardContent className="pt-8 pb-8 md:pt-12 md:pb-12 text-center px-4">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="rounded-full bg-gradient-to-br from-ocean-100 to-cyan-100 p-4 md:p-6 shadow-md">
                <BookOpen className="h-10 w-10 md:h-12 md:w-12 text-ocean-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold bg-gradient-to-r from-ocean-700 to-cyan-700 bg-clip-text text-transparent">No Essays Yet</h3>
              <p className="text-sm md:text-base text-ocean-600 max-w-md px-4">
                You need to submit at least one essay before you can generate vocabulary.
                Head over to the Write page to get started!
              </p>
              <Link href="/write">
                <Button className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white mt-4 shadow-md hover:shadow-lg transition-all text-sm md:text-base">
                  <FileText className="mr-2 h-4 w-4" />
                  Write an Essay
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <VocabularyList essays={essays} />
      )}
    </div>
  )
}
