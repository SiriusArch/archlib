/**
 * Firebase baglantisi — forum, arkadaslik ve sohbet icin tek gercek backend
 * bagimliligimiz. Diger her sey (kritik masasi, cizim, arazi vb.) sunucusuz
 * kalmaya devam ediyor; bu dosya yalnizca sosyal ozellikler tarafindan kullanilir.
 *
 * Ayarlar .env.local dosyasindan (VITE_FIREBASE_*) okunur; repoya commitlenmez.
 * Bkz. README.md "Forum kurulumu" bolumu.
 */
import { initializeApp, type FirebaseOptions } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const yapilandirma: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/** .env.local doldurulmadiysa forum ozelligini sessizce kapatmak icin. */
export const forumYapilandirilmis = Boolean(yapilandirma.apiKey && yapilandirma.projectId)

const app = forumYapilandirilmis ? initializeApp(yapilandirma) : null

export const auth = app ? getAuth(app) : null
export const db = app ? getFirestore(app) : null
