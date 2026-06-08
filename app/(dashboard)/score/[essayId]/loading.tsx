import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EssayResultsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-48 mb-1" />
        <Skeleton className="h-5 w-80" />
      </div>

      {/* PromptContextZone skeleton */}
      <Card className="border-ocean-200 shadow-lg overflow-hidden">
        <CardContent className="p-5 space-y-4">
          {/* "Your Prompt" heading row */}
          <div>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-6 w-28" />
              </div>
              {/* Classification badges placeholder */}
              <div className="flex gap-1.5">
                <Skeleton className="h-5 w-24 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
            {/* Prompt text box */}
            <div className="bg-ocean-50 border border-ocean-200 rounded-lg p-3.5 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          </div>

          {/* Pending indicator */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-3.5 w-3.5 rounded-full" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardContent>
      </Card>

      {/* Tab bar */}
      <div className="border-b border-ocean-100 flex gap-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-transparent">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-14 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Score tab — 2-column layout */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Left column */}
        <div className="md:w-2/5 space-y-4">
          {/* Overall score card */}
          <Card className="border-ocean-300 shadow-lg overflow-hidden">
            <div className="bg-ocean-700 p-6">
              <div className="text-center space-y-2">
                <Skeleton className="h-4 w-36 mx-auto bg-white/20" />
                <Skeleton className="h-14 w-24 mx-auto bg-white/20" />
                <Skeleton className="h-3 w-32 mx-auto bg-white/20" />
              </div>
            </div>
          </Card>

          {/* Radar chart card */}
          <Card className="border-ocean-200 shadow-sm">
            <CardHeader className="pb-2 pt-4 px-4">
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent className="px-2 pb-4 flex items-center justify-center">
              <Skeleton className="h-[220px] w-[220px] rounded-full" />
            </CardContent>
          </Card>

          {/* Score legend */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
            <Skeleton className="h-4 w-20 mb-1" />
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-2">
                <Skeleton className="h-2.5 w-2.5 rounded-full flex-shrink-0" />
                <Skeleton className="h-3 w-40" />
              </div>
            ))}
          </div>
        </div>

        {/* Right column — essay text */}
        <div className="md:w-3/5">
          <Card className="border-ocean-200 shadow-lg overflow-hidden">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-2">
              {[...Array(9)].map((_, i) => (
                <Skeleton key={i} className={`h-4 ${i % 3 === 2 ? 'w-3/4' : 'w-full'}`} />
              ))}
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <div className="pt-2">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
