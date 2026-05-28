import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function NotificationsLoading() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      {/* Header Panel */}
      <div className="rounded-3xl border border-ocean-200 bg-gradient-to-br from-white via-ocean-50/50 to-cyan-50/40 shadow-lg p-6 md:p-8 relative overflow-hidden">
        <div className="absolute right-4 top-4 h-32 w-32 rounded-full bg-ocean-100/40 opacity-30 rotate-[-12deg]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-9 md:h-11 w-44 md:w-56" />
            <Skeleton className="h-5 w-60 md:w-72" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl self-start" />
        </div>
      </div>

      {/* Content Panel */}
      <div className="rounded-2xl border border-ocean-200 bg-white shadow-lg p-4 md:p-5 space-y-6">
        {/* Create Form Card */}
        <Card className="border-ocean-200 shadow-lg overflow-hidden">
          <CardHeader className="border-b border-ocean-100">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-5 w-44" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">
            {/* Title field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-10 w-full rounded-lg" />
            </div>
            {/* Message field */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </div>
            {/* Audience select */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-10 w-full sm:w-72 rounded-lg" />
            </div>
            {/* Send button */}
            <Skeleton className="h-10 w-44 rounded-lg" />
          </CardContent>
        </Card>

        {/* History section */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          {[0, 1, 2].map((i) => (
            <Card key={i} className="border-ocean-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <div className="flex items-center gap-2 mt-1">
                      <Skeleton className="h-5 w-20 rounded-full" />
                      <Skeleton className="h-3.5 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
