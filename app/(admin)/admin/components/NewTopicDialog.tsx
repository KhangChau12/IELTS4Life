'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { PromptTopic } from '@/types/prompt'

interface NewTopicDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTopicCreated: (topic: PromptTopic) => void
}

export function NewTopicDialog({ open, onOpenChange, onTopicCreated }: NewTopicDialogProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError('Topic name is required')
      return
    }
    if (name.trim().length < 2) {
      setError('Topic name must be at least 2 characters')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      if (response.status === 409) {
        setError('Topic already exists')
        return
      }

      if (!response.ok) {
        throw new Error('Failed to create topic')
      }

      const data = await response.json()
      onTopicCreated(data.topic)
      setName('')
      setError('')
      onOpenChange(false)
    } catch (err) {
      setError('Failed to create topic. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-slate-900">Add New Topic</DialogTitle>
          <DialogDescription>
            Add a new topic category for writing prompts
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="topic-name">Topic Name</Label>
            <Input
              id="topic-name"
              placeholder="e.g. Artificial Intelligence"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                setError('')
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit()
              }}
              className="border-ocean-300 focus:ring-ocean-500"
            />
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
            disabled={isSubmitting || !name.trim()}
            className="bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-700 hover:to-teal-700"
          >
            {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Add Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
