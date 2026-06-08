'use client'

import { Cloud, CloudOff, Loader2 } from 'lucide-react'

type SaveStatus = 'saved' | 'saving' | 'unsaved'

interface AutoSaveIndicatorProps {
  status: SaveStatus
  lastSavedAt?: string | null
}

export default function AutoSaveIndicator({ status, lastSavedAt }: AutoSaveIndicatorProps) {
  if (status === 'saving') {
    return (
      <span className="flex items-center gap-1 text-xs text-gray-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Saving...
      </span>
    )
  }

  if (status === 'unsaved') {
    return (
      <span className="flex items-center gap-1 text-xs text-amber-500">
        <CloudOff className="h-3 w-3" />
        Unsaved changes
      </span>
    )
  }

  if (lastSavedAt) {
    const date = new Date(lastSavedAt)
    const now = new Date()
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    let timeAgo: string
    if (diffSeconds < 60) timeAgo = 'just now'
    else if (diffSeconds < 3600) timeAgo = `${Math.floor(diffSeconds / 60)}m ago`
    else timeAgo = `${Math.floor(diffSeconds / 3600)}h ago`

    return (
      <span className="flex items-center gap-1 text-xs text-green-600">
        <Cloud className="h-3 w-3" />
        Saved {timeAgo}
      </span>
    )
  }

  return null
}
