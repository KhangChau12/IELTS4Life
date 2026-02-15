'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Loader2, Search, Plus } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic, QuestionType, WritingPromptWithTopic } from '@/types/prompt'
import { format } from 'date-fns'

interface NewPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  topics: PromptTopic[]
  onPromptCreated: (prompt: WritingPromptWithTopic) => void
  onNewTopicRequest: () => void
}

export function NewPromptDialog({
  open,
  onOpenChange,
  topics,
  onPromptCreated,
  onNewTopicRequest,
}: NewPromptDialogProps) {
  const [promptText, setPromptText] = useState('')
  const [questionType, setQuestionType] = useState<QuestionType | ''>('')
  const [topicId, setTopicId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [error, setError] = useState('')
  const [similarPrompts, setSimilarPrompts] = useState<Array<{
    id: string
    prompt_text: string
    question_type: string
    created_at: string
  }> | null>(null)

  const canFetchSimilar = questionType && topicId

  const handleFetchSimilar = async () => {
    if (!questionType || !topicId) return

    setIsFetching(true)
    try {
      const params = new URLSearchParams({
        question_type: questionType,
        topic_id: topicId,
      })
      const response = await fetch(`/api/admin/prompts/similar?${params}`)
      if (response.ok) {
        const data = await response.json()
        setSimilarPrompts(data.prompts)
      }
    } catch (err) {
      console.error('Error fetching similar prompts:', err)
    } finally {
      setIsFetching(false)
    }
  }

  const handleSubmit = async () => {
    if (!promptText.trim()) {
      setError('Prompt text is required')
      return
    }
    if (!questionType) {
      setError('Question type is required')
      return
    }
    if (!topicId) {
      setError('Topic is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/prompts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: promptText.trim(),
          question_type: questionType,
          topic_id: topicId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create prompt')
      }

      const data = await response.json()
      onPromptCreated(data.prompt)
      resetForm()
      onOpenChange(false)
    } catch (err) {
      setError('Failed to create prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setPromptText('')
    setQuestionType('')
    setTopicId('')
    setError('')
    setSimilarPrompts(null)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm()
        onOpenChange(isOpen)
      }}
    >
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Add New Prompt</DialogTitle>
          <DialogDescription>
            Add a new IELTS Writing Task 2 prompt to the database
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Prompt Text */}
          <div className="space-y-2">
            <Label htmlFor="prompt-text">Prompt Text</Label>
            <Textarea
              id="prompt-text"
              placeholder="Paste the writing prompt here..."
              value={promptText}
              onChange={(e) => {
                setPromptText(e.target.value)
                setError('')
              }}
              rows={4}
              className="border-ocean-300 focus:ring-ocean-500 resize-y"
            />
          </div>

          {/* Question Type */}
          <div className="space-y-2">
            <Label>Question Type</Label>
            <Select
              value={questionType}
              onValueChange={(value) => {
                setQuestionType(value as QuestionType)
                setSimilarPrompts(null)
              }}
            >
              <SelectTrigger className="border-ocean-300">
                <SelectValue placeholder="Select question type" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(QUESTION_TYPES) as [QuestionType, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic + Add New Topic Button */}
          <div className="space-y-2">
            <Label>Topic</Label>
            <div className="flex gap-2">
              <Select
                value={topicId}
                onValueChange={(value) => {
                  setTopicId(value)
                  setSimilarPrompts(null)
                }}
              >
                <SelectTrigger className="border-ocean-300 flex-1">
                  <SelectValue placeholder="Select topic" />
                </SelectTrigger>
                <SelectContent>
                  {topics.map((topic) => (
                    <SelectItem key={topic.id} value={topic.id}>
                      {topic.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onNewTopicRequest}
                className="border-ocean-300 hover:bg-ocean-50 shrink-0"
                title="Add new topic"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Fetch Similar Button */}
          <div>
            <Button
              type="button"
              variant="outline"
              onClick={handleFetchSimilar}
              disabled={!canFetchSimilar || isFetching}
              className="border-ocean-300 hover:bg-ocean-50"
            >
              {isFetching ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Search className="h-4 w-4 mr-2" />
              )}
              Fetch Similar Prompts
            </Button>
          </div>

          {/* Similar Prompts Results */}
          {similarPrompts !== null && (
            <div className="space-y-2">
              <Label className="text-sm text-slate-600">
                Similar Prompts ({similarPrompts.length} found)
              </Label>
              {similarPrompts.length > 0 ? (
                <div className="max-h-48 overflow-y-auto space-y-2 rounded-lg border border-ocean-200 p-3 bg-ocean-50/50">
                  {similarPrompts.map((prompt) => (
                    <div
                      key={prompt.id}
                      className="p-3 bg-white rounded-lg border border-ocean-100 text-sm"
                    >
                      <p className="text-slate-800 line-clamp-3">{prompt.prompt_text}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Added {format(new Date(prompt.created_at), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
                  No similar prompts found. This is a new combination!
                </div>
              )}
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-ocean-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !promptText.trim() || !questionType || !topicId}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Prompt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
