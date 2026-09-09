/**
 * Disa aktarim yazicilari — hepsi tarayicida, bagimliliksiz.
 *
 * DXF: R12 (AC1009) hedeflenir. R12'nin POLYLINE/VERTEX/SEQEND uclusu daha
 * uzun bir dosya uretir ama LWPOLYLINE'in aksine tutamac (handle) ve OBJECTS
 * bolumu gerektirmez; AutoCAD, BricsCAD, LibreCAD, QCAD ve Rhino istisnasiz
 * acar. Ogrenci dosyayi hangi programa goturursa gotursun calissin diye
 * bilerek en muhafazakar surum secildi.
 */

import type { Nokta } from './projeksiyon'
import type { Cizgi, KatmanTuru } from './osm'
import { yolGenisligi } from './osm'
import type { KonturCizgisi } from './kontur'
import type { YukseklikIzgarasi } from './yukseklik'
import { kotOku } from './yukseklik'

export interface AraziPaketi {
  readonly cizgiler: readonly Cizgi[]
  readonly agaclar: readonly Nokta[]
  readonly konturlar: readonly KonturCizgisi[]
  readonly izgara: YukseklikIzgarasi
  readonly merkez: { enlem: number; boylam: number }
  readonly yaricap: number
  readonly konturAralik: number
}

// ------------------------------------------------------------------ katmanlar

interface KatmanTanimi {
  ad: string
  /** AutoCAD renk indeksi */
  aci: number
  svg: string
  kalinlik: number
}

export const KATMANLAR: Record<KatmanTuru | 'kontur' | 'konturAna' | 'sinir' | 'kesit', KatmanTanimi> = {
  bina: { ad: 'A-BINA', aci: 1, svg: '#b03e3e', kalinlik: 0.6 },
  yol: { ad: 'C-YOL', aci: 8, svg: '#7d7568', kalinlik: 0.4 },
  su: { ad: 'C-SU', aci: 5, svg: '#517a95', kalinlik: 0.4 },
  yesil: { ad: 'L-YESIL', aci: 3, svg: '#519976', kalinlik: 0.3 },
  agac: { ad: 'L-AGAC', aci: 3, svg: '#519976', kalinlik: 0.3 },
  demiryolu: { ad: 'C-DEMIRYOLU', aci: 6, svg: '#5c5992', kalinlik: 0.4 },
  kontur: { ad: 'T-KONTUR', aci: 42, svg: '#c6bcaa', kalinlik: 0.25 },
  konturAna: { ad: 'T-KONTUR-ANA', aci: 32, svg: '#be8144', kalinlik: 0.5 },
  sinir: { ad: 'G-SINIR', aci: 7, svg: '#262320', kalinlik: 0.5 },
  kesit: { ad: 'S-KESIT', aci: 1, svg: '#b03e3e', kalinlik: 0.6 },
}

// ---------------------------------------------------------------------- DXF

function dxfCift(kod: number, deger: string | number): string {
  return `${kod}\n${deger}\n`
}

function dxfPolyline(katman: string, noktalar: readonly Nokta[], kapali: boolean): string {
  let s = ''
  s += dxfCift(0, 'POLYLINE')
  s += dxfCift(8, katman)
  s += dxfCift(66, 1)
  s += dxfCift(70, kapali ? 1 : 0)
  for (const n of noktalar) {
    s += dxfCift(0, 'VERTEX')
    s += dxfCift(8, katman)
    s += dxfCift(10, n.x.toFixed(3))
    s += dxfCift(20, n.y.toFixed(3))
    s += dxfCift(30, '0.0')
  }
  s += dxfCift(0, 'SEQEND')
  s += dxfCift(8, katman)
  return s
}

function dxfDaire(katman: string, merkez: Nokta, yaricap: number): string {
  let s = ''
  s += dxfCift(0, 'CIRCLE')
  s += dxfCift(8, katman)
  s += dxfCift(10, merkez.x.toFixed(3))
  s += dxfCift(20, merkez.y.toFixed(3))
  s += dxfCift(30, '0.0')
  s += dxfCift(40, yaricap.toFixed(3))
  return s
}

