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
import { bolumBul } from '../ui/bolumler'

type Mod = 'plan' | 'kesit'
type Durum = 'bos' | 'yukleniyor' | 'hazir' | 'hata'
type Kutu = { guney: number; bati: number; kuzey: number; dogu: number }
type Konum = { enlem: number; boylam: number }

const BASLANGIC: Konum = { enlem: 41.6771, boylam: 26.5557 }
const MAKS_ALAN_KM2 = 4
const EN_KUCUK_ADIM = 0.00008
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
  { id: 'su', ad: 'Su yolları', renk: 'bg-mavi' },
  { id: 'yesil', ad: 'Yeşil alanlar', renk: 'bg-adacayi' },
  { id: 'agac', ad: 'Ağaçlar', renk: 'bg-adacayi' },
  { id: 'kontur', ad: 'Kontur çizgileri', renk: 'bg-kehribar' },
]

// --------------------------------------------------------------- tutamaklar

type TutamakTuru = 'kose-nwse' | 'kose-nesw' | 'kenar-ns' | 'kenar-ew' | 'uc' | 'tasi'

/**
 * Tutamak ikonu 30x30 saydam bir kare; icindeki <i> gorunen kucuk sekildir.
 * Boylece hedef alani parmakla bile rahat yakalanirken cizim ince kalir.
 */
const TUTAMAK_BOYUT = 30
const TUTAMAK_GORSELI: Record<TutamakTuru, string> = {
  'kose-nwse': 'width:13px;height:13px;background:#fffefa;border:2px solid #30332d;border-radius:3px',
  'kose-nesw': 'width:13px;height:13px;background:#fffefa;border:2px solid #30332d;border-radius:3px',
  'kenar-ns': 'width:24px;height:8px;background:#fffefa;border:2px solid #5f6259;border-radius:4px',
  'kenar-ew': 'width:8px;height:24px;background:#fffefa;border:2px solid #5f6259;border-radius:4px',
  uc: 'width:15px;height:15px;background:#b9573e;border:2.5px solid #fffefa;border-radius:50%',
  tasi: 'width:26px;height:26px;background:#fffefa;border:1px solid #cfcdc2;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#5f6259;font-size:13px;line-height:1',
}

function tutamak(tur: TutamakTuru): L.DivIcon {
  return L.divIcon({
    className: `archlib-tutamak archlib-${tur}`,
    iconSize: [TUTAMAK_BOYUT, TUTAMAK_BOYUT],
    iconAnchor: [TUTAMAK_BOYUT / 2, TUTAMAK_BOYUT / 2],
    html: `<i style="${TUTAMAK_GORSELI[tur]};box-shadow:0 1px 5px rgba(48,51,45,.22)">${
      tur === 'tasi' ? '✥' : ''
    }</i>`,
  })
}

function tutamakKur(
  grup: L.LayerGroup,
  konum: [number, number],
  tur: TutamakTuru,
): L.Marker {
  return L.marker(konum, {
    icon: tutamak(tur),
    draggable: true,
    // Kenara yaklasinca harita kendiliginden kayar; secim cerceveden tasmaz.
    autoPan: true,
    autoPanPadding: [48, 48],
    autoPanSpeed: 12,
    keyboard: false,
    zIndexOffset: tur === 'tasi' ? 400 : 600,
  }).addTo(grup)
}

/**
 * Bir SVG govdesini (dikdortgenin ici, kesit hatti) dogrudan surukletir.
 * Pointer olaylari kullanildigi icin fare, kalem ve dokunma ayni yoldan gecer;
 * pointer capture sayesinde imlec sekilden cikinca da surukleme kopmaz.
 */
