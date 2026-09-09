/**
 * 2B cizim tuvali.
 *
 * Cizim Canvas2D ile, etkilesim durumu React disinda referanslarda tutuluyor:
 * fare her hareket ettiginde React agacini yeniden olusturmak yerine dogrudan
 * yeniden ciziyoruz. Modele islenecek kalici degisiklikler ise eylem olarak
 * depoya gonderiliyor; boylece geri al / ileri al dogru calisiyor.
 *
 * Duvar birlesimleri "once dis hat, sonra ic dolgu" iki gecisle ciziliyor;
 * dugum noktalarina kalinlik kadar yama konuyor. Sonuc, ic dikislerin
 * gorunmedigi temiz bir CAD kabugu.
 */

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ARACLAR,
  kimlik,
  type Aciklik,
  type Arac,
  type Duvar,
  type Kat,
  type Nokta,
  type Secim,
  type Varsayilanlar,
} from './tipler'
import {
  birim,
  cikar,
  dik,
  duvarKabugu,
  duvarNoktasi,
  duvarUzunluk,
  odalariBul,
  parcayaIzdusum,
  sinirKutusu,
  uzaklik,
  yakala,
  type Oda,
} from './geometri'
import { aciklikBul, donatiBul } from './katalog'
import type { Eylem } from './depo'

// ------------------------------------------------------------------ renkler

const R = {
  kagit: '#fcfbf8',
  izgaraInce: '#eceae2',
  izgaraKalin: '#e0ddd2',
  eksen: '#d6d2c5',
  duvarDis: '#30332d',
  duvarIc: '#ddd9cd',
  bolmeIc: '#e8e5da',
  camIc: '#cfdde4',
  oda: 'rgba(114, 125, 99, 0.07)',
  odaYazi: '#5f6259',
  aciklik: '#fcfbf8',
  dograma: '#4c697c',
  kapiYay: '#9aa091',
  mobilya: '#8b8a80',
  secim: '#b9573e',
  vurgu: '#5c7c92',
  olcu: '#a97b4c',
  altKat: '#d9d6cb',
  yakalama: '#b9573e',
}

const TUTAMAK = 4.5

export interface TuvalApi {
  sigdir(): void
  yakinlastir(carpan: number): void
  gorunumSifirla(): void
}

interface Props {
  kat: Kat
  altKat: Kat | null
  odalar: Oda[]
  varsayilan: Varsayilanlar
  secim: Secim[]
  arac: Arac
  kapiKatalog: string
  pencereKatalog: string
  donatiKatalog: string
  izgaraGorunur: boolean
  altKatGorunur: boolean
  odaEtiketi: boolean
  gonder: (e: Eylem) => void
  aracDegistir: (a: Arac) => void
  apiRef?: { current: TuvalApi | null }
}

interface Gorunum {
  ox: number
  oy: number
  k: number
}

type Surukleme =
  | { tur: 'yok' }
  | { tur: 'kaydir'; bx: number; by: number; ox: number; oy: number }
  | { tur: 'tasi'; baslangic: Nokta; son: Nokta; secim: Secim[] }
  | { tur: 'duvarUcu'; id: string; uc: 'a' | 'b'; zincir: boolean }
  | { tur: 'aciklikKaydir'; id: string }
  | { tur: 'secKutu'; bas: Nokta; son: Nokta }

