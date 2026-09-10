import { useEffect, useState } from 'react'
import { KONTROL_LISTELERI } from '../data/kritik'
import { listeDurumuOku, listeDurumuYaz } from '../lib/storage'
import { SayfaBasligi } from '../ui/Parcalar'
import { Panel, PanelBasligi, Cip } from '../ui/Kontroller'

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
        etiket="Listeler"
        renk="text-mor-koyu"
        baslik="Teslimden önce tek tek işaretle"
        aciklama="Çoğu pafta, tasarım kötü olduğu için değil, bu maddelerden birkaçı atlandığı için puan kaybeder. İşaretler bu tarayıcıda saklanır."
        sag={
          <div className="text-right">
            <div className="sayi text-[28px] leading-none text-murekkep">
              {tamam}
              <span className="text-murekkep-3">/{liste.maddeler.length}</span>
            </div>
            <div className="etiket mt-1">tamamlandı</div>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap gap-1.5">
        {KONTROL_LISTELERI.map((l) => (
          <Cip key={l.id} secili={aktif === l.id} onClick={() => setAktif(l.id)}>
            {l.baslik}
          </Cip>
        ))}
      </div>

      <Panel>
        <PanelBasligi
          baslik={liste.baslik}
          renk="text-murekkep"
          sag={
            <button
              onClick={() => sifirla(liste.id)}
              className="text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
            >
              Sıfırla
            </button>
          }
        />

        <div className="px-5 py-4">
          <p className="max-w-2xl text-[14.5px] leading-relaxed text-murekkep-2">
            {liste.aciklama}
          </p>
          <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-cizgi">
            <div
              className="h-full rounded-full bg-mor transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ width: `${yuzde}%` }}
            />
          </div>
        </div>

        <ul className="border-t border-cizgi">
          {liste.maddeler.map((m, i) => {
            const isaretli = Boolean(durum[m.id])
            return (
              <li key={m.id} className="border-b border-cizgi/70 last:border-0">
                <label className="flex cursor-pointer items-start gap-3.5 px-5 py-3.5 transition-colors hover:bg-kagit-2/60">
                  <span className="sayi w-5 shrink-0 pt-[3px] text-[12.5px] text-murekkep-3">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="checkbox"
                    checked={isaretli}
                    onChange={() => degistir(m.id)}
                    className="mt-[3px] h-4 w-4 shrink-0 rounded-[3px] accent-[#6d6a8f]"
                  />
                  <div className="min-w-0 flex-1">
                    <div
                      className={`text-[15.5px] leading-snug transition-colors duration-300 ${
                        isaretli ? 'text-murekkep-3 line-through' : 'text-murekkep'
                      }`}
                    >
                      {m.metin}
                    </div>
                    {m.aciklama && !isaretli && (
                      <p className="mt-1.5 text-[13.5px] leading-relaxed text-murekkep-2">
                        {m.aciklama}
                      </p>
                    )}
                    {m.kaynak && !isaretli && <p className="etiket mt-1.5">{m.kaynak}</p>}
                  </div>
                </label>
              </li>
            )
          })}
        </ul>
      </Panel>
    </div>
  )
}
