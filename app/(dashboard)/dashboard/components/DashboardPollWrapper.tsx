'use client'

import { useState } from 'react'
import { SatisfactionPollModal } from '@/app/(dashboard)/score/[essayId]/components/SatisfactionPollModal'

interface DashboardPollWrapperProps {
  shouldShow: boolean
}

export function DashboardPollWrapper({ shouldShow }: DashboardPollWrapperProps) {
  const [open, setOpen] = useState(shouldShow)
  return <SatisfactionPollModal open={open} onComplete={() => setOpen(false)} />
}
