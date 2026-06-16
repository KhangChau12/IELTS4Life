'use client'

import { useState } from 'react'
import { Essay } from '@/types/essay'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import Link from 'next/link'
import { ChevronDown, ChevronUp, ArrowRight } from 'lucide-react'

interface RecentEssaysTableProps {
  essays: Essay[]
}

function scoreTone(score: number | null): { text: string; bg: string } {
  if (score === null) return { text: 'text-slate-400', bg: 'bg-slate-100' }
  if (score >= 8) return { text: 'text-violet-700', bg: 'bg-violet-100' }
  if (score >= 7) return { text: 'text-teal-700', bg: 'bg-teal-100' }
  if (score >= 6) return { text: 'text-sky-700', bg: 'bg-sky-100' }
  if (score >= 5) return { text: 'text-orange-700', bg: 'bg-orange-100' }
  return { text: 'text-rose-700', bg: 'bg-rose-100' }
}


export function RecentEssaysTable({ essays }: RecentEssaysTableProps) {
  const [visibleCount, setVisibleCount] = useState(5)
  const initialCount = 5
  const stepCount = 5
  const canLoadMore = visibleCount < essays.length
  const visibleEssays = essays.slice(0, visibleCount)

  const handleToggle = () => {
    setVisibleCount((current) => {
      if (current >= essays.length) return initialCount
      return Math.min(current + stepCount, essays.length)
    })
  }

  return (
    <div className="space-y-1">
      {/* Flat list — no table chrome, divider-separated rows */}
      <div className="divide-y divide-ocean-100">
        {visibleEssays.map((essay) => {
          const tone = scoreTone(essay.overall_score)
          return (
            <Link
              key={essay.id}
              href={`/score/${essay.id}`}
              className="group flex items-center gap-3 sm:gap-4 py-3 px-1 -mx-1 rounded-lg transition-colors hover:bg-ocean-50"
            >
              {/* Score chip — flat tinted, no gradient box */}
              <span
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone.bg} text-base font-extrabold ${tone.text}`}
              >
                {essay.overall_score !== null ? essay.overall_score.toFixed(1) : 'N/A'}
              </span>

              {/* Prompt + date */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-sm font-medium text-ocean-900 leading-snug">
                  {essay.prompt}
                </p>
                <p className="mt-1 text-xs text-ocean-500">
                  {format(new Date(essay.created_at), 'MMM d, yyyy')}
                  <span className="hidden sm:inline"> · {format(new Date(essay.created_at), 'h:mm a')}</span>
                </p>
              </div>

              <ArrowRight className="h-4 w-4 shrink-0 text-ocean-300 transition-all group-hover:translate-x-0.5 group-hover:text-ocean-600" />
            </Link>
          )
        })}
      </div>

      {essays.length > initialCount && (
        <div className="flex justify-center pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleToggle}
            className="gap-2 text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50"
          >
            {canLoadMore ? (
              <>
                <ChevronDown className="h-4 w-4" />
                Show more ({Math.min(stepCount, essays.length - visibleCount)})
              </>
            ) : (
              <>
                <ChevronUp className="h-4 w-4" />
                Show less
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
