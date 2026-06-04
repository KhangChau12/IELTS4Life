'use client'

import { MessageCircle, Sparkles, Zap, Shield, Award } from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
}

interface FAQCategory {
  title: string
  icon: React.ElementType
  gradient: string
  borderColor: string
  faqs: FAQItem[]
}

const faqCategories: FAQCategory[] = [
  {
    title: 'General & Getting Started',
    icon: Sparkles,
    gradient: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-200',
    faqs: [
      {
        question: 'What is IELTS4Life and how does it work?',
        answer: 'IELTS4Life is an AI-powered IELTS Writing assistant that helps you improve your writing skills. Simply submit your essay, and our AI examiner analyzes it using official IELTS band descriptors to provide detailed feedback on all 4 assessment criteria: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.'
      },
      {
        question: 'Is IELTS4Life really free to use?',
        answer: 'Yes! You can start using IELTS4Life completely free without any credit card. New users get 4 free essay submissions to try out all features. No hidden fees, no automatic charges.'
      },
      {
        question: 'Do I need to create an account to use the IELTS essay scorer?',
        answer: 'No account is required to try the essay scorer! You can submit your first essay as a guest and see the results immediately. However, creating a free account allows you to track your progress over time, save your essays, and access vocabulary builder and progress analytics.'
      },
      {
        question: 'How accurate is the AI-powered IELTS scoring?',
        answer: 'Our AI is trained on official IELTS band descriptors and thousands of scored essays. It provides band scores that closely align with human IELTS examiners. While it\'s an excellent practice tool, we recommend getting human feedback from certified IELTS examiners before your actual exam.'
      },
      {
        question: 'Can this tool help me improve my IELTS Writing band score?',
        answer: 'Absolutely! Regular practice with detailed feedback is proven to improve writing skills. Our tool identifies specific errors, suggests improvements, and tracks your progress over time. Many users report band score improvements of 0.5 to 1.5 bands after consistent practice.'
      }
    ]
  },
  {
    title: 'Features & Usage',
    icon: Zap,
    gradient: 'from-blue-500 to-violet-600',
    borderColor: 'border-blue-200',
    faqs: [
      {
        question: 'What kind of feedback do I get on my IELTS essays?',
        answer: 'You receive comprehensive feedback including: (1) Band scores for all 4 IELTS criteria, (2) Overall band score, (3) Specific error identification with explanations, (4) Strengths and weaknesses analysis, (5) Actionable improvement suggestions, and (6) Vocabulary enhancement recommendations.'
      },
      {
        question: 'Does the tool work for both Task 1 and Task 2?',
        answer: 'Currently, IELTS4Life is optimized for IELTS Writing Task 2 (essay writing). We are working on adding Task 1 support for both Academic (graphs, charts, diagrams) and General Training (letters) in the near future.'
      },
      {
        question: 'How long does it take to get my essay scored?',
        answer: 'Our AI provides instant feedback! Most essays are analyzed and scored within 5 seconds. You\'ll receive your detailed band scores, error analysis, and improvement suggestions immediately after submission.'
      },
      {
        question: 'Can I track my progress over time?',
        answer: 'Yes! Registered users get access to a comprehensive progress dashboard showing band score trends over time, improvement areas, vocabulary growth, and writing patterns. You can visualize your improvement journey with interactive charts and graphs.'
      },
      {
        question: 'What is the vocabulary builder feature?',
        answer: 'Our vocabulary builder generates C1-C2 level paraphrases for your sentences and provides topic-specific vocabulary suggestions. You can save words to flashcards and practice with interactive quizzes to expand your academic vocabulary for IELTS.'
      }
    ]
  },
  {
    title: 'Privacy & Technical',
    icon: Shield,
    gradient: 'from-emerald-500 to-cyan-600',
    borderColor: 'border-emerald-200',
    faqs: [
      {
        question: 'How many free essays can I submit?',
        answer: 'New users receive 4 free essay submissions when they create an account. Guest users (without account) can submit 1 essay to try it out. After using your free quota, you can upgrade to a premium plan for unlimited submissions and advanced features.'
      },
      {
        question: 'Can I get more free essays after using my quota?',
        answer: 'Yes! We understand that financial constraints shouldn\'t limit your learning. You can earn 2 additional free essays by inviting a friend to join IELTS4Life using your referral code. When your friend signs up with your code, both of you receive 2 bonus essays. You can continue inviting more friends to keep earning free essays and help others improve their IELTS writing!'
      },
      {
        question: 'Is my essay data private and secure?',
        answer: 'Yes, we take privacy seriously. Your essays are encrypted and stored securely. We never share your writing with third parties. You can delete your essays anytime from your dashboard. All data processing complies with GDPR and data protection regulations.'
      },
      {
        question: 'Can I use this on mobile devices?',
        answer: 'Absolutely! IELTS4Life is fully responsive and works seamlessly on all devices - smartphones, tablets, and desktop computers. You can practice your IELTS writing anywhere, anytime.'
      }
    ]
  },
  {
    title: 'IELTS Specific',
    icon: Award,
    gradient: 'from-sky-500 to-cyan-600',
    borderColor: 'border-sky-200',
    faqs: [
      {
        question: 'Does this follow official IELTS band descriptors?',
        answer: 'Yes! Our AI scoring system is built on official IELTS band descriptors published by Cambridge and IDP. We assess essays using the same 4 criteria that human IELTS examiners use: Task Achievement, Coherence and Cohesion, Lexical Resource, and Grammatical Range and Accuracy.'
      },
      {
        question: 'Will this help me prepare for Academic or General Training IELTS?',
        answer: 'IELTS4Life currently focuses on Task 2 essay writing, which is similar for both Academic and General Training modules. The scoring criteria and essay structure are the same for both, so our feedback applies to both test types.'
      },
      {
        question: 'Can I use this to practice for my IELTS exam?',
        answer: 'Definitely! IELTS4Life is designed specifically for IELTS exam preparation. Practice with real IELTS essay prompts, get examiner-level feedback, and track your improvement. We recommend practicing regularly (2-3 essays per week) for best results.'
      },
      {
        question: 'How is IELTS4Life different from other IELTS preparation tools?',
        answer: 'IELTS4Life offers instant AI feedback (no waiting for tutors), detailed criterion-by-criterion scoring, vocabulary enhancement tools, progress tracking, and interactive learning features - all in one platform. Plus, you can start completely free without any payment information.'
      }
    ]
  }
]

