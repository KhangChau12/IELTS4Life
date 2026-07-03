# Mobile Responsive Checklist

Target viewports: **375×812** (small phone — iPhone SE/mini baseline), **430×932** (large phone — iPhone Pro Max / large Android), both portrait, plus **844×390** (phone landscape — rotated iPhone 13/14).

No new Tailwind breakpoint needed for the portrait pair — both 375 and 430 fall below the default `sm:` (640px), so they share Tailwind's unprefixed base styles; differences between them are usually just fluid spacing/typography, not a missing breakpoint. Real gaps to watch for:
- Content that assumes `sm:` (640px) never applies below it — verify nothing depends on `sm:` alone to avoid being broken/cramped at both 375 and 430.
- An `xs:` breakpoint is referenced in some JSX (e.g. `xs:inline` in the flashcards Prev/Next buttons) but is **not defined** in `tailwind.config.ts` — it currently silently no-ops. If a checklist item needs an `xs` breakpoint below `sm` (e.g. ~420px) to fix a real 375-vs-430 difference, add it properly:
  ```js
  // tailwind.config.ts — theme.screens
  screens: {
    ...defaultTheme.screens,
    xs: "420px",
    ipad: "768px",
    "ipad-lg": "1194px",
  }
  ```
  Only add this if a genuine issue needs it — don't add speculatively.
- **Landscape phone (844×390)** is a short, wide viewport — the opposite failure mode from portrait. Watch for: content that assumes tall viewports (full-height flex columns, `min-h-screen` combined with fixed vertical stacks) causing everything to be pushed below the fold; sticky headers/tab bars eating a disproportionate share of the 390px height; modals/dialogs that don't fit or don't scroll.

Status values: `todo` | `in-progress` | `done` | `skip (reason)`

| # | Route | Status | Notes |
|---|-------|--------|-------|
| 1 | `/` (home) | done | Fixed doc-level overflow-x at 844 landscape / 768 iPad: added `overflow-hidden` to Band 8-9 section wrapper to clip unclipped `scale-110` glow backdrop |
| 2 | `/login` | done | At 844x390 landscape, redundant mobile logo + generous padding pushed Password/Sign-In below the fold; added `[@media(max-height:450px)]` overrides in `LoginClient.tsx` to hide the duplicate logo, tighten card padding/gaps, and shrink the heading — page remains scrollable as a fallback so nothing is unreachable |
| 3 | `/register` | done | Same short-landscape fold issue as `/login` but worse (6-field form incl. optional invite code box + "Check Your Email" success state); applied the same `[@media(max-height:450px)]` compaction pattern to `RegisterClient.tsx` across both the form and success states |
| 4 | `/forgot-password` | done | Applied the same `[@media(max-height:450px)]` compaction pattern as `/login` to both the form and "Email Sent" success state in `page.tsx` — landscape 844x390 now shows the full form with no scroll needed |
| 5 | `/reset-password` | done | Same `[@media(max-height:450px)]` compaction pattern applied to `page.tsx` (form, invalid-token, and success states) — verified invalid-token state (what unauthenticated visitors see) fits fully in landscape 844x390 with no scroll needed |
| 6 | `/dashboard` | done | Logged in with test account (42 essays). `ScoreChart.tsx` x-axis "Essay N" tick labels overlapped illegibly at 375/430 width for users with many essays (interval was width-agnostic); added a `window.innerWidth < 640` check to use a coarser tick interval (~4 labels) on narrow viewports only, `sm:`+ unaffected. Rest of dashboard (StatsStrip, CoverageMap, VocabularyProgress, RecentEssaysTable) already used fluid/wrap patterns and needed no changes |
| 7 | `/write` (prompt library) | done | Two real touch-target bugs found: `FeaturedPrompt.tsx` CTA buttons were `h-8` (32px) below `sm:`, raised to `h-11` (44px) on mobile only; `PromptCard.tsx`'s nested "View result" span (inside the card's outer `Link`) lacked `stopPropagation()`, risking a double-navigation race on tap — added it plus a larger tap area. Filter toolbar (`PromptFilters.tsx`) intentionally kept at its existing compact `h-8` density, consistent with the same pattern used on `/history` |
| 8 | `/write/[promptId]` (writing page) | done | At landscape 844x390 the always-expanded prompt card pushed the essay textarea almost entirely below the fold before any virtual keyboard even opens. Made the mobile prompt card collapsible (tap to expand/collapse, matching the existing AI Outline pattern) in `PromptWritingClient.tsx`, and default it to collapsed when `window.innerHeight < 450` on mount — portrait phone/iPad (tall enough) still defaults to expanded, unaffected |
| 9 | `/score/[essayId]` | done | Verified with a real essay across all 4 tabs (Score/Criteria/Improvement/Vocab) at 375/430/844 landscape. Sticky tab bar correctly covers scrolled-past content (expected behavior, not a bug); Criteria row expand/collapse, error/strength parsing, and Improvement diff highlighting all render cleanly with no overflow or overlap. No code changes needed |
| 10 | `/history` | done | Logged in with test account (42 essays). Both compact-mode and detailed-mode per-card action buttons ("View"/"Vocab-Gen") were `h-8 w-8` (32px) on mobile — real sub-44px touch targets on the most-repeated interactive element on the page. Raised to `h-11 w-11` below `sm:`/`ipad-lg:` in `HistoryListClient.tsx`; filter toolbar kept at its existing `h-8` compact density, consistent with `/write`'s filter bar |
| 11 | `/history/[essayId]/vocabulary` | done | Confirmed the hover-only word↔card highlight interaction had no touch equivalent — "Hover highlighted words..." instruction was meaningless on phones. Added an `onClick` handler in `VocabPageClient.tsx` (event delegation, same as the existing `onMouseOver`) that toggles the tapped word's highlight, and made the instructional copy read "Tap" below `sm:` / "Hover" at `sm:`+. Verified the matching `VocabCard` ring-highlight triggers correctly on tap |
| 12 | `/history/[essayId]/vocabulary/flashcards` | done | Already well-built for touch from the iPad pass (real swipe gesture via touch events, dot navigation, mobile-only swipe hint, desktop-only keyboard hint). Only gap: Prev/Flip/Next buttons were `h-10` (40px) below `sm:` — bumped to a uniform `h-11` (44px) at all sizes, no visual regression at desktop/iPad |
| 13 | `/history/[essayId]/vocabulary/quiz` | done | Completed a full 16-question quiz at 375 and 844 landscape. Question view (answer options, progress bar) and results/review screen (score card + single-column review list) both render cleanly with large tappable options and no overflow. Results list stays single-column below `ipad-lg` per the existing iPad-pass fix — long scroll is expected for a static review feed, not a bug. No code changes needed |
| 14 | `/invite` | done | Verified the iPad-pass overlap fix (flex-col code+button layout) holds cleanly at 375, 430, and 844 landscape — no regression, no overlap. No code changes needed |
| 15 | `/notifications` | done | Single-column long-form text feed already reads cleanly at 375/430/844 landscape — comfortable line lengths, no overflow, All/Unread toggle buttons well-sized. No code changes needed |
| 16 | `/subscription` | todo | plan cards, QR modal — QR image must stay legible/scannable at 375 width |
| 17 | `/privacy` | todo | |
| 18 | `/terms` | todo | |
| 19 | `/admin` (hub) | todo | |
| 20 | `/admin/statistics` | todo | charts grid — heaviest layout, priority for chart legibility at 375 |
| 21 | `/admin/prompts` | todo | |
| 22 | `/admin/prompts/review` | todo | |
| 23 | `/admin/notifications` | todo | |

