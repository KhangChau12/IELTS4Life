import Link from 'next/link'
import { PromptReviewClient } from './PromptReviewClient'

export default function PromptReviewPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
      <div className="flex items-center gap-2">
        <Link href="/admin/prompts" className="text-[12.5px] font-semibold text-slate-400 hover:text-slate-600">
          Prompts
        </Link>
        <span className="text-xs text-slate-300">/</span>
        <h1 className="text-[22px] font-extrabold text-ocean-900 tracking-tight">Review Submissions</h1>
      </div>

      <PromptReviewClient />
    </div>
  )
}
