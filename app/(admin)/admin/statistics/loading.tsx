import { Skeleton } from '@/components/ui/skeleton'

export default function StatisticsLoading() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 px-4">
      {/* Back link */}
      <Skeleton className="h-3.5 w-24" />

      <div className="space-y-5">
        {/* TOP BAR */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-6 w-28" />
              <Skeleton className="h-5 w-12 rounded-[5px]" />
            </div>
            <Skeleton className="h-3.5 w-40" />
          </div>
          <Skeleton className="h-9 w-9 rounded-lg sm:w-24" />
        </div>

        {/* METRICS STRIP — 2 cols on mobile, 3 at md, 6 at xl */}
        <div className="rounded-2xl bg-ocean-900 px-2 py-5">
          <div className="grid grid-cols-2 gap-y-4 md:grid-cols-3 xl:grid-cols-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex flex-col gap-1.5 px-5 sm:gap-2">
                <Skeleton className="h-2 w-14 bg-white/15 sm:h-2.5 sm:w-16" />
                <Skeleton className="h-5 w-12 bg-white/20 sm:h-7 sm:w-14" />
                <Skeleton className="hidden h-2.5 w-20 bg-white/10 sm:block" />
              </div>
            ))}
          </div>
        </div>

        {/* PRIMARY ROW — activity trend + revenue */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm xl:col-span-2">
            <Skeleton className="mb-1 h-4 w-28" />
            <Skeleton className="mb-4 h-3 w-40" />
            <Skeleton className="h-[160px] w-full rounded-xl sm:h-[190px]" />
          </div>
          <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="mb-4 h-3 w-16" />
            <Skeleton className="mb-4 h-8 w-28" />
            <Skeleton className="mb-3.5 h-2.5 w-full rounded-full" />
            <div className="flex flex-col gap-2.5">
              <Skeleton className="h-3.5 w-full" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        </div>

        {/* SECONDARY ROW — user mix + essay distribution */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <Skeleton className="mb-1 h-4 w-20" />
            <Skeleton className="mb-4 h-3 w-28" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-[88px] w-[88px] shrink-0 rounded-full sm:h-[112px] sm:w-[112px]" />
              <div className="flex flex-1 flex-col gap-2.5">
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-full" />
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm xl:col-span-2">
            <Skeleton className="mb-1 h-4 w-44" />
            <Skeleton className="mb-5 h-3 w-52" />
            <div className="flex h-[100px] items-end gap-2 sm:h-[130px] sm:gap-4">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5 sm:gap-2">
                  <Skeleton className="h-2.5 w-5 sm:h-3 sm:w-6" />
                  <Skeleton className="w-full rounded-t-[5px]" style={{ height: `${30 + i * 8}%` }} />
                  <Skeleton className="h-2.5 w-5 sm:h-3 sm:w-6" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECONDARY DATA — satisfaction (wide) + 3 compact tiles */}
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
          <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-baseline justify-between">
              <div>
                <Skeleton className="mb-1 h-4 w-28" />
                <Skeleton className="h-3 w-36" />
              </div>
              <Skeleton className="h-3.5 w-20" />
            </div>
            <div className="flex flex-col gap-2.5">
              {[0, 1, 2, 3].map((i) => (
                <div key={i}>
                  <div className="mb-1.5 flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                  <Skeleton className="h-2.5 w-full rounded-full" />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-3 rounded-2xl border border-ocean-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2.5">
                  <Skeleton className="h-3.5 w-24" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                  <Skeleton className="h-6 w-10" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* USERS TABLE — card list on mobile, table header on sm+ */}
        <div className="overflow-hidden rounded-2xl border border-ocean-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="mb-1 h-4 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
            <Skeleton className="h-9 w-full rounded-lg sm:w-60" />
          </div>

          {/* Mobile cards */}
          <div className="space-y-2 p-4 sm:hidden">
            {[0, 1, 2].map((i) => (
              <div key={i} className="rounded-lg border border-slate-100 p-3">
                <Skeleton className="mb-1.5 h-3.5 w-32" />
                <Skeleton className="mb-1.5 h-3 w-40" />
                <div className="flex items-center justify-between">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            ))}
          </div>

          {/* Desktop rows */}
          <div className="hidden sm:block">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-50 px-5 py-3 last:border-b-0">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3.5 w-40" />
                <Skeleton className="h-3.5 w-10" />
                <Skeleton className="h-3.5 w-10" />
                <Skeleton className="h-3.5 w-20" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
