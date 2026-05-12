import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getUserTier } from '@/lib/user/quota'
import { getPricing } from '@/lib/pricing'

const PACK_BONUS = parseInt(process.env.ESSAY_PACK_BONUS || '15')

export async function POST(req: NextRequest) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const type = searchParams.get('type') === 'pack' ? 'pack' : 'pro'

  const serviceClient = createServiceRoleClient()
  const { data: profile } = await serviceClient
    .from('profiles')
    .select('email, subscription_status, subscription_end_date')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (type === 'pro') {
    const tier = getUserTier(profile)
    if (tier === 'pro') {
      return NextResponse.json({ error: 'Already Pro' }, { status: 400 })
    }
  }

  const prefix = type === 'pack' ? 'PACK' : 'PRO'
  const pricing = getPricing()
  const amount = type === 'pack' ? pricing.pack.current : pricing.pro.current
  const orderCode = `${prefix}${user.id.slice(0, 8).replace(/-/g, '')}${Date.now()}`

  await serviceClient.from('payment_transactions').insert({
    user_id: user.id,
    order_code: orderCode,
    amount,
    status: 'pending',
  })

  if (type === 'pro') {
    await serviceClient.from('profiles').update({
      subscription_order_code: orderCode,
    }).eq('id', user.id)
  }

  return NextResponse.json({
    type,
    orderCode,
    amount,
    essayBonus: type === 'pack' ? PACK_BONUS : null,
    accountNumber: process.env.MB_ACCOUNT_NUMBER || '0971240808',
    accountName: process.env.MB_ACCOUNT_NAME || 'CHAU PHUC KHANG',
    bankBin: process.env.MB_BANK_BIN || '970422',
  })
}
