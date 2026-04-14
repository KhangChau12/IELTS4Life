import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, FileText, Bell, Lock, ArrowRight, LayoutDashboard, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  let role = 'admin'
  let displayName = 'Admin'
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single()
    role = profile?.role ?? 'admin'
    displayName = profile?.full_name || user.email?.split('@')[0] || 'Admin'
  }

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
    },
    {
      href: '/admin/prompts',
      title: 'Writing Prompts',
      description: 'Manage IELTS writing prompts and topics',
      detail: 'Create · Edit · Organize topics',
      icon: FileText,
      accent: 'from-teal-500 to-cyan-600',
      hoverText: 'group-hover:text-teal-700',
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

              return (
                <Link key={card.href} href={card.href} className="group block">
                  <div className={`relative overflow-hidden rounded-2xl border border-white/10 bg-white/10 p-4 shadow-sm backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:bg-white/15 hover:shadow-xl ${card.locked ? 'opacity-70' : ''}`}>
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.accent} opacity-0 transition-opacity group-hover:opacity-10`} />
                    <div className="relative flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${card.accent} shadow-lg`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <div className="space-y-1">
                          <h2 className={`text-lg font-semibold text-white transition-colors ${card.hoverText}`}>
                            {card.title}
                          </h2>
                          <p className="text-sm text-slate-200">{card.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="mt-1 h-4 w-4 text-slate-300 transition-transform group-hover:translate-x-1" />
                    </div>

                    <div className="relative mt-4 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-200">{card.detail}</span>
                      {card.locked ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-black/20 px-2.5 py-1 text-[11px] text-slate-200">
                          <Lock className="h-3 w-3" />
                          Locked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-2.5 py-1 text-[11px] text-cyan-100">
                          <ShieldCheck className="h-3 w-3" />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