function dxfMetin(katman: string, konum: Nokta, yukseklik: number, metin: string): string {
  let s = ''
  s += dxfCift(0, 'TEXT')
  s += dxfCift(8, katman)
  s += dxfCift(10, konum.x.toFixed(3))
  s += dxfCift(20, konum.y.toFixed(3))
  s += dxfCift(30, '0.0')
  s += dxfCift(40, yukseklik.toFixed(2))
  s += dxfCift(1, metin)
  return s
}

export function planDxf(p: AraziPaketi): string {
  const kullanilan = Object.values(KATMANLAR)

  let s = ''
  // --- HEADER
  s += dxfCift(0, 'SECTION') + dxfCift(2, 'HEADER')
  s += dxfCift(9, '$ACADVER') + dxfCift(1, 'AC1009')
  s += dxfCift(9, '$INSUNITS') + dxfCift(70, 6) // 6 = metre
  s += dxfCift(9, '$EXTMIN') + dxfCift(10, (-p.yaricap).toFixed(3)) + dxfCift(20, (-p.yaricap).toFixed(3)) + dxfCift(30, '0.0')
  s += dxfCift(9, '$EXTMAX') + dxfCift(10, p.yaricap.toFixed(3)) + dxfCift(20, p.yaricap.toFixed(3)) + dxfCift(30, '0.0')
  s += dxfCift(0, 'ENDSEC')

  // --- TABLES (katmanlar)
  s += dxfCift(0, 'SECTION') + dxfCift(2, 'TABLES')
  s += dxfCift(0, 'TABLE') + dxfCift(2, 'LAYER') + dxfCift(70, kullanilan.length)
  for (const k of kullanilan) {
    s += dxfCift(0, 'LAYER')
    s += dxfCift(2, k.ad)
    s += dxfCift(70, 0)
    s += dxfCift(62, k.aci)
    s += dxfCift(6, 'CONTINUOUS')
  }
  s += dxfCift(0, 'ENDTAB')
  s += dxfCift(0, 'ENDSEC')

  // --- ENTITIES
  s += dxfCift(0, 'SECTION') + dxfCift(2, 'ENTITIES')

  for (const k of p.konturlar) {
    s += dxfPolyline(k.ana ? KATMANLAR.konturAna.ad : KATMANLAR.kontur.ad, k.noktalar, false)
  }
  for (const c of p.cizgiler) {
    const kat = KATMANLAR[c.tur]?.ad ?? '0'
    s += dxfPolyline(kat, c.noktalar, c.kapali)
  }
  for (const a of p.agaclar) {
    s += dxfDaire(KATMANLAR.agac.ad, a, 2.5)
  }

  // Sinir cercevesi ve kunye
  const r = p.yaricap
  s += dxfPolyline(
    KATMANLAR.sinir.ad,
    [
      { x: -r, y: -r },
      { x: r, y: -r },
      { x: r, y: r },
      { x: -r, y: r },
    ],
    true,
  )
  s += dxfMetin(
    KATMANLAR.sinir.ad,
    { x: -r, y: -r - 14 },
    Math.max(3, r / 60),
    `ArchLib  ${p.merkez.enlem.toFixed(5)}, ${p.merkez.boylam.toFixed(5)}  R=${r}m  ` +
      `KONTUR=${p.konturAralik}m  BIRIM=METRE`,
  )

  s += dxfCift(0, 'ENDSEC')
  s += dxfCift(0, 'EOF')
  return s
}

