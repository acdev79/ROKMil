import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const TEAM_EMAIL = process.env.TEAM_EMAIL || 'acdev79@gmail.com'
const TEAM_PHONE = process.env.TEAM_PHONE || '+19172911306'
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || '+18668131571'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

interface CartItem { name: string; latinName?: string; categoryLabel: string; price: number; qty: number }
interface ReceiptPayload {
  name: string; email: string; phone?: string; message?: string
  items: CartItem[]; total: number
  deliveryFee?: number; discount?: number
  settings: {
    storeName: string; organisersName: string; organisersEmail: string
    receiptMessage: string; sendReceiptEmails?: boolean; currency: string
  }
}

function fmt(n: number, currency: string) {
  const s: Record<string,string> = { USD:'$', EUR:'€', GBP:'£', KRW:'₩', AUD:'A$' }
  return `${s[currency]||'$'}${(n||0).toLocaleString()}`
}

function generateReceiptId() {
  const now = new Date()
  const d = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`
  return `RM-${d}-${Math.random().toString(36).slice(2,6).toUpperCase()}`
}

function buildHtml(p: ReceiptPayload, id: string) {
  const date = new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })
  const rows = p.items.map(i => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;font-size:14px;color:#1a1a17">${i.name}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:center;color:#a8a89e;font-size:14px">${i.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-size:14px;color:#1a1a17">${fmt(i.price*i.qty,p.settings.currency)}</td>
    </tr>`).join('')

  const deliveryRow = p.deliveryFee ? `<tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#6e6e66">Delivery</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#6e6e66">${fmt(p.deliveryFee,p.settings.currency)}</td></tr>` : ''
  const discountRow = p.discount ? `<tr><td colspan="2" style="padding:6px 0;font-size:13px;color:#5a7a50">Discount</td><td style="padding:6px 0;text-align:right;font-size:13px;color:#5a7a50">−${fmt(p.discount,p.settings.currency)}</td></tr>` : ''

  return `<!DOCTYPE html><html><body style="margin:0;padding:0;background:#f0efe8;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px">
  <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;max-width:560px;width:100%">
    <tr><td style="padding:40px 40px 20px;border-bottom:1px solid #e8e4d8;text-align:center">
      <div style="font-size:18px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#1a1a17">ROK<span style="color:#8c6030">·</span>MIL</div>
      <div style="font-size:14px;color:#6e6e66;font-style:italic;margin-top:4px">Contribution Receipt</div>
      <div style="font-size:11px;color:#a8a89e;margin-top:8px">Receipt No. ${id} · ${date}</div>
    </td></tr>
    <tr><td style="padding:24px 40px 0">
      <p style="font-size:14px;color:#1a1a17;margin:0"><strong>${p.name}</strong></p>
      <p style="font-size:13px;color:#6e6e66;margin:4px 0 0">${p.email}${p.phone ? ' · '+p.phone : ''}</p>
      ${p.message ? `<p style="font-size:13px;color:#4a4740;font-style:italic;margin-top:8px">"${p.message}"</p>` : ''}
    </td></tr>
    <tr><td style="padding:24px 40px 0">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:left;font-weight:400">Item</th>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:center;font-weight:400">Qty</th>
          <th style="font-size:10px;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-weight:400">Amount</th>
        </tr>
        ${rows}${deliveryRow}${discountRow}
        <tr>
          <td colspan="2" style="padding:16px 0 0;font-size:11px;text-transform:uppercase;color:#6e6e66">Total</td>
          <td style="padding:16px 0 0;text-align:right;font-size:26px;font-weight:300;color:#1a1a17">${fmt(p.total,p.settings.currency)}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:24px 40px 32px">
      <div style="background:#edeae0;border-left:2px solid #8c6030;padding:16px 20px;font-size:12px;color:#4a4740;line-height:1.7">
        ${p.settings.receiptMessage}<br><br>
        <strong>Curator:</strong> ${p.settings.organisersName} · ${p.settings.organisersEmail}
      </div>
    </td></tr>
  </table></td></tr></table></body></html>`
}

function buildSms(p: ReceiptPayload, id: string) {
  const lines = p.items.map(i => `  • ${i.name} x${i.qty} = ${fmt(i.price*i.qty,p.settings.currency)}`).join('\n')
  return `🌿 ROKMil — New Order\nReceipt: ${id}\nCollector: ${p.name}\nPhone: ${p.phone||'—'}\nEmail: ${p.email}\n\nItems:\n${lines}\n\nTotal: ${fmt(p.total,p.settings.currency)}${p.message?`\n\nNote: "${p.message}"`:''}` 
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
  if (!res.ok) console.error('Twilio error:', await res.text())
}

async function saveOrder(p: ReceiptPayload, id: string) {
  const subtotal = p.items.reduce((s, i) => s + i.price * i.qty, 0)
  const order = {
    receiptId: id,
    status: 'pending',
    collectorName: p.name,
    collectorEmail: p.email,
    collectorPhone: p.phone,
    collectorMessage: p.message,
    items: p.items.map(i => ({
      name: i.name,
      size: i.categoryLabel,
      price: i.price,
      qty: i.qty,
      subtotal: i.price * i.qty,
    })),
    subtotal,
    deliveryFee: p.deliveryFee || 0,
    discount: p.discount || 0,
    adjustment: 0,
    total: p.total,
    currency: p.settings.currency,
  }

  await fetch(`${SITE_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  }).catch(err => console.error('Order save failed:', err))
}

export async function POST(req: NextRequest) {
  try {
    const body: ReceiptPayload = await req.json()
    if (!body.name || !body.email || !body.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const id = generateReceiptId()
    const html = buildHtml(body, id)
    const sms = buildSms(body, id)

    await Promise.allSettled([
      // Email collector
      body.settings.sendReceiptEmails !== false
        ? resend.emails.send({ from: 'ROKMil <receipts@rokmil.com>', to: body.email, subject: `Your ROKMil receipt — ${id}`, html })
        : Promise.resolve(),
      // Email team
      resend.emails.send({ from: 'ROKMil Orders <receipts@rokmil.com>', to: TEAM_EMAIL, subject: `🌿 New order ${id} — ${body.name} — ${fmt(body.total, body.settings.currency)}`, html }),
      // SMS team
      sendSms(TEAM_PHONE, sms),
      // Save to database
      saveOrder(body, id),
    ])

    return NextResponse.json({ receiptId: id, ok: true })
  } catch (err) {
    console.error('Receipt API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
