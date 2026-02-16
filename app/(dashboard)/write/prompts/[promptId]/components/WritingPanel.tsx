'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Play, Square, Send, Loader2, Clock } from 'lucide-react'
import TimerDisplay from './TimerDisplay'
import AutoSaveIndicator from './AutoSaveIndicator'
import type { EssayDraft } from '@/types/prompt'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface WritingPanelProps {
  promptId: string
  promptText: string
  initialDraft: EssayDraft | null
  onSubmitSuccess: (essayId: string) => void
}

export default function WritingPanel({
  promptId,
  promptText,
  initialDraft,
  onSubmitSuccess,
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
  }, [promptId])

  // Debounced save on essay change (only when running)
  useEffect(() => {
    if (!isRunning) return
    setSaveStatus('unsaved')
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(triggerSave, 30_000)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [essay, isRunning, triggerSave])

  // Periodic save every 60 seconds of timer
  useEffect(() => {
    if (timerSeconds > 0 && timerSeconds % 60 === 0 && isRunning) {
      clearTimeout(saveTimeoutRef.current)
      triggerSave()
    }
  }, [timerSeconds, isRunning, triggerSave])

  const handleStartStop = () => {
    if (isRunning) {
      setIsRunning(false)
      clearTimeout(saveTimeoutRef.current)
      triggerSave()
    } else {
      setIsRunning(true)
    }
  }

  const wordCount = essay.trim() ? essay.trim().split(/\s+/).length : 0

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setSubmitError('')
    setIsRunning(false)
    clearTimeout(saveTimeoutRef.current)

    try {
      const res = await fetch('/api/essays/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: promptText,
          essay_content: essay,
          prompt_id: promptId,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setSubmitError(data.error || 'Failed to submit essay')
        setIsSubmitting(false)
        return
      }

      if (data.success && data.essay?.id) {
        // Delete draft after successful submission
        await fetch(`/api/drafts/${promptId}`, { method: 'DELETE' })
        onSubmitSuccess(data.essay.id)
      }
    } catch {
      setSubmitError('Network error. Please try again.')
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Timer */}
      <Card className="border-ocean-100">
        <CardContent className="py-4 px-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-ocean-600" />
              <TimerDisplay seconds={timerSeconds} />
            </div>
            <Button
              onClick={handleStartStop}
              disabled={isSubmitting}
              variant={isRunning ? 'destructive' : 'default'}
              size="sm"
              className={isRunning ? '' : 'bg-ocean-600 hover:bg-ocean-700 text-white'}
            >
              {isRunning ? (
                <><Square className="h-4 w-4 mr-1" />Stop</>
              ) : (
                <><Play className="h-4 w-4 mr-1" />{timerSeconds > 0 ? 'Resume' : 'Start'}</>
              )}
            </Button>
          </div>
          {!isRunning && timerSeconds === 0 && (
            <p className="text-xs text-gray-400 mt-2">Press Start to begin writing. The textarea will be enabled.</p>
          )}
          {!isRunning && timerSeconds > 0 && (
            <p className="text-xs text-amber-500 mt-2">Timer paused. Press Resume to continue writing.</p>
          )}
        </CardContent>
      </Card>

      {/* Essay textarea */}
      <Card className="border-ocean-100 flex-1 flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-ocean-900">Your Essay</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-3">
          <Textarea
            value={essay}
            onChange={(e) => setEssay(e.target.value)}
            disabled={!isRunning || isSubmitting}
            placeholder={isRunning ? 'Start writing your essay here...' : 'Start the timer to begin writing.'}
            className="flex-1 min-h-[300px] resize-none text-sm leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${wordCount >= 250 ? 'text-green-600' : 'text-gray-500'}`}>
                {wordCount} word{wordCount !== 1 ? 's' : ''}
                {wordCount >= 250 && ' ✓'}
              </span>
              <AutoSaveIndicator status={saveStatus} lastSavedAt={lastSavedAt} />
            </div>
          </div>

          {submitError && (
            <p className="text-red-500 text-sm">{submitError}</p>
          )}

          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || essay.trim().length < 50 || isRunning}
            className="w-full bg-ocean-600 hover:bg-ocean-700 text-white disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Scoring your essay...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Submit for Scoring</>
            )}
          </Button>
          {isRunning && (
            <p className="text-xs text-center text-gray-400">Stop the timer before submitting.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
