'use client'

import { useState, useEffect, useRef } from 'react'
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
        className="bg-green-100 text-green-900 px-0.5 rounded font-medium border-b-2 border-green-400 cursor-help transition-all duration-200 hover:bg-green-200 hover:shadow-sm"
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
  initialChanges?: Change[] | null
}

export function EssayImprovement({
  essayId,
  originalEssay,
  initialImprovedEssay,
  initialChanges
}: EssayImprovementProps) {
  const [improvedEssay, setImprovedEssay] = useState<string | null>(initialImprovedEssay || null)
  const [changes, setChanges] = useState<Change[]>(initialChanges || [])
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')

  // Auto-generate if not already done
  useEffect(() => {
    if (!initialImprovedEssay) {
      generateImprovement()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Progress simulation - 3 seconds for improvement (Groq is fast!)
  useEffect(() => {
    if (!isGenerating) {
      return // Don't create interval if not generating
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        // Stop at 95%
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }

        const newProgress = prev + 3.17 // 95% in 3 seconds (3000ms / 100ms intervals)

        // Update stage based on progress
        if (newProgress >= 75) {
          setStage('Polishing improvements...')
        } else if (newProgress >= 50) {
          setStage('Enhancing vocabulary and grammar...')
        } else if (newProgress >= 25) {
          setStage('Improving coherence and structure...')
        } else {
          setStage('Analyzing your essay...')
        }

        return Math.min(newProgress, 95)
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isGenerating]) // Only depend on isGenerating, not progress

  const generateImprovement = async () => {
    setIsGenerating(true)
    setProgress(0)
    setStage('Analyzing your essay...')
    setError('')

    try {
      const response = await fetch('/api/essays/improve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          essay_id: essayId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate improvement')
      }

      setProgress(100)
      setStage('Complete!')
      setImprovedEssay(data.improved_essay)
      setChanges(data.changes || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
      setProgress(0)
    } finally {
      setIsGenerating(false)
    }
  }

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
    let remainingText = improvedEssay
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

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50 animate-fadeInUp">
        <CardContent className="pt-6">
          <p className="text-red-600 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  if (isGenerating) {
    return (
      <Card className="border-ocean-200 shadow-card animate-fadeInUp">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-ocean-800">
            <Loader2 className="h-5 w-5 animate-spin text-cyan-600" />
            Generating Improved Essay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-ocean-700">{stage}</span>
              <span className="text-ocean-600 font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          <div className="bg-cyan-50 border border-cyan-200 rounded-md p-3">
            <p className="text-xs text-ocean-600 leading-relaxed">
              AI is rewriting your essay to demonstrate what a Band 8-9 version would look like.
              This process takes approximately 20 seconds.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!improvedEssay) {
    return null
  }

  return (
    <Card className="border-ocean-200 shadow-card animate-fadeInUp">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-ocean-800">
            <Sparkles className="h-5 w-5 text-cyan-600" />
            Improved Essay (Band 7-8+ Example)
          </CardTitle>
          <CheckCircle className="h-5 w-5 text-green-600" />
        </div>
        <p className="text-sm text-ocean-600 mt-2">
          <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded mr-2">
            ✨ Highlighted
          </span>
          sections show improvements made to your original essay. Hover over highlighted text to see what was changed.
        </p>
      </CardHeader>
      <CardContent>
        <div className="bg-white border border-ocean-200 rounded-lg p-6 leading-relaxed">
          {renderDiff()}
        </div>
        <div className="mt-4 p-4 bg-cyan-50 border border-cyan-200 rounded-md">
          <p className="text-sm text-ocean-700">
            <strong>How to use this:</strong> Compare the highlighted improvements with your original essay.
            Notice how vocabulary, grammar, and sentence structures have been enhanced while keeping your main ideas intact.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
