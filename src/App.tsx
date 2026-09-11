import { lazy, Suspense, useEffect, useState, type ReactNode } from 'react'
import type { Saglayici } from './types'
import { aktifSaglayiciOku, anahtarlariOku } from './lib/storage'
import { saglayiciBul } from './lib/llm'
import { useTema } from './lib/tema'
import { BOLUMLER, bolumBul, type Sekme } from './ui/bolumler'
import {
  IkonKritik,
  IkonCizim,
  IkonArazi,
  IkonForum,
  IkonKitaplik,
  IkonBilgi,
  IkonListe,
  IkonKaynak,
  IkonAnahtar,
  IkonOk,
  IkonGunes,
  IkonAy,
} from './ui/Ikonlar'
import Katalog from './components/Katalog'
import Analiz from './components/Analiz'
import BilgiBankasi from './components/BilgiBankasi'
import Listeler from './components/Listeler'
import Kaynaklar from './components/Kaynaklar'
import AnahtarPaneli from './components/AnahtarPaneli'

const Intro = lazy(() => import('./intro/Intro'))
const Arazi = lazy(() => import('./components/Arazi'))
const Cizim = lazy(() => import('./cizim/Cizim'))
// Firebase (auth + forum) yalnizca bu sekmeye girildiginde indirilsin diye
// tembel yukleniyor; boylece forumu hic kullanmayan ziyaretciler onu indirmez.
const Forum = lazy(() => import('./components/Forum'))

const INTRO_ANAHTARI = 'archlib.intro.v1'

const IKONLAR: Record<Sekme, (p: { className?: string }) => ReactNode> = {
  analiz: IkonKritik,
  cizim: IkonCizim,
  arazi: IkonArazi,
  forum: IkonForum,
  katalog: IkonKitaplik,
  bilgi: IkonBilgi,
  liste: IkonListe,
  kaynak: IkonKaynak,
}

