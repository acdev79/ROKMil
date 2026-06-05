'use client'
import { useDocumentInfo } from '@payloadcms/ui'
import { useState, useEffect } from 'react'

export default function OrderEditView() {
  const { id } = useDocumentInfo()
  const [confirmed, setConfirmed] = useState(false)

  // Redirect to receipt preview on mount
  useEffect(() => {
    if (id && !confirmed) {
      const base = window.location.pathname.split('/edit')[0].split('/receipt-preview')[0]
      const previewUrl = `${base}/receipt-preview`
      if (!window.location.pathname.includes('receipt-preview')) {
        window.location.href = previewUrl
      }
    }
  }, [id, confirmed])

  return null
}
