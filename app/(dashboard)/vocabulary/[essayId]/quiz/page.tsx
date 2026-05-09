'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, CheckCircle, XCircle, BrainCircuit } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'
import { saveGuestQuizResult } from '@/lib/guest-vocabulary'

interface QuizQuestion {
  id: string
  definition: string
  correctAnswer: string
  options?: string[]
  firstLetter: string
  originalWord?: string
  vocabType?: string // Track which vocab type this question belongs to
}

type QuizType = 'multiple_choice' | 'fill_in' | null

export default function QuizPage({ params }: { params: { essayId: string } }) {
  const searchParams = useSearchParams()
  const vocabType = searchParams.get('type') || 'paraphrase'

  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [quizType, setQuizType] = useState<QuizType>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<string[]>([])
  const [currentAnswer, setCurrentAnswer] = useState('')
  const [showResults, setShowResults] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

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

  const generateQuestions = (type: QuizType) => {
    if (!type) return

    const shuffled = [...vocabulary].sort(() => Math.random() - 0.5)

    const quizQuestions: QuizQuestion[] = shuffled.map((item) => {
      const question: QuizQuestion = {
        id: item.id,
        definition: item.definition,
        correctAnswer: item.suggested_word.toLowerCase(),
        firstLetter: item.suggested_word[0].toLowerCase(),
        originalWord: item.original_word || undefined,
        vocabType: item.vocab_type, // Store the vocab type for each question
      }

      if (type === 'multiple_choice') {
        const incorrectOptions = vocabulary
          .filter(v => v.id !== item.id)
          .map(v => v.suggested_word)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)

        const allOptions = [...incorrectOptions, item.suggested_word]
          .sort(() => Math.random() - 0.5)

        question.options = allOptions
      }

      return question
    })

    setQuestions(quizQuestions)
    setQuizType(type)
    setCurrentIndex(0)
    setUserAnswers([])
    setCurrentAnswer('')
    setShowResults(false)
  }

  const handleAnswerSelect = (answer: string) => {
    setCurrentAnswer(answer)
  }

  const handleNextQuestion = () => {
    const newAnswers = [...userAnswers, currentAnswer.toLowerCase()]
    setUserAnswers(newAnswers)
    setCurrentAnswer('')

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      finishQuiz(newAnswers)
    }
  }

  const finishQuiz = async (answers: string[]) => {
    setShowResults(true)

    const correctAnswers: string[] = []
    const incorrectAnswers: string[] = []

    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) {
        correctAnswers.push(q.correctAnswer)
      } else {
        incorrectAnswers.push(`${q.correctAnswer} (your answer: ${answers[i] || 'no answer'})`)
      }
    })

    const score = correctAnswers.length
    const total = questions.length

    setIsSubmitting(true)

    try {
      // If this is a mixed quiz (both/mixed), we need to save separate results for each vocab type
      if (vocabType === 'both' || vocabType === 'mixed') {
        // Separate questions by vocab type
        const paraphraseResults = {
          correct: [] as string[],
          incorrect: [] as string[],
          total: 0
        }
        const topicResults = {
          correct: [] as string[],
          incorrect: [] as string[],
          total: 0
        }

        questions.forEach((q, i) => {
          const isCorrect = answers[i] === q.correctAnswer
          const resultItem = isCorrect
            ? q.correctAnswer
            : `${q.correctAnswer} (your answer: ${answers[i] || 'no answer'})`

          if (q.vocabType === 'paraphrase') {
            paraphraseResults.total++
            if (isCorrect) {
              paraphraseResults.correct.push(resultItem)
            } else {
              paraphraseResults.incorrect.push(resultItem)
            }
          } else if (q.vocabType === 'topic') {
            topicResults.total++
            if (isCorrect) {
              topicResults.correct.push(resultItem)
            } else {
              topicResults.incorrect.push(resultItem)
            }
          }
        })

        // Save paraphrase results if any
        if (paraphraseResults.total > 0) {
          const response = await fetch('/api/vocabulary/quiz-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              essay_id: params.essayId,
              vocab_type: 'paraphrase',
              quiz_type: quizType,
              score: paraphraseResults.correct.length,
              total_questions: paraphraseResults.total,
              correct_answers: paraphraseResults.correct,
              incorrect_answers: paraphraseResults.incorrect,
            }),
          })

          const data = await response.json()

          // If guest, save to localStorage
          if (data.isGuest) {
            saveGuestQuizResult({
              essay_id: params.essayId,
              vocab_type: 'paraphrase',
              score: paraphraseResults.correct.length,
              total_questions: paraphraseResults.total,
              correct_answers: paraphraseResults.correct.map((_, i) => i),
              incorrect_answers: paraphraseResults.incorrect.map((_, i) => i),
              completed_at: new Date().toISOString(),
            })
          }
        }

        // Save topic results if any
        if (topicResults.total > 0) {
          const response = await fetch('/api/vocabulary/quiz-results', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              essay_id: params.essayId,
              vocab_type: 'topic',
              quiz_type: quizType,
              score: topicResults.correct.length,
              total_questions: topicResults.total,
              correct_answers: topicResults.correct,
              incorrect_answers: topicResults.incorrect,
            }),
          })

          const data = await response.json()

          // If guest, save to localStorage
          if (data.isGuest) {
            saveGuestQuizResult({
              essay_id: params.essayId,
              vocab_type: 'topic',
              score: topicResults.correct.length,
              total_questions: topicResults.total,
              correct_answers: topicResults.correct.map((_, i) => i),
              incorrect_answers: topicResults.incorrect.map((_, i) => i),
              completed_at: new Date().toISOString(),
            })
          }
        }
      } else {
        // Single vocab type quiz - save as before
        const response = await fetch('/api/vocabulary/quiz-results', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            essay_id: params.essayId,
            vocab_type: vocabType,
            quiz_type: quizType,
            score,
            total_questions: total,
            correct_answers: correctAnswers,
            incorrect_answers: incorrectAnswers,
          }),
        })

        if (response.ok) {
          const data = await response.json()

          // If guest, save to localStorage
          if (data.isGuest) {
            saveGuestQuizResult({
              essay_id: params.essayId,
              vocab_type: vocabType as 'paraphrase' | 'topic',
              score,
              total_questions: total,
              correct_answers: correctAnswers.map((_, i) => i),
              incorrect_answers: incorrectAnswers.map((_, i) => i),
              completed_at: new Date().toISOString(),
            })
          }
        } else {
          console.error('Failed to save quiz results')
        }
      }
    } catch (err) {
      console.error('Error saving quiz results:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const restartQuiz = () => {
    setQuizType(null)
    setQuestions([])
    setCurrentIndex(0)
    setUserAnswers([])
    setCurrentAnswer('')
    setShowResults(false)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-center h-96">
          <div className="text-ocean-600">Loading quiz...</div>
        </div>
      </div>
    )
  }

  if (error || vocabulary.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <Link href={`/vocabulary/${params.essayId}`}>
          <Button variant="ghost" className="mb-4 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary
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

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0
  const correctCount = userAnswers.filter((ans, i) => ans === questions[i]?.correctAnswer).length

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <Link href={`/vocabulary/${params.essayId}`}>
          <Button variant="ghost" className="mb-4 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Vocabulary
          </Button>
        </Link>
        <h1 className="text-4xl font-bold text-ocean-800 mb-2">Vocabulary Quiz</h1>
        <p className="text-ocean-600 capitalize">
          {vocabType === 'both' ? 'Mixed (Paraphrase + Topic)' : `${vocabType} Vocabulary`}
        </p>
      </div>

      {/* Quiz Type Selection */}
      {!quizType && (
        <div className="space-y-6">
          <Card className="border-ocean-200">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
              <CardTitle className="text-ocean-800">Choose Quiz Type</CardTitle>
              <CardDescription>Select how you want to test your vocabulary knowledge</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card
                  className="border-2 border-ocean-200 hover:border-ocean-400 cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => generateQuestions('multiple_choice')}
                >
                  <CardContent className="pt-6 text-center">
                    <BrainCircuit className="h-12 w-12 text-ocean-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-ocean-800 mb-2">Multiple Choice</h3>
                    <p className="text-sm text-ocean-600">
                      Choose the correct word from 4 options based on the definition
                    </p>
                  </CardContent>
                </Card>

                <Card
                  className="border-2 border-ocean-200 hover:border-ocean-400 cursor-pointer transition-all hover:shadow-lg"
                  onClick={() => generateQuestions('fill_in')}
                >
                  <CardContent className="pt-6 text-center">
                    <BrainCircuit className="h-12 w-12 text-ocean-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-ocean-800 mb-2">Fill in the Blank</h3>
                    <p className="text-sm text-ocean-600">
                      Type the correct word based on the definition and first letter hint
                    </p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-cyan-50 border border-cyan-200 rounded-lg">
            <p className="text-sm text-ocean-700">
              <strong>Total Questions:</strong> {vocabulary.length}
            </p>
          </div>
        </div>
      )}

      {/* Quiz Questions */}
      {quizType && !showResults && currentQuestion && (
        <div className="space-y-6">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-ocean-600">
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="text-sm text-ocean-600">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2 bg-ocean-100" />
          </div>

          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
              <CardTitle className="text-ocean-800">
                {currentQuestion.originalWord && (
                  <span className="text-base text-ocean-600 font-normal block mb-2">
                    Original word: {currentQuestion.originalWord}
                  </span>
                )}
                {currentQuestion.definition}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {quizType === 'multiple_choice' && currentQuestion.options && (
                <div className="space-y-3">
                  {currentQuestion.options.map((option, index) => (
                    <Button
                      key={index}
                      onClick={() => handleAnswerSelect(option)}
                      variant={currentAnswer === option ? 'default' : 'outline'}
                      className={`w-full justify-start text-left h-auto py-4 ${
                        currentAnswer === option
                          ? 'bg-ocean-600 hover:bg-ocean-700 text-white'
                          : 'border-ocean-300 text-ocean-700 hover:bg-ocean-50'
                      }`}
                    >
                      <span className="font-semibold mr-3">{String.fromCharCode(65 + index)}.</span>
                      {option}
                    </Button>
                  ))}
                </div>
              )}

              {quizType === 'fill_in' && (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-ocean-600 mb-2">
                      First letter: <span className="font-bold text-ocean-800 text-lg">{currentQuestion.firstLetter.toUpperCase()}</span>
                    </p>
                    <Input
                      type="text"
                      placeholder="Type your answer..."
                      value={currentAnswer}
                      onChange={(e) => setCurrentAnswer(e.target.value)}
                      className="border-ocean-300 focus:border-ocean-500 focus:ring-ocean-500"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && currentAnswer.trim()) {
                          handleNextQuestion()
                        }
                      }}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim()}
              className="bg-ocean-600 hover:bg-ocean-700 text-white px-8"
            >
              {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      {showResults && (
        <div className="space-y-6">
          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200 text-center">
              <CardTitle className="text-3xl text-ocean-800 mb-2">Quiz Complete!</CardTitle>
              <CardDescription className="text-lg">
                Your Score: {correctCount} / {questions.length} (
                {Math.round((correctCount / questions.length) * 100)}%)
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const userAnswer = userAnswers[index]
                  const isCorrect = userAnswer === question.correctAnswer

                  return (
                    <div
                      key={question.id}
                      className={`p-4 rounded-lg border-2 ${
                        isCorrect
                          ? 'border-green-200 bg-green-50'
                          : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="text-sm text-ocean-700 mb-2">{question.definition}</p>
                          <div className="space-y-1">
                            <p className="text-sm">
                              <span className="font-semibold">Correct answer:</span>{' '}
                              <span className="text-green-700">{question.correctAnswer}</span>
                            </p>
                            {!isCorrect && (
                              <p className="text-sm">
                                <span className="font-semibold">Your answer:</span>{' '}
                                <span className="text-red-700">{userAnswer || 'No answer'}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 justify-center">
            <Button
              onClick={restartQuiz}
              className="bg-ocean-600 hover:bg-ocean-700 text-white"
            >
              Take Another Quiz
            </Button>
            <Link href={`/vocabulary/${params.essayId}`}>
              <Button variant="outline" className="border-ocean-300 text-ocean-700 hover:bg-ocean-50">
                Back to Vocabulary
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
