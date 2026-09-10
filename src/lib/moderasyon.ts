/**
 * Basit icerik denetimi. Bu bir yapay zeka moderasyonu degildir; yalnizca en
 * yaygin agir kufur/hakaret kaliplarini yakalayan bir on filtredir. Asil
 * guvenlik agi kullanicilarin "Bildir" dugmesiyle isaretlemesidir (bkz. raporOlustur).
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

// Kisa ve/veya "gotur-/goturu-" gibi tamamen zararsiz insaat/tasima
// kelimelerinin icinde de gecen kokler: yalnizca TAM KELIME olarak eslesirse
// sayilir (aksi halde "goturu usulu" ya da "goturmek" gibi gundelik yapi
// terimleri yanlislikla engellenir).
const TAM_KELIME_KOKLERI = ['göt', 'got', 'aq']

// Sozluk/gundelik kelimeyle carpismasi cok dusuk oldugu icin alt dize olarak
// da eslesebilen, daha uzun ve belirgin kokler.
const ALT_DIZI_KOKLERI = [
  'amk',
  'yarrak',
  'yarak',
  'siktir',
  'sikeyim',
  'orospu',
  'piç',
  'pic',
  'ibne',
  'kahpe',
  'sürtük',
  'surtuk',
  'salak',
  'gerizekalı',
  'gerizekali',
  'aptal',
  'mal herif',
]

function sadelestir(metin: string): string {
  return metin
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-zçğıöşü0-9\s]/gu, '')
}

/** Metinde bariz kufur/hakaret varsa true doner. Kesin degildir; kullanicilarin bildirimi asil denetimdir. */
export function agirIcerikVarMi(metin: string): boolean {
  const s = sadelestir(metin)
  const kelimeler = s.split(/\s+/).filter(Boolean)
  if (TAM_KELIME_KOKLERI.some((k) => kelimeler.includes(k))) return true
  return ALT_DIZI_KOKLERI.some((k) => s.includes(k))
}

export type RaporTuru = 'forum-basligi' | 'forum-cevabi' | 'mesaj'

export async function raporOlustur(
  tur: RaporTuru,
  hedefId: string,
  bildirenId: string,
  sebep: string,
): Promise<void> {
  if (!db) return
  await addDoc(collection(db, 'raporlar'), {
    tur,
    hedefId,
    bildirenId,
    sebep: sebep.trim().slice(0, 300),
    tarih: serverTimestamp(),
  })
}
