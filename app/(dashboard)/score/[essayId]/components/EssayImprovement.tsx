'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, Sparkles, ArrowRight } from 'lucide-react'

interface Change {
  original: string
  improved: string
  reason: string
}

// Custom Tooltip Component
interface CustomTooltipProps {
  original: string
  reason: string
  children: React.ReactNode
}

function CustomTooltip({ original, reason, children }: CustomTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    // Use actual mouse position instead of element center
    // This handles multi-line highlighted text correctly
    setPosition({
      top: e.clientY - 10,
      left: e.clientX,
    })

    if (!isVisible) {
      setIsVisible(true)
    }
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
    setPosition(null)
  }

  return (
    <>
      <span
        ref={triggerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="animate-fadeIn bg-green-100 text-green-900 px-0.5 rounded font-medium border-b-2 border-green-400 cursor-help transition-all duration-200 hover:bg-green-200 hover:shadow-sm"
      >
        {children}
      </span>
      {isVisible && position && (
        <div
          className="fixed z-50 px-3 py-2 text-sm bg-gradient-to-br from-ocean-800 to-ocean-700 text-white rounded-lg shadow-xl border border-ocean-600 max-w-xs transition-opacity duration-150 pointer-events-none"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="flex items-start gap-2 mb-1">
            <span className="text-cyan-300 font-semibold text-xs uppercase tracking-wide">Original:</span>
            <span className="text-white font-medium line-through decoration-red-400 decoration-2">"{original}"</span>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <ArrowRight className="h-3 w-3 text-cyan-400" />
            <span className="text-cyan-200 text-xs italic">{reason}</span>
          </div>
          {/* Arrow pointer */}
          <div
            className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-ocean-700 border-r border-b border-ocean-600"
          />
        </div>
      )}
    </>
  )
}

interface EssayImprovementProps {
  essayId: string
  originalEssay: string
  initialImprovedEssay?: string | null
  /** null = the diff step has not run yet; [] = ran and found no changes */
  initialChanges?: Change[] | null
  onGeneratingChange?: (isGenerating: boolean) => void
}

// rewriting  -> waiting for the Band 8-9 rewrite
// diffing    -> rewrite is on screen, computing + labelling the highlights
// done       -> highlights applied (or confirmed there are none)
// error      -> the rewrite itself failed (essay not shown)
type Phase = 'idle' | 'rewriting' | 'diffing' | 'done' | 'error'

const DIFF_RETRY_LIMIT = 4

