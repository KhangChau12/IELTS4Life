import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { FileText, TrendingUp, BookOpen, Target, Sparkles, CheckCircle, Zap, ArrowRight, Library, Lightbulb, Timer, Wand2, GitCompare, BadgeCheck } from 'lucide-react'
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
          text: 'Yes. No credit card needed. You get 4 free essay submissions the moment you register. Guest users (no account) get 1 free attempt.',
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 pt-12 pb-8 sm:py-10 md:py-12 lg:py-16">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-[200px] -right-[200px] h-[800px] w-[800px] rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/30 blur-3xl opacity-50" />
          <div className="absolute -bottom-[200px] -left-[200px] h-[800px] w-[800px] rounded-full bg-gradient-to-br from-sky-400/30 to-cyan-500/30 blur-3xl opacity-50" />
          <div className="absolute top-20 left-1/4 h-4 w-4 rounded-full bg-cyan-400/40 animate-float" />
          <div className="absolute top-40 right-1/4 h-3 w-3 rounded-full bg-blue-400/40 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-40 left-1/3 h-5 w-5 rounded-full bg-sky-400/40 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e0f2fe_1px,transparent_1px),linear-gradient(to_bottom,#e0f2fe_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-0 items-center">

              {/* Left Column - Text */}
              <div className="space-y-5 md:space-y-6 text-center lg:text-left z-20">
                <h1 className="text-5xl sm:text-6xl md:text-5xl lg:text-6xl xl:text-7xl leading-none tracking-tight" style={{ fontFamily: 'var(--font-shrikhand)' }}>
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 bg-clip-text text-transparent">IELTS</span>
                  <span className="text-slate-900">4LIFE</span>
                </h1>

                <p className="max-w-md text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 mx-auto lg:mx-0">
                  AI coach for IELTS Writing Task 2 — instant band scores, detailed feedback, and vocabulary tools.
                </p>

                {/* CTA Buttons for guests */}
                {!user && (
                  <div className="flex flex-col items-center lg:items-start gap-3 pt-1 md:pt-2">
                    {/* Primary CTA — inline/auto width, centered on mobile */}
                    <Link href="/score">
                      <Button
                        size="default"
                        className="group relative h-auto px-7 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] rounded-xl text-base font-bold overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        <span className="relative flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-blue-100" />
                          Try Essay Scoring — Free
                        </span>
                      </Button>
                    </Link>

                    {/* Secondary CTA — text link */}
                    <Link
                      href="/write"
                      className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-cyan-600 transition-colors font-medium"
                    >
                      <Library className="w-3.5 h-3.5" />
                      Browse prompt library
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    {/* Single clean trust line */}
                    <p className="text-xs text-slate-400">No sign-up needed · Instant results · 4 free essays</p>
                  </div>
                )}
              </div>

              {/* Mobile + iPad: screenshot, clean — no floating badges (collage below needs desktop-width room) */}
              <div className="block lg:hidden">
                <div className="relative mx-auto max-w-[320px] ipad:max-w-[420px]">
                  <div className="absolute inset-0 -z-10 bg-gradient-to-br from-cyan-200/50 to-blue-300/30 rounded-3xl blur-2xl scale-105" />
                  <div className="rounded-2xl shadow-xl overflow-hidden border-2 border-white/80 animate-float">
                    <Image
                      src="/screenshots/hero-scoring.png"
                      alt="AI-powered IELTS band scoring"
                      width={1440}
                      height={900}
                      unoptimized
                      className="w-full h-auto"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Desktop-only: Screenshot Collage (needs wide viewport for absolute-positioned satellite images) */}
              <div className="relative h-[700px] hidden lg:block lg:-ml-12">

                {/* 1. Main Dashboard - Center Hub */}
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[48%] z-30">
                  <div className="rounded-2xl shadow-2xl overflow-hidden border-[3px] border-white animate-float">
                    <Image
                      src="/screenshots/hero-dashboard.png"
                      alt="Progress tracking dashboard"
                      width={900}
                      height={1200}
                      unoptimized
                      className="w-full h-auto object-cover"
                      priority
                    />
                  </div>
                </div>

                {/* 2. Top-Left: Band Scoring - Bigger & On Top */}
                <div className="absolute top-[8%] -left-[6%] w-[50%] z-40">
                  <div className="rounded-xl shadow-xl overflow-hidden border-2 border-white/80 animate-float" style={{ animationDelay: '1.5s' }}>
                    <Image
                      src="/screenshots/hero-scoring.png"
                      alt="AI-powered band scoring"
                      width={1440}
                      height={900}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* 3. Top-Right: Detailed Feedback - Smaller */}
                <div className="absolute top-[12%] -right-[8%] w-[38%] z-20">
                  <div className="rounded-xl shadow-xl overflow-hidden border-2 border-white/80 animate-float" style={{ animationDelay: '0.5s' }}>
                    <Image
                      src="/screenshots/hero-feedback.png"
                      alt="Detailed feedback with highlights"
                      width={1280}
                      height={800}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* 4. Bottom-Right: Vocabulary - Bigger & Below Center */}
                <div className="absolute bottom-[10%] -right-[8%] w-[44%] z-20">
                  <div className="rounded-xl shadow-xl overflow-hidden border-2 border-white/80 animate-float" style={{ animationDelay: '2s' }}>
                    <Image
                      src="/screenshots/hero-vocab.png"
                      alt="Vocabulary and flashcards"
                      width={1120}
                      height={700}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* 5. Bottom-Left: Interactive Quiz - Smaller */}
                <div className="absolute bottom-[8%] left-[2%] w-[32%] z-40">
                  <div className="rounded-xl shadow-xl overflow-hidden border-2 border-white/80 animate-float" style={{ animationDelay: '1s' }}>
                    <Image
                      src="/screenshots/hero-quiz.png"
                      alt="Interactive vocabulary quiz"
                      width={960}
                      height={600}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* 6. Mid-Right: Improvement Tool - Increased size & overlap */}
                <div className="absolute top-1/2 -translate-y-1/2 -right-[15%] w-[30%] z-10">
                  <div className="rounded-lg shadow-lg overflow-hidden border border-white/60 animate-float" style={{ animationDelay: '2.5s' }}>
                    <Image
                      src="/screenshots/hero-improve.png"
                      alt="AI essay improvement tool"
                      width={760}
                      height={480}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>

                {/* 7. Mid-Left: History - Increased size & overlap */}
                <div className="absolute top-1/2 -translate-y-1/2 -left-[14%] w-[28%] z-10">
                  <div className="rounded-lg shadow-lg overflow-hidden border border-white/60 animate-float" style={{ animationDelay: '3s' }}>
                    <Image
                      src="/screenshots/hero-history.png"
                      alt="Essay submission history"
                      width={640}
                      height={400}
                      unoptimized
                      className="w-full h-auto"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Features Section with Video */}
      <section className="bg-white py-10 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-6 sm:mb-10 md:mb-16 text-center space-y-2 md:space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
              Comprehensive IELTS Tools
            </h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base lg:text-lg text-slate-600 px-4">
              All the features you need to excel in IELTS Writing Task 2
            </p>
          </div>

          {/* Mobile/portrait iPad: Video first, then 2×2 grid. Landscape iPad+: Feature cards 35% + Video 65% */}
          <div className="flex flex-col ipad-lg:grid ipad-lg:gap-8 ipad-lg:grid-cols-[35%_65%] ipad-lg:items-start gap-6">

            {/* Video - shown first on mobile via order, sticky on desktop */}
            <div className="order-first ipad-lg:order-last ipad-lg:sticky ipad-lg:top-8">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 md:p-6 border-2 border-cyan-200">
                <h3 className="text-base md:text-lg font-bold text-slate-900 mb-3 md:mb-4">See It In Action</h3>

                {/* Video Embed */}
                <div className="relative aspect-video rounded-xl overflow-hidden shadow-2xl bg-slate-900">
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

                <p className="text-xs md:text-sm text-slate-600 mt-3 md:mt-4 text-center">
                  Watch how to submit your essay and get instant feedback in 2 minutes
                </p>
              </div>
            </div>

            {/* Feature Cards - 2×2 grid on mobile/portrait iPad, vertical stack from landscape iPad up */}
            <div className="order-last ipad-lg:order-first grid grid-cols-2 ipad-lg:grid-cols-1 gap-3 sm:gap-4 lg:gap-6">
              {/* Feature 1 */}
              <Card className="group border-ocean-200 shadow-lg overflow-hidden relative bg-gradient-to-br from-white to-cyan-50/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <FileText className="absolute right-2 top-2 h-36 w-36 lg:h-48 lg:w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-1 lg:mb-2">AI Essay Scoring</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed hidden sm:block">
                    Get detailed band scores for all 4 IELTS criteria with authentic examiner-level assessment
                  </CardDescription>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed sm:hidden">
                    Band scores for all 4 IELTS criteria
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="group border-ocean-200 shadow-lg overflow-hidden relative bg-gradient-to-br from-white to-blue-50/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <Target className="absolute right-2 top-2 h-36 w-36 lg:h-48 lg:w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-1 lg:mb-2">Detailed Feedback</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed hidden sm:block">
                    Receive specific error identification and actionable comments for improvement
                  </CardDescription>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed sm:hidden">
                    Specific errors with rewrite suggestions
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="group border-ocean-200 shadow-lg overflow-hidden relative bg-gradient-to-br from-white to-cyan-50/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <BookOpen className="absolute right-2 top-2 h-36 w-36 lg:h-48 lg:w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-1 lg:mb-2">Vocabulary Builder</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed hidden sm:block">
                    Generate C1-C2 paraphrases and topic-specific vocabulary suggestions
                  </CardDescription>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed sm:hidden">
                    C1-C2 vocab from your own essay
                  </CardDescription>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="group border-ocean-200 shadow-lg overflow-hidden relative bg-gradient-to-br from-white to-sky-50/30 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <TrendingUp className="absolute right-2 top-2 h-36 w-36 lg:h-48 lg:w-48 text-ocean-300 opacity-20 rotate-[-12deg] pointer-events-none select-none [filter:drop-shadow(0_0_16px_rgba(14,165,233,0.3))]" />
                <CardHeader className="relative z-10 p-3 sm:p-4 md:p-6">
                  <CardTitle className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-1 lg:mb-2">Progress Tracking</CardTitle>
                  <CardDescription className="text-xs sm:text-sm text-slate-600 leading-relaxed hidden sm:block">
                    Visualize improvement with charts and AI-powered insights on writing patterns
                  </CardDescription>
                  <CardDescription className="text-xs text-slate-600 leading-relaxed sm:hidden">
                    Charts & AI insights on your writing
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

          </div>
        </div>
      </section>

      {/* Writing Prompts Library Section */}
      <section className="bg-gradient-to-br from-slate-50 to-cyan-50/30 py-10 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 ipad-lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 items-center">

              {/* Left Column: Text */}
              <div className="space-y-5 md:space-y-8">
                <div className="space-y-3 md:space-y-4">

                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                    Practice with Real{' '}
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">IELTS Prompts</span>
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed max-w-lg">
                    A curated bank of Task 2 prompts — browse by topic or question type, view AI-generated outlines, and write with a built-in timer.
                  </p>
                </div>

                {/* 3 Feature Bullets */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                      <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">Prompt Bank by Topic & Question Type</p>
                      <p className="text-xs sm:text-sm text-slate-600">7 formats including Agree/Disagree, Advantages & Disadvantages, Cause & Solution, and more — filterable by topic with your best score tracked</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg shadow-violet-500/30">
                      <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">AI Outline Suggestions</p>
                      <p className="text-xs sm:text-sm text-slate-600">Two AI-generated outlines per prompt to help you plan your essay structure before you start writing</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <Timer className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">Timed Writing Session</p>
                      <p className="text-xs sm:text-sm text-slate-600">Timer starts automatically when you begin writing — drafts auto-save so you never lose your work mid-session</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Mock Prompt Card */}
              <div className="flex justify-center lg:justify-end">
                <div className="w-full max-w-md animate-float">
                  <div className="relative rounded-2xl shadow-2xl border-2 border-cyan-200 bg-gradient-to-br from-white to-cyan-50/50 p-4 sm:p-6 space-y-3 sm:space-y-4">
                    {/* Timer badge */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4 flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-mono px-2 sm:px-2.5 py-1 rounded-full">
                      <Timer className="h-3 w-3" />
                      40:00
                    </div>

                    {/* Prompt text */}
                    <div className="pr-14 sm:pr-16">
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Prompt</p>
                      <p className="text-xs sm:text-sm md:text-base font-medium text-slate-800 leading-relaxed">
                        Some people think the best way to reduce crime is to give longer prison sentences. Others, however, believe there are better alternative methods.
                        <span className="text-slate-400"> Discuss both views and give your own opinion.</span>
                      </p>
                    </div>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2">
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-cyan-100 text-cyan-800 border border-cyan-200">
                        Discussion (Both Views)
                      </span>
                      <span className="inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
                        Society &amp; Crime
                      </span>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-cyan-100" />

                    {/* Outline columns */}
                    <div>
                      <p className="text-[11px] sm:text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">AI Outline Suggestions</p>
                      <div className="grid grid-cols-2 gap-2 sm:gap-3">
                        {[1, 2].map((n) => (
                          <div key={n} className="rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 border border-slate-200 p-3 space-y-2">
                            <p className="text-xs font-bold text-slate-700">Outline {n}</p>
                            {['Introduction', 'Body para 1', 'Body para 2', 'Conclusion'].map((item) => (
                              <div key={item} className="flex items-center gap-1.5">
                                <div className="h-1.5 w-1.5 rounded-full bg-cyan-400 flex-shrink-0" />
                                <div className="h-2.5 bg-slate-200 rounded flex-1" />
                              </div>
                            ))}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* Band 8–9 Rewrite Section */}
      <section className="bg-gradient-to-br from-slate-50 to-violet-50/30 py-10 md:py-24">
        <div className="container mx-auto px-5 sm:px-8 lg:px-6">
          <div className="mx-auto max-w-7xl">
            <div className="grid grid-cols-1 ipad-lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-16 items-center">

              {/* Left Column: Before / After Mock */}
              <div className="relative lg:order-first order-last min-w-0">
                {/* Glow backdrop */}
                <div className="absolute inset-0 -z-10 bg-gradient-to-br from-violet-100/60 via-purple-50/40 to-cyan-50/60 rounded-3xl blur-2xl scale-110" />

                <div className="relative space-y-3">
                  {/* BEFORE card */}
                  <div className="rounded-2xl border-2 border-red-200/80 bg-gradient-to-br from-red-50/60 to-white shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-red-50 border-b border-red-100">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-red-400" />
                      <span className="text-[11px] font-semibold text-red-600 uppercase tracking-wide truncate">Your Essay — Band 6.0</span>
                      <span className="ml-auto flex-shrink-0 text-[11px] text-red-400">Before</span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">Nowadays</span>
                        {' '}many people think that{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">using</span>
                        {' '}longer prison sentences is{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">good</span>
                        {' '}for reducing crime.{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">But</span>
                        {' '}others believe there are better ways to{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">deal with</span>
                        {' '}this problem. In my opinion, I think both sides have valid points.
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        The first reason why longer sentences can help is that{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">it stops criminals from doing crimes again</span>
                        . When people are in prison{' '}
                        <span className="bg-red-100 text-red-800 line-through decoration-red-400 rounded px-0.5">for a long time</span>
                        , they cannot commit any crimes.
                      </p>
                    </div>
                  </div>

                  {/* Arrow connector */}
                  <div className="flex items-center justify-center py-1">
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-1.5 shadow-lg shadow-violet-500/30">
                        <Wand2 className="h-3.5 w-3.5 text-white" />
                        <span className="text-xs font-bold text-white">AI Rewrite</span>
                      </div>
                      <div className="h-4 w-0.5 bg-gradient-to-b from-purple-400 to-cyan-400" />
                    </div>
                  </div>

                  {/* AFTER card */}
                  <div className="rounded-2xl border-2 border-emerald-200/80 bg-gradient-to-br from-emerald-50/60 to-white shadow-lg overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                      <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500" />
                      <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wide truncate">AI Rewrite — Band 8.5</span>
                      <span className="ml-auto flex-shrink-0 text-[11px] text-emerald-500">After</span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">In contemporary society</span>
                        {' '}there is ongoing debate regarding whether{' '}
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">imposing</span>
                        {' '}lengthier custodial sentences constitutes the most{' '}
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">efficacious</span>
                        {' '}approach to curbing criminal activity.{' '}
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">While proponents of this view argue for its deterrent effect,</span>
                        {' '}others contend that rehabilitative measures yield superior outcomes.
                      </p>
                      <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        One compelling argument in favour of extended incarceration is its role in{' '}
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">incapacitating repeat offenders</span>
                        . By{' '}
                        <span className="bg-emerald-100 text-emerald-800 font-medium rounded px-0.5">temporarily removing individuals from society</span>
                        , the likelihood of reoffending is directly curtailed during the period of imprisonment.
                      </p>
                    </div>
                  </div>

                  {/* Change log strip */}
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 sm:px-4 py-3">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Change Log</p>
                    <div className="space-y-1.5">
                      {[
                        { original: 'Nowadays', improved: 'In contemporary society', reason: 'More formal academic register' },
                        { original: 'it stops criminals', improved: 'incapacitating repeat offenders', reason: 'Precise academic phrasing' },
                        { original: 'But', improved: 'While proponents of this view…', reason: 'Cohesive discourse marker' },
                      ].map((change, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs min-w-0">
                          <BadgeCheck className="h-3.5 w-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                          <span className="min-w-0 break-words">
                            <span className="line-through text-red-500">{change.original}</span>
                            <span className="text-slate-400 mx-1">→</span>
                            <span className="font-medium text-emerald-700">{change.improved}</span>
                            <span className="text-slate-400 ml-1">— {change.reason}</span>
                          </span>
                        </div>
                      ))}
                      <p className="text-xs text-slate-400 pt-1">+ 20 more changes in full rewrite</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Text */}
              <div className="space-y-5 md:space-y-8 order-first lg:order-last">
                <div className="space-y-3 md:space-y-4">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
                    See Exactly How to{' '}
                    <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">Write Better</span>
                  </h2>
                  <p className="text-sm md:text-base lg:text-lg text-slate-600 leading-relaxed max-w-lg">
                    Every essay gets a full Band 8–9 rewrite — not just a score. See how an examiner-level writer would transform your exact sentences, then study the change log to understand every decision.
                  </p>
                </div>

                {/* 3 Feature Bullets */}
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/30">
                      <GitCompare className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">Side-by-side comparison</p>
                      <p className="text-xs sm:text-sm text-slate-600">Your original sentence next to the improved version — every substitution highlighted so you can spot the pattern</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/30">
                      <BadgeCheck className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">15–30 annotated changes</p>
                      <p className="text-xs sm:text-sm text-slate-600">Each change comes with a one-line explanation: why the original was weak and what the rewrite achieves at Band 8–9 level</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/30">
                      <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 mb-0.5 text-sm sm:text-base">Learn, don&apos;t just read</p>
                      <p className="text-xs sm:text-sm text-slate-600">Vocabulary from the rewrite feeds directly into your flashcard deck — study the exact words used in a Band 8–9 context</p>
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

      {/* CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 py-12 md:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl" />
          <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-white/30 animate-float" />
          <div className="absolute top-1/3 right-1/3 h-3 w-3 rounded-full bg-cyan-200/40 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 h-5 w-5 rounded-full bg-white/20 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-2/3 right-1/4 h-3 w-3 rounded-full bg-cyan-300/30 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-4 md:space-y-8">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
              Ready to Achieve Your
              <br />
              Target Band Score?
            </h2>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed text-cyan-50 px-4">
              Start improving your IELTS writing with AI-powered feedback
            </p>
            <div className="pt-1 md:pt-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-white text-cyan-600 hover:bg-cyan-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 px-7 py-4 sm:px-8 sm:py-4 md:px-10 md:py-7 text-base sm:text-base md:text-lg font-bold rounded-2xl"
                >
                  <Sparkles className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  Get Started Free
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-6 pt-1 md:pt-4 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-sm md:text-sm font-medium">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-sm md:text-sm font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-sm md:text-sm font-medium">4 free essays</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
