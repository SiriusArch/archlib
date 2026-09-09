import type { ReactNode } from 'react'

/** Sayfa basligi — ust etiket, baslik, aciklama; altinda ince ayirac yok,
 *  bosluk yeterli. */
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
          <div className={`etiket-buyuk ${renk}`}>{etiket}</div>
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

/** Bolum basligi — kart iclerinde ve liste ustlerinde. */
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
      <h2 className={`etiket-buyuk ${renk}`}>{children}</h2>
      {sag}
    </div>
  )
}

/** Icerik karti — golgesiz, ince kenarli, 8px kose. */
export function Kart({
  children,
  className = '',
  onClick,
  vurgu,
}: {
  children: ReactNode
  className?: string
  onClick?: () => void
  /** Ustte beliren ince renk seridi */
  vurgu?: string
}) {
  const ortak = `group relative overflow-hidden rounded-[8px] border border-cizgi bg-kart transition-all duration-250 ${
    onClick ? 'cursor-pointer hover:border-cizgi-2 hover:bg-white' : ''
  } ${className}`

  const icerik = (
    <>
      {vurgu && (
        <span
          className={`absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 transition-transform duration-350 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-x-100 ${vurgu}`}
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

/** Hap bicimli kucuk rozet. */
export function Rozet({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-block rounded-full border px-2.5 py-[3px] text-[11.5px] leading-none font-medium ${className}`}
    >
      {children}
    </span>
  )
}

/** Birincil eylem dugmesi. */
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
        className={`rounded-[6px] border border-cizgi bg-kart px-4 py-2.5 text-[14px] font-medium text-murekkep-2 transition-colors duration-200 hover:border-cizgi-2 hover:text-murekkep disabled:opacity-40 ${className}`}
      >
        {children}
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`rounded-[6px] px-5 py-3 text-[14.5px] font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 ${dolgu} ${className}`}
    >
      {children}
    </button>
  )
}

/** Bos durum. */
export function Bos({ baslik, aciklama }: { baslik: string; aciklama?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-[8px] border border-dashed border-cizgi-2 px-8 py-20 text-center">
      <div className="text-[15px] font-medium text-murekkep-2">{baslik}</div>
      {aciklama && (
        <p className="mt-2.5 max-w-md text-[14px] leading-relaxed text-murekkep-3">{aciklama}</p>
      )}
    </div>
  )
}
