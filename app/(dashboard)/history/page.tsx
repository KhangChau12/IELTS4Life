import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'
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

  // Fetch all essays
  const { data: essays, error } = await supabase
    .from('essays')
    .select('*')
    .eq('user_id', session.user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching essays:', error)
  }

  return (
    <div className="container mx-auto py-6 md:py-8 px-4">
      <div className="mb-6 md:mb-8 animate-fadeInUp">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-700 to-cyan-700 bg-clip-text text-transparent">Essay History</h1>
        <p className="mt-2 text-sm md:text-base text-slate-600">
          View all your submitted essays and review your progress
        </p>
      </div>

      {!essays || essays.length === 0 ? (
        <Card className="border-ocean-200 shadow-lg animate-fadeInUp">
          <CardContent className="py-8 md:py-12 text-center px-4">
            <FileText className="h-12 w-12 md:h-16 md:w-16 mx-auto mb-4 text-ocean-400 opacity-50" />
            <h3 className="text-lg md:text-xl font-semibold text-ocean-800 mb-2">No Essays Yet</h3>
            <p className="text-sm md:text-base text-ocean-600 mb-4 px-4">You haven't submitted any essays yet. Start writing to see your progress!</p>
            <Link href="/write">
              <Button className="bg-gradient-to-r from-ocean-600 to-cyan-600 hover:from-ocean-700 hover:to-cyan-700 text-white text-sm md:text-base">
                <FileText className="mr-2 h-4 w-4" />
                Write Your First Essay
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <HistoryListClient essays={essays} />
      )}

      {/* Write New Essay Button */}
      <div className="mt-6 md:mt-8 text-center">
        <Link href="/write">
          <Button size="lg" className="bg-gradient-to-r from-cyan-500 to-ocean-600 hover:from-cyan-600 hover:to-ocean-700 shadow-lg hover:shadow-xl transition-all text-sm md:text-base">
            <FileText className="mr-2 h-4 w-4 md:h-5 md:w-5" />
            Write New Essay
          </Button>
        </Link>
      </div>
    </div>
  )
}
