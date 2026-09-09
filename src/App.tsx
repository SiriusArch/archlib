import { lazy, Suspense, useEffect, useState } from 'react'
import type { Saglayici } from './types'
import { aktifSaglayiciOku, anahtarlariOku } from './lib/storage'
import { saglayiciBul } from './lib/llm'
import { BOLUMLER, bolumBul, type Sekme } from './ui/bolumler'
import Katalog from './components/Katalog'
import Analiz from './components/Analiz'
import BilgiBankasi from './components/BilgiBankasi'
import Listeler from './components/Listeler'
import Kaynaklar from './components/Kaynaklar'
import AnahtarPaneli from './components/AnahtarPaneli'

// Intro tum WebGPU yigini cekiyor; Arazi harita ve cografi veri kodunu.
// Ikisi de tembel yuklenirse ana paket ince kaliyor.
const Intro = lazy(() => import('./intro/Intro'))
const Arazi = lazy(() => import('./components/Arazi'))

const INTRO_ANAHTARI = 'archlib.intro.v1'

export default function App() {
  const [sekme, setSekme] = useState<Sekme>('analiz')
  const [saglayici, setSaglayici] = useState<Saglayici>('gemini')
  const [panelAcik, setPanelAcik] = useState(false)
  const [anahtarSurumu, setAnahtarSurumu] = useState(0)
  const [menuAcik, setMenuAcik] = useState(false)
  const [introBitti, setIntroBitti] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(INTRO_ANAHTARI) === 'gecildi'
    } catch {
      return false
    }
  })

  useEffect(() => {
    setSaglayici(aktifSaglayiciOku())
  }, [])

  // Sekme degisince yukari don — uzun sayfalarda ortada kalmayi onler.
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [sekme])

  function introyuGec() {
    try {
      sessionStorage.setItem(INTRO_ANAHTARI, 'gecildi')
    } catch {
      /* depolama kapali olabilir */
    }
    setIntroBitti(true)
  }

  const kayit = anahtarlariOku()[saglayici]
  const anahtarVar = Boolean(kayit?.anahtar)
  const aktif = bolumBul(sekme)

  if (!introBitti) {
    return (
      <Suspense fallback={<div className="fixed inset-0 z-[60] bg-[#0d0f13]" />}>
        <Intro gir={introyuGec} />
      </Suspense>
    )
  }

  return (
    <div className="kagit-doku relative min-h-full">
      <div className="animasyon-acilis relative z-[1]">
        {/* ---------------------------------------------------------- kunye */}
        <header className="sticky top-0 z-40 border-b border-cizgi bg-kagit/92 backdrop-blur-[6px]">
          <div className="mx-auto max-w-[1320px] px-5 sm:px-8">
            <div className="flex items-center justify-between gap-6 py-4">
              <div className="flex items-baseline gap-3">
                <span className="font-baslik text-[22px] leading-none tracking-[-0.015em] text-murekkep">
                  ArchLib
                </span>
                <span className="hidden h-3 w-px bg-cizgi-2 sm:block" />
                <span className="etiket hidden text-murekkep-3 sm:block">
                  Mimarlik Kitapligi
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPanelAcik(true)}
                  className="etiket hidden items-center gap-2 border border-cizgi px-3 py-2 text-murekkep-2 transition-colors duration-300 hover:border-murekkep hover:text-murekkep sm:flex"
                >
                  <span
                    className={`inline-block h-[5px] w-[5px] rounded-full ${
                      anahtarVar ? 'bg-adacayi' : 'bg-kiremit'
                    }`}
                  />
                  {anahtarVar ? saglayiciBul(saglayici).ad.split(' ')[0] : 'Anahtar yok'}
                </button>
                <button
                  onClick={() => setMenuAcik((m) => !m)}
                  className="etiket border border-cizgi px-3 py-2 text-murekkep-2 lg:hidden"
                >
                  {menuAcik ? 'Kapat' : 'Bolumler'}
                </button>
              </div>
            </div>

            {/* ------------------------------------------------------- nav */}
            <nav className={`${menuAcik ? 'block' : 'hidden'} pb-1 lg:block`}>
              <ul className="flex flex-col lg:flex-row lg:gap-8">
                {BOLUMLER.map((b) => {
                  const secili = b.id === sekme
                  return (
                    <li key={b.id} className="lg:py-0">
                      <button
                        onClick={() => {
                          setSekme(b.id)
                          setMenuAcik(false)
                        }}
                        className="group relative block w-full py-2.5 text-left lg:w-auto lg:py-3"
                      >
                        <span className="flex items-baseline gap-2">
                          <span
                            className={`sayi text-[10px] transition-colors duration-300 ${
                              secili ? b.metin : 'text-murekkep-3/60'
                            }`}
                          >
                            {b.no}
                          </span>
                          <span
                            className={`font-baslik text-[15px] leading-none transition-colors duration-300 ${
                              secili ? 'text-murekkep' : 'text-murekkep-2 group-hover:text-murekkep'
                            }`}
                          >
                            {b.ad}
                          </span>
                          <span className="etiket ml-1 text-murekkep-3/70 lg:hidden">{b.alt}</span>
                        </span>
                        <span
                          className={`absolute -bottom-px left-0 h-[2px] w-full origin-left transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                            b.dolgu
                          } ${secili ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'}`}
                        />
                      </button>
                    </li>
                  )
                })}
                <li className="sm:hidden">
                  <button
                    onClick={() => {
                      setPanelAcik(true)
                      setMenuAcik(false)
                    }}
                    className="etiket block w-full py-3 text-left text-murekkep-2"
                  >
                    API Anahtari
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </header>

        {/* --------------------------------------------------------- icerik */}
        <main className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8 sm:py-14">
          {/* key: sekme degisince animasyon bastan oynasin */}
          <div key={sekme} className="animasyon-sayfa">
            {sekme === 'analiz' && (
              <Analiz
                saglayici={saglayici}
                anahtarPaneliniAc={() => setPanelAcik(true)}
                anahtarSurumu={anahtarSurumu}
              />
            )}
            {sekme === 'arazi' && (
              <Suspense
                fallback={
                  <div className="etiket py-24 text-center text-murekkep-3">
                    Arazi araci yukleniyor
                  </div>
                }
              >
                <Arazi />
              </Suspense>
            )}
            {sekme === 'katalog' && <Katalog />}
            {sekme === 'bilgi' && <BilgiBankasi />}
            {sekme === 'liste' && <Listeler />}
            {sekme === 'kaynak' && <Kaynaklar />}
          </div>
        </main>

        {/* --------------------------------------------------------- kolofon */}
        <footer className="mt-16 border-t border-cizgi">
          <div className="mx-auto max-w-[1320px] px-5 py-10 sm:px-8">
            <div className="grid gap-8 sm:grid-cols-[1fr_auto]">
              <div className="max-w-2xl">
                <div className="etiket text-murekkep-3">Kolofon</div>
                <p className="mt-3 text-[13px] leading-relaxed text-murekkep-2">
                  ArchLib sunucusuz calisir; API anahtarin ve verilerin yalnizca bu tarayicida
                  saklanir. Bilgi tabani{' '}
                  <span className="font-baslik italic">Temel Tasar</span> (I. Hulusi Gungor),{' '}
                  <span className="font-baslik italic">Yapi Tasarim Bilgisi</span> (Neufert), MIM 153
                  Yapi Bilgisi ve MIM 244 Yapi Elemanlari Tasarimi ders notlari basta olmak uzere
                  16 kaynaktan cikarilmistir. Yapay zeka kritigi bir on degerlendirmedir;
                  danismanin ve jurinin yerine gecmez.
                </p>
              </div>
              <div className="flex items-end">
                <div className="flex w-full min-w-[180px] sm:w-[180px]">
                  {BOLUMLER.filter((b) => b.renk !== 'murekkep').map((b) => (
                    <span key={b.id} className={`h-[3px] flex-1 ${b.dolgu}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

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
