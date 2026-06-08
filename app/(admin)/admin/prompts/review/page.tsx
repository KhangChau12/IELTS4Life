import Link from 'next/link'
import { ArrowLeft, Inbox } from 'lucide-react'
import { PromptReviewClient } from './PromptReviewClient'

export default function PromptReviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6 px-4 py-6">
      <div className="rounded-3xl border border-ocean-200 bg-gradient-to-br from-white via-ocean-50/50 to-cyan-50/40 shadow-lg p-6 md:p-8 relative overflow-hidden">
        <Inbox className="absolute right-4 top-4 h-32 w-32 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
        <div className="relative z-10 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-ocean-900">
              Review Submissions
            </h1>
            <p className="text-ocean-600 text-sm md:text-base">
              Review and approve user-submitted prompts for the writing library
            </p>
          </div>

          <Link
            href="/admin/prompts"
            className="inline-flex items-center gap-2 rounded-xl border border-ocean-200 bg-white px-4 py-2.5 text-sm font-medium text-ocean-700 shadow-sm transition-all hover:bg-ocean-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Prompts
          </Link>
        </div>
      </div>

      <PromptReviewClient />
    </div>
  )
}
