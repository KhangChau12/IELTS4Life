import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'IELTS4Life',
}

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
