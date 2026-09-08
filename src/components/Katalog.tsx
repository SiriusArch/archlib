import { useMemo, useState, type ReactNode } from 'react'
import type { Asama, Kategori, Site, Ucret } from '../types'
import {
  SITELER,
  KATEGORI_ADI,
  KATEGORI_ACIKLAMA,
  UCRET_ADI,
  ASAMA_ADI,
} from '../data/sites'

const UCRET_RENK: Record<Ucret, string> = {
  ucretsiz: 'bg-[#1f6f4a]/12 text-[#1f6f4a] border-[#1f6f4a]/35',
  freemium: 'bg-[#b4472a]/12 text-[#b4472a] border-[#b4472a]/35',
  ucretli: 'bg-[#2c333d]/12 text-[#2c333d] border-[#2c333d]/35',
}

function Rozet({ children, sinif = '' }: { children: ReactNode; sinif?: string }) {
  return (
    <span
      className={`mono inline-block border px-1.5 py-0.5 text-[10px] tracking-[0.1em] uppercase ${sinif}`}
    >
      {children}
    </span>
  )
}

function SiteKarti({ site, ac }: { site: Site; ac: (s: Site) => void }) {
  return (
    <button
      onClick={() => ac(site)}
      className="group flex h-full flex-col border border-[#cfc9bc] bg-white/60 p-4 text-left transition hover:border-[#b4472a] hover:bg-white"
    >
      <div className="mb-2 flex items-start justify-between gap-2">
        <h3 className="text-[15px] leading-snug font-bold group-hover:text-[#b4472a]">{site.ad}</h3>
        <Rozet sinif={UCRET_RENK[site.ucret]}>{UCRET_ADI[site.ucret]}</Rozet>
      </div>
      <p className="mb-3 flex-1 text-[13px] leading-relaxed text-[#2c333d]">{site.ozet}</p>
      <div className="flex flex-wrap gap-1">
        {site.turkce && <Rozet sinif="border-[#1f6f4a]/35 text-[#1f6f4a]">TR</Rozet>}
        {site.asamalar.slice(0, 2).map((a) => (
          <Rozet key={a} sinif="border-[#cfc9bc] text-[#2c333d]/75">
            {ASAMA_ADI[a].split(' ')[0]}
          </Rozet>
        ))}
        {site.dogrulama === 'dogrulanmadi' && (
          <Rozet sinif="border-[#b4472a]/40 text-[#b4472a]">?</Rozet>
        )}
      </div>
    </button>
  )
}

