'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

  // Reset to page 1 each time the modal opens
  useEffect(() => {
    if (!open) return
    setCurrentPage(1)
  }, [open])

  useEffect(() => {
    if (!open) return
    const fetchNotifications = async () => {
      setIsLoading(true)
      try {
        const params = new URLSearchParams({ page: String(currentPage) })
        if (currentPage === 1) params.set('mark_read', 'true')
        const res = await fetch(`/api/notifications?${params}`)
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
          setTotalPages(data.totalPages || 1)
          if (currentPage === 1) onMarkedRead?.()
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchNotifications()
  }, [open, currentPage, onMarkedRead])

  const displayed = showUnreadOnly
    ? notifications.filter(n => !n.is_read)
    : notifications
  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 p-0 sm:max-w-xl md:max-w-2xl">
        <DialogHeader className="space-y-0 px-6 pb-0 pt-5">
          <DialogTitle className="text-lg font-extrabold text-ocean-900">
            Notifications
          </DialogTitle>
          <p className="mb-3.5 text-[12.5px] text-slate-500">
            Updates and announcements from IELTS4Life
          </p>

          <div className="-mx-6 flex gap-4 border-b border-slate-100 px-6">
            <button
              onClick={() => setShowUnreadOnly(false)}
              className={`border-b-2 pb-2.5 text-[13px] font-bold transition-colors ${
                !showUnreadOnly ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setShowUnreadOnly(true)}
              className={`flex items-center gap-1.5 border-b-2 pb-2.5 text-[13px] font-bold transition-colors ${
                showUnreadOnly ? 'border-cyan-600 text-cyan-700' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Unread
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-1.5 py-px text-[10.5px] font-extrabold text-white">
                  {unreadCount}
                </span>
              )}
            </button>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-600" />
          </div>
        ) : displayed.length === 0 ? (
          <div className="py-14 text-center">
            <Bell className="mx-auto mb-3.5 h-10 w-10 text-slate-200" />
            <p className="text-sm text-slate-500">
              {showUnreadOnly ? 'No unread notifications' : 'No notifications yet'}
            </p>
          </div>
        ) : (
          <div className={`max-h-[50vh] overflow-y-auto ${totalPages <= 1 ? 'pb-2' : ''}`}>
            {displayed.map(notification => (
              <div
                key={notification.id}
                className={`flex gap-3 border-b border-slate-50 px-6 py-4 last:border-b-0 ${
                  !notification.is_read ? 'bg-cyan-50/40' : ''
                }`}
              >
                <span className={`mt-1.5 h-[7px] w-[7px] flex-shrink-0 rounded-full ${!notification.is_read ? 'bg-cyan-600' : ''}`} />
                <div className="min-w-0 flex-1">
                  <span className={`block text-sm font-extrabold ${notification.is_read ? 'text-slate-700' : 'text-slate-900'}`}>
                    {notification.title}
                  </span>
                  <p className={`mb-1.5 mt-1 whitespace-pre-wrap text-[12.5px] leading-relaxed ${notification.is_read ? 'text-slate-400' : 'text-slate-600'}`}>
                    {notification.content}
                  </p>
                  <span className={`text-[11px] ${notification.is_read ? 'text-slate-300' : 'text-slate-400'}`}>
                    {format(new Date(notification.created_at), 'MMM d, yyyy · HH:mm')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
            <span className="text-xs text-slate-400">
              Page {currentPage} of {totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
