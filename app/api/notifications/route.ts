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

    const { searchParams } = new URL(request.url)
    const unreadOnly = searchParams.get('unread_only') === 'true'
    const shouldMarkRead = searchParams.get('mark_read') === 'true'
    const page = parseInt(searchParams.get('page') || '1', 10)
    const limit = 10
    const offset = (page - 1) * limit

    // profile + all-of-user's read ids never depend on each other — fetch in parallel
    // instead of two sequential round-trips.
    const [profileResult, readsResult] = await Promise.all([
      supabase.from('profiles').select('role, email').eq('id', user.id).single(),
      supabase.from('notification_reads').select('notification_id').eq('user_id', user.id),
    ])

    const profile = profileResult.data
    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const isPro = profile.email.endsWith('@ptnk.edu.vn')

    const applicableAudiences: string[] = ['all']
    if (profile.role === 'student') applicableAudiences.push('student')
    if (isPro) applicableAudiences.push('pro')
    if (!isPro) applicableAudiences.push('free')

    const readIds = new Set(readsResult.data?.map(r => r.notification_id) || [])

    if (unreadOnly) {
      // Only need ids here, and only for computing a count — cheaper than
      // selecting full rows for a value the client discards.
      const { data: allNotifications } = await supabase
        .from('notifications')
        .select('id')
        .in('target_audience', applicableAudiences)

      const unreadCount = allNotifications?.filter(n => !readIds.has(n.id)).length || 0
      return NextResponse.json({ unreadCount })
    }

    // Page of notifications + (when needed) the full id list used to mark
    // everything read run in parallel — the mark-read pass needs ids beyond
    // the current page, but it doesn't need to wait on the paginated fetch.
    const [pageResult, allIdsResult] = await Promise.all([
      supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .in('target_audience', applicableAudiences)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1),
      shouldMarkRead
        ? supabase.from('notifications').select('id').in('target_audience', applicableAudiences)
        : Promise.resolve({ data: null }),
    ])

    const { data: notifications, count, error } = pageResult
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const notificationsWithReadStatus = notifications?.map(n => ({
      ...n,
      is_read: readIds.has(n.id),
    })) || []

    if (shouldMarkRead) {
      const unreadIds = (allIdsResult.data || [])
        .map(n => n.id)
        .filter(id => !readIds.has(id))

      if (unreadIds.length > 0) {
        await supabase
          .from('notification_reads')
          .upsert(
            unreadIds.map(notification_id => ({ notification_id, user_id: user.id })),
            { ignoreDuplicates: true }
          )
        for (const n of notificationsWithReadStatus) {
          if (unreadIds.includes(n.id)) n.is_read = true
        }
      }
    }

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
