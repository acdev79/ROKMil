'use client'
import { useState, useCallback, useRef, useMemo, useEffect } from 'react'
import Image from 'next/image'
import type { Specimen, CartItem, Settings } from '@/lib/types'
import { CATEGORY_LABELS, fmt, cartItemKey } from '@/lib/types'
import CartPanel from './CartPanel'
import Lightbox from './Lightbox'
import DonorForm from './DonorForm'
import Receipt from './Receipt'
import Toast from './Toast'
import SearchBar from './SearchBar'
import SurpriseBanner from './SurpriseBanner'
import AnnouncementBanner from './AnnouncementBanner'
import SwipeMode from './SwipeMode'

interface Props {
  specimens: Specimen[]
  settings: Settings | null
}

type Panel = 'none' | 'cart' | 'form' | 'receipt'

function generateReceiptId() {
  const now = new Date()
  const d = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`
  return `RM-${d}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`
}

interface CardQty { qty35g: number; qty28g: number; qty15ml: number }

export default function GalleryClient({ specimens, settings }: Props) {
  const currency = settings?.currency || 'USD'

  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = useMemo(() => (
    ['all', ...Array.from(new Set(specimens.map(s => s.category)))]
  ), [specimens])

  const filtered = useMemo(() => {
    let list = activeFilter === 'all' ? specimens : specimens.filter(s => s.category === activeFilter)
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.latinName?.toLowerCase().includes(q) ||
        s.shortDescription?.toLowerCase().includes(q)
      )
    }
    return list
  }, [specimens, activeFilter, searchQuery])

  const [cardQtys, setCardQtys] = useState<Record<string, CardQty>>({})
  const getCardQty = (id: string): CardQty => cardQtys[id] || { qty35g: 0, qty28g: 0, qty15ml: 0 }
  const setQty = useCallback((id: string, field: keyof CardQty, delta: number) => {
    setCardQtys(prev => {
      const cur = prev[id] || { qty35g: 0, qty28g: 0, qty15ml: 0 }
      const next = Math.max(0, Math.min(10, (cur[field] || 0) + delta))
      return { ...prev, [id]: { ...cur, [field]: next } }
    })
  }, [])

  const [swipeMode, setSwipeMode] = useState(false)
  const [savedIds, setSavedIds] = useState<string[]>([])
  const handleSave = useCallback((id: string) => {
    setSavedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }, [])

  const [lightboxId, setLightboxId] = useState<string | null>(null)
  const [lbQty, setLbQty] = useState(1)
  const lightboxSpecimen = specimens.find(s => s.id === lightboxId) || null
  const openLightbox = useCallback((id: string) => { setLightboxId(id); setLbQty(1) }, [])
  const closeLightbox = useCallback(() => setLightboxId(null), [])

  const [cart, setCart] = useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return []
    try {
      const saved = localStorage.getItem('rokmil-cart')
      return saved ? JSON.parse(saved) : []
    } catch { return [] }
  })

  const addToCart = useCallback((items: CartItem[]) => {
    setCart(prev => {
      let updated = [...prev]
      for (const item of items) {
        const existing = updated.find(i => i.key === item.key)
        if (existing) {
          updated = updated.map(i => i.key === item.key ? { ...i, qty: Math.min(i.qty + item.qty, 10) } : i)
        } else {
          updated = [...updated, item]
        }
      }
      return updated
    })
  }, [])

  const removeFromCart = useCallback((key: string) => setCart(prev => prev.filter(i => i.key !== key)), [])
  const updateCartQty = useCallback((key: string, delta: number) => {
    setCart(prev => prev.map(i => i.key === key ? { ...i, qty: Math.min(10, Math.max(1, i.qty + delta)) } : i))
  }, [])
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('rokmil-cart', JSON.stringify(cart))
    }
  }, [cart])

  const cartCount = cart.reduce((s, i) => s + i.qty, 0)

  const handleCardAdd = useCallback((specimen: Specimen) => {
    const qty = getCardQty(specimen.id)
    const items: CartItem[] = []
    if (specimen.productType === 'flower') {
      if (qty.qty35g > 0 && specimen.price35g) {
        items.push({ key: cartItemKey(specimen.id, '3.5g'), specimenId: specimen.id, specimenName: specimen.name, latinName: specimen.latinName, category: specimen.category, image: specimen.image, size: '3.5g', sizeLabel: `3.5g · ${(settings as any)?.label35g || 'Eighth'}`, price: specimen.price35g, qty: qty.qty35g })
      }
      if (qty.qty28g > 0 && specimen.price28g) {
        items.push({ key: cartItemKey(specimen.id, '28g'), specimenId: specimen.id, specimenName: specimen.name, latinName: specimen.latinName, category: specimen.category, image: specimen.image, size: '28g', sizeLabel: '28g · Oz', price: specimen.price28g, qty: qty.qty28g })
      }
    } else if (specimen.productType === 'tincture' && qty.qty15ml > 0 && specimen.price15ml) {
      items.push({ key: cartItemKey(specimen.id, '15ml'), specimenId: specimen.id, specimenName: specimen.name, latinName: specimen.latinName, category: specimen.category, image: specimen.image, size: '15ml', sizeLabel: '15mL · Dropper', price: specimen.price15ml, qty: qty.qty15ml })
    }
    if (!items.length) return
    addToCart(items)
    setCardQtys(prev => ({ ...prev, [specimen.id]: { qty35g: 0, qty28g: 0, qty15ml: 0 } }))
    showToast(`${specimen.name} added to selection`)
  }, [cardQtys, addToCart])

  const quickAdd = useCallback((id: string) => {
    const specimen = specimens.find(s => s.id === id)
    if (!specimen) return
    const items: CartItem[] = []
    if (specimen.productType === 'flower' && specimen.price35g) {
      items.push({ key: cartItemKey(specimen.id, '3.5g'), specimenId: specimen.id, specimenName: specimen.name, latinName: specimen.latinName, category: specimen.category, image: specimen.image, size: '3.5g', sizeLabel: `3.5g · ${(settings as any)?.label35g || 'Eighth'}`, price: specimen.price35g, qty: 1 })
    } else if (specimen.productType === 'tincture' && specimen.price15ml) {
      items.push({ key: cartItemKey(specimen.id, '15ml'), specimenId: specimen.id, specimenName: specimen.name, latinName: specimen.latinName, category: specimen.category, image: specimen.image, size: '15ml', sizeLabel: '15mL · Dropper', price: specimen.price15ml, qty: 1 })
    }
    if (items.length) { addToCart(items); showToast(`${specimen.name} added`) }
  }, [specimens, addToCart])

  const [panel, setPanel] = useState<Panel>('none')
  const [receiptId, setReceiptId] = useState('')
  const [donor, setDonor] = useState<{ name: string; email: string; phone?: string; message?: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleFormSubmit = async (formData: { name: string; email: string; phone: string; message: string }) => {
    setIsSubmitting(true)
    const id = generateReceiptId()
    const total = cart.reduce((s, i) => s + i.price * i.qty, 0)
    try {
      fetch('/api/receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name, email: formData.email,
          phone: formData.phone || undefined, message: formData.message || undefined,
          items: cart.map(i => ({ name: `${i.specimenName} — ${i.sizeLabel}`, latinName: i.latinName || '', categoryLabel: CATEGORY_LABELS[i.category] || i.category, price: i.price, qty: i.qty })),
          total,
          settings: { storeName: settings?.storeName || 'ROKMil', organisersName: settings?.organisersName || 'ROKMil', organisersEmail: settings?.organisersEmail || '', receiptMessage: settings?.receiptMessage || '', notifyOrganiserEmail: settings?.notifyOrganiserEmail, sendReceiptEmails: settings?.sendReceiptEmails, currency },
        }),
      }).catch(() => {})
    } catch (_) {}
    setReceiptId(id)
    setDonor({ name: formData.name, email: formData.email, phone: formData.phone || undefined, message: formData.message || undefined })
    setPanel('receipt')
    setIsSubmitting(false)
  }

  const handleDone = () => { if (typeof window !== 'undefined') localStorage.removeItem('rokmil-cart'); setCart([]); setPanel('none'); setDonor(null); setReceiptId(''); showToast('Thank you — our curator will be in touch shortly') }

  const [toast, setToast] = useState({ show: false, message: '' })
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const showToast = (message: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    setToast({ show: true, message })
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 3000)
  }

  if (swipeMode) {
    return (
      <>
        <SwipeMode specimens={specimens} currency={currency} cart={cart} onReserve={quickAdd} onSave={handleSave} savedIds={savedIds} onClose={() => setSwipeMode(false)} />
        <Toast message={toast.message} show={toast.show} />
      </>
    )
  }

  return (
    <>
      <header className="site-header">
        <div className="header-inner">
          <a className="logo" href="/">ROK<span className="logo-dot">·</span>MIL</a>
          <span className="nav-center">{settings?.tagline || 'Korean Botanicals'}</span>
          <button className="cart-btn" onClick={() => setPanel('cart')}>
            <span>Selection</span>
            <span className="cart-count">{cartCount}</span>
          </button>
        </div>
      </header>
      {(settings as any)?.announcementEnabled && (settings as any)?.announcementText && (<AnnouncementBanner text={(settings as any).announcementText} type={(settings as any).announcementType} expiry={(settings as any).announcementExpiry} />)}

      <section className="hero">
        <div>
          <div className="hero-eyebrow">ROKMil Botanical Series</div>
          <h1 className="hero-title">{settings?.heroTitle || 'Rooted in'}<em>{settings?.heroTitleItalic || 'Korean nature'}</em></h1>
        </div>
        <div className="hero-right">
          <p className="hero-subtitle">{settings?.heroSubtitle || 'Each specimen is cultivated with reverence for the Korean horticultural tradition.'}</p>
          <div className="hero-stat"><span className="hero-stat-num">{filtered.length}</span><span className="hero-stat-label">Specimens available</span></div>
        </div>
      </section>

      <div className="search-wrap"><SearchBar onSearch={setSearchQuery} /></div>
      <div className="surprise-wrap"><SurpriseBanner onActivate={() => setSwipeMode(true)} title={(settings as any)?.surpriseMeTitle} subtitle={(settings as any)?.surpriseMeSubtitle} buttonText={(settings as any)?.surpriseMeButtonText} /></div>

      <nav className="filter-bar" aria-label="Filter specimens">
        {categories.map(cat => (
          <button key={cat} className={`filter-btn ${activeFilter === cat ? 'active' : ''}`} onClick={() => setActiveFilter(cat)}>
            {cat === 'all' ? 'All' : CATEGORY_LABELS[cat] || cat}
          </button>
        ))}
      </nav>

      <main className="gallery-grid" aria-label="Specimen gallery">
        {filtered.length === 0 && (
          <div className="gallery-empty">
            <p className="gallery-empty-text">No specimens found</p>
            {searchQuery && <button className="gallery-empty-clear" onClick={() => setSearchQuery('')}>Clear search</button>}
          </div>
        )}

        {filtered.map((specimen, i) => {
          const qty = getCardQty(specimen.id)
          const isSaved = savedIds.includes(specimen.id)
          const isSoldOut = specimen.stock !== undefined && specimen.stock !== null && specimen.stock <= 0
          const imgSrc = specimen.image?.sizes?.card?.url || specimen.image?.url || null
          const badgeText = specimen.badge && specimen.badge !== 'none' ? specimen.badge === 'new' ? 'New' : specimen.badge === 'rare' ? 'Rare' : 'Popular' : null
          const hasQty = specimen.productType === 'flower' ? qty.qty35g > 0 || qty.qty28g > 0 : qty.qty15ml > 0

          return (
            <div key={specimen.id} className="card-2col" style={{ animationDelay: `${i * 0.04}s` }}>
              <div className="card-2col-img" onClick={() => openLightbox(specimen.id)} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && openLightbox(specimen.id)} aria-label={`View ${specimen.name} details`}>
                {imgSrc ? (
                  <Image src={imgSrc} alt={specimen.image?.alt || specimen.name} fill sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw" style={{ objectFit: 'cover' }} />
                ) : (
                  <div className="card-2col-placeholder"><span>{specimen.name}</span></div>
                )}
                {badgeText && <span className={`card-2col-badge ${specimen.badge}`}>{badgeText}</span>}
                {isSoldOut && <div className="card-2col-soldout"><span>Unavailable</span></div>}
                <button className={`card-2col-save ${isSaved ? 'saved' : ''}`} onClick={e => { e.stopPropagation(); handleSave(specimen.id) }} aria-label={isSaved ? 'Remove from saved' : 'Save'}>{isSaved ? '♥' : '♡'}</button>
              </div>

              <div className="card-2col-body">
                <div className="card-2col-cat">{CATEGORY_LABELS[specimen.category] || specimen.category}</div>
                <div className="card-2col-name" onClick={() => openLightbox(specimen.id)}>{specimen.name}</div>
                {specimen.latinName && <div className="card-2col-latin">{specimen.latinName}</div>}

                {!isSoldOut && (
                  <div className="card-sizes">
                    {specimen.productType === 'flower' && (
                      <>
                        {specimen.price35g != null && (
                          <div className="card-size-row">
                            <div className="card-size-info">
                              <span className="card-size-label">3.5g · Eighth</span>
                              <span className="card-size-price">{fmt(specimen.price35g, currency)}</span>
                            </div>
                            <div className="card-size-qty">
                              <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty35g', -1)}>−</button>
                              <span className="card-qty-num">{qty.qty35g}</span>
                              <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty35g', 1)}>+</button>
                            </div>
                          </div>
                        )}
                        {specimen.price35g != null && specimen.price28g != null && <div className="card-size-divider" />}
                        {specimen.price28g != null && (
                          <div className="card-size-row">
                            <div className="card-size-info">
                              <span className="card-size-label">28g · Oz</span>
                              <span className="card-size-price">{fmt(specimen.price28g, currency)}</span>
                            </div>
                            <div className="card-size-qty">
                              <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty28g', -1)}>−</button>
                              <span className="card-qty-num">{qty.qty28g}</span>
                              <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty28g', 1)}>+</button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                    {specimen.productType === 'tincture' && specimen.price15ml != null && (
                      <div className="card-size-row">
                        <div className="card-size-info">
                          <span className="card-size-label">15mL · Dropper</span>
                          <span className="card-size-price">{fmt(specimen.price15ml, currency)}</span>
                        </div>
                        <div className="card-size-qty">
                          <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty15ml', -1)}>−</button>
                          <span className="card-qty-num">{qty.qty15ml}</span>
                          <button className="card-qty-btn" onClick={() => setQty(specimen.id, 'qty15ml', 1)}>+</button>
                        </div>
                      </div>
                    )}
                    <button className={`card-add-btn ${hasQty ? 'active' : ''}`} onClick={() => handleCardAdd(specimen)} disabled={!hasQty}>
                      {hasQty ? 'Add to Selection' : 'Select a quantity'}
                    </button>
                  </div>
                )}
                {isSoldOut && <div className="card-sizes"><div className="card-soldout-label">Currently unavailable</div></div>}
              </div>
            </div>
          )
        })}
      </main>

      <Lightbox specimen={lightboxSpecimen} isOpen={!!lightboxId} currency={currency} qty={lbQty} inCart={cart.some(c => c.specimenId === lightboxId)} onClose={closeLightbox} onQtyChange={(d) => setLbQty(q => Math.min(5, Math.max(1, q + d)))} onAdd={(size, qty) => { if (!lightboxSpecimen) return; const price = size === '3.5g' ? lightboxSpecimen.price35g : size === '28g' ? lightboxSpecimen.price28g : lightboxSpecimen.price15ml; const sizeLabel = size === '3.5g' ? `3.5g u00b7 ${(settings as any)?.label35g || 'Eighth'}` : size === '28g' ? `28g u00b7 ${(settings as any)?.label28g || 'Oz'}` : `15mL u00b7 ${(settings as any)?.label15ml || 'Dropper'}`; if (!price) return; addToCart([{ key: cartItemKey(lightboxSpecimen.id, size), specimenId: lightboxSpecimen.id, specimenName: lightboxSpecimen.name, latinName: lightboxSpecimen.latinName, category: lightboxSpecimen.category, image: lightboxSpecimen.image, size, sizeLabel, price, qty }]); showToast(`${lightboxSpecimen.name} added`); closeLightbox(); }} />
      <CartPanel isOpen={panel === 'cart'} items={cart} settings={settings} onClose={() => setPanel('none')} onRemove={removeFromCart} onUpdateQty={updateCartQty} onCheckout={() => setPanel('form')} />
      <DonorForm isOpen={panel === 'form'} isSubmitting={isSubmitting} onBack={() => setPanel('cart')} onSubmit={handleFormSubmit} />
      <Receipt isOpen={panel === 'receipt'} receiptId={receiptId} donor={donor} items={cart} settings={settings} onDone={handleDone} />
      <Toast message={toast.message} show={toast.show} />
    </>
  )
}
