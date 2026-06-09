'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'
import { saveGuestQuizResult } from '@/lib/guest-vocabulary'

interface QuizQuestion {
  id: string
  definition: string
  correctAnswer: string
  options: string[]
  originalWord?: string
  vocabType: string
}

export default function QuizPage({ params }: { params: { essayId: string } }) {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchVocabulary = useCallback(async () => {
    try {
      // No ?type param → API returns all vocab for this essay
      const response = await fetch(`/api/vocabulary/${params.essayId}`)
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to fetch vocabulary')
      if (!data.vocabulary?.length) {
        setError('No vocabulary found for this essay')
      } else {
        setVocabulary(data.vocabulary)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary')
    } finally {
      setIsLoading(false)
    }
  }, [params.essayId])

  useEffect(() => { fetchVocabulary() }, [fetchVocabulary])

  const generateQuestions = useCallback((vocab: VocabularyItem[]) => {
    const shuffled = [...vocab].sort(() => Math.random() - 0.5)
    const generated: QuizQuestion[] = shuffled.map((item) => {
      const incorrectOptions = vocab
        .filter(v => v.id !== item.id)
        .map(v => v.suggested_word)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
      return {
        id: item.id,
        definition: item.definition,
        correctAnswer: item.suggested_word.toLowerCase(),
        options: [...incorrectOptions, item.suggested_word].sort(() => Math.random() - 0.5),
        originalWord: item.original_word || undefined,
        vocabType: item.vocab_type,
      }
    })
    setQuestions(generated)
    setCurrentIndex(0)
    setUserAnswers([])
    setCurrentAnswer('')
    setShowResults(false)
  }, [])

  useEffect(() => {
    if (vocabulary.length > 0) generateQuestions(vocabulary)
  }, [vocabulary, generateQuestions])

  const currentQuestion = questions[currentIndex]

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (showResults) { if (e.key === 'Enter') generateQuestions(vocabulary); return }
      if (!currentQuestion?.options) return
      const num = parseInt(e.key)
      if (num >= 1 && num <= currentQuestion.options.length) {
        setCurrentAnswer(currentQuestion.options[num - 1])
      } else if (e.key === 'Enter' && currentAnswer.trim()) {
        handleNextQuestion()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showResults, currentQuestion, currentAnswer, vocabulary, generateQuestions])

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers, currentAnswer.toLowerCase()]
    setUserAnswers(newAnswers)
    setCurrentAnswer('')
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(i => i + 1)
    } else {
      finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (answers: string[]) => {
    setShowResults(true)

    // Group results by vocabType so each type gets its own API call
    const byType: Record<string, { correct: string[]; incorrect: string[]; total: number }> = {}
    questions.forEach((q, i) => {
      if (!byType[q.vocabType]) byType[q.vocabType] = { correct: [], incorrect: [], total: 0 }
      byType[q.vocabType].total++
      const isCorrect = answers[i] === q.correctAnswer
      const entry = isCorrect ? q.correctAnswer : `${q.correctAnswer} (your answer: ${answers[i] || 'no answer'})`
      isCorrect ? byType[q.vocabType].correct.push(entry) : byType[q.vocabType].incorrect.push(entry)
    })

    try {
      for (const [vocabType, result] of Object.entries(byType)) {
        const response = await fetch('/api/vocabulary/quiz-results', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            essay_id: params.essayId,
            vocab_type: vocabType,
            quiz_type: 'multiple_choice',
            score: result.correct.length,
            total_questions: result.total,
            correct_answers: result.correct,
            incorrect_answers: result.incorrect,
          }),
        })
        const data = await response.json()
        if (data.isGuest) {
          saveGuestQuizResult({
            essay_id: params.essayId,
            vocab_type: vocabType as 'paraphrase' | 'topic',
            score: result.correct.length,
            total_questions: result.total,
            correct_answers: result.correct.map((_, i) => i),
            incorrect_answers: result.incorrect.map((_, i) => i),
            completed_at: new Date().toISOString(),
          })
        }
      }
    } catch (err) {
      console.error('Error saving quiz results:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-center h-96">
          <div className="text-ocean-600">Loading quiz…</div>
        </div>
      </div>
    )
  }

  if (error || vocabulary.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <Link href={`/history/${params.essayId}/vocabulary`}>
          <Button variant="ghost" className="mb-4 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Vocabulary
          </Button>
        </Link>
        <Card className="border-ocean-200">
          <CardContent className="pt-12 pb-12 text-center">
            <p className="text-ocean-600">{error || 'No vocabulary available'}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const correctCount = userAnswers.filter((ans, i) => ans === questions[i]?.correctAnswer).length

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6">
      {/* Header */}
      <div className="mb-4 sm:mb-6">
        <Link href={`/history/${params.essayId}/vocabulary`}>
          <Button variant="ghost" className="mb-3 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Vocabulary
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold text-ocean-800 mb-1">Vocabulary Quiz</h1>
        <p className="text-sm text-ocean-500">{vocabulary.length} words · multiple choice</p>
      </div>

      {/* Quiz Questions */}
      {!showResults && currentQuestion && (
        <div className="space-y-5">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-ocean-600">Question {currentIndex + 1} of {questions.length}</span>
              <span className="text-sm text-ocean-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-ocean-100" />
          </div>

          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
              <CardTitle className="text-ocean-800 text-base sm:text-lg leading-snug">
                {currentQuestion.originalWord && (
                  <span className="text-sm text-ocean-500 font-normal block mb-1.5">
                    Original word: <em>{currentQuestion.originalWord}</em>
                  </span>
                )}
                {currentQuestion.definition}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-2.5">
                {currentQuestion.options.map((option, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAnswer(option)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all ${
                      currentAnswer === option
                        ? 'border-ocean-500 bg-ocean-50 text-ocean-800'
                        : 'border-ocean-100 hover:border-ocean-300 text-ocean-700 hover:bg-ocean-50/50'
                    }`}
                  >
                    <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      currentAnswer === option
                        ? 'bg-ocean-600 text-white'
                        : 'bg-ocean-100 text-ocean-500'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="font-medium">{option}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between items-center">
            <p className="hidden sm:flex text-xs text-ocean-300 items-center gap-2">
              <span><kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">1–4</kbd> Select</span>
              <span><kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">Enter</kbd> Next</span>
            </p>
            <Button
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim()}
              className="ml-auto bg-ocean-600 hover:bg-ocean-700 text-white px-8 rounded-xl"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-5">
          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200 text-center">
              <CardTitle className="text-2xl text-ocean-800 mb-1">Quiz Complete!</CardTitle>
              <CardDescription className="text-base">
                {correctCount} / {questions.length} correct&ensp;·&ensp;
                {Math.round((correctCount / questions.length) * 100)}%
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-5">
              <div className="space-y-3">
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index]
                  const isCorrect = userAnswer === question.correctAnswer
                  return (
                    <div key={question.id} className={`p-4 rounded-xl border-2 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                      <div className="flex items-start gap-3">
                        {isCorrect
                          ? <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                          : <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        }
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-ocean-700 mb-1.5">{question.definition}</p>
                          <p className="text-sm">
                            <span className="font-semibold">Answer: </span>
                            <span className="text-green-700 font-medium">{question.correctAnswer}</span>
                          </p>
                          {!isCorrect && (
                            <p className="text-sm mt-0.5">
                              <span className="font-semibold">Your answer: </span>
                              <span className="text-red-600">{userAnswer || 'No answer'}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col items-center gap-3">
            <p className="hidden sm:block text-xs text-ocean-300">
              <kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">Enter</kbd> Take another quiz
            </p>
            <div className="flex gap-3">
              <Button onClick={() => generateQuestions(vocabulary)} className="bg-ocean-600 hover:bg-ocean-700 text-white rounded-xl">
                Take Another Quiz
              </Button>
              <Link href={`/history/${params.essayId}/vocabulary`}>
                <Button variant="outline" className="border-ocean-200 text-ocean-700 hover:bg-ocean-50 rounded-xl">
                  Back to Vocabulary
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
