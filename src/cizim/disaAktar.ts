/**
 * Cizim disa aktarimlari: DXF (2B plan), SVG (pafta icin), OBJ (3B kutle),
 * JSON (proje yedegi).
 *
 * DXF R12 (AC1009) yaziliyor: LWPOLYLINE yerine POLYLINE/VERTEX/SEQEND
 * kullaniliyor cunku eski surumler dahil butun CAD programlari bunu okuyor.
 */

import type { Aciklik, Duvar, Kat, Nokta, Proje } from './tipler'
import {
  birim,
  cikar,
  dik,
  duvarKabugu,
  duvarNoktasi,
  duvarParcalari,
  duvarUzunluk,
  odalariBul,
  poligonAlan,
  uzaklik,
} from './geometri'

export { dosyaIndir } from '../lib/arazi/disaAktar'

// ------------------------------------------------------------------- DXF

interface KatmanTanimi {
  ad: string
  renk: number
}

const DXF_KATMANLARI: Record<string, KatmanTanimi> = {
  duvar: { ad: 'A-DUVAR', renk: 7 },
  bolme: { ad: 'A-BOLME', renk: 8 },
  kapi: { ad: 'A-KAPI', renk: 3 },
  pencere: { ad: 'A-PENCERE', renk: 5 },
  donati: { ad: 'A-DONATI', renk: 40 },
  kolon: { ad: 'A-KOLON', renk: 1 },
  olcu: { ad: 'A-OLCU', renk: 30 },
  oda: { ad: 'A-ODA-YAZI', renk: 2 },
  izgara: { ad: 'A-AKS', renk: 9 },
}

function c(kod: number, deger: string | number): string {
  return `${kod}\n${deger}\n`
}

function dxfPolyline(noktalar: readonly Nokta[], katman: string, kapali: boolean): string {
  let s = c(0, 'POLYLINE') + c(8, katman) + c(66, 1) + c(70, kapali ? 1 : 0)
  for (const n of noktalar) {
    s += c(0, 'VERTEX') + c(8, katman) + c(10, n.x.toFixed(4)) + c(20, n.y.toFixed(4))
  }
  return s + c(0, 'SEQEND') + c(8, katman)
}

function dxfCizgi(a: Nokta, b: Nokta, katman: string): string {
  return (
    c(0, 'LINE') +
    c(8, katman) +
    c(10, a.x.toFixed(4)) +
    c(20, a.y.toFixed(4)) +
    c(11, b.x.toFixed(4)) +
    c(21, b.y.toFixed(4))
  )
}

function dxfYazi(p: Nokta, metin: string, yukseklik: number, katman: string): string {
  return (
    c(0, 'TEXT') +
    c(8, katman) +
    c(10, p.x.toFixed(4)) +
    c(20, p.y.toFixed(4)) +
    c(40, yukseklik.toFixed(3)) +
    c(1, metin) +
    c(72, 1) +
    c(11, p.x.toFixed(4)) +
    c(21, p.y.toFixed(4))
  )
}

function dxfYay(merkez: Nokta, yaricap: number, bas: number, bit: number, katman: string): string {
  return (
    c(0, 'ARC') +
    c(8, katman) +
    c(10, merkez.x.toFixed(4)) +
    c(20, merkez.y.toFixed(4)) +
    c(40, yaricap.toFixed(4)) +
    c(50, bas.toFixed(3)) +
    c(51, bit.toFixed(3))
  )
}

function dondur(p: Nokta, merkez: Nokta, aciDerece: number): Nokta {
  const r = (aciDerece * Math.PI) / 180
  const dx = p.x - merkez.x
  const dy = p.y - merkez.y
  return {
    x: merkez.x + dx * Math.cos(r) - dy * Math.sin(r),
    y: merkez.y + dx * Math.sin(r) + dy * Math.cos(r),
  }
}

function kutuNoktalari(merkez: Nokta, g: number, d: number, aci: number): Nokta[] {
  const ham: Nokta[] = [
    { x: merkez.x - g / 2, y: merkez.y - d / 2 },
    { x: merkez.x + g / 2, y: merkez.y - d / 2 },
    { x: merkez.x + g / 2, y: merkez.y + d / 2 },
    { x: merkez.x - g / 2, y: merkez.y + d / 2 },
  ]
  return ham.map((p) => dondur(p, merkez, aci))
}

