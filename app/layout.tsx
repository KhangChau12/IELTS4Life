import type { Metadata } from 'next'
import { Nunito, Shrikhand } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { createServerClient } from '@/lib/supabase/server'
import { Analytics } from '@vercel/analytics/next'

const nunito = Nunito({
  subsets: ['latin'],
  weight: ['300', '400', '600', '700', '800', '900'],
})
const shrikhand = Shrikhand({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-shrikhand',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://ielts4life.com'),
  title: 'IELTS4Life — AI Writing Coach',
  description: 'Free AI-powered IELTS writing scorer and feedback tool. Get instant band scores, detailed feedback, and vocabulary enhancement for IELTS Writing Task 2. Master IELTS writing with AI scoring, essay correction, and personalized tips. Perfect for IELTS preparation, band 7+ writing, and exam practice.',
  keywords: [
    'IELTS for life',
    'IELTS 4 life',
    'ielts for life',
    'ielts 4 life',
    'IELTS writing',
    'AI IELTS scoring',
    'IELTS writing scorer',
    'IELTS essay checker',
    'IELTS writing feedback',
    'IELTS writing assistant',
    'IELTS Task 2',
    'IELTS band score',
    'IELTS writing practice',
    'AI essay scoring',
    'IELTS writing tips',
    'IELTS preparation',
    'IELTS vocabulary',
    'free IELTS checker',
    'online IELTS scorer',
    'IELTS writing help',
  ],
  authors: [{ name: 'IELTS4Life' }],
  creator: 'IELTS4Life',
  publisher: 'IELTS4Life',
  verification: {
    google: 'L-ZUYNiUDbIIyTtG8ec9Hput6hemUZIqiYqxebVIeYA',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://ielts4life.com',
    siteName: 'IELTS for Life',
    title: 'IELTS for Life - AI IELTS Writing Scorer & Assistant',
    description: 'Free AI-powered IELTS writing scorer. Get instant band scores, detailed feedback, and vocabulary enhancement for IELTS Writing Task 2.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'IELTS for Life - AI Writing Coach',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'IELTS for Life - AI IELTS Writing Scorer',
    description: 'Free AI-powered IELTS writing scorer with instant feedback and band scores',
    images: ['/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  alternates: {
    canonical: 'https://ielts4life.com',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()

  const {
    data: { user: authUser },
  } = await supabase.auth.getUser()

  let user = null
  if (authUser) {
    // Try to get profile, but fallback to session user data if profile doesn't exist yet
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, full_name, role')
      .eq('id', authUser.id)
      .single()

    user = profile || {
      email: authUser.email || '',
      role: 'student' as const
    }
  }

  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IELTS4Life',
    alternateName: 'IELTS for Life',
    url: 'https://ielts4life.com',
    logo: 'https://ielts4life.com/android-chrome-512x512.png',
    description: 'Free AI-powered IELTS writing scorer and feedback tool. Get instant band scores, detailed feedback, and vocabulary enhancement for IELTS Writing Task 2.',
  }

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
      </head>
      <body className={`${nunito.className} ${shrikhand.variable}`}>
        <div className="flex min-h-screen flex-col">
          <Header user={user} />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
