'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  agree_disagree: 'bg-cyan-200 text-cyan-800 border-cyan-300',
  advantages_disadvantages: 'bg-teal-200 text-teal-800 border-teal-300',
  problem_solution: 'bg-blue-200 text-blue-800 border-blue-300',
  two_part_question: 'bg-sky-200 text-sky-800 border-sky-300',
  positive_negative: 'bg-emerald-200 text-emerald-800 border-emerald-300',
  discussion_both_views: 'bg-violet-200 text-violet-800 border-violet-300',
  mixed_hybrid: 'bg-slate-200 text-slate-700 border-slate-300',
}

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
      <Card className="border-ocean-200 shadow-lg">
        <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-ocean-800">All caught up!</p>
            <p className="text-ocean-500 text-sm mt-1">
              {reviewedCount > 0 ? `You reviewed ${reviewedCount} prompt${reviewedCount > 1 ? 's' : ''} this session.` : 'No pending prompts to review.'}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const qTypeLabel = QUESTION_TYPES[currentPrompt?.question_type ?? 'agree_disagree']
  const qTypeColor = QUESTION_TYPE_COLORS[currentPrompt?.question_type ?? 'agree_disagree']
  const editQTypeColor = QUESTION_TYPE_COLORS[(editQuestionType as QuestionType) ?? currentPrompt?.question_type] ?? qTypeColor

  return (
    <div className="space-y-4">
      {/* Queue status bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-ocean-600">
            <Inbox className="h-4 w-4" />
            <span className="font-semibold text-ocean-800">{remaining}</span> remaining
          </div>
          {reviewedCount > 0 && (
            <div className="flex items-center gap-1.5 text-sm text-ocean-500">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {reviewedCount} reviewed this session
            </div>
          )}
          {currentPrompt?.submitted_count > 1 && (
            <div className="flex items-center gap-1.5 text-xs text-ocean-500 bg-ocean-100 rounded-full px-2 py-0.5">
              <Users className="h-3 w-3" />
              {currentPrompt.submitted_count} users submitted this
            </div>
          )}
        </div>
        <p className="text-xs text-ocean-400">
          Press <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">A</kbd> approve,{' '}
          <kbd className="font-mono bg-slate-100 border border-slate-200 rounded px-1.5 py-0.5">R</kbd> reject
        </p>
      </div>

      {/* 2-column layout */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-4 transition-all duration-300 ${actionResult === 'approved' ? 'ring-2 ring-green-400 rounded-xl' : actionResult === 'rejected' ? 'ring-2 ring-red-300 rounded-xl' : ''}`}>

        {/* LEFT — edit panel */}
        <Card className="border-ocean-200 shadow-lg">
          <CardContent className="p-5 space-y-4">
            <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wider">Pending Prompt</p>

            {/* AI classification badges */}
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className={`${qTypeColor} font-medium text-xs`}>{qTypeLabel}</Badge>
              <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 font-medium text-xs">
                {currentPrompt?.prompt_topics?.name ?? 'Unknown topic'}
              </Badge>
            </div>

            {/* Editable prompt text */}
            <div className="space-y-1">
              <label className="text-xs text-ocean-600 font-medium">Prompt text</label>
              <Textarea
                value={editPromptText}
                onChange={e => setEditPromptText(e.target.value)}
                className="text-sm text-ocean-800 leading-relaxed resize-none border-ocean-200 focus-visible:ring-ocean-400 min-h-[120px]"
                rows={5}
              />
            </div>

            {/* Edit classification */}
            <div className="rounded-xl border border-dashed border-ocean-300 bg-ocean-50/50 p-3.5 space-y-3">
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wide">Classification</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-ocean-600 font-medium">Topic</label>
                  <Select value={editTopicId} onValueChange={setEditTopicId}>
                    <SelectTrigger className="h-8 text-sm border-ocean-200">
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
                  <label className="text-xs text-ocean-600 font-medium">Question Type</label>
                  <Select value={editQuestionType} onValueChange={v => setEditQuestionType(v as QuestionType)}>
                    <SelectTrigger className="h-8 text-sm border-ocean-200">
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
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  <span className="text-xs text-ocean-400">After edit:</span>
                  <Badge variant="outline" className={`${editQTypeColor} font-medium text-xs`}>
                    {QUESTION_TYPES[(editQuestionType as QuestionType)] ?? editQuestionType}
                  </Badge>
                  <Badge variant="outline" className="bg-orange-100 text-orange-800 border-orange-300 font-medium text-xs">
                    {topics.find(t => t.id === editTopicId)?.name ?? editTopicId}
                  </Badge>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                className="flex-1 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                onClick={handleReject}
                disabled={isActing || !!actionResult}
              >
                {isActing && actionResult === null ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Reject <span className="ml-1.5 text-xs opacity-60">(R)</span>
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                onClick={handleApprove}
                disabled={isActing || !!actionResult}
              >
                {isActing && actionResult === null ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Approve <span className="ml-1.5 text-xs opacity-60">(A)</span>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT — similar approved prompts (same topic AND same type) */}
        <Card className="border-ocean-200 shadow-lg">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-ocean-500 uppercase tracking-wider">
                Approved — same topic &amp; type
              </p>
              {isSimilarLoading && <Loader2 className="h-3.5 w-3.5 animate-spin text-ocean-400" />}
            </div>

            {isSimilarLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className="rounded-lg border border-ocean-100 bg-ocean-50/40 p-3 animate-pulse">
                    <div className="h-3 bg-ocean-100 rounded w-3/4 mb-2" />
                    <div className="h-3 bg-ocean-100 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : similarPrompts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
                <CheckCircle2 className="h-8 w-8 text-green-400" />
                <p className="text-sm text-ocean-500 font-medium">No duplicates found</p>
                <p className="text-xs text-ocean-400">No approved prompts share both this topic and question type.</p>
              </div>
            ) : (
              <div className="space-y-2 overflow-y-auto max-h-[480px] pr-0.5">
                {similarPrompts.map(p => (
                  <div key={p.id} className="rounded-lg border border-ocean-200 bg-ocean-50/40 p-3">
                    <p className="text-sm text-ocean-800 leading-relaxed">{p.prompt_text}</p>
                    <div className="flex gap-1.5 mt-2 flex-wrap">
                      <Badge variant="outline" className={`text-xs font-medium ${QUESTION_TYPE_COLORS[p.question_type]}`}>
                        {QUESTION_TYPES[p.question_type]}
                      </Badge>
                      <Badge variant="outline" className="text-xs bg-orange-100 text-orange-800 border-orange-300 font-medium">
                        {p.prompt_topics?.name}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
