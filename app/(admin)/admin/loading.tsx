import { Card, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export default function AdminHubLoading() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      {/* Header Skeleton */}
      <div>
        <Skeleton className="h-8 md:h-10 w-56 md:w-72 mb-2" />
        <Skeleton className="h-5 md:h-6 w-64 md:w-80" />
      </div>

      {/* Navigation Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <Card key={i} className="border-l-4 border-l-slate-200">
            <CardHeader>
              <div className="flex items-center gap-4">
                <Skeleton className="h-14 w-14 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-48" />
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
