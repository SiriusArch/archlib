/**
 * Kesit sahnesi — bir hat boyunca alinan iki boyutlu mimari kesit.
 *
 * Yalnizca zemin profili degil; hattin iki yanindaki BANT icinde kalan
 * binalar ve agaclar da kesite giriyor. Bant genisligi kullanicinin
 * ayarladigi "derinlik": dar bant sadece hattin ustundekini, genis bant
 * arkadaki dokuyu da gosterir.
 *
 * Derinlik siralamasi onemli: hatta yakin nesneler onde ve opak, uzaktakiler
 * geride ve soluk cizilir. Mimari kesitte arka plan boyle okunur.
 */

import type { Nokta } from './projeksiyon'
import type { Cizgi } from './osm'
import { kotOku, type YukseklikIzgarasi } from './yukseklik'

export interface KesitBina {
  /** Hat boyunca baslangic ve bitis mesafesi (m) */
  readonly d0: number
  readonly d1: number
  /** Oturdugu kot ve tepe kotu (m) */
  readonly zemin: number
  readonly tepe: number
  /** Hattan dik uzaklik (m) — derinlik siralamasi icin */
  readonly derinlik: number
  /** Hat govdeyi gercekten kesiyor mu (kesite giren / gorunuse giren) */
  readonly kesiliyor: boolean
  readonly katSayisi?: number
  readonly ad?: string
}

export interface KesitAgac {
  readonly d: number
  readonly zemin: number
  readonly derinlik: number
  readonly yukseklik: number
  readonly capOran: number
}

export interface KesitSahnesi {
  readonly uzunluk: number
  readonly bant: number
  readonly profil: readonly { mesafe: number; kot: number }[]
  readonly binalar: readonly KesitBina[]
  readonly agaclar: readonly KesitAgac[]
  readonly enDusuk: number
  readonly enYuksek: number
  /** Bina tepeleri dahil en yuksek kot — cizim cercevesi icin */
  readonly tavan: number
}

interface Eksen {
  readonly a: Nokta
  readonly uzunluk: number
  /** hat yonu birim vektor */
  readonly u: Nokta
  /** hatta dik birim vektor */
  readonly n: Nokta
}

function eksenKur(a: Nokta, b: Nokta): Eksen {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const uzunluk = Math.hypot(dx, dy) || 1
  const u = { x: dx / uzunluk, y: dy / uzunluk }
  return { a, uzunluk, u, n: { x: -u.y, y: u.x } }
}

/** Noktayi hat koordinatina cevirir: d = hat boyunca, t = hatta dik. */
function yansit(e: Eksen, p: Nokta): { d: number; t: number } {
  const vx = p.x - e.a.x
  const vy = p.y - e.a.y
  return { d: vx * e.u.x + vy * e.u.y, t: vx * e.n.x + vy * e.n.y }
}

export interface KesitSecenek {
  /** Bant genisligi (m). Hattin her iki yanina yarisi kadar uzanir. */
  bant: number
  /** Zemin profili ornek sayisi */
  ornek?: number
  /** Agac yuksekligi varsayimi (m) */
  agacYuksekligi?: number
}

