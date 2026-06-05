'use client'

interface Props {
  onActivate: () => void
}

export default function SurpriseBanner({ onActivate }: Props) {
  return (
    <div className="surprise-banner" role="complementary" aria-label="Discovery mode">
      <div className="surprise-banner-text">
        <div className="surprise-eyebrow">Discovery</div>
        <div className="surprise-title">Surprise Me</div>
        <div className="surprise-sub">Let us find your next specimen</div>
      </div>
      <button
        className="surprise-btn"
        onClick={onActivate}
        aria-label="Start surprise discovery mode"
      >
        Discover <span aria-hidden="true">✦</span>
      </button>
    </div>
  )
}
