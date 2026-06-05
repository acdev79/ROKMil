'use client'
import Image from 'next/image'
import type { Specimen, CartItem } from '@/lib/types'
import { fmt, CATEGORY_LABELS } from '@/lib/types'

interface Props {
  specimen: Specimen
  currency: string
  inCart: boolean
  animationDelay: number
  onOpen: (id: string) => void
  onQuickAdd: (id: string) => void
}

export default function SpecimenCard({
  specimen, currency, inCart, animationDelay, onOpen, onQuickAdd,
}: Props) {
  const isSoldOut = specimen.stock !== undefined && specimen.stock !== null && specimen.stock <= 0
  const badgeVal = specimen.discountBadge
    ? 'sale'
    : specimen.badge && specimen.badge !== 'none'
    ? specimen.badge
    : null

  const badgeText = specimen.discountBadge
    ? specimen.discountBadge
    : specimen.badge === 'new' ? 'New Arrival'
    : specimen.badge === 'rare' ? 'Rare Specimen'
    : specimen.badge === 'popular' ? 'Popular'
    : null

  const imgSrc = specimen.image?.sizes?.card?.url || specimen.image?.url || null

  return (
    <div
      className="card"
      style={{ animationDelay: `${animationDelay}s` }}
    >
      {/* Image area */}
      <div className="card-img" onClick={() => onOpen(specimen.id)}>
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={specimen.image?.alt || specimen.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            style={{ objectFit: 'cover', transition: 'transform 0.7s var(--ease)' }}
          />
        ) : (
          <div className="card-img-fallback">
            {/* Fallback gradient block when no image uploaded yet */}
            <svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg">
              <rect width="200" height="150" fill="#1A1A17"/>
              <text x="100" y="80" textAnchor="middle" fontFamily="serif" fontSize="14"
                fill="#6E6E66" fontStyle="italic">{specimen.name}</text>
            </svg>
          </div>
        )}
        {badgeVal && badgeText && (
          <span className={`card-badge ${badgeVal}`}>{badgeText}</span>
        )}
        {isSoldOut && (
          <div className="card-sold-out">
            <span className="sold-out-label">Unavailable</span>
          </div>
        )}
      </div>

      {/* Text body */}
      <div className="card-body">
        <div className="card-category">
          {CATEGORY_LABELS[specimen.category] || specimen.category}
        </div>
        <div className="card-name" onClick={() => onOpen(specimen.id)}>
          {specimen.name}
        </div>
        {specimen.latinName && (
          <div className="card-latin">{specimen.latinName}</div>
        )}
        <div className="card-desc">{specimen.shortDescription}</div>
        <div className="card-footer">
          <div className="card-price">
            {specimen.originalPrice && specimen.showOriginalPrice && (
              <span className="card-price-original">{fmt(specimen.originalPrice, currency)}</span>
            )}
            <span className={specimen.originalPrice ? 'card-price-discounted' : ''}>
              {fmt(specimen.price, currency)}
            </span>
            <sub>contribution</sub>
          </div>
          <button
            className={`reserve-btn ${inCart ? 'in-cart' : ''}`}
            disabled={isSoldOut}
            onClick={(e) => { e.stopPropagation(); onQuickAdd(specimen.id) }}
          >
            {isSoldOut ? 'Unavailable' : inCart ? 'Selected' : 'Reserve'}
          </button>
        </div>
      </div>
    </div>
  )
}