export function kesitSahnesiKur(
  izgara: YukseklikIzgarasi,
  cizgiler: readonly Cizgi[],
  agaclar: readonly Nokta[],
  a: Nokta,
  b: Nokta,
  secenek: KesitSecenek,
): KesitSahnesi {
  const e = eksenKur(a, b)
  const bant = Math.max(1, secenek.bant)
  const yariBant = bant / 2
  const ornek = secenek.ornek ?? 320
  const agacYuk = secenek.agacYuksekligi ?? 7

  // ---------------------------------------------------------- zemin profili
  const profil: { mesafe: number; kot: number }[] = []
  let enDusuk = Infinity
  let enYuksek = -Infinity
  for (let i = 0; i <= ornek; i++) {
    const s = (i / ornek) * e.uzunluk
    const p = { x: e.a.x + e.u.x * s, y: e.a.y + e.u.y * s }
    const kot = kotOku(izgara, p.x, p.y)
    profil.push({ mesafe: s, kot })
    if (kot < enDusuk) enDusuk = kot
    if (kot > enYuksek) enYuksek = kot
  }

  // --------------------------------------------------------------- binalar
  const binalar: KesitBina[] = []
  for (const c of cizgiler) {
    if (c.tur !== 'bina' || c.noktalar.length < 3) continue

    let dMin = Infinity
    let dMax = -Infinity
    let tMin = Infinity
    let tMax = -Infinity
    for (const p of c.noktalar) {
      const { d, t } = yansit(e, p)
      if (d < dMin) dMin = d
      if (d > dMax) dMax = d
      if (t < tMin) tMin = t
      if (t > tMax) tMax = t
    }

    // Bant ve hat uzunlugu ile kesisme testi (eksene hizali kutu yaklasimi)
    if (tMax < -yariBant || tMin > yariBant) continue
    if (dMax < 0 || dMin > e.uzunluk) continue

    const d0 = Math.max(0, dMin)
    const d1 = Math.min(e.uzunluk, dMax)
    if (d1 - d0 < 0.4) continue

    // Zemin kotu: taban noktalarinin en dusugu (bina araziye gomulmesin)
    let zemin = Infinity
    for (const p of c.noktalar) zemin = Math.min(zemin, kotOku(izgara, p.x, p.y))
    if (!Number.isFinite(zemin)) continue

    const tepe = zemin + (c.yukseklik ?? 6.2)
    // Hat govdenin icinden geciyorsa bina KESITE girer; degilse gorunuse.
    const kesiliyor = tMin <= 0 && tMax >= 0
    const derinlik = kesiliyor ? 0 : Math.min(Math.abs(tMin), Math.abs(tMax))

    binalar.push({ d0, d1, zemin, tepe, derinlik, kesiliyor, katSayisi: c.katSayisi, ad: c.ad })
    if (tepe > enYuksek) enYuksek = tepe
  }

  // Uzaktan yakina siralanir ki cizimde yakin olan ustte kalsin.
  binalar.sort((x, y) => y.derinlik - x.derinlik)

  // --------------------------------------------------------------- agaclar
  const kesitAgaclar: KesitAgac[] = []
  for (const p of agaclar) {
    const { d, t } = yansit(e, p)
    if (Math.abs(t) > yariBant || d < 0 || d > e.uzunluk) continue
    const zemin = kotOku(izgara, p.x, p.y)
    // Ayni konumdan tureyen sabit bir cesitlilik: agaclar birbirinin kopyasi olmasin
    const tohum = Math.abs(Math.sin(p.x * 12.9898 + p.y * 78.233) * 43758.5453) % 1
    kesitAgaclar.push({
      d,
      zemin,
      derinlik: Math.abs(t),
      yukseklik: agacYuk * (0.75 + tohum * 0.6),
      capOran: 0.55 + tohum * 0.35,
    })
  }
  kesitAgaclar.sort((x, y) => y.derinlik - x.derinlik)

  const tavan = Math.max(enYuksek, enDusuk + 6)

  return {
    uzunluk: e.uzunluk,
    bant,
    profil,
    binalar,
    agaclar: kesitAgaclar,
    enDusuk: Number.isFinite(enDusuk) ? enDusuk : 0,
    enYuksek: Number.isFinite(enYuksek) ? enYuksek : 0,
    tavan,
  }
}

// --------------------------------------------------------------------- SVG

export interface KesitCizimSecenek {
  genislik?: number
  /** Dusey abartma */
  abartma?: number
  /** Kagit rengi; sunum icin beyaz da verilebilir */
  zemin?: string
}

/**
 * Kesiti SVG olarak cizer. Derinlige gore solma (atmosferik perspektif)
 * uygulanir: hatta yakin kutleler koyu konturlu ve opak, arkadakiler soluk.
 */
