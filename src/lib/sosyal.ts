/**
 * Arkadaslik ve birebir sohbet veri katmani.
 * Kullanicilar birbirini yalnizca takma adla arayabilir; e-posta hicbir
 * sorguda kullanilmaz ve Firestore'a hic yazilmaz.
 *
 * Tasarim notu: arkadaslikIstegi VE sohbet belgeleri ayni deterministik id'yi
 * kullanir ([uid1,uid2] siralanip birlestirilir). Boylece "sohbet ancak kabul
 * edilmis arkadaslikla baslar" kurali, Firestore guvenlik kurallarinda tek bir
 * exists()/get() kontroluyle, sunucu tarafi fonksiyon yazmadan saglanabiliyor.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  endAt,
  getDoc,
  getDocs,
  limitToLast,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  startAt,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { agirIcerikVarMi } from './moderasyon'
import type { ArkadasKaydi, ArkadaslikIstegi, SohbetMesaji, SohbetOzeti } from '../types'

function ikiliAnahtar(uid1: string, uid2: string): string {
  return [uid1, uid2].sort().join('_')
}

/** Firestore Timestamp'i ms'ye cevirir; henuz yazilmamissa (serverTimestamp bekleniyor) varsayilani doner. */
function msDen(v: unknown, varsayilan: number): number {
  return (v as { toMillis?: () => number })?.toMillis?.() ?? varsayilan
}

/** Takma ada gore on-eslesme aramasi (Firestore'da tam metin arama yoktur). */
export async function kullaniciAra(
  terim: string,
  kendiUid: string,
): Promise<{ uid: string; takmaAd: string }[]> {
  if (!db) return []
  const t = terim.trim().toLocaleLowerCase('tr-TR')
  if (t.length < 2) return []
  const sorgu = query(
    collection(db, 'kullanicilar'),
    orderBy('takmaAdKucuk'),
    startAt(t),
    endAt(t + ''),
    limit(10),
  )
  const anlik = await getDocs(sorgu)
  return anlik.docs
    .map((d) => ({ uid: d.id, takmaAd: String(d.data().takmaAd ?? '') }))
    .filter((k) => k.uid !== kendiUid)
}

// ---------------------------------------------------------------- arkadaslik

const ISTEK_KOLEKSIYON = 'arkadasIstekleri'

function istegeCevir(id: string, v: Record<string, unknown>): ArkadaslikIstegi {
  return {
    id,
    gonderenId: String(v.gonderenId ?? ''),
    gonderenAdi: String(v.gonderenAdi ?? ''),
    alanId: String(v.alanId ?? ''),
    alanAdi: String(v.alanAdi ?? ''),
    durum: v.durum === 'kabul' ? 'kabul' : 'bekliyor',
    tarih: msDen(v.tarih, Date.now()),
  }
}

export async function arkadaslikIstegiGonder(
  gonderenId: string,
  gonderenAdi: string,
  alanId: string,
  alanAdi: string,
): Promise<void> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  if (gonderenId === alanId) throw new Error('Kendine istek gönderemezsin.')

  const ref = doc(db, ISTEK_KOLEKSIYON, ikiliAnahtar(gonderenId, alanId))
  const mevcut = await getDoc(ref)
  if (mevcut.exists()) throw new Error('Zaten bir istek var ya da arkadaşsınız.')

  await setDoc(ref, {
    gonderenId,
    gonderenAdi,
    alanId,
    alanAdi,
    // Kabul edilmis arkadasliklari TEK sorguda listeyebilmek icin (bkz.
    // arkadaslariDinle); siralamasi onemsiz, array-contains ile arama icin.
    taraflar: [gonderenId, alanId].sort(),
    durum: 'bekliyor',
    tarih: serverTimestamp(),
  })
}

/** Bana gelen bekleyen istekleri dinler. */
export function gelenIstekleriDinle(uid: string, isle: (istekler: ArkadaslikIstegi[]) => void): Unsubscribe {
  if (!db) return () => {}
  const sorgu = query(
    collection(db, ISTEK_KOLEKSIYON),
    where('alanId', '==', uid),
    where('durum', '==', 'bekliyor'),
  )
  return onSnapshot(sorgu, (anlik) => isle(anlik.docs.map((d) => istegeCevir(d.id, d.data()))))
}

export async function istegiKabulEt(istek: ArkadaslikIstegi): Promise<void> {
  if (!db) return
  await updateDoc(doc(db, ISTEK_KOLEKSIYON, istek.id), {
    durum: 'kabul',
    kabulTarihi: serverTimestamp(),
  })
}

export async function istegiReddet(istekId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, ISTEK_KOLEKSIYON, istekId))
}

