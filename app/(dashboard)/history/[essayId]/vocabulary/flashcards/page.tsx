'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ChevronLeft, ChevronRight, RotateCw, BrainCircuit, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function FlashcardsPage({ params }: { params: { essayId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vocabType = searchParams.get('type') || 'paraphrase'

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasParaphraseVocab, setHasParaphraseVocab] = useState(false)
  const [hasTopicVocab, setHasTopicVocab] = useState(false)

  const fetchVocabulary = useCallback(async () => {
    try {
      const response = await fetch(`/api/vocabulary/${params.essayId}?type=${vocabType}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch vocabulary')
      }

      if (!data.vocabulary || data.vocabulary.length === 0) {
        setError('No vocabulary found for this essay')
      } else {
        setVocabulary(data.vocabulary)

        const paraphraseExists = data.vocabulary.some((v: VocabularyItem) => v.vocab_type === 'paraphrase')
        const topicExists = data.vocabulary.some((v: VocabularyItem) => v.vocab_type === 'topic')
        setHasParaphraseVocab(paraphraseExists)
        setHasTopicVocab(topicExists)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary')
    } finally {
      setIsLoading(false)
    }
  }, [params.essayId, vocabType])

  useEffect(() => {
    fetchVocabulary()
  }, [fetchVocabulary])

  const handleNext = () => {
    if (currentIndex < vocabulary.length - 1) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex(currentIndex + 1)
      }, 200)
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setIsFlipped(false)
      setTimeout(() => {
        setCurrentIndex(currentIndex - 1)
      }, 200)
    }
  }

  const handleFlip = () => {
    setIsFlipped(!isFlipped)
  }

  const progress = vocabulary.length > 0 ? ((currentIndex + 1) / vocabulary.length) * 100 : 0
  const currentCard = vocabulary[currentIndex]

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-ocean-600">Loading flashcards...</div>
        </div>
      </div>
    )
  }

  if (error || vocabulary.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <Link href={`/history/${params.essayId}/vocabulary`}>
          <Button variant="ghost" className="mb-4 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary
          </Button>
        </Link>
        <Card className="border-ocean-200 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-ocean-600">{error || 'No vocabulary available'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <div className="flex justify-between items-start mb-3 sm:mb-4">
          <Link href={`/history/${params.essayId}/vocabulary`}>
            <Button variant="ghost" className="text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2">
              <ArrowLeft className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Back to Vocabulary</span>
              <span className="sm:hidden">Back</span>
            </Button>
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div onMouseEnter={(e) => {
                const button = e.currentTarget.querySelector('button')
                button?.click()
              }}>
                <Button className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all text-sm">
                  <BrainCircuit className="mr-1.5 h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Take Quiz</span>
                  <span className="sm:hidden">Quiz</span>
                  <ChevronDown className="ml-1.5 h-3.5 w-3.5" />
                </Button>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {vocabType === 'paraphrase' && (
                <DropdownMenuItem asChild>
                  <Link href={`/history/${params.essayId}/vocabulary/quiz?type=paraphrase`} className="cursor-pointer">
                    Paraphrase Only
                  </Link>
                </DropdownMenuItem>
              )}
              {vocabType === 'topic' && (
                <DropdownMenuItem asChild>
                  <Link href={`/history/${params.essayId}/vocabulary/quiz?type=topic`} className="cursor-pointer">
                    Topic Only
                  </Link>
                </DropdownMenuItem>
              )}
              {vocabType === 'mixed' && (hasParaphraseVocab || hasTopicVocab) && (
                <>
                  {hasParaphraseVocab && (
                    <DropdownMenuItem asChild>
                      <Link href={`/history/${params.essayId}/vocabulary/quiz?type=paraphrase`} className="cursor-pointer">
                        Paraphrase Only
                      </Link>
                    </DropdownMenuItem>
                  )}
                  {hasTopicVocab && (
                    <DropdownMenuItem asChild>
                      <Link href={`/history/${params.essayId}/vocabulary/quiz?type=topic`} className="cursor-pointer">
                        Topic Only
                      </Link>
                    </DropdownMenuItem>
                  )}
                </>
              )}
              {(hasParaphraseVocab && hasTopicVocab) && (
                <DropdownMenuItem asChild>
                  <Link href={`/history/${params.essayId}/vocabulary/quiz?type=both`} className="cursor-pointer">
                    Mixed (Both Types)
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <h1 className="text-2xl sm:text-4xl font-bold text-ocean-800 mb-2">Flashcards</h1>
        <p className="text-sm sm:text-base text-ocean-600 capitalize">
          {vocabType === 'mixed' ? 'Mixed (Paraphrase + Topic)' : `${vocabType} Vocabulary`}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-ocean-600 font-medium">
            Card {currentIndex + 1} of {vocabulary.length}
          </span>
          <span className="text-sm text-ocean-600 font-medium">{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Flashcard Container */}
      <div className="relative mb-6 sm:mb-8 h-[320px] sm:h-[450px]" style={{ perspective: '1500px' }}>
        <div
          className="relative w-full h-full transition-transform duration-500 ease-in-out"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* Front of card - Definition */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
          >
            <Card className="w-full h-full border-2 border-ocean-300 shadow-xl cursor-pointer hover:border-ocean-400 transition-colors"
              onClick={handleFlip}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 sm:p-12 bg-gradient-to-br from-ocean-50 to-cyan-50">
                <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
                  <p className="text-xs uppercase tracking-wider text-ocean-500 font-semibold">Definition</p>
                  <p className="text-lg sm:text-2xl text-ocean-800 font-medium leading-relaxed">
                    {currentCard.definition}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-ocean-400 mt-8">
                    <RotateCw className="h-5 w-5" />
                    <p className="text-sm">Click to reveal word</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Back of card - Word */}
          <div
            className="absolute inset-0 w-full h-full"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <Card className="w-full h-full border-2 border-cyan-400 shadow-xl cursor-pointer hover:border-cyan-500 transition-colors"
              onClick={handleFlip}
            >
              <CardContent className="flex flex-col items-center justify-center h-full p-6 sm:p-12 bg-gradient-to-br from-cyan-500 to-ocean-600">
                <div className="text-center space-y-4 sm:space-y-6 max-w-2xl">
                  {currentCard.original_word && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-cyan-100 font-semibold">Original</p>
                      <p className="text-xl text-white/90 font-medium mt-1">
                        {currentCard.original_word}
                      </p>
                    </div>
                  )}
                  <p className="text-xs uppercase tracking-wider text-cyan-100 font-semibold">
                    {currentCard.original_word ? 'Suggested Word' : 'Word'}
                  </p>
                  <p className="text-3xl sm:text-5xl text-white font-bold leading-relaxed">
                    {currentCard.suggested_word}
                  </p>
                  <div className="flex items-center justify-center gap-2 text-cyan-100 mt-8">
                    <RotateCw className="h-5 w-5" />
                    <p className="text-sm">Click to see definition</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between items-center gap-2 sm:gap-4">
        <Button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          variant="outline"
          size="default"
          className="border-ocean-300 text-ocean-700 hover:bg-ocean-50 disabled:opacity-50 text-sm px-3 sm:px-4"
        >
          <ChevronLeft className="mr-1 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden sm:inline">Previous</span>
          <span className="sm:hidden">Prev</span>
        </Button>

        <Button
          onClick={handleFlip}
          size="default"
          className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white px-4 sm:px-8 text-sm"
        >
          <RotateCw className="mr-1.5 sm:mr-2 h-4 w-4 sm:h-5 sm:w-5" />
          Flip Card
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentIndex === vocabulary.length - 1}
          variant="outline"
          size="default"
          className="border-ocean-300 text-ocean-700 hover:bg-ocean-50 disabled:opacity-50 text-sm px-3 sm:px-4"
        >
          Next
          <ChevronRight className="ml-1 sm:ml-2 h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-6 p-3 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
        <p className="text-sm text-ocean-700 text-center">
          <strong>Tip:</strong> Click the card or press the Flip button to reveal the answer
        </p>
      </div>

      {/* Study Tips */}
      <div className="mt-6 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg">
        <h3 className="font-semibold text-ocean-800 mb-2">Study Tips</h3>
        <ul className="text-sm text-ocean-700 space-y-1">
          <li className="flex items-start">
            <span className="text-cyan-600 mr-2">•</span>
            <span>Try to recall the word before flipping the card</span>
          </li>
          <li className="flex items-start">
            <span className="text-cyan-600 mr-2">•</span>
            <span>Review flashcards multiple times for better retention</span>
          </li>
          <li className="flex items-start">
            <span className="text-cyan-600 mr-2">•</span>
            <span>Use the word in a sentence to reinforce learning</span>
          </li>
        </ul>
      </div>
    </div>
  )
}
