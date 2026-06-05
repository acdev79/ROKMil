import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Store Settings',
  admin: {
    description: 'Global settings for the ROKMil gallery. Changes here apply immediately.',
  },
  fields: [
    {
      name: 'storeName',
      type: 'text',
      label: 'Store / Collection Name',
      defaultValue: 'ROKMil Living Collection',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline (shown under logo)',
      defaultValue: 'Korean Botanicals',
    },
    {
      name: 'heroTitle',
      type: 'text',
      label: 'Hero Title (first word)',
      defaultValue: 'Rooted in',
    },
    {
      name: 'heroTitleItalic',
      type: 'text',
      label: 'Hero Title (italic line)',
      defaultValue: 'Korean nature',
    },
    {
      name: 'heroSubtitle',
      type: 'textarea',
      label: 'Hero Subtitle',
      defaultValue: 'Each specimen is cultivated with reverence for the Korean horticultural tradition — miniature landscapes that carry centuries of contemplative practice. Your contribution sustains the collection directly.',
    },

    // ── ORGANISER / RECEIPT DETAILS ────────────────────────────────────
    {
      type: 'row',
      fields: [
        {
          name: 'organisersName',
          type: 'text',
          label: 'Organiser Name (on receipt)',
          defaultValue: 'ROKMil Living Collection',
        },
        {
          name: 'organisersEmail',
          type: 'email',
          label: 'Organiser Email (on receipt)',
          defaultValue: 'collection@rokmil.com',
        },
      ],
    },
    {
      name: 'receiptMessage',
      type: 'textarea',
      label: 'Receipt Message',
      defaultValue: 'Thank you for your contribution to the ROKMil Living Collection. Please present this receipt to our curator to arrange handover of your specimens. Contribution may be settled by bank transfer or cash — our curator will contact you within 48 hours to confirm collection details.',
    },

    // ── EMAIL (RESEND) ─────────────────────────────────────────────────
    {
      name: 'sendReceiptEmails',
      type: 'checkbox',
      label: 'Send receipt emails to collector',
      defaultValue: true,
      admin: { description: 'If checked, a copy of the receipt is emailed to the collector via Resend.' },
    },
    {
      name: 'notifyOrganiserEmail',
      type: 'email',
      label: 'Notify organiser at this email on each submission',
      admin: { description: 'Leave blank to disable organiser notifications.' },
    },

    // ── CURRENCY ──────────────────────────────────────────────────────
    {
      name: 'currency',
      type: 'select',
      label: 'Currency',
      defaultValue: 'USD',
      options: [
        { label: 'USD — $', value: 'USD' },
        { label: 'EUR — €', value: 'EUR' },
        { label: 'GBP — £', value: 'GBP' },
        { label: 'KRW — ₩', value: 'KRW' },
        { label: 'AUD — A$', value: 'AUD' },
      ],
    },
  ],
}
