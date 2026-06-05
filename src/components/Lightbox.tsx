'use client'
import { useEffect, useState } from 'react'
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
  onAdd: (size: '3.5g' | '28g' | '15ml', qty: number) => void
}

export default function Lightbox({ specimen, isOpen, currency, qty, inCart, onClose, onQtyChange, onAdd }: Props) {
  const [selectedSize, setSelectedSize] = useState<'3.5g' | '28g' | '15ml'>('3.5g')

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    if (isOpen) document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // Set default size when specimen changes
  useEffect(() => {
    if (!specimen) return
    if (specimen.productType === 'tincture') setSelectedSize('15ml')
    else setSelectedSize('3.5g')
  }, [specimen?.id])

  if (!specimen) return null

  const imgSrc = specimen.image?.sizes?.lightbox?.url || specimen.image?.url || null

  const selectedPrice = specimen.productType === 'tincture'
    ? specimen.price15ml
    : selectedSize === '3.5g' ? specimen.price35g : specimen.price28g

  const sizes = specimen.productType === 'flower'
    ? [
        specimen.price35g != null && { key: '3.5g' as const, label: '3.5g · Eighth', price: specimen.price35g },
        specimen.price28g != null && { key: '28g' as const, label: '28g · Oz', price: specimen.price28g },
      ].filter(Boolean)
    : specimen.productType === 'tincture' && specimen.price15ml != null
    ? [{ key: '15ml' as const, label: '15mL · Dropper', price: specimen.price15ml }]
    : []

  return (
    <div
      className={`lightbox-overlay ${isOpen ? 'open' : ''}`}
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="lightbox-panel">
        <div className="lightbox-img">
          <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>
          {imgSrc ? (
            <Image src={imgSrc} alt={specimen.image?.alt || specimen.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 50vw" priority />
          ) : (
            <div className="lightbox-img-fallback">
              <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                <rect width="200" height="200" fill="#1A1A17"/>
                <text x="100" y="106" textAnchor="middle" fontFamily="serif" fontSize="13" fill="#6E6E66" fontStyle="italic">{specimen.name}</text>
              </svg>
            </div>
          )}
        </div>

        <div className="lightbox-body">
          <div className="lb-eyebrow">{CATEGORY_LABELS[specimen.category] || specimen.category}</div>
          <h2 className="lb-name">{specimen.name}</h2>
          {specimen.latinName && <div className="lb-latin">{specimen.latinName}</div>}

          {specimen.shortDescription && (
            <p className="lb-desc">{specimen.shortDescription}</p>
          )}

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

          {/* Size selector */}
          {sizes.length > 0 && (
            <div className="lb-sizes">
              <div className="lb-sizes-label">Select Size</div>
              <div className="lb-size-grid">
                {(sizes as Array<{ key: '3.5g' | '28g' | '15ml'; label: string; price: number }>).map((s) => (
                  <button
                    key={s.key}
                    className={`lb-size-btn ${selectedSize === s.key ? 'active' : ''}`}
                    onClick={() => setSelectedSize(s.key)}
                  >
                    <span className="lb-size-name">{s.key}</span>
                    <span className="lb-size-sub">{s.label.split(' · ')[1]}</span>
                    <span className="lb-size-price">{fmt(s.price, currency)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Price + qty */}
          <div className="lb-price">
            {fmt(selectedPrice, currency)}
            <small> per unit</small>
          </div>

          <div className="qty-row">
            <span className="qty-label">Quantity</span>
            <div className="qty-ctrl">
              <button onClick={() => onQtyChange(-1)} aria-label="Decrease">−</button>
              <span className="qty-num">{qty}</span>
              <button onClick={() => onQtyChange(1)} aria-label="Increase">+</button>
            </div>
          </div>

          {selectedPrice != null && (
            <div className="lb-subtotal">
              Subtotal: {fmt(selectedPrice * qty, currency)}
            </div>
          )}

          <button className="lb-add-btn" onClick={() => onAdd(selectedSize, qty)}>
            {inCart ? '✓ Already in Selection' : 'Add to Selection'}
          </button>
        </div>
      </div>
    </div>
  )
}
