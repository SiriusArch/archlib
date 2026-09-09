/**
 * Cizim modulunun veri modeli.
 *
 * Birim her yerde METRE, eksen duzeni CAD ile ayni: X dogu, Y kuzey, Z yukari.
 * Duvarlar EKSEN cizgisiyle saklanir; kalinlik iki yana esit dagitilir. Boylece
 * kalinlik degistiginde koseler kendiliginden dogru kalir ve aciklik konumu
 * duvar boyunca tek bir mesafeyle ifade edilebilir.
 */

export interface Nokta {
  x: number
  y: number
}

export type DuvarTuru = 'tasiyici' | 'bolme' | 'cam' | 'parapet'
export type AciklikTuru = 'kapi' | 'pencere'
export type ElemanTuru = 'duvar' | 'aciklik' | 'mobilya' | 'kolon' | 'olcu'

export interface Secim {
  tur: ElemanTuru
  id: string
}

export interface Duvar {
  id: string
  a: Nokta
  b: Nokta
  /** Metre */
  kalinlik: number
  /** Metre; 0 verilirse katin yuksekligi kullanilir */
  yukseklik: number
  tur: DuvarTuru
}

export interface Aciklik {
  id: string
  duvarId: string
  tur: AciklikTuru
  /** Katalog anahtari */
  katalog: string
  /** Duvar baslangicindan aciklik EKSENINE olan mesafe (m) */
  mesafe: number
  genislik: number
  yukseklik: number
  /** Doseme kotundan alt kenara mesafe (m). Kapida 0, pencerede parapet. */
  esik: number
  /** Kapi acilis yonu / pencere disari yonu */
  ters: boolean
}

export interface Mobilya {
  id: string
  katalog: string
  ad: string
  konum: Nokta
  /** Derece, saat yonunun tersi */
  aci: number
  genislik: number
  derinlik: number
  yukseklik: number
  renk: string
}

export interface Kolon {
  id: string
  konum: Nokta
  genislik: number
  derinlik: number
  aci: number
}

export interface OlcuCizgisi {
  id: string
  a: Nokta
  b: Nokta
  /** Cizginin kendisinden dik kayma (m) */
  ofset: number
}

/** Kat altina serilen kilavuz gorsel (taranmis plan, eskiz). */
export interface Altlik {
  /** data: URL */
  veri: string
  /** Gorselin bir pikselinin metre karsiligi */
  olcek: number
  /** Sol ust kosenin dunya konumu */
  konum: Nokta
  saydamlik: number
  kilit: boolean
  genislikPx: number
  yukseklikPx: number
}

export interface Kat {
  id: string
  ad: string
  /** Doseme ust kotu (m) */
  kot: number
  /** Kat yuksekligi (m) */
  yukseklik: number
  duvarlar: Duvar[]
  aciklikar: Aciklik[]
  mobilyalar: Mobilya[]
  kolonlar: Kolon[]
  olculer: OlcuCizgisi[]
  altlik: Altlik | null
  gorunur: boolean
}

export interface Varsayilanlar {
  duvarKalinlik: number
  bolmeKalinlik: number
  duvarYukseklik: number
  kapiGenislik: number
  kapiYukseklik: number
  pencereGenislik: number
  pencereYukseklik: number
  pencereEsik: number
  izgaraAdim: number
  aciAdim: number
}

export interface Proje {
  id: string
  ad: string
  olusturma: number
  guncelleme: number
  katlar: Kat[]
  varsayilan: Varsayilanlar
}

export const VARSAYILAN: Varsayilanlar = {
  // Neufert / TS: tasiyici tugla duvar 20 cm, bolme 10 cm, net kat yuksekligi 2.80 m
  duvarKalinlik: 0.2,
  bolmeKalinlik: 0.1,
  duvarYukseklik: 2.8,
  kapiGenislik: 0.9,
  kapiYukseklik: 2.1,
  pencereGenislik: 1.2,
  pencereYukseklik: 1.4,
  pencereEsik: 0.9,
  izgaraAdim: 0.25,
  aciAdim: 15,
}

export function kimlik(onEk = 'e'): string {
  return `${onEk}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}

export function bosKat(ad: string, kot: number, yukseklik = VARSAYILAN.duvarYukseklik): Kat {
  return {
    id: kimlik('k'),
    ad,
    kot,
    yukseklik,
    duvarlar: [],
    aciklikar: [],
    mobilyalar: [],
    kolonlar: [],
    olculer: [],
    altlik: null,
    gorunur: true,
  }
}

export function yeniProje(ad = 'Adsiz proje'): Proje {
  return {
    id: kimlik('p'),
    ad,
    olusturma: Date.now(),
    guncelleme: Date.now(),
    katlar: [bosKat('Zemin kat', 0)],
    varsayilan: { ...VARSAYILAN },
  }
}

// ------------------------------------------------------------------ araclar

export type Arac =
  | 'sec'
  | 'duvar'
  | 'dikdortgen'
  | 'kapi'
  | 'pencere'
  | 'mobilya'
  | 'kolon'
  | 'olcu'

export interface AracTanimi {
  id: Arac
  ad: string
  kisayol: string
  ipucu: string
}

export const ARACLAR: AracTanimi[] = [
  { id: 'sec', ad: 'Sec', kisayol: 'V', ipucu: 'Sec, tasi, uc noktalarini duzenle' },
  { id: 'duvar', ad: 'Duvar', kisayol: 'D', ipucu: 'Zincirleme duvar ciz; Esc bitirir' },
  { id: 'dikdortgen', ad: 'Oda', kisayol: 'R', ipucu: 'Dikdortgen oda: iki kose tikla' },
  { id: 'kapi', ad: 'Kapi', kisayol: 'K', ipucu: 'Duvara tiklayarak kapi yerlestir' },
  { id: 'pencere', ad: 'Pencere', kisayol: 'P', ipucu: 'Duvara tiklayarak pencere yerlestir' },
  { id: 'mobilya', ad: 'Donati', kisayol: 'F', ipucu: 'Katalogdan sec, tikla; R/T dondurur' },
  { id: 'kolon', ad: 'Kolon', kisayol: 'C', ipucu: 'Tasiyici kolon yerlestir' },
  { id: 'olcu', ad: 'Olcu', kisayol: 'M', ipucu: 'Iki nokta arasi olcu cizgisi' },
]
