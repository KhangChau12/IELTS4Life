'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface FAQItem {
  question: string
  answer: string
  tag: 'general' | 'features' | 'privacy' | 'ielts'
}

const TAGS = [
  { value: 'general', label: 'Getting Started' },
  { value: 'features', label: 'Features' },
  { value: 'privacy', label: 'Privacy & Quotas' },
  { value: 'ielts', label: 'IELTS Specific' },
] as const

const faqs: FAQItem[] = [
  // --- Getting Started ---
  {
    tag: 'general',
    question: 'What is IELTS4Life and how does it work?',
    answer:
      'IELTS4Life is an AI-powered IELTS Writing Task 2 coach. Paste your essay, and the AI scores it across all 4 official criteria — Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy — then gives you specific errors, strengths, and a Band 8–9 rewrite to learn from.',
  },
  {
    tag: 'general',
    question: 'Is IELTS4Life really free to use?',
    answer:
      'Yes. No credit card needed. You get 4 free essay submissions the moment you register — enough to see real progress before deciding whether to upgrade. Guest users (no account) get 1 free attempt.',
  },
  {
    tag: 'general',
    question: 'Do I need to create an account?',
    answer:
      'No — paste your essay and get scored immediately as a guest. An account unlocks your essay history, progress charts, vocabulary tools, flashcards, and quizzes.',
  },
  {
    tag: 'general',
    question: 'How accurate is the AI scoring?',
    answer:
      'Our AI is trained on official IELTS band descriptors and thousands of scored essays, consistently producing scores that align closely with human examiners. For your actual exam, we always recommend a final check with a certified IELTS examiner — but for daily practice and self-correction, the AI is highly effective.',
  },
  {
    tag: 'general',
    question: 'Can this actually raise my IELTS band score?',
    answer:
      'Consistent practice with targeted feedback is the most direct path to improvement. Our tool pinpoints exactly which errors drag your score down — by criterion — so you fix the right things. Many users report 0.5 to 1.5 band improvements after regular practice.',
  },

  // --- Features ---
  {
    tag: 'features',
    question: 'What exactly does the feedback include?',
    answer:
      'Every submission returns: (1) band scores for all 4 criteria + overall band, (2) a list of specific errors with severity labels (Minor / Major / Critical) and rewrite suggestions, (3) strengths with quoted evidence from your essay, (4) examiner-style comments per criterion, (5) a full Band 8–9 rewrite of your essay with a change log explaining each improvement, and (6) personalized guidance on what to fix first.',
  },
  {
    tag: 'features',
    question: 'How fast do I get my results?',
    answer:
      'Scoring is instant — results appear within seconds of submitting. The Band 8–9 rewrite and detailed guidance generate in the background while you read your score, so everything is ready by the time you click through.',
  },
  {
    tag: 'features',
    question: 'What is the vocabulary builder?',
    answer:
      'After scoring, the AI identifies low-level words in your essay and suggests C1–C2 replacements with definitions. It also generates topic-specific academic vocabulary relevant to your prompt. Every word can be saved to smart flashcards (spaced repetition) and tested with multiple-choice quizzes — so you actually retain what you learn.',
  },
  {
    tag: 'features',
    question: 'What are the writing prompts?',
    answer:
      'The prompt library has real IELTS Task 2 questions across 7 question types (Agree/Disagree, Advantages & Disadvantages, Problem & Solution, Discussion, and more) organized by topic. Each prompt includes two AI-generated essay outlines to help you plan, plus a built-in countdown timer. Drafts auto-save so you never lose your work.',
  },
  {
    tag: 'features',
    question: 'How do the flashcards and quizzes work?',
    answer:
      'Flashcards use spaced repetition (SM-2 algorithm) — the same method used by Anki. Cards you struggle with appear more frequently; ones you know well are spaced out. Quizzes are multiple-choice and pull from your saved vocabulary. Your accuracy and attempt history are tracked on your dashboard.',
  },
  {
    tag: 'features',
    question: 'Can I track my improvement over time?',
    answer:
      'Yes. The dashboard shows your band score trend across all essays, per-criterion breakdowns, vocabulary growth, quiz accuracy, and your full essay history. You can filter by date range, score, and more.',
  },

  // --- Plans & Quotas ---
  {
    tag: 'privacy',
    question: 'What is the difference between Free and Pro?',
    answer:
      'Free users get 4 total essay submissions (3 per day). Pro users get 5 essays per day with no total cap — plus all the same features. Pro is 100,000 VND/month (≈ $4 USD). PTNK students with an @ptnk.edu.vn email get Pro access for free.',
  },
  {
    tag: 'privacy',
    question: 'What is the Essay Pack?',
    answer:
      'If you just need more essays without a monthly subscription, the Essay Pack adds 15 essays to your account for 50,000 VND — a one-time purchase. Great for exam season when you want to practice intensively for a short period.',
  },
  {
    tag: 'privacy',
    question: 'Can I get more essays without paying?',
    answer:
      'Yes — invite a friend with your referral code. When they sign up, both of you get 2 bonus essays. There is no limit to how many friends you can invite.',
  },
  {
    tag: 'privacy',
    question: 'Is my essay data private?',
    answer:
      'Your essays are stored securely and never shared with third parties. You can delete any essay from your dashboard at any time.',
  },
  {
    tag: 'privacy',
    question: 'Can I use IELTS4Life on my phone?',
    answer:
      'Yes — the site is fully responsive and works well on smartphones and tablets. No app download needed.',
  },

  // --- IELTS Specific ---
  {
    tag: 'ielts',
    question: 'Does the scoring follow official IELTS band descriptors?',
    answer:
      'Yes. The AI scores against the same 4 public band descriptors used by Cambridge and IDP examiners — Task Response, Coherence & Cohesion, Lexical Resource, and Grammatical Range & Accuracy. Scores are rounded to the nearest 0.5 band, exactly as in the real exam.',
  },
  {
    tag: 'ielts',
    question: 'Does it work for both Academic and General Training IELTS?',
    answer:
      'Yes. Task 2 is identical across both modules — the prompt style, scoring criteria, and expected essay structure are the same. Our feedback applies equally to both.',
  },
  {
    tag: 'ielts',
    question: 'Is this better than using Grammarly or ChatGPT for IELTS?',
    answer:
      'Grammarly only checks grammar and style — it has no concept of IELTS band scores or examiner criteria. ChatGPT can give general feedback but is not calibrated to official band descriptors and gives inconsistent results. IELTS4Life is purpose-built: every score, error label, and suggestion maps directly to how IELTS examiners evaluate writing.',
  },
  {
    tag: 'ielts',
    question: 'Should I still practice with a human tutor?',
    answer:
      'Both are valuable. IELTS4Life gives you unlimited, instant, consistent feedback every time you practice — something no tutor can match for daily drill. A human tutor adds nuance, motivation, and exam strategy. The ideal setup is to use IELTS4Life for regular practice and a tutor for periodic deeper reviews before your exam.',
  },
]

