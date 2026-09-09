/**
 * Cizim modulunun kabugu: ust serit, kat/eleman agaci, tuval, arac cubugu,
 * ozellik paneli ve AI kritigi.
 */

import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Saglayici } from '../types'
import { analizCagir, saglayiciBul } from '../lib/llm'
import { sistemPromptu } from '../lib/prompt'
import { anahtarlariOku } from '../lib/storage'
import Markdown from '../components/Markdown'
import { Cip, Panel, PanelBasligi, Segment } from '../ui/Kontroller'
import Tuval2B, { type TuvalApi } from './Tuval2B'
import {
  ARACLAR,
  yeniProje,
  type Arac,
  type Duvar,
  type Kat,
  type Nokta,
  type Secim,
} from './tipler'
import { useCizimDeposu, projeListesi, projeOku, projeSil, type ProjeOzeti } from './depo'
import { odalariBul, duvarUzunluk } from './geometri'
import {
  DONATILAR,
  DONATI_GRUPLARI,
  KAPILAR,
  PENCERELER,
  donatiBul,
} from './katalog'
import {
  dosyaIndir,
  katOzeti,
  modelObj,
  planDxf,
  planMetni,
  planSvg,
  projeAyristir,
  projeJson,
} from './disaAktar'
import type { SahneTemasi } from './Sahne3B'

const Sahne3B = lazy(() => import('./Sahne3B'))

type Gorunum = '2b' | '3b' | 'bolunmus'

interface Props {
  saglayici: Saglayici
  anahtarPaneliniAc: () => void
}

