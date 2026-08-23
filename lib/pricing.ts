export interface PlanPricing {
  original: number
  sale: number
  current: number
  discountPct: number
}

export interface Pricing {
  pro: PlanPricing
  pack: PlanPricing
}

// Sale window (UTC boundaries for Vietnam UTC+7):
// 23/08/2026 00:00 UTC+7 = 22/08/2026 17:00 UTC
// 30/09/2026 23:59 UTC+7 = 30/09/2026 16:59 UTC
const SALE_START_UTC = new Date('2026-08-22T17:00:00.000Z')
const SALE_END_UTC   = new Date('2026-09-30T16:59:59.999Z')

export function isSaleActive(): boolean {
  const now = new Date()
  return now >= SALE_START_UTC && now <= SALE_END_UTC
}

export function getSaleEndDate(): Date {
  return SALE_END_UTC
}

export function getPricing(): Pricing {
  const onSale = isSaleActive()
  return {
    pro: {
      original:    75_000,
      sale:        50_000,
      current:     onSale ? 50_000 : 75_000,
      discountPct: 33,
    },
    pack: {
      original:    45_000,
      sale:        30_000,
      current:     onSale ? 30_000 : 45_000,
      discountPct: 33,
    },
  }
}
