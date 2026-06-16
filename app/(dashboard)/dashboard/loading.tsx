import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-7 md:space-y-9 px-4 py-6">
      {/* Welcome Section */}
      <div className="mb-8 md:mb-10 space-y-2">
        <Skeleton className="h-8 md:h-10 w-64 md:w-80" />
        <Skeleton className="h-5 md:h-6 w-56 md:w-72" />
      </div>

      {/* ── StatsStrip — gradient band, 3 centered columns ── */}
      <div className="rounded-2xl bg-gradient-to-br from-ocean-600 via-ocean-600 to-cyan-600 px-6 py-5 md:px-8 md:py-6 shadow-lg">
        <div className="grid grid-cols-3 divide-x divide-white/15">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-3 md:px-6">
              <Skeleton className="h-3 w-24 bg-white/25" />
              <Skeleton className="h-9 w-16 bg-white/30" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Coverage Map — heading + hook banner + two chip sections ── */}
      <Card className="border-ocean-200 shadow-lg">
        <CardContent className="p-5 md:p-6 space-y-6">
          {/* heading */}
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80 max-w-full" />
          </div>

          {/* headline hook banner */}
          <div className="flex items-center gap-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-cyan-600 px-5 py-4">
            <Skeleton className="h-11 w-11 rounded-xl bg-white/30" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-28 bg-white/25" />
              <Skeleton className="h-4 w-56 max-w-full bg-white/30" />
            </div>
            <Skeleton className="hidden sm:block h-9 w-32 rounded-lg bg-white/40" />
          </div>

          {/* Question Types section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex flex-wrap gap-2">
              {[36, 28, 44, 32, 40, 30].map((w, i) => (
                <Skeleton key={i} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
              ))}
            </div>
          </div>

          {/* Topics section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-1.5 w-full rounded-full" />
            <div className="flex flex-wrap gap-2">
              {[34, 28, 40, 30, 38, 26, 36, 32, 30].map((w, i) => (
                <Skeleton key={i} className="h-8 rounded-full" style={{ width: `${w * 4}px` }} />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Score Chart — light card ── */}
      <Card className="border-ocean-100 shadow-sm">
        <CardHeader className="pb-3 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[20, 28, 24, 24, 24].map((w, i) => (
              <Skeleton key={i} className="h-7 rounded-full" style={{ width: `${w * 4}px` }} />
            ))}
          </div>
          <Skeleton className="h-[240px] sm:h-[300px] md:h-[360px] w-full rounded-2xl" />
        </CardContent>
      </Card>

      {/* ── Vocabulary & Quizzes — light card, flat stats + past vocab ── */}
      <Card className="border-ocean-100 shadow-sm">
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-44" />
        </CardHeader>
        <CardContent className="space-y-6">
          {/* flat stats row, divider-separated */}
          <div className="grid grid-cols-3 divide-x divide-ocean-100">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex flex-col items-center gap-1.5 px-3 sm:items-start">
                <Skeleton className="h-8 w-14" />
                <Skeleton className="h-3 w-20" />
              </div>
            ))}
          </div>

          <div className="border-t border-ocean-100" />

          {/* Recent vocabulary — flat, accent-bordered entries */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <div className="grid gap-x-8 gap-y-6 md:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="space-y-3 border-l-2 border-ocean-100 pl-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-4 w-4/5" />
                  <div className="space-y-1.5">
                    {[1, 2, 3].map((j) => (
                      <Skeleton key={j} className="h-12 w-full rounded-lg" />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Recent Essays — light card, flat list rows ── */}
      <Card className="border-ocean-100 shadow-sm">
        <CardHeader className="pb-3 space-y-2">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-4 w-52" />
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-ocean-100">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 sm:gap-4 py-3">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-28" />
                </div>
                <Skeleton className="h-4 w-4" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
