export type UserTier = 'pro' | 'free'

export type SubscriptionProfile = {
  email: string
  subscription_status?: 'free' | 'active' | 'expired' | null
  subscription_end_date?: string | null
}

export function getDailyQuota(email: string): number {
  if (email.endsWith('@ptnk.edu.vn')) return 5
  return 3
}

export function getTotalQuota(email: string): number | null {
  if (email.endsWith('@ptnk.edu.vn')) return null
  return 6
}

/**
 * Get user tier. Accepts either an email string (legacy) or a profile object.
 * DB subscription status takes priority over email-based check.
 */
export function getUserTier(emailOrProfile: string | SubscriptionProfile): UserTier {
  if (typeof emailOrProfile === 'string') {
    return emailOrProfile.endsWith('@ptnk.edu.vn') ? 'pro' : 'free'
  }
  const { email, subscription_status, subscription_end_date } = emailOrProfile
  if (subscription_status === 'active' && subscription_end_date) {
    if (new Date(subscription_end_date) > new Date()) return 'pro'
  }
  return email.endsWith('@ptnk.edu.vn') ? 'pro' : 'free'
}

/**
 * Get tier display name
 */
export function getTierName(tier: UserTier): string {
  return tier === 'pro' ? 'Pro' : 'Free'
}

/**
 * Get tier color for UI
 */
export function getTierColor(tier: UserTier): string {
  return tier === 'pro' ? 'bg-green-600' : 'bg-ocean-600'
}

/**
 * Get quota exhausted message based on tier
 */
export function getQuotaExhaustedMessage(tier: UserTier, isDaily: boolean): {
  message: string
  showUpgradeButton: boolean
} {
  if (tier === 'pro') {
    // Pro user hit daily limit
    return {
      message: "You've written 5 essays today - that's impressive dedication! Take some time to review your new vocabulary and strengthen what you've learned. Come back tomorrow refreshed and ready to continue improving!",
      showUpgradeButton: false
    }
  }

  if (isDaily) {
    return {
      message: "You've reached your daily limit of 3 essays. Come back tomorrow to continue!",
      showUpgradeButton: true
    }
  }

  return {
    message: "You've used all your free essays! To continue, invite friends to earn +6 essays per successful signup (they get +3 bonus too).",
    showUpgradeButton: true
  }
}
