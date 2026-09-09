/**
 * Yukseklik verisi — AWS Open Data uzerindeki Terrarium karolarindan.
 *
 * Terrarium kodlamasi bir PNG'nin RGB kanallarina yuksekligi gomer:
 *     yukseklik(m) = (R * 256 + G + B / 256) - 32768
 * Karolar CORS'a acik oldugu icin canvas'a cizilip piksel piksel okunabiliyor;
 * bu, nokta nokta API sorgulamaktan cok daha hizli ve yogun veri veriyor.
 *
 * Kaynak: https://registry.opendata.aws/terrain-tiles/  (ODbL / kamu verileri)
 */

import { Projeksiyon, karoKoordinati } from './projeksiyon'

const KARO_TABANI = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium'
const KARO_BOYUT = 256

export interface YukseklikIzgarasi {
  /** Satir sayisi (kuzeyden guneye) */
  readonly satir: number
  /** Sutun sayisi (batidan doguya) */
  readonly sutun: number
  /** Metre cinsinden yukseklikler, satir-oncelikli */
  readonly veri: Float32Array
  /** Izgaranin kapladigi yarim genislik (metre) */
  readonly yaricap: number
  /** Hucre boyutu (metre) */
  readonly adim: number
  readonly enDusuk: number
  readonly enYuksek: number
  readonly zoom: number
}

function karoUrl(z: number, x: number, y: number): string {
  return `${KARO_TABANI}/${z}/${x}/${y}.png`
}

function goruntuYukle(url: string, signal?: AbortSignal): Promise<HTMLImageElement> {
  return new Promise((coz, reddet) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    const temizle = () => {
      img.onload = null
      img.onerror = null
    }
    img.onload = () => {
      temizle()
      coz(img)
    }
    img.onerror = () => {
      temizle()
      reddet(new Error(`Yukseklik karosu yuklenemedi: ${url}`))
    }
    if (signal) {
      if (signal.aborted) {
        reddet(new DOMException('Iptal edildi', 'AbortError'))
        return
      }
      signal.addEventListener(
        'abort',
        () => {
          img.src = ''
          reddet(new DOMException('Iptal edildi', 'AbortError'))
        },
        { once: true },
      )
    }
    img.src = url
  })
}

/** Alanin buyuklugune gore uygun karo zoom seviyesi. */
function zoomSec(merkezEnlem: number, yaricapMetre: number, hedefHucre: number): number {
  const enlemRad = (merkezEnlem * Math.PI) / 180
  for (let z = 15; z >= 8; z--) {
    const metrePiksel = (156543.03392 * Math.cos(enlemRad)) / 2 ** z
    if (metrePiksel >= hedefHucre) return z
  }
  return 8
}

