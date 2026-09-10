import type { ReactNode } from 'react'

/**
 * Kucuk geometrik "imza" ucu — kare, daire, ucgen. Bauhaus'un temel
 * bicimleri; sayfa basliklarinda etiketin yaninda tekrar eden bir motif
 * olarak kullanilir. Rengi disaridan verilen text-* sinifindan (currentColor)
 * gelir.
 */
function ImzaSekli({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-[3px] ${className}`}>
      <span className="h-[7px] w-[7px] shrink-0 bg-current" />
      <span className="h-[7px] w-[7px] shrink-0 rounded-full bg-current" />
      <svg width="8" height="7" viewBox="0 0 8 7" className="shrink-0">
        <path d="M4 0L8 7H0Z" fill="currentColor" />
      </svg>
    </span>
  )
}

/** Sayfa basligi — geometrik imza + etiket, baslik, aciklama. */
export function SayfaBasligi({
  etiket,
  baslik,
  aciklama,
  renk = 'text-murekkep-3',
  sag,
}: {
  etiket: string
  baslik: string
  aciklama?: ReactNode
  renk?: string
  sag?: ReactNode
}) {
  return (
    <header className="mb-8">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="max-w-2xl">
          <div className={`flex items-center gap-2 ${renk}`}>
            <ImzaSekli />
            <span className="etiket-buyuk">{etiket}</span>
          </div>
          <h1 className="mt-2.5 text-[30px] text-murekkep sm:text-[34px]">{baslik}</h1>
          {aciklama && (
            <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-murekkep-2">{aciklama}</p>
          )}
        </div>
        {sag}
      </div>
    </header>
  )
}

/** Bolum basligi — kare vurgu + baslik; kart iclerinde ve liste ustlerinde. */
export function BolumBasligi({
  children,
  sag,
  renk = 'text-murekkep-3',
}: {
  children: ReactNode
  sag?: ReactNode
  renk?: string
}) {
  return (
    <div className="mb-3 flex items-center justify-between gap-4">
      <h2 className={`flex items-center gap-2 etiket-buyuk ${renk}`}>
        <span className="h-2 w-2 shrink-0 bg-current" />
        {children}
      </h2>
      {sag}
    </div>
  )
}

/** Icerik karti — kalin kontur, sert (offset) golge; 80'ler poster hissi. */
export function Kart({
  children,
  className = '',
  onClick,
  vurgu,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** Sag ust kosede beliren renkli "etiket" karesi */
  vurgu?: string
}) {
  const ortak = `group relative overflow-hidden rounded-[4px] border-[1.5px] border-murekkep bg-kart shadow-[var(--t-golge-sm)] transition-all duration-200 ${
    onClick
      ? 'cursor-pointer hover:-translate-y-[2px] hover:shadow-[var(--t-golge)] active:translate-y-0 active:shadow-[var(--t-golge-kucuk)]'
      : ''
  } ${className}`

  const icerik = (
    <>
      {vurgu && (
        <span
          className={`absolute top-0 right-0 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-murekkep ${vurgu}`}
        />
      )}
      {children}
    </>
  )

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={`${ortak} text-left`}>
        {icerik}
      </button>
    )
  }
  return <div className={ortak}>{icerik}</div>
}

/** Kose kesikli, kalin konturlu kucuk rozet — hap degil, geometrik etiket. */
export function Rozet({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-[3px] border-[1.5px] px-2.5 py-[3px] text-[11px] leading-none font-bold tracking-[0.01em] uppercase ${className}`}
    >
      {children}
    </span>
  )
}

/** Birincil eylem dugmesi — kalin kontur + sert golge, basinca gomulur. */
export function Dugme({
  children,
  onClick,
  tur = 'birincil',
  className = '',
  disabled,
  dolgu = 'bg-kiremit',
}: {
  children: ReactNode
  onClick?: () => void
  tur?: 'birincil' | 'ikincil'
  className?: string
  disabled?: boolean
  /** Birincil dugmenin zemin rengi */
  dolgu?: string
}) {
  if (tur === 'ikincil') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`rounded-[4px] border-[1.5px] border-murekkep bg-kart px-4 py-2.5 text-[14px] font-semibold text-murekkep-2 shadow-[var(--t-golge-kucuk)] transition-all duration-150 hover:text-murekkep active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[var(--t-golge-kucuk)] ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[4px] border-[1.5px] border-murekkep px-5 py-3 text-[14.5px] font-semibold text-white shadow-[var(--t-golge-sm)] transition-all duration-150 hover:brightness-105 active:translate-x-[3px] active:translate-y-[3px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-40 disabled:active:translate-x-0 disabled:active:translate-y-0 disabled:active:shadow-[var(--t-golge-sm)] ${dolgu} ${className}`}
    >
      {children}
    </button>
  )
}

/** Bos durum — noktali doku + kesik cizgili kontur. */
export function Bos({ baslik, aciklama }: { baslik: string; aciklama?: string }) {
  return (
    <div className="desen-noktalar relative overflow-hidden rounded-[4px] border-[1.5px] border-dashed border-cizgi-2 px-8 py-20 text-center text-cizgi-2">
      <div className="relative text-[15px] font-medium text-murekkep-2">{baslik}</div>
      {aciklama && (
        <p className="relative mt-2.5 max-w-md mx-auto text-[14px] leading-relaxed text-murekkep-3">
          {aciklama}
        </p>
      )}
    </div>
  )
}
