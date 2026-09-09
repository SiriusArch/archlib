/**
 * Kontur (esyukselti) cizgileri — marching squares.
 *
 * Once her hucre icin kesisim parcalari uretilir, sonra uc noktalari
 * eslesen parcalar zincirlenerek polyline haline getirilir. DXF ve SVG
 * ciktisinda tek tek parcalar yerine surekli cizgi olmasi, CAD tarafinda
 * kullanilabilir bir altlik icin gerekli.
 */

import type { YukseklikIzgarasi } from './yukseklik'
import type { Nokta } from './projeksiyon'

export interface KonturCizgisi {
  readonly kot: number
  readonly noktalar: readonly Nokta[]
  /** Ana kontur (her 5 aralikta bir) daha kalin cizilir. */
  readonly ana: boolean
}

interface Parca {
  a: Nokta
  b: Nokta
}

const EPS = 1e-6

function aradeger(
  x0: number,
  y0: number,
  v0: number,
  x1: number,
  y1: number,
  v1: number,
  seviye: number,
): Nokta {
  const fark = v1 - v0
  const t = Math.abs(fark) < EPS ? 0.5 : (seviye - v0) / fark
  return { x: x0 + (x1 - x0) * t, y: y0 + (y1 - y0) * t }
}

function seviyeParcalari(izgara: YukseklikIzgarasi, seviye: number): Parca[] {
  const { satir, sutun, veri, yariGenislik, yariYukseklik } = izgara
  const parcalar: Parca[] = []

  const adimX = (2 * yariGenislik) / Math.max(1, sutun - 1)
  const adimY = (2 * yariYukseklik) / Math.max(1, satir - 1)
  const konumX = (j: number) => -yariGenislik + j * adimX
  const konumY = (i: number) => yariYukseklik - i * adimY

  for (let i = 0; i < satir - 1; i++) {
    for (let j = 0; j < sutun - 1; j++) {
      // Kose degerleri: sol-ust, sag-ust, sag-alt, sol-alt
      const v0 = veri[i * sutun + j]
      const v1 = veri[i * sutun + j + 1]
      const v2 = veri[(i + 1) * sutun + j + 1]
      const v3 = veri[(i + 1) * sutun + j]

      let durum = 0
      if (v0 > seviye) durum |= 8
      if (v1 > seviye) durum |= 4
      if (v2 > seviye) durum |= 2
      if (v3 > seviye) durum |= 1
      if (durum === 0 || durum === 15) continue

      const x0 = konumX(j)
      const x1 = konumX(j + 1)
      const y0 = konumY(i)
      const y1 = konumY(i + 1)

      const ust = () => aradeger(x0, y0, v0, x1, y0, v1, seviye)
      const sag = () => aradeger(x1, y0, v1, x1, y1, v2, seviye)
      const alt = () => aradeger(x0, y1, v3, x1, y1, v2, seviye)
      const sol = () => aradeger(x0, y0, v0, x0, y1, v3, seviye)

      switch (durum) {
        case 1:
        case 14:
          parcalar.push({ a: sol(), b: alt() })
          break
        case 2:
        case 13:
          parcalar.push({ a: alt(), b: sag() })
          break
        case 3:
        case 12:
          parcalar.push({ a: sol(), b: sag() })
          break
        case 4:
        case 11:
          parcalar.push({ a: ust(), b: sag() })
          break
        case 6:
        case 9:
          parcalar.push({ a: ust(), b: alt() })
          break
        case 7:
        case 8:
          parcalar.push({ a: sol(), b: ust() })
          break
        case 5:
          // Belirsiz durum — merkez degerine gore ayristir
          parcalar.push({ a: sol(), b: ust() }, { a: alt(), b: sag() })
          break
        case 10:
          parcalar.push({ a: ust(), b: sag() }, { a: sol(), b: alt() })
          break
      }
    }
  }
  return parcalar
}

function anahtar(n: Nokta): string {
  return `${Math.round(n.x * 100)}|${Math.round(n.y * 100)}`
}

/** Uc noktalari eslesen parcalari zincirleyerek polyline uretir. */
function zincirle(parcalar: Parca[]): Nokta[][] {
  const harita = new Map<string, Parca[]>()
  for (const p of parcalar) {
    for (const uc of [p.a, p.b]) {
      const k = anahtar(uc)
      const liste = harita.get(k)
      if (liste) liste.push(p)
      else harita.set(k, [p])
    }
  }

  const kullanildi = new Set<Parca>()
  const cizgiler: Nokta[][] = []

  for (const baslangic of parcalar) {
    if (kullanildi.has(baslangic)) continue
    kullanildi.add(baslangic)
    const zincir: Nokta[] = [baslangic.a, baslangic.b]

    // Iki yone de buyut
    for (const yon of [0, 1]) {
      let devam = true
      while (devam) {
        devam = false
        const uc = yon === 0 ? zincir[zincir.length - 1] : zincir[0]
        const adaylar = harita.get(anahtar(uc)) ?? []
        for (const aday of adaylar) {
          if (kullanildi.has(aday)) continue
          const yakinA = anahtar(aday.a) === anahtar(uc)
          const yeni = yakinA ? aday.b : aday.a
          kullanildi.add(aday)
          if (yon === 0) zincir.push(yeni)
          else zincir.unshift(yeni)
          devam = true
          break
        }
      }
    }

    if (zincir.length >= 2) cizgiler.push(zincir)
  }
  return cizgiler
}

export interface KonturSecenek {
  /** Kontur araligi (m). 0 verilirse otomatik secilir. */
  aralik?: number
  /** Kac aralikta bir ana kontur */
  anaHer?: number
  /** Cok kisa parcalari at (nokta sayisi) */
  enAzNokta?: number
}

/** Kot farkina gore makul bir kontur araligi secer. */
export function otomatikAralik(fark: number): number {
  const adaylar = [0.5, 1, 2, 2.5, 5, 10, 20, 25, 50, 100]
  const hedef = fark / 14 || 1
  for (const a of adaylar) if (a >= hedef) return a
  return 200
}

export function konturUret(
  izgara: YukseklikIzgarasi,
  secenek: KonturSecenek = {},
): KonturCizgisi[] {
  const fark = izgara.enYuksek - izgara.enDusuk
  const aralik = secenek.aralik && secenek.aralik > 0 ? secenek.aralik : otomatikAralik(fark)
  const anaHer = secenek.anaHer ?? 5
  const enAzNokta = secenek.enAzNokta ?? 3

  const ilk = Math.ceil(izgara.enDusuk / aralik) * aralik
  const cikti: KonturCizgisi[] = []

  for (let kot = ilk; kot <= izgara.enYuksek; kot += aralik) {
    const parcalar = seviyeParcalari(izgara, kot)
    if (!parcalar.length) continue
    const ana = Math.abs(Math.round(kot / aralik) % anaHer) === 0
    for (const noktalar of zincirle(parcalar)) {
      if (noktalar.length < enAzNokta) continue
      cikti.push({ kot: Math.round(kot * 100) / 100, noktalar, ana })
    }
    // Cok yogun veri uretmemek icin ust sinir
    if (cikti.length > 6000) break
  }
  return cikti
}
