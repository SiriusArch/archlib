import { useMemo, useState } from 'react'
import { BILGI_BOLUMLERI } from '../data/bilgi'
import { OLCU_TABLOLARI } from '../data/olculer'
import { SayfaBasligi } from '../ui/Parcalar'
import { Panel, PanelBasligi, Segment } from '../ui/Kontroller'

function Metin({ icerik }: { icerik: string }) {
  return (
    <div className="space-y-2 text-[15px] leading-[1.75] text-murekkep-2">
      {icerik.split('\n').map((satir, i) => {
        const k = satir.trim()
        if (!k) return <div key={i} className="h-2" />
        if (/^[A-ZÇĞİÖŞÜ0-9 ()./-]+:$/.test(k) || /^[0-9]+\.\s/.test(k)) {
          return (
            <p key={i} className="font-medium text-murekkep">
              {k}
            </p>
          )
        }
        if (k.startsWith('-') || k.startsWith('*')) {
          return (
            <p key={i} className="-indent-3 pl-4">
              {k}
            </p>
          )
        }
        return <p key={i}>{k}</p>
      })}
    </div>
  )
}

export default function BilgiBankasi() {
  const [sekme, setSekme] = useState<'kavram' | 'olcu'>('kavram')
  const [arama, setArama] = useState('')
  const [acik, setAcik] = useState<string | null>('tt-eksen')

  const q = arama.trim().toLocaleLowerCase('tr')

  const bolumler = useMemo(() => {
    if (!q) return BILGI_BOLUMLERI
    return BILGI_BOLUMLERI.map((b) => ({
      ...b,
      maddeler: b.maddeler.filter((m) =>
        `${m.baslik} ${m.icerik} ${m.etiketler.join(' ')}`.toLocaleLowerCase('tr').includes(q),
      ),
    })).filter((b) => b.maddeler.length > 0)
  }, [q])

  const tablolar = useMemo(() => {
    if (!q) return OLCU_TABLOLARI
    return OLCU_TABLOLARI.map((t) => ({
      ...t,
      satirlar: t.satirlar.filter((s) =>
        `${s.ad} ${s.deger} ${s.not ?? ''}`.toLocaleLowerCase('tr').includes(q),
      ),
    })).filter((t) => t.satirlar.length > 0 || t.baslik.toLocaleLowerCase('tr').includes(q))
  }, [q])

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="Bilgi"
        renk="text-kehribar-koyu"
        baslik="Analiz motorunun beslediği kaynak"
        aciklama="Temel Tasar (İ. Hulûsi Güngör), Neufert ve MİM 153 / MİM 244 ders notlarından çıkarılmış kavramlar, standartlar ve ölçüler."
        sag={
          <Segment
            secenekler={[
              { deger: 'kavram', ad: 'Kavram' },
              { deger: 'olcu', ad: 'Ölçü bankası' },
            ]}
            secili={sekme}
            degistir={setSekme}
            className="w-[240px]"
          />
        }
      />

      <div className="mb-6">
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ara: merdiven, doku, kot, aks, banyo, ölçek..."
          className="alan max-w-md"
        />
      </div>

      {sekme === 'kavram' && (
        <div className="space-y-3.5">
          {bolumler.length === 0 && (
            <p className="rounded-[8px] border border-dashed border-cizgi-2 py-16 text-center text-[15px] text-murekkep-3">
              Eşleşen kayıt yok.
            </p>
          )}
          {bolumler.map((b) => (
            <Panel key={b.id}>
              <div className="border-b border-cizgi px-5 py-4">
                <h2 className="text-[19px] leading-tight text-murekkep">{b.baslik}</h2>
                <p className="mt-1.5 max-w-2xl text-[14.5px] leading-relaxed text-murekkep-2">
                  {b.aciklama}
                </p>
                <p className="etiket mt-1.5">{b.kaynak}</p>
              </div>

              {b.maddeler.map((m) => {
                const secili = acik === m.id
                return (
                  <div key={m.id} className="border-b border-cizgi/70 last:border-0">
                    <button
                      onClick={() => setAcik(secili ? null : m.id)}
                      className="group flex w-full items-baseline justify-between gap-4 px-5 py-3 text-left transition-colors hover:bg-kagit-2/60"
                    >
                      <span
                        className={`text-[15.5px] font-medium transition-colors duration-300 ${
                          secili
                            ? 'text-kehribar-koyu'
                            : 'text-murekkep group-hover:text-kehribar-koyu'
                        }`}
                      >
                        {m.baslik}
                      </span>
                      <span
                        className={`shrink-0 text-[16px] text-murekkep-3 transition-transform duration-300 ${
                          secili ? 'rotate-45' : ''
                        }`}
                      >
                        +
                      </span>
                    </button>
                    {secili && (
                      <div className="animasyon-sayfa px-5 pb-5">
                        <Metin icerik={m.icerik} />
                        <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-cizgi pt-3">
                          <span className="etiket">{m.kaynak}</span>
                          {m.etiketler.map((e) => (
                            <span key={e} className="etiket text-murekkep-3/70">
                              {e}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </Panel>
          ))}
        </div>
      )}

      {sekme === 'olcu' && (
        <div className="grid gap-3.5 lg:grid-cols-2">
          {tablolar.length === 0 && (
            <p className="rounded-[8px] border border-dashed border-cizgi-2 py-16 text-center text-[15px] text-murekkep-3 lg:col-span-2">
              Eşleşen ölçü yok.
            </p>
          )}
          {tablolar.map((t) => (
            <Panel key={t.id} className="h-full">
              <PanelBasligi
                baslik={t.baslik}
                sag={<span className="etiket">{t.kaynak}</span>}
              />
              <table className="w-full text-[14.5px]">
                <tbody>
                  {t.satirlar.map((s, i) => (
                    <tr key={i} className="border-b border-cizgi/70 align-top last:border-0">
                      <td className="w-[44%] py-2.5 pr-4 pl-4 text-murekkep-2">{s.ad}</td>
                      <td className="py-2.5 pr-4">
                        <span className="sayi font-medium text-murekkep">{s.deger}</span>
                        {s.not && (
                          <div className="mt-0.5 text-[13px] leading-relaxed text-murekkep-3">
                            {s.not}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Panel>
          ))}
        </div>
      )}
    </div>
  )
}
