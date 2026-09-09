/**
 * Cizim geometrisi: yakalama, duvar kabugu, aciklik parcalanmasi ve
 * kapali dongulerden oda cikarma.
 *
 * Oda bulma klasik "planar graph face traversal" ile yapiliyor: her duvar iki
 * yonlu yariayrita cevrilir, her dugumde cikan yariayritalar aciya gore
 * siralanir, bir yariayritanin ardili "ikizinin dugumundeki bir onceki
 * yariayrita" secilerek dongu takip edilir. Bu yontem ic yuzleri (odalari)
 * dogru, dis yuzu ise ters isaretli alanla verir; ters isaretli olan atilir.
 */

import type { Aciklik, Duvar, Nokta } from './tipler'

export const EPS = 1e-9

export function uzaklik(a: Nokta, b: Nokta): number {
  return Math.hypot(b.x - a.x, b.y - a.y)
}

export function topla(a: Nokta, b: Nokta): Nokta {
  return { x: a.x + b.x, y: a.y + b.y }
}

export function cikar(a: Nokta, b: Nokta): Nokta {
  return { x: a.x - b.x, y: a.y - b.y }
}

export function olcekle(a: Nokta, k: number): Nokta {
  return { x: a.x * k, y: a.y * k }
}

export function birim(a: Nokta): Nokta {
  const u = Math.hypot(a.x, a.y) || 1
  return { x: a.x / u, y: a.y / u }
}

export function dik(a: Nokta): Nokta {
  return { x: -a.y, y: a.x }
}

export function yuvarla(d: number, adim: number): number {
  return adim > 0 ? Math.round(d / adim) * adim : d
}

/** Noktanin dogru parcasina izdusumu; t [0,1] arasi kirpilir. */
export function parcayaIzdusum(
  p: Nokta,
  a: Nokta,
  b: Nokta,
): { nokta: Nokta; t: number; uzaklik: number } {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const kare = dx * dx + dy * dy
  const ham = kare < EPS ? 0 : ((p.x - a.x) * dx + (p.y - a.y) * dy) / kare
  const t = Math.min(1, Math.max(0, ham))
  const nokta = { x: a.x + dx * t, y: a.y + dy * t }
  return { nokta, t, uzaklik: uzaklik(p, nokta) }
}

export function poligonAlan(noktalar: readonly Nokta[]): number {
  let toplam = 0
  for (let i = 0; i < noktalar.length; i++) {
    const p = noktalar[i]
    const q = noktalar[(i + 1) % noktalar.length]
    toplam += p.x * q.y - q.x * p.y
  }
  return toplam / 2
}

export function poligonMerkez(noktalar: readonly Nokta[]): Nokta {
  const alan = poligonAlan(noktalar)
  if (Math.abs(alan) < 1e-7) {
    const n = noktalar.length || 1
    return {
      x: noktalar.reduce((t, p) => t + p.x, 0) / n,
      y: noktalar.reduce((t, p) => t + p.y, 0) / n,
    }
  }
  let cx = 0
  let cy = 0
  for (let i = 0; i < noktalar.length; i++) {
    const p = noktalar[i]
    const q = noktalar[(i + 1) % noktalar.length]
    const c = p.x * q.y - q.x * p.y
    cx += (p.x + q.x) * c
    cy += (p.y + q.y) * c
  }
  return { x: cx / (6 * alan), y: cy / (6 * alan) }
}

export function noktaPoligonda(p: Nokta, poligon: readonly Nokta[]): boolean {
  let icinde = false
  for (let i = 0, j = poligon.length - 1; i < poligon.length; j = i++) {
    const a = poligon[i]
    const b = poligon[j]
    const kesiyor = a.y > p.y !== b.y > p.y
    if (kesiyor && p.x < ((b.x - a.x) * (p.y - a.y)) / (b.y - a.y) + a.x) icinde = !icinde
  }
  return icinde
}

// ------------------------------------------------------------------ duvarlar

/** Duvarin kalinlikli kabugu (dort kose, saat yonunun tersinde). */
export function duvarKabugu(d: Duvar): [Nokta, Nokta, Nokta, Nokta] {
  const yon = birim(cikar(d.b, d.a))
  const n = olcekle(dik(yon), d.kalinlik / 2)
  return [
    { x: d.a.x + n.x, y: d.a.y + n.y },
    { x: d.b.x + n.x, y: d.b.y + n.y },
    { x: d.b.x - n.x, y: d.b.y - n.y },
    { x: d.a.x - n.x, y: d.a.y - n.y },
  ]
}