/** Aciklik icin 2B cizim ogeleri (sove, dograma, kapi yayi). */
function aciklikDxf(w: Duvar, a: Aciklik): string {
  const u = birim(cikar(w.b, w.a))
  const n = dik(u)
  const merkez = duvarNoktasi(w, a.mesafe)
  const yariG = a.genislik / 2
  const yariK = w.kalinlik / 2
  const katman = a.tur === 'kapi' ? DXF_KATMANLARI.kapi.ad : DXF_KATMANLARI.pencere.ad
  const nokta = (dg: number, dn: number): Nokta => ({
    x: merkez.x + u.x * dg + n.x * dn,
    y: merkez.y + u.y * dg + n.y * dn,
  })

  let s = ''
  s += dxfCizgi(nokta(-yariG, yariK), nokta(-yariG, -yariK), katman)
  s += dxfCizgi(nokta(yariG, yariK), nokta(yariG, -yariK), katman)

  if (a.tur === 'pencere') {
    s += dxfCizgi(nokta(-yariG, yariK / 3), nokta(yariG, yariK / 3), katman)
    s += dxfCizgi(nokta(-yariG, -yariK / 3), nokta(yariG, -yariK / 3), katman)
  } else {
    const yon = a.ters ? -1 : 1
    const mentese = nokta(-yariG, 0)
    const kanat = {
      x: mentese.x + n.x * a.genislik * yon,
      y: mentese.y + n.y * a.genislik * yon,
    }
    s += dxfCizgi(mentese, kanat, katman)
    const bas = (Math.atan2(kanat.y - mentese.y, kanat.x - mentese.x) * 180) / Math.PI
    const acikUc = nokta(yariG, 0)
    const bit = (Math.atan2(acikUc.y - mentese.y, acikUc.x - mentese.x) * 180) / Math.PI
    s += dxfYay(mentese, a.genislik, yon > 0 ? bit : bas, yon > 0 ? bas : bit, katman)
  }
  return s
}

export function planDxf(kat: Kat, projeAdi: string): string {
  const odalar = odalariBul(kat.duvarlar)

  let govde = ''
  for (const w of kat.duvarlar) {
    const katman = w.tur === 'bolme' ? DXF_KATMANLARI.bolme.ad : DXF_KATMANLARI.duvar.ad
    govde += dxfPolyline(duvarKabugu(w), katman, true)
  }
  for (const a of kat.aciklikar) {
    const w = kat.duvarlar.find((x) => x.id === a.duvarId)
    if (w) govde += aciklikDxf(w, a)
  }
  for (const c2 of kat.kolonlar) {
    govde += dxfPolyline(
      kutuNoktalari(c2.konum, c2.genislik, c2.derinlik, c2.aci),
      DXF_KATMANLARI.kolon.ad,
      true,
    )
  }
  for (const m of kat.mobilyalar) {
    govde += dxfPolyline(
      kutuNoktalari(m.konum, m.genislik, m.derinlik, m.aci),
      DXF_KATMANLARI.donati.ad,
      true,
    )
    govde += dxfYazi(m.konum, m.ad, 0.14, DXF_KATMANLARI.donati.ad)
  }
  for (const o of kat.olculer) {
    const u = birim(cikar(o.b, o.a))
    const n = dik(u)
    const a = { x: o.a.x + n.x * o.ofset, y: o.a.y + n.y * o.ofset }
    const b = { x: o.b.x + n.x * o.ofset, y: o.b.y + n.y * o.ofset }
    govde += dxfCizgi(a, b, DXF_KATMANLARI.olcu.ad)
    govde += dxfCizgi(o.a, a, DXF_KATMANLARI.olcu.ad)
    govde += dxfCizgi(o.b, b, DXF_KATMANLARI.olcu.ad)
    govde += dxfYazi(
      { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 + 0.08 },
      `${uzaklik(o.a, o.b).toFixed(2)}`,
      0.16,
      DXF_KATMANLARI.olcu.ad,
    )
  }
  for (const oda of odalar) {
    govde += dxfYazi(oda.merkez, `${oda.alan.toFixed(1)} m2`, 0.22, DXF_KATMANLARI.oda.ad)
  }

  let tablo = c(0, 'SECTION') + c(2, 'TABLES') + c(0, 'TABLE') + c(2, 'LAYER')
  tablo += c(70, Object.keys(DXF_KATMANLARI).length)
  for (const k of Object.values(DXF_KATMANLARI)) {
    tablo += c(0, 'LAYER') + c(2, k.ad) + c(70, 0) + c(62, k.renk) + c(6, 'CONTINUOUS')
  }
  tablo += c(0, 'ENDTAB') + c(0, 'ENDSEC')

  const basli =
    c(0, 'SECTION') +
    c(2, 'HEADER') +
    c(9, '$INSUNITS') +
    c(70, 6) +
    c(9, '$ACADVER') +
    c(1, 'AC1009') +
    c(0, 'ENDSEC')

  return (
    basli +
    tablo +
    c(0, 'SECTION') +
    c(2, 'ENTITIES') +
    dxfYazi({ x: 0, y: -1.2 }, `${projeAdi} - ${kat.ad}`, 0.3, DXF_KATMANLARI.oda.ad) +
    govde +
    c(0, 'ENDSEC') +
    c(0, 'EOF')
  )
}