export default function Cizim({ saglayici, anahtarPaneliniAc }: Props) {
  const depo = useCizimDeposu()
  const { durum, aktifKat, gonder, geriAl, ileriAl, geriVar, ileriVar } = depo

  const [arac, setArac] = useState<Arac>('duvar')
  const [gorunum, setGorunum] = useState<Gorunum>('2b')
  const [kapiKatalog, setKapiKatalog] = useState('kapi-90')
  const [pencereKatalog, setPencereKatalog] = useState('pen-120')
  const [donatiKatalog, setDonatiKatalog] = useState('kanepe-3')
  const [donatiGrup, setDonatiGrup] = useState(DONATI_GRUPLARI[0])
  const [izgaraGorunur, setIzgaraGorunur] = useState(true)
  const [altKatGorunur, setAltKatGorunur] = useState(true)
  const [odaEtiketi, setOdaEtiketi] = useState(true)
  const [tumKatlar, setTumKatlar] = useState(false)
  const [tema, setTema] = useState<SahneTemasi>('studyo')
  const [golge, setGolge] = useState(true)
  const [tavan, setTavan] = useState(false)
  const [gunesAcisi, setGunesAcisi] = useState(135)
  const [sigdirTetik, setSigdirTetik] = useState(0)
  const [projelerAcik, setProjelerAcik] = useState(false)
  const [projeler, setProjeler] = useState<ProjeOzeti[]>([])

  const [kritikAcik, setKritikAcik] = useState(false)
  const [kritik, setKritik] = useState('')
  const [kritikCalisiyor, setKritikCalisiyor] = useState(false)
  const [kritikHata, setKritikHata] = useState('')
  const kritikIptal = useRef<AbortController | null>(null)

  const tuvalApi = useRef<TuvalApi | null>(null)
  const dosyaGirisi = useRef<HTMLInputElement>(null)
  const altlikGirisi = useRef<HTMLInputElement>(null)

  const odalar = useMemo(() => odalariBul(aktifKat.duvarlar), [aktifKat.duvarlar])
  const ozet = useMemo(() => katOzeti(aktifKat), [aktifKat])
  const siraliKatlar = useMemo(
    () => [...durum.proje.katlar].sort((a, b) => b.kot - a.kot),
    [durum.proje.katlar],
  )
  const altKat = useMemo(() => {
    const altta = durum.proje.katlar
      .filter((k) => k.kot < aktifKat.kot)
      .sort((a, b) => b.kot - a.kot)
    return altta[0] ?? null
  }, [durum.proje.katlar, aktifKat.kot])

  // ------------------------------------------------------------- kisayollar
  useEffect(() => {
    function tus(e: KeyboardEvent) {
      const hedef = e.target as HTMLElement
      if (hedef && ['INPUT', 'TEXTAREA', 'SELECT'].includes(hedef.tagName)) return
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) ileriAl()
        else geriAl()
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault()
        ileriAl()
      }
    }
    window.addEventListener('keydown', tus)
    return () => window.removeEventListener('keydown', tus)
  }, [geriAl, ileriAl])

  // ---------------------------------------------------------------- kritik
  async function kritikAl() {
    const kayit = anahtarlariOku()[saglayici]
    if (!kayit?.anahtar) {
      anahtarPaneliniAc()
      return
    }
    setKritikAcik(true)
    setKritik('')
    setKritikHata('')
    setKritikCalisiyor(true)
    const kontrol = new AbortController()
    kritikIptal.current = kontrol

    let biriken = ''
    try {
      const gorsel = await planGorseli(aktifKat, durum.proje.ad)
      await analizCagir({
        saglayici,
        anahtar: kayit.anahtar,
        model: kayit.model || saglayiciBul(saglayici).varsayilanModel,
        sistem: sistemPromptu('plan'),
        kullanici: [
          'KRITIK TURU: Kat plani (ArchLib Cizim modulunde cizildi)',
          '',
          'Asagida planin sayisal dokumu var; ekli gorsel ayni planin cizimidir.',
          '',
          planMetni(durum.proje, aktifKat),
          '',
          'Bu plani Neufert olculeri, TS cizim standartlari ve Temel Tasar ilkeleri',
          'uzerinden degerlendir. Olcu hatalarini, sirkulasyon ve islev sorunlarini',
          'somut sayilarla soyle.',
        ].join('\n'),
        gorseller: gorsel ? [gorsel] : [],
        signal: kontrol.signal,
        onParca: (p) => {
          biriken += p
          setKritik(biriken)
        },
      })
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') setKritikHata('Istek iptal edildi.')
      else setKritikHata((e as Error)?.message || 'Bilinmeyen hata.')
    } finally {
      setKritikCalisiyor(false)
      kritikIptal.current = null
    }
  }

  // ------------------------------------------------------------ disa aktar
  const damga = `${durum.proje.ad.replace(/\s+/g, '_').toLowerCase()}_${aktifKat.ad.replace(/\s+/g, '_').toLowerCase()}`

  function altlikYukle(dosya: File) {
    const okuyucu = new FileReader()
    okuyucu.onload = () => {
      const veri = String(okuyucu.result || '')
      const img = new Image()
      img.onload = () => {
        gonder({
          t: 'altlik',
          altlik: {
            veri,
            olcek: 0.02,
            konum: { x: -((img.naturalWidth * 0.02) / 2), y: (img.naturalHeight * 0.02) / 2 },
            saydamlik: 0.45,
            kilit: false,
            genislikPx: img.naturalWidth,
            yukseklikPx: img.naturalHeight,
          },
        })
      }
      img.src = veri
    }
    okuyucu.readAsDataURL(dosya)
  }

  const secili = durum.secim[0] ?? null

  return (
    <div className="flex h-[calc(100vh-58px)] min-h-[560px] flex-col bg-kagit">
      {/* ================================================== ust serit */}
      <div className="flex flex-wrap items-center gap-2 border-b border-cizgi bg-kart px-3 py-2">
        <input
          value={durum.proje.ad}
          onChange={(e) => gonder({ t: 'proje-ad', ad: e.target.value })}
          className="w-[168px] rounded-[6px] border border-transparent bg-transparent px-2 py-1.5 text-[14.5px] font-medium text-murekkep outline-none transition-colors hover:border-cizgi focus:border-cizgi-2"
        />

        <button
          onClick={() => {
            setProjeler(projeListesi())
            setProjelerAcik((v) => !v)
          }}
          className="rounded-[6px] border border-cizgi px-2.5 py-1.5 text-[13px] font-medium text-murekkep-2 transition-colors hover:border-cizgi-2 hover:text-murekkep"
        >
          Projeler
        </button>

        <Ayirac />

        <IkonDugme ipucu="Geri al (Ctrl+Z)" pasif={!geriVar} onClick={geriAl}>
          <path d="M4 9h9a4 4 0 010 8h-4" />
          <path d="M7 5L3 9l4 4" />
        </IkonDugme>
        <IkonDugme ipucu="Ileri al (Ctrl+Shift+Z)" pasif={!ileriVar} onClick={ileriAl}>
          <path d="M20 9h-9a4 4 0 000 8h4" />
          <path d="M17 5l4 4-4 4" />
        </IkonDugme>

        <Ayirac />

        <Segment
          secenekler={[
            { deger: '2b', ad: '2B' },
            { deger: '3b', ad: '3B' },
            { deger: 'bolunmus', ad: 'Bolunmus' },
          ]}
          secili={gorunum}
          degistir={(g) => setGorunum(g as Gorunum)}
          className="w-[230px]"
        />

        <Ayirac />

        <Anahtar acik={izgaraGorunur} degistir={setIzgaraGorunur} ad="Izgara" />
        <Anahtar acik={odaEtiketi} degistir={setOdaEtiketi} ad="Alan" />
        <Anahtar acik={altKatGorunur} degistir={setAltKatGorunur} ad="Alt kat izi" />
        {gorunum !== '2b' && (
          <>
            <Anahtar acik={tumKatlar} degistir={setTumKatlar} ad="Tum katlar" />
            <Anahtar acik={golge} degistir={setGolge} ad="Golge" />
            <Anahtar acik={tavan} degistir={setTavan} ad="Tavan" />
          </>
        )}

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => {
              tuvalApi.current?.sigdir()
              setSigdirTetik((v) => v + 1)
            }}
            className="rounded-[6px] border border-cizgi px-2.5 py-1.5 text-[13px] font-medium text-murekkep-2 transition-colors hover:border-cizgi-2 hover:text-murekkep"
          >
            Sigdir
          </button>
          <button
            onClick={() => void kritikAl()}
            className="rounded-[6px] bg-kiremit px-3.5 py-1.5 text-[13.5px] font-medium text-white transition-opacity hover:opacity-90"
          >
            Plani kritige gonder
          </button>
        </div>
      </div>

      {projelerAcik && (
        <ProjePaneli
          projeler={projeler}
          aktifId={durum.proje.id}
          kapat={() => setProjelerAcik(false)}
          yeni={() => {
            gonder({ t: 'proje-yukle', proje: yeniProje('Adsiz plan') })
            setProjelerAcik(false)
          }}
          ac={(id) => {
            const p = projeOku(id)
            if (p) gonder({ t: 'proje-yukle', proje: p })
            setProjelerAcik(false)
          }}
          sil={(id) => {
            projeSil(id)
            setProjeler(projeListesi())
          }}
          iceAktar={() => dosyaGirisi.current?.click()}
          disaAktar={() =>
            dosyaIndir(projeJson(durum.proje), `${damga}.archlib.json`, 'application/json')
          }
        />
      )}

      <input
        ref={dosyaGirisi}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={(e) => {
          const d = e.target.files?.[0]
          if (!d) return
          d.text().then((metin) => {
            const p = projeAyristir(metin)
            if (p) gonder({ t: 'proje-yukle', proje: p })
          })
          e.target.value = ''
        }}
      />
      <input
        ref={altlikGirisi}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const d = e.target.files?.[0]
          if (d) altlikYukle(d)
          e.target.value = ''
        }}
      />

      {/* ==================================================== ana govde */}
      <div className="flex min-h-0 flex-1">
        {/* ------------------------------------------------- sol panel */}
        <aside className="hidden w-[228px] shrink-0 flex-col overflow-y-auto border-r border-cizgi bg-yan lg:flex">
          <div className="border-b border-cizgi px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="etiket">Katlar</span>
              <span className="flex gap-1">
                <MiniDugme onClick={() => gonder({ t: 'kat-ekle', yon: 'ust' })} ipucu="Ust kat ekle">
                  +
                </MiniDugme>
                <MiniDugme onClick={() => gonder({ t: 'kat-ekle', yon: 'alt' })} ipucu="Alt kat ekle">
                  −
                </MiniDugme>
              </span>
            </div>
          </div>
          <ul className="border-b border-cizgi">
            {siraliKatlar.map((k) => (
              <li key={k.id}>
                <div
                  className={`flex items-center gap-2 border-b border-cizgi/60 px-3 py-2 transition-colors ${
                    k.id === aktifKat.id ? 'bg-kiremit-soft' : 'hover:bg-kagit-2'
                  }`}
                >
                  <button
                    onClick={() => gonder({ t: 'kat-sec', id: k.id })}
                    className="min-w-0 flex-1 text-left"
                  >
                    <span
                      className={`block truncate text-[14px] font-medium ${
                        k.id === aktifKat.id ? 'text-kiremit-koyu' : 'text-murekkep-2'
                      }`}
                    >
                      {k.ad}
                    </span>
                    <span className="sayi text-[11.5px] text-murekkep-3">
                      +{k.kot.toFixed(2)} m · {k.duvarlar.length} duvar
                    </span>
                  </button>
                  <MiniDugme onClick={() => gonder({ t: 'kat-kopyala', id: k.id })} ipucu="Kopyala">
                    ⧉
                  </MiniDugme>
                  {durum.proje.katlar.length > 1 && (
                    <MiniDugme onClick={() => gonder({ t: 'kat-sil', id: k.id })} ipucu="Sil">
                      ×
                    </MiniDugme>
                  )}
                </div>
              </li>
            ))}
          </ul>

          <div className="px-4 py-3">
            <div className="etiket mb-2">Kat ayari</div>
            <SayiAlani
              ad="Kat yuksekligi"
              deger={aktifKat.yukseklik}
              adim={0.05}
              birim="m"
              degistir={(v) => gonder({ t: 'kat-yama', id: aktifKat.id, yama: { yukseklik: v } })}
            />
            <SayiAlani
              ad="Doseme kotu"
              deger={aktifKat.kot}
              adim={0.05}
              birim="m"
              degistir={(v) => gonder({ t: 'kat-yama', id: aktifKat.id, yama: { kot: v } })}
            />
            <input
              value={aktifKat.ad}
              onChange={(e) => gonder({ t: 'kat-yama', id: aktifKat.id, yama: { ad: e.target.value } })}
              className="alan mt-2 text-[13.5px]"
            />
          </div>

          <div className="border-t border-cizgi px-4 py-3">
            <div className="etiket mb-2">Altlik gorsel</div>
            {aktifKat.altlik ? (
              <div className="space-y-2">
                <SayiAlani
                  ad="Olcek"
                  deger={aktifKat.altlik.olcek}
                  adim={0.002}
                  birim="m/px"
                  degistir={(v) =>
                    gonder({ t: 'altlik', altlik: { ...aktifKat.altlik!, olcek: Math.max(0.001, v) } })
                  }
                />
                <SayiAlani
                  ad="Saydamlik"
                  deger={aktifKat.altlik.saydamlik}
                  adim={0.05}
                  birim=""
                  degistir={(v) =>
                    gonder({
                      t: 'altlik',
                      altlik: { ...aktifKat.altlik!, saydamlik: Math.min(1, Math.max(0.05, v)) },
                    })
                  }
                />
                <button
                  onClick={() => gonder({ t: 'altlik', altlik: null })}
                  className="text-[12.5px] font-medium text-kiremit-koyu"
                >
                  Kaldir
                </button>
              </div>
            ) : (
              <button
                onClick={() => altlikGirisi.current?.click()}
                className="w-full rounded-[6px] border border-dashed border-cizgi-2 px-3 py-2.5 text-[13px] text-murekkep-3 transition-colors hover:border-murekkep-3 hover:text-murekkep-2"
              >
                Plan / eskiz yukle
              </button>
            )}
          </div>

          <div className="mt-auto border-t border-cizgi px-4 py-3">
            <div className="etiket mb-2">Kat ozeti</div>
            <Satir ad="Mekan" deger={`${ozet.odaSayisi}`} />
            <Satir ad="Toplam alan" deger={`${ozet.toplamAlan.toFixed(1)} m²`} />
            <Satir ad="Duvar" deger={`${ozet.duvarUzunluk.toFixed(1)} m`} />
            <Satir ad="Kapi / pencere" deger={`${ozet.kapi} / ${ozet.pencere}`} />
          </div>
        </aside>

        {/* --------------------------------------------------- tuval */}
        <div className="relative min-w-0 flex-1">
          {gorunum === '2b' && (
            <Tuval2B
              kat={aktifKat}
              altKat={altKat}
              odalar={odalar}
              varsayilan={durum.proje.varsayilan}
              secim={durum.secim}
              arac={arac}
              kapiKatalog={kapiKatalog}
              pencereKatalog={pencereKatalog}
              donatiKatalog={donatiKatalog}
              izgaraGorunur={izgaraGorunur}
              altKatGorunur={altKatGorunur}
              odaEtiketi={odaEtiketi}
              gonder={gonder}
              aracDegistir={setArac}
              apiRef={tuvalApi}
            />
          )}
          {gorunum === '3b' && (
            <Suspense fallback={<Yukleniyor />}>
              <Sahne3B
                proje={durum.proje}
                aktifKatId={aktifKat.id}
                tumKatlar={tumKatlar}
                tema={tema}
                golge={golge}
                izgara={izgaraGorunur}
                gunesAcisi={gunesAcisi}
                tavan={tavan}
                sigdirTetik={sigdirTetik}
              />
            </Suspense>
          )}
          {gorunum === 'bolunmus' && (
            <div className="grid h-full grid-cols-2 divide-x divide-cizgi">
              <div className="relative min-w-0">
                <Tuval2B
                  kat={aktifKat}
                  altKat={altKat}
                  odalar={odalar}
                  varsayilan={durum.proje.varsayilan}
                  secim={durum.secim}
                  arac={arac}
                  kapiKatalog={kapiKatalog}
                  pencereKatalog={pencereKatalog}
                  donatiKatalog={donatiKatalog}
                  izgaraGorunur={izgaraGorunur}
                  altKatGorunur={altKatGorunur}
                  odaEtiketi={odaEtiketi}
                  gonder={gonder}
                  aracDegistir={setArac}
                  apiRef={tuvalApi}
                />
              </div>
              <div className="relative min-w-0">
                <Suspense fallback={<Yukleniyor />}>
                  <Sahne3B
                    proje={durum.proje}
                    aktifKatId={aktifKat.id}
                    tumKatlar={tumKatlar}
                    tema={tema}
                    golge={golge}
                    izgara={izgaraGorunur}
                    gunesAcisi={gunesAcisi}
                    tavan={tavan}
                    sigdirTetik={sigdirTetik}
                  />
                </Suspense>
              </div>
            </div>
          )}

          {/* arac cubugu */}
          {gorunum !== '3b' && (
            <div className="absolute bottom-4 left-1/2 z-20 -translate-x-1/2">
              <div className="flex items-center gap-1 rounded-[10px] border border-cizgi bg-kart/96 p-1.5 shadow-[0_2px_14px_rgba(48,51,45,0.08)] backdrop-blur">
                {ARACLAR.map((a) => (
                  <button
                    key={a.id}
                    onClick={() => setArac(a.id)}
                    title={`${a.ad} (${a.kisayol}) — ${a.ipucu}`}
                    className={`flex flex-col items-center gap-0.5 rounded-[7px] px-2.5 py-1.5 transition-colors duration-200 ${
                      arac === a.id
                        ? 'bg-kiremit-soft text-kiremit-koyu'
                        : 'text-murekkep-2 hover:bg-kagit-2 hover:text-murekkep'
                    }`}
                  >
                    <AracIkonu arac={a.id} />
                    <span className="text-[10.5px] font-medium">{a.ad}</span>
                  </button>
                ))}
                <span className="mx-1 h-8 w-px bg-cizgi" />
                <button
                  onClick={() => tuvalApi.current?.yakinlastir(1.25)}
                  className="rounded-[7px] px-2.5 py-2 text-[15px] text-murekkep-2 transition-colors hover:bg-kagit-2"
                >
                  +
                </button>
                <button
                  onClick={() => tuvalApi.current?.yakinlastir(0.8)}
                  className="rounded-[7px] px-2.5 py-2 text-[15px] text-murekkep-2 transition-colors hover:bg-kagit-2"
                >
                  −
                </button>
              </div>
            </div>
          )}

          {gorunum !== '2b' && (
            <div className="absolute top-3 right-3 z-20 flex flex-wrap items-center gap-1.5 rounded-[8px] border border-cizgi bg-kart/95 px-2 py-1.5 backdrop-blur">
              <Cip secili={tema === 'studyo'} onClick={() => setTema('studyo')}>
                Studyo
              </Cip>
              <Cip secili={tema === 'maket'} onClick={() => setTema('maket')}>
                Maket
              </Cip>
              <Cip secili={tema === 'tel'} onClick={() => setTema('tel')}>
                Tel kafes
              </Cip>
              <input
                type="range"
                min={0}
                max={360}
                value={gunesAcisi}
                onChange={(e) => setGunesAcisi(Number(e.target.value))}
                className="ml-1 w-[92px] accent-[#a97b4c]"
                title="Gunes yonu"
              />
            </div>
          )}
        </div>

        {/* -------------------------------------------------- sag panel */}
        <aside className="hidden w-[286px] shrink-0 flex-col overflow-y-auto border-l border-cizgi bg-yan xl:flex">
          <AracAyari
            arac={arac}
            varsayilan={durum.proje.varsayilan}
            varsayilanYama={(yama) => gonder({ t: 'varsayilan', yama })}
            kapiKatalog={kapiKatalog}
            setKapiKatalog={setKapiKatalog}
            pencereKatalog={pencereKatalog}
            setPencereKatalog={setPencereKatalog}
            donatiKatalog={donatiKatalog}
            setDonatiKatalog={setDonatiKatalog}
            donatiGrup={donatiGrup}
            setDonatiGrup={setDonatiGrup}
          />

          {secili && (
            <OzellikPaneli
              secim={durum.secim}
              kat={aktifKat}
              gonder={gonder}
            />
          )}

          <div className="border-t border-cizgi px-4 py-3">
            <div className="etiket mb-2">Disa aktar</div>
            <div className="space-y-1.5">
              <IndirDugmesi
                ad="Plan · DXF"
                alt="Katmanli, 1:1 metre"
                onClick={() =>
                  dosyaIndir(planDxf(aktifKat, durum.proje.ad), `${damga}.dxf`, 'application/dxf')
                }
              />
              <IndirDugmesi
                ad="Plan · SVG"
                alt="Paftaya konabilir"
                onClick={() =>
                  dosyaIndir(
                    planSvg(aktifKat, durum.proje.ad, 1800),
                    `${damga}.svg`,
                    'image/svg+xml',
                  )
                }
              />
              <IndirDugmesi
                ad="Model · OBJ"
                alt={tumKatlar ? 'Tum katlar' : 'Aktif kat'}
                onClick={() =>
                  dosyaIndir(
                    modelObj(
                      durum.proje,
                      tumKatlar ? durum.proje.katlar.map((k) => k.id) : [aktifKat.id],
                    ),
                    `${damga}.obj`,
                    'text/plain',
                  )
                }
              />
              <IndirDugmesi
                ad="Proje · JSON"
                alt="Yedek ve tasima"
                onClick={() =>
                  dosyaIndir(projeJson(durum.proje), `${damga}.archlib.json`, 'application/json')
                }
              />
            </div>
          </div>
        </aside>
      </div>

      {/* ================================================== kritik cekmecesi */}
      {kritikAcik && (
        <div className="fixed inset-0 z-50 flex justify-end bg-murekkep/35 backdrop-blur-[2px]">
          <button
            aria-label="Kapat"
            onClick={() => setKritikAcik(false)}
            className="flex-1 cursor-default"
          />
          <div className="animasyon-sayfa flex h-full w-full max-w-xl flex-col border-l border-cizgi bg-kart">
            <div className="flex items-center justify-between border-b border-cizgi px-5 py-3.5">
              <div>
                <div className="etiket">Kritik</div>
                <h2 className="mt-0.5 text-[18px] text-murekkep">
                  {durum.proje.ad} · {aktifKat.ad}
                </h2>
              </div>
              <div className="flex items-center gap-3">
                {kritikCalisiyor && (
                  <button
                    onClick={() => kritikIptal.current?.abort()}
                    className="text-[13px] font-medium text-kiremit-koyu"
                  >
                    Durdur
                  </button>
                )}
                <button
                  onClick={() => setKritikAcik(false)}
                  className="text-[13px] font-medium text-murekkep-3 hover:text-murekkep"
                >
                  Kapat
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {kritikHata && (
                <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] text-kiremit-koyu">
                  {kritikHata}
                </p>
              )}
              {!kritik && kritikCalisiyor && (
                <p className="text-[14px] text-murekkep-3">Plan okunuyor…</p>
              )}
              {kritik && <Markdown metin={kritik} />}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ==================================================================== parcalar

function Yukleniyor() {
  return (
    <div className="flex h-full items-center justify-center text-[13.5px] text-murekkep-3">
      3B goruntuleyici yukleniyor…
    </div>
  )
}

function Ayirac() {
  return <span className="mx-0.5 h-6 w-px bg-cizgi" />
}

function IkonDugme({
  children,
  onClick,
  ipucu,
  pasif,
}: {
  children: React.ReactNode
  onClick: () => void
  ipucu: string
  pasif?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={pasif}
      title={ipucu}
      className="rounded-[6px] border border-cizgi p-1.5 text-murekkep-2 transition-colors hover:border-cizgi-2 hover:text-murekkep disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6">
        {children}
      </svg>
    </button>
  )
}

function MiniDugme({
  children,
  onClick,
  ipucu,
}: {
  children: React.ReactNode
  onClick: () => void
  ipucu: string
}) {
  return (
    <button
      onClick={onClick}
      title={ipucu}
      className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-[5px] border border-cizgi bg-kart text-[13px] leading-none text-murekkep-3 transition-colors hover:border-cizgi-2 hover:text-murekkep"
    >
      {children}
    </button>
  )
}

function Anahtar({
  acik,
  degistir,
  ad,
}: {
  acik: boolean
  degistir: (v: boolean) => void
  ad: string
}) {
  return (
    <button
      onClick={() => degistir(!acik)}
      className={`rounded-[6px] border px-2.5 py-1.5 text-[12.5px] font-medium transition-colors ${
        acik
          ? 'border-adacayi/45 bg-adacayi-soft text-adacayi-koyu'
          : 'border-cizgi bg-kart text-murekkep-3 hover:text-murekkep-2'
      }`}
    >
      {ad}
    </button>
  )
}

function Satir({ ad, deger }: { ad: string; deger: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 py-0.5">
      <span className="text-[12.5px] text-murekkep-3">{ad}</span>
      <span className="sayi text-[13px] font-medium text-murekkep">{deger}</span>
    </div>
  )
}

function SayiAlani({
  ad,
  deger,
  adim,
  birim,
  degistir,
}: {
  ad: string
  deger: number
  adim: number
  birim: string
  degistir: (v: number) => void
}) {
  return (
    <label className="mt-1.5 flex items-center justify-between gap-2">
      <span className="text-[12.5px] text-murekkep-3">{ad}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          step={adim}
          value={Number.isFinite(deger) ? Number(deger.toFixed(3)) : 0}
          onChange={(e) => degistir(Number(e.target.value))}
          className="sayi w-[74px] rounded-[5px] border border-cizgi bg-kart px-2 py-1 text-right text-[13px] text-murekkep outline-none focus:border-cizgi-2"
        />
        <span className="w-[30px] text-[11.5px] text-murekkep-3">{birim}</span>
      </span>
    </label>
  )
}

function IndirDugmesi({ ad, alt, onClick }: { ad: string; alt: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-3 rounded-[6px] border border-cizgi bg-kart px-3 py-2 text-left transition-colors hover:border-kiremit/45 hover:bg-kiremit-soft/60"
    >
      <span>
        <span className="block text-[13.5px] font-medium text-murekkep">{ad}</span>
        <span className="block text-[11.5px] text-murekkep-3">{alt}</span>
      </span>
      <span className="text-[13px] text-murekkep-3">↓</span>
    </button>
  )
}

function AracIkonu({ arac }: { arac: Arac }) {
  const yol: Record<Arac, React.ReactNode> = {
    sec: <path d="M5 3l14 8-6 1.6L10 20z" />,
    duvar: <path d="M3 15h18M3 15v3M21 15v3M7 15V9h10v6" />,
    dikdortgen: <path d="M4 5h16v14H4z" />,
    kapi: <path d="M6 20V4h9v16M15 12h4M19 12a8 8 0 01-8 8" />,
    pencere: <path d="M4 6h16v12H4zM12 6v12M4 12h16" />,
    mobilya: <path d="M4 11V7h16v4M3 11h18v6H3zM6 17v3M18 17v3" />,
    kolon: <path d="M8 4h8v16H8zM6 4h12M6 20h12" />,
    olcu: <path d="M3 9h18v6H3zM7 9v3M11 9v3M15 9v3M19 9v3" />,
  }
  return (
    <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
      {yol[arac]}
    </svg>
  )
}

function AracAyari(p: {
  arac: Arac
  varsayilan: import('./tipler').Varsayilanlar
  varsayilanYama: (y: Partial<import('./tipler').Varsayilanlar>) => void
  kapiKatalog: string
  setKapiKatalog: (v: string) => void
  pencereKatalog: string
  setPencereKatalog: (v: string) => void
  donatiKatalog: string
  setDonatiKatalog: (v: string) => void
  donatiGrup: string
  setDonatiGrup: (v: string) => void
}) {
  const tanim = ARACLAR.find((a) => a.id === p.arac)

  return (
    <div className="border-b border-cizgi px-4 py-3">
      <div className="flex items-baseline justify-between">
        <span className="etiket">Arac</span>
        <span className="sayi text-[11.5px] text-murekkep-3">{tanim?.kisayol}</span>
      </div>
      <div className="mt-1 text-[14.5px] font-medium text-murekkep">{tanim?.ad}</div>
      <p className="mt-1 text-[12.5px] leading-relaxed text-murekkep-3">{tanim?.ipucu}</p>

      {(p.arac === 'duvar' || p.arac === 'dikdortgen') && (
        <div className="mt-3 border-t border-cizgi pt-3">
          <SayiAlani
            ad="Duvar kalinligi"
            deger={p.varsayilan.duvarKalinlik}
            adim={0.05}
            birim="m"
            degistir={(v) => p.varsayilanYama({ duvarKalinlik: Math.max(0.05, v) })}
          />
          <SayiAlani
            ad="Izgara adimi"
            deger={p.varsayilan.izgaraAdim}
            adim={0.05}
            birim="m"
            degistir={(v) => p.varsayilanYama({ izgaraAdim: Math.max(0.01, v) })}
          />
          <SayiAlani
            ad="Aci adimi"
            deger={p.varsayilan.aciAdim}
            adim={5}
            birim="°"
            degistir={(v) => p.varsayilanYama({ aciAdim: Math.max(1, v) })}
          />
          <p className="mt-2 text-[12px] leading-relaxed text-murekkep-3">
            Shift basiliyken aci kilidi kalkar. Esc zinciri bitirir.
          </p>
        </div>
      )}

      {p.arac === 'kapi' && (
        <KatalogListesi
          liste={KAPILAR}
          secili={p.kapiKatalog}
          sec={p.setKapiKatalog}
          baslik="Kapi tipi"
        />
      )}
      {p.arac === 'pencere' && (
        <KatalogListesi
          liste={PENCERELER}
          secili={p.pencereKatalog}
          sec={p.setPencereKatalog}
          baslik="Pencere tipi"
        />
      )}
      {p.arac === 'mobilya' && (
        <div className="mt-3 border-t border-cizgi pt-3">
          <div className="etiket mb-2">Donati</div>
          <div className="mb-2 flex flex-wrap gap-1">
            {DONATI_GRUPLARI.map((g) => (
              <Cip key={g} secili={p.donatiGrup === g} onClick={() => p.setDonatiGrup(g)}>
                {g}
              </Cip>
            ))}
          </div>
          <ul className="max-h-[240px] overflow-y-auto rounded-[6px] border border-cizgi bg-kart">
            {DONATILAR.filter((d) => d.grup === p.donatiGrup).map((d) => (
              <li key={d.id}>
                <button
                  onClick={() => p.setDonatiKatalog(d.id)}
                  className={`w-full border-b border-cizgi/60 px-3 py-2 text-left last:border-0 transition-colors ${
                    p.donatiKatalog === d.id ? 'bg-kiremit-soft' : 'hover:bg-kagit-2'
                  }`}
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="text-[13.5px] text-murekkep">{d.ad}</span>
                    <span className="sayi shrink-0 text-[11.5px] text-murekkep-3">
                      {(d.g * 100).toFixed(0)}×{(d.d * 100).toFixed(0)}
                    </span>
                  </span>
                  {d.not && (
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-murekkep-3">
                      {d.not}
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[12px] text-murekkep-3">R / T tuslari 15° dondurur.</p>
        </div>
      )}
    </div>
  )
}

function KatalogListesi({
  liste,
  secili,
  sec,
  baslik,
}: {
  liste: { id: string; ad: string; genislik: number; yukseklik: number; not: string }[]
  secili: string
  sec: (v: string) => void
  baslik: string
}) {
  return (
    <div className="mt-3 border-t border-cizgi pt-3">
      <div className="etiket mb-2">{baslik}</div>
      <ul className="max-h-[300px] overflow-y-auto rounded-[6px] border border-cizgi bg-kart">
        {liste.map((k) => (
          <li key={k.id}>
            <button
              onClick={() => sec(k.id)}
              className={`w-full border-b border-cizgi/60 px-3 py-2 text-left last:border-0 transition-colors ${
                secili === k.id ? 'bg-kiremit-soft' : 'hover:bg-kagit-2'
              }`}
            >
              <span className="flex items-baseline justify-between gap-2">
                <span className="text-[13.5px] text-murekkep">{k.ad}</span>
                <span className="sayi shrink-0 text-[11.5px] text-murekkep-3">
                  {(k.genislik * 100).toFixed(0)}×{(k.yukseklik * 100).toFixed(0)}
                </span>
              </span>
              {k.not && (
                <span className="mt-0.5 block text-[11.5px] leading-snug text-murekkep-3">
                  {k.not}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function OzellikPaneli({
  secim,
  kat,
  gonder,
}: {
  secim: Secim[]
  kat: Kat
  gonder: ReturnType<typeof useCizimDeposu>['gonder']
}) {
  const ilk = secim[0]
  const duvar = ilk?.tur === 'duvar' ? kat.duvarlar.find((w) => w.id === ilk.id) : null
  const aciklik = ilk?.tur === 'aciklik' ? kat.aciklikar.find((a) => a.id === ilk.id) : null
  const mobilya = ilk?.tur === 'mobilya' ? kat.mobilyalar.find((m) => m.id === ilk.id) : null
  const kolon = ilk?.tur === 'kolon' ? kat.kolonlar.find((c) => c.id === ilk.id) : null

  return (
    <div className="border-b border-cizgi px-4 py-3">
      <div className="flex items-baseline justify-between">
        <span className="etiket">Secili</span>
        <button
          onClick={() => gonder({ t: 'sil', secim })}
          className="text-[12.5px] font-medium text-kiremit-koyu"
        >
          Sil (Del)
        </button>
      </div>

      {secim.length > 1 && (
        <p className="mt-2 text-[13px] text-murekkep-2">{secim.length} eleman secili.</p>
      )}

      {duvar && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-murekkep">Duvar</div>
          <Satir ad="Uzunluk" deger={`${duvarUzunluk(duvar).toFixed(2)} m`} />
          <SayiAlani
            ad="Kalinlik"
            deger={duvar.kalinlik}
            adim={0.05}
            birim="m"
            degistir={(v) =>
              gonder({ t: 'duvar-yama', id: duvar.id, yama: { kalinlik: Math.max(0.03, v) } })
            }
          />
          <SayiAlani
            ad="Yukseklik"
            deger={duvar.yukseklik}
            adim={0.1}
            birim="m"
            degistir={(v) => gonder({ t: 'duvar-yama', id: duvar.id, yama: { yukseklik: Math.max(0, v) } })}
          />
          <div className="mt-2 flex flex-wrap gap-1">
            {(['tasiyici', 'bolme', 'cam', 'parapet'] as Duvar['tur'][]).map((t) => (
              <Cip
                key={t}
                secili={duvar.tur === t}
                onClick={() => gonder({ t: 'duvar-yama', id: duvar.id, yama: { tur: t } })}
              >
                {t}
              </Cip>
            ))}
          </div>
          <p className="mt-1.5 text-[11.5px] text-murekkep-3">
            Yukseklik 0 birakilirsa kat yuksekligi kullanilir.
          </p>
        </div>
      )}

      {aciklik && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-murekkep">
            {aciklik.tur === 'kapi' ? 'Kapi' : 'Pencere'}
          </div>
          <SayiAlani
            ad="Genislik"
            deger={aciklik.genislik}
            adim={0.05}
            birim="m"
            degistir={(v) =>
              gonder({ t: 'aciklik-yama', id: aciklik.id, yama: { genislik: Math.max(0.3, v) } })
            }
          />
          <SayiAlani
            ad="Yukseklik"
            deger={aciklik.yukseklik}
            adim={0.05}
            birim="m"
            degistir={(v) =>
              gonder({ t: 'aciklik-yama', id: aciklik.id, yama: { yukseklik: Math.max(0.3, v) } })
            }
          />
          <SayiAlani
            ad="Esik / parapet"
            deger={aciklik.esik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'aciklik-yama', id: aciklik.id, yama: { esik: Math.max(0, v) } })}
          />
          <SayiAlani
            ad="Duvarda konum"
            deger={aciklik.mesafe}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'aciklik-yama', id: aciklik.id, yama: { mesafe: v } })}
          />
          <button
            onClick={() => gonder({ t: 'aciklik-yama', id: aciklik.id, yama: { ters: !aciklik.ters } })}
            className="mt-2 rounded-[6px] border border-cizgi bg-kart px-2.5 py-1.5 text-[12.5px] font-medium text-murekkep-2"
          >
            Acilis yonunu cevir
          </button>
        </div>
      )}

      {mobilya && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-murekkep">{mobilya.ad}</div>
          <SayiAlani
            ad="Genislik"
            deger={mobilya.genislik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'mobilya-yama', id: mobilya.id, yama: { genislik: Math.max(0.1, v) } })}
          />
          <SayiAlani
            ad="Derinlik"
            deger={mobilya.derinlik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'mobilya-yama', id: mobilya.id, yama: { derinlik: Math.max(0.1, v) } })}
          />
          <SayiAlani
            ad="Yukseklik"
            deger={mobilya.yukseklik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'mobilya-yama', id: mobilya.id, yama: { yukseklik: Math.max(0.02, v) } })}
          />
          <SayiAlani
            ad="Aci"
            deger={mobilya.aci}
            adim={15}
            birim="°"
            degistir={(v) => gonder({ t: 'mobilya-yama', id: mobilya.id, yama: { aci: v } })}
          />
          <p className="mt-1.5 text-[11.5px] leading-snug text-murekkep-3">
            {donatiBul(mobilya.katalog).not}
          </p>
        </div>
      )}

      {kolon && (
        <div className="mt-2">
          <div className="text-[14px] font-medium text-murekkep">Kolon</div>
          <SayiAlani
            ad="Genislik"
            deger={kolon.genislik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'kolon-yama', id: kolon.id, yama: { genislik: Math.max(0.1, v) } })}
          />
          <SayiAlani
            ad="Derinlik"
            deger={kolon.derinlik}
            adim={0.05}
            birim="m"
            degistir={(v) => gonder({ t: 'kolon-yama', id: kolon.id, yama: { derinlik: Math.max(0.1, v) } })}
          />
          <SayiAlani
            ad="Aci"
            deger={kolon.aci}
            adim={15}
            birim="°"
            degistir={(v) => gonder({ t: 'kolon-yama', id: kolon.id, yama: { aci: v } })}
          />
        </div>
      )}
    </div>
  )
}

