import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { CalendarDays, Check, Crown, FileText, Sparkles, Zap } from 'lucide-react'
import { getDailyQuota, getTotalQuota, getUserTier } from '@/lib/user/quota'
import { UpgradeProButton, BuyPackButton } from './UpgradeButton'
import { formatDate } from '@/lib/utils/date'
import { getPricing, isSaleActive, getSaleEndDate } from '@/lib/pricing'
import { SaleCountdown } from './components/SaleCountdown'

export const metadata = {
  title: 'Subscription - IELTS4Life',
  description: 'Choose your plan',
}

function formatVND(amount: number): string {
  return `${amount.toLocaleString('vi-VN')}₫`
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
  const remaining = totalQuota !== null ? Math.max(0, totalQuota - totalCount) : null
  const remainingPercentage = totalQuota && totalQuota > 0 && remaining !== null ? (remaining / totalQuota) * 100 : 0

  const pricing = getPricing()
  const onSale = isSaleActive()
  const saleEndIso = getSaleEndDate().toISOString()

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      {/* TOP BAR */}
      <div className="flex flex-col gap-0.5">
        <h1 className="text-[22px] font-extrabold tracking-tight text-ocean-900">Subscription</h1>
        <p className="text-xs text-slate-500">Manage your plan and essay quota</p>
      </div>

      {/* STATUS STRIP */}
      <div className="relative overflow-hidden rounded-2xl bg-ocean-900 px-5 py-6 sm:px-6">
        <div className="pointer-events-none absolute -right-10 -top-16 h-56 w-56 rounded-full bg-white/[0.08] blur-2xl" />

        <div className="relative z-10 mb-5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-[10px] bg-white/10">
              {isPro ? <Crown className="h-5 w-5 text-white" /> : <FileText className="h-5 w-5 text-white" />}
            </div>
            <div>
              <span className="block text-[10.5px] font-bold uppercase tracking-wide text-white/55">Current Plan</span>
              <span className="text-[22px] font-extrabold leading-tight text-white">{isPro ? 'Pro' : 'Free'}</span>
            </div>
          </div>
          <div className="hidden text-right sm:block">
            <span className="text-[13px] text-white/80">{profile.email}</span>
            {isDbPro && profile.subscription_end_date && (
              <div className="mt-0.5 flex items-center justify-end gap-1.5 text-xs text-white/60">
                <CalendarDays className="h-3.5 w-3.5" />
                <span>Renews {formatDate(profile.subscription_end_date)}</span>
              </div>
            )}
            {isPtnk && !isDbPro && (
              <p className="mt-0.5 text-xs text-white/60">PTNK student — Pro access included</p>
            )}
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-4 border-t border-white/10 pt-4 sm:grid-cols-3 sm:gap-0">
          {/* Today */}
          <div className="sm:border-r sm:border-white/10 sm:pr-5">
            <div className="mb-2 flex items-baseline justify-between">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Today</span>
              <span className="hidden text-[10px] text-white/40 sm:inline">resets midnight</span>
            </div>
            <div className="mb-2 text-2xl font-extrabold tabular-nums text-white">
              {dailyCount}
              <span className="text-sm font-semibold text-white/50"> / {dailyQuota}</span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
              <div
                className="h-full rounded-full bg-amber-400"
                style={{ width: `${Math.min(dailyPercentage, 100)}%` }}
              />
            </div>
            <p className="mt-1.5 text-[11px] text-white/60">
              {dailyQuota - dailyCount > 0
                ? `${dailyQuota - dailyCount} essay${dailyQuota - dailyCount !== 1 ? 's' : ''} left today`
                : 'Daily limit reached'}
            </p>
          </div>

          {/* Quota / Unlimited */}
          {!isPro && totalQuota !== null ? (
            <div className="sm:border-r sm:border-white/10 sm:px-5">
              <div className="mb-2 flex items-baseline justify-between">
                <span className="text-[10.5px] font-bold uppercase tracking-wide text-white/55">Quota</span>
                {bonusEssays > 0 && <span className="text-[10px] text-teal-300">+{bonusEssays} bonus</span>}
              </div>
              <div className="mb-2 text-2xl font-extrabold tabular-nums text-white">
                {totalCount}
                <span className="text-sm font-semibold text-white/50"> / {totalQuota}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{ width: `${Math.min(totalPercentage, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/60">
                {totalQuota - totalCount > 0
                  ? `${totalQuota - totalCount} essay${totalQuota - totalCount !== 1 ? 's' : ''} remaining`
                  : 'All essays used'}
              </p>
            </div>
          ) : isPro ? (
            <div className="sm:border-r sm:border-white/10 sm:px-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-white/55">Quota</span>
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-5 w-5 flex-shrink-0 text-emerald-300" />
                <span className="text-xl font-extrabold text-white">Unlimited</span>
              </div>
              <p className="text-[11px] text-white/60">No lifetime cap on total essays</p>
            </div>
          ) : null}

          {/* Remaining / All-time */}
          {!isPro && totalQuota !== null && remaining !== null ? (
            <div className="sm:pl-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-white/55">Remaining</span>
              <div className={`mb-2 text-2xl font-extrabold tabular-nums ${remaining <= 0 ? 'text-red-300' : 'text-white'}`}>
                {remaining} <span className="text-sm font-semibold text-white/50">left</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div
                  className={`h-full rounded-full ${remaining <= 0 ? 'bg-red-400' : remaining <= 3 ? 'bg-amber-400' : 'bg-emerald-400'}`}
                  style={{ width: `${Math.min(remainingPercentage, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[11px] text-white/60">
                {remaining <= 0 ? 'Upgrade to keep practicing' : 'in your total quota'}
              </p>
            </div>
          ) : isPro ? (
            <div className="sm:pl-5">
              <span className="mb-2 block text-[10.5px] font-bold uppercase tracking-wide text-white/55">All time</span>
              <div className="mb-2 text-2xl font-extrabold tabular-nums text-white">
                {totalCount} <span className="text-sm font-semibold text-white/50">essay{totalCount !== 1 ? 's' : ''}</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-full rounded-full bg-emerald-400" />
              </div>
              <p className="mt-1.5 text-[11px] text-white/60">submitted since joining</p>
            </div>
          ) : null}
        </div>
      </div>

      {/* SALE BANNER */}
      {onSale && (
        <div className="flex flex-col gap-3 rounded-[10px] border border-amber-200 bg-amber-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-[18px] w-[18px] flex-shrink-0 text-amber-700" />
            <div>
              <span className="text-[13px] font-bold text-amber-900">Limited-time offer</span>
              <span className="ml-1.5 text-xs text-amber-700">Pro 25% off · Essay Pack 40% off</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:flex-col sm:items-end sm:gap-0">
            <span className="text-[10px] uppercase tracking-wide text-amber-600">Ends in</span>
            <SaleCountdown saleEndIso={saleEndIso} />
          </div>
        </div>
      )}

      {/* PLAN CARDS */}
      <div className="grid grid-cols-1 gap-4 ipad-lg:grid-cols-3">
        {/* Free */}
        <div className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <FileText className="h-5 w-5 text-slate-500" strokeWidth={2.2} />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Free</h3>
              <p className="text-[11.5px] text-slate-400">Perfect for getting started</p>
            </div>
          </div>

          <div className="mb-5 flex items-baseline gap-1.5">
            <span className="text-[28px] font-extrabold text-slate-900">0₫</span>
            <span className="text-xs text-slate-400">/forever</span>
          </div>

          <div className="mb-5 flex flex-1 flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">
                <strong className="font-bold">{dailyQuota} essays/day</strong> with AI scoring
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">
                <strong className="font-bold">{baseTotalQuota} essays base</strong> — earn more by inviting
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Full feedback on all 4 criteria</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Vocabulary & flashcards</span>
            </div>
          </div>

          {!isPro && (
            <div className="rounded-[9px] bg-slate-100 py-2.5 text-center text-[12.5px] font-bold text-slate-500">
              Current Plan
            </div>
          )}
        </div>

        {/* Pro */}
        <div className="flex flex-col rounded-2xl border-[1.5px] border-cyan-600 bg-white p-5 shadow-[0_4px_16px_-4px_rgba(8,145,178,0.18)]">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <Crown className="h-5 w-5 text-cyan-600" strokeWidth={2.2} />
              <div>
                <h3 className="text-base font-extrabold text-slate-900">Pro</h3>
                <p className="text-[11.5px] text-slate-400">For serious preparation</p>
              </div>
            </div>
            <span className="rounded-[5px] bg-cyan-50 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-cyan-700">
              RECOMMENDED
            </span>
          </div>

          <div className="mb-5">
            {onSale && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] text-slate-400 line-through">{formatVND(pricing.pro.original)}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                  {pricing.pro.discountPct}% off
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-extrabold text-cyan-700">{formatVND(pricing.pro.current)}</span>
              <span className="text-xs text-slate-400">/month</span>
            </div>
          </div>

          <div className="mb-5 flex flex-1 flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">
                <strong className="font-bold">5 essays/day</strong> with AI scoring
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">
                <strong className="font-bold">Unlimited total</strong> essays
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Everything in Free plan</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Support platform development</span>
            </div>
          </div>

          {isPro ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-center gap-2 rounded-[9px] bg-cyan-600 py-2.5 text-[12.5px] font-bold text-white">
                <Crown className="h-4 w-4" /> Active Plan
              </div>
              {isDbPro && profile.subscription_end_date && (
                <p className="text-center text-xs text-cyan-700">Expires: {formatDate(profile.subscription_end_date)}</p>
              )}
            </div>
          ) : (
            <UpgradeProButton />
          )}
        </div>

        {/* Essay Pack */}
        <div className="flex flex-col rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2.5">
            <Zap className="h-5 w-5 text-violet-600" strokeWidth={2.2} />
            <div>
              <h3 className="text-base font-extrabold text-slate-900">Essay Pack</h3>
              <p className="text-[11.5px] text-slate-400">One-time, no subscription</p>
            </div>
          </div>

          <div className="mb-5">
            {onSale && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-[13px] text-slate-400 line-through">{formatVND(pricing.pack.original)}</span>
                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10.5px] font-bold text-amber-700">
                  {pricing.pack.discountPct}% off
                </span>
              </div>
            )}
            <div className="flex items-baseline gap-1.5">
              <span className="text-[28px] font-extrabold text-slate-900">{formatVND(pricing.pack.current)}</span>
              <span className="text-xs text-slate-400">/pack</span>
            </div>
          </div>

          <div className="mb-5 flex flex-1 flex-col gap-2.5">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">
                <strong className="font-bold">+15 essays</strong> added to quota
              </span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Never expires</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Buy multiple times to stack</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-[15px] w-[15px] flex-shrink-0 text-emerald-600" strokeWidth={2.6} />
              <span className="text-[13px] text-slate-700">Keeps daily limit ({dailyQuota}/day)</span>
            </div>
          </div>

          <BuyPackButton />
        </div>
      </div>

      {/* WHY SUPPORT — compact strip */}
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
          <div className="lg:max-w-[240px] lg:flex-shrink-0">
            <h3 className="mb-1.5 text-sm font-extrabold text-slate-900">Why support us?</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Servers, AI costs, and development — your Pro subscription keeps it running.
            </p>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-xs text-slate-600">Fast, reliable, ad-free</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-xs text-slate-600">New features from feedback</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-xs text-slate-600">High-quality AI scoring</span>
            </div>
            <div className="flex items-start gap-2">
              <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-cyan-600" strokeWidth={2.6} />
              <span className="text-xs text-slate-600">Free access for those who need it</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
