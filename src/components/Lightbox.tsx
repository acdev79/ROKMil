'use client'
import { useEffect, useRef } from 'react'
import Image from 'next/image'
import type { Specimen } from '@/lib/types'
import { fmt, CATEGORY_LABELS } from '@/lib/types'

interface Props {
  specimen: Specimen | null
  isOpen: boolean
  currency: string
  qty: number
  inCart: boolean
  onClose: () => void
  onQtyChange: (delta: number) => void
  onAdd: () => void
}

export default function Lightbox({
  specimen, isOpen, currency, qty, inCart, onClose, onQtyChange, onAdd,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  if (!specimen) return null

  const imgSrc = specimen.image?.sizes?.lightbox?.url || specimen.image?.url || null

  return (
    <div
      className={`lightbox-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="lightbox-panel" ref={panelRef}>
        {/* Left: Image */}
        <div className="lightbox-img">
          <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
          {imgSrc ? (
            <Image
              src={imgSrc}
              alt={specimen.image?.alt || specimen.name}
              fill
              style={{ objectFit: 'cover' }}
              sizes="(max-width: 640px) 100vw, 50vw"
            />
          ) : (
            <div className="lightbox-img-fallback">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#1A1A17"/>
                <text x="100" y="106" textAnchor="middle" fontFamily="serif" fontSize="13"
                  fill="#6E6E66" fontStyle="italic">{specimen.name}</text>
              </svg>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="lightbox-body">
          <div className="lb-eyebrow">
            {CATEGORY_LABELS[specimen.category] || specimen.category}
          </div>
          <h2 className="lb-name">{specimen.name}</h2>
          {specimen.latinName && (
            <div className="lb-latin">{specimen.latinName}</div>
          )}

          {/* Long description — Payload rich text renders as HTML */}
          {specimen.longDescription ? (
            <div
              className="lb-desc"
              dangerouslySetInnerHTML={{ __html: specimen.longDescription }}
            />
          ) : (
            <p className="lb-desc">{specimen.shortDescription}</p>
          )}

          {/* Details table */}
          {specimen.details && specimen.details.length > 0 && (
            <div className="lb-details">
              {specimen.details.map((d, i) => (
                <div key={i} className="detail-row">
                  <span className="detail-label">{d.label}</span>
                  <span className="detail-val">{d.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Price */}
          <div className="lb-price">
            {specimen.originalPrice && specimen.showOriginalPrice && (
              <span className="lb-price-original">
                {fmt(specimen.originalPrice, currency)}
              </span>
            )}
            {fmt(specimen.price35g ?? specimen.price15ml ?? specimen.price28g ?? 0, currency)}
            <small>suggested contribution</small>
          </div>

          {/* Quantity */}
          <div className="qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-ctrl">
              <button onClick={() => onQtyChange(-1)} aria-label="Decrease">−</button>
              <span className="qty-num">{qty}</span>
              <button onClick={() => onQtyChange(1)} aria-label="Increase">+</button>
            </div>
          </div>

          {/* Add button */}
          <button className="lb-add-btn" onClick={onAdd}>
            {inCart ? '✓ Already Selected' : 'Add to Selection'}
          </button>
        </div>
      </div>
    </div>
  )
}
