import type { AnahtarKaydi, Saglayici } from '../types'

const ANAHTAR_KEY = 'archlib.anahtar.v1'
const SAGLAYICI_KEY = 'archlib.saglayici.v1'
const LISTE_KEY = 'archlib.liste.v1'
const GECMIS_KEY = 'archlib.gecmis.v1'

function guvenliOku<T>(anahtar: string, varsayilan: T): T {
  try {
    const ham = localStorage.getItem(anahtar)
    if (!ham) return varsayilan
    return JSON.parse(ham) as T
  } catch {
    return varsayilan
  }
}

function guvenliYaz(anahtar: string, deger: unknown): void {
  try {
    localStorage.setItem(anahtar, JSON.stringify(deger))
  } catch {
    /* kota dolu ya da depolama kapali; sessizce gec */
  }
}

export function anahtarlariOku(): Record<string, AnahtarKaydi> {
  return guvenliOku<Record<string, AnahtarKaydi>>(ANAHTAR_KEY, {})
}

export function anahtarYaz(kayit: AnahtarKaydi): void {
  const hepsi = anahtarlariOku()
  hepsi[kayit.saglayici] = kayit
  guvenliYaz(ANAHTAR_KEY, hepsi)
}

export function anahtarSil(saglayici: Saglayici): void {
  const hepsi = anahtarlariOku()
  delete hepsi[saglayici]
  guvenliYaz(ANAHTAR_KEY, hepsi)
}

export function aktifSaglayiciOku(): Saglayici {
  const s = guvenliOku<string>(SAGLAYICI_KEY, 'gemini')
  return (['anthropic', 'openai', 'gemini'] as string[]).includes(s) ? (s as Saglayici) : 'gemini'
}

export function aktifSaglayiciYaz(s: Saglayici): void {
  guvenliYaz(SAGLAYICI_KEY, s)
}

export function listeDurumuOku(): Record<string, boolean> {
  return guvenliOku<Record<string, boolean>>(LISTE_KEY, {})
}

export function listeDurumuYaz(durum: Record<string, boolean>): void {
  guvenliYaz(LISTE_KEY, durum)
}

export interface GecmisKaydi {
  id: string
  tarih: number
  tur: string
  baslik: string
  metin: string
}

export function gecmisOku(): GecmisKaydi[] {
  return guvenliOku<GecmisKaydi[]>(GECMIS_KEY, [])
}

export function gecmiseEkle(kayit: GecmisKaydi): void {
  const liste = gecmisOku()
  liste.unshift(kayit)
  guvenliYaz(GECMIS_KEY, liste.slice(0, 20))
}

export function gecmisiTemizle(): void {
  guvenliYaz(GECMIS_KEY, [])
}
