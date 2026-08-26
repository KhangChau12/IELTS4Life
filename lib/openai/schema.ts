import { z } from 'zod'

// Schema for essay scoring response
export const essayScoringSchema = z.object({
  errors: z.object({
    task_response: z.array(z.string()),
    coherence_cohesion: z.array(z.string()),
    lexical_resource: z.array(z.string()),
    grammatical_accuracy: z.array(z.string()),
  }),
  comments: z.object({
    task_response: z.string(),
    coherence_cohesion: z.string(),
    lexical_resource: z.string(),
    grammatical_accuracy: z.string(),
  }),
  scores: z.object({
    task_response: z.number().int().min(0).max(9),
    coherence_cohesion: z.number().int().min(0).max(9),
    lexical_resource: z.number().int().min(0).max(9),
    grammatical_accuracy: z.number().int().min(0).max(9),
  }),
  overall_score: z.number().min(0).max(9),
})

// Schema for paraphrase vocabulary response
export const paraphraseVocabSchema = z.object({
  vocabulary: z.array(
    z.object({
      original: z.string(),
      suggested: z.string(),
      definition: z.string(),
    })
  ),
})

// Schema for topic vocabulary response
export const topicVocabSchema = z.object({
  vocabulary: z.array(
    z.object({
      word: z.string(),
      definition: z.string(),
    })
  ),
})

// Schema for error summary response
export const errorSummarySchema = z.object({
  summary: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  recommendations: z.array(z.string()),
})

// ---- OpenRouter json_schema response_format definitions ----
// Plain JSON Schema (not Zod) — sent directly in response_format.json_schema.schema
// to force structured output and stop providers from emitting malformed JSON.

const criteriaStringArray = {
  type: 'object',
  properties: {
    task_response: { type: 'array', items: { type: 'string' } },
    coherence_cohesion: { type: 'array', items: { type: 'string' } },
    lexical_resource: { type: 'array', items: { type: 'string' } },
    grammatical_accuracy: { type: 'array', items: { type: 'string' } },
  },
  required: ['task_response', 'coherence_cohesion', 'lexical_resource', 'grammatical_accuracy'],
  additionalProperties: false,
} as const

const criteriaIntScore = {
  type: 'object',
  properties: {
    task_response: { type: 'integer' },
    coherence_cohesion: { type: 'integer' },
    lexical_resource: { type: 'integer' },
    grammatical_accuracy: { type: 'integer' },
  },
  required: ['task_response', 'coherence_cohesion', 'lexical_resource', 'grammatical_accuracy'],
  additionalProperties: false,
} as const

const criteriaString = {
  type: 'object',
  properties: {
    task_response: { type: 'string' },
    coherence_cohesion: { type: 'string' },
    lexical_resource: { type: 'string' },
    grammatical_accuracy: { type: 'string' },
  },
  required: ['task_response', 'coherence_cohesion', 'lexical_resource', 'grammatical_accuracy'],
  additionalProperties: false,
} as const

export const ESSAY_SCORING_JSON_SCHEMA = {
  name: 'essay_scoring',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      strengths: criteriaStringArray,
      errors: criteriaStringArray,
      comments: criteriaString,
      scores: criteriaIntScore,
      // 'N/A' when the essay fails validation (not English / too short / not an essay) — see
      // ESSAY_SCORING_SYSTEM_PROMPT's invalid-response block
      overall_score: { type: ['number', 'string'] },
      invalid: { type: ['boolean', 'null'] },
      message: { type: ['string', 'null'] },
    },
    required: ['strengths', 'errors', 'comments', 'scores', 'overall_score', 'invalid', 'message'],
    additionalProperties: false,
  },
} as const

export const ESSAY_IMPROVEMENT_JSON_SCHEMA = {
  name: 'essay_improvement',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      improved_essay: { type: 'string' },
      changes: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            original: { type: 'string' },
            improved: { type: 'string' },
            reason: { type: 'string' },
          },
          required: ['original', 'improved', 'reason'],
          additionalProperties: false,
        },
      },
    },
    required: ['improved_essay', 'changes'],
    additionalProperties: false,
  },
} as const

export const OUTLINE_GENERATION_JSON_SCHEMA = {
  name: 'essay_outlines',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      outline_1: { $ref: '#/$defs/outline' },
      outline_2: { $ref: '#/$defs/outline' },
    },
    required: ['outline_1', 'outline_2'],
    additionalProperties: false,
    $defs: {
      outline: {
        type: 'object',
        properties: {
          approach: { type: 'string' },
          structure_explanation: { type: 'string' },
          skeleton: {
            type: 'object',
            properties: {
              intro: { type: 'string' },
              body1: { type: 'string' },
              body2: { type: 'string' },
              conclusion: { type: 'string' },
            },
            required: ['intro', 'body1', 'body2', 'conclusion'],
            additionalProperties: false,
          },
          detailed: {
            type: 'object',
            properties: {
              intro: {
                type: 'object',
                properties: {
                  thesis_sample: { type: 'string' },
                  preview: { type: 'string' },
                },
                required: ['thesis_sample', 'preview'],
                additionalProperties: false,
              },
              body1: {
                type: 'object',
                properties: {
                  topic_sentence_sample: { type: 'string' },
                  argument_1: { type: 'string' },
                  argument_2: { type: 'string' },
                },
                required: ['topic_sentence_sample', 'argument_1', 'argument_2'],
                additionalProperties: false,
              },
              body2: {
                type: 'object',
                properties: {
                  topic_sentence_sample: { type: 'string' },
                  argument_1: { type: 'string' },
                  argument_2: { type: 'string' },
                },
                required: ['topic_sentence_sample', 'argument_1', 'argument_2'],
                additionalProperties: false,
              },
              conclusion: {
                type: 'object',
                properties: {
                  restatement_sample: { type: 'string' },
                  final_position: { type: 'string' },
                },
                required: ['restatement_sample', 'final_position'],
                additionalProperties: false,
              },
            },
            required: ['intro', 'body1', 'body2', 'conclusion'],
            additionalProperties: false,
          },
        },
        required: ['approach', 'structure_explanation', 'skeleton', 'detailed'],
        additionalProperties: false,
      },
    },
  },
} as const

