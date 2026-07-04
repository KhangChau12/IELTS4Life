import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

export interface WeeklyProgressReportProps {
  userName: string
  essaysThisWeek: number
  avgScoreThisWeek: number | null
  scoreDelta: number | null
  newTopicsTouched: string[]
  newTypesTouched: string[]
  vocabAddedThisWeek: number
  dueFlashcardsCount: number
  quizAccuracy: number | null
  siteUrl: string
  unsubscribeUrl: string
}

function scoreColor(score: number | null): string {
  if (score === null) return '#64748b' // slate-500
  if (score >= 8) return '#6d28d9' // violet-700
  if (score >= 7) return '#0f766e' // teal-700
  if (score >= 6) return '#0369a1' // sky-700
  if (score >= 5) return '#c2410c' // orange-700
  return '#be123c' // rose-700
}

export default function WeeklyProgressReport({
  userName,
  essaysThisWeek,
  avgScoreThisWeek,
  scoreDelta,
  newTopicsTouched,
  newTypesTouched,
  vocabAddedThisWeek,
  dueFlashcardsCount,
  quizAccuracy,
  siteUrl,
  unsubscribeUrl,
}: WeeklyProgressReportProps) {
  const previewText =
    essaysThisWeek > 0
      ? `You wrote ${essaysThisWeek} essay${essaysThisWeek > 1 ? 's' : ''} this week — see your progress`
      : `You added ${vocabAddedThisWeek} new words this week — see your progress`

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>
            {essaysThisWeek > 0 ? `Nice work this week, ${userName}! 🎉` : `Hi ${userName}, here's your week 👋`}
          </Heading>

          {essaysThisWeek > 0 && (
            <Section style={statBlock}>
              <Text style={statLabel}>Essays written this week</Text>
              <Text style={statValue}>{essaysThisWeek}</Text>
              {avgScoreThisWeek !== null && (
                <Text style={{ ...statSubtext, color: scoreColor(avgScoreThisWeek) }}>
                  Average band this week: {avgScoreThisWeek.toFixed(1)}
                  {scoreDelta !== null && scoreDelta > 0 && (
                    <> — up {scoreDelta.toFixed(1)} from before, keep it up!</>
                  )}
                  {scoreDelta !== null && scoreDelta < 0 && (
                    <> ({scoreDelta.toFixed(1)} vs. before — every essay is practice)</>
                  )}
                </Text>
              )}
            </Section>
          )}

          {(newTopicsTouched.length > 0 || newTypesTouched.length > 0) && (
            <Section style={statBlock}>
              <Text style={statLabel}>New ground covered</Text>
              {newTypesTouched.length > 0 && (
                <Text style={bodyText}>
                  You tackled a new question type for the first time: <strong>{newTypesTouched.join(', ')}</strong> 💪
                </Text>
              )}
              {newTopicsTouched.length > 0 && (
                <Text style={bodyText}>
                  New topics practiced: <strong>{newTopicsTouched.join(', ')}</strong>
                </Text>
              )}
            </Section>
          )}

          {vocabAddedThisWeek > 0 && (
            <Section style={statBlock}>
              <Text style={statLabel}>Vocabulary</Text>
              <Text style={bodyText}>
                You added <strong>{vocabAddedThisWeek}</strong> new word{vocabAddedThisWeek > 1 ? 's' : ''} this week.
              </Text>
              {quizAccuracy !== null && (
                <Text style={bodyText}>Overall quiz accuracy so far: {quizAccuracy}%</Text>
              )}
            </Section>
          )}

          {dueFlashcardsCount > 0 && (
            <Text style={bodyText}>
              You have <strong>{dueFlashcardsCount}</strong> flashcard{dueFlashcardsCount > 1 ? 's' : ''} ready to review.
            </Text>
          )}

          <Section style={ctaBlock}>
            <table role="presentation" cellPadding={0} cellSpacing={0} style={{ margin: '0 auto' }}>
              <tr>
                {dueFlashcardsCount > 0 && (
                  <td style={{ padding: '0 6px' }}>
                    <Button style={buttonSecondary} href={`${siteUrl}/dashboard`}>
                      Review flashcards
                    </Button>
                  </td>
                )}
                <td style={{ padding: '0 6px' }}>
                  <Button style={button} href={`${siteUrl}/dashboard`}>
                    See your full dashboard
                  </Button>
                </td>
              </tr>
            </table>
          </Section>

          <Hr style={hr} />

          <Text style={footerText}>
            You&apos;re receiving this because you have an IELTS4Life account.{' '}
            <a href={unsubscribeUrl} style={footerLink}>
              Unsubscribe from weekly reports
            </a>
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

WeeklyProgressReport.PreviewProps = {
  userName: 'Khang',
  essaysThisWeek: 3,
  avgScoreThisWeek: 6.5,
  scoreDelta: 0.5,
  newTopicsTouched: ['Environment', 'Technology'],
  newTypesTouched: ['Two-part Question'],
  vocabAddedThisWeek: 16,
  dueFlashcardsCount: 12,
  quizAccuracy: 78.3,
  siteUrl: 'https://www.ielts4life.com',
  unsubscribeUrl: 'https://www.ielts4life.com/api/reports/unsubscribe?token=preview',
} satisfies WeeklyProgressReportProps

const main = {
  backgroundColor: '#f0f9ff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
}

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '32px 24px',
  maxWidth: '480px',
  borderRadius: '12px',
}

const heading = {
  fontSize: '20px',
  fontWeight: 800,
  color: '#0c4a6e',
  marginBottom: '20px',
}

const statBlock = {
  marginBottom: '20px',
}

const statLabel = {
  fontSize: '12px',
  fontWeight: 700,
  color: '#64748b',
  textTransform: 'uppercase' as const,
  letterSpacing: '0.05em',
  marginBottom: '4px',
}

const statValue = {
  fontSize: '32px',
  fontWeight: 800,
  color: '#0c4a6e',
  margin: '0 0 4px',
}

const statSubtext = {
  fontSize: '14px',
  fontWeight: 600,
  margin: 0,
}

const bodyText = {
  fontSize: '14px',
  color: '#334155',
  lineHeight: '20px',
  margin: '4px 0',
}

const ctaBlock = {
  marginBottom: '20px',
  textAlign: 'center' as const,
}

const button = {
  backgroundColor: '#0284c7',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 700,
  textDecoration: 'none',
  padding: '12px 20px',
  display: 'inline-block',
  whiteSpace: 'nowrap' as const,
}

const buttonSecondary = {
  ...button,
  backgroundColor: '#ffffff',
  color: '#0284c7',
  border: '1px solid #0284c7',
}

const hr = {
  borderColor: '#e2e8f0',
  margin: '24px 0 16px',
}

const footerText = {
  fontSize: '12px',
  color: '#94a3b8',
  lineHeight: '18px',
}

const footerLink = {
  color: '#0284c7',
  textDecoration: 'underline',
}
