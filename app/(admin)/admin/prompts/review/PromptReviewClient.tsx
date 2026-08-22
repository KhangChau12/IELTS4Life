'use client'

import { useState, useEffect, useCallback } from 'react'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { CheckCircle2, XCircle, Loader2, Inbox, Users } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { QuestionType, PromptTopic } from '@/types/prompt'

interface PendingPrompt {
  id: string
  prompt_text: string
  question_type: QuestionType
  topic_id: string
  submitted_count: number
  created_at: string
  prompt_topics: Pick<PromptTopic, 'id' | 'name'>
}

interface SimilarApprovedPrompt {
  id: string
  prompt_text: string
  question_type: QuestionType
  prompt_topics: Pick<PromptTopic, 'id' | 'name'>
}

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  agree_disagree: 'bg-cyan-50 text-cyan-700',
  advantages_disadvantages: 'bg-teal-50 text-teal-700',
  problem_solution: 'bg-blue-50 text-blue-700',
  two_part_question: 'bg-sky-50 text-sky-700',
  positive_negative: 'bg-emerald-50 text-emerald-700',
  discussion_both_views: 'bg-violet-50 text-violet-700',
}
const TOPIC_TAG_COLOR = 'bg-amber-50 text-amber-700'

export function PromptReviewClient() {
  const [prompts, setPrompts] = useState<PendingPrompt[]>([])
  const [topics, setTopics] = useState<PromptTopic[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isActing, setIsActing] = useState(false)
  const [editTopicId, setEditTopicId] = useState<string>('')
  const [editQuestionType, setEditQuestionType] = useState<QuestionType | ''>('')
  const [editPromptText, setEditPromptText] = useState<string>('')
  const [similarPrompts, setSimilarPrompts] = useState<SimilarApprovedPrompt[]>([])
  const [isSimilarLoading, setIsSimilarLoading] = useState(false)
  const [actionResult, setActionResult] = useState<'approved' | 'rejected' | null>(null)
  const [reviewedCount, setReviewedCount] = useState(0)

  const currentPrompt = prompts[currentIndex] ?? null

  // Fetch approved prompts that match BOTH same topic AND same question type
  const fetchSimilarForPrompt = useCallback(async (prompt: PendingPrompt) => {
    setIsSimilarLoading(true)
    setSimilarPrompts([])
    try {
      const res = await fetch(
        `/api/admin/prompts?topic_id=${prompt.topic_id}&question_type=${prompt.question_type}&status=approved`
      )
      const data = res.ok ? await res.json() : { prompts: [] }
      const filtered = (data.prompts ?? []).filter((p: SimilarApprovedPrompt) => p.id !== prompt.id)
      setSimilarPrompts(filtered)
    } catch {
      // silent
    } finally {
      setIsSimilarLoading(false)
    }
  }, [])

  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      try {
        const [pendingRes, topicsRes] = await Promise.all([
          fetch('/api/admin/prompts/pending'),
          fetch('/api/admin/topics'),
        ])
        if (pendingRes.ok) {
          const data = await pendingRes.json()
          setPrompts(data.prompts ?? [])
        }
        if (topicsRes.ok) {
          const data = await topicsRes.json()
          setTopics(data.topics ?? [])
        }
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  // When current prompt changes, reset edit fields and fetch similar
  useEffect(() => {
    if (!currentPrompt) return
    setEditTopicId(currentPrompt.topic_id)
    setEditQuestionType(currentPrompt.question_type)
    setEditPromptText(currentPrompt.prompt_text)
    setActionResult(null)
    fetchSimilarForPrompt(currentPrompt)
  }, [currentPrompt, fetchSimilarForPrompt])

  // Re-fetch similar when admin changes topic or question type
  useEffect(() => {
    if (!currentPrompt || !editTopicId || !editQuestionType) return
    if (editTopicId === currentPrompt.topic_id && editQuestionType === currentPrompt.question_type) return
    const timer = setTimeout(() => {
      fetchSimilarForPrompt({ ...currentPrompt, topic_id: editTopicId, question_type: editQuestionType as QuestionType })
    }, 400)
    return () => clearTimeout(timer)
  }, [editTopicId, editQuestionType]) // eslint-disable-line react-hooks/exhaustive-deps

  const removeCurrentAndAdvance = useCallback((id: string) => {
    setReviewedCount(c => c + 1)
    setPrompts(prev => {
      const next = prev.filter(p => p.id !== id)
      // clamp index so it never exceeds the new list length
      setCurrentIndex(i => Math.min(i, Math.max(0, next.length - 1)))
      return next
    })
  }, [])

  const handleApprove = async () => {
    if (!currentPrompt || isActing) return
    setIsActing(true)
    try {
      const res = await fetch(`/api/admin/prompts/${currentPrompt.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic_id: editTopicId || currentPrompt.topic_id,
          question_type: editQuestionType || currentPrompt.question_type,
          prompt_text: editPromptText.trim() || currentPrompt.prompt_text,
        }),
      })
      if (res.ok) {
        setActionResult('approved')
        setTimeout(() => removeCurrentAndAdvance(currentPrompt.id), 800)
      }
    } finally {
      setIsActing(false)
    }
  }

  const handleReject = async () => {
    if (!currentPrompt || isActing) return
    setIsActing(true)
    try {
      const res = await fetch(`/api/admin/prompts/${currentPrompt.id}/reject`, {
        method: 'POST',
      })
      if (res.ok) {
        setActionResult('rejected')
        setTimeout(() => removeCurrentAndAdvance(currentPrompt.id), 800)
      }
    } finally {
      setIsActing(false)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return
      if (e.key === 'a' || e.key === 'A') handleApprove()
      if (e.key === 'r' || e.key === 'R') handleReject()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPrompt, isActing, actionResult, editTopicId, editQuestionType, editPromptText])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-ocean-500" />
      </div>
    )
  }

  const remaining = prompts.length

  if (remaining <= 0) {
    return (
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <div className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <p className="text-[15px] font-extrabold text-slate-900">All caught up!</p>
            <p className="mt-1 text-sm text-slate-400">
              {reviewedCount > 0 ? `You reviewed ${reviewedCount} prompt${reviewedCount > 1 ? 's' : ''} this session.` : 'No pending prompts to review.'}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const qTypeLabel = QUESTION_TYPES[currentPrompt?.question_type ?? 'agree_disagree']
  const qTypeColor = QUESTION_TYPE_COLORS[currentPrompt?.question_type ?? 'agree_disagree']
  const editQTypeColor = QUESTION_TYPE_COLORS[(editQuestionType as QuestionType) ?? currentPrompt?.question_type] ?? qTypeColor

  return (
    <div className="space-y-4">
      {/* Queue status bar */}
      <div className="flex flex-col gap-2 rounded-xl border border-ocean-100 bg-white px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-[13px] text-slate-700">
            <span className="font-extrabold text-slate-900">{remaining}</span> remaining
          </span>
          {reviewedCount > 0 && (
            <span className="text-xs text-slate-400">{reviewedCount} reviewed this session</span>
          )}
          {currentPrompt?.submitted_count > 1 && (
            <span className="flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1 text-[11px] font-bold text-violet-700">
              <Users className="h-3 w-3" />
              {currentPrompt.submitted_count} users submitted this
            </span>
          )}
        </div>
        <p className="hidden text-[11.5px] text-slate-400 sm:block">
          Press <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-slate-500">A</span> approve,{' '}
          <span className="rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 font-mono text-slate-500">R</span> reject
        </p>
      </div>

      {/* 2-column layout */}
      <div className={`grid grid-cols-1 gap-4 transition-all duration-300 lg:grid-cols-2 ${actionResult === 'approved' ? 'ring-2 ring-emerald-400 rounded-2xl' : actionResult === 'rejected' ? 'ring-2 ring-red-300 rounded-2xl' : ''}`}>

        {/* LEFT — edit panel */}
        <div className="flex flex-col gap-4 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Pending Prompt</span>

          {/* AI classification badges */}
          <div className="flex flex-wrap gap-1.5">
            <span className={`rounded-[5px] px-2 py-1 text-[11px] font-bold ${qTypeColor}`}>{qTypeLabel}</span>
            <span className={`rounded-[5px] px-2 py-1 text-[11px] font-bold ${TOPIC_TAG_COLOR}`}>
              {currentPrompt?.prompt_topics?.name ?? 'Unknown topic'}
            </span>
          </div>

          {/* Editable prompt text */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-500">Prompt text</label>
            <Textarea
              value={editPromptText}
              onChange={e => setEditPromptText(e.target.value)}
              className="min-h-[120px] resize-none border-slate-200 text-sm leading-relaxed text-slate-800 focus-visible:ring-ocean-400"
              rows={5}
            />
          </div>

          {/* Edit classification */}
          <div className="space-y-3 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3.5">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Classification</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Topic</label>
                <Select value={editTopicId} onValueChange={setEditTopicId}>
                  <SelectTrigger className="h-8 border-slate-200 bg-white text-sm">
                    <SelectValue placeholder="Select topic" />
                  </SelectTrigger>
                  <SelectContent>
                    {topics.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">Question Type</label>
                <Select value={editQuestionType} onValueChange={v => setEditQuestionType(v as QuestionType)}>
                  <SelectTrigger className="h-8 border-slate-200 bg-white text-sm">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(QUESTION_TYPES).map(([key, label]) => (
                      <SelectItem key={key} value={key}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {/* Live preview of edited classification */}
            {(editTopicId !== currentPrompt?.topic_id || editQuestionType !== currentPrompt?.question_type) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                <span className="text-xs text-slate-400">After edit:</span>
                <span className={`rounded-[5px] px-2 py-1 text-[11px] font-bold ${editQTypeColor}`}>
                  {QUESTION_TYPES[(editQuestionType as QuestionType)] ?? editQuestionType}
                </span>
                <span className={`rounded-[5px] px-2 py-1 text-[11px] font-bold ${TOPIC_TAG_COLOR}`}>
                  {topics.find(t => t.id === editTopicId)?.name ?? editTopicId}
                </span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-1">
            <button
              onClick={handleReject}
              disabled={isActing || !!actionResult}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-red-200 py-3 text-[13px] font-bold text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50 sm:py-2.5"
            >
              {isActing && actionResult === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <XCircle className="h-4 w-4" />
              )}
              Reject <span className="hidden text-xs font-semibold opacity-60 sm:inline">(R)</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={isActing || !!actionResult}
              className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 py-3 text-[13px] font-bold text-white transition-colors hover:bg-emerald-700 disabled:opacity-50 sm:py-2.5"
            >
              {isActing && actionResult === null ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Approve <span className="hidden text-xs font-semibold opacity-70 sm:inline">(A)</span>
            </button>
          </div>
        </div>

        {/* RIGHT — similar approved prompts (same topic AND same type) */}
        <div className="flex flex-col gap-3 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Approved — same topic &amp; type
            </span>
            {isSimilarLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-slate-300" />}
          </div>

          {isSimilarLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <div className="mb-2 h-3 w-3/4 rounded bg-slate-200" />
                  <div className="h-3 w-1/2 rounded bg-slate-200" />
                </div>
              ))}
            </div>
          ) : similarPrompts.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
              <CheckCircle2 className="h-7 w-7 text-emerald-300" />
              <p className="text-sm font-semibold text-slate-500">No duplicates found</p>
              <p className="text-xs text-slate-400">No approved prompts share both this topic and question type.</p>
            </div>
          ) : (
            <div className="max-h-[480px] space-y-2 overflow-y-auto pr-0.5">
              {similarPrompts.map(p => (
                <div key={p.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                  <p className="text-[12.5px] leading-relaxed text-slate-700">{p.prompt_text}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <span className={`rounded-[5px] px-2 py-0.5 text-[10.5px] font-bold ${QUESTION_TYPE_COLORS[p.question_type]}`}>
                      {QUESTION_TYPES[p.question_type]}
                    </span>
                    <span className={`rounded-[5px] px-2 py-0.5 text-[10.5px] font-bold ${TOPIC_TAG_COLOR}`}>
                      {p.prompt_topics?.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
