/**
 * Klasik kemer geometrisi — prosedurel.
 *
 * Uc parcadan olusur:
 *  1. Kademeli kaide + yivli sutun govdesi + baslik  (donel yuzey / lathe)
 *  2. Kilit tasli voussoir kemeri                     (acisal kama bloklari)
 *  3. Kemerin uzerinden gecen ince dis silme          (surekli serit)
 *
 * Cikti, stone.wgsl'in bekledigi duzende arali (interleaved) vertex verisidir:
 *   @location(0) position: vec3f
 *   @location(1) normal:   vec3f
 */

export interface MeshData {
  /** [px,py,pz, nx,ny,nz] sirasiyla arali */
  readonly vertices: Float32Array<ArrayBuffer>
  readonly indices: Uint32Array<ArrayBuffer>
  readonly vertexCount: number
  readonly indexCount: number
}

type Vec3 = [number, number, number]

// ---------------------------------------------------------------- olculer

const SUTUN_X = 0.6 // sutun ekseninin merkeze uzakligi
const TABAN_Y = -1.2 // kaidenin en alti
const OMUZ_Y = 0.38 // kemerin bindigi kot (impost)
const KEMER_R = SUTUN_X // kemer orta ekseni yaricapi
const KEMER_KALINLIK = 0.26 // radyal kalinlik
const KEMER_DERINLIK = 0.28 // z ekseninde kalinlik
const VOUSSOIR_SAYISI = 15 // tek sayi: ortadaki kilit tasi olur
const YIV_SAYISI = 16
const CEVRE_BOLME = 72

/** Sutun profili: [y, yaricap, yivMiktari(0..1)] */
const PROFIL: readonly (readonly [number, number, number])[] = [
  [TABAN_Y, 0.0, 0],
  [TABAN_Y, 0.315, 0],
  [-1.145, 0.315, 0],
  [-1.145, 0.275, 0],
  [-1.075, 0.275, 0],
  [-1.075, 0.295, 0],
  [-1.015, 0.295, 0],
  [-1.015, 0.245, 0],
  [-0.935, 0.245, 0],
  [-0.935, 0.265, 0],
  [-0.875, 0.265, 0],
  [-0.875, 0.215, 0],
  [-0.795, 0.215, 0],
  [-0.795, 0.183, 0],
  [-0.735, 0.168, 0],
  [-0.68, 0.152, 0],
  [-0.64, 0.146, 0],
  [-0.6, 0.142, 0.35],
  [-0.55, 0.14, 1],
  [0.16, 0.132, 1], // yivli govde
  [0.22, 0.132, 0.35],
  [0.26, 0.142, 0],
  [0.26, 0.163, 0],
  [0.315, 0.163, 0],
  [0.315, 0.146, 0],
  [OMUZ_Y, 0.146, 0],
  [OMUZ_Y, 0.0, 0],
]

// ------------------------------------------------------------ yardimcilar

class MeshBuilder {
  private readonly poz: number[] = []
  private readonly nrm: number[] = []
  private readonly idx: number[] = []

  vertex(p: Vec3, n: Vec3): number {
    const i = this.poz.length / 3
    this.poz.push(p[0], p[1], p[2])
    this.nrm.push(n[0], n[1], n[2])
    return i
  }

  tri(a: number, b: number, c: number): void {
    this.idx.push(a, b, c)
  }

  /** Duz golgeli dortgen: normal koseerden hesaplanir. */
  quadFlat(a: Vec3, b: Vec3, c: Vec3, d: Vec3): void {
    const n = normal(a, b, c)
    const i0 = this.vertex(a, n)
    const i1 = this.vertex(b, n)
    const i2 = this.vertex(c, n)
    const i3 = this.vertex(d, n)
    this.tri(i0, i1, i2)
    this.tri(i0, i2, i3)
  }

  triFlat(a: Vec3, b: Vec3, c: Vec3): void {
    const n = normal(a, b, c)
    this.tri(this.vertex(a, n), this.vertex(b, n), this.vertex(c, n))
  }

