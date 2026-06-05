'use client'
import Link from 'next/link'

interface Props {
  cellData: string
  rowData: { id: string | number }
}

export default function OrderReceiptIdCell({ cellData, rowData }: Props) {
  return (
    <Link
      href={`/admin/collections/orders/${rowData.id}/receipt-preview`}
      style={{
        color: '#C8965A',
        fontFamily: 'system-ui',
        fontSize: '13px',
        fontWeight: 500,
        textDecoration: 'none',
        letterSpacing: '0.06em',
      }}
    >
      {cellData || `Order ${rowData.id}`}
    </Link>
  )
}
