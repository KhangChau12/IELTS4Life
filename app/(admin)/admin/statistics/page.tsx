import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
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
    <div className="max-w-7xl mx-auto space-y-4 px-4">
      <Link
        href="/admin"
        className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-ocean-600 transition-colors hover:text-ocean-800"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to Admin
      </Link>

      <AdminDashboardClient initialStats={stats} />
    </div>
  )
}
