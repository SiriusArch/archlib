import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Projeksiyon, type Nokta } from '../lib/arazi/projeksiyon'
import { araziVerisiGetir, type AraziVerisi, type KatmanTuru } from '../lib/arazi/osm'
import { yukseklikGetir, type YukseklikIzgarasi } from '../lib/arazi/yukseklik'
import { konturUret, otomatikAralik, type KonturCizgisi } from '../lib/arazi/kontur'
import {
  kesitSahnesiKur,
  kesitSahnesiSvg,
  type KesitSahnesi,
  type KesitTarafi,
} from '../lib/arazi/kesitSahne'
import {
  planDxf,
  planSvg,
  modelObj,
  geoJson,
  kesitSahnesiDxf,
  dosyaIndir,
  type AraziPaketi,
} from '../lib/arazi/disaAktar'
import { SayfaBasligi } from '../ui/Parcalar'
import { Panel, PanelBasligi, Cip, KatmanSatiri, DegerSecici, Segment } from '../ui/Kontroller'
import { IkonIndir } from '../ui/Ikonlar'

type Mod = 'plan' | 'kesit'
type Durum = 'bos' | 'yukleniyor' | 'hazir' | 'hata'
type Kutu = { guney: number; bati: number; kuzey: number; dogu: number }
type Konum = { enlem: number; boylam: number }

const BASLANGIC: Konum = { enlem: 41.6771, boylam: 26.5557 }
const MAKS_ALAN_KM2 = 4
const KONTUR_ARALIKLARI = [1, 2, 5, 10] as const
const AG_COZUNURLUKLARI = [4, 6, 10, 20] as const
const BANTLAR = [30, 60, 120, 250] as const
const ABARTMALAR = [1, 1.5, 2, 3] as const
const HAZIR_BOYUTLAR = [250, 500, 1000] as const

const IKI_FORMATLAR = ['DXF', 'SVG', 'GeoJSON'] as const
type IkiFormat = (typeof IKI_FORMATLAR)[number]

const KATMAN_LISTESI: { id: KatmanTuru | 'kontur'; ad: string; renk: string }[] = [
  { id: 'bina', ad: 'Binalar', renk: 'bg-kiremit' },
  { id: 'yol', ad: 'Yollar', renk: 'bg-murekkep-3' },
  { id: 'demiryolu', ad: 'Demiryolu', renk: 'bg-mor' },
  { id: 'su', ad: 'Su yollari', renk: 'bg-mavi' },
  { id: 'yesil', ad: 'Yesil alanlar', renk: 'bg-adacayi' },
  { id: 'agac', ad: 'Agaclar', renk: 'bg-adacayi' },
  { id: 'kontur', ad: 'Kontur cizgileri', renk: 'bg-kehribar' },
]

function kutuKur(merkez: Konum, genislik: number, yukseklik: number): Kutu {
  const p = new Projeksiyon(merkez)
  const [guney, bati, kuzey, dogu] = p.sinirKutusu(genislik / 2, yukseklik / 2)
  return { guney, bati, kuzey, dogu }
}

function kutuOlcu(k: Kutu): { merkez: Konum; genislik: number; yukseklik: number } {
  const merkez = { enlem: (k.guney + k.kuzey) / 2, boylam: (k.bati + k.dogu) / 2 }
  const p = new Projeksiyon(merkez)
  const sw = p.ileri(k.guney, k.bati)
  const ne = p.ileri(k.kuzey, k.dogu)
  return { merkez, genislik: Math.abs(ne.x - sw.x), yukseklik: Math.abs(ne.y - sw.y) }
}

function tutamak(tip: 'kose' | 'kenar' | 'uc' | 'tasi'): L.DivIcon {
  const stil: Record<string, string> = {
    kose: 'width:12px;height:12px;background:#30332d;border:2px solid #fffefa;border-radius:3px',
    kenar: 'width:10px;height:10px;background:#fffefa;border:2px solid #30332d;border-radius:2px',
    uc: 'width:14px;height:14px;background:#b9573e;border:2.5px solid #fffefa;border-radius:50%',
    tasi: 'width:26px;height:26px;background:#fffefa;border:1px solid #dcdad0;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#5f6259;font-size:12px;line-height:1',
  }
  const boyut = tip === 'tasi' ? 26 : tip === 'uc' ? 14 : tip === 'kose' ? 12 : 10
  return L.divIcon({
    className: '',
    iconSize: [boyut, boyut],
    iconAnchor: [boyut / 2, boyut / 2],
    html: `<div style="${stil[tip]};box-shadow:0 1px 4px rgba(48,51,45,.18)">${tip === 'tasi' ? '✥' : ''}</div>`,
  })
}

