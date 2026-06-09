'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft, ChevronLeft, ChevronRight, RefreshCw, BrainCircuit, Layers } from 'lucide-react'
import Link from 'next/link'
import type { VocabularyItem } from '@/types/vocabulary'

type SlideState = 'visible' | 'exit-left' | 'exit-right' | 'enter-left' | 'enter-right'

export default function FlashcardsPage({ params }: { params: { essayId: string } }) {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [slideState, setSlideState] = useState<SlideState>('visible')

  const animating = useRef(false)
  const touchStartX = useRef<number | null>(null)

  const fetchVocabulary = useCallback(async () => {
    try {
      // No ?type param → API returns all vocab for this essay
      const res = await fetch(`/api/vocabulary/${params.essayId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch vocabulary')
      if (!data.vocabulary?.length) {
        setError('No vocabulary found for this essay')
      } else {
        setVocabulary(data.vocabulary)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vocabulary')
    } finally {
      setIsLoading(false)
    }
  }, [params.essayId])

  useEffect(() => { fetchVocabulary() }, [fetchVocabulary])

  const goToIndex = useCallback((next: number, dir: 'next' | 'prev') => {
    if (animating.current) return
    animating.current = true
    setIsFlipped(false)
    setSlideState(dir === 'next' ? 'exit-left' : 'exit-right')

    setTimeout(() => {
      setCurrentIndex(next)
      setSlideState(dir === 'next' ? 'enter-right' : 'enter-left')
      // two rAF to let browser paint the enter position before transitioning in
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setSlideState('visible')
        animating.current = false
      }))
    }, 200)
  }, [])

  const navigate = useCallback((dir: 'next' | 'prev') => {
    setCurrentIndex(cur => {
      const next = dir === 'next' ? cur + 1 : cur - 1
      if (next < 0 || next >= vocabulary.length) return cur
      goToIndex(next, dir)
      return cur // goToIndex handles the actual update
    })
  }, [vocabulary.length, goToIndex])

  const handleFlip = useCallback(() => setIsFlipped(f => !f), [])

  // Keyboard
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ' || e.key === 'Spacebar') { e.preventDefault(); handleFlip() }
      else if (e.key === 'ArrowRight') navigate('next')
      else if (e.key === 'ArrowLeft') navigate('prev')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [handleFlip, navigate])

  // Touch swipe
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return
    const dx = e.changedTouches[0].clientX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(dx) < 50) return // too short = tap = flip
    navigate(dx < 0 ? 'next' : 'prev')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3 text-ocean-400">
          <Layers className="h-8 w-8 animate-pulse" />
          <p className="text-sm">Loading flashcards…</p>
        </div>
      </div>
    )
  }

  if (error || vocabulary.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <Layers className="h-12 w-12 text-ocean-200 mx-auto mb-4" />
        <p className="text-ocean-600 mb-6">{error || 'No vocabulary available'}</p>
        <Link href={`/history/${params.essayId}/vocabulary`}>
          <Button variant="outline" className="border-ocean-200 text-ocean-700">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Vocabulary
          </Button>
        </Link>
      </div>
    )
  }

  const currentCard = vocabulary[currentIndex]
  const total = vocabulary.length
  const isFirst = currentIndex === 0
  const isLast = currentIndex === total - 1
  const useDots = total <= 12

  // Slide classes — duration-0 for instant off-screen placement, duration-300 for smooth enter
  const slideClass =
    slideState === 'exit-left'   ? 'opacity-0 -translate-x-16' :
    slideState === 'exit-right'  ? 'opacity-0 translate-x-16'  :
    slideState === 'enter-left'  ? 'opacity-0 -translate-x-16' :
    slideState === 'enter-right' ? 'opacity-0 translate-x-16'  :
    'opacity-100 translate-x-0'
  const slideDuration = slideState === 'visible' ? 'duration-300' : 'duration-0'

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12 select-none">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between pt-4 pb-5">
        <Link href={`/history/${params.essayId}/vocabulary`}>
          <Button variant="ghost" size="sm"
            className="text-ocean-600 hover:text-ocean-800 hover:bg-ocean-50 -ml-2 gap-1.5">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline text-sm">Back</span>
          </Button>
        </Link>

        <Link href={`/history/${params.essayId}/vocabulary/quiz`}>
          <Button size="sm" className="bg-ocean-600 hover:bg-ocean-700 text-white gap-1.5 h-8 px-3 rounded-lg">
            <BrainCircuit className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs font-medium">Take Quiz</span>
          </Button>
        </Link>
      </div>

      {/* ── Counter + progress ── */}
      <div className="flex items-center justify-between mb-3">
        <h1 className="text-lg sm:text-xl font-bold text-ocean-800 tracking-tight">Flashcards</h1>
        <span className="tabular-nums text-sm text-ocean-400">
          <span className="text-ocean-700 font-semibold">{currentIndex + 1}</span>
          <span className="mx-0.5 text-ocean-300">/</span>
          {total}
        </span>
      </div>

      {/* Dot indicators (≤12 cards) or thin progress bar (>12) */}
      {useDots ? (
        <div className="flex items-center gap-1.5 mb-5 flex-wrap">
          {vocabulary.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (i === currentIndex) return
                goToIndex(i, i > currentIndex ? 'next' : 'prev')
              }}
              aria-label={`Go to card ${i + 1}`}
              className={`rounded-full transition-all duration-200 ${
                i === currentIndex
                  ? 'w-6 h-2 bg-ocean-600'
                  : i < currentIndex
                  ? 'w-2 h-2 bg-ocean-300 hover:bg-ocean-400'
                  : 'w-2 h-2 bg-ocean-100 border border-ocean-200 hover:bg-ocean-200'
              }`}
            />
          ))}
        </div>
      ) : (
        <div className="h-1 bg-ocean-100 rounded-full mb-5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-ocean-500 to-cyan-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
          />
        </div>
      )}

      {/* ── Card with slide + flip ── */}
      <div
        className={`transition-all ease-out ${slideDuration} ${slideClass}`}
        style={{ perspective: '1400px' }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          className="relative w-full transition-transform duration-500 ease-out cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            // aspect-ratio ensures correct height on every screen size
            aspectRatio: '5 / 3',
            minHeight: '200px',
            maxHeight: '340px',
          }}
          onClick={handleFlip}
        >
          {/* ── FRONT: Word ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center px-6 sm:px-10 py-8
              bg-gradient-to-br from-ocean-500 via-ocean-600 to-cyan-700">
              {/* dot pattern */}
              <div className="absolute inset-0 opacity-[0.07]"
                style={{
                  backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                  backgroundSize: '28px 28px',
                }} />

              {/* large faint icon watermark */}
              <Layers className="absolute right-4 bottom-4 h-24 w-24 text-white opacity-5 rotate-[-12deg]" />

              <div className="relative flex flex-col items-center text-center gap-2 sm:gap-3 z-10">
                {currentCard.original_word ? (
                  <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold
                    tracking-widest uppercase text-ocean-100/80 bg-white/10 px-2.5 py-1 rounded-full">
                    replaces &ldquo;{currentCard.original_word}&rdquo;
                  </span>
                ) : (
                  <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-ocean-100/70">
                    vocabulary
                  </span>
                )}
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight break-words max-w-full">
                  {currentCard.suggested_word}
                </p>
              </div>

              <div className="absolute bottom-3 sm:bottom-4 flex items-center gap-1.5 text-white/30 text-[10px]">
                <RefreshCw className="h-3 w-3" />
                <span className="hidden sm:inline">tap to see meaning</span>
                <span className="sm:hidden">tap to reveal</span>
              </div>
            </div>
          </div>

          {/* ── BACK: Definition ── */}
          <div
            className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl"
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div className="relative w-full h-full flex flex-col items-center justify-center
              px-6 sm:px-10 py-8 bg-white border-2 border-ocean-100">
              {/* subtle top accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-ocean-400 to-cyan-400 rounded-t-2xl" />

              <div className="flex flex-col items-center text-center gap-3 w-full z-10 overflow-y-auto max-h-full py-4">
                <span className="text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-ocean-300">
                  definition
                </span>
                <p className="text-base sm:text-lg font-medium text-slate-700 leading-relaxed">
                  {currentCard.definition}
                </p>
                <div className="w-10 h-px bg-ocean-100 my-1" />
                <span className="text-lg sm:text-xl font-bold text-ocean-600">
                  {currentCard.suggested_word}
                </span>
              </div>

              <div className="absolute bottom-3 sm:bottom-4 flex items-center gap-1.5 text-ocean-200 text-[10px]">
                <RefreshCw className="h-3 w-3" />
                <span>tap to flip back</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <div className="flex items-center gap-2 sm:gap-3 mt-5">
        <Button
          onClick={() => navigate('prev')}
          disabled={isFirst}
          variant="outline"
          className="flex-1 h-10 sm:h-11 border-ocean-200 text-ocean-600
            hover:bg-ocean-50 hover:border-ocean-300 disabled:opacity-25
            rounded-xl gap-1 sm:gap-1.5 text-sm"
        >
          <ChevronLeft className="h-4 w-4 flex-shrink-0" />
          <span className="hidden xs:inline">Prev</span>
        </Button>

        <Button
          onClick={handleFlip}
          className="flex-[2] h-10 sm:h-11 bg-gradient-to-r from-ocean-600 to-cyan-600
            hover:from-ocean-700 hover:to-cyan-700 text-white shadow-md
            rounded-xl gap-2 font-semibold text-sm"
        >
          <RefreshCw className={`h-4 w-4 flex-shrink-0 transition-transform duration-500 ${isFlipped ? 'rotate-180' : ''}`} />
          {isFlipped ? 'Show Word' : 'Show Meaning'}
        </Button>

        <Button
          onClick={() => navigate('next')}
          disabled={isLast}
          variant="outline"
          className="flex-1 h-10 sm:h-11 border-ocean-200 text-ocean-600
            hover:bg-ocean-50 hover:border-ocean-300 disabled:opacity-25
            rounded-xl gap-1 sm:gap-1.5 text-sm"
        >
          <span className="hidden xs:inline">Next</span>
          <ChevronRight className="h-4 w-4 flex-shrink-0" />
        </Button>
      </div>

      {/* ── Keyboard hint — desktop only ── */}
      <div className="hidden sm:flex items-center justify-center gap-5 mt-5 text-[11px] text-ocean-300">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">←</kbd>
          <kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">→</kbd>
          <span className="ml-1">Navigate</span>
        </span>
        <span className="w-px h-3 bg-ocean-100" />
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-ocean-50 border border-ocean-100 font-mono">Space</kbd>
          <span className="ml-1">Flip</span>
        </span>
      </div>

      {/* ── Swipe hint — mobile only ── */}
      <p className="sm:hidden text-center text-[11px] text-ocean-300 mt-4">
        Swipe left / right to navigate · Tap card to flip
      </p>
    </div>
  )
}
