/**
 * Donati sekilleri — tek kaynak.
 *
 * Her donati icin uc sey uretiyoruz:
 *   sembol2B  : plan sembolu (tuval, SVG ve DXF ayni tanimi kullanir)
 *   parca3B   : 3B kutle (sahne ve OBJ ayni tanimi kullanir)
 *   tesrifat  : Neufert'in istedigi bos birakma alani ve gerekcesi
 *
 * Boylece ekranda gordugun cizim ile indirdigin dosya birbirinin ayni olur.
 *
 * Eksen duzeni (her ikisinde de ayni):
 *   x  -> genislik ekseni, sag yon +
 *   y  -> 2B'de derinlik ekseni, ARKA yon +   (plan kagidinda asagi)
 *   3B'de: x genislik, y yukseklik (dosemeden itibaren), z derinlik, arka +
 */

import type { Nokta } from './tipler'
import { donatiYerelDenDunyaya } from './geometri'

export type Sekil2B =
  | { t: 'dik'; x: number; y: number; g: number; d: number; r?: number; dolgu?: number }
  | { t: 'cizgi'; x1: number; y1: number; x2: number; y2: number; ince?: boolean }
  | { t: 'daire'; x: number; y: number; r: number; dolgu?: number }
  | { t: 'yay'; x: number; y: number; r: number; bas: number; bit: number }
  | { t: 'poli'; n: [number, number][]; kapali?: boolean; dolgu?: number }

export interface Parca3B {
  tur: 'kutu' | 'silindir' | 'kure'
  /** merkez: [x, y (dosemeden yukseklik), z] */
  m: [number, number, number]
  /** boyut: [genislik, yukseklik, derinlik]; silindirde [cap, yukseklik, cap] */
  b: [number, number, number]
  /** z ekseni etrafinda derece (yalnizca kutu) */
  aci?: number
  /** Donatinin ana renginden farkli ise */
  renk?: string
}

export interface Tesrifat {
  on: number
  arka: number
  sol: number
  sag: number
  not: string
}

// ------------------------------------------------------------------ kisayol

const dik = (x: number, y: number, g: number, d: number, r = 0, dolgu?: number): Sekil2B => ({
  t: 'dik',
  x,
  y,
  g,
  d,
  r,
  dolgu,
})
const ciz = (x1: number, y1: number, x2: number, y2: number, ince = false): Sekil2B => ({
  t: 'cizgi',
  x1,
  y1,
  x2,
  y2,
  ince,
})
const dai = (x: number, y: number, r: number, dolgu?: number): Sekil2B => ({
  t: 'daire',
  x,
  y,
  r,
  dolgu,
})
const yay = (x: number, y: number, r: number, bas: number, bit: number): Sekil2B => ({
  t: 'yay',
  x,
  y,
  r,
  bas,
  bit,
})
const pol = (n: [number, number][], kapali = true, dolgu?: number): Sekil2B => ({
  t: 'poli',
  n,
  kapali,
  dolgu,
})

const kutu = (
  x: number,
  y: number,
  z: number,
  bx: number,
  by: number,
  bz: number,
  renk?: string,
): Parca3B => ({ tur: 'kutu', m: [x, y, z], b: [bx, by, bz], renk })

const sil = (x: number, y: number, z: number, cap: number, h: number, renk?: string): Parca3B => ({
  tur: 'silindir',
  m: [x, y, z],
  b: [cap, h, cap],
  renk,
})

const kur = (x: number, y: number, z: number, cap: number, renk?: string): Parca3B => ({
  tur: 'kure',
  m: [x, y, z],
  b: [cap, cap, cap],
  renk,
})

// ================================================================== 2B sembol

/**
 * Plan sembolu. Cizim yonu: on kenar y = -d/2, arka kenar y = +d/2.
 * Olculer donatinin gercek g/d degerine gore olceklenir; kullanici boyutu
 * degistirdiginde sembol de dogru orantida buyur.
 */
