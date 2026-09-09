/**
 * Cizim deposu: indirgeyici + geri/ileri gecmisi + tarayici saklamasi.
 *
 * Gecmis, durumun tamamini kopyalayarak tutuluyor. Bir kat plani icin veri
 * kucuk oldugundan bu en basit ve en guvenilir yol; 60 adimlik pencere
 * bellekte birkac yuz kilobayti gecmez.
 */

import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react'
import {
  bosKat,
  kimlik,
  yeniProje,
  type Aciklik,
  type Altlik,
  type Duvar,
  type Kat,
  type Kolon,
  type Mobilya,
  type Nokta,
  type OlcuCizgisi,
  type Proje,
  type Secim,
  type Varsayilanlar,
} from './tipler'
import { parcayaIzdusum, uzaklik, duvarUzunluk } from './geometri'

const ANAHTAR_LISTE = 'archlib.cizim.liste'
const ANAHTAR_AKTIF = 'archlib.cizim.aktif'
const ANAHTAR_PROJE = 'archlib.cizim.proje.'
const GECMIS_SINIR = 60
const UC_TOLERANS = 0.008

export interface ProjeOzeti {
  id: string
  ad: string
  guncelleme: number
  katSayisi: number
  duvarSayisi: number
}

export interface Durum {
  proje: Proje
  aktifKatId: string
  secim: Secim[]
}

export type Eylem =
  | { t: 'proje-yukle'; proje: Proje }
  | { t: 'proje-ad'; ad: string }
  | { t: 'kat-ekle'; yon: 'ust' | 'alt' }
  | { t: 'kat-kopyala'; id: string }
  | { t: 'kat-sil'; id: string }
  | { t: 'kat-sec'; id: string }
  | { t: 'kat-yama'; id: string; yama: Partial<Kat> }
  | { t: 'duvar-ekle'; duvarlar: Duvar[] }
  | { t: 'duvar-yama'; id: string; yama: Partial<Duvar> }
  | { t: 'duvar-uc'; id: string; uc: 'a' | 'b'; nokta: Nokta; zincir: boolean }
  | { t: 'aciklik-ekle'; aciklik: Aciklik }
  | { t: 'aciklik-yama'; id: string; yama: Partial<Aciklik> }
  | { t: 'mobilya-ekle'; mobilya: Mobilya }
  | { t: 'mobilya-yama'; id: string; yama: Partial<Mobilya> }
  | { t: 'kolon-ekle'; kolon: Kolon }
  | { t: 'kolon-yama'; id: string; yama: Partial<Kolon> }
  | { t: 'olcu-ekle'; olcu: OlcuCizgisi }
  | { t: 'olcu-yama'; id: string; yama: Partial<OlcuCizgisi> }
  | { t: 'sil'; secim: Secim[] }
  | { t: 'tasi'; secim: Secim[]; delta: Nokta }
  | { t: 'secim'; secim: Secim[] }
  | { t: 'altlik'; altlik: Altlik | null }
  | { t: 'varsayilan'; yama: Partial<Varsayilanlar> }
  /** Surukleme bitti: sonraki ayni turden eylem yeni bir gecmis adimi acar. */
  | { t: 'birlesim-kes' }

/** Gecmise yazilmayan, yalnizca gorunumu etkileyen eylemler. */
const GECICI: Eylem['t'][] = ['secim', 'kat-sec', 'birlesim-kes']

/**
 * Surukleme sirasinda saniyede onlarca kez gelen eylemler.
 * Ilki gecmise yazilir, ardi ardina gelen ayni turdekiler ona katilir;
 * boylece bir surukleme tek "geri al" adimi olur.
 */
const BIRLESEN: Eylem['t'][] = ['tasi', 'duvar-uc', 'aciklik-yama']

function katYama(p: Proje, katId: string, degis: (k: Kat) => Kat): Proje {
  return {
    ...p,
    guncelleme: Date.now(),
    katlar: p.katlar.map((k) => (k.id === katId ? degis(k) : k)),
  }
}

