'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Brain, BookOpen, AlertCircle, ArrowRight, CalendarDays, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'

interface VocabularyProgressProps {
  totalWords: number
  essaysWithoutVocab: number
  quizScore: number
  totalCorrect: number
  totalQuestions: number
  totalAttempts: number
}

interface PastVocabEntry {
  essayId: string
  prompt: string
  createdAt: string
  vocabulary: VocabularyItem[]
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

function PastVocabSection({ entries }: { entries: PastVocabEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ocean-200 bg-gradient-to-br from-ocean-50 to-cyan-50 p-6 text-center">
        <p className="text-sm text-ocean-600">Generate vocabulary from your essays to see them here.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => {
        const previewItems = entry.vocabulary.slice(0, 3)
        return (
          <div
            key={entry.essayId}
            className="rounded-xl border border-ocean-100 bg-white shadow-sm transition-shadow hover:shadow-md overflow-hidden"
          >
            <div className="p-4 md:p-5 space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-xs font-medium text-ocean-500">
                    <CalendarDays className="h-3.5 w-3.5 flex-shrink-0" />
                    {formatDate(entry.createdAt)}
                  </div>
                  <p className="text-sm font-semibold leading-snug text-ocean-900">
                    {truncateText(entry.prompt, 80)}
                  </p>
                </div>
                <Badge className="whitespace-nowrap flex-shrink-0 border-cyan-200 bg-cyan-100 text-cyan-800 text-xs">
                  {entry.vocabulary.length} word{entry.vocabulary.length !== 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-2">
                {previewItems.map((item) => (
                  <div
                    key={`${entry.essayId}-${item.id}`}
                    className="rounded-lg border border-ocean-100 bg-gradient-to-r from-ocean-50 to-white px-3 py-2.5"
                  >
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs py-0 ${item.vocab_type === 'paraphrase' ? 'border-ocean-200 text-ocean-700' : 'border-cyan-200 text-cyan-700'}`}
                      >
                        {item.vocab_type}
                      </Badge>
                      {item.original_word && (
                        <span className="text-xs text-ocean-500 line-through decoration-ocean-300">
                          {item.original_word}
                        </span>
                      )}
                      <Sparkles className="h-3 w-3 text-cyan-500" />
                      <span className="text-xs font-semibold text-ocean-900">{item.suggested_word}</span>
                    </div>
                    <p className="text-xs leading-5 text-ocean-600">{item.definition}</p>
                  </div>
                ))}
              </div>

              <div className="flex justify-end pt-0.5">
                <Link
                  href={`/history/${entry.essayId}/vocabulary`}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-700 transition-colors hover:text-cyan-800"
                >
                  Open full vocab
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function PastVocabSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="rounded-xl border border-ocean-100 bg-white p-4 md:p-5">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-24 rounded bg-ocean-100" />
            <div className="h-4 w-4/5 rounded bg-ocean-100" />
            <div className="space-y-2">
              {[0, 1, 2].map((j) => (
                <div key={j} className="h-12 rounded-lg bg-ocean-50" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function VocabularyProgress({
  totalWords,
  essaysWithoutVocab,
  quizScore,
  totalCorrect,
  totalQuestions,
  totalAttempts,
}: VocabularyProgressProps) {
  const [pastVocab, setPastVocab] = useState<PastVocabEntry[] | null>(null)
  const [loadingVocab, setLoadingVocab] = useState(false)

  useEffect(() => {
    // Only fetch if there are words to show
    if (totalWords === 0) return

    const fetchVocab = async () => {
      setLoadingVocab(true)
      try {
        const res = await fetch('/api/dashboard/look-back/vocab')
        if (res.ok) {
          const data = await res.json()
          setPastVocab(data.entries ?? [])
        }
      } catch {
        setPastVocab([])
      } finally {
        setLoadingVocab(false)
      }
    }

    void fetchVocab()
  }, [totalWords])

  // ── Empty state ──────────────────────────────────────────────────────────
  if (totalWords === 0 && totalQuestions === 0) {
    return (
      <Card className="border-0 shadow-lg bg-gradient-to-br from-ocean-50 via-cyan-50 to-blue-50 overflow-hidden relative">
        <BookOpen className="absolute right-2 bottom-2 h-52 w-52 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
        <CardHeader className="relative z-10">
          <CardTitle className="text-ocean-900">Vocabulary Learning Journey</CardTitle>
        </CardHeader>
        <CardContent className="py-8 sm:py-12 md:py-16 relative z-10">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-ocean-900 mb-3">Ready to Build Your Word Bank?</h3>
            <p className="text-ocean-700 text-base mb-8 max-w-md mx-auto">
              Submit essays to extract vocabulary and practice with engaging quizzes.
            </p>
            <Link
              href="/score"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-ocean-600 to-cyan-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-ocean-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Start with an Essay
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-lg overflow-hidden relative">
      {/* Watermark */}
      <Brain className="absolute right-2 top-2 h-48 w-48 text-cyan-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(6,182,212,0.35))]" />

      <CardHeader className="relative z-10 pb-4">
        <CardTitle className="text-ocean-900">Vocabulary &amp; Quizzes</CardTitle>
      </CardHeader>

      <CardContent className="relative z-10 space-y-6">
        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Words learned */}
          <div className="rounded-xl border border-ocean-100 bg-gradient-to-br from-ocean-50 to-white p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-ocean-900">{totalWords}</p>
            <p className="text-xs text-ocean-600 font-medium mt-0.5">Words Learned</p>
          </div>

          {/* Quizzes done */}
          <div className="rounded-xl border border-ocean-100 bg-gradient-to-br from-ocean-50 to-white p-3 sm:p-4 text-center">
            <p className="text-2xl sm:text-3xl font-bold text-ocean-900">{totalAttempts}</p>
            <p className="text-xs text-ocean-600 font-medium mt-0.5">Quizzes Done</p>
          </div>

          {/* Accuracy — embedded CTA if no quiz yet */}
          {totalQuestions > 0 ? (
            <div className="rounded-xl border border-ocean-100 bg-gradient-to-br from-ocean-50 to-white p-3 sm:p-4 text-center">
              <p className="text-2xl sm:text-3xl font-bold text-ocean-900">{quizScore.toFixed(0)}%</p>
              <p className="text-xs text-ocean-600 font-medium mt-0.5">Accuracy</p>
              <p className="text-xs text-ocean-500 mt-0.5">{totalCorrect}/{totalQuestions}</p>
            </div>
          ) : (
            <Link
              href="/history"
              className="rounded-xl border border-dashed border-cyan-200 bg-gradient-to-br from-cyan-50 to-white p-3 sm:p-4 text-center flex flex-col items-center justify-center gap-1 hover:border-cyan-300 hover:bg-cyan-50 transition-colors group"
            >
              <p className="text-2xl sm:text-3xl font-bold text-ocean-300">—</p>
              <p className="text-xs text-cyan-700 font-semibold mt-0.5 group-hover:text-cyan-800">
                Start a quiz
                <ArrowRight className="inline h-3 w-3 ml-0.5 -mt-0.5" />
              </p>
            </Link>
          )}
        </div>

        {/* ── Alert: essays pending vocab (below stats, non-intrusive) ── */}
        {essaysWithoutVocab > 0 && (
          <div className="flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2">
            <AlertCircle className="h-3.5 w-3.5 text-amber-500 flex-shrink-0" />
            <p className="text-xs text-amber-800">
              {essaysWithoutVocab} essay{essaysWithoutVocab > 1 ? 's' : ''} without vocab yet —{' '}
              <Link href="/history" className="font-semibold underline underline-offset-2 hover:text-amber-700">generate now</Link>
            </p>
          </div>
        )}

        {/* ── Divider ── */}
        <div className="border-t border-ocean-100" />

        {/* ── Past Vocab section ── */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-ocean-800 flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-cyan-600" />
            Recent Vocabulary
          </h3>

          {loadingVocab ? (
            <PastVocabSkeleton />
          ) : pastVocab !== null ? (
            <PastVocabSection entries={pastVocab} />
          ) : null}
        </div>
      </CardContent>
    </Card>
  )
}
