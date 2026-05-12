import Link from 'next/link'
import { ArrowLeft, BarChart3, Sparkles } from 'lucide-react'
import { AdminDashboardClient } from '../components/AdminDashboardClient'
import { fetchAdminStats } from '@/lib/admin/stats'
import { getAdminUser } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function StatisticsPage() {
  const adminUser = await getAdminUser()

  if (!adminUser) redirect('/login')
  if (!['admin', 'dev'].includes(adminUser.profile?.role ?? '')) redirect('/dashboard')

  const stats = await fetchAdminStats()

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8 px-4">
      {/* Header */}
      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-cyan-50/35 to-blue-50/35 shadow-sm p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg flex-shrink-0">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-medium text-cyan-700 mb-2">
                <Sparkles className="h-3.5 w-3.5" />
                Platform Analytics
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                Platform Statistics
              </h1>
              <p className="text-slate-600 text-sm md:text-base">
                Monitor system statistics and user activity
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 self-start"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        </div>
      </div>

      <AdminDashboardClient initialStats={stats} />
    </div>
  )
}