export const ERROR_SUMMARY_JSON_SCHEMA = {
  name: 'error_summary',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      summary: { type: 'string' },
      strengths: { type: 'array', items: { type: 'string' } },
      weaknesses: { type: 'array', items: { type: 'string' } },
      recommendations: { type: 'array', items: { type: 'string' } },
    },
    required: ['summary', 'strengths', 'weaknesses', 'recommendations'],
    additionalProperties: false,
  },
} as const

export const PROMPT_CLASSIFICATION_JSON_SCHEMA = {
  name: 'prompt_classification',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      valid: { type: 'boolean' },
      topic_id: { type: ['string', 'null'] },
      question_type: { type: ['string', 'null'] },
      reason: { type: ['string', 'null'] },
    },
    required: ['valid', 'topic_id', 'question_type', 'reason'],
    additionalProperties: false,
  },
} as const

// grammar/coherence/task_response_depth items each carry a different shape depending on `type`.
// All possible fields across every `type` variant are declared as nullable so one flat schema
// can cover the union (strict JSON Schema requires a single fixed shape per array item).
const nullableStr = { type: ['string', 'null'] } as const

const grammarImprovementItem = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    original: nullableStr,
    improved: nullableStr,
    explanation: nullableStr,
    impact: nullableStr,
    location: nullableStr,
    error: nullableStr,
    correction: nullableStr,
    rule: nullableStr,
    severity: nullableStr,
    observation: nullableStr,
    missing_structures: { type: ['array', 'null'], items: { type: 'string' } },
    try_next: nullableStr,
  },
  required: [
    'type', 'original', 'improved', 'explanation', 'impact', 'location',
    'error', 'correction', 'rule', 'severity', 'observation', 'missing_structures', 'try_next',
  ],
  additionalProperties: false,
} as const

const coherenceImprovementItem = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    location: nullableStr,
    issue: nullableStr,
    suggestion: nullableStr,
    impact: nullableStr,
    strength: nullableStr,
    keep_doing: nullableStr,
    current: nullableStr,
    smoother: nullableStr,
    why: nullableStr,
  },
  required: [
    'type', 'location', 'issue', 'suggestion', 'impact',
    'strength', 'keep_doing', 'current', 'smoother', 'why',
  ],
  additionalProperties: false,
} as const

const taskResponseDepthItem = {
  type: 'object',
  properties: {
    type: { type: 'string' },
    location: nullableStr,
    idea: nullableStr,
    issue: nullableStr,
    how_to_develop: nullableStr,
    why_important: nullableStr,
    requirement: nullableStr,
    missing: nullableStr,
    fix: nullableStr,
    impact: nullableStr,
    strength: nullableStr,
    evidence: nullableStr,
    keep_doing: nullableStr,
  },
  required: [
    'type', 'location', 'idea', 'issue', 'how_to_develop', 'why_important',
    'requirement', 'missing', 'fix', 'impact', 'strength', 'evidence', 'keep_doing',
  ],
  additionalProperties: false,
} as const

export const DETAILED_GUIDANCE_JSON_SCHEMA = {
  name: 'detailed_guidance',
  strict: true,
  schema: {
    type: 'object',
    properties: {
      grammar_improvements: { type: 'array', items: grammarImprovementItem },
      coherence_improvements: { type: 'array', items: coherenceImprovementItem },
      task_response_depth: { type: 'array', items: taskResponseDepthItem },
      overall_assessment: {
        type: 'object',
        properties: {
          first_impression: { type: 'string' },
          strongest_aspect: { type: 'string' },
          maintain_this: { type: 'string' },
          priority_fixes: { type: 'array', items: { type: 'string' } },
          next_essay_goals: {
            type: 'object',
            properties: {
              grammar: { type: 'string' },
              structure: { type: 'string' },
              task: { type: 'string' },
              vocabulary: { type: 'string' },
            },
            required: ['grammar', 'structure', 'task', 'vocabulary'],
            additionalProperties: false,
          },
          encouragement: { type: 'string' },
        },
        required: [
          'first_impression', 'strongest_aspect', 'maintain_this',
          'priority_fixes', 'next_essay_goals', 'encouragement',
        ],
        additionalProperties: false,
      },
    },
    required: [
      'grammar_improvements', 'coherence_improvements', 'task_response_depth', 'overall_assessment',
    ],
    additionalProperties: false,
  },
} as const
