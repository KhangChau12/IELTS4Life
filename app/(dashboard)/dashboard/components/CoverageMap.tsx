'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Compass, Check, ArrowRight, Sparkles, Target } from 'lucide-react'

interface CoverageItem {
  key: string
  label: string
  count: number
  suggestedPromptId: string | null
  suggestedPromptText: string | null
  suggestedTopicName: string | null
}

interface CoverageMapProps {
  types: CoverageItem[]
  topics: CoverageItem[]
}

function targetHref(item: CoverageItem) {
  // Prefer a concrete prompt; fall back to the library if none exists yet.
  return item.suggestedPromptId ? `/write/${item.suggestedPromptId}` : '/write'
}

/** Segmented completion bar — N cells, filled ones glow. Creates "almost there, fill it in" pull. */
function SegmentBar({ total, done, tone }: { total: number; done: number; tone: 'ocean' | 'cyan' }) {
  const fill = tone === 'ocean' ? 'bg-ocean-500' : 'bg-cyan-500'
  return (
    <div className="flex gap-1">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 flex-1 rounded-full transition-colors ${i < done ? fill : 'bg-slate-200'}`}
        />
      ))}
    </div>
  )
}

/** Done = small green chip. Untouched = inviting clickable pill (the actual hook). */
function CoverageChip({ item }: { item: CoverageItem }) {
  const done = item.count > 0

  if (done) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">
        <Check className="h-3.5 w-3.5 shrink-0" />
        {item.label}
        {item.count > 1 && <span className="text-xs text-emerald-500">·{item.count}</span>}
      </span>
    )
  }

  return (
    <Link
      href={targetHref(item)}
      className="group inline-flex items-center rounded-full bg-ocean-50 px-3 py-1.5 text-sm font-medium text-ocean-600 ring-1 ring-inset ring-ocean-100 transition-all hover:bg-ocean-600 hover:text-white hover:ring-ocean-600 hover:shadow-md"
    >
      {item.label}
      <span className="inline-flex max-w-0 overflow-hidden transition-[max-width] duration-200 group-hover:max-w-[1.25rem]">
        <ArrowRight className="ml-1.5 h-3.5 w-3.5 shrink-0" />
      </span>
    </Link>
  )
}

export function CoverageMap({ types, topics }: CoverageMapProps) {
  const typesDone = types.filter((t) => t.count > 0).length
  const topicsDone = topics.filter((t) => t.count > 0).length

  // Pick ONE concrete next action. Prefer an untouched question type (only 6 → a quick, satisfying
  // win), then fall back to an untouched topic. This is the headline hook.
  const nextType = types.find((t) => t.count === 0) || null
  const nextTopic = topics.find((t) => t.count === 0) || null
  const nextAction = nextType
    ? { kind: 'question type' as const, item: nextType }
    : nextTopic
      ? { kind: 'topic' as const, item: nextTopic }
      : null

  // Untouched-first ordering inside each group — the gaps are what we want users to act on.
  const orderGaps = (arr: CoverageItem[]) =>
    [...arr].sort((a, b) => {
      const ad = a.count > 0 ? 1 : 0
      const bd = b.count > 0 ? 1 : 0
      if (ad !== bd) return ad - bd // untouched (0) first
      return b.count - a.count
    })

  const orderedTypes = orderGaps(types)
  const orderedTopics = orderGaps(topics)

  return (
    <Card className="border-ocean-200 shadow-lg overflow-hidden relative">
      <Compass className="absolute right-2 top-2 h-48 w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />

      <CardContent className="relative z-10 p-5 md:p-6 space-y-6">
        {/* ── Heading ─────────────────────────────────────── */}
        <div>
          <h2 className="text-2xl font-bold text-ocean-800">Your IELTS Coverage Map</h2>
          <p className="text-sm text-slate-500">
            Practise every format and topic so nothing surprises you on exam day.
          </p>
        </div>

        {/* ── Headline hook: ONE clear next action ────────── */}
        {nextAction && (
          <Link
            href={targetHref(nextAction.item)}
            className="group flex items-start gap-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-cyan-600 px-5 py-4 text-white shadow-md transition-all hover:shadow-lg hover:from-ocean-700 hover:to-cyan-700"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/20 mt-0.5">
              <Target className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wide text-white/70">
                Your next practice
              </p>
              {/* Badges: question type + topic */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center rounded-md bg-white/20 px-2 py-0.5 text-xs font-semibold text-white">
                  {nextAction.item.label}
                </span>
                {nextAction.item.suggestedTopicName && (
                  <span className="inline-flex items-center rounded-md bg-white/15 px-2 py-0.5 text-xs font-medium text-white/85">
                    {nextAction.item.suggestedTopicName}
                  </span>
                )}
              </div>
              {/* Actual prompt text */}
              {nextAction.item.suggestedPromptText && (
                <p className="text-sm font-medium leading-snug text-white/90 line-clamp-2">
                  {nextAction.item.suggestedPromptText}
                </p>
              )}
            </div>
            <span className="hidden shrink-0 items-center gap-1.5 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold text-ocean-700 transition-transform group-hover:scale-105 sm:flex self-center">
              Practise now
              <ArrowRight className="h-4 w-4" />
            </span>
            <ArrowRight className="h-5 w-5 shrink-0 sm:hidden self-center" />
          </Link>
        )}

        {/* All done celebration */}
        {!nextAction && (
          <div className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-4 text-white shadow-md">
            <Sparkles className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-semibold">Full coverage unlocked! 🎉</p>
              <p className="text-sm text-white/80">
                You&apos;ve practised every question type and topic — you&apos;re exam-ready.
              </p>
            </div>
          </div>
        )}

        {/* ── Question Types ──────────────────────────────── */}
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">Question Types</h3>
            <span className="text-xs font-semibold text-ocean-600">{typesDone} of {types.length} tried</span>
          </div>
          <SegmentBar total={types.length} done={typesDone} tone="ocean" />
          <div className="mt-3 flex flex-wrap gap-2">
            {orderedTypes.map((item) => (
              <CoverageChip key={item.key} item={item} />
            ))}
          </div>
        </section>

        {/* ── Topics ──────────────────────────────────────── */}
        <section>
          <div className="mb-2 flex items-baseline justify-between gap-3">
            <h3 className="text-sm font-bold text-slate-800">Topics</h3>
            <span className="text-xs font-semibold text-cyan-600">{topicsDone} of {topics.length} explored</span>
          </div>
          <SegmentBar total={topics.length} done={topicsDone} tone="cyan" />
          <div className="mt-3 flex flex-wrap gap-2">
            {orderedTopics.map((item) => (
              <CoverageChip key={item.key} item={item} />
            ))}
          </div>
        </section>
      </CardContent>
    </Card>
  )
}
