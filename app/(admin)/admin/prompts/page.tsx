import Link from 'next/link'
import { PromptsManagementClient } from '../components/PromptsManagementClient'

export default function PromptsPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-4 px-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <Link href="/admin" className="text-[12.5px] font-semibold text-slate-400 hover:text-slate-600">
              Admin
            </Link>
            <span className="text-xs text-slate-300">/</span>
            <h1 className="text-[22px] font-extrabold text-ocean-900 tracking-tight">Writing Prompts</h1>
          </div>
        </div>
      </div>

      <PromptsManagementClient />
    </div>
  )
}
