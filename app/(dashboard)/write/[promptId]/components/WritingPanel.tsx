'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Square, Send, Loader2 } from 'lucide-react'
import AutoSaveIndicator from './AutoSaveIndicator'
import type { EssayDraft } from '@/types/prompt'
import { checkGuestUsage } from '@/lib/guest-tracking'
import { getDeviceFingerprint } from '@/lib/fingerprint'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface WritingPanelProps {
  promptId: string
  promptText: string
  initialDraft: EssayDraft | null
  onSubmitSuccess: (essayId: string) => void
  isGuest: boolean
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

export default function WritingPanel({
  promptId,
  promptText,
  initialDraft,
  onSubmitSuccess,
  isGuest,
}: WritingPanelProps) {
  const [essay, setEssay] = useState(initialDraft?.draft_content ?? '')
  const [timerSeconds, setTimerSeconds] = useState(initialDraft?.timer_seconds ?? 0)
  const [isRunning, setIsRunning] = useState(false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved')
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialDraft?.last_saved_at ?? null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const essayRef = useRef(essay)
  const timerSecondsRef = useRef(timerSeconds)

  useEffect(() => { essayRef.current = essay }, [essay])
  useEffect(() => { timerSecondsRef.current = timerSeconds }, [timerSeconds])

  // Timer tick
  useEffect(() => {
    if (!isRunning) return
    const interval = setInterval(() => {
      setTimerSeconds((s) => s + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const triggerSave = useCallback(async () => {
    if (isGuest) return
    setSaveStatus('saving')
    try {
      const res = await fetch(`/api/drafts/${promptId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          draft_content: essayRef.current,
          timer_seconds: timerSecondsRef.current,
        }),
      })
      if (res.ok) {
        const data = await res.json()
        setLastSavedAt(data.draft?.last_saved_at ?? new Date().toISOString())
        setSaveStatus('saved')
      } else {
        setSaveStatus('unsaved')
      }
    } catch {
      setSaveStatus('unsaved')
    }
  }, [promptId, isGuest])

  // Auto-start timer on first keystroke; debounced save while running
  useEffect(() => {
    if (essay === (initialDraft?.draft_content ?? '')) return
    if (!isRunning) setIsRunning(true)
    setSaveStatus('unsaved')
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(triggerSave, 30_000)
    return () => clearTimeout(saveTimeoutRef.current)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [essay])

  // Periodic save every 60 seconds of timer
  useEffect(() => {
    if (timerSeconds > 0 && timerSeconds % 60 === 0 && isRunning) {
      clearTimeout(saveTimeoutRef.current)
      triggerSave()
    }
  }, [timerSeconds, isRunning, triggerSave])

  const handleStop = () => {
    setIsRunning(false)
    clearTimeout(saveTimeoutRef.current)
    triggerSave()
  }

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0
  const progress = Math.min(wordCount / 250, 1)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    setIsRunning(false)
    clearTimeout(saveTimeoutRef.current)

    try {
      if (isGuest) {
        const guestCheck = await checkGuestUsage()
        if (guestCheck.hasUsed) {
          setSubmitError("You've already used your 1 free grading. Sign in to keep practising.")
          setIsSubmitting(false)
          return
        }
      }

      const fingerprint = isGuest ? await getDeviceFingerprint() : undefined

      const res = await fetch('/api/essays/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          essay_content: essay,
          prompt_id: promptId,
          ...(isGuest && fingerprint ? { fingerprint } : {}),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.isGuestLimit) {
          setSubmitError("You've already used your 1 free grading. Sign in to keep practising.")
        } else {
          setSubmitError(data.error || 'Failed to submit essay')
        }
        setIsSubmitting(false)
        return
      }

      if (data.success && data.essay?.id) {
        if (!isGuest) {
          await fetch(`/api/drafts/${promptId}`, { method: 'DELETE' })
        }
        onSubmitSuccess(data.essay.id)
      }
    } catch {
      setSubmitError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Essay textarea card */}
      <Card className="border-ocean-100 flex-1 flex flex-col">
        <CardHeader className="pb-0 px-4 sm:px-6 pt-4 sm:pt-5">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-sm sm:text-base text-ocean-900">Your Essay</CardTitle>

            {/* Timer — inline in header */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Animated dot */}
              <span className="relative flex h-2 w-2">
                {isRunning ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gray-300" />
                )}
              </span>
              <span className={`font-mono text-base sm:text-lg font-bold tabular-nums tracking-tight ${isRunning ? 'text-ocean-700' : 'text-gray-400'}`}>
                {formatTime(timerSeconds)}
              </span>
              {isRunning && (
                <button
                  onClick={handleStop}
                  disabled={isSubmitting}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Square className="h-3 w-3 fill-current" />
                  Stop
                </button>
              )}
              {!isRunning && timerSeconds === 0 && (
                <span className="text-[11px] text-gray-400 hidden sm:inline">starts when you type</span>
              )}
              {!isRunning && timerSeconds > 0 && (
                <span className="text-[11px] text-amber-500 font-medium">paused</span>
              )}
            </div>
          </div>

          {/* Word count progress bar */}
          <div className="mt-3">
            <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${wordCount >= 250 ? 'bg-green-500' : 'bg-ocean-400'}`}
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col gap-3 px-4 sm:px-6 pb-4 sm:pb-6 pt-3">
          <Textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={isSubmitting}
            placeholder="Start writing your essay here..."
            className="flex-1 min-h-[240px] sm:min-h-[300px] lg:min-h-[420px] resize-none text-sm leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
          />

          <div className="flex items-center justify-between">
            <span className={`text-xs font-medium ${wordCount >= 250 ? 'text-green-600' : 'text-gray-500'}`}>
              {wordCount} / 250 words{wordCount >= 250 ? ' ✓' : ''}
            </span>
            {!isGuest && <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />}
          </div>

          {submitError && (
            <p className="text-red-500 text-xs sm:text-sm">{submitError}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || essay.trim().length < 50}
            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white disabled:opacity-50 h-10 sm:h-11 text-sm"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scoring your essay...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Submit for Scoring</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
