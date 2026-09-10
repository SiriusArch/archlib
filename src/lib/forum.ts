/**
 * Forum veri katmani — Firestore uzerinde "forumBasliklari" ve onun
 * "cevaplar" alt koleksiyonu. Tum okuma gerceklik-zamanli (onSnapshot);
 * yazma islemleri Firestore guvenlik kurallariyla yalnizca sahibine acik.
 */
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  increment,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from './firebase'
import { agirIcerikVarMi } from './moderasyon'
import type { ForumBasligi, ForumCevap, ForumKategori } from '../types'

export const FORUM_KATEGORI_ADI: Record<ForumKategori, string> = {
  'cizim-yazilim': 'Çizim ve Yazılım',
  'yapi-teknik': 'Yapı ve Teknik',
  'studyo-elestiri': 'Stüdyo ve Eleştiri',
  'kariyer-egitim': 'Kariyer ve Eğitim',
  genel: 'Genel',
}

const KOLEKSIYON = 'forumBasliklari'
/** Ana listede en fazla bu kadar baslik gosterilir (en son aktif olanlar). */
const BASLIK_LIMITI = 200

/** Firestore Timestamp'i ms'ye cevirir; henuz yazilmamissa (serverTimestamp bekleniyor) varsayilani doner. */
function msDen(v: unknown, varsayilan: number): number {
  return (v as { toMillis?: () => number })?.toMillis?.() ?? varsayilan
}

function belgeyeCevir(id: string, veri: Record<string, unknown>): ForumBasligi {
  return {
    id,
    baslik: String(veri.baslik ?? ''),
    icerik: String(veri.icerik ?? ''),
    kategori: (veri.kategori as ForumKategori) ?? 'genel',
    yazarId: String(veri.yazarId ?? ''),
    yazarAdi: String(veri.yazarAdi ?? 'Silinmiş kullanıcı'),
    tarih: msDen(veri.tarih, Date.now()),
    sonAktivite: msDen(veri.sonAktivite, Date.now()),
    cevapSayisi: Number(veri.cevapSayisi ?? 0),
  }
}

export function basliklariDinle(
  kategori: ForumKategori | 'hepsi',
  isle: (basliklar: ForumBasligi[]) => void,
): Unsubscribe {
  if (!db) return () => {}
  const temel = collection(db, KOLEKSIYON)
  const sorgu =
    kategori === 'hepsi'
      ? query(temel, orderBy('sonAktivite', 'desc'), limit(BASLIK_LIMITI))
      : query(
          temel,
          where('kategori', '==', kategori),
          orderBy('sonAktivite', 'desc'),
          limit(BASLIK_LIMITI),
        )
  return onSnapshot(sorgu, (anlik) => {
    isle(anlik.docs.map((d) => belgeyeCevir(d.id, d.data())))
  })
}

export async function basligOlustur(
  baslik: string,
  icerik: string,
  kategori: ForumKategori,
  yazarId: string,
  yazarAdi: string,
): Promise<string> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const b = baslik.trim()
  const i = icerik.trim()
  if (b.length < 6) throw new Error('Başlık en az 6 karakter olmalı.')
  if (i.length < 10) throw new Error('İçerik en az 10 karakter olmalı.')
  if (agirIcerikVarMi(b) || agirIcerikVarMi(i)) {
    throw new Error('Bu içerik topluluk kurallarına uymuyor gibi görünüyor. Lütfen düzenle.')
  }
  const simdi = serverTimestamp()
  const ref = await addDoc(collection(db, KOLEKSIYON), {
    baslik: b,
    icerik: i,
    kategori,
    yazarId,
    yazarAdi,
    tarih: simdi,
    sonAktivite: simdi,
    cevapSayisi: 0,
  })
  return ref.id
}

export async function basligiSil(basligId: string): Promise<void> {
  if (!db) return
  await deleteDoc(doc(db, KOLEKSIYON, basligId))
}

function cevabaCevir(id: string, veri: Record<string, unknown>): ForumCevap {
  return {
    id,
    icerik: String(veri.icerik ?? ''),
    yazarId: String(veri.yazarId ?? ''),
    yazarAdi: String(veri.yazarAdi ?? 'Silinmiş kullanıcı'),
    tarih: msDen(veri.tarih, Date.now()),
  }
}

export function cevaplariDinle(basligId: string, isle: (cevaplar: ForumCevap[]) => void): Unsubscribe {
  if (!db) return () => {}
  const sorgu = query(collection(db, KOLEKSIYON, basligId, 'cevaplar'), orderBy('tarih', 'asc'))
  return onSnapshot(sorgu, (anlik) => {
    isle(anlik.docs.map((d) => cevabaCevir(d.id, d.data())))
  })
}

export async function cevapEkle(
  basligId: string,
  icerik: string,
  yazarId: string,
  yazarAdi: string,
): Promise<void> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const i = icerik.trim()
  if (i.length < 2) throw new Error('Cevap boş olamaz.')
  if (agirIcerikVarMi(i)) {
    throw new Error('Bu içerik topluluk kurallarına uymuyor gibi görünüyor. Lütfen düzenle.')
  }
  const simdi = serverTimestamp()
  await Promise.all([
    addDoc(collection(db, KOLEKSIYON, basligId, 'cevaplar'), {
      icerik: i,
      yazarId,
      yazarAdi,
      tarih: simdi,
    }),
    updateDoc(doc(db, KOLEKSIYON, basligId), {
      cevapSayisi: increment(1),
      sonAktivite: simdi,
    }),
  ])
}

export async function cevabiSil(basligId: string, cevapId: string): Promise<void> {
  if (!db) return
  await Promise.all([
    deleteDoc(doc(db, KOLEKSIYON, basligId, 'cevaplar', cevapId)),
    updateDoc(doc(db, KOLEKSIYON, basligId), { cevapSayisi: increment(-1) }),
  ])
}
