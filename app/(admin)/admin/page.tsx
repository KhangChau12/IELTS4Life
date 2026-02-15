import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { BarChart3, FileText } from 'lucide-react'
import Link from 'next/link'

export default function AdminPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8 px-4">
      {/* Header */}
      <div className="animate-fadeInUp">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold bg-gradient-to-r from-ocean-800 to-cyan-700 bg-clip-text text-transparent mb-2">
          Admin Dashboard
        </h1>
        <p className="text-ocean-600 text-sm md:text-base lg:text-lg">
          Manage your IELTS4Life platform
        </p>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/admin/statistics">
          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-cyan-500 group h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <BarChart3 className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-cyan-700 transition-colors">
                    Statistics
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    View platform analytics and user data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/admin/prompts">
          <Card className="hover:shadow-xl transition-all cursor-pointer border-l-4 border-l-teal-500 group h-full">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg group-hover:shadow-xl transition-shadow">
                  <FileText className="h-7 w-7 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 group-hover:text-teal-700 transition-colors">
                    Writing Prompts
                  </CardTitle>
                  <CardDescription className="text-sm mt-1">
                    Manage IELTS writing prompts and topics
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
