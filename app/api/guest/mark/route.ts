import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const { fingerprint, essayId } = await request.json()

    if (!fingerprint || !essayId || fingerprint === 'server-side') {
      return NextResponse.json(
        { error: 'Fingerprint and essayId required' },
        { status: 400 }
      )
    }

    const supabase = createServerClient()

    // Upsert the fingerprint record
    const { error } = await supabase
      .from('guest_fingerprints')
      .upsert(
        {
          fingerprint,
          essay_id: essayId,
        },
        {
          onConflict: 'fingerprint'
        }
      )

    if (error) {
      console.error('Failed to mark guest:', error)
      return NextResponse.json(
        { error: 'Failed to mark guest usage' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Guest mark error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