export function duvarUzunluk(d: Duvar): number {
  return uzaklik(d.a, d.b)
}

export function duvarNoktasi(d: Duvar, mesafe: number): Nokta {
  const u = birim(cikar(d.b, d.a))
  return { x: d.a.x + u.x * mesafe, y: d.a.y + u.y * mesafe }
}

export function duvarAcisi(d: Duvar): number {
  return Math.atan2(d.b.y - d.a.y, d.b.x - d.a.x)
}

/**
 * Duvari acikliklara gore dolu parcalara boler.
 * Donen her parca [baslangic, bitis] mesafesidir; 3B'de bu parcalar tam
 * yukseklikte cikarilir, aciklik ustune lento, pencere altina parapet konur.
 */
export function duvarParcalari(
  d: Duvar,
  aciklikar: readonly Aciklik[],
): { dolu: [number, number][]; delik: Aciklik[] } {
  const boy = duvarUzunluk(d)
  const kendi = aciklikar
    .filter((a) => a.duvarId === d.id)
    .map((a) => ({
      ...a,
      mesafe: Math.min(boy - a.genislik / 2, Math.max(a.genislik / 2, a.mesafe)),
    }))
    .sort((x, y) => x.mesafe - y.mesafe)

  const dolu: [number, number][] = []
  let imlec = 0
  for (const a of kendi) {
    const bas = a.mesafe - a.genislik / 2
    const bit = a.mesafe + a.genislik / 2
    if (bas > imlec + 1e-4) dolu.push([imlec, bas])
    imlec = Math.max(imlec, bit)
  }
  if (imlec < boy - 1e-4) dolu.push([imlec, boy])
  return { dolu, delik: kendi }
}

// ---------------------------------------------------------------- yakalama

export interface YakalamaSonucu {
  nokta: Nokta
  tur: 'serbest' | 'izgara' | 'uc' | 'duvar' | 'dik' | 'uzanti'
  /** Yakalanan duvar (aciklik yerlestirmede kullanilir) */
  duvar?: Duvar
  /** Duvar uzerindeki mesafe */
  mesafe?: number
}

export interface YakalamaSecenek {
  izgara: number
  /** Dunya biriminde yakalama yaricapi (ekran pikselinden turetilir) */
  yaricap: number
  duvarlar: readonly Duvar[]
  /** Zincir cizimde onceki nokta; aci kilidi icin */
  cikis?: Nokta | null
  aciAdim?: number
  /** Shift basiliyken serbest aci */
  serbestAci?: boolean
  /** Sadece duvar uzerine yakala (aciklik araclari) */
  yalnizDuvar?: boolean
}

export function yakala(ham: Nokta, s: YakalamaSecenek): YakalamaSonucu {
  const r = s.yaricap

  // 1) Duvar uc noktalari en guclu yakalama
  if (!s.yalnizDuvar) {
    let enIyi: { n: Nokta; u: number } | null = null
    for (const d of s.duvarlar) {
      for (const uc of [d.a, d.b]) {
        const u = uzaklik(ham, uc)
        if (u <= r && (!enIyi || u < enIyi.u)) enIyi = { n: uc, u }
      }
    }
    if (enIyi) return { nokta: { ...enIyi.n }, tur: 'uc' }
  }

  // 2) Duvar govdesi
  let govde: { n: Nokta; u: number; d: Duvar; t: number } | null = null
  for (const d of s.duvarlar) {
    const iz = parcayaIzdusum(ham, d.a, d.b)
    if (iz.uzaklik <= r && (!govde || iz.uzaklik < govde.u)) {
      govde = { n: iz.nokta, u: iz.uzaklik, d, t: iz.t }
    }
  }
  if (govde) {
    return {
      nokta: govde.n,
      tur: 'duvar',
      duvar: govde.d,
      mesafe: govde.t * duvarUzunluk(govde.d),
    }
  }
  if (s.yalnizDuvar) return { nokta: ham, tur: 'serbest' }

  // 3) Aci kilidi (zincir cizimde)
  if (s.cikis && !s.serbestAci) {
    const adim = ((s.aciAdim ?? 15) * Math.PI) / 180
    const dx = ham.x - s.cikis.x
    const dy = ham.y - s.cikis.y
    const boy = Math.hypot(dx, dy)
    if (boy > 1e-6) {
      const aci = Math.round(Math.atan2(dy, dx) / adim) * adim
      const uzun = yuvarla(boy, s.izgara)
      return {
        nokta: { x: s.cikis.x + Math.cos(aci) * uzun, y: s.cikis.y + Math.sin(aci) * uzun },
        tur: 'dik',
      }
    }
  }

  // 4) Izgara
  return {
    nokta: { x: yuvarla(ham.x, s.izgara), y: yuvarla(ham.y, s.izgara) },
    tur: 'izgara',
  }
}

