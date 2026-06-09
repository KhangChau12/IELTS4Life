import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createServerClient } from '@/lib/supabase/server'
import type { Essay } from '@/types/essay'
import { EssayResultsClient } from './components/EssayResultsClient'

export async function generateMetadata({
  params,
}: {
  params: { essayId: string }
}): Promise<Metadata> {
  const supabase = createServerClient()
  const { data: essay } = await supabase
    .from('essays')
    .select('overall_score, prompt')
    .eq('id', params.essayId)
    .single()

  if (!essay) return { title: 'Essay Results | IELTS4Life' }

  const shortPrompt =
    essay.prompt.length > 100 ? essay.prompt.slice(0, 97) + '...' : essay.prompt
  const scoreText =
    essay.overall_score !== null ? `Band ${essay.overall_score.toFixed(1)}` : 'Essay Feedback'
  const title = `${scoreText} — IELTS Writing Feedback | IELTS4Life`
  const description = `View your AI-powered IELTS Writing Task 2 feedback for: "${shortPrompt}".`

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: { title, description, url: `https://ielts4life.com/score/${params.essayId}` },
  }
}

export default async function EssayResultsPage({
  params,
}: {
  params: { essayId: string }
}) {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: essay, error } = await supabase
    .from('essays')
    .select('*')
    .eq('id', params.essayId)
    .single()

  if (error || !essay) {
    redirect('/score')
  }

  const isGuest = essay.is_guest === true

  if (!isGuest && essay.user_id !== user?.id) {
    if (!user) {
      redirect('/login')
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profile?.role !== 'admin') {
      redirect('/score')
    }
  }

  const typedEssay = essay as Essay

  const { data: vocabData } = await supabase
    .from('vocabulary')
    .select('vocab_type')
    .eq('essay_id', params.essayId)

  const hasParaphrase = vocabData?.some(v => v.vocab_type === 'paraphrase') || false
  const hasTopic = vocabData?.some(v => v.vocab_type === 'topic') || false

  const criteria = [
    {
      name: 'Task Response',
      score: typedEssay.task_response_score,
      comment: typedEssay.task_response_comment,
      errors: typedEssay.task_response_errors,
      strengths: typedEssay.task_response_strengths,
    },
    {
      name: 'Coherence & Cohesion',
      score: typedEssay.coherence_cohesion_score,
      comment: typedEssay.coherence_cohesion_comment,
      errors: typedEssay.coherence_cohesion_errors,
      strengths: typedEssay.coherence_cohesion_strengths,
    },
    {
      name: 'Lexical Resource',
      score: typedEssay.lexical_resource_score,
      comment: typedEssay.lexical_resource_comment,
      errors: typedEssay.lexical_resource_errors,
      strengths: typedEssay.lexical_resource_strengths,
    },
    {
      name: 'Grammatical Accuracy',
      score: typedEssay.grammatical_accuracy_score,
      comment: typedEssay.grammatical_accuracy_comment,
      errors: typedEssay.grammatical_accuracy_errors,
      strengths: typedEssay.grammatical_accuracy_strengths,
    },
  ]

  const wordCount = typedEssay.essay_content.trim().split(/\s+/).filter(word => word.length > 0).length

  const scoredCriteria = criteria.filter((c) => c.score !== null) as Array<typeof criteria[number] & { score: number }>
  const highestCriterion = scoredCriteria.reduce<typeof scoredCriteria[number] | null>((best, current) => {
    if (!best || current.score > best.score) return current
    return best
  }, null)
  const lowestCriterion = scoredCriteria.reduce<typeof scoredCriteria[number] | null>((worst, current) => {
    if (!worst || current.score < worst.score) return current
    return worst
  }, null)

  const summaryItems = [
    typedEssay.overall_score !== null
      ? `Overall score ${typedEssay.overall_score.toFixed(1)} across ${wordCount} words`
      : `Essay submitted with ${wordCount} words, score still pending`,
    highestCriterion
      ? `Strongest area: ${highestCriterion.name} (${highestCriterion.score.toFixed(1)})`
      : 'No scored criteria available yet',
    lowestCriterion
      ? `Focus next on: ${lowestCriterion.name} (${lowestCriterion.score.toFixed(1)})`
      : 'Generate vocabulary to keep improving the draft',
  ]

  return (
    <EssayResultsClient
      essay={typedEssay}
      essayId={params.essayId}
      criteria={criteria}
      summaryItems={summaryItems}
      wordCount={wordCount}
      hasParaphrase={hasParaphrase}
      hasTopic={hasTopic}
      isGuest={isGuest}
      initialClassificationStatus={typedEssay.prompt_classification_status ?? 'unclassified'}
      initialPromptId={typedEssay.prompt_id ?? null}
      initialTopicId={typedEssay.essay_topic_id ?? null}
      initialQuestionType={typedEssay.essay_question_type ?? null}
      initialTopicName={typedEssay.essay_topic_name ?? null}
    />
  )
}
