import { useEffect, useState } from 'react'
import type { Saglayici } from './types'
import { aktifSaglayiciOku, anahtarlariOku } from './lib/storage'
import { saglayiciBul } from './lib/llm'
import { SITELER } from './data/sites'
import Katalog from './components/Katalog'
import Analiz from './components/Analiz'
import BilgiBankasi from './components/BilgiBankasi'
import Listeler from './components/Listeler'
import Kaynaklar from './components/Kaynaklar'
import AnahtarPaneli from './components/AnahtarPaneli'

type Sekme = 'analiz' | 'katalog' | 'bilgi' | 'liste' | 'kaynak'

const SEKMELER: { id: Sekme; ad: string; alt: string }[] = [
  { id: 'analiz', ad: 'Kritik Masasi', alt: 'Pafta ve maket analizi' },
  { id: 'katalog', ad: 'Arac Kitapligi', alt: `${SITELER.length} arac` },
  { id: 'bilgi', ad: 'Bilgi Bankasi', alt: 'Kavram, standart, olcu' },
  { id: 'liste', ad: 'Kontrol Listeleri', alt: 'Teslim oncesi' },
  { id: 'kaynak', ad: 'Kaynaklar', alt: 'Seffaflik' },
]

export default function App() {
  const [sekme, setSekme] = useState<Sekme>('analiz')
  const [saglayici, setSaglayici] = useState<Saglayici>('gemini')
  const [panelAcik, setPanelAcik] = useState(false)
  const [anahtarSurumu, setAnahtarSurumu] = useState(0)
  const [menuAcik, setMenuAcik] = useState(false)

  useEffect(() => {
    setSaglayici(aktifSaglayiciOku())
  }, [])

  const kayit = anahtarlariOku()[saglayici]
  const anahtarVar = Boolean(kayit?.anahtar)

  return (
    <div className="izgara-zemin min-h-full">
      <header className="sticky top-0 z-40 border-b border-[#cfc9bc] bg-[#f6f4ef]/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-3">
            <svg viewBox="0 0 100 100" className="h-8 w-8 shrink-0" aria-hidden="true">
              <rect width="100" height="100" fill="#14181f" />
              <path
                d="M20 75 L50 25 L80 75 M32 55 L68 55"
                stroke="#f6f4ef"
                strokeWidth="7"
                fill="none"
                strokeLinecap="square"
              />
            </svg>
            <div className="leading-tight">
              <div className="text-[17px] font-bold tracking-tight">ArchLib</div>
              <div className="mono hidden text-[10px] tracking-[0.16em] text-[#2c333d]/60 uppercase sm:block">
                Mimarlik arac kitapligi ve kritik sistemi
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setPanelAcik(true)}
              className={`mono hidden items-center gap-2 border px-3 py-2 text-[10px] tracking-[0.12em] uppercase transition sm:flex ${
                anahtarVar
                  ? 'border-[#1f6f4a]/45 text-[#1f6f4a] hover:bg-[#1f6f4a]/8'
                  : 'border-[#b4472a] bg-[#b4472a]/10 text-[#b4472a]'
              }`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${
                  anahtarVar ? 'bg-[#1f6f4a]' : 'bg-[#b4472a]'
                }`}
              />
              {anahtarVar ? saglayiciBul(saglayici).ad.split(' ')[0] : 'Anahtar gerekli'}
            </button>
            <button
              onClick={() => setMenuAcik((m) => !m)}
              className="mono border border-[#cfc9bc] px-3 py-2 text-[11px] tracking-[0.12em] uppercase lg:hidden"
            >
              Menu
            </button>
          </div>
        </div>

        <nav
          className={`border-t border-[#cfc9bc] ${menuAcik ? 'block' : 'hidden'} lg:block`}
        >
          <div className="mx-auto flex max-w-[1400px] flex-col px-5 lg:flex-row lg:gap-1">
            {SEKMELER.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSekme(s.id)
                  setMenuAcik(false)
                }}
                className={`border-b-2 px-3 py-2.5 text-left transition lg:border-b-2 ${
                  sekme === s.id
                    ? 'border-[#b4472a] text-[#b4472a]'
                    : 'border-transparent hover:text-[#2c333d]'
                }`}
              >
                <span className="mono text-[11px] font-bold tracking-[0.12em] uppercase">
                  {s.ad}
                </span>
                <span className="mono ml-2 text-[10px] tracking-wider text-[#2c333d]/45">
                  {s.alt}
                </span>
              </button>
            ))}
            <button
              onClick={() => {
                setPanelAcik(true)
                setMenuAcik(false)
              }}
              className="border-b-2 border-transparent px-3 py-2.5 text-left sm:hidden"
            >
              <span className="mono text-[11px] font-bold tracking-[0.12em] uppercase">
                API Anahtari
              </span>
            </button>
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-[1400px] px-5 py-7">
        {sekme === 'analiz' && (
          <Analiz
            saglayici={saglayici}
            anahtarPaneliniAc={() => setPanelAcik(true)}
            anahtarSurumu={anahtarSurumu}
          />
        )}
        {sekme === 'katalog' && <Katalog />}
        {sekme === 'bilgi' && <BilgiBankasi />}
        {sekme === 'liste' && <Listeler />}
        {sekme === 'kaynak' && <Kaynaklar />}
      </main>

      <footer className="mt-10 border-t border-[#cfc9bc] bg-white/40">
        <div className="mx-auto max-w-[1400px] px-5 py-6">
          <p className="max-w-3xl text-[12.5px] leading-relaxed text-[#2c333d]/75">
            ArchLib sunucusuz calisir. API anahtarin ve verilerin yalnizca bu tarayicida saklanir.
            Bilgi tabani; I. Hulusi Gungor <em>Temel Tasar</em>, Ernst Neufert{' '}
            <em>Yapi Tasarim Bilgisi</em>, MIM 153 Yapi Bilgisi ve MIM 244 Yapi Elemanlari Tasarimi
            ders notlari basta olmak uzere 16 kaynaktan cikarilmistir. Yapay zeka kritigi bir on
            degerlendirmedir; danismanin ve jurinin yerine gecmez.
          </p>
        </div>
      </footer>

      <AnahtarPaneli
        acik={panelAcik}
        kapat={() => setPanelAcik(false)}
        aktif={saglayici}
        aktifDegisti={setSaglayici}
        guncellendi={() => setAnahtarSurumu((v) => v + 1)}
      />
    </div>
  )
}
