import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

const PRO_REGEX = /PRO[a-f0-9]{8}\d+/i
const PACK_REGEX = /PACK[a-f0-9]{8}\d+/i
const PRO_MIN_AMOUNT = parseInt(process.env.PRO_PRICE_VND || '75000')
const PACK_MIN_AMOUNT = parseInt(process.env.ESSAY_PACK_PRICE_VND || '50000')
const PACK_BONUS = parseInt(process.env.ESSAY_PACK_BONUS || '15')

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY
  if (!expectedKey || authHeader !== `Apikey ${expectedKey}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, content, transferAmount, transferType } = body

  if (transferType !== 'in') {
    return NextResponse.json({ success: true })
  }

  const proMatch = content?.match(PRO_REGEX)
  const packMatch = content?.match(PACK_REGEX)

  if (!proMatch && !packMatch) {
    return NextResponse.json({ success: true })
  }

  const isPack = !!packMatch && !proMatch
  const orderCode: string = isPack ? packMatch![0] : proMatch![0]
  const minAmount = isPack ? PACK_MIN_AMOUNT : PRO_MIN_AMOUNT

  if (transferAmount < minAmount) {
    return NextResponse.json({ success: true })
  }

  const serviceClient = createServiceRoleClient()

  // Idempotency
  const { data: existing } = await serviceClient
    .from('payment_transactions')
    .select('id')
    .eq('sepay_transaction_id', id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: true })
  }

  const { data: transaction } = await serviceClient
    .from('payment_transactions')
    .select('id, user_id')
    .eq('order_code', orderCode)
    .eq('status', 'pending')
    .maybeSingle()

  if (!transaction) {
    return NextResponse.json({ success: true })
  }

  if (isPack) {
    // Essay pack: increment invite_bonus_essays
    const { data: profile } = await serviceClient
      .from('profiles')
      .select('invite_bonus_essays')
      .eq('id', transaction.user_id)
      .single()

    await Promise.all([
      serviceClient.from('payment_transactions').update({
        status: 'completed',
        sepay_transaction_id: id,
        transaction_content: content,
        completed_at: new Date().toISOString(),
      }).eq('id', transaction.id),

      serviceClient.from('profiles').update({
        invite_bonus_essays: (profile?.invite_bonus_essays ?? 0) + PACK_BONUS,
      }).eq('id', transaction.user_id),
    ])
  } else {
    // Pro subscription
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await Promise.all([
      serviceClient.from('payment_transactions').update({
        status: 'completed',
        sepay_transaction_id: id,
        transaction_content: content,
        completed_at: new Date().toISOString(),
      }).eq('id', transaction.id),

      serviceClient.from('profiles').update({
        subscription_status: 'active',
        subscription_end_date: endDate.toISOString(),
        subscription_order_code: null,
      }).eq('id', transaction.user_id),
    ])
  }

  return NextResponse.json({ success: true })
}
