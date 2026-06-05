'use client'
import { useRouter } from 'next/navigation'
import { useConfig } from '@payloadcms/ui'

interface Props {
  rowData: {
    id: string | number
    receiptId?: string
    collectorName?: string
    total?: number
    status?: string
  }
}

export default function OrdersListLink({ rowData }: Props) {
  const router = useRouter()
  const { config } = useConfig()
  const adminRoute = config.routes?.admin || '/admin'

  const goToPreview = () => {
    router.push(`${adminRoute}/collections/orders/${rowData.id}/receipt-preview`)
  }

  const statusColors: Record<string, string> = {
    pending: '#D4A020',
    confirmed: '#5A7A50',
    fulfilled: '#4A7040',
    cancelled: '#C87870',
  }

  return (
    <button
      onClick={goToPreview}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        textAlign: 'left',
        padding: '0',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontFamily: 'system-ui',
      }}
    >
      <span style={{ fontSize: '13px', color: 'var(--theme-text)', fontWeight: 500 }}>
        {rowData.receiptId || `Order ${rowData.id}`}
      </span>
    </button>
  )
}
