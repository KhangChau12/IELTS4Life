import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

if (!process.env.OPENROUTER_API_KEY) {
  throw new Error('Missing OPENROUTER_API_KEY environment variable')
}

// OpenRouter client for essay scoring/improvement/guidance/outline/classify (fast, cheap)
export function createOpenRouterClient(): OpenAI {
  return new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  })
}

// OpenAI client for vocabulary (best quality, with caching)
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Model configuration for different tasks
export const MODELS = {
  // Use OpenRouter (DeepSeek V4 Flash) for scoring/improvement (fast, cheap)
  ESSAY_SCORING: 'deepseek/deepseek-v4-flash-0731',
  ESSAY_IMPROVEMENT: 'deepseek/deepseek-v4-flash-0731',
  ERROR_SUMMARY: 'deepseek/deepseek-v4-flash-0731',
  OUTLINE_GENERATION: 'deepseek/deepseek-v4-flash-0731',

  // Use OpenAI GPT-4o for vocabulary (best quality, with caching)
  VOCABULARY: 'gpt-4o',
}

export const DEFAULT_MODEL = 'deepseek/deepseek-v4-flash-0731'

// Spread into every OpenRouter chat.completions.create() call.
// - reasoning.enabled: false -> skip reasoning tokens (not needed for structured JSON output tasks)
// - provider.sort: 'throughput' -> OpenRouter defaults to the CHEAPEST provider, which can be 15x+
//   slower (measured: 9s vs 0.5s for the same request); throughput sort picks the fastest instead.
export const OPENROUTER_FAST = {
  reasoning: { enabled: false },
  provider: { sort: 'throughput' },
} as { reasoning: { enabled: boolean }; provider: { sort: 'throughput' } }