export function sembol2B(id: string, g: number, d: number): Sekil2B[] {
  const gy = g / 2
  const dy = d / 2

  switch (id) {
    // ------------------------------------------------------------- oturma
    case 'kanepe-3':
    case 'kanepe-2':
    case 'koltuk': {
      const kol = Math.min(0.18, g * 0.14)
      const sirt = Math.min(0.2, d * 0.26)
      const adet = id === 'kanepe-3' ? 3 : id === 'kanepe-2' ? 2 : 1
      const icG = g - kol * 2
      const s: Sekil2B[] = [
        dik(0, 0, g, d, 0.06, 0.1),
        // sirt
        dik(0, dy - sirt / 2, g, sirt, 0.04, 0.22),
        // kollar
        dik(-gy + kol / 2, -sirt / 2, kol, d - sirt, 0.04, 0.22),
        dik(gy - kol / 2, -sirt / 2, kol, d - sirt, 0.04, 0.22),
      ]
      for (let i = 1; i < adet; i++) {
        const x = -icG / 2 + (icG / adet) * i
        s.push(ciz(x, -dy + 0.05, x, dy - sirt, true))
      }
      return s
    }
    case 'sehpa':
      return [dik(0, 0, g, d, 0.05, 0.12), dik(0, 0, g - 0.12, d - 0.12, 0.03)]
    case 'tv-unite':
      return [
        dik(0, 0, g, d, 0.02, 0.12),
        ciz(-gy, 0, gy, 0),
        // uzerindeki televizyon
        dik(0, dy - 0.05, Math.min(g * 0.75, 1.3), 0.07, 0.01, 0.5),
      ]
    case 'televizyon':
      return [
        dik(0, 0, g, d, 0.01, 0.5),
        // ayak
        dik(0, dy + 0.06, g * 0.35, 0.12, 0.02, 0.2),
      ]
    case 'hali':
      return [dik(0, 0, g, d, 0.03, 0.06), dik(0, 0, g - 0.16, d - 0.16, 0.02)]

    // -------------------------------------------------------------- yemek
    case 'masa-4':
    case 'masa-6':
    case 'toplanti-8': {
      const adet = id === 'masa-4' ? 4 : id === 'masa-6' ? 6 : 8
      const yanBasi = adet / 2
      const s: Sekil2B[] = [dik(0, 0, g, d, 0.04, 0.12)]
      for (let i = 0; i < yanBasi; i++) {
        const x = -g / 2 + (g / yanBasi) * (i + 0.5)
        // Sandalyenin "arka"si (sirt dayama) +y'de tanimli, yani aci=0
        // sandalyeyi -y'ye baktirir. Masanin onundeki (-y) sira masaya
        // (+y) baksin diye 180, arkasindaki (+y) sira -y'ye baksin diye 0.
        s.push(...sandalyeSembolu(x, -dy - 0.28, 0.45, 0.5, 180))
        s.push(...sandalyeSembolu(x, dy + 0.28, 0.45, 0.5, 0))
      }
      return s
    }
    case 'masa-yuvarlak': {
      const s: Sekil2B[] = [dai(0, 0, gy, 0.12), dai(0, 0, gy - 0.06)]
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i
        // +180: sandalye disari degil merkeze (masaya) baksin.
        s.push(
          ...sandalyeSembolu(
            Math.sin(a) * (gy + 0.28),
            -Math.cos(a) * (gy + 0.28),
            0.45,
            0.5,
            (i * 90 + 180) % 360,
          ),
        )
      }
      return s
    }
    case 'sandalye':
      return sandalyeSembolu(0, 0, g, d, 0)

    // ------------------------------------------------------------- mutfak
    case 'tezgah-180':
    case 'tezgah-240': {
      const s: Sekil2B[] = [dik(0, 0, g, d, 0.01, 0.12), ciz(-gy, dy - 0.05, gy, dy - 0.05, true)]
      // eviye
      s.push(dik(-gy + 0.45, 0, 0.7, d - 0.12, 0.03))
      s.push(dai(-gy + 0.45, 0.02, 0.07))
      s.push(dai(-gy + 0.45, dy - 0.12, 0.025, 0.4))
      // ocak gozleri
      const ox = gy - 0.35
      for (const [dx, dz] of [
        [-0.13, -0.11],
        [0.13, -0.11],
        [-0.13, 0.11],
        [0.13, 0.11],
      ]) {
        s.push(dai(ox + dx, dz, 0.075))
      }
      s.push(dik(ox, 0, 0.58, Math.min(0.52, d - 0.08), 0.02))
      return s
    }
    case 'ada':
      return [
        dik(0, 0, g, d, 0.02, 0.12),
        dik(-gy + 0.5, 0, 0.7, Math.min(0.45, d - 0.15), 0.03),
        dai(-gy + 0.5, 0, 0.07),
      ]
    case 'buzdolabi':
      return [
        dik(0, 0, g, d, 0.02, 0.14),
        ciz(-gy, -dy + 0.06, gy, -dy + 0.06, true),
        dik(gy - 0.08, -dy + 0.03, 0.03, 0.16, 0.01, 0.5),
      ]
    case 'ocak': {
      const s: Sekil2B[] = [dik(0, 0, g, d, 0.02, 0.12)]
      for (const [dx, dz] of [
        [-0.14, -0.12],
        [0.14, -0.12],
        [-0.14, 0.12],
        [0.14, 0.12],
      ]) {
        s.push(dai(dx, dz, 0.08))
      }
      return s
    }

    // -------------------------------------------------------------- yatak
    case 'yatak-tek':
    case 'yatak-cift': {
      const cift = id === 'yatak-cift'
      const yastik = 0.4
      const s: Sekil2B[] = [
        dik(0, 0, g, d, 0.04, 0.1),
        // basucu
        dik(0, dy - 0.06, g, 0.12, 0.02, 0.22),
        // yorgan katlanmasi
        ciz(-gy, -dy + d * 0.32, gy, -dy + d * 0.32),
      ]
      if (cift) {
        s.push(dik(-g * 0.24, dy - 0.14 - yastik / 2, g * 0.42, yastik, 0.06, 0.18))
        s.push(dik(g * 0.24, dy - 0.14 - yastik / 2, g * 0.42, yastik, 0.06, 0.18))
      } else {
        s.push(dik(0, dy - 0.14 - yastik / 2, Math.min(g - 0.1, 0.6), yastik, 0.06, 0.18))
      }
      return s
    }
    case 'komodin':
      return [dik(0, 0, g, d, 0.02, 0.12), dik(0, 0, g - 0.1, d - 0.1, 0.01), dai(0, -dy + 0.08, 0.02, 0.5)]
    case 'gardirop':
      return [
        dik(0, 0, g, d, 0.01, 0.12),
        ciz(-gy, -dy + 0.05, gy, -dy + 0.05, true),
        // askilik
        ciz(-gy + 0.06, 0.02, gy - 0.06, 0.02, true),
        // kapak acilis izi
        yay(-gy, -dy, Math.min(g / 2, d + 0.35), -Math.PI / 2, 0),
        yay(gy, -dy, Math.min(g / 2, d + 0.35), Math.PI, -Math.PI / 2),
      ]
    case 'calisma-masa':
    case 'ofis-masa':
    case 'sira': {
      const s: Sekil2B[] = [dik(0, 0, g, d, 0.02, 0.12)]
      // Masanin +y (arka) tarafindaki sandalye, masaya donuk (-y) otursun.
      s.push(...sandalyeSembolu(0, dy + 0.3, 0.46, 0.5, 0))
      return s
    }

    // -------------------------------------------------------- islak hacim
    case 'klozet':
      return [
        // rezervuar
        dik(0, dy - 0.09, g, 0.18, 0.02, 0.16),
        // hazne
        pol(
          [
            [-g * 0.42, dy - 0.18],
            [g * 0.42, dy - 0.18],
            [g * 0.34, -dy + 0.12],
            [0, -dy],
            [-g * 0.34, -dy + 0.12],
          ],
          true,
          0.1,
        ),
        dai(0, -dy + d * 0.34, Math.min(g, d) * 0.2),
      ]
    case 'lavabo':
      return [
        dik(0, 0, g, d, 0.03, 0.1),
        dik(0, -0.02, g - 0.12, d - 0.14, 0.08),
        dai(0, 0.02, 0.028, 0.4),
        dik(0, dy - 0.05, 0.06, 0.07, 0.02, 0.4),
      ]
    case 'dus':
      return [
        dik(0, 0, g, d, 0.01, 0.08),
        dik(0, 0, g - 0.06, d - 0.06, 0.01),
        dai(0, 0, 0.05),
        ciz(-gy, -dy, gy, dy, true),
        ciz(-gy, dy, gy, -dy, true),
      ]
    case 'kuvet':
      return [
        dik(0, 0, g, d, 0.05, 0.1),
        dik(0, 0, g - 0.14, d - 0.12, 0.16),
        dai(-gy + 0.18, 0, 0.035, 0.4),
      ]
    case 'camasir':
      return [
        dik(0, 0, g, d, 0.02, 0.12),
        dai(0, -0.02, Math.min(g, d) * 0.28),
        dai(0, -0.02, Math.min(g, d) * 0.18, 0.15),
      ]

    // ------------------------------------------------------- sirkulasyon
    case 'merdiven-duz': {
      const basamak = 0.28
      const adet = Math.max(3, Math.floor(d / basamak))
      const s: Sekil2B[] = [dik(0, 0, g, d, 0, 0.06)]
      for (let i = 1; i < adet; i++) {
        const y = -dy + (d / adet) * i
        s.push(ciz(-gy, y, gy, y))
      }
      // cikis oku
      s.push(ciz(0, dy - 0.12, 0, -dy + 0.12))
      s.push(ciz(0, -dy + 0.12, -0.09, -dy + 0.3))
      s.push(ciz(0, -dy + 0.12, 0.09, -dy + 0.3))
      s.push(dai(0, dy - 0.12, 0.045, 0.6))
      return s
    }
    case 'merdiven-u': {
      const kol = g / 2
      const basamak = 0.28
      const adet = Math.max(3, Math.floor((d - 0.9) / basamak))
      const s: Sekil2B[] = [dik(0, 0, g, d, 0, 0.06), ciz(0, -dy, 0, dy - 1.0)]
      for (let i = 1; i < adet; i++) {
        const y = -dy + ((d - 1.0) / adet) * i
        s.push(ciz(-gy, y, -gy + kol, y))
        s.push(ciz(gy - kol, y, gy, y))
      }
      s.push(ciz(-kol / 2, dy - 0.2, -kol / 2, -dy + 0.15))
      s.push(ciz(-kol / 2, -dy + 0.15, -kol / 2 - 0.08, -dy + 0.32))
      s.push(ciz(-kol / 2, -dy + 0.15, -kol / 2 + 0.08, -dy + 0.32))
      return s
    }
    case 'asansor':
    case 'asansor-sedye':
      return [
        dik(0, 0, g, d, 0, 0.08),
        ciz(-gy, -dy, gy, dy),
        ciz(-gy, dy, gy, -dy),
        // kapi acikligi
        ciz(-g * 0.3, -dy, g * 0.3, -dy),
        ciz(-g * 0.3, -dy - 0.04, -0.02, -dy - 0.04),
        ciz(0.02, -dy - 0.04, g * 0.3, -dy - 0.04),
      ]

    // ---------------------------------------------------------- dis mekan
    case 'agac': {
      const s: Sekil2B[] = [dai(0, 0, gy, 0.1)]
      for (let i = 0; i < 8; i++) {
        const a = (Math.PI / 4) * i
        s.push(ciz(Math.cos(a) * gy * 0.55, Math.sin(a) * gy * 0.55, Math.cos(a) * gy, Math.sin(a) * gy, true))
      }
      s.push(dai(0, 0, Math.max(0.08, gy * 0.12), 0.5))
      return s
    }
    case 'arac':
      return [
        dik(0, 0, g, d, 0.16, 0.1),
        // on cam
        yay(0, -dy + d * 0.34, g * 0.42, Math.PI, 0),
        // arka cam
        yay(0, dy - d * 0.26, g * 0.4, 0, Math.PI),
        ciz(-gy, -dy + d * 0.34, gy, -dy + d * 0.34, true),
        ciz(-gy, dy - d * 0.26, gy, dy - d * 0.26, true),
      ]

    default:
      return [dik(0, 0, g, d, 0.02, 0.1)]
  }
}

