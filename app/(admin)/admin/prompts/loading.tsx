import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function PromptsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
      {/* Header Panel */}
      <div className="rounded-3xl border border-ocean-200 bg-gradient-to-br from-white via-ocean-50/50 to-cyan-50/40 shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-ocean-100/40 opacity-30 rotate-[-12deg]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 md:h-11 w-44 md:w-56" />
            <Skeleton className="h-5 w-64 md:w-80" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl self-start" />
        </div>
      </div>

      {/* Content Panel */}
      <div className="rounded-2xl border border-ocean-200 bg-white shadow-lg p-4 md:p-5 space-y-6">
        {/* Contribution Ranking skeleton */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-5 w-24 rounded-full ml-auto" />
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex items-center gap-3 py-1.5 px-2">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-8" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Filter Bar */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 w-full sm:w-52" />
              <Skeleton className="h-10 w-full sm:w-52" />
              <Skeleton className="h-10 w-full sm:w-32" />
            </div>
          </CardContent>
        </Card>

        {/* Stats summary */}
        <Skeleton className="h-4 w-36" />

        {/* Prompt Cards */}
        <div className="space-y-3">
          {[0, 1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Prompt text */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-28 mt-1" />
                  </div>
                  {/* Badges + action buttons */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Skeleton className="h-6 w-28 rounded-full" />
                    <Skeleton className="h-6 w-20 rounded-full" />
                    <div className="flex gap-1 ml-1">
                      <Skeleton className="h-7 w-7 rounded-md" />
                      <Skeleton className="h-7 w-7 rounded-md" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-9 rounded-lg" />
        </div>
      </div>
    </div>
  )
}
