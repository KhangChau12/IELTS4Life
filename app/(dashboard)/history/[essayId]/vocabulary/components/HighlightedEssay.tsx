'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText } from 'lucide-react'
import type { VocabularyItem } from '@/types/vocabulary'

interface HighlightedEssayProps {
  essayContent: string
  vocabularyItems: VocabularyItem[]
}

export function HighlightedEssay({ essayContent, vocabularyItems }: HighlightedEssayProps) {
  const highlightText = () => {
    let highlightedContent = essayContent
    const wordsToHighlight: { word: string; suggested: string }[] = []

    vocabularyItems.forEach(item => {
      if (item.original_word) {
        wordsToHighlight.push({
          word: item.original_word,
          suggested: item.suggested_word
        })
      }
    })

    wordsToHighlight.sort((a, b) => b.word.length - a.word.length)

    wordsToHighlight.forEach(({ word, suggested }) => {
      const regex = new RegExp(`\\b(${word})\\b`, 'gi')
      highlightedContent = highlightedContent.replace(
        regex,
        `<mark class="bg-yellow-200 px-1 rounded font-medium cursor-help" title="Suggestion: ${suggested}">$1</mark>`
      )
    })

    return highlightedContent
  }

  return (
    <Card className="border-ocean-200 shadow-lg mb-6">
      <CardHeader className="bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-200">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-ocean-600" />
          <CardTitle className="text-ocean-800">Your Original Essay</CardTitle>
        </div>
        <p className="text-sm text-ocean-600 mt-2">
          Highlighted words show where vocabulary improvements can be made. Hover over them to see suggestions.
        </p>
      </CardHeader>
      <CardContent className="pt-6">
        <div
          className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: highlightText() }}
        />
      </CardContent>
    </Card>
  )
}
