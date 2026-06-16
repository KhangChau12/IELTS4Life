'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, AlertTriangle, BookOpen, ArrowRight, PenLine, ChevronLeft, ChevronRight, ChevronDown, FileText } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { QuestionType, SimilarPrompt, PromptTopic } from '@/types/prompt'

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  agree_disagree: 'bg-cyan-200 text-cyan-800 border-cyan-300',
  advantages_disadvantages: 'bg-teal-200 text-teal-800 border-teal-300',
  problem_solution: 'bg-blue-200 text-blue-800 border-blue-300',
  two_part_question: 'bg-sky-200 text-sky-800 border-sky-300',
  positive_negative: 'bg-emerald-200 text-emerald-800 border-emerald-300',
  discussion_both_views: 'bg-violet-200 text-violet-800 border-violet-300',
}

type ClassificationStatus = 'pending' | 'classified' | 'invalid' | 'unclassified'

interface PromptContextZoneProps {
  essayId: string
  promptText: string
  initialClassificationStatus: ClassificationStatus
  initialPromptId: string | null
  initialTopicId: string | null
  initialQuestionType: string | null
  initialTopicName: string | null
}

interface SimilarData {
  sameTopicPrompts: SimilarPrompt[]
  sameTypePrompts: SimilarPrompt[]
  topic: Pick<PromptTopic, 'id' | 'name'> | null
  questionType: QuestionType | null
}

const QUESTION_TYPE_LABELS: Record<QuestionType, string> = QUESTION_TYPES

function SimilarPromptCard({ prompt }: { prompt: SimilarPrompt }) {
  return (
    <Link
      href={`/write/${prompt.id}`}
      className="group flex flex-col justify-between rounded-xl border border-ocean-200 bg-white p-3 sm:p-4 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 hover:border-ocean-300 relative overflow-hidden flex-shrink-0 w-[calc(50%-6px)] min-w-[160px] sm:min-w-[220px]"
    >
      <PenLine className="absolute right-1 top-1 h-16 w-16 sm:h-20 sm:w-20 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_8px_rgba(14,165,233,0.25))]" />
      <p className="text-xs sm:text-sm text-ocean-800 leading-relaxed line-clamp-3 group-hover:text-ocean-900 relative z-10">
        {prompt.prompt_text}
      </p>
      <span className="mt-2 sm:mt-3 text-xs text-ocean-400 group-hover:text-ocean-600 flex items-center justify-end gap-0.5 font-medium transition-colors relative z-10">
        Practice this prompt <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  )
}