function sandalyeSembolu(x: number, y: number, g: number, d: number, aci: number): Sekil2B[] {
  const r = (aci * Math.PI) / 180
  const cs = Math.cos(r)
  const sn = Math.sin(r)
  const don = (px: number, py: number): [number, number] => [
    x + px * cs - py * sn,
    y + px * sn + py * cs,
  ]
  const gy = g / 2
  const dy = d / 2
  return [
    pol(
      [don(-gy, -dy + 0.06), don(gy, -dy + 0.06), don(gy, dy - 0.08), don(-gy, dy - 0.08)],
      true,
      0.12,
    ),
    pol([don(-gy, dy - 0.08), don(gy, dy - 0.08), don(gy, dy), don(-gy, dy)], true, 0.28),
  ]
}

// ================================================================= 3B kutle

/** Donatinin 3B parcalari. y ekseni doseme kotundan olculur. */
export function parca3B(id: string, g: number, d: number, y: number): Parca3B[] {
  const gy = g / 2
  const dy = d / 2

  switch (id) {
    case 'kanepe-3':
    case 'kanepe-2':
    case 'koltuk': {
      const kol = Math.min(0.18, g * 0.14)
      const sirt = Math.min(0.2, d * 0.26)
      const oturma = y * 0.55
      const adet = id === 'kanepe-3' ? 3 : id === 'kanepe-2' ? 2 : 1
      const icG = g - kol * 2
      const p: Parca3B[] = [
        kutu(0, oturma / 2, 0, g, oturma, d),
        kutu(0, y / 2 + oturma / 2, dy - sirt / 2, g, y - oturma, sirt),
        kutu(-gy + kol / 2, oturma * 0.75, -sirt / 2, kol, oturma * 0.5, d - sirt),
        kutu(gy - kol / 2, oturma * 0.75, -sirt / 2, kol, oturma * 0.5, d - sirt),
      ]
      for (let i = 0; i < adet; i++) {
        const x = -icG / 2 + (icG / adet) * (i + 0.5)
        p.push(kutu(x, oturma + 0.04, -sirt / 2, (icG / adet) * 0.92, 0.09, (d - sirt) * 0.9))
      }
      return p
    }
    case 'sehpa':
      return [
        kutu(0, y - 0.03, 0, g, 0.06, d),
        kutu(-gy + 0.08, (y - 0.06) / 2, -dy + 0.08, 0.06, y - 0.06, 0.06),
        kutu(gy - 0.08, (y - 0.06) / 2, -dy + 0.08, 0.06, y - 0.06, 0.06),
        kutu(-gy + 0.08, (y - 0.06) / 2, dy - 0.08, 0.06, y - 0.06, 0.06),
        kutu(gy - 0.08, (y - 0.06) / 2, dy - 0.08, 0.06, y - 0.06, 0.06),
      ]
    case 'tv-unite': {
      const ekranG = Math.min(g * 0.75, 1.3)
      return [
        kutu(0, y / 2, 0, g, y, d),
        kutu(0, y - 0.015, 0, g - 0.04, 0.03, d - 0.03, '#6f6c66'),
        // televizyon: ince panel + ayak
        kutu(0, y + 0.05, dy - 0.06, ekranG * 0.3, 0.1, 0.16, '#3a3d3f'),
        kutu(0, y + 0.1 + (ekranG * 0.58) / 2, dy - 0.06, ekranG, ekranG * 0.58, 0.05, '#2b2e30'),
        kutu(0, y + 0.1 + (ekranG * 0.58) / 2, dy - 0.09, ekranG - 0.04, ekranG * 0.58 - 0.04, 0.01, '#4c697c'),
      ]
    }
    case 'televizyon':
      return [
        kutu(0, y * 0.08, 0.02, g * 0.35, y * 0.02, d + 0.16, '#3a3d3f'),
        kutu(0, y * 0.12, 0, 0.1, y * 0.16, 0.1, '#3a3d3f'),
        kutu(0, y * 0.28 + (y * 0.72) / 2, 0, g, y * 0.72, d, '#2b2e30'),
        kutu(0, y * 0.28 + (y * 0.72) / 2, -d * 0.35, g - 0.05, y * 0.72 - 0.05, d * 0.3, '#4c697c'),
      ]
    case 'hali':
      return [kutu(0, 0.008, 0, g, 0.016, d)]

    case 'masa-4':
    case 'masa-6':
    case 'toplanti-8': {
      const adet = id === 'masa-4' ? 4 : id === 'masa-6' ? 6 : 8
      const yanBasi = adet / 2
      const p: Parca3B[] = [kutu(0, y - 0.02, 0, g, 0.04, d)]
      for (const [sx, sz] of [
        [-gy + 0.1, -dy + 0.1],
        [gy - 0.1, -dy + 0.1],
        [-gy + 0.1, dy - 0.1],
        [gy - 0.1, dy - 0.1],
      ]) {
        p.push(kutu(sx, (y - 0.04) / 2, sz, 0.06, y - 0.04, 0.06))
      }
      for (let i = 0; i < yanBasi; i++) {
        const x = -g / 2 + (g / yanBasi) * (i + 0.5)
        // bkz. sembol2B'deki ayni not: sandalyeler masaya donuk otursun.
        p.push(...sandalyeParcasi(x, -dy - 0.28, 180))
        p.push(...sandalyeParcasi(x, dy + 0.28, 0))
      }
      return p
    }
    case 'masa-yuvarlak': {
      const p: Parca3B[] = [
        sil(0, y - 0.02, 0, g, 0.04),
        sil(0, (y - 0.04) / 2, 0, 0.14, y - 0.04),
        sil(0, 0.02, 0, g * 0.45, 0.04),
      ]
      for (let i = 0; i < 4; i++) {
        const a = (Math.PI / 2) * i
        p.push(
          ...sandalyeParcasi(
            Math.sin(a) * (gy + 0.28),
            -Math.cos(a) * (gy + 0.28),
            (i * 90 + 180) % 360,
          ),
        )
      }
      return p
    }
    case 'sandalye':
      return sandalyeParcasi(0, 0, 0)

    case 'tezgah-180':
    case 'tezgah-240': {
      const p: Parca3B[] = [
        kutu(0, (y - 0.04) / 2, 0.01, g, y - 0.04, d - 0.02),
        kutu(0, y - 0.02, 0, g, 0.04, d, '#6f7480'),
        // sifonluk
        kutu(0, y + 0.07, dy - 0.02, g, 0.14, 0.04, '#6f7480'),
      ]
      // eviye
      p.push(kutu(-gy + 0.45, y - 0.06, 0, 0.62, 0.1, d - 0.18, '#9aa3ad'))
      p.push(sil(-gy + 0.45, y + 0.12, dy - 0.1, 0.03, 0.24, '#8e97a3'))
      // ocak
      const ox = gy - 0.35
      p.push(kutu(ox, y + 0.005, 0, 0.58, 0.02, Math.min(0.52, d - 0.08), '#3b3f43'))
      for (const [dx, dz] of [
        [-0.13, -0.11],
        [0.13, -0.11],
        [-0.13, 0.11],
        [0.13, 0.11],
      ]) {
        p.push(sil(ox + dx, y + 0.02, dz, 0.15, 0.02, '#2f3235'))
      }
      return p
    }
    case 'ada':
      return [
        kutu(0, (y - 0.04) / 2, 0, g, y - 0.04, d),
        kutu(0, y - 0.02, 0, g + 0.04, 0.04, d + 0.04, '#6f7480'),
        kutu(-gy + 0.5, y - 0.06, 0, 0.62, 0.1, Math.min(0.42, d - 0.2), '#9aa3ad'),
      ]
    case 'buzdolabi':
      return [
        kutu(0, y / 2, 0, g, y, d),
        kutu(0, y * 0.32, -dy - 0.008, g - 0.02, 0.02, 0.02, '#7f858c'),
        kutu(gy - 0.07, y * 0.62, -dy - 0.015, 0.03, 0.3, 0.03, '#7f858c'),
        kutu(gy - 0.07, y * 0.18, -dy - 0.015, 0.03, 0.22, 0.03, '#7f858c'),
      ]
    case 'ocak': {
      const p: Parca3B[] = [
        kutu(0, (y - 0.04) / 2, 0, g, y - 0.04, d),
        kutu(0, y - 0.02, 0, g, 0.04, d, '#3b3f43'),
      ]
      for (const [dx, dz] of [
        [-0.14, -0.12],
        [0.14, -0.12],
        [-0.14, 0.12],
        [0.14, 0.12],
      ]) {
        p.push(sil(dx, y + 0.01, dz, 0.16, 0.02, '#2f3235'))
      }
      return p
    }

    case 'yatak-tek':
    case 'yatak-cift': {
      const cift = id === 'yatak-cift'
      const somya = y * 0.55
      const p: Parca3B[] = [
        kutu(0, somya / 2, 0, g - 0.04, somya, d - 0.04, '#8a8377'),
        kutu(0, somya + (y - somya) / 2, 0, g, y - somya, d),
        // basucu
        kutu(0, y * 0.9, dy + 0.03, g, y * 1.2, 0.06, '#8a8377'),
        // yorgan
        kutu(0, y + 0.03, -d * 0.16, g - 0.04, 0.06, d * 0.66),
      ]
      const yastikG = cift ? g * 0.42 : Math.min(g - 0.1, 0.6)
      if (cift) {
        p.push(kutu(-g * 0.24, y + 0.06, dy - 0.34, yastikG, 0.12, 0.4, '#f0ece2'))
        p.push(kutu(g * 0.24, y + 0.06, dy - 0.34, yastikG, 0.12, 0.4, '#f0ece2'))
      } else {
        p.push(kutu(0, y + 0.06, dy - 0.34, yastikG, 0.12, 0.4, '#f0ece2'))
      }
      return p
    }
    case 'komodin':
      return [
        kutu(0, y / 2, 0, g, y, d),
        kutu(0, y * 0.7, -dy - 0.005, g - 0.06, y * 0.24, 0.01, '#8a8377'),
        kutu(0, y * 0.34, -dy - 0.005, g - 0.06, y * 0.24, 0.01, '#8a8377'),
      ]
    case 'gardirop':
      return [
        kutu(0, y / 2, 0.01, g, y, d - 0.02),
        kutu(-g * 0.25, y / 2, -dy, g * 0.48, y - 0.04, 0.02, '#8a8377'),
        kutu(g * 0.25, y / 2, -dy, g * 0.48, y - 0.04, 0.02, '#8a8377'),
        sil(0, y * 0.72, 0, 0.03, g - 0.1, '#7f858c'),
      ]
    case 'calisma-masa':
    case 'ofis-masa':
    case 'sira': {
      const p: Parca3B[] = [kutu(0, y - 0.02, 0, g, 0.04, d)]
      for (const [sx, sz] of [
        [-gy + 0.08, -dy + 0.08],
        [gy - 0.08, -dy + 0.08],
        [-gy + 0.08, dy - 0.08],
        [gy - 0.08, dy - 0.08],
      ]) {
        p.push(kutu(sx, (y - 0.04) / 2, sz, 0.05, y - 0.04, 0.05))
      }
      p.push(...sandalyeParcasi(0, dy + 0.3, 0))
      return p
    }

    case 'klozet':
      return [
        kutu(0, 0.38, dy - 0.09, g, 0.72, 0.18, '#f2f0eb'),
        kutu(0, 0.2, 0.02, g * 0.62, 0.12, d * 0.8, '#f2f0eb'),
        sil(0, 0.1, d * 0.05, g * 0.5, 0.2, '#f2f0eb'),
        kutu(0, 0.42, dy - 0.2, g * 0.86, 0.04, 0.06, '#e6e2d8'),
      ]
    case 'lavabo':
      return [
        kutu(0, y - 0.05, 0.01, g, 0.1, d - 0.02, '#f2f0eb'),
        kutu(0, y - 0.14, 0.02, g - 0.16, 0.1, d - 0.16, '#e8e5dd'),
        sil(0, y + 0.09, dy - 0.06, 0.035, 0.18, '#8e97a3'),
        kutu(0, (y - 0.1) / 2, dy - 0.08, 0.12, y - 0.1, 0.1, '#f2f0eb'),
      ]
    case 'dus':
      return [
        kutu(0, 0.04, 0, g, 0.08, d, '#e8e5dd'),
        sil(0, 0.085, 0, 0.09, 0.01, '#8e97a3'),
        // cam bolme
        kutu(0, 1.0, -dy, g, 1.9, 0.02, '#bcd3de'),
        kutu(-gy, 1.0, 0, 0.02, 1.9, d, '#bcd3de'),
        sil(gy - 0.12, 2.05, dy - 0.12, 0.16, 0.04, '#8e97a3'),
      ]
    case 'kuvet':
      return [
        kutu(0, y / 2, 0, g, y, d, '#f2f0eb'),
        kutu(0, y - 0.04, 0, g - 0.16, 0.12, d - 0.14, '#dfe6ea'),
        sil(-gy + 0.14, y + 0.1, 0, 0.03, 0.2, '#8e97a3'),
      ]
    case 'camasir':
      return [
        kutu(0, y / 2, 0, g, y, d),
        sil(0, y * 0.48, -dy - 0.01, Math.min(g, d) * 0.56, 0.02, '#cfd6db'),
        kutu(0, y - 0.06, -dy - 0.005, g - 0.06, 0.1, 0.01, '#cfd6db'),
      ]

    case 'merdiven-duz': {
      const adet = Math.max(3, Math.floor(d / 0.28))
      const rihtim = 0.175
      const basamak = d / adet
      const p: Parca3B[] = []
      for (let i = 0; i < adet; i++) {
        p.push(
          kutu(
            0,
            rihtim * (i + 0.5),
            dy - basamak * (i + 0.5),
            g,
            rihtim,
            basamak,
          ),
        )
      }
      return p
    }
    case 'merdiven-u': {
      const kol = g / 2
      const adet = Math.max(3, Math.floor((d - 1.0) / 0.28))
      const rihtim = 0.175
      const basamak = (d - 1.0) / adet
      const p: Parca3B[] = []
      for (let i = 0; i < adet; i++) {
        p.push(kutu(-kol / 2, rihtim * (i + 0.5), dy - 1.0 - basamak * (i + 0.5), kol, rihtim, basamak))
      }
      p.push(kutu(0, rihtim * adet + 0.09, dy - 0.5, g, 0.18, 1.0))
      for (let i = 0; i < adet; i++) {
        p.push(
          kutu(
            kol / 2,
            rihtim * (adet + i + 1) + 0.09,
            dy - 1.0 - basamak * (adet - i - 0.5),
            kol,
            rihtim,
            basamak,
          ),
        )
      }
      return p
    }
    case 'asansor':
    case 'asansor-sedye':
      return [
        kutu(0, 1.15, dy - 0.04, g, 2.3, 0.08),
        kutu(-gy + 0.04, 1.15, 0, 0.08, 2.3, d),
        kutu(gy - 0.04, 1.15, 0, 0.08, 2.3, d),
        kutu(0, 0.02, 0, g, 0.04, d, '#8a8377'),
        kutu(-g * 0.32, 1.05, -dy, g * 0.36, 2.1, 0.06, '#9aa3ad'),
        kutu(g * 0.32, 1.05, -dy, g * 0.36, 2.1, 0.06, '#9aa3ad'),
      ]

    case 'agac': {
      const govde = Math.max(0.16, g * 0.06)
      const tacY = y * 0.45
      return [
        sil(0, tacY / 2, 0, govde, tacY, '#8a6b4f'),
        kur(0, tacY + (y - tacY) * 0.42, 0, g * 0.9),
        kur(g * 0.2, tacY + (y - tacY) * 0.72, -d * 0.12, g * 0.55),
        kur(-g * 0.22, tacY + (y - tacY) * 0.62, d * 0.14, g * 0.5),
      ]
    }
    case 'arac': {
      const tekerCap = Math.min(0.62, y * 0.42)
      return [
        kutu(0, y * 0.36, 0, g, y * 0.42, d, '#7a8089'),
        kutu(0, y * 0.72, d * 0.04, g * 0.88, y * 0.34, d * 0.46, '#aebdc6'),
        kutu(0, y * 0.2, 0, g + 0.03, 0.1, d * 0.98, '#5d636b'),
        sil(-gy, tekerCap / 2, -d * 0.3, tekerCap, 0.2, '#33363a'),
        sil(gy, tekerCap / 2, -d * 0.3, tekerCap, 0.2, '#33363a'),
        sil(-gy, tekerCap / 2, d * 0.3, tekerCap, 0.2, '#33363a'),
        sil(gy, tekerCap / 2, d * 0.3, tekerCap, 0.2, '#33363a'),
      ]
    }

    default:
      return [kutu(0, y / 2, 0, g, y, d)]
  }
}

