import Link from 'next/link'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { FileText, Target, BookOpen, TrendingUp, Sparkles, ArrowRight, Library, Lightbulb, Timer, Wand2, GitCompare, BadgeCheck } from 'lucide-react'
import { createServerClient } from '@/lib/supabase/server'
import { FAQSection } from '@/components/home/FAQSection'

export default async function HomePage() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Structured Data for SEO
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'IELTS for Life',
    alternateName: 'IELTS 4 Life',
    url: 'https://www.ielts4life.com',
    description: 'Free AI-powered IELTS writing scorer and feedback tool. Get instant band scores, detailed feedback, and vocabulary enhancement for IELTS Writing Task 2.',
    applicationCategory: 'EducationalApplication',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    featureList: [
      'AI Essay Scoring',
      'Detailed Feedback',
      'Progress Tracking',
      'Vocabulary Builder',
      'Smart Flashcards',
      'Interactive Quizzes',
    ],
  }

  // VideoObject Schema for SEO
  const videoJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: 'IELTS4Life — How AI Essay Scoring Works',
    description:
      'See how to submit your IELTS Writing Task 2 essay and get instant AI band score feedback, detailed error analysis, and vocabulary suggestions.',
    thumbnailUrl: 'https://img.youtube.com/vi/kqPYIquPSsU/maxresdefault.jpg',
    uploadDate: '2024-01-01',
    duration: 'PT2M',
    contentUrl: 'https://www.youtube.com/watch?v=kqPYIquPSsU',
    embedUrl: 'https://www.youtube.com/embed/kqPYIquPSsU',
    publisher: {
      '@type': 'Organization',
      name: 'IELTS4Life',
      url: 'https://www.ielts4life.com',
    },
  }

  // FAQ Schema for SEO
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What is IELTS4Life and how does it work?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'IELTS4Life is an AI-powered IELTS Writing Task 2 coach. Paste your essay and the AI scores it across all 4 official criteria — Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy — then gives you specific errors, strengths, and a Band 8–9 rewrite to learn from.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is IELTS4Life really free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. No credit card needed. You get 5 free essay submissions the moment you register. Guest users (no account) get 1 free attempt.',
        },
      },
      {
        '@type': 'Question',
        name: 'How accurate is the AI-powered IELTS scoring?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI is trained on official IELTS band descriptors and thousands of scored essays, consistently producing scores that align closely with human examiners. For your actual exam, we recommend a final check with a certified IELTS examiner — but for daily practice and self-correction, the AI is highly effective.',
        },
      },
      {
        '@type': 'Question',
        name: 'What feedback do I get on my IELTS essay?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Every submission returns: band scores for all 4 criteria plus overall band, specific errors with severity labels and rewrite suggestions, strengths with quoted evidence, examiner-style comments per criterion, a full Band 8–9 rewrite with a change log, and personalized guidance on what to fix first.',
        },
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get my essay scored?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Scoring is instant — results appear within seconds of submitting.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does the scoring follow official IELTS band descriptors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. The AI scores against the same 4 public band descriptors used by Cambridge and IDP examiners. Scores are rounded to the nearest 0.5 band, exactly as in the real exam.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does IELTS4Life work for both Academic and General Training IELTS?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Task 2 is identical across both modules — the prompt style, scoring criteria, and expected essay structure are the same. Our feedback applies equally to both.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I earn more free essays without paying?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes — invite a friend with your referral code. When they sign up, both of you get 2 bonus essays. There is no limit to how many friends you can invite.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is my essay data private and secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Your essays are stored securely and never shared with third parties. You can delete any essay from your dashboard at any time.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is IELTS4Life better than Grammarly or ChatGPT for IELTS preparation?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Grammarly only checks grammar — it has no concept of IELTS band scores or examiner criteria. ChatGPT gives general feedback but is not calibrated to official band descriptors. IELTS4Life is purpose-built: every score, error label, and suggestion maps directly to how IELTS examiners evaluate writing.',
        },
      },
    ],
  }

  return (
    <div className="flex flex-col">
      {/* Add JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }}
      />

      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden pt-10 pb-16 sm:pb-20 md:pb-24 lg:pb-[220px] lg:pt-20">
        {/* one soft, purposeful accent wash — not a full-bleed gradient */}
        <div className="pointer-events-none absolute -right-40 -top-32 hidden h-[760px] w-[760px] rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.10),transparent_68%)] lg:block" />

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-10">

              {/* Text column */}
              <div className="space-y-5 text-center lg:space-y-6 lg:text-left">
                <h1 className="mx-auto max-w-[560px] text-[28px] leading-[1.18] font-extrabold tracking-tight text-slate-900 sm:text-4xl md:text-[40px] lg:mx-0 lg:text-[44px] lg:leading-[1.15]">
                  Know exactly why your essay scored what it did.
                </h1>
                <p className="text-xs font-bold text-cyan-700 sm:text-sm lg:text-[13.5px]">
                  Scored against official IELTS band descriptors — not a guess.
                </p>
                <p className="mx-auto max-w-md text-sm leading-relaxed text-slate-600 sm:text-base md:text-lg lg:mx-0 lg:max-w-[440px] lg:text-lg">
                  Paste your IELTS Writing Task 2 essay and get an instant band score, sentence-level feedback, and a full Band 8–9 rewrite — the same way an examiner would grade it.
                </p>

                {!user && (
                  <div className="flex flex-col items-center gap-3 pt-1 lg:items-start lg:gap-5 lg:pt-2">
                    <Link href="/score" className="w-full sm:w-auto">
                      <Button
                        size="default"
                        className="h-auto w-full rounded-xl bg-gradient-to-br from-cyan-600 to-sky-700 px-7 py-3.5 text-base font-bold text-white shadow-lg shadow-cyan-600/25 transition-all hover:scale-[1.02] hover:from-cyan-700 hover:to-sky-800 sm:w-auto"
                      >
                        <span className="flex items-center justify-center gap-2">
                          Try Essay Scoring — Free
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      </Button>
                    </Link>

                    <Link
                      href="/write"
                      className="inline-flex items-center gap-1.5 border-b border-slate-300 pb-0.5 text-sm font-medium text-slate-500 transition-colors hover:text-cyan-600"
                    >
                      <Library className="h-3.5 w-3.5" />
                      Browse prompt library
                    </Link>

                    <p className="text-xs text-slate-400">No sign-up needed · Instant results · 5 free essays</p>
                  </div>
                )}
              </div>

              {/* Mobile + iPad: compact collage */}
              <div className="block lg:hidden">
                <div className="relative mx-auto max-w-[320px] px-8 pb-8 ipad:max-w-[420px]">
                  <div className="pointer-events-none absolute -right-6 -top-10 hidden h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.10),transparent_70%)] ipad:block" />
                  <div className="relative z-20 overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
                    <Image
                      src="/screenshots/hero-dashboard.png"
                      alt="AI-powered IELTS band scoring dashboard"
                      width={1440}
                      height={900}
                      unoptimized
                      className="h-auto w-full"
                      priority
                    />
                  </div>
                  {/* small collage accents — only on iPad width, mobile stays single image */}
                  <div className="absolute -left-2 -top-7 z-30 hidden w-[44%] overflow-hidden rounded-xl border border-slate-200 shadow-lg ipad:block">
                    <Image
                      src="/screenshots/hero-scoring.png"
                      alt="AI-powered band scoring"
                      width={1440}
                      height={900}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                  <div className="absolute -right-4 bottom-2 z-10 hidden w-[40%] overflow-hidden rounded-xl border border-slate-200 shadow-lg ipad:block">
                    <Image
                      src="/screenshots/hero-vocab.png"
                      alt="Vocabulary and flashcards"
                      width={1120}
                      height={700}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop-only: screenshot collage (needs wide viewport for absolute-positioned satellite images) */}
              <div className="relative hidden h-[560px] lg:block">
                {/* Center hub */}
                <div className="absolute left-1/2 top-1/2 z-30 w-[47%] -translate-x-1/2 -translate-y-1/2">
                  <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-[0_20px_48px_-14px_rgba(15,23,42,0.22)]">
                    <Image
                      src="/screenshots/hero-dashboard.png"
                      alt="Progress tracking dashboard"
                      width={900}
                      height={1200}
                      unoptimized
                      className="h-auto w-full object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* Top-left: scoring */}
                <div className="absolute -left-[6%] top-[2%] z-40 w-[48%]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_14px_32px_-10px_rgba(15,23,42,0.2)]">
                    <Image
                      src="/screenshots/hero-scoring.png"
                      alt="AI-powered band scoring"
                      width={1440}
                      height={900}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>

                {/* Top-right: feedback */}
                <div className="absolute -right-[8%] top-[6%] z-20 w-[36%]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_14px_32px_-10px_rgba(15,23,42,0.2)]">
                    <Image
                      src="/screenshots/hero-feedback.png"
                      alt="Detailed feedback with highlights"
                      width={1280}
                      height={800}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>

                {/* Bottom-right: vocabulary */}
                <div className="absolute -right-[7%] bottom-[4%] z-20 w-[42%]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_14px_32px_-10px_rgba(15,23,42,0.2)]">
                    <Image
                      src="/screenshots/hero-vocab.png"
                      alt="Vocabulary and flashcards"
                      width={1120}
                      height={700}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>

                {/* Bottom-left: quiz */}
                <div className="absolute bottom-[2%] left-0 z-40 w-[30%]">
                  <div className="overflow-hidden rounded-xl border border-slate-200 shadow-[0_14px_32px_-10px_rgba(15,23,42,0.2)]">
                    <Image
                      src="/screenshots/hero-quiz.png"
                      alt="Interactive vocabulary quiz"
                      width={960}
                      height={600}
                      unoptimized
                      className="h-auto w-full"
                    />
                  </div>
                </div>

              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============ FEATURES ============ */}
      <section className="border-y border-slate-100 bg-slate-50 py-14 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-8 md:mb-14">
              <span className="text-xs font-bold tracking-wide text-cyan-700 sm:text-[13px]">WHAT YOU GET</span>
              <h2 className="mt-2.5 text-[22px] font-extrabold tracking-tight text-slate-900 sm:text-3xl md:text-4xl">
                Comprehensive IELTS tools, not just a score
              </h2>
              <p className="mt-3 max-w-xl text-sm text-slate-600 sm:text-base lg:text-base">
                Everything you need to go from guessing to understanding — in one workflow.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-16">
              {/* Feature list — bare colored icons, no container box */}
              <div className="flex flex-col">
                <div className="flex gap-4 border-b border-slate-200 py-5 sm:gap-[18px]">
                  <FileText className="mt-0.5 h-6 w-6 flex-shrink-0 text-cyan-600" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-extrabold text-slate-900">AI Essay Scoring</h3>
                    <p className="text-[13.5px] leading-relaxed text-slate-600">
                      Band scores for all 4 IELTS criteria with authentic examiner-level assessment.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-b border-slate-200 py-5 sm:gap-[18px]">
                  <Target className="mt-0.5 h-6 w-6 flex-shrink-0 text-blue-600" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-extrabold text-slate-900">Detailed Feedback</h3>
                    <p className="text-[13.5px] leading-relaxed text-slate-600">
                      Specific error identification with severity labels and rewrite suggestions.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 border-b border-slate-200 py-5 sm:gap-[18px]">
                  <BookOpen className="mt-0.5 h-6 w-6 flex-shrink-0 text-purple-600" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-extrabold text-slate-900">Vocabulary Builder</h3>
                    <p className="text-[13.5px] leading-relaxed text-slate-600">
                      C1–C2 paraphrases and topic-specific vocabulary from your own essay.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4 py-5 sm:gap-[18px]">
                  <TrendingUp className="mt-0.5 h-6 w-6 flex-shrink-0 text-emerald-600" strokeWidth={1.9} />
                  <div className="min-w-0">
                    <h3 className="mb-1 text-base font-extrabold text-slate-900">Progress Tracking</h3>
                    <p className="text-[13.5px] leading-relaxed text-slate-600">
                      Charts and AI-powered insights on your writing patterns over time.
                    </p>
                  </div>
                </div>
              </div>

              {/* Video */}
              <div className="relative">
                <div className="pointer-events-none absolute -right-5 -top-5 hidden h-[220px] w-[220px] rounded-full bg-[radial-gradient(circle,rgba(8,145,178,0.14),transparent_70%)] md:block" />
                <div className="relative aspect-video overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-sky-900 to-slate-900 shadow-[0_16px_36px_-10px_rgba(15,23,42,0.18)]">
                  <iframe
                    width="100%"
                    height="100%"
                    src="https://www.youtube.com/embed/kqPYIquPSsU?vq=hd1080"
                    title="IELTS4Life Tutorial - How to Use AI Essay Scoring"
                    frameBorder="0"
                    allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="absolute inset-0"
                  />
                </div>
                <p className="mt-3.5 text-center text-xs text-slate-400 sm:text-sm">
                  Watch how to submit your essay and get instant feedback in 2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WRITING PROMPTS LIBRARY ============ */}
      <section className="py-14 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-8 ipad-lg:grid-cols-2 ipad-lg:gap-14 lg:gap-[72px]">

              {/* Mock prompt card — shown first on iPad+ (visual before text reads better at that width), text-first only truly on mobile via order */}
              <div className="order-first flex justify-center ipad-lg:order-last ipad-lg:justify-end">
                <div className="w-full max-w-md">
                  <div className="relative space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_16px_40px_-12px_rgba(15,23,42,0.14)] sm:p-6">
                    <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 font-mono text-xs text-emerald-700 sm:right-4 sm:top-4">
                      <Timer className="h-3 w-3" />
                      40:00
                    </div>

                    <div className="pr-14 sm:pr-16">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">Prompt</p>
                      <p className="text-xs font-medium leading-relaxed text-slate-800 sm:text-sm md:text-base">
                        Some people think the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative methods.
                        <span className="text-slate-400"> Discuss both views and give your own opinion.</span>
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center rounded-md bg-cyan-50 px-2.5 py-1 text-[11px] font-bold text-cyan-700 sm:text-xs">
                        Discussion (Both Views)
                      </span>
                      <span className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 sm:text-xs">
                        Society &amp; Crime
                      </span>
                    </div>

                    <div className="border-t border-slate-100" />

                    <div>
                      <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 sm:text-xs">AI Outline Suggestions</p>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {[1, 2].map((n) => (
                          <div key={n} className="space-y-2 rounded-xl border border-slate-100 p-3">
                            <p className="text-xs font-extrabold text-slate-700">Outline {n}</p>
                            {['Introduction', 'Body para 1', 'Body para 2', 'Conclusion'].map((item) => (
                              <div key={item} className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 flex-shrink-0 rounded-full bg-cyan-500" />
                                <div className="h-2.5 flex-1 rounded bg-slate-100" />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text column */}
              <div className="order-last space-y-5 md:space-y-8 ipad-lg:order-first">
                <div className="space-y-3 md:space-y-4">
                  <span className="text-xs font-bold tracking-wide text-cyan-700 sm:text-[13px]">PROMPT LIBRARY</span>
                  <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[34px]">
                    Practice with real IELTS prompts
                  </h2>
                  <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-base lg:text-[15.5px]">
                    A curated bank of Task 2 prompts — browse by topic or question type, view AI-generated outlines, and write with a built-in timer.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-[22px]">
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <BookOpen className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-cyan-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">Prompt bank by topic &amp; question type</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        7 formats including Agree/Disagree, Advantages &amp; Disadvantages, Cause &amp; Solution, and more.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <Lightbulb className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-cyan-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">AI outline suggestions</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Two AI-generated outlines per prompt to help you plan your essay structure.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <Timer className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-cyan-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">Timed writing session</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Timer starts automatically — drafts auto-save so you never lose your work.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* ============ BAND 8–9 REWRITE ============ */}
      <section className="overflow-hidden border-y border-slate-100 bg-slate-50 py-14 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 items-center gap-8 ipad-lg:grid-cols-2 ipad-lg:gap-14 lg:gap-16">

              {/* Before / After mock */}
              <div className="order-last min-w-0 lg:order-first">
                <div className="space-y-3">
                  {/* BEFORE card */}
                  <div className="overflow-hidden rounded-2xl border border-red-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-red-100 bg-red-50 px-4 py-2">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                      <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-red-600">Your Essay — Band 6.0</span>
                    </div>
                    <div className="space-y-2 px-4 py-3">
                      <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                        <span className="rounded bg-red-100 px-0.5 text-red-800 line-through decoration-red-400">Nowadays</span>
                        {' '}many people think that{' '}
                        <span className="rounded bg-red-100 px-0.5 text-red-800 line-through decoration-red-400">using</span>
                        {' '}longer prison sentences is{' '}
                        <span className="rounded bg-red-100 px-0.5 text-red-800 line-through decoration-red-400">good</span>
                        {' '}for reducing crime.{' '}
                        <span className="rounded bg-red-100 px-0.5 text-red-800 line-through decoration-red-400">But</span>
                        {' '}others believe there are better ways to{' '}
                        <span className="rounded bg-red-100 px-0.5 text-red-800 line-through decoration-red-400">deal with</span>
                        {' '}this problem. In my opinion, I think both sides have valid points.
                      </p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1">
                    <div className="flex items-center gap-2 rounded-full bg-slate-900 px-4 py-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-white" />
                      <span className="text-xs font-bold text-white">AI Rewrite</span>
                    </div>
                  </div>

                  {/* AFTER card */}
                  <div className="overflow-hidden rounded-2xl border border-emerald-200/80 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-emerald-100 bg-emerald-50 px-4 py-2">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                      <span className="truncate text-[11px] font-semibold uppercase tracking-wide text-emerald-700">AI Rewrite — Band 8.5</span>
                    </div>
                    <div className="space-y-2 px-4 py-3">
                      <p className="text-xs leading-relaxed text-slate-700 sm:text-sm">
                        <span className="rounded bg-emerald-100 px-0.5 font-medium text-emerald-800">In contemporary society</span>
                        {' '}there is ongoing debate regarding whether{' '}
                        <span className="rounded bg-emerald-100 px-0.5 font-medium text-emerald-800">imposing</span>
                        {' '}lengthier custodial sentences constitutes the most{' '}
                        <span className="rounded bg-emerald-100 px-0.5 font-medium text-emerald-800">efficacious</span>
                        {' '}approach to curbing criminal activity.
                      </p>
                    </div>
                  </div>

                  {/* Change log strip */}
                  <div className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">Change Log</p>
                    <div className="space-y-1.5">
                      {[
                        { original: 'Nowadays', improved: 'In contemporary society' },
                        { original: 'it stops criminals', improved: 'incapacitating repeat offenders' },
                      ].map((change, i) => (
                        <div key={i} className="flex min-w-0 items-start gap-2 text-xs">
                          <BadgeCheck className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                          <span className="min-w-0 break-words">
                            <span className="text-red-500 line-through">{change.original}</span>
                            <span className="mx-1 text-slate-400">→</span>
                            <span className="font-medium text-emerald-700">{change.improved}</span>
                          </span>
                        </div>
                      ))}
                      <p className="pt-1 text-xs text-slate-400">+ 20 more changes in full rewrite</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Text column */}
              <div className="order-first space-y-5 md:space-y-8 lg:order-last">
                <div className="space-y-3 md:space-y-4">
                  <span className="text-xs font-bold tracking-wide text-violet-700 sm:text-[13px]">BAND 8–9 REWRITE</span>
                  <h2 className="text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl md:text-4xl lg:text-[34px]">
                    See exactly how to write better
                  </h2>
                  <p className="max-w-lg text-sm leading-relaxed text-slate-600 md:text-base lg:text-[15.5px]">
                    Every essay gets a full Band 8–9 rewrite — not just a score. See how an examiner-level writer would transform your exact sentences, then study the change log to understand every decision.
                  </p>
                </div>

                <div className="space-y-4 sm:space-y-[22px]">
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <GitCompare className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-violet-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">Side-by-side comparison</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Your original sentence next to the improved version — every substitution highlighted.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <BadgeCheck className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-violet-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">15–30 annotated changes</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Each change comes with a one-line explanation of why it improves the score.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3.5 sm:gap-[14px]">
                    <TrendingUp className="mt-0.5 h-[18px] w-[18px] flex-shrink-0 text-violet-600" strokeWidth={2.3} />
                    <div className="min-w-0">
                      <p className="mb-0.5 text-sm font-bold text-slate-900 sm:text-[14.5px]">Learn, don&apos;t just read</p>
                      <p className="text-xs leading-relaxed text-slate-600 sm:text-[13px]">
                        Vocabulary from the rewrite feeds directly into your flashcard deck.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* ============ CTA — asymmetric split, editorial not templated ============ */}
      <section className="bg-sky-950">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 ipad-lg:grid-cols-[1.3fr_1fr]">
            {/* Left: statement + action */}
            <div className="px-5 py-14 sm:px-8 md:py-20 lg:px-8 lg:py-[88px]">
              <h2 className="max-w-[480px] text-2xl font-extrabold leading-[1.2] tracking-tight text-white sm:text-3xl md:text-4xl lg:text-[40px] lg:leading-[1.15]">
                Stop guessing what an examiner would say.
              </h2>
              <p className="mt-3 max-w-[420px] text-sm leading-relaxed text-sky-200 sm:mt-4 sm:text-base">
                Five free essays, no card required. See your first band score in under a minute.
              </p>
              <Link href="/register" className="mt-6 inline-block sm:mt-10">
                <Button
                  size="lg"
                  className="rounded-lg bg-white px-7 py-3.5 text-sm font-bold text-sky-950 hover:bg-sky-50 sm:px-8 sm:py-4 sm:text-base"
                >
                  <span className="flex items-center gap-2">
                    Score my essay
                    <Sparkles className="h-4 w-4" />
                  </span>
                </Button>
              </Link>
            </div>

            {/* Right: concrete stats, breaks the centered-button template */}
            <div className="flex flex-col justify-center gap-6 border-t border-white/15 px-5 py-10 sm:px-8 ipad-lg:border-l ipad-lg:border-t-0 ipad-lg:py-[88px]">
              <div>
                <span className="text-4xl font-extrabold leading-none tracking-tight text-white lg:text-[64px]">5</span>
                <p className="mt-2.5 max-w-[220px] text-xs leading-relaxed text-sky-200 sm:text-sm lg:text-[14px]">
                  free essay scores when you register — no trial period, no credit card.
                </p>
              </div>
              <div className="h-px bg-white/15" />
              <div>
                <span className="text-3xl font-extrabold leading-none tracking-tight text-white lg:text-[36px]">8s</span>
                <p className="mt-2.5 max-w-[220px] text-xs leading-relaxed text-sky-200 sm:text-sm lg:text-[14px]">
                  average time to your first band score.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
