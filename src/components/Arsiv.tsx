import { useMemo, useState } from 'react'
import type { ArsivFormat, ArsivKaynagi, ArsivTur, Ucret } from '../types'
import { ARSIV_KAYNAKLARI, ARSIV_TUR_ADI, ARSIV_FORMAT_ADI, ARSIV_UCRET_ADI } from '../data/arsiv'
import { SayfaBasligi, Rozet, Kart } from '../ui/Parcalar'
import { Portal } from '../ui/Portal'
import { bolumBul } from '../ui/bolumler'

const UCRET_SINIF: Record<Ucret, string> = {
  ucretsiz: 'border-adacayi/45 text-adacayi-koyu',
  freemium: 'border-kehribar/50 text-kehribar-koyu',
  ucretli: 'border-murekkep-3/40 text-murekkep-2',
}

const TURLER = Object.keys(ARSIV_TUR_ADI) as ArsivTur[]
const FORMATLAR = Object.keys(ARSIV_FORMAT_ADI) as ArsivFormat[]

function KaynakKarti({ kaynak, ac }: { kaynak: ArsivKaynagi; ac: (k: ArsivKaynagi) => void }) {
  return (
    <Kart onClick={() => ac(kaynak)} vurgu="bg-adacayi" className="flex h-full flex-col p-5">
      <div className="mb-2.5 flex items-start justify-between gap-3">
        <h3 className="text-[18px] leading-tight text-murekkep transition-colors duration-300 group-hover:text-adacayi-koyu">
          {kaynak.ad}
        </h3>
        <Rozet className={`${UCRET_SINIF[kaynak.ucret]} shrink-0`}>{ARSIV_UCRET_ADI[kaynak.ucret]}</Rozet>
      </div>
      <p className="mb-4 flex-1 text-[14.5px] leading-relaxed text-murekkep-2">{kaynak.ozet}</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {kaynak.formatlar.slice(0, 4).map((f) => (
          <span key={f} className="etiket text-murekkep-3">
            {ARSIV_FORMAT_ADI[f]}
          </span>
        ))}
        {kaynak.turkce && <span className="etiket text-adacayi-koyu">TR</span>}

        {kaynak.dogrulama === 'dogrulanmadi' && (
          <span className="etiket text-kiremit-koyu">doğrulanmadı</span>
        )}
      </div>
    </Kart>
  )
}

