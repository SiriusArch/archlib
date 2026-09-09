/**
 * Yerel metrik projeksiyon.
 *
 * Arsa olceginde (birkac km) enlem/boylami metreye cevirmek icin tam bir UTM
 * donusumune gerek yok: merkez enlemde teget duzlem yaklasimi milimetre
 * mertebesinde degil ama santimetre-metre mertebesinde dogru sonuc verir ve
 * mimari altlik icin fazlasiyla yeterlidir.
 *
 * Eksen duzeni CAD ile ayni: X dogu, Y kuzey, birim metre, orijin secilen merkez.
 */

const DUNYA_YARICAPI = 6378137

export interface Merkez {
  readonly enlem: number
  readonly boylam: number
}

export interface Nokta {
  readonly x: number
  readonly y: number
}

export class Projeksiyon {
  readonly merkez: Merkez
  /** 1 derece boylamin metre karsiligi (merkez enlemde) */
  private readonly boylamOlcek: number
  /** 1 derece enlemin metre karsiligi */
  private readonly enlemOlcek: number

  constructor(merkez: Merkez) {
    this.merkez = merkez
    const rad = (merkez.enlem * Math.PI) / 180
    this.enlemOlcek = (Math.PI / 180) * DUNYA_YARICAPI
    this.boylamOlcek = (Math.PI / 180) * DUNYA_YARICAPI * Math.cos(rad)
  }

  ileri(enlem: number, boylam: number): Nokta {
    return {
      x: (boylam - this.merkez.boylam) * this.boylamOlcek,
      y: (enlem - this.merkez.enlem) * this.enlemOlcek,
    }
  }

  geri(x: number, y: number): Merkez {
    return {
      boylam: this.merkez.boylam + x / this.boylamOlcek,
      enlem: this.merkez.enlem + y / this.enlemOlcek,
    }
  }

  /** Merkezden yaricap metre uzaklikta bir kare sinir kutusu (guney,bati,kuzey,dogu). */
  sinirKutusu(yaricapMetre: number): [number, number, number, number] {
    const dEnlem = yaricapMetre / this.enlemOlcek
    const dBoylam = yaricapMetre / this.boylamOlcek
    return [
      this.merkez.enlem - dEnlem,
      this.merkez.boylam - dBoylam,
      this.merkez.enlem + dEnlem,
      this.merkez.boylam + dBoylam,
    ]
  }
}

/** Web Mercator karo koordinati (kayan nokta). */
export function karoKoordinati(enlem: number, boylam: number, z: number): { x: number; y: number } {
  const n = 2 ** z
  const rad = (enlem * Math.PI) / 180
  return {
    x: ((boylam + 180) / 360) * n,
    y: ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) * n,
  }
}

export function karodanEnlemBoylam(x: number, y: number, z: number): Merkez {
  const n = 2 ** z
  const boylam = (x / n) * 360 - 180
  const enlemRad = Math.atan(Math.sinh(Math.PI * (1 - (2 * y) / n)))
  return { enlem: (enlemRad * 180) / Math.PI, boylam }
}
