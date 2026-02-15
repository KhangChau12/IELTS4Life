import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { PromptsManagementClient } from '../components/PromptsManagementClient'

export default function PromptsPage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 px-4">
      {/* Header with Back Button */}
      <div className="flex items-center gap-4 mb-6 animate-fadeInUp">
        <Link
          href="/admin"
          className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/80 border border-ocean-200 text-ocean-600 hover:text-ocean-800 hover:bg-white transition-all shadow-sm"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent">
            Writing Prompts
          </h1>
          <p className="text-ocean-600 text-sm md:text-base lg:text-lg">
            Manage IELTS Task 2 writing prompts
          </p>
        </div>
      </div>

      <PromptsManagementClient />
    </div>
  )
}
