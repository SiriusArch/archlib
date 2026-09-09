/**
 * OpenStreetMap verisi — Overpass API uzerinden, dogrudan tarayicidan.
 *
 * Overpass ucretsiz ve acik bir kaynaktir; nazik davranmak gerekir:
 *  - sorgu alani sinirli tutulur (en fazla 1 km yaricap)
 *  - tek seferde tek istek atilir, otomatik yeniden deneme yoktur
 *  - birincil sunucu yanit vermezse yedek aynaya bir kez gecilir
 */

import { Projeksiyon, type Nokta } from './projeksiyon'

const AYNALAR = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

/** Bir ayna bu surede yanit vermezse sonrakine gecilir. */
const AYNA_ZAMAN_ASIMI = 22000

/**
 * Kullanicinin iptali ile zaman asimini birlestirir.
 * AbortSignal.any her tarayicida yok; yoksa elle koprulenir.
 */
function sinyalBirlestir(kullanici: AbortSignal | undefined, ms: number): AbortSignal {
  const zaman = AbortSignal.timeout(ms)
  if (!kullanici) return zaman
  const herhangi = (AbortSignal as { any?: (s: AbortSignal[]) => AbortSignal }).any
  if (herhangi) return herhangi([kullanici, zaman])

  const kontrol = new AbortController()
  const bitir = () => kontrol.abort()
  kullanici.addEventListener('abort', bitir, { once: true })
  zaman.addEventListener('abort', bitir, { once: true })
  return kontrol.signal
}

export type KatmanTuru = 'bina' | 'yol' | 'su' | 'yesil' | 'agac' | 'demiryolu'

export interface Cizgi {
  readonly tur: KatmanTuru
  readonly noktalar: readonly Nokta[]
  readonly kapali: boolean
  /** Bina yuksekligi (m) — yalnizca tur === 'bina' */
  readonly yukseklik?: number
  readonly katSayisi?: number
  readonly ad?: string
  /** Yol genisligi siniflandirmasi icin */
  readonly sinif?: string
}

export interface AraziVerisi {
  readonly cizgiler: readonly Cizgi[]
  readonly agaclar: readonly Nokta[]
  readonly sayim: Readonly<Record<KatmanTuru, number>>
  readonly kaynak: string
}

interface OverpassOge {
  type: string
  id: number
  tags?: Record<string, string>
  geometry?: { lat: number; lon: number }[]
  lat?: number
  lon?: number
}

function sorguMetni(guney: number, bati: number, kuzey: number, dogu: number): string {
  const b = `${guney.toFixed(6)},${bati.toFixed(6)},${kuzey.toFixed(6)},${dogu.toFixed(6)}`
  return `[out:json][timeout:25];
(
  way["building"](${b});
  way["highway"](${b});
  way["railway"~"^(rail|light_rail|tram|subway)$"](${b});
  way["waterway"~"^(river|stream|canal|ditch)$"](${b});
  way["natural"="water"](${b});
  way["landuse"~"^(grass|forest|meadow|orchard|village_green|recreation_ground)$"](${b});
  way["leisure"~"^(park|garden|pitch)$"](${b});
  node["natural"="tree"](${b});
);
out geom;`
}

function binaYuksekligi(t: Record<string, string>): { yukseklik: number; katSayisi?: number } {
  const h = parseFloat(t['height'] ?? t['building:height'] ?? '')
  if (Number.isFinite(h) && h > 0) return { yukseklik: h }

  const kat = parseFloat(t['building:levels'] ?? t['levels'] ?? '')
  if (Number.isFinite(kat) && kat > 0) {
    return { yukseklik: kat * 3.1, katSayisi: kat }
  }
  // Bilgi yoksa iki katli varsayilir; disa aktarimda bu varsayim not edilir.
  return { yukseklik: 6.2, katSayisi: 2 }
}

function turBelirle(t: Record<string, string>): KatmanTuru | undefined {
  if (t['building']) return 'bina'
  if (t['highway']) return 'yol'
  if (t['railway']) return 'demiryolu'
  if (t['waterway'] || t['natural'] === 'water') return 'su'
  if (t['landuse'] || t['leisure']) return 'yesil'
  if (t['natural'] === 'tree') return 'agac'
  return undefined
}

