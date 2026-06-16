'use client'

import { FileText, TrendingUp, Award, ArrowUpRight } from 'lucide-react'

interface StatsStripProps {
  totalEssays: number
  averageScore: number | null
  latestScore: number | null
}

/**
 * Hero stat strip — one seamless gradient band (no inner boxes), big numbers.
 * Replaces the old boxed ProgressSummary grid. Reads as "where you are right now".
 */
export function StatsStrip({ totalEssays, averageScore, latestScore }: StatsStripProps) {
  if (totalEssays === 0) return null

  const delta =
    latestScore !== null && averageScore !== null ? latestScore - averageScore : null
  const improving = delta !== null && delta > 0.05

  const stats = [
    {
      icon: FileText,
      label: 'Essays Written',
      value: totalEssays.toString(),
      hint: null as string | null,
    },
    {
      icon: Award,
      label: 'Average Band',
      value: averageScore?.toFixed(1) ?? '—',
      hint: null,
    },
    {
      icon: TrendingUp,
      label: 'Latest Score',
      value: latestScore?.toFixed(1) ?? '—',
      hint: improving ? `+${delta!.toFixed(1)} vs avg` : null,
    },
  ]

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-600 via-ocean-600 to-cyan-600 px-6 py-5 md:px-8 md:py-6 shadow-lg">
      {/* soft decorative glow, not a watermark icon */}
      <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-cyan-300/20 blur-2xl" />

      <div className="relative z-10 grid grid-cols-3 divide-x divide-white/15">
        {stats.map((s) => {
          const Icon = s.icon
          return (
            <div key={s.label} className="flex flex-col items-center px-3 text-center md:px-6">
              <div className="mb-1.5 flex items-center gap-1.5 text-white/70">
                <Icon className="h-3.5 w-3.5" />
                <span className="text-[11px] font-medium uppercase tracking-wide">{s.label}</span>
              </div>
              <div className="flex flex-col items-center gap-1 sm:flex-row sm:items-baseline sm:gap-2">
                <span className="text-3xl md:text-4xl font-extrabold leading-none text-white">
                  {s.value}
                </span>
                {s.hint && (
                  <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-emerald-200">
                    <ArrowUpRight className="h-3 w-3" />
                    {s.hint}
                  </span>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
