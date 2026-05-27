'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Bell, Plus, Trash2, Loader2, Send } from 'lucide-react'
import { format } from 'date-fns'
import {
  NOTIFICATION_AUDIENCE_LABELS,
  type NotificationAudience,
  type Notification,
} from '@/types/notification'

const AUDIENCE_COLORS: Record<NotificationAudience, string> = {
  all: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  student: 'bg-blue-100 text-blue-800 border-blue-200',
  pro: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  free: 'bg-orange-100 text-orange-800 border-orange-200',
}

export function NotificationsManagementClient() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [audience, setAudience] = useState<NotificationAudience | ''>('')

  useEffect(() => {
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const res = await fetch('/api/admin/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [])

  const handleCreate = async () => {
    if (!title.trim() || !content.trim() || !audience) {
      setError('All fields are required')
      return
    }
    setIsSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/admin/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          target_audience: audience,
        }),
      })
      if (!res.ok) throw new Error('Failed to create')
      const data = await res.json()
      setNotifications(prev => [data.notification, ...prev])
      setTitle('')
      setContent('')
      setAudience('')
    } catch {
      setError('Failed to send notification. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this notification? Users who have not read it yet will no longer see it.')) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/admin/notifications/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n.id !== id))
      }
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-ocean-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
        <Bell className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
        <CardHeader className="border-b border-ocean-100 relative z-10">
          <CardTitle className="text-lg flex items-center gap-2 text-ocean-900">
            <Send className="h-5 w-5 text-ocean-600" />
            Send New Notification
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 relative z-10">
          <div className="space-y-2">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g. New feature available!"
              value={title}
              onChange={e => { setTitle(e.target.value); setError('') }}
              className="border-ocean-300 focus:ring-ocean-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notif-content">Message</Label>
            <Textarea
              id="notif-content"
              placeholder="Write your announcement here..."
              value={content}
              onChange={e => { setContent(e.target.value); setError('') }}
              rows={4}
              className="border-ocean-300 focus:ring-ocean-500 resize-y"
            />
          </div>
          <div className="space-y-2">
            <Label>Target Audience</Label>
            <Select value={audience} onValueChange={v => setAudience(v as NotificationAudience)}>
              <SelectTrigger className="border-ocean-300 w-full sm:w-72">
                <SelectValue placeholder="Select audience" />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(NOTIFICATION_AUDIENCE_LABELS) as [NotificationAudience, string][]).map(([key, label]) => (
                  <SelectItem key={key} value={key}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button
            onClick={handleCreate}
            disabled={isSubmitting || !title.trim() || !content.trim() || !audience}
            className="bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-700 hover:to-violet-700"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Plus className="h-4 w-4 mr-2" />
            )}
            Send Notification
          </Button>
        </CardContent>
      </Card>

      {/* Existing Notifications */}
      <div className="space-y-3">
        <p className="text-sm text-ocean-600">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''} sent
        </p>
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Bell className="h-16 w-16 mx-auto mb-4 text-ocean-300" />
              <p className="text-ocean-600">No notifications sent yet</p>
            </CardContent>
          </Card>
        ) : (
          notifications.map(notification => (
            <Card key={notification.id} className="hover:shadow-lg transition-shadow border-ocean-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ocean-900 text-sm">{notification.title}</p>
                    <p className="text-sm text-ocean-600 mt-1 line-clamp-2">{notification.content}</p>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge
                        variant="outline"
                        className={`text-xs ${AUDIENCE_COLORS[notification.target_audience]}`}
                      >
                        {NOTIFICATION_AUDIENCE_LABELS[notification.target_audience]}
                      </Badge>
                      <span className="text-xs text-ocean-400">
                        {format(new Date(notification.created_at), 'MMM dd, yyyy · HH:mm')}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-400 hover:text-red-600 shrink-0"
                    onClick={() => handleDelete(notification.id)}
                    disabled={deletingId === notification.id}
                  >
                    {deletingId === notification.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="h-3.5 w-3.5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