async function aynayaSor(url: string, sorgu: string, signal?: AbortSignal): Promise<OverpassOge[]> {
  const yanit = await fetch(url, {
    method: 'POST',
    signal,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: 'data=' + encodeURIComponent(sorgu),
  })
  if (!yanit.ok) {
    const govde = (await yanit.text()).slice(0, 200)
    throw new Error(`Overpass ${yanit.status}: ${govde}`)
  }
  const veri = (await yanit.json()) as { elements?: OverpassOge[] }
  return veri.elements ?? []
}

export async function araziVerisiGetir(
  proj: Projeksiyon,
  yaricapMetre: number,
  signal?: AbortSignal,
): Promise<AraziVerisi> {
  const [guney, bati, kuzey, dogu] = proj.sinirKutusu(yaricapMetre)
  const sorgu = sorguMetni(guney, bati, kuzey, dogu)

  let ogeler: OverpassOge[] | undefined
  let kaynak = AYNALAR[0]
  let sonHata: unknown

  for (const ayna of AYNALAR) {
    // Kullanici iptal ettiyse hemen cik; yalnizca zaman asimi olduysa
    // sonraki aynayi dene.
    if (signal?.aborted) throw new DOMException('Iptal edildi', 'AbortError')
    try {
      ogeler = await aynayaSor(ayna, sorgu, sinyalBirlestir(signal, AYNA_ZAMAN_ASIMI))
      kaynak = ayna
      break
    } catch (e) {
      if (signal?.aborted) throw new DOMException('Iptal edildi', 'AbortError')
      sonHata = e
    }
  }
  if (!ogeler) {
    throw new Error(
      'Overpass sunucularinin hicbiri yanit vermedi. Bu servis ucretsiz ve zaman zaman ' +
        'yogun olur. Alani kucultup tekrar dene ya da birkac dakika bekle. ' +
        `(son hata: ${(sonHata as Error)?.message?.slice(0, 120) ?? 'bilinmiyor'})`,
    )
  }

  const cizgiler: Cizgi[] = []
  const agaclar: Nokta[] = []
  const sayim: Record<KatmanTuru, number> = {
    bina: 0,
    yol: 0,
    su: 0,
    yesil: 0,
    agac: 0,
    demiryolu: 0,
  }

  for (const oge of ogeler) {
    const t = oge.tags ?? {}
    const tur = turBelirle(t)
    if (!tur) continue

    if (oge.type === 'node') {
      if (tur === 'agac' && oge.lat != null && oge.lon != null) {
        agaclar.push(proj.ileri(oge.lat, oge.lon))
        sayim.agac++
      }
      continue
    }

    const geo = oge.geometry
    if (!geo || geo.length < 2) continue

    const noktalar = geo.map((g) => proj.ileri(g.lat, g.lon))
    const ilk = noktalar[0]
    const son = noktalar[noktalar.length - 1]
    const kapali =
      noktalar.length > 3 && Math.hypot(ilk.x - son.x, ilk.y - son.y) < 0.5

    const temel: Cizgi = {
      tur,
      noktalar,
      kapali: tur === 'bina' ? true : kapali,
      ad: t['name'],
      sinif: t['highway'] ?? t['railway'] ?? t['waterway'] ?? t['landuse'] ?? t['leisure'],
      ...(tur === 'bina' ? binaYuksekligi(t) : {}),
    }
    cizgiler.push(temel)
    sayim[tur]++
  }

  return { cizgiler, agaclar, sayim, kaynak }
}

/** Yol siniflarina gore cizim genisligi (metre) — plan cizimi icin. */
export function yolGenisligi(sinif?: string): number {
  switch (sinif) {
    case 'motorway':
    case 'trunk':
      return 14
    case 'primary':
      return 11
    case 'secondary':
      return 9
    case 'tertiary':
      return 7.5
    case 'residential':
    case 'unclassified':
      return 6
    case 'service':
      return 4
    case 'footway':
    case 'path':
    case 'pedestrian':
    case 'steps':
      return 2
    default:
      return 5
  }
}
