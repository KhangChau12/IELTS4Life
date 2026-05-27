'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Target } from 'lucide-react'
import { ProgressRing } from '@/components/common/ProgressRing'

interface ProgressBannerProps {
  total: number
  completed: number
  completedTopics: number
  totalTopics: number
}

export default function ProgressBanner({ total, completed, completedTopics, totalTopics }: ProgressBannerProps) {
  const promptPercentage = total > 0 ? Math.round((completed / total) * 100) : 0
  const topicPercentage = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0

  const getMessage = () => {
    if (completed === 0) return 'Start your first prompt today!'
    if (promptPercentage < 25) return 'Great start! Keep going!'
    if (promptPercentage < 50) return 'Nice progress! You\'re building momentum.'
    if (promptPercentage < 75) return 'Impressive! Over halfway there.'
    if (promptPercentage < 100) return 'Almost done! You\'re on fire!'
    return 'You\'ve completed all prompts!'
  }

  return (
    <Card className="border-ocean-200 shadow-lg overflow-hidden relative mb-6 bg-gradient-to-r from-ocean-50 to-cyan-50">
      {/* Watermark icon */}
      <Target className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

      <CardContent className="relative z-10 p-5">
        <div className="flex items-center gap-6">
          {/* Ring 1: Prompts */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ProgressRing
              percentage={promptPercentage}
              size={72}
              strokeWidth={6}
              showPercentage={false}
            />
            <p className="text-xs font-semibold text-ocean-700">{completed}/{total}</p>
            <p className="text-xs text-ocean-600">Prompts</p>
          </div>

          {/* Ring 2: Topics */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <ProgressRing
              percentage={topicPercentage}
              size={72}
              strokeWidth={6}
              showPercentage={false}
              color="#f97316"
            />
            <p className="text-xs font-semibold text-orange-500">{completedTopics}/{totalTopics}</p>
            <p className="text-xs text-ocean-600">Topics</p>
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-ocean-900">
              You&apos;ve completed <span className="text-ocean-600">{completed}</span> of{' '}
              <span className="text-ocean-600">{total}</span> prompts
            </p>
            <p className="text-xs text-ocean-600 mt-1">{getMessage()}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
