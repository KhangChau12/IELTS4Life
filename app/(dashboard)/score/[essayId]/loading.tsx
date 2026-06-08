import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function EssayResultsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4">
      {/* Header */}
      <div>
        <Skeleton className="h-10 w-48 mb-1" />
        <Skeleton className="h-5 w-72" />
      </div>

      {/* Quick Summary — 3 chips */}
      <Card className="border-cyan-200 bg-gradient-to-br from-cyan-50 to-blue-50 shadow-sm">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Skeleton className="h-4 w-4 rounded-full" />
            <Skeleton className="h-4 w-28" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-white/70 rounded-lg p-3 text-center border border-cyan-100">
              <Skeleton className="h-8 w-12 mx-auto mb-1" />
              <Skeleton className="h-3 w-16 mx-auto" />
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center border border-green-100 space-y-1">
              <Skeleton className="h-4 w-4 mx-auto rounded-full" />
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
            <div className="bg-white/70 rounded-lg p-3 text-center border border-amber-100 space-y-1">
              <Skeleton className="h-4 w-4 mx-auto rounded-full" />
              <Skeleton className="h-4 w-16 mx-auto" />
              <Skeleton className="h-3 w-8 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tab bar */}
      <div className="border-b border-ocean-100 flex gap-0">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex items-center justify-center gap-2 py-3 border-b-2 border-transparent">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-12 hidden sm:block" />
          </div>
        ))}
      </div>

      {/* Score tab — 2-column layout */}
      <div className="flex flex-col md:flex-row gap-6 mt-6">
        {/* Left column */}
        <div className="md:w-2/5 space-y-4">
          {/* Score card */}
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

        {/* Right column */}
        <div className="md:w-3/5">
          <Card className="border-ocean-200 shadow-lg">
            <CardHeader className="border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Skeleton className="h-5 w-5 rounded" />
                <Skeleton className="h-5 w-24" />
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <Skeleton className="h-5 w-16 mb-2" />
                <div className="bg-ocean-50 border border-ocean-200 rounded-md p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-4/5" />
                </div>
              </div>
              <div>
                <Skeleton className="h-5 w-28 mb-2" />
                <div className="bg-gray-50 border border-gray-200 rounded-md p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
                <Skeleton className="h-4 w-28 mt-2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
