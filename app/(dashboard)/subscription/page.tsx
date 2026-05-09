import { redirect } from 'next/navigation'
import Image from 'next/image'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, FileText } from 'lucide-react'
import { getDailyQuota, getTotalQuota, getUserTier } from '@/lib/user/quota'

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

  // Get user profile with invite bonuses
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, daily_essays_count, total_essays_count, last_reset_date, invite_bonus_essays')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  // Calculate quota info
  const today = new Date().toISOString().split('T')[0]
  let dailyCount = profile.daily_essays_count || 0

  if (profile.last_reset_date !== today) {
    dailyCount = 0
  }

  const userEmail = profile.email
  const tier = getUserTier(userEmail)
  const dailyQuota = getDailyQuota(userEmail)
  const baseTotalQuota = getTotalQuota(userEmail)
  const bonusEssays = profile.invite_bonus_essays || 0
  // Calculate total quota including invite bonuses
  const totalQuota = baseTotalQuota !== null ? baseTotalQuota + bonusEssays : null
  const totalCount = profile.total_essays_count || 0

  const isPro = tier === 'pro'

  // Calculate percentages for pie charts
  const dailyPercentage = dailyQuota > 0 ? (dailyCount / dailyQuota) * 100 : 0
  const totalPercentage = totalQuota && totalQuota > 0 ? (totalCount / totalQuota) * 100 : 0

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
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
            {/* Daily Usage Pie Chart */}
            <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  {/* Background circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#e0f2fe"
                    strokeWidth="12"
                  />
                  {/* Progress circle */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#0891b2"
                    strokeWidth="12"
                    strokeDasharray={`${2 * Math.PI * 40 * (dailyPercentage / 100)} ${2 * Math.PI * 40}`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-ocean-800">{dailyCount}</span>
                  <span className="text-xs text-ocean-600">of {dailyQuota}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-ocean-800">Today's Usage</p>
              <p className="text-xs text-ocean-600">essays submitted today</p>
            </div>

            {/* Total Usage Pie Chart (Free only) */}
            {!isPro && totalQuota && (
              <div className="flex flex-col items-center">
                <div className="relative w-32 h-32 mb-4">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                    {/* Background circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#cffafe"
                      strokeWidth="12"
                    />
                    {/* Progress circle */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="12"
                      strokeDasharray={`${2 * Math.PI * 40 * (totalPercentage / 100)} ${2 * Math.PI * 40}`}
                      strokeLinecap="round"
                    />
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

            {/* Status */}
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
              <p className={`text-lg font-bold ${
                isPro ? 'text-green-700' : 'text-orange-700'
              }`}>
                {isPro ? 'Active Pro' : 'Free Tier'}
              </p>
              <p className="text-xs text-ocean-600 mt-1">
                {isPro ? 'Unlimited essays' : `${totalQuota! - totalCount} essays remaining`}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plans Comparison */}
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
                $0
                <span className="text-base font-normal text-ocean-600">/forever</span>
              </div>
              <p className="text-sm text-ocean-600">Hope you enjoy our service!</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <strong>3 essays per day</strong> with AI scoring
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <strong>6 essays base</strong> (earn more by inviting friends!)
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  Full feedback on all 4 IELTS criteria
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  Vocabulary suggestions & flashcards
                </span>
              </div>
            </div>

            <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
              <p className="text-xs text-ocean-700 leading-relaxed">
                <strong>Note:</strong> You can create additional email accounts to continue practicing,
                but we do need some support to keep this service running. If you find value in our platform,
                consider upgrading - it costs just the price of a coffee!
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
          {/* Popular badge */}
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
                ~$3
                <span className="text-base font-normal text-ocean-600">/month</span>
              </div>
              <p className="text-sm text-ocean-600">Price of a coffee - Coming soon!</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <strong>5 essays per day</strong> with AI scoring
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  <strong>Unlimited total essays</strong> - practice as much as you need
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  Everything in Free plan
                </span>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-ocean-700">
                  Support platform development
                </span>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800 font-semibold mb-2">
                PTNK Students
              </p>
              <p className="text-xs text-ocean-700 leading-relaxed">
                If you have a <strong>@ptnk.edu.vn</strong> email address, you automatically get
                Pro features for free! Just register with your school email.
              </p>
            </div>

            {isPro ? (
              <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white w-full justify-center py-2">
                <Crown className="mr-2 h-4 w-4" /> Active Plan
              </Badge>
            ) : (
              <div className="bg-gradient-to-r from-green-100 to-emerald-100 border border-green-300 rounded-lg p-4">
                <p className="text-sm font-semibold text-green-800 mb-1">
                  Want Pro access? Message us on Zalo!
                </p>
                <p className="text-xs text-green-700 leading-relaxed">
                  While we&apos;re building the payment system, message the developer on Zalo at{' '}
                  <strong>0971240808</strong> to get a temporary Pro upgrade. We&apos;re happy to help!
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Support / Donation */}
      <Card className="border-amber-200 shadow-lg mb-8">
        <CardHeader className="bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200">
          <CardTitle className="text-amber-800">Support This Free Project ☕</CardTitle>
          <CardDescription>Buy us a coffee to keep IELTS4Life running</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <p className="text-sm text-amber-700 leading-relaxed mb-3">
                If you find IELTS4Life helpful, consider sending any amount to support the developer.
                Every contribution helps keep the platform ad-free and makes it better for everyone!
              </p>
              <p className="text-sm font-semibold text-amber-800">
                SHB Bank · <span className="font-mono">0971240808</span>
              </p>
            </div>
            <div className="flex-shrink-0">
              <Image
                src="/images/qr code.jpg"
                alt="SHB Bank QR Code"
                width={240}
                height={240}
                className="rounded-xl border-2 border-amber-200 shadow-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* FAQ / Info */}
      <Card className="border-ocean-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
          <CardTitle className="text-ocean-800">Why Support Us?</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="prose prose-sm max-w-none">
            <p className="text-ocean-700 leading-relaxed mb-4">
              Running this IELTS4Life platform requires servers, AI API costs, and ongoing development.
              Your Pro subscription helps us:
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
                <span>Provide free access to students who can't afford it</span>
              </li>
            </ul>
            <p className="text-ocean-600 text-sm mt-4">
              Thank you for considering supporting our mission to make IELTS preparation accessible to everyone!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
