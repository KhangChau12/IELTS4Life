import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminHubLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      <Card className="overflow-hidden border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-600 to-cyan-600 relative">
        <CardContent className="relative z-10 p-6 md:p-8 lg:p-10">
          {/* Title row */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Skeleton className="h-10 w-56 md:w-72 bg-white/20" />
                <Skeleton className="h-6 w-24 rounded-full bg-white/20" />
              </div>
              <Skeleton className="h-5 w-72 md:w-96 bg-white/15" />
            </div>
            <Skeleton className="h-10 w-40 rounded-xl bg-white/15 self-start" />
          </div>

          {/* 3 nav cards */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-2xl border border-white/20 bg-white/90 p-5 space-y-3">
                {/* Chevron row */}
                <div className="flex justify-end">
                  <Skeleton className="h-4 w-4" />
                </div>
                {/* Title + desc */}
                <div className="space-y-1.5">
                  <Skeleton className="h-5 w-28" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-32" />
                </div>
                {/* Divider + badge */}
                <div className="border-t border-ocean-100 pt-3 flex items-center justify-between">
                  <Skeleton className="h-3.5 w-28" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
