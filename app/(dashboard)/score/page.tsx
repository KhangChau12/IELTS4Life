'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2, CheckCircle, Clock, PenTool, Sparkles, AlertTriangle, BookOpen, Target, Languages } from 'lucide-react'
import { QuotaDisplay } from '@/components/QuotaDisplay'
import { createClient } from '@/lib/supabase/client'
import { checkGuestUsage, markGuestUsed } from '@/lib/guest-tracking'
import { getDeviceFingerprint } from '@/lib/fingerprint'
import { GuestLimitModal } from '@/components/guest/GuestLimitModal'
import { QuotaExhaustedModal } from '@/components/guest/QuotaExhaustedModal'
import { GuestBanner } from '@/components/guest/GuestBanner'
import { SatisfactionPollModal } from '@/app/(dashboard)/score/[essayId]/components/SatisfactionPollModal'

const SAMPLE_PROMPT =
  'Some people believe that schools should focus on academic subjects such as mathematics and science, while others think practical skills like cooking and financial management are more important. Discuss both views and give your opinion.'

const CRITERIA = [
  { label: 'Task Response', color: 'bg-blue-400' },
  { label: 'Coherence', color: 'bg-green-400' },
  { label: 'Vocabulary', color: 'bg-amber-400' },
  { label: 'Grammar', color: 'bg-pink-400' },
]

