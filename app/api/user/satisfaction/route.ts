import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { rating } = body

    if (!rating || ![1, 2, 3, 4].includes(rating)) {
      return NextResponse.json({ error: 'Invalid rating. Must be 1, 2, 3, or 4.' }, { status: 400 })
    }

    // Check if already rated (idempotency guard)
    const { data: profile } = await supabase
      .from('profiles')
      .select('satisfaction_rated_at')
      .eq('id', user.id)
      .single()

    if (profile?.satisfaction_rated_at) {
      return NextResponse.json({ error: 'Already rated' }, { status: 409 })
    }

    const { error } = await supabase
      .from('profiles')
      .update({
        satisfaction_rating: rating,
        satisfaction_rated_at: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (error) {
      return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
