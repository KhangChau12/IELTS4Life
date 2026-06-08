'use client'

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Crown, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'

interface GuestLimitModalProps {
  open: boolean
  onOpenChange?: (open: boolean) => void
  existingEssayId?: string
}

export function GuestLimitModal({ open, onOpenChange, existingEssayId }: GuestLimitModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-500" />
            You've tried your free essay!
          </DialogTitle>
          <DialogDescription className="text-base pt-2">
            Sign up FREE to unlock more essays and save your progress
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Features comparison */}
          <div className="space-y-3">
            <p className="text-sm font-semibold text-ocean-800">What you get with a FREE account:</p>

            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">3 essays per day</p>
                  <p className="text-xs text-ocean-600">Instead of just 1 for guests</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">Dashboard with progress charts</p>
                  <p className="text-xs text-ocean-600">Track your improvement over time with beautiful visualizations</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">Essay history & analytics</p>
                  <p className="text-xs text-ocean-600">Review all your past essays and see detailed score breakdowns</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">Save vocabulary & quiz results</p>
                  <p className="text-xs text-ocean-600">Build your personal vocabulary bank and track learning progress</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-ocean-800">Free essays to practice</p>
                  <p className="text-xs text-ocean-600">Plenty of opportunities to improve before your exam</p>
                </div>
              </div>
            </div>
          </div>

          {/* PTNK students bonus */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Crown className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-900 mb-1">
                  PTNK Students - Pro Tier FREE
                </p>
                <p className="text-xs text-amber-800">
                  Sign up with your <strong>@ptnk.edu.vn</strong> email to get <strong>5 essays per day</strong> + <strong>unlimited total essays</strong>!
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <Link href="/login" className="flex-1">
              <Button className="w-full bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white font-semibold">
                Sign Up FREE
              </Button>
            </Link>
            {existingEssayId && (
              <Link href={`/score/${existingEssayId}`} className="flex-1">
                <Button variant="outline" className="w-full border-ocean-300 text-ocean-700 hover:bg-ocean-50">
                  View Your Essay
                </Button>
              </Link>
            )}
          </div>

          <p className="text-xs text-center text-ocean-500">
            No credit card required • Takes 30 seconds
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
