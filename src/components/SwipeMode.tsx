'use client'
import { useState, useCallback, useRef, useEffect } from 'react'
import { useSwipeable } from 'react-swipeable'
import Image from 'next/image'
import type { Specimen, CartItem } from '@/lib/types'
import { fmt, CATEGORY_LABELS } from '@/lib/types'

interface Props {
  specimens: Specimen[]
  currency: string
  cart: CartItem[]
  onReserve: (id: string) => void
  onSave: (id: string) => void
  savedIds: string[]
  onClose: () => void
}

type SwipeDir = 'left' | 'right' | 'up' | 'none'

const SWIPE_THRESHOLD = 80

export default function SwipeMode({
  specimens, currency, cart, onReserve, onSave, savedIds, onClose,
}: Props) {
  // Shuffle specimens for discovery
  const shuffled = useRef<Specimen[]>([...specimens].sort(() => Math.random() - 0.5))
  const [index, setIndex] = useState(0)
  const [swipeDir, setSwipeDir] = useState<SwipeDir>('none')
  const [deltaX, setDeltaX] = useState(0)
  const [exiting, setExiting] = useState(false)
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null)

  const current = shuffled.current[index]
  const next = shuffled.current[index + 1]
  const nextNext = shuffled.current[index + 2]
  const total = shuffled.current.length
  const remaining = total - index - 1

  const inCart = cart.some(c => c.id === current?.id)
  const isSaved = savedIds.includes(current?.id || '')

  // Lock body scroll while swipe mode is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const advance = useCallback((dir: 'left' | 'right') => {
    if (!current || exiting) return
    setExiting(true)
    setExitDir(dir)
    setTimeout(() => {
      setIndex(i => i + 1)
      setExiting(false)
      setExitDir(null)
      setDeltaX(0)
      setSwipeDir('none')
    }, 320)
  }, [current, exiting])

  const handleSkip = useCallback(() => advance('left'), [advance])
  const handleNext = useCallback(() => advance('right'), [advance])

  const handleReserve = useCallback(() => {
    if (!current) return
    onReserve(current.id)
    advance('right')
  }, [current, onReserve, advance])

  const handleSave = useCallback(() => {
    if (!current) return
    onSave(current.id)
  }, [current, onSave])

  const swipeHandlers = useSwipeable({
    onSwiping: ({ deltaX: dx, deltaY: dy }) => {
      if (exiting) return
      setDeltaX(dx)
      if (Math.abs(dx) > Math.abs(dy)) {
        setSwipeDir(dx > 0 ? 'right' : 'left')
      }
    },
    onSwipedLeft: () => { if (!exiting) advance('left') },
    onSwipedRight: () => { if (!exiting) advance('right') },
    onTouchEndOrOnMouseUp: () => {
      if (!exiting) { setDeltaX(0); setSwipeDir('none') }
    },
    trackMouse: true,
    trackTouch: true,
    delta: SWIPE_THRESHOLD,
    preventScrollOnSwipe: true,
  })

  // All done
  if (!current) {
    return (
      <div className="swipe-overlay">
        <div className="swipe-header">
          <span className="swipe-mode-label">✦ Surprise Me</span>
          <button className="swipe-exit-btn" onClick={onClose}>✕ Exit</button>
        </div>
        <div className="swipe-done">
          <div className="swipe-done-icon">✦</div>
          <h2 className="swipe-done-title">You've seen everything</h2>
          <p className="swipe-done-sub">You've explored the full collection. Head back to browse or check your selection.</p>
          <button className="swipe-done-btn" onClick={onClose}>Return to Gallery</button>
        </div>
      </div>
    )
  }

  // Card rotation based on drag
  const rotation = (deltaX / 300) * 12
  const opacity = exiting ? 0 : 1
  const cardTransform = exiting
    ? `translateX(${exitDir === 'right' ? '120%' : '-120%'}) rotate(${exitDir === 'right' ? 20 : -20}deg)`
    : `translateX(${deltaX}px) rotate(${rotation}deg)`

  const showSkipHint = swipeDir === 'left' || (exiting && exitDir === 'left')
  const showNextHint = swipeDir === 'right' || (exiting && exitDir === 'right')

  const imgSrc = current.image?.sizes?.card?.url || current.image?.url || null

  return (
    <div className="swipe-overlay" role="dialog" aria-modal="true" aria-label="Discovery mode">
      {/* Header */}
      <div className="swipe-header">
        <span className="swipe-mode-label">✦ Surprise Me</span>
        <button className="swipe-exit-btn" onClick={onClose} aria-label="Exit discovery mode">
          ✕ Exit
        </button>
      </div>

      {/* Progress */}
      <div className="swipe-progress-bar">
        <span className="swipe-prog-text">{index + 1} of {total}</span>
        <div className="swipe-prog-track" role="progressbar" aria-valuenow={index + 1} aria-valuemin={1} aria-valuemax={total}>
          <div className="swipe-prog-fill" style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <span className="swipe-prog-text">{remaining} left</span>
      </div>

      {/* Card stack */}
      <div className="swipe-stack-wrap">
        {/* Background cards */}
        {nextNext && (
          <div className="swipe-card swipe-card--back2" aria-hidden="true">
            <div className="swipe-card-img-wrap">
              {nextNext.image?.url ? (
                <Image src={nextNext.image.sizes?.card?.url || nextNext.image.url} alt="" fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className="swipe-img-placeholder">{nextNext.name}</div>
              )}
            </div>
          </div>
        )}
        {next && (
          <div className="swipe-card swipe-card--back1" aria-hidden="true">
            <div className="swipe-card-img-wrap">
              {next.image?.url ? (
                <Image src={next.image.sizes?.card?.url || next.image.url} alt="" fill style={{ objectFit: 'cover' }} />
              ) : (
                <div className="swipe-img-placeholder">{next.name}</div>
              )}
            </div>
          </div>
        )}

        {/* Front card */}
        <div
          {...swipeHandlers}
          className="swipe-card swipe-card--front"
          style={{
            transform: cardTransform,
            opacity,
            transition: exiting ? 'transform 0.32s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.32s' : 'none',
          }}
          aria-label={`${current.name}, ${fmt(current.price, currency)} contribution`}
        >
          {/* Hint overlays */}
          {showSkipHint && (
            <div className="swipe-hint-overlay swipe-hint-skip" aria-hidden="true">
              <span>SKIP</span>
            </div>
          )}
          {showNextHint && (
            <div className="swipe-hint-overlay swipe-hint-next" aria-hidden="true">
              <span>NEXT</span>
            </div>
          )}

          {/* Image */}
          <div className="swipe-card-img-wrap">
            {imgSrc ? (
              <Image
                src={imgSrc}
                alt={current.image?.alt || current.name}
                fill
                style={{ objectFit: 'cover' }}
                priority
              />
            ) : (
              <div className="swipe-img-placeholder">{current.name}</div>
            )}
            {current.badge && current.badge !== 'none' && (
              <span className={`swipe-badge swipe-badge--${current.badge}`}>
                {current.badge === 'new' ? 'New Arrival' : current.badge === 'rare' ? 'Rare' : current.badge === 'popular' ? 'Popular' : current.badge}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="swipe-card-body">
            <div className="swipe-card-cat">{CATEGORY_LABELS[current.category] || current.category}</div>
            <h2 className="swipe-card-name">{current.name}</h2>
            {current.latinName && <div className="swipe-card-latin">{current.latinName}</div>}
            <div className="swipe-card-desc">{current.shortDescription}</div>
            <div className="swipe-card-price">
              {current.originalPrice && current.showOriginalPrice && (
                <span className="swipe-original-price">{fmt(current.originalPrice, currency)}</span>
              )}
              {fmt(current.price, currency)}
              <sub> contribution</sub>
            </div>
          </div>
        </div>
      </div>

      {/* Swipe hint text */}
      <p className="swipe-gesture-hint" aria-hidden="true">← swipe or use buttons below →</p>

      {/* Action buttons */}
      <div className="swipe-actions" role="group" aria-label="Card actions">
        <button
          className="swipe-action-btn swipe-action-skip"
          onClick={handleSkip}
          aria-label="Skip this specimen"
        >
          <span className="swipe-action-icon" aria-hidden="true">✕</span>
          <span className="swipe-action-label">Skip</span>
        </button>
        <button
          className={`swipe-action-btn swipe-action-save ${isSaved ? 'saved' : ''}`}
          onClick={handleSave}
          aria-label={isSaved ? 'Saved to wishlist' : 'Save to wishlist'}
        >
          <span className="swipe-action-icon" aria-hidden="true">{isSaved ? '♥' : '♡'}</span>
          <span className="swipe-action-label">Save</span>
        </button>
        <button
          className={`swipe-action-btn swipe-action-reserve ${inCart ? 'in-cart' : ''}`}
          onClick={handleReserve}
          aria-label={inCart ? 'Already in selection' : 'Add to selection'}
        >
          <span className="swipe-action-icon" aria-hidden="true">{inCart ? '✓' : '+'}</span>
          <span className="swipe-action-label">{inCart ? 'Added' : 'Reserve'}</span>
        </button>
        <button
          className="swipe-action-btn swipe-action-next"
          onClick={handleNext}
          aria-label="Next specimen"
        >
          <span className="swipe-action-icon" aria-hidden="true">→</span>
          <span className="swipe-action-label">Next</span>
        </button>
      </div>
    </div>
  )
}
