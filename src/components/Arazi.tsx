import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Projeksiyon, type Nokta } from '../lib/arazi/projeksiyon'
import { araziVerisiGetir, type AraziVerisi, type KatmanTuru } from '../lib/arazi/osm'
import { yukseklikGetir, type YukseklikIzgarasi } from '../lib/arazi/yukseklik'
import { konturUret, otomatikAralik, type KonturCizgisi } from '../lib/arazi/kontur'
import { kesitSahnesiKur, kesitSahnesiSvg, type KesitSahnesi } from '../lib/arazi/kesitSahne'
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
import { Panel, PanelBasligi, Cip, KatmanSatiri, DegerSecici } from '../ui/Kontroller'

type Mod = 'plan' | 'kesit'
type Iki = 'iki' | 'uc'
type Durum = 'bos' | 'yukleniyor' | 'hazir' | 'hata'

const BASLANGIC = { enlem: 41.6771, boylam: 26.5557 }
const KENARLAR = [200, 300, 500, 800, 1200, 1800] as const
const KONTUR_ARALIKLARI = [1, 2, 5, 10] as const
const BANTLAR = [40, 80, 150, 300] as const
const ABARTMALAR = [1, 1.5, 2, 3] as const

const IKI_FORMATLAR = ['DXF', 'SVG', 'GEOJSON'] as const
const UC_FORMATLAR = ['OBJ'] as const

type IkiFormat = (typeof IKI_FORMATLAR)[number]
type UcFormat = (typeof UC_FORMATLAR)[number]

interface KatmanTanim {
  id: KatmanTuru | 'kontur'
  ad: string
  renk: string
}

const KATMAN_LISTESI: KatmanTanim[] = [
  { id: 'bina', ad: 'Binalar', renk: 'bg-kiremit' },
  { id: 'yol', ad: 'Yollar', renk: 'bg-murekkep-3' },
  { id: 'demiryolu', ad: 'Demiryolu', renk: 'bg-mor' },
  { id: 'su', ad: 'Su yollari', renk: 'bg-mavi' },
  { id: 'yesil', ad: 'Yesil alanlar', renk: 'bg-adacayi' },
  { id: 'agac', ad: 'Agaclar', renk: 'bg-adacayi' },
  { id: 'kontur', ad: 'Kontur cizgileri', renk: 'bg-kehribar' },
]

const UC_KATMAN_LISTESI: KatmanTanim[] = [
  { id: 'bina', ad: 'Binalar (kutle)', renk: 'bg-kiremit' },
  { id: 'kontur', ad: 'Arazi yuzeyi', renk: 'bg-kehribar' },
]

function tumKatmanlar(v: boolean): Record<string, boolean> {
  const o: Record<string, boolean> = {}
  for (const k of KATMAN_LISTESI) o[k.id] = v
  return o
}

/** Suruklenebilir tutamak — Leaflet varsayilan ikonu yerine kendi isaretimiz. */
function tutamak(tip: 'kose' | 'uc'): L.DivIcon {
  const boyut = tip === 'kose' ? 11 : 13
  return L.divIcon({
    className: '',
    iconSize: [boyut, boyut],
    iconAnchor: [boyut / 2, boyut / 2],
    html:
      tip === 'kose'
        ? `<div style="width:${boyut}px;height:${boyut}px;background:#262320;border:2px solid #f7f4ee;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`
        : `<div style="width:${boyut}px;height:${boyut}px;border-radius:50%;background:#b03e3e;border:2px solid #f7f4ee;box-shadow:0 1px 3px rgba(0,0,0,.3)"></div>`,
  })
}

