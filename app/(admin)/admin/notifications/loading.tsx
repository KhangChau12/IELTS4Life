import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-10" />
        <span className="text-xs text-slate-300">/</span>
        <Skeleton className="h-6 w-32" />
      </div>

      <div className="space-y-4">
        {/* Compose form */}
        <div className="flex flex-col gap-3.5 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <Skeleton className="h-4 w-40" />
          <div>
            <Skeleton className="mb-1.5 h-3 w-10" />
            <Skeleton className="h-9 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1.5 h-3 w-16" />
            <Skeleton className="h-24 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="mb-1.5 h-3 w-24" />
            <Skeleton className="h-9 w-full rounded-lg sm:w-72" />
          </div>
          <div className="flex sm:justify-end">
            <Skeleton className="h-10 w-full rounded-lg sm:h-9 sm:w-40" />
          </div>
        </div>

        {/* Sent list */}
        <div className="flex flex-col gap-2">
          <Skeleton className="h-3 w-32" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-start justify-between gap-3 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm">
              <div className="min-w-0 flex-1 space-y-2">
                <Skeleton className="h-3.5 w-48" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
                <div className="flex items-center gap-2 pt-0.5">
                  <Skeleton className="h-5 w-16 rounded-[5px]" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
              <Skeleton className="h-9 w-9 shrink-0 rounded-md sm:h-7 sm:w-7" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