function Detay({ site, kapat }: { site: Site; kapat: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#14181f]/60 p-4 backdrop-blur-sm"
      onClick={kapat}
    >
      <div
        className="my-8 w-full max-w-2xl border border-[#cfc9bc] bg-[#f6f4ef] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#cfc9bc] px-6 py-4">
          <div>
            <h2 className="text-xl font-bold">{site.ad}</h2>
            <div className="mono mt-1 text-[11px] tracking-wider text-[#2c333d]/70">
              {KATEGORI_ADI[site.kategori]}
            </div>
          </div>
          <button
            onClick={kapat}
            className="mono px-2 text-lg leading-none hover:text-[#b4472a]"
            aria-label="Kapat"
          >
            X
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div className="flex flex-wrap gap-1.5">
            <Rozet sinif={UCRET_RENK[site.ucret]}>{UCRET_ADI[site.ucret]}</Rozet>
            {site.asamalar.map((a) => (
              <Rozet key={a} sinif="border-[#cfc9bc] text-[#2c333d]/75">
                {ASAMA_ADI[a]}
              </Rozet>
            ))}
          </div>

          <section>
            <h3 className="mono mb-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">
              Ne ise yarar
            </h3>
            <p className="text-sm leading-relaxed text-[#2c333d]">{site.anlatim}</p>
          </section>

          <section>
            <h3 className="mono mb-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">
              Projende nerede kullanirsin
            </h3>
            <p className="border-l-2 border-[#b4472a] pl-3 text-sm leading-relaxed text-[#2c333d]">
              {site.kullanim}
            </p>
          </section>

          {site.fiyatNotu && (
            <section>
              <h3 className="mono mb-1.5 text-[11px] font-bold tracking-[0.14em] uppercase">
                Fiyat
              </h3>
              <p className="text-sm text-[#2c333d]">{site.fiyatNotu}</p>
            </section>
          )}

          {site.uyari && (
            <section className="border border-[#b4472a]/35 bg-[#b4472a]/8 p-3">
              <h3 className="mono mb-1 text-[11px] font-bold tracking-[0.14em] text-[#b4472a] uppercase">
                Dikkat
              </h3>
              <p className="text-sm text-[#2c333d]">{site.uyari}</p>
            </section>
          )}

          <div className="flex flex-wrap gap-1.5">
            {site.etiketler.map((e) => (
              <span key={e} className="mono text-[10px] tracking-wider text-[#2c333d]/60">
                #{e}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-3 border-t border-[#cfc9bc] pt-4">
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer noopener"
              className="mono bg-[#14181f] px-5 py-2.5 text-[11px] font-bold tracking-[0.14em] text-[#f6f4ef] uppercase hover:bg-[#b4472a]"
            >
              Siteye Git
            </a>
            <span className="mono text-[10px] tracking-wider text-[#2c333d]/55">
              {site.dogrulama === 'dogrulandi'
                ? 'ICERIK SITEDEN DOGRULANDI'
                : site.dogrulama === 'kismi'
                  ? 'KISMEN DOGRULANDI'
                  : 'DOGRULANAMADI'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Katalog() {
  const [arama, setArama] = useState('')
  const [kategori, setKategori] = useState<Kategori | 'hepsi'>('hepsi')
  const [ucret, setUcret] = useState<Ucret | 'hepsi'>('hepsi')
  const [asama, setAsama] = useState<Asama | 'hepsi'>('hepsi')
  const [secili, setSecili] = useState<Site | null>(null)

  const kategoriler = useMemo(
    () => Array.from(new Set(SITELER.map((s) => s.kategori))) as Kategori[],
    [],
  )

  const sonuclar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr')
    return SITELER.filter((s) => {
      if (kategori !== 'hepsi' && s.kategori !== kategori) return false
      if (ucret !== 'hepsi' && s.ucret !== ucret) return false
      if (asama !== 'hepsi' && !s.asamalar.includes(asama)) return false
      if (!q) return true
      const havuz = [s.ad, s.ozet, s.anlatim, s.kullanim, ...s.etiketler]
        .join(' ')
        .toLocaleLowerCase('tr')
      return havuz.includes(q)
    })
  }, [arama, kategori, ucret, asama])

  const gruplu = useMemo(() => {
    const harita = new Map<Kategori, Site[]>()
    for (const s of sonuclar) {
      const liste = harita.get(s.kategori) ?? []
      liste.push(s)
      harita.set(s.kategori, liste)
    }
    return Array.from(harita.entries())
  }, [sonuclar])

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Arac Kitapligi</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#2c333d]">
          Mimarlik ogrencisinin proje sureci boyunca isine yarayan {SITELER.length} arac; ucret,
          icerik ve is akisi asamasina gore siniflandirildi. Her kartta aracin ne ise yaradigi ve
          projende TAM OLARAK NEREDE kullanilacagi yaziyor.
        </p>
      </header>

      <div className="mb-6 space-y-3 border border-[#cfc9bc] bg-white/50 p-4">
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Ara: doku, vaziyet, merdiven, render, DWG..."
          className="w-full border border-[#cfc9bc] bg-white px-3 py-2.5 text-sm outline-none focus:border-[#b4472a]"
        />
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="mono mb-1 block text-[10px] font-bold tracking-[0.14em] uppercase">
              Kategori
            </label>
            <select
              value={kategori}
              onChange={(e) => setKategori(e.target.value as Kategori | 'hepsi')}
              className="w-full border border-[#cfc9bc] bg-white px-2 py-2 text-sm outline-none focus:border-[#b4472a]"
            >
              <option value="hepsi">Hepsi</option>
              {kategoriler.map((k) => (
                <option key={k} value={k}>
                  {KATEGORI_ADI[k]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mono mb-1 block text-[10px] font-bold tracking-[0.14em] uppercase">
              Ucret
            </label>
            <select
              value={ucret}
              onChange={(e) => setUcret(e.target.value as Ucret | 'hepsi')}
              className="w-full border border-[#cfc9bc] bg-white px-2 py-2 text-sm outline-none focus:border-[#b4472a]"
            >
              <option value="hepsi">Hepsi</option>
              <option value="ucretsiz">Ucretsiz</option>
              <option value="freemium">Ucretsiz + Ucretli</option>
              <option value="ucretli">Ucretli</option>
            </select>
          </div>
          <div>
            <label className="mono mb-1 block text-[10px] font-bold tracking-[0.14em] uppercase">
              Proje asamasi
            </label>
            <select
              value={asama}
              onChange={(e) => setAsama(e.target.value as Asama | 'hepsi')}
              className="w-full border border-[#cfc9bc] bg-white px-2 py-2 text-sm outline-none focus:border-[#b4472a]"
            >
              <option value="hepsi">Hepsi</option>
              {(Object.keys(ASAMA_ADI) as Asama[]).map((a) => (
                <option key={a} value={a}>
                  {ASAMA_ADI[a]}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mono text-[11px] tracking-wider text-[#2c333d]/70">
          {sonuclar.length} ARAC LISTELENIYOR
        </div>
      </div>

      {gruplu.length === 0 && (
        <p className="border border-[#cfc9bc] bg-white/50 p-6 text-center text-sm text-[#2c333d]">
          Bu filtreyle eslesen arac yok.
        </p>
      )}

      <div className="space-y-8">
        {gruplu.map(([kat, liste]) => (
          <section key={kat}>
            <h2 className="mono border-b border-[#cfc9bc] pb-1.5 text-[12px] font-bold tracking-[0.14em] uppercase">
              {KATEGORI_ADI[kat]}{' '}
              <span className="text-[#2c333d]/50">/ {liste.length}</span>
            </h2>
            <p className="mt-1.5 mb-3 max-w-2xl text-[13px] text-[#2c333d]/80">
              {KATEGORI_ACIKLAMA[kat]}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {liste.map((s) => (
                <SiteKarti key={s.id} site={s} ac={setSecili} />
              ))}
            </div>
          </section>
        ))}
      </div>

      {secili && <Detay site={secili} kapat={() => setSecili(null)} />}
    </div>
  )
}
