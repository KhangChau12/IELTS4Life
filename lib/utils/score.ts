export function calculateOverallScore(scores: {
  task_response: number
  coherence_cohesion: number
  lexical_resource: number
  grammatical_accuracy: number
}): number {
  const average =
    (scores.task_response +
      scores.coherence_cohesion +
      scores.lexical_resource +
      scores.grammatical_accuracy) /
    4

  // Round to nearest 0.5
  return Math.round(average * 2) / 2
}

export function getScoreColor(score: number): string {
  if (score >= 8) return 'text-violet-700'
  if (score >= 7) return 'text-teal-700'
  if (score >= 6) return 'text-sky-700'
  if (score >= 5) return 'text-orange-700'
  return 'text-rose-700'
}

/** Returns both text + bg classes — the single source of truth for score colours. */
export function getScoreTone(score: number | null): { text: string; bg: string } {
  if (score === null) return { text: 'text-slate-400', bg: 'bg-slate-100' }
  if (score >= 8) return { text: 'text-violet-700', bg: 'bg-violet-100' }
  if (score >= 7) return { text: 'text-teal-700',   bg: 'bg-teal-100'   }
  if (score >= 6) return { text: 'text-sky-700',    bg: 'bg-sky-100'    }
  if (score >= 5) return { text: 'text-orange-700', bg: 'bg-orange-100' }
  return { text: 'text-rose-700', bg: 'bg-rose-100' }
}

export function getScoreBadgeVariant(score: number): 'default' | 'secondary' | 'destructive' {
  if (score >= 7) return 'default'
  if (score >= 5.5) return 'secondary'
  return 'destructive'
}

export function getScoreLabel(score: number): string {
  if (score >= 8.5) return 'Excellent'
  if (score >= 7) return 'Good'
  if (score >= 6) return 'Competent'
  if (score >= 5) return 'Modest'
  return 'Limited'
}

export function formatScore(score: number | null): string {
  if (score === null) return 'N/A'
  return score.toFixed(1)
}
