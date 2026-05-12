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
          role: 'student' | 'admin' | 'dev'
          daily_essays_count: number
          last_reset_date: string
          total_essays_count: number
          invite_code: string | null
          invited_by: string | null
          invite_bonus_essays: number
          subscription_status: 'free' | 'active' | 'expired'
          subscription_end_date: string | null
          subscription_order_code: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          role?: 'student' | 'admin' | 'dev'
          daily_essays_count?: number
          last_reset_date?: string
          total_essays_count?: number
          invite_code?: string | null
          invited_by?: string | null
          invite_bonus_essays?: number
          subscription_status?: 'free' | 'active' | 'expired'
          subscription_end_date?: string | null
          subscription_order_code?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          role?: 'student' | 'admin' | 'dev'
          daily_essays_count?: number
          last_reset_date?: string
          total_essays_count?: number
          invite_code?: string | null
          invited_by?: string | null
          invite_bonus_essays?: number
          subscription_status?: 'free' | 'active' | 'expired'
          subscription_end_date?: string | null
          subscription_order_code?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      payment_transactions: {
        Row: {
          id: string
          user_id: string
          order_code: string
          amount: number
          status: 'pending' | 'completed' | 'failed'
          sepay_transaction_id: number | null
          transaction_content: string | null
          created_at: string
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          order_code: string
          amount: number
          status?: 'pending' | 'completed' | 'failed'
          sepay_transaction_id?: number | null
          transaction_content?: string | null
          created_at?: string
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          order_code?: string
          amount?: number
          status?: 'pending' | 'completed' | 'failed'
          sepay_transaction_id?: number | null
          transaction_content?: string | null
          created_at?: string
          completed_at?: string | null
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
          prompt_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt: string
          essay_content: string
          prompt_id?: string | null
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
          prompt_id?: string | null
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
          quiz_type: 'multiple_choice'
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
          quiz_type: 'multiple_choice'
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
      writing_prompt_outlines: {
        Row: {
          id: string
          prompt_id: string
          outline_1: string
          outline_2: string
          generated_at: string
        }
        Insert: {
          id?: string
          prompt_id: string
          outline_1: string
          outline_2: string
          generated_at?: string
        }
        Update: {
          id?: string
          prompt_id?: string
          outline_1?: string
          outline_2?: string
          generated_at?: string
        }
      }
      vocabulary_views: {
        Row: {
          id: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          viewed_at: string
        }
        Insert: {
          id?: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          viewed_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          essay_id?: string
          vocab_type?: 'paraphrase' | 'topic'
          viewed_at?: string
        }
      }
      vocabulary_quiz_attempts: {
        Row: {
          id: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          score: number
          total_questions: number
          correct_answers: string[] | null
          incorrect_answers: string[] | null
          quiz_type: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          essay_id: string
          vocab_type: 'paraphrase' | 'topic'
          score: number
          total_questions?: number
          correct_answers?: string[] | null
          incorrect_answers?: string[] | null
          quiz_type?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          essay_id?: string
          vocab_type?: 'paraphrase' | 'topic'
          score?: number
          total_questions?: number
          correct_answers?: string[] | null
          incorrect_answers?: string[] | null
          quiz_type?: string | null
          created_at?: string
        }
      }
      essay_drafts: {
        Row: {
          id: string
          user_id: string
          prompt_id: string
          draft_content: string
          timer_seconds: number
          last_saved_at: string
        }
        Insert: {
          id?: string
          user_id: string
          prompt_id: string
          draft_content?: string
          timer_seconds?: number
          last_saved_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          prompt_id?: string
          draft_content?: string
          timer_seconds?: number
          last_saved_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          title: string
          content: string
          target_audience: 'all' | 'student' | 'pro' | 'free'
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          target_audience: 'all' | 'student' | 'pro' | 'free'
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          target_audience?: 'all' | 'student' | 'pro' | 'free'
          created_by?: string
          created_at?: string
        }
      }
      notification_reads: {
        Row: {
          id: string
          notification_id: string
          user_id: string
          read_at: string
        }
        Insert: {
          id?: string
          notification_id: string
          user_id: string
          read_at?: string
        }
        Update: {
          id?: string
          notification_id?: string
          user_id?: string
          read_at?: string
        }
      }
    }
  }
}
