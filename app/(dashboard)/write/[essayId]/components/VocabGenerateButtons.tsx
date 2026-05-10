'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Sparkles,
  BookOpen,
  GraduationCap,
  BarChart3,
  Zap,
  Loader2,
  ArrowRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const PREVIEW_COUNT = 3

interface VocabPreviewItem {
  suggested_word: string
  definition: string
  original_word: string | null
}

interface VocabGenerateButtonsProps {
  essayId: string
  initialHasParaphrase: boolean
  initialHasTopic: boolean
}

function VocabPreviewCard({ item }: { item: VocabPreviewItem }) {
  return (
    <div className="border border-ocean-200 rounded-lg p-3 bg-white hover:shadow-md transition-shadow space-y-1.5">
      <p className="font-bold text-ocean-800 text-sm leading-tight">{item.suggested_word}</p>
      <p className="text-xs text-ocean-600 leading-relaxed line-clamp-3">{item.definition}</p>
    </div>
  )
}

function SkeletonCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="border border-slate-200 rounded-lg p-3 space-y-2 animate-pulse">
          <div className="h-4 bg-slate-200 rounded w-2/3" />
          <div className="h-3 bg-slate-100 rounded w-full" />
          <div className="h-3 bg-slate-100 rounded w-4/5" />
        </div>
      ))}
    </div>
  )
}

