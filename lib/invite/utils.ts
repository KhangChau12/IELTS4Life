/**
 * Invite system utilities
 */

/**
 * Generate a unique invite code for a new user
 * Format: 8 characters, uppercase letters and numbers
 */
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''

  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }

  return code
}

/**
 * Format invite code for display (add spacing for readability)
 * e.g., "ABCD1234" -> "ABCD 1234"
 */
export function formatInviteCode(code: string): string {
  if (!code || code.length !== 8) return code
  return `${code.slice(0, 4)} ${code.slice(4)}`
}

/**
 * Validate invite code format
 */
export function isValidInviteCodeFormat(code: string): boolean {
  // Remove spaces and convert to uppercase
  const cleanCode = code.replace(/\s/g, '').toUpperCase()

  // Check if 8 characters and only alphanumeric
  return /^[A-Z0-9]{8}$/.test(cleanCode)
}

/**
 * Clean invite code for database lookup
 */
export function cleanInviteCode(code: string): string {
  return code.replace(/\s/g, '').toUpperCase()
}

/**
 * Calculate total available essays including bonuses
 */
export function calculateTotalQuota(baseQuota: number, bonusEssays: number): number {
  return baseQuota + bonusEssays
}

/**
 * Invite bonus amounts
 */
export const INVITE_BONUSES = {
  INVITER: 2,  // Person who shares the code gets 2 essays
  INVITED: 2,  // Person who uses the code gets 2 essays
} as const

/**
 * Promo codes and their bonus amounts
 * Hardcoded promotional codes that give bonus essays
 */
export const PROMO_CODES = {
  'GET10FREE': 10,  // Get 10 free essays
  'get10free': 10,
  'Get10free': 10,
} as const

/**
 * Check if a code is a valid promo code
 */
export function isPromoCode(code: string): boolean {
  const cleanCode = cleanInviteCode(code)
  return cleanCode in PROMO_CODES
}

/**
 * Get bonus amount for a promo code
 */
export function getPromoCodeBonus(code: string): number {
  const cleanCode = cleanInviteCode(code) as keyof typeof PROMO_CODES
  return PROMO_CODES[cleanCode] || 0
}