export function EssayImprovement({
  essayId,
  originalEssay,
  initialImprovedEssay,
  initialChanges,
  onGeneratingChange,
}: EssayImprovementProps) {
  const [improvedEssay, setImprovedEssay] = useState<string | null>(initialImprovedEssay || null)
  const [changes, setChanges] = useState<Change[]>(initialChanges ?? [])
  // The diff step is "settled" once we hold a non-null changes array (even an empty one).
  const [diffSettled, setDiffSettled] = useState<boolean>(initialChanges != null)
  const [phase, setPhase] = useState<Phase>(() => {
    if (initialImprovedEssay && initialChanges != null) return 'done'
    if (initialImprovedEssay) return 'diffing'
    return 'idle'
  })
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')
  const [diffError, setDiffError] = useState(false)
  const startedRef = useRef(false)

  const isBusy = phase === 'rewriting' || phase === 'diffing'

  // ---- fake progress bar: 0->70% during rewrite, 70->95% during diff ----
  useEffect(() => {
    if (phase !== 'rewriting' && phase !== 'diffing') return
    const target = phase === 'rewriting' ? 70 : 95
    const step = phase === 'rewriting' ? 1.4 : 1.0 // ~5s to 70, ~2.5s to 95
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= target) return target
        const next = prev + step
        if (phase === 'rewriting') {
          setStage(next < 25 ? 'Reading your essay...' : next < 50 ? 'Rewriting to Band 8-9...' : 'Polishing the rewrite...')
        } else {
          setStage('Finding the specific improvements...')
        }
        return Math.min(next, target)
      })
    }, 100)
    return () => clearInterval(interval)
  }, [phase])

  // ---- run the diff step ----
  const runDiff = useCallback(async () => {
    setDiffError(false)
    setPhase('diffing')
    for (let attempt = 0; attempt < DIFF_RETRY_LIMIT; attempt++) {
      try {
        const res = await fetch('/api/essays/improve/diff', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ essay_id: essayId }),
        })
        if (res.status === 409) {
          // rewrite not persisted yet — wait and retry
          await new Promise((r) => setTimeout(r, 2000))
          continue
        }
        const data = await res.json()
        if (!res.ok) throw new Error(data.error || 'diff failed')
        setChanges(Array.isArray(data.changes) ? data.changes : [])
        setDiffSettled(true)
        setProgress(100)
        setPhase('done')
        return
      } catch {
        await new Promise((r) => setTimeout(r, 1500))
      }
    }
    // give up on highlights but keep the essay readable
    setDiffError(true)
    setPhase('done')
  }, [essayId])

  // ---- run the rewrite step ----
  const runRewrite = useCallback(async () => {
    setPhase('rewriting')
    setProgress(0)
    setStage('Reading your essay...')
    setError('')
    try {
      const res = await fetch('/api/essays/improve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: essayId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to generate improvement')

      setImprovedEssay(data.improved_essay)

      if (Array.isArray(data.changes) && data.changes.length > 0) {
        // cached run already had changes
        setChanges(data.changes)
        setDiffSettled(true)
        setProgress(100)
        setPhase('done')
      } else {
        await runDiff()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProgress(0)
      setPhase('error')
    }
  }, [essayId, runDiff])

  // ---- kick off on mount ----
  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    if (!initialImprovedEssay) {
      runRewrite()
    } else if (initialChanges == null) {
      // rewrite exists from a previous (possibly interrupted) run; finish the diff
      runDiff()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---- tell the parent when a network step is in flight (drives the tab pulse) ----
  useEffect(() => {
    onGeneratingChange?.(isBusy)
  }, [isBusy, onGeneratingChange])

  // Segment type for custom diff rendering
  interface Segment {
    text: string
    type: 'changed' | 'unchanged'
    changeInfo?: { original: string; reason: string }
  }

  // Create segments from improved essay and changes array
  const createSegments = (): Segment[] => {
    if (!improvedEssay || changes.length === 0) {
      return [{ text: improvedEssay || '', type: 'unchanged' }]
    }

    const segments: Segment[] = []
    let processedLength = 0

    // Sort changes by their position in the improved essay
    const sortedChanges = [...changes].sort((a, b) => {
      const posA = improvedEssay.indexOf(a.improved)
      const posB = improvedEssay.indexOf(b.improved)
      return posA - posB
    })

    // Track processed positions to avoid duplicates
    const processedRanges: Array<{ start: number; end: number }> = []

    for (const change of sortedChanges) {
      const { improved, original, reason } = change

      // Find the position of this change in the remaining text
      const changeIndex = improvedEssay.indexOf(improved, processedLength)

      if (changeIndex === -1) continue // Change not found, skip

      // Check if this range overlaps with already processed ranges
      const changeEnd = changeIndex + improved.length
      const isOverlapping = processedRanges.some(
        range => (changeIndex >= range.start && changeIndex < range.end) ||
                 (changeEnd > range.start && changeEnd <= range.end) ||
                 (changeIndex <= range.start && changeEnd >= range.end)
      )

      if (isOverlapping) continue // Skip overlapping changes

      // Add unchanged text before this change
      if (changeIndex > processedLength) {
        segments.push({
          text: improvedEssay.substring(processedLength, changeIndex),
          type: 'unchanged'
        })
      }

      // Add the changed segment with tooltip info
      segments.push({
        text: improved,
        type: 'changed',
        changeInfo: { original, reason }
      })

      // Mark this range as processed
      processedRanges.push({ start: changeIndex, end: changeEnd })
      processedLength = changeEnd
    }

    // Add any remaining unchanged text
    if (processedLength < improvedEssay.length) {
      segments.push({
        text: improvedEssay.substring(processedLength),
        type: 'unchanged'
      })
    }

    return segments
  }

  // Generate diff highlighting with custom tooltips using segment-based approach
  const renderDiff = () => {
    if (!improvedEssay) return null

    const segments = createSegments()

    return (
      <div className="prose prose-sm max-w-none whitespace-pre-wrap leading-relaxed">
        {segments.map((segment, index) => {
          if (segment.type === 'changed' && segment.changeInfo) {
            return (
              <CustomTooltip
                key={index}
                original={segment.changeInfo.original}
                reason={segment.changeInfo.reason}
              >
                {segment.text}
              </CustomTooltip>
            )
          }

          return <span key={index}>{segment.text}</span>
        })}
      </div>
    )
  }

  // ---- the rewrite itself failed: nothing to show ----
  if (phase === 'error') {
    return (
      <Card className="border-red-200 bg-red-50 animate-fadeInUp">
        <CardContent className="pt-6 space-y-3">
          <p className="text-red-600 text-sm">{error || 'Failed to generate the improved essay.'}</p>
          <button
            onClick={() => runRewrite()}
            className="text-sm font-medium text-ocean-700 hover:text-ocean-900 underline underline-offset-2"
          >
            Try again
          </button>
        </CardContent>
      </Card>
    )
  }

  // ---- rewrite still running: no essay yet, show progress ----
  if (phase === 'rewriting' && !improvedEssay) {
    return (
      <Card className="border-ocean-200 shadow-card animate-fadeInUp">
        <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
          <CardTitle className="flex items-center gap-2 text-ocean-800 text-base sm:text-lg">
            <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 animate-spin text-cyan-600" />
            Generating Improved Essay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4 px-4 sm:px-6">
          <div className="space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-ocean-700">{stage}</span>
              <span className="text-ocean-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-1.5 sm:h-2" />
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-ocean-100 rounded animate-pulse" />
            <div className="h-3 bg-ocean-100 rounded animate-pulse w-[92%]" />
            <div className="h-3 bg-ocean-100 rounded animate-pulse w-[97%]" />
            <div className="h-3 bg-ocean-100 rounded animate-pulse w-[85%]" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!improvedEssay) {
    return null
  }

  const hasHighlights = changes.length > 0
  const showNoChangeNote = phase === 'done' && diffSettled && !hasHighlights && !diffError

  return (
    <Card className="border-ocean-200 shadow-card animate-fadeInUp">
      <CardHeader className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-ocean-800 text-base sm:text-lg">
            <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-600" />
            Improved Essay (Band 8-9 Example)
          </CardTitle>
          {phase === 'done' && <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 flex-shrink-0" />}
        </div>

        {phase === 'diffing' && (
          <div className="flex items-center gap-2 text-xs sm:text-sm text-ocean-600 mt-2">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-cyan-600" />
            <span>Finding the specific improvements to highlight…</span>
          </div>
        )}

        {hasHighlights && phase === 'done' && (
          <p className="text-xs sm:text-sm text-ocean-600 mt-2">
            <span className="inline-block px-1.5 sm:px-2 py-0.5 bg-green-100 text-green-800 rounded mr-1.5 sm:mr-2">
              ✨ Highlighted
            </span>
            sections show improvements. Hover over highlighted text to see what was changed.
          </p>
        )}

        {showNoChangeNote && (
          <p className="text-xs sm:text-sm text-ocean-600 mt-2">
            Your essay is already close to this level — only light touches were needed, so there is nothing significant to highlight.
          </p>
        )}

        {diffError && (
          <p className="text-xs sm:text-sm text-amber-700 mt-2">
            Couldn&apos;t load the highlighted changes.{' '}
            <button onClick={() => runDiff()} className="underline underline-offset-2 font-medium">
              Retry
            </button>
          </p>
        )}
      </CardHeader>
      <CardContent className="px-4 sm:px-6">
        <div className="bg-white border border-ocean-200 rounded-lg p-3 sm:p-6 leading-relaxed">
          {renderDiff()}
        </div>
        {hasHighlights && (
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-cyan-50 border border-cyan-200 rounded-md">
            <p className="text-xs sm:text-sm text-ocean-700">
              <strong>How to use this:</strong> Compare the highlighted improvements with your original essay.
              Notice how vocabulary, grammar, and sentence structures have been enhanced while keeping your main ideas intact.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
