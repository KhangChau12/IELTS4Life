'use client'

interface TimerDisplayProps {
  seconds: number
}

export default function TimerDisplay({ seconds }: TimerDisplayProps) {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return (
      <span className="font-mono text-2xl font-bold tabular-nums">
        {String(hours).padStart(2, '0')}:{String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
      </span>
    )
  }

  return (
    <span className="font-mono text-2xl font-bold tabular-nums">
      {String(minutes).padStart(2, '0')}:{String(secs).padStart(2, '0')}
    </span>
  )
}
