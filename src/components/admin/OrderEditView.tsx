'use client'
import { useDocumentInfo, useForm, DefaultEditView } from '@payloadcms/ui'
import { useState } from 'react'

export default function OrderEditView() {
  const [confirmed, setConfirmed] = useState(false)

  if (!confirmed) {
    return (
      <div style={{
        width: '100%',
        padding: 'clamp(1rem, 4vw, 2rem)',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
      }}>
        <div style={{
          maxWidth: '480px',
          width: '100%',
          background: '#1C1B18',
          border: '1px solid rgba(212,160,32,0.3)',
          padding: '2rem',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          <div style={{ fontSize: '28px', marginBottom: '1rem' }}>⚠️</div>
          <div style={{
            fontFamily: 'system-ui',
            fontSize: '14px',
            fontWeight: 600,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#F0EFE8',
            marginBottom: '12px',
          }}>
            You are about to edit this order
          </div>
          <p style={{
            fontFamily: 'system-ui',
            fontSize: '13px',
            color: '#A8A89E',
            lineHeight: 1.7,
            marginBottom: '1.5rem',
          }}>
            Any changes you save will trigger an updated receipt notification to the collector and the team. Make sure your edits are intentional.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => window.history.back()}
              style={{
                flex: 1, minWidth: '120px', padding: '12px 16px',
                background: 'transparent', border: '1px solid rgba(255,255,255,0.15)',
                color: '#A8A89E', fontFamily: 'system-ui', fontSize: '12px',
                letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer',
              }}
            >
              ← Go Back
            </button>
            <button
              onClick={() => setConfirmed(true)}
              style={{
                flex: 1, minWidth: '120px', padding: '12px 16px',
                background: '#D4A020', border: 'none',
                color: '#0D0D0B', fontFamily: 'system-ui', fontSize: '12px',
                letterSpacing: '0.14em', textTransform: 'uppercase',
                cursor: 'pointer', fontWeight: 600,
              }}
            >
              I understand — Edit Order
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        background: 'rgba(212,160,32,0.08)',
        borderBottom: '1px solid rgba(212,160,32,0.25)',
        padding: '10px clamp(1rem, 4vw, 2rem)',
        fontFamily: 'system-ui',
        fontSize: '12px',
        color: '#D4A020',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
      }}>
        ✏️ Edit mode — changes will notify the collector and team on save
      </div>
      <DefaultEditView />
    </div>
  )
}
