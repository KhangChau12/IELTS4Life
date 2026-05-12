import { redirect } from 'next/navigation'
import { getAdminUser } from '@/lib/admin/auth'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Admin Dashboard - IELTS4Life',
  description: 'Administrative panel for IELTS4Life',
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const adminUser = await getAdminUser()

  if (!adminUser) {
    redirect('/login')
  }

  if (!['admin', 'dev'].includes(adminUser.profile?.role ?? '')) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-50 via-cyan-50 to-blue-50">
      <div className="container mx-auto py-8 px-4">
        {children}
      </div>
    </div>
  )
}
