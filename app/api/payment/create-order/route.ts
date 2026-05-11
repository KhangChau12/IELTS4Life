import { NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getUserTier } from '@/lib/user/quota'

const AMOUNT = parseInt(process.env.PRO_PRICE_VND || '75000')

export async function POST() {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('email, subscription_status, subscription_end_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const tier = getUserTier(profile)
  if (tier === 'pro') {
    return NextResponse.json({ error: 'Already Pro' }, { status: 400 })
  }

  const orderCode = `PRO${user.id.slice(0, 8).replace(/-/g, '')}${Date.now()}`

  await serviceClient.from('payment_transactions').insert({
    user_id: user.id,
    order_code: orderCode,
    amount: AMOUNT,
    status: 'pending',
  })

  await serviceClient.from('profiles').update({
    subscription_order_code: orderCode,
  }).eq('id', user.id)

  return NextResponse.json({
    orderCode,
    amount: AMOUNT,
    accountNumber: process.env.MB_ACCOUNT_NUMBER || '0971240808',
    accountName: process.env.MB_ACCOUNT_NAME || 'CHAU PHUC KHANG',
    bankBin: process.env.MB_BANK_BIN || '970422',
  })
}
