'use client'

import { ProgressRing } from '@/components/common/ProgressRing'

interface ProgressBannerProps {
  total: number
  completed: number
}

export default function ProgressBanner({ total, completed }: ProgressBannerProps) {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

  const getMessage = () => {
    if (completed === 0) return 'Start your first prompt today!'
    if (percentage < 25) return 'Great start! Keep going!'
    if (percentage < 50) return 'Nice progress! You\'re building momentum.'
    if (percentage < 75) return 'Impressive! Over halfway there.'
    if (percentage < 100) return 'Almost done! You\'re on fire!'
    return 'You\'ve completed all prompts!'
  }

  return (
    <div className="flex items-center gap-5 bg-ocean-100 border border-ocean-300 rounded-xl p-4 mb-6">
      <ProgressRing
        percentage={percentage}
        size={72}
        strokeWidth={6}
        showPercentage={false}
      />
      <div>
        <p className="text-sm font-semibold text-ocean-900">
          You&apos;ve completed <span className="text-ocean-600">{completed}</span> of <span className="text-ocean-600">{total}</span> prompts
        </p>
        <p className="text-xs text-gray-500 mt-1">{getMessage()}</p>
      </div>
    </div>
  )
}
