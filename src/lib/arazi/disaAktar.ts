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
import type { KesitSahnesi } from './kesitSahne'
import { kotOku } from './yukseklik'

export interface AraziPaketi {
  readonly cizgiler: readonly Cizgi[]
  readonly agaclar: readonly Nokta[]
  readonly konturlar: readonly KonturCizgisi[]
  readonly izgara: YukseklikIzgarasi
  readonly merkez: { enlem: number; boylam: number }
  /** Secim dikdortgeninin yari genisligi (dogu-bati, m) */
  readonly yariGenislik: number
  /** Secim dikdortgeninin yari yuksekligi (kuzey-guney, m) */
  readonly yariYukseklik: number
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

export const KATMANLAR: Record<
  | KatmanTuru
  | 'kontur'
  | 'konturAna'
  | 'sinir'
  | 'kesit'
  | 'kesitZemin'
  | 'kesitBina'
  | 'kesitBinaGorunus'
  | 'kesitAgac',
  KatmanTanimi
> = {
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
  kesitZemin: { ad: 'S-ZEMIN', aci: 7, svg: '#262320', kalinlik: 0.6 },
  kesitBina: { ad: 'S-BINA-KESIT', aci: 1, svg: '#262320', kalinlik: 0.6 },
  kesitBinaGorunus: { ad: 'S-BINA-GORUNUS', aci: 8, svg: '#4c463e', kalinlik: 0.35 },
  kesitAgac: { ad: 'S-AGAC', aci: 3, svg: '#519976', kalinlik: 0.3 },
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
  s += dxfCift(9, '$EXTMIN') + dxfCift(10, (-p.yariGenislik).toFixed(3)) + dxfCift(20, (-p.yariYukseklik).toFixed(3)) + dxfCift(30, '0.0')
  s += dxfCift(9, '$EXTMAX') + dxfCift(10, p.yariGenislik.toFixed(3)) + dxfCift(20, p.yariYukseklik.toFixed(3)) + dxfCift(30, '0.0')
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
  const gx = p.yariGenislik
  const gy = p.yariYukseklik
  s += dxfPolyline(
    KATMANLAR.sinir.ad,
    [
      { x: -gx, y: -gy },
      { x: gx, y: -gy },
      { x: gx, y: gy },
      { x: -gx, y: gy },
    ],
    true,
  )
  s += dxfMetin(
    KATMANLAR.sinir.ad,
    { x: -gx, y: -gy - 14 },
    Math.max(3, Math.max(gx, gy) / 60),
    `ArchLib  ${p.merkez.enlem.toFixed(5)}, ${p.merkez.boylam.toFixed(5)}  ` +
      `${(2 * gx).toFixed(0)}x${(2 * gy).toFixed(0)}m  KONTUR=${p.konturAralik}m  BIRIM=METRE`,
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

function svgYol(
  noktalar: readonly Nokta[],
  kapali: boolean,
  olcek: number,
  gx: number,
  gy: number,
): string {
  const d = noktalar
    .map((n, i) => {
      const x = ((n.x + gx) * olcek).toFixed(2)
      const y = ((gy - n.y) * olcek).toFixed(2)
      return `${i === 0 ? 'M' : 'L'}${x} ${y}`
    })
    .join(' ')
  return kapali ? `${d} Z` : d
}

export function planSvg(p: AraziPaketi, uzunKenarPx = 1400): string {
  const gx = p.yariGenislik
  const gy = p.yariYukseklik
  const olcek = uzunKenarPx / (2 * Math.max(gx, gy))
  const G = Math.round(2 * gx * olcek)
  const Y = Math.round(2 * gy * olcek)
  const g: string[] = []
  const yol = (n: readonly Nokta[], kapali: boolean) => svgYol(n, kapali, olcek, gx, gy)

  g.push(`<rect width="${G}" height="${Y}" fill="#fcfbf8"/>`)

  const yesil = p.cizgiler.filter((c) => c.tur === 'yesil' && c.kapali)
  if (yesil.length) {
    g.push(`<g fill="#727d63" fill-opacity="0.13" stroke="none">`)
    for (const c of yesil) g.push(`<path d="${yol(c.noktalar, true)}"/>`)
    g.push('</g>')
  }

  const su = p.cizgiler.filter((c) => c.tur === 'su')
  if (su.length) {
    g.push(
      `<g fill="#5c7c92" fill-opacity="0.17" stroke="#5c7c92" stroke-opacity="0.55" stroke-width="${(0.8 * olcek).toFixed(2)}">`,
    )
    for (const c of su)
      g.push(`<path d="${yol(c.noktalar, c.kapali)}" ${c.kapali ? '' : 'fill="none"'}/>`)
    g.push('</g>')
  }

  const ince = p.konturlar.filter((k) => !k.ana)
  const kalin = p.konturlar.filter((k) => k.ana)
  g.push(`<g fill="none" stroke="#dcdad0" stroke-width="0.7">`)
  for (const k of ince) g.push(`<path d="${yol(k.noktalar, false)}"/>`)
  g.push('</g>')
  g.push(`<g fill="none" stroke="#a97b4c" stroke-width="1.15" stroke-opacity="0.9">`)
  for (const k of kalin) g.push(`<path d="${yol(k.noktalar, false)}"/>`)
  g.push('</g>')

  g.push(
    `<g fill="none" stroke="#85857b" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.8">`,
  )
  for (const c of p.cizgiler.filter((x) => x.tur === 'yol')) {
    const w = Math.max(0.6, yolGenisligi(c.sinif) * olcek * 0.5)
    g.push(`<path d="${yol(c.noktalar, false)}" stroke-width="${w.toFixed(2)}"/>`)
  }
  g.push('</g>')

  const dy = p.cizgiler.filter((x) => x.tur === 'demiryolu')
  if (dy.length) {
    g.push(`<g fill="none" stroke="#6d6a8f" stroke-width="1.4" stroke-dasharray="8 5">`)
    for (const c of dy) g.push(`<path d="${yol(c.noktalar, false)}"/>`)
    g.push('</g>')
  }

  g.push(
    `<g fill="#b9573e" fill-opacity="0.16" stroke="#b9573e" stroke-width="1" stroke-linejoin="round">`,
  )
  for (const c of p.cizgiler.filter((x) => x.tur === 'bina')) {
    g.push(`<path d="${yol(c.noktalar, true)}"/>`)
  }
  g.push('</g>')

  if (p.agaclar.length) {
    g.push(`<g fill="#727d63" fill-opacity="0.5">`)
    for (const a of p.agaclar) {
      g.push(
        `<circle cx="${((a.x + gx) * olcek).toFixed(1)}" cy="${((gy - a.y) * olcek).toFixed(1)}" r="${Math.max(1.5, 2.5 * olcek).toFixed(1)}"/>`,
      )
    }
    g.push('</g>')
  }

  const olcekCubuk = 100 * olcek
  g.push(
    `<rect x="0.5" y="0.5" width="${G - 1}" height="${Y - 1}" fill="none" stroke="#30332d" stroke-width="1"/>` +
      `<g stroke="#30332d" stroke-width="2" fill="none">` +
      `<path d="M24 ${Y - 30} h${olcekCubuk.toFixed(1)}"/>` +
      `<path d="M24 ${Y - 36} v12"/>` +
      `<path d="M${(24 + olcekCubuk).toFixed(1)} ${Y - 36} v12"/></g>` +
      `<text x="24" y="${Y - 42}" font-family="DM Sans, sans-serif" font-size="13" fill="#30332d">100 m</text>` +
      `<text x="24" y="28" font-family="DM Sans, sans-serif" font-size="13" fill="#30332d">` +
      `ArchLib · ${p.merkez.enlem.toFixed(5)}, ${p.merkez.boylam.toFixed(5)} · ` +
      `${(2 * gx).toFixed(0)}×${(2 * gy).toFixed(0)} m · kontur ${p.konturAralik} m</text>` +
      `<g stroke="#30332d" stroke-width="2" fill="none">` +
      `<path d="M${G - 44} 62 v-34 M${G - 52} 38 l8 -10 l8 10"/></g>` +
      `<text x="${G - 48}" y="80" font-family="DM Sans, sans-serif" font-size="12" fill="#30332d">N</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${G}" height="${Y}" viewBox="0 0 ${G} ${Y}">
${g.join('\n')}
</svg>`
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
<text x="60" y="${yukseklik - 18}" font-family="monospace" font-size="12" fill="#262320">Uzunluk ${uzunluk.toFixed(0)} m · Kot ${enDusuk.toFixed(1)}–${enYuksek.toFixed(1)} m · Düşey abartma ${abartma}x</text>
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
  satir.push(
    `# merkez ${p.merkez.enlem.toFixed(6)}, ${p.merkez.boylam.toFixed(6)}  ` +
      `alan ${(2 * p.yariGenislik).toFixed(0)}x${(2 * p.yariYukseklik).toFixed(0)} m`,
  )
  satir.push('# birim: metre — X dogu, Y yukari, Z guney (Y-up, sag el)')
  satir.push('')

  const { satir: sr, sutun: st, veri, yariGenislik: gx, yariYukseklik: gy } = p.izgara
  const adimX = (2 * gx) / Math.max(1, st - 1)
  const adimY = (2 * gy) / Math.max(1, sr - 1)
  let vSayac = 0

  // --- arazi
  satir.push('o arazi')
  for (let i = 0; i < sr; i++) {
    for (let j = 0; j < st; j++) {
      const x = -gx + j * adimX
      const y = gy - i * adimY
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
        genislik_m: 2 * p.yariGenislik,
        yukseklik_m: 2 * p.yariYukseklik,
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


/**
 * Kesit sahnesini (zemin + binalar + agaclar) katmanli DXF olarak yazar.
 * Kesite giren kutleler ile gorunuse girenler AYRI KATMANDA: CAD tarafinda
 * cizgi kalinligi hiyerarsisi kurulabilsin diye.
 */
export function kesitSahnesiDxf(s: KesitSahnesi): string {
  const katmanlar = [
    KATMANLAR.kesitZemin,
    KATMANLAR.kesitBina,
    KATMANLAR.kesitBinaGorunus,
    KATMANLAR.kesitAgac,
    KATMANLAR.sinir,
  ]

  let d = ''
  d += dxfCift(0, 'SECTION') + dxfCift(2, 'HEADER')
  d += dxfCift(9, '$ACADVER') + dxfCift(1, 'AC1009')
  d += dxfCift(9, '$INSUNITS') + dxfCift(70, 6)
  d += dxfCift(0, 'ENDSEC')

  d += dxfCift(0, 'SECTION') + dxfCift(2, 'TABLES')
  d += dxfCift(0, 'TABLE') + dxfCift(2, 'LAYER') + dxfCift(70, katmanlar.length)
  for (const k of katmanlar) {
    d += dxfCift(0, 'LAYER') + dxfCift(2, k.ad) + dxfCift(70, 0) + dxfCift(62, k.aci) + dxfCift(6, 'CONTINUOUS')
  }
  d += dxfCift(0, 'ENDTAB') + dxfCift(0, 'ENDSEC')

  d += dxfCift(0, 'SECTION') + dxfCift(2, 'ENTITIES')

  // zemin cizgisi (gercek olcu, dusey abartma yok — CAD'de olculebilsin)
  d += dxfPolyline(
    KATMANLAR.kesitZemin.ad,
    s.profil.map((n) => ({ x: n.mesafe, y: n.kot })),
    false,
  )

  // binalar
  for (const b of s.binalar) {
    d += dxfPolyline(
      b.kesiliyor ? KATMANLAR.kesitBina.ad : KATMANLAR.kesitBinaGorunus.ad,
      [
        { x: b.d0, y: b.zemin },
        { x: b.d1, y: b.zemin },
        { x: b.d1, y: b.tepe },
        { x: b.d0, y: b.tepe },
      ],
      true,
    )
  }

  // agaclar: govde + taç
  for (const a of s.agaclar) {
    const tacMerkez = a.zemin + a.yukseklik * 0.72
    const yaricap = a.yukseklik * a.capOran * 0.5
    d += dxfPolyline(
      KATMANLAR.kesitAgac.ad,
      [
        { x: a.d, y: a.zemin },
        { x: a.d, y: tacMerkez },
      ],
      false,
    )
    d += dxfDaire(KATMANLAR.kesitAgac.ad, { x: a.d, y: tacMerkez }, Math.max(0.6, yaricap))
  }

  d += dxfMetin(
    KATMANLAR.sinir.ad,
    { x: 0, y: s.enDusuk - Math.max(4, (s.tavan - s.enDusuk) * 0.2) },
    Math.max(1.5, s.uzunluk / 110),
    `KESIT  UZUNLUK=${s.uzunluk.toFixed(1)}m  BANT=${s.bant.toFixed(0)}m  ` +
      `KOT=${s.enDusuk.toFixed(1)}-${s.enYuksek.toFixed(1)}m  ${s.binalar.length} YAPI  BIRIM=METRE`,
  )

  d += dxfCift(0, 'ENDSEC') + dxfCift(0, 'EOF')
  return d
}
