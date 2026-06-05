/**
 * app/api/receipt/route.ts
 * POST — generates a receipt, emails the collector, and notifies the organiser.
 */

import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface CartItem {
  name: string
  latinName: string
  categoryLabel: string
  price: number
  originalPrice?: number
  qty: number
}

interface ReceiptPayload {
  name: string
  email: string
  phone?: string
  message?: string
  items: CartItem[]
  total: number
  settings: {
    storeName: string
    organisersName: string
    organisersEmail: string
    receiptMessage: string
    notifyOrganiserEmail?: string
    sendReceiptEmails?: boolean
    currency: string
  }
}

function formatCurrency(amount: number, currency: string) {
  const symbols: Record<string, string> = { USD: '$', EUR: '€', GBP: '£', KRW: '₩', AUD: 'A$' }
  const symbol = symbols[currency] || '$'
  return `${symbol}${amount.toLocaleString()}`
}

function generateReceiptId() {
  const now = new Date()
  const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `RM-${date}-${rand}`
}

function receiptEmailHtml(payload: ReceiptPayload, receiptId: string) {
  const { name, email, phone, message, items, total, settings } = payload
  const fmt = (n: number) => formatCurrency(n, settings.currency)
  const date = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })

  const rows = items.map((item) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;font-size:14px;color:#1a1a17">${item.name}
        <div style="font-size:12px;color:#a8a89e;font-style:italic;margin-top:2px">${item.latinName}</div>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:center;color:#a8a89e;font-size:14px">${item.qty}</td>
      <td style="padding:10px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-size:14px;color:#1a1a17">${fmt(item.price * item.qty)}</td>
    </tr>
  `).join('')

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0efe8;font-family:system-ui,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;max-width:560px;width:100%">
        <!-- Header -->
        <tr><td style="padding:40px 40px 20px;border-bottom:1px solid #e8e4d8;text-align:center">
          <div style="font-size:18px;font-weight:600;letter-spacing:0.3em;text-transform:uppercase;color:#1a1a17">ROK<span style="color:#8c6030">·</span>MIL</div>
          <div style="font-size:14px;color:#6e6e66;font-style:italic;margin-top:4px">Contribution Receipt — Living Collection</div>
          <div style="font-size:11px;color:#a8a89e;letter-spacing:0.15em;text-transform:uppercase;margin-top:8px">Receipt No. ${receiptId} · ${date}</div>
        </td></tr>

        <!-- Collector -->
        <tr><td style="padding:24px 40px 0">
          <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#a8a89e;margin-bottom:12px">Collector</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:50%;padding-bottom:10px">
                <div style="font-size:11px;color:#a8a89e;margin-bottom:2px">Name</div>
                <div style="font-size:13px;color:#1a1a17;font-weight:500">${name}</div>
              </td>
              <td style="width:50%;padding-bottom:10px">
                <div style="font-size:11px;color:#a8a89e;margin-bottom:2px">Email</div>
                <div style="font-size:13px;color:#1a1a17;font-weight:500">${email}</div>
              </td>
            </tr>
            ${phone ? `<tr><td style="padding-bottom:10px"><div style="font-size:11px;color:#a8a89e;margin-bottom:2px">Phone</div><div style="font-size:13px;color:#1a1a17;font-weight:500">${phone}</div></td></tr>` : ''}
            ${message ? `<tr><td colspan="2" style="padding-bottom:10px"><div style="font-size:11px;color:#a8a89e;margin-bottom:2px">Message</div><div style="font-size:13px;color:#4a4740;font-style:italic">"${message}"</div></td></tr>` : ''}
          </table>
        </td></tr>

        <!-- Items -->
        <tr><td style="padding:24px 40px 0">
          <div style="font-size:10px;letter-spacing:0.25em;text-transform:uppercase;color:#a8a89e;margin-bottom:12px">Specimens Selected</div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <th style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:left;font-weight:400">Specimen</th>
              <th style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:center;font-weight:400">Qty</th>
              <th style="font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:#a8a89e;padding:6px 0;border-bottom:1px solid #e8e4d8;text-align:right;font-weight:400">Contribution</th>
            </tr>
            ${rows}
            <tr>
              <td colspan="2" style="padding:16px 0 0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6e6e66">Total Contribution</td>
              <td style="padding:16px 0 0;text-align:right;font-size:26px;font-weight:300;color:#1a1a17">${fmt(total)}</td>
            </tr>
          </table>
        </td></tr>

        <!-- Note -->
        <tr><td style="padding:24px 40px 32px">
          <div style="background:#edeae0;border-left:2px solid #8c6030;padding:16px 20px;font-size:12px;color:#4a4740;line-height:1.7">
            <strong style="display:block;margin-bottom:6px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase">Next Steps</strong>
            ${settings.receiptMessage}<br><br>
            <strong>Curator:</strong> ${settings.organisersName} &nbsp;·&nbsp; <strong>Contact:</strong> ${settings.organisersEmail}
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest) {
  try {
    const body: ReceiptPayload = await req.json()

    // Basic validation
    if (!body.name || !body.email || !body.items?.length) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const receiptId = generateReceiptId()

    const emails: Promise<unknown>[] = []

    // Email the collector
    if (body.settings.sendReceiptEmails !== false) {
      emails.push(
        resend.emails.send({
          from: `${body.settings.storeName} <receipts@rokmil.com>`,
          to: body.email,
          subject: `Your ROKMil receipt — ${receiptId}`,
          html: receiptEmailHtml(body, receiptId),
        })
      )
    }

    // Notify the organiser
    if (body.settings.notifyOrganiserEmail) {
      emails.push(
        resend.emails.send({
          from: `ROKMil System <receipts@rokmil.com>`,
          to: body.settings.notifyOrganiserEmail,
          subject: `New contribution receipt — ${receiptId} from ${body.name}`,
          html: receiptEmailHtml(body, receiptId),
        })
      )
    }

    await Promise.allSettled(emails)

    return NextResponse.json({ receiptId, ok: true })
  } catch (err) {
    console.error('Receipt API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
