import type { Metadata } from 'next'
import VocabularyDetailPage from './VocabPageClient'

export const metadata: Metadata = {
  title: 'Essay Vocabulary | IELTS4Life',
  description:
    'Review AI-generated C1-C2 vocabulary suggestions — paraphrases and topic-specific words with definitions, flashcards, and quizzes.',
  robots: { index: false, follow: false },
}

export default function VocabPage({ params }: { params: { essayId: string } }) {
  return <VocabularyDetailPage params={params} />
}
