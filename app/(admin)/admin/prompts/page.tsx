import Link from 'next/link'
import { ArrowLeft, FileText, Sparkles } from 'lucide-react'
import { PromptsManagementClient } from '../components/PromptsManagementClient'

export default function PromptsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4 py-6">
      <div className="rounded-3xl border border-slate-200/70 bg-gradient-to-br from-white via-teal-50/35 to-cyan-50/35 shadow-sm p-6 md:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-medium text-teal-700">
              <Sparkles className="h-3.5 w-3.5" />
              Prompt Ops Workspace
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900">
                  Writing Prompts
                </h1>
                <p className="text-slate-600 text-sm md:text-base">
                  Manage IELTS Task 2 prompts with better speed and clarity
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/admin"
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Admin
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200/70 bg-white/90 shadow-sm p-4 md:p-5">
        <PromptsManagementClient />
      </div>
    </div>
  )
}
