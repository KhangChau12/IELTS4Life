export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          role: 'student' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      essays: {
        Row: {
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
          task_response_errors: Json | null
          coherence_cohesion_errors: Json | null
          lexical_resource_errors: Json | null
          grammatical_accuracy_errors: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          essay_content: string
          overall_score?: number | null
          task_response_score?: number | null
          coherence_cohesion_score?: number | null
          lexical_resource_score?: number | null
          grammatical_accuracy_score?: number | null
          task_response_comment?: string | null
          coherence_cohesion_comment?: string | null
          lexical_resource_comment?: string | null
          grammatical_accuracy_comment?: string | null
          task_response_errors?: Json | null
          coherence_cohesion_errors?: Json | null
          lexical_resource_errors?: Json | null
          grammatical_accuracy_errors?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt?: string
          essay_content?: string
          overall_score?: number | null
          task_response_score?: number | null
          coherence_cohesion_score?: number | null
          lexical_resource_score?: number | null
          grammatical_accuracy_score?: number | null
          task_response_comment?: string | null
          coherence_cohesion_comment?: string | null
          lexical_resource_comment?: string | null
          grammatical_accuracy_comment?: string | null
          task_response_errors?: Json | null
          coherence_cohesion_errors?: Json | null
          lexical_resource_errors?: Json | null
          grammatical_accuracy_errors?: Json | null
          created_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          original_word: string | null
          suggested_word: string
          definition: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          original_word?: string | null
          suggested_word: string
          definition: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          essay_id?: string
          vocab_type?: 'paraphrase' | 'topic'
          original_word?: string | null
          suggested_word?: string
          definition?: string
          created_at?: string
        }
      }
      flashcards: {
        Row: {
          id: string
          user_id: string
          vocab_id: string
          next_review_date: string
          repetition_count: number
          ease_factor: number
          interval_days: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          vocab_id: string
          next_review_date?: string
          repetition_count?: number
          ease_factor?: number
          interval_days?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          vocab_id?: string
          next_review_date?: string
          repetition_count?: number
          ease_factor?: number
          interval_days?: number
          created_at?: string
          updated_at?: string
        }
      }
      quiz_results: {
        Row: {
          id: string
          user_id: string
          essay_id: string
          quiz_type: 'multiple_choice' | 'fill_in'
          score: number
          total_questions: number
          correct_answers: Json | null
          incorrect_answers: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          essay_id: string
          quiz_type: 'multiple_choice' | 'fill_in'
          score: number
          total_questions: number
          correct_answers?: Json | null
          incorrect_answers?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          essay_id?: string
          quiz_type?: 'multiple_choice' | 'fill_in'
          score?: number
          total_questions?: number
          correct_answers?: Json | null
          incorrect_answers?: Json | null
          created_at?: string
        }
      }
      token_usage: {
        Row: {
          id: string
          user_id: string | null
          request_type: 'scoring' | 'vocab_paraphrase' | 'vocab_topic' | 'summary'
          input_tokens: number
          output_tokens: number
          model: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          request_type: 'scoring' | 'vocab_paraphrase' | 'vocab_topic' | 'summary'
          input_tokens: number
          output_tokens: number
          model: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          request_type?: 'scoring' | 'vocab_paraphrase' | 'vocab_topic' | 'summary'
          input_tokens?: number
          output_tokens?: number
          model?: string
          created_at?: string
        }
      }
      prompt_topics: {
        Row: {
          id: string
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_at?: string
        }
      }
      writing_prompts: {
        Row: {
          id: string
          prompt_text: string
          question_type: 'agree_disagree' | 'advantages_disadvantages' | 'problem_solution' | 'two_part_question' | 'positive_negative' | 'discussion_both_views' | 'mixed_hybrid'
          topic_id: string
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          prompt_text: string
          question_type: 'agree_disagree' | 'advantages_disadvantages' | 'problem_solution' | 'two_part_question' | 'positive_negative' | 'discussion_both_views' | 'mixed_hybrid'
          topic_id: string
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          prompt_text?: string
          question_type?: 'agree_disagree' | 'advantages_disadvantages' | 'problem_solution' | 'two_part_question' | 'positive_negative' | 'discussion_both_views' | 'mixed_hybrid'
          topic_id?: string
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
