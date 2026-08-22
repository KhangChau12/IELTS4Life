'use client'

import { useState, useEffect } from 'react'
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
  all: 'bg-cyan-50 text-cyan-700',
  student: 'bg-blue-50 text-blue-700',
  pro: 'bg-emerald-50 text-emerald-700',
  free: 'bg-amber-50 text-amber-700',
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
    <div className="space-y-4">
      {/* Create Form */}
      <div className="flex flex-col gap-3.5 rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-extrabold text-slate-900">Send New Notification</h3>

        <div>
          <label htmlFor="notif-title" className="mb-1.5 block text-xs font-semibold text-slate-500">Title</label>
          <input
            id="notif-title"
            placeholder="e.g. New feature available!"
            value={title}
            onChange={e => { setTitle(e.target.value); setError('') }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-ocean-300 focus:outline-none focus:ring-1 focus:ring-ocean-300"
          />
        </div>
        <div>
          <label htmlFor="notif-content" className="mb-1.5 block text-xs font-semibold text-slate-500">Message</label>
          <Textarea
            id="notif-content"
            placeholder="Write your announcement here..."
            value={content}
            onChange={e => { setContent(e.target.value); setError('') }}
            rows={4}
            className="resize-y border-slate-200 text-[13px] focus-visible:ring-ocean-300"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-500">Target Audience</label>
          <Select value={audience} onValueChange={v => setAudience(v as NotificationAudience)}>
            <SelectTrigger className="h-9 w-full border-slate-200 text-[12.5px] sm:w-72">
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
        <div className="flex sm:justify-end">
          <button
            onClick={handleCreate}
            disabled={isSubmitting || !title.trim() || !content.trim() || !audience}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-ocean-900 px-4 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-ocean-800 disabled:opacity-50 sm:w-auto"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            Send Notification
          </button>
        </div>
      </div>

      {/* Existing Notifications */}
      <div className="flex flex-col gap-2">
        <p className="px-1 text-xs text-slate-400">
          {notifications.length} notification{notifications.length !== 1 ? 's' : ''} sent
        </p>
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-ocean-100 bg-white py-16 text-center shadow-sm">
            <Bell className="mx-auto mb-4 h-12 w-12 text-slate-200" />
            <p className="text-sm text-slate-500">No notifications sent yet</p>
          </div>
        ) : (
          notifications.map(notification => (
            <div
              key={notification.id}
              className="flex items-start justify-between gap-3 rounded-xl border border-ocean-100 bg-white p-3.5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-bold text-slate-900">{notification.title}</p>
                <p className="mt-1 line-clamp-2 text-[12.5px] text-slate-500">{notification.content}</p>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <span className={`rounded-[5px] px-2 py-1 text-[10.5px] font-bold ${AUDIENCE_COLORS[notification.target_audience]}`}>
                    {NOTIFICATION_AUDIENCE_LABELS[notification.target_audience]}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {format(new Date(notification.created_at), 'MMM d, yyyy · HH:mm')}
                  </span>
                </div>
              </div>
              <button
                onClick={() => handleDelete(notification.id)}
                disabled={deletingId === notification.id}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50 sm:h-7 sm:w-7"
              >
                {deletingId === notification.id ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