// ------------------------------------------------------------------- SVG

export function planSvg(kat: Kat, projeAdi: string, genislikPx = 1600): string {
  const noktalar: Nokta[] = []
  for (const w of kat.duvarlar) noktalar.push(...duvarKabugu(w))
  for (const m of kat.mobilyalar) noktalar.push(m.konum)
  if (!noktalar.length) return ''

  const x0 = Math.min(...noktalar.map((n) => n.x))
  const x1 = Math.max(...noktalar.map((n) => n.x))
  const y0 = Math.min(...noktalar.map((n) => n.y))
  const y1 = Math.max(...noktalar.map((n) => n.y))
  const pay = 1.2
  const gen = x1 - x0 + pay * 2
  const yuk = y1 - y0 + pay * 2
  const k = genislikPx / gen
  const Y = Math.round(yuk * k) + 70

  const X = (x: number) => ((x - x0 + pay) * k).toFixed(2)
  const YY = (y: number) => ((y1 + pay - y) * k).toFixed(2)

  const parca: string[] = []
  const odalar = odalariBul(kat.duvarlar)

  for (const oda of odalar) {
    const d = oda.poligon.map((n, i) => `${i ? 'L' : 'M'}${X(n.x)} ${YY(n.y)}`).join(' ')
    parca.push(`<path d="${d} Z" fill="#727d63" fill-opacity="0.07"/>`)
  }
  for (const w of kat.duvarlar) {
    const d = duvarKabugu(w)
      .map((n, i) => `${i ? 'L' : 'M'}${X(n.x)} ${YY(n.y)}`)
      .join(' ')
    parca.push(
      `<path d="${d} Z" fill="${w.tur === 'bolme' ? '#e8e5da' : '#ddd9cd'}" stroke="#30332d" stroke-width="1.1"/>`,
    )
  }
  for (const a of kat.aciklikar) {
    const w = kat.duvarlar.find((x) => x.id === a.duvarId)
    if (!w) continue
    const u = birim(cikar(w.b, w.a))
    const n = dik(u)
    const merkez = duvarNoktasi(w, a.mesafe)
    const yariG = a.genislik / 2
    const yariK = w.kalinlik / 2 + 0.01
    const nokta = (dg: number, dn: number) => ({
      x: merkez.x + u.x * dg + n.x * dn,
      y: merkez.y + u.y * dg + n.y * dn,
    })
    const p = [nokta(-yariG, yariK), nokta(yariG, yariK), nokta(yariG, -yariK), nokta(-yariG, -yariK)]
    parca.push(
      `<path d="${p.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)} ${YY(q.y)}`).join(' ')} Z" fill="#fcfbf8" stroke="#30332d" stroke-width="1"/>`,
    )
    if (a.tur === 'pencere') {
      const c1 = nokta(-yariG, 0)
      const c2 = nokta(yariG, 0)
      parca.push(
        `<line x1="${X(c1.x)}" y1="${YY(c1.y)}" x2="${X(c2.x)}" y2="${YY(c2.y)}" stroke="#5c7c92" stroke-width="1.4"/>`,
      )
    } else {
      const yon = a.ters ? -1 : 1
      const mentese = nokta(-yariG, 0)
      const kanat = { x: mentese.x + n.x * a.genislik * yon, y: mentese.y + n.y * a.genislik * yon }
      parca.push(
        `<line x1="${X(mentese.x)}" y1="${YY(mentese.y)}" x2="${X(kanat.x)}" y2="${YY(kanat.y)}" stroke="#5c7c92" stroke-width="1.4"/>`,
      )
    }
  }
  for (const m of kat.mobilyalar) {
    const p = kutuNoktalari(m.konum, m.genislik, m.derinlik, m.aci)
    parca.push(
      `<path d="${p.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)} ${YY(q.y)}`).join(' ')} Z" fill="${m.renk}22" stroke="${m.renk}" stroke-width="1"/>`,
    )
  }
  for (const c2 of kat.kolonlar) {
    const p = kutuNoktalari(c2.konum, c2.genislik, c2.derinlik, c2.aci)
    parca.push(
      `<path d="${p.map((q, i) => `${i ? 'L' : 'M'}${X(q.x)} ${YY(q.y)}`).join(' ')} Z" fill="#30332d"/>`,
    )
  }
  for (const oda of odalar) {
    if (oda.alan < 0.8) continue
    parca.push(
      `<text x="${X(oda.merkez.x)}" y="${YY(oda.merkez.y)}" text-anchor="middle" font-family="DM Sans, sans-serif" font-size="13" fill="#5f6259">${oda.alan.toFixed(1)} m²</text>`,
    )
  }

  const toplam = odalar.reduce((t, o) => t + o.alan, 0)
  parca.push(
    `<text x="24" y="${Y - 22}" font-family="DM Sans, sans-serif" font-size="14" fill="#30332d">${projeAdi} · ${kat.ad} · ${odalar.length} mekan · ${toplam.toFixed(1)} m²</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.round(gen * k)}" height="${Y}" viewBox="0 0 ${Math.round(gen * k)} ${Y}">
<rect width="100%" height="100%" fill="#fcfbf8"/>
${parca.join('\n')}
</svg>`
}