export default function Arazi() {
  const kutuRef = useRef<HTMLDivElement>(null)
  const haritaRef = useRef<L.Map | null>(null)
  const katmanRef = useRef<L.LayerGroup | null>(null)
  const iptalRef = useRef<AbortController | null>(null)

  const [mod, setMod] = useState<Mod>('plan')
  const [merkez, setMerkez] = useState(BASLANGIC)
  const [kenar, setKenar] = useState<number>(500)
  const [kesitUc, setKesitUc] = useState<[typeof BASLANGIC, typeof BASLANGIC]>([
    { enlem: 41.6745, boylam: 26.5495 },
    { enlem: 41.6745, boylam: 26.5625 },
  ])
  const [bant, setBant] = useState<number>(80)
  const [abartma, setAbartma] = useState<number>(1)

  const [durum, setDurum] = useState<Durum>('bos')
  const [ilerleme, setIlerleme] = useState('')
  const [hata, setHata] = useState('')

  const [veri, setVeri] = useState<AraziVerisi | null>(null)
  const [izgara, setIzgara] = useState<YukseklikIzgarasi | null>(null)
  const [konturlar, setKonturlar] = useState<KonturCizgisi[]>([])
  const [konturAralik, setKonturAralik] = useState<number>(5)
  const [sahne, setSahne] = useState<KesitSahnesi | null>(null)
  const [paketMerkez, setPaketMerkez] = useState(BASLANGIC)
  const [paketYaricap, setPaketYaricap] = useState(250)

  const [ikiAcik, setIkiAcik] = useState(true)
  const [ucAcik, setUcAcik] = useState(true)
  const [ikiFormat, setIkiFormat] = useState<IkiFormat>('DXF')
  const [ucFormat, setUcFormat] = useState<UcFormat>('OBJ')
  const [ikiKatman, setIkiKatman] = useState<Record<string, boolean>>(() => tumKatmanlar(true))
  const [ucKatman, setUcKatman] = useState<Record<string, boolean>>({ bina: true, kontur: true })
  const [sonucSekme, setSonucSekme] = useState<Iki>('iki')

  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState<{ ad: string; enlem: number; boylam: number }[]>([])
  const [araniyor, setAraniyor] = useState(false)

  const yaricap = kenar / 2

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
      attribution: '&copy; OpenStreetMap katkicilari',
    }).addTo(harita)
    katmanRef.current = L.layerGroup().addTo(harita)
    haritaRef.current = harita
    setTimeout(() => harita.invalidateSize(), 150)
    return () => {
      harita.remove()
      haritaRef.current = null
      katmanRef.current = null
    }
  }, [])

  // ------------------------------------------ secim gecmisini haritaya ciz
  useEffect(() => {
    const harita = haritaRef.current
    const grup = katmanRef.current
    if (!harita || !grup) return
    grup.clearLayers()

    if (mod === 'plan') {
      const proj = new Projeksiyon(merkez)
      const [g, b, k, d] = proj.sinirKutusu(yaricap)
      L.rectangle(
        [
          [g, b],
          [k, d],
        ],
        { color: '#262320', weight: 1.5, fillColor: '#517a95', fillOpacity: 0.07 },
      ).addTo(grup)

      // Kose tutamaklari — surukleyince kenar uzunlugu degisir
      const koseler: [number, number][] = [
        [g, b],
        [g, d],
        [k, d],
        [k, b],
      ]
      for (const [ke, kb] of koseler) {
        const m = L.marker([ke, kb], { icon: tutamak('kose'), draggable: true }).addTo(grup)
        m.on('drag', (e) => {
          const ll = (e.target as L.Marker).getLatLng()
          const p = proj.ileri(ll.lat, ll.lng)
          const yeni = Math.max(100, Math.min(1800, 2 * Math.max(Math.abs(p.x), Math.abs(p.y))))
          setKenar(Math.round(yeni / 10) * 10)
        })
      }

      const orta = L.marker([merkez.enlem, merkez.boylam], {
        icon: tutamak('uc'),
        draggable: true,
      }).addTo(grup)
      orta.on('dragend', (e) => {
        const ll = (e.target as L.Marker).getLatLng()
        setMerkez({ enlem: ll.lat, boylam: ll.lng })
      })

      L.tooltip({ permanent: true, direction: 'top', className: 'archlib-olcu' })
        .setLatLng([k, (b + d) / 2])
        .setContent(`${kenar} m`)
        .addTo(grup)
      L.tooltip({ permanent: true, direction: 'center', className: 'archlib-olcu' })
        .setLatLng([(g + k) / 2, b])
        .setContent(`${kenar} m`)
        .addTo(grup)
    } else {
      const [A, B] = kesitUc
      const orta = { enlem: (A.enlem + B.enlem) / 2, boylam: (A.boylam + B.boylam) / 2 }
      const proj = new Projeksiyon(orta)
      const a = proj.ileri(A.enlem, A.boylam)
      const b = proj.ileri(B.enlem, B.boylam)
      const dx = b.x - a.x
      const dy = b.y - a.y
      const uz = Math.hypot(dx, dy) || 1
      const nx = -dy / uz
      const ny = dx / uz
      const yb = bant / 2

      const kose = (p: Nokta, s: number) => {
        const q = proj.geri(p.x + nx * s, p.y + ny * s)
        return [q.enlem, q.boylam] as [number, number]
      }
      L.polygon([kose(a, yb), kose(b, yb), kose(b, -yb), kose(a, -yb)], {
        color: '#517a95',
        weight: 1,
        dashArray: '5 4',
        fillColor: '#517a95',
        fillOpacity: 0.08,
      }).addTo(grup)

      L.polyline(
        [
          [A.enlem, A.boylam],
          [B.enlem, B.boylam],
        ],
        { color: '#262320', weight: 2.5 },
      ).addTo(grup)

      const ucIsaret = (hangi: 0 | 1, konum: typeof A) => {
        const m = L.marker([konum.enlem, konum.boylam], {
          icon: tutamak('uc'),
          draggable: true,
        }).addTo(grup)
        m.on('dragend', (e) => {
          const ll = (e.target as L.Marker).getLatLng()
          setKesitUc((eski) => {
            const yeni: [typeof A, typeof A] = [...eski] as [typeof A, typeof A]
            yeni[hangi] = { enlem: ll.lat, boylam: ll.lng }
            return yeni
          })
        })
      }
      ucIsaret(0, A)
      ucIsaret(1, B)

      L.tooltip({ permanent: true, direction: 'top', className: 'archlib-olcu' })
        .setLatLng([orta.enlem, orta.boylam])
        .setContent(`${uz.toFixed(0)} m`)
        .addTo(grup)
      L.tooltip({ permanent: true, direction: 'center', className: 'archlib-olcu-kucuk' })
        .setLatLng(kose(a, yb))
        .setContent(`bant ${bant} m`)
        .addTo(grup)
    }
  }, [mod, merkez, kenar, yaricap, kesitUc, bant])

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

  function konumaGit(s: { ad: string; enlem: number; boylam: number }) {
    const yeni = { enlem: s.enlem, boylam: s.boylam }
    setMerkez(yeni)
    if (mod === 'kesit') {
      const p = new Projeksiyon(yeni)
      const a = p.geri(-250, 0)
      const b = p.geri(250, 0)
      setKesitUc([a, b])
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

    // Iki mod da ayni boru hattini kullanir; kesitte hattin tamamini kapsayan
    // bir alan indirilir.
    let alanMerkez = merkez
    let alanYaricap = yaricap
    if (mod === 'kesit') {
      const [A, B] = kesitUc
      alanMerkez = { enlem: (A.enlem + B.enlem) / 2, boylam: (A.boylam + B.boylam) / 2 }
      const p = new Projeksiyon(alanMerkez)
      const a = p.ileri(A.enlem, A.boylam)
      const b = p.ileri(B.enlem, B.boylam)
      const uz = Math.hypot(b.x - a.x, b.y - a.y)
      alanYaricap = Math.min(900, Math.max(120, uz / 2 + bant / 2 + 60))
    }

    const proj = new Projeksiyon(alanMerkez)
    try {
      setIlerleme('Yukseklik verisi indiriliyor')
      const g = await yukseklikGetir(proj, alanYaricap, 160, kontrol.signal)

      setIlerleme('OpenStreetMap verisi indiriliyor')
      const v = await araziVerisiGetir(proj, alanYaricap, kontrol.signal)

      setIlerleme('Kontur cizgileri hesaplaniyor')
      const aralik = otomatikAralik(g.enYuksek - g.enDusuk)
      const k = konturUret(g, { aralik })

      setIzgara(g)
      setVeri(v)
      setKonturlar(k)
      setKonturAralik(aralik)
      setPaketMerkez(alanMerkez)
      setPaketYaricap(alanYaricap)

      if (mod === 'kesit') {
        setIlerleme('Kesit kuruluyor')
        const [A, B] = kesitUc
        const a = proj.ileri(A.enlem, A.boylam)
        const b = proj.ileri(B.enlem, B.boylam)
        setSahne(kesitSahnesiKur(g, v.cizgiler, v.agaclar, a, b, { bant }))
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

  // Bant degisince yeniden indirmeden kesiti tazele
  useEffect(() => {
    if (mod !== 'kesit' || !izgara || !veri || durum !== 'hazir') return
    const proj = new Projeksiyon(paketMerkez)
    const [A, B] = kesitUc
    const a = proj.ileri(A.enlem, A.boylam)
    const b = proj.ileri(B.enlem, B.boylam)
    setSahne(kesitSahnesiKur(izgara, veri.cizgiler, veri.agaclar, a, b, { bant }))
    // kesitUc bilerek disarida: hat degisirse veri de yeniden cekilmeli
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bant])

  // ------------------------------------------------------------------ paket
  const paket: AraziPaketi | null = useMemo(() => {
    if (!veri || !izgara) return null
    const secili = veri.cizgiler.filter((c) => ikiKatman[c.tur] !== false)
    return {
      cizgiler: secili,
      agaclar: ikiKatman.agac === false ? [] : veri.agaclar,
      konturlar: ikiKatman.kontur === false ? [] : konturlar,
      izgara,
      merkez: paketMerkez,
      yaricap: paketYaricap,
      konturAralik,
    }
  }, [veri, izgara, konturlar, ikiKatman, paketMerkez, paketYaricap, konturAralik])

  const planGorsel = useMemo(() => (paket ? planSvg(paket, 1100) : ''), [paket])
  const kesitGorsel = useMemo(
    () => (sahne ? kesitSahnesiSvg(sahne, { genislik: 1500, abartma }) : ''),
    [sahne, abartma],
  )

  const damga = `${paketMerkez.enlem.toFixed(4)}_${paketMerkez.boylam.toFixed(4)}`

  function indirPlan() {
    if (!paket) return
    if (ikiFormat === 'DXF') dosyaIndir(planDxf(paket), `archlib_plan_${damga}.dxf`, 'application/dxf')
    else if (ikiFormat === 'SVG')
      dosyaIndir(planSvg(paket, 2200), `archlib_plan_${damga}.svg`, 'image/svg+xml')
    else {
      const proj = new Projeksiyon(paketMerkez)
      dosyaIndir(
        geoJson(paket, (x, y) => proj.geri(x, y)),
        `archlib_plan_${damga}.geojson`,
        'application/geo+json',
      )
    }
  }

  function indirModel() {
    if (!paket) return
    dosyaIndir(
      modelObj(paket, ucKatman.bina !== false),
      `archlib_model_${damga}.obj`,
      'text/plain',
    )
  }

  const sayim = veri?.sayim

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="02 — Arazi"
        renk="text-mavi-koyu"
        baslik="Konumdan plan, model ve kesit"
        aciklama="Dunyanin herhangi bir noktasini sec; bina, yol, su ve yesil alan verisiyle birlikte arazinin kontur cizgilerini cikar. Kesit modunda serbest bir hat cizip zemin, yapi ve agaclari iceren iki boyutlu kesit uret. Islem tamamen tarayicinda calisir."
      />

      {/* ------------------------------------------------------ mod secimi */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-7">
          {(
            [
              ['plan', 'Plan ve model'],
              ['kesit', 'Kesit'],
            ] as const
          ).map(([m, ad]) => (
            <button
              key={m}
              onClick={() => {
                setMod(m)
                setDurum('bos')
                setSahne(null)
              }}
              className="group relative py-1"
            >
              <span
                className={`font-baslik text-[19px] transition-colors duration-300 ${
                  mod === m ? 'text-murekkep' : 'text-murekkep-3 group-hover:text-murekkep-2'
                }`}
              >
                {ad}
              </span>
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] w-full origin-left bg-mavi transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  mod === m ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                }`}
              />
            </button>
          ))}
        </div>
        <span className="sayi text-[14px] text-murekkep-3">
          {mod === 'plan'
            ? `${((kenar * kenar) / 1_000_000).toFixed(2)} km²`
            : `${hatUzunlugu(kesitUc).toFixed(0)} m × ${bant} m`}
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* -------------------------------------------------------- harita */}
        <div className="order-2 lg:order-1">
          <div className="relative">
            <div className="absolute top-3 left-1/2 z-[500] w-full max-w-md -translate-x-1/2 px-3">
              <div className="flex gap-2 border border-cizgi bg-kagit/95 px-3 py-2 backdrop-blur">
                <input
                  value={arama}
                  onChange={(e) => setArama(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void konumAra()}
                  placeholder="Yer ara: Selimiye Camii, Edirne"
                  className="w-full border-0 bg-transparent text-[15px] text-murekkep outline-none placeholder:text-murekkep-3"
                />
                <button
                  onClick={() => void konumAra()}
                  disabled={araniyor}
                  className="etiket shrink-0 text-murekkep-3 transition-colors hover:text-murekkep disabled:opacity-40"
                >
                  {araniyor ? '...' : 'Ara'}
                </button>
              </div>
              {sonuclar.length > 0 && (
                <ul className="mt-1 max-h-60 overflow-y-auto border border-cizgi bg-kagit">
                  {sonuclar.map((s, i) => (
                    <li key={i} className="border-b border-cizgi last:border-0">
                      <button
                        onClick={() => konumaGit(s)}
                        className="w-full px-3 py-2 text-left text-[14px] leading-snug text-murekkep-2 transition-colors hover:bg-mavi-soft hover:text-murekkep"
                      >
                        {s.ad}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div ref={kutuRef} className="h-[460px] w-full border border-cizgi bg-kagit-3" />
          </div>

          <p className="mt-2 text-[13.5px] text-murekkep-3">
            {mod === 'plan'
              ? 'Ortadaki daireyi surukleyerek alani tasi, kose karelerini surukleyerek buyut.'
              : 'Hattin iki ucunu surukleyerek uzunlugu ve yonu ayarla. Bant, kesite girecek derinliktir.'}
          </p>

          {/* ------------------------------------------------ onizlemeler */}
          {durum === 'hazir' && (
            <div className="mt-8">
              {mod === 'plan' ? (
                <>
                  <div className="mb-3 flex items-center gap-6 border-b border-cizgi pb-2">
                    {(
                      [
                        ['iki', '2B Plan'],
                        ['uc', '3B Model'],
                      ] as const
                    ).map(([s, ad]) => (
                      <button
                        key={s}
                        onClick={() => setSonucSekme(s)}
                        className={`etiket transition-colors ${
                          sonucSekme === s ? 'text-mavi-koyu' : 'text-murekkep-3 hover:text-murekkep-2'
                        }`}
                      >
                        {ad}
                      </button>
                    ))}
                    {sayim && (
                      <span className="sayi ml-auto text-[13px] text-murekkep-3">
                        {sayim.bina} bina · {sayim.yol} yol · {konturlar.length} kontur
                      </span>
                    )}
                  </div>
                  {sonucSekme === 'iki' ? (
                    <div
                      className="border border-cizgi"
                      dangerouslySetInnerHTML={{ __html: planGorsel }}
                    />
                  ) : (
                    <div className="border border-cizgi px-6 py-10 text-center">
                      <p className="text-[15px] leading-relaxed text-murekkep-2">
                        3B model {izgara ? (izgara.satir - 1) * (izgara.sutun - 1) * 2 : 0} arazi
                        ucgeni ve {sayim?.bina ?? 0} bina kutlesinden olusuyor.
                      </p>
                      <p className="mt-2 text-[14px] text-murekkep-3">
                        Tarayicida onizlemek yerine dogrudan OBJ olarak indirilip Rhino, SketchUp,
                        Blender ya da 3ds Max icinde acilmasi icin uretiliyor.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                kesitGorsel && (
                  <>
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-3 border-b border-cizgi pb-2">
                      <span className="etiket text-mavi-koyu">Kesit</span>
                      {sahne && (
                        <span className="sayi text-[13px] text-murekkep-3">
                          {sahne.binalar.filter((b) => b.kesiliyor).length} kesite giren ·{' '}
                          {sahne.binalar.length} yapi · {sahne.agaclar.length} agac
                        </span>
                      )}
                    </div>
                    <div
                      className="border border-cizgi"
                      dangerouslySetInnerHTML={{ __html: kesitGorsel }}
                    />
                  </>
                )
              )}
            </div>
          )}
        </div>

        {/* --------------------------------------------------------- panel */}
        <aside className="order-1 space-y-4 lg:order-2">
          {mod === 'plan' ? (
            <>
              <Panel>
                <PanelBasligi baslik="Alan" />
                <div className="px-4 py-3">
                  <div className="etiket mb-2 text-murekkep-3">Kenar uzunlugu</div>
                  <div className="flex flex-wrap gap-1.5">
                    {KENARLAR.map((k) => (
                      <Cip key={k} secili={kenar === k} onClick={() => setKenar(k)}>
                        {k} m
                      </Cip>
                    ))}
                  </div>
                </div>
              </Panel>

              <Panel>
                <PanelBasligi
                  baslik="2B Vektorel Plan"
                  acik={ikiAcik}
                  degistir={setIkiAcik}
                  renk="text-mavi-koyu"
                />
                <div className={ikiAcik ? '' : 'pointer-events-none opacity-40'}>
                  <div className="flex flex-wrap gap-1.5 border-b border-cizgi px-4 py-3">
                    {IKI_FORMATLAR.map((f) => (
                      <Cip key={f} secili={ikiFormat === f} onClick={() => setIkiFormat(f)}>
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
                <PanelBasligi
                  baslik="3B Model"
                  acik={ucAcik}
                  degistir={setUcAcik}
                  renk="text-mavi-koyu"
                />
                <div className={ucAcik ? '' : 'pointer-events-none opacity-40'}>
                  <div className="flex flex-wrap gap-1.5 border-b border-cizgi px-4 py-3">
                    {UC_FORMATLAR.map((f) => (
                      <Cip key={f} secili={ucFormat === f} onClick={() => setUcFormat(f)}>
                        {f}
                      </Cip>
                    ))}
                    <Cip secili={false} onClick={() => {}} pasif ipucu="Henuz desteklenmiyor">
                      STL
                    </Cip>
                    <Cip secili={false} onClick={() => {}} pasif ipucu="Henuz desteklenmiyor">
                      glTF
                    </Cip>
                  </div>
                  {UC_KATMAN_LISTESI.map((k) => (
                    <KatmanSatiri
                      key={k.id}
                      ad={k.ad}
                      renk={k.renk}
                      acik={ucKatman[k.id] !== false}
                      degistir={(v) => setUcKatman((o) => ({ ...o, [k.id]: v }))}
                      pasif={k.id === 'kontur'}
                    />
                  ))}
                </div>
              </Panel>
            </>
          ) : (
            <Panel>
              <PanelBasligi baslik="Kesit hatti" renk="text-mavi-koyu" />
              <div className="space-y-4 px-4 py-4">
                <div>
                  <div className="etiket mb-2 text-murekkep-3">Bant genisligi</div>
                  <div className="flex flex-wrap gap-1.5">
                    {BANTLAR.map((b) => (
                      <Cip key={b} secili={bant === b} onClick={() => setBant(b)}>
                        {b} m
                      </Cip>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Hattin iki yanindaki bu derinlige giren yapilar ve agaclar kesite dahil olur.
                    Hattin uzerinden gecenler dolu ve kalin konturlu, arkada kalanlar soluk cizilir.
                  </p>
                </div>

                <div className="border-t border-cizgi pt-3">
                  <div className="etiket mb-2 text-murekkep-3">Dusey abartma</div>
                  <div className="flex flex-wrap gap-1.5">
                    {ABARTMALAR.map((a) => (
                      <Cip key={a} secili={abartma === a} onClick={() => setAbartma(a)}>
                        {a}x
                      </Cip>
                    ))}
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-murekkep-3">
                    Uzun kesitlerde yapi yuksekligi kaybolur. Abartma yalnizca cizimi etkiler;
                    DXF gercek olcude, 1:1 uretilir.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 border-t border-cizgi pt-3">
                  <div>
                    <div className="etiket text-murekkep-3">Uzunluk</div>
                    <div className="sayi text-[17px] text-murekkep">
                      {hatUzunlugu(kesitUc).toFixed(0)} m
                    </div>
                  </div>
                  <div>
                    <div className="etiket text-murekkep-3">Yon</div>
                    <div className="sayi text-[17px] text-murekkep">
                      {hatAcisi(kesitUc).toFixed(0)}°
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1.5 border-t border-cizgi pt-3">
                  <button
                    onClick={() => setKesitUc(([a, b]) => [b, a])}
                    className="etiket border border-cizgi px-3 py-2 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep"
                  >
                    Yonu cevir
                  </button>
                  <button
                    onClick={() => setKesitUc((u) => dondur(u, 90))}
                    className="etiket border border-cizgi px-3 py-2 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep"
                  >
                    90° dondur
                  </button>
                </div>
              </div>
            </Panel>
          )}

          {/* ------------------------------------------------ eylem ve indir */}
          <div className="space-y-3">
            <button
              onClick={() => void olustur()}
              disabled={durum === 'yukleniyor'}
              className="group relative w-full overflow-hidden border border-murekkep px-6 py-3.5 text-murekkep transition-colors duration-400 hover:text-kagit disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:text-murekkep"
            >
              <span
                aria-hidden="true"
                className="absolute inset-0 -translate-y-full bg-mavi transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-y-0 group-disabled:translate-y-[-100%]"
              />
              <span className="etiket relative">
                {durum === 'yukleniyor'
                  ? 'Hazirlaniyor...'
                  : mod === 'plan'
                    ? 'Araziyi olustur'
                    : 'Kesiti olustur'}
              </span>
            </button>

            {durum === 'yukleniyor' && ilerleme && (
              <p className="etiket text-mavi-koyu">{ilerleme}</p>
            )}
            {hata && (
              <p className="border-l-2 border-kiremit pl-3 text-[14px] leading-relaxed text-kiremit-koyu">
                {hata}
              </p>
            )}

            {durum === 'hazir' && (
              <Panel>
                <PanelBasligi baslik="Indir" renk="text-mavi-koyu" />
                <div className="space-y-2 px-4 py-3">
                  {mod === 'plan' ? (
                    <>
                      {ikiAcik && (
                        <IndirSatiri
                          ad={`2B Plan · ${ikiFormat}`}
                          alt="Katmanli, metre biriminde"
                          onClick={indirPlan}
                        />
                      )}
                      {ucAcik && (
                        <IndirSatiri
                          ad={`3B Model · ${ucFormat}`}
                          alt={ucKatman.bina !== false ? 'Arazi + bina kutleleri' : 'Yalniz topografya'}
                          onClick={indirModel}
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
                            dosyaIndir(
                              kesitSahnesiDxf(sahne),
                              `archlib_kesit_${damga}.dxf`,
                              'application/dxf',
                            )
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
                    Bina yuksekligi etiketli degilse iki kat (6,2 m) varsayilir.
                  </p>
                </div>
              </Panel>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function IndirSatiri({ ad, alt, onClick }: { ad: string; alt: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center justify-between gap-3 border border-cizgi px-3 py-2.5 text-left transition-colors duration-300 hover:border-mavi hover:bg-mavi-soft"
    >
      <span>
        <span className="etiket block text-murekkep">{ad}</span>
        <span className="mt-0.5 block text-[13px] text-murekkep-3">{alt}</span>
      </span>
      <span className="etiket text-murekkep-3 transition-colors group-hover:text-mavi-koyu">indir</span>
    </button>
  )
}

// ------------------------------------------------------------- yardimcilar

type Konum = { enlem: number; boylam: number }

function hatUzunlugu([a, b]: [Konum, Konum]): number {
  const p = new Projeksiyon({ enlem: (a.enlem + b.enlem) / 2, boylam: (a.boylam + b.boylam) / 2 })
  const A = p.ileri(a.enlem, a.boylam)
  const B = p.ileri(b.enlem, b.boylam)
  return Math.hypot(B.x - A.x, B.y - A.y)
}

/** Kuzeyden saat yonunde derece. */
function hatAcisi([a, b]: [Konum, Konum]): number {
  const p = new Projeksiyon({ enlem: (a.enlem + b.enlem) / 2, boylam: (a.boylam + b.boylam) / 2 })
  const A = p.ileri(a.enlem, a.boylam)
  const B = p.ileri(b.enlem, b.boylam)
  const aci = (Math.atan2(B.x - A.x, B.y - A.y) * 180) / Math.PI
  return (aci + 360) % 360
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
