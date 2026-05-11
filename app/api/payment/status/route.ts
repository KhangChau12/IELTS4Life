import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('subscription_status, subscription_end_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  return NextResponse.json({
    subscriptionStatus: profile.subscription_status,
    subscriptionEndDate: profile.subscription_end_date,
  })
}
