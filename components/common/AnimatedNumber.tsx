'use client'

import { useEffect, useRef, useState } from 'react'

interface AnimatedNumberProps {
  value: number
  decimals?: number
  duration?: number
  className?: string
}

export function AnimatedNumber({
  value,
  decimals = 0,
  duration = 1000,
  className,
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0)
  const frameRef = useRef<number>()
  const startTimeRef = useRef<number>()
  const previousValueRef = useRef(0)

  useEffect(() => {
    const startValue = previousValueRef.current
    const difference = value - startValue

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime
      }

      const elapsed = currentTime - startTimeRef.current
      const progress = Math.min(elapsed / duration, 1)

      // Easing function (easeOutCubic)
      const easeProgress = 1 - Math.pow(1 - progress, 3)

      const current = startValue + difference * easeProgress
      setDisplayValue(current)
      previousValueRef.current = current

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
        previousValueRef.current = value
        startTimeRef.current = undefined
      }
    }

    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [value, duration])

  return (
    <span className={className}>
      {displayValue.toFixed(decimals)}
    </span>
  )
}
