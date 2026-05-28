import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4">
      {/* Header Panel */}
      <div className="rounded-3xl border border-ocean-200 bg-gradient-to-br from-white via-ocean-50/50 to-cyan-50/40 shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-ocean-100/40 opacity-30 rotate-[-12deg]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 md:h-11 w-48 md:w-64" />
            <Skeleton className="h-5 w-56 md:w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl self-start" />
        </div>
      </div>

      {/* Hero Overview Card (gradient, 4 KPI chips) */}
      <Card className="overflow-hidden border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-600 to-cyan-600 relative">
        <CardContent className="relative z-10 p-6 md:p-8">
          {/* Title + refresh button */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-9 md:h-10 w-56 md:w-72 bg-white/20" />
              <Skeleton className="h-4 w-72 md:w-96 bg-white/15" />
              <Skeleton className="h-6 w-44 rounded-full bg-white/15" />
            </div>
            <Skeleton className="h-10 w-32 rounded-lg bg-white/20 self-start" />
          </div>

          {/* 4 KPI chips */}
          <div className="mt-6 grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-white/10 p-4 space-y-3">
                <Skeleton className="h-3 w-24 bg-white/20" />
                <Skeleton className="h-9 w-20 bg-white/20" />
                <Skeleton className="h-3 w-32 bg-white/15" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Charts — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <Card key={i} className="overflow-hidden border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50/60">
              <Skeleton className="h-5 w-40" />
              <Skeleton className="h-4 w-56 mt-1" />
            </CardHeader>
            <CardContent className="pt-4">
              <Skeleton className="h-[280px] w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Activity Charts — 2 column */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[0, 1].map((i) => (
          <Card key={i} className="overflow-hidden border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50/60">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-64 mt-1" />
            </CardHeader>
            <CardContent className="pt-4">
              <Skeleton className="h-[260px] w-full rounded-xl" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics — 4 cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((i) => (
          <Card key={i} className="overflow-hidden border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-ocean-100 pb-3 bg-gradient-to-r from-ocean-50 to-cyan-50/60">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-4 w-28" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3 pt-4">
              {[0, 1, 2, 3].map((j) => (
                <div key={j} className="flex justify-between items-center">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-5 w-16" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Users Table skeleton */}
      <Card className="overflow-hidden border-ocean-200 shadow-lg">
        <CardHeader className="border-b border-ocean-100 bg-gradient-to-r from-ocean-50 to-cyan-50/60">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
            <Skeleton className="h-10 w-56 rounded-lg" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Table header */}
          <div className="border-b border-ocean-100 px-4 py-3 grid grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-4 w-20" />
            ))}
          </div>
          {/* Table rows */}
          {[0, 1, 2, 3, 4].map((i) => (
            <div key={i} className="border-b border-ocean-50 px-4 py-3 grid grid-cols-4 gap-4 items-center">
              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-4 w-28" />
              </div>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
              <Skeleton className="h-4 w-16" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
