export type ProductType = 'flower' | 'tincture'

export interface SpecimenDetail {
  label: string
  value: string
}

export interface MediaImage {
  url: string
  alt: string
  caption?: string
  sizes?: {
    card?: { url: string }
    lightbox?: { url: string }
    thumb?: { url: string }
  }
}

export interface Specimen {
  id: string
  name: string
  latinName: string
  productType: ProductType
  category: string
  image: MediaImage | null
  galleryImages?: Array<{ image: MediaImage }>
  shortDescription: string
  longDescription?: string
  details?: Array<{ label: string; value: string }>
  price35g?: number
  price28g?: number
  price15ml?: number
  price: number
  originalPrice?: number
  discountBadge?: string
  showOriginalPrice?: boolean
  badge?: 'none' | 'new' | 'rare' | 'popular'
  available: boolean
  stock?: number
  slug?: string
}

export interface CartItem {
  key: string
  specimenId: string
  specimenName: string
  latinName?: string
  category: string
  image: MediaImage | null
  size: '3.5g' | '28g' | '15ml'
  sizeLabel: string
  price: number
  qty: number
}

export interface Settings {
  storeName: string
  tagline: string
  heroTitle: string
  heroTitleItalic: string
  heroSubtitle: string
  organisersName: string
  organisersEmail: string
  receiptMessage: string
  notifyOrganiserEmail?: string
  sendReceiptEmails?: boolean
  currency: 'USD' | 'EUR' | 'GBP' | 'KRW' | 'AUD'
}

export const CATEGORY_LABELS: Record<string, string> = {
  bonsai: 'Bonsai',
  flower: 'Flower',
  moss: 'Moss & Stone',
  rare: 'Rare Find',
  tincture: 'Tincture',
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', KRW: '₩', AUD: 'A$',
}

export function fmt(amount: number | undefined | null, currency = 'USD') {
  const symbol = CURRENCY_SYMBOLS[currency] || '$'
  return amount == null ? `${symbol}0` : `${symbol}${amount.toLocaleString()}`
}

export function cartItemKey(specimenId: string, size: string) {
  return `${specimenId}::${size}`
}

// Extended settings fields
export interface SettingsExtended extends Settings {
  announcementEnabled?: boolean
  announcementText?: string
  announcementType?: 'info' | 'success' | 'warning'
  announcementExpiry?: string
  label35g?: string
  label28g?: string
  label15ml?: string
  deliveryFeeEnabled?: boolean
  deliveryFeeLabel?: string
  deliveryFeeAmount?: number
  deliveryFeeThreshold?: number
  discountEnabled?: boolean
  discountLabel?: string
  discountType?: 'percentage' | 'fixed'
  discountValue?: number
  discountMinimumOrder?: number
  receiptFooter?: string
  surpriseMeEnabled?: boolean
  surpriseMeTitle?: string
  surpriseMeSubtitle?: string
  surpriseMeButtonText?: string
}
