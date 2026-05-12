export interface VocabularyItem {
  id: string
  user_id: string
  essay_id: string
  vocab_type: 'paraphrase' | 'topic'
  original_word: string | null
  suggested_word: string
  definition: string
  created_at: string
}

export interface ParaphraseVocabResponse {
  vocabulary: {
    original: string
    suggested: string
    definition: string
  }[]
}

export interface TopicVocabResponse {
  vocabulary: {
    word: string
    definition: string
  }[]
}

export interface Flashcard {
  id: string
  user_id: string
  vocab_id: string
  next_review_date: string
  repetition_count: number
  ease_factor: number
  interval_days: number
  vocabulary?: VocabularyItem
}

export interface QuizQuestion {
  id: string
  question: string
  options?: string[]  // For multiple choice
  answer: string
  definition: string
}

export interface QuizResult {
  id: string
  user_id: string
  essay_id: string
  quiz_type: 'multiple_choice'
  score: number
  total_questions: number
  correct_answers: string[]
  incorrect_answers: string[]
  created_at: string
}

export interface VocabularyView {
  id: string
  user_id: string
  essay_id: string
  vocab_type: 'paraphrase' | 'topic'
  viewed_at: string
}

export interface VocabularyQuizAttempt {
  id: string
  user_id: string
  essay_id: string
  vocab_type: 'paraphrase' | 'topic'
  score: number
  total_questions: number
  created_at: string
}

export interface VocabularyStatus {
  hasViewed: boolean
  quizScore: number | null
  quizTotal: number
}
