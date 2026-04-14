'use client'

import { useState } from 'react'
import { Essay } from '@/types/essay'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { Eye, ChevronDown, ChevronUp } from 'lucide-react'

interface RecentEssaysTableProps {
  essays: Essay[]
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'bg-gray-500'
  if (score >= 7) return 'bg-green-600'
  if (score >= 5.5) return 'bg-yellow-600'
  return 'bg-red-600'
}

function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function RecentEssaysTable({ essays }: RecentEssaysTableProps) {
  const router = useRouter()
  const [visibleCount, setVisibleCount] = useState(5)
  const initialCount = 5
  const stepCount = 5
  const canLoadMore = visibleCount < essays.length
  const visibleEssays = essays.slice(0, visibleCount)

  const handleToggle = () => {
    setVisibleCount((current) => {
      if (current >= essays.length) {
        return initialCount
      }

      return Math.min(current + stepCount, essays.length)
    })
  }

  return (
    <div className="space-y-4">
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {visibleEssays.map((essay) => (
          <div
            key={essay.id}
            className="border border-ocean-200 rounded-lg p-4 bg-white hover:bg-ocean-50 transition-colors"
          >
            <div className="flex items-start justify-between mb-3">
              <p className="text-sm text-ocean-700 flex-1 pr-3">
                {truncateText(essay.prompt, 80)}
              </p>
              <Badge
                className={`${getScoreColor(
                  essay.overall_score
                )} text-white font-bold px-2 py-1 text-xs whitespace-nowrap`}
              >
                {essay.overall_score !== null
                  ? essay.overall_score.toFixed(1)
                  : 'N/A'}
              </Badge>
            </div>
            <div className="flex items-center justify-between text-xs text-ocean-600 mb-3">
              <div>
                <p>{format(new Date(essay.created_at), 'MMM d, yyyy')}</p>
                <p className="text-ocean-500">{format(new Date(essay.created_at), 'h:mm a')}</p>
              </div>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push(`/write/${essay.id}`)}
              className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-100"
            >
              <Eye className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ocean-200 bg-ocean-50">
              <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-800">
                Prompt
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-800">
                Score
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-800">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-ocean-800">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleEssays.map((essay) => (
              <tr
                key={essay.id}
                className="border-b border-ocean-100 hover:bg-ocean-50 transition-colors"
              >
                <td className="py-3 px-4">
                  <p className="text-sm text-ocean-700 max-w-md">
                    {truncateText(essay.prompt, 80)}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <Badge
                    className={`${getScoreColor(
                      essay.overall_score
                    )} text-white font-bold px-3 py-1`}
                  >
                    {essay.overall_score !== null
                      ? essay.overall_score.toFixed(1)
                      : 'N/A'}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <p className="text-sm text-ocean-600">
                    {format(new Date(essay.created_at), 'MMM d, yyyy')}
                  </p>
                  <p className="text-xs text-ocean-500">
                    {format(new Date(essay.created_at), 'h:mm a')}
                  </p>
                </td>
                <td className="py-3 px-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/write/${essay.id}`)}
                    className="border-ocean-300 text-ocean-700 hover:bg-ocean-100"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Details
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {essays.length > initialCount && (
        <div className="flex justify-center pt-1">
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
