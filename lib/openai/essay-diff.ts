// Deterministic sentence-aligned word diff between a student's essay and its
// Band 8-9 rewrite. Produces {original, improved} hunks that are GUARANTEED to be
// verbatim substrings of their source — the LLM never generates the diff, so it
// cannot drift. Each hunk stays inside one aligned sentence pair so a highlight
// never spans unrelated text.
//
// Used by POST /api/essays/improve/diff. The model is only asked to LABEL the
// hunks (a short reason string), never to reproduce the spans.

import { diffWordsWithSpace } from 'diff'

export interface DiffHunk {
  original: string
  improved: string
  /** present when a whole sentence was rebuilt rather than a phrase swapped */
  kind?: 'sentence'
}

const STOPWORDS: Record<string, true> = {}
for (const w of 'a an the and or but of to in on at for with as by is are was were be been this that these those it its they their them there which who from so also then than into out up over under will would can could may might not no'.split(
  ' '
)) {
  STOPWORDS[w] = true
}
const isStop = (w: string) => STOPWORDS[w] === true

const norm = (s: string) => s.toLowerCase().replace(/[^a-z' ]+/g, '').replace(/\s+/g, ' ').trim()
const wordsOf = (s: string) => norm(s).split(' ').filter(Boolean)

function splitSentences(text: string): string[] {
  const out: string[] = []
  for (const para of text.split(/\n\s*\n/)) {
    const trimmed = para.trim()
    if (!trimmed) continue
    for (const s of trimmed.split(/(?<=[.!?])\s+(?=[A-Z"'])/)) {
      const t = s.trim()
      if (t) out.push(t)
    }
  }
  return out
}

function similarity(a: string, b: string): number {
  const A = uniq(wordsOf(a).filter((w) => !isStop(w)))
  const bSet: Record<string, true> = {}
  wordsOf(b)
    .filter((w) => !isStop(w))
    .forEach((w) => {
      bSet[w] = true
    })
  const bLen = Object.keys(bSet).length
  if (!A.length && !bLen) return 1
  let inter = 0
  A.forEach((w) => {
    if (bSet[w]) inter++
  })
  return inter / Math.max(A.length, bLen, 1)
}

function uniq(arr: string[]): string[] {
  const seen: Record<string, true> = {}
  const out: string[] = []
  arr.forEach((w) => {
    if (!seen[w]) {
      seen[w] = true
      out.push(w)
    }
  })
  return out
}

// Monotonic sentence alignment allowing 1:1, 2:1 and 1:2 merges.
function alignSentences(orig: string, imp: string): Array<[string, string]> {
  const O = splitSentences(orig)
  const I = splitSentences(imp)
  if (O.length === 0 || I.length === 0) {
    // fall back to a single whole-text pair
    return [[orig.trim(), imp.trim()]]
  }
  const pairs: Array<[string, string]> = []
  let i = 0
  let j = 0
  while (i < O.length && j < I.length) {
    const s11 = similarity(O[i], I[j])
    const s21 = i + 1 < O.length ? similarity(`${O[i]} ${O[i + 1]}`, I[j]) : -1
    const s12 = j + 1 < I.length ? similarity(O[i], `${I[j]} ${I[j + 1]}`) : -1
    if (s21 > s11 && s21 >= s12) {
      pairs.push([`${O[i]} ${O[i + 1]}`, I[j]])
      i += 2
      j += 1
    } else if (s12 > s11 && s12 > s21) {
      pairs.push([O[i], `${I[j]} ${I[j + 1]}`])
      i += 1
      j += 2
    } else {
      pairs.push([O[i], I[j]])
      i += 1
      j += 1
    }
  }
  // attach any leftovers to the last pair
  while (i < O.length) pairs[pairs.length - 1][0] += ` ${O[i++]}`
  while (j < I.length) pairs[pairs.length - 1][1] += ` ${I[j++]}`
  return pairs
}

// A change not worth showing the student: pure punctuation/case, a bare
// function-word swap, or a small inflection (student -> students).
function isTrivial(o: string, n: string): boolean {
  const on = norm(o)
  const nn = norm(n)
  if (!on || !nn || on === nn) return true
  const ow = wordsOf(o)
  const nw = wordsOf(n)
  if (ow.length === 1 && nw.length === 1) {
    if (isStop(ow[0]) && isStop(nw[0])) return true
    const [x, y] = [ow[0], nw[0]].sort((a, b) => a.length - b.length)
    if (y.startsWith(x) && y.length - x.length <= 2) return true
  }
  if (ow.every(isStop) && nw.every(isStop)) return true
  return false
}

function wordHunksWithin(o: string, n: string): DiffHunk[] {
  const parts = diffWordsWithSpace(o, n)
  const hunks: DiffHunk[] = []
  let i = 0
  while (i < parts.length) {
    if (!parts[i].added && !parts[i].removed) {
      i++
      continue
    }
    let removed = ''
    let added = ''
    let j = i
    while (j < parts.length) {
      const p = parts[j]
      if (p.added) {
        added += p.value
        j++
        continue
      }
      if (p.removed) {
        removed += p.value
        j++
        continue
      }
      if (/^\s+$/.test(p.value)) {
        // whitespace shared between both sides — keep the hunk contiguous
        removed += p.value
        added += p.value
        j++
        continue
      }
      break
    }
    hunks.push({ original: removed.trim(), improved: added.trim() })
    i = j
  }
  return hunks
}

// Rough "teaching value" so we keep the most useful hunks when a rewrite is heavy.
function score(o: string, n: string): number {
  const nw = wordsOf(n)
  const contentNew = nw.filter((w) => !isStop(w) && w.length > 3).length
  let s = contentNew * 2 + Math.min(nw.length, 8)
  if (/\b(good|bad|big|important|thing|a lot of|very|make|makes|get|problem|nice|many people|nowadays)\b/i.test(o)) {
    s += 4
  }
  if (nw.length > 12) s -= nw.length - 12
  return s
}

/**
 * Diff a student's essay against its Band 8-9 rewrite.
 * Every returned span is a verbatim substring of its source text.
 * Returns [] when the two texts are effectively identical (already Band 8+).
 */
export function buildEssayDiff(
  original: string,
  improved: string,
  {
    maxHunks = 20,
    sentenceRewriteThreshold = 0.45,
  }: { maxHunks?: number; sentenceRewriteThreshold?: number } = {}
): DiffHunk[] {
  if (!original?.trim() || !improved?.trim()) return []

  const pairs = alignSentences(original, improved)
  const hunks: DiffHunk[] = []
  for (const [o, n] of pairs) {
    if (norm(o) === norm(n)) continue
    const sim = similarity(o, n)
    if (sim < sentenceRewriteThreshold || o.split(/\s+/).length <= 6) {
      if (original.includes(o) && improved.includes(n)) {
        hunks.push({ original: o, improved: n, kind: 'sentence' })
      }
      continue
    }
    for (const h of wordHunksWithin(o, n)) {
      if (!h.original || !h.improved) continue
      if (isTrivial(h.original, h.improved)) continue
      if (original.includes(h.original) && improved.includes(h.improved)) hunks.push(h)
    }
  }

  const verified = hunks.filter((h) => original.includes(h.original) && improved.includes(h.improved))
  return verified
    .map((h, idx) => ({ h, idx, s: h.kind === 'sentence' ? 100 : score(h.original, h.improved) }))
    .sort((a, b) => b.s - a.s)
    .slice(0, maxHunks)
    .sort((a, b) => a.idx - b.idx)
    .map(({ h }) =>
      h.kind
        ? { original: h.original, improved: h.improved, kind: h.kind }
        : { original: h.original, improved: h.improved }
    )
}