export function FAQSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 to-cyan-50/50 py-12 md:py-24">
      {/* Background decoration */}
      <div className="absolute top-20 right-20 h-64 w-64 rounded-full bg-gradient-to-br from-cyan-200/30 to-blue-200/30 blur-3xl" />
      <div className="absolute bottom-20 left-20 h-64 w-64 rounded-full bg-gradient-to-br from-sky-200/30 to-cyan-200/30 blur-3xl" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mb-6 sm:mb-10 md:mb-16 text-center space-y-3 md:space-y-4">

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-sm md:text-base lg:text-lg text-slate-600 px-4">
            Everything you need to know about IELTS4Life
          </p>
        </div>

        {/* FAQ Categories */}
        <div className="mx-auto max-w-4xl space-y-8">
          {faqCategories.map((category, categoryIndex) => {
            const Icon = category.icon
            return (
              <div key={categoryIndex} className="space-y-4">
                {/* Category Header */}
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${category.gradient} shadow-lg`}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900">
                    {category.title}
                  </h3>
                </div>

                {/* FAQ Items */}
                <div className={`rounded-2xl bg-white border-2 ${category.borderColor} shadow-lg overflow-hidden`}>
                  <Accordion type="single" collapsible className="w-full">
                    {category.faqs.map((faq, faqIndex) => (
                      <AccordionItem
                        key={faqIndex}
                        value={`item-${categoryIndex}-${faqIndex}`}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <AccordionTrigger className="px-4 md:px-6 py-4 text-left hover:bg-slate-50/50 transition-colors [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-cyan-50/50 [&[data-state=open]]:to-blue-50/50 hover:no-underline">
                          <span className="text-base md:text-lg font-semibold text-slate-900 pr-4">
                            {faq.question}
                          </span>
                        </AccordionTrigger>
                        <AccordionContent className="px-4 md:px-6 pb-4 pt-2">
                          <p className="text-sm md:text-base text-slate-600 leading-relaxed">
                            {faq.answer}
                          </p>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </div>
              </div>
            )
          })}
        </div>

        {/* Still have questions CTA */}
        <div className="mt-12 md:mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-3 rounded-2xl bg-white p-6 md:p-8 shadow-xl border border-cyan-100">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600">
              <MessageCircle className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900">
              Still have questions?
            </h3>
            <p className="text-sm md:text-base text-slate-600 max-w-md">
              Can't find the answer you're looking for? Feel free to contact our support team.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