export default function App() {
  const [sekme, setSekme] = useState<Sekme>('analiz')
  const [saglayici, setSaglayici] = useState<Saglayici>('gemini')
  const [panelAcik, setPanelAcik] = useState(false)
  const [anahtarSurumu, setAnahtarSurumu] = useState(0)
  const [menuAcik, setMenuAcik] = useState(false)
  const { tema, degistir: temaDegistir } = useTema()
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

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setMenuAcik(false)
  }, [sekme])

  function introyuGec() {
    try {
      sessionStorage.setItem(INTRO_ANAHTARI, 'gecildi')
    } catch {
      /* depolama kapalı olabilir */
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
    <div className="animasyon-acilis flex min-h-full">
      {/* ================================================== kenar çubuğu */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[248px] flex-col border-r border-cizgi bg-yan transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
          menuAcik ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="px-5 pt-7 pb-5">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-[4px] border-[1.5px] border-murekkep bg-kiremit shadow-[var(--t-golge-kucuk)]">
                <svg viewBox="0 0 24 24" className="h-[19px] w-[19px]" aria-hidden="true">
                  <path
                    d="M4 20V10.5L12 4l8 6.5V20"
                    fill="none"
                    stroke="#fffefa"
                    strokeWidth="1.6"
                    strokeLinejoin="round"
                  />
                  <path d="M9.5 20v-5.5h5V20" fill="none" stroke="#fffefa" strokeWidth="1.6" />
                </svg>
              </span>
              <span className="font-baslik text-[21px] font-semibold tracking-[-0.03em] text-murekkep">
                ArchLib<span className="text-kiremit">.</span>
              </span>
            </div>
            <button
              onClick={temaDegistir}
              aria-label={tema === 'koyu' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              title={tema === 'koyu' ? 'Açık temaya geç' : 'Koyu temaya geç'}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[4px] border-[1.5px] border-murekkep bg-kart text-murekkep-2 transition-colors hover:text-murekkep"
            >
              {tema === 'koyu' ? <IkonAy /> : <IkonGunes />}
            </button>
          </div>
          <p className="etiket-buyuk mt-3 leading-relaxed">Mimarlığın dijital kütüphanesi</p>
          <div className="mt-4 flex h-[4px] overflow-hidden rounded-[2px]">
            {BOLUMLER.filter((b) => b.id !== 'kaynak').map((b) => (
              <span key={b.id} className={`h-full flex-1 ${b.dolgu}`} />
            ))}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          <ul className="space-y-1">
            {BOLUMLER.map((b) => {
              const Ikon = IKONLAR[b.id]
              const secili = b.id === sekme
              return (
                <li key={b.id}>
                  <button
                    onClick={() => setSekme(b.id)}
                    className={`group flex w-full items-center gap-3 rounded-[3px] border-[1.5px] px-3 py-2.5 text-left transition-all duration-150 ${
                      secili
                        ? `${b.kenar} ${b.zemin} ${b.metin} shadow-[var(--t-golge-kucuk)]`
                        : 'border-transparent text-murekkep-2 hover:bg-kagit-2 hover:text-murekkep'
                    }`}
                  >
                    <Ikon className={`h-[18px] w-[18px] shrink-0 ${secili ? '' : 'opacity-70'}`} />
                    <span className={`flex-1 text-[15px] ${secili ? 'font-semibold' : 'font-medium'}`}>
                      {b.ad}
                    </span>
                    {secili && <span className={`h-2 w-2 shrink-0 ${b.dolgu}`} />}
                  </button>
                </li>
              )
            })}
          </ul>

          <div className="mt-7 px-3">
            <div className="etiket-buyuk mb-2.5">Bölüm</div>
            <p className="text-[13.5px] leading-relaxed text-murekkep-3">{aktif.alt}</p>
          </div>
        </nav>

        <div className="p-3">
          <div className="rounded-[4px] border-[1.5px] border-murekkep bg-kart p-4 shadow-[var(--t-golge-sm)]">
            <div className="flex items-center gap-2">
              <IkonAnahtar className="h-[15px] w-[15px] text-murekkep-3" />
              <span className="text-[14px] font-medium text-murekkep">API anahtarı</span>
            </div>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-murekkep-3">
              {anahtarVar
                ? `${saglayiciBul(saglayici).ad.split(' ')[0]} bağlı. Tokeni kendi hesabın harcıyor.`
                : 'Kritik almak için kendi anahtarını gir. Tarayıcıdan çıkmaz.'}
            </p>
            <button
              onClick={() => setPanelAcik(true)}
              className="mt-3 flex items-center gap-1.5 text-[13px] font-semibold text-kiremit-koyu transition-colors hover:text-kiremit"
            >
              {anahtarVar ? 'Değiştir' : 'Anahtar gir'}
              <IkonOk className="h-[13px] w-[13px]" />
            </button>
          </div>
        </div>
      </aside>

      {menuAcik && (
        <button
          onClick={() => setMenuAcik(false)}
          aria-label="Menüyü kapat"
          className="fixed inset-0 z-40 bg-murekkep/25 lg:hidden"
        />
      )}

      {/* ======================================================== içerik */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-cizgi bg-kagit/90 backdrop-blur-[6px]">
          <div className="flex items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMenuAcik(true)}
                aria-label="Bölümler"
                className="rounded-[4px] border-[1.5px] border-murekkep p-2 text-murekkep-2 lg:hidden"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </button>
              <span className="etiket">Kütüphane</span>
              <span className="text-murekkep-3">/</span>
              <span className="text-[14px] font-medium text-murekkep">{aktif.ad}</span>
            </div>

            <button
              onClick={() => setPanelAcik(true)}
              className="flex items-center gap-2 rounded-[4px] border-[1.5px] border-murekkep bg-kart px-3 py-2 text-[13.5px] font-medium text-murekkep-2 shadow-[var(--t-golge-kucuk)] transition-colors hover:text-murekkep"
            >
              <span className={`h-2 w-2 ${anahtarVar ? 'bg-adacayi' : 'bg-kiremit'}`} />
              {anahtarVar ? saglayiciBul(saglayici).ad.split(' ')[0] : 'Anahtar yok'}
            </button>
          </div>
        </header>

        {/* Cizim modulu tam genislikte calisir: tuval kenar boslugu istemez. */}
        {sekme === 'cizim' ? (
          <main className="flex-1">
            <Suspense
              fallback={<div className="etiket py-24 text-center">Çizim stüdyosu yükleniyor</div>}
            >
              <Cizim saglayici={saglayici} anahtarPaneliniAc={() => setPanelAcik(true)} />
            </Suspense>
          </main>
        ) : (
          <>
        <main className="flex-1 px-5 py-8 sm:px-8 sm:py-10">
          <div key={sekme} className="animasyon-sayfa mx-auto max-w-[1180px]">
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
                  <div className="etiket py-24 text-center">Arazi aracı yükleniyor</div>
                }
              >
                <Arazi />
              </Suspense>
            )}
            {sekme === 'forum' && (
              <Suspense fallback={<div className="etiket py-24 text-center">Forum yükleniyor</div>}>
                <Forum />
              </Suspense>
            )}
            {sekme === 'katalog' && <Katalog />}
            {sekme === 'bilgi' && <BilgiBankasi />}
            {sekme === 'liste' && <Listeler />}
            {sekme === 'kaynak' && <Kaynaklar />}
          </div>
        </main>

        <footer className="border-t border-cizgi px-5 py-7 sm:px-8">
          <div className="mx-auto flex max-w-[1180px] flex-wrap items-end justify-between gap-6">
            <p className="max-w-2xl text-[13px] leading-relaxed text-murekkep-3">
              Kritik masası, çizim, arazi ve kitaplık sunucusuz çalışır; anahtarın ve verilerin
              yalnızca bu tarayıcıda saklanır. Forum ise anonim bir hesap ve ortak bir veritabanı
              kullanır. Bilgi tabanı{' '}
              <span className="text-murekkep-2">Temel Tasar</span> (İ. Hulûsi Güngör),{' '}
              <span className="text-murekkep-2">Yapı Tasarım Bilgisi</span> (Neufert), MİM 153 ve
              MİM 244 ders notları başta olmak üzere 16 kaynaktan çıkarılmıştır. Yapay zekâ kritiği
              ön değerlendirmedir; danışmanın ve jürinin yerine geçmez.
            </p>
            <div className="flex w-[170px] overflow-hidden rounded-full">
              {BOLUMLER.filter((b) => b.id !== 'kaynak').map((b) => (
                <span key={b.id} className={`h-[3px] flex-1 ${b.dolgu}`} />
              ))}
            </div>
          </div>
        </footer>
          </>
        )}
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
