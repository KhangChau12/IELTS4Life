import type { Metadata } from 'next'
import RegisterClient from './RegisterClient'

export const metadata: Metadata = {
  title: 'Create Free Account | IELTS4Life — AI Writing Coach',
  description:
    'Join free. Get 6 AI-scored IELTS Writing Task 2 essays, detailed band feedback, and vocabulary tools. No credit card required.',
  alternates: { canonical: 'https://ielts4life.com/register' },
  openGraph: {
    title: 'Create Free Account | IELTS4Life',
    description:
      'Start your IELTS journey free — 6 AI-scored essays, detailed feedback, and vocabulary tools.',
    url: 'https://ielts4life.com/register',
  },
}

export default function RegisterPage() {
  return <RegisterClient />
}