export function kesitSahnesiSvg(s: KesitSahnesi, secenek: KesitCizimSecenek = {}): string {
  const G = secenek.genislik ?? 1600
  const abartma = secenek.abartma ?? 1
  const kagit = secenek.zemin ?? '#f7f4ee'

  const alt = s.enDusuk - Math.max(2, (s.tavan - s.enDusuk) * 0.12)
  const ust = s.tavan + Math.max(3, (s.tavan - s.enDusuk) * 0.18)

  const solPay = 62
  const sagPay = 26
  const altPay = 54
  const ustPay = 26
  const cizimG = G - solPay - sagPay
  const cizimY = Math.round(((ust - alt) * abartma * cizimG) / Math.max(1, s.uzunluk))
  const Y = Math.max(220, cizimY) + altPay + ustPay

  const sx = (m: number) => solPay + (m / s.uzunluk) * cizimG
  const sy = (k: number) => Y - altPay - ((k - alt) / (ust - alt)) * (Y - altPay - ustPay)

  const p: string[] = []
  p.push(`<rect width="${G}" height="${Y}" fill="${kagit}"/>`)

  // --- kot izgarasi
  const adim = kotAdimi(ust - alt)
  for (let k = Math.ceil(alt / adim) * adim; k <= ust; k += adim) {
    p.push(
      `<path d="M${solPay} ${sy(k).toFixed(1)} H${G - sagPay}" stroke="#ded6c8" stroke-width="1"/>` +
        `<text x="${solPay - 8}" y="${(sy(k) + 4).toFixed(1)}" text-anchor="end" font-family="monospace" font-size="11" fill="#7d7568">${k.toFixed(0)}</text>`,
    )
  }

  // --- uzak nesneler once (arka plan dokusu)
  const enUzak = Math.max(1, s.bant / 2)
  const solukluk = (derinlik: number) => 1 - Math.min(0.72, (derinlik / enUzak) * 0.72)

  for (const b of s.binalar) {
    const o = solukluk(b.derinlik)
    const x0 = sx(b.d0)
    const x1 = sx(b.d1)
    const y0 = sy(b.zemin)
    const y1 = sy(b.tepe)
    const w = Math.max(1.2, x1 - x0)
    const h = Math.max(1.2, y0 - y1)
    if (b.kesiliyor) {
      // Kesite giren kutle: dolu ve kalin konturlu
      p.push(
        `<rect x="${x0.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#ffffff" stroke="#262320" stroke-width="1.6"/>`,
      )
    } else {
      p.push(
        `<rect x="${x0.toFixed(1)}" y="${y1.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" fill="#ffffff" fill-opacity="${(0.55 * o + 0.25).toFixed(2)}" stroke="#4c463e" stroke-width="${(0.5 + o * 0.7).toFixed(2)}" stroke-opacity="${o.toFixed(2)}"/>`,
      )
    }
  }

  for (const a of s.agaclar) {
    const o = solukluk(a.derinlik)
    const x = sx(a.d)
    const taban = sy(a.zemin)
    const tepe = sy(a.zemin + a.yukseklik)
    const r = Math.abs(taban - tepe) * a.capOran * 0.5
    p.push(
      `<path d="M${x.toFixed(1)} ${taban.toFixed(1)} V${(tepe + r * 0.9).toFixed(1)}" stroke="#3d735a" stroke-width="${(1 + o).toFixed(1)}" stroke-opacity="${(o * 0.8).toFixed(2)}"/>` +
        `<circle cx="${x.toFixed(1)}" cy="${(tepe + r * 0.85).toFixed(1)}" r="${Math.max(2, r).toFixed(1)}" fill="#519976" fill-opacity="${(0.28 + o * 0.42).toFixed(2)}"/>`,
    )
  }

  // --- zemin (en onde, dolu)
  const d = s.profil.map((n, i) => `${i === 0 ? 'M' : 'L'}${sx(n.mesafe).toFixed(2)} ${sy(n.kot).toFixed(2)}`).join(' ')
  p.push(
    `<path d="${d} L${sx(s.uzunluk).toFixed(2)} ${sy(alt).toFixed(2)} L${sx(0).toFixed(2)} ${sy(alt).toFixed(2)} Z" fill="#e9e2d6"/>`,
  )
  p.push(`<path d="${d}" fill="none" stroke="#262320" stroke-width="1.9" stroke-linejoin="round"/>`)

  // --- kunye
  p.push(
    `<text x="${solPay}" y="${Y - 18}" font-family="monospace" font-size="11.5" fill="#262320">` +
      `UZUNLUK ${s.uzunluk.toFixed(0)} m · BANT ${s.bant.toFixed(0)} m · KOT ${s.enDusuk.toFixed(1)}–${s.enYuksek.toFixed(1)} m` +
      `${abartma !== 1 ? ` · DUSEY ABARTMA ${abartma}x` : ''} · ${s.binalar.length} yapi, ${s.agaclar.length} agac</text>`,
  )
  p.push(
    `<text x="${solPay}" y="${ustPay + 2}" font-family="monospace" font-size="11.5" fill="#7d7568">A</text>` +
      `<text x="${G - sagPay}" y="${ustPay + 2}" text-anchor="end" font-family="monospace" font-size="11.5" fill="#7d7568">B</text>`,
  )

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${G}" height="${Y}" viewBox="0 0 ${G} ${Y}">\n${p.join('\n')}\n</svg>`
}

function kotAdimi(fark: number): number {
  const adaylar = [1, 2, 5, 10, 20, 25, 50, 100]
  const hedef = fark / 7 || 1
  for (const a of adaylar) if (a >= hedef) return a
  return 200
}
