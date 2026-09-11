/**
 * Ince cizgili ikon seti — 1.5 birim kalinlik, 24'luk kutu.
 * Disaridan ikon paketi cekmiyoruz: hem paket boyutu hem de cizgi
 * kalinliginin tipografiyle uyumu icin kendi setimiz.
 */
type Props = { className?: string }

const ortak = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

export function IkonKritik({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M4 19V6.5A2.5 2.5 0 0 1 6.5 4H18a1 1 0 0 1 1 1v11" />
      <path d="M6.5 16H19v3.5a.5.5 0 0 1-.5.5H6.5A2.5 2.5 0 0 1 4 17.5" />
      <path d="M9 8h6M9 11h4" />
    </svg>
  )
}

export function IkonCizim({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M4 20V8.5L12 4l8 4.5V20" />
      <path d="M4 20h16" />
      <path d="M9.5 20v-6h5v6" />
      <path d="M4 12.5h16" />
    </svg>
  )
}

export function IkonArazi({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M3 17.5 9 14l6 3 6-4.5" />
      <path d="M3 12.5 9 9l6 3 6-4.5" />
      <path d="M9 9v5M15 12v5" />
    </svg>
  )
}

export function IkonForum({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h9A2.5 2.5 0 0 1 18 6.5v5a2.5 2.5 0 0 1-2.5 2.5H9l-3.5 3v-3H6.5A2.5 2.5 0 0 1 4 11.5z" />
      <path d="M9.5 20a3 3 0 0 0 3-3v-.2" />
    </svg>
  )
}

export function IkonKitaplik({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <rect x="3.5" y="4" width="4" height="16" rx="1" />
      <rect x="9.5" y="4" width="4" height="16" rx="1" />
      <path d="M16.2 5.4l3.3 15" />
    </svg>
  )
}

export function IkonBilgi({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v16H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5z" />
    </svg>
  )
}

export function IkonListe({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M4 6.5l1.6 1.6L8.5 5" />
      <path d="M4 13l1.6 1.6L8.5 11.5" />
      <path d="M4 19.5l1.6 1.6L8.5 18" />
      <path d="M11.5 7h8.5M11.5 13.5h8.5M11.5 20h6" />
    </svg>
  )
}

export function IkonKaynak({ className = 'h-[18px] w-[18px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 16.5v-5M12 8.2v.3" />
    </svg>
  )
}

export function IkonAnahtar({ className = 'h-[16px] w-[16px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <circle cx="8" cy="12" r="3.5" />
      <path d="M11.5 12H20M17 12v3M20 12v2.5" />
    </svg>
  )
}

export function IkonOk({ className = 'h-[14px] w-[14px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  )
}

export function IkonGunes({ className = 'h-[15px] w-[15px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="4.2" />
      <path d="M12 2.5v2.3M12 19.2v2.3M4.6 4.6l1.6 1.6M17.8 17.8l1.6 1.6M2.5 12h2.3M19.2 12h2.3M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
    </svg>
  )
}

export function IkonAy({ className = 'h-[15px] w-[15px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M20 14.2A8.5 8.5 0 1 1 9.8 4a6.8 6.8 0 0 0 10.2 10.2Z" />
    </svg>
  )
}

export function IkonIndir({ className = 'h-[15px] w-[15px]' }: Props) {
  return (
    <svg {...ortak} className={className} aria-hidden="true">
      <path d="M12 4v11M8 11.5l4 4 4-4M5 19.5h14" />
    </svg>
  )
}
