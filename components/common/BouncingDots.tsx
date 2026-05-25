import { cn } from '@/lib/utils'

interface BouncingDotsProps {
  size?: 'sm' | 'md'
  color?: string
  className?: string
}

export function BouncingDots({ size = 'md', color = 'bg-ocean-500', className }: BouncingDotsProps) {
  const dotSize = size === 'sm' ? 'h-1.5 w-1.5' : 'h-2 w-2'
  return (
    <span
      className={cn('inline-flex items-center gap-1', className)}
      aria-label="Loading"
      role="status"
    >
      {(['0ms', '150ms', '300ms'] as const).map((delay, i) => (
        <span
          key={i}
          className={cn('rounded-full animate-bounce-dot', dotSize, color)}
          style={{ animationDelay: delay }}
        />
      ))}
    </span>
  )
}
