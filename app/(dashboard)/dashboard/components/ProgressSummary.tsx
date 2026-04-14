'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, FileText } from 'lucide-react'

interface ProgressSummaryProps {
  totalEssays: number
  averageScore: number | null
  latestScore: number | null
}

export function ProgressSummary({
  totalEssays,
  averageScore,
  latestScore,
}: ProgressSummaryProps) {
  if (totalEssays === 0) return null

  const improvement = latestScore && averageScore && latestScore > averageScore
  const improvementValue = improvement ? latestScore - averageScore : 0

  return (
    <Card className="border-ocean-200 shadow-md bg-gradient-to-r from-ocean-50 to-cyan-50 mb-6">
      <CardContent className="py-5 px-5 md:px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {/* Total Essays */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-ocean-100 p-2.5">
              <FileText className="h-5 w-5 text-ocean-600" />
            </div>
            <div>
              <p className="text-xs text-ocean-600 font-medium">Essays Written</p>
              <p className="text-2xl font-bold text-ocean-800">{totalEssays}</p>
            </div>
          </div>

          {/* Average Score */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2.5">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-ocean-600 font-medium">Average Band</p>
              <p className="text-2xl font-bold bg-gradient-to-r from-ocean-600 to-cyan-600 bg-clip-text text-transparent">
                {averageScore?.toFixed(1) ?? '—'}
              </p>
            </div>
          </div>

          {/* Latest Score */}
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${improvement ? 'bg-green-100' : 'bg-amber-100'}`}>
              <TrendingUp className={`h-5 w-5 ${improvement ? 'text-green-600' : 'text-amber-600'}`} />
            </div>
            <div>
              <p className="text-xs text-ocean-600 font-medium">Latest Score</p>
              <p className="text-2xl font-bold text-ocean-800">{latestScore?.toFixed(1) ?? '—'}</p>
            </div>
          </div>

          {/* Improvement Indicator */}
          {improvement && (
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2.5">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-ocean-600 font-medium">Improvement</p>
                <p className="text-2xl font-bold text-green-600">+{improvementValue.toFixed(1)}</p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