function Detay({ kaynak, kapat }: { kaynak: ArsivKaynagi; kapat: () => void }) {
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
            <div className="etiket text-adacayi-koyu">
              {kaynak.turler.map((t) => ARSIV_TUR_ADI[t]).join(' · ')}
            </div>
            <h2 className="mt-1.5 text-[27px] leading-tight text-murekkep">{kaynak.ad}</h2>
          </div>
          <button
            onClick={kapat}
            className="shrink-0 pt-1 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
            aria-label="Kapat"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <div className="flex flex-wrap gap-2">
            <Rozet className={UCRET_SINIF[kaynak.ucret]}>{ARSIV_UCRET_ADI[kaynak.ucret]}</Rozet>
            {kaynak.formatlar.map((f) => (
              <Rozet key={f} className="border-cizgi-2 text-murekkep-2">
                {ARSIV_FORMAT_ADI[f]}
              </Rozet>
            ))}
          </div>

          <section>
            <h3 className="etiket mb-2 text-murekkep-3">Ne sunuyor</h3>
            <p className="text-[16px] leading-relaxed text-murekkep-2">{kaynak.anlatim}</p>
          </section>

          <section>
            <h3 className="etiket mb-2 text-murekkep-3">Projende nerede kullanırsın</h3>
            <p className="border-l-2 border-adacayi pl-4 text-[16px] leading-relaxed text-murekkep-2">
              {kaynak.kullanim}
            </p>
          </section>

          {kaynak.fiyatNotu && (
            <section>
              <h3 className="etiket mb-2 text-murekkep-3">Fiyat</h3>
              <p className="text-[16px] text-murekkep-2">{kaynak.fiyatNotu}</p>
            </section>
          )}

          {kaynak.uyari && (
            <section className="rounded-[7px] bg-kiremit-soft px-4 py-3">
              <h3 className="etiket mb-1.5 text-kiremit-koyu">Dikkat</h3>
              <p className="text-[15.5px] leading-relaxed text-murekkep-2">{kaynak.uyari}</p>
            </section>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {kaynak.etiketler.map((e) => (
              <span key={e} className="etiket text-murekkep-3">
                {e}
              </span>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-cizgi pt-5">
            <a
              href={kaynak.url}
              target="_blank"
              rel="noreferrer noopener"
              className="rounded-[6px] bg-adacayi px-5 py-2.5 text-[14.5px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Kaynağa git
            </a>
            <span className="etiket text-murekkep-3">
              {kaynak.dogrulama === 'dogrulandi'
                ? 'Siteden doğrulandı'
                : kaynak.dogrulama === 'kismi'
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

export default function Arsiv() {
  const [arama, setArama] = useState('')
  const [tur, setTur] = useState<ArsivTur | 'hepsi'>('hepsi')
  const [format, setFormat] = useState<ArsivFormat | 'hepsi'>('hepsi')
  const [ucret, setUcret] = useState<Ucret | 'hepsi'>('hepsi')
  const [secili, setSecili] = useState<ArsivKaynagi | null>(null)

  const sonuclar = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr')
    return ARSIV_KAYNAKLARI.filter((k) => {
      if (tur !== 'hepsi' && !k.turler.includes(tur)) return false
      if (format !== 'hepsi' && !k.formatlar.includes(format)) return false
      if (ucret !== 'hepsi' && k.ucret !== ucret) return false
      if (!q) return true
      return [k.ad, k.ozet, k.anlatim, k.kullanim, ...k.etiketler]
        .join(' ')
        .toLocaleLowerCase('tr')
        .includes(q)
    })
  }, [arama, tur, format, ucret])

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="Arşiv"
        renk={bolumBul('arsiv').metin}
        baslik="Hazır AutoCAD ve SketchUp projeleri"
        aciklama="İndirilebilir gerçek proje dosyaları sunan dış kaynaklar — tipolojisine, formatına ve ücretine göre sınıflandırıldı. ArchLib dosya barındırmaz; her kart seni kaynağın kendi sitesine yönlendirir."
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
            placeholder="villa, rölöve, blok..."
            className="alan"
          />
        </div>
        <div>
          <label className="etiket mb-1.5 block text-murekkep-3">Proje türü</label>
          <select value={tur} onChange={(e) => setTur(e.target.value as ArsivTur | 'hepsi')} className="alan">
            <option value="hepsi">Hepsi</option>
            {TURLER.map((t) => (
              <option key={t} value={t}>
                {ARSIV_TUR_ADI[t]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiket mb-1.5 block text-murekkep-3">Format</label>
          <select
            value={format}
            onChange={(e) => setFormat(e.target.value as ArsivFormat | 'hepsi')}
            className="alan"
          >
            <option value="hepsi">Hepsi</option>
            {FORMATLAR.map((f) => (
              <option key={f} value={f}>
                {ARSIV_FORMAT_ADI[f]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="etiket mb-1.5 block text-murekkep-3">Ücret</label>
          <select value={ucret} onChange={(e) => setUcret(e.target.value as Ucret | 'hepsi')} className="alan">
            <option value="hepsi">Hepsi</option>
            <option value="ucretsiz">Ücretsiz</option>
            <option value="freemium">Ücretsiz + Ücretli</option>
            <option value="ucretli">Ücretli</option>
          </select>
        </div>
      </section>

      {sonuclar.length === 0 && (
        <p className="rounded-[8px] border border-dashed border-cizgi-2 py-16 text-center text-[15px] text-murekkep-3">
          Bu filtreyle eşleşen kaynak yok.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sonuclar.map((k) => (
          <KaynakKarti key={k.id} kaynak={k} ac={setSecili} />
        ))}
      </div>

      {secili && <Detay kaynak={secili} kapat={() => setSecili(null)} />}
    </div>
  )
}