function sandalyeParcasi(x: number, z: number, aci: number): Parca3B[] {
  const r = (aci * Math.PI) / 180
  const cs = Math.cos(r)
  const sn = Math.sin(r)
  const don = (px: number, pz: number): [number, number] => [
    x + px * cs - pz * sn,
    z + px * sn + pz * cs,
  ]
  const p: Parca3B[] = []
  const [ox, oz] = don(0, 0)
  p.push(kutu(ox, 0.45, oz, 0.44, 0.05, 0.44, '#9a8769'))
  const [bx, bz] = don(0, 0.2)
  p.push({ tur: 'kutu', m: [bx, 0.68, bz], b: [0.42, 0.42, 0.05], aci, renk: '#9a8769' })
  for (const [dx, dz] of [
    [-0.18, -0.18],
    [0.18, -0.18],
    [-0.18, 0.18],
    [0.18, 0.18],
  ]) {
    const [lx, lz] = don(dx, dz)
    p.push(kutu(lx, 0.225, lz, 0.04, 0.45, 0.04, '#9a8769'))
  }
  return p
}

// ================================================================ tesrifat

/**
 * Neufert'in istedigi bos birakma alanlari (m). Cizimde donatinin cevresinde
 * kesikli olarak gosterilir; ogrenci olcuyu ekrandan okuyarak yerlestirir.
 */