## Per-page workflow (one page per loop iteration)

1. Pick the next `todo` route (top to bottom).
2. Start dev server (`npm run dev`) if not already running. Screenshot BEFORE at three viewports using Playwright: 375×812 (small portrait), 430×932 (large portrait), 844×390 (landscape). If the route needs auth, log in via Playwright with the test account (see `ipad-responsive-checklist.md` for the working login flow) — if it needs admin/dev role and the test account lacks it, mark `skip (cần auth admin)` and move to the next route.
3. Identify concrete problems specific to phone widths: overflow-x, text/buttons overlapping, touch targets <44px (this matters more on phone than tablet — no mouse fallback), content cut off or requiring excessive scroll, fixed/sticky elements (headers, tab bars, floating CTAs) overlapping each other or covering content, modals/dialogs taller than the viewport with no internal scroll, virtual-keyboard-safe spacing on forms (inputs near the bottom of the screen), landscape-specific issues (content pushed below the fold, sticky bars eating too much of the short 390px height).
4. Fix via Tailwind — base (unprefixed) classes for true small-phone issues, `sm:` for where 640px is genuinely the right threshold, or add a properly-defined `xs:` breakpoint per the note above if 375-vs-430 truly need different treatment. Layout/JSX changes are allowed if they improve phone UX (e.g., collapsing a hover-only interaction into a tap-to-reveal one, moving a floating action button so it doesn't cover content, adding `max-h-screen overflow-y-auto` to a modal).
5. Screenshot AFTER at all three phone viewports, compare against BEFORE. Also quick-check 768 iPad portrait and 1440 desktop for the same page to confirm nothing regressed (the iPad breakpoints were already tuned in `ipad-responsive-checklist.md` — don't undo that work).
6. Update this table's Status to `done` with a 1-line Notes summary of what changed.
7. Commit: `git add` only the touched files (+ this checklist) → commit message `fix(responsive): improve mobile layout for <route>`. Do not commit temporary Playwright scripts (`_*.js` at repo root) — delete them before committing.
8. Stop for this iteration. Next loop iteration picks the next `todo` row.
