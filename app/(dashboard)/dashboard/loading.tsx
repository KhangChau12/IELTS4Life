import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-7 md:space-y-9 px-4 py-6">
      {/* Welcome Section Skeleton */}
      <div className="mb-8 md:mb-10 space-y-2">
        <Skeleton className="h-8 md:h-10 w-64 md:w-80" />
        <Skeleton className="h-5 md:h-6 w-56 md:w-72" />
      </div>

      {/* Next Action Banner Skeleton */}
      <Card className="border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-50 to-cyan-50">
        <CardContent className="p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-6 w-56 md:w-72" />
              <Skeleton className="h-4 w-full max-w-xl" />
            </div>
            <Skeleton className="h-11 w-full md:w-44 rounded-lg" />
          </div>
        </CardContent>
      </Card>

      {/* Progress Summary Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="border-ocean-200 shadow-lg">
            <CardContent className="p-4 md:p-5">
              <Skeleton className="h-4 w-24 mb-3" />
              <div className="flex items-end justify-between gap-3">
                <div className="space-y-2">
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-10 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart Skeleton */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-32 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </CardContent>
      </Card>

      {/* Vocabulary Progress Skeleton */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-56" />
          <Skeleton className="h-4 w-72" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Essays Skeleton */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          {/* Mobile Card View Skeleton */}
          <div className="md:hidden space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-ocean-200 rounded-lg p-4">
                <Skeleton className="h-4 w-full mb-3" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          {/* Desktop Table Skeleton */}
          <div className="hidden md:block space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-ocean-100">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Error History Skeleton */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-44" />
          <Skeleton className="h-4 w-56" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
          <Skeleton className="h-10 w-full rounded-lg" />
        </CardContent>
      </Card>
    </div>
  )
}
