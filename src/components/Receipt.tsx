'use client'
import type { CartItem, Settings } from '@/lib/types'
import { fmt } from '@/lib/types'

interface DonorInfo {
  name: string
  email: string
  phone?: string
  message?: string
}

interface Props {
  isOpen: boolean
  receiptId: string
  donor: DonorInfo | null
  items: CartItem[]
  settings: Settings | null
  onDone: () => void
}

export default function Receipt({ isOpen, receiptId, donor, items, settings, onDone }: Props) {
  const currency = settings?.currency || 'USD'
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0)
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  // Fees
  const fees = (settings as any)?.fees
  const deliveryEnabled = fees?.deliveryFeeEnabled
  const deliveryThreshold = fees?.deliveryFeeThreshold ?? 100
  const deliveryAmount = fees?.deliveryFeeAmount ?? 10
  const deliveryLabel = fees?.deliveryFeeLabel || 'Delivery'
  const deliveryFee = deliveryEnabled && subtotal < deliveryThreshold ? deliveryAmount : 0

  // Discount
  const dc = (settings as any)?.discountConfig
  const discountEnabled = dc?.enabled && subtotal >= (dc?.minimumOrder ?? 0)
  const discountAmount = discountEnabled
    ? dc?.type === 'percentage'
      ? Math.round(subtotal * (dc.value / 100))
      : dc?.value ?? 0
    : 0
  const discountLabel = dc?.label || 'Discount'

  const total = Math.max(0, subtotal + deliveryFee - discountAmount)

  return (
    <div className={`receipt-overlay ${isOpen ? 'open' : ''}`}>
      <div className="receipt-doc" id="receipt-print-area">
        <div className="receipt-header">
          <div className="receipt-wordmark">ROK<span>·</span>MIL</div>
          <div className="receipt-subtitle">Contribution Receipt — Living Collection</div>
          <div className="receipt-num">Receipt No. {receiptId} · {date}</div>
        </div>

        <hr className="receipt-divider" />

        {donor && (
          <>
            <div className="receipt-sec-label">Collector</div>
            <div className="receipt-donor-grid">
              <div><div className="r-field-label">Name</div><div className="r-field-val">{donor.name}</div></div>
              <div><div className="r-field-label">Email</div><div className="r-field-val">{donor.email}</div></div>
              {donor.phone && <div><div className="r-field-label">Phone</div><div className="r-field-val">{donor.phone}</div></div>}
              <div><div className="r-field-label">Date</div><div className="r-field-val">{date}</div></div>
              {donor.message && (
                <div style={{ gridColumn: '1 / -1' }}>
                  <div className="r-field-label">Note</div>
                  <div className="r-field-val" style={{ fontStyle: 'italic' }}>&ldquo;{donor.message}&rdquo;</div>
                </div>
              )}
            </div>
          </>
        )}

        <hr className="receipt-divider" />

        <div className="receipt-sec-label">Items Selected</div>
        <table className="receipt-table">
          <thead>
            <tr>
              <th>Specimen</th>
              <th style={{ textAlign: 'center' }}>Qty</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.key}>
                <td>
                  {item.specimenName}
                  <div className="r-item-sub">{item.sizeLabel}</div>
                  {item.latinName && <div className="r-item-sub" style={{ fontStyle: 'italic' }}>{item.latinName}</div>}
                </td>
                <td style={{ textAlign: 'center', color: '#A8A89E' }}>{item.qty}</td>
                <td>{fmt(item.price * item.qty, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Subtotal, fees, discounts, total */}
        <div className="receipt-totals">
          <div className="receipt-total-line">
            <span>Subtotal</span>
            <span>{fmt(subtotal, currency)}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="receipt-total-line">
              <span>{deliveryLabel}</span>
              <span>{fmt(deliveryFee, currency)}</span>
            </div>
          )}
          {deliveryEnabled && subtotal >= deliveryThreshold && (
            <div className="receipt-total-line receipt-total-positive">
              <span>{deliveryLabel} — Free over {fmt(deliveryThreshold, currency)}</span>
              <span>{fmt(0, currency)}</span>
            </div>
          )}
          {discountEnabled && discountAmount > 0 && (
            <div className="receipt-total-line receipt-total-positive">
              <span>{discountLabel}{dc?.type === 'percentage' ? ` (${dc.value}%)` : ''}</span>
              <span>−{fmt(discountAmount, currency)}</span>
            </div>
          )}
          <div className="receipt-total-row">
            <span className="receipt-total-lbl">Total Contribution</span>
            <span className="receipt-total-val">{fmt(total, currency)}</span>
          </div>
        </div>

        <hr className="receipt-divider" />

        <div className="receipt-note">
          <strong style={{ display: 'block', marginBottom: '6px', fontSize: '0.76rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>Next Steps</strong>
          {settings?.receiptMessage || 'Our curator will be in touch to arrange handover.'}
          <br /><br />
          <strong>Curator:</strong> {settings?.organisersName || 'ROKMil'}&nbsp;·&nbsp;
          <strong>Contact:</strong> {settings?.organisersEmail || ''}
        </div>

        <div className="receipt-actions">
          <button className="receipt-print-btn" onClick={() => window.print()}>Print / Save PDF</button>
          <button className="receipt-done-btn" onClick={onDone}>Complete — Thank You</button>
        </div>
      </div>
    </div>
  )
}
