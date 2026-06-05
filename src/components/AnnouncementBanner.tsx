'use client'

interface Props {
  text: string
  type?: 'info' | 'success' | 'warning'
  expiry?: string
}

export default function AnnouncementBanner({ text, type = 'info', expiry }: Props) {
  if (expiry && new Date(expiry) < new Date()) return null
  if (!text) return null

  const styles = {
    info: { bg: 'rgba(200,150,90,0.12)', border: 'rgba(200,150,90,0.35)', color: '#C8965A' },
    success: { bg: 'rgba(90,120,80,0.15)', border: 'rgba(90,120,80,0.35)', color: '#90C880' },
    warning: { bg: 'rgba(200,160,50,0.12)', border: 'rgba(200,160,50,0.35)', color: '#D4A020' },
  }[type]

  return (
    <div style={{
      background: styles.bg,
      borderBottom: `1px solid ${styles.border}`,
      padding: '10px clamp(1rem, 4vw, 3.5rem)',
      textAlign: 'center',
    }}>
      <p style={{
        fontFamily: 'var(--font-cond)',
        fontSize: '0.72rem',
        letterSpacing: '0.16em',
        textTransform: 'uppercase',
        color: styles.color,
        margin: 0,
      }}>
        {text}
      </p>
    </div>
  )
}
