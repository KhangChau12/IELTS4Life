import type { Metadata } from 'next'
import LoginClient from './LoginClient'

export const metadata: Metadata = {
  title: 'Sign In | IELTS4Life — AI IELTS Writing Coach',
  description:
    'Sign in to your IELTS4Life account to access AI essay scoring, detailed feedback, and vocabulary tools.',
  alternates: { canonical: 'https://ielts4life.com/login' },
  openGraph: {
    title: 'Sign In | IELTS4Life',
    description: 'Sign in to access AI IELTS writing feedback and track your progress.',
    url: 'https://ielts4life.com/login',
  },
}

export default function LoginPage() {
  return <LoginClient />
}
