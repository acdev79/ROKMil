import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true, create: () => true, update: () => true, delete: () => true },
  labels: { singular: 'Image', plural: 'Images' },
  admin: {
    description: 'All uploaded images. Cloudflare R2 handles storage; images auto-resize on upload.',
  },
  upload: {
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
    imageSizes: [
      { name: 'card', width: 600, height: 450, crop: 'cover' },
      { name: 'lightbox', width: 1200, height: 900, crop: 'cover' },
      { name: 'thumb', width: 100, height: 100, crop: 'cover' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
      admin: { description: 'Describe the image for accessibility and SEO. E.g. "Seolhae Juniper bonsai in Buncheong pot".' },
    },
    {
      name: 'caption',
      type: 'text',
      label: 'Caption (optional)',
    },
  ],
}
