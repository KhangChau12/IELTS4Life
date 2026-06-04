# IELTS4Life

AI-powered IELTS Writing Task 2 coach. Submit essays, get instant band scores, build vocabulary, and track improvement over time.

**Live:** [ielts4life.com](https://ielts4life.com)

[![Demo](https://img.youtube.com/vi/kqPYIquPSsU/maxresdefault.jpg)](https://www.youtube.com/watch?v=kqPYIquPSsU&t=3s)

---

## Features

- **AI Scoring** — Instant band scores (0–9) across all 4 IELTS criteria using Groq (Llama 3.3 70B), with per-criterion comments, errors, and strengths
- **Essay Improvement** — AI-generated Band 8–9 rewrite with tracked changes + detailed grammar/coherence guidance
- **Vocabulary Tools** — C1-C2 paraphrase suggestions and topic vocab from your essay; flashcards (spaced repetition) and quizzes (multiple choice + fill-in-the-blank)
- **Prompts Library** — 7 question types, filterable by topic, with AI-generated outlines and timed writing sessions
- **Dashboard** — Score trends, error pattern analysis, quiz history, and usage stats
- **Referral System** — Share your invite code; both sides earn extra essay slots

## User Tiers

| Tier | Essays/day | Total | Cost |
|------|-----------|-------|------|
| Guest | 1 (device-limited) | 1 | Free |
| Free | 3 | 4 + referral bonus | Free |
| PTNK | 5 | Unlimited | Free (@ptnk.edu.vn) |
| Pro | 5 | Unlimited | 100,000 VND/month |

Pro access via subscription (SePay/MB Bank VietQR) or PTNK school email. Essay Packs (+15 essays) also available. Referral bonus: both referrer and referee earn +2 essays per successful signup.

## Tech Stack

- **Framework:** Next.js 14 App Router, TypeScript strict
- **Database/Auth:** Supabase (PostgreSQL + RLS)
- **AI:** Groq `llama-3.3-70b-versatile` (scoring) · OpenAI `gpt-4o` (vocab + summaries)
- **UI:** Tailwind CSS + shadcn/ui
- **Payments:** SePay webhook + MB Bank VietQR
- **Auth extras:** Google OAuth, Upstash Redis (rate limiting), FingerprintJS (guest tracking)

## Getting Started

```bash
npm install
cp .env.example .env.local   # fill in Supabase, Groq, OpenAI, SePay keys
npm run dev
```

For questions or issues: phuckhangtdn@gmail.com