// ------------------------------------------------------------------- odalar

export interface Oda {
  id: string
  poligon: Nokta[]
  alan: number
  cevre: number
  merkez: Nokta
  /** Donguyu olusturan duvar kimlikleri */
  duvarlar: string[]
}

interface Dugum {
  nokta: Nokta
  cikan: number[]
}

const BIRLESTIRME = 0.008 // 8 mm; ayni noktayi tarif eden uclar birlesir

/**
 * Duvar agindan kapali odalari cikarir.
 * Sadece cevrelenmis (ic) yuzler doner; alan buyuklugune gore siralidir.
 */
export function odalariBul(duvarlar: readonly Duvar[]): Oda[] {
  if (duvarlar.length < 3) return []

  const dugumler: Dugum[] = []
  const dugumBul = (p: Nokta): number => {
    for (let i = 0; i < dugumler.length; i++) {
      if (uzaklik(dugumler[i].nokta, p) <= BIRLESTIRME) return i
    }
    dugumler.push({ nokta: { ...p }, cikan: [] })
    return dugumler.length - 1
  }

  // Yariayrita listesi: 2i => duvar i ileri, 2i+1 => geri
  const bas: number[] = []
  const son: number[] = []
  const duvarId: string[] = []
  for (const d of duvarlar) {
    if (duvarUzunluk(d) < BIRLESTIRME) continue
    const i = dugumBul(d.a)
    const j = dugumBul(d.b)
    if (i === j) continue
    bas.push(i, j)
    son.push(j, i)
    duvarId.push(d.id, d.id)
  }
  if (!bas.length) return []

  for (let e = 0; e < bas.length; e++) dugumler[bas[e]].cikan.push(e)

  const aci = (e: number): number => {
    const p = dugumler[bas[e]].nokta
    const q = dugumler[son[e]].nokta
    return Math.atan2(q.y - p.y, q.x - p.x)
  }
  for (const d of dugumler) d.cikan.sort((a, b) => aci(a) - aci(b))

  const ikiz = (e: number): number => (e % 2 === 0 ? e + 1 : e - 1)

  /** e yariayritasinin ardili: ikizinin dugumunde saat yonunde bir onceki. */
  const ardil = (e: number): number => {
    const t = ikiz(e)
    const liste = dugumler[bas[t]].cikan
    const k = liste.indexOf(t)
    return liste[(k - 1 + liste.length) % liste.length]
  }

  const kullanildi = new Set<number>()
  const odalar: Oda[] = []

  for (let e0 = 0; e0 < bas.length; e0++) {
    if (kullanildi.has(e0)) continue
    const dongu: number[] = []
    let e = e0
    let guvenlik = 0
    while (!kullanildi.has(e) && guvenlik++ < bas.length * 3) {
      kullanildi.add(e)
      dongu.push(e)
      e = ardil(e)
      if (e === e0) break
    }
    if (dongu.length < 3) continue

    const poligon = dongu.map((k) => ({ ...dugumler[bas[k]].nokta }))
    const alan = poligonAlan(poligon)
    // Dis yuz ters isaretlidir; yalnizca ic yuzleri aliyoruz.
    if (alan <= 0.05) continue

    let cevre = 0
    for (let i = 0; i < poligon.length; i++) {
      cevre += uzaklik(poligon[i], poligon[(i + 1) % poligon.length])
    }

    odalar.push({
      id: `oda-${odalar.length + 1}`,
      poligon,
      alan,
      cevre,
      merkez: poligonMerkez(poligon),
      duvarlar: Array.from(new Set(dongu.map((k) => duvarId[k]))),
    })
  }

  return odalar.sort((a, b) => b.alan - a.alan)
}

/** Cizimin tumunu kapsayan sinir kutusu. */
export function sinirKutusu(noktalar: readonly Nokta[]): {
  min: Nokta
  max: Nokta
  bos: boolean
} {
  if (!noktalar.length) {
    return { min: { x: -5, y: -5 }, max: { x: 5, y: 5 }, bos: true }
  }
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (const p of noktalar) {
    if (p.x < x0) x0 = p.x
    if (p.y < y0) y0 = p.y
    if (p.x > x1) x1 = p.x
    if (p.y > y1) y1 = p.y
  }
  return { min: { x: x0, y: y0 }, max: { x: x1, y: y1 }, bos: false }
}
