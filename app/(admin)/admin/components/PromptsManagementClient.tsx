'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Search, FileText, ChevronLeft, ChevronRight, Loader2, Pencil, Trash2, Trophy, Inbox } from 'lucide-react'
import { format } from 'date-fns'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic, QuestionType, WritingPromptWithTopic } from '@/types/prompt'
import { PROMPTS_PER_PAGE } from '@/lib/constants'
import { NewPromptDialog } from './NewPromptDialog'
import { EditPromptDialog } from './EditPromptDialog'
import { NewTopicDialog } from './NewTopicDialog'

const QUESTION_TYPE_COLORS: Record<QuestionType, string> = {
  agree_disagree: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  advantages_disadvantages: 'bg-teal-100 text-teal-800 border-teal-200',
  problem_solution: 'bg-blue-100 text-blue-800 border-blue-200',
  two_part_question: 'bg-sky-100 text-sky-800 border-sky-200',
  positive_negative: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  discussion_both_views: 'bg-violet-100 text-violet-800 border-violet-200',
}

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
    <div className="space-y-6">
      {/* Admin Contribution Ranking */}
      {adminRanking.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-teal-600" />
              <CardTitle className="text-sm font-medium text-slate-700">Contribution Ranking</CardTitle>
              <Badge variant="outline" className="text-xs bg-ocean-50 text-ocean-700 border-ocean-200 ml-auto">
                {prompts.length} total prompts
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              {adminRanking.map((admin, index) => (
                <div
                  key={admin.email}
                  className="flex items-center gap-3 py-1.5 px-2 rounded-lg hover:bg-ocean-50 transition-colors"
                >
                  <span className={`text-sm font-bold w-6 text-center ${
                    index === 0 ? 'text-amber-500' : index === 1 ? 'text-slate-400' : index === 2 ? 'text-amber-700' : 'text-slate-500'
                  }`}>
                    #{index + 1}
                  </span>
                  <span className="text-sm text-slate-700 flex-1 truncate">{admin.email}</span>
                  <span className="text-sm font-semibold text-cyan-700">{admin.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-ocean-400" />
              <Input
                type="text"
                placeholder="Search prompts..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setCurrentPage(1)
                }}
                className="pl-10 border-ocean-300 focus:ring-ocean-500"
              />
            </div>

            {/* Question Type Filter */}
            <Select
              value={filterType}
              onValueChange={(value) => {
                setFilterType(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-52 border-ocean-300">
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

            {/* Topic Filter */}
            <Select
              value={filterTopic}
              onValueChange={(value) => {
                setFilterTopic(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-full sm:w-52 border-ocean-300">
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

            {/* Review Submissions Button */}
            <Link href="/admin/prompts/review" className="shrink-0">
              <Button variant="outline" className="w-full relative border-ocean-300 text-ocean-700 hover:bg-ocean-50">
                <Inbox className="h-4 w-4 mr-2" />
                Review Submissions
                {pendingCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center px-1 animate-pulse">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* New Prompt Button */}
            <Button
              onClick={() => setShowNewPromptDialog(true)}
              className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700 shrink-0"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prompt
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ocean-600">
          {filteredPrompts.length} prompt{filteredPrompts.length !== 1 ? 's' : ''} found
          {(filterType !== 'all' || filterTopic !== 'all' || searchTerm) &&
            ` (filtered from ${prompts.length} total)`}
        </p>
      </div>

      {/* Prompts List */}
      {paginatedPrompts.length > 0 ? (
        <div className="space-y-3">
          {paginatedPrompts.map((prompt) => (
            <Card key={prompt.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                  {/* Prompt Text */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-slate-800 line-clamp-2">
                      {prompt.prompt_text}
                    </p>
                    <p className="text-xs text-slate-500 mt-2">
                      Added {format(new Date(prompt.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>

                  {/* Badges + Actions */}
                  <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <Badge
                      variant="outline"
                      className={`text-xs ${QUESTION_TYPE_COLORS[prompt.question_type]}`}
                    >
                      {QUESTION_TYPES[prompt.question_type]}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-xs bg-ocean-50 text-ocean-700 border-ocean-200"
                    >
                      {prompt.prompt_topics?.name || 'Unknown'}
                    </Badge>
                    <div className="flex gap-1 ml-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 sm:h-7 sm:w-7 text-slate-500 hover:text-cyan-700"
                        onClick={() => setEditingPrompt(prompt)}
                        title="Edit prompt"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-11 w-11 sm:h-7 sm:w-7 text-slate-500 hover:text-red-600"
                        onClick={() => handleDelete(prompt.id)}
                        disabled={deletingId === prompt.id}
                        title="Delete prompt"
                      >
                        {deletingId === prompt.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-16 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-ocean-300" />
            <p className="text-ocean-600 mb-4">
              {searchTerm || filterType !== 'all' || filterTopic !== 'all'
                ? 'No prompts found matching your filters'
                : 'No prompts added yet'}
            </p>
            {!searchTerm && filterType === 'all' && filterTopic === 'all' && (
              <Button
                onClick={() => setShowNewPromptDialog(true)}
                className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Prompt
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-sm text-ocean-600">
            Showing {(currentPage - 1) * PROMPTS_PER_PAGE + 1} to{' '}
            {Math.min(currentPage * PROMPTS_PER_PAGE, filteredPrompts.length)} of{' '}
            {filteredPrompts.length} prompts
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="border-ocean-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-ocean-700 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="border-ocean-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

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