  build(): MeshData {
    return {
      vertices: arali(this.poz, this.nrm),
      indices: Uint32Array.from(this.idx) as Uint32Array<ArrayBuffer>,
      vertexCount: this.poz.length / 3,
      indexCount: this.idx.length,
    }
  }
}

function arali(poz: readonly number[], nrm: readonly number[]): Float32Array<ArrayBuffer> {
  const n = poz.length / 3
  const out = new Float32Array(new ArrayBuffer(n * 6 * 4))
  for (let i = 0; i < n; i++) {
    out[i * 6 + 0] = poz[i * 3 + 0]
    out[i * 6 + 1] = poz[i * 3 + 1]
    out[i * 6 + 2] = poz[i * 3 + 2]
    out[i * 6 + 3] = nrm[i * 3 + 0]
    out[i * 6 + 4] = nrm[i * 3 + 1]
    out[i * 6 + 5] = nrm[i * 3 + 2]
  }
  return out
}

function normal(a: Vec3, b: Vec3, c: Vec3): Vec3 {
  const u: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]]
  const v: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]]
  return birim([
    u[1] * v[2] - u[2] * v[1],
    u[2] * v[0] - u[0] * v[2],
    u[0] * v[1] - u[1] * v[0],
  ])
}

function birim(v: Vec3): Vec3 {
  const l = Math.hypot(v[0], v[1], v[2]) || 1
  return [v[0] / l, v[1] / l, v[2] / l]
}

/** Yiv modulasyonu: n adet icbukey oluk. */
function yivliYaricap(r: number, aci: number, miktar: number): number {
  if (miktar <= 0) return r
  const oluk = 0.5 - 0.5 * Math.cos(YIV_SAYISI * aci)
  return r * (1 - 0.075 * miktar * oluk)
}

// ------------------------------------------------------------------ sutun

function sutunEkle(b: MeshBuilder, merkezX: number): void {
  const nokta = (y: number, r: number, yiv: number, j: number): Vec3 => {
    const aci = (j / CEVRE_BOLME) * Math.PI * 2
    const rr = yivliYaricap(r, aci, yiv)
    return [merkezX + Math.cos(aci) * rr, y, Math.sin(aci) * rr]
  }

  for (let i = 0; i < PROFIL.length - 1; i++) {
    const [y0, r0, f0] = PROFIL[i]
    const [y1, r1, f1] = PROFIL[i + 1]
    if (r0 === 0 && r1 === 0) continue

    for (let j = 0; j < CEVRE_BOLME; j++) {
      const a = nokta(y0, r0, f0, j)
      const bb = nokta(y0, r0, f0, j + 1)
      const c = nokta(y1, r1, f1, j + 1)
      const d = nokta(y1, r1, f1, j)

      if (r0 === 0) {
        // alt/ust kapak ucgeni
        b.triFlat([merkezX, y0, 0], c, d)
      } else if (r1 === 0) {
        b.triFlat(a, bb, [merkezX, y1, 0])
      } else {
        b.quadFlat(a, bb, c, d)
      }
    }
  }
}

// ------------------------------------------------------------------ kemer

