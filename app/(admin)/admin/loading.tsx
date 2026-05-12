import { Skeleton } from '@/components/ui/skeleton'

export default function AdminHubLoading() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      {/* Dark hero card — mirrors the actual page Card */}
      <div className="overflow-hidden rounded-xl bg-gradient-to-br from-slate-950 via-cyan-900 to-slate-900 p-6 md:p-8 lg:p-10 shadow-2xl">
        {/* Top section: text + back button */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-4">
            {/* Badge pill */}
            <Skeleton className="h-6 w-28 rounded-full bg-white/15" />
            {/* Title + role badge */}
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-56 md:w-72 bg-white/15" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
            </div>
            {/* Subtitle */}
            <Skeleton className="h-5 w-72 md:w-96 bg-white/15" />
            {/* Pills row */}
            <div className="flex gap-2">
              <Skeleton className="h-6 w-32 rounded-full bg-white/15" />
              <Skeleton className="h-6 w-24 rounded-full bg-white/15" />
              <Skeleton className="h-6 w-28 rounded-full bg-white/15" />
            </div>
          </div>
          {/* Back button */}
          <Skeleton className="h-10 w-40 rounded-xl bg-white/15 self-start" />
        </div>

        {/* 3 nav cards — sm:grid-cols-3, same as actual page */}
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/10 p-4"
            >
              <div className="flex items-start gap-4">
                {/* Icon box */}
                <Skeleton className="h-12 w-12 rounded-2xl bg-white/20 flex-shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-5 w-24 bg-white/20" />
                  <Skeleton className="h-4 w-36 bg-white/15" />
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <Skeleton className="h-3.5 w-28 bg-white/15" />
                <Skeleton className="h-5 w-16 rounded-full bg-white/15" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