function HorizontalScrollRow({ prompts }: { prompts: SimilarPrompt[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setCanScrollLeft(el.scrollLeft > 4)
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
  }, [])

  useEffect(() => {
    checkScroll()
    const el = scrollRef.current
    if (!el) return
    el.addEventListener('scroll', checkScroll, { passive: true })
    const ro = new ResizeObserver(checkScroll)
    ro.observe(el)
    return () => {
      el.removeEventListener('scroll', checkScroll)
      ro.disconnect()
    }
  }, [checkScroll, prompts])

  const scroll = (dir: 'left' | 'right') => {
    scrollRef.current?.scrollBy({ left: dir === 'left' ? -280 : 280, behavior: 'smooth' })
  }

  return (
    <div className="relative">
      {/* Left arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -ml-3 h-7 w-7 rounded-full bg-white border border-ocean-200 shadow-sm flex items-center justify-center text-ocean-500 hover:text-ocean-700 hover:border-ocean-300 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Scrollable row — hidden scrollbar */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {prompts.map(p => (
          <SimilarPromptCard key={p.id} prompt={p} />
        ))}
      </div>

      {/* Right arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 -mr-3 h-7 w-7 rounded-full bg-white border border-ocean-200 shadow-sm flex items-center justify-center text-ocean-500 hover:text-ocean-700 hover:border-ocean-300 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

function SimilarPromptsSection({
  similar,
  hasSimilarTopic,
  hasSimilarType,
  displayTopicName,
  displayQuestionType,
}: {
  similar: SimilarData
  hasSimilarTopic: boolean
  hasSimilarType: boolean
  displayTopicName: string | null
  displayQuestionType: QuestionType | null
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="border-t border-ocean-100 pt-4">
      {/* Header row — full width clickable when collapsed */}
      {!expanded ? (
        <button
          onClick={() => setExpanded(true)}
          className="w-full flex items-center gap-2 sm:gap-3 group"
        >
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <PenLine className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600 flex-shrink-0" />
            <h2 className="text-base sm:text-xl font-semibold text-ocean-800 group-hover:text-ocean-700 transition-colors">Practice Similar Prompts</h2>
          </div>
          <span className="flex-1 h-px bg-ocean-200 group-hover:bg-ocean-300 transition-colors" />
          <span className="text-xs sm:text-sm text-ocean-400 group-hover:text-ocean-600 font-medium transition-colors whitespace-nowrap flex-shrink-0">
            Show details
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            <PenLine className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600 flex-shrink-0" />
            <h2 className="text-base sm:text-xl font-semibold text-ocean-800">Practice Similar Prompts</h2>
          </div>
          <Link
            href="/write"
            className="text-xs text-ocean-500 hover:text-ocean-700 font-medium transition-colors flex-shrink-0"
          >
            Visit prompt library →
          </Link>
        </div>
      )}

      {expanded && (
        <div className="mt-4 space-y-4">
          {hasSimilarTopic && (
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-ocean-500">
                Same topic
                {displayTopicName && (
                  <span className="ml-1 font-semibold text-ocean-700">— {displayTopicName}</span>
                )}
              </p>
              <HorizontalScrollRow prompts={similar.sameTopicPrompts} />
            </div>
          )}

          {hasSimilarType && (
            <div className="space-y-2.5">
              <p className="text-xs font-medium text-ocean-500">
                Same question type
                {displayQuestionType && (
                  <span className="ml-1 font-semibold text-ocean-700">— {QUESTION_TYPE_LABELS[displayQuestionType]}</span>
                )}
              </p>
              <HorizontalScrollRow prompts={similar.sameTypePrompts} />
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end">
            <button
              onClick={() => setExpanded(false)}
              className="text-xs text-ocean-400 hover:text-ocean-600 font-medium transition-colors"
            >
              Show less
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export function PromptContextZone({
  essayId,
  promptText,
  initialClassificationStatus,
  initialPromptId,
  initialTopicId,
  initialQuestionType,
  initialTopicName,
}: PromptContextZoneProps) {
  const [status, setStatus] = useState<ClassificationStatus>(initialClassificationStatus)
  const [topicId, setTopicId] = useState(initialTopicId)
  const [questionType, setQuestionType] = useState(initialQuestionType)
  const [topicName, setTopicName] = useState(initialTopicName)
  const [similar, setSimilar] = useState<SimilarData | null>(null)
  const [pollCount, setPollCount] = useState(0)
  const hasPolledRef = useRef(false)

  const fetchSimilar = useCallback(async (tid: string, qtype: string) => {
    try {
      const res = await fetch(`/api/prompts/similar?topicId=${tid}&questionType=${encodeURIComponent(qtype)}`)
      if (res.ok) {
        const data = await res.json()
        setSimilar(data)
      }
    } catch {
      // silent — similar prompts are enhancement only
    }
  }, [])

  // Trigger classification:
  // - on mount if status is 'unclassified' (new paste essay) or 'pending' (stale from killed serverless)
  // - again whenever polling gives up and resets status back to 'unclassified'
  const triggerClassify = useCallback(() => {
    setStatus('pending')
    fetch('/api/essays/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ essay_id: essayId, prompt_text: promptText }),
    }).catch(() => {/* silent */})
  }, [essayId, promptText])

  // On mount: trigger if not yet done
  useEffect(() => {
    if (initialClassificationStatus === 'unclassified' || initialClassificationStatus === 'pending') {
      triggerClassify()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // After polling gives up and resets to 'unclassified': trigger classify again
  useEffect(() => {
    if (status === 'unclassified' && hasPolledRef.current) {
      triggerClassify()
    }
  }, [status, triggerClassify])

  // On mount: if already classified with topic+type, fetch similar immediately
  useEffect(() => {
    if (status === 'classified' && topicId && questionType) {
      fetchSimilar(topicId, questionType)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Poll status until classification is done (max 30 polls × 2s = 60s)
  // If still pending after 30 polls (classify was likely killed by serverless timeout),
  // reset to unclassified so the retry useEffect above retriggers classification.
  useEffect(() => {
    if (status !== 'pending') return
    hasPolledRef.current = true
    if (pollCount >= 30) {
      setStatus('unclassified')
      setPollCount(0)
      return
    }

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/essays/${essayId}/status`)
        if (res.ok) {
          const data = await res.json()
          const newStatus = data.prompt_classification_status as ClassificationStatus
          setStatus(newStatus)
          if (newStatus === 'classified' && data.essay_topic_id && data.essay_question_type) {
            setTopicId(data.essay_topic_id)
            setQuestionType(data.essay_question_type)
            setTopicName(data.essay_topic_name ?? null)
            fetchSimilar(data.essay_topic_id, data.essay_question_type)
          }
        }
      } catch {
        // silent
      }
      setPollCount(c => c + 1)
    }, 2000)

    return () => clearTimeout(timer)
  }, [status, pollCount, essayId, fetchSimilar])

  const hasSimilarTopic = (similar?.sameTopicPrompts.length ?? 0) > 0
  const hasSimilarType = (similar?.sameTypePrompts.length ?? 0) > 0
  const hasSimilar = hasSimilarTopic || hasSimilarType

  const displayTopicName = topicName ?? similar?.topic?.name ?? null
  const displayQuestionType = (questionType as QuestionType | null) ?? similar?.questionType ?? null

  return (
    <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
      <BookOpen className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

      <CardContent className="p-5 space-y-4 relative z-10">
        {/* Prompt text — always shown */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-3 mb-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600 flex-shrink-0" />
              <h2 className="text-base sm:text-xl font-semibold text-ocean-800">Your Prompt</h2>
            </div>
            {status === 'classified' && displayQuestionType && displayTopicName && (
              <div className="flex gap-1.5 flex-wrap">
                <Badge variant="outline" className={`text-[11px] sm:text-xs font-medium ${QUESTION_TYPE_COLORS[displayQuestionType] ?? 'bg-slate-200 text-slate-700 border-slate-300'}`}>
                  {QUESTION_TYPE_LABELS[displayQuestionType] ?? displayQuestionType}
                </Badge>
                <Badge variant="outline" className="text-[11px] sm:text-xs bg-orange-100 text-orange-800 border-orange-300 font-medium">
                  {displayTopicName}
                </Badge>
              </div>
            )}
          </div>
          <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-3 sm:p-3.5">
            <p className="text-ocean-800 leading-relaxed text-xs sm:text-sm">{promptText}</p>
          </div>
        </div>

        {/* State: Pending */}
        {status === 'pending' && (
          <div className="border-t border-ocean-100 pt-3 sm:pt-4 flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <PenLine className="h-4 w-4 sm:h-5 sm:w-5 text-ocean-600 flex-shrink-0" />
              <h2 className="text-base sm:text-xl font-semibold text-ocean-800">Practice Similar Prompts</h2>
            </div>
            <span className="flex-1 h-px bg-ocean-100" />
            <div className="flex items-center gap-1 sm:gap-1.5 text-ocean-400 flex-shrink-0">
              <Loader2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 animate-spin" />
              <span className="text-xs sm:text-sm font-medium">Analyzing…</span>
            </div>
          </div>
        )}

        {/* State: Invalid */}
        {status === 'invalid' && (
          <div className="rounded-lg bg-amber-50 border border-amber-200 p-3.5 space-y-2">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-amber-800">
                This doesn&apos;t appear to be an IELTS Writing Task 2 prompt. Similar prompt suggestions are not available.
              </p>
            </div>
            <Link
              href="/write"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700 hover:text-amber-900 transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              Browse real Task 2 prompts
            </Link>
          </div>
        )}

        {/* State: Classified with similar prompts */}
        {status === 'classified' && hasSimilar && (
          <SimilarPromptsSection
            similar={similar!}
            hasSimilarTopic={hasSimilarTopic}
            hasSimilarType={hasSimilarType}
            displayTopicName={displayTopicName}
            displayQuestionType={displayQuestionType}
          />
        )}

        {/* State: Classified but no similar prompts in DB yet */}
        {status === 'classified' && similar && !hasSimilar && (
          <div className="border-t border-ocean-100 pt-3">
            <Link
              href="/write"
              className="inline-flex items-center gap-1.5 text-sm text-ocean-600 hover:text-ocean-800 font-medium transition-colors"
            >
              <BookOpen className="h-4 w-4" />
              Explore prompt library to keep practicing →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