// ------------------------------------------------------------------- OBJ

interface Kutu {
  cx: number
  cy: number
  cz: number
  sx: number
  sy: number
  sz: number
  aci: number
  grup: string
}

function katKutulari(kat: Kat): Kutu[] {
  const cikti: Kutu[] = []
  const katY = kat.yukseklik
  const taban = kat.kot

  for (const w of kat.duvarlar) {
    const boy = duvarUzunluk(w)
    if (boy < 0.02) continue
    const h = w.yukseklik > 0 ? w.yukseklik : katY
    const aci = Math.atan2(w.b.y - w.a.y, w.b.x - w.a.x)
    const ux = (w.b.x - w.a.x) / boy
    const uy = (w.b.y - w.a.y) / boy
    const { dolu, delik } = duvarParcalari(w, kat.aciklikar)

    for (const [s, e] of dolu) {
      const uzun = e - s
      if (uzun < 0.005) continue
      const t = (s + e) / 2
      cikti.push({
        cx: w.a.x + ux * t,
        cy: w.a.y + uy * t,
        cz: taban + h / 2,
        sx: uzun,
        sy: w.kalinlik,
        sz: h,
        aci,
        grup: 'duvar',
      })
    }
    for (const a of delik) {
      const ust = h - (a.esik + a.yukseklik)
      if (ust > 0.01) {
        cikti.push({
          cx: w.a.x + ux * a.mesafe,
          cy: w.a.y + uy * a.mesafe,
          cz: taban + a.esik + a.yukseklik + ust / 2,
          sx: a.genislik,
          sy: w.kalinlik,
          sz: ust,
          aci,
          grup: 'lento',
        })
      }
      if (a.esik > 0.01) {
        cikti.push({
          cx: w.a.x + ux * a.mesafe,
          cy: w.a.y + uy * a.mesafe,
          cz: taban + a.esik / 2,
          sx: a.genislik,
          sy: w.kalinlik,
          sz: a.esik,
          aci,
          grup: 'parapet',
        })
      }
    }
  }

  for (const c2 of kat.kolonlar) {
    cikti.push({
      cx: c2.konum.x,
      cy: c2.konum.y,
      cz: taban + katY / 2,
      sx: c2.genislik,
      sy: c2.derinlik,
      sz: katY,
      aci: (c2.aci * Math.PI) / 180,
      grup: 'kolon',
    })
  }
  for (const m of kat.mobilyalar) {
    cikti.push({
      cx: m.konum.x,
      cy: m.konum.y,
      cz: taban + m.yukseklik / 2,
      sx: m.genislik,
      sy: m.derinlik,
      sz: m.yukseklik,
      aci: (m.aci * Math.PI) / 180,
      grup: 'donati',
    })
  }
  return cikti
}