function indirge(d: Durum, e: Eylem): Durum {
  const kat = d.proje.katlar.find((k) => k.id === d.aktifKatId) ?? d.proje.katlar[0]

  switch (e.t) {
    case 'proje-yukle':
      return {
        proje: e.proje,
        aktifKatId: e.proje.katlar[0]?.id ?? '',
        secim: [],
      }

    case 'proje-ad':
      return { ...d, proje: { ...d.proje, ad: e.ad, guncelleme: Date.now() } }

    case 'kat-ekle': {
      const siraliKatlar = [...d.proje.katlar].sort((a, b) => a.kot - b.kot)
      const ust = e.yon === 'ust'
      const komsu = ust ? siraliKatlar[siraliKatlar.length - 1] : siraliKatlar[0]
      const kot = ust ? komsu.kot + komsu.yukseklik : komsu.kot - komsu.yukseklik
      const sayi = d.proje.katlar.length
      const ad = ust ? `${sayi}. kat` : `Bodrum ${Math.abs(Math.round(kot / 3))}`
      const yeni = bosKat(ad, Math.round(kot * 100) / 100, komsu.yukseklik)
      return {
        ...d,
        proje: { ...d.proje, katlar: [...d.proje.katlar, yeni], guncelleme: Date.now() },
        aktifKatId: yeni.id,
        secim: [],
      }
    }

    case 'kat-kopyala': {
      const kaynak = d.proje.katlar.find((k) => k.id === e.id)
      if (!kaynak) return d
      const enUst = d.proje.katlar.reduce((t, k) => Math.max(t, k.kot), -Infinity)
      const esle = new Map<string, string>()
      const duvarlar = kaynak.duvarlar.map((w) => {
        const yeniId = kimlik('d')
        esle.set(w.id, yeniId)
        return { ...w, id: yeniId, a: { ...w.a }, b: { ...w.b } }
      })
      const yeni: Kat = {
        ...kaynak,
        id: kimlik('k'),
        ad: `${kaynak.ad} kopya`,
        kot: Math.round((enUst + kaynak.yukseklik) * 100) / 100,
        duvarlar,
        aciklikar: kaynak.aciklikar.map((a) => ({
          ...a,
          id: kimlik('a'),
          duvarId: esle.get(a.duvarId) ?? a.duvarId,
        })),
        mobilyalar: kaynak.mobilyalar.map((m) => ({ ...m, id: kimlik('m'), konum: { ...m.konum } })),
        kolonlar: kaynak.kolonlar.map((k) => ({ ...k, id: kimlik('c'), konum: { ...k.konum } })),
        olculer: kaynak.olculer.map((o) => ({ ...o, id: kimlik('o') })),
      }
      return {
        ...d,
        proje: { ...d.proje, katlar: [...d.proje.katlar, yeni], guncelleme: Date.now() },
        aktifKatId: yeni.id,
        secim: [],
      }
    }

    case 'kat-sil': {
      if (d.proje.katlar.length <= 1) return d
      const kalan = d.proje.katlar.filter((k) => k.id !== e.id)
      return {
        ...d,
        proje: { ...d.proje, katlar: kalan, guncelleme: Date.now() },
        aktifKatId: d.aktifKatId === e.id ? kalan[0].id : d.aktifKatId,
        secim: [],
      }
    }

    case 'kat-sec':
      return { ...d, aktifKatId: e.id, secim: [] }

    case 'kat-yama':
      return { ...d, proje: katYama(d.proje, e.id, (k) => ({ ...k, ...e.yama })) }

    case 'duvar-ekle':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({ ...k, duvarlar: [...k.duvarlar, ...e.duvarlar] })),
        secim: e.duvarlar.map((w) => ({ tur: 'duvar' as const, id: w.id })),
      }

    case 'duvar-yama':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          duvarlar: k.duvarlar.map((w) => (w.id === e.id ? { ...w, ...e.yama } : w)),
        })),
      }

    case 'duvar-uc': {
      const hedef = kat.duvarlar.find((w) => w.id === e.id)
      if (!hedef) return d
      const eski = e.uc === 'a' ? hedef.a : hedef.b
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          duvarlar: k.duvarlar.map((w) => {
            if (w.id === e.id) return { ...w, [e.uc]: { ...e.nokta } }
            if (!e.zincir) return w
            // Ayni noktada bulusan komsu uclar birlikte tasinir.
            const yeniW = { ...w }
            let degisti = false
            if (uzaklik(w.a, eski) <= UC_TOLERANS) {
              yeniW.a = { ...e.nokta }
              degisti = true
            }
            if (uzaklik(w.b, eski) <= UC_TOLERANS) {
              yeniW.b = { ...e.nokta }
              degisti = true
            }
            return degisti ? yeniW : w
          }),
        })),
      }
    }

    case 'aciklik-ekle':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({ ...k, aciklikar: [...k.aciklikar, e.aciklik] })),
        secim: [{ tur: 'aciklik', id: e.aciklik.id }],
      }

    case 'aciklik-yama':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          aciklikar: k.aciklikar.map((a) => (a.id === e.id ? { ...a, ...e.yama } : a)),
        })),
      }

    case 'mobilya-ekle':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({ ...k, mobilyalar: [...k.mobilyalar, e.mobilya] })),
        secim: [{ tur: 'mobilya', id: e.mobilya.id }],
      }

    case 'mobilya-yama':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          mobilyalar: k.mobilyalar.map((m) => (m.id === e.id ? { ...m, ...e.yama } : m)),
        })),
      }

    case 'kolon-ekle':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({ ...k, kolonlar: [...k.kolonlar, e.kolon] })),
        secim: [{ tur: 'kolon', id: e.kolon.id }],
      }

    case 'kolon-yama':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          kolonlar: k.kolonlar.map((c) => (c.id === e.id ? { ...c, ...e.yama } : c)),
        })),
      }

    case 'olcu-ekle':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({ ...k, olculer: [...k.olculer, e.olcu] })),
        secim: [{ tur: 'olcu', id: e.olcu.id }],
      }

    case 'olcu-yama':
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          olculer: k.olculer.map((o) => (o.id === e.id ? { ...o, ...e.yama } : o)),
        })),
      }

    case 'sil': {
      const sil = (tur: string) => new Set(e.secim.filter((s) => s.tur === tur).map((s) => s.id))
      const duvarSil = sil('duvar')
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => ({
          ...k,
          duvarlar: k.duvarlar.filter((w) => !duvarSil.has(w.id)),
          // Duvari giden aciklik da gider
          aciklikar: k.aciklikar.filter(
            (a) => !sil('aciklik').has(a.id) && !duvarSil.has(a.duvarId),
          ),
          mobilyalar: k.mobilyalar.filter((m) => !sil('mobilya').has(m.id)),
          kolonlar: k.kolonlar.filter((c) => !sil('kolon').has(c.id)),
          olculer: k.olculer.filter((o) => !sil('olcu').has(o.id)),
        })),
        secim: [],
      }
    }

    case 'tasi': {
      const dx = e.delta.x
      const dy = e.delta.y
      const kume = (tur: string) => new Set(e.secim.filter((s) => s.tur === tur).map((s) => s.id))
      const duvarlar = kume('duvar')
      const mobilyalar = kume('mobilya')
      const kolonlar = kume('kolon')
      const olculer = kume('olcu')
      const aciklikar = kume('aciklik')
      return {
        ...d,
        proje: katYama(d.proje, kat.id, (k) => {
          const yeniDuvarlar = k.duvarlar.map((w) =>
            duvarlar.has(w.id)
              ? { ...w, a: { x: w.a.x + dx, y: w.a.y + dy }, b: { x: w.b.x + dx, y: w.b.y + dy } }
              : w,
          )
          return {
            ...k,
            duvarlar: yeniDuvarlar,
            aciklikar: k.aciklikar.map((a) => {
              if (!aciklikar.has(a.id)) return a
              const w = yeniDuvarlar.find((x) => x.id === a.duvarId)
              if (!w) return a
              const merkez = {
                x: w.a.x + ((w.b.x - w.a.x) * a.mesafe) / (duvarUzunluk(w) || 1),
                y: w.a.y + ((w.b.y - w.a.y) * a.mesafe) / (duvarUzunluk(w) || 1),
              }
              const iz = parcayaIzdusum({ x: merkez.x + dx, y: merkez.y + dy }, w.a, w.b)
              const boy = duvarUzunluk(w)
              return {
                ...a,
                mesafe: Math.min(boy - a.genislik / 2, Math.max(a.genislik / 2, iz.t * boy)),
              }
            }),
            mobilyalar: k.mobilyalar.map((m) =>
              mobilyalar.has(m.id) ? { ...m, konum: { x: m.konum.x + dx, y: m.konum.y + dy } } : m,
            ),
            kolonlar: k.kolonlar.map((c) =>
              kolonlar.has(c.id) ? { ...c, konum: { x: c.konum.x + dx, y: c.konum.y + dy } } : c,
            ),
            olculer: k.olculer.map((o) =>
              olculer.has(o.id)
                ? { ...o, a: { x: o.a.x + dx, y: o.a.y + dy }, b: { x: o.b.x + dx, y: o.b.y + dy } }
                : o,
            ),
          }
        }),
      }
    }

    case 'secim':
      return { ...d, secim: e.secim }

    case 'birlesim-kes':
      // Durumu degistirmez; yalnizca gecmis birlestirmesini keser.
      return { ...d }

    case 'altlik':
      return { ...d, proje: katYama(d.proje, kat.id, (k) => ({ ...k, altlik: e.altlik })) }

    case 'varsayilan':
      return {
        ...d,
        proje: {
          ...d.proje,
          varsayilan: { ...d.proje.varsayilan, ...e.yama },
          guncelleme: Date.now(),
        },
      }

    default:
      return d
  }
}

