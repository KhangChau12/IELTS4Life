import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, FileText } from 'lucide-react'
import { getDailyQuota, getTotalQuota, getUserTier } from '@/lib/user/quota'
import { UpgradeButton } from './UpgradeButton'
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

      {/* Current Status */}
      <Card className="border-ocean-200 shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-ocean-800">Your Current Plan</CardTitle>
              <CardDescription>Usage and subscription status</CardDescription>
            </div>
            <Badge className={`${
              isPro
                ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                : 'bg-gradient-to-r from-ocean-600 to-cyan-600'
            } text-white text-lg px-4 py-2`}>
              {isPro ? (
                <><Crown className="mr-2 h-5 w-5" /> Pro</>
              ) : (
                <><FileText className="mr-2 h-5 w-5" /> Free</>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Daily Usage */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#e0f2fe" strokeWidth="12" />
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#0891b2" strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 40 * (dailyPercentage / 100)} ${2 * Math.PI * 40}`}
                    strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ocean-800">{dailyCount}</span>
                  <span className="text-xs text-ocean-600">of {dailyQuota}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-ocean-800">Today's Usage</p>
              <p className="text-xs text-ocean-600">essays submitted today</p>
            </div>

            {/* Total Usage (Free only) */}
            {!isPro && totalQuota && (
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#cffafe" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#06b6d4" strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 40 * (totalPercentage / 100)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold text-ocean-800">{totalCount}</span>
                    <span className="text-xs text-ocean-600">of {totalQuota}</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-ocean-800">Total Usage</p>
                <p className="text-xs text-ocean-600">essays submitted all time</p>
              </div>
            )}

            {/* Status circle */}
            <div className="flex flex-col items-center justify-center">
              <div className={`w-32 h-32 rounded-full flex items-center justify-center mb-4 ${
                isPro
                  ? 'bg-gradient-to-br from-green-100 to-emerald-100 border-4 border-green-200'
                  : 'bg-gradient-to-br from-orange-100 to-amber-100 border-4 border-orange-200'
              }`}>
                {isPro ? (
                  <Crown className="w-12 h-12 text-green-600" />
                ) : (
                  <FileText className="w-12 h-12 text-orange-600" />
                )}
              </div>
              <p className={`text-lg font-bold ${isPro ? 'text-green-700' : 'text-orange-700'}`}>
                {isPro ? 'Active Pro' : 'Free Tier'}
              </p>
              {isDbPro && profile.subscription_end_date && (
                <p className="text-xs text-green-600 mt-1">
                  Expires: {formatDate(profile.subscription_end_date)}
                </p>
              )}
              {!isPro && (
                <p className="text-xs text-ocean-600 mt-1">
                  {totalQuota ? `${totalQuota - totalCount} essays remaining` : 'Unlimited essays'}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Free Plan */}
        <Card className="border-ocean-200 shadow-lg">
          <CardHeader className="bg-gradient-to-br from-ocean-50 to-cyan-50 border-b border-ocean-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-ocean-600 rounded-lg">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-ocean-800">Free</CardTitle>
                <CardDescription>Perfect for getting started</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="text-4xl font-bold text-ocean-800 mb-2">
                0 VND
                <span className="text-base font-normal text-ocean-600">/forever</span>
              </div>
              <p className="text-sm text-ocean-600">Hope you enjoy our service!</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700"><strong>3 essays per day</strong> with AI scoring</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700"><strong>6 essays base</strong> (earn more by inviting friends!)</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Full feedback on all 4 IELTS criteria</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Vocabulary suggestions & flashcards</span>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-xs text-ocean-700 leading-relaxed">
                <strong>Note:</strong> If you find value in our platform, consider upgrading — it costs just the price of a coffee!
              </p>
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
                <CardDescription>For serious IELTS preparation</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="mb-6">
              <div className="text-4xl font-bold text-green-700 mb-2">
                75,000 VND
                <span className="text-base font-normal text-ocean-600">/month</span>
              </div>
              <p className="text-sm text-ocean-600">≈ $3 — the price of a coffee</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700"><strong>5 essays per day</strong> with AI scoring</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700"><strong>Unlimited total essays</strong> — practice as much as you need</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">Everything in Free plan</span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
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
              <UpgradeButton />
            )}
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
