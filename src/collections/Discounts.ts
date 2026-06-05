import type { CollectionConfig } from 'payload'

export const Discounts: CollectionConfig = {
  slug: 'discounts',
  access: { read: () => true },
  labels: {
    singular: 'Discount',
    plural: 'Discounts',
  },
  admin: {
    useAsTitle: 'label',
    defaultColumns: ['label', 'type', 'value', 'scope', 'active', 'expiresAt'],
    description: 'Create percentage or flat-amount discounts. Apply to a single item or the whole collection.',
  },

  fields: [
    // ── IDENTITY ──────────────────────────────────────────────────────────
    {
      name: 'label',
      type: 'text',
      label: 'Internal Label',
      required: true,
      admin: { description: 'Your reference name — not shown to visitors. E.g. "Spring sale 20%".' },
    },

    // ── DISCOUNT TYPE ─────────────────────────────────────────────────────
    {
      name: 'type',
      type: 'select',
      label: 'Discount Type',
      required: true,
      options: [
        { label: 'Percentage off  (e.g. 20%)', value: 'percentage' },
        { label: 'Flat amount off  (e.g. $50 off)', value: 'flat' },
      ],
      admin: { description: 'Choose whether the discount is a % or a fixed dollar amount.' },
    },
    {
      name: 'value',
      type: 'number',
      label: 'Discount Value',
      required: true,
      min: 0,
      admin: {
        description: 'For percentage: enter 20 for 20%. For flat: enter 50 for $50 off.',
      },
    },

    // ── SCOPE ─────────────────────────────────────────────────────────────
    {
      name: 'scope',
      type: 'select',
      label: 'Apply To',
      required: true,
      options: [
        { label: 'All specimens (store-wide)', value: 'all' },
        { label: 'Specific specimens only', value: 'specific' },
        { label: 'Entire category', value: 'category' },
      ],
    },
    {
      name: 'specimens',
      type: 'relationship',
      relationTo: 'specimens',
      hasMany: true,
      label: 'Select Specimens',
      admin: {
        condition: (data) => data?.scope === 'specific',
        description: 'Only shown when "Specific specimens" is selected above.',
      },
    },
    {
      name: 'category',
      type: 'select',
      label: 'Select Category',
      options: [
        { label: 'Bonsai', value: 'bonsai' },
        { label: 'Korean Flower', value: 'flower' },
        { label: 'Moss & Stone', value: 'moss' },
        { label: 'Rare Find', value: 'rare' },
      ],
      admin: {
        condition: (data) => data?.scope === 'category',
        description: 'Only shown when "Entire category" is selected above.',
      },
    },

    // ── DISPLAY TEXT ──────────────────────────────────────────────────────
    {
      name: 'badgeText',
      type: 'text',
      label: 'Badge Text (shown on card)',
      admin: {
        description: 'Optional short text shown on the card, e.g. "20% off" or "Spring Sale". Leave blank to show no badge.',
      },
    },

    // ── SCHEDULING ────────────────────────────────────────────────────────
    {
      name: 'active',
      type: 'checkbox',
      label: 'Active',
      defaultValue: true,
      admin: { description: 'Toggle this off to pause the discount without deleting it.' },
    },
    {
      name: 'startsAt',
      type: 'date',
      label: 'Start Date (optional)',
      admin: {
        description: 'Leave blank to start immediately. The discount will not apply before this date.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
    {
      name: 'expiresAt',
      type: 'date',
      label: 'Expiry Date (optional)',
      admin: {
        description: 'Leave blank for no expiry. The discount automatically deactivates after this date.',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },

    // ── DISPLAY SETTINGS ──────────────────────────────────────────────────
    {
      name: 'showOriginalPrice',
      type: 'checkbox',
      label: 'Show original price with strikethrough',
      defaultValue: true,
    },
  ],
}
