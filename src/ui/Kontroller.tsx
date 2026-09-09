import type { ReactNode } from 'react'

/** Arac panellerinde kullanilan yumusak blok. */
export function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`border border-cizgi bg-kagit/70 ${className}`}>{children}</section>
  )
}

export function PanelBasligi({
  baslik,
  sag,
  acik,
  degistir,
  renk = 'text-murekkep-3',
}: {
  baslik: string
  sag?: ReactNode
  /** Verilirse basliga acma/kapama kutusu eklenir */
  acik?: boolean
  degistir?: (v: boolean) => void
  renk?: string
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-cizgi px-4 py-3">
      <label className={`flex items-center gap-2.5 ${degistir ? 'cursor-pointer' : ''}`}>
        {degistir && (
          <input
            type="checkbox"
            checked={Boolean(acik)}
            onChange={(e) => degistir(e.target.checked)}
            className="h-3.5 w-3.5 accent-[#517a95]"
          />
        )}
        <span className={`etiket ${renk}`}>{baslik}</span>
      </label>
      {sag}
    </div>
  )
}

/** Format secim cipi. */
export function Cip({
  secili,
  onClick,
  children,
  pasif,
  ipucu,
}: {
  secili: boolean
  onClick: () => void
  children: ReactNode
  pasif?: boolean
  ipucu?: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={pasif}
      title={ipucu}
      className={`etiket border px-3 py-2 transition-colors duration-300 disabled:cursor-not-allowed disabled:opacity-35 ${
        secili
          ? 'border-mavi bg-mavi-soft text-mavi-koyu'
          : 'border-cizgi text-murekkep-2 hover:border-cizgi-2 hover:text-murekkep'
      }`}
    >
      {children}
    </button>
  )
}

/** Katman acma/kapama satiri. */
export function KatmanSatiri({
  acik,
  degistir,
  ad,
  renk,
  sag,
  pasif,
}: {
  acik: boolean
  degistir: (v: boolean) => void
  ad: string
  /** Sol taraftaki renk isareti */
  renk: string
  sag?: ReactNode
  pasif?: boolean
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 border-b border-cizgi/70 px-4 py-2.5 last:border-0 ${
        pasif ? 'opacity-40' : 'cursor-pointer hover:bg-kagit-2/60'
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={acik}
          disabled={pasif}
          onChange={(e) => degistir(e.target.checked)}
          className="h-3.5 w-3.5 accent-[#517a95]"
        />
        <span className={`inline-block h-2.5 w-2.5 shrink-0 ${renk}`} />
        <span className="text-[15px] text-murekkep-2">{ad}</span>
      </span>
      {sag}
    </label>
  )
}

/** Sayisal deger secici — kontur araligi gibi kucuk ayarlar icin. */
export function DegerSecici<T extends string | number>({
  degerler,
  secili,
  degistir,
  birim = '',
}: {
  degerler: readonly T[]
  secili: T
  degistir: (v: T) => void
  birim?: string
}) {
  return (
    <span className="flex gap-1">
      {degerler.map((d) => (
        <button
          key={String(d)}
          onClick={(e) => {
            e.preventDefault()
            degistir(d)
          }}
          className={`etiket border px-2 py-1 transition-colors ${
            secili === d
              ? 'border-mavi bg-mavi-soft text-mavi-koyu'
              : 'border-cizgi text-murekkep-3 hover:border-cizgi-2'
          }`}
        >
          {d}
          {birim}
        </button>
      ))}
    </span>
  )
}
