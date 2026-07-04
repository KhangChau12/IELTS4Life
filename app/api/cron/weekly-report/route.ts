import { NextRequest, NextResponse } from 'next/server'
import { createServiceRoleClient } from '@/lib/supabase/service'
import { getWeeklyReportData } from '@/lib/reports/weekly-data'
import { signUnsubscribeToken } from '@/lib/reports/unsubscribe-token'
import { resendClient, REPORT_FROM_ADDRESS } from '@/lib/resend/client'
import WeeklyProgressReport from '@/emails/WeeklyProgressReport'
import { logger } from '@/lib/logger'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

const REPORT_WINDOW_DAYS = 7
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ielts4life.com'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dryRun = req.nextUrl.searchParams.get('dryRun') === 'true'
  const supabase = createServiceRoleClient()

  const windowStart = new Date(Date.now() - REPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const eligibilityCutoff = new Date(
    Date.now() - REPORT_WINDOW_DAYS * 24 * 60 * 60 * 1000
  ).toISOString()

  // Eligible: opted in, has ever written an essay, and not emailed within the current window.
  const { data: candidates, error: candidatesError } = await supabase
    .from('profiles')
    .select('id, email, total_essays_count, last_report_sent_at')
    .eq('weekly_report_enabled', true)
    .gt('total_essays_count', 0)
    .or(`last_report_sent_at.is.null,last_report_sent_at.lt.${eligibilityCutoff}`)

  if (candidatesError) {
    logger.error('[weekly-report] Failed to fetch candidates', candidatesError)
    return NextResponse.json({ error: 'Failed to fetch candidates' }, { status: 500 })
  }

  const results = {
    candidates: candidates?.length || 0,
    sent: 0,
    skippedNoActivity: 0,
    failed: 0,
  }

  for (const profile of candidates || []) {
    try {
      const data = await getWeeklyReportData(profile.id, windowStart)
      if (!data) {
        results.skippedNoActivity++
        continue
      }

      if (dryRun) {
        results.sent++
        continue
      }

      const token = signUnsubscribeToken(profile.id)
      const unsubscribeUrl = `${SITE_URL}/api/reports/unsubscribe?token=${token}`

      const { error: sendError } = await resendClient.emails.send({
        from: REPORT_FROM_ADDRESS,
        to: profile.email,
        subject: `Your IELTS4Life week: ${data.essaysThisWeek > 0 ? `${data.essaysThisWeek} essay${data.essaysThisWeek > 1 ? 's' : ''} written` : `${data.vocabAddedThisWeek} new words`}`,
        react: WeeklyProgressReport({
          userName: data.userName,
          essaysThisWeek: data.essaysThisWeek,
          avgScoreThisWeek: data.avgScoreThisWeek,
          scoreDelta: data.scoreDelta,
          newTopicsTouched: data.newTopicsTouched,
          newTypesTouched: data.newTypesTouched,
          vocabAddedThisWeek: data.vocabAddedThisWeek,
          dueFlashcardsCount: data.dueFlashcardsCount,
          quizAccuracy: data.quizAccuracy,
          siteUrl: SITE_URL,
          unsubscribeUrl,
        }),
      })

      if (sendError) {
        logger.error('[weekly-report] Send failed for user', profile.id, sendError)
        results.failed++
        continue
      }

      await supabase
        .from('profiles')
        .update({ last_report_sent_at: new Date().toISOString() })
        .eq('id', profile.id)

      results.sent++
    } catch (err) {
      logger.error('[weekly-report] Unexpected error for user', profile.id, err)
      results.failed++
    }
  }

  return NextResponse.json({ dryRun, ...results })
}