export default function WritePage() {
  const router = useRouter()
  const essayRef = useRef<HTMLTextAreaElement>(null)
  const [prompt, setPrompt] = useState('')
  const [essay, setEssay] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState(0)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [quotaExhaustedType, setQuotaExhaustedType] = useState<'daily' | 'total' | null>(null)
  const [lastEssayId, setLastEssayId] = useState<string | undefined>()
  const [isGuest, setIsGuest] = useState(false)
  const [showGuestLimit, setShowGuestLimit] = useState(false)
  const [existingEssayId, setExistingEssayId] = useState<string>()
  const [fingerprint, setFingerprint] = useState<string>('')
  const [draftKey, setDraftKey] = useState<string | null>(null)
  const [hasHydratedDraft, setHasHydratedDraft] = useState(false)
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null)
  const [showPoll, setShowPoll] = useState(false)
  const [promptFocused, setPromptFocused] = useState(false)

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setDraftKey(`write-draft:user:${user.id}`)

        const pollCheck = await supabase
          .from('profiles')
          .select('total_essays_count, satisfaction_rated_at')
          .eq('id', user.id)
          .single()

        const p = pollCheck.data as { total_essays_count: number; satisfaction_rated_at: string | null } | null
        if (p && (p.total_essays_count ?? 0) >= 1 && !p.satisfaction_rated_at) {
          setShowPoll(true)
        }
        return
      }

      setIsGuest(true)
      const fp = await getDeviceFingerprint()
      setFingerprint(fp)
      setDraftKey(`write-draft:guest:${fp}`)

      const guestCheck = await checkGuestUsage()
      if (guestCheck.hasUsed) {
        setShowGuestLimit(true)
        setExistingEssayId(guestCheck.essayId)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!draftKey || hasHydratedDraft) return
    try {
      const savedDraft = window.localStorage.getItem(draftKey)
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as { prompt?: string; essay?: string; updatedAt?: string }
        if (parsed.prompt) setPrompt(parsed.prompt)
        if (parsed.essay) setEssay(parsed.essay)
        if (parsed.updatedAt) setLastSavedAt(parsed.updatedAt)
      }
    } catch {
      // ignore corrupt drafts
    } finally {
      setHasHydratedDraft(true)
    }
  }, [draftKey, hasHydratedDraft])

  useEffect(() => {
    const el = essayRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 420)}px`
  }, [essay])

  useEffect(() => {
    if (!draftKey || !hasHydratedDraft || isSubmitting) return
    const timeout = window.setTimeout(() => {
      try {
        const updatedAt = new Date().toISOString()
        window.localStorage.setItem(draftKey, JSON.stringify({ prompt, essay, updatedAt }))
        setLastSavedAt(updatedAt)
      } catch {
        // autosave never blocks writing
      }
    }, 500)
    return () => window.clearTimeout(timeout)
  }, [draftKey, essay, hasHydratedDraft, isSubmitting, prompt])

  const clearDraft = () => {
    if (draftKey) window.localStorage.removeItem(draftKey)
    setLastSavedAt(null)
  }

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSubmitting) {
      interval = setInterval(() => setElapsedTime(prev => prev + 1), 1000)
    } else {
      setElapsedTime(0)
    }
    return () => clearInterval(interval)
  }, [isSubmitting])

  useEffect(() => {
    if (!isSubmitting) return
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { clearInterval(interval); return 95 }
        return prev + 1.1875
      })
    }, 100)
    return () => clearInterval(interval)
  }, [isSubmitting])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!prompt.trim() || !essay.trim()) {
      setError('Please provide both a prompt and your essay.')
      return
    }

    setIsSubmitting(true)
    setProgress(0)

    try {
      const response = await fetch('/api/essays/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt.trim(),
          essay_content: essay.trim(),
          fingerprint: isGuest ? fingerprint : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.isGuestLimit) {
          setShowGuestLimit(true)
          setExistingEssayId(data.existingEssayId)
          setIsSubmitting(false)
          setProgress(0)
          return
        }
        if (data.invalid) {
          setError(data.error || 'Please submit a valid IELTS Task 2 essay in English.')
          setIsSubmitting(false)
          setProgress(0)
          return
        }
        if (data.quotaType === 'daily' || data.quotaType === 'total') {
          setQuotaExhaustedType(data.quotaType)
          setIsSubmitting(false)
          setProgress(0)
          return
        }
        throw new Error(data.error || 'Failed to submit essay')
      }

      if (data.success && data.essay?.id) {
        if (data.isGuest) await markGuestUsed(data.essay.id)
        setLastEssayId(data.essay.id)
        clearDraft()
        setProgress(100)
        setTimeout(() => router.push(`/score/${data.essay.id}`), 500)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your essay')
      setIsSubmitting(false)
      setProgress(0)
    }
  }

  const wordCount = essay.trim().split(/\s+/).filter(w => w.length > 0).length
  const hasReachedTarget = wordCount >= 250
  const canSubmit = !isSubmitting && prompt.trim() && essay.trim()

  const autosaveLabel = lastSavedAt
    ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Autosave on'

  // Loading overlay
  if (isSubmitting) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-lg">
          <div className="relative rounded-2xl border border-ocean-200 bg-white shadow-xl overflow-hidden">
            {/* Watermark */}
            <Sparkles className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

            <div className="relative z-10 p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-slate-800">Analyzing your essay</h3>
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-0.5">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="font-mono">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* Criteria checklist */}
              <div className="space-y-3">
                {CRITERIA.map((c, i) => {
                  const threshold = (i + 1) * 25
                  const done = progress >= threshold
                  const active = progress >= threshold - 25 && !done
                  return (
                    <div key={c.label} className={`flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ${done ? 'bg-emerald-50' : active ? 'bg-ocean-50' : 'bg-slate-50'}`}>
                      <div className={`h-2 w-2 rounded-full shrink-0 ${done ? 'bg-emerald-500' : active ? `${c.color} animate-pulse` : 'bg-slate-300'}`} />
                      <span className={`text-sm font-medium flex-1 ${done ? 'text-emerald-700' : active ? 'text-ocean-700' : 'text-slate-400'}`}>
                        {c.label}
                      </span>
                      {done
                        ? <CheckCircle className="h-4 w-4 text-emerald-500" />
                        : active
                          ? <Loader2 className="h-4 w-4 text-ocean-500 animate-spin" />
                          : <div className="h-4 w-4 rounded-full border-2 border-slate-300" />
                      }
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">This usually takes 5–10 seconds</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="max-w-7xl mx-auto px-4 py-6">

        {isGuest && !showGuestLimit && <GuestBanner />}

        {/* Page header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Score My Essay</h1>
            <p className="mt-1 text-sm sm:text-base text-slate-500">AI-powered IELTS Task 2 feedback in seconds</p>
          </div>
          {!isGuest && <QuotaDisplay />}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* ── Prompt briefing card ── */}
          <div className={`relative rounded-xl border-2 overflow-hidden transition-all duration-200 ${promptFocused ? 'border-cyan-300 bg-white shadow-sm' : 'border-ocean-200 bg-ocean-50/50'}`}>
            {/* Watermark */}
            <BookOpen className="absolute right-2 top-2 h-40 w-40 text-cyan-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(6,182,212,0.35))]" />

            {/* Header row */}
            <div className="relative z-10 flex items-center justify-between px-5 pt-3.5 pb-2">
              <span className="text-sm font-bold text-slate-800">Essay Prompt</span>
              <div className="flex items-center gap-2">
                {!prompt && (
                  <button
                    type="button"
                    onClick={() => { setPrompt(SAMPLE_PROMPT); setPromptFocused(true) }}
                    className="flex items-center gap-1.5 text-xs font-medium text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-2.5 py-1 rounded-md transition-colors"
                  >
                    <Sparkles className="h-3 w-3" />
                    Sample
                  </button>
                )}
                {prompt && !promptFocused && (
                  <button
                    type="button"
                    onClick={() => setPromptFocused(true)}
                    className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>

            {/* Content — static display or editable */}
            <div className="relative z-10 px-5 pb-4">
              {promptFocused ? (
                <>
                  <Textarea
                    id="prompt"
                    placeholder="Paste the IELTS Task 2 question here..."
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onBlur={() => setPromptFocused(false)}
                    className="min-h-[100px] border border-slate-200 focus:border-cyan-400 focus:ring-cyan-400 resize-none bg-white rounded-lg text-sm leading-relaxed"
                    disabled={isSubmitting}
                    autoFocus
                  />
                  <p className="text-xs text-slate-400 mt-2">Paste the full essay question you&apos;re responding to.</p>
                </>
              ) : prompt ? (
                <p
                  onClick={() => setPromptFocused(true)}
                  className="text-sm text-slate-700 leading-relaxed cursor-text whitespace-pre-wrap"
                >
                  {prompt}
                </p>
              ) : (
                <p
                  onClick={() => setPromptFocused(true)}
                  className="text-sm text-slate-400 italic cursor-text"
                >
                  Paste the IELTS Task 2 question here...
                </p>
              )}
            </div>
          </div>

          {/* ── Essay writing area ── */}
          <div className="relative rounded-xl border-2 border-ocean-200 bg-white shadow-sm overflow-hidden focus-within:border-blue-400 transition-colors duration-200">
            {/* Watermark */}
            <PenTool className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

            {/* Toolbar */}
            <div className="relative z-10 flex items-center gap-2 px-5 py-3 border-b border-ocean-100">
              <span className="text-sm font-bold text-slate-800 flex-1">Your Essay</span>
              {/* Live word count pill */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all duration-300 ${
                hasReachedTarget
                  ? 'bg-emerald-100 text-emerald-700'
                  : wordCount > 0
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-slate-50 text-slate-400'
              }`}>
                {hasReachedTarget && <CheckCircle className="h-3 w-3" />}
                <span>{wordCount} words</span>
              </div>
            </div>

            {/* Textarea */}
            <Textarea
              ref={essayRef}
              id="essay"
              placeholder="Write or paste your IELTS Task 2 essay here..."
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              className="relative z-10 border-0 focus:ring-0 focus-visible:ring-0 rounded-none text-base leading-relaxed resize-none bg-transparent px-5 py-4 overflow-hidden"
              disabled={isSubmitting}
            />

            {/* Footer bar */}
            <div className="relative z-10 flex items-center justify-between px-5 py-2.5 border-t border-ocean-100 bg-ocean-50/30 rounded-b-xl">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Target className="h-3.5 w-3.5" />
                <span>Target: 250–300 words</span>
                <span className="text-slate-300">·</span>
                <span>{autosaveLabel}</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Languages className="h-3.5 w-3.5" />
                <span>English only</span>
              </div>
            </div>
          </div>

          {/* ── Error ── */}
          {error && (
            <div className={`flex gap-3 p-4 rounded-xl border ${
              error.includes('valid IELTS')
                ? 'bg-amber-50 border-amber-200'
                : 'bg-red-50 border-red-200'
            }`}>
              <AlertTriangle className={`h-4 w-4 mt-0.5 shrink-0 ${error.includes('valid IELTS') ? 'text-amber-500' : 'text-red-500'}`} />
              <div>
                <p className={`text-sm font-medium ${error.includes('valid IELTS') ? 'text-amber-800' : 'text-red-700'}`}>
                  {error.includes('valid IELTS') ? 'Invalid Essay Format' : 'Submission Error'}
                </p>
                <p className={`text-sm mt-0.5 ${error.includes('valid IELTS') ? 'text-amber-700' : 'text-red-600'}`}>{error}</p>
                {error.includes('valid IELTS') && (
                  <ul className="text-xs text-amber-600 mt-1.5 space-y-0.5">
                    <li>• Essay must be in English</li>
                    <li>• Length should be 150–500 words</li>
                    <li>• Must address the given IELTS Task 2 prompt</li>
                  </ul>
                )}
              </div>
            </div>
          )}

          {/* ── Action row ── */}
          <div className="flex justify-between items-center gap-3 pb-8">
            <Button
              type="button"
              variant="ghost"
              onClick={() => { setPrompt(''); setEssay(''); setError(''); setPromptFocused(true); clearDraft() }}
              disabled={isSubmitting}
              className="text-slate-400 hover:text-slate-600 text-sm px-3"
            >
              Clear
            </Button>

            <Button
              type="submit"
              disabled={!canSubmit}
              className={`relative px-8 py-2.5 font-semibold text-white rounded-xl transition-all duration-300 ${
                hasReachedTarget
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 hover:shadow-blue-300 scale-[1.02] hover:scale-[1.04]'
                  : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
              }`}
            >
              <Sparkles className="mr-2 h-4 w-4 inline-block" />
              Score My Essay
            </Button>
          </div>
        </form>

        <SatisfactionPollModal open={showPoll} onComplete={() => setShowPoll(false)} />
        <GuestLimitModal open={showGuestLimit} onOpenChange={setShowGuestLimit} existingEssayId={existingEssayId} />
        <QuotaExhaustedModal
          open={quotaExhaustedType !== null}
          onOpenChange={(open) => { if (!open) setQuotaExhaustedType(null) }}
          type={quotaExhaustedType ?? 'daily'}
          lastEssayId={lastEssayId}
        />
      </div>
    </div>
  )
}
