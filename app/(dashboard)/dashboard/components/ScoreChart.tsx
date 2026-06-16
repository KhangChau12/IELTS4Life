'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartDataPoint {
  essayNumber: number
  score: number | null
  date: string
}

interface CriteriaPoint {
  essayNumber: number
  taskResponse: number | null
  coherence: number | null
  vocabulary: number | null
  grammar: number | null
}

interface ScoreChartProps {
  data: ChartDataPoint[]
  criteriaOverTime?: CriteriaPoint[]
}

type SeriesKey = 'overall' | 'taskResponse' | 'coherence' | 'vocabulary' | 'grammar'

export function ScoreChart({ data, criteriaOverTime }: ScoreChartProps) {
  const [visibleSeries, setVisibleSeries] = useState<Record<SeriesKey, boolean>>({
    overall: true,
    taskResponse: false,
    coherence: false,
    vocabulary: false,
    grammar: false,
  })

  const seriesMeta = [
    { key: 'overall' as const, label: 'Overall', color: '#06b6d4', bgClass: 'bg-cyan-100 text-cyan-700' },
    { key: 'taskResponse' as const, label: 'Task Response', color: '#3b82f6', bgClass: 'bg-blue-100 text-blue-700' },
    { key: 'coherence' as const, label: 'Coherence', color: '#10b981', bgClass: 'bg-green-100 text-green-700' },
    { key: 'vocabulary' as const, label: 'Vocabulary', color: '#f59e0b', bgClass: 'bg-amber-100 text-amber-700' },
    { key: 'grammar' as const, label: 'Grammar', color: '#ec4899', bgClass: 'bg-pink-100 text-pink-700' },
  ]

  const criteriaByEssay = new Map<number, CriteriaPoint>()
  criteriaOverTime?.forEach((point) => {
    criteriaByEssay.set(point.essayNumber, point)
  })

  const formattedData = data.map((point) => {
    const criteria = criteriaByEssay.get(point.essayNumber)

    return {
      essay: `Essay ${point.essayNumber}`,
      overall: point.score,
      taskResponse: criteria?.taskResponse ?? null,
      coherence: criteria?.coherence ?? null,
      vocabulary: criteria?.vocabulary ?? null,
      grammar: criteria?.grammar ?? null,
      date: point.date,
    }
  })

  const toggleSeries = (series: SeriesKey) => {
    setVisibleSeries((prev) => ({
      ...prev,
      [series]: !prev[series],
    }))
  }

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-2 mb-4">
        {seriesMeta.map((series) => (
          <button
            key={series.key}
            type="button"
            onClick={() => toggleSeries(series.key)}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
              visibleSeries[series.key] ? series.bgClass : 'bg-gray-100 text-gray-500 opacity-50'
            }`}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: visibleSeries[series.key] ? series.color : '#cbd5e1' }}
            />
            {series.label}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-ocean-500">Band Score</span>
      </div>
      <div className="w-full h-[240px] sm:h-[300px] md:h-[360px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={formattedData} margin={{ top: 12, right: 28, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="overallFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#67e8f9" stopOpacity={0.38} />
                <stop offset="95%" stopColor="#67e8f9" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="taskResponseFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#93c5fd" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#93c5fd" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="coherenceFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6ee7b7" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#6ee7b7" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="vocabularyFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fcd34d" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#fcd34d" stopOpacity={0.02} />
              </linearGradient>
              <linearGradient id="grammarFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f9a8d4" stopOpacity={0.34} />
                <stop offset="95%" stopColor="#f9a8d4" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
            <XAxis
              dataKey="essay"
              stroke="#0c4a6e"
              tick={{ fill: '#0c4a6e', fontSize: 12 }}
              interval={formattedData.length <= 10 ? 0 : Math.floor(formattedData.length / 7)}
            />
            <YAxis
              domain={[4, 9]}
              ticks={[4, 5, 6, 7, 8, 9]}
              stroke="#0c4a6e"
              tick={{ fill: '#0c4a6e', fontSize: 12 }}
              tickFormatter={(value) => (value === 8 ? '8-9' : value.toString())}
            />
            <Tooltip content={<ScoreProgressTooltip />} />

            {visibleSeries.overall && (
              <Area
                type="monotone"
                dataKey="overall"
                name="Overall"
                stroke="#06b6d4"
                strokeWidth={3}
                fill="url(#overallFill)"
                dot={{ fill: '#06b6d4', strokeWidth: 2, r: formattedData.length > 20 ? 3 : 5, stroke: '#ffffff' }}
                activeDot={{ fill: '#0891b2', strokeWidth: 2, r: 7, stroke: '#ffffff' }}
                connectNulls
              />
            )}
            {visibleSeries.taskResponse && (
              <Area
                type="monotone"
                dataKey="taskResponse"
                name="Task Response"
                stroke="#3b82f6"
                strokeWidth={2.6}
                fill="url(#taskResponseFill)"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: formattedData.length > 20 ? 3 : 5, stroke: '#ffffff' }}
                activeDot={{ fill: '#2563eb', strokeWidth: 2, r: 7, stroke: '#ffffff' }}
                connectNulls
              />
            )}
            {visibleSeries.coherence && (
              <Area
                type="monotone"
                dataKey="coherence"
                name="Coherence"
                stroke="#10b981"
                strokeWidth={2.6}
                fill="url(#coherenceFill)"
                dot={{ fill: '#10b981', strokeWidth: 2, r: formattedData.length > 20 ? 3 : 5, stroke: '#ffffff' }}
                activeDot={{ fill: '#059669', strokeWidth: 2, r: 7, stroke: '#ffffff' }}
                connectNulls
              />
            )}
            {visibleSeries.vocabulary && (
              <Area
                type="monotone"
                dataKey="vocabulary"
                name="Vocabulary"
                stroke="#f59e0b"
                strokeWidth={2.6}
                fill="url(#vocabularyFill)"
                dot={{ fill: '#f59e0b', strokeWidth: 2, r: formattedData.length > 20 ? 3 : 5, stroke: '#ffffff' }}
                activeDot={{ fill: '#d97706', strokeWidth: 2, r: 7, stroke: '#ffffff' }}
                connectNulls
              />
            )}
            {visibleSeries.grammar && (
              <Area
                type="monotone"
                dataKey="grammar"
                name="Grammar"
                stroke="#ec4899"
                strokeWidth={2.6}
                fill="url(#grammarFill)"
                dot={{ fill: '#ec4899', strokeWidth: 2, r: formattedData.length > 20 ? 3 : 5, stroke: '#ffffff' }}
                activeDot={{ fill: '#db2777', strokeWidth: 2, r: 7, stroke: '#ffffff' }}
                connectNulls
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function ScoreProgressTooltip({ active, label, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const visibleItems = payload.filter((item: any) => item?.value !== null && item?.value !== undefined)
  const date = payload[0]?.payload?.date

  return (
    <div className="rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-lg min-w-[200px]">
      <p className="text-sm font-semibold text-ocean-800 mb-2">{label}</p>
      <div className="space-y-1.5">
        {visibleItems.map((item: any) => {
          const displayValue = typeof item.value === 'number' ? (item.value >= 8 ? '8-9' : item.value.toFixed(1)) : item.value

          return (
            <div key={item.dataKey} className="flex items-center justify-between gap-4 text-sm">
              <span className="flex items-center gap-2 text-ocean-700">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name || item.dataKey}
              </span>
              <span className="font-semibold text-ocean-900">{displayValue}</span>
            </div>
          )
        })}
      </div>
      {date && (
        <p className="mt-3 text-xs text-ocean-500">{format(new Date(date), 'MMM d, yyyy')}</p>
      )}
    </div>
  )
}
