import { createHmac, timingSafeEqual } from 'crypto'

function getSecret(): string {
  const secret = process.env.REPORT_UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('Missing REPORT_UNSUBSCRIBE_SECRET environment variable')
  return secret
}

export function signUnsubscribeToken(userId: string): string {
  const signature = createHmac('sha256', getSecret()).update(userId).digest('hex')
  return `${userId}.${signature}`
}

export function verifyUnsubscribeToken(token: string): string | null {
  const [userId, signature] = token.split('.')
  if (!userId || !signature) return null

  const expected = createHmac('sha256', getSecret()).update(userId).digest('hex')
  const expectedBuf = Buffer.from(expected)
  const signatureBuf = Buffer.from(signature)

  if (expectedBuf.length !== signatureBuf.length) return null
  if (!timingSafeEqual(expectedBuf, signatureBuf)) return null

  return userId
}
