import { Skeleton } from '@/components/ui/skeleton'

export default function PromptsLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-10" />
        <span className="text-xs text-slate-300">/</span>
        <Skeleton className="h-6 w-36" />
      </div>

      <div className="space-y-4">
        {/* Top bar — count + actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-3 w-44" />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-10 w-full rounded-lg sm:h-9 sm:w-40" />
            <Skeleton className="h-10 w-full rounded-lg sm:h-9 sm:w-28" />
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col gap-2.5 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center">
          <Skeleton className="h-9 flex-1 rounded-lg" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-48" />
          <Skeleton className="h-9 w-full rounded-lg sm:w-48" />
        </div>

        {/* Two-column: ranking + list */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_3fr] lg:items-start">
          <div className="rounded-xl border border-ocean-100 bg-white p-4 shadow-sm">
            <Skeleton className="mb-1 h-3.5 w-28" />
            <Skeleton className="mb-3.5 h-3 w-32" />
            <div className="flex flex-col gap-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <Skeleton className="h-3 w-3" />
                  <Skeleton className="h-3 flex-1" />
                  <Skeleton className="h-3 w-6" />
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm sm:flex-row sm:items-start">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-2.5 w-24" />
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <Skeleton className="h-5 w-24 rounded-[5px]" />
                  <Skeleton className="h-5 w-16 rounded-[5px]" />
                  <Skeleton className="h-9 w-9 rounded-md sm:h-7 sm:w-7" />
                  <Skeleton className="h-9 w-9 rounded-md sm:h-7 sm:w-7" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
