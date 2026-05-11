import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

export async function GET(req: NextRequest) {
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

  const orderCode = new URL(req.url).searchParams.get('orderCode')
  let packCompleted = false
  if (orderCode?.startsWith('PACK')) {
    const { data: tx } = await serviceClient
      .from('payment_transactions')
      .select('status')
      .eq('order_code', orderCode)
      .eq('user_id', user.id)
      .maybeSingle()
    packCompleted = tx?.status === 'completed'
  }

  return NextResponse.json({
    subscriptionStatus: profile.subscription_status,
    subscriptionEndDate: profile.subscription_end_date,
    packCompleted,
  })
}
