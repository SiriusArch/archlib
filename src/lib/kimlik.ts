/**
 * Kimlik dogrulama — forum, arkadaslik ve sohbet icin.
 * Kullanicilar tamamen anonimdir: e-posta yalnizca girisi/hesabi yonetmek icin
 * Firebase Authentication icinde tutulur ve BASKA HICBIR YERDE gorunmez.
 * Firestore'daki profil belgesi (kullanicilar/{uid}) yalnizca takma ad icerir.
 */
import { useEffect, useState, useCallback } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseCikisYap,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, forumYapilandirilmis } from './firebase'
import type { KullaniciProfili } from '../types'

function hataMetni(kod: string): string {
  switch (kod) {
    case 'auth/email-already-in-use':
      return 'Bu e-posta zaten kayıtlı. Giriş yapmayı dene.'
    case 'auth/invalid-email':
      return 'E-posta adresi geçersiz.'
    case 'auth/weak-password':
      return 'Şifre en az 6 karakter olmalı.'
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'E-posta ya da şifre hatalı.'
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Biraz bekleyip tekrar dene.'
    default:
      return 'Bir şeyler ters gitti. Tekrar dene.'
  }
}

function takmaAdDogrula(ad: string): string | null {
  const t = ad.trim()
  if (t.length < 3) return 'Takma ad en az 3 karakter olmalı.'
  if (t.length > 24) return 'Takma ad en fazla 24 karakter olabilir.'
  if (!/^[\p{L}0-9 _.-]+$/u.test(t)) return 'Takma adda yalnızca harf, rakam, boşluk, . _ - kullanılabilir.'
  return null
}

/**
 * kayitOl(), createUserWithEmailAndPassword sonrasi Firebase'in kendi
 * onAuthStateChanged olayini da tetikler; bu olay bazen kayitOl'un kendi
 * devamindan ONCE calisabilir (SDK'nin dahili sirasi garantili degil). Iki
 * ayri yerden ayni profil belgesini olusturmaya calismak yerine, secilen
 * takma adi burada gecici olarak tutup profili YALNIZCA tek bir yerden
 * (profilGetirYaOlustur, onAuthStateChanged icinden) olusturuyoruz.
 */
let bekleyenTakmaAd: string | null = null

async function profilGetirYaOlustur(kullanici: User): Promise<KullaniciProfili> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const ref = doc(db, 'kullanicilar', kullanici.uid)
  const mevcut = await getDoc(ref)
  if (mevcut.exists()) return mevcut.data() as KullaniciProfili

  const takmaAd = bekleyenTakmaAd
  bekleyenTakmaAd = null
  const profil: KullaniciProfili = {
    uid: kullanici.uid,
    takmaAd: takmaAd?.trim() || kullanici.displayName?.trim() || `Mimar${kullanici.uid.slice(0, 5)}`,
    olusturulma: Date.now(),
  }
  await setDoc(ref, {
    ...profil,
    takmaAdKucuk: profil.takmaAd.toLocaleLowerCase('tr-TR'),
    olusturulma: serverTimestamp(),
  })
  return profil
}

export interface KimlikDurumu {
  yukleniyor: boolean
  kullanici: User | null
  profil: KullaniciProfili | null
  /** Kullanici girisliyken profil belgesi (agdan/izinden) yuklenemediyse true. */
  profilHatasi: boolean
  yapilandirilmis: boolean
  kayitOl: (eposta: string, sifre: string, takmaAd: string) => Promise<void>
  girisYap: (eposta: string, sifre: string) => Promise<void>
  cikisYap: () => Promise<void>
  /** profilHatasi durumunda kullaniciya "tekrar dene" imkani verir. */
  profiliYenidenDene: () => void
}

export function useKimlik(): KimlikDurumu {
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [profil, setProfil] = useState<KullaniciProfili | null>(null)
  const [profilHatasi, setProfilHatasi] = useState(false)

  useEffect(() => {
    if (!auth) {
      setYukleniyor(false)
      return
    }
    const cozul = onAuthStateChanged(auth, async (u) => {
      setKullanici(u)
      setProfilHatasi(false)
      if (u) {
        try {
          setProfil(await profilGetirYaOlustur(u))
        } catch (e) {
          console.error('Forum profili yüklenemedi:', e)
          setProfil(null)
          setProfilHatasi(true)
        }
      } else {
        setProfil(null)
      }
      setYukleniyor(false)
    })
    return cozul
  }, [])

  const profiliYenidenDene = useCallback(() => {
    if (!kullanici) return
    setProfilHatasi(false)
    profilGetirYaOlustur(kullanici)
      .then(setProfil)
      .catch((e) => {
        console.error('Forum profili yeniden denemesi başarısız:', e)
        setProfilHatasi(true)
      })
  }, [kullanici])

  const kayitOl = useCallback(async (eposta: string, sifre: string, takmaAd: string) => {
    if (!auth) throw new Error('Forum yapılandırılmamış.')
    const hata = takmaAdDogrula(takmaAd)
    if (hata) throw new Error(hata)
    try {
      bekleyenTakmaAd = takmaAd
      const sonuc = await createUserWithEmailAndPassword(auth, eposta.trim(), sifre)
      await updateProfile(sonuc.user, { displayName: takmaAd.trim() })
      // Profil belgesi onAuthStateChanged icinden, bekleyenTakmaAd kullanilarak
      // olusturulur — bkz. yukaridaki not.
    } catch (e) {
      bekleyenTakmaAd = null
      const kod = (e as { code?: string })?.code
      throw new Error(kod ? hataMetni(kod) : 'Hesap oluşturulamadı.')
    }
  }, [])

  const girisYap = useCallback(async (eposta: string, sifre: string) => {
    if (!auth) throw new Error('Forum yapılandırılmamış.')
    try {
      await signInWithEmailAndPassword(auth, eposta.trim(), sifre)
    } catch (e) {
      const kod = (e as { code?: string })?.code
      throw new Error(kod ? hataMetni(kod) : 'Giriş yapılamadı.')
    }
  }, [])

  const cikisYap = useCallback(async () => {
    if (!auth) return
    await firebaseCikisYap(auth)
  }, [])

  return {
    yukleniyor,
    kullanici,
    profil,
    profilHatasi,
    yapilandirilmis: forumYapilandirilmis,
    kayitOl,
    girisYap,
    cikisYap,
    profiliYenidenDene,
  }
}
