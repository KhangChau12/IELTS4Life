'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, FileText, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, Inbox } from 'lucide-react'
import { format } from 'date-fns'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic, QuestionType, WritingPromptWithTopic } from '@/types/prompt'
import { PROMPTS_PER_PAGE } from '@/lib/constants'
import { NewPromptDialog } from './NewPromptDialog'
import { EditPromptDialog } from './EditPromptDialog'
import { NewTopicDialog } from './NewTopicDialog'

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  agree_disagree: 'bg-cyan-50 text-cyan-700',
  advantages_disadvantages: 'bg-teal-50 text-teal-700',
  problem_solution: 'bg-blue-50 text-blue-700',
  two_part_question: 'bg-sky-50 text-sky-700',
  positive_negative: 'bg-emerald-50 text-emerald-700',
  discussion_both_views: 'bg-violet-50 text-violet-700',
}
const TOPIC_TAG_COLOR = 'bg-slate-100 text-slate-600'

export function PromptsManagementClient() {
  const [prompts, setPrompts] = useState<WritingPromptWithTopic[]>([])
  const [topics, setTopics] = useState<PromptTopic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState<string>('all')
  const [filterTopic, setFilterTopic] = useState<string>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showNewPromptDialog, setShowNewPromptDialog] = useState(false)
  const [showNewTopicDialog, setShowNewTopicDialog] = useState(false)
  const [editingPrompt, setEditingPrompt] = useState<WritingPromptWithTopic | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [pendingCount, setPendingCount] = useState(0)

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [promptsRes, topicsRes, pendingRes] = await Promise.all([
          fetch('/api/admin/prompts'),
          fetch('/api/admin/topics'),
          fetch('/api/admin/prompts/pending'),
        ])

        if (promptsRes.ok) {
          const promptsData = await promptsRes.json()
          setPrompts(promptsData.prompts || [])
        }
        if (topicsRes.ok) {
          const topicsData = await topicsRes.json()
          setTopics(topicsData.topics || [])
        }
        if (pendingRes.ok) {
          const pendingData = await pendingRes.json()
          setPendingCount(pendingData.totalPending || 0)
        }
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and search
  const filteredPrompts = useMemo(() => {
    return prompts.filter((prompt) => {
      const matchesType = filterType === 'all' || prompt.question_type === filterType
      const matchesTopic = filterTopic === 'all' || prompt.topic_id === filterTopic
      const matchesSearch =
        !searchTerm ||
        prompt.prompt_text.toLowerCase().includes(searchTerm.toLowerCase())
      return matchesType && matchesTopic && matchesSearch
    })
  }, [prompts, filterType, filterTopic, searchTerm])

  // Pagination
  const totalPages = Math.ceil(filteredPrompts.length / PROMPTS_PER_PAGE)
  const paginatedPrompts = filteredPrompts.slice(
    (currentPage - 1) * PROMPTS_PER_PAGE,
    currentPage * PROMPTS_PER_PAGE
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePromptCreated = (prompt: WritingPromptWithTopic) => {
    setPrompts((prev) => [prompt, ...prev])
  }

  const handleTopicCreated = (topic: PromptTopic) => {
    setTopics((prev) => [...prev, topic].sort((a, b) => a.name.localeCompare(b.name)))
  }

  const handlePromptUpdated = (updated: WritingPromptWithTopic) => {
    setPrompts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditingPrompt(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return

    setDeletingId(id)
    try {
      const response = await fetch(`/api/admin/prompts/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setPrompts((prev) => prev.filter((p) => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting prompt:', error)
    } finally {
      setDeletingId(null)
    }
  }

  // Ranking: group by created_by, count, sort desc (only manual / admin-created prompts)
  const adminRanking = useMemo(() => {
    const map = new Map<string, { email: string; count: number }>()
    for (const p of prompts) {
      if (!p.created_by) continue
      const key = p.created_by
      const existing = map.get(key)
      if (existing) {
        existing.count++
      } else {
        map.set(key, { email: p.profiles?.email || 'Unknown', count: 1 })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count)
  }, [prompts])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Top bar — title context + actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          {prompts.length} prompt{prompts.length !== 1 ? 's' : ''} across {topics.length} topic{topics.length !== 1 ? 's' : ''}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Link
            href="/admin/prompts/review"
            className="relative flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-[12.5px] font-bold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 sm:justify-start sm:py-2"
          >
            <Inbox className="h-3.5 w-3.5" />
            Review submissions
            {pendingCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10.5px] font-bold text-white">
                {pendingCount > 99 ? '99+' : pendingCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setShowNewPromptDialog(true)}
            className="flex items-center justify-center gap-2 rounded-lg bg-ocean-900 px-4 py-2.5 text-[12.5px] font-bold text-white shadow-sm transition-colors hover:bg-ocean-800 sm:justify-start sm:py-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New prompt
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-2.5 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search prompts…"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-[12.5px] text-slate-700 placeholder:text-slate-400 focus:border-ocean-300 focus:outline-none focus:ring-1 focus:ring-ocean-300"
          />
        </div>

        <Select
          value={filterType}
          onValueChange={(value) => {
            setFilterType(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-full border-slate-200 text-[12.5px] sm:w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {(Object.entries(QUESTION_TYPES) as [QuestionType, string][]).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filterTopic}
          onValueChange={(value) => {
            setFilterTopic(value)
            setCurrentPage(1)
          }}
        >
          <SelectTrigger className="h-9 w-full border-slate-200 text-[12.5px] sm:w-48">
            <SelectValue placeholder="All Topics" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Topics</SelectItem>
            {topics.map((topic) => (
              <SelectItem key={topic.id} value={topic.id}>
                {topic.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Two-column: contribution ranking + prompt list */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_3fr] lg:items-start">
        {adminRanking.length > 0 && (
          <div className="rounded-xl border border-ocean-100 bg-white p-4 shadow-sm">
            <h3 className="text-[13px] font-extrabold text-slate-900">Top Contributors</h3>
            <p className="mb-3.5 text-[11.5px] text-slate-400">Manually added prompts</p>
            <div className="flex flex-col gap-2.5">
              {adminRanking.slice(0, 8).map((admin, index) => (
                <div key={admin.email} className="flex items-center gap-2.5">
                  <span
                    className={`w-4 text-xs font-extrabold ${
                      index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-400'
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1 truncate text-xs font-semibold text-slate-600">{admin.email}</span>
                  <span className="text-xs font-extrabold text-cyan-700 tabular-nums">{admin.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={`flex flex-col gap-2 ${adminRanking.length === 0 ? 'lg:col-span-2' : ''}`}>
          {/* Prompts List */}
          {paginatedPrompts.length > 0 ? (
            <>
              {paginatedPrompts.map((prompt) => (
                <div
                  key={prompt.id}
                  className="flex flex-col gap-3 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md sm:flex-row sm:items-start"
                >
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-[13px] text-slate-800">{prompt.prompt_text}</p>
                    <p className="mt-1.5 text-[11px] text-slate-400">
                      Added {format(new Date(prompt.created_at), 'MMM d, yyyy')}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap items-center gap-1.5">
                    <span className={`rounded-[5px] px-2 py-1 text-[10.5px] font-bold ${QUESTION_TYPE_COLORS[prompt.question_type]}`}>
                      {QUESTION_TYPES[prompt.question_type]}
                    </span>
                    <span className={`rounded-[5px] px-2 py-1 text-[10.5px] font-bold ${TOPIC_TAG_COLOR}`}>
                      {prompt.prompt_topics?.name || 'Unknown'}
                    </span>
                    <div className="ml-1 flex gap-0.5">
                      <button
                        onClick={() => setEditingPrompt(prompt)}
                        title="Edit prompt"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-50 hover:text-ocean-600 sm:h-7 sm:w-7"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(prompt.id)}
                        disabled={deletingId === prompt.id}
                        title="Delete prompt"
                        className="flex h-9 w-9 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-7 sm:w-7"
                      >
                        {deletingId === prompt.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <div className="rounded-xl border border-ocean-100 bg-white py-16 text-center shadow-sm">
              <FileText className="mx-auto mb-4 h-12 w-12 text-slate-200" />
              <p className="mb-4 text-sm text-slate-500">
                {searchTerm || filterType !== 'all' || filterTopic !== 'all'
                  ? 'No prompts found matching your filters'
                  : 'No prompts added yet'}
              </p>
              {!searchTerm && filterType === 'all' && filterTopic === 'all' && (
                <button
                  onClick={() => setShowNewPromptDialog(true)}
                  className="inline-flex items-center gap-2 rounded-lg bg-ocean-900 px-4 py-2 text-[12.5px] font-bold text-white"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Your First Prompt
                </button>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-1">
              <p className="text-xs text-slate-400">
                Showing {(currentPage - 1) * PROMPTS_PER_PAGE + 1}–{Math.min(currentPage * PROMPTS_PER_PAGE, filteredPrompts.length)} of{' '}
                {filteredPrompts.length} prompts
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 sm:h-7 sm:w-7"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-2 text-xs font-medium text-slate-500">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40 sm:h-7 sm:w-7"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Dialogs */}
      <NewPromptDialog
        open={showNewPromptDialog}
        onOpenChange={setShowNewPromptDialog}
        topics={topics}
        onPromptCreated={handlePromptCreated}
        onNewTopicRequest={() => setShowNewTopicDialog(true)}
      />

      {editingPrompt && (
        <EditPromptDialog
          open={!!editingPrompt}
          onOpenChange={(open) => { if (!open) setEditingPrompt(null) }}
          prompt={editingPrompt}
          topics={topics}
          onPromptUpdated={handlePromptUpdated}
          onNewTopicRequest={() => setShowNewTopicDialog(true)}
        />
      )}

      <NewTopicDialog
        open={showNewTopicDialog}
        onOpenChange={setShowNewTopicDialog}
        onTopicCreated={handleTopicCreated}
      />
    </div>
  )
}
