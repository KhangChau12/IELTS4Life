'use client'

import { useEffect, useState } from 'react'

interface Props {
  saleEndIso: string
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(endIso: string): TimeLeft | null {
  const diff = new Date(endIso).getTime() - Date.now()
  if (diff <= 0) return null
  return {
    days:    Math.floor(diff / 86_400_000),
    hours:   Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

export function SaleCountdown({ saleEndIso }: Props) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null)

  useEffect(() => {
    setTimeLeft(calcTimeLeft(saleEndIso))
    const id = setInterval(() => setTimeLeft(calcTimeLeft(saleEndIso)), 1000)
    return () => clearInterval(id)
  }, [saleEndIso])

  if (!timeLeft) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <span className="font-mono font-semibold tabular-nums text-amber-800">
      {timeLeft.days}d {pad(timeLeft.hours)}:{pad(timeLeft.minutes)}:{pad(timeLeft.seconds)}
    </span>
  )
}
