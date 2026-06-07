import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function HistoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Header Skeleton */}
      <div className="mb-6 md:mb-8">
        <Skeleton className="h-8 md:h-10 w-48 md:w-64 mb-2" />
        <Skeleton className="h-5 md:h-6 w-64 md:w-80" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <Card className="border-ocean-100 shadow-sm bg-ocean-50/50 mb-4">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
            <Skeleton className="h-8 w-36 rounded-md" />
            <div className="sm:ml-auto flex gap-1.5">
              <Skeleton className="h-8 w-8 rounded-md" />
              <Skeleton className="h-8 w-14 rounded-md" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Essay Card Skeletons — match new 3-zone layout */}
      <div className="space-y-3 md:space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-ocean-200 shadow-lg overflow-hidden">
            <div className="p-4 md:p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-4">

                {/* Zone 1: Score badge skeleton */}
                <div className="flex sm:flex-col items-center gap-3 sm:gap-1.5 sm:w-[76px] flex-shrink-0">
                  <Skeleton className="h-16 w-16 rounded-2xl" />
                  <Skeleton className="h-3 w-14" />
                </div>

                {/* Zone 2: Content skeleton */}
                <div className="flex-1 min-w-0 space-y-2.5">
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  {/* Meta row */}
                  <div className="flex gap-3">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3.5 w-16" />
                  </div>
                  {/* Mini-bars strip */}
                  <Skeleton className="h-2 w-52 mt-1" />
                </div>

                {/* Zone 3: Action buttons skeleton */}
                <div className="flex sm:flex-col gap-2 flex-shrink-0 sm:w-[120px]">
                  <Skeleton className="h-9 flex-1 sm:flex-none sm:w-full rounded-md" />
                  <Skeleton className="h-9 flex-1 sm:flex-none sm:w-full rounded-md" />
                </div>

              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Write New Essay Button Skeleton */}
      <div className="mt-6 md:mt-8 text-center">
        <Skeleton className="h-11 w-48 mx-auto" />
      </div>
    </div>
  )
}