/** Kulak kirpma ile basit poligon ucgenlemesi. */
function ucgenle(poligon: readonly Nokta[]): [number, number, number][] {
  const n = poligon.length
  if (n < 3) return []
  const sira = poligonAlan(poligon) > 0 ? [...Array(n).keys()] : [...Array(n).keys()].reverse()
  const kalan = [...sira]
  const ucgen: [number, number, number][] = []
  let guvenlik = 0
  while (kalan.length > 3 && guvenlik++ < n * n) {
    let kirpildi = false
    for (let i = 0; i < kalan.length; i++) {
      const a = poligon[kalan[(i - 1 + kalan.length) % kalan.length]]
      const b = poligon[kalan[i]]
      const c2 = poligon[kalan[(i + 1) % kalan.length]]
      const capraz = (b.x - a.x) * (c2.y - a.y) - (b.y - a.y) * (c2.x - a.x)
      if (capraz <= 0) continue
      let icerde = false
      for (let j = 0; j < kalan.length; j++) {
        if (j === i || j === (i - 1 + kalan.length) % kalan.length || j === (i + 1) % kalan.length) continue
        const p = poligon[kalan[j]]
        const d1 = (b.x - a.x) * (p.y - a.y) - (b.y - a.y) * (p.x - a.x)
        const d2 = (c2.x - b.x) * (p.y - b.y) - (c2.y - b.y) * (p.x - b.x)
        const d3 = (a.x - c2.x) * (p.y - c2.y) - (a.y - c2.y) * (p.x - c2.x)
        if (d1 >= 0 && d2 >= 0 && d3 >= 0) {
          icerde = true
          break
        }
      }
      if (icerde) continue
      ucgen.push([
        kalan[(i - 1 + kalan.length) % kalan.length],
        kalan[i],
        kalan[(i + 1) % kalan.length],
      ])
      kalan.splice(i, 1)
      kirpildi = true
      break
    }
    if (!kirpildi) break
  }
  if (kalan.length === 3) ucgen.push([kalan[0], kalan[1], kalan[2]])
  return ucgen
}

export function modelObj(proje: Proje, katIdler: string[]): string {
  const satir: string[] = [
    `# ArchLib cizim modeli - ${proje.ad}`,
    `# birim: metre, Z yukari`,
    '',
  ]
  let sayac = 1

  const kutuYaz = (k: Kutu) => {
    const cs = Math.cos(k.aci)
    const sn = Math.sin(k.aci)
    const yariX = k.sx / 2
    const yariY = k.sy / 2
    const yariZ = k.sz / 2
    const yerel: [number, number, number][] = [
      [-yariX, -yariY, -yariZ],
      [yariX, -yariY, -yariZ],
      [yariX, yariY, -yariZ],
      [-yariX, yariY, -yariZ],
      [-yariX, -yariY, yariZ],
      [yariX, -yariY, yariZ],
      [yariX, yariY, yariZ],
      [-yariX, yariY, yariZ],
    ]
    for (const [x, y, z] of yerel) {
      satir.push(
        `v ${(k.cx + x * cs - y * sn).toFixed(4)} ${(k.cy + x * sn + y * cs).toFixed(4)} ${(k.cz + z).toFixed(4)}`,
      )
    }
    const t = sayac
    satir.push(
      `f ${t} ${t + 1} ${t + 2} ${t + 3}`,
      `f ${t + 4} ${t + 7} ${t + 6} ${t + 5}`,
      `f ${t} ${t + 4} ${t + 5} ${t + 1}`,
      `f ${t + 1} ${t + 5} ${t + 6} ${t + 2}`,
      `f ${t + 2} ${t + 6} ${t + 7} ${t + 3}`,
      `f ${t + 3} ${t + 7} ${t + 4} ${t}`,
    )
    sayac += 8
  }

  for (const kat of proje.katlar) {
    if (!katIdler.includes(kat.id)) continue
    satir.push(`o ${kat.ad.replace(/\s+/g, '_')}`)

    const gruplu = new Map<string, Kutu[]>()
    for (const k of katKutulari(kat)) {
      const liste = gruplu.get(k.grup) ?? []
      liste.push(k)
      gruplu.set(k.grup, liste)
    }
    for (const [grup, liste] of gruplu) {
      satir.push(`g ${grup}`)
      for (const k of liste) kutuYaz(k)
    }

    // doseme plakalari
    const odalar = odalariBul(kat.duvarlar)
    if (odalar.length) {
      satir.push('g doseme')
      for (const oda of odalar) {
        const taban = sayac
        for (const p of oda.poligon) {
          satir.push(`v ${p.x.toFixed(4)} ${p.y.toFixed(4)} ${(kat.kot - 0.12).toFixed(4)}`)
        }
        for (const p of oda.poligon) {
          satir.push(`v ${p.x.toFixed(4)} ${p.y.toFixed(4)} ${kat.kot.toFixed(4)}`)
        }
        const n = oda.poligon.length
        for (const [a, b, c2] of ucgenle(oda.poligon)) {
          satir.push(`f ${taban + n + a} ${taban + n + b} ${taban + n + c2}`)
          satir.push(`f ${taban + c2} ${taban + b} ${taban + a}`)
        }
        for (let i = 0; i < n; i++) {
          const j = (i + 1) % n
          satir.push(`f ${taban + i} ${taban + j} ${taban + n + j} ${taban + n + i}`)
        }
        sayac += n * 2
      }
    }
  }
  return satir.join('\n')
}

