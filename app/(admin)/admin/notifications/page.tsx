import Link from 'next/link'
import { NotificationsManagementClient } from '../components/NotificationsManagementClient'

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-4 px-4">
      <div className="flex items-center gap-2">
        <Link href="/admin" className="text-[12.5px] font-semibold text-slate-400 hover:text-slate-600">
          Admin
        </Link>
        <span className="text-xs text-slate-300">/</span>
        <h1 className="text-[22px] font-extrabold text-ocean-900 tracking-tight">Notifications</h1>
      </div>

      <NotificationsManagementClient />
    </div>
  )
}
