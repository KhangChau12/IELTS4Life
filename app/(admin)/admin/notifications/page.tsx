import Link from 'next/link'
import { ArrowLeft, Bell, Sparkles } from 'lucide-react'
import { NotificationsManagementClient } from '../components/NotificationsManagementClient'

export default function AdminNotificationsPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 px-4 py-6">
      <div className="rounded-3xl border border-ocean-200 bg-gradient-to-br from-white via-ocean-50/50 to-cyan-50/40 shadow-lg p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-ocean-200 bg-ocean-50 px-3 py-1 text-xs font-medium text-ocean-700">
              <Sparkles className="h-3.5 w-3.5" />
              Admin Broadcast Center
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ocean-900">
                  Notifications
                </h1>
                <p className="text-ocean-600 text-sm md:text-base">
                  Send announcements to users quickly and clearly
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-4 py-2.5 text-sm font-medium text-ocean-700 shadow-sm transition-all hover:bg-ocean-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-ocean-200 bg-white shadow-lg p-4 md:p-5">
        <NotificationsManagementClient />
      </div>
    </div>
  )
}
