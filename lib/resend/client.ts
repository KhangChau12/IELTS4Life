import { Resend } from 'resend'

if (!process.env.RESEND_API_KEY) {
  throw new Error('Missing RESEND_API_KEY environment variable')
}

export const resendClient = new Resend(process.env.RESEND_API_KEY)

export const REPORT_FROM_ADDRESS = 'IELTS4Life <progress@updates.ielts4life.com>'
