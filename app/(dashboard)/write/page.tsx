'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Loader2, CheckCircle, Clock, FileText, PenTool, Sparkles } from 'lucide-react'
import { QuotaDisplay } from '@/components/QuotaDisplay'
import { createClient } from '@/lib/supabase/client'
import { checkGuestUsage, markGuestUsed } from '@/lib/guest-tracking'
import { getDeviceFingerprint } from '@/lib/fingerprint'
import { GuestLimitModal } from '@/components/guest/GuestLimitModal'
import { QuotaExhaustedModal } from '@/components/guest/QuotaExhaustedModal'
import { GuestBanner } from '@/components/guest/GuestBanner'
import { SatisfactionPollModal } from '@/app/(dashboard)/write/[essayId]/components/SatisfactionPollModal'

const SAMPLE_PROMPT =
  'Some people believe that schools should focus on academic subjects such as mathematics and science, while others think practical skills like cooking and financial management are more important. Discuss both views and give your opinion.'

export default function WritePage() {
  const router = useRouter()
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

  // Check if user is guest and if they've used their trial
  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setDraftKey(`write-draft:user:${user.id}`)

        const { data: profile } = await supabase
          .from('profiles')
          .select('total_essays_count, satisfaction_rated_at')
          .eq('id', user.id)
          .single()

        if (profile && (profile.total_essays_count ?? 0) >= 1 && !profile.satisfaction_rated_at) {
          setShowPoll(true)
        }
        return
      }

      setIsGuest(true)

      // Get fingerprint
      const fp = await getDeviceFingerprint()
      setFingerprint(fp)
      setDraftKey(`write-draft:guest:${fp}`)

      // Check if guest already used trial
      const guestCheck = await checkGuestUsage()
      if (guestCheck.hasUsed) {
        setShowGuestLimit(true)
        setExistingEssayId(guestCheck.essayId)
      }
    }

    checkAuth()
  }, [])

  useEffect(() => {
    if (!draftKey || hasHydratedDraft) {
      return
    }

    try {
      const savedDraft = window.localStorage.getItem(draftKey)

      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as {
          prompt?: string
          essay?: string
          updatedAt?: string
        }

        if (parsed.prompt) setPrompt(parsed.prompt)
        if (parsed.essay) setEssay(parsed.essay)
        if (parsed.updatedAt) setLastSavedAt(parsed.updatedAt)
      }
    } catch {
      // Ignore invalid local drafts and continue with a clean form.
    } finally {
      setHasHydratedDraft(true)
    }
  }, [draftKey, hasHydratedDraft])

  useEffect(() => {
    if (!draftKey || !hasHydratedDraft || isSubmitting) {
      return
    }

    const timeout = window.setTimeout(() => {
      try {
        const updatedAt = new Date().toISOString()
        window.localStorage.setItem(
          draftKey,
          JSON.stringify({
            prompt,
            essay,
            updatedAt,
          })
        )
        setLastSavedAt(updatedAt)
      } catch {
        // Autosave should never block writing.
      }
    }, 500)

    return () => window.clearTimeout(timeout)
  }, [draftKey, essay, hasHydratedDraft, isSubmitting, prompt])

  const clearDraft = () => {
    if (draftKey) {
      window.localStorage.removeItem(draftKey)
    }
    setLastSavedAt(null)
  }

  // Timer for elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isSubmitting) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      setElapsedTime(0)
    }
    return () => clearInterval(interval)
  }, [isSubmitting])

  // Simulate progress - 4 seconds total (Groq is fast!)
  useEffect(() => {
    if (!isSubmitting) {
      return
    }

    const interval = setInterval(() => {
      setProgress(prev => {
        // Stop at 95%
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        // 4 seconds = 4000ms, update every 100ms = 40 updates
        // Each update = ~2.375% to reach 95% in 4s
        return prev + 2.375
      })
    }, 100)

    return () => clearInterval(interval)
  }, [isSubmitting]) // Only depend on isSubmitting, not progress

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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          essay_content: essay.trim(),
          fingerprint: isGuest ? fingerprint : undefined,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a guest limit error
        if (data.isGuestLimit) {
          setShowGuestLimit(true)
          setExistingEssayId(data.existingEssayId)
          setIsSubmitting(false)
          setProgress(0)
          return
        }

        // Check if it's an invalid essay error
        if (data.invalid) {
          setError(data.error || 'Please submit a valid IELTS Task 2 essay in English.')
          setIsSubmitting(false)
          setProgress(0)
          return
        }

        // Check if it's a quota exhaustion error — show modal instead of inline error
        if (data.quotaType === 'daily' || data.quotaType === 'total') {
          setQuotaExhaustedType(data.quotaType)
          setIsSubmitting(false)
          setProgress(0)
          return
        }

        throw new Error(data.error || 'Failed to submit essay')
      }

      if (data.success && data.essay?.id) {
        // Mark guest as used if applicable
        if (data.isGuest) {
          await markGuestUsed(data.essay.id)
        }

        setLastEssayId(data.essay.id)
        clearDraft()
        setProgress(100)
        setTimeout(() => {
          router.push(`/write/${data.essay.id}`)
        }, 500)
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while submitting your essay')
      setIsSubmitting(false)
      setProgress(0)
    }
  }

  const wordCount = essay.trim().split(/\s+/).filter(word => word.length > 0).length
  const hasReachedTarget = wordCount >= 250
  const autosaveLabel = lastSavedAt
    ? `Saved locally at ${new Date(lastSavedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
    : 'Autosave is on for this draft.'

  return (
    <div className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4">
        {/* Guest Banner */}
        {isGuest && !showGuestLimit && <GuestBanner />}

        {/* Header Section */}
        <div className="mb-6 space-y-2">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-ocean-900 mb-1">
                Submit Your Essay
              </h1>
              <p className="text-sm md:text-base text-ocean-600">Enter your IELTS Task 2 prompt and response for AI scoring.</p>
            </div>
            {!isGuest && <QuotaDisplay />}
          </div>
        </div>

        {/* Main Essay Card */}
        <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
          {/* Watermark icon */}
          <PenTool className="absolute right-2 top-2 h-52 w-52 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
          <CardHeader className="border-b border-ocean-100 p-4 md:p-6 relative z-10">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-ocean-600" />
              <CardTitle className="text-lg text-ocean-900">Essay Submission</CardTitle>
            </div>
            <CardDescription className="text-ocean-600 mt-1">Enter your prompt and essay below for AI scoring.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 md:pt-8 p-4 md:p-6 relative z-10">
            <form onSubmit={handleSubmit} className="space-y-6 md:space-y-8">
              {/* Essay Prompt Field */}
              <div className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-5 w-5 text-cyan-600" />
                    <Label htmlFor="prompt" className="text-cyan-700 font-semibold text-base">
                      Essay Prompt
                    </Label>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setPrompt(SAMPLE_PROMPT)}
                    disabled={isSubmitting}
                    className="self-start sm:self-auto text-cyan-700 hover:text-cyan-800 hover:bg-cyan-50 px-2"
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Use sample prompt
                  </Button>
                </div>
                <Textarea
                  id="prompt"
                  placeholder="Enter the IELTS Task 2 question or prompt..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-[120px] border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 resize-none bg-white rounded-lg text-base"
                  disabled={isSubmitting}
                />
                <p className="text-sm text-ocean-500">
                  Paste the complete essay question you are responding to.
                </p>
              </div>

              {/* Your Essay Field */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <PenTool className="h-5 w-5 text-cyan-600" />
                  <Label htmlFor="essay" className="text-cyan-700 font-semibold text-base">
                    Your Essay
                  </Label>
                </div>
                <Textarea
                  id="essay"
                  placeholder="Write or paste your IELTS Task 2 essay here..."
                  value={essay}
                  onChange={(e) => setEssay(e.target.value)}
                  className="min-h-[400px] border-2 border-cyan-200 focus:border-cyan-500 focus:ring-cyan-500 font-mono text-sm resize-none bg-white rounded-lg"
                  disabled={isSubmitting}
                />
                <div className="flex justify-between items-center">
                  <p className="text-sm text-ocean-600">
                    Aim for 250–300 words for IELTS Task 2
                  </p>
                  <div className="flex items-center gap-3">
                    <p className={`text-base font-bold ${hasReachedTarget ? 'text-emerald-600' : 'text-slate-700'}`}>
                      {wordCount} words
                    </p>
                    {hasReachedTarget && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm">
                        <CheckCircle className="h-3 w-3" />
                        Target reached
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-xs text-ocean-400">{autosaveLabel}</p>
              </div>

              {/* Error Display — only for non-quota errors (invalid essay, network, etc.) */}
              {error && (
                <div className={`p-5 border-2 rounded-xl ${
                  error.includes('valid IELTS')
                    ? 'bg-amber-50 border-amber-200'
                    : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-start gap-4">
                    {error.includes('valid IELTS') && (
                      <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                      </svg>
                    )}
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        error.includes('valid IELTS') ? 'text-amber-900' : 'text-red-800'
                      }`}>
                        {error.includes('valid IELTS') ? 'Invalid Essay Format' : 'Error'}
                      </p>
                      <p className={`text-sm mt-1 ${
                        error.includes('valid IELTS') ? 'text-amber-700' : 'text-red-700'
                      }`}>
                        {error}
                      </p>
                      {error.includes('valid IELTS') && (
                        <ul className="text-xs text-amber-600 mt-2 space-y-1">
                          <li>• Essay must be in English</li>
                          <li>• Length should be 150-500 words</li>
                          <li>• Must address the given IELTS Task 2 prompt</li>
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4 md:pt-6 border-t border-ocean-100">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPrompt('')
                    setEssay('')
                    setError('')
                    clearDraft()
                  }}
                  disabled={isSubmitting}
                  className="px-6 border-ocean-200 text-ocean-700 hover:bg-ocean-50"
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !prompt.trim() || !essay.trim()}
                  className="bg-ocean-600 hover:bg-ocean-700 text-white px-8 font-semibold"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing Essay...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Score My Essay
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Loading Progress - Show below form */}
        {isSubmitting && (
          <Card className="border-ocean-200 shadow-lg mt-6 overflow-hidden relative bg-gradient-to-br from-ocean-50/50 to-cyan-50/30">
            {/* Slow-spin watermark */}
            <Loader2 className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-10 pointer-events-none select-none animate-spin [animation-duration:8s]" />
            <CardContent className="pt-6 relative z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Loader2 className="h-8 w-8 text-ocean-600 animate-spin" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-ocean-900">Analyzing Your Essay</h3>
                      <p className="text-sm text-ocean-600">AI is examining your writing...</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-ocean-600">
                    <Clock className="h-4 w-4 text-ocean-500" />
                    <span className="font-mono font-medium">{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Progress value={progress} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-ocean-600">Processing essay content...</span>
                    <span className="font-semibold text-ocean-700">{Math.round(progress)}%</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                  <div className={`flex items-center gap-2 text-sm ${progress >= 25 ? 'text-emerald-600' : 'text-ocean-300'}`}>
                    {progress >= 25 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    <span>Task Response</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${progress >= 50 ? 'text-emerald-600' : 'text-ocean-300'}`}>
                    {progress >= 50 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    <span>Coherence</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${progress >= 75 ? 'text-emerald-600' : 'text-ocean-300'}`}>
                    {progress >= 75 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    <span>Vocabulary</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${progress >= 95 ? 'text-emerald-600' : 'text-ocean-300'}`}>
                    {progress >= 95 ? <CheckCircle className="h-4 w-4" /> : <div className="h-4 w-4 rounded-full border-2 border-current" />}
                    <span>Grammar</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <p className="mt-4 text-xs text-ocean-400 text-center">
          Essays are evaluated on Task Response, Coherence &amp; Cohesion, Lexical Resource, and Grammatical Accuracy.
        </p>

        {/* Satisfaction Poll */}
        <SatisfactionPollModal open={showPoll} onComplete={() => setShowPoll(false)} />

        {/* Guest Limit Modal */}
        <GuestLimitModal
          open={showGuestLimit}
          onOpenChange={setShowGuestLimit}
          existingEssayId={existingEssayId}
        />

        {/* Quota Exhausted Modal */}
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
