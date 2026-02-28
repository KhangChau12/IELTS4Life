export type NotificationAudience = 'all' | 'student' | 'pro' | 'free'

export const NOTIFICATION_AUDIENCE_LABELS: Record<NotificationAudience, string> = {
  all: 'All Users',
  student: 'Students Only (role=student)',
  pro: 'Pro Users (@ptnk.edu.vn)',
  free: 'Free Users (non-ptnk)',
}

export interface Notification {
  id: string
  title: string
  content: string
  target_audience: NotificationAudience
  created_by: string
  created_at: string
}

export interface NotificationWithReadStatus extends Notification {
  is_read: boolean
}
