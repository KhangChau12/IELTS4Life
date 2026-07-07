'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Bell, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import type { NotificationWithReadStatus } from '@/types/notification'

interface NotificationsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onMarkedRead?: () => void
}

export function NotificationsModal({ open, onOpenChange, onMarkedRead }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<NotificationWithReadStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)

  // Reset to page 1 and mark all as read each time the modal opens
  useEffect(() => {
    if (!open) return
    setCurrentPage(1)
    fetch('/api/notifications/mark-read', { method: 'POST' }).then(res => {
      if (res.ok) onMarkedRead?.()
    })
  }, [open, onMarkedRead])

  useEffect(() => {
    if (!open) return
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ page: String(currentPage) })
        const res = await fetch(`/api/notifications?${params}`)
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setTotalPages(data.totalPages || 1)
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [open, currentPage])

  const displayed = showUnreadOnly
    ? notifications.filter(n => !n.is_read)
    : notifications

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg sm:max-w-xl md:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent">
            Notifications
          </DialogTitle>
          <p className="text-ocean-600 text-sm">
            Updates and announcements from IELTS4Life
          </p>
        </DialogHeader>

        <div className="flex gap-2">
          <Button
            variant={!showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(false)}
            className={!showUnreadOnly ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-ocean-300'}
          >
            All
          </Button>
          <Button
            variant={showUnreadOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowUnreadOnly(true)}
            className={showUnreadOnly ? 'bg-cyan-600 hover:bg-cyan-700' : 'border-ocean-300'}
          >
            Unread
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        ) : displayed.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 mx-auto mb-4 text-ocean-300" />
              <p className="text-ocean-600">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
            {displayed.map(notification => (
              <Card
                key={notification.id}
                className={`transition-shadow hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-l-cyan-500' : ''
                }`}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="text-base text-slate-900">
                      {notification.title}
                    </CardTitle>
                    {!notification.is_read && (
                      <span className="flex-shrink-0 mt-1 flex h-2 w-2 rounded-full bg-red-500" />
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    {format(new Date(notification.created_at), 'MMM dd, yyyy · HH:mm')}
                  </p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap">
                    {notification.content}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-2">
            <p className="text-sm text-ocean-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="border-ocean-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="border-ocean-300"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