function kemerEkle(b: MeshBuilder): void {
  const z0 = -KEMER_DERINLIK / 2
  const z1 = KEMER_DERINLIK / 2
  const bosluk = 0.006 // bloklar arasi derz
  const adim = Math.PI / VOUSSOIR_SAYISI
  const kilit = (VOUSSOIR_SAYISI - 1) / 2

  for (let k = 0; k < VOUSSOIR_SAYISI; k++) {
    const kilitMi = k === kilit
    const a0 = k * adim + bosluk
    const a1 = (k + 1) * adim - bosluk
    // kilit tasi hem ice hem disa tasar
    const ri = KEMER_R - KEMER_KALINLIK / 2 - (kilitMi ? 0.012 : 0)
    const ro = KEMER_R + KEMER_KALINLIK / 2 + (kilitMi ? 0.035 : 0)
    const zi = kilitMi ? z0 - 0.012 : z0
    const za = kilitMi ? z1 + 0.012 : z1

    const P = (aci: number, r: number, z: number): Vec3 => [
      Math.cos(aci) * r,
      OMUZ_Y + Math.sin(aci) * r,
      z,
    ]

    const i0 = P(a0, ri, zi)
    const i1 = P(a1, ri, zi)
    const i2 = P(a1, ri, za)
    const i3 = P(a0, ri, za)
    const o0 = P(a0, ro, zi)
    const o1 = P(a1, ro, zi)
    const o2 = P(a1, ro, za)
    const o3 = P(a0, ro, za)

    b.quadFlat(i0, i3, i2, i1) // ic yuzey (kemer karni)
    b.quadFlat(o0, o1, o2, o3) // dis yuzey
    b.quadFlat(i3, o3, o2, i2) // on
    b.quadFlat(i0, i1, o1, o0) // arka
    b.quadFlat(i1, i2, o2, o1) // ust derz yuzu
    b.quadFlat(i0, o0, o3, i3) // alt derz yuzu
  }
}

/** Kemerin uzerinden gecen ince surekli silme. */
function silmeEkle(b: MeshBuilder): void {
  const ri = KEMER_R + KEMER_KALINLIK / 2
  const ro = ri + 0.045
  const z0 = -KEMER_DERINLIK / 2 - 0.02
  const z1 = KEMER_DERINLIK / 2 + 0.02
  const bolme = 96

  for (let k = 0; k < bolme; k++) {
    const a0 = (k / bolme) * Math.PI
    const a1 = ((k + 1) / bolme) * Math.PI
    const P = (aci: number, r: number, z: number): Vec3 => [
      Math.cos(aci) * r,
      OMUZ_Y + Math.sin(aci) * r,
      z,
    ]
    b.quadFlat(P(a0, ro, z0), P(a1, ro, z0), P(a1, ro, z1), P(a0, ro, z1))
    b.quadFlat(P(a0, ri, z1), P(a1, ri, z1), P(a1, ri, z0), P(a0, ri, z0))
    b.quadFlat(P(a0, ri, z1), P(a0, ro, z1), P(a1, ro, z1), P(a1, ri, z1))
    b.quadFlat(P(a1, ri, z0), P(a1, ro, z0), P(a0, ro, z0), P(a0, ri, z0))
  }
}

/** Kemerin sutuna bindigi impost bloklari. */
function impostEkle(b: MeshBuilder): void {
  const yari = KEMER_KALINLIK / 2 + 0.035
  const z = KEMER_DERINLIK / 2 + 0.02
  const y0 = OMUZ_Y - 0.055
  const y1 = OMUZ_Y

  for (const s of [-1, 1]) {
    const cx = s * KEMER_R
    const x0 = cx - yari
    const x1 = cx + yari
    const k: Vec3[] = [
      [x0, y0, -z],
      [x1, y0, -z],
      [x1, y0, z],
      [x0, y0, z],
      [x0, y1, -z],
      [x1, y1, -z],
      [x1, y1, z],
      [x0, y1, z],
    ]
    b.quadFlat(k[4], k[7], k[6], k[5]) // ust
    b.quadFlat(k[0], k[1], k[2], k[3]) // alt
    b.quadFlat(k[3], k[2], k[6], k[7]) // on
    b.quadFlat(k[1], k[0], k[4], k[5]) // arka
    b.quadFlat(k[0], k[3], k[7], k[4]) // sol
    b.quadFlat(k[2], k[1], k[5], k[6]) // sag
  }
}

// ------------------------------------------------------------------ disari

export function buildArch(): MeshData {
  const b = new MeshBuilder()
  sutunEkle(b, -SUTUN_X)
  sutunEkle(b, SUTUN_X)
  kemerEkle(b)
  silmeEkle(b)
  impostEkle(b)
  return b.build()
}
