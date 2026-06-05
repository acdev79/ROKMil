import type { CollectionConfig } from 'payload'

export const Specimens: CollectionConfig = {
  slug: 'specimens',
  access: { read: () => true },
  labels: { singular: 'Specimen', plural: 'Specimens' },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'productType', 'category', 'available'],
  },
  versions: { drafts: true },
  fields: [
    { name: 'name', type: 'text', label: 'Specimen Name', required: true },
    { name: 'latinName', type: 'text', label: 'Latin / Strain Name' },
    {
      name: 'productType',
      type: 'select',
      label: 'Product Type',
      required: true,
      defaultValue: 'flower',
      options: [
        { label: 'Flower (3.5g & 28g)', value: 'flower' },
        { label: 'Tincture (15mL dropper)', value: 'tincture' },
      ],
    },
    {
      name: 'category',
      type: 'select',
      label: 'Category',
      required: true,
      options: [
        { label: 'Flower', value: 'flower' },
        { label: 'Bonsai', value: 'bonsai' },
        { label: 'Tincture', value: 'tincture' },
        { label: 'Moss & Stone', value: 'moss' },
        { label: 'Rare Find', value: 'rare' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media', label: 'Main Image', required: true },
    { name: 'shortDescription', type: 'textarea', label: 'Short Description', required: true },
    { name: 'longDescription', type: 'richText', label: 'Full Description' },
    {
      name: 'details',
      type: 'array',
      label: 'Specimen Details',
      fields: [
        { name: 'label', type: 'text', label: 'Label', required: true },
        { name: 'value', type: 'text', label: 'Value', required: true },
      ],
    },
    {
      name: 'price35g',
      type: 'number',
      label: 'Price — 3.5g (Eighth) $',
      min: 0,
      admin: { condition: (data) => data?.productType === 'flower' },
    },
    {
      name: 'price28g',
      type: 'number',
      label: 'Price — 28g (Oz) $',
      min: 0,
      admin: { condition: (data) => data?.productType === 'flower' },
    },
    {
      name: 'price15ml',
      type: 'number',
      label: 'Price — 15mL Dropper $',
      min: 0,
      admin: { condition: (data) => data?.productType === 'tincture' },
    },
    {
      name: 'badge',
      type: 'select',
      label: 'Badge',
      options: [
        { label: 'None', value: 'none' },
        { label: 'New Arrival', value: 'new' },
        { label: 'Rare Specimen', value: 'rare' },
        { label: 'Popular', value: 'popular' },
      ],
      defaultValue: 'none',
    },
    { name: 'available', type: 'checkbox', label: 'Available for contribution', defaultValue: true },
    { name: 'stock', type: 'number', label: 'Stock (optional)', min: 0 },
    {
      name: 'slug',
      type: 'text',
      label: 'URL Slug',
      hooks: {
        beforeValidate: [
          ({ value, data }) => {
            if (!value && data?.name) {
              return data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
            }
            return value
          },
        ],
      },
    },
  ],
}