export function VocabGenerateButtons({
  essayId,
  initialHasParaphrase,
  initialHasTopic,
}: VocabGenerateButtonsProps) {
  const router = useRouter()
  const [isGeneratingParaphrase, setIsGeneratingParaphrase] = useState(false)
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false)
  const [paraphraseProgress, setParaphraseProgress] = useState(0)
  const [topicProgress, setTopicProgress] = useState(0)
  const [hasParaphrase, setHasParaphrase] = useState(initialHasParaphrase)
  const [hasTopic, setHasTopic] = useState(initialHasTopic)
  const [error, setError] = useState('')
  const [isGuest, setIsGuest] = useState<boolean | null>(null)
  const [paraphrasePreview, setParaphrasePreview] = useState<VocabPreviewItem[]>([])
  const [topicPreview, setTopicPreview] = useState<VocabPreviewItem[]>([])

  useEffect(() => {
    async function initAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      const guest = !user
      setIsGuest(guest)
      if (!guest) {
        autoGenerate(initialHasParaphrase, initialHasTopic)
      }
    }
    initAuth()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function fetchParaphrasePreview() {
    const res = await fetch(`/api/vocabulary/${essayId}?type=paraphrase`)
    const data = await res.json()
    if (data.vocabulary) setParaphrasePreview(data.vocabulary)
  }

  async function fetchTopicPreview() {
    const res = await fetch(`/api/vocabulary/${essayId}?type=topic`)
    const data = await res.json()
    if (data.vocabulary) setTopicPreview(data.vocabulary)
  }

  async function autoGenerate(hadParaphrase: boolean, hadTopic: boolean) {
    if (!hadParaphrase) {
      await runGenerateParaphrase()
    } else {
      await fetchParaphrasePreview()
    }
    if (!hadTopic) {
      await runGenerateTopic()
    } else {
      await fetchTopicPreview()
    }
  }

  async function runGenerateParaphrase() {
    setIsGeneratingParaphrase(true)
    setParaphraseProgress(0)
    setError('')

    const interval = setInterval(() => {
      setParaphraseProgress(prev => {
        if (prev < 95) return prev + 1.19
        return prev
      })
    }, 100)

    try {
      const response = await fetch('/api/vocabulary/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: essayId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      setParaphraseProgress(100)
      setHasParaphrase(true)
      if (data.vocabulary) {
        setParaphrasePreview(data.vocabulary)
      } else {
        await fetchParaphrasePreview()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate paraphrase vocabulary')
      setParaphraseProgress(0)
    } finally {
      clearInterval(interval)
      setIsGeneratingParaphrase(false)
    }
  }

  async function runGenerateTopic() {
    setIsGeneratingTopic(true)
    setTopicProgress(0)
    setError('')

    const interval = setInterval(() => {
      setTopicProgress(prev => {
        if (prev < 95) return prev + 1.19
        return prev
      })
    }, 100)

    try {
      const response = await fetch('/api/vocabulary/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: essayId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate')
      }

      setTopicProgress(100)
      setHasTopic(true)
      if (data.vocabulary) {
        setTopicPreview(data.vocabulary)
      } else {
        await fetchTopicPreview()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate topic vocabulary')
      setTopicProgress(0)
    } finally {
      clearInterval(interval)
      setIsGeneratingTopic(false)
    }
  }

  // Still loading auth state
  if (isGuest === null) {
    return (
      <div className="space-y-6">
        <SkeletonSection />
        <div className="border-t border-slate-100" />
        <SkeletonSection />
      </div>
    )
  }

  // Guest mode
  if (isGuest) {
    return (
      <div className="space-y-4">
        <div className="bg-slate-50 border border-slate-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <GraduationCap className="h-6 w-6 text-cyan-600 mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-ocean-800 text-lg mb-2">
                Sign Up FREE to Unlock Advanced Vocabulary Features
              </h3>
              <p className="text-ocean-700 text-sm leading-relaxed mb-3">
                Generate <strong>C1-C2 level vocabulary</strong> to paraphrase words from your essay and discover <strong>fancy topic-specific vocabulary</strong> for higher Lexical Resource scores.
              </p>
            </div>
          </div>
          <div className="space-y-2 mb-4 ml-9">
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>AI-powered vocabulary suggestions tailored to your essay</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Create flashcards &amp; take quizzes to master new vocabulary</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span>Track your writing progress &amp; vocabulary growth in Dashboard</span>
            </div>
          </div>
          <Link href="/login" className="block ml-9">
            <Button className="bg-ocean-700 hover:bg-ocean-800 text-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Sign Up FREE - Get 3 Essays/Day
            </Button>
          </Link>
        </div>
        <div className="text-xs text-ocean-600 bg-ocean-50 border border-ocean-200 rounded-md p-3">
          <p className="font-medium mb-1">📚 Free tier includes:</p>
          <p>✓ 3 essays per day • ✓ Full scoring &amp; feedback • ✓ Vocabulary tools • ✓ Progress tracking</p>
        </div>
      </div>
    )
  }

  // Authenticated user
  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      {/* Paraphrase Vocabulary section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-ocean-800">Paraphrase Vocabulary</h4>
            <p className="text-xs text-ocean-500 mt-0.5">Words from your essay upgraded to C1–C2 level</p>
          </div>
          {hasParaphrase && paraphrasePreview.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {paraphrasePreview.length} words
            </Badge>
          )}
        </div>

        {isGeneratingParaphrase ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-ocean-600">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              <span>Generating paraphrase vocabulary...</span>
              <span className="font-medium ml-auto">{Math.round(paraphraseProgress)}%</span>
            </div>
            <Progress value={paraphraseProgress} className="h-1.5" />
            <SkeletonCards />
          </div>
        ) : paraphrasePreview.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {paraphrasePreview.slice(0, PREVIEW_COUNT).map((item, i) => (
                <VocabPreviewCard key={i} item={item} />
              ))}
            </div>
            <button
              onClick={() => router.push(`/vocabulary/${essayId}`)}
              className="flex items-center gap-1.5 text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
            >
              See all {paraphrasePreview.length} words
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-100" />

      {/* Topic Vocabulary section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-ocean-800">Topic Vocabulary</h4>
            <p className="text-xs text-ocean-500 mt-0.5">Advanced topic-specific words for higher Lexical Resource</p>
          </div>
          {hasTopic && topicPreview.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {topicPreview.length} words
            </Badge>
          )}
        </div>

        {isGeneratingTopic ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-ocean-600">
              <Loader2 className="h-4 w-4 animate-spin flex-shrink-0" />
              <span>Finding topic-specific vocabulary...</span>
              <span className="font-medium ml-auto">{Math.round(topicProgress)}%</span>
            </div>
            <Progress value={topicProgress} className="h-1.5" />
            <SkeletonCards />
          </div>
        ) : topicPreview.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {topicPreview.slice(0, PREVIEW_COUNT).map((item, i) => (
                <VocabPreviewCard key={i} item={item} />
              ))}
            </div>
            <button
              onClick={() => router.push(`/vocabulary/${essayId}`)}
              className="flex items-center gap-1.5 text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
            >
              See all {topicPreview.length} words
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}
      </div>

      {/* View Full Vocabulary CTA */}
      {(hasParaphrase || hasTopic) && !isGeneratingParaphrase && !isGeneratingTopic && (
        <div className="pt-2 border-t border-slate-100">
          <Button
            onClick={() => router.push(`/vocabulary/${essayId}`)}
            className="w-full bg-ocean-700 hover:bg-ocean-800 text-white"
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Full Vocabulary
          </Button>
        </div>
      )}
    </div>
  )
}

function SkeletonSection() {
  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <div className="h-4 bg-slate-200 rounded w-40 animate-pulse" />
        <div className="h-3 bg-slate-100 rounded w-56 animate-pulse" />
      </div>
      <SkeletonCards />
    </div>
  )
}
