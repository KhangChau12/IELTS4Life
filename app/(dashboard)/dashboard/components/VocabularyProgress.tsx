'use client'

import { useEffect, useState } from 'react'
import { BookOpen, AlertCircle, ArrowRight, CalendarDays, ExternalLink, Sparkles } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'

interface VocabSnapshotProps {
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

/** Compact stats card — pairs with ScoreChart in the side-by-side row. */
export function VocabSnapshot({
  totalWords,
  essaysWithoutVocab,
  quizScore,
  totalCorrect,
  totalQuestions,
  totalAttempts,
}: VocabSnapshotProps) {
  if (totalWords === 0 && totalQuestions === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-ocean-100 bg-white p-5 text-center shadow-sm">
        <h3 className="mb-1.5 text-[14.5px] font-extrabold text-slate-900">Build Your Word Bank</h3>
        <p className="mb-4 text-xs text-slate-400">Submit essays to extract vocabulary and practice with quizzes.</p>
        <Link
          href="/score"
          className="inline-flex items-center gap-1.5 rounded-lg bg-ocean-900 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-ocean-800"
        >
          Start with an Essay
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
      <h3 className="text-[14.5px] font-extrabold text-slate-900">Vocabulary &amp; Quizzes</h3>
      <p className="mb-4 text-xs text-slate-400">Your word bank so far</p>

      <div className="mb-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Words learned</span>
          <span className="text-[19px] font-extrabold text-slate-900 tabular-nums">{totalWords}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500">Quizzes completed</span>
          <span className="text-[19px] font-extrabold text-slate-900 tabular-nums">{totalAttempts}</span>
        </div>
        {totalQuestions > 0 ? (
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              Accuracy <span className="text-slate-300">· {totalCorrect}/{totalQuestions}</span>
            </span>
            <span className="text-[19px] font-extrabold text-emerald-600 tabular-nums">{quizScore.toFixed(0)}%</span>
          </div>
        ) : (
          <Link href="/history" className="group flex items-center justify-between">
            <span className="text-xs font-semibold text-cyan-700 group-hover:text-cyan-800">
              Start a quiz
              <ArrowRight className="ml-0.5 -mt-0.5 inline h-3 w-3" />
            </span>
            <span className="text-[19px] font-extrabold text-ocean-200 group-hover:text-cyan-300">—</span>
          </Link>
        )}
      </div>

      {essaysWithoutVocab > 0 && (
        <div className="mt-auto flex items-center gap-2 rounded-lg bg-amber-50 px-2.5 py-2">
          <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-500" />
          <span className="text-[11.5px] font-semibold text-amber-800">
            {essaysWithoutVocab} essay{essaysWithoutVocab > 1 ? 's' : ''} without vocab yet
          </span>
        </div>
      )}
    </div>
  )
}

function RecentVocabSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {[0, 1].map((i) => (
        <div key={i} className="space-y-3 border-l-2 border-ocean-100 pl-3">
          <div className="animate-pulse space-y-3">
            <div className="h-3 w-24 rounded bg-ocean-100" />
            <div className="h-4 w-4/5 rounded bg-ocean-100" />
            <div className="space-y-2">
              {[0, 1].map((j) => (
                <div key={j} className="h-4 w-full rounded bg-ocean-50" />
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/** Full-width "Recent Vocabulary" panel — self-fetches on mount, compact 2-col cards. */
export function RecentVocabulary({ totalWords }: { totalWords: number }) {
  const [pastVocab, setPastVocab] = useState<PastVocabEntry[] | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (totalWords === 0) return

    const fetchVocab = async () => {
      setLoading(true)
      try {
        const res = await fetch('/api/dashboard/look-back/vocab')
        if (res.ok) {
          const data = await res.json()
          setPastVocab(data.entries ?? [])
        }
      } catch {
        setPastVocab([])
      } finally {
        setLoading(false)
      }
    }

    void fetchVocab()
  }, [totalWords])

  if (totalWords === 0) return null

  return (
    <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm md:p-6">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="flex items-center gap-2 text-[14.5px] font-extrabold text-slate-900">
          <BookOpen className="h-4 w-4 text-cyan-600" />
          Recent Vocabulary
        </h3>
      </div>

      {loading ? (
        <RecentVocabSkeleton />
      ) : pastVocab !== null ? (
        pastVocab.length === 0 ? (
          <p className="text-sm text-slate-400">Generate vocabulary from your essays to see them here.</p>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {pastVocab.map((entry) => {
              const previewItems = entry.vocabulary.slice(0, 2)
              return (
                <div key={entry.essayId} className="border-l-2 border-cyan-400 pl-3">
                  <div className="mb-0.5 flex items-center gap-1.5 text-[11px] font-semibold text-cyan-600">
                    <CalendarDays className="h-3 w-3 shrink-0" />
                    {formatDate(entry.createdAt)}
                    <span className="text-slate-300">·</span>
                    <span className="text-slate-400">
                      {entry.vocabulary.length} word{entry.vocabulary.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <p className="mb-2 truncate text-[12.5px] font-bold text-slate-900">{truncateText(entry.prompt, 70)}</p>
                  <div className="mb-2 flex flex-col gap-1.5">
                    {previewItems.map((item) => (
                      <div key={`${entry.essayId}-${item.id}`} className="flex items-center gap-1.5 text-xs">
                        {item.original_word && (
                          <span className="text-slate-300 line-through">{item.original_word}</span>
                        )}
                        <Sparkles className="h-3 w-3 shrink-0 text-cyan-500" />
                        <span className="font-bold text-slate-900">{item.suggested_word}</span>
                      </div>
                    ))}
                  </div>
                  <Link
                    href={`/history/${entry.essayId}/vocabulary`}
                    className="inline-flex items-center gap-1.5 text-[11.5px] font-bold text-cyan-700 hover:text-cyan-800"
                  >
                    Open full vocab
                    <ExternalLink className="h-3 w-3" />
                  </Link>
                </div>
              )
            })}
          </div>
        )
      ) : null}
    </div>
  )
}
