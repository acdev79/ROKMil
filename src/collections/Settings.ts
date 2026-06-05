import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Store Settings',
  access: { read: () => true },
  fields: [
    // ── BRANDING ────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '🏪 Store & Branding',
      fields: [
        { name: 'storeName', type: 'text', label: 'Store Name', defaultValue: 'ROKMil Living Collection', admin: { description: 'Used in emails and receipts.' } },
        { name: 'tagline', type: 'text', label: 'Header Tagline', defaultValue: 'Korean Botanicals', admin: { description: 'Shown next to the logo in the header.' } },
        { name: 'currency', type: 'select', label: 'Currency', defaultValue: 'USD', options: [{ label: 'USD — $', value: 'USD' }, { label: 'EUR — €', value: 'EUR' }, { label: 'GBP — £', value: 'GBP' }, { label: 'KRW — ₩', value: 'KRW' }, { label: 'AUD — A$', value: 'AUD' }] },
      ],
    },

    // ── ANNOUNCEMENT BANNER ─────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '📢 Announcement Banner',
      fields: [
        { name: 'announcementEnabled', type: 'checkbox', label: 'Show announcement banner', defaultValue: false, admin: { description: 'Toggle this on to show a banner at the top of the gallery.' } },
        { name: 'announcementText', type: 'text', label: 'Announcement message', admin: { description: 'E.g. "New drops every Friday" or "Closed this weekend — back Monday."', condition: (data) => data?.announcementEnabled } },
        {
          name: 'announcementType',
          type: 'select',
          label: 'Banner style',
          defaultValue: 'info',
          options: [
            { label: 'Info (bronze)', value: 'info' },
            { label: 'Success (green) — new arrivals', value: 'success' },
            { label: 'Warning (amber) — delays / closures', value: 'warning' },
          ],
          admin: { condition: (data) => data?.announcementEnabled },
        },
        { name: 'announcementExpiry', type: 'date', label: 'Auto-hide after (optional)', admin: { description: 'Banner disappears automatically after this date. Leave blank to keep it until you uncheck above.', date: { pickerAppearance: 'dayOnly' }, condition: (data) => data?.announcementEnabled } },
      ],
    },

    // ── HERO ────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '🌿 Gallery Hero Text',
      fields: [
        { name: 'heroTitle', type: 'text', label: 'Hero title (first line)', defaultValue: 'Rooted in', admin: { description: 'Large text, first line.' } },
        { name: 'heroTitleItalic', type: 'text', label: 'Hero title (italic line)', defaultValue: 'Korean nature', admin: { description: 'Large text, second line — shown in bronze italic.' } },
        { name: 'heroSubtitle', type: 'textarea', label: 'Hero subtitle', defaultValue: 'Each specimen is cultivated with reverence for the Korean horticultural tradition.', admin: { description: 'Shown to the right of the title.' } },
      ],
    },

    // ── SIZE LABELS ─────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '⚖️ Size Labels',
      fields: [
        { name: 'label35g', type: 'text', label: '3.5g label', defaultValue: 'Eighth', admin: { description: 'Shown next to "3.5g" on product cards and receipts.' } },
        { name: 'label28g', type: 'text', label: '28g label', defaultValue: 'Oz', admin: { description: 'Shown next to "28g" on product cards and receipts.' } },
        { name: 'label15ml', type: 'text', label: '15mL label', defaultValue: 'Dropper', admin: { description: 'Shown next to "15mL" on tincture cards and receipts.' } },
      ],
    },

    // ── FEES ────────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '💰 Fees & Charges',
      fields: [
        { name: 'deliveryFeeEnabled', type: 'checkbox', label: 'Enable delivery fee', defaultValue: true },
        { name: 'deliveryFeeLabel', type: 'text', label: 'Fee label', defaultValue: 'Delivery', admin: { description: 'Shown on receipt — e.g. "Delivery", "Service fee", "Handling".', condition: (data) => data?.deliveryFeeEnabled } },
        { name: 'deliveryFeeAmount', type: 'number', label: 'Fee amount ($)', defaultValue: 10, min: 0, admin: { condition: (data) => data?.deliveryFeeEnabled } },
        { name: 'deliveryFeeThreshold', type: 'number', label: 'Free above this total ($)', defaultValue: 100, min: 0, admin: { description: 'Orders at or above this amount get free delivery. Set to 0 to always charge.', condition: (data) => data?.deliveryFeeEnabled } },
      ],
    },

    // ── DISCOUNTS ───────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '🏷️ Store-wide Discount',
      fields: [
        { name: 'discountEnabled', type: 'checkbox', label: 'Enable store-wide discount', defaultValue: false, admin: { description: 'Applies to all orders automatically.' } },
        { name: 'discountLabel', type: 'text', label: 'Discount label', defaultValue: 'Discount', admin: { description: 'Shown on the receipt line item.', condition: (data) => data?.discountEnabled } },
        {
          name: 'discountType',
          type: 'select',
          label: 'Discount type',
          defaultValue: 'percentage',
          options: [
            { label: 'Percentage off (e.g. 10% off)', value: 'percentage' },
            { label: 'Fixed amount off (e.g. $20 off)', value: 'fixed' },
          ],
          admin: { condition: (data) => data?.discountEnabled },
        },
        { name: 'discountValue', type: 'number', label: 'Discount value', min: 0, admin: { description: 'For percentage: enter 10 for 10% off. For fixed: enter 20 for $20 off.', condition: (data) => data?.discountEnabled } },
        { name: 'discountMinimumOrder', type: 'number', label: 'Minimum order to qualify ($)', defaultValue: 0, min: 0, admin: { description: 'Set to 0 for no minimum.', condition: (data) => data?.discountEnabled } },
      ],
    },

    // ── RECEIPT ─────────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '🧾 Receipt & Emails',
      fields: [
        { name: 'organisersName', type: 'text', label: 'Organiser name', defaultValue: 'ROKMil Living Collection', admin: { description: 'Shown at the bottom of the receipt.' } },
        { name: 'organisersEmail', type: 'email', label: 'Organiser email', defaultValue: 'collection@rokmil.com' },
        { name: 'receiptMessage', type: 'textarea', label: 'Receipt message', defaultValue: 'Thank you for your contribution. Our curator will contact you within 48 hours to arrange handover.' },
        { name: 'receiptFooter', type: 'textarea', label: 'Receipt footer / legal text', admin: { description: 'Optional disclaimer or terms shown at the very bottom of the receipt.' } },
        { name: 'sendReceiptEmails', type: 'checkbox', label: 'Send receipt email to collector', defaultValue: true },
        { name: 'notifyOrganiserEmail', type: 'email', label: 'Additional notify email', admin: { description: 'Leave blank to use team email set in environment variables.' } },
      ],
    },

    // ── DISCOVERY ───────────────────────────────────────────────────────
    {
      type: 'collapsible',
      label: '✦ Surprise Me',
      fields: [
        { name: 'surpriseMeEnabled', type: 'checkbox', label: 'Show Surprise Me banner', defaultValue: true },
        { name: 'surpriseMeTitle', type: 'text', label: 'Banner title', defaultValue: 'Surprise Me', admin: { description: 'Heading on the discovery banner.' } },
        { name: 'surpriseMeSubtitle', type: 'text', label: 'Banner subtitle', defaultValue: 'Let us find your next specimen' },
        { name: 'surpriseMeButtonText', type: 'text', label: 'Button text', defaultValue: 'Discover' },
      ],
    },
  ],
}
