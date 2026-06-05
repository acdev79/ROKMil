import type { CollectionConfig } from 'payload'

export const Members: CollectionConfig = {
  slug: 'members',
  labels: { singular: 'Member', plural: 'Members' },
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  admin: {
    useAsTitle: 'fullName',
    defaultColumns: ['fullName', 'phone', 'status', 'verified', 'createdAt'],
    description: 'ROKMil members. Approve access requests, manage verification, and view member profiles.',
    listSearchableFields: ['firstName', 'lastName', 'email', 'phone'],
  },
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'firstName', type: 'text', label: 'First Name', required: true },
        { name: 'lastName', type: 'text', label: 'Last Name', required: true },
      ],
    },
    {
      name: 'fullName',
      type: 'text',
      label: 'Full Name',
      admin: { readOnly: true, hidden: true },
      hooks: {
        beforeChange: [({ data }) => `${data?.firstName || ''} ${data?.lastName || ''}`.trim()],
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'phone', type: 'text', label: 'Phone Number', required: true, admin: { description: 'Include country code e.g. +12125550000' } },
      ],
    },
    {
      name: 'preferredContact',
      type: 'select',
      label: 'Preferred Contact Method',
      options: [
        { label: 'SMS / Text', value: 'sms' },
        { label: 'Email', value: 'email' },
        { label: 'Phone Call', value: 'call' },
        { label: 'WhatsApp', value: 'whatsapp' },
      ],
      defaultValue: 'sms',
    },
    {
      type: 'collapsible',
      label: '🔐 Access & Verification',
      fields: [
        {
          name: 'status',
          type: 'select',
          label: 'Account Status',
          required: true,
          defaultValue: 'pending_review',
          options: [
            { label: '⏳ Pending Review', value: 'pending_review' },
            { label: '✅ Approved', value: 'approved' },
            { label: '🔑 Active', value: 'active' },
            { label: '⏸ Suspended', value: 'suspended' },
          ],
        },
        { name: 'verified', type: 'checkbox', label: 'Phone verified', defaultValue: false },
        {
          name: 'adminVerifiedOverride',
          type: 'checkbox',
          label: '🔓 Admin override — bypass SMS verification',
          defaultValue: false,
          admin: { description: 'Grants access without SMS verification. Use as fallback.' },
        },
        { name: 'pinHash', type: 'text', label: 'PIN (hashed)', admin: { readOnly: true } },
        { name: 'verificationCode', type: 'text', label: 'Verification code', admin: { readOnly: true, hidden: true } },
        { name: 'verificationExpiry', type: 'date', label: 'Code expiry', admin: { readOnly: true, hidden: true } },
        { name: 'verificationAttempts', type: 'number', label: 'Verification attempts', defaultValue: 0, admin: { readOnly: true, description: 'Reset to 0 if member is locked out.' } },
      ],
    },
    {
      type: 'collapsible',
      label: '👤 Member Profile',
      admin: { initCollapsed: true },
      fields: [
        { name: 'wishlist', type: 'relationship', relationTo: 'specimens', hasMany: true, label: 'Saved Specimens (Wishlist)' },
        {
          name: 'favoriteCategories',
          type: 'select',
          hasMany: true,
          label: 'Favourite Categories',
          options: [
            { label: 'Flower', value: 'flower' },
            { label: 'Bonsai', value: 'bonsai' },
            { label: 'Tincture', value: 'tincture' },
            { label: 'Moss & Stone', value: 'moss' },
            { label: 'Rare Find', value: 'rare' },
          ],
        },
        { name: 'totalSpend', type: 'number', label: 'Total contribution ($)', defaultValue: 0, admin: { readOnly: true } },
        { name: 'orderCount', type: 'number', label: 'Total orders', defaultValue: 0, admin: { readOnly: true } },
        { name: 'lastOrderAt', type: 'date', label: 'Last order date', admin: { readOnly: true } },
      ],
    },
    {
      type: 'collapsible',
      label: '🔑 Entry',
      admin: { initCollapsed: true },
      fields: [
        {
          name: 'entryMethod',
          type: 'select',
          label: 'How they joined',
          options: [
            { label: 'Request access form', value: 'request' },
            { label: 'Passkey', value: 'passkey' },
            { label: 'Added by admin', value: 'admin' },
          ],
          admin: { readOnly: true },
        },
        { name: 'passkeyUsed', type: 'text', label: 'Passkey used', admin: { readOnly: true } },
        { name: 'requestMessage', type: 'textarea', label: 'Access request message', admin: { readOnly: true } },
        { name: 'joinedAt', type: 'date', label: 'Joined at', admin: { readOnly: true } },
      ],
    },
    { name: 'internalNotes', type: 'textarea', label: 'Internal Notes', admin: { description: 'Team only — never shown to member.' } },
  ],
  timestamps: true,
}