export function kesitDxf(profil: { mesafe: number; kot: number }[], abartma: number): string {
  let s = ''
  s += dxfCift(0, 'SECTION') + dxfCift(2, 'HEADER')
  s += dxfCift(9, '$ACADVER') + dxfCift(1, 'AC1009')
  s += dxfCift(9, '$INSUNITS') + dxfCift(70, 6)
  s += dxfCift(0, 'ENDSEC')

  s += dxfCift(0, 'SECTION') + dxfCift(2, 'TABLES')
  s += dxfCift(0, 'TABLE') + dxfCift(2, 'LAYER') + dxfCift(70, 2)
  for (const k of [KATMANLAR.kesit, KATMANLAR.sinir]) {
    s += dxfCift(0, 'LAYER') + dxfCift(2, k.ad) + dxfCift(70, 0) + dxfCift(62, k.aci) + dxfCift(6, 'CONTINUOUS')
  }
  s += dxfCift(0, 'ENDTAB') + dxfCift(0, 'ENDSEC')

  s += dxfCift(0, 'SECTION') + dxfCift(2, 'ENTITIES')
  s += dxfPolyline(
    KATMANLAR.kesit.ad,
    profil.map((n) => ({ x: n.mesafe, y: n.kot * abartma })),
    false,
  )
  const enDusuk = Math.min(...profil.map((n) => n.kot))
  const taban = Math.floor(enDusuk / 5) * 5
  s += dxfPolyline(
    KATMANLAR.sinir.ad,
    [
      { x: 0, y: taban * abartma },
      { x: profil[profil.length - 1].mesafe, y: taban * abartma },
    ],
    false,
  )
  s += dxfMetin(
    KATMANLAR.sinir.ad,
    { x: 0, y: (taban - 6) * abartma },
    Math.max(2, profil[profil.length - 1].mesafe / 90),
    `KESIT  UZUNLUK=${profil[profil.length - 1].mesafe.toFixed(1)}m  DUSEY ABARTMA=${abartma}x`,
  )
  s += dxfCift(0, 'ENDSEC') + dxfCift(0, 'EOF')
  return s
}

// ---------------------------------------------------------------------- SVG

