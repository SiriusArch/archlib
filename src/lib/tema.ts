/**
 * Acik / koyu tema.
 *
 * Kullanici hic dokunmadiysa sistem tercihi (prefers-color-scheme) gecerlidir
 * — index.css'teki medya sorgusu bunu zaten karsiliyor, burada localStorage'a
 * hicbir sey yazilmaz. Kullanici anahtari tikladigi an tercih localStorage'a
 * kaydedilir ve <html data-theme="..."> ile kilitlenir; bundan sonra sistem
 * degisse de kullanicinin secimi gecerli kalir.
 */

import { useCallback, useEffect, useState } from 'react'

export type Tema = 'acik' | 'koyu'

const ANAHTAR = 'archlib.tema'

function sistemKoyuMu(): boolean {
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch {
    return false
  }
}

/** Kullanicinin acikca sectigi tema; hic secmediyse null. */
export function temaTercihiOku(): Tema | null {
  try {
    const deger = localStorage.getItem(ANAHTAR)
    return deger === 'acik' || deger === 'koyu' ? deger : null
  } catch {
    return null
  }
}

function uygula(tema: Tema | null): void {
  const kok = document.documentElement
  if (tema) kok.setAttribute('data-theme', tema === 'koyu' ? 'dark' : 'light')
  else kok.removeAttribute('data-theme')
}

/** Sayfa ilk boyanmadan once calisip yanip sonme (FOUC) onler. main.tsx'te cagir. */
export function temaBaslangicUygula(): void {
  uygula(temaTercihiOku())
}

export function useTema() {
  const [tercih, setTercih] = useState<Tema | null>(() => temaTercihiOku())
  const [etkinTema, setEtkinTema] = useState<Tema>(() => tercih ?? (sistemKoyuMu() ? 'koyu' : 'acik'))

  useEffect(() => {
    uygula(tercih)
    setEtkinTema(tercih ?? (sistemKoyuMu() ? 'koyu' : 'acik'))
  }, [tercih])

  // Kullanici hicbir secim yapmadiysa sistem teması degisince arayuz de degissin.
  useEffect(() => {
    if (tercih) return
    let sorgu: MediaQueryList
    try {
      sorgu = window.matchMedia('(prefers-color-scheme: dark)')
    } catch {
      return
    }
    const dinle = () => setEtkinTema(sorgu.matches ? 'koyu' : 'acik')
    sorgu.addEventListener('change', dinle)
    return () => sorgu.removeEventListener('change', dinle)
  }, [tercih])

  const degistir = useCallback(() => {
    setTercih((eski) => {
      const simdiki = eski ?? (sistemKoyuMu() ? 'koyu' : 'acik')
      const yeni: Tema = simdiki === 'koyu' ? 'acik' : 'koyu'
      try {
        localStorage.setItem(ANAHTAR, yeni)
      } catch {
        /* depolama kapali olabilir; tema yine de bu oturumda degisir */
      }
      return yeni
    })
  }, [])

  return { tema: etkinTema, tercihEdildi: tercih !== null, degistir }
}