export async function yukseklikGetir(
  proj: Projeksiyon,
  yaricapMetre: number,
  bolme = 160,
  signal?: AbortSignal,
): Promise<YukseklikIzgarasi> {
  const adim = (2 * yaricapMetre) / bolme
  const zoom = zoomSec(proj.merkez.enlem, yaricapMetre, adim)

  const [guney, bati, kuzey, dogu] = proj.sinirKutusu(yaricapMetre)
  const solUst = karoKoordinati(kuzey, bati, zoom)
  const sagAlt = karoKoordinati(guney, dogu, zoom)

  const x0 = Math.floor(solUst.x)
  const x1 = Math.floor(sagAlt.x)
  const y0 = Math.floor(solUst.y)
  const y1 = Math.floor(sagAlt.y)

  const enKaro = x1 - x0 + 1
  const boyKaro = y1 - y0 + 1
  if (enKaro * boyKaro > 24) {
    throw new Error('Secilen alan yukseklik verisi icin fazla buyuk. Yaricapi kucult.')
  }

  const tuval = document.createElement('canvas')
  tuval.width = enKaro * KARO_BOYUT
  tuval.height = boyKaro * KARO_BOYUT
  const ctx = tuval.getContext('2d', { willReadFrequently: true })
  if (!ctx) throw new Error('Canvas 2D baglami olusturulamadi.')

  const isler: Promise<void>[] = []
  let basarisiz = 0
  for (let ty = y0; ty <= y1; ty++) {
    for (let tx = x0; tx <= x1; tx++) {
      isler.push(
        goruntuYukle(karoUrl(zoom, tx, ty), signal)
          .then((img) => {
            ctx.drawImage(img, (tx - x0) * KARO_BOYUT, (ty - y0) * KARO_BOYUT)
          })
          .catch((e) => {
            if ((e as Error)?.name === 'AbortError') throw e
            basarisiz++
          }),
      )
    }
  }
  await Promise.all(isler)
  if (basarisiz === enKaro * boyKaro) {
    throw new Error('Yukseklik karolarinin hicbiri yuklenemedi. Baglantiyi kontrol et.')
  }

  const piksel = ctx.getImageData(0, 0, tuval.width, tuval.height).data

  const satir = bolme + 1
  const sutun = bolme + 1
  const veri = new Float32Array(satir * sutun)
  let enDusuk = Infinity
  let enYuksek = -Infinity

  for (let i = 0; i < satir; i++) {
    // i = 0 kuzey kenari
    const y = yaricapMetre - i * adim
    for (let j = 0; j < sutun; j++) {
      const x = -yaricapMetre + j * adim
      const { enlem, boylam } = proj.geri(x, y)
      const k = karoKoordinati(enlem, boylam, zoom)

      const px = Math.min(tuval.width - 1, Math.max(0, Math.round((k.x - x0) * KARO_BOYUT)))
      const py = Math.min(tuval.height - 1, Math.max(0, Math.round((k.y - y0) * KARO_BOYUT)))
      const o = (py * tuval.width + px) * 4

      const h = piksel[o] * 256 + piksel[o + 1] + piksel[o + 2] / 256 - 32768
      // Yuklenemeyen karo siyah kalir; -32768 degeri bunun isaretidir.
      const gecerli = h > -1000 && h < 9000 ? h : 0
      veri[i * sutun + j] = gecerli
      if (gecerli < enDusuk) enDusuk = gecerli
      if (gecerli > enYuksek) enYuksek = gecerli
    }
  }

  return {
    satir,
    sutun,
    veri,
    yaricap: yaricapMetre,
    adim,
    enDusuk: Number.isFinite(enDusuk) ? enDusuk : 0,
    enYuksek: Number.isFinite(enYuksek) ? enYuksek : 0,
    zoom,
  }
}

/** Izgara uzerinde iki nokta arasindaki kesit profilini cikarir. */
export function kesitProfili(
  izgara: YukseklikIzgarasi,
  baslangic: { x: number; y: number },
  bitis: { x: number; y: number },
  ornek = 240,
): { mesafe: number; kot: number }[] {
  const uzunluk = Math.hypot(bitis.x - baslangic.x, bitis.y - baslangic.y)
  const cikti: { mesafe: number; kot: number }[] = []
  for (let i = 0; i <= ornek; i++) {
    const t = i / ornek
    const x = baslangic.x + (bitis.x - baslangic.x) * t
    const y = baslangic.y + (bitis.y - baslangic.y) * t
    cikti.push({ mesafe: uzunluk * t, kot: kotOku(izgara, x, y) })
  }
  return cikti
}

/** Iki dogrusal ara degerlemeyle izgaradan kot okur. */
export function kotOku(izgara: YukseklikIzgarasi, x: number, y: number): number {
  const { yaricap, adim, satir, sutun, veri } = izgara
  const fj = (x + yaricap) / adim
  const fi = (yaricap - y) / adim

  const j0 = Math.min(sutun - 1, Math.max(0, Math.floor(fj)))
  const i0 = Math.min(satir - 1, Math.max(0, Math.floor(fi)))
  const j1 = Math.min(sutun - 1, j0 + 1)
  const i1 = Math.min(satir - 1, i0 + 1)
  const tj = Math.min(1, Math.max(0, fj - j0))
  const ti = Math.min(1, Math.max(0, fi - i0))

  const a = veri[i0 * sutun + j0]
  const b = veri[i0 * sutun + j1]
  const c = veri[i1 * sutun + j0]
  const d = veri[i1 * sutun + j1]

  return (a * (1 - tj) + b * tj) * (1 - ti) + (c * (1 - tj) + d * tj) * ti
}
