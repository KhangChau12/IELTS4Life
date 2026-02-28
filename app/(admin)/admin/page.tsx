import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText, Bell, Lock, ArrowRight, LayoutDashboard } from 'lucide-react'
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

  return (
    <div className="max-w-5xl mx-auto space-y-8 px-4">
      {/* Hero Section */}
      <div className="animate-fadeInUp">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
                isDev
                  ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white'
                  : 'bg-gradient-to-r from-ocean-500 to-cyan-600 text-white'
              }`}>
                {isDev ? 'Developer' : 'Administrator'}
              </span>
            </div>
            <p className="text-ocean-600 text-sm md:text-base">
              Welcome, <span className="font-semibold text-ocean-800">{displayName}</span>
              {' '}· Manage your IELTS4Life platform
            </p>
          </div>
          <Link
            href="/dashboard"
            className="self-start inline-flex items-center gap-2 bg-white/80 border border-ocean-200 text-ocean-700 hover:bg-white hover:border-ocean-300 transition-all rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm whitespace-nowrap"
          >
            <LayoutDashboard className="h-4 w-4" />
            Back to Platform
          </Link>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-scaleIn">
        <Link href="/admin/statistics">
          <Card className="card-interactive border-l-4 border-l-cyan-500 group h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-cyan-700 transition-colors">
                    Statistics
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    View platform analytics and user data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5 px-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ocean-400">Charts · User analytics · Essay data</span>
                <ArrowRight className="h-4 w-4 text-ocean-300 group-hover:text-cyan-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/prompts">
          <Card className="card-interactive border-l-4 border-l-teal-500 group h-full">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-teal-700 transition-colors">
                    Writing Prompts
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Manage IELTS writing prompts and topics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 pb-5 px-6">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ocean-400">Create · Edit · Organize topics</span>
                <ArrowRight className="h-4 w-4 text-ocean-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Notifications Card - clickable for dev, locked for admin */}
        <div className="relative h-full">
          {isDev ? (
            <Link href="/admin/notifications" className="h-full block">
              <Card className="card-interactive border-l-4 border-l-purple-500 group h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg group-hover:shadow-xl transition-shadow">
                      <Bell className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900 group-hover:text-purple-700 transition-colors">
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Send announcements to users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-5 px-6 space-y-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-full">
                    <span className="h-1.5 w-1.5 rounded-full bg-purple-500" />
                    Dev access
                  </span>
                  <div className="flex justify-end">
                    <ArrowRight className="h-4 w-4 text-ocean-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ) : (
            <>
              <Card className="card-premium border-l-4 border-l-purple-500 h-full opacity-60 blur-[1px] select-none">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 shadow-lg">
                      <Bell className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-slate-900">
                        Notifications
                      </CardTitle>
                      <CardDescription className="text-sm mt-1">
                        Send announcements to users
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0 pb-5 px-6">
                  <span className="text-xs text-ocean-400">Dev only feature</span>
                </CardContent>
              </Card>
              <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-[2px]">
                <div className="text-center px-4">
                  <Lock className="h-6 w-6 mx-auto mb-2 text-slate-500" />
                  <p className="text-sm font-medium text-slate-600">Dev only feature</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
