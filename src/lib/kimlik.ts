/**
 * Kimlik dogrulama — forum, arkadaslik ve sohbet icin.
 * Kullanicilar tamamen anonimdir: e-posta (ve Google/Microsoft ile girince
 * gelen gercek ad/e-posta) yalnizca Firebase Authentication icinde tutulur ve
 * BASKA HICBIR YERDE gorunmez. Firestore'daki profil belgesi
 * (kullanicilar/{uid}) yalnizca kullanicinin kendi sectigi takma adi icerir —
 * Google/Microsoft'tan gelen gercek ad ASLA bu belgeye yazilmaz.
 */
import { useEffect, useState, useCallback, useRef } from 'react'
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  OAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseCikisYap,
  type User,
} from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { auth, db, forumYapilandirilmis } from './firebase'
import { agirIcerikVarMi } from './moderasyon'
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
    case 'auth/account-exists-with-different-credential':
      return 'Bu e-posta başka bir giriş yöntemiyle zaten kayıtlı.'
    default:
      return 'Bir şeyler ters gitti. Tekrar dene.'
  }
}

function takmaAdDogrula(ad: string): string | null {
  const t = ad.trim()
  if (t.length < 3) return 'Takma ad en az 3 karakter olmalı.'
  if (t.length > 24) return 'Takma ad en fazla 24 karakter olabilir.'
  if (!/^[\p{L}0-9 _.-]+$/u.test(t)) return 'Takma adda yalnızca harf, rakam, boşluk, . _ - kullanılabilir.'
  if (agirIcerikVarMi(t)) return 'Bu takma ad uygun değil. Başka bir tane seç.'
  return null
}

async function profilGetir(uid: string): Promise<KullaniciProfili | null> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const anlik = await getDoc(doc(db, 'kullanicilar', uid))
  return anlik.exists() ? (anlik.data() as KullaniciProfili) : null
}

async function profilOlustur(uid: string, takmaAd: string): Promise<KullaniciProfili> {
  if (!db) throw new Error('Forum yapılandırılmamış.')
  const hata = takmaAdDogrula(takmaAd)
  if (hata) throw new Error(hata)
  const profil: KullaniciProfili = { uid, takmaAd: takmaAd.trim(), olusturulma: Date.now() }
  await setDoc(doc(db, 'kullanicilar', uid), {
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
  /** Google/Microsoft ile ilk kez girildi, henuz takma ad secilmedi. */
  takmaAdGerekli: boolean
  yapilandirilmis: boolean
  kayitOl: (eposta: string, sifre: string, takmaAd: string) => Promise<void>
  girisYap: (eposta: string, sifre: string) => Promise<void>
  googleIleGirisYap: () => Promise<void>
  microsoftIleGirisYap: () => Promise<void>
  /** Google/Microsoft ile ilk girişten sonra takma adi tamamlar. */
  takmaAdBelirle: (takmaAd: string) => Promise<void>
  cikisYap: () => Promise<void>
  /** profilHatasi durumunda kullaniciya "tekrar dene" imkani verir. */
  profiliYenidenDene: () => void
}

export function useKimlik(): KimlikDurumu {
  const [yukleniyor, setYukleniyor] = useState(true)
  const [kullanici, setKullanici] = useState<User | null>(null)
  const [profil, setProfil] = useState<KullaniciProfili | null>(null)
  const [profilHatasi, setProfilHatasi] = useState(false)
  const [takmaAdGerekli, setTakmaAdGerekli] = useState(false)
  /**
   * kayitOl/takmaAdBelirle kendi yazdiklari profili doğrudan state'e
   * islerken, ayni anda calisan onAuthStateChanged dinleyicisi de HENUZ
   * yazilmamis eski veriyi okuyup (profil=null) uzerine yazabilir. Hangi
   * uid icin profili biz zaten dogrulukla bildigimizi burada tutup, o uid
   * icin gelen gecikmeli/yaris halindeki okumayi yoksayiyoruz.
   */
  const bilinenProfilUid = useRef<string | null>(null)

  useEffect(() => {
    if (!auth) {
      setYukleniyor(false)
      return
    }
    const cozul = onAuthStateChanged(auth, async (u) => {
      setKullanici(u)
      setProfilHatasi(false)
      if (u) {
        if (bilinenProfilUid.current === u.uid) {
          setYukleniyor(false)
          return
        }
        try {
          const p = await profilGetir(u.uid)
          setProfil(p)
          setTakmaAdGerekli(p === null)
        } catch (e) {
          console.error('Forum profili yüklenemedi:', e)
          setProfil(null)
          setProfilHatasi(true)
        }
      } else {
        setProfil(null)
        setTakmaAdGerekli(false)
        bilinenProfilUid.current = null
      }
      setYukleniyor(false)
    })
    return cozul
  }, [])

  const profiliYenidenDene = useCallback(() => {
    if (!kullanici) return
    setProfilHatasi(false)
    profilGetir(kullanici.uid)
      .then((p) => {
        bilinenProfilUid.current = kullanici.uid
        setProfil(p)
        setTakmaAdGerekli(p === null)
      })
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
      const sonuc = await createUserWithEmailAndPassword(auth, eposta.trim(), sifre)
      const profil = await profilOlustur(sonuc.user.uid, takmaAd)
      bilinenProfilUid.current = sonuc.user.uid
      setProfil(profil)
      setTakmaAdGerekli(false)
    } catch (e) {
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

  const oauthIleGirisYap = useCallback(async (saglayici: GoogleAuthProvider | OAuthProvider) => {
    if (!auth) throw new Error('Forum yapılandırılmamış.')
    try {
      await signInWithPopup(auth, saglayici)
    } catch (e) {
      const kod = (e as { code?: string })?.code
      if (kod === 'auth/popup-closed-by-user' || kod === 'auth/cancelled-popup-request') return
      throw new Error(kod ? hataMetni(kod) : 'Giriş yapılamadı.')
    }
  }, [])

  const googleIleGirisYap = useCallback(
    () => oauthIleGirisYap(new GoogleAuthProvider()),
    [oauthIleGirisYap],
  )

  const microsoftIleGirisYap = useCallback(
    () => oauthIleGirisYap(new OAuthProvider('microsoft.com')),
    [oauthIleGirisYap],
  )

  const takmaAdBelirle = useCallback(
    async (takmaAd: string) => {
      if (!kullanici) throw new Error('Giriş yapılmamış.')
      const profil = await profilOlustur(kullanici.uid, takmaAd)
      bilinenProfilUid.current = kullanici.uid
      setProfil(profil)
      setTakmaAdGerekli(false)
    },
    [kullanici],
  )

  const cikisYap = useCallback(async () => {
    if (!auth) return
    await firebaseCikisYap(auth)
  }, [])

  return {
    yukleniyor,
    kullanici,
    profil,
    profilHatasi,
    takmaAdGerekli,
    yapilandirilmis: forumYapilandirilmis,
    kayitOl,
    girisYap,
    googleIleGirisYap,
    microsoftIleGirisYap,
    takmaAdBelirle,
    cikisYap,
    profiliYenidenDene,
  }
}
