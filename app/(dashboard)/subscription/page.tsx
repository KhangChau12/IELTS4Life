import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Check, Crown, FileText, CalendarDays, Zap } from 'lucide-react'
import { getDailyQuota, getTotalQuota, getUserTier } from '@/lib/user/quota'
import { UpgradeProButton, BuyPackButton } from './UpgradeButton'
import { formatDate } from '@/lib/utils/date'

export const metadata = {
  title: 'Subscription - IELTS4Life',
  description: 'Choose your plan',
}

export default async function SubscriptionPage() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('email, daily_essays_count, total_essays_count, last_reset_date, invite_bonus_essays, subscription_status, subscription_end_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const today = new Date().toISOString().split('T')[0]
  let dailyCount = profile.daily_essays_count || 0
  if (profile.last_reset_date !== today) dailyCount = 0

  const tier = getUserTier(profile)
  const isPro = tier === 'pro'
  const isPtnk = profile.email.endsWith('@ptnk.edu.vn')
  const isDbPro = profile.subscription_status === 'active' &&
    profile.subscription_end_date &&
    new Date(profile.subscription_end_date) > new Date()

  const dailyQuota = getDailyQuota(profile.email)
  const baseTotalQuota = getTotalQuota(profile.email)
  const bonusEssays = profile.invite_bonus_essays || 0
  const totalQuota = baseTotalQuota !== null ? baseTotalQuota + bonusEssays : null
  const totalCount = profile.total_essays_count || 0

  const dailyPercentage = dailyQuota > 0 ? (dailyCount / dailyQuota) * 100 : 0
  const totalPercentage = totalQuota && totalQuota > 0 ? (totalCount / totalQuota) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-ocean-800 mb-2">Subscription Plans</h1>
        <p className="text-ocean-600">Choose the plan that works best for your IELTS preparation journey</p>
      </div>

      {/* Current Status — hero banner */}
      <div className={`rounded-2xl mb-8 overflow-hidden shadow-lg border ${
        isPro ? 'border-green-200' : 'border-ocean-200'
      }`}>
        {/* Top strip: tier identity */}
        <div className={`px-6 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
          isPro
            ? 'bg-gradient-to-r from-green-600 to-emerald-500'
            : 'bg-gradient-to-r from-ocean-700 to-cyan-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              {isPro
                ? <Crown className="h-7 w-7 text-white" />
                : <FileText className="h-7 w-7 text-white" />
              }
            </div>
            <div>
              <p className="text-white/75 text-xs font-medium tracking-widest uppercase">Current Plan</p>
              <p className="text-white text-2xl font-bold leading-tight">
                {isPro ? 'Pro' : 'Free'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:items-end gap-0.5">
            <p className="text-white/80 text-sm">{profile.email}</p>
            {isDbPro && profile.subscription_end_date && (
              <div className="flex items-center gap-1.5 text-white/70 text-xs">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Renews {formatDate(profile.subscription_end_date)}</span>
              </div>
            )}
            {isPtnk && !isDbPro && (
              <p className="text-white/70 text-xs">PTNK student — Pro access included</p>
            )}
          </div>
        </div>

        {/* Bottom strip: usage stats */}
        <div className={`px-6 py-5 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 ${
          isPro ? 'bg-green-50' : 'bg-ocean-50/60'
        }`}>
          {/* Daily usage — always shown */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide">Today</p>
              <p className="text-xs text-ocean-400">resets at midnight</p>
            </div>
            <p className="text-3xl font-bold text-ocean-800 mb-2">
              {dailyCount}
              <span className="text-base font-normal text-ocean-400 ml-1">/ {dailyQuota}</span>
            </p>
            <div className="h-2 bg-ocean-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  dailyPercentage >= 100
                    ? 'bg-red-400'
                    : dailyPercentage >= 66
                    ? 'bg-amber-400'
                    : isPro ? 'bg-green-500' : 'bg-ocean-500'
                }`}
                style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
              />
            </div>
            <p className="text-xs text-ocean-500 mt-1">
              {dailyQuota - dailyCount > 0
                ? `${dailyQuota - dailyCount} essay${dailyQuota - dailyCount !== 1 ? 's' : ''} left today`
                : 'Daily limit reached'}
            </p>
          </div>

          {/* Quota / Total — context-aware */}
          {!isPro && totalQuota ? (
            <div>
              <div className="flex items-baseline justify-between mb-1.5">
                <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide">Quota</p>
                {bonusEssays > 0 && (
                  <p className="text-xs text-cyan-600">+{bonusEssays} bonus</p>
                )}
              </div>
              <p className="text-3xl font-bold text-ocean-800 mb-2">
                {totalCount}
                <span className="text-base font-normal text-ocean-400 ml-1">/ {totalQuota}</span>
              </p>
              <div className="h-2 bg-ocean-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalPercentage >= 100 ? 'bg-red-400' : totalPercentage >= 80 ? 'bg-amber-400' : 'bg-cyan-500'
                  }`}
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                />
              </div>
              <p className="text-xs text-ocean-500 mt-1">
                {totalQuota - totalCount > 0
                  ? `${totalQuota - totalCount} essay${totalQuota - totalCount !== 1 ? 's' : ''} remaining`
                  : 'All essays used'}
              </p>
            </div>
          ) : isPro ? (
            <div>
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide mb-1.5">Quota</p>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="h-6 w-6 text-green-500 flex-shrink-0" />
                <span className="text-2xl font-bold text-ocean-800">Unlimited</span>
              </div>
              <p className="text-xs text-ocean-500">No lifetime cap on total essays</p>
            </div>
          ) : null}

          {/* Third column: Remaining for Free, All-time for Pro */}
          {!isPro && totalQuota ? (
            <div>
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide mb-1.5">Remaining</p>
              <p className={`text-3xl font-bold mb-2 ${totalQuota - totalCount <= 0 ? 'text-red-500' : 'text-ocean-800'}`}>
                {Math.max(0, totalQuota - totalCount)}
                <span className="text-base font-normal text-ocean-400 ml-1">left</span>
              </p>
              <div className="h-2 bg-ocean-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    totalQuota - totalCount <= 0 ? 'bg-red-300' : totalQuota - totalCount <= 3 ? 'bg-amber-300' : 'bg-green-300'
                  }`}
                  style={{ width: `${Math.min(((totalQuota - totalCount) / totalQuota) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-ocean-500 mt-1">
                {totalQuota - totalCount <= 0 ? 'Upgrade to keep practicing' : 'essays in your total quota'}
              </p>
            </div>
          ) : isPro ? (
            <div>
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide mb-1.5">All time</p>
              <p className="text-3xl font-bold text-ocean-800 mb-2">
                {totalCount}
                <span className="text-base font-normal text-ocean-400 ml-1">essay{totalCount !== 1 ? 's' : ''}</span>
              </p>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-green-300" style={{ width: '100%' }} />
              </div>
              <p className="text-xs text-ocean-500 mt-1">submitted since joining</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* Plans */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {/* Free Plan */}
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-ocean-50 to-cyan-50 border-b border-ocean-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ocean-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-ocean-800">Free</CardTitle>
                <CardDescription className="text-xs">Perfect for getting started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-ocean-800">0</span>
                <span className="text-lg font-semibold text-ocean-600">VND</span>
                <span className="text-sm font-normal text-ocean-400">/forever</span>
              </div>
              <p className="text-xs text-ocean-400">Hope you enjoy our service!</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <span className="font-semibold">3 essays/day</span>
                  <span className="text-xs text-ocean-500 ml-1">with AI scoring</span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <span className="font-semibold">6 essays base</span>
                  <span className="text-xs text-ocean-500 ml-1">(earn more by inviting friends!)</span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Full feedback on all 4 IELTS criteria</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Vocabulary suggestions & flashcards</span>
              </div>
            </div>

            {!isPro && (
              <Badge className="mt-4 bg-ocean-600 text-white w-full justify-center py-2">
                Current Plan
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="border-green-200 shadow-lg relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-1">
              Recommended
            </Badge>
          </div>

          <CardHeader className="bg-gradient-to-br from-green-50 to-emerald-50 border-b border-green-200 pt-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-green-800">Pro</CardTitle>
                <CardDescription className="text-xs">For serious IELTS preparation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-green-700">75,000</span>
                <span className="text-lg font-semibold text-green-600">VND</span>
                <span className="text-sm font-normal text-ocean-400">/month</span>
              </div>
              <p className="text-xs text-ocean-400">≈ $3 — the price of a coffee</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <span className="font-semibold">5 essays/day</span>
                  <span className="text-xs text-ocean-500 ml-1">with AI scoring</span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <span className="font-semibold">Unlimited total essays</span>
                  <span className="text-xs text-ocean-500 ml-1">— practice as much as you need</span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Everything in Free plan</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Support platform development</span>
              </div>
            </div>

            {isPro ? (
              <div className="space-y-2">
                <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full justify-center py-2">
                  <Crown className="mr-2 h-4 w-4" /> Active Plan
                </Badge>
                {isDbPro && profile.subscription_end_date && (
                  <p className="text-xs text-center text-green-600">
                    Expires: {formatDate(profile.subscription_end_date)}
                  </p>
                )}
              </div>
            ) : (
              <UpgradeProButton />
            )}
          </CardContent>
        </Card>

        {/* Essay Pack */}
        <Card className="border-ocean-300 shadow-lg relative">
          <CardHeader className="bg-gradient-to-br from-ocean-50 to-blue-50 border-b border-ocean-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ocean-500 rounded-lg">
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-ocean-800">Essay Pack</CardTitle>
                <CardDescription className="text-xs">One-time purchase, no subscription</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-4xl font-bold text-ocean-700">50,000</span>
                <span className="text-lg font-semibold text-ocean-600">VND</span>
                <span className="text-sm font-normal text-ocean-400">/pack</span>
              </div>
              <p className="text-xs text-ocean-400">One-time, stackable</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <span className="font-semibold">+15 essays</span>
                  <span className="text-xs text-ocean-500 ml-1">added to your total quota</span>
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Never expires — use at your own pace</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Buy multiple times to stack</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Keep your daily limit (3/day)</span>
              </div>
            </div>

            <BuyPackButton />
          </CardContent>
        </Card>
      </div>

      {/* Why Support */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
          <CardTitle className="text-ocean-800">Why Support Us?</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-ocean-700 leading-relaxed mb-4">
            Running IELTS4Life requires servers, AI API costs, and ongoing development. Your Pro subscription helps us:
          </p>
          <ul className="space-y-2 text-ocean-700">
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Keep the service fast, reliable, and ad-free</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Add new features based on user feedback</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Maintain high-quality AI scoring models</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-600 mt-1 flex-shrink-0" />
              <span>Provide free access to students who can&apos;t afford it</span>
            </li>
          </ul>
          <p className="text-ocean-600 text-sm mt-4">
            Thank you for considering supporting our mission to make IELTS preparation accessible to everyone!
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
