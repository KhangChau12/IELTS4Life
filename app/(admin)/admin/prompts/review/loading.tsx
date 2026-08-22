import { Skeleton } from '@/components/ui/skeleton'

export default function PromptReviewLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
      {/* Breadcrumb header */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3.5 w-16" />
        <span className="text-xs text-slate-300">/</span>
        <Skeleton className="h-6 w-44" />
      </div>

      <div className="space-y-4">
        {/* Queue status bar */}
        <div className="flex flex-col gap-2 rounded-xl border border-ocean-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Skeleton className="h-3.5 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
          <Skeleton className="hidden h-3 w-40 sm:block" />
        </div>

        {/* 2-column layout */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* LEFT — edit panel */}
          <div className="flex flex-col gap-4 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-1.5">
              <Skeleton className="h-6 w-24 rounded-[5px]" />
              <Skeleton className="h-6 w-20 rounded-[5px]" />
            </div>
            <div>
              <Skeleton className="mb-1.5 h-3 w-20" />
              <Skeleton className="h-[120px] w-full rounded-lg" />
            </div>
            <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3.5">
              <Skeleton className="h-3 w-24" />
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Skeleton className="h-8 w-full rounded-md" />
                <Skeleton className="h-8 w-full rounded-md" />
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <Skeleton className="h-11 flex-1 rounded-lg sm:h-10" />
              <Skeleton className="h-11 flex-1 rounded-lg sm:h-10" />
            </div>
          </div>

          {/* RIGHT — similar prompts */}
          <div className="flex flex-col gap-3 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
            <Skeleton className="h-3 w-52" />
            {[0, 1].map((i) => (
              <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <Skeleton className="mb-2 h-3 w-full" />
                <Skeleton className="mb-2 h-3 w-2/3" />
                <div className="flex gap-1.5">
                  <Skeleton className="h-4 w-20 rounded-[5px]" />
                  <Skeleton className="h-4 w-16 rounded-[5px]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
