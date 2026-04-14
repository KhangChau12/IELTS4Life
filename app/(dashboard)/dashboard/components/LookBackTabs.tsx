'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BookOpen, Clock3, History, Sparkles } from 'lucide-react'
import { RecentEssaysTable } from './RecentEssaysTable'
import { ErrorHistory } from './ErrorHistory'
import { AISummaryButton } from './AISummaryButton'
import { PastVocabList } from './PastVocabList'
import type { Essay } from '@/types/essay'

type LookBackTab = 'recent' | 'errors' | 'vocab'

interface LookBackTabsProps {
  recentEssays: Essay[]
}

interface ErrorHistoryData {
  taskResponse: string[]
  coherenceCohesion: string[]
  lexicalResource: string[]
  grammaticalAccuracy: string[]
}

interface PastVocabEntry {
  essayId: string
  prompt: string
  createdAt: string
  vocabulary: Array<{
    id: string
    user_id: string
    essay_id: string
    vocab_type: 'paraphrase' | 'topic'
    original_word: string | null
    suggested_word: string
    definition: string
    created_at: string
  }>
}

const tabMeta: Record<LookBackTab, { title: string; description: string; icon: JSX.Element }> = {
  recent: {
    title: 'Recent Essays',
    description: 'Quick access to your latest submissions.',
    icon: <Clock3 className="h-4 w-4" />,
  },
  errors: {
    title: 'Error History',
    description: 'Patterns and recurring mistakes from prior essays.',
    icon: <History className="h-4 w-4" />,
  },
  vocab: {
    title: 'Past Vocab',
    description: 'Recently generated vocabulary items from your essays.',
    icon: <BookOpen className="h-4 w-4" />,
  },
}

function SectionSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {[0, 1].map((index) => (
        <div key={index} className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-4 w-20 rounded bg-ocean-100" />
            <div className="h-5 w-3/4 rounded bg-ocean-100" />
            <div className="h-24 rounded-xl bg-ocean-50" />
            <div className="h-10 w-32 rounded-lg bg-ocean-100" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function LookBackTabs({ recentEssays }: LookBackTabsProps) {
  const [activeTab, setActiveTab] = useState<LookBackTab>('recent')
  const [errorHistory, setErrorHistory] = useState<ErrorHistoryData | null>(null)
  const [pastVocab, setPastVocab] = useState<PastVocabEntry[] | null>(null)
  const [loadingErrors, setLoadingErrors] = useState(false)
  const [loadingVocab, setLoadingVocab] = useState(false)
  const [errorsLoaded, setErrorsLoaded] = useState(false)
  const [vocabLoaded, setVocabLoaded] = useState(false)
  const [errorsError, setErrorsError] = useState<string | null>(null)
  const [vocabError, setVocabError] = useState<string | null>(null)

  useEffect(() => {
    const fetchErrors = async () => {
      if (errorsLoaded || loadingErrors) return

      setLoadingErrors(true)
      setErrorsError(null)

      try {
        const response = await fetch('/api/dashboard/look-back/errors')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load error history')
        }

        setErrorHistory(data.errors)
        setErrorsLoaded(true)
      } catch (error) {
        setErrorsError(error instanceof Error ? error.message : 'Failed to load error history')
      } finally {
        setLoadingErrors(false)
      }
    }

    const fetchVocab = async () => {
      if (vocabLoaded || loadingVocab) return

      setLoadingVocab(true)
      setVocabError(null)

      try {
        const response = await fetch('/api/dashboard/look-back/vocab')
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load past vocabulary')
        }

        setPastVocab(data.entries)
        setVocabLoaded(true)
      } catch (error) {
        setVocabError(error instanceof Error ? error.message : 'Failed to load past vocabulary')
      } finally {
        setLoadingVocab(false)
      }
    }

    if (activeTab === 'errors') {
      void fetchErrors()
    }

    if (activeTab === 'vocab') {
      void fetchVocab()
    }
  }, [activeTab, errorsLoaded, loadingErrors, loadingVocab, vocabLoaded])

  return (
    <Card className="overflow-hidden border-0 bg-white shadow-lg">
      <div className="h-1 bg-gradient-to-r from-cyan-500 via-ocean-500 to-blue-500" />
      <CardHeader className="space-y-4 bg-gradient-to-br from-ocean-50 via-white to-cyan-50/60 pb-5">
        <div className="space-y-2">
          <CardTitle className="text-ocean-900">Look Back</CardTitle>
          <CardDescription className="max-w-2xl text-ocean-600">
            Review recent essays first, then open deeper history only when you need it. This keeps the dashboard fast and focused.
          </CardDescription>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as LookBackTab)} className="w-full">
          <TabsList className="grid h-auto w-full grid-cols-1 gap-2 bg-transparent p-0 md:grid-cols-3">
            {(Object.keys(tabMeta) as LookBackTab[]).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="group flex items-center justify-start gap-3 rounded-2xl border border-ocean-100 bg-white px-4 py-3 text-left shadow-sm transition-all data-[state=active]:border-cyan-200 data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-50 data-[state=active]:to-ocean-50 data-[state=active]:shadow-md"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-ocean-50 text-ocean-700 transition-colors group-data-[state=active]:bg-white group-data-[state=active]:text-cyan-600">
                  {tabMeta[key].icon}
                </span>
                <span className="flex flex-col items-start">
                  <span className="text-sm font-semibold text-ocean-900">{tabMeta[key].title}</span>
                  <span className="text-xs font-normal text-ocean-500">{tabMeta[key].description}</span>
                </span>
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="recent" className="mt-5">
            <div className="rounded-2xl border border-ocean-100 bg-white p-1 shadow-sm">
              <CardHeader className="px-4 pb-4 pt-5 md:px-6">
                <CardTitle className="flex items-center gap-2 text-ocean-900">
                  <Clock3 className="h-5 w-5 text-cyan-600" />
                  Recent Essays
                </CardTitle>
                <CardDescription>Your latest submissions at a glance.</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-5 md:px-6">
                <RecentEssaysTable essays={recentEssays} />
              </CardContent>
            </div>
          </TabsContent>

          <TabsContent value="errors" className="mt-5">
            <div className="rounded-2xl border border-ocean-100 bg-white p-1 shadow-sm">
              <CardHeader className="flex flex-col gap-4 px-4 pb-4 pt-5 md:flex-row md:items-start md:justify-between md:px-6">
                <div>
                  <CardTitle className="flex items-center gap-2 text-ocean-900">
                    <History className="h-5 w-5 text-cyan-600" />
                    Error History
                  </CardTitle>
                  <CardDescription>Recurring issues across your essays. Loaded only when you open this tab.</CardDescription>
                </div>
                <AISummaryButton />
              </CardHeader>
              <CardContent className="px-4 pb-5 md:px-6">
                {loadingErrors ? (
                  <SectionSkeleton />
                ) : errorsError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {errorsError}
                  </div>
                ) : errorHistory ? (
                  <ErrorHistory errors={errorHistory} />
                ) : null}
              </CardContent>
            </div>
          </TabsContent>

          <TabsContent value="vocab" className="mt-5">
            <div className="rounded-2xl border border-ocean-100 bg-white p-1 shadow-sm">
              <CardHeader className="px-4 pb-4 pt-5 md:px-6">
                <CardTitle className="flex items-center gap-2 text-ocean-900">
                  <BookOpen className="h-5 w-5 text-cyan-600" />
                  Past Vocab
                </CardTitle>
                <CardDescription>Recent vocabulary generated from your essays. Loaded on demand.</CardDescription>
              </CardHeader>
              <CardContent className="px-4 pb-5 md:px-6">
                {loadingVocab ? (
                  <SectionSkeleton />
                ) : vocabError ? (
                  <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
                    {vocabError}
                  </div>
                ) : pastVocab ? (
                  <PastVocabList entries={pastVocab} />
                ) : null}
              </CardContent>
            </div>
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>
  )
}