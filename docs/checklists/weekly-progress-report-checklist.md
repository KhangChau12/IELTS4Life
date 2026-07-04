# Weekly Progress Report — Implementation Checklist

## Context & Goal

Data pulled 2026-07-04 showed: 355 users, 0 completed payments (6/6 checkout attempts abandoned at `pending`), 156/284 free users with zero essays, and only 21 users have ever touched the quiz feature despite 3,207 AI-generated vocab words sitting unused. The product has no mechanism that pulls a user back in after their first session — retention is the actual blocker to revenue, not price or feature gating.

This feature closes that gap: an automated **weekly (and eventually monthly) email** summarizing a user's progress (score trend, coverage map delta, vocab learned, quiz accuracy), sent on a schedule via **Resend**. Goals, in priority order:
1. Give users an external reason to come back to the app (retention hook).
2. Make progress visible so continued use — and eventually paying for Pro — feels justified.
3. Surface the *dormant* SM-2 flashcard queue (`flashcards.next_review_date`) so the spaced-repetition system actually gets used, since it's already built but idle.

**Status values:** `todo` | `in-progress` | `done` | `blocked (reason)` | `skip (reason)`

---

## Prerequisites (blocking — confirm before starting Phase 1)

| # | Item | Status | Notes |
|---|------|--------|-------|
| P1 | Resend account created + API key issued | todo | User is doing this now. Needed before any send-path code can be tested end-to-end. |
| P2 | Sending domain verified in Resend (SPF + DKIM + DMARC records added at DNS host) | todo | Without domain verification, Resend either blocks sends or marks them as coming from an unverified/test domain — deliverability will be poor and likely land in spam. Use a subdomain like `mail.ielts4life.com` or `updates.ielts4life.com` to isolate report-sending reputation from the root domain (used for Supabase auth emails). |
| P3 | Decide the "From" address, e.g. `IELTS4Life <progress@updates.ielts4life.com>` | todo | Must belong to the verified domain from P2. |
| P4 | `RESEND_API_KEY` added to `.env.local` (dev) and Vercel project env vars (prod) | todo | Follow existing env var conventions in `CLAUDE.md` — do not hardcode the key anywhere in source. |
| P5 | Confirm Vercel plan supports Cron Jobs at the needed frequency | todo | Hobby plan allows cron but with limits (historically 1/day min granularity per job, subject to Vercel's current pricing page — verify at implementation time). Weekly cadence should be safely within any plan's limits regardless. |

---

## Phase 1 — Database & Data Layer

| # | Task | Status | Notes |
|---|------|--------|-------|
| 1 | New migration `supabase/migrations/045_add_weekly_report_preferences.sql` | todo | Adds `profiles.weekly_report_enabled boolean NOT NULL DEFAULT true` and `profiles.last_report_sent_at timestamptz NULL`. The enabled flag is the opt-out switch (required — do not skip, unsolicited recurring email without an opt-out is a spam/compliance risk). `last_report_sent_at` prevents double-sends if the cron fires twice or is manually re-triggered, and lets us later support "haven't emailed this user in >7 days" logic. Follow existing migration numbering — check `supabase/migrations/` for the actual latest number before naming this file (044 was the last one documented in CLAUDE.md as of this writing; verify no newer ones exist). |
| 2 | Update `types/database.ts` | todo | Add the two new `profiles` columns to the generated/hand-maintained Database interface, matching existing style. |
| 3 | Write `lib/reports/weekly-data.ts` — `getWeeklyReportData(userId, since: Date)` | todo | Single function that gathers everything the email needs for one user: essays created since `since` (count, avg score, score delta vs. prior period), coverage map deltas (which new topics/question types were touched this week — reuse the same computation logic already in `getAllDashboardData` for `coverage.topics`/`coverage.types`, do not reimplement scoring), vocab added this week (count by type), quiz attempts this week (from `profiles.quiz_total_*` — note these are cumulative counters, so you need a snapshot/delta approach, see task 4), and count of flashcards currently due (`next_review_date <= now`) to surface the dormant queue. Return `null` (not an empty object) if the user had zero activity this week — this signals "skip this user" to the caller so we don't email someone who did nothing (see task 8). |
| 4 | Decide how to compute weekly *quiz* delta given cumulative counters | todo | `profiles.quiz_total_attempts/correct/questions` are running totals, not per-period. Two options: (a) snapshot the counters into a new small table each time a report is sent, diff against the prior snapshot next time; (b) simplest — only report the current cumulative accuracy % and due-flashcard count, skip "this week's quiz activity" entirely since there's no per-attempt log (the `vocabulary_quiz_attempts` table was intentionally removed in migration 036 — do NOT recreate it just for this). Recommend (b) for v1: report current state, not weekly delta, for quiz stats specifically. Essays and vocab already have `created_at` timestamps so their weekly deltas are straightforward `gte(since)` queries — no new table needed for those. |
| 5 | Query: which users are eligible for a report this run | todo | `profiles` where `weekly_report_enabled = true` AND (`last_report_sent_at IS NULL` OR `last_report_sent_at < now - interval` matching cadence) AND has at least 1 essay ever (no point reporting to someone who's never used the product — that's an activation email, a different feature). Select only needed columns per the `SELECT *` ban in CLAUDE.md. |

---

## Phase 2 — Email Template

| # | Task | Status | Notes |
|---|------|--------|-------|
| 6 | Install `resend` and `react-email` (+ `@react-email/components`) as dependencies | todo | `npm install resend react-email @react-email/components`. Confirms with package.json conventions already in the repo (exact versions pinned, not loose ranges, matching the style of existing deps like `openai@4.65`). |
| 7 | Create `emails/WeeklyProgressReport.tsx` (new top-level `emails/` folder, mirroring how `react-email` projects are conventionally structured) | todo | JSX email component using `@react-email/components` primitives (`Html`, `Section`, `Text`, `Button`, etc. — these render to table-based HTML under the hood for email client compatibility, do not hand-roll divs/flexbox). Sections: greeting with name, headline stat (essays this week + score delta, color-coded same green/amber/red bands as `getScoreColor()` in `lib/utils/score.ts` — reuse the same thresholds so the email feels consistent with the app), coverage map teaser (1-2 lines: "You tried 2 new question types this week" or "X topics still untouched" if zero new ones — mirror the CoverageMap headline-hook tone described in CLAUDE.md), vocab count added, a due-flashcards CTA if `dueFlashcards > 0` ("You have N cards ready to review" linking to `/history` or a flashcard entry point), and a single primary CTA button linking to `/dashboard`. Keep it short — one scroll's worth of content, this is a nudge not a full report page. |
| 8 | Zero-activity fallback copy | todo | For users who technically qualify (opted in, have ≥1 essay ever) but did nothing this week (`getWeeklyReportData` returned `null` per task 3) — decide: either skip sending entirely (recommended for v1, avoids "nagging" tone) or send a distinct lighter-touch "we miss you" variant. Do not send the same "here's your progress" template with all-zero stats — reads as broken/awkward. |
| 9 | Unsubscribe / preference link in every email footer | todo | Must link somewhere that flips `weekly_report_enabled = false` — e.g. `/api/reports/unsubscribe?token=...` using a signed token (not just the raw userId, to prevent anyone toggling anyone else's preference) or route it through an authenticated `/notifications` settings toggle if the user is logged in. This is not optional — required for deliverability (providers penalize senders with no unsubscribe path) and basic email compliance (CAN-SPAM / similar). |
| 10 | Local preview via `react-email`'s dev server | todo | `react-email` ships a local preview app (`npx react-email dev` or equivalent per installed version) to visually check the template without sending real emails — use this to iterate on layout before wiring up real sends. |
| 10a | Self-review pass 1 — content & tone | todo | With the preview open, re-read the template as if you were a user who wrote 2 essays this week and scored 6.0. Check: does the headline stat feel like a genuine "you made progress" moment or a flat report? Is the tone consistent with the CoverageMap headline-hook style already in the app (encouraging, one clear next action) rather than a dry analytics dump? Revise copy/layout based on this pass — do not treat the first draft from task 7 as final. |
| 10b | Self-review pass 2 — edge cases in the preview | todo | Re-render the preview with at least 3 synthetic data variants: (a) a strong week (multiple essays, score improved, new topics covered, flashcards due), (b) a minimal-but-real week (1 essay, no score change, 0 new vocab), (c) the zero-activity case from task 8 if it's being sent at all. Confirm none of these produce awkward copy (e.g. "You improved by 0.0 bands!", double spaces from empty interpolated strings, a due-flashcards CTA showing "0 cards ready"). Fix any that read poorly. |
| 10c | Self-review pass 3 — send a real test email to yourself | todo | Once Resend sending is wired up (after task 11-13), send the template to your own inbox (not just the local preview) using 1-2 of the synthetic variants from 10b. Local preview rendering can differ from actual client rendering (Gmail clipping, dark mode inversion, image/font fallback). Check on both desktop and mobile mail client if possible. Only mark this task `done` after making any final adjustment this reveals — this is the last checkpoint before Phase 5's broader test, and it's specifically about polish (spacing, truncation, dark-mode readability), not just functional correctness. |

---

## Phase 3 — Sending Pipeline

| # | Task | Status | Notes |
|---|------|--------|-------|
| 11 | `lib/resend/client.ts` — thin wrapper exporting a singleton `Resend` client from the `resend` package, keyed off `process.env.RESEND_API_KEY` | todo | Mirror the existing `lib/openai/client.ts` pattern (module-level singleton, not re-instantiated per call) for consistency. |
| 12 | `app/api/cron/weekly-report/route.ts` | todo | `GET` (Vercel cron jobs call via GET by default) handler. **Must verify the request actually came from Vercel Cron** — check the `Authorization: Bearer ${CRON_SECRET}` header against a `CRON_SECRET` env var (Vercel's documented pattern), reject with 401 otherwise. This route is unauthenticated-by-default at the network level, so without this check anyone could trigger mass sends by hitting the URL. Add `CRON_SECRET` to the env var list in this checklist's Prerequisites if not already planned. |
| 13 | Route logic | todo | Fetch eligible users (task 5) → for each, call `getWeeklyReportData` (task 3) → skip if `null` per task 8's decision → render `WeeklyProgressReport` email → send via Resend. Use Resend's **batch send API** if available in the installed SDK version (sending 100+ individual emails serially inside a single serverless invocation risks hitting `maxDuration` — check Vercel's function timeout for the plan in use and batch/paginate accordingly, e.g. process 50 users per invocation and rely on cron frequency, or use `Promise.allSettled` with a concurrency cap). |
| 14 | Update `last_report_sent_at` per user after successful send | todo | Only update on confirmed send success (check Resend's response) — if a send fails, leave `last_report_sent_at` untouched so the next cron run retries that user rather than silently skipping them for a week. |
| 15 | Error handling & logging | todo | Wrap each per-user send in try/catch so one failure doesn't abort the whole batch. Per the `CLAUDE.md` "no token logging" precedent, don't log full email bodies or PII-heavy payloads — log user id + success/failure + Resend error code only. |
| 16 | `vercel.json` cron declaration | todo | Add a `crons` entry pointing at `/api/cron/weekly-report` with the weekly schedule (e.g. `0 8 * * 0` for Sunday 8am UTC — confirm timezone semantics, Vercel cron runs in UTC, so pick the UTC hour that lands at a sensible Vietnam local time, UTC+7. 8am UTC = 3pm Vietnam, reasonable; adjust if a different local send-time is preferred). |

---

## Phase 4 — User-Facing Controls

| # | Task | Status | Notes |
|---|------|--------|-------|
| 17 | Add a toggle in `/notifications` (or wherever account/notification preferences live — check current structure before assuming a new page is needed) for "Weekly progress email" | todo | Simple switch bound to `profiles.weekly_report_enabled`, `PATCH`/`POST` to a small new API route or extend an existing profile-update route. Default is `true` (opt-out model) per Prerequisites P... — confirm this matches the product's tolerance for unsolicited email; if a stricter opt-in default is preferred, flip the migration default in task 1 accordingly before shipping. |
| 18 | Confirm email address source of truth | todo | `profiles.email` vs `auth.users.email` — verify these are always in sync in this codebase (they should be, since profiles extends auth.users per CLAUDE.md) before trusting `profiles.email` as the send target. |

---

## Phase 5 — Testing & Rollout

| # | Task | Status | Notes |
|---|------|--------|-------|
| 19 | Manual end-to-end test with the real test account | todo | Trigger the cron route manually (with the correct `CRON_SECRET` header) in a dev/staging environment pointed at a test inbox, confirm the email renders correctly in at least Gmail + one other client (Outlook web is a common second check), links work, unsubscribe works. |
| 20 | Dry-run against production data without sending | todo | Add a `?dryRun=true` query param support (dev-only, gated similarly to `NEXT_PUBLIC_DEV_BYPASS_GUEST`) that runs the full eligible-user query + data aggregation and logs/returns counts (how many would receive an email, how many would be skipped for zero activity) without actually calling Resend — sanity-check the numbers look reasonable (e.g. against the ~150 "active in last 7 days" estimate from the earlier stats pull) before the first real send. |
| 21 | First real send — small controlled batch | todo | Consider sending to a small manually-curated list first (e.g. the dev/admin test accounts, or explicitly opted-in beta testers) before opening to all eligible users, to catch any rendering/deliverability issues without spamming the full user base. |
| 22 | Monitor deliverability after first full send | todo | Check Resend's dashboard for bounce/complaint rates. High bounce = bad email data or domain reputation issue; high complaint = content/frequency problem. |
| 23 | Clean up any temporary scripts | todo | Delete any `_tmp-*.js` or ad-hoc test scripts created during implementation/testing, per repo convention (see `.gitignore`-adjacent practice already used for responsive-checklist Playwright scripts) — do not leave debug scripts in `scripts/` or repo root. |

---

## Explicitly Out of Scope for v1 (revisit later, not now)

- **Monthly digest** — mentioned as a future variant; build weekly first, generalize the cadence only if there's a reason to (e.g. weekly proves too frequent/annoying based on unsubscribe rate).
- **Vocab reuse tracking** ("did you use this learned word in a later essay") — a related but separate feature discussed earlier in this project's planning; do not fold it into this checklist's scope, track it separately if pursued.
- **Per-attempt quiz history** — do not recreate the removed `vocabulary_quiz_attempts` table; v1 reports cumulative quiz state only (task 4).
- **A/B testing send times/content** — premature before there's any baseline open/click data.

---

## Handoff Notes for Whoever Runs This Checklist

- Work top to bottom, one Phase at a time — later phases depend on earlier ones (can't test sending before the template exists; can't build the template meaningfully before the data shape is settled).
- Every `todo` with a "Notes" column caveat is a decision point, not just an implementation detail — resolve the caveat before writing code, not after.
- Commit per logical chunk (e.g. "migration + types", "email template", "cron route + sending"), not one giant commit — follow the repo's existing commit style (`git log` for recent examples).
- Do not mark Prerequisites as `done` until the actual Resend dashboard shows a verified domain — a plausible-looking DNS change that hasn't propagated/verified yet is not done.
