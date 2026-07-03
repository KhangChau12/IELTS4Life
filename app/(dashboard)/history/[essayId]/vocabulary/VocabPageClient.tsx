'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { BookOpen, BrainCircuit, ArrowLeft, Sparkles, FileText } from 'lucide-react'
import { BouncingDots } from '@/components/common/BouncingDots'
import type { VocabularyItem } from '@/types/vocabulary'
import type { Essay } from '@/types/essay'

interface VocabularyPageProps {
  params: { essayId: string }
}

// Build HTML string with <mark data-word="..."> for each original_word occurrence
function buildHighlightedHtml(essayContent: string, vocabItems: VocabularyItem[]): string {
  let html = essayContent
  const pairs = vocabItems
    .filter(v => v.original_word)
    .map(v => ({ word: v.original_word!, suggested: v.suggested_word }))
    .sort((a, b) => b.word.length - a.word.length)

  pairs.forEach(({ word, suggested }) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const safeWord = word.toLowerCase()
    const safeTitle = suggested.replace(/"/g, '&quot;')
    // Only replace occurrences that are NOT inside an HTML tag (i.e. not between < and >)
    const regex = new RegExp(`(?![^<]*>)\\b(${escaped})\\b`, 'gi')
    html = html.replace(
      regex,
      `<mark class="bg-yellow-200 px-0.5 rounded font-medium cursor-pointer transition-colors" data-word="${safeWord}" title="→ ${safeTitle}">$1</mark>`
    )
  })
  return html
}

function VocabCard({
  item,
  highlighted,
}: {
  item: VocabularyItem
  highlighted: boolean
}) {
  return (
    <div
      className={`rounded-xl border bg-white p-4 shadow-sm transition-all duration-200 border-l-4 border-l-cyan-500 ${
        highlighted
          ? 'border-cyan-400 shadow-lg ring-2 ring-cyan-300 bg-cyan-50 scale-[1.02]'
          : 'border-slate-200 hover:shadow-md hover:border-cyan-200'
      }`}
    >
      <p className="text-base font-bold text-ocean-800 mb-1.5 leading-tight">{item.suggested_word}</p>
      <p className="text-sm text-slate-600 leading-relaxed mb-3">{item.definition}</p>
      {item.original_word && (
        <span className="inline-block text-xs bg-ocean-50 text-ocean-600 border border-ocean-100 px-2 py-0.5 rounded-full">
          replaces: <span className="font-medium">{item.original_word}</span>
        </span>
      )}
    </div>
  )
}

type GenerateStep = 'idle' | 'paraphrase' | 'topic' | 'done'

