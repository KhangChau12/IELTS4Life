'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Brain, AlertCircle, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface NextActionBannerProps {
  totalEssays: number
  essaysWithoutVocab: number
  avgScore: number | null
  quizScore: number
}

export function NextActionBanner({
  totalEssays,
  essaysWithoutVocab,
  avgScore,
  quizScore,
}: NextActionBannerProps) {
  // Determine the primary action based on user state
  let action: {
    icon: React.ReactNode
    title: string
    description: string
    cta: string
    href: string
    bgClass: string
  } | null = null

  if (totalEssays === 0) {
    action = {
      icon: <FileText className="h-6 w-6" />,
      title: 'Ready to start?',
      description: 'Write your first essay to unlock AI-powered feedback and vocabulary learning',
      cta: 'Write Your First Essay',
      href: '/write',
      bgClass: 'from-cyan-500 to-blue-600',
    }
  } else if (essaysWithoutVocab > 0) {
    action = {
      icon: <Brain className="h-6 w-6" />,
      title: 'Expand your vocabulary',
      description: `Generate vocabulary for ${essaysWithoutVocab} essay${essaysWithoutVocab > 1 ? 's' : ''} to strengthen your word bank`,
      cta: 'Generate Vocabulary',
      href: '/vocabulary',
      bgClass: 'from-amber-500 to-orange-600',
    }
  } else if (avgScore && avgScore < 6.5) {
    action = {
      icon: <AlertCircle className="h-6 w-6" />,
      title: 'Focus on grammar',
      description: `Your band score is ${avgScore?.toFixed(1)}, review common errors to boost writing quality`,
      cta: 'Review Errors',
      href: '/dashboard#error-history',
      bgClass: 'from-orange-500 to-red-600',
    }
  } else if (quizScore < 70) {
    action = {
      icon: <Brain className="h-6 w-6" />,
      title: 'Reinforce vocabulary',
      description: `Your quiz accuracy is ${quizScore}%, practice more quizzes to improve retention`,
      cta: 'Take Quiz',
      href: '/vocabulary',
      bgClass: 'from-teal-500 to-cyan-600',
    }
  } else {
    action = {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Keep improving',
      description: 'Write another essay or practice vocabulary quizzes to advance your skills',
      cta: 'Write Another Essay',
      href: '/write',
      bgClass: 'from-green-500 to-emerald-600',
    }
  }

  if (!action) return null

  return (
    <Card className={`border-0 shadow-lg bg-gradient-to-r ${action.bgClass} overflow-hidden mb-6 md:mb-8`}>
      <CardContent className="py-6 md:py-7 px-5 md:px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-5">
          <div className="flex items-start sm:items-center gap-3 md:gap-5 flex-1 min-w-0">
            <div className="text-white flex-shrink-0 mt-0.5 sm:mt-0">{action.icon}</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-xl font-bold text-white mb-1">{action.title}</h3>
              <p className="text-sm md:text-base text-white/90">{action.description}</p>
            </div>
          </div>
          <Link href={action.href} className="flex-shrink-0 self-start sm:self-auto">
            <Button
              size="sm"
              className="bg-white text-gray-900 hover:bg-gray-100 font-semibold whitespace-nowrap"
            >
              {action.cta}
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
