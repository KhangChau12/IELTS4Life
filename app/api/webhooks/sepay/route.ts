import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'

const ORDER_CODE_REGEX = /PRO[a-f0-9]{8}\d+/i
const MIN_AMOUNT = parseInt(process.env.PRO_PRICE_VND || '75000')

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('Authorization')
  const expectedKey = process.env.SEPAY_WEBHOOK_API_KEY
  if (!expectedKey || authHeader !== `Apikey ${expectedKey}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await req.json()
  const { id, content, transferAmount, transferType } = body

  if (transferType !== 'in' || transferAmount < MIN_AMOUNT) {
    return NextResponse.json({ success: true })
  }

  const match = content?.match(ORDER_CODE_REGEX)
  if (!match) {
    return NextResponse.json({ success: true })
  }
  const orderCode: string = match[0]

  const serviceClient = createServiceRoleClient()

  // Idempotency: skip if this SePay transaction was already processed
  const { data: existing } = await serviceClient
    .from('payment_transactions')
    .select('id')
    .eq('sepay_transaction_id', id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ success: true })
  }

  // Find the pending transaction by order code
  const { data: transaction } = await serviceClient
    .from('payment_transactions')
    .select('id, user_id')
    .eq('order_code', orderCode)
    .eq('status', 'pending')
    .maybeSingle()

  if (!transaction) {
    return NextResponse.json({ success: true })
  }

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

  return NextResponse.json({ success: true })
}
