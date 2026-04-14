'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart, Target } from 'lucide-react'
import {
  BarChart as RechartsBarChart,
  Bar,
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts'

type CriteriaKey = 'taskResponse' | 'coherence' | 'vocabulary' | 'grammar'

interface ScoreDistributionProps {
  scoreDistribution: {
    overall: { [key: number]: number }
    taskResponse: { [key: number]: number }
    coherence: { [key: number]: number }
    lexical: { [key: number]: number }
    grammar: { [key: number]: number }
  }
  criteriaOverTime?: Array<{
    essayNumber: number
    taskResponse: number | null
    coherence: number | null
    vocabulary: number | null
    grammar: number | null
  }>
  hasEssays: boolean
}

export function ScoreDistribution({ scoreDistribution, criteriaOverTime, hasEssays }: ScoreDistributionProps) {
  console.log('[ScoreDistribution] Props received:', { scoreDistribution, criteriaOverTime, hasEssays })

  // State for criteria filter
  const [visibleCriteria, setVisibleCriteria] = useState({
    taskResponse: true,
    coherence: false,
    vocabulary: false,
    grammar: false,
  })

  const toggleCriteria = (criteria: CriteriaKey) => {
    setVisibleCriteria(prev => ({
      ...prev,
      [criteria]: !prev[criteria]
    }))
  }

  if (!hasEssays) {
    console.log('[ScoreDistribution] No essays, returning null')
    return null // Don't show if no essays
  }

  // Prepare overall band distribution data
  const overallData = Object.entries(scoreDistribution.overall || {})
    .map(([band, count]) => ({
      band: `Band ${band}`,
      count,
      fill: getBandColor(parseInt(band)),
    }))
    .sort((a, b) => parseInt(a.band.split(' ')[1]) - parseInt(b.band.split(' ')[1]))

  const hasOverallData = overallData.length > 0
  const hasCriteriaData = criteriaOverTime && criteriaOverTime.length > 0

  console.log('[ScoreDistribution] Data check:', {
    overallData,
    criteriaOverTime,
    hasOverallData,
    hasCriteriaData
  })

  // Don't render if no data at all
  if (!hasOverallData && !hasCriteriaData) {
    console.log('[ScoreDistribution] No data at all, returning null')
    return null
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* Overall Band Distribution */}
      {hasOverallData && (
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader>
            <CardTitle className="text-ocean-800 flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Band Score Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 280 }}>
              <ResponsiveContainer>
                <RechartsBarChart data={overallData} margin={{ top: 16, right: 16, left: -8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="barBand5" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#fbbf24" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.85} />
                    </linearGradient>
                    <linearGradient id="barBand6" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.85} />
                    </linearGradient>
                    <linearGradient id="barBand7" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#67e8f9" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.85} />
                    </linearGradient>
                    <linearGradient id="barBand8" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6ee7b7" stopOpacity={0.95} />
                      <stop offset="100%" stopColor="#34d399" stopOpacity={0.85} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
                  <XAxis
                    dataKey="band"
                    tick={{ fill: '#0c4a6e', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <YAxis
                    tick={{ fill: '#0c4a6e', fontSize: 12 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(6, 182, 212, 0.08)' }}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #7dd3fc',
                      borderRadius: '12px',
                      boxShadow: '0 12px 30px rgba(2, 132, 199, 0.12)',
                      padding: '10px 12px',
                    }}
                    labelStyle={{ color: '#0c4a6e', fontWeight: 700, marginBottom: 4 }}
                    formatter={(value: any) => [typeof value === 'number' ? value.toString() : value, 'Essays']}
                  />
                  <Bar dataKey="count" radius={[14, 14, 0, 0]} maxBarSize={84}>
                    {overallData.map((entry, index) => {
                      const bandNumber = entry.band.split(' ')[1]
                      const gradientId = `barBand${bandNumber}`

                      return <Cell key={`cell-${index}`} fill={`url(#${gradientId})`} />
                    })}
                    <LabelList
                      dataKey="count"
                      position="top"
                      offset={8}
                      fill="#0c4a6e"
                      fontSize={12}
                      fontWeight={700}
                    />
                  </Bar>
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-ocean-600 text-center mt-3">
              How your essays are distributed across band scores
            </p>
          </CardContent>
        </Card>
      )}

      {/* Criteria Performance Over Time */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader>
          <div>
            <CardTitle className="text-ocean-800 flex items-center gap-2 mb-4">
              <Target className="h-5 w-5" />
              Criteria Performance Over Time
            </CardTitle>
            {/* Interactive legend - click to toggle */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => toggleCriteria('taskResponse')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  visibleCriteria.taskResponse
                    ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-300'
                    : 'bg-gray-100 text-gray-500 opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${visibleCriteria.taskResponse ? 'bg-blue-500' : 'bg-gray-300'}`}></span>
                Task Response
              </button>
              <button
                onClick={() => toggleCriteria('coherence')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  visibleCriteria.coherence
                    ? 'bg-green-100 text-green-700 ring-2 ring-green-300'
                    : 'bg-gray-100 text-gray-500 opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${visibleCriteria.coherence ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                Coherence
              </button>
              <button
                onClick={() => toggleCriteria('vocabulary')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  visibleCriteria.vocabulary
                    ? 'bg-yellow-100 text-yellow-700 ring-2 ring-yellow-300'
                    : 'bg-gray-100 text-gray-500 opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${visibleCriteria.vocabulary ? 'bg-yellow-500' : 'bg-gray-300'}`}></span>
                Vocabulary
              </button>
              <button
                onClick={() => toggleCriteria('grammar')}
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  visibleCriteria.grammar
                    ? 'bg-pink-100 text-pink-700 ring-2 ring-pink-300'
                    : 'bg-gray-100 text-gray-500 opacity-50'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${visibleCriteria.grammar ? 'bg-pink-500' : 'bg-gray-300'}`}></span>
                Grammar
              </button>
            </div>
            <p className="text-xs text-ocean-500 mt-2">Click to toggle criteria visibility</p>
          </div>
        </CardHeader>
        <CardContent>
          {hasCriteriaData ? (
            <>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <ComposedChart data={criteriaOverTime} margin={{ top: 10, right: 30, left: -10, bottom: 30 }}>
                    <defs>
                      <linearGradient id="colorTaskResponse" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorCoherence" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVocabulary" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorGrammar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" vertical={false} />
                    <XAxis
                      dataKey="essayNumber"
                      tick={{ fill: '#0c4a6e', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis
                      domain={[5, 9]}
                      ticks={[5, 6, 7, 8, 9]}
                      tick={{ fill: '#0c4a6e', fontSize: 12 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip content={<CriteriaTooltip />} />
                    
                    {/* Area for background gradient - only show if visible */}
                    {visibleCriteria.taskResponse && (
                      <Area
                        type="monotone"
                        dataKey="taskResponse"
                        fill="url(#colorTaskResponse)"
                        stroke="none"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.coherence && (
                      <Area
                        type="monotone"
                        dataKey="coherence"
                        fill="url(#colorCoherence)"
                        stroke="none"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.vocabulary && (
                      <Area
                        type="monotone"
                        dataKey="vocabulary"
                        fill="url(#colorVocabulary)"
                        stroke="none"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.grammar && (
                      <Area
                        type="monotone"
                        dataKey="grammar"
                        fill="url(#colorGrammar)"
                        stroke="none"
                        connectNulls
                      />
                    )}

                    {/* Lines on top for clarity - only show if visible */}
                    {visibleCriteria.taskResponse && (
                      <Line
                        type="monotone"
                        dataKey="taskResponse"
                        stroke="#3b82f6"
                        strokeWidth={2.8}
                        dot={{ fill: '#3b82f6', r: 5.5, strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6.5 }}
                        name="Task Response"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.coherence && (
                      <Line
                        type="monotone"
                        dataKey="coherence"
                        stroke="#10b981"
                        strokeWidth={2.8}
                        dot={{ fill: '#10b981', r: 5.5, strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6.5 }}
                        name="Coherence"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.vocabulary && (
                      <Line
                        type="monotone"
                        dataKey="vocabulary"
                        stroke="#f59e0b"
                        strokeWidth={2.8}
                        dot={{ fill: '#f59e0b', r: 5.5, strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6.5 }}
                        name="Vocabulary"
                        connectNulls
                      />
                    )}
                    {visibleCriteria.grammar && (
                      <Line
                        type="monotone"
                        dataKey="grammar"
                        stroke="#ec4899"
                        strokeWidth={2.8}
                        dot={{ fill: '#ec4899', r: 5.5, strokeWidth: 1, stroke: '#ffffff' }}
                        activeDot={{ r: 6.5 }}
                        name="Grammar"
                        connectNulls
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-ocean-600 text-center mt-4">
                Track how each criteria score changes across your essays
              </p>
            </>
          ) : (
            <div className="h-[280px] flex items-center justify-center">
              <div className="text-center text-ocean-500">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No criteria scores yet</p>
                <p className="text-xs mt-1">Submit essays to see your performance</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function getBandColor(band: number): string {
  if (band >= 8) return '#6ee7b7' // emerald-300 - pastel green
  if (band >= 7) return '#67e8f9' // cyan-300 - light cyan
  if (band >= 6) return '#93c5fd' // blue-300 - soft blue
  if (band >= 5) return '#fcd34d' // amber-300 - pastel yellow
  return '#fca5a5' // red-300 - soft red
}

function CriteriaTooltip({ active, label, payload }: any) {
  if (!active || !payload || payload.length === 0) return null

  const visibleItems = payload.filter((item: any) => item?.value !== null && item?.value !== undefined)

  return (
    <div className="rounded-xl border border-cyan-200 bg-white px-4 py-3 shadow-lg min-w-[190px]">
      <p className="text-sm font-semibold text-ocean-800 mb-2">Essay {label}</p>
      <div className="space-y-1.5">
        {visibleItems.map((item: any) => (
          <div key={item.dataKey} className="flex items-center justify-between gap-4 text-sm">
            <span className="flex items-center gap-2 text-ocean-700">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              {item.name || item.dataKey}
            </span>
            <span className="font-semibold text-ocean-900">
              {typeof item.value === 'number' ? item.value.toFixed(1) : item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function calculateAverage(distribution: { [key: number]: number }): number {
  const entries = Object.entries(distribution)
  if (entries.length === 0) return 0

  const sum = entries.reduce((acc, [band, count]) => acc + parseInt(band) * count, 0)
  const total = entries.reduce((acc, [, count]) => acc + count, 0)

  return total > 0 ? sum / total : 0
}
