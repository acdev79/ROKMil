/**
 * lib/discounts.ts
 * Fetches active discounts from Payload and calculates the best
 * discounted price for a given specimen.
 */

export interface Discount {
  id: string
  label: string
  type: 'percentage' | 'flat'
  value: number
  scope: 'all' | 'specific' | 'category'
  specimens?: Array<{ id: string }>
  category?: string
  badgeText?: string
  showOriginalPrice?: boolean
  expiresAt?: string
  startsAt?: string
}

export interface PricedSpecimen {
  id: string
  price: number
  category: string
  originalPrice?: number
  discountBadge?: string
  showOriginalPrice?: boolean
}

/**
 * Returns the active discounts from Payload CMS via the local API.
 * Call this on the server (RSC / route handler) only.
 */
export async function getActiveDiscounts(): Promise<Discount[]> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const now = new Date().toISOString()

  const res = await fetch(
    `${baseUrl}/api/discounts?where[active][equals]=true&limit=100`,
    { next: { revalidate: 60 } } // cache 60s so changes propagate quickly
  )

  if (!res.ok) return []

  const data = await res.json()
  const discounts: Discount[] = data.docs || []

  // Filter by schedule client-side (Payload where clauses on dates can be tricky)
  return discounts.filter((d) => {
    if (d.startsAt && new Date(d.startsAt) > new Date(now)) return false
    if (d.expiresAt && new Date(d.expiresAt) < new Date(now)) return false
    return true
  })
}

/**
 * Applies the best available discount to a specimen price.
 * Returns the discounted price and metadata for display.
 */
export function applyBestDiscount(
  specimen: { id: string; price: number; category: string },
  discounts: Discount[]
): PricedSpecimen {
  const applicable = discounts.filter((d) => {
    if (d.scope === 'all') return true
    if (d.scope === 'category' && d.category === specimen.category) return true
    if (d.scope === 'specific') {
      return d.specimens?.some((s) => s.id === specimen.id)
    }
    return false
  })

  if (!applicable.length) {
    return { id: specimen.id, price: specimen.price, category: specimen.category }
  }

  // Pick the discount that saves the most
  let bestSaving = 0
  let best: Discount | null = null

  for (const d of applicable) {
    const saving =
      d.type === 'percentage'
        ? specimen.price * (d.value / 100)
        : d.value
    if (saving > bestSaving) {
      bestSaving = saving
      best = d
    }
  }

  if (!best) return { id: specimen.id, price: specimen.price, category: specimen.category }

  const discountedPrice = Math.max(0, Math.round(specimen.price - bestSaving))

  return {
    id: specimen.id,
    price: discountedPrice,
    category: specimen.category,
    originalPrice: specimen.price,
    discountBadge: best.badgeText,
    showOriginalPrice: best.showOriginalPrice,
  }
}
