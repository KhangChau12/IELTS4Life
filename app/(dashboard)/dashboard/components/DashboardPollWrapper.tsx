'use client'

import { SatisfactionPollModal } from '@/app/(dashboard)/write/[essayId]/components/SatisfactionPollModal'

interface DashboardPollWrapperProps {
  shouldShow: boolean
}

export function DashboardPollWrapper({ shouldShow }: DashboardPollWrapperProps) {
  if (!shouldShow) return null
  return <SatisfactionPollModal open={true} onComplete={() => {}} />
}
