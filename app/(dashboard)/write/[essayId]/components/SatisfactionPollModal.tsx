'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CheckCircle2 } from 'lucide-react'

interface SatisfactionPollModalProps {
  open: boolean
  onComplete: () => void
}

const OPTIONS = [
  {
    value: 1,
    label: 'Terrible',
    idle: 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100',
    selected: 'border-red-500 bg-red-500 text-white',
  },
  {
    value: 2,
    label: 'Not bad but not for me',
    idle: 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100',
    selected: 'border-orange-400 bg-orange-400 text-white',
  },
  {
    value: 3,
    label: 'Useful but need improve',
    idle: 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100',
    selected: 'border-blue-500 bg-blue-500 text-white',
  },
  {
    value: 4,
    label: 'All good',
    idle: 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100',
    selected: 'border-green-500 bg-green-500 text-white',
  },
]

export function SatisfactionPollModal({ open, onComplete }: SatisfactionPollModalProps) {
  const [selected, setSelected] = useState<number | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDone, setIsDone] = useState(false)

  async function handleSelect(value: number) {
    if (isSubmitting || isDone) return
    setSelected(value)
    setIsSubmitting(true)

    try {
      await fetch('/api/user/satisfaction', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: value }),
      })
    } catch {
      // best-effort — don't block the user
    }

    setIsDone(true)
    setTimeout(() => onComplete(), 1400)
  }

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-sm w-[calc(100vw-2rem)] mx-auto p-6 gap-0 [&>button]:hidden"
        onInteractOutside={e => e.preventDefault()}
        onEscapeKeyDown={e => e.preventDefault()}
      >
        {isDone ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <p className="text-lg font-semibold text-ocean-800">Thanks for your feedback!</p>
            <p className="text-sm text-ocean-500">This helps us improve IELTS4Life.</p>
          </div>
        ) : (
          <>
            <DialogHeader className="mb-5">
              <DialogTitle className="text-lg font-bold text-ocean-800">Quick question</DialogTitle>
              <p className="text-sm text-ocean-600 mt-1">Does this tool actually help you improve?</p>
            </DialogHeader>

            <div className="flex flex-col gap-2.5">
              {OPTIONS.map((opt, idx) => (
                <div key={opt.value}>
                  {/* Divider between option 2 and 3 */}
                  {idx === 2 && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <span className="text-[11px] text-slate-400 whitespace-nowrap">I&apos;ll stop using this</span>
                      <div className="flex-1 h-px bg-slate-200" />
                      <span className="text-[11px] text-ocean-500 whitespace-nowrap">I&apos;ll keep using this</span>
                    </div>
                  )}
                  <button
                    onClick={() => handleSelect(opt.value)}
                    disabled={isSubmitting}
                    className={[
                      'w-full h-12 rounded-lg border-2 text-sm font-medium transition-all duration-150 px-4 text-left',
                      'disabled:opacity-60 disabled:cursor-not-allowed',
                      selected === opt.value ? opt.selected : opt.idle,
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
