import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    const { essay_id, vocab_type, score, total_questions } = await request.json()

    if (!essay_id || !vocab_type) {
      return NextResponse.json(
        { error: 'Essay ID and vocab type are required' },
        { status: 400 }
      )
    }

    // For guests, return success — no DB state to update
    if (!user) {
      return NextResponse.json({
        success: true,
        isGuest: true,
        message: 'Guest quiz completed - save to localStorage',
      })
    }

    const safeScore = typeof score === 'number' ? score : 0
    const safeTotal = typeof total_questions === 'number' ? total_questions : 0

    // Read current counters then atomically increment
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('quiz_total_attempts, quiz_total_correct, quiz_total_questions')
      .eq('id', user.id)
      .single()

    if (fetchError || !profile) {
      console.error('Error fetching profile for quiz stats update:', fetchError)
      return NextResponse.json(
        { error: 'Failed to save quiz results' },
        { status: 500 }
      )
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        quiz_total_attempts:  (profile.quiz_total_attempts  ?? 0) + 1,
        quiz_total_correct:   (profile.quiz_total_correct   ?? 0) + safeScore,
        quiz_total_questions: (profile.quiz_total_questions ?? 0) + safeTotal,
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error updating quiz stats on profile:', updateError)
      return NextResponse.json(
        { error: 'Failed to save quiz results' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in quiz-results API:', error)
    return NextResponse.json(
      { error: 'Failed to save quiz results' },
      { status: 500 }
    )
  }
}
