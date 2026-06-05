import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: {
    useAsTitle: 'email',
    description: 'Admin users who can log in to manage the collection.',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      label: 'Full Name',
    },
    {
      name: 'role',
      type: 'select',
      label: 'Role',
      options: [
        { label: 'Admin — full access', value: 'admin' },
        { label: 'Curator — can edit specimens and discounts', value: 'curator' },
      ],
      defaultValue: 'curator',
    },
  ],
}
