'use client'
import { useDocumentInfo, useForm } from '@payloadcms/ui'
import { useState } from 'react'

const STATUS_OPTIONS = [
  { value: 'pending',   label: '⏳ Pending',   color: '#D4A020' },
  { value: 'confirmed', label: '✅ Confirmed', color: '#5A7A50' },
  { value: 'fulfilled', label: '📦 Fulfilled', color: '#4A7040' },
  { value: 'cancelled', label: '❌ Cancelled', color: '#C87870' },
]

function fmt(n: number, currency = 'USD') {
  const s: Record<string,string> = { USD:'$', EUR:'€', GBP:'£', KRW:'₩', AUD:'A$' }
  return `${s[currency]||'$'}${(n||0).toLocaleString()}`
}

export default function OrderReceiptPreview() {
  const { data, id } = useDocumentInfo()
  const { dispatchFields, submit } = useForm()
  const order = data as any
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!order?.receiptId) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'200px', color:'#6E6E66', fontFamily:'system-ui', fontSize:'14px' }}>
        Save the order first to see the receipt preview.
      </div>
    )
  }

  const currency = order.currency || 'USD'
  const currentStatus = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
  const total = order.total || (order.items || []).reduce((s: number, i: any) => s + (i.price * i.qty), 0)

  const handleStatusChange = async (newStatus: string) => {
    setSaving(true)
    setSaved(false)
    try {
      dispatchFields({ type: 'UPDATE', path: 'status', value: newStatus })
      await submit()
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (e) {
      console.error('Status update failed', e)
    }
    setSaving(false)
  }

  return (
    <div style={{ width:'100%', padding:'clamp(1rem, 4vw, 2rem)', boxSizing:'border-box', display:'flex', flexDirection:'column', alignItems:'center' }}>

      {/* Status changer */}
      <div style={{ width:'100%', maxWidth:'600px', marginBottom:'1rem', padding:'14px 16px', background:'#1C1B18', border:'1px solid rgba(255,255,255,0.08)', boxSizing:'border-box' }}>
        <div style={{ fontSize:'10px', letterSpacing:'0.2em', textTransform:'uppercase', color:'#6E6E66', marginBottom:'10px', fontFamily:'system-ui' }}>Order Status</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
          {STATUS_OPTIONS.map(s => (
            <button
              key={s.value}
              onClick={() => handleStatusChange(s.value)}
              disabled={saving}
              style={{
                padding:'8px 14px', fontSize:'11px', letterSpacing:'0.12em',
                textTransform:'uppercase', fontFamily:'system-ui', cursor:'pointer',
                border: `1px solid ${s.value === order.status ? s.color : 'rgba(255,255,255,0.12)'}`,
                background: s.value === order.status ? `${s.color}22` : 'transparent',
                color: s.value === order.status ? s.color : '#6E6E66',
                transition:'all 0.2s', flex:'1', minWidth:'100px',
                opacity: saving ? 0.6 : 1,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
        {saved && (
          <div style={{ marginTop:'8px', fontSize:'11px', color:'#5A7A50', fontFamily:'system-ui', letterSpacing:'0.1em' }}>
            ✓ Status updated and notifications sent
          </div>
        )}
      </div>

      {/* Actions */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'1.5rem', flexWrap:'wrap', justifyContent:'center', width:'100%', maxWidth:'600px' }}>
        <button
          onClick={() => window.print()}
          style={{ padding:'10px 20px', background:'#1A1A17', color:'#F0EFE8', border:'none', cursor:'pointer', fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase', fontFamily:'system-ui', flex:'1', minWidth:'140px' }}
        >
          Print / Save PDF
        </button>
        <div style={{ padding:'10px 16px', fontSize:'12px', letterSpacing:'0.12em', textTransform:'uppercase', color: currentStatus.color, border:`1px solid ${currentStatus.color}`, fontFamily:'system-ui', flex:'1', minWidth:'140px', textAlign:'center' }}>
          {currentStatus.label}
        </div>
      </div>

      {/* Receipt */}
      <div style={{ background:'#FDFCF9', border:'1px solid #E8E4D8', padding:'clamp(1.2rem, 5vw, 2.5rem)', fontFamily:'Georgia, serif', width:'100%', maxWidth:'600px', boxSizing:'border-box' }}>
        {/* Header */}
        <div style={{ textAlign:'center', marginBottom:'2rem', paddingBottom:'1.5rem', borderBottom:'1px solid #E8E4D8' }}>
          <div style={{ fontSize:'clamp(16px,4vw,20px)', fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase', color:'#1A1A17', fontFamily:'system-ui' }}>
            ROK<span style={{ color:'#8C6030' }}>·</span>MIL
          </div>
          <div style={{ fontSize:'13px', color:'#6E6E66', fontStyle:'italic', marginTop:'4px' }}>Contribution Receipt</div>
          <div style={{ fontSize:'11px', color:'#A8A89E', letterSpacing:'0.14em', textTransform:'uppercase', marginTop:'8px', fontFamily:'system-ui' }}>
            {order.receiptId} · {new Date(order.createdAt).toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}
          </div>
        </div>

        {/* Collector */}
        <div style={{ marginBottom:'1.5rem', paddingBottom:'1.5rem', borderBottom:'1px dashed #E8E4D8' }}>
          <div style={{ fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', color:'#A8A89E', marginBottom:'8px', fontFamily:'system-ui' }}>Collector</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(140px, 1fr))', gap:'8px 1.5rem' }}>
            {[
              ['Name', order.collectorName],
              ['Email', order.collectorEmail],
              order.collectorPhone && ['Phone', order.collectorPhone],
              ['Date', new Date(order.createdAt).toLocaleDateString('en-GB')],
            ].filter(Boolean).map(([label, value]: any) => (
              <div key={label}>
                <div style={{ fontSize:'10px', color:'#A8A89E', marginBottom:'2px', fontFamily:'system-ui' }}>{label}</div>
                <div style={{ fontSize:'13px', color:'#1A1A17', fontFamily:'system-ui', wordBreak:'break-word' }}>{value}</div>
              </div>
            ))}
          </div>
          {order.collectorMessage && (
            <div style={{ marginTop:'10px', fontStyle:'italic', fontSize:'13px', color:'#4A4740' }}>
              &ldquo;{order.collectorMessage}&rdquo;
            </div>
          )}
        </div>

        {/* Items */}
        <div style={{ marginBottom:'1.5rem' }}>
          <div style={{ fontSize:'10px', letterSpacing:'0.22em', textTransform:'uppercase', color:'#A8A89E', marginBottom:'10px', fontFamily:'system-ui' }}>Items</div>
          <table style={{ width:'100%', borderCollapse:'collapse' }}>
            <thead>
              <tr>
                {['Item', 'Qty', 'Amount'].map((h, i) => (
                  <th key={h} style={{ fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase', color:'#A8A89E', padding:'6px 0', borderBottom:'1px solid #E8E4D8', textAlign: i===2?'right':i===1?'center':'left', fontWeight:400, fontFamily:'system-ui' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(order.items || []).map((item: any, i: number) => (
                <tr key={i}>
                  <td style={{ padding:'10px 0', borderBottom:'1px solid #F0EFE8', fontSize:'clamp(12px,3vw,14px)', color:'#1A1A17' }}>
                    {item.name}
                    {item.size && <div style={{ fontSize:'11px', color:'#A8A89E', marginTop:'2px', fontFamily:'system-ui' }}>{item.size}</div>}
                  </td>
                  <td style={{ padding:'10px 0', borderBottom:'1px solid #F0EFE8', textAlign:'center', fontSize:'14px', color:'#A8A89E', fontFamily:'system-ui' }}>{item.qty}</td>
                  <td style={{ padding:'10px 0', borderBottom:'1px solid #F0EFE8', textAlign:'right', fontSize:'clamp(12px,3vw,14px)', color:'#1A1A17', fontFamily:'system-ui', whiteSpace:'nowrap' }}>{fmt(item.price * item.qty, currency)}</td>
                </tr>
              ))}

              {order.deliveryFee > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding:'6px 0', fontSize:'13px', color:'#6E6E66', fontFamily:'system-ui' }}>Delivery</td>
                  <td style={{ padding:'6px 0', textAlign:'right', fontSize:'13px', color:'#6E6E66', fontFamily:'system-ui' }}>{fmt(order.deliveryFee, currency)}</td>
                </tr>
              )}
              {order.discount > 0 && (
                <tr>
                  <td colSpan={2} style={{ padding:'6px 0', fontSize:'13px', color:'#5A7A50', fontFamily:'system-ui' }}>Discount</td>
                  <td style={{ padding:'6px 0', textAlign:'right', fontSize:'13px', color:'#5A7A50', fontFamily:'system-ui' }}>−{fmt(order.discount, currency)}</td>
                </tr>
              )}
              {order.adjustment !== 0 && order.adjustment != null && (
                <tr>
                  <td colSpan={2} style={{ padding:'6px 0', fontSize:'13px', color:'#6E6E66', fontFamily:'system-ui' }}>{order.adjustmentNote || 'Adjustment'}</td>
                  <td style={{ padding:'6px 0', textAlign:'right', fontSize:'13px', color:'#6E6E66', fontFamily:'system-ui' }}>{order.adjustment > 0 ? '+' : ''}{fmt(order.adjustment, currency)}</td>
                </tr>
              )}

              <tr>
                <td colSpan={2} style={{ padding:'14px 0 0', fontSize:'11px', letterSpacing:'0.14em', textTransform:'uppercase', color:'#6E6E66', fontFamily:'system-ui' }}>Total Contribution</td>
                <td style={{ padding:'14px 0 0', textAlign:'right', fontSize:'clamp(20px,5vw,28px)', fontWeight:300, color:'#1A1A17' }}>{fmt(total, currency)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Note */}
        <div style={{ background:'#F0EFE8', borderLeft:'2px solid #8C6030', padding:'14px 18px', fontSize:'12px', color:'#4A4740', lineHeight:1.7, fontFamily:'system-ui' }}>
          Our curator will contact you to arrange handover of your items.
        </div>

        {order.internalNotes && (
          <div style={{ marginTop:'1rem', padding:'12px 16px', background:'#FFF8E8', border:'1px dashed #D4A020', fontSize:'12px', color:'#8C6030', fontFamily:'system-ui' }}>
            <strong style={{ display:'block', marginBottom:'4px', fontSize:'10px', letterSpacing:'0.14em', textTransform:'uppercase' }}>Internal Note</strong>
            {order.internalNotes}
          </div>
        )}
      </div>
    </div>
  )
}
