import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { FileText, TrendingUp, BookOpen, Target, Sparkles, CheckCircle, Zap, ArrowRight } from 'lucide-react'
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
    url: 'https://ielts4life.com',
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
          text: 'IELTS4Life is an AI-powered IELTS Writing assistant that helps you improve your writing skills. Simply submit your essay, and our AI examiner analyzes it using official IELTS band descriptors to provide detailed feedback on all 4 assessment criteria: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.'
        }
      },
      {
        '@type': 'Question',
        name: 'Is IELTS4Life really free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! You can start using IELTS4Life completely free without any credit card. New users get 6 free essay submissions to try out all features. No hidden fees, no automatic charges.'
        }
      },
      {
        '@type': 'Question',
        name: 'How accurate is the AI-powered IELTS scoring?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI is trained on official IELTS band descriptors and thousands of scored essays. It provides band scores that closely align with human IELTS examiners. While it\'s an excellent practice tool, we recommend getting human feedback from certified IELTS examiners before your actual exam.'
        }
      },
      {
        '@type': 'Question',
        name: 'What kind of feedback do I get on my IELTS essays?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'You receive comprehensive feedback including: (1) Band scores for all 4 IELTS criteria, (2) Overall band score, (3) Specific error identification with explanations, (4) Strengths and weaknesses analysis, (5) Actionable improvement suggestions, and (6) Vocabulary enhancement recommendations.'
        }
      },
      {
        '@type': 'Question',
        name: 'How long does it take to get my essay scored?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Our AI provides instant feedback! Most essays are analyzed and scored within 5 seconds. You\'ll receive your detailed band scores, error analysis, and improvement suggestions immediately after submission.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I track my progress over time?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Registered users get access to a comprehensive progress dashboard showing band score trends over time, improvement areas, vocabulary growth, and writing patterns. You can visualize your improvement journey with interactive charts and graphs.'
        }
      },
      {
        '@type': 'Question',
        name: 'Does this follow official IELTS band descriptors?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! Our AI scoring system is built on official IELTS band descriptors published by Cambridge and IDP. We assess essays using the same 4 criteria that human IELTS examiners use: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.'
        }
      },
      {
        '@type': 'Question',
        name: 'Can I get more free essays after using my quota?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes! We understand that financial constraints shouldn\'t limit your learning. You can earn 6 additional free essays by inviting a friend to join IELTS4Life using your referral code. When your friend signs up with your code, both of you receive 6 bonus essays. You can continue inviting more friends to keep earning free essays and help others improve their IELTS writing!'
        }
      },
      {
        '@type': 'Question',
        name: 'Is my essay data private and secure?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes, we take privacy seriously. Your essays are encrypted and stored securely. We never share your writing with third parties. You can delete your essays anytime from your dashboard. All data processing complies with GDPR and data protection regulations.'
        }
      }
    ]
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
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-cyan-50 to-blue-50 py-8 md:py-12 lg:py-16">
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0 items-center">

              {/* Left Column - Text */}
              <div className="space-y-4 md:space-y-6 text-center lg:text-left z-20">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl leading-tight tracking-tight shadow-sm" style={{ fontFamily: 'var(--font-shrikhand)' }}>
                  <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-600 bg-clip-text text-transparent">IELTS</span>
                  <span className="text-slate-900">4LIFE</span>
                </h1>

                <p className="max-w-md text-base sm:text-lg md:text-xl leading-relaxed text-slate-700 mx-auto lg:mx-0 font-medium">
                  Instant band scores, detailed feedback, and vocabulary tools to help you achieve your target IELTS Writing score.
                </p>

                {/* CTA Button for guests */}
                {!user && (
                  <div className="flex flex-col items-center lg:items-start gap-6 pt-4">
                    <Link href="/write">
                      <Button
                        size="lg"
                        className="group relative h-auto px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-xl shadow-blue-500/25 transition-all hover:scale-[1.02] hover:shadow-blue-500/40 rounded-2xl text-lg font-bold overflow-hidden"
                      >
                        {/* Shine effect overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
                        
                        <span className="relative flex items-center gap-3">
                          <Sparkles className="w-5 h-5 text-blue-100" />
                          Try Free Essay Scoring Now
                          <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1 text-blue-100" />
                        </span>
                      </Button>
                    </Link>
                    
                    <div className="flex items-center gap-6 text-sm text-slate-600 font-medium">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-cyan-600" />
                        <span>No sign-up required</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-blue-600" />
                        <span>Instant results</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Screenshot Collage */}
              <div className="relative h-[450px] sm:h-[500px] md:h-[600px] lg:h-[700px] hidden md:block lg:-ml-12">

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
      <section className="bg-white py-12 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mb-8 md:mb-16 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-cyan-50 px-4 py-2 text-sm font-semibold text-cyan-700">
              <Target className="h-4 w-4" />
              Everything You Need
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900">
              Comprehensive IELTS Tools
            </h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base lg:text-lg text-slate-600 px-4">
              All the features you need to excel in IELTS Writing Task 2
            </p>
          </div>

          {/* Split Layout: Features 35% + Video 65% */}
          <div className="grid gap-6 lg:gap-8 lg:grid-cols-[35%_65%] items-start">
            {/* Left: Feature Cards (35%) */}
            <div className="grid gap-4 sm:gap-6">
              {/* Feature 1 */}
              <Card className="group border-0 bg-gradient-to-br from-white to-cyan-50/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="space-y-3 p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                      <FileText className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">AI Essay Scoring</CardTitle>
                      <CardDescription className="text-sm text-slate-600 leading-relaxed">
                        Get detailed band scores for all 4 IELTS criteria with authentic examiner-level assessment
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 2 */}
              <Card className="group border-0 bg-gradient-to-br from-white to-blue-50/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="space-y-3 p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">Detailed Feedback</CardTitle>
                      <CardDescription className="text-sm text-slate-600 leading-relaxed">
                        Receive specific error identification and actionable comments for improvement
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 3 */}
              <Card className="group border-0 bg-gradient-to-br from-white to-cyan-50/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="space-y-3 p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-500 shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                      <BookOpen className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">Vocabulary Builder</CardTitle>
                      <CardDescription className="text-sm text-slate-600 leading-relaxed">
                        Generate C1-C2 paraphrases and topic-specific vocabulary suggestions
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>

              {/* Feature 4 */}
              <Card className="group border-0 bg-gradient-to-br from-white to-sky-50/30 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                <CardHeader className="space-y-3 p-4 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-lg shadow-sky-500/50 group-hover:scale-110 transition-transform duration-300">
                      <TrendingUp className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-slate-900 mb-2">Progress Tracking</CardTitle>
                      <CardDescription className="text-sm text-slate-600 leading-relaxed">
                        Visualize improvement with charts and AI-powered insights on writing patterns
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </div>

            {/* Right: Video Demo (65%) */}
            <div className="lg:sticky lg:top-8">
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl p-4 md:p-6 border-2 border-cyan-200">
                <div className="flex items-center gap-2 mb-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
                    <Sparkles className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">See It In Action</h3>
                </div>

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

                <p className="text-sm text-slate-600 mt-4 text-center">
                  Watch how to submit your essay and get instant feedback in 2 minutes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-cyan-50/50 py-12 md:py-24">
        <div className="container relative z-10 mx-auto px-4">
          <div className="mb-8 md:mb-16 text-center space-y-3 md:space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-cyan-700 shadow-lg">
              <Zap className="h-4 w-4" />
              Simple Process
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900">
              How It Works
            </h2>
            <p className="mx-auto max-w-2xl text-sm md:text-base lg:text-lg text-slate-600 px-4">
              Three simple steps to improve your IELTS writing
            </p>
          </div>

          <div className="mx-auto max-w-4xl">
            <div className="space-y-4 md:space-y-8">
              {/* Step 1 */}
              <div className="group flex items-start gap-4 md:gap-6 rounded-2xl md:rounded-3xl bg-white p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 text-xl md:text-2xl font-black text-white shadow-lg shadow-cyan-500/50 group-hover:scale-110 transition-transform duration-300">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 md:mb-3 text-lg md:text-2xl font-bold text-slate-900">Submit Your Essay</h3>
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-slate-600">
                    Enter the essay prompt and paste your writing. Our AI examiner analyzes it using official IELTS band descriptors.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="group flex items-start gap-4 md:gap-6 rounded-2xl md:rounded-3xl bg-white p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-blue-500 to-violet-500 text-xl md:text-2xl font-black text-white shadow-lg shadow-blue-500/50 group-hover:scale-110 transition-transform duration-300">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 md:mb-3 text-lg md:text-2xl font-bold text-slate-900">Get Instant Feedback</h3>
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-slate-600">
                    Receive detailed scores for all 4 criteria, specific error identification, and expert comments on improvement areas.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="group flex items-start gap-4 md:gap-6 rounded-2xl md:rounded-3xl bg-white p-4 md:p-8 shadow-lg hover:shadow-2xl transition-all duration-300">
                <div className="flex h-12 w-12 md:h-16 md:w-16 flex-shrink-0 items-center justify-center rounded-xl md:rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-xl md:text-2xl font-black text-white shadow-lg shadow-emerald-500/50 group-hover:scale-110 transition-transform duration-300">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="mb-2 md:mb-3 text-lg md:text-2xl font-bold text-slate-900">Learn & Improve</h3>
                  <p className="text-sm md:text-base lg:text-lg leading-relaxed text-slate-600">
                    Track progress, enhance vocabulary with AI suggestions, and use flashcards and quizzes to reinforce learning.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Background decoration */}
        <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-200/30 blur-3xl" />
        <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-gradient-to-br from-sky-200/30 to-cyan-200/30 blur-3xl" />
      </section>

      {/* CTA Section - Enhanced with more visual elements */}
      <section className="relative overflow-hidden bg-gradient-to-br from-cyan-500 via-blue-500 to-cyan-600 py-12 md:py-24">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          {/* Large gradient orbs */}
          <div className="absolute -left-20 top-20 h-96 w-96 rounded-full bg-white/10 blur-3xl animate-pulse" />
          <div className="absolute -right-20 bottom-20 h-96 w-96 rounded-full bg-cyan-300/10 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[32rem] w-[32rem] rounded-full bg-white/5 blur-3xl" />

          {/* Floating shapes */}
          <div className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full bg-white/30 animate-float" />
          <div className="absolute top-1/3 right-1/3 h-3 w-3 rounded-full bg-cyan-200/40 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/2 h-5 w-5 rounded-full bg-white/20 animate-float" style={{ animationDelay: '1.5s' }} />
          <div className="absolute top-2/3 right-1/4 h-3 w-3 rounded-full bg-cyan-300/30 animate-float" style={{ animationDelay: '2s' }} />

          {/* Grid pattern overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,#000_60%,transparent_100%)]" />
        </div>

        <div className="container relative z-10 mx-auto px-4 text-center">
          <div className="mx-auto max-w-3xl space-y-5 md:space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 backdrop-blur-sm px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium text-white border border-white/30">
              <Sparkles className="h-4 w-4" />
              Start Your Journey Today
            </div>

            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black leading-tight text-white">
              Ready to Achieve Your
              <br />
              Target Band Score?
            </h2>
            <p className="text-base md:text-xl lg:text-2xl leading-relaxed text-cyan-50 px-4">
              Start improving your IELTS writing with AI-powered feedback
            </p>
            <div className="pt-2 md:pt-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="group relative overflow-hidden bg-white text-cyan-600 hover:bg-cyan-50 hover:scale-105 transition-all duration-300 shadow-2xl hover:shadow-white/50 px-6 py-4 md:px-10 md:py-7 text-base md:text-xl font-bold rounded-xl md:rounded-2xl"
                >
                  <Sparkles className="mr-2 h-4 md:h-5 w-4 md:w-5" />
                  Get Started Free
                  <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap items-center justify-center gap-3 md:gap-6 pt-2 md:pt-4 text-white/90">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-xs md:text-sm font-medium">Free to start</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-xs md:text-sm font-medium">No credit card</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 md:h-5 w-4 md:w-5 text-cyan-200" />
                <span className="text-xs md:text-sm font-medium">6 free essays</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />
    </div>
  )
}