function ProjePaneli({
  projeler,
  aktifId,
  kapat,
  yeni,
  ac,
  sil,
  iceAktar,
  disaAktar,
}: {
  projeler: ProjeOzeti[]
  aktifId: string
  kapat: () => void
  yeni: () => void
  ac: (id: string) => void
  sil: (id: string) => void
  iceAktar: () => void
  disaAktar: () => void
}) {
  return (
    <div className="border-b border-cizgi bg-kart px-3 py-3">
      <Panel className="mx-auto max-w-3xl">
        <PanelBasligi
          baslik="Projeler"
          sag={
            <span className="flex gap-3">
              <button onClick={yeni} className="text-[13px] font-medium text-kiremit-koyu">
                Yeni
              </button>
              <button onClick={iceAktar} className="text-[13px] font-medium text-murekkep-3 hover:text-murekkep">
                Ice aktar
              </button>
              <button onClick={disaAktar} className="text-[13px] font-medium text-murekkep-3 hover:text-murekkep">
                Disa aktar
              </button>
              <button onClick={kapat} className="text-[13px] font-medium text-murekkep-3 hover:text-murekkep">
                Kapat
              </button>
            </span>
          }
        />
        {projeler.length === 0 ? (
          <p className="px-4 py-4 text-[13.5px] text-murekkep-3">
            Kayitli proje yok. Cizmeye basladiginda otomatik kaydedilir.
          </p>
        ) : (
          <ul className="max-h-[220px] overflow-y-auto">
            {projeler.map((p) => (
              <li
                key={p.id}
                className="flex items-center gap-3 border-b border-cizgi/60 px-4 py-2 last:border-0"
              >
                <button onClick={() => ac(p.id)} className="min-w-0 flex-1 text-left">
                  <span
                    className={`block truncate text-[14px] ${p.id === aktifId ? 'font-medium text-kiremit-koyu' : 'text-murekkep'}`}
                  >
                    {p.ad}
                  </span>
                  <span className="sayi text-[11.5px] text-murekkep-3">
                    {p.katSayisi} kat · {p.duvarSayisi} duvar ·{' '}
                    {new Date(p.guncelleme).toLocaleDateString('tr-TR')}
                  </span>
                </button>
                <button
                  onClick={() => sil(p.id)}
                  className="text-[12.5px] text-murekkep-3 hover:text-kiremit-koyu"
                >
                  Sil
                </button>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  )
}

// ------------------------------------------------------------------ gorsel

/** Plani PNG'ye cevirip AI'ya gonderilecek gorsel nesnesini uretir. */
async function planGorseli(kat: Kat, projeAdi: string) {
  const svg = planSvg(kat, projeAdi, 1400)
  if (!svg) return null
  const kaynak = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svg)))}`
  const img = await new Promise<HTMLImageElement | null>((coz) => {
    const i = new Image()
    i.onload = () => coz(i)
    i.onerror = () => coz(null)
    i.src = kaynak
  })
  if (!img) return null
  const tuval = document.createElement('canvas')
  tuval.width = img.naturalWidth
  tuval.height = img.naturalHeight
  const ctx = tuval.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#fcfbf8'
  ctx.fillRect(0, 0, tuval.width, tuval.height)
  ctx.drawImage(img, 0, 0)
  const png = tuval.toDataURL('image/png')
  return {
    id: 'plan',
    ad: `${projeAdi}-${kat.ad}.png`,
    mediaType: 'image/png',
    veri: png.slice(png.indexOf(',') + 1),
    onizleme: png,
  }
}

export type { Nokta }