// ------------------------------------------------------------------ JSON

export function projeJson(proje: Proje): string {
  return JSON.stringify({ surum: 1, uygulama: 'ArchLib Cizim', proje }, null, 2)
}

export function projeAyristir(metin: string): Proje | null {
  try {
    const veri = JSON.parse(metin) as { proje?: Proje }
    const p = veri.proje ?? (veri as unknown as Proje)
    if (!p || !Array.isArray(p.katlar) || !p.katlar.length) return null
    return p
  } catch {
    return null
  }
}

// ------------------------------------------------------------------ ozet

export interface KatOzeti {
  duvarUzunluk: number
  duvarSayisi: number
  kapi: number
  pencere: number
  odaSayisi: number
  toplamAlan: number
  odalar: { ad: string; alan: number }[]
}

export function katOzeti(kat: Kat): KatOzeti {
  const odalar = odalariBul(kat.duvarlar)
  return {
    duvarUzunluk: kat.duvarlar.reduce((t, w) => t + duvarUzunluk(w), 0),
    duvarSayisi: kat.duvarlar.length,
    kapi: kat.aciklikar.filter((a) => a.tur === 'kapi').length,
    pencere: kat.aciklikar.filter((a) => a.tur === 'pencere').length,
    odaSayisi: odalar.length,
    toplamAlan: odalar.reduce((t, o) => t + o.alan, 0),
    odalar: odalar.map((o, i) => ({ ad: `Mekan ${i + 1}`, alan: o.alan })),
  }
}

/** AI kritigi icin plani metne cevirir. */
export function planMetni(proje: Proje, kat: Kat): string {
  const ozet = katOzeti(kat)
  const satir: string[] = [
    `Proje: ${proje.ad}`,
    `Kat: ${kat.ad} (kot ${kat.kot} m, kat yuksekligi ${kat.yukseklik} m)`,
    `Duvar: ${ozet.duvarSayisi} adet, toplam ${ozet.duvarUzunluk.toFixed(1)} m`,
    `Aciklik: ${ozet.kapi} kapi, ${ozet.pencere} pencere`,
    `Mekan: ${ozet.odaSayisi} adet, toplam ${ozet.toplamAlan.toFixed(1)} m²`,
    '',
    'Mekan alanlari:',
  ]
  ozet.odalar.forEach((o, i) => satir.push(`  ${i + 1}. ${o.alan.toFixed(1)} m²`))

  if (kat.mobilyalar.length) {
    satir.push('', 'Donati:')
    const sayim = new Map<string, number>()
    for (const m of kat.mobilyalar) sayim.set(m.ad, (sayim.get(m.ad) ?? 0) + 1)
    for (const [ad, adet] of sayim) satir.push(`  ${ad} x${adet}`)
  }

  satir.push('', 'Duvar listesi (metre):')
  kat.duvarlar.slice(0, 60).forEach((w, i) => {
    satir.push(
      `  D${i + 1}: (${w.a.x.toFixed(2)}, ${w.a.y.toFixed(2)}) -> (${w.b.x.toFixed(2)}, ${w.b.y.toFixed(2)}) kalinlik ${(w.kalinlik * 100).toFixed(0)} cm`,
    )
  })
  return satir.join('\n')
}
