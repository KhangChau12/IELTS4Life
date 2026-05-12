import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { fetchAdminStats } from '@/lib/admin/stats'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = createServerClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!['admin', 'dev'].includes(profile?.role ?? '')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const stats = await fetchAdminStats()
    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching admin stats:', error)
    return NextResponse.json({ error: 'Failed to fetch statistics' }, { status: 500 })
  }
}
