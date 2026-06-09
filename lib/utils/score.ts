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
  if (score >= 8) return 'text-violet-600'
  if (score >= 7) return 'text-teal-600'
  if (score >= 6) return 'text-sky-600'
  if (score >= 5) return 'text-orange-500'
  return 'text-red-600'
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