interface GecmisliDurum {
  simdi: Durum
  geri: Durum[]
  ileri: Durum[]
  /** En son islenen eylem turu; birlestirme karari icin */
  son: string
}

function gecmisliIndirge(g: GecmisliDurum, e: Eylem | { t: '__geri' } | { t: '__ileri' }): GecmisliDurum {
  if (e.t === '__geri') {
    if (!g.geri.length) return g
    const onceki = g.geri[g.geri.length - 1]
    return {
      simdi: onceki,
      geri: g.geri.slice(0, -1),
      ileri: [g.simdi, ...g.ileri].slice(0, GECMIS_SINIR),
      son: '__geri',
    }
  }
  if (e.t === '__ileri') {
    if (!g.ileri.length) return g
    return {
      simdi: g.ileri[0],
      geri: [...g.geri, g.simdi].slice(-GECMIS_SINIR),
      ileri: g.ileri.slice(1),
      son: '__ileri',
    }
  }

  const tur = (e as Eylem).t
  const yeni = indirge(g.simdi, e as Eylem)
  if (yeni === g.simdi) return { ...g, son: tur }
  if (GECICI.includes(tur)) return { ...g, simdi: yeni, son: tur }
  // Ayni surukleme icinde: durumu ilerlet ama yeni gecmis adimi acma.
  if (BIRLESEN.includes(tur) && g.son === tur) return { ...g, simdi: yeni, son: tur }
  return {
    simdi: yeni,
    geri: [...g.geri, g.simdi].slice(-GECMIS_SINIR),
    ileri: [],
    son: tur,
  }
}

