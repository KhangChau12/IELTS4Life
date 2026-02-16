import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { data: draft } = await supabase
      .from('essay_drafts')
      .select('*')
      .eq('user_id', user.id)
      .eq('prompt_id', params.promptId)
      .single()

    return NextResponse.json({ draft: draft || null })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch draft' }, { status: 500 })
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const body = await request.json()
    const { draft_content, timer_seconds } = body

    if (typeof draft_content !== 'string' || typeof timer_seconds !== 'number') {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { data: draft, error } = await supabase
      .from('essay_drafts')
      .upsert(
        {
          user_id: user.id,
          prompt_id: params.promptId,
          draft_content,
          timer_seconds,
          last_saved_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,prompt_id' }
      )
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ draft })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save draft' }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { promptId: string } }
) {
  try {
    const supabase = createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    await supabase
      .from('essay_drafts')
      .delete()
      .eq('user_id', user.id)
      .eq('prompt_id', params.promptId)

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete draft' }, { status: 500 })
  }
}
