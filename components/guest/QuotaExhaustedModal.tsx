'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, CheckCircle, Clock, Users, Zap } from 'lucide-react'
import Link from 'next/link'
import { getPricing } from '@/lib/pricing'

interface QuotaExhaustedModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  type: 'daily' | 'total'
  lastEssayId?: string
}

export function QuotaExhaustedModal({ open, onOpenChange, type, lastEssayId }: QuotaExhaustedModalProps) {
  const pricing = getPricing()

  if (type === 'daily') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Clock className="h-6 w-6 text-amber-500" />
              Daily limit reached
            </DialogTitle>
            <DialogDescription className="text-base pt-1">
              You've written 3 essays today — great work! Come back tomorrow to keep improving.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Pro upgrade callout */}
            <div className="bg-gradient-to-r from-ocean-50 to-cyan-50 border border-ocean-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Crown className="h-5 w-5 text-ocean-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-ocean-900 mb-1">
                    Want to write more today?
                  </p>
                  <p className="text-xs text-ocean-700">
                    Upgrade to <strong>Pro</strong> to get <strong>5 essays per day</strong> and unlimited total access — no interruptions.
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Link href="/subscription" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white font-semibold">
                  <Zap className="h-4 w-4 mr-2" />
                  Upgrade to Pro
                </Button>
              </Link>
              {lastEssayId && (
                <Link href={`/score/${lastEssayId}`} className="flex-1">
                  <Button
                    variant="outline"
                    className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-50"
                    onClick={() => onOpenChange?.(false)}
                  >
                    Review Last Essay
                  </Button>
                </Link>
              )}
            </div>

            <p className="text-xs text-center text-ocean-500">
              Or come back tomorrow — your progress is saved
            </p>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // type === 'total'
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Crown className="h-6 w-6 text-ocean-600" />
            You've used all your free essays
          </DialogTitle>
          <DialogDescription className="text-base pt-1">
            You've made the most of your free essays. Ready to keep going?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Pro benefits */}
          <div className="space-y-2">
            <p className="text-sm font-semibold text-ocean-800">What you get with Pro:</p>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">5 essays per day</p>
                  <p className="text-xs text-ocean-600">More practice, faster improvement</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">Unlimited total essays</p>
                  <p className="text-xs text-ocean-600">Write as many as you need — no cap ever</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">All AI features included</p>
                  <p className="text-xs text-ocean-600">Full scoring, vocabulary, improvement rewrites & guidance</p>
                </div>
              </div>
            </div>
          </div>

          {/* Invite alternative */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  Not ready to upgrade?
                </p>
                <p className="text-xs text-amber-800">
                  Invite a friend and both of you get <strong>+2 bonus essays</strong> — free.
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link href="/subscription" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white font-semibold">
                <Zap className="h-4 w-4 mr-2" />
                Upgrade to Pro — {(pricing.pro.current / 1000).toFixed(0)}K VND/mo
              </Button>
            </Link>
            <Link href="/invite" className="flex-shrink-0">
              <Button variant="outline" className="border-ocean-300 text-ocean-700 hover:bg-ocean-50">
                Invite Friends
              </Button>
            </Link>
          </div>

          {lastEssayId && (
            <div className="text-center">
              <Link
                href={`/score/${lastEssayId}`}
                className="text-xs text-ocean-500 underline underline-offset-2 hover:text-ocean-700"
                onClick={() => onOpenChange?.(false)}
              >
                Review your last essay instead
              </Link>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
