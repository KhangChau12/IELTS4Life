export const QUESTION_TYPES = {
  agree_disagree: 'Agree / Disagree',
  advantages_disadvantages: 'Advantages & Disadvantages',
  problem_solution: 'Problem & Solution',
  two_part_question: 'Two-part Question',
  positive_negative: 'Positive & Negative',
  discussion_both_views: 'Discussion (Both Views)',
  mixed_hybrid: 'Mixed / Hybrid',
} as const

export type QuestionType = keyof typeof QUESTION_TYPES

export interface PromptTopic {
  id: string
  name: string
  created_at: string
}

export interface WritingPrompt {
  id: string
  prompt_text: string
  question_type: QuestionType
  topic_id: string
  created_by: string
  created_at: string
  updated_at: string
}

export interface WritingPromptWithTopic extends WritingPrompt {
  prompt_topics: PromptTopic
  profiles: { email: string }
}
