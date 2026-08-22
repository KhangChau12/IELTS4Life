'use client'

import Link from 'next/link'
import { Check, ArrowRight, Sparkles, Target } from 'lucide-react'

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

/** Done = filled check-dot in a tinted row. Gap = outlined dot + arrow, clickable. */
function CoverageRow({ item }: { item: CoverageItem }) {
  const done = item.count > 0

  if (done) {
    return (
      <div className="flex items-center gap-2.5 rounded-lg bg-emerald-50/70 px-2.5 py-2">
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-ocean-600">
          <Check className="h-2.5 w-2.5 text-white" strokeWidth={3.5} />
        </span>
        <span className="flex-1 truncate text-[12.5px] font-semibold text-slate-900">{item.label}</span>
        <span className="text-[11.5px] font-bold text-ocean-600">{item.count}×</span>
      </div>
    )
  }

  return (
    <Link
      href={targetHref(item)}
      className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 transition-colors hover:bg-slate-50"
    >
      <span className="h-[18px] w-[18px] shrink-0 rounded-full border-[1.5px] border-dashed border-slate-300" />
      <span className="flex-1 truncate text-[12.5px] font-semibold text-slate-500">{item.label}</span>
      <ArrowRight className="h-[13px] w-[13px] shrink-0 text-slate-400 transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

/** Compact dot for the topic grid — smaller footprint than the question-type rows. */
function TopicDot({ item }: { item: CoverageItem }) {
  const done = item.count > 0

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-md bg-emerald-50/70 px-2 py-1.5">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-ocean-600" />
        <span className="truncate text-xs font-semibold text-slate-900">{item.label}</span>
      </div>
    )
  }

  return (
    <Link href={targetHref(item)} className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-slate-50">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full border border-dashed border-slate-300" />
      <span className="truncate text-xs font-semibold text-slate-400">{item.label}</span>
    </Link>
  )
}

export function CoverageMap({ types, topics }: CoverageMapProps) {
  const typesDone = types.filter((t) => t.count > 0).length
  const topicsDone = topics.filter((t) => t.count > 0).length
  const totalDone = typesDone + topicsDone
  const totalItems = types.length + topics.length

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

  const TOPICS_COLLAPSED = 9
  const hasMoreTopics = orderedTopics.length > TOPICS_COLLAPSED

  return (
    <div className="space-y-3">
      {/* ── Headline hook: ONE slim next-action card, icon badge only (no full gradient banner) ── */}
      {nextAction ? (
        <Link
          href={targetHref(nextAction.item)}
          className="group flex items-center gap-4 rounded-2xl border border-ocean-100 bg-white px-5 py-4 shadow-sm transition-shadow hover:shadow-md"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[11px] bg-gradient-to-br from-ocean-600 to-cyan-600">
            <Target className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-0.5 flex flex-wrap items-center gap-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wide text-ocean-600">Your next practice</span>
              <span className="rounded-[5px] bg-violet-50 px-1.5 py-0.5 text-[11px] font-bold text-violet-700">
                {nextAction.item.label}
              </span>
            </div>
            <p className="truncate text-[13.5px] font-semibold text-slate-900">
              {nextAction.item.suggestedPromptText ?? `Try a ${nextAction.item.label} prompt`}
            </p>
          </div>
          <span className="hidden shrink-0 items-center gap-1.5 rounded-[9px] bg-ocean-900 px-4 py-2.5 text-[12.5px] font-bold text-white transition-transform group-hover:scale-105 sm:flex">
            Practise now
            <ArrowRight className="h-3.5 w-3.5" />
          </span>
          <ArrowRight className="h-4 w-4 shrink-0 text-ocean-400 sm:hidden" />
        </Link>
      ) : (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 px-5 py-4">
          <Sparkles className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-[13.5px] font-bold text-emerald-900">Full coverage unlocked!</p>
            <p className="text-xs text-emerald-700">You&apos;ve practised every question type and topic — you&apos;re exam-ready.</p>
          </div>
        </div>
      )}

      {/* ── Coverage grid ── */}
      <div className="rounded-2xl border border-ocean-100 bg-white p-5 shadow-sm md:p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <div>
            <h3 className="text-[15px] font-extrabold text-slate-900">Coverage Map</h3>
            <p className="text-xs text-slate-400">Question types and topics you&apos;ve practised</p>
          </div>
          <span className="text-xs font-bold text-ocean-600">
            {totalDone} of {totalItems} covered
          </span>
        </div>

        <div className="grid grid-cols-1 gap-7 md:grid-cols-2">
          {/* Question Types */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-slate-700">Question Types</span>
              <span className="text-[11.5px] font-bold text-ocean-600">
                {typesDone} / {types.length}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              {orderedTypes.map((item) => (
                <CoverageRow key={item.key} item={item} />
              ))}
            </div>
          </div>

          {/* Topics */}
          <div>
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[12.5px] font-bold text-slate-700">Topics</span>
              <span className="text-[11.5px] font-bold text-ocean-600">
                {topicsDone} / {topics.length}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1">
              {(hasMoreTopics ? orderedTopics.slice(0, TOPICS_COLLAPSED) : orderedTopics).map((item) => (
                <TopicDot key={item.key} item={item} />
              ))}
            </div>
            {hasMoreTopics && (
              <Link
                href="/write"
                className="mt-1 inline-block text-[11.5px] font-bold text-ocean-600 hover:text-ocean-800"
              >
                Show {orderedTopics.length - TOPICS_COLLAPSED} more →
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
