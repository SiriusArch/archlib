import type { ReactNode } from 'react'

/** Sayfa basligi — serif, ustunde mono etiket, altinda ince kural. */
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
    <header className="mb-8 border-b border-cizgi pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <div className={`etiket ${renk}`}>{etiket}</div>
          <h1 className="font-baslik mt-2 text-[34px] leading-[1.12] font-normal tracking-[-0.015em] text-murekkep sm:text-[43px]">
            {baslik}
          </h1>
          {aciklama && (
            <p className="mt-3 max-w-xl text-[16px] leading-relaxed text-murekkep-2">{aciklama}</p>
          )}
        </div>
        {sag}
      </div>
    </header>
  )
}

/** Bolum basligi — kucuk mono etiket + ince kural. */
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
    <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-cizgi pb-2">
      <h2 className={`etiket ${renk}`}>{children}</h2>
      {sag}
    </div>
  )
}

/** Kutu degil: yalnizca ince cizgi ve bosluk. */
export function Kart({
  children,
  className = '',
  onClick,
  vurgu,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** Ust kenarda ince renk seridi */
  vurgu?: string
}) {
  const ortak = `group relative border border-cizgi bg-kagit/60 transition-all duration-300 ${
    onClick ? 'cursor-pointer hover:border-cizgi-2 hover:bg-kagit' : ''
  } ${className}`

  const icerik = (
    <>
      {vurgu && (
        <span
          className={`absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${vurgu}`}
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

/** Mono etiket rozeti. */
export function Rozet({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`etiket inline-block border px-1.5 py-[3px] leading-none ${className}`}
    >
      {children}
    </span>
  )
}

/** Birincil eylem: ustten dolan renk. */
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
  dolgu?: string
}) {
  if (tur === 'ikincil') {
    return (
      <button
        onClick={onClick}
        disabled={disabled}
        className={`etiket border border-cizgi-2 px-4 py-2.5 text-murekkep-2 transition-colors duration-300 hover:border-murekkep hover:text-murekkep disabled:opacity-40 ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`group relative overflow-hidden border border-murekkep px-6 py-3 text-murekkep transition-colors duration-400 hover:text-kagit disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:text-murekkep ${className}`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 -translate-y-full transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-disabled:translate-y-[-100%] ${dolgu}`}
      />
      <span className="etiket relative">{children}</span>
    </button>
  )
}

/** Bos durum — kutu degil, ortalanmis ince metin. */
export function Bos({ baslik, aciklama }: { baslik: string; aciklama?: string }) {
  return (
    <div className="flex flex-col items-center justify-center px-8 py-20 text-center">
      <div className="etiket text-murekkep-3">{baslik}</div>
      {aciklama && (
        <p className="mt-3 max-w-sm text-[15.5px] leading-relaxed text-murekkep-3">{aciklama}</p>
      )}
    </div>
  )
}
