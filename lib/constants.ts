export const SITE_NAME = 'IELTS4Life'
export const SITE_DESCRIPTION = 'AI-powered IELTS Writing Task 2 coach'

// IELTS Band Score Labels
export const BAND_SCORE_LABELS: { [key: number]: string } = {
  9: 'Expert',
  8: 'Very Good',
  7: 'Good',
  6: 'Competent',
  5: 'Modest',
  4: 'Limited',
  3: 'Extremely Limited',
  2: 'Intermittent',
  1: 'Non-user',
  0: 'Did not attempt',
}

// IELTS Criteria Names
export const CRITERIA_NAMES = {
  task_response: 'Task Response',
  coherence_cohesion: 'Coherence and Cohesion',
  lexical_resource: 'Lexical Resource',
  grammatical_accuracy: 'Grammatical Range and Accuracy',
} as const

export const CRITERIA_DESCRIPTIONS = {
  task_response: 'How well you address all parts of the task and develop your position',
  coherence_cohesion: 'How well your ideas are organized and linked together',
  lexical_resource: 'The range and accuracy of your vocabulary',
  grammatical_accuracy: 'The range and accuracy of your grammatical structures',
}

export const CRITERIA_ICONS = {
  task_response: 'Target',
  coherence_cohesion: 'Link',
  lexical_resource: 'BookOpen',
  grammatical_accuracy: 'CheckCircle',
} as const

// Vocabulary Types
export const VOCAB_TYPES = {
  paraphrase: 'Paraphrase Suggestions',
  topic: 'Topic Vocabulary',
} as const

// Quiz Types
export const QUIZ_TYPES = {
  multiple_choice: 'Multiple Choice',
} as const

// Word Count Recommendations
export const MIN_WORDS_TASK_2 = 250
export const RECOMMENDED_WORDS_TASK_2 = 300

// Flashcard Quality Ratings (SM-2 algorithm)
export const FLASHCARD_QUALITY = {
  COMPLETE_BLACKOUT: 0,
  INCORRECT_HARD: 1,
  INCORRECT_EASY: 2,
  CORRECT_HARD: 3,
  CORRECT_EASY: 4,
  PERFECT: 5,
} as const

// API Rate Limits
export const MAX_ESSAYS_PER_DAY = 10
export const MAX_VOCAB_GENERATIONS_PER_DAY = 20

// Pagination
export const ESSAYS_PER_PAGE = 10
export const VOCAB_PER_PAGE = 20
export const ERRORS_PER_PAGE = 5
export const PROMPTS_PER_PAGE = 15

// Writing Prompt Question Types
export const QUESTION_TYPES_DISPLAY: Record<string, string> = {
  agree_disagree: 'Agree / Disagree',
  advantages_disadvantages: 'Advantages & Disadvantages',
  problem_solution: 'Problem & Solution (Causes / Effects / Solutions)',
  two_part_question: 'Two-part Question',
  positive_negative: 'Positive & Negative',
  discussion_both_views: 'Discussion (Both Views)',
}
