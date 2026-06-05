'use client'
import { useDocumentInfo } from '@payloadcms/ui'

export default function OrderEditBanner() {
  const { id } = useDocumentInfo()

  const goToPreview = () => {
    const path = window.location.pathname
    const base = path.replace(/\/(edit)?$/, '')
    window.location.href = `${base}/receipt-preview`
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '10px',
      padding: '12px clamp(1rem, 4vw, 2rem)',
      background: 'rgba(200,150,90,0.08)',
      borderBottom: '1px solid rgba(200,150,90,0.2)',
      marginBottom: '0',
    }}>
      <span style={{
        fontFamily: 'system-ui',
        fontSize: '12px',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#A8A89E',
      }}>
        ⚠️ Edit mode — saves notify collector and team
      </span>
      <button
        onClick={goToPreview}
        style={{
          padding: '8px 16px',
          background: '#1A1A17',
          border: '1px solid rgba(200,150,90,0.4)',
          color: '#C8965A',
          fontFamily: 'system-ui',
          fontSize: '11px',
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        🧾 View Receipt Preview →
      </button>
    </div>
  )
}
