'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { BookOpen, Loader2, Sparkles, Lightbulb, Clock, CheckCircle, Eye, Target, Award, Filter } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

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

interface VocabularyListProps {
  essays: EssayWithVocab[]
}

export function VocabularyList({ essays }: VocabularyListProps) {
  const router = useRouter()
  const [loadingStates, setLoadingStates] = useState<{ [key: string]: boolean }>({})
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [progress, setProgress] = useState<{ [key: string]: number }>({})
  const [elapsedTime, setElapsedTime] = useState<{ [key: string]: number }>({})
  const [currentLoadingKey, setCurrentLoadingKey] = useState<string | null>(null)
  const [filterOption, setFilterOption] = useState<string>('all')
  const [optimisticUpdates, setOptimisticUpdates] = useState<{ [key: string]: { hasParaphraseVocab?: boolean; hasTopicVocab?: boolean } }>({})

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (currentLoadingKey) {
      interval = setInterval(() => {
        setElapsedTime(prev => ({
          ...prev,
          [currentLoadingKey]: (prev[currentLoadingKey] || 0) + 1
        }))
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [currentLoadingKey])

  // Simulate progress - 8 seconds total for vocabulary (GPT-4o with caching)
  useEffect(() => {
    if (!currentLoadingKey) {
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        const current = prev[currentLoadingKey] || 0
        // Stop at 95%
        if (current >= 95) {
          clearInterval(interval)
          return prev
        }
        // 8 seconds = 8000ms, update every 100ms = 80 updates
        // Each update = ~1.19% to reach 95% in 8s
        return { ...prev, [currentLoadingKey]: current + 1.19 }
      })
    }, 100)

    return () => clearInterval(interval)
  }, [currentLoadingKey]) // Only depend on currentLoadingKey, not progress

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const truncateText = (text: string, maxLength: number = 120): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength).trim() + '...'
  }

  const getStatusBadge = (status: { hasViewed: boolean; quizScore: number | null; totalQuestions: number | null }, hasVocab: boolean) => {
    if (!hasVocab) return null

    if (status.quizScore !== null && status.totalQuestions !== null) {
      return (
        <Badge className="bg-green-600 text-white border-green-700">
          <Award className="h-3 w-3 mr-1" />
          Tested: {status.quizScore}/{status.totalQuestions}
        </Badge>
      )
    }

    // Always show "Not tested yet" if no quiz score, regardless of view status
    return (
      <Badge variant="outline" className="border-orange-400 text-orange-700 bg-orange-50">
        <Target className="h-3 w-3 mr-1" />
        Not tested yet
      </Badge>
    )
  }

  const handleGenerateVocab = async (essayId: string, type: 'paraphrase' | 'topic') => {
    const key = `${essayId}-${type}`
    setLoadingStates(prev => ({ ...prev, [key]: true }))
    setErrors(prev => ({ ...prev, [key]: '' }))
    setCurrentLoadingKey(key)
    setProgress(prev => ({ ...prev, [key]: 0 }))
    setElapsedTime(prev => ({ ...prev, [key]: 0 }))

    try {
      const endpoint = type === 'paraphrase'
        ? '/api/vocabulary/paraphrase'
        : '/api/vocabulary/topic'

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ essay_id: essayId }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate vocabulary')
      }

      setProgress(prev => ({ ...prev, [key]: 100 }))

      // Optimistic update - immediately update UI
      setOptimisticUpdates(prev => ({
        ...prev,
        [essayId]: {
          ...prev[essayId],
          ...(type === 'paraphrase' ? { hasParaphraseVocab: true } : { hasTopicVocab: true })
        }
      }))

      // Then refresh from server in background
      router.refresh()
    } catch (error) {
      console.error('Error generating vocabulary:', error)
      setErrors(prev => ({
        ...prev,
        [key]: error instanceof Error ? error.message : 'Failed to generate vocabulary'
      }))

      // Revert optimistic update on error
      setOptimisticUpdates(prev => {
        const updated = { ...prev }
        delete updated[essayId]
        return updated
      })
    } finally {
      setLoadingStates(prev => ({ ...prev, [key]: false }))
      setCurrentLoadingKey(null)
    }
  }

  // Apply optimistic updates to essays
  const essaysWithOptimisticUpdates = useMemo(() => {
    return essays.map(essay => {
      const updates = optimisticUpdates[essay.id]
      if (!updates) return essay

      return {
        ...essay,
        hasParaphraseVocab: updates.hasParaphraseVocab ?? essay.hasParaphraseVocab,
        hasTopicVocab: updates.hasTopicVocab ?? essay.hasTopicVocab,
      }
    })
  }, [essays, optimisticUpdates])

  // Filter and sort essays based on selected option
  const filteredEssays = useMemo(() => {
    let filtered = [...essaysWithOptimisticUpdates]

    switch (filterOption) {
      case 'not-generated':
        // Show essays that haven't generated any vocabulary yet
        filtered = filtered.filter(essay =>
          !essay.hasParaphraseVocab && !essay.hasTopicVocab
        )
        break
      case 'not-tested':
        // Show essays with vocab that haven't been tested yet
        filtered = filtered.filter(essay =>
          (essay.hasParaphraseVocab && essay.paraphraseStatus.quizScore === null) ||
          (essay.hasTopicVocab && essay.topicStatus.quizScore === null)
        )
        break
      case 'low-score':
        // Show essays with quiz score < 70%
        filtered = filtered.filter(essay => {
          const paraphrasePercent = essay.paraphraseStatus.quizScore !== null && essay.paraphraseStatus.totalQuestions !== null
            ? (essay.paraphraseStatus.quizScore / essay.paraphraseStatus.totalQuestions) * 100
            : null
          const topicPercent = essay.topicStatus.quizScore !== null && essay.topicStatus.totalQuestions !== null
            ? (essay.topicStatus.quizScore / essay.topicStatus.totalQuestions) * 100
            : null

          const hasLowScore =
            (paraphrasePercent !== null && paraphrasePercent < 70) ||
            (topicPercent !== null && topicPercent < 70)
          return hasLowScore
        })
        break
      case 'completed':
        // Show essays with at least one quiz completed
        filtered = filtered.filter(essay =>
          essay.paraphraseStatus.quizScore !== null || essay.topicStatus.quizScore !== null
        )
        break
      case 'all':
      default:
        // Show all essays
        break
    }

    return filtered
  }, [essaysWithOptimisticUpdates, filterOption])

  return (
    <div className="space-y-4">
      {/* Filter Controls */}
      <Card className="border-ocean-200 shadow-sm">
        <CardContent className="pt-4 md:pt-6 px-4">
          <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
            <div className="flex items-center gap-2 text-ocean-700">
              <Filter className="h-4 w-4" />
              <span className="text-xs md:text-sm font-medium">Filter:</span>
            </div>
            <Select value={filterOption} onValueChange={setFilterOption}>
              <SelectTrigger className="w-full md:w-[220px]">
                <SelectValue placeholder="Filter essays" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Essays</SelectItem>
                <SelectItem value="not-generated">Not Generated Yet</SelectItem>
                <SelectItem value="not-tested">Not Tested Yet</SelectItem>
                <SelectItem value="low-score">Low Quiz Score (&lt; 70%)</SelectItem>
                <SelectItem value="completed">Quiz Completed</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-xs md:text-sm text-ocean-600 md:ml-auto">
              Showing {filteredEssays.length} of {essays.length} essays
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Vocabulary Types Info - shown once at top */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg p-3 md:p-4 text-xs md:text-sm text-cyan-800 shadow-sm">
        <div className="flex items-center gap-2 font-semibold mb-2 text-cyan-700">
          <Lightbulb className="w-4 h-4" />
          <span>Vocabulary Types:</span>
        </div>
        <ul className="space-y-1 md:space-y-2 ml-4 md:ml-6 list-disc text-cyan-900">
          <li><strong>Paraphrase:</strong> Suggests better alternatives for low-level words in your essay</li>
          <li><strong>Topic:</strong> Provides C1-C2 vocabulary specific to this essay&apos;s topic</li>
        </ul>
      </div>

      {filteredEssays.map((essay) => {
        const paraphraseKey = `${essay.id}-paraphrase`
        const topicKey = `${essay.id}-topic`
        const paraphraseLoading = loadingStates[paraphraseKey]
        const topicLoading = loadingStates[topicKey]

        return (
          <Card key={essay.id} className="border-ocean-200 card-premium shadow-colored hover-lift animate-fadeInUp">
            <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200 p-4 md:p-6">
              <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-3 md:gap-4">
                <div className="flex-1">
                  <CardTitle className="text-base md:text-lg bg-gradient-to-r from-ocean-700 to-cyan-700 bg-clip-text text-transparent mb-2">
                    {truncateText(essay.prompt, 100)}
                  </CardTitle>
                  <CardDescription className="text-xs md:text-sm text-ocean-600">
                    Submitted on {formatDate(essay.created_at)}
                    {essay.overall_score && (
                      <span className="block md:inline md:ml-3 text-ocean-700 font-semibold mt-1 md:mt-0">
                        Overall Score: {essay.overall_score}
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex flex-row md:flex-col gap-2 md:items-end flex-wrap">
                  {essay.hasParaphraseVocab && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-ocean-600 font-medium">Paraphrase:</span>
                      {getStatusBadge(essay.paraphraseStatus, essay.hasParaphraseVocab)}
                    </div>
                  )}
                  {essay.hasTopicVocab && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-cyan-600 font-medium">Topic:</span>
                      {getStatusBadge(essay.topicStatus, essay.hasTopicVocab)}
                    </div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 md:pt-6 px-4 md:px-6">
              <div className="space-y-3">
                {/* Buttons - always show */}
                <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 md:gap-3">
                  {/* View Vocabulary Button - shown if any vocab exists */}
                  {(essay.hasParaphraseVocab || essay.hasTopicVocab) && (
                    <Link href={`/vocabulary/${essay.id}`} className="w-full sm:w-auto">
                      <Button className="w-full sm:w-auto bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white shadow-md hover:shadow-lg transition-all text-sm md:text-base">
                        <BookOpen className="mr-2 h-4 w-4" />
                        View Vocabulary
                      </Button>
                    </Link>
                  )}

                  {/* Generate Paraphrase Button */}
                  {!essay.hasParaphraseVocab && (
                    <Button
                      onClick={() => handleGenerateVocab(essay.id, 'paraphrase')}
                      disabled={paraphraseLoading}
                      variant="outline"
                      className="w-full sm:w-auto border-ocean-300 text-ocean-700 hover:bg-ocean-50 hover:border-ocean-400 shadow-sm hover:shadow-md transition-all text-xs md:text-sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Generate Paraphrase Vocab</span>
                      <span className="sm:hidden">Paraphrase Vocab</span>
                    </Button>
                  )}

                  {/* Generate Topic Button */}
                  {!essay.hasTopicVocab && (
                    <Button
                      onClick={() => handleGenerateVocab(essay.id, 'topic')}
                      disabled={topicLoading}
                      variant="outline"
                      className="w-full sm:w-auto border-cyan-300 text-cyan-700 hover:bg-cyan-50 hover:border-cyan-400 shadow-sm hover:shadow-md transition-all text-xs md:text-sm"
                    >
                      <Sparkles className="mr-2 h-4 w-4" />
                      <span className="hidden sm:inline">Generate Topic Vocab</span>
                      <span className="sm:hidden">Topic Vocab</span>
                    </Button>
                  )}

                  {/* Status if both exist */}
                  {essay.hasParaphraseVocab && essay.hasTopicVocab && (
                    <div className="flex items-center text-xs md:text-sm text-green-600 font-medium">
                      <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                      All vocabulary generated
                    </div>
                  )}
                </div>

                {/* Loading State - show below buttons */}
                {(paraphraseLoading || topicLoading) && (
                  <Card className="border-ocean-300 bg-gradient-to-br from-ocean-50 to-cyan-50">
                    <CardContent className="pt-4 md:pt-6 px-4">
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                          <h3 className="text-sm md:text-base font-semibold text-ocean-800">
                            Generating {paraphraseLoading ? 'Paraphrase' : 'Topic'} Vocabulary
                          </h3>
                          <div className="flex items-center gap-2 text-xs md:text-sm text-ocean-600">
                            <Clock className="h-4 w-4" />
                            <span>
                              {Math.floor((elapsedTime[paraphraseLoading ? paraphraseKey : topicKey] || 0) / 60)}:
                              {((elapsedTime[paraphraseLoading ? paraphraseKey : topicKey] || 0) % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                        </div>
                        <Progress value={progress[paraphraseLoading ? paraphraseKey : topicKey] || 0} className="h-2" />
                        <div className="grid grid-cols-3 gap-2 md:gap-3">
                          <div className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 33 ? 'text-green-600' : 'text-slate-400'}`}>
                            {(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 33 ? (
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <div className="h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-current" />
                            )}
                            <span className="hidden sm:inline">Analyzing</span>
                            <span className="sm:hidden">1</span>
                          </div>
                          <div className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 66 ? 'text-green-600' : 'text-slate-400'}`}>
                            {(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 66 ? (
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <div className="h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-current" />
                            )}
                            <span className="hidden sm:inline">Processing</span>
                            <span className="sm:hidden">2</span>
                          </div>
                          <div className={`flex items-center gap-1 md:gap-2 text-xs md:text-sm ${(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 95 ? 'text-green-600' : 'text-slate-400'}`}>
                            {(progress[paraphraseLoading ? paraphraseKey : topicKey] || 0) >= 95 ? (
                              <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                            ) : (
                              <div className="h-3 w-3 md:h-4 md:w-4 rounded-full border-2 border-current" />
                            )}
                            <span className="hidden sm:inline">Finalizing</span>
                            <span className="sm:hidden">3</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Error Messages */}
                {errors[paraphraseKey] && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                    {errors[paraphraseKey]}
                  </div>
                )}
                {errors[topicKey] && (
                  <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                    {errors[topicKey]}
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