/** Kabul edilmis tum arkadasliklari (hangi yonde kurulmus olursa olsun) TEK sorguyla dinler. */
export function arkadaslariDinle(uid: string, isle: (arkadaslar: ArkadasKaydi[]) => void): Unsubscribe {
  if (!db) return () => {}
  const sorgu = query(
    collection(db, ISTEK_KOLEKSIYON),
    where('taraflar', 'array-contains', uid),
    where('durum', '==', 'kabul'),
  )
  return onSnapshot(sorgu, (anlik) => {
    const arkadaslar = anlik.docs.map((d) => {
      const v = d.data()
      const digerUid = v.gonderenId === uid ? String(v.alanId) : String(v.gonderenId)
      const digerAd = v.gonderenId === uid ? String(v.alanAdi ?? '') : String(v.gonderenAdi ?? '')
      return {
        uid: digerUid,
        takmaAd: digerAd,
        beri: msDen(v.kabulTarihi, Date.now()),
        istekId: d.id,
      }
    })
    isle(arkadaslar.sort((a, b) => a.takmaAd.localeCompare(b.takmaAd, 'tr')))
  })
}

export async function arkadaslikSil(istekId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, ISTEK_KOLEKSIYON, istekId))
}

// -------------------------------------------------------------------- sohbet

/**
 * Iki kisi arasindaki sohbeti dondurur; yoksa olusturur. Yalnizca ILK
 * olusturmada baslangic degerleri yazilir — var olan bir sohbeti her
 * acilista yeniden yazmak sonMesajTarih'i sifirlayip sohbeti listenin
 * basina atardi (hic mesaj gelmemis gibi).
 */
export async function sohbetiBaslat(
  kendiUid: string,
  kendiAd: string,
  digerUid: string,
  digerAd: string,
): Promise<string> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const id = ikiliAnahtar(kendiUid, digerUid)
  const ref = doc(db, 'sohbetler', id)
  const mevcut = await getDoc(ref)
  if (!mevcut.exists()) {
    await setDoc(ref, {
      katilimcilar: [kendiUid, digerUid],
      adlar: { [kendiUid]: kendiAd, [digerUid]: digerAd },
      sonMesaj: '',
      sonMesajTarih: serverTimestamp(),
    })
  }
  return id
}

export function sohbetleriDinle(uid: string, isle: (sohbetler: SohbetOzeti[]) => void): Unsubscribe {
  if (!db) return () => {}
  const sorgu = query(
    collection(db, 'sohbetler'),
    where('katilimcilar', 'array-contains', uid),
    orderBy('sonMesajTarih', 'desc'),
  )
  return onSnapshot(sorgu, (anlik) => {
    isle(
      anlik.docs.map((d) => {
        const v = d.data()
        const katilimcilar = (v.katilimcilar as string[]) ?? []
        const digerUid = katilimcilar.find((k) => k !== uid) ?? ''
        const adlar = (v.adlar as Record<string, string>) ?? {}
        return {
          id: d.id,
          katilimcilar,
          digerUid,
          digerAd: adlar[digerUid] ?? 'Bilinmeyen',
          sonMesaj: String(v.sonMesaj ?? ''),
          sonMesajTarih: msDen(v.sonMesajTarih, 0),
        }
      }),
    )
  })
}

function mesajaCevir(id: string, v: Record<string, unknown>): SohbetMesaji {
  return {
    id,
    gonderenId: String(v.gonderenId ?? ''),
    icerik: String(v.icerik ?? ''),
    tarih: msDen(v.tarih, Date.now()),
  }
}

/** Son 200 mesaji (eskiden yeniye) dinler; sohbet cok uzarsa tumunu tekrar tekrar indirmemek icin. */
export function mesajlariDinle(sohbetId: string, isle: (mesajlar: SohbetMesaji[]) => void): Unsubscribe {
  if (!db) return () => {}
  const sorgu = query(
    collection(db, 'sohbetler', sohbetId, 'mesajlar'),
    orderBy('tarih', 'asc'),
    limitToLast(200),
  )
  return onSnapshot(sorgu, (anlik) => isle(anlik.docs.map((d) => mesajaCevir(d.id, d.data()))))
}

export async function mesajGonder(sohbetId: string, gonderenId: string, icerik: string): Promise<void> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const i = icerik.trim()
  if (!i) return
  if (agirIcerikVarMi(i)) throw new Error('Bu mesaj topluluk kurallarına uymuyor gibi görünüyor.')
  const simdi = serverTimestamp()
  await Promise.all([
    addDoc(collection(db, 'sohbetler', sohbetId, 'mesajlar'), {
      gonderenId,
      icerik: i,
      tarih: simdi,
    }),
    updateDoc(doc(db, 'sohbetler', sohbetId), {
      sonMesaj: i.slice(0, 120),
      sonMesajTarih: simdi,
    }),
  ])
}
