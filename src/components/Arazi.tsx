import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

import { Projeksiyon, type Nokta } from '../lib/arazi/projeksiyon'
import { araziVerisiGetir, type AraziVerisi } from '../lib/arazi/osm'
import { yukseklikGetir, kesitProfili, type YukseklikIzgarasi } from '../lib/arazi/yukseklik'
import { konturUret, otomatikAralik, type KonturCizgisi } from '../lib/arazi/kontur'
import {
  planDxf,
  planSvg,
  kesitDxf,
  kesitSvg,
  modelObj,
  geoJson,
  dosyaIndir,
  type AraziPaketi,
} from '../lib/arazi/disaAktar'
import { SayfaBasligi, BolumBasligi, Dugme, Bos } from '../ui/Parcalar'

const YARICAPLAR = [150, 250, 400, 600, 900] as const
const BASLANGIC = { enlem: 41.6771, boylam: 26.5557 } // Edirne, Selimiye

type Durum = 'bos' | 'yukleniyor' | 'hazir' | 'hata'

interface AramaSonuc {
  ad: string
  enlem: number
  boylam: number
}

export default function Arazi() {
  const haritaKutu = useRef<HTMLDivElement>(null)
  const haritaRef = useRef<L.Map | null>(null)
  const isaretRef = useRef<L.CircleMarker | null>(null)
  const kareRef = useRef<L.Rectangle | null>(null)

  const [merkez, setMerkez] = useState(BASLANGIC)
  const [yaricap, setYaricap] = useState<number>(400)
  const [durum, setDurum] = useState<Durum>('bos')
  const [hata, setHata] = useState('')
  const [ilerleme, setIlerleme] = useState('')

  const [veri, setVeri] = useState<AraziVerisi | null>(null)
  const [izgara, setIzgara] = useState<YukseklikIzgarasi | null>(null)
  const [konturlar, setKonturlar] = useState<KonturCizgisi[]>([])
  const [konturAralik, setKonturAralik] = useState(0)

  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState<AramaSonuc[]>([])
  const [araniyor, setAraniyor] = useState(false)

  const [kesitA, setKesitA] = useState<Nokta | null>(null)
  const [kesitB, setKesitB] = useState<Nokta | null>(null)
  const [abartma, setAbartma] = useState(3)

  const iptalRef = useRef<AbortController | null>(null)

  // ------------------------------------------------------------ harita
  useEffect(() => {
    if (!haritaKutu.current || haritaRef.current) return

    const harita = L.map(haritaKutu.current, {
      center: [BASLANGIC.enlem, BASLANGIC.boylam],
      zoom: 15,
      zoomControl: true,
      attributionControl: true,
    })
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap katkicilari',
    }).addTo(harita)

    isaretRef.current = L.circleMarker([BASLANGIC.enlem, BASLANGIC.boylam], {
      radius: 6,
      color: '#b03e3e',
      weight: 2,
      fillColor: '#b03e3e',
      fillOpacity: 0.85,
    }).addTo(harita)

    harita.on('click', (e: L.LeafletMouseEvent) => {
      setMerkez({ enlem: e.latlng.lat, boylam: e.latlng.lng })
    })

    haritaRef.current = harita
    // Kap boyutu gec oturursa harita gri kalir.
    setTimeout(() => harita.invalidateSize(), 200)

    return () => {
      harita.remove()
      haritaRef.current = null
      isaretRef.current = null
      kareRef.current = null
    }
  }, [])

  // Merkez / yaricap degisince isaret ve secim karesi guncellensin
  useEffect(() => {
    const harita = haritaRef.current
    if (!harita) return

    isaretRef.current?.setLatLng([merkez.enlem, merkez.boylam])

    const proj = new Projeksiyon(merkez)
    const [g, b, k, d] = proj.sinirKutusu(yaricap)
    if (kareRef.current) {
      kareRef.current.setBounds([
        [g, b],
        [k, d],
      ])
    } else {
      kareRef.current = L.rectangle(
        [
          [g, b],
          [k, d],
        ],
        { color: '#262320', weight: 1.5, fillColor: '#b03e3e', fillOpacity: 0.06, dashArray: '5 4' },
      ).addTo(harita)
    }
  }, [merkez, yaricap])

  // ------------------------------------------------------------ arama
  const konumAra = useCallback(async () => {
    const q = arama.trim()
    if (q.length < 2) return
    setAraniyor(true)
    try {
      const url =
        'https://nominatim.openstreetmap.org/search?format=json&limit=6&q=' + encodeURIComponent(q)
      const r = await fetch(url, { headers: { Accept: 'application/json' } })
      if (!r.ok) throw new Error(`Arama basarisiz (${r.status})`)
      const j = (await r.json()) as { display_name: string; lat: string; lon: string }[]
      setSonuclar(
        j.map((s) => ({ ad: s.display_name, enlem: parseFloat(s.lat), boylam: parseFloat(s.lon) })),
      )
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setAraniyor(false)
    }
  }, [arama])

  function sonucSec(s: AramaSonuc) {
    setMerkez({ enlem: s.enlem, boylam: s.boylam })
    setSonuclar([])
    setArama(s.ad.split(',')[0])
    haritaRef.current?.setView([s.enlem, s.boylam], 16)
  }

  // ------------------------------------------------------------ veri cek
  async function veriGetir() {
    iptalRef.current?.abort()
    const kontrol = new AbortController()
    iptalRef.current = kontrol

    setDurum('yukleniyor')
    setHata('')
    setKesitA(null)
    setKesitB(null)

    const proj = new Projeksiyon(merkez)
    try {
      setIlerleme('Yukseklik verisi indiriliyor')
      const yeniIzgara = await yukseklikGetir(proj, yaricap, 160, kontrol.signal)

      setIlerleme('OpenStreetMap verisi indiriliyor')
      const yeniVeri = await araziVerisiGetir(proj, yaricap, kontrol.signal)

      setIlerleme('Kontur cizgileri hesaplaniyor')
      const aralik = otomatikAralik(yeniIzgara.enYuksek - yeniIzgara.enDusuk)
      const yeniKontur = konturUret(yeniIzgara, { aralik })

      setIzgara(yeniIzgara)
      setVeri(yeniVeri)
      setKonturlar(yeniKontur)
      setKonturAralik(aralik)
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

  // ------------------------------------------------------------ paket
  const paket: AraziPaketi | null = useMemo(() => {
    if (!veri || !izgara) return null
    return {
      cizgiler: veri.cizgiler,
      agaclar: veri.agaclar,
      konturlar,
      izgara,
      merkez,
      yaricap,
      konturAralik,
    }
  }, [veri, izgara, konturlar, merkez, yaricap, konturAralik])

  const planGorsel = useMemo(() => (paket ? planSvg(paket, 1000) : ''), [paket])

  const profil = useMemo(() => {
    if (!izgara || !kesitA || !kesitB) return []
    return kesitProfili(izgara, kesitA, kesitB)
  }, [izgara, kesitA, kesitB])

  const kesitGorsel = useMemo(
    () => (profil.length ? kesitSvg(profil, abartma, 1000) : ''),
    [profil, abartma],
  )

  // Onizleme uzerinde kesit cizgisi secimi
  function planaTikla(e: React.MouseEvent<HTMLDivElement>) {
    if (!paket) return
    const kutu = e.currentTarget.getBoundingClientRect()
    const oran = (e.clientX - kutu.left) / kutu.width
    const oranY = (e.clientY - kutu.top) / kutu.height
    const n: Nokta = {
      x: -paket.yaricap + oran * 2 * paket.yaricap,
      y: paket.yaricap - oranY * 2 * paket.yaricap,
    }
    if (!kesitA || (kesitA && kesitB)) {
      setKesitA(n)
      setKesitB(null)
    } else {
      setKesitB(n)
    }
  }

  const damga = `${merkez.enlem.toFixed(4)}_${merkez.boylam.toFixed(4)}_${yaricap}m`

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="02 — Arazi"
        renk="text-mavi-koyu"
        baslik="Konumdan plan, model ve kesit"
        aciklama={
          <>
            Dunyanin herhangi bir noktasini sec; bina, yol, su ve yesil alan verisiyle birlikte
            arazinin kontur cizgilerini cikar. Sonucu CAD ve 3B programlarina goturebilecegin
            formatlarda indir. Islem tamamen tarayicinda calisir.
          </>
        }
      />

      <section className="grid gap-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* ---------------------------------------------------------- sol */}
        <div className="space-y-7">
          <div>
            <BolumBasligi renk="text-mavi-koyu">1 — Konum</BolumBasligi>
            <div className="flex gap-2">
              <input
                value={arama}
                onChange={(e) => setArama(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void konumAra()
                }}
                placeholder="Yer ara: Selimiye Camii, Edirne"
                className="alan"
              />
              <button
                onClick={() => void konumAra()}
                disabled={araniyor}
                className="etiket shrink-0 border border-cizgi-2 px-3 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep disabled:opacity-40"
              >
                {araniyor ? '...' : 'Ara'}
              </button>
            </div>

            {sonuclar.length > 0 && (
              <ul className="mt-2 border border-cizgi">
                {sonuclar.map((s, i) => (
                  <li key={i} className="border-b border-cizgi last:border-0">
                    <button
                      onClick={() => sonucSec(s)}
                      className="w-full px-3 py-2 text-left text-[12.5px] leading-snug text-murekkep-2 transition-colors hover:bg-mavi-soft hover:text-murekkep"
                    >
                      {s.ad}
                    </button>
                  </li>
                ))}
              </ul>
            )}

            <div
              ref={haritaKutu}
              className="mt-3 h-[280px] w-full border border-cizgi"
              style={{ background: '#e9e2d6' }}
            />
            <p className="mt-2 text-[12px] text-murekkep-3">
              Haritaya tikla ya da arama sonucundan sec. Kesikli kare indirilecek alani gosterir.
            </p>

            <div className="sayi mt-2 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-murekkep-2">
              <span>Enlem {merkez.enlem.toFixed(5)}</span>
              <span>Boylam {merkez.boylam.toFixed(5)}</span>
            </div>
          </div>

          <div>
            <BolumBasligi renk="text-mavi-koyu">2 — Alan yaricapi</BolumBasligi>
            <div className="flex flex-wrap gap-1.5">
              {YARICAPLAR.map((y) => (
                <button
                  key={y}
                  onClick={() => setYaricap(y)}
                  className={`etiket border px-3 py-2 transition-colors duration-300 ${
                    yaricap === y
                      ? 'border-mavi bg-mavi-soft text-mavi-koyu'
                      : 'border-cizgi text-murekkep-2 hover:border-cizgi-2'
                  }`}
                >
                  {y} m
                </button>
              ))}
            </div>
            <p className="mt-2 text-[12px] text-murekkep-3">
              Kenar uzunlugu {2 * yaricap} m. Buyuk alanlar Overpass sunucusunu zorlar; 900 m ustu
              bilerek kapali.
            </p>
          </div>

          <div>
            <BolumBasligi renk="text-mavi-koyu">3 — Veriyi getir</BolumBasligi>
            <Dugme
              onClick={() => void veriGetir()}
              disabled={durum === 'yukleniyor'}
              dolgu="bg-mavi"
              className="w-full"
            >
              {durum === 'yukleniyor' ? 'Getiriliyor...' : 'Araziyi olustur'}
            </Dugme>

            {durum === 'yukleniyor' && ilerleme && (
              <p className="etiket mt-3 text-mavi-koyu">{ilerleme}</p>
            )}
            {hata && (
              <p className="mt-3 border-l-2 border-kiremit pl-3 text-[13px] leading-relaxed text-kiremit-koyu">
                {hata}
              </p>
            )}

            {veri && izgara && durum === 'hazir' && (
              <dl className="mt-4 space-y-1.5 text-[12.5px]">
                {[
                  ['Bina', veri.sayim.bina],
                  ['Yol', veri.sayim.yol],
                  ['Su', veri.sayim.su],
                  ['Yesil alan', veri.sayim.yesil],
                  ['Agac', veri.sayim.agac],
                  ['Kontur cizgisi', konturlar.length],
                ].map(([ad, n]) => (
                  <div key={ad as string} className="flex justify-between border-b border-cizgi pb-1">
                    <dt className="text-murekkep-3">{ad}</dt>
                    <dd className="sayi text-murekkep">{n as number}</dd>
                  </div>
                ))}
                <div className="flex justify-between border-b border-cizgi pb-1">
                  <dt className="text-murekkep-3">Kot araligi</dt>
                  <dd className="sayi text-murekkep">
                    {izgara.enDusuk.toFixed(1)} – {izgara.enYuksek.toFixed(1)} m
                  </dd>
                </div>
                <div className="flex justify-between border-b border-cizgi pb-1">
                  <dt className="text-murekkep-3">Kontur araligi</dt>
                  <dd className="sayi text-murekkep">{konturAralik} m</dd>
                </div>
              </dl>
            )}
          </div>

          {paket && (
            <div>
              <BolumBasligi renk="text-mavi-koyu">4 — Indir</BolumBasligi>
              <div className="grid grid-cols-2 gap-1.5">
                <IndirDugmesi
                  ad="Plan · DXF"
                  alt="CAD, katmanli"
                  onClick={() => dosyaIndir(planDxf(paket), `archlib_plan_${damga}.dxf`, 'application/dxf')}
                />
                <IndirDugmesi
                  ad="Plan · SVG"
                  alt="Pafta / vektor"
                  onClick={() => dosyaIndir(planSvg(paket, 2000), `archlib_plan_${damga}.svg`, 'image/svg+xml')}
                />
                <IndirDugmesi
                  ad="Model · OBJ"
                  alt="Arazi + bina"
                  onClick={() => dosyaIndir(modelObj(paket, true), `archlib_model_${damga}.obj`, 'text/plain')}
                />
                <IndirDugmesi
                  ad="Arazi · OBJ"
                  alt="Yalniz topografya"
                  onClick={() => dosyaIndir(modelObj(paket, false), `archlib_arazi_${damga}.obj`, 'text/plain')}
                />
                <IndirDugmesi
                  ad="Veri · GeoJSON"
                  alt="Ham OSM"
                  onClick={() => {
                    const proj = new Projeksiyon(merkez)
                    dosyaIndir(
                      geoJson(paket, (x, y) => proj.geri(x, y)),
                      `archlib_veri_${damga}.geojson`,
                      'application/geo+json',
                    )
                  }}
                />
                <IndirDugmesi
                  ad="Kesit · DXF"
                  alt={kesitB ? 'Secili hat' : 'Once hat sec'}
                  pasif={!kesitB}
                  onClick={() =>
                    dosyaIndir(kesitDxf(profil, abartma), `archlib_kesit_${damga}.dxf`, 'application/dxf')
                  }
                />
              </div>
              <p className="mt-3 text-[11.5px] leading-relaxed text-murekkep-3">
                Veri kaynagi: OpenStreetMap (ODbL) ve AWS Terrain Tiles. Kullandiginda kaynak
                belirtmen gerekiyor. Bina yuksekligi etiketli degilse iki kat (6,2 m) varsayilir.
              </p>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------- sag */}
        <div className="min-w-0 space-y-8">
          <div>
            <BolumBasligi
              renk="text-mavi-koyu"
              sag={
                paket && (
                  <span className="etiket text-murekkep-3">
                    {kesitA && !kesitB
                      ? 'Ikinci noktaya tikla'
                      : kesitB
                        ? 'Kesit hatti secili'
                        : 'Kesit icin iki nokta tikla'}
                  </span>
                )
              }
            >
              Plan onizleme
            </BolumBasligi>

            {!paket && durum !== 'yukleniyor' && (
              <div className="border border-cizgi bg-kagit/60">
                <Bos
                  baslik="Henuz arazi olusturulmadi"
                  aciklama="Soldan bir konum ve yaricap sec, sonra Araziyi olustur de. Plan burada belirir."
                />
              </div>
            )}

            {durum === 'yukleniyor' && (
              <div className="border border-cizgi bg-kagit/60">
                <Bos baslik={ilerleme || 'Hazirlaniyor'} />
              </div>
            )}

            {paket && (
              <div
                onClick={planaTikla}
                className="relative cursor-crosshair border border-cizgi"
                dangerouslySetInnerHTML={{ __html: planGorsel }}
              />
            )}

            {paket && kesitA && (
              <p className="sayi mt-2 text-[11px] text-murekkep-3">
                A ({kesitA.x.toFixed(0)}, {kesitA.y.toFixed(0)})
                {kesitB && ` → B (${kesitB.x.toFixed(0)}, ${kesitB.y.toFixed(0)})`}
                {kesitB &&
                  ` · ${Math.hypot(kesitB.x - kesitA.x, kesitB.y - kesitA.y).toFixed(0)} m`}
                {' · '}
                <button
                  onClick={() => {
                    setKesitA(null)
                    setKesitB(null)
                  }}
                  className="underline underline-offset-2 hover:text-kiremit-koyu"
                >
                  temizle
                </button>
              </p>
            )}
          </div>

          {kesitGorsel && (
            <div>
              <BolumBasligi
                renk="text-mavi-koyu"
                sag={
                  <span className="flex items-center gap-2">
                    <span className="etiket text-murekkep-3">Dusey abartma</span>
                    {[1, 2, 3, 5].map((a) => (
                      <button
                        key={a}
                        onClick={() => setAbartma(a)}
                        className={`etiket border px-2 py-1 transition-colors ${
                          abartma === a
                            ? 'border-mavi bg-mavi-soft text-mavi-koyu'
                            : 'border-cizgi text-murekkep-3 hover:border-cizgi-2'
                        }`}
                      >
                        {a}x
                      </button>
                    ))}
                  </span>
                }
              >
                Kesit
              </BolumBasligi>
              <div
                className="border border-cizgi"
                dangerouslySetInnerHTML={{ __html: kesitGorsel }}
              />
              <div className="mt-2 flex gap-2">
                <button
                  onClick={() =>
                    dosyaIndir(kesitSvg(profil, abartma, 2000), `archlib_kesit_${damga}.svg`, 'image/svg+xml')
                  }
                  className="etiket border border-cizgi px-3 py-2 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep"
                >
                  Kesit · SVG indir
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function IndirDugmesi({
  ad,
  alt,
  onClick,
  pasif,
}: {
  ad: string
  alt: string
  onClick: () => void
  pasif?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={pasif}
      className="group border border-cizgi px-3 py-2.5 text-left transition-colors duration-300 hover:border-mavi hover:bg-mavi-soft disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-cizgi disabled:hover:bg-transparent"
    >
      <div className="etiket text-murekkep">{ad}</div>
      <div className="mt-0.5 text-[11px] text-murekkep-3">{alt}</div>
    </button>
  )
}
