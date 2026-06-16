import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, PenTool, ArrowRight } from 'lucide-react'
import { HistoryListClient } from './components/HistoryListClient'

export const metadata: Metadata = {
  title: 'Essay History | IELTS4Life',
  description:
    'Review all your submitted IELTS Writing essays and track band score improvement over time.',
  robots: { index: false, follow: false },
}

export default async function HistoryPage() {
  const supabase = createServerClient()

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect('/login')
  }

  // Fetch only the columns needed for the history list (avoid loading large blobs)
  const { data: essays, error } = await supabase
    .from('essays')
    .select('id, prompt, essay_content, overall_score, task_response_score, coherence_cohesion_score, lexical_resource_score, grammatical_accuracy_score, created_at')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching essays:', error)
  }

  // Fetch vocab status for all essays in one query (no N+1)
  const essayIds = (essays ?? []).map(e => e.id)
  const { data: vocabRows } = essayIds.length > 0
    ? await supabase
        .from('vocabulary')
        .select('essay_id')
        .eq('user_id', session.user.id)
        .in('essay_id', essayIds)
    : { data: [] }

  const essaysWithVocab = new Set((vocabRows ?? []).map(r => r.essay_id))

  // Build enriched essays: compute word_count server-side, attach has_vocab
  const enrichedEssays = (essays ?? []).map(essay => ({
    id: essay.id,
    prompt: essay.prompt,
    overall_score: essay.overall_score,
    task_response_score: essay.task_response_score,
    coherence_cohesion_score: essay.coherence_cohesion_score,
    lexical_resource_score: essay.lexical_resource_score,
    grammatical_accuracy_score: essay.grammatical_accuracy_score,
    created_at: essay.created_at,
    word_count: essay.essay_content.split(/\s+/).filter(Boolean).length,
    has_vocab: essaysWithVocab.has(essay.id),
  }))

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-6">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900">Essay History</h1>
        <p className="mt-1 text-xs sm:text-sm md:text-base text-slate-500">
          View all your submitted essays and review your progress
        </p>
      </div>

      {enrichedEssays.length === 0 ? (
        <Card className="border-ocean-200 shadow-lg animate-fadeInUp">
          <CardContent className="py-8 md:py-12 text-center px-4">
            <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-ocean-400 opacity-50" />
            <h3 className="text-lg md:text-xl font-semibold text-ocean-800 mb-2">No Essays Yet</h3>
            <p className="text-sm md:text-base text-ocean-600 mb-4 px-4">You haven&apos;t submitted any essays yet. Start writing to see your progress!</p>
            <Link href="/score">
              <Button className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white text-sm md:text-base">
                <FileText className="mr-2 h-4 w-4" />
                Write Your First Essay
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <HistoryListClient essays={enrichedEssays} />
      )}

      {/* Write New Essay — banner strip */}
      {enrichedEssays.length > 0 && (
        <Card className="mt-4 sm:mt-6 md:mt-8 border-0 shadow-lg bg-gradient-to-r from-ocean-600 to-cyan-600 overflow-hidden relative">
          <PenTool className="absolute right-3 top-1/2 -translate-y-1/2 h-24 w-24 sm:h-32 sm:w-32 text-white opacity-10 rotate-[-12deg] pointer-events-none select-none" />
          <CardContent className="relative z-10 px-4 sm:px-5 md:px-6 py-4 sm:py-5">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0 h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-white/20 flex items-center justify-center">
                <PenTool className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-bold text-white leading-snug">Ready for another essay?</p>
                <p className="text-xs sm:text-sm text-white/80 hidden sm:block">Pick a prompt and keep improving your band score</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Link href="/write">
                  <Button size="sm" className="bg-white text-ocean-700 hover:bg-ocean-50 font-semibold shadow-sm h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm">
                    Browse
                  </Button>
                </Link>
                <Link href="/score">
                  <Button size="sm" variant="ghost" className="text-white hover:bg-white/15 border border-white/30 h-8 sm:h-9 px-3 sm:px-4 text-xs sm:text-sm font-medium">
                    Free Write
                    <ArrowRight className="ml-1 h-3 w-3 sm:ml-1.5 sm:h-3.5 sm:w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
