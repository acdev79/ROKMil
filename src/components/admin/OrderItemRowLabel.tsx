'use client'
import { useRowLabel } from '@payloadcms/ui'

export default function OrderItemRowLabel() {
  const { data, rowNumber } = useRowLabel<{
    name?: string
    size?: string
    price?: number
    qty?: number
  }>()

  const subtotal = (data?.price || 0) * (data?.qty || 0)
  const label = data?.name
    ? `${data.name}${data.size ? ` — ${data.size}` : ''}`
    : `Item ${(rowNumber || 0) + 1}`

  const total = subtotal > 0
    ? ` · $${subtotal.toLocaleString()}`
    : ''

  return (
    <span style={{
      fontFamily: 'system-ui',
      fontSize: '13px',
      color: 'var(--theme-text)',
      fontWeight: 500,
    }}>
      {label}
      {total && (
        <span style={{ color: 'var(--theme-text-secondary)', fontWeight: 400, marginLeft: '4px' }}>
          {total}
        </span>
      )}
    </span>
  )
}
