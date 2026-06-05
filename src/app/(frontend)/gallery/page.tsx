import { getPayload } from 'payload'
import config from '@payload-config'
import { applyBestDiscount, type Discount } from '@/lib/discounts'
import GalleryClient from '@/components/GalleryClient'

export const dynamic = 'force-dynamic'

export default async function GalleryPage() {
  const payload = await getPayload({ config })

  const [specimensRes, discountsRes, settings] = await Promise.all([
    payload.find({
      collection: 'specimens',
      where: { available: { equals: true } },
      limit: 100,
      depth: 1,
    }),
    payload.find({
      collection: 'discounts',
      where: { active: { equals: true } },
      limit: 100,
    }),
    payload.findGlobal({ slug: 'settings' }).catch(() => null),
  ])

  const now = new Date()
  const discounts = (discountsRes.docs || []).filter((d: any) => {
    if (d.startsAt && new Date(d.startsAt) > now) return false
    if (d.expiresAt && new Date(d.expiresAt) < now) return false
    return true
  }) as Discount[]

  const specimens = (specimensRes.docs || []).map((s: any) => ({
    ...s,
    ...applyBestDiscount({ id: s.id, price: s.price, category: s.category }, discounts),
  }))

  return <GalleryClient specimens={specimens} settings={settings} />
}