function svgYol(noktalar: readonly Nokta[], kapali: boolean, olcek: number, r: number): string {
  const d = noktalar
    .map((n, i) => {
      const x = ((n.x + r) * olcek).toFixed(2)
      const y = ((r - n.y) * olcek).toFixed(2)
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
  return kapali ? `${d} Z` : d
}

export function planSvg(p: AraziPaketi, boyutPx = 1400): string {
  const r = p.yaricap
  const olcek = boyutPx / (2 * r)
  const g: string[] = []

  g.push(`<rect width="${boyutPx}" height="${boyutPx}" fill="#f7f4ee"/>`)

  // yesil alanlar (dolgu)
  const yesil = p.cizgiler.filter((c) => c.tur === 'yesil' && c.kapali)
  if (yesil.length) {
    g.push(`<g fill="#519976" fill-opacity="0.12" stroke="none">`)
    for (const c of yesil) g.push(`<path d="${svgYol(c.noktalar, true, olcek, r)}"/>`)
    g.push('</g>')
  }

  // su (dolgu)
  const su = p.cizgiler.filter((c) => c.tur === 'su')
  if (su.length) {
    g.push(`<g fill="#517a95" fill-opacity="0.16" stroke="#517a95" stroke-opacity="0.5" stroke-width="${(0.8 * olcek).toFixed(2)}">`)
    for (const c of su) g.push(`<path d="${svgYol(c.noktalar, c.kapali, olcek, r)}" ${c.kapali ? '' : 'fill="none"'}/>`)
    g.push('</g>')
  }

  // konturlar
  const ince = p.konturlar.filter((k) => !k.ana)
  const kalin = p.konturlar.filter((k) => k.ana)
  g.push(`<g fill="none" stroke="${KATMANLAR.kontur.svg}" stroke-width="${(0.6).toFixed(2)}" stroke-opacity="0.9">`)
  for (const k of ince) g.push(`<path d="${svgYol(k.noktalar, false, olcek, r)}"/>`)
  g.push('</g>')
  g.push(`<g fill="none" stroke="${KATMANLAR.konturAna.svg}" stroke-width="1.1" stroke-opacity="0.95">`)
  for (const k of kalin) g.push(`<path d="${svgYol(k.noktalar, false, olcek, r)}"/>`)
  g.push('</g>')

  // yollar — sinifa gore genislik
  g.push(`<g fill="none" stroke="${KATMANLAR.yol.svg}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.75">`)
  for (const c of p.cizgiler.filter((x) => x.tur === 'yol')) {
    const w = Math.max(0.6, yolGenisligi(c.sinif) * olcek * 0.5)
    g.push(`<path d="${svgYol(c.noktalar, false, olcek, r)}" stroke-width="${w.toFixed(2)}"/>`)
  }
  g.push('</g>')

  // demiryolu
  const dy = p.cizgiler.filter((x) => x.tur === 'demiryolu')
  if (dy.length) {
    g.push(`<g fill="none" stroke="${KATMANLAR.demiryolu.svg}" stroke-width="1.4" stroke-dasharray="8 5">`)
    for (const c of dy) g.push(`<path d="${svgYol(c.noktalar, false, olcek, r)}"/>`)
    g.push('</g>')
  }

  // binalar
  g.push(`<g fill="#b03e3e" fill-opacity="0.18" stroke="${KATMANLAR.bina.svg}" stroke-width="1" stroke-linejoin="round">`)
  for (const c of p.cizgiler.filter((x) => x.tur === 'bina')) {
    g.push(`<path d="${svgYol(c.noktalar, true, olcek, r)}"/>`)
  }
  g.push('</g>')

  // agaclar
  if (p.agaclar.length) {
    g.push(`<g fill="${KATMANLAR.agac.svg}" fill-opacity="0.5">`)
    for (const a of p.agaclar) {
      g.push(
        `<circle cx="${((a.x + r) * olcek).toFixed(1)}" cy="${((r - a.y) * olcek).toFixed(1)}" r="${Math.max(1.5, 2.5 * olcek).toFixed(1)}"/>`,
      )
    }
    g.push('</g>')
  }

  // cerceve ve kunye
  g.push(
    `<rect x="0.5" y="0.5" width="${boyutPx - 1}" height="${boyutPx - 1}" fill="none" stroke="#262320" stroke-width="1"/>`,
  )
  const olcekCubuk = 100 * olcek
  g.push(
    `<g stroke="#262320" stroke-width="2" fill="none">` +
      `<path d="M24 ${boyutPx - 30} h${olcekCubuk.toFixed(1)}"/>` +
      `<path d="M24 ${boyutPx - 36} v12"/>` +
      `<path d="M${(24 + olcekCubuk).toFixed(1)} ${boyutPx - 36} v12"/>` +
      `</g>` +
      `<text x="24" y="${boyutPx - 42}" font-family="monospace" font-size="13" fill="#262320">100 m</text>` +
      `<text x="24" y="28" font-family="monospace" font-size="13" fill="#262320">` +
      `ArchLib · ${p.merkez.enlem.toFixed(5)}, ${p.merkez.boylam.toFixed(5)} · R=${r}m · kontur ${p.konturAralik}m</text>` +
      `<g stroke="#262320" stroke-width="2" fill="none">` +
      `<path d="M${boyutPx - 44} 62 v-34 M${boyutPx - 52} 38 l8 -10 l8 10"/></g>` +
      `<text x="${boyutPx - 48}" y="80" font-family="monospace" font-size="12" fill="#262320">N</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${boyutPx}" height="${boyutPx}" viewBox="0 0 ${boyutPx} ${boyutPx}">\n${g.join('\n')}\n</svg>`
}

export function kesitSvg(
  profil: { mesafe: number; kot: number }[],
  abartma: number,
  genislik = 1400,
): string {
  if (!profil.length) return ''
  const uzunluk = profil[profil.length - 1].mesafe
  const enDusuk = Math.min(...profil.map((n) => n.kot))
  const enYuksek = Math.max(...profil.map((n) => n.kot))
  const pay = Math.max(2, (enYuksek - enDusuk) * 0.15)
  const alt = enDusuk - pay
  const ust = enYuksek + pay

  const yukseklik = Math.round(((ust - alt) * abartma * genislik) / uzunluk) + 90
  const sx = (m: number) => 60 + (m / uzunluk) * (genislik - 90)
  const sy = (k: number) => yukseklik - 50 - ((k - alt) / (ust - alt)) * (yukseklik - 90)

  const d = profil.map((n, i) => `${i === 0 ? 'M' : 'L'}${sx(n.mesafe).toFixed(2)} ${sy(n.kot).toFixed(2)}`).join(' ')
  const dolgu = `${d} L${sx(uzunluk).toFixed(2)} ${sy(alt).toFixed(2)} L${sx(0).toFixed(2)} ${sy(alt).toFixed(2)} Z`

  const izgara: string[] = []
  const adim = Math.max(1, Math.round((ust - alt) / 6))
  for (let k = Math.ceil(alt / adim) * adim; k <= ust; k += adim) {
    izgara.push(
      `<path d="M60 ${sy(k).toFixed(1)} H${genislik - 30}" stroke="#ded6c8" stroke-width="1"/>` +
        `<text x="10" y="${(sy(k) + 4).toFixed(1)}" font-family="monospace" font-size="11" fill="#7d7568">${k.toFixed(0)}</text>`,
    )
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${genislik}" height="${yukseklik}" viewBox="0 0 ${genislik} ${yukseklik}">
<rect width="${genislik}" height="${yukseklik}" fill="#f7f4ee"/>
${izgara.join('\n')}
<path d="${dolgu}" fill="#be8144" fill-opacity="0.14"/>
<path d="${d}" fill="none" stroke="#b03e3e" stroke-width="1.8" stroke-linejoin="round"/>
<text x="60" y="${yukseklik - 18}" font-family="monospace" font-size="12" fill="#262320">Uzunluk ${uzunluk.toFixed(0)} m · Kot ${enDusuk.toFixed(1)}–${enYuksek.toFixed(1)} m · Dusey abartma ${abartma}x</text>
</svg>`
}

// ---------------------------------------------------------------------- OBJ

/** Kulak kirpma (ear clipping) — icbukey taban alanlari icin dogru cati uretir. */
function ucgenle(noktalar: Nokta[]): [number, number, number][] {
  const n = noktalar.length
  if (n < 3) return []
  const alan = (a: Nokta, b: Nokta, c: Nokta) =>
    (b.x - a.x) * (c.y - a.y) - (b.y - a.y) * (c.x - a.x)

  let toplam = 0
  for (let i = 0; i < n; i++) {
    const a = noktalar[i]
    const b = noktalar[(i + 1) % n]
    toplam += a.x * b.y - b.x * a.y
  }
  const saatYonu = toplam < 0

  const indeks = [...Array(n).keys()]
  if (saatYonu) indeks.reverse()

  const ucgenler: [number, number, number][] = []
  let guvenlik = 0
  while (indeks.length > 3 && guvenlik++ < 5000) {
    let kirpildi = false
    for (let i = 0; i < indeks.length; i++) {
      const i0 = indeks[(i - 1 + indeks.length) % indeks.length]
      const i1 = indeks[i]
      const i2 = indeks[(i + 1) % indeks.length]
      const a = noktalar[i0]
      const b = noktalar[i1]
      const c = noktalar[i2]
      if (alan(a, b, c) <= 0) continue

      let icerde = false
      for (const j of indeks) {
        if (j === i0 || j === i1 || j === i2) continue
        const p = noktalar[j]
        if (alan(a, b, p) >= 0 && alan(b, c, p) >= 0 && alan(c, a, p) >= 0) {
          icerde = true
          break
        }
      }
      if (icerde) continue

      ucgenler.push([i0, i1, i2])
      indeks.splice(i, 1)
      kirpildi = true
      break
    }
    if (!kirpildi) break
  }
  if (indeks.length === 3) ucgenler.push([indeks[0], indeks[1], indeks[2]])
  return ucgenler
}

export function modelObj(p: AraziPaketi, binaEkle = true): string {
  const satir: string[] = []
  satir.push('# ArchLib arazi modeli')
  satir.push(`# merkez ${p.merkez.enlem.toFixed(6)}, ${p.merkez.boylam.toFixed(6)}  yaricap ${p.yaricap} m`)
  satir.push('# birim: metre — X dogu, Y yukari, Z guney (Y-up, sag el)')
  satir.push('')

  const { satir: sr, sutun: st, veri, yaricap, adim } = p.izgara
  let vSayac = 0

  // --- arazi
  satir.push('o arazi')
  for (let i = 0; i < sr; i++) {
    for (let j = 0; j < st; j++) {
      const x = -yaricap + j * adim
      const y = yaricap - i * adim
      const z = veri[i * st + j]
      // OBJ'de Y yukari: (x, kot, -y)
      satir.push(`v ${x.toFixed(3)} ${z.toFixed(3)} ${(-y).toFixed(3)}`)
    }
  }
  const araziBaslangic = 1
  vSayac += sr * st
  for (let i = 0; i < sr - 1; i++) {
    for (let j = 0; j < st - 1; j++) {
      const a = araziBaslangic + i * st + j
      const b = a + 1
      const c = a + st
      const d = c + 1
      satir.push(`f ${a} ${c} ${b}`)
      satir.push(`f ${b} ${c} ${d}`)
    }
  }

  if (!binaEkle) return satir.join('\n') + '\n'

  // --- binalar
  satir.push('')
  satir.push('o binalar')
  let no = 0
  for (const c of p.cizgiler) {
    if (c.tur !== 'bina') continue
    let taban = [...c.noktalar]
    if (taban.length > 2) {
      const ilk = taban[0]
      const son = taban[taban.length - 1]
      if (Math.hypot(ilk.x - son.x, ilk.y - son.y) < 0.01) taban = taban.slice(0, -1)
    }
    if (taban.length < 3) continue

    // Zemin kotu: taban noktalarinin en dusugu — bina araziye gomulmesin
    let zemin = Infinity
    for (const n of taban) zemin = Math.min(zemin, kotOku(p.izgara, n.x, n.y))
    if (!Number.isFinite(zemin)) continue
    const tepe = zemin + (c.yukseklik ?? 6.2)

    const taban0 = vSayac + 1
    for (const n of taban) satir.push(`v ${n.x.toFixed(3)} ${zemin.toFixed(3)} ${(-n.y).toFixed(3)}`)
    for (const n of taban) satir.push(`v ${n.x.toFixed(3)} ${tepe.toFixed(3)} ${(-n.y).toFixed(3)}`)
    const m = taban.length
    vSayac += m * 2

    // duvarlar
    for (let i = 0; i < m; i++) {
      const a = taban0 + i
      const b = taban0 + ((i + 1) % m)
      const c2 = a + m
      const d = b + m
      satir.push(`f ${a} ${b} ${d} ${c2}`)
    }
    // cati
    for (const [i0, i1, i2] of ucgenle(taban)) {
      satir.push(`f ${taban0 + m + i0} ${taban0 + m + i1} ${taban0 + m + i2}`)
    }
    no++
    if (no > 4000) break
  }

  return satir.join('\n') + '\n'
}

// ------------------------------------------------------------------- GeoJSON

export function geoJson(p: AraziPaketi, geri: (x: number, y: number) => { enlem: number; boylam: number }): string {
  const ozellikler = p.cizgiler.map((c) => ({
    type: 'Feature',
    properties: {
      katman: c.tur,
      sinif: c.sinif,
      ad: c.ad,
      yukseklik_m: c.yukseklik,
      kat: c.katSayisi,
    },
    geometry: {
      type: c.kapali ? 'Polygon' : 'LineString',
      coordinates: c.kapali
        ? [c.noktalar.map((n) => { const g = geri(n.x, n.y); return [+g.boylam.toFixed(7), +g.enlem.toFixed(7)] })]
        : c.noktalar.map((n) => { const g = geri(n.x, n.y); return [+g.boylam.toFixed(7), +g.enlem.toFixed(7)] }),
    },
  }))

  const agac = p.agaclar.map((a) => {
    const g = geri(a.x, a.y)
    return {
      type: 'Feature',
      properties: { katman: 'agac' },
      geometry: { type: 'Point', coordinates: [+g.boylam.toFixed(7), +g.enlem.toFixed(7)] },
    }
  })

  return JSON.stringify(
    {
      type: 'FeatureCollection',
      metadata: {
        uretici: 'ArchLib',
        merkez: p.merkez,
        yaricap_m: p.yaricap,
        kontur_araligi_m: p.konturAralik,
        kot_araligi_m: [p.izgara.enDusuk, p.izgara.enYuksek],
        veri: 'OpenStreetMap (ODbL) + AWS Terrain Tiles',
      },
      features: [...ozellikler, ...agac],
    },
    null,
    1,
  )
}

// --------------------------------------------------------------------- indir

export function dosyaIndir(icerik: string, ad: string, mime: string): void {
  const blob = new Blob([icerik], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = ad
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}
