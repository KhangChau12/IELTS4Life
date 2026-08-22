import { Skeleton } from '@/components/ui/skeleton'

export default function AdminHubLoading() {
  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2.5">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-24 rounded-[5px]" />
          </div>
          <Skeleton className="h-3.5 w-36" />
        </div>
        <Skeleton className="h-9 w-9 rounded-lg sm:w-40" />
      </div>

      {/* NAV CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <Skeleton className="h-9 w-9 rounded-[10px]" />
              <Skeleton className="h-4 w-4 rounded" />
            </div>
            <Skeleton className="mb-2 h-4 w-24" />
            <Skeleton className="mb-1.5 h-3 w-full" />
            <Skeleton className="mb-4 h-3 w-2/3" />
            <div className="mt-auto border-t border-slate-100 pt-3">
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        ))}
      </div>

      {/* QUICK GLANCE STRIP */}
      <div className="rounded-2xl bg-ocean-900 px-2 py-5">
        <div className="grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="flex flex-col gap-2 px-5">
              <Skeleton className="h-2.5 w-20 bg-white/15" />
              <Skeleton className="h-6 w-16 bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
