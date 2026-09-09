import { useMemo, useState } from 'react'
import { BILGI_BOLUMLERI } from '../data/bilgi'
import { OLCU_TABLOLARI } from '../data/olculer'
import { SayfaBasligi } from '../ui/Parcalar'

function Metin({ icerik }: { icerik: string }) {
  return (
    <div className="space-y-2 text-[15.5px] leading-[1.75] text-murekkep-2">
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
            <p key={i} className="pl-4 -indent-3">
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
        etiket="04 — Bilgi Bankasi"
        renk="text-kehribar-koyu"
        baslik="Analiz motorunun besledigi kaynak"
        aciklama="Temel Tasar (I. Hulusi Gungor), Neufert ve MIM 153 / MIM 244 ders notlarindan cikarilmis kavramlar, standartlar ve olculer."
      />

      <div className="mb-10 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div className="flex gap-6">
          {(
            [
              ['kavram', 'Kavram ve Standart'],
              ['olcu', 'Olcu Bankasi'],
            ] as const
          ).map(([k, ad]) => (
            <button
              key={k}
              onClick={() => setSekme(k)}
              className="group relative py-1"
            >
              <span
                className={`font-baslik text-[19px] transition-colors duration-300 ${
                  sekme === k ? 'text-murekkep' : 'text-murekkep-3 group-hover:text-murekkep-2'
                }`}
              >
                {ad}
              </span>
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-kehribar transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  sekme === k ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>
          ))}
        </div>
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ara: merdiven, doku, kot, aks, banyo, olcek..."
          className="alan min-w-[240px] flex-1"
        />
      </div>

      {sekme === 'kavram' && (
        <div className="space-y-14">
          {bolumler.length === 0 && (
            <p className="border-t border-cizgi py-16 text-center text-[16px] text-murekkep-3">
              Eslesen kayit yok.
            </p>
          )}
          {bolumler.map((b) => (
            <section key={b.id}>
              <div className="mb-4 border-b border-cizgi pb-2">
                <h2 className="font-baslik text-[25px] leading-tight text-murekkep">{b.baslik}</h2>
              </div>
              <p className="mb-2 max-w-2xl text-[15.5px] leading-relaxed text-murekkep-2">
                {b.aciklama}
              </p>
              <p className="etiket mb-6 text-murekkep-3">{b.kaynak}</p>

              <div className="border-t border-cizgi">
                {b.maddeler.map((m) => {
                  const secili = acik === m.id
                  return (
                    <div key={m.id} className="border-b border-cizgi">
                      <button
                        onClick={() => setAcik(secili ? null : m.id)}
                        className="group flex w-full items-baseline justify-between gap-4 py-3.5 text-left"
                      >
                        <span
                          className={`font-baslik text-[18px] transition-colors duration-300 ${
                            secili ? 'text-kehribar-koyu' : 'text-murekkep group-hover:text-kehribar-koyu'
                          }`}
                        >
                          {m.baslik}
                        </span>
                        <span className="etiket shrink-0 text-murekkep-3">
                          {secili ? 'kapat' : 'ac'}
                        </span>
                      </button>
                      {secili && (
                        <div className="animasyon-sayfa pb-5">
                          <Metin icerik={m.icerik} />
                          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1 border-t border-cizgi pt-3">
                            <span className="etiket text-murekkep-3">{m.kaynak}</span>
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
              </div>
            </section>
          ))}
        </div>
      )}

      {sekme === 'olcu' && (
        <div className="grid gap-x-12 gap-y-12 lg:grid-cols-2">
          {tablolar.length === 0 && (
            <p className="border-t border-cizgi py-16 text-center text-[16px] text-murekkep-3 lg:col-span-2">
              Eslesen olcu yok.
            </p>
          )}
          {tablolar.map((t) => (
            <section key={t.id}>
              <div className="mb-1 border-b border-cizgi pb-2">
                <h2 className="font-baslik text-[20.5px] leading-tight text-murekkep">{t.baslik}</h2>
              </div>
              <p className="etiket mb-3 text-murekkep-3">{t.kaynak}</p>
              <table className="w-full text-[14.5px]">
                <tbody>
                  {t.satirlar.map((s, i) => (
                    <tr key={i} className="border-b border-cizgi align-top">
                      <td className="w-[44%] py-2 pr-4 text-murekkep-2">{s.ad}</td>
                      <td className="py-2">
                        <span className="sayi text-murekkep">{s.deger}</span>
                        {s.not && (
                          <div className="mt-0.5 text-[13.5px] leading-relaxed text-murekkep-3">
                            {s.not}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          ))}
        </div>
      )}
    </div>
  )
}
