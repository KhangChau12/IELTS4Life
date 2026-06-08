export const QUESTION_TYPES = {
  agree_disagree: 'Agree / Disagree',
  advantages_disadvantages: 'Advantages & Disadvantages',
  problem_solution: 'Cause & Solution',
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

export type PromptStatus = 'approved' | 'pending'
export type PromptSource = 'manual' | 'user_submission'

export interface WritingPrompt {
  id: string
  prompt_text: string
  question_type: QuestionType
  topic_id: string
  created_by: string | null
  created_at: string
  updated_at: string
  status?: PromptStatus
  source?: PromptSource
  submitted_count?: number
  classification_confidence?: number | null
  normalized_text?: string | null
}

export interface WritingPromptWithTopic extends WritingPrompt {
  prompt_topics: PromptTopic
  profiles: { email: string } | null
}

export interface SimilarPrompt {
  id: string
  prompt_text: string
  question_type: QuestionType
  prompt_topics: Pick<PromptTopic, 'id' | 'name'>
}

export interface PromptOutlines {
  id: string
  prompt_id: string
  outline_1: string
  outline_2: string
  generated_at: string
}

export interface EssayDraft {
  id: string
  user_id: string
  prompt_id: string
  draft_content: string
  timer_seconds: number
  last_saved_at: string
}

export interface PromptWithUserEssay extends WritingPrompt {
  prompt_topics: Pick<PromptTopic, 'id' | 'name'>
  user_essay?: {
    id: string
    overall_score: number | null
    created_at: string
  } | null
}
