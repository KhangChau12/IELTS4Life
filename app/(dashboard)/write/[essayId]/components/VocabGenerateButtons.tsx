'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Sparkles, CheckCircle, BookOpen, GraduationCap, BarChart3, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

interface VocabGenerateButtonsProps {
  essayId: string
  initialHasParaphrase: boolean
  initialHasTopic: boolean
}

export function VocabGenerateButtons({
  essayId,
  initialHasParaphrase,
  initialHasTopic
}: VocabGenerateButtonsProps) {
  const router = useRouter()
  const [isGeneratingParaphrase, setIsGeneratingParaphrase] = useState(false)
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false)
  const [paraphraseProgress, setParaphraseProgress] = useState(0)
  const [topicProgress, setTopicProgress] = useState(0)
  const [hasParaphrase, setHasParaphrase] = useState(initialHasParaphrase)
  const [hasTopic, setHasTopic] = useState(initialHasTopic)
  const [error, setError] = useState('')
  const [isGuest, setIsGuest] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setIsGuest(!user)
    }
    checkAuth()
  }, [])

  const generateParaphrase = async () => {
    setIsGeneratingParaphrase(true)
    setParaphraseProgress(0)
    setError('')

    // Progress simulation - 8 seconds
    const interval = setInterval(() => {
      setParaphraseProgress(prev => {
        if (prev < 95) return prev + 1.19 // 95% in 8s
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

      // Refresh after 500ms
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate paraphrase vocabulary')
      setParaphraseProgress(0)
    } finally {
      clearInterval(interval)
      setIsGeneratingParaphrase(false)
    }
  }

  const generateTopic = async () => {
    setIsGeneratingTopic(true)
    setTopicProgress(0)
    setError('')

    // Progress simulation - 8 seconds
    const interval = setInterval(() => {
      setTopicProgress(prev => {
        if (prev < 95) return prev + 1.19 // 95% in 8s
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

      // Refresh after 500ms
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate topic vocabulary')
      setTopicProgress(0)
    } finally {
      clearInterval(interval)
      setIsGeneratingTopic(false)
    }
  }

  // Guest mode: Show signup prompt instead of generate buttons
  if (isGuest) {
    return (
      <div className="space-y-4">
        {/* Main signup message */}
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

          {/* Feature highlights */}
          <div className="space-y-2 mb-4 ml-9">
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>AI-powered vocabulary suggestions tailored to your essay</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <Zap className="h-4 w-4 text-blue-500" />
              <span>Create flashcards & take quizzes to master new vocabulary</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-ocean-700">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <span>Track your writing progress & vocabulary growth in Dashboard</span>
            </div>
          </div>

          {/* CTA Button */}
          <Link href="/login" className="block ml-9">
            <Button className="bg-ocean-700 hover:bg-ocean-800 text-white">
              <GraduationCap className="h-4 w-4 mr-2" />
              Sign Up FREE - Get 3 Essays/Day
            </Button>
          </Link>
        </div>

        {/* Additional benefits note */}
        <div className="text-xs text-ocean-600 bg-ocean-50 border border-ocean-200 rounded-md p-3">
          <p className="font-medium mb-1">📚 Free tier includes:</p>
          <p>✓ 3 essays per day • ✓ Full scoring & feedback • ✓ Vocabulary tools • ✓ Progress tracking</p>
        </div>
      </div>
    )
  }

  // Authenticated user: Show normal generate buttons
  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Paraphrase Vocabulary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-ocean-700">Paraphrase Vocabulary</h4>
          {hasParaphrase ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Generated</span>
            </div>
          ) : (
            <Button
              onClick={generateParaphrase}
              disabled={isGeneratingParaphrase || isGeneratingTopic}
              size="sm"
              className="bg-ocean-700 hover:bg-ocean-800"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingParaphrase ? 'Generating...' : 'Generate'}
            </Button>
          )}
        </div>
        {isGeneratingParaphrase && (
          <div className="space-y-1">
            <Progress value={paraphraseProgress} className="h-2" />
            <p className="text-xs text-ocean-600">Analyzing your essay...</p>
          </div>
        )}
      </div>

      {/* Topic Vocabulary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium text-ocean-700">Topic Vocabulary</h4>
          {hasTopic ? (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Generated</span>
            </div>
          ) : (
            <Button
              onClick={generateTopic}
              disabled={isGeneratingParaphrase || isGeneratingTopic}
              size="sm"
              className="bg-ocean-700 hover:bg-ocean-800"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isGeneratingTopic ? 'Generating...' : 'Generate'}
            </Button>
          )}
        </div>
        {isGeneratingTopic && (
          <div className="space-y-1">
            <Progress value={topicProgress} className="h-2" />
            <p className="text-xs text-ocean-600">Finding topic-specific vocabulary...</p>
          </div>
        )}
      </div>

      {/* View Vocabulary Button */}
      {(hasParaphrase || hasTopic) && (
        <Button
          onClick={() => router.push(`/vocabulary/${essayId}`)}
          variant="outline"
          className="w-full"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          View Vocabulary
        </Button>
      )}
    </div>
  )
}
