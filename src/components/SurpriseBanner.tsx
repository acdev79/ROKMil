'use client'

interface Props {
  onActivate: () => void
  title?: string
  subtitle?: string
  buttonText?: string
}

export default function SurpriseBanner({
  onActivate,
  title = 'Surprise Me',
  subtitle = 'Let us find your next specimen',
  buttonText = 'Discover',
}: Props) {
  return (
    <div className="surprise-banner" role="complementary">
      <div className="surprise-banner-text">
        <div className="surprise-title">{title}</div>
        <div className="surprise-sub">{subtitle}</div>
      </div>
      <button className="surprise-btn" onClick={onActivate}>
        {buttonText} <span aria-hidden="true">✦</span>
      </button>
    </div>
  )
}
