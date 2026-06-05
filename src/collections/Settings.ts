import type { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  label: 'Store Settings',
  access: { read: () => true },
  fields: [
    { name: 'storeName', type: 'text', label: 'Store Name', defaultValue: 'ROKMil Living Collection' },
    { name: 'tagline', type: 'text', label: 'Tagline', defaultValue: 'Korean Botanicals' },
    { name: 'heroTitle', type: 'text', label: 'Hero Title', defaultValue: 'Rooted in' },
    { name: 'heroTitleItalic', type: 'text', label: 'Hero Title (italic)', defaultValue: 'Korean nature' },
    { name: 'heroSubtitle', type: 'textarea', label: 'Hero Subtitle', defaultValue: 'Each specimen is cultivated with reverence for the Korean horticultural tradition.' },
    {
      type: 'row',
      fields: [
        { name: 'organisersName', type: 'text', label: 'Organiser Name', defaultValue: 'ROKMil Living Collection' },
        { name: 'organisersEmail', type: 'email', label: 'Organiser Email', defaultValue: 'collection@rokmil.com' },
      ],
    },
    { name: 'receiptMessage', type: 'textarea', label: 'Receipt Message', defaultValue: 'Thank you for your contribution. Our curator will contact you within 48 hours to arrange handover.' },
    { name: 'sendReceiptEmails', type: 'checkbox', label: 'Send receipt emails to collector', defaultValue: true },
    { name: 'notifyOrganiserEmail', type: 'email', label: 'Notify organiser email' },
    { name: 'currency', type: 'select', label: 'Currency', defaultValue: 'USD', options: [{ label: 'USD — $', value: 'USD' }, { label: 'EUR — €', value: 'EUR' }, { label: 'GBP — £', value: 'GBP' }, { label: 'KRW — ₩', value: 'KRW' }, { label: 'AUD — A$', value: 'AUD' }] },

    {
      name: 'fees',
      type: 'group',
      label: 'Fees & Charges',
      admin: { description: 'Configure delivery and other fees. Changes apply immediately — no code deployment needed.' },
      fields: [
        { name: 'deliveryFeeEnabled', type: 'checkbox', label: 'Enable delivery fee', defaultValue: true },
        { name: 'deliveryFeeAmount', type: 'number', label: 'Delivery fee amount ($)', defaultValue: 10, min: 0, admin: { condition: (data) => data?.fees?.deliveryFeeEnabled } },
        { name: 'deliveryFeeThreshold', type: 'number', label: 'Free delivery above this order total ($)', defaultValue: 100, min: 0, admin: { description: 'Set to 0 to always charge delivery.', condition: (data) => data?.fees?.deliveryFeeEnabled } },
        { name: 'deliveryFeeLabel', type: 'text', label: 'Delivery fee label', defaultValue: 'Delivery', admin: { condition: (data) => data?.fees?.deliveryFeeEnabled } },
      ],
    },

    {
      name: 'discountConfig',
      type: 'group',
      label: 'Active Discounts',
      admin: { description: 'Apply a store-wide discount to all orders.' },
      fields: [
        { name: 'enabled', type: 'checkbox', label: 'Enable store-wide discount', defaultValue: false },
        {
          name: 'type',
          type: 'select',
          label: 'Discount type',
          options: [
            { label: 'Percentage (e.g. 10% off)', value: 'percentage' },
            { label: 'Fixed amount (e.g. $20 off)', value: 'fixed' },
          ],
          defaultValue: 'percentage',
          admin: { condition: (data) => data?.discountConfig?.enabled },
        },
        { name: 'value', type: 'number', label: 'Discount value', min: 0, admin: { description: 'For percentage: enter 10 for 10%. For fixed: enter 20 for $20 off.', condition: (data) => data?.discountConfig?.enabled } },
        { name: 'label', type: 'text', label: 'Discount label (shown on receipt)', defaultValue: 'Discount', admin: { condition: (data) => data?.discountConfig?.enabled } },
        { name: 'minimumOrder', type: 'number', label: 'Minimum order to qualify ($)', min: 0, defaultValue: 0, admin: { description: 'Set to 0 for no minimum.', condition: (data) => data?.discountConfig?.enabled } },
      ],
    },
  ],
}
