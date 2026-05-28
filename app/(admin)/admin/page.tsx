import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BarChart3, FileText, Bell, Lock, LayoutDashboard, ShieldCheck, ChevronRight } from 'lucide-react'
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
      cardBg: 'bg-white/90 border-ocean-100',
      iconColor: 'text-cyan-600',
      titleColor: 'text-ocean-900',
      descColor: 'text-ocean-500',
      detailColor: 'text-ocean-400',
      dividerColor: 'border-ocean-100',
      activeBadge: 'border-cyan-200 bg-cyan-50 text-cyan-700',
      locked: false,
    },
    {
      href: '/admin/prompts',
      title: 'Writing Prompts',
      description: 'Manage IELTS writing prompts and topics',
      detail: 'Create · Edit · Organize topics',
      icon: FileText,
      cardBg: 'bg-white/90 border-teal-100',
      iconColor: 'text-teal-600',
      titleColor: 'text-ocean-900',
      descColor: 'text-ocean-500',
      detailColor: 'text-ocean-400',
      dividerColor: 'border-teal-100',
      activeBadge: 'border-teal-200 bg-teal-50 text-teal-700',
      locked: false,
    },
    {
      href: '/admin/notifications',
      title: 'Notifications',
      description: 'Send announcements to users',
      detail: isDev ? 'Dev access' : 'Dev only feature',
      icon: Bell,
      cardBg: 'bg-white/90 border-purple-100',
      iconColor: 'text-purple-600',
      titleColor: 'text-ocean-900',
      descColor: 'text-ocean-500',
      detailColor: 'text-ocean-400',
      dividerColor: 'border-purple-100',
      activeBadge: 'border-purple-200 bg-purple-50 text-purple-700',
      locked: !isDev,
    },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8 px-4 py-6">
      <Card className="overflow-hidden border-ocean-200 shadow-lg bg-gradient-to-br from-ocean-600 to-cyan-600 text-white relative">
        <LayoutDashboard className="absolute right-2 top-2 h-52 w-52 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
        <CardContent className="relative z-10 p-6 md:p-8 lg:p-10">

          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight">
                    Admin Dashboard
                  </h1>
                  <Badge className="rounded-full px-3 py-1 text-white/90 border border-white/30 bg-white/15 font-medium shadow-none">
                    {isDev ? 'Developer' : 'Administrator'}
                  </Badge>
                </div>
                <p className="max-w-xl text-sm md:text-base text-white/80 leading-relaxed">
                  Welcome, <span className="font-semibold text-white">{displayName}</span>. Manage the IELTS4Life platform from a cleaner, faster command center.
                </p>
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
                <div className={`relative flex flex-col h-full overflow-hidden rounded-2xl border p-5 shadow-md transition-all duration-200 ${card.cardBg} ${
                  card.locked
                    ? 'cursor-not-allowed opacity-50'
                    : 'group-hover:-translate-y-1 group-hover:shadow-xl'
                }`}>
                  {/* Watermark icon */}
                  <Icon className={`absolute right-2 top-2 h-32 w-32 opacity-[0.07] rotate-[-12deg] pointer-events-none select-none ${card.iconColor}`} />

                  {/* Chevron */}
                  <div className="relative flex items-start justify-end mb-4">
                    {!card.locked && (
                      <ChevronRight className={`h-4 w-4 opacity-30 transition-transform group-hover:translate-x-1 group-hover:opacity-80 mt-1 ${card.iconColor}`} />
                    )}
                  </div>

                  {/* Title + description — grows to fill space */}
                  <div className="relative flex-1 space-y-1.5 mb-4">
                    <h2 className={`text-lg font-semibold leading-snug ${card.titleColor}`}>
                      {card.title}
                    </h2>
                    <p className={`text-sm leading-relaxed ${card.descColor}`}>{card.description}</p>
                  </div>

                  {/* Divider */}
                  <div className={`relative border-t pt-3 flex items-center justify-between gap-3 ${card.dividerColor}`}>
                    <span className={`text-xs ${card.detailColor}`}>{card.detail}</span>
                    {card.locked ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] text-slate-400">
                        <Lock className="h-3 w-3" />
                        Locked
                      </span>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] ${card.activeBadge}`}>
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