function govdeSurukleBagla(
  harita: L.Map,
  el: Element | null | undefined,
  basla: () => void,
  hareket: (dEnlem: number, dBoylam: number) => void,
  bitir: () => void,
  imlec = 'move',
): () => void {
  if (!el) return () => {}
  const hedef = el as SVGElement
  hedef.style.cursor = imlec
  hedef.style.touchAction = 'none'
  hedef.style.pointerEvents = 'all'
  let onceki: L.LatLng | null = null

  const bas = (e: PointerEvent) => {
    if (e.button !== 0) return
    onceki = harita.mouseEventToLatLng(e as unknown as MouseEvent)
    harita.dragging.disable()
    try {
      hedef.setPointerCapture(e.pointerId)
    } catch {
      /* yakalama desteklenmiyorsa olaylar yine de belgeye dusuyor */
    }
    basla()
    e.preventDefault()
    e.stopPropagation()
  }
  const git = (e: PointerEvent) => {
    if (!onceki) return
    const su = harita.mouseEventToLatLng(e as unknown as MouseEvent)
    hareket(su.lat - onceki.lat, su.lng - onceki.lng)
    onceki = su
    e.preventDefault()
  }
  const bit = (e: PointerEvent) => {
    if (!onceki) return
    onceki = null
    harita.dragging.enable()
    try {
      hedef.releasePointerCapture(e.pointerId)
    } catch {
      /* zaten birakilmis */
    }
    bitir()
  }

  hedef.addEventListener('pointerdown', bas)
  hedef.addEventListener('pointermove', git)
  hedef.addEventListener('pointerup', bit)
  hedef.addEventListener('pointercancel', bit)
  return () => {
    hedef.removeEventListener('pointerdown', bas)
    hedef.removeEventListener('pointermove', git)
    hedef.removeEventListener('pointerup', bit)
    hedef.removeEventListener('pointercancel', bit)
  }
}

interface Sekiller {
  dikdortgen?: L.Rectangle
  koseler: L.Marker[]
  kenarlar: L.Marker[]
  merkez?: L.Marker
  olcuG?: L.Tooltip
  olcuY?: L.Tooltip
  bant?: L.Polygon
  hat?: L.Polyline
  hatTut?: L.Polyline
  ok?: L.Polyline
  okUc?: L.Marker
  uclar: L.Marker[]
  hatOlcu?: L.Tooltip
  cozumler: (() => void)[]
}

function bosSekiller(): Sekiller {
  return { koseler: [], kenarlar: [], uclar: [], cozumler: [] }
}

