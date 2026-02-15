'use client'

import { useState, useEffect } from 'react'
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
import { Loader2, Plus } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptTopic, QuestionType, WritingPromptWithTopic } from '@/types/prompt'

interface EditPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt: WritingPromptWithTopic
  topics: PromptTopic[]
  onPromptUpdated: (prompt: WritingPromptWithTopic) => void
  onNewTopicRequest: () => void
}

export function EditPromptDialog({
  open,
  onOpenChange,
  prompt,
  topics,
  onPromptUpdated,
  onNewTopicRequest,
}: EditPromptDialogProps) {
  const [promptText, setPromptText] = useState(prompt.prompt_text)
  const [questionType, setQuestionType] = useState<QuestionType>(prompt.question_type)
  const [topicId, setTopicId] = useState(prompt.topic_id)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Sync state when prompt prop changes
  useEffect(() => {
    setPromptText(prompt.prompt_text)
    setQuestionType(prompt.question_type)
    setTopicId(prompt.topic_id)
    setError('')
  }, [prompt])

  const handleSubmit = async () => {
    if (!promptText.trim()) {
      setError('Prompt text is required')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/admin/prompts/${prompt.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt_text: promptText.trim(),
          question_type: questionType,
          topic_id: topicId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update prompt')
      }

      const data = await response.json()
      onPromptUpdated(data.prompt)
      onOpenChange(false)
    } catch (err) {
      setError('Failed to update prompt. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Edit Prompt</DialogTitle>
          <DialogDescription>
            Modify the writing prompt details
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Prompt Text */}
          <div className="space-y-2">
            <Label htmlFor="edit-prompt-text">Prompt Text</Label>
            <Textarea
              id="edit-prompt-text"
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
              onValueChange={(value) => setQuestionType(value as QuestionType)}
            >
              <SelectTrigger className="border-ocean-300">
                <SelectValue />
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

          {/* Topic */}
          <div className="space-y-2">
            <Label>Topic</Label>
            <div className="flex gap-2">
              <Select
                value={topicId}
                onValueChange={(value) => setTopicId(value)}
              >
                <SelectTrigger className="border-ocean-300 flex-1">
                  <SelectValue />
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
            disabled={isSubmitting || !promptText.trim()}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
