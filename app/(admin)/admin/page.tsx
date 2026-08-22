import { BarChart3, FileText, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin/auth'
import { fetchAdminStats } from '@/lib/admin/stats'
import { redirect } from 'next/navigation'

function formatVND(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M₫`
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(0)}K₫`
  }
  return `${amount}₫`
}

function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

export default async function AdminPage() {
  const adminUser = await getAdminUser()

  if (!adminUser) redirect('/login')

  const role = adminUser.profile?.role ?? 'admin'
  const displayName = adminUser.profile?.full_name || adminUser.user.email?.split('@')[0] || 'Admin'
  const isDev = role === 'dev'

  const stats = await fetchAdminStats()

  return (
    <div className="mx-auto max-w-5xl space-y-5 px-4">
      {/* TOP BAR */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2.5">
            <h1 className="text-[22px] font-extrabold tracking-tight text-ocean-900">Admin</h1>
            <span className={`rounded-[5px] px-2 py-0.5 text-[11px] font-bold ${isDev ? 'bg-violet-50 text-violet-700' : 'bg-cyan-50 text-cyan-700'}`}>
              {isDev ? 'DEVELOPER' : 'ADMINISTRATOR'}
            </span>
          </div>
          <p className="text-xs text-slate-500">Welcome back, {displayName}</p>
        </div>
        <Link
          href="/dashboard"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:h-auto sm:w-auto sm:gap-2 sm:px-3.5 sm:py-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <path d="m12 19-7-7 7-7" />
            <path d="M19 12H5" />
          </svg>
          <span className="hidden text-[12.5px] font-bold sm:inline">Back to platform</span>
        </Link>
      </div>

      {/* NAV CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Link
          href="/admin/statistics"
          className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-cyan-50">
              <BarChart3 className="h-[18px] w-[18px] text-cyan-600" />
            </div>
            <ChevronRight className="h-4 w-4 text-slate-300" />
          </div>
          <h3 className="mb-1 text-[15px] font-extrabold text-slate-900">Statistics</h3>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">Platform analytics, revenue, and user activity</p>
          <div className="mt-auto border-t border-slate-100 pt-3">
            <span className="text-[11.5px] text-slate-400">Charts · Users · Revenue</span>
          </div>
        </Link>

        <Link
          href="/admin/prompts"
          className="relative flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-teal-50">
              <FileText className="h-[18px] w-[18px] text-teal-600" />
            </div>
            {stats.pendingPromptsCount > 0 ? (
              <span className="flex items-center gap-1 rounded-full bg-red-600 px-2 py-0.5 text-[10.5px] font-bold text-white">
                {stats.pendingPromptsCount} pending
              </span>
            ) : (
              <ChevronRight className="h-4 w-4 text-slate-300" />
            )}
          </div>
          <h3 className="mb-1 text-[15px] font-extrabold text-slate-900">Writing Prompts</h3>
          <p className="mb-4 text-xs leading-relaxed text-slate-400">Manage IELTS Task 2 prompts and topics</p>
          <div className="mt-auto border-t border-slate-100 pt-3">
            <span className="text-[11.5px] text-slate-400">
              {formatNumber(stats.totalPrompts)} live · {formatNumber(stats.promptsWithOutlines)} with outlines
            </span>
          </div>
        </Link>

        {isDev ? (
          <Link
            href="/admin/notifications"
            className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-50">
                <Bell className="h-[18px] w-[18px] text-violet-600" />
              </div>
              <ChevronRight className="h-4 w-4 text-slate-300" />
            </div>
            <h3 className="mb-1 text-[15px] font-extrabold text-slate-900">Notifications</h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">Send announcements to users</p>
            <div className="mt-auto border-t border-slate-100 pt-3">
              <span className="text-[11.5px] text-slate-400">Dev access</span>
            </div>
          </Link>
        ) : (
          <div className="flex cursor-not-allowed flex-col rounded-2xl border border-ocean-100 bg-white p-5 opacity-50 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-violet-50">
                <Bell className="h-[18px] w-[18px] text-violet-600" />
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-100 px-2.5 py-0.5 text-[10.5px] text-slate-400">Locked</span>
            </div>
            <h3 className="mb-1 text-[15px] font-extrabold text-slate-900">Notifications</h3>
            <p className="mb-4 text-xs leading-relaxed text-slate-400">Send announcements to users</p>
            <div className="mt-auto border-t border-slate-100 pt-3">
              <span className="text-[11.5px] text-slate-400">Dev only feature</span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK GLANCE STRIP */}
      <div className="relative overflow-hidden rounded-2xl bg-ocean-900 px-2 py-5">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/[0.08] blur-2xl" />
        <div className="relative z-10 grid grid-cols-2 gap-y-4 sm:grid-cols-4">
          <div className="flex flex-col gap-1.5 border-r border-white/10 px-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Total Users</span>
            <span className="text-[19px] font-extrabold leading-none text-white tabular-nums sm:text-[22px]">{formatNumber(stats.totalUsers)}</span>
          </div>
          <div className="flex flex-col gap-1.5 px-5 sm:border-r sm:border-white/10">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Total Essays</span>
            <span className="text-[19px] font-extrabold leading-none text-white tabular-nums sm:text-[22px]">{formatNumber(stats.totalEssays)}</span>
          </div>
          <div className="flex flex-col gap-1.5 border-r border-white/10 px-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Revenue</span>
            <span className="text-[19px] font-extrabold leading-none text-white tabular-nums sm:text-[22px]">{formatVND(stats.totalRevenue)}</span>
          </div>
          <div className="flex flex-col gap-1.5 px-5">
            <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Pending Review</span>
            <span className={`text-[19px] font-extrabold leading-none tabular-nums sm:text-[22px] ${stats.pendingPromptsCount > 0 ? 'text-red-300' : 'text-white'}`}>
              {formatNumber(stats.pendingPromptsCount)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