export default function Tuval2B(props: Props) {
  const kutuRef = useRef<HTMLDivElement>(null)
  const tuvalRef = useRef<HTMLCanvasElement>(null)
  const pRef = useRef(props)
  pRef.current = props

  const gorunumRef = useRef<Gorunum>({ ox: 0, oy: 0, k: 42 })
  const imlecRef = useRef<Nokta | null>(null)
  const yakalananRef = useRef<ReturnType<typeof yakala> | null>(null)
  const zincirRef = useRef<Nokta[]>([])
  const olcuBasRef = useRef<Nokta | null>(null)
  const dikdortgenRef = useRef<Nokta | null>(null)
  const yerlestirmeAciRef = useRef(0)
  const surukleRef = useRef<Surukleme>({ tur: 'yok' })
  const uzerindeRef = useRef<Secim | null>(null)
  const kareRef = useRef(0)
  const ilkOlcekRef = useRef(false)

  const [bilgi, setBilgi] = useState({ x: 0, y: 0, boy: 0, aci: 0, yakalama: '' })
  const [zum, setZum] = useState(42)

  // --------------------------------------------------------------- donusum
  const d2e = useCallback((p: Nokta): Nokta => {
    const g = gorunumRef.current
    return { x: p.x * g.k + g.ox, y: -p.y * g.k + g.oy }
  }, [])

  const e2d = useCallback((x: number, y: number): Nokta => {
    const g = gorunumRef.current
    return { x: (x - g.ox) / g.k, y: -(y - g.oy) / g.k }
  }, [])

  const cizIstek = useCallback(() => {
    if (kareRef.current) return
    kareRef.current = requestAnimationFrame(() => {
      kareRef.current = 0
      ciz()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ------------------------------------------------------------------ ciz
  const ciz = useCallback(() => {
    const tuval = tuvalRef.current
    const kutu = kutuRef.current
    if (!tuval || !kutu) return
    const ctx = tuval.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const G = kutu.clientWidth
    const Y = kutu.clientHeight
    if (tuval.width !== Math.round(G * dpr) || tuval.height !== Math.round(Y * dpr)) {
      tuval.width = Math.round(G * dpr)
      tuval.height = Math.round(Y * dpr)
      tuval.style.width = `${G}px`
      tuval.style.height = `${Y}px`
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, G, Y)
    ctx.fillStyle = R.kagit
    ctx.fillRect(0, 0, G, Y)

    const p = pRef.current
    const g = gorunumRef.current
    const secKume = new Set(p.secim.map((s) => `${s.tur}:${s.id}`))

    // ---------------------------------------------------------- izgara
    if (p.izgaraGorunur) cizIzgara(ctx, G, Y, g)

    // ---------------------------------------------------------- altlik
    if (p.kat.altlik) cizAltlik(ctx, p.kat.altlik, d2e, g.k)

    // ------------------------------------------------------- alt kat izi
    if (p.altKatGorunur && p.altKat) {
      ctx.save()
      ctx.strokeStyle = R.altKat
      ctx.lineWidth = 1
      ctx.setLineDash([5, 4])
      for (const w of p.altKat.duvarlar) {
        const a = d2e(w.a)
        const b = d2e(w.b)
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
      ctx.restore()
    }

    // ----------------------------------------------------------- odalar
    for (const oda of p.odalar) {
      ctx.beginPath()
      oda.poligon.forEach((n, i) => {
        const s = d2e(n)
        if (i === 0) ctx.moveTo(s.x, s.y)
        else ctx.lineTo(s.x, s.y)
      })
      ctx.closePath()
      ctx.fillStyle = R.oda
      ctx.fill()
    }

    // ---------------------------------------------------------- duvarlar
    cizDuvarlar(ctx, p.kat.duvarlar, d2e, g.k)
    cizAciklikar(ctx, p.kat, d2e, g.k)

    // ---------------------------------------------------------- kolonlar
    for (const c of p.kat.kolonlar) {
      const s = d2e(c.konum)
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate((-c.aci * Math.PI) / 180)
      ctx.fillStyle = R.duvarDis
      ctx.fillRect((-c.genislik / 2) * g.k, (-c.derinlik / 2) * g.k, c.genislik * g.k, c.derinlik * g.k)
      ctx.restore()
    }

    // --------------------------------------------------------- mobilyalar
    for (const m of p.kat.mobilyalar) cizMobilya(ctx, m, d2e, g.k, secKume.has(`mobilya:${m.id}`))

    // ------------------------------------------------------------ olculer
    for (const o of p.kat.olculer) cizOlcu(ctx, o, d2e)

    // ------------------------------------------------------- oda etiketi
    if (p.odaEtiketi) {
      for (const oda of p.odalar) {
        if (oda.alan < 0.8) continue
        const s = d2e(oda.merkez)
        ctx.save()
        ctx.textAlign = 'center'
        ctx.fillStyle = R.odaYazi
        ctx.font = '500 12px "DM Sans", system-ui, sans-serif'
        ctx.fillText(`${oda.alan.toFixed(1)} m²`, s.x, s.y + 4)
        ctx.restore()
      }
    }

    // -------------------------------------------------------------- secim
    cizSecim(ctx, p, d2e, g.k, secKume)

    // -------------------------------------------------- surekli etkilesim
    const im = imlecRef.current
    const yk = yakalananRef.current
    const zincir = zincirRef.current

    if (zincir.length && im) {
      const noktalar = [...zincir, yk?.nokta ?? im]
      ctx.save()
      ctx.strokeStyle = R.secim
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.beginPath()
      noktalar.forEach((n, i) => {
        const s = d2e(n)
        if (i === 0) ctx.moveTo(s.x, s.y)
        else ctx.lineTo(s.x, s.y)
      })
      ctx.stroke()
      ctx.restore()
      const son = noktalar[noktalar.length - 2]
      const uc = noktalar[noktalar.length - 1]
      cizOlcuBalonu(ctx, d2e(son), d2e(uc), `${uzaklik(son, uc).toFixed(2)} m`)
    }

    if (dikdortgenRef.current && im) {
      const a = dikdortgenRef.current
      const b = yk?.nokta ?? im
      const s1 = d2e(a)
      const s2 = d2e(b)
      ctx.save()
      ctx.strokeStyle = R.secim
      ctx.lineWidth = 1.5
      ctx.setLineDash([6, 4])
      ctx.strokeRect(Math.min(s1.x, s2.x), Math.min(s1.y, s2.y), Math.abs(s2.x - s1.x), Math.abs(s2.y - s1.y))
      ctx.restore()
      cizOlcuBalonu(
        ctx,
        { x: s1.x, y: s2.y },
        s2,
        `${Math.abs(b.x - a.x).toFixed(2)} × ${Math.abs(b.y - a.y).toFixed(2)} m`,
      )
    }

    if (olcuBasRef.current && im) {
      const a = olcuBasRef.current
      const b = yk?.nokta ?? im
      const s1 = d2e(a)
      const s2 = d2e(b)
      ctx.save()
      ctx.strokeStyle = R.olcu
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(s1.x, s1.y)
      ctx.lineTo(s2.x, s2.y)
      ctx.stroke()
      ctx.restore()
      cizOlcuBalonu(ctx, s1, s2, `${uzaklik(a, b).toFixed(2)} m`)
    }

    if (surukleRef.current.tur === 'secKutu') {
      const s = surukleRef.current
      const a = d2e(s.bas)
      const b = d2e(s.son)
      ctx.save()
      ctx.fillStyle = 'rgba(92,124,146,0.10)'
      ctx.strokeStyle = R.vurgu
      ctx.lineWidth = 1
      ctx.setLineDash([4, 3])
      const x = Math.min(a.x, b.x)
      const y = Math.min(a.y, b.y)
      ctx.fillRect(x, y, Math.abs(b.x - a.x), Math.abs(b.y - a.y))
      ctx.strokeRect(x, y, Math.abs(b.x - a.x), Math.abs(b.y - a.y))
      ctx.restore()
    }

    // ------------------------------------------------- yerlestirme onizleme
    if (im && (p.arac === 'mobilya' || p.arac === 'kolon')) {
      cizYerlestirmeHayaleti(ctx, p, yk?.nokta ?? im, yerlestirmeAciRef.current, d2e, g.k)
    }
    if (im && (p.arac === 'kapi' || p.arac === 'pencere') && yk?.duvar) {
      const tanim = aciklikBul(
        p.arac,
        p.arac === 'kapi' ? p.kapiKatalog : p.pencereKatalog,
      )
      const w = yk.duvar
      const boy = duvarUzunluk(w)
      const mesafe = Math.min(boy - tanim.genislik / 2, Math.max(tanim.genislik / 2, yk.mesafe ?? 0))
      cizAciklikSekli(
        ctx,
        { ...w },
        {
          id: 'onizleme',
          duvarId: w.id,
          tur: p.arac,
          katalog: tanim.id,
          mesafe,
          genislik: tanim.genislik,
          yukseklik: tanim.yukseklik,
          esik: tanim.esik,
          ters: false,
        },
        d2e,
        g.k,
        true,
      )
    }

    // ----------------------------------------------------- yakalama isareti
    if (yk && yk.tur !== 'serbest' && p.arac !== 'sec') {
      const s = d2e(yk.nokta)
      ctx.save()
      ctx.strokeStyle = R.yakalama
      ctx.lineWidth = 1.4
      if (yk.tur === 'uc') {
        ctx.strokeRect(s.x - 5, s.y - 5, 10, 10)
      } else if (yk.tur === 'duvar') {
        ctx.beginPath()
        ctx.moveTo(s.x - 5, s.y + 4)
        ctx.lineTo(s.x, s.y - 5)
        ctx.lineTo(s.x + 5, s.y + 4)
        ctx.closePath()
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(s.x - 5, s.y)
        ctx.lineTo(s.x + 5, s.y)
        ctx.moveTo(s.x, s.y - 5)
        ctx.lineTo(s.x, s.y + 5)
        ctx.stroke()
      }
      ctx.restore()
    }

    cizOlcek(ctx, G, Y, g.k)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [d2e])

  // ------------------------------------------------------------- olcekleme
  const sigdir = useCallback(() => {
    const kutu = kutuRef.current
    if (!kutu) return
    const p = pRef.current
    const noktalar: Nokta[] = []
    for (const w of p.kat.duvarlar) noktalar.push(w.a, w.b)
    for (const m of p.kat.mobilyalar) noktalar.push(m.konum)
    for (const c of p.kat.kolonlar) noktalar.push(c.konum)
    const kutuSinir = sinirKutusu(noktalar)
    const gen = Math.max(2, kutuSinir.max.x - kutuSinir.min.x)
    const yuk = Math.max(2, kutuSinir.max.y - kutuSinir.min.y)
    const k = Math.min((kutu.clientWidth - 120) / gen, (kutu.clientHeight - 120) / yuk)
    const olcek = Math.max(6, Math.min(260, k))
    const mx = (kutuSinir.min.x + kutuSinir.max.x) / 2
    const my = (kutuSinir.min.y + kutuSinir.max.y) / 2
    gorunumRef.current = {
      k: olcek,
      ox: kutu.clientWidth / 2 - mx * olcek,
      oy: kutu.clientHeight / 2 + my * olcek,
    }
    setZum(olcek)
    cizIstek()
  }, [cizIstek])

  const yakinlastir = useCallback(
    (carpan: number, merkez?: { x: number; y: number }) => {
      const kutu = kutuRef.current
      if (!kutu) return
      const g = gorunumRef.current
      const yeni = Math.max(4, Math.min(400, g.k * carpan))
      const mx = merkez?.x ?? kutu.clientWidth / 2
      const my = merkez?.y ?? kutu.clientHeight / 2
      const once = e2d(mx, my)
      gorunumRef.current = { ...g, k: yeni }
      const sonra = e2d(mx, my)
      gorunumRef.current = {
        k: yeni,
        ox: g.ox + (sonra.x - once.x) * yeni,
        oy: g.oy - (sonra.y - once.y) * yeni,
      }
      setZum(yeni)
      cizIstek()
    },
    [cizIstek, e2d],
  )

  useEffect(() => {
    if (props.apiRef) {
      props.apiRef.current = {
        sigdir,
        yakinlastir: (c: number) => yakinlastir(c),
        gorunumSifirla: () => {
          const kutu = kutuRef.current
          if (!kutu) return
          gorunumRef.current = { k: 42, ox: kutu.clientWidth / 2, oy: kutu.clientHeight / 2 }
          setZum(42)
          cizIstek()
        },
      }
    }
  }, [props.apiRef, sigdir, yakinlastir, cizIstek])

  // --------------------------------------------------------- olcu / ilk kur
  useEffect(() => {
    const kutu = kutuRef.current
    if (!kutu) return
    const goz = new ResizeObserver(() => {
      if (!ilkOlcekRef.current) {
        ilkOlcekRef.current = true
        const g = gorunumRef.current
        gorunumRef.current = { ...g, ox: kutu.clientWidth / 2, oy: kutu.clientHeight / 2 }
        if (pRef.current.kat.duvarlar.length) sigdir()
      }
      cizIstek()
    })
    goz.observe(kutu)
    return () => goz.disconnect()
  }, [cizIstek, sigdir])

  useEffect(() => {
    cizIstek()
  })

  useEffect(() => {
    const tazele = () => cizIstek()
    window.addEventListener(GORSEL_OLAYI, tazele)
    return () => window.removeEventListener(GORSEL_OLAYI, tazele)
  }, [cizIstek])

  // ------------------------------------------------------------- etkilesim
  const yakalamaHesapla = useCallback(
    (dunya: Nokta, shift: boolean) => {
      const p = pRef.current
      const g = gorunumRef.current
      const aciklikModu = p.arac === 'kapi' || p.arac === 'pencere'
      return yakala(dunya, {
        izgara: p.varsayilan.izgaraAdim,
        yaricap: 11 / g.k,
        duvarlar: p.kat.duvarlar,
        cikis: zincirRef.current.length
          ? zincirRef.current[zincirRef.current.length - 1]
          : (dikdortgenRef.current ?? olcuBasRef.current),
        aciAdim: p.varsayilan.aciAdim,
        serbestAci: shift,
        yalnizDuvar: aciklikModu,
      })
    },
    [],
  )

  const elemanBul = useCallback(
    (dunya: Nokta): Secim | null => {
      const p = pRef.current
      const g = gorunumRef.current
      const tol = 8 / g.k

      for (let i = p.kat.mobilyalar.length - 1; i >= 0; i--) {
        const m = p.kat.mobilyalar[i]
        const r = (-m.aci * Math.PI) / 180
        const dx = dunya.x - m.konum.x
        const dy = dunya.y - m.konum.y
        const lx = dx * Math.cos(-r) - dy * Math.sin(-r)
        const ly = dx * Math.sin(-r) + dy * Math.cos(-r)
        if (Math.abs(lx) <= m.genislik / 2 && Math.abs(ly) <= m.derinlik / 2) {
          return { tur: 'mobilya', id: m.id }
        }
      }
      for (let i = p.kat.kolonlar.length - 1; i >= 0; i--) {
        const c = p.kat.kolonlar[i]
        if (
          Math.abs(dunya.x - c.konum.x) <= c.genislik / 2 &&
          Math.abs(dunya.y - c.konum.y) <= c.derinlik / 2
        ) {
          return { tur: 'kolon', id: c.id }
        }
      }
      for (const o of p.kat.olculer) {
        if (parcayaIzdusum(dunya, o.a, o.b).uzaklik <= tol) return { tur: 'olcu', id: o.id }
      }
      for (const a of p.kat.aciklikar) {
        const w = p.kat.duvarlar.find((x) => x.id === a.duvarId)
        if (!w) continue
        const merkez = duvarNoktasi(w, a.mesafe)
        if (uzaklik(dunya, merkez) <= Math.max(a.genislik / 2, tol)) {
          return { tur: 'aciklik', id: a.id }
        }
      }
      for (let i = p.kat.duvarlar.length - 1; i >= 0; i--) {
        const w = p.kat.duvarlar[i]
        if (parcayaIzdusum(dunya, w.a, w.b).uzaklik <= Math.max(w.kalinlik / 2, tol)) {
          return { tur: 'duvar', id: w.id }
        }
      }
      return null
    },
    [],
  )

  const duvarUcuBul = useCallback(
    (dunya: Nokta): { id: string; uc: 'a' | 'b' } | null => {
      const p = pRef.current
      const tol = (TUTAMAK + 4) / gorunumRef.current.k
      for (const s of p.secim) {
        if (s.tur !== 'duvar') continue
        const w = p.kat.duvarlar.find((x) => x.id === s.id)
        if (!w) continue
        if (uzaklik(dunya, w.a) <= tol) return { id: w.id, uc: 'a' }
        if (uzaklik(dunya, w.b) <= tol) return { id: w.id, uc: 'b' }
      }
      return null
    },
    [],
  )

  function duvarYap(a: Nokta, b: Nokta, v: Varsayilanlar): Duvar {
    return {
      id: kimlik('d'),
      a: { ...a },
      b: { ...b },
      kalinlik: v.duvarKalinlik,
      yukseklik: 0,
      tur: 'tasiyici',
    }
  }

  const onPointerDown = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      const kutu = kutuRef.current
      if (!kutu) return
      const kutuSinir = kutu.getBoundingClientRect()
      const ex = ev.clientX - kutuSinir.left
      const ey = ev.clientY - kutuSinir.top
      const dunya = e2d(ex, ey)
      const p = pRef.current
      ;(ev.target as Element).setPointerCapture?.(ev.pointerId)

      // Orta tus veya sag tus: kaydirma
      if (ev.button === 1 || ev.button === 2 || ev.shiftKey === false && ev.button === 0 && ev.altKey) {
        surukleRef.current = { tur: 'kaydir', bx: ex, by: ey, ox: gorunumRef.current.ox, oy: gorunumRef.current.oy }
        return
      }
      if (ev.button !== 0) return

      const yk = yakalamaHesapla(dunya, ev.shiftKey)
      yakalananRef.current = yk

      switch (p.arac) {
        case 'duvar': {
          const zincir = zincirRef.current
          if (zincir.length) {
            const onceki = zincir[zincir.length - 1]
            if (uzaklik(onceki, yk.nokta) > 0.02) {
              p.gonder({ t: 'duvar-ekle', duvarlar: [duvarYap(onceki, yk.nokta, p.varsayilan)] })
              zincirRef.current = [...zincir, yk.nokta]
            }
          } else {
            zincirRef.current = [yk.nokta]
          }
          cizIstek()
          return
        }

        case 'dikdortgen': {
          if (!dikdortgenRef.current) {
            dikdortgenRef.current = yk.nokta
          } else {
            const a = dikdortgenRef.current
            const b = yk.nokta
            if (Math.abs(b.x - a.x) > 0.05 && Math.abs(b.y - a.y) > 0.05) {
              const k1 = { x: a.x, y: a.y }
              const k2 = { x: b.x, y: a.y }
              const k3 = { x: b.x, y: b.y }
              const k4 = { x: a.x, y: b.y }
              p.gonder({
                t: 'duvar-ekle',
                duvarlar: [
                  duvarYap(k1, k2, p.varsayilan),
                  duvarYap(k2, k3, p.varsayilan),
                  duvarYap(k3, k4, p.varsayilan),
                  duvarYap(k4, k1, p.varsayilan),
                ],
              })
            }
            dikdortgenRef.current = null
          }
          cizIstek()
          return
        }

        case 'kapi':
        case 'pencere': {
          if (!yk.duvar) return
          const tanim = aciklikBul(p.arac, p.arac === 'kapi' ? p.kapiKatalog : p.pencereKatalog)
          const boy = duvarUzunluk(yk.duvar)
          if (boy < tanim.genislik + 0.05) return
          const aciklik: Aciklik = {
            id: kimlik('a'),
            duvarId: yk.duvar.id,
            tur: p.arac,
            katalog: tanim.id,
            mesafe: Math.min(boy - tanim.genislik / 2, Math.max(tanim.genislik / 2, yk.mesafe ?? 0)),
            genislik: tanim.genislik,
            yukseklik: tanim.yukseklik,
            esik: tanim.esik,
            ters: ev.altKey,
          }
          p.gonder({ t: 'aciklik-ekle', aciklik })
          return
        }

        case 'mobilya': {
          const t = donatiBul(p.donatiKatalog)
          p.gonder({
            t: 'mobilya-ekle',
            mobilya: {
              id: kimlik('m'),
              katalog: t.id,
              ad: t.ad,
              konum: yk.nokta,
              aci: yerlestirmeAciRef.current,
              genislik: t.g,
              derinlik: t.d,
              yukseklik: t.y,
              renk: t.renk,
            },
          })
          return
        }

        case 'kolon': {
          p.gonder({
            t: 'kolon-ekle',
            kolon: {
              id: kimlik('c'),
              konum: yk.nokta,
              genislik: 0.4,
              derinlik: 0.4,
              aci: yerlestirmeAciRef.current,
            },
          })
          return
        }

        case 'olcu': {
          if (!olcuBasRef.current) {
            olcuBasRef.current = yk.nokta
          } else {
            const a = olcuBasRef.current
            if (uzaklik(a, yk.nokta) > 0.05) {
              p.gonder({
                t: 'olcu-ekle',
                olcu: { id: kimlik('o'), a, b: yk.nokta, ofset: 0.35 },
              })
            }
            olcuBasRef.current = null
          }
          cizIstek()
          return
        }

        case 'sec':
        default: {
          const uc = duvarUcuBul(dunya)
          if (uc) {
            surukleRef.current = { tur: 'duvarUcu', ...uc, zincir: !ev.altKey }
            return
          }
          const bulunan = elemanBul(dunya)
          if (bulunan) {
            const anahtar = `${bulunan.tur}:${bulunan.id}`
            const zaten = p.secim.some((s) => `${s.tur}:${s.id}` === anahtar)
            const yeniSecim = ev.shiftKey
              ? zaten
                ? p.secim.filter((s) => `${s.tur}:${s.id}` !== anahtar)
                : [...p.secim, bulunan]
              : zaten
                ? p.secim
                : [bulunan]
            p.gonder({ t: 'secim', secim: yeniSecim })
            if (bulunan.tur === 'aciklik') {
              surukleRef.current = { tur: 'aciklikKaydir', id: bulunan.id }
            } else {
              surukleRef.current = {
                tur: 'tasi',
                baslangic: dunya,
                son: dunya,
                secim: yeniSecim,
              }
            }
          } else {
            if (!ev.shiftKey) p.gonder({ t: 'secim', secim: [] })
            surukleRef.current = { tur: 'secKutu', bas: dunya, son: dunya }
          }
        }
      }
    },
    [cizIstek, duvarUcuBul, e2d, elemanBul, yakalamaHesapla],
  )

  const onPointerMove = useCallback(
    (ev: React.PointerEvent<HTMLDivElement>) => {
      const kutu = kutuRef.current
      if (!kutu) return
      const kutuSinir = kutu.getBoundingClientRect()
      const ex = ev.clientX - kutuSinir.left
      const ey = ev.clientY - kutuSinir.top
      const dunya = e2d(ex, ey)
      imlecRef.current = dunya
      const p = pRef.current
      const s = surukleRef.current

      if (s.tur === 'kaydir') {
        gorunumRef.current = { ...gorunumRef.current, ox: s.ox + (ex - s.bx), oy: s.oy + (ey - s.by) }
        cizIstek()
        return
      }

      const yk = yakalamaHesapla(dunya, ev.shiftKey)
      yakalananRef.current = yk

      if (s.tur === 'tasi') {
        const delta = { x: yk.nokta.x - s.son.x, y: yk.nokta.y - s.son.y }
        if (Math.abs(delta.x) > 1e-9 || Math.abs(delta.y) > 1e-9) {
          p.gonder({ t: 'tasi', secim: s.secim, delta })
          surukleRef.current = { ...s, son: yk.nokta }
        }
      } else if (s.tur === 'duvarUcu') {
        p.gonder({ t: 'duvar-uc', id: s.id, uc: s.uc, nokta: yk.nokta, zincir: s.zincir })
      } else if (s.tur === 'aciklikKaydir') {
        const a = p.kat.aciklikar.find((x) => x.id === s.id)
        const w = a && p.kat.duvarlar.find((x) => x.id === a.duvarId)
        if (a && w) {
          const iz = parcayaIzdusum(dunya, w.a, w.b)
          const boy = duvarUzunluk(w)
          p.gonder({
            t: 'aciklik-yama',
            id: a.id,
            yama: {
              mesafe: Math.min(boy - a.genislik / 2, Math.max(a.genislik / 2, iz.t * boy)),
            },
          })
        }
      } else if (s.tur === 'secKutu') {
        surukleRef.current = { ...s, son: dunya }
      } else {
        uzerindeRef.current = p.arac === 'sec' ? elemanBul(dunya) : null
      }

      const zincir = zincirRef.current
      const cikis = zincir.length
        ? zincir[zincir.length - 1]
        : (dikdortgenRef.current ?? olcuBasRef.current)
      setBilgi({
        x: yk.nokta.x,
        y: yk.nokta.y,
        boy: cikis ? uzaklik(cikis, yk.nokta) : 0,
        aci: cikis
          ? ((Math.atan2(yk.nokta.y - cikis.y, yk.nokta.x - cikis.x) * 180) / Math.PI + 360) % 360
          : 0,
        yakalama: yk.tur,
      })
      cizIstek()
    },
    [cizIstek, e2d, elemanBul, yakalamaHesapla],
  )

  const onPointerUp = useCallback(() => {
    const s = surukleRef.current
    const p = pRef.current
    // Surukleme bitti: sonraki surukleme yeni bir geri-al adimi acsin.
    if (s.tur === 'tasi' || s.tur === 'duvarUcu' || s.tur === 'aciklikKaydir') {
      p.gonder({ t: 'birlesim-kes' })
    }
    if (s.tur === 'secKutu') {
      const x0 = Math.min(s.bas.x, s.son.x)
      const x1 = Math.max(s.bas.x, s.son.x)
      const y0 = Math.min(s.bas.y, s.son.y)
      const y1 = Math.max(s.bas.y, s.son.y)
      if (x1 - x0 > 0.05 || y1 - y0 > 0.05) {
        const icinde = (n: Nokta) => n.x >= x0 && n.x <= x1 && n.y >= y0 && n.y <= y1
        const secim: Secim[] = [
          ...p.kat.duvarlar.filter((w) => icinde(w.a) && icinde(w.b)).map((w) => ({ tur: 'duvar' as const, id: w.id })),
          ...p.kat.mobilyalar.filter((m) => icinde(m.konum)).map((m) => ({ tur: 'mobilya' as const, id: m.id })),
          ...p.kat.kolonlar.filter((c) => icinde(c.konum)).map((c) => ({ tur: 'kolon' as const, id: c.id })),
          ...p.kat.olculer.filter((o) => icinde(o.a) && icinde(o.b)).map((o) => ({ tur: 'olcu' as const, id: o.id })),
        ]
        p.gonder({ t: 'secim', secim })
      }
    }
    surukleRef.current = { tur: 'yok' }
    cizIstek()
  }, [cizIstek])

  const onWheel = useCallback(
    (ev: React.WheelEvent<HTMLDivElement>) => {
      const kutu = kutuRef.current
      if (!kutu) return
      const kutuSinir = kutu.getBoundingClientRect()
      yakinlastir(ev.deltaY < 0 ? 1.12 : 1 / 1.12, {
        x: ev.clientX - kutuSinir.left,
        y: ev.clientY - kutuSinir.top,
      })
    },
    [yakinlastir],
  )

  // ------------------------------------------------------------ klavye
  useEffect(() => {
    function tus(e: KeyboardEvent) {
      const hedef = e.target as HTMLElement
      if (hedef && ['INPUT', 'TEXTAREA', 'SELECT'].includes(hedef.tagName)) return
      const p = pRef.current

      if (e.key === 'Escape') {
        zincirRef.current = []
        dikdortgenRef.current = null
        olcuBasRef.current = null
        surukleRef.current = { tur: 'yok' }
        if (p.arac !== 'sec') p.aracDegistir('sec')
        else p.gonder({ t: 'secim', secim: [] })
        cizIstek()
        return
      }
      if (e.key === 'Enter' && zincirRef.current.length) {
        zincirRef.current = []
        cizIstek()
        return
      }
      if ((e.key === 'Delete' || e.key === 'Backspace') && p.secim.length) {
        e.preventDefault()
        p.gonder({ t: 'sil', secim: p.secim })
        return
      }
      if (e.key === 'r' || e.key === 'R') {
        yerlestirmeAciRef.current = (yerlestirmeAciRef.current + 15) % 360
        cizIstek()
        return
      }
      if (e.key === 't' || e.key === 'T') {
        yerlestirmeAciRef.current = (yerlestirmeAciRef.current - 15 + 360) % 360
        cizIstek()
        return
      }
      if (!e.ctrlKey && !e.metaKey) {
        const arac = ARACLAR.find((a) => a.kisayol.toLowerCase() === e.key.toLowerCase())
        if (arac) {
          zincirRef.current = []
          dikdortgenRef.current = null
          olcuBasRef.current = null
          p.aracDegistir(arac.id)
          cizIstek()
        }
      }
    }
    window.addEventListener('keydown', tus)
    return () => window.removeEventListener('keydown', tus)
  }, [cizIstek])

  // Arac degisince yarim kalan cizimi birak
  useEffect(() => {
    zincirRef.current = []
    dikdortgenRef.current = null
    olcuBasRef.current = null
    cizIstek()
  }, [props.arac, cizIstek])

  const imlecStili =
    props.arac === 'sec' ? 'default' : props.arac === 'olcu' ? 'crosshair' : 'crosshair'

  return (
    <div className="relative h-full w-full overflow-hidden bg-kagit">
      <div
        ref={kutuRef}
        className="h-full w-full touch-none"
        style={{ cursor: imlecStili }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          imlecRef.current = null
          yakalananRef.current = null
          cizIstek()
        }}
        onWheel={onWheel}
        onContextMenu={(e) => e.preventDefault()}
      >
        <canvas ref={tuvalRef} className="block h-full w-full" />
      </div>

      {/* durum serididi */}
      <div className="pointer-events-none absolute right-3 bottom-3 left-3 flex flex-wrap items-center justify-between gap-3 text-[12px]">
        <span className="sayi rounded-[6px] border border-cizgi bg-kart/92 px-2.5 py-1 text-murekkep-2 backdrop-blur">
          X {bilgi.x.toFixed(2)} · Y {bilgi.y.toFixed(2)}
          {bilgi.boy > 0 && ` · ${bilgi.boy.toFixed(2)} m · ${bilgi.aci.toFixed(0)}°`}
        </span>
        <span className="sayi rounded-[6px] border border-cizgi bg-kart/92 px-2.5 py-1 text-murekkep-3 backdrop-blur">
          {(zum / 42).toFixed(2)}× · izgara {props.varsayilan.izgaraAdim} m
        </span>
      </div>
    </div>
  )
}

// ===================================================================== cizim

function cizIzgara(ctx: CanvasRenderingContext2D, G: number, Y: number, g: Gorunum) {
  const adaylar = [0.1, 0.25, 0.5, 1, 2, 5, 10, 20, 50]
  let adim = adaylar[adaylar.length - 1]
  for (const a of adaylar) {
    if (a * g.k >= 9) {
      adim = a
      break
    }
  }
  const solUst = { x: (0 - g.ox) / g.k, y: -(0 - g.oy) / g.k }
  const sagAlt = { x: (G - g.ox) / g.k, y: -(Y - g.oy) / g.k }
  const x0 = Math.floor(solUst.x / adim) * adim
  const x1 = Math.ceil(sagAlt.x / adim) * adim
  const y0 = Math.floor(sagAlt.y / adim) * adim
  const y1 = Math.ceil(solUst.y / adim) * adim

  ctx.save()
  ctx.lineWidth = 1
  for (let x = x0; x <= x1 + 1e-9; x += adim) {
    const ana = Math.abs(x / (adim * 5) - Math.round(x / (adim * 5))) < 1e-6
    ctx.strokeStyle = ana ? R.izgaraKalin : R.izgaraInce
    const sx = Math.round(x * g.k + g.ox) + 0.5
    ctx.beginPath()
    ctx.moveTo(sx, 0)
    ctx.lineTo(sx, Y)
    ctx.stroke()
  }
  for (let y = y0; y <= y1 + 1e-9; y += adim) {
    const ana = Math.abs(y / (adim * 5) - Math.round(y / (adim * 5))) < 1e-6
    ctx.strokeStyle = ana ? R.izgaraKalin : R.izgaraInce
    const sy = Math.round(-y * g.k + g.oy) + 0.5
    ctx.beginPath()
    ctx.moveTo(0, sy)
    ctx.lineTo(G, sy)
    ctx.stroke()
  }
  // orijin
  ctx.strokeStyle = R.eksen
  ctx.lineWidth = 1.2
  ctx.beginPath()
  ctx.moveTo(0, Math.round(g.oy) + 0.5)
  ctx.lineTo(G, Math.round(g.oy) + 0.5)
  ctx.moveTo(Math.round(g.ox) + 0.5, 0)
  ctx.lineTo(Math.round(g.ox) + 0.5, Y)
  ctx.stroke()
  ctx.restore()
}

function cizAltlik(
  ctx: CanvasRenderingContext2D,
  altlik: NonNullable<Kat['altlik']>,
  d2e: (p: Nokta) => Nokta,
  k: number,
) {
  const img = gorselGetir(altlik.veri)
  if (!img || !img.complete || !img.naturalWidth) return
  const s = d2e(altlik.konum)
  ctx.save()
  ctx.globalAlpha = altlik.saydamlik
  ctx.drawImage(img, s.x, s.y, img.naturalWidth * altlik.olcek * k, img.naturalHeight * altlik.olcek * k)
  ctx.restore()
}

const gorselOnbellek = new Map<string, HTMLImageElement>()
/** Altlik gorseli yuklendiginde tuvalin yeniden cizilmesi icin. */
const GORSEL_OLAYI = 'archlib-cizim-gorsel'

function gorselGetir(veri: string): HTMLImageElement | null {
  let img = gorselOnbellek.get(veri)
  if (!img) {
    img = new Image()
    // Yukleme bitince tuval bir kez daha cizilmezse altlik ekrana hic gelmez.
    img.onload = () => window.dispatchEvent(new Event(GORSEL_OLAYI))
    img.src = veri
    gorselOnbellek.set(veri, img)
    return null
  }
  return img
}

function cizDuvarlar(
  ctx: CanvasRenderingContext2D,
  duvarlar: readonly Duvar[],
  d2e: (p: Nokta) => Nokta,
  k: number,
) {
  if (!duvarlar.length) return
  const kenar = 1.1

  // 1) Dis hat gecisi
  ctx.save()
  ctx.lineCap = 'butt'
  ctx.strokeStyle = R.duvarDis
  for (const w of duvarlar) {
    const a = d2e(w.a)
    const b = d2e(w.b)
    ctx.lineWidth = Math.max(1.5, w.kalinlik * k + kenar * 2)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  // dugum yamalari: birlesim koselerinde dis hat surekli olsun
  for (const nokta of dugumler(duvarlar)) {
    const s = d2e(nokta.p)
    const yari = (nokta.kalinlik * k) / 2 + kenar
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(nokta.aci)
    ctx.fillStyle = R.duvarDis
    ctx.fillRect(-yari, -yari, yari * 2, yari * 2)
    ctx.restore()
  }
  ctx.restore()

  // 2) Ic dolgu gecisi
  ctx.save()
  ctx.lineCap = 'butt'
  for (const w of duvarlar) {
    const a = d2e(w.a)
    const b = d2e(w.b)
    const kalinlik = Math.max(0.5, w.kalinlik * k - kenar * 2)
    ctx.strokeStyle = w.tur === 'cam' ? R.camIc : w.tur === 'bolme' ? R.bolmeIc : R.duvarIc
    ctx.lineWidth = kalinlik
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  for (const nokta of dugumler(duvarlar)) {
    const s = d2e(nokta.p)
    const yari = Math.max(0.5, (nokta.kalinlik * k) / 2 - kenar)
    ctx.save()
    ctx.translate(s.x, s.y)
    ctx.rotate(nokta.aci)
    ctx.fillStyle = R.duvarIc
    ctx.fillRect(-yari, -yari, yari * 2, yari * 2)
    ctx.restore()
  }
  ctx.restore()
}

/** Iki veya daha fazla duvarin bulustugu uc noktalari. */
function dugumler(duvarlar: readonly Duvar[]): { p: Nokta; kalinlik: number; aci: number }[] {
  const kova = new Map<string, { p: Nokta; sayi: number; kalinlik: number; aci: number }>()
  const anahtar = (p: Nokta) => `${Math.round(p.x * 200)}|${Math.round(p.y * 200)}`
  for (const w of duvarlar) {
    const aci = Math.atan2(-(w.b.y - w.a.y), w.b.x - w.a.x)
    for (const uc of [w.a, w.b]) {
      const key = anahtar(uc)
      const kayit = kova.get(key)
      if (kayit) {
        kayit.sayi++
        kayit.kalinlik = Math.max(kayit.kalinlik, w.kalinlik)
      } else {
        kova.set(key, { p: uc, sayi: 1, kalinlik: w.kalinlik, aci })
      }
    }
  }
  return Array.from(kova.values()).filter((d) => d.sayi > 1)
}

function cizAciklikar(
  ctx: CanvasRenderingContext2D,
  kat: Kat,
  d2e: (p: Nokta) => Nokta,
  k: number,
) {
  for (const a of kat.aciklikar) {
    const w = kat.duvarlar.find((x) => x.id === a.duvarId)
    if (!w) continue
    cizAciklikSekli(ctx, w, a, d2e, k, false)
  }
}

function cizAciklikSekli(
  ctx: CanvasRenderingContext2D,
  w: Duvar,
  a: Aciklik,
  d2e: (p: Nokta) => Nokta,
  k: number,
  hayalet: boolean,
) {
  const u = birim(cikar(w.b, w.a))
  const n = dik(u)
  const merkez = duvarNoktasi(w, a.mesafe)
  const yariG = a.genislik / 2
  const yariK = w.kalinlik / 2 + 0.02

  const kose = (dg: number, dn: number): Nokta =>
    d2e({ x: merkez.x + u.x * dg + n.x * dn, y: merkez.y + u.y * dg + n.y * dn })

  ctx.save()
  if (hayalet) ctx.globalAlpha = 0.55

  // bosluk
  ctx.beginPath()
  const p1 = kose(-yariG, yariK)
  const p2 = kose(yariG, yariK)
  const p3 = kose(yariG, -yariK)
  const p4 = kose(-yariG, -yariK)
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.lineTo(p4.x, p4.y)
  ctx.closePath()
  ctx.fillStyle = R.aciklik
  ctx.fill()

  // sove cizgileri
  ctx.strokeStyle = R.duvarDis
  ctx.lineWidth = 1.1
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p4.x, p4.y)
  ctx.moveTo(p2.x, p2.y)
  ctx.lineTo(p3.x, p3.y)
  ctx.stroke()

  if (a.tur === 'pencere') {
    const c1 = kose(-yariG, w.kalinlik / 6)
    const c2 = kose(yariG, w.kalinlik / 6)
    const c3 = kose(-yariG, -w.kalinlik / 6)
    const c4 = kose(yariG, -w.kalinlik / 6)
    ctx.strokeStyle = R.dograma
    ctx.lineWidth = 1.3
    ctx.beginPath()
    ctx.moveTo(c1.x, c1.y)
    ctx.lineTo(c2.x, c2.y)
    ctx.moveTo(c3.x, c3.y)
    ctx.lineTo(c4.x, c4.y)
    ctx.stroke()
  } else {
    // kapi kanadi ve acilis yayi
    const yon = a.ters ? -1 : 1
    const menteseDunya = {
      x: merkez.x - u.x * yariG,
      y: merkez.y - u.y * yariG,
    }
    const mentese = d2e(menteseDunya)
    const kanatUc = d2e({
      x: menteseDunya.x + n.x * a.genislik * yon,
      y: menteseDunya.y + n.y * a.genislik * yon,
    })
    ctx.strokeStyle = R.dograma
    ctx.lineWidth = 1.4
    ctx.beginPath()
    ctx.moveTo(mentese.x, mentese.y)
    ctx.lineTo(kanatUc.x, kanatUc.y)
    ctx.stroke()

    const bas = Math.atan2(kanatUc.y - mentese.y, kanatUc.x - mentese.x)
    const acikUc = d2e({
      x: menteseDunya.x + u.x * a.genislik,
      y: menteseDunya.y + u.y * a.genislik,
    })
    const bit = Math.atan2(acikUc.y - mentese.y, acikUc.x - mentese.x)
    // Yay her zaman kisa yoldan (90°) cizilsin; yon bayragina birakildiginda
    // bazi dogrultularda 270°'lik ters yay ciziliyordu.
    let fark = bit - bas
    while (fark <= -Math.PI) fark += Math.PI * 2
    while (fark > Math.PI) fark -= Math.PI * 2
    ctx.strokeStyle = R.kapiYay
    ctx.lineWidth = 1
    ctx.setLineDash([4, 3])
    ctx.beginPath()
    ctx.arc(mentese.x, mentese.y, a.genislik * k, bas, bas + fark, fark < 0)
    ctx.stroke()
  }
  ctx.restore()
}

function cizMobilya(
  ctx: CanvasRenderingContext2D,
  m: Kat['mobilyalar'][number],
  d2e: (p: Nokta) => Nokta,
  k: number,
  secili: boolean,
) {
  const s = d2e(m.konum)
  const g = m.genislik * k
  const d = m.derinlik * k
  ctx.save()
  ctx.translate(s.x, s.y)
  ctx.rotate((-m.aci * Math.PI) / 180)
  ctx.fillStyle = `${m.renk}22`
  ctx.strokeStyle = secili ? R.secim : m.renk
  ctx.lineWidth = secili ? 1.8 : 1.2
  ctx.beginPath()
  ctx.rect(-g / 2, -d / 2, g, d)
  ctx.fill()
  ctx.stroke()
  // on yonu isareti
  ctx.beginPath()
  ctx.moveTo(-g / 2, -d / 2)
  ctx.lineTo(0, -d / 2 + Math.min(10, d * 0.25))
  ctx.lineTo(g / 2, -d / 2)
  ctx.strokeStyle = `${m.renk}99`
  ctx.lineWidth = 1
  ctx.stroke()
  if (g > 44 && d > 18) {
    ctx.rotate(0)
    ctx.fillStyle = R.odaYazi
    ctx.font = '400 10px "DM Sans", system-ui, sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(m.ad.length > 16 ? `${m.ad.slice(0, 15)}…` : m.ad, 0, 3)
  }
  ctx.restore()
}

function cizOlcu(
  ctx: CanvasRenderingContext2D,
  o: Kat['olculer'][number],
  d2e: (p: Nokta) => Nokta,
) {
  const u = birim(cikar(o.b, o.a))
  const n = dik(u)
  const a = d2e({ x: o.a.x + n.x * o.ofset, y: o.a.y + n.y * o.ofset })
  const b = d2e({ x: o.b.x + n.x * o.ofset, y: o.b.y + n.y * o.ofset })
  const a0 = d2e(o.a)
  const b0 = d2e(o.b)

  ctx.save()
  ctx.strokeStyle = R.olcu
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(a.x, a.y)
  ctx.lineTo(b.x, b.y)
  ctx.moveTo(a0.x, a0.y)
  ctx.lineTo(a.x, a.y)
  ctx.moveTo(b0.x, b0.y)
  ctx.lineTo(b.x, b.y)
  ctx.stroke()
  for (const uc of [a, b]) {
    ctx.beginPath()
    ctx.arc(uc.x, uc.y, 2.2, 0, Math.PI * 2)
    ctx.fillStyle = R.olcu
    ctx.fill()
  }
  ctx.restore()
  cizOlcuBalonu(ctx, a, b, `${uzaklik(o.a, o.b).toFixed(2)} m`, R.olcu)
}

function cizOlcuBalonu(
  ctx: CanvasRenderingContext2D,
  a: Nokta,
  b: Nokta,
  metin: string,
  renk = R.secim,
) {
  const mx = (a.x + b.x) / 2
  const my = (a.y + b.y) / 2
  ctx.save()
  ctx.font = '500 11.5px "DM Sans", system-ui, sans-serif'
  const g = ctx.measureText(metin).width + 12
  ctx.fillStyle = 'rgba(255,254,250,0.94)'
  ctx.strokeStyle = renk
  ctx.lineWidth = 1
  const x = mx - g / 2
  const y = my - 10
  ctx.beginPath()
  ctx.roundRect(x, y, g, 19, 4)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = '#30332d'
  ctx.textAlign = 'center'
  ctx.fillText(metin, mx, y + 13)
  ctx.restore()
}

function cizSecim(
  ctx: CanvasRenderingContext2D,
  p: Props,
  d2e: (n: Nokta) => Nokta,
  k: number,
  secKume: Set<string>,
) {
  ctx.save()
  ctx.strokeStyle = R.secim
  ctx.lineWidth = 1.8

  for (const w of p.kat.duvarlar) {
    if (!secKume.has(`duvar:${w.id}`)) continue
    const kabuk = duvarKabugu(w).map(d2e)
    ctx.beginPath()
    kabuk.forEach((n, i) => (i === 0 ? ctx.moveTo(n.x, n.y) : ctx.lineTo(n.x, n.y)))
    ctx.closePath()
    ctx.stroke()
    for (const uc of [w.a, w.b]) {
      const s = d2e(uc)
      ctx.beginPath()
      ctx.arc(s.x, s.y, TUTAMAK, 0, Math.PI * 2)
      ctx.fillStyle = '#fffefa'
      ctx.fill()
      ctx.stroke()
    }
    const orta = d2e({ x: (w.a.x + w.b.x) / 2, y: (w.a.y + w.b.y) / 2 })
    ctx.restore()
    cizOlcuBalonu(ctx, orta, orta, `${duvarUzunluk(w).toFixed(2)} m · ${(w.kalinlik * 100).toFixed(0)} cm`)
    ctx.save()
    ctx.strokeStyle = R.secim
    ctx.lineWidth = 1.8
  }

  for (const a of p.kat.aciklikar) {
    if (!secKume.has(`aciklik:${a.id}`)) continue
    const w = p.kat.duvarlar.find((x) => x.id === a.duvarId)
    if (!w) continue
    const s = d2e(duvarNoktasi(w, a.mesafe))
    ctx.beginPath()
    ctx.arc(s.x, s.y, Math.max(8, (a.genislik / 2) * k), 0, Math.PI * 2)
    ctx.stroke()
  }

  for (const m of p.kat.kolonlar) {
    if (!secKume.has(`kolon:${m.id}`)) continue
    const s = d2e(m.konum)
    ctx.strokeRect(s.x - (m.genislik * k) / 2 - 3, s.y - (m.derinlik * k) / 2 - 3, m.genislik * k + 6, m.derinlik * k + 6)
  }

  for (const o of p.kat.olculer) {
    if (!secKume.has(`olcu:${o.id}`)) continue
    const a = d2e(o.a)
    const b = d2e(o.b)
    ctx.beginPath()
    ctx.moveTo(a.x, a.y)
    ctx.lineTo(b.x, b.y)
    ctx.stroke()
  }
  ctx.restore()
}

function cizYerlestirmeHayaleti(
  ctx: CanvasRenderingContext2D,
  p: Props,
  nokta: Nokta,
  aci: number,
  d2e: (n: Nokta) => Nokta,
  k: number,
) {
  const s = d2e(nokta)
  const t = p.arac === 'kolon' ? { g: 0.4, d: 0.4, renk: R.duvarDis } : donatiBul(p.donatiKatalog)
  const g = ('g' in t ? t.g : 0.4) * k
  const d = ('d' in t ? t.d : 0.4) * k
  ctx.save()
  ctx.globalAlpha = 0.5
  ctx.translate(s.x, s.y)
  ctx.rotate((-aci * Math.PI) / 180)
  ctx.strokeStyle = R.secim
  ctx.lineWidth = 1.4
  ctx.setLineDash([5, 3])
  ctx.strokeRect(-g / 2, -d / 2, g, d)
  ctx.restore()
}

function cizOlcek(ctx: CanvasRenderingContext2D, G: number, Y: number, k: number) {
  const adaylar = [0.5, 1, 2, 5, 10, 20, 50, 100]
  let metre = adaylar[0]
  for (const a of adaylar) {
    if (a * k >= 70) {
      metre = a
      break
    }
    metre = a
  }
  const px = metre * k
  const x = 16
  const y = Y - 52
  ctx.save()
  ctx.strokeStyle = '#85857b'
  ctx.fillStyle = '#85857b'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(x, y - 4)
  ctx.lineTo(x, y)
  ctx.lineTo(x + px, y)
  ctx.lineTo(x + px, y - 4)
  ctx.stroke()
  ctx.font = '400 10.5px "DM Sans", system-ui, sans-serif'
  ctx.fillText(`${metre} m`, x + px + 6, y + 3)
  ctx.restore()
}

/** Disaridan cagrilabilsin diye disa acilan yardimci. */
export { odalariBul }