export default function Arazi() {
  const kutuRef = useRef<HTMLDivElement>(null)
  const haritaRef = useRef<L.Map | null>(null)
  const grupRef = useRef<L.LayerGroup | null>(null)
  const iptalRef = useRef<AbortController | null>(null)

  const [mod, setMod] = useState<Mod>('plan')
  const [kutu, setKutu] = useState<Kutu>(() => kutuKur(BASLANGIC, 500, 500))
  const [kesitUc, setKesitUc] = useState<[Konum, Konum]>([
    { enlem: 41.6745, boylam: 26.5495 },
    { enlem: 41.6745, boylam: 26.5625 },
  ])
  const [bant, setBant] = useState<number>(60)
  const [taraf, setTaraf] = useState<KesitTarafi>('on')
  const [abartma, setAbartma] = useState<number>(1)
  const [agCozunurluk, setAgCozunurluk] = useState<number>(6)

  const [durum, setDurum] = useState<Durum>('bos')
  const [ilerleme, setIlerleme] = useState('')
  const [hata, setHata] = useState('')

  const [veri, setVeri] = useState<AraziVerisi | null>(null)
  const [izgara, setIzgara] = useState<YukseklikIzgarasi | null>(null)
  const [konturlar, setKonturlar] = useState<KonturCizgisi[]>([])
  const [konturAralik, setKonturAralik] = useState<number>(5)
  const [sahne, setSahne] = useState<KesitSahnesi | null>(null)
  const [paket, setPaket] = useState<AraziPaketi | null>(null)

  const [ikiAcik, setIkiAcik] = useState(true)
  const [ucAcik, setUcAcik] = useState(true)
  const [ikiFormat, setIkiFormat] = useState<IkiFormat>('DXF')
  const [ikiKatman, setIkiKatman] = useState<Record<string, boolean>>({})
  const [binaKutle, setBinaKutle] = useState(true)

  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState<(Konum & { ad: string })[]>([])
  const [araniyor, setAraniyor] = useState(false)

  const olcu = useMemo(() => kutuOlcu(kutu), [kutu])
  const alanKm2 = (olcu.genislik * olcu.yukseklik) / 1_000_000
  const alanAsiyor = alanKm2 > MAKS_ALAN_KM2
  const hatOlcu = useMemo(() => hattiOlc(kesitUc), [kesitUc])

  // ------------------------------------------------------------ harita kur
  useEffect(() => {
    if (!kutuRef.current || haritaRef.current) return
    const harita = L.map(kutuRef.current, {
      center: [BASLANGIC.enlem, BASLANGIC.boylam],
      zoom: 15,
      zoomControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(harita)
    grupRef.current = L.layerGroup().addTo(harita)
    haritaRef.current = harita
    setTimeout(() => harita.invalidateSize(), 150)
    return () => {
      harita.remove()
      haritaRef.current = null
      grupRef.current = null
    }
  }, [])

  // --------------------------------------------------- secimi haritaya ciz
  useEffect(() => {
    const grup = grupRef.current
    if (!grup) return
    grup.clearLayers()

    if (mod === 'plan') {
      const { guney, bati, kuzey, dogu } = kutu
      L.rectangle(
        [
          [guney, bati],
          [kuzey, dogu],
        ],
        {
          color: alanAsiyor ? '#b9573e' : '#30332d',
          weight: 1.5,
          fillColor: '#5c7c92',
          fillOpacity: 0.07,
        },
      ).addTo(grup)

      // Kose tutamaklari: karsi kose sabit kalir, en ve boy serbest degisir
      const koseler: [number, number, 'guney' | 'kuzey', 'bati' | 'dogu'][] = [
        [guney, bati, 'guney', 'bati'],
        [guney, dogu, 'guney', 'dogu'],
        [kuzey, dogu, 'kuzey', 'dogu'],
        [kuzey, bati, 'kuzey', 'bati'],
      ]
      for (const [e, b, dikey, yatay] of koseler) {
        L.marker([e, b], { icon: tutamak('kose'), draggable: true })
          .addTo(grup)
          .on('drag', (ev) => {
            const ll = (ev.target as L.Marker).getLatLng()
            setKutu((k) => duzelt({ ...k, [dikey]: ll.lat, [yatay]: ll.lng }))
          })
      }

      // Kenar tutamaklari: tek eksende boyutlandirir
      const kenarlar: [number, number, 'guney' | 'kuzey' | 'bati' | 'dogu', 'e' | 'b'][] = [
        [guney, (bati + dogu) / 2, 'guney', 'e'],
        [kuzey, (bati + dogu) / 2, 'kuzey', 'e'],
        [(guney + kuzey) / 2, bati, 'bati', 'b'],
        [(guney + kuzey) / 2, dogu, 'dogu', 'b'],
      ]
      for (const [e, b, alan, eksen] of kenarlar) {
        L.marker([e, b], { icon: tutamak('kenar'), draggable: true })
          .addTo(grup)
          .on('drag', (ev) => {
            const ll = (ev.target as L.Marker).getLatLng()
            setKutu((k) => duzelt({ ...k, [alan]: eksen === 'e' ? ll.lat : ll.lng }))
          })
      }

      L.marker([(guney + kuzey) / 2, (bati + dogu) / 2], {
        icon: tutamak('tasi'),
        draggable: true,
      })
        .addTo(grup)
        .on('dragend', (ev) => {
          const ll = (ev.target as L.Marker).getLatLng()
          setKutu((k) => {
            const de = ll.lat - (k.guney + k.kuzey) / 2
            const db = ll.lng - (k.bati + k.dogu) / 2
            return { guney: k.guney + de, kuzey: k.kuzey + de, bati: k.bati + db, dogu: k.dogu + db }
          })
        })

      olcuBalonu(grup, [kuzey, (bati + dogu) / 2], `${olcu.genislik.toFixed(0)} m`)
      olcuBalonu(grup, [(guney + kuzey) / 2, bati], `${olcu.yukseklik.toFixed(0)} m`)
    } else {
      const [A, B] = kesitUc
      const orta = hatOlcu.orta
      const proj = new Projeksiyon(orta)
      const a = proj.ileri(A.enlem, A.boylam)
      const b = proj.ileri(B.enlem, B.boylam)
      const uz = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const nx = -(b.y - a.y) / uz
      const ny = (b.x - a.x) / uz

      // Bant secilen tarafa uzanir; haritadaki gosterim de oyle
      const ust = taraf === 'arka' ? 0 : taraf === 'on' ? bant : bant / 2
      const alt = taraf === 'on' ? 0 : taraf === 'arka' ? -bant : -bant / 2
      const kaydir = (p: Nokta, s: number): [number, number] => {
        const q = proj.geri(p.x + nx * s, p.y + ny * s)
        return [q.enlem, q.boylam]
      }

      L.polygon([kaydir(a, ust), kaydir(b, ust), kaydir(b, alt), kaydir(a, alt)], {
        color: '#5c7c92',
        weight: 1,
        dashArray: '5 4',
        fillColor: '#5c7c92',
        fillOpacity: 0.1,
      }).addTo(grup)

      L.polyline(
        [
          [A.enlem, A.boylam],
          [B.enlem, B.boylam],
        ],
        { color: '#30332d', weight: 2.5 },
      ).addTo(grup)

      // Bakis yonu oku: kesitin hangi tarafi gosterdigi tek bakista okunsun
      if (taraf !== 'iki') {
        const yon = taraf === 'on' ? 1 : -1
        const m: Nokta = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
        const uzunlukOk = Math.min(60, Math.max(22, bant * 0.45))
        L.polyline([kaydir(m, 0), kaydir(m, uzunlukOk * yon)], {
          color: '#b9573e',
          weight: 2.5,
        }).addTo(grup)
        L.marker(kaydir(m, uzunlukOk * yon), {
          icon: L.divIcon({
            className: '',
            iconSize: [11, 11],
            iconAnchor: [5.5, 5.5],
            html: '<div style="width:11px;height:11px;background:#b9573e;border-radius:50%;border:2px solid #fffefa"></div>',
          }),
          interactive: false,
        }).addTo(grup)
      }

      const ucIsaret = (hangi: 0 | 1, konum: Konum) =>
        L.marker([konum.enlem, konum.boylam], { icon: tutamak('uc'), draggable: true })
          .addTo(grup)
          .on('drag', (ev) => {
            const ll = (ev.target as L.Marker).getLatLng()
            setKesitUc((eski) => {
              const y: [Konum, Konum] = [eski[0], eski[1]]
              y[hangi] = { enlem: ll.lat, boylam: ll.lng }
              return y
            })
          })
      ucIsaret(0, A)
      ucIsaret(1, B)

      L.marker([orta.enlem, orta.boylam], { icon: tutamak('tasi'), draggable: true })
        .addTo(grup)
        .on('dragend', (ev) => {
          const ll = (ev.target as L.Marker).getLatLng()
          setKesitUc(([p, q]) => {
            const de = ll.lat - (p.enlem + q.enlem) / 2
            const db = ll.lng - (p.boylam + q.boylam) / 2
            return [
              { enlem: p.enlem + de, boylam: p.boylam + db },
              { enlem: q.enlem + de, boylam: q.boylam + db },
            ]
          })
        })

      olcuBalonu(grup, [orta.enlem, orta.boylam], `${hatOlcu.uzunluk.toFixed(0)} m`, true)
    }
  }, [mod, kutu, kesitUc, bant, taraf, olcu, alanAsiyor, hatOlcu])

  // ------------------------------------------------------------ konum arama
  const konumAra = useCallback(async () => {
    const q = arama.trim()
    if (q.length < 2) return
    setAraniyor(true)
    try {
      const r = await fetch(
        'https://nominatim.openstreetmap.org/search?format=json&limit=6&q=' + encodeURIComponent(q),
        { headers: { Accept: 'application/json' } },
      )
      if (!r.ok) throw new Error(`Arama basarisiz (${r.status})`)
      const j = (await r.json()) as { display_name: string; lat: string; lon: string }[]
      setSonuclar(j.map((s) => ({ ad: s.display_name, enlem: +s.lat, boylam: +s.lon })))
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setAraniyor(false)
    }
  }, [arama])

  function konumaGit(s: Konum & { ad: string }) {
    if (mod === 'plan') setKutu(kutuKur(s, olcu.genislik, olcu.yukseklik))
    else {
      const p = new Projeksiyon(s)
      setKesitUc([p.geri(-250, 0), p.geri(250, 0)])
    }
    setSonuclar([])
    setArama(s.ad.split(',')[0])
    haritaRef.current?.setView([s.enlem, s.boylam], 16)
  }

  // ------------------------------------------------------------ veri cekimi
  async function olustur() {
    iptalRef.current?.abort()
    const kontrol = new AbortController()
    iptalRef.current = kontrol
    setDurum('yukleniyor')
    setHata('')
    setSahne(null)

    const merkez = mod === 'plan' ? olcu.merkez : hatOlcu.orta
    const yariG =
      mod === 'plan' ? olcu.genislik / 2 : Math.min(900, hatOlcu.uzunluk / 2 + bant + 60)
    const yariY = mod === 'plan' ? olcu.yukseklik / 2 : yariG

    const proj = new Projeksiyon(merkez)
    try {
      setIlerleme('Yukseklik verisi indiriliyor')
      const g = await yukseklikGetir(proj, yariG, yariY, agCozunurluk, kontrol.signal)

      setIlerleme('OpenStreetMap verisi indiriliyor')
      const v = await araziVerisiGetir(proj, yariG, yariY, kontrol.signal)

      setIlerleme('Kontur cizgileri hesaplaniyor')
      const aralik = otomatikAralik(g.enYuksek - g.enDusuk)
      const k = konturUret(g, { aralik })

      setIzgara(g)
      setVeri(v)
      setKonturlar(k)
      setKonturAralik(aralik)
      setPaket({
        cizgiler: v.cizgiler,
        agaclar: v.agaclar,
        konturlar: k,
        izgara: g,
        merkez,
        yariGenislik: yariG,
        yariYukseklik: yariY,
        konturAralik: aralik,
      })

      if (mod === 'kesit') {
        const a = proj.ileri(kesitUc[0].enlem, kesitUc[0].boylam)
        const b = proj.ileri(kesitUc[1].enlem, kesitUc[1].boylam)
        setSahne(kesitSahnesiKur(g, v.cizgiler, v.agaclar, a, b, { bant, taraf }))
      }
      setDurum('hazir')
      setIlerleme('')
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        setDurum('bos')
        return
      }
      setHata((e as Error).message || 'Veri alinamadi.')
      setDurum('hata')
    } finally {
      iptalRef.current = null
    }
  }

  // Bant / taraf / abartma degisince veriyi yeniden cekmeden kesiti tazele
  useEffect(() => {
    if (mod !== 'kesit' || !izgara || !veri || !paket || durum !== 'hazir') return
    const proj = new Projeksiyon(paket.merkez)
    const a = proj.ileri(kesitUc[0].enlem, kesitUc[0].boylam)
    const b = proj.ileri(kesitUc[1].enlem, kesitUc[1].boylam)
    setSahne(kesitSahnesiKur(izgara, veri.cizgiler, veri.agaclar, a, b, { bant, taraf }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bant, taraf])

  // ---------------------------------------------------------------- cikti
  const suzulmusPaket: AraziPaketi | null = useMemo(() => {
    if (!paket) return null
    return {
      ...paket,
      cizgiler: paket.cizgiler.filter((c) => ikiKatman[c.tur] !== false),
      agaclar: ikiKatman.agac === false ? [] : paket.agaclar,
      konturlar: ikiKatman.kontur === false ? [] : konturlar,
      konturAralik,
    }
  }, [paket, ikiKatman, konturlar, konturAralik])

  const planGorsel = useMemo(
    () => (suzulmusPaket ? planSvg(suzulmusPaket, 1000) : ''),
    [suzulmusPaket],
  )
  const kesitGorsel = useMemo(
    () => (sahne ? kesitSahnesiSvg(sahne, { genislik: 1500, abartma, zemin: '#fcfbf8' }) : ''),
    [sahne, abartma],
  )

  const damga = paket ? `${paket.merkez.enlem.toFixed(4)}_${paket.merkez.boylam.toFixed(4)}` : 'arazi'
  const sayim = veri?.sayim

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="Arazi"
        renk="text-mavi-koyu"
        baslik="Konumdan plan, model ve kesit"
        aciklama="Haritadan bir alan sec ya da serbest bir kesit hatti ciz. Bina, yol, su, yesil alan ve kontur verisi CAD ve 3B programlarina goturebilecegin formatlarda iner. Islem tamamen tarayicinda calisir."
        sag={
          <Segment
            secenekler={[
              { deger: 'plan', ad: 'Plan ve model' },
              { deger: 'kesit', ad: 'Kesit' },
            ]}
            secili={mod}
            degistir={(m) => {
              setMod(m)
              setDurum('bos')
              setSahne(null)
            }}
            className="w-[230px]"
          />
        }
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        {/* ------------------------------------------------------- harita */}
        <div className="order-2 xl:order-1">
          <div className="relative overflow-hidden rounded-[8px] border border-cizgi">
            <div className="absolute top-3 left-1/2 z-[500] w-full max-w-md -translate-x-1/2 px-3">
              <div className="flex items-center gap-2 rounded-[7px] border border-cizgi bg-kart/95 px-3 py-2 backdrop-blur">
                <input
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void konumAra()}
                  placeholder="Yer ara: Selimiye Camii, Edirne"
                  className="w-full bg-transparent text-[14.5px] text-murekkep outline-none placeholder:text-murekkep-3"
                />
                <button
                  onClick={() => void konumAra()}
                  disabled={araniyor}
                  className="shrink-0 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-murekkep disabled:opacity-40"
                >
                  {araniyor ? '...' : 'Ara'}
                </button>
              </div>
              {sonuclar.length > 0 && (
                <ul className="mt-1.5 max-h-60 overflow-y-auto rounded-[7px] border border-cizgi bg-kart">
                  {sonuclar.map((s, i) => (
                    <li key={i} className="border-b border-cizgi last:border-0">
                      <button
                        onClick={() => konumaGit(s)}
                        className="w-full px-3 py-2 text-left text-[13.5px] leading-snug text-murekkep-2 transition-colors hover:bg-mavi-soft hover:text-murekkep"
                      >
                        {s.ad}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div ref={kutuRef} className="h-[440px] w-full" />
          </div>

          <div className="mt-3 flex flex-wrap items-baseline gap-x-7 gap-y-2 text-[13.5px]">
            {mod === 'plan' ? (
              <>
                <Olcu ad="Alan" deger={`${alanKm2.toFixed(3)} km²`} uyari={alanAsiyor} />
                <Olcu ad="Boyut" deger={`${olcu.genislik.toFixed(0)} × ${olcu.yukseklik.toFixed(0)} m`} />
                <Olcu ad="GB" deger={`${kutu.guney.toFixed(5)}, ${kutu.bati.toFixed(5)}`} />
                <Olcu ad="KD" deger={`${kutu.kuzey.toFixed(5)}, ${kutu.dogu.toFixed(5)}`} />
              </>
            ) : (
              <>
                <Olcu ad="Uzunluk" deger={`${hatOlcu.uzunluk.toFixed(0)} m`} />
                <Olcu ad="Yon" deger={`${hatOlcu.aci.toFixed(0)}°`} />
                <Olcu ad="Bant" deger={`${bant} m`} />
                <Olcu ad="A" deger={`${kesitUc[0].enlem.toFixed(5)}, ${kesitUc[0].boylam.toFixed(5)}`} />
                <Olcu ad="B" deger={`${kesitUc[1].enlem.toFixed(5)}, ${kesitUc[1].boylam.toFixed(5)}`} />
              </>
            )}
          </div>

          <p className="mt-2 text-[13.5px] leading-relaxed text-murekkep-3">
            {mod === 'plan'
              ? 'Ortadaki tutamakla alani tasi; kose ve kenar tutamaklariyla en ve boyu ayri ayri ayarla.'
              : 'Uclari surukleyerek uzunlugu ve yonu, ortadaki tutamakla hattin tamamini tasi. Kirmizi ok kesitin hangi tarafi gosterdigini belirtir.'}
          </p>

          {durum === 'hazir' && (
            <div className="mt-7">
              {mod === 'plan' && planGorsel && (
                <>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[17px] text-murekkep">Plan onizleme</h2>
                    {sayim && (
                      <span className="sayi text-[13px] text-murekkep-3">
                        {sayim.bina} bina · {sayim.yol} yol · {konturlar.length} kontur
                      </span>
                    )}
                  </div>
                  <div
                    className="overflow-hidden rounded-[8px] border border-cizgi"
                    dangerouslySetInnerHTML={{ __html: planGorsel }}
                  />
                </>
              )}
              {mod === 'kesit' && kesitGorsel && (
                <>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[17px] text-murekkep">Kesit</h2>
                    {sahne && (
                      <span className="sayi text-[13px] text-murekkep-3">
                        {sahne.binalar.filter((b) => b.kesiliyor).length} kesite giren ·{' '}
                        {sahne.binalar.length} yapi · {sahne.agaclar.length} agac
                      </span>
                    )}
                  </div>
                  <div
                    className="overflow-hidden rounded-[8px] border border-cizgi"
                    dangerouslySetInnerHTML={{ __html: kesitGorsel }}
                  />
                </>
              )}
            </div>
          )}
        </div>

        {/* --------------------------------------------------------- panel */}
        <aside className="order-1 space-y-3.5 xl:order-2">
          {mod === 'plan' ? (
            <>
              <Panel>
                <PanelBasligi
                  baslik="Alan"
                  sag={
                    <span
                      className={`sayi text-[13px] ${alanAsiyor ? 'text-kiremit-koyu' : 'text-murekkep-3'}`}
                    >
                      {alanKm2.toFixed(2)} / {MAKS_ALAN_KM2} km²
                    </span>
                  }
                />
                <div className="px-4 py-3.5">
                  <div className="etiket mb-2">Hazir boyutlar</div>
                  <div className="flex flex-wrap gap-1.5">
                    {HAZIR_BOYUTLAR.map((b) => (
                      <Cip
                        key={b}
                        secili={Math.abs(olcu.genislik - b) < 12 && Math.abs(olcu.yukseklik - b) < 12}
                        onClick={() => setKutu(kutuKur(olcu.merkez, b, b))}
                      >
                        {b} × {b} m
                      </Cip>
                    ))}
                  </div>
                  {alanAsiyor && (
                    <p className="mt-2.5 text-[13px] leading-relaxed text-kiremit-koyu">
                      Alan {MAKS_ALAN_KM2} km² sinirini asiyor. Overpass ucretsiz bir servis;
                      bu buyuklukte yanit vermiyor. Kucult.
                    </p>
                  )}
                </div>
              </Panel>

              <Panel>
                <PanelBasligi baslik="2B Vektorel Plan" acik={ikiAcik} degistir={setIkiAcik} />
                <div className={ikiAcik ? '' : 'pointer-events-none opacity-40'}>
                  <div className="flex flex-wrap gap-1.5 border-b border-cizgi px-4 py-3">
                    {IKI_FORMATLAR.map((f) => (
                      <Cip key={f} secili={ikiFormat === f} onClick={() => setIkiFormat(f)}>
                        {f}
                      </Cip>
                    ))}
                    {['DWG', 'PDF'].map((f) => (
                      <Cip key={f} secili={false} onClick={() => {}} pasif ipucu="Henuz desteklenmiyor">
                        {f}
                      </Cip>
                    ))}
                  </div>
                  {KATMAN_LISTESI.map((k) => (
                    <KatmanSatiri
                      key={k.id}
                      ad={k.ad}
                      renk={k.renk}
                      acik={ikiKatman[k.id] !== false}
                      degistir={(v) => setIkiKatman((o) => ({ ...o, [k.id]: v }))}
                      sag={
                        k.id === 'kontur' ? (
                          <DegerSecici
                            degerler={KONTUR_ARALIKLARI}
                            secili={konturAralik as (typeof KONTUR_ARALIKLARI)[number]}
                            degistir={(v) => {
                              setKonturAralik(v)
                              if (izgara) setKonturlar(konturUret(izgara, { aralik: v }))
                            }}
                            birim=" m"
                          />
                        ) : sayim ? (
                          <span className="sayi text-[13px] text-murekkep-3">
                            {sayim[k.id as KatmanTuru] ?? 0}
                          </span>
                        ) : undefined
                      }
                    />
                  ))}
                </div>
              </Panel>

              <Panel>
                <PanelBasligi baslik="3B Model" acik={ucAcik} degistir={setUcAcik} />
                <div className={ucAcik ? '' : 'pointer-events-none opacity-40'}>
                  <div className="flex flex-wrap gap-1.5 border-b border-cizgi px-4 py-3">
                    <Cip secili onClick={() => {}}>
                      OBJ
                    </Cip>
                    {['STL', 'glTF', 'SKP', 'IFC'].map((f) => (
                      <Cip key={f} secili={false} onClick={() => {}} pasif ipucu="Henuz desteklenmiyor">
                        {f}
                      </Cip>
                    ))}
                  </div>
                  <KatmanSatiri
                    ad="Bina kutleleri"
                    renk="bg-kiremit"
                    acik={binaKutle}
                    degistir={setBinaKutle}
                  />
                  <KatmanSatiri
                    ad="Arazi yuzeyi"
                    renk="bg-kehribar"
                    acik
                    degistir={() => {}}
                    sag={
                      <DegerSecici
                        degerler={AG_COZUNURLUKLARI}
                        secili={agCozunurluk as (typeof AG_COZUNURLUKLARI)[number]}
                        degistir={setAgCozunurluk}
                        birim=" m"
                      />
                    }
                  />
                </div>
              </Panel>
            </>
          ) : (
            <Panel>
              <PanelBasligi baslik="Kesit hatti" />
              <div className="space-y-4 px-4 py-4">
                <div>
                  <div className="etiket mb-2">Kesit hangi tarafi gostersin</div>
                  <Segment
                    secenekler={[
                      { deger: 'on', ad: 'On', ipucu: 'Okun gosterdigi taraf' },
                      { deger: 'arka', ad: 'Arka', ipucu: 'Okun tersi taraf' },
                      { deger: 'iki', ad: 'Iki taraf', ipucu: 'Hattin iki yani' },
                    ]}
                    secili={taraf}
                    degistir={setTaraf}
                  />
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Hattin uzerinden gecen yapilar yon fark etmeksizin her zaman kesite girer.
                    Secim, arkada gorunuse girecek dokuyu belirler.
                  </p>
                </div>

                <div className="border-t border-cizgi pt-3.5">
                  <div className="etiket mb-2">Bant derinligi</div>
                  <div className="flex flex-wrap gap-1.5">
                    {BANTLAR.map((b) => (
                      <Cip key={b} secili={bant === b} onClick={() => setBant(b)}>
                        {b} m
                      </Cip>
                    ))}
                  </div>
                </div>

                <div className="border-t border-cizgi pt-3.5">
                  <div className="etiket mb-2">Dusey abartma</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ABARTMALAR.map((a) => (
                      <Cip key={a} secili={abartma === a} onClick={() => setAbartma(a)}>
                        {a}x
                      </Cip>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Yalnizca cizimi etkiler; DXF gercek olcude 1:1 uretilir.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-cizgi pt-3.5">
                  <Cip secili={false} onClick={() => setKesitUc(([a, b]) => [b, a])}>
                    Yonu cevir
                  </Cip>
                  <Cip secili={false} onClick={() => setKesitUc((u) => dondur(u, 90))}>
                    90° dondur
                  </Cip>
                </div>
              </div>
            </Panel>
          )}

          <button
            onClick={() => void olustur()}
            disabled={durum === 'yukleniyor' || (mod === 'plan' && alanAsiyor)}
            className="w-full rounded-[7px] bg-kiremit px-5 py-3.5 text-[15px] font-medium text-white transition-opacity duration-200 hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {durum === 'yukleniyor'
              ? 'Hazirlaniyor...'
              : mod === 'plan'
                ? 'Araziyi olustur'
                : 'Kesiti olustur'}
          </button>

          {durum === 'yukleniyor' && ilerleme && (
            <p className="text-[13.5px] text-mavi-koyu">{ilerleme}</p>
          )}
          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-kiremit-koyu">
              {hata}
            </p>
          )}

          {durum === 'hazir' && (
            <Panel>
              <PanelBasligi baslik="Indir" />
              <div className="space-y-2 px-4 py-3.5">
                {mod === 'plan' && suzulmusPaket ? (
                  <>
                    {ikiAcik && (
                      <IndirSatiri
                        ad={`2B Plan · ${ikiFormat}`}
                        alt="Katmanli, metre biriminde"
                        onClick={() => {
                          if (ikiFormat === 'DXF')
                            dosyaIndir(planDxf(suzulmusPaket), `archlib_plan_${damga}.dxf`, 'application/dxf')
                          else if (ikiFormat === 'SVG')
                            dosyaIndir(planSvg(suzulmusPaket, 2200), `archlib_plan_${damga}.svg`, 'image/svg+xml')
                          else {
                            const pr = new Projeksiyon(suzulmusPaket.merkez)
                            dosyaIndir(
                              geoJson(suzulmusPaket, (x, y) => pr.geri(x, y)),
                              `archlib_plan_${damga}.geojson`,
                              'application/geo+json',
                            )
                          }
                        }}
                      />
                    )}
                    {ucAcik && (
                      <IndirSatiri
                        ad="3B Model · OBJ"
                        alt={`Arazi ${izgara ? izgara.adim.toFixed(0) + ' m ag' : 'yuzeyi'}${binaKutle ? ' + bina kutleleri' : ''}`}
                        onClick={() =>
                          dosyaIndir(
                            modelObj(suzulmusPaket, binaKutle),
                            `archlib_model_${damga}.obj`,
                            'text/plain',
                          )
                        }
                      />
                    )}
                  </>
                ) : (
                  sahne && (
                    <>
                      <IndirSatiri
                        ad="Kesit · DXF"
                        alt="Zemin, yapi ve agac ayri katmanda"
                        onClick={() =>
                          dosyaIndir(kesitSahnesiDxf(sahne), `archlib_kesit_${damga}.dxf`, 'application/dxf')
                        }
                      />
                      <IndirSatiri
                        ad="Kesit · SVG"
                        alt="Paftaya dogrudan konabilir"
                        onClick={() =>
                          dosyaIndir(
                            kesitSahnesiSvg(sahne, { genislik: 2400, abartma }),
                            `archlib_kesit_${damga}.svg`,
                            'image/svg+xml',
                          )
                        }
                      />
                    </>
                  )
                )}
                <p className="pt-1 text-[12.5px] leading-relaxed text-murekkep-3">
                  Veri: OpenStreetMap (ODbL) ve AWS Terrain Tiles. Kullandiginda kaynak belirt.
                  Bina yuksekligi etiketli degilse iki kat varsayilir.
                </p>
              </div>
            </Panel>
          )}
        </aside>
      </div>
    </div>
  )
}

// ------------------------------------------------------------- parcalar

function Olcu({ ad, deger, uyari }: { ad: string; deger: string; uyari?: boolean }) {
  return (
    <span className="flex items-baseline gap-2">
      <span className="etiket">{ad}</span>
      <span className={`sayi font-medium ${uyari ? 'text-kiremit-koyu' : 'text-murekkep'}`}>
        {deger}
      </span>
    </span>
  )
}

function IndirSatiri({ ad, alt, onClick }: { ad: string; alt: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 rounded-[7px] border border-cizgi px-3.5 py-2.5 text-left transition-colors duration-200 hover:border-kiremit/45 hover:bg-kiremit-soft/60"
    >
      <span>
        <span className="block text-[14px] font-medium text-murekkep">{ad}</span>
        <span className="mt-0.5 block text-[12.5px] text-murekkep-3">{alt}</span>
      </span>
      <IkonIndir className="h-[16px] w-[16px] shrink-0 text-murekkep-3 transition-colors group-hover:text-kiremit-koyu" />
    </button>
  )
}

// ------------------------------------------------------------ yardimcilar

function olcuBalonu(grup: L.LayerGroup, konum: [number, number], metin: string, buyuk = false): void {
  L.tooltip({
    permanent: true,
    direction: buyuk ? 'top' : 'center',
    className: buyuk ? 'archlib-olcu' : 'archlib-olcu-kucuk',
  })
    .setLatLng(konum)
    .setContent(metin)
    .addTo(grup)
}

/** Kenarlar ters donmesin ve alan sifirlanmasin diye kutuyu duzeltir. */
function duzelt(k: Kutu): Kutu {
  const enAz = 0.0006
  const guney = Math.min(k.guney, k.kuzey - enAz)
  const kuzey = Math.max(k.kuzey, guney + enAz)
  const bati = Math.min(k.bati, k.dogu - enAz)
  const dogu = Math.max(k.dogu, bati + enAz)
  return { guney, kuzey, bati, dogu }
}

function hattiOlc([a, b]: [Konum, Konum]) {
  const orta = { enlem: (a.enlem + b.enlem) / 2, boylam: (a.boylam + b.boylam) / 2 }
  const p = new Projeksiyon(orta)
  const A = p.ileri(a.enlem, a.boylam)
  const B = p.ileri(b.enlem, b.boylam)
  const aci = (Math.atan2(B.x - A.x, B.y - A.y) * 180) / Math.PI
  return { orta, uzunluk: Math.hypot(B.x - A.x, B.y - A.y), aci: (aci + 360) % 360 }
}

function dondur([a, b]: [Konum, Konum], derece: number): [Konum, Konum] {
  const orta = { enlem: (a.enlem + b.enlem) / 2, boylam: (a.boylam + b.boylam) / 2 }
  const p = new Projeksiyon(orta)
  const A = p.ileri(a.enlem, a.boylam)
  const B = p.ileri(b.enlem, b.boylam)
  const r = (derece * Math.PI) / 180
  const cs = Math.cos(r)
  const sn = Math.sin(r)
  const don = (n: Nokta) => p.geri(n.x * cs - n.y * sn, n.x * sn + n.y * cs)
  return [don(A), don(B)]
}
