'use client'
import { useDocumentInfo } from '@payloadcms/ui'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending:   { label: '⏳ Pending',   color: '#D4A020' },
  confirmed: { label: '✅ Confirmed', color: '#5A7A50' },
  fulfilled: { label: '📦 Fulfilled', color: '#4A7040' },
  cancelled: { label: '❌ Cancelled', color: '#C87870' },
}

function fmt(n: number, currency = 'USD') {
  const s: Record<string,string> = { USD:'$', EUR:'€', GBP:'£', KRW:'₩', AUD:'A$' }
  return `${s[currency]||'$'}${(n||0).toLocaleString()}`
}

export default function OrderReceiptPreview() {
  const { data } = useDocumentInfo()
  const order = data as any

  if (!order?.receiptId) {
    return (
      <div style={{ padding: '2rem', color: '#6E6E66', fontFamily: 'system-ui', fontSize: '14px' }}>
        Save the order first to see the receipt preview.
      </div>
    )
  }

  const currency = order.currency || 'USD'
  const status = STATUS_LABELS[order.status] || { label: order.status, color: '#6E6E66' }
  const subtotal = (order.items || []).reduce((s: number, i: any) => s + (i.price * i.qty), 0)
  const total = order.total || subtotal

  return (
    <div style={{ padding: '1.5rem', fontFamily: 'system-ui', maxWidth: '600px' }}>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '1.5rem' }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: '8px 18px', background: '#1A1A17', color: '#F0EFE8',
            border: 'none', cursor: 'pointer', fontSize: '12px',
            letterSpacing: '0.12em', textTransform: 'uppercase', fontFamily: 'system-ui',
          }}
        >
          Print / Save PDF
        </button>
        <span style={{
          padding: '8px 16px', fontSize: '12px', letterSpacing: '0.12em',
          textTransform: 'uppercase', color: status.color,
          border: `1px solid ${status.color}`, fontFamily: 'system-ui',
        }}>
          {status.label}
        </span>
      </div>

      {/* Receipt */}
      <div style={{
        background: '#FDFCF9', border: '1px solid #E8E4D8',
        padding: '2.5rem', fontFamily: 'Georgia, serif',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem', paddingBottom: '1.5rem', borderBottom: '1px solid #E8E4D8' }}>
          <div style={{ fontSize: '20px', fontWeight: 600, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#1A1A17', fontFamily: 'system-ui' }}>
            ROK<span style={{ color: '#8C6030' }}>·</span>MIL
          </div>
          <div style={{ fontSize: '13px', color: '#6E6E66', fontStyle: 'italic', marginTop: '4px' }}>
            Contribution Receipt
          </div>
          <div style={{ fontSize: '11px', color: '#A8A89E', letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: '8px', fontFamily: 'system-ui' }}>
            {order.receiptId} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}
          </div>
        </div>

        {/* Collector */}
        <div style={{ marginBottom: '1.5rem', paddingBottom: '1.5rem', borderBottom: '1px dashed #E8E4D8' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A8A89E', marginBottom: '8px', fontFamily: 'system-ui' }}>Collector</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 1.5rem' }}>
            {[
              ['Name', order.collectorName],
              ['Email', order.collectorEmail],
              order.collectorPhone && ['Phone', order.collectorPhone],
              ['Date', new Date(order.createdAt).toLocaleDateString('en-GB')],
            ].filter(Boolean).map(([label, value]: any) => (
              <div key={label}>
                <div style={{ fontSize: '10px', color: '#A8A89E', marginBottom: '2px', fontFamily: 'system-ui' }}>{label}</div>
                <div style={{ fontSize: '13px', color: '#1A1A17', fontFamily: 'system-ui' }}>{value}</div>
              </div>
            ))}
          </div>
          {order.collectorMessage && (
            <div style={{ marginTop: '10px', fontStyle: 'italic', fontSize: '13px', color: '#4A4740' }}>
              &ldquo;{order.collectorMessage}&rdquo;
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ marginBottom: '1.5rem' }}>
          <div style={{ fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase', color: '#A8A89E', marginBottom: '10px', fontFamily: 'system-ui' }}>Items</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {['Item', 'Qty', 'Amount'].map((h, i) => (
                  <th key={h} style={{
                    fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase',
                    color: '#A8A89E', padding: '6px 0', borderBottom: '1px solid #E8E4D8',
                    textAlign: i === 2 ? 'right' : i === 1 ? 'center' : 'left', fontWeight: 400,
                    fontFamily: 'system-ui',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td style={{ padding: '10px 0', borderBottom: '1px solid #F0EFE8', fontSize: '14px', color: '#1A1A17' }}>
                    {item.name}
                    {item.size && <div style={{ fontSize: '11px', color: '#A8A89E', marginTop: '2px', fontFamily: 'system-ui' }}>{item.size}</div>}
                  </td>
                  <td style={{ padding: '10px 0', borderBottom: '1px solid #F0EFE8', textAlign: 'center', fontSize: '14px', color: '#A8A89E', fontFamily: 'system-ui' }}>{item.qty}</td>
                  <td style={{ padding: '10px 0', borderBottom: '1px solid #F0EFE8', textAlign: 'right', fontSize: '14px', color: '#1A1A17', fontFamily: 'system-ui' }}>{fmt(item.price * item.qty, currency)}</td>
                </tr>
              ))}

              {/* Fees and discounts */}
              {order.deliveryFee > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '6px 0', fontSize: '13px', color: '#6E6E66', fontFamily: 'system-ui' }}>Delivery</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '13px', color: '#6E6E66', fontFamily: 'system-ui' }}>{fmt(order.deliveryFee, currency)}</td>
                </tr>
              )}
              {order.discount > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding: '6px 0', fontSize: '13px', color: '#5A7A50', fontFamily: 'system-ui' }}>Discount</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '13px', color: '#5A7A50', fontFamily: 'system-ui' }}>−{fmt(order.discount, currency)}</td>
                </tr>
              )}
              {order.adjustment !== 0 && order.adjustment != null && (
                <tr>
                  <td colSpan={2} style={{ padding: '6px 0', fontSize: '13px', color: '#6E6E66', fontFamily: 'system-ui' }}>{order.adjustmentNote || 'Adjustment'}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: '13px', color: '#6E6E66', fontFamily: 'system-ui' }}>{order.adjustment > 0 ? '+' : ''}{fmt(order.adjustment, currency)}</td>
                </tr>
              )}

              {/* Total */}
              <tr>
                <td colSpan={2} style={{ padding: '14px 0 0', fontSize: '11px', letterSpacing: '0.14em', textTransform: 'uppercase', color: '#6E6E66', fontFamily: 'system-ui' }}>Total Contribution</td>
                <td style={{ padding: '14px 0 0', textAlign: 'right', fontSize: '28px', fontWeight: 300, color: '#1A1A17' }}>{fmt(total, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div style={{ background: '#F0EFE8', borderLeft: '2px solid #8C6030', padding: '14px 18px', fontSize: '12px', color: '#4A4740', lineHeight: 1.7, fontFamily: 'system-ui' }}>
          Our curator will contact you to arrange handover of your items.
        </div>

        {/* Internal notes — team only */}
        {order.internalNotes && (
          <div style={{ marginTop: '1rem', padding: '12px 16px', background: '#FFF8E8', border: '1px dashed #D4A020', fontSize: '12px', color: '#8C6030', fontFamily: 'system-ui' }}>
            <strong style={{ display: 'block', marginBottom: '4px', fontSize: '10px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>Internal Note</strong>
            {order.internalNotes}
          </div>
        )}
      </div>
    </div>
  )
}
