import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-5 px-4 py-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-56" />
      </div>

      {/* Status strip — gradient band, 3 centered columns */}
      <div className="rounded-2xl bg-ocean-900 px-2 py-5">
        <div className="grid grid-cols-3 gap-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 px-3 md:px-6">
              <Skeleton className="h-3 w-24 bg-white/25" />
              <Skeleton className="h-9 w-16 bg-white/30" />
            </div>
          ))}
        </div>
      </div>

      {/* Next-action hook card */}
      <div className="flex items-center gap-4 rounded-2xl border border-ocean-100 bg-white px-5 py-4 shadow-sm">
        <Skeleton className="h-11 w-11 shrink-0 rounded-[11px]" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-4 w-56 max-w-full" />
        </div>
        <Skeleton className="hidden h-9 w-32 rounded-lg sm:block" />
      </div>

      {/* Coverage Map */}
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </div>
        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          <div className="space-y-1">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-8 w-full rounded-lg" />
            ))}
          </div>
          <div className="grid grid-cols-2 gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <Skeleton key={i} className="h-7 w-full rounded-md" />
            ))}
          </div>
        </div>
      </div>

      {/* Score progress + vocab snapshot — side by side */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <Skeleton className="mb-1 h-5 w-32" />
          <Skeleton className="mb-4 h-4 w-56" />
          <Skeleton className="h-[190px] w-full rounded-xl" />
        </div>
        <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <Skeleton className="mb-1 h-5 w-36" />
          <Skeleton className="mb-4 h-4 w-28" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-10" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Vocabulary */}
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm md:p-6">
        <Skeleton className="mb-4 h-5 w-40" />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-2 border-l-2 border-ocean-100 pl-3">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-3/4" />
            </div>
          ))}
        </div>
      </div>

      {/* Recent Essays */}
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <Skeleton className="mb-1 h-5 w-36" />
        <Skeleton className="mb-3 h-4 w-52" />
        <div className="divide-y divide-slate-100">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 py-3">
              <Skeleton className="h-10 w-10 rounded-[9px]" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-28" />
              </div>
              <Skeleton className="h-4 w-4" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