// ---------------------------------------------------------------- saklama

export function projeListesi(): ProjeOzeti[] {
  try {
    const ham = localStorage.getItem(ANAHTAR_LISTE)
    return ham ? (JSON.parse(ham) as ProjeOzeti[]) : []
  } catch {
    return []
  }
}

export function projeOku(id: string): Proje | null {
  try {
    const ham = localStorage.getItem(ANAHTAR_PROJE + id)
    return ham ? (JSON.parse(ham) as Proje) : null
  } catch {
    return null
  }
}

export function projeYaz(p: Proje): void {
  try {
    localStorage.setItem(ANAHTAR_PROJE + p.id, JSON.stringify(p))
    localStorage.setItem(ANAHTAR_AKTIF, p.id)
    const ozet: ProjeOzeti = {
      id: p.id,
      ad: p.ad,
      guncelleme: p.guncelleme,
      katSayisi: p.katlar.length,
      duvarSayisi: p.katlar.reduce((t, k) => t + k.duvarlar.length, 0),
    }
    const liste = projeListesi().filter((o) => o.id !== p.id)
    localStorage.setItem(ANAHTAR_LISTE, JSON.stringify([ozet, ...liste].slice(0, 30)))
  } catch {
    /* kota dolu olabilir; cizim bellekte calismaya devam eder */
  }
}

export function projeSil(id: string): void {
  try {
    localStorage.removeItem(ANAHTAR_PROJE + id)
    localStorage.setItem(ANAHTAR_LISTE, JSON.stringify(projeListesi().filter((o) => o.id !== id)))
  } catch {
    /* yoksay */
  }
}

function baslangic(): GecmisliDurum {
  let proje: Proje | null = null
  try {
    const aktif = localStorage.getItem(ANAHTAR_AKTIF)
    if (aktif) proje = projeOku(aktif)
  } catch {
    proje = null
  }
  const p = proje ?? yeniProje('Ilk plan')
  return {
    simdi: { proje: p, aktifKatId: p.katlar[0].id, secim: [] },
    geri: [],
    ileri: [],
    son: '',
  }
}

// ------------------------------------------------------------------- kanca

export function useCizimDeposu() {
  const [g, ham] = useReducer(gecmisliIndirge, undefined, baslangic)

  const gonder = useCallback((e: Eylem) => ham(e), [])
  const geriAl = useCallback(() => ham({ t: '__geri' }), [])
  const ileriAl = useCallback(() => ham({ t: '__ileri' }), [])

  const durum = g.simdi
  const aktifKat = useMemo(
    () => durum.proje.katlar.find((k) => k.id === durum.aktifKatId) ?? durum.proje.katlar[0],
    [durum.proje.katlar, durum.aktifKatId],
  )

  // Yazma islemini geciktir: her fare hareketinde localStorage'a gitmesin.
  const zamanlayici = useRef(0)
  useEffect(() => {
    window.clearTimeout(zamanlayici.current)
    zamanlayici.current = window.setTimeout(() => projeYaz(durum.proje), 600)
    return () => window.clearTimeout(zamanlayici.current)
  }, [durum.proje])

  return {
    durum,
    aktifKat,
    gonder,
    geriAl,
    ileriAl,
    geriVar: g.geri.length > 0,
    ileriVar: g.ileri.length > 0,
  }
}

export type Depo = ReturnType<typeof useCizimDeposu>