export default function Arazi() {
  const kutuRef = useRef<HTMLDivElement>(null)
  const haritaRef = useRef<L.Map | null>(null)
  const grupRef = useRef<L.LayerGroup | null>(null)
  const iptalRef = useRef<AbortController | null>(null)
  const sekilRef = useRef<Sekiller>(bosSekiller())

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

  // Surukleme sirasinda gecerli geometri React'ten degil bu referanslardan
  // okunur; React durumu her karede degil, animasyon karesinde tazelenir.
  const anlikKutu = useRef(kutu)
  const anlikKesit = useRef(kesitUc)
  const anlikBant = useRef(bant)
  const anlikTaraf = useRef(taraf)
  const surukluyor = useRef(false)
  const kareRef = useRef(0)

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

  anlikBant.current = bant
  anlikTaraf.current = taraf

  // -------------------------------------------------------- durum tazeleme
  const tazele = useCallback(() => {
    if (kareRef.current) return
    kareRef.current = requestAnimationFrame(() => {
      kareRef.current = 0
      setKutu(anlikKutu.current)
      setKesitUc(anlikKesit.current)
    })
  }, [])

  const surukleBitti = useCallback(() => {
    surukluyor.current = false
    if (kareRef.current) {
      cancelAnimationFrame(kareRef.current)
      kareRef.current = 0
    }
    setKutu(anlikKutu.current)
    setKesitUc(anlikKesit.current)
  }, [])

  // --------------------------------------------------------- senkronizasyon
  const planSenkron = useCallback((k: Kutu, haric?: L.Layer) => {
    const s = sekilRef.current
    if (!s.dikdortgen) return
    s.dikdortgen.setBounds([
      [k.guney, k.bati],
      [k.kuzey, k.dogu],
    ])
    const oy = (k.guney + k.kuzey) / 2
    const ox = (k.bati + k.dogu) / 2

    const koseKonum: [number, number][] = [
      [k.guney, k.bati],
      [k.guney, k.dogu],
      [k.kuzey, k.dogu],
      [k.kuzey, k.bati],
    ]
    s.koseler.forEach((m, i) => {
      if (m !== haric) m.setLatLng(koseKonum[i])
    })

    const kenarKonum: [number, number][] = [
      [k.guney, ox],
      [k.kuzey, ox],
      [oy, k.bati],
      [oy, k.dogu],
    ]
    s.kenarlar.forEach((m, i) => {
      if (m !== haric) m.setLatLng(kenarKonum[i])
    })

    if (s.merkez && s.merkez !== haric) s.merkez.setLatLng([oy, ox])

    const o = kutuOlcu(k)
    s.olcuG?.setLatLng([k.kuzey, ox]).setContent(`${o.genislik.toFixed(0)} m`)
    s.olcuY?.setLatLng([oy, k.bati]).setContent(`${o.yukseklik.toFixed(0)} m`)

    const asti = (o.genislik * o.yukseklik) / 1_000_000 > MAKS_ALAN_KM2
    s.dikdortgen.setStyle({
      color: asti ? '#b9573e' : '#30332d',
      fillColor: asti ? '#b9573e' : '#5c7c92',
    })
  }, [])

  const kesitSenkron = useCallback(
    (u: [Konum, Konum], bantD: number, tarafD: KesitTarafi, haric?: L.Layer) => {
      const s = sekilRef.current
      if (!s.hat) return
      const [A, B] = u
      const orta = { enlem: (A.enlem + B.enlem) / 2, boylam: (A.boylam + B.boylam) / 2 }
      const proj = new Projeksiyon(orta)
      const a = proj.ileri(A.enlem, A.boylam)
      const b = proj.ileri(B.enlem, B.boylam)
      const uz = Math.hypot(b.x - a.x, b.y - a.y) || 1
      const nx = -(b.y - a.y) / uz
      const ny = (b.x - a.x) / uz

      const ust = tarafD === 'arka' ? 0 : tarafD === 'on' ? bantD : bantD / 2
      const alt = tarafD === 'on' ? 0 : tarafD === 'arka' ? -bantD : -bantD / 2
      const kaydir = (p: Nokta, m: number): [number, number] => {
        const q = proj.geri(p.x + nx * m, p.y + ny * m)
        return [q.enlem, q.boylam]
      }

      s.bant?.setLatLngs([kaydir(a, ust), kaydir(b, ust), kaydir(b, alt), kaydir(a, alt)])

      const hatNokta: [number, number][] = [
        [A.enlem, A.boylam],
        [B.enlem, B.boylam],
      ]
      s.hat.setLatLngs(hatNokta)
      s.hatTut?.setLatLngs(hatNokta)

      // Bakis oku hattin %28'inde durur; ortadaki tasima tutamagiyla cakismaz.
      const okKok: Nokta = { x: a.x + (b.x - a.x) * 0.28, y: a.y + (b.y - a.y) * 0.28 }
      if (tarafD === 'iki') {
        s.ok?.setStyle({ opacity: 0 })
        s.okUc?.setOpacity(0)
      } else {
        const yon = tarafD === 'on' ? 1 : -1
        const boy = Math.min(64, Math.max(24, bantD * 0.45))
        s.ok?.setStyle({ opacity: 1 })
        s.ok?.setLatLngs([kaydir(okKok, 0), kaydir(okKok, boy * yon)])
        s.okUc?.setOpacity(1)
        s.okUc?.setLatLng(kaydir(okKok, boy * yon))
      }

      s.uclar.forEach((m, i) => {
        if (m !== haric) m.setLatLng(hatNokta[i])
      })
      if (s.merkez && s.merkez !== haric) s.merkez.setLatLng([orta.enlem, orta.boylam])
      s.hatOlcu?.setLatLng([orta.enlem, orta.boylam]).setContent(`${uz.toFixed(0)} m`)
    },
    [],
  )

  // ------------------------------------------------------------ harita kur
  useEffect(() => {
    if (!kutuRef.current || haritaRef.current) return
    const harita = L.map(kutuRef.current, {
      center: [BASLANGIC.enlem, BASLANGIC.boylam],
      zoom: 15,
      zoomControl: true,
      // Yumusak tekerlek yakinlastirmasi; CAD altligi secerken kadraj kacmaz.
      scrollWheelZoom: true,
      wheelPxPerZoomLevel: 120,
      zoomSnap: 0.25,
      zoomDelta: 0.5,
      // Hizli birakislarda kadraj firlamasin: sinirli hiz, kisa sonumleme.
      inertia: true,
      inertiaDeceleration: 3400,
      inertiaMaxSpeed: 1200,
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

  // ------------------------------------------- katmanlari bir kez insa et
  useEffect(() => {
    const harita = haritaRef.current
    const grup = grupRef.current
    if (!harita || !grup) return

    const s = bosSekiller()
    sekilRef.current = s

    if (mod === 'plan') {
      const k = anlikKutu.current
      s.dikdortgen = L.rectangle(
        [
          [k.guney, k.bati],
          [k.kuzey, k.dogu],
        ],
        { color: '#30332d', weight: 1.5, fillColor: '#5c7c92', fillOpacity: 0.07 },
      ).addTo(grup)

      s.olcuG = olcuBalonu(grup)
      s.olcuY = olcuBalonu(grup)

      // Kose: karsi kose sabit, en ve boy birlikte degisir.
      const koseAlan: [('guney' | 'kuzey'), ('bati' | 'dogu'), TutamakTuru][] = [
        ['guney', 'bati', 'kose-nesw'],
        ['guney', 'dogu', 'kose-nwse'],
        ['kuzey', 'dogu', 'kose-nesw'],
        ['kuzey', 'bati', 'kose-nwse'],
      ]
      s.koseler = koseAlan.map(([dikey, yatay, tur]) => {
        const m = tutamakKur(grup, [k[dikey], k[yatay]], tur)
        m.on('dragstart', () => {
          surukluyor.current = true
        })
        m.on('drag', () => {
          const ll = m.getLatLng()
          const yeni = duzelt({ ...anlikKutu.current, [dikey]: ll.lat, [yatay]: ll.lng })
          anlikKutu.current = yeni
          planSenkron(yeni, m)
          tazele()
        })
        m.on('dragend', () => {
          planSenkron(anlikKutu.current)
          surukleBitti()
        })
        return m
      })

      // Kenar: tek eksende boyutlandirir.
      const kenarAlan: [('guney' | 'kuzey' | 'bati' | 'dogu'), 'e' | 'b', TutamakTuru][] = [
        ['guney', 'e', 'kenar-ns'],
        ['kuzey', 'e', 'kenar-ns'],
        ['bati', 'b', 'kenar-ew'],
        ['dogu', 'b', 'kenar-ew'],
      ]
      const kenarBaslangic: [number, number][] = [
        [k.guney, (k.bati + k.dogu) / 2],
        [k.kuzey, (k.bati + k.dogu) / 2],
        [(k.guney + k.kuzey) / 2, k.bati],
        [(k.guney + k.kuzey) / 2, k.dogu],
      ]
      s.kenarlar = kenarAlan.map(([alan, eksen, tur], i) => {
        const m = tutamakKur(grup, kenarBaslangic[i], tur)
        m.on('dragstart', () => {
          surukluyor.current = true
        })
        m.on('drag', () => {
          const ll = m.getLatLng()
          const yeni = duzelt({
            ...anlikKutu.current,
            [alan]: eksen === 'e' ? ll.lat : ll.lng,
          })
          anlikKutu.current = yeni
          planSenkron(yeni, m)
          tazele()
        })
        m.on('dragend', () => {
          planSenkron(anlikKutu.current)
          surukleBitti()
        })
        return m
      })

      const tasiKutu = (dEnlem: number, dBoylam: number) => {
        const o = anlikKutu.current
        anlikKutu.current = {
          guney: o.guney + dEnlem,
          kuzey: o.kuzey + dEnlem,
          bati: o.bati + dBoylam,
          dogu: o.dogu + dBoylam,
        }
      }

      s.merkez = tutamakKur(grup, [(k.guney + k.kuzey) / 2, (k.bati + k.dogu) / 2], 'tasi')
      s.merkez.on('dragstart', () => {
        surukluyor.current = true
      })
      s.merkez.on('drag', () => {
        const ll = s.merkez!.getLatLng()
        const o = anlikKutu.current
        tasiKutu(ll.lat - (o.guney + o.kuzey) / 2, ll.lng - (o.bati + o.dogu) / 2)
        planSenkron(anlikKutu.current, s.merkez)
        tazele()
      })
      s.merkez.on('dragend', () => {
        planSenkron(anlikKutu.current)
        surukleBitti()
      })

      // Dikdortgenin ici de suruklenir: hedefi tasimak icin tutamak aramak
      // gerekmez, kutunun herhangi bir yerinden cekmek yeter.
      s.cozumler.push(
        govdeSurukleBagla(
          harita,
          s.dikdortgen.getElement(),
          () => {
            surukluyor.current = true
          },
          (dEnlem, dBoylam) => {
            tasiKutu(dEnlem, dBoylam)
            planSenkron(anlikKutu.current)
            tazele()
          },
          surukleBitti,
        ),
      )

      planSenkron(anlikKutu.current)
    } else {
      const u = anlikKesit.current
      s.bant = L.polygon([], {
        color: '#5c7c92',
        weight: 1,
        dashArray: '5 4',
        fillColor: '#5c7c92',
        fillOpacity: 0.1,
        interactive: false,
      }).addTo(grup)
      s.ok = L.polyline([], { color: '#b9573e', weight: 2.5, interactive: false }).addTo(grup)
      s.okUc = L.marker([0, 0], {
        icon: L.divIcon({
          className: '',
          iconSize: [11, 11],
          iconAnchor: [5.5, 5.5],
          html: '<div style="width:11px;height:11px;background:#b9573e;border-radius:50%;border:2px solid #fffefa"></div>',
        }),
        interactive: false,
      }).addTo(grup)
      s.hat = L.polyline([], { color: '#30332d', weight: 2.5, interactive: false }).addTo(grup)
      // Gorunmez kalin es hat: 22 px'lik yakalama seridi.
      s.hatTut = L.polyline([], {
        color: '#30332d',
        weight: 22,
        opacity: 0.001,
        lineCap: 'butt',
      }).addTo(grup)
      s.hatOlcu = olcuBalonu(grup, true)

      s.uclar = [0, 1].map((i) => {
        const m = tutamakKur(grup, [u[i].enlem, u[i].boylam], 'uc')
        m.on('dragstart', () => {
          surukluyor.current = true
        })
        m.on('drag', () => {
          const ll = m.getLatLng()
          const y: [Konum, Konum] = [anlikKesit.current[0], anlikKesit.current[1]]
          y[i] = { enlem: ll.lat, boylam: ll.lng }
          anlikKesit.current = y
          kesitSenkron(y, anlikBant.current, anlikTaraf.current, m)
          tazele()
        })
        m.on('dragend', () => {
          kesitSenkron(anlikKesit.current, anlikBant.current, anlikTaraf.current)
          surukleBitti()
        })
        return m
      })

      const tasiHat = (dEnlem: number, dBoylam: number) => {
        const [p, q] = anlikKesit.current
        anlikKesit.current = [
          { enlem: p.enlem + dEnlem, boylam: p.boylam + dBoylam },
          { enlem: q.enlem + dEnlem, boylam: q.boylam + dBoylam },
        ]
      }

      s.merkez = tutamakKur(
        grup,
        [(u[0].enlem + u[1].enlem) / 2, (u[0].boylam + u[1].boylam) / 2],
        'tasi',
      )
      s.merkez.on('dragstart', () => {
        surukluyor.current = true
      })
      s.merkez.on('drag', () => {
        const ll = s.merkez!.getLatLng()
        const [p, q] = anlikKesit.current
        tasiHat(ll.lat - (p.enlem + q.enlem) / 2, ll.lng - (p.boylam + q.boylam) / 2)
        kesitSenkron(anlikKesit.current, anlikBant.current, anlikTaraf.current, s.merkez)
        tazele()
      })
      s.merkez.on('dragend', () => {
        kesitSenkron(anlikKesit.current, anlikBant.current, anlikTaraf.current)
        surukleBitti()
      })

      s.cozumler.push(
        govdeSurukleBagla(
          harita,
          s.hatTut.getElement(),
          () => {
            surukluyor.current = true
          },
          (dEnlem, dBoylam) => {
            tasiHat(dEnlem, dBoylam)
            kesitSenkron(anlikKesit.current, anlikBant.current, anlikTaraf.current)
            tazele()
          },
          surukleBitti,
        ),
      )

      kesitSenkron(anlikKesit.current, anlikBant.current, anlikTaraf.current)
    }

    return () => {
      for (const coz of sekilRef.current.cozumler) coz()
      sekilRef.current = bosSekiller()
      grup.clearLayers()
    }
  }, [mod, planSenkron, kesitSenkron, tazele, surukleBitti])

  // ------------------------- disaridan gelen degisiklikleri haritaya yansit
  useEffect(() => {
    anlikKutu.current = kutu
    if (surukluyor.current || mod !== 'plan') return
    planSenkron(kutu)
  }, [kutu, mod, planSenkron])

  useEffect(() => {
    anlikKesit.current = kesitUc
    if (surukluyor.current || mod !== 'kesit') return
    kesitSenkron(kesitUc, bant, taraf)
  }, [kesitUc, bant, taraf, mod, kesitSenkron])

  useEffect(
    () => () => {
      if (kareRef.current) cancelAnimationFrame(kareRef.current)
    },
    [],
  )

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
      if (!r.ok) throw new Error(`Arama başarısız (${r.status})`)
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
      const yari = Math.max(120, hatOlcu.uzunluk / 2)
      setKesitUc([p.geri(-yari, 0), p.geri(yari, 0)])
    }
    setSonuclar([])
    setArama(s.ad.split(',')[0])
    haritaRef.current?.flyTo([s.enlem, s.boylam], 16, { duration: 0.7 })
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
      setIlerleme('Yükseklik verisi indiriliyor')
      const g = await yukseklikGetir(proj, yariG, yariY, agCozunurluk, kontrol.signal)

      setIlerleme('OpenStreetMap verisi indiriliyor')
      const v = await araziVerisiGetir(proj, yariG, yariY, kontrol.signal)

      setIlerleme('Kontur çizgileri hesaplanıyor')
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
      setHata((e as Error).message || 'Veri alınamadı.')
      setDurum('hata')
    } finally {
      iptalRef.current = null
    }
  }

  // Bant / taraf degisince veriyi yeniden cekmeden kesiti tazele
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
        renk={bolumBul('arazi').metin}
        baslik="Konumdan plan, model ve kesit"
        aciklama="Haritadan bir alan seç ya da serbest bir kesit hattı çiz. Bina, yol, su, yeşil alan ve kontur verisi CAD ve 3B programlarına götürebileceğin formatlarda iner. İşlem tamamen tarayıcında çalışır."
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
                        className="w-full px-3 py-2 text-left text-[13.5px] leading-snug text-murekkep-2 transition-colors hover:bg-zeytin-soft hover:text-murekkep"
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
              ? 'Kutunun herhangi bir yerinden tutup taşı; köşe tutamakları en ve boyu birlikte, kenar tutamakları tek yönde ayarlar.'
              : 'Hattın üzerinden tutup taşı, uçlarından uzunluk ve yönü ayarla. Kırmızı ok kesitin hangi tarafı gösterdiğini belirtir.'}
          </p>

          {durum === 'hazir' && (
            <div className="mt-7">
              {mod === 'plan' && planGorsel && (
                <>
                  <div className="mb-2.5 flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-[17px] text-murekkep">Plan önizleme</h2>
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
                        {sahne.binalar.length} yapı · {sahne.agaclar.length} ağaç
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
                  <div className="etiket mb-2">Hazır boyutlar</div>
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
                      Alan {MAKS_ALAN_KM2} km² sınırını aşıyor. Overpass ücretsiz bir servis;
                      bu büyüklükte yanıt vermiyor. Küçült.
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
                      <Cip key={f} secili={false} onClick={() => {}} pasif ipucu="Henüz desteklenmiyor">
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
                      <Cip key={f} secili={false} onClick={() => {}} pasif ipucu="Henüz desteklenmiyor">
                        {f}
                      </Cip>
                    ))}
                  </div>
                  <KatmanSatiri
                    ad="Bina kütleleri"
                    renk="bg-kiremit"
                    acik={binaKutle}
                    degistir={setBinaKutle}
                  />
                  <KatmanSatiri
                    ad="Arazi yüzeyi"
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
                  <div className="etiket mb-2">Kesit hangi tarafı göstersin</div>
                  <Segment
                    secenekler={[
                      { deger: 'on', ad: 'Ön', ipucu: 'Okun gösterdiği taraf' },
                      { deger: 'arka', ad: 'Arka', ipucu: 'Okun tersi taraf' },
                      { deger: 'iki', ad: 'İki taraf', ipucu: 'Hattın iki yanı' },
                    ]}
                    secili={taraf}
                    degistir={setTaraf}
                  />
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Hattın üzerinden geçen yapılar yön fark etmeksizin her zaman kesite girer.
                    Seçim, arkada görünüşe girecek dokuyu belirler.
                  </p>
                </div>

                <div className="border-t border-cizgi pt-3.5">
                  <div className="etiket mb-2">Bant derinliği</div>
                  <div className="flex flex-wrap gap-1.5">
                    {BANTLAR.map((b) => (
                      <Cip key={b} secili={bant === b} onClick={() => setBant(b)}>
                        {b} m
                      </Cip>
                    ))}
                  </div>
                </div>

                <div className="border-t border-cizgi pt-3.5">
                  <div className="etiket mb-2">Düşey abartma</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ABARTMALAR.map((a) => (
                      <Cip key={a} secili={abartma === a} onClick={() => setAbartma(a)}>
                        {a}x
                      </Cip>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Yalnızca çizimi etkiler; DXF gerçek ölçüde 1:1 üretilir.
                  </p>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-cizgi pt-3.5">
                  <Cip secili={false} onClick={() => setKesitUc(([a, b]) => [b, a])}>
                    Yönü çevir
                  </Cip>
                  <Cip secili={false} onClick={() => setKesitUc((u) => dondur(u, 90))}>
                    90° döndür
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
              ? 'Hazırlanıyor...'
              : mod === 'plan'
                ? 'Araziyi oluştur'
                : 'Kesiti oluştur'}
          </button>

          {durum === 'yukleniyor' && ilerleme && (
            <p className="text-[13.5px] text-zeytin-koyu">{ilerleme}</p>
          )}
          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-kiremit-koyu">
              {hata}
            </p>
          )}

          {durum === 'hazir' && (
            <Panel>
              <PanelBasligi baslik="İndir" />
              <div className="space-y-2 px-4 py-3.5">
                {mod === 'plan' && suzulmusPaket ? (
                  <>
                    {ikiAcik && (
                      <IndirSatiri
                        ad={`2B Plan · ${ikiFormat}`}
                        alt="Katmanlı, metre biriminde"
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
                        alt={`Arazi ${izgara ? izgara.adim.toFixed(0) + ' m ağ' : 'yüzeyi'}${binaKutle ? ' + bina kütleleri' : ''}`}
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
                        alt="Zemin, yapı ve ağaç ayrı katmanda"
                        onClick={() =>
                          dosyaIndir(kesitSahnesiDxf(sahne), `archlib_kesit_${damga}.dxf`, 'application/dxf')
                        }
                      />
                      <IndirSatiri
                        ad="Kesit · SVG"
                        alt="Paftaya doğrudan konabilir"
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
                  Veri: OpenStreetMap (ODbL) ve AWS Terrain Tiles. Kullandığında kaynak belirt.
                  Bina yüksekliği etiketli değilse iki kat varsayılır.
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

function olcuBalonu(grup: L.LayerGroup, buyuk = false): L.Tooltip {
  return L.tooltip({
    permanent: true,
    direction: buyuk ? 'top' : 'center',
    className: buyuk ? 'archlib-olcu' : 'archlib-olcu-kucuk',
    offset: buyuk ? [0, -16] : [0, 0],
    interactive: false,
  })
    .setLatLng([0, 0])
    .setContent('')
    .addTo(grup)
}

/** Kenarlar ters donmesin ve alan sifirlanmasin diye kutuyu duzeltir. */
function duzelt(k: Kutu): Kutu {
  const guney = Math.min(k.guney, k.kuzey - EN_KUCUK_ADIM)
  const kuzey = Math.max(k.kuzey, guney + EN_KUCUK_ADIM)
  const bati = Math.min(k.bati, k.dogu - EN_KUCUK_ADIM)
  const dogu = Math.max(k.dogu, bati + EN_KUCUK_ADIM)
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
