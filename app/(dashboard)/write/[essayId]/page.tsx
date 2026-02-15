import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import type { Essay } from '@/types/essay'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { AlertCircle, CheckCircle2, FileText, BookOpen, Sparkles, Info } from 'lucide-react'
import { EssayImprovement } from './components/EssayImprovement'
import { VocabGenerateButtons } from './components/VocabGenerateButtons'
import { DetailedGuidance } from './components/DetailedGuidance'
import { GuestBanner } from '@/components/guest/GuestBanner'

interface CriterionData {
  name: string
  score: number | null
  comment: string | null
  errors: string[] | null
  strengths: string[] | null
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-500'
  if (score >= 8) return 'bg-gradient-to-r from-amber-500 to-yellow-500'
  if (score >= 7) return 'bg-green-600'
  if (score >= 5.5) return 'bg-yellow-600'
  return 'bg-red-600'
}

function formatCriterionScore(score: number | null, overallScore: number | null): string {
  if (score === null) return 'N/A'
  if (overallScore !== null && overallScore >= 8.0 && score >= 8) {
    return `${score.toFixed(0)}+`
  }
  return score.toFixed(1)
}

function CriterionCard({ criterion, overallScore }: { criterion: CriterionData; overallScore: number | null }) {
  const hasErrors = criterion.errors && criterion.errors.length > 0
  const hasStrengths = criterion.strengths && criterion.strengths.length > 0

  return (
    <Card className="border-ocean-200 shadow-lg hover:shadow-xl transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-ocean-800">{criterion.name}</CardTitle>
          <Badge
            className={`${getScoreColor(criterion.score)} text-white font-bold px-3 py-1 text-sm`}
          >
            {formatCriterionScore(criterion.score, overallScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {criterion.comment && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3">
            <p className="text-sm text-ocean-700 leading-relaxed">{criterion.comment}</p>
          </div>
        )}

        {/* Strengths Section */}
        {hasStrengths && (
          <Accordion type="single" collapsible className="border border-green-200 rounded-md">
            <AccordionItem value="strengths" className="border-0">
              <AccordionTrigger className="px-4 hover:bg-green-50 rounded-md">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-ocean-800">
                    Strengths ({criterion.strengths!.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {criterion.strengths!.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-green-800">
                      <span className="text-green-600 mt-0.5">✓</span>
                      <span>{strength}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {/* Errors Section */}
        {hasErrors && (
          <Accordion type="single" collapsible className="border border-red-200 rounded-md">
            <AccordionItem value="errors" className="border-0">
              <AccordionTrigger className="px-4 hover:bg-red-50 rounded-md">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="text-sm font-medium text-ocean-800">
                    Areas for Improvement ({criterion.errors!.length})
                  </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <ul className="space-y-2">
                  {criterion.errors!.map((error, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-red-800">
                      <span className="text-red-600 mt-0.5">•</span>
                      <span>{error}</span>
                    </li>
                  ))}
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        )}

        {!hasErrors && !hasStrengths && (
          <div className="flex items-center gap-2 text-ocean-700 bg-ocean-50 border border-ocean-200 rounded-md p-3">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm font-medium">No detailed feedback available</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
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
    redirect('/write')
  }

  const isGuest = essay.is_guest === true

  // Allow access if:
  // 1. Guest essay (is_guest = true)
  // 2. User owns the essay
  // 3. User is admin
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

  // Check if vocabulary exists
  const { data: vocabData } = await supabase
    .from('vocabulary')
    .select('vocab_type')
    .eq('essay_id', params.essayId)

  const hasParaphrase = vocabData?.some(v => v.vocab_type === 'paraphrase') || false
  const hasTopic = vocabData?.some(v => v.vocab_type === 'topic') || false

  const criteria: CriterionData[] = [
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

  return (
    <div className="max-w-6xl mx-auto">
      {/* Guest Banner */}
      {isGuest && <GuestBanner />}

      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ocean-800 mb-2">Essay Results</h1>
        <p className="text-ocean-600">Detailed scoring and feedback for your IELTS essay</p>
      </div>

      {/* Overall Score Card */}
      <Card className="border-ocean-300 shadow-lg mb-8 overflow-hidden">
        <div className={`${typedEssay.overall_score !== null && typedEssay.overall_score >= 8.0
          ? 'bg-amber-700'
          : 'bg-ocean-700'} text-white p-8`}>
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2 opacity-90">Overall Band Score</h2>
            <div className="text-6xl font-bold mb-2">
              {typedEssay.overall_score !== null
                ? (typedEssay.overall_score >= 8.0
                    ? `${typedEssay.overall_score.toFixed(1)}~9`
                    : typedEssay.overall_score.toFixed(1))
                : 'N/A'}
            </div>
            <p className="text-white/90 text-sm">
              IELTS Writing Task 2
            </p>
          </div>
        </div>

        {/* Band 8+ Disclaimer */}
        {typedEssay.overall_score !== null && typedEssay.overall_score >= 8.0 && (
          <div className="bg-amber-50 border-t border-amber-200 p-4">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-medium mb-1">Exceptional Achievement</p>
                <p className="text-amber-800 leading-relaxed">
                  At this level, scores often depend on examiner perception. You've reached an exceptional standard where it's difficult to identify specific areas for improvement.
                </p>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Essay Content */}
      <Card className="border-ocean-200 shadow-lg mb-8">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-ocean-600" />
            <CardTitle className="text-ocean-800">Your Essay</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-ocean-800 mb-2">Prompt</h3>
              <div className="bg-ocean-50 border border-ocean-200 rounded-md p-4">
                <p className="text-ocean-700 leading-relaxed">{typedEssay.prompt}</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-ocean-800 mb-2">Your Response</h3>
              <div className="bg-gray-50 border border-gray-200 rounded-md p-4">
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap font-mono text-sm">
                  {typedEssay.essay_content}
                </p>
              </div>
              <p className="text-sm text-ocean-600 mt-2">
                Word count: {typedEssay.essay_content.trim().split(/\s+/).filter(word => word.length > 0).length} words
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Criteria Cards */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ocean-800 mb-4">Detailed Criteria Scores</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {criteria.map((criterion, index) => (
            <CriterionCard key={index} criterion={criterion} overallScore={typedEssay.overall_score} />
          ))}
        </div>
      </div>

      {/* Essay Improvement Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-ocean-800 mb-4">Improved Essay Example</h2>
        <EssayImprovement
          essayId={params.essayId}
          originalEssay={essay.essay_content}
          initialImprovedEssay={essay.improved_essay}
          initialChanges={essay.improvement_changes}
        />
      </div>

      {/* Detailed Guidance Section */}
      <div className="mb-8">
        <DetailedGuidance
          essayId={params.essayId}
          hasImprovedEssay={!!essay.improved_essay}
          initialGuidance={essay.detailed_guidance}
        />
      </div>

      {/* Next Steps - Vocabulary */}
      <Card className="border-ocean-200 shadow-lg mb-6">
        <CardHeader className="border-b border-slate-100">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-ocean-600" />
            <CardTitle className="text-ocean-800">Improve Your Vocabulary</CardTitle>
          </div>
          <CardDescription>
            Generate paraphrase suggestions and discover topic-specific advanced vocabulary to enhance your writing.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <VocabGenerateButtons
            essayId={params.essayId}
            initialHasParaphrase={hasParaphrase}
            initialHasTopic={hasTopic}
          />
        </CardContent>
      </Card>

      {/* Footer Info */}
      <div className="mt-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
        <h3 className="font-semibold text-ocean-800 mb-2">Understanding Your Scores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-ocean-700">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span><strong>7.0+:</strong> Good to Excellent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
            <span><strong>5.5-6.5:</strong> Moderate to Competent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600"></div>
            <span><strong>&lt;5.5:</strong> Needs Improvement</span>
          </div>
        </div>
      </div>
    </div>
  )
}
