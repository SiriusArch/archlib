import type { ReactNode } from 'react'

/** Arac panellerinde kullanilan kart blogu. */
export function Panel({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`overflow-hidden rounded-[8px] border border-cizgi bg-kart ${className}`}>
      {children}
    </section>
  )
}

export function PanelBasligi({
  baslik,
  sag,
  acik,
  degistir,
  renk = 'text-murekkep',
}: {
  baslik: string
  sag?: ReactNode
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
            className="h-4 w-4 rounded-[3px]"
          />
        )}
        <span className={`text-[14.5px] font-medium ${renk}`}>{baslik}</span>
      </label>
      {sag}
    </div>
  )
}

/** Format / secenek cipi — hap bicimli. */
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
      className={`rounded-full border px-3 py-1.5 text-[13px] font-medium transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-35 ${
        secili
          ? 'border-kiremit bg-kiremit-soft text-kiremit-koyu'
          : 'border-cizgi bg-kart text-murekkep-2 hover:border-cizgi-2 hover:text-murekkep'
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
  renk: string
  sag?: ReactNode
  pasif?: boolean
}) {
  return (
    <label
      className={`flex items-center justify-between gap-3 border-b border-cizgi/70 px-4 py-2.5 last:border-0 ${
        pasif ? 'opacity-40' : 'cursor-pointer hover:bg-kagit-2/70'
      }`}
    >
      <span className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={acik}
          disabled={pasif}
          onChange={(e) => degistir(e.target.checked)}
          className="h-4 w-4 rounded-[3px]"
        />
        <span className={`inline-block h-2.5 w-2.5 shrink-0 rounded-[3px] ${renk}`} />
        <span className="text-[14.5px] text-murekkep-2">{ad}</span>
      </span>
      {sag}
    </label>
  )
}

/** Kucuk deger secici — kontur araligi, cozunurluk gibi ayarlar icin. */
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
    <span className="flex overflow-hidden rounded-full border border-cizgi">
      {degerler.map((d) => (
        <button
          key={String(d)}
          onClick={(e) => {
            e.preventDefault()
            degistir(d)
          }}
          className={`px-2.5 py-1 text-[12px] font-medium transition-colors ${
            secili === d
              ? 'bg-kiremit-soft text-kiremit-koyu'
              : 'text-murekkep-3 hover:bg-kagit-2 hover:text-murekkep-2'
          }`}
        >
          {d}
          {birim}
        </button>
      ))}
    </span>
  )
}

/** Iki-uc secenekli segment denetimi. */
export function Segment<T extends string>({
  secenekler,
  secili,
  degistir,
  className = '',
}: {
  secenekler: readonly { deger: T; ad: string; ipucu?: string }[]
  secili: T
  degistir: (v: T) => void
  className?: string
}) {
  return (
    <div className={`flex overflow-hidden rounded-[7px] border border-cizgi bg-kart ${className}`}>
      {secenekler.map((s) => (
        <button
          key={s.deger}
          title={s.ipucu}
          onClick={() => degistir(s.deger)}
          className={`flex-1 px-3 py-2 text-[13.5px] font-medium transition-colors duration-200 ${
            secili === s.deger
              ? 'bg-kiremit-soft text-kiremit-koyu'
              : 'text-murekkep-3 hover:bg-kagit-2 hover:text-murekkep-2'
          }`}
        >
          {s.ad}
        </button>
      ))}
    </div>
  )
}
