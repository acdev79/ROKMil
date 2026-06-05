import type { CollectionConfig } from 'payload'

async function sendOrderUpdateNotification(order: any) {
  const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  try {
    await fetch(`${SITE_URL}/api/order-notification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    }).catch(() => {})
  } catch (_) {}
}

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: 'Order', plural: 'Orders' },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  admin: {
    useAsTitle: 'receiptId',
    defaultColumns: ['receiptId', 'collectorName', 'total', 'status', 'createdAt'],
    description: 'Click a Receipt ID to view the order. Use the Edit tab to make changes.',
    disableBulkDelete: false,
    listSearchableFields: ['receiptId', 'collectorName', 'collectorEmail', 'collectorPhone'],
    components: {
      beforeDocumentControls: ['@/components/admin/OrderEditBanner'],
      views: {
        edit: {
          default: {
            tab: {
              label: '✏️ Edit Order',
              order: 2,
            },
          },
          receiptPreview: {
            Component: '@/components/admin/OrderReceiptPreview',
            path: '/receipt-preview',
            tab: {
              label: '🧾 Receipt Preview',
              href: '/receipt-preview',
              order: 1,
            },
          },
        },
      },
    },
  },
  hooks: {
    afterChange: [
      async ({ doc }) => {
        await sendOrderUpdateNotification(doc)
        return doc
      },
    ],
  },
  fields: [
    {
      name: 'receiptId',
      type: 'text',
      label: 'Receipt ID',
      required: true,
      admin: {
        readOnly: true,
        components: { Cell: '@/components/admin/OrderReceiptIdCell' },
      },
    },
    {
      name: 'status',
      type: 'select',
      label: 'Status',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: '⏳ Pending', value: 'pending' },
        { label: '✅ Confirmed', value: 'confirmed' },
        { label: '📦 Fulfilled', value: 'fulfilled' },
        { label: '❌ Cancelled', value: 'cancelled' },
      ],
    },
    {
      type: 'collapsible',
      label: '👤 Collector Details',
      admin: { initCollapsed: true },
      fields: [
        { name: 'collectorName', type: 'text', label: 'Name', required: true },
        { name: 'collectorEmail', type: 'email', label: 'Email' },
        { name: 'collectorPhone', type: 'text', label: 'Phone' },
        { name: 'collectorMessage', type: 'textarea', label: 'Message from collector' },
      ],
    },
    {
      name: 'items',
      type: 'array',
      label: 'Items',
      labels: { singular: 'Item', plural: 'Items' },
      admin: {
        initCollapsed: true,
        components: { RowLabel: '@/components/admin/OrderItemRowLabel' },
      },
      fields: [
        { name: 'name', type: 'text', label: 'Item name', required: true },
        { name: 'size', type: 'text', label: 'Size' },
        { name: 'price', type: 'number', label: 'Unit price ($)', required: true, min: 0 },
        { name: 'qty', type: 'number', label: 'Quantity', required: true, min: 1 },
        { name: 'subtotal', type: 'number', label: 'Subtotal ($)' },
      ],
    },
    {
      type: 'collapsible',
      label: '💰 Totals & Adjustments',
      admin: { initCollapsed: true },
      fields: [
        { name: 'subtotal', type: 'number', label: 'Subtotal ($)', min: 0 },
        { name: 'deliveryFee', type: 'number', label: 'Delivery fee ($)', defaultValue: 0, min: 0 },
        { name: 'discount', type: 'number', label: 'Discount ($)', defaultValue: 0, min: 0 },
        { name: 'adjustment', type: 'number', label: 'Manual adjustment ($)', defaultValue: 0, admin: { description: 'Positive adds, negative subtracts.' } },
        { name: 'adjustmentNote', type: 'text', label: 'Adjustment reason', admin: { condition: (data) => data?.adjustment !== 0 } },
        { name: 'total', type: 'number', label: 'Final total ($)', min: 0 },
      ],
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      label: 'Internal Notes',
      admin: { description: 'Team only — never sent to collector.' },
    },
    {
      type: 'collapsible',
      label: '📦 Fulfillment',
      admin: { initCollapsed: true },
      fields: [
        { name: 'fulfilledBy', type: 'text', label: 'Fulfilled by' },
        { name: 'fulfilledAt', type: 'date', label: 'Fulfilled at', admin: { date: { pickerAppearance: 'dayAndTime' } } },
        {
          name: 'deliveryMethod',
          type: 'select',
          label: 'Delivery method',
          options: [
            { label: 'Pickup', value: 'pickup' },
            { label: 'Delivery', value: 'delivery' },
            { label: 'Other', value: 'other' },
          ],
        },
      ],
    },
    { name: 'currency', type: 'text', label: 'Currency', defaultValue: 'USD', admin: { readOnly: true } },
  ],
  timestamps: true,
}
