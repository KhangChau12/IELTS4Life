import OpenAI from 'openai'
import { logger } from '@/lib/logger'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing OPENAI_API_KEY environment variable')
}

// Collect all available Groq API keys
const groqApiKeys: string[] = []
for (let i = 1; i <= 10; i++) {
  const key = process.env[`GROQ_API_KEY_${i}`]
  if (key) groqApiKeys.push(key)
}

if (groqApiKeys.length === 0) {
  throw new Error('Missing GROQ_API_KEY_1 (or any GROQ_API_KEY_N) environment variable')
}

logger.info(`[Groq] Loaded ${groqApiKeys.length} API keys for rotation`)

// Track current key index for round-robin rotation
let currentGroqKeyIndex = 0

// Get next Groq API key (round-robin)
function getNextGroqKey(): string {
  const key = groqApiKeys[currentGroqKeyIndex]
  currentGroqKeyIndex = (currentGroqKeyIndex + 1) % groqApiKeys.length
  return key
}

// Create new Groq client with next available key
export function createGroqClient(): OpenAI {
  return new OpenAI({
    apiKey: getNextGroqKey(),
    baseURL: 'https://api.groq.com/openai/v1',
  })
}

// Groq client for fast, free tasks (essay scoring, improvement)
export const groqClient = createGroqClient()

// OpenAI client for vocabulary (better quality, with caching)
export const openaiClient = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Model configuration for different tasks
export const MODELS = {
  // Use Groq for scoring/improvement (fast, free)
  ESSAY_SCORING: 'llama-3.3-70b-versatile',
  ESSAY_IMPROVEMENT: 'llama-3.3-70b-versatile',
  ERROR_SUMMARY: 'llama-3.3-70b-versatile',
  OUTLINE_GENERATION: 'llama-3.3-70b-versatile',

  // Use OpenAI GPT-4o for vocabulary (best quality, with caching)
  VOCABULARY: 'gpt-4o',
}

// Backward compatibility
export const openai = groqClient
export const DEFAULT_MODEL = 'llama-3.3-70b-versatile'
