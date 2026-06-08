export interface EssayScores {
  task_response: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_accuracy: number
}

export interface EssayComments {
  task_response: string
  coherence_cohesion: string
  lexical_resource: string
  grammatical_accuracy: string
}

export interface EssayErrors {
  task_response: string[]
  coherence_cohesion: string[]
  lexical_resource: string[]
  grammatical_accuracy: string[]
}

export interface EssayStrengths {
  task_response: string[]
  coherence_cohesion: string[]
  lexical_resource: string[]
  grammatical_accuracy: string[]
}

export interface EssayScoringResponse {
  errors: EssayErrors
  strengths: EssayStrengths
  comments: EssayComments
  scores: EssayScores
  overall_score: number | 'N/A'
  invalid?: boolean
  message?: string
}

export interface ImprovementChange {
  original: string
  improved: string
  reason: string
}

export interface GrammarImprovement {
  type: 'sentence_combining' | 'error_correction' | 'variety_suggestion'
  original?: string
  improved?: string
  explanation?: string
  impact?: string
  location?: string
  error?: string
  correction?: string
  rule?: string
  severity?: 'MAJOR' | 'MINOR'
  observation?: string
  missing_structures?: string[]
  try_next?: string
}

export interface CoherenceImprovement {
  type: 'transition_missing' | 'positive_feedback' | 'sentence_connection'
  location?: string
  issue?: string
  suggestion?: string
  impact?: string
  strength?: string
  keep_doing?: string
  current?: string
  smoother?: string
  why?: string
}

export interface TaskResponseDepth {
  type: 'underdeveloped_idea' | 'missing_element' | 'positive_feedback'
  location?: string
  idea?: string
  issue?: string
  how_to_develop?: string
  why_important?: string
  requirement?: string
  missing?: string
  fix?: string
  impact?: string
  strength?: string
  evidence?: string
  keep_doing?: string
}

export interface OverallAssessment {
  first_impression: string
  strongest_aspect: string
  maintain_this: string
  priority_fixes: string[]
  next_essay_goals: {
    grammar?: string
    structure?: string
    task?: string
    vocabulary?: string
  }
  encouragement: string
}

export interface DetailedGuidance {
  grammar_improvements?: GrammarImprovement[]
  coherence_improvements?: CoherenceImprovement[]
  task_response_depth?: TaskResponseDepth[]
  overall_assessment?: OverallAssessment
}

export interface Essay {
  id: string
  user_id: string
  prompt: string
  essay_content: string
  overall_score: number | null
  task_response_score: number | null
  coherence_cohesion_score: number | null
  lexical_resource_score: number | null
  grammatical_accuracy_score: number | null
  task_response_comment: string | null
  coherence_cohesion_comment: string | null
  lexical_resource_comment: string | null
  grammatical_accuracy_comment: string | null
  task_response_errors: string[] | null
  coherence_cohesion_errors: string[] | null
  lexical_resource_errors: string[] | null
  grammatical_accuracy_errors: string[] | null
  task_response_strengths: string[] | null
  coherence_cohesion_strengths: string[] | null
  lexical_resource_strengths: string[] | null
  grammatical_accuracy_strengths: string[] | null
  improved_essay: string | null
  improvement_changes: ImprovementChange[] | null
  detailed_guidance: DetailedGuidance | null
  prompt_id: string | null
  prompt_classification_status: 'pending' | 'classified' | 'invalid' | 'unclassified'
  essay_topic_id: string | null
  essay_question_type: string | null
  essay_topic_name: string | null
  created_at: string
}
