import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

async function requireDev(supabase: ReturnType<typeof createServerClient>) {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: profile } = await supabase
    .from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'dev') return null
  return user
}

export async function GET() {
  const supabase = createServerClient()
  const user = await requireDev(supabase)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { data: notifications, error } = await supabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notifications })
}

export async function POST(request: Request) {
  const supabase = createServerClient()
  const user = await requireDev(supabase)
  if (!user) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const body = await request.json()
  const { title, content, target_audience } = body

  if (!title?.trim() || !content?.trim() || !target_audience) {
    return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
  }

  const validAudiences = ['all', 'student', 'pro', 'free']
  if (!validAudiences.includes(target_audience)) {
    return NextResponse.json({ error: 'Invalid target audience' }, { status: 400 })
  }

  const { data: notification, error } = await supabase
    .from('notifications')
    .insert({
      title: title.trim(),
      content: content.trim(),
      target_audience,
      created_by: user.id,
    })
    .select('*')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ notification }, { status: 201 })
}
