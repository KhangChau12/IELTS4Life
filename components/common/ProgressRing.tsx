'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface ProgressRingProps {
  percentage: number
  size?: number
  strokeWidth?: number
  className?: string
  showPercentage?: boolean
  label?: string
  color?: string
}

export function ProgressRing({
  percentage,
  size = 120,
  strokeWidth = 8,
  className,
  showPercentage = true,
  label,
  color: colorOverride,
}: ProgressRingProps) {
  const [progress, setProgress] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(percentage)
    }, 100)
    return () => clearTimeout(timer)
  }, [percentage])

  // Determine color based on percentage
  const getColor = () => {
    if (percentage >= 80) return '#06b6d4' // cyan-500
    if (percentage >= 60) return '#0ea5e9' // ocean-500
    if (percentage >= 40) return '#0284c7' // ocean-600
    return '#64748b' // slate-500
  }

  const color = colorOverride ?? getColor()

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        className="progress-ring"
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#bae6fd"
          strokeWidth={strokeWidth}
          fill="none"
        />

        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{
            transformOrigin: '50% 50%',
            transform: 'rotate(-90deg)',
          }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span className="text-2xl font-bold text-slate-900">
            {Math.round(progress)}%
          </span>
        )}
        {label && (
          <span className="text-xs text-slate-600 mt-1">{label}</span>
        )}
      </div>
    </div>
  )
}
