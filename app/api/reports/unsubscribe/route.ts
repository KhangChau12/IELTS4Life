import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { verifyUnsubscribeToken } from '@/lib/reports/unsubscribe-token'

export const dynamic = 'force-dynamic'

function htmlPage(message: string): NextResponse {
  return new NextResponse(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><title>IELTS4Life</title></head>
    <body style="font-family: -apple-system, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; color: #0c4a6e;">
      <h2>${message}</h2>
      <p><a href="${process.env.NEXT_PUBLIC_SITE_URL}/dashboard" style="color: #0284c7;">Back to dashboard</a></p>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html' } }
  )
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')
  if (!token) {
    return htmlPage('Invalid unsubscribe link.')
  }

  const userId = verifyUnsubscribeToken(token)
  if (!userId) {
    return htmlPage('Invalid or expired unsubscribe link.')
  }

  const supabase = createServiceRoleClient()
  await supabase.from('profiles').update({ weekly_report_enabled: false }).eq('id', userId)

  return htmlPage("You've been unsubscribed from weekly progress emails.")
}