export function FAQSection() {
  const [activeTag, setActiveTag] = useState<string>('general')

  const filtered = faqs.filter((f) => f.tag === activeTag)

  return (
    <section className="relative overflow-hidden bg-white py-10 md:py-24">
      <div className="container relative z-10 mx-auto px-4">
        {/* Header */}
        <div className="mb-6 md:mb-12 text-center space-y-2 md:space-y-3">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-slate-900">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-xl text-sm md:text-base text-slate-500">
            Everything you need to know about IELTS4Life
          </p>
        </div>

        {/* Tag filter */}
        <div className="mb-6 md:mb-8 flex flex-wrap justify-center gap-2">
          {TAGS.map((tag) => (
            <button
              key={tag.value}
              onClick={() => setActiveTag(tag.value)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeTag === tag.value
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* FAQ Accordion */}
        <div className="mx-auto max-w-3xl">
          <Accordion type="single" collapsible className="w-full space-y-2">
            {filtered.map((faq, i) => (
              <AccordionItem
                key={`${faq.tag}-${i}`}
                value={`${faq.tag}-${i}`}
                className="rounded-xl border border-slate-200 bg-white px-2 shadow-sm data-[state=open]:border-slate-300 data-[state=open]:shadow-md transition-all"
              >
                <AccordionTrigger className="px-4 py-3.5 text-left text-sm sm:text-base font-semibold text-slate-900 hover:no-underline [&[data-state=open]]:text-cyan-700">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 pt-0 text-sm text-slate-600 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

      </div>
    </section>
  )
}
