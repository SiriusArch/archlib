/**
 * Basit icerik denetimi. Bu bir yapay zeka moderasyonu degildir; yalnizca en
 * yaygin agir kufur/cinsel icerik kaliplarini (Turkce ve Ingilizce) yakalayan
 * bir on filtredir — "her dilde her seyi" yakalamasi garanti degildir. Asil
 * guvenlik agi kullanicilarin "Bildir" dugmesiyle isaretlemesidir (bkz. raporOlustur).
 */
import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
import { db } from './firebase'

// Kisa ve/veya gundelik kelimelerin icinde de gecebilen kokler: yalnizca TAM
// KELIME olarak eslesirse sayilir (aksi halde "goturu usulu", "goturmek" gibi
// zararsiz insaat terimleri ya da "class", "assistant", "sextant" gibi
// Ingilizce kelimeler yanlislikla engellenir).
const TAM_KELIME_KOKLERI = [
  // Turkce
  'göt',
  'got',
  'aq',
  'am',
  // Ingilizce
  'ass',
  'sex',
  'dick',
  'cock',
  'cum',
  'fap',
]

// Sozluk/gundelik kelimeyle carpismasi cok dusuk oldugu icin alt dize olarak
// da eslesebilen, daha uzun ve belirgin kokler.
const ALT_DIZI_KOKLERI = [
  // Turkce kufur / hakaret / cinsel icerik
  'amk',
  'yarrak',
  'yarak',
  'siktir',
  'sikeyim',
  'sikis',
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
  'porno',
  'pornografi',
  // Ingilizce kufur / hakaret / cinsel icerik
  'fuck',
  'shit',
  'bitch',
  'asshole',
  'cunt',
  'pussy',
  'whore',
  'slut',
  'nigger',
  'nigga',
  'porn',
  'blowjob',
  'handjob',
  'masturbat',
  'penis',
  'vagina',
  'anal',
]

/**
 * Metni denetim icin sadelestirir: kucuk harfe cevirir, yaygin harf-yerine-
 * sembol kacislarini (l33tspeak) gercek harfe cevirir, ayni harfin
 * ust uste tekrarini teke indirir (or. "siiiktir" -> "siktir") ve
 * harf/rakam/bosluk disindaki her seyi (ayrac olarak kullanilan -, ., _, * gibi
 * isaretler dahil) kaldirir.
 */
function sadelestir(metin: string): string {
  const kucuk = metin.toLocaleLowerCase('tr-TR')
  const l33tsiz = kucuk
    .replace(/[@4]/g, 'a')
    .replace(/[3€]/g, 'e')
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/[$5]/g, 's')
    .replace(/7/g, 't')
  const temiz = l33tsiz.replace(/[^a-zçğıöşü0-9\s]/gu, ' ').replace(/\s+/g, ' ').trim()
  // Aralara sizdirilan bosluklari da (or. "s i k t i r") tek kelimede birlestirmek
  // icin harfler arasi tek bosluklari kaldiran ikinci bir surum cikarip
  // TAM METIN uzerinde ayrica arayacagiz (bkz. agirIcerikVarMi).
  return temiz.replace(/(.)\1{2,}/gu, '$1')
}

/** Harfler arasina sizdirilan bosluk/ayrac ile yazilmis kaliplari yakalamak icin. */
function bitisik(metin: string): string {
  return metin.replace(/\s+/g, '')
}

/** Metinde bariz kufur/hakaret/cinsel icerik varsa true doner. Kesin degildir; kullanicilarin bildirimi asil denetimdir. */
export function agirIcerikVarMi(metin: string): boolean {
  const s = sadelestir(metin)
  const kelimeler = s.split(/\s+/).filter(Boolean)
  if (TAM_KELIME_KOKLERI.some((k) => kelimeler.includes(k))) return true
  if (ALT_DIZI_KOKLERI.some((k) => s.includes(k))) return true

  // "s i k t i r" gibi harf arali kacislar icin: bosluklari kaldirip
  // yalnizca substring-guvenli (tam kelime olmayan) kokleri tekrar dene.
  const birlesik = bitisik(s)
  return ALT_DIZI_KOKLERI.some((k) => birlesik.includes(k))
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
