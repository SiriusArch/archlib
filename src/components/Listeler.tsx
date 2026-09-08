import { useEffect, useState } from 'react'
import { KONTROL_LISTELERI } from '../data/kritik'
import { listeDurumuOku, listeDurumuYaz } from '../lib/storage'

export default function Listeler() {
  const [durum, setDurum] = useState<Record<string, boolean>>({})
  const [aktif, setAktif] = useState(KONTROL_LISTELERI[0].id)

  useEffect(() => {
    setDurum(listeDurumuOku())
  }, [])

  function degistir(id: string) {
    setDurum((d) => {
      const yeni = { ...d, [id]: !d[id] }
      listeDurumuYaz(yeni)
      return yeni
    })
  }

  function sifirla(listeId: string) {
    const liste = KONTROL_LISTELERI.find((l) => l.id === listeId)
    if (!liste) return
    setDurum((d) => {
      const yeni = { ...d }
      for (const m of liste.maddeler) delete yeni[m.id]
      listeDurumuYaz(yeni)
      return yeni
    })
  }

  const liste = KONTROL_LISTELERI.find((l) => l.id === aktif) ?? KONTROL_LISTELERI[0]
  const tamam = liste.maddeler.filter((m) => durum[m.id]).length
  const yuzde = Math.round((tamam / liste.maddeler.length) * 100)

  return (
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Kontrol Listeleri</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#2c333d]">
          Teslimden once tek tek isaretle. Isaretler bu tarayicida saklanir. Cogu pafta, tasarim
          kotu oldugu icin degil, bu maddelerden birkaci atlandigi icin puan kaybeder.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap gap-1.5">
        {KONTROL_LISTELERI.map((l) => (
          <button
            key={l.id}
            onClick={() => setAktif(l.id)}
            className={`mono border px-4 py-2 text-[11px] font-bold tracking-[0.12em] uppercase transition ${
              aktif === l.id
                ? 'border-[#14181f] bg-[#14181f] text-[#f6f4ef]'
                : 'border-[#cfc9bc] bg-white/50 hover:border-[#a89f8c]'
            }`}
          >
            {l.baslik}
          </button>
        ))}
      </div>

      <section className="border border-[#cfc9bc] bg-white/60">
        <div className="border-b border-[#cfc9bc] bg-[#ebe7de] px-5 py-3.5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-bold">{liste.baslik}</h2>
              <p className="mt-0.5 max-w-xl text-[13px] text-[#2c333d]/85">{liste.aciklama}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="mono text-[12px] tracking-wider">
                {tamam} / {liste.maddeler.length}
              </span>
              <button
                onClick={() => sifirla(liste.id)}
                className="mono border border-[#cfc9bc] px-3 py-1.5 text-[10px] tracking-[0.12em] uppercase hover:border-[#b4472a] hover:text-[#b4472a]"
              >
                Sifirla
              </button>
            </div>
          </div>
          <div className="mt-3 h-1 w-full bg-[#cfc9bc]">
            <div
              className="h-full bg-[#b4472a] transition-all"
              style={{ width: `${yuzde}%` }}
            />
          </div>
        </div>

        <ul>
          {liste.maddeler.map((m, i) => {
            const isaretli = Boolean(durum[m.id])
            return (
              <li key={m.id} className="border-b border-[#cfc9bc]/60 last:border-0">
                <label className="flex cursor-pointer items-start gap-3 px-5 py-3.5 hover:bg-white/70">
                  <input
                    type="checkbox"
                    checked={isaretli}
                    onChange={() => degistir(m.id)}
                    className="mt-0.5 h-4 w-4 shrink-0 accent-[#b4472a]"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[14px] leading-snug ${
                        isaretli ? 'text-[#2c333d]/45 line-through' : 'font-medium'
                      }`}
                    >
                      <span className="mono mr-2 text-[11px] text-[#2c333d]/45">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      {m.metin}
                    </div>
                    {m.aciklama && !isaretli && (
                      <p className="mt-1 text-[12.5px] leading-relaxed text-[#2c333d]/75">
                        {m.aciklama}
                      </p>
                    )}
                    {m.kaynak && !isaretli && (
                      <p className="mono mt-1 text-[10px] tracking-wider text-[#2c333d]/50 uppercase">
                        {m.kaynak}
                      </p>
                    )}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
