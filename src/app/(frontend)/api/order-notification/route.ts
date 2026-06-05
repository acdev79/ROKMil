import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TEAM_EMAIL = process.env.TEAM_EMAIL || 'acdev79@gmail.com'
const TEAM_PHONE = process.env.TEAM_PHONE || '+19172911306'
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || '+18668131571'

const STATUS_LABELS: Record<string, string> = {
  pending: '⏳ Pending',
  confirmed: '✅ Confirmed',
  fulfilled: '📦 Fulfilled',
  cancelled: '❌ Cancelled',
}

function fmt(n: number, currency = 'USD') {
  const s: Record<string,string> = { USD:'$', EUR:'€', GBP:'£', KRW:'₩', AUD:'A$' }
  return `${s[currency]||'$'}${(n||0).toLocaleString()}`
}

function buildUpdateHtml(order: any) {
  const currency = order.currency || 'USD'
  const statusLabel = STATUS_LABELS[order.status] || order.status
  const rows = (order.items || []).map((i: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;font-size:14px;color:#1a1a17">
        ${i.name}${i.size ? `<div style="font-size:12px;color:#a8a89e">${i.size}</div>` : ''}
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:center;color:#a8a89e;font-size:14px">${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-size:14px;color:#1a1a17">${fmt(i.price * i.qty, currency)}</td>
    </tr>
  `).join('')

  const adjustmentRow = order.adjustment && order.adjustment !== 0 ? `
    <tr>
      <td colspan="2" style="padding:6px 0;font-size:13px;color:#6e6e66">${order.adjustmentNote || 'Adjustment'}</td>
      <td style="padding:6px 0;text-align:right;font-size:13px;color:#6e6e66">${order.adjustment > 0 ? '+' : ''}${fmt(order.adjustment, currency)}</td>
    </tr>` : ''

  const discountRow = order.discount ? `
    <tr>
      <td colspan="2" style="padding:6px 0;font-size:13px;color:#5a7a50">Discount</td>
      <td style="padding:6px 0;text-align:right;font-size:13px;color:#5a7a50">−${fmt(order.discount, currency)}</td>
    </tr>` : ''

  const deliveryRow = order.deliveryFee ? `
    <tr>
      <td colspan="2" style="padding:6px 0;font-size:13px;color:#6e6e66">Delivery</td>
      <td style="padding:6px 0;text-align:right;font-size:13px;color:#6e6e66">${fmt(order.deliveryFee, currency)}</td>
    </tr>` : ''

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0efe8;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%">
    <tr><td style="padding:40px 40px 20px;border-bottom:1px solid #e8e4d8;text-align:center">
      <div style="font-size:18px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#1a1a17">ROK<span style="color:#8c6030">·</span>MIL</div>
      <div style="font-size:14px;color:#6e6e66;margin-top:4px;font-style:italic">Updated Receipt</div>
      <div style="font-size:11px;color:#a8a89e;margin-top:8px">${order.receiptId}</div>
      <div style="display:inline-block;margin-top:12px;padding:6px 16px;background:#f0efe8;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#1a1a17">${statusLabel}</div>
    </td></tr>
    <tr><td style="padding:24px 40px 0">
      <p style="font-size:14px;color:#1a1a17;margin:0"><strong>${order.collectorName}</strong></p>
      <p style="font-size:13px;color:#6e6e66;margin:4px 0 0">${order.collectorEmail || ''}</p>
    </td></tr>
    <tr><td style="padding:24px 40px 0">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:left;font-weight:400">Item</th>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:center;font-weight:400">Qty</th>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-weight:400">Amount</th>
        </tr>
        ${rows}
        ${deliveryRow}${discountRow}${adjustmentRow}
        <tr>
          <td colspan="2" style="padding:16px 0 0;font-size:11px;text-transform:uppercase;color:#6e6e66">Total</td>
          <td style="padding:16px 0 0;text-align:right;font-size:26px;font-weight:300;color:#1a1a17">${fmt(order.total, currency)}</td>
        </tr>
      </table>
    </td></tr>
    ${order.internalNotes ? '' : `<tr><td style="padding:24px 40px 32px">
      <div style="background:#edeae0;border-left:2px solid #8c6030;padding:16px 20px;font-size:12px;color:#4a4740;line-height:1.7">
        If you have any questions about this update, please contact us directly.
      </div>
    </td></tr>`}
  </table></td></tr></table>
  </body></html>`
}

function buildUpdateSms(order: any) {
  const currency = order.currency || 'USD'
  const statusLabel = STATUS_LABELS[order.status] || order.status
  const itemLines = (order.items || []).map((i: any) => `  • ${i.name}${i.size ? ` (${i.size})` : ''} x${i.qty}`).join('\n')
  return `🌿 ROKMil — Order Updated\nReceipt: ${order.receiptId}\nStatus: ${statusLabel}\nCollector: ${order.collectorName}\n\nItems:\n${itemLines}\n\nTotal: ${fmt(order.total, currency)}`
}

async function sendSms(to: string, body: string) {
  if (!TWILIO_SID || !TWILIO_TOKEN) return
  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({ To: to, From: TWILIO_FROM, Body: body }).toString(),
  })
  if (!res.ok) console.error('Twilio SMS error:', await res.text())
}

export async function POST(req: NextRequest) {
  try {
    const { order } = await req.json()
    if (!order?.receiptId) return NextResponse.json({ ok: false }, { status: 400 })

    const html = buildUpdateHtml(order)
    const sms = buildUpdateSms(order)
    const isUpdate = order.updatedAt !== order.createdAt

    const subject = isUpdate
      ? `🌿 ROKMil order ${order.receiptId} updated — ${STATUS_LABELS[order.status] || order.status}`
      : `Your ROKMil receipt — ${order.receiptId}`

    await Promise.allSettled([
      // Email collector
      order.collectorEmail
        ? resend.emails.send({
            from: 'ROKMil <receipts@rokmil.com>',
            to: order.collectorEmail,
            subject,
            html,
          })
        : Promise.resolve(),

      // Email team
      resend.emails.send({
        from: 'ROKMil Orders <receipts@rokmil.com>',
        to: TEAM_EMAIL,
        subject: `[Team] ${subject}`,
        html,
      }),

      // SMS team
      sendSms(TEAM_PHONE, sms),
    ])

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Order notification error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
