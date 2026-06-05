'use client'
import Image from 'next/image'
import type { CartItem, Settings } from '@/lib/types'
import { fmt } from '@/lib/types'

interface Props {
  isOpen: boolean
  items: CartItem[]
  settings: Settings | null
  onClose: () => void
  onRemove: (id: string) => void
  onCheckout: () => void
}

export default function CartPanel({ isOpen, items, settings, onClose, onRemove, onCheckout }: Props) {
  const currency = settings?.currency || 'USD'
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const count = items.reduce((sum, i) => sum + i.qty, 0)

  return (
    <>
      <div className={`cart-overlay ${isOpen ? 'open' : ''}`} onClick={onClose} />
      <aside className={`cart-panel ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <span className="cart-title">Your Selection</span>
          <button className="cart-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon">ROKMil</div>
              <p>No specimens selected</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.id} className="cart-item">
                <div className="cart-item-thumb">
                  {item.image?.sizes?.thumb?.url || item.image?.url ? (
                    <Image
                      src={item.image.sizes?.thumb?.url || item.image.url!}
                      alt={item.image.alt}
                      width={48}
                      height={48}
                      style={{ objectFit: 'cover' }}
                    />
                  ) : (
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                      <rect width="48" height="48" fill="#1A1A17"/>
                      <text x="24" y="28" textAnchor="middle" fontSize="8" fill="#6E6E66">🌿</text>
                    </svg>
                  )}
                </div>
                <div>
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-meta">
                    {item.category} · Qty {item.qty}
                  </div>
                </div>
                <div className="cart-item-right">
                  <span className="cart-item-price">
                    {fmt(item.price * item.qty, currency)}
                  </span>
                  <button
                    className="cart-item-remove"
                    onClick={() => onRemove(item.id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total-row">
            <span className="cart-total-label">Contribution</span>
            <span className="cart-total-val">{fmt(total, currency)}</span>
          </div>
          <button
            className="checkout-btn"
            disabled={items.length === 0}
            onClick={onCheckout}
          >
            Continue to Receipt
          </button>
          <p className="cart-note">
            A formal receipt will be generated. You and the curator settle the contribution offline — no fees, no intermediaries.
          </p>
        </div>
      </aside>
    </>
  )
}
