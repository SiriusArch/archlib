import type { AnalizTuru, ModelSeviyesi } from '../types'

/**
 * Otomatik model secimi icin soru zorlugu tahmini.
 * Ekstra bir AI cagrisi yapmadan; goruntu sayisi, metin uzunlugu, kritik turu
 * ve doldurulan baglam alanlarindan bir puan cikarir ve puani bir model
 * kademesine (hizli / dengeli / guclu) esler.
 */

const KARMASIK_TURLER: AnalizTuru[] = ['temel-tasar', 'genel', 'konsept']

export interface ZorlukGirdisi {
  soru: string
  gorselSayisi: number
  tur: AnalizTuru
  proje: string
  olcek: string
  ders: string
}

export function modelSeviyesiTahminiYap(g: ZorlukGirdisi): ModelSeviyesi {
  let puan = 0

  const uzunluk = g.soru.trim().length
  if (uzunluk > 500) puan += 2
  else if (uzunluk > 150) puan += 1

  if (g.gorselSayisi >= 4) puan += 2
  else if (g.gorselSayisi >= 2) puan += 1
  else if (g.gorselSayisi === 1) puan += 1

  if (KARMASIK_TURLER.includes(g.tur)) puan += 1

  const baglamSayisi = [g.proje, g.olcek, g.ders].filter((x) => x.trim()).length
  if (baglamSayisi >= 2) puan += 1

  if (puan <= 1) return 'hizli'
  if (puan <= 3) return 'dengeli'
  return 'guclu'
}
