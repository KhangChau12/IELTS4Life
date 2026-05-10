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

      {/* Next Action Banner */}
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

      {/* Progress Summary — 4 stat cards */}
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

      {/* Score Chart */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="space-y-4">
          <Skeleton className="h-6 w-56" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-20 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-24 rounded-full" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[360px] w-full rounded-2xl" />
        </CardContent>
      </Card>

      {/* Vocabulary Progress */}
      <Card className="border-0 shadow-lg overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-6 w-44" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-56 mt-1" />
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: progress bars */}
            <div className="space-y-4">
              <Skeleton className="h-5 w-36 mb-2" />
              {[1, 2].map((i) => (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-4 w-10" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
            {/* Right: pie chart placeholder */}
            <div className="flex items-center justify-center">
              <Skeleton className="h-[180px] w-[180px] rounded-full" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LookBack Tabs */}
      <Card className="overflow-hidden border-0 bg-white shadow-lg">
        {/* Gradient top border */}
        <div className="h-1 bg-gradient-to-r from-cyan-500 via-ocean-500 to-blue-500" />
        <CardHeader className="bg-gradient-to-br from-ocean-50 via-white to-cyan-50/60 pb-0">
          <div className="flex items-center gap-2 mb-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-6 w-28" />
          </div>
          <Skeleton className="h-4 w-56 mb-4" />
          {/* Tab triggers */}
          <div className="grid grid-cols-3 gap-2 pb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-9 w-full rounded-md" />
            ))}
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Mobile card view */}
          <div className="md:hidden space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="border border-ocean-100 rounded-2xl p-4 space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-9 w-full rounded-lg" />
              </div>
            ))}
          </div>

          {/* Desktop table rows */}
          <div className="hidden md:block space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-3 border-b border-ocean-100">
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-9 w-32 rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