const TESRIFAT: Record<string, Tesrifat> = {
  'kanepe-3': { on: 0.4, arka: 0, sol: 0, sag: 0, not: 'Sehpaya 40 cm; TV mesafesi ekran köşegeni x2.5' },
  'kanepe-2': { on: 0.4, arka: 0, sol: 0, sag: 0, not: 'Sehpaya 40 cm boş bırak' },
  koltuk: { on: 0.4, arka: 0, sol: 0, sag: 0, not: 'Önünde 40 cm hareket alanı' },
  'masa-4': { on: 0.35, arka: 0.35, sol: 0.35, sag: 0.35, not: 'Sandalye çekildikten sonra 35 cm geçiş; kişi başı 60x40 cm masa' },
  'masa-6': { on: 0.35, arka: 0.35, sol: 0.35, sag: 0.35, not: 'Sandalye çekme payı dahil 80 cm; çevrede 35 cm geçiş' },
  'masa-yuvarlak': { on: 0.35, arka: 0.35, sol: 0.35, sag: 0.35, not: 'Yuvarlak masada kişi başı 60 cm çevre' },
  'toplanti-8': { on: 0.5, arka: 0.5, sol: 0.5, sag: 0.5, not: 'Toplantı masası çevresinde 50 cm dolaşım' },
  'tezgah-180': { on: 1.2, arka: 0, sol: 0, sag: 0, not: 'DIN 18022: çalışma koridoru en az 120 cm' },
  'tezgah-240': { on: 1.2, arka: 0, sol: 0, sag: 0, not: 'DIN 18022: çalışma koridoru en az 120 cm' },
  ada: { on: 1.2, arka: 1.2, sol: 0.9, sag: 0.9, not: 'Ada ile tezgâh arası en az 120 cm' },
  buzdolabi: { on: 1.0, arka: 0, sol: 0, sag: 0, not: 'Kapak açılımı + geçiş için 100 cm' },
  ocak: { on: 1.2, arka: 0, sol: 0.4, sag: 0.4, not: 'Yanına en az 40 cm tezgâh; önünde 120 cm' },
  'yatak-tek': { on: 0.7, arka: 0, sol: 0.7, sag: 0, not: 'Neufert: yatak yanında 70 cm geçiş' },
  'yatak-cift': { on: 0.7, arka: 0, sol: 0.7, sag: 0.7, not: 'Neufert: iki yandan 70 cm geçiş, ayakucunda 70 cm' },
  gardirop: { on: 0.7, arka: 0, sol: 0, sag: 0, not: 'Kapak açılımı + giyinme için 70 cm' },
  'calisma-masa': { on: 0, arka: 0.8, sol: 0, sag: 0, not: 'Sandalye çekme payı 80 cm' },
  'ofis-masa': { on: 0, arka: 0.8, sol: 0.6, sag: 0.6, not: 'Kişi başı en az 8 m² çalışma alanı' },
  sira: { on: 0, arka: 0.8, sol: 0.5, sag: 0.5, not: 'Derslikte sıralar arası 80 cm' },
  klozet: { on: 0.6, arka: 0, sol: 0.2, sag: 0.2, not: 'Önünde 60x60 cm, yanlarda 20 cm serbest' },
  lavabo: { on: 0.7, arka: 0, sol: 0.1, sag: 0.1, not: 'Ayna önü 70 cm hareket alanı' },
  dus: { on: 0.6, arka: 0, sol: 0, sag: 0, not: 'Kabin önünde 60 cm kurulanma alanı' },
  kuvet: { on: 0.7, arka: 0, sol: 0, sag: 0, not: 'Küvet yanında 70 cm' },
  camasir: { on: 0.7, arka: 0, sol: 0, sag: 0, not: 'Kapak açılımı için 70 cm' },
  'merdiven-duz': { on: 1.0, arka: 1.0, sol: 0, sag: 0, not: 'Sahanlık en az kol genişliği; 2h+t=63' },
  'merdiven-u': { on: 1.0, arka: 0, sol: 0, sag: 0, not: 'Sahanlık en az kol genişliği kadar' },
  asansor: { on: 1.5, arka: 0, sol: 0, sag: 0, not: 'Kabin önünde en az 150 cm bekleme alanı' },
  'asansor-sedye': { on: 1.8, arka: 0, sol: 0, sag: 0, not: 'Sedye manevrası için 180 cm' },
  arac: { on: 0.6, arka: 0.6, sol: 0.25, sag: 0.25, not: 'Otopark cebi 2.5x5.0 m; manevra yolu 6 m' },
  televizyon: { on: 2.5, arka: 0, sol: 0, sag: 0, not: 'İzleme mesafesi ekran köşegeni x 2.5' },
}

