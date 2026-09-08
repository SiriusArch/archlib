import { useMemo, useState } from 'react'
import { BILGI_BOLUMLERI } from '../data/bilgi'
import { OLCU_TABLOLARI } from '../data/olculer'

function Metin({ icerik }: { icerik: string }) {
  return (
    <div className="space-y-2 text-[13.5px] leading-relaxed text-[#2c333d]">
      {icerik.split('\n').map((satir, i) => {
        const k = satir.trim()
        if (!k) return <div key={i} className="h-1.5" />
        if (/^[A-ZÇĞİÖŞÜ0-9 ()./-]+:$/.test(k) || /^[0-9]+\.\s/.test(k)) {
          return (
            <p key={i} className="font-semibold">
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
    <div>
      <header className="mb-5">
        <h1 className="text-2xl font-bold">Bilgi Bankasi</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#2c333d]">
          Analiz motorunun beslendigi kaynak. Temel Tasar (I. Hulusi Gungor), Neufert ve MIM 153 /
          MIM 244 ders notlarindan cikarilmis kavramlar, standartlar ve olculer.
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <div className="flex border border-[#cfc9bc]">
          {(
            [
              ['kavram', 'Kavram ve Standart'],
              ['olcu', 'Olcu Bankasi'],
            ] as const
          ).map(([k, ad]) => (
            <button
              key={k}
              onClick={() => setSekme(k)}
              className={`mono px-4 py-2 text-[11px] font-bold tracking-[0.14em] uppercase transition ${
                sekme === k ? 'bg-[#14181f] text-[#f6f4ef]' : 'bg-white/50 hover:bg-white'
              }`}
            >
              {ad}
            </button>
          ))}
        </div>
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ara: merdiven, doku, kot, aks, banyo, olcek..."
          className="min-w-[240px] flex-1 border border-[#cfc9bc] bg-white px-3 py-2 text-sm outline-none focus:border-[#b4472a]"
        />
      </div>

      {sekme === 'kavram' && (
        <div className="space-y-7">
          {bolumler.length === 0 && (
            <p className="border border-[#cfc9bc] bg-white/50 p-6 text-center text-sm">
              Eslesen kayit yok.
            </p>
          )}
          {bolumler.map((b) => (
            <section key={b.id}>
              <h2 className="mono border-b border-[#cfc9bc] pb-1.5 text-[12px] font-bold tracking-[0.14em] uppercase">
                {b.baslik}
              </h2>
              <p className="mt-1.5 mb-1 max-w-2xl text-[13px] text-[#2c333d]/85">{b.aciklama}</p>
              <p className="mono mb-3 text-[10px] tracking-wider text-[#2c333d]/55 uppercase">
                Kaynak: {b.kaynak}
              </p>
              <div className="space-y-2">
                {b.maddeler.map((m) => {
                  const secili = acik === m.id
                  return (
                    <div key={m.id} className="border border-[#cfc9bc] bg-white/60">
                      <button
                        onClick={() => setAcik(secili ? null : m.id)}
                        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-white"
                      >
                        <span className="text-[14px] font-semibold">{m.baslik}</span>
                        <span className="mono text-[13px] text-[#b4472a]">{secili ? '−' : '+'}</span>
                      </button>
                      {secili && (
                        <div className="border-t border-[#cfc9bc] px-4 py-3.5">
                          <Metin icerik={m.icerik} />
                          <div className="mono mt-3 flex flex-wrap items-center gap-2 border-t border-[#cfc9bc] pt-2.5 text-[10px] tracking-wider text-[#2c333d]/55">
                            <span className="uppercase">{m.kaynak}</span>
                            {m.etiketler.map((e) => (
                              <span key={e}>#{e}</span>
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
        <div className="grid gap-5 lg:grid-cols-2">
          {tablolar.length === 0 && (
            <p className="border border-[#cfc9bc] bg-white/50 p-6 text-center text-sm lg:col-span-2">
              Eslesen olcu yok.
            </p>
          )}
          {tablolar.map((t) => (
            <section key={t.id} className="border border-[#cfc9bc] bg-white/60">
              <div className="border-b border-[#cfc9bc] bg-[#ebe7de] px-4 py-2.5">
                <h2 className="text-[14px] font-bold">{t.baslik}</h2>
                <div className="mono mt-0.5 text-[10px] tracking-wider text-[#2c333d]/60 uppercase">
                  {t.kaynak}
                </div>
              </div>
              <table className="w-full text-[13px]">
                <tbody>
                  {t.satirlar.map((s, i) => (
                    <tr key={i} className="border-b border-[#cfc9bc]/60 last:border-0">
                      <td className="w-[42%] px-4 py-2 align-top font-medium">{s.ad}</td>
                      <td className="px-4 py-2 align-top">
                        <span className="mono">{s.deger}</span>
                        {s.not && (
                          <div className="mt-0.5 text-[12px] text-[#2c333d]/70 italic">{s.not}</div>
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
