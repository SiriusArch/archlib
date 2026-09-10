import { useMemo, useState } from 'react'
import type { Asama, Kategori, Site, Ucret } from '../types'
import { SITELER, KATEGORI_ADI, KATEGORI_ACIKLAMA, UCRET_ADI, ASAMA_ADI } from '../data/sites'
import { SayfaBasligi, Rozet, Kart } from '../ui/Parcalar'
import { Portal } from '../ui/Portal'
import { bolumBul } from '../ui/bolumler'

const UCRET_SINIF: Record<Ucret, string> = {
  ucretsiz: 'border-adacayi/45 text-adacayi-koyu',
  freemium: 'border-kehribar/50 text-kehribar-koyu',
  ucretli: 'border-murekkep-3/40 text-murekkep-2',
}

function SiteKarti({ site, ac }: { site: Site; ac: (s: Site) => void }) {
  return (
    <Kart onClick={() => ac(site)} vurgu="bg-turkuaz" className="flex h-full flex-col p-5">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <h3 className="text-[18px] leading-tight text-murekkep transition-colors duration-300 group-hover:text-turkuaz-koyu">
          {site.ad}
        </h3>
        <Rozet className={`${UCRET_SINIF[site.ucret]} shrink-0`}>{UCRET_ADI[site.ucret]}</Rozet>
      </div>
      <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-murekkep-2">{site.ozet}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {site.asamalar.slice(0, 2).map((a) => (
          <span key={a} className="etiket text-murekkep-3">
            {ASAMA_ADI[a].split(' ')[0]}
          </span>
        ))}
        {site.turkce && <span className="etiket text-turkuaz-koyu">TR</span>}
        {site.dogrulama === 'dogrulanmadi' && (
          <span className="etiket text-kiremit-koyu">doğrulanmadı</span>
        )}
      </div>
    </Kart>
  )
}

function Detay({ site, kapat }: { site: Site; kapat: () => void }) {
  return (
    <Portal>
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-murekkep/45 p-4 backdrop-blur-[3px]"
      onClick={kapat}
    >
      <div
        className="animasyon-sayfa my-6 max-h-[calc(100vh-3rem)] w-full max-w-2xl overflow-y-auto rounded-[10px] border border-cizgi bg-kart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-cizgi px-7 py-5">
          <div>
            <div className="etiket text-turkuaz-koyu">{KATEGORI_ADI[site.kategori]}</div>
            <h2 className="mt-1.5 text-[27px] leading-tight text-murekkep">{site.ad}</h2>
          </div>
          <button
            onClick={kapat}
            className="etiket shrink-0 pt-1 text-murekkep-3 transition-colors hover:text-kiremit"
            aria-label="Kapat"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="flex flex-wrap gap-2">
            <Rozet className={UCRET_SINIF[site.ucret]}>{UCRET_ADI[site.ucret]}</Rozet>
            {site.asamalar.map((a) => (
              <Rozet key={a} className="border-cizgi-2 text-murekkep-2">
                {ASAMA_ADI[a]}
              </Rozet>
            ))}
          </div>

          <section>
            <h3 className="etiket mb-2 text-murekkep-3">Ne işe yarar</h3>
            <p className="text-[16px] leading-relaxed text-murekkep-2">{site.anlatim}</p>
          </section>

          <section>
            <h3 className="etiket mb-2 text-murekkep-3">Projende nerede kullanırsın</h3>
            <p className="border-l-2 border-turkuaz pl-4 text-[16px] leading-relaxed text-murekkep-2">
              {site.kullanim}
            </p>
          </section>

          {site.fiyatNotu && (
            <section>
              <h3 className="etiket mb-2 text-murekkep-3">Fiyat</h3>
              <p className="text-[16px] text-murekkep-2">{site.fiyatNotu}</p>
            </section>
          )}

          {site.uyari && (
            <section className="rounded-[7px] bg-kiremit-soft px-4 py-3">
              <h3 className="etiket mb-1.5 text-kiremit-koyu">Dikkat</h3>
              <p className="text-[15.5px] leading-relaxed text-murekkep-2">{site.uyari}</p>
            </section>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {site.etiketler.map((e) => (
              <span key={e} className="etiket text-murekkep-3">
                {e}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cizgi pt-5">
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-[6px] bg-turkuaz px-5 py-2.5 text-[14.5px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Siteye git
            </a>
            <span className="etiket text-murekkep-3">
              {site.dogrulama === 'dogrulandi'
                ? 'Siteden doğrulandı'
                : site.dogrulama === 'kismi'
                  ? 'Kısmen doğrulandı'
                  : 'Doğrulanamadı'}
            </span>
          </div>
        </div>
      </div>
    </div>
    </Portal>
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
      return [s.ad, s.ozet, s.anlatim, s.kullanim, ...s.etiketler]
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(q)
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
    <div className="kademe">
      <SayfaBasligi
        etiket="Kitaplık"
        renk={bolumBul('katalog').metin}
        baslik="Öğrencinin işine yarayan 48 araç"
        aciklama="Ücret, içerik ve proje aşamasına göre sınıflandırıldı. Her kartta aracın ne işe yaradığı ve projende tam olarak nerede kullanılacağı yazıyor."
        sag={
          <div className="sayi text-right text-[14.5px] text-murekkep-3">
            <div className="text-[29.5px] leading-none text-murekkep">{sonuclar.length}</div>
            <div className="etiket mt-1">listeleniyor</div>
          </div>
        }
      />

      <section className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-1">
          <label className="etiket mb-1.5 block text-murekkep-3">Ara</label>
          <input
            value={arama}
            onChange={(e) => setArama(e.target.value)}
            placeholder="doku, vaziyet, DWG..."
            className="alan"
          />
        </div>
        <div>
          <label className="etiket mb-1.5 block text-murekkep-3">Kategori</label>
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value as Kategori | 'hepsi')}
            className="alan"
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
          <label className="etiket mb-1.5 block text-murekkep-3">Ücret</label>
          <select
            value={ucret}
            onChange={(e) => setUcret(e.target.value as Ucret | 'hepsi')}
            className="alan"
          >
            <option value="hepsi">Hepsi</option>
            <option value="ucretsiz">Ücretsiz</option>
            <option value="freemium">Ücretsiz + Ücretli</option>
            <option value="ucretli">Ücretli</option>
          </select>
        </div>
        <div>
          <label className="etiket mb-1.5 block text-murekkep-3">Proje aşaması</label>
          <select
            value={asama}
            onChange={(e) => setAsama(e.target.value as Asama | 'hepsi')}
            className="alan"
          >
            <option value="hepsi">Hepsi</option>
            {(Object.keys(ASAMA_ADI) as Asama[]).map((a) => (
              <option key={a} value={a}>
                {ASAMA_ADI[a]}
              </option>
            ))}
          </select>
        </div>
      </section>

      {gruplu.length === 0 && (
        <p className="border-t border-cizgi py-16 text-center text-[16px] text-murekkep-3">
          Bu filtreyle eşleşen araç yok.
        </p>
      )}

      <div className="space-y-14">
        {gruplu.map(([kat, liste]) => (
          <section key={kat}>
            <div className="mb-1.5 flex items-baseline justify-between gap-6">
              <h2 className="text-[21px] leading-tight text-murekkep">{KATEGORI_ADI[kat]}</h2>
              <span className="sayi text-[13px] text-murekkep-3">{liste.length} araç</span>
            </div>
            <p className="mb-5 max-w-2xl text-[15px] leading-relaxed text-murekkep-2">
              {KATEGORI_ACIKLAMA[kat]}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
