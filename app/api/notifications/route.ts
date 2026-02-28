import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'

    const { data: reads } = await supabase
      .from('notification_reads')
      .select('notification_id')
      .eq('user_id', user.id)

    const readIds = new Set(reads?.map(r => r.notification_id) || [])

    if (unreadOnly) {
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('id')
        .in('target_audience', applicableAudiences)

      const unreadCount = allNotifications?.filter(n => !readIds.has(n.id)).length || 0
      return NextResponse.json({ unreadCount })
    }

    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 10
    const offset = (page - 1) * limit

    const { data: notifications, count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact' })
      .in('target_audience', applicableAudiences)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const notificationsWithReadStatus = notifications?.map(n => ({
      ...n,
      is_read: readIds.has(n.id),
    })) || []

    return NextResponse.json({
      notifications: notificationsWithReadStatus,
      total: count || 0,
      page,
      totalPages: Math.ceil((count || 0) / limit),
    })
  } catch (error) {
    console.error('Error fetching notifications:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
