'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { Sparkles, Loader2, Lightbulb, ArrowRight } from 'lucide-react'
import { QUESTION_TYPES } from '@/types/prompt'
import type { PromptOutlines, WritingPrompt } from '@/types/prompt'

interface OutlinesPanelProps {
  prompt: WritingPrompt & { prompt_topics?: { id: string; name: string } }
  initialOutlines: PromptOutlines | null
  isGuest: boolean
}

interface RichOutline {
  approach: string
  structure_explanation: string
  skeleton: {
    intro: string
    body1: string
    body2: string
    conclusion: string
  }
  detailed: {
    intro: { thesis_sample: string; preview: string }
    body1: { topic_sentence_sample: string; argument_1: string; argument_2: string }
    body2: { topic_sentence_sample: string; argument_1: string; argument_2: string }
    conclusion: { restatement_sample: string; final_position: string }
  }
}

function tryParseRichOutline(raw: string): RichOutline | null {
  try {
    const parsed = JSON.parse(raw)
    if (parsed && parsed.approach && parsed.skeleton && parsed.detailed) {
      return parsed as RichOutline
    }
    return null
  } catch {
    return null
  }
}

function RichOutlineView({ outline }: { outline: RichOutline }) {
  return (
    <div className="space-y-4">
      {/* Structure explanation */}
      <div className="flex gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
        <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-800 leading-relaxed">{outline.structure_explanation}</p>
      </div>

      {/* Skeleton — always visible */}
      <div className="space-y-1.5">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Quick Overview</p>
        {[
          { label: 'Intro', text: outline.skeleton.intro },
          { label: 'Body 1', text: outline.skeleton.body1 },
          { label: 'Body 2', text: outline.skeleton.body2 },
          { label: 'Conclusion', text: outline.skeleton.conclusion },
        ].map(({ label, text }) => (
          <div key={label} className="flex gap-2 items-start">
            <span className="text-xs font-medium text-ocean-600 w-20 shrink-0 pt-0.5">{label}</span>
            <ArrowRight className="h-3 w-3 text-gray-300 shrink-0 mt-1" />
            <span className="text-xs text-gray-700 leading-relaxed">{text}</span>
          </div>
        ))}
      </div>

      {/* Detailed — accordion */}
      <Accordion type="single" collapsible>
        <AccordionItem value="detail" className="border border-ocean-100 rounded-lg px-3">
          <AccordionTrigger className="text-xs font-semibold text-ocean-700 hover:no-underline py-2">
            See full outline with sample sentences
          </AccordionTrigger>
          <AccordionContent className="pb-3">
            <div className="space-y-4 pt-1">

              {/* Introduction */}
              <div>
                <p className="text-xs font-semibold text-ocean-800 mb-1.5">Introduction</p>
                <div className="space-y-1.5 pl-3 border-l-2 border-ocean-100">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Thesis sample: </span>
                    <span className="text-xs text-gray-800 italic">&ldquo;{outline.detailed.intro.thesis_sample}&rdquo;</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Preview: </span>
                    <span className="text-xs text-gray-700">{outline.detailed.intro.preview}</span>
                  </div>
                </div>
              </div>

              {/* Body Paragraphs */}
              {([
                { label: 'Body Paragraph 1', data: outline.detailed.body1 },
                { label: 'Body Paragraph 2', data: outline.detailed.body2 },
              ] as const).map(({ label, data }) => (
                <div key={label}>
                  <p className="text-xs font-semibold text-ocean-800 mb-1.5">{label}</p>
                  <div className="space-y-1.5 pl-3 border-l-2 border-ocean-100">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Topic sentence: </span>
                      <span className="text-xs text-gray-800 italic">&ldquo;{data.topic_sentence_sample}&rdquo;</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-xs text-ocean-400 mt-0.5">•</span>
                      <span className="text-xs text-gray-700">{data.argument_1}</span>
                    </div>
                    <div className="flex gap-1.5 items-start">
                      <span className="text-xs text-ocean-400 mt-0.5">•</span>
                      <span className="text-xs text-gray-700">{data.argument_2}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Conclusion */}
              <div>
                <p className="text-xs font-semibold text-ocean-800 mb-1.5">Conclusion</p>
                <div className="space-y-1.5 pl-3 border-l-2 border-ocean-100">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Restatement: </span>
                    <span className="text-xs text-gray-800 italic">&ldquo;{outline.detailed.conclusion.restatement_sample}&rdquo;</span>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Final position: </span>
                    <span className="text-xs text-gray-700">{outline.detailed.conclusion.final_position}</span>
                  </div>
                </div>
              </div>

            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

// Fallback for old plain-text format
function renderPlainText(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('**') && line.endsWith('**')) {
      return <p key={i} className="font-semibold text-ocean-800 mt-3 mb-1">{line.replace(/\*\*/g, '')}</p>
    }
    if (line.startsWith('- ')) {
      return <li key={i} className="ml-4 text-sm text-gray-700">{line.slice(2)}</li>
    }
    if (line.trim() === '') return <div key={i} className="h-1" />
    return <p key={i} className="text-sm text-gray-700">{line}</p>
  })
}

export default function OutlinesPanel({ prompt, initialOutlines, isGuest }: OutlinesPanelProps) {
  const [outlines, setOutlines] = useState<PromptOutlines | null>(initialOutlines)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setIsGenerating(true)
    setError('')
    try {
      const res = await fetch(`/api/prompts/${prompt.id}/outlines`, { method: 'POST' })
      const data = await res.json()
      if (res.ok && data.outlines) {
        setOutlines(data.outlines)
      } else {
        setError(data.error || 'Failed to generate outlines')
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const typeName = QUESTION_TYPES[prompt.question_type] || prompt.question_type

  const richOutline1 = outlines ? tryParseRichOutline(outlines.outline_1) : null
  const richOutline2 = outlines ? tryParseRichOutline(outlines.outline_2) : null

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Prompt */}
      <Card className="border-ocean-100">
        <CardHeader className="pb-2">
          <div className="flex flex-wrap gap-2 items-center">
            <Badge variant="outline" className="text-xs bg-teal-50 text-teal-800 border-teal-200">
              {typeName}
            </Badge>
            {prompt.prompt_topics?.name && (
              <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                {prompt.prompt_topics.name}
              </Badge>
            )}
          </div>
          <CardTitle className="text-base text-ocean-900">Prompt</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-700 leading-relaxed">{prompt.prompt_text}</p>
        </CardContent>
      </Card>

      {/* Outlines */}
      <div className="relative flex-1">
        {isGuest && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-lg bg-white/80 backdrop-blur-sm border border-ocean-100 p-6 text-center gap-4">
            <div className="flex flex-col items-center gap-2">
              <div className="text-3xl">🔒</div>
              <p className="text-sm text-gray-700 leading-relaxed max-w-xs">
                Sign in to view free AI outline suggestions to develop your ideas and get your essay scored.
              </p>
            </div>
            <a
              href={`/login?redirect=/write/prompts/${prompt.id}`}
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-ocean-600 hover:bg-ocean-700 text-white h-9 px-4 py-2 transition-colors"
            >
              Sign In
            </a>
          </div>
        )}
        <Card className={`border-ocean-100 h-full ${isGuest ? 'pointer-events-none select-none blur-sm' : ''}`}>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base text-ocean-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              AI Outline Suggestions
            </CardTitle>
            {!outlines && (
              <Button
                size="sm"
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="border-ocean-200 text-ocean-700 hover:bg-ocean-50"
              >
                {isGenerating ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" />Generating...</>
                ) : (
                  <><Sparkles className="h-3 w-3 mr-1" />Generate</>
                )}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <p className="text-red-500 text-sm mb-3">{error}</p>
          )}

          {!outlines && !isGenerating && (
            <p className="text-sm text-gray-400 italic">
              Click &ldquo;Generate&rdquo; to get two AI-suggested outlines with sample thesis sentences, specific arguments, and IELTS tips.
            </p>
          )}

          {isGenerating && (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating outlines...
            </div>
          )}

          {outlines && (
            <Tabs defaultValue="outline1">
              <TabsList className="mb-4">
                <TabsTrigger value="outline1">Outline 1</TabsTrigger>
                <TabsTrigger value="outline2">Outline 2</TabsTrigger>
              </TabsList>
              <TabsContent value="outline1">
                {richOutline1 ? (
                  <RichOutlineView outline={richOutline1} />
                ) : (
                  <ul className="list-none p-0 m-0 space-y-0.5">
                    {renderPlainText(outlines.outline_1)}
                  </ul>
                )}
              </TabsContent>
              <TabsContent value="outline2">
                {richOutline2 ? (
                  <RichOutlineView outline={richOutline2} />
                ) : (
                  <ul className="list-none p-0 m-0 space-y-0.5">
                    {renderPlainText(outlines.outline_2)}
                  </ul>
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
        </Card>
      </div>
    </div>
  )
}