export function tesrifat(id: string): Tesrifat | null {
  return TESRIFAT[id] ?? null
}

// ============================================================ disa aktarim

/**
 * sembol2B'yi dunya (plan) duzlemine tasinmis, DXF/SVG'nin dogrudan
 * yazabilecegi ilkellere indirger. Yay'lar kisa dogru parcalarina
 * ornekleniyor: donusum bir aynalama icerdigi icin (bkz. geometri.ts,
 * donatiYerelDenDunyaya) bir ARC varligininin baslangic/bitis acisini
 * dogru yonde tutmak riskli olurdu; ornekleme her zaman doğru sonucu verir.
 */
export interface DunyaCizimi {
  poligonlar: { nokta: Nokta[]; kapali: boolean }[]
  daireler: { merkez: Nokta; r: number }[]
}

const YAY_ORNEK_SAYISI = 20

export function donatiDunyaCizimi(
  katalog: string,
  g: number,
  d: number,
  konum: Nokta,
  aciDerece: number,
): DunyaCizimi {
  const cikti: DunyaCizimi = { poligonlar: [], daireler: [] }
  const don = (lx: number, ly: number): Nokta => donatiYerelDenDunyaya(konum, aciDerece, lx, ly)

  for (const s of sembol2B(katalog, g, d)) {
    if (s.t === 'dik') {
      const gx = s.g / 2
      const dy = s.d / 2
      cikti.poligonlar.push({
        nokta: [
          don(s.x - gx, s.y - dy),
          don(s.x + gx, s.y - dy),
          don(s.x + gx, s.y + dy),
          don(s.x - gx, s.y + dy),
        ],
        kapali: true,
      })
    } else if (s.t === 'cizgi') {
      cikti.poligonlar.push({ nokta: [don(s.x1, s.y1), don(s.x2, s.y2)], kapali: false })
    } else if (s.t === 'daire') {
      cikti.daireler.push({ merkez: don(s.x, s.y), r: s.r })
    } else if (s.t === 'yay') {
      const nokta: Nokta[] = []
      for (let i = 0; i <= YAY_ORNEK_SAYISI; i++) {
        const aci = s.bas + ((s.bit - s.bas) * i) / YAY_ORNEK_SAYISI
        nokta.push(don(s.x + Math.cos(aci) * s.r, s.y + Math.sin(aci) * s.r))
      }
      cikti.poligonlar.push({ nokta, kapali: false })
    } else if (s.t === 'poli') {
      cikti.poligonlar.push({
        nokta: s.n.map(([x, y]) => don(x, y)),
        kapali: s.kapali ?? true,
      })
    }
  }
  return cikti
}
