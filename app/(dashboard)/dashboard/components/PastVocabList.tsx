'use client'

import Link from 'next/link'
import { BookOpen, CalendarDays, ExternalLink, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { VocabularyItem } from '@/types/vocabulary'

interface PastVocabEntry {
  essayId: string
  prompt: string
  createdAt: string
  vocabulary: VocabularyItem[]
}

interface PastVocabListProps {
  entries: PastVocabEntry[]
}

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(dateString))
}

function truncateText(text: string, maxLength: number) {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trim()}...`
}

export function PastVocabList({ entries }: PastVocabListProps) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-ocean-200 bg-gradient-to-br from-ocean-50 to-cyan-50 p-8 text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white shadow-sm">
          <BookOpen className="h-6 w-6 text-cyan-600" />
        </div>
        <h3 className="text-lg font-semibold text-ocean-900">No vocabulary history yet</h3>
        <p className="mt-2 text-sm text-ocean-600">
          Once you generate vocabulary from essays, the most recent items will appear here.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entries.map((entry) => {
        const previewItems = entry.vocabulary.slice(0, 3)

        return (
          <Card key={entry.essayId} className="overflow-hidden border-ocean-100 shadow-sm transition-shadow hover:shadow-md">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-medium text-ocean-500">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {formatDate(entry.createdAt)}
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-ocean-900">
                    {truncateText(entry.prompt, 90)}
                  </h3>
                </div>
                <Badge className="whitespace-nowrap border-cyan-200 bg-cyan-100 text-cyan-800">
                  {entry.vocabulary.length} word{entry.vocabulary.length > 1 ? 's' : ''}
                </Badge>
              </div>

              <div className="space-y-3">
                {previewItems.map((item) => (
                  <div
                    key={`${entry.essayId}-${item.id}`}
                    className="rounded-xl border border-ocean-100 bg-gradient-to-r from-ocean-50 to-white p-4"
                  >
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${item.vocab_type === 'paraphrase' ? 'border-ocean-200 text-ocean-700' : 'border-cyan-200 text-cyan-700'}`}
                      >
                        {item.vocab_type}
                      </Badge>
                      {item.original_word && (
                        <span className="text-sm text-ocean-500 line-through decoration-ocean-300">
                          {item.original_word}
                        </span>
                      )}
                      <Sparkles className="h-3.5 w-3.5 text-cyan-500" />
                      <span className="text-sm font-semibold text-ocean-900">{item.suggested_word}</span>
                    </div>
                    <p className="text-sm leading-6 text-ocean-700">{item.definition}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between gap-3 pt-1">
                <p className="text-xs text-ocean-500">Showing the first 3 items from this essay</p>
                <Link
                  href={`/history/${entry.essayId}/vocabulary`}
                  className="inline-flex items-center gap-1.5 text-sm font-semibold text-cyan-700 transition-colors hover:text-cyan-800"
                >
                  Open essay vocab
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}