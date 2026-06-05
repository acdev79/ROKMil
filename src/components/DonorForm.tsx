'use client'
import { useState } from 'react'

interface FormData {
  name: string
  email: string
  phone: string
  message: string
}

interface Props {
  isOpen: boolean
  isSubmitting: boolean
  onBack: () => void
  onSubmit: (data: FormData) => void
}

export default function DonorForm({ isOpen, isSubmitting, onBack, onSubmit }: Props) {
  const [form, setForm] = useState<FormData>({ name: '', email: '', phone: '', message: '' })
  const [errors, setErrors] = useState<Partial<FormData>>({})

  const validate = () => {
    const e: Partial<FormData> = {}
    if (!form.name.trim()) e.name = 'Required'
    if (!form.email.trim()) e.email = 'Required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = () => {
    if (validate()) onSubmit(form)
  }

  const field = (key: keyof FormData) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value })),
  })

  return (
    <div className={`form-overlay ${isOpen ? 'open' : ''}`}>
      <div className="form-panel">
        <div className="form-eyebrow">Collector Details</div>
        <h2 className="form-heading">Your Information</h2>
        <p className="form-sub">
          Your details appear on the receipt so our curator can reach you to arrange handover of your specimens.
        </p>

        <div className="form-group">
          <label>Full Name *</label>
          <input type="text" placeholder="Your name" {...field('name')} />
          {errors.name && <span style={{ color: 'var(--blush)', fontSize: '0.72rem' }}>{errors.name}</span>}
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Email *</label>
            <input type="email" placeholder="email@address.com" {...field('email')} />
            {errors.email && <span style={{ color: 'var(--blush)', fontSize: '0.72rem' }}>{errors.email}</span>}
          </div>
          <div className="form-group">
            <label>Phone</label>
            <input type="tel" placeholder="+1 000 000 0000" {...field('phone')} />
          </div>
        </div>

        <div className="form-group">
          <label>Message to Curator</label>
          <textarea
            placeholder="Preferred collection time, care questions, special notes..."
            {...field('message')}
          />
        </div>

        <button
          className="form-submit"
          onClick={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Generating...' : 'Generate Receipt'}
        </button>
        <button className="form-cancel" onClick={onBack}>
          ← Return to Selection
        </button>
      </div>
    </div>
  )
}
