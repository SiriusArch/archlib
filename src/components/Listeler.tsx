import { useEffect, useState } from 'react'
import { KONTROL_LISTELERI } from '../data/kritik'
import { listeDurumuOku, listeDurumuYaz } from '../lib/storage'
import { SayfaBasligi } from '../ui/Parcalar'

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
    <div className="kademe">
      <SayfaBasligi
        etiket="05 — Kontrol Listeleri"
        renk="text-mor-koyu"
        baslik="Teslimden once tek tek isaretle"
        aciklama="Cogu pafta, tasarim kotu oldugu icin degil, bu maddelerden birkaci atlandigi icin puan kaybeder. Isaretler bu tarayicida saklanir."
        sag={
          <div className="text-right">
            <div className="sayi text-[26px] leading-none text-murekkep">
              {tamam}
              <span className="text-murekkep-3">/{liste.maddeler.length}</span>
            </div>
            <div className="etiket mt-1 text-murekkep-3">tamamlandi</div>
          </div>
        }
      />

      <div className="mb-8 flex flex-wrap gap-x-8 gap-y-2">
        {KONTROL_LISTELERI.map((l) => (
          <button key={l.id} onClick={() => setAktif(l.id)} className="group relative py-1">
            <span
              className={`font-baslik text-[17px] transition-colors duration-300 ${
                aktif === l.id ? 'text-murekkep' : 'text-murekkep-3 group-hover:text-murekkep-2'
              }`}
            >
              {l.baslik}
            </span>
            <span
              className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-mor transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                aktif === l.id ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
              }`}
            />
          </button>
        ))}
      </div>

      <section>
        <div className="mb-1 flex flex-wrap items-end justify-between gap-4">
          <p className="max-w-2xl text-[13.5px] leading-relaxed text-murekkep-2">
            {liste.aciklama}
          </p>
          <button
            onClick={() => sifirla(liste.id)}
            className="etiket text-murekkep-3 transition-colors hover:text-kiremit-koyu"
          >
            Sifirla
          </button>
        </div>

        <div className="mt-4 mb-2 h-px w-full bg-cizgi">
          <div
            className="h-px bg-mor transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ width: `${yuzde}%` }}
          />
        </div>

        <ul className="border-t border-cizgi">
          {liste.maddeler.map((m, i) => {
            const isaretli = Boolean(durum[m.id])
            return (
              <li key={m.id} className="border-b border-cizgi">
                <label className="flex cursor-pointer items-start gap-4 py-4">
                  <span className="sayi w-6 shrink-0 pt-[3px] text-[11px] text-murekkep-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="checkbox"
                    checked={isaretli}
                    onChange={() => degistir(m.id)}
                    className="mt-[3px] h-3.5 w-3.5 shrink-0 accent-[#5c5992]"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[14.5px] leading-snug transition-colors duration-300 ${
                        isaretli ? 'text-murekkep-3 line-through' : 'text-murekkep'
                      }`}
                    >
                      {m.metin}
                    </div>
                    {m.aciklama && !isaretli && (
                      <p className="mt-1.5 text-[12.5px] leading-relaxed text-murekkep-2">
                        {m.aciklama}
                      </p>
                    )}
                    {m.kaynak && !isaretli && (
                      <p className="etiket mt-1.5 text-murekkep-3">{m.kaynak}</p>
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
