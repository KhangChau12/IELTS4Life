import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const supabase = createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const isPro = profile.email.endsWith('@ptnk.edu.vn')
    const applicableAudiences: string[] = ['all']
    if (profile.role === 'student') applicableAudiences.push('student')
    if (isPro) applicableAudiences.push('pro')
    if (!isPro) applicableAudiences.push('free')

    const { data: notifications } = await supabase
      .from('notifications')
      .select('id')
      .in('target_audience', applicableAudiences)

    if (!notifications || notifications.length === 0) {
      return NextResponse.json({ success: true, marked: 0 })
    }

    const { data: existingReads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', user.id)

    const readIds = new Set(existingReads?.map(r => r.notification_id) || [])
    const unreadIds = notifications.map(n => n.id).filter(id => !readIds.has(id))

    if (unreadIds.length === 0) {
      return NextResponse.json({ success: true, marked: 0 })
    }

    const inserts = unreadIds.map(notification_id => ({
      notification_id,
      user_id: user.id,
    }))

    const { error } = await supabase
      .from('notification_reads')
      .upsert(inserts, { ignoreDuplicates: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, marked: unreadIds.length })
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