export default function VocabularyDetailPage({ params }: VocabularyPageProps) {
  const router = useRouter()
  const [essay, setEssay] = useState<Essay | null>(null)
  const [paraphraseVocab, setParaphraseVocab] = useState<VocabularyItem[]>([])
  const [topicVocab, setTopicVocab] = useState<VocabularyItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [generateStep, setGenerateStep] = useState<GenerateStep>('idle')
  const [generateError, setGenerateError] = useState('')

  // Word hovered in the essay panel — lowercased original_word
  const [hoveredWord, setHoveredWord] = useState<string | null>(null)
  const essayContainerRef = useRef<HTMLDivElement>(null)

  // Highlight the hovered <mark> element itself when hoveredWord changes
  useEffect(() => {
    const container = essayContainerRef.current
    if (!container) return
    container.querySelectorAll<HTMLElement>('mark[data-word]').forEach((el) => {
      if (hoveredWord && el.dataset.word === hoveredWord) {
        el.style.backgroundColor = '#fbbf24' // amber-400 — noticeably darker than yellow-200
      } else {
        el.style.backgroundColor = ''
      }
    })
  }, [hoveredWord])

  const fetchData = useCallback(async () => {
    try {
      const response = await fetch(`/api/vocabulary/${params.essayId}`)
      const data = await response.json()
      if (!response.ok) { router.push('/history'); return }
      setEssay(data.essay)
      setParaphraseVocab(data.vocabulary?.filter((v: VocabularyItem) => v.vocab_type === 'paraphrase') || [])
      setTopicVocab(data.vocabulary?.filter((v: VocabularyItem) => v.vocab_type === 'topic') || [])
    } catch {
      router.push('/history')
    } finally {
      setIsLoading(false)
    }
  }, [params.essayId, router])

  useEffect(() => { fetchData() }, [fetchData])

  async function handleGenerate() {
    setGenerateError('')

    setGenerateStep('paraphrase')
    try {
      const res = await fetch('/api/vocabulary/paraphrase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: params.essayId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.vocabulary) setParaphraseVocab(data.vocabulary)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate')
      setGenerateStep('idle')
      return
    }

    setGenerateStep('topic')
    try {
      const res = await fetch('/api/vocabulary/topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ essay_id: params.essayId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      if (data.vocabulary) setTopicVocab(data.vocabulary)
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Failed to generate')
      setGenerateStep('idle')
      return
    }

    setGenerateStep('done')
  }

  if (isLoading || !essay) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-center h-96">
          <div className="text-ocean-600">Loading...</div>
        </div>
      </div>
    )
  }

  const hasParaphraseVocab = paraphraseVocab.length > 0
  const hasTopicVocab = topicVocab.length > 0
  const hasAnyVocab = hasParaphraseVocab || hasTopicVocab
  const isGenerating = generateStep === 'paraphrase' || generateStep === 'topic'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6">
      {/* Page header */}
      <div className="mb-4 animate-fadeInUp">
        <Link href="/history">
          <Button variant="ghost" className="mb-3 text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to History
          </Button>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent mb-1">
          Vocabulary
        </h1>
        <p className="text-sm text-ocean-500 line-clamp-2">
          {essay.prompt.length > 150 ? essay.prompt.substring(0, 150) + '...' : essay.prompt}
        </p>
      </div>

      {/* Empty state */}
      {!hasAnyVocab && generateStep !== 'done' && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-ocean-50 via-white to-cyan-50 border border-ocean-100 shadow-sm min-h-[300px] flex flex-col items-center justify-center p-8">
          <BookOpen
            className="absolute text-ocean-200 opacity-25 pointer-events-none select-none"
            style={{ width: 260, height: 260, right: -30, bottom: -30, transform: 'rotate(-15deg)' }}
          />
          <div className="relative z-10 text-center max-w-sm w-full">
            {isGenerating ? (
              <div className="flex flex-col items-center gap-3">
                <BouncingDots size="md" color="bg-ocean-500" />
                <p className="text-ocean-800 font-semibold text-sm sm:text-base">
                  {generateStep === 'paraphrase' ? 'Generating paraphrase vocabulary...' : 'Finding topic vocabulary...'}
                </p>
                <div className="flex items-center gap-4 text-sm">
                  <span className={generateStep === 'topic' ? 'text-ocean-400 line-through' : 'text-ocean-700 font-medium'}>
                    Paraphrase{generateStep === 'topic' ? ' ✓' : ''}
                  </span>
                  <span className="text-ocean-300">→</span>
                  <span className={generateStep === 'topic' ? 'text-ocean-700 font-medium' : 'text-ocean-400'}>
                    Topic
                  </span>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-ocean-800 mb-2">No Vocabulary Yet</h3>
                <p className="text-ocean-500 text-sm mb-5">
                  Generate AI-powered C1–C2 vocabulary — paraphrase suggestions and topic-specific words.
                </p>
                {generateError && <p className="text-red-600 text-sm mb-4">{generateError}</p>}
                <Button
                  onClick={handleGenerate}
                  className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white shadow-md px-6"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Vocabulary
                </Button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Vocab content */}
      {hasAnyVocab && (
        <Tabs defaultValue={hasParaphraseVocab ? 'paraphrase' : 'topic'} className="w-full">
          {/* CTA strip */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
            <Link href={`/history/${params.essayId}/vocabulary/flashcards`}>
              <Button className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white shadow-sm text-sm h-9">
                <BookOpen className="mr-2 h-4 w-4" />
                Flashcards
              </Button>
            </Link>
            <Link href={`/history/${params.essayId}/vocabulary/quiz`}>
              <Button variant="outline" className="border-ocean-300 text-ocean-700 hover:bg-ocean-50 text-sm h-9">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Quiz
              </Button>
            </Link>
            <span className="text-xs text-ocean-400">
              {paraphraseVocab.length + topicVocab.length} words total
            </span>
          </div>

          {/* Sticky underline tab bar */}
          <div className="sticky top-20 z-30 -mx-4 px-4 bg-ocean-50/95 backdrop-blur-sm border-b border-ocean-100">
            <TabsList className="w-full h-auto bg-transparent p-0 rounded-none border-0 gap-0">
              <TabsTrigger
                value="paraphrase"
                disabled={!hasParaphraseVocab}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-slate-500 transition-colors hover:text-ocean-700 hover:bg-ocean-100 data-[state=active]:border-ocean-600 data-[state=active]:text-ocean-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <BookOpen className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Paraphrase</span>
                <span className="text-xs bg-ocean-100 text-ocean-600 px-1.5 py-0.5 rounded-full font-normal hidden sm:inline">
                  {paraphraseVocab.length}
                </span>
              </TabsTrigger>
              <TabsTrigger
                value="topic"
                disabled={!hasTopicVocab}
                className="flex-1 flex items-center justify-center gap-1.5 sm:gap-2 rounded-none border-b-2 border-transparent px-3 sm:px-4 py-3 text-xs sm:text-sm font-medium text-slate-500 transition-colors hover:text-ocean-700 hover:bg-ocean-100 data-[state=active]:border-ocean-600 data-[state=active]:text-ocean-700 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
              >
                <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
                <span>Topic</span>
                <span className="text-xs bg-ocean-100 text-ocean-600 px-1.5 py-0.5 rounded-full font-normal hidden sm:inline">
                  {topicVocab.length}
                </span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Paraphrase tab — 2-column on desktop */}
          <TabsContent value="paraphrase" className="mt-4 sm:mt-6">
            <div className="flex flex-col lg:flex-row gap-4 lg:gap-5">

              {/* Left — essay with highlights (wider: ~half) */}
              <div className="lg:w-[48%] lg:sticky lg:top-36 lg:self-start">
                <Card className="border-ocean-200 shadow-sm overflow-hidden">
                  <CardHeader className="py-3 px-4 bg-gradient-to-r from-ocean-50 to-cyan-50 border-b border-ocean-100">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-ocean-600 flex-shrink-0" />
                      <CardTitle className="text-sm text-ocean-800">Your Essay</CardTitle>
                    </div>
                    <p className="text-xs text-ocean-500 mt-1">
                      <span className="hidden sm:inline">Hover</span>
                      <span className="sm:hidden">Tap</span>
                      {' '}
                      <mark className="bg-yellow-200 px-0.5 rounded font-medium not-italic">highlighted</mark>
                      {' '}words to see the matching card
                    </p>
                  </CardHeader>
                  <CardContent className="p-0">
                    {/* Event delegation: mouseover reads data-word from <mark> elements; tap/click provides touch-device parity */}
                    <div
                      ref={essayContainerRef}
                      className="max-h-[50vh] lg:max-h-[65vh] overflow-y-auto p-4"
                      onMouseOver={(e) => {
                        const mark = (e.target as HTMLElement).closest('mark')
                        const word = mark?.dataset.word ?? null
                        setHoveredWord(word)
                      }}
                      onMouseLeave={() => setHoveredWord(null)}
                      onClick={(e) => {
                        const mark = (e.target as HTMLElement).closest('mark')
                        const word = mark?.dataset.word ?? null
                        setHoveredWord((prev) => (word && prev === word ? null : word))
                      }}
                    >
                      <div
                        className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap"
                        dangerouslySetInnerHTML={{ __html: buildHighlightedHtml(essay.essay_content, paraphraseVocab) }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right — vocab cards (narrower: ~half) */}
              <div className="lg:w-[52%]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paraphraseVocab.map((item) => (
                    <VocabCard
                      key={item.id}
                      item={item}
                      highlighted={
                        hoveredWord !== null &&
                        item.original_word?.toLowerCase() === hoveredWord
                      }
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Topic tab */}
          <TabsContent value="topic" className="mt-4 sm:mt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {topicVocab.map((item) => (
                <VocabCard key={item.id} item={item} highlighted={false} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}

      {/* Learning tips */}
      <div className="mt-8 p-4 bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100 rounded-xl">
        <h3 className="font-semibold text-ocean-800 mb-2 text-sm">Learning Tips</h3>
        <ul className="text-xs text-ocean-600 space-y-1">
          <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span><span>Use Flashcards for spaced repetition — review daily for best retention</span></li>
          <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span><span>Take the Quiz to test how many words you can recall from their definitions</span></li>
          <li className="flex items-start gap-2"><span className="text-cyan-500 mt-0.5">•</span><span>Try using new words in your next essay to build writing fluency</span></li>
        </ul>
      </div>
    </div>
  )
}
