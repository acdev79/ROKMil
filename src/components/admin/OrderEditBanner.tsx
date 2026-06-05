'use client'
import { useEffect, useState } from 'react'
import { useDocumentInfo } from '@payloadcms/ui'

export default function OrderEditBanner() {
  const { id } = useDocumentInfo()
  const [redirecting, setRedirecting] = useState(false)

  useEffect(() => {
    if (!id) return
    const path = window.location.pathname
    // Only redirect if we're on the plain edit URL (not already on a sub-tab)
    const isPlainEdit = /\/orders\/[^/]+$/.test(path)
    if (isPlainEdit) {
      setRedirecting(true)
      const timer = setTimeout(() => {
        window.location.href = `${path}/receipt-preview`
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [id])

  if (redirecting) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '12px', fontFamily: 'system-ui', fontSize: '12px',
        letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8A89E',
      }}>
        Loading receipt...
      </div>
    )
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      flexWrap: 'wrap', gap: '10px',
      padding: '12px clamp(1rem, 4vw, 2rem)',
      background: 'rgba(200,150,90,0.08)',
      borderBottom: '1px solid rgba(200,150,90,0.2)',
    }}>
      <span style={{ fontFamily: 'system-ui', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#A8A89E' }}>
        ⚠️ Edit mode — saves notify collector and team
      </span>
      <button
        onClick={() => {
          const base = window.location.pathname.replace(/\/(edit)?$/, '')
          window.location.href = `${base}/receipt-preview`
        }}
        style={{
          padding: '8px 16px', background: '#1A1A17',
          border: '1px solid rgba(200,150,90,0.4)', color: '#C8965A',
          fontFamily: 'system-ui', fontSize: '11px', letterSpacing: '0.14em',
          textTransform: 'uppercase', cursor: 'pointer', whiteSpace: 'nowrap',
        }}
      >
        🧾 View Receipt Preview →
      </button>
    </div>
  )
}
