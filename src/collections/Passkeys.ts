import type { CollectionConfig } from 'payload'

function generatePasskey(length: number = 6): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const seg = (n: number) => Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
  if (length === 4) return seg(4)
  if (length === 9) return `${seg(3)}-${seg(3)}-${seg(3)}`
  if (length === 12) return `${seg(4)}-${seg(4)}-${seg(4)}`
  if (length === 16) return `${seg(4)}-${seg(4)}-${seg(4)}-${seg(4)}`
  return `${seg(3)}-${seg(3)}`
}

export const Passkeys: CollectionConfig = {
  slug: 'passkeys',
  labels: { singular: 'Passkey', plural: 'Passkeys' },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  admin: {
    useAsTitle: 'code',
    defaultColumns: ['code', 'label', 'reusable', 'usedCount', 'active', 'expiresAt'],
    description: 'Generate passkeys for VIP member access. Still requires SMS verification on first login.',
    disableBulkDelete: false,
  },
  hooks: {
    beforeChange: [
      ({ data, operation }) => {
        if (operation === 'create' && !data.code) {
          data.code = generatePasskey(parseInt(data.codeLength || '6'))
          data.usedCount = 0
          data.active = true
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'codeLength',
      type: 'select',
      label: 'Code Length',
      defaultValue: '6',
      options: [
        { label: '4 characters', value: '4' },
        { label: '6 characters — default', value: '6' },
        { label: '9 characters', value: '9' },
        { label: '12 characters', value: '12' },
        { label: '16 characters — high security', value: '16' },
      ],
      admin: { condition: (data) => !data?.code },
    },
    {
      name: 'code',
      type: 'text',
      label: 'Passkey Code',
      admin: { readOnly: true, description: 'Auto-generated on save. Share with your invited member.' },
    },
    { name: 'label', type: 'text', label: 'Label', admin: { description: 'Who is this for?' } },
    { name: 'active', type: 'checkbox', label: 'Active', defaultValue: true },
    { name: 'reusable', type: 'checkbox', label: 'Reusable', defaultValue: false, admin: { description: 'Single-use by default.' } },
    { name: 'usedCount', type: 'number', label: 'Times used', defaultValue: 0, admin: { readOnly: true } },
    { name: 'usedBy', type: 'relationship', relationTo: 'members', hasMany: true, label: 'Used by', admin: { readOnly: true } },
    { name: 'expiresAt', type: 'date', label: 'Expires at (optional)', admin: { date: { pickerAppearance: 'dayOnly' } } },
    { name: 'notes', type: 'textarea', label: 'Notes' },
  ],
  timestamps: true,
}
