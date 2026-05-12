import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, FileText, Bell, Lock, LayoutDashboard, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { getAdminUser } from '@/lib/admin/auth'
import { redirect } from 'next/navigation'

export default async function AdminPage() {
  const adminUser = await getAdminUser()

  if (!adminUser) redirect('/login')

  const role = adminUser.profile?.role ?? 'admin'
  const displayName = adminUser.profile?.full_name || adminUser.user.email?.split('@')[0] || 'Admin'
  const isDev = role === 'dev'

  const shortcutCards = [
    {
      href: '/admin/statistics',
      title: 'Statistics',
      description: 'View platform analytics and user data',
      detail: 'Charts · User analytics · Essay data',
      icon: BarChart3,
      accent: 'from-cyan-500 to-blue-600',
      hoverText: 'group-hover:text-cyan-700',
      locked: false,
    },
    {
      href: '/admin/prompts',
      title: 'Writing Prompts',
      description: 'Manage IELTS writing prompts and topics',
      detail: 'Create · Edit · Organize topics',
      icon: FileText,
      accent: 'from-teal-500 to-cyan-600',
      hoverText: 'group-hover:text-teal-700',
      locked: false,
    },
    {
      href: '/admin/notifications',
      title: 'Notifications',
      description: 'Send announcements to users',
      detail: isDev ? 'Dev access' : 'Dev only feature',
      icon: Bell,
      accent: 'from-purple-500 to-violet-600',
      hoverText: 'group-hover:text-purple-700',
      locked: !isDev,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      <Card className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-cyan-900 to-slate-900 text-white shadow-2xl">
        <CardContent className="relative p-6 md:p-8 lg:p-10">
          <div className="absolute inset-0 opacity-35">
            <div className="absolute -top-12 right-0 h-48 w-48 rounded-full bg-cyan-400 blur-3xl" />
            <div className="absolute bottom-0 left-1/4 h-40 w-40 rounded-full bg-violet-500 blur-3xl" />
          </div>

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                <Sparkles className="h-3.5 w-3.5 text-cyan-300" />
                Admin workspace
              </div>

              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>
                  <Badge className={`rounded-full px-3 py-1 text-white ${
                    isDev
                      ? 'bg-gradient-to-r from-violet-500 to-fuchsia-600'
                      : 'bg-gradient-to-r from-cyan-500 to-teal-600'
                  }`}>
                    {isDev ? 'Developer' : 'Administrator'}
                  </Badge>
                </div>
                <p className="max-w-xl text-sm md:text-base text-slate-200 leading-relaxed">
                  Welcome, <span className="font-semibold text-white">{displayName}</span>. Manage the IELTS4Life platform from a cleaner, faster command center.
                </p>
              </div>

              <div className="flex flex-wrap gap-2 text-xs text-slate-100">
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  {isDev ? 'Dev access enabled' : 'Admin access'}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  {displayName}
                </span>
                <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 backdrop-blur-sm">
                  Platform controls
                </span>
              </div>
            </div>

            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 self-start rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-medium text-white shadow-lg backdrop-blur-sm transition-all hover:bg-white/15"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Platform
            </Link>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            {shortcutCards.map((card) => {
              const Icon = card.icon
              const inner = (
                <div className={`relative flex flex-col h-full overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-5 shadow-sm backdrop-blur-sm transition-all duration-200 ${
                  card.locked
                    ? 'cursor-not-allowed opacity-60'
                    : 'group-hover:-translate-y-1 group-hover:bg-white/15 group-hover:shadow-xl'
                }`}>
                  {/* Accent glow on hover */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity duration-200 ${!card.locked && 'group-hover:opacity-10'}`} />

                  {/* Top row: icon + chevron */}
                  <div className="relative flex items-start justify-between mb-4">
                    <div className={`flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} shadow-lg ring-4 ring-white/10`}>
                      <Icon className="h-7 w-7 text-white" />
                    </div>
                    {!card.locked && (
                      <ChevronRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1 group-hover:text-white mt-1" />
                    )}
                  </div>

                  {/* Title + description — grows to fill space */}
                  <div className="relative flex-1 space-y-1.5 mb-4">
                    <h2 className="text-lg font-semibold text-white leading-snug">
                      {card.title}
                    </h2>
                    <p className="text-sm text-slate-300 leading-relaxed">{card.description}</p>
                  </div>

                  {/* Divider */}
                  <div className="relative border-t border-white/10 pt-3 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">{card.detail}</span>
                    {card.locked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] text-slate-300">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-200">
                        <ShieldCheck className="h-3 w-3" />
                        Active
                      </span>
                    )}
                  </div>
                </div>
              )

              return card.locked ? (
                <div key={card.href} className="h-full">{inner}</div>
              ) : (
                <Link key={card.href} href={card.href} className="group block">
                  {inner}
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
