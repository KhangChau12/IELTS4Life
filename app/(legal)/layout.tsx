import type { Metadata } from 'next'
import { Footer } from '@/components/layout/Footer'

export const metadata: Metadata = {
  title: 'IELTS4Life',
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
