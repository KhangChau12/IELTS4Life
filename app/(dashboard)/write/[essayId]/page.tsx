import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import type { Essay } from '@/types/essay'
import { EssayResultsClient } from './components/EssayResultsClient'

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
    redirect('/write')
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
      redirect('/write')
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
    />
  )
}
