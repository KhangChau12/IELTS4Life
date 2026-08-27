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

// How far back "recent API cost" looks, for both providers. Quarter, not all-time — keeps the
// OpenAI Costs API call to a single page (<=90 daily buckets, well under its 180-bucket max).
const COST_LOOKBACK_DAYS = 90

// Fetches how many USD credits the app's OpenRouter key has consumed (this month + this quarter,
// approximated as usage_monthly since OpenRouter only exposes daily/weekly/monthly buckets, no
// arbitrary range). Uses the same OPENROUTER_API_KEY already used for completions — no separate
// management/provisioning key needed. Returns null on any failure so admin stats never break.
export async function fetchOpenRouterKeyUsage(): Promise<{ usageQuarterUsd: number; usageMonthlyUsd: number } | null> {
  try {
    const res = await fetch('https://openrouter.ai/api/v1/key', {
      headers: { Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    const json = await res.json()
    const usageMonthlyUsd = json?.data?.usage_monthly
    if (typeof usageMonthlyUsd !== 'number') return null
    // OpenRouter has no "last 90 days" bucket — usage_monthly is the closest built-in window.
    return { usageQuarterUsd: usageMonthlyUsd, usageMonthlyUsd }
  } catch {
    return null
  }
}

// Fetches how many USD the org has spent on OpenAI in the last COST_LOOKBACK_DAYS (+ this
// calendar month). Requires a separate Admin API key (OPENAI_ADMIN_API_KEY, created at
// platform.openai.com/settings/organization/admin-keys) — the regular OPENAI_API_KEY used for
// completions cannot call this endpoint. Returns null on any failure so admin stats never break.
export async function fetchOpenAICost(): Promise<{ costQuarterUsd: number; costMonthlyUsd: number } | null> {
  const adminKey = process.env.OPENAI_ADMIN_API_KEY
  if (!adminKey) return null

  try {
    const monthStart = new Date()
    monthStart.setUTCDate(1)
    monthStart.setUTCHours(0, 0, 0, 0)
    const monthStartUnix = Math.floor(monthStart.getTime() / 1000)

    const lookbackStart = Math.floor((Date.now() - COST_LOOKBACK_DAYS * 86400 * 1000) / 1000)

    const url = new URL('https://api.openai.com/v1/organization/costs')
    url.searchParams.set('start_time', String(lookbackStart))
    url.searchParams.set('limit', String(COST_LOOKBACK_DAYS))

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${adminKey}` },
      cache: 'no-store',
    })
    if (!res.ok) return null

    const json = await res.json()
    let costQuarterUsd = 0
    let costMonthlyUsd = 0
    for (const bucket of json?.data ?? []) {
      const bucketTotal = (bucket?.results ?? []).reduce(
        (sum: number, r: { amount?: { value?: number } }) => sum + (Number(r?.amount?.value) || 0),
        0
      )
      costQuarterUsd += bucketTotal
      if ((bucket?.start_time ?? 0) >= monthStartUnix) costMonthlyUsd += bucketTotal
    }

    return { costQuarterUsd, costMonthlyUsd }
  } catch {
    return null
  }
}

// Spread into every OpenRouter chat.completions.create() call.
// - reasoning.enabled: false -> skip reasoning tokens (not needed for structured JSON output tasks)
// - provider.sort: 'throughput' -> OpenRouter defaults to the CHEAPEST provider, which can be 15x+
//   slower (measured: 9s vs 0.5s for the same request); throughput sort picks the fastest instead.
export const OPENROUTER_FAST = {
  reasoning: { enabled: false },
  provider: { sort: 'throughput' },
} as { reasoning: { enabled: boolean }; provider: { sort: 'throughput' } }
