import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnalizTuru, EkGorsel, Saglayici } from '../types'
import { ANALIZ_TURU_ADI, ANALIZ_TURU_ACIKLAMA } from '../data/kritik'
import {
  analizCagir,
  dosyayiOku,
  saglayiciBul,
  IZINLI_GORSEL_TURLERI,
  MAKS_GORSEL_BOYUT,
} from '../lib/llm'
import { sistemPromptu, kullaniciPromptu } from '../lib/prompt'
import { anahtarlariOku, gecmiseEkle, gecmisOku, gecmisiTemizle, type GecmisKaydi } from '../lib/storage'
import Markdown from './Markdown'

const TURLER: AnalizTuru[] = [
  'pafta',
  'maket',
  'plan',
  'kesit-gorunus',
  'vaziyet',
  'konsept',
  'temel-tasar',
  'genel',
]

interface Props {
  saglayici: Saglayici
  anahtarPaneliniAc: () => void
  anahtarSurumu: number
}

export default function Analiz({ saglayici, anahtarPaneliniAc, anahtarSurumu }: Props) {
  const [tur, setTur] = useState<AnalizTuru>('pafta')
  const [soru, setSoru] = useState('')
  const [proje, setProje] = useState('')
  const [olcek, setOlcek] = useState('')
  const [ders, setDers] = useState('')
  const [gorseller, setGorseller] = useState<EkGorsel[]>([])
  const [cikti, setCikti] = useState('')
  const [calisiyor, setCalisiyor] = useState(false)
  const [hata, setHata] = useState('')
  const [suruklenen, setSuruklenen] = useState(false)
  const [gecmis, setGecmis] = useState<GecmisKaydi[]>([])
  const iptalRef = useRef<AbortController | null>(null)
  const ciktiRef = useRef<HTMLDivElement>(null)

  const kayit = anahtarlariOku()[saglayici]
  const anahtarVar = Boolean(kayit?.anahtar)

  useEffect(() => {
    setGecmis(gecmisOku())
  }, [])

  useEffect(() => {
    if (calisiyor && ciktiRef.current) {
      ciktiRef.current.scrollTop = ciktiRef.current.scrollHeight
    }
  }, [cikti, calisiyor])

  const gorselEkle = useCallback(async (dosyalar: FileList | File[]) => {
    const yeni: EkGorsel[] = []
    const hatalar: string[] = []
    for (const d of Array.from(dosyalar)) {
      if (!IZINLI_GORSEL_TURLERI.includes(d.type)) {
        hatalar.push(`${d.name}: desteklenmeyen tur (${d.type || 'bilinmiyor'})`)
        continue
      }
      if (d.size > MAKS_GORSEL_BOYUT) {
        hatalar.push(`${d.name}: 3,5 MB sinirini asiyor (${(d.size / 1024 / 1024).toFixed(1)} MB)`)
        continue
      }
      try {
        const { veri, onizleme } = await dosyayiOku(d)
        yeni.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          ad: d.name,
          mediaType: d.type,
          veri,
          onizleme,
        })
      } catch {
        hatalar.push(`${d.name}: okunamadi`)
      }
    }
    if (yeni.length) setGorseller((g) => [...g, ...yeni].slice(0, 6))
    if (hatalar.length) setHata(hatalar.join(' | '))
  }, [])

  useEffect(() => {
    function yapistir(e: ClipboardEvent) {
      const ogeler = e.clipboardData?.items
      if (!ogeler) return
      const dosyalar: File[] = []
      for (const o of Array.from(ogeler)) {
        if (o.kind === 'file') {
          const f = o.getAsFile()
          if (f) dosyalar.push(f)
        }
      }
      if (dosyalar.length) void gorselEkle(dosyalar)
    }
    window.addEventListener('paste', yapistir)
    return () => window.removeEventListener('paste', yapistir)
  }, [gorselEkle])

  async function calistir() {
    setHata('')
    if (!anahtarVar) {
      setHata('Once API anahtarini gir.')
      anahtarPaneliniAc()
      return
    }
    if (!soru.trim() && gorseller.length === 0) {
      setHata('Bir gorsel yukle ya da sorunu yaz.')
      return
    }

    const aktifKayit = anahtarlariOku()[saglayici]
    if (!aktifKayit?.anahtar) {
      setHata('API anahtari okunamadi. Paneli acip yeniden kaydet.')
      anahtarPaneliniAc()
      return
    }

    const kontrol = new AbortController()
    iptalRef.current = kontrol
    setCalisiyor(true)
    setCikti('')

    let biriken = ''
    try {
      await analizCagir({
        saglayici,
        anahtar: aktifKayit.anahtar,
        model: aktifKayit.model || saglayiciBul(saglayici).varsayilanModel,
        sistem: sistemPromptu(tur),
        kullanici: kullaniciPromptu({
          tur: ANALIZ_TURU_ADI[tur],
          soru,
          proje,
          olcek,
          ders,
          gorselSayisi: gorseller.length,
        }),
        gorseller,
        signal: kontrol.signal,
        onParca: (p) => {
          biriken += p
          setCikti(biriken)
        },
      })
      if (biriken.trim()) {
        gecmiseEkle({
          id: `${Date.now()}`,
          tarih: Date.now(),
          tur: ANALIZ_TURU_ADI[tur],
          baslik: proje.trim() || soru.trim().slice(0, 60) || ANALIZ_TURU_ADI[tur],
          metin: biriken,
        })
        setGecmis(gecmisOku())
      }
    } catch (e) {
      if ((e as Error)?.name === 'AbortError') {
        setHata('Istek iptal edildi.')
      } else {
        setHata((e as Error)?.message || 'Bilinmeyen hata.')
      }
    } finally {
      setCalisiyor(false)
      iptalRef.current = null
    }
  }

  function iptal() {
    iptalRef.current?.abort()
  }

  function kopyala() {
    navigator.clipboard?.writeText(cikti).catch(() => {})
  }

  function indir() {
    const blob = new Blob([cikti], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `archlib-kritik-${tur}-${new Date().toISOString().slice(0, 10)}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Kritik Masasi</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-[#2c333d]">
          Paftani, maketini ya da cizimini yukle; sorunu yaz. Degerlendirme, I. Hulusi Gungor un
          Temel Tasar kitabindaki mimari elestiri cercevesi (Bolum 14), Neufert olculeri ve TS/DIN
          cizim standartlari uzerinden yapilir.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        {/* SOL: girdi */}
        <div className="space-y-4">
          <section className="border border-[#cfc9bc] bg-white/50 p-4">
            <h2 className="mono mb-2.5 text-[11px] font-bold tracking-[0.14em] uppercase">
              1 — Kritik turu
            </h2>
            <div className="grid grid-cols-2 gap-1.5">
              {TURLER.map((t) => (
                <button
                  key={t}
                  onClick={() => setTur(t)}
                  className={`border px-2.5 py-2 text-left text-[12px] leading-tight transition ${
                    tur === t
                      ? 'border-[#b4472a] bg-[#b4472a]/10 font-semibold'
                      : 'border-[#cfc9bc] bg-white/60 hover:border-[#a89f8c]'
                  }`}
                >
                  {ANALIZ_TURU_ADI[t]}
                </button>
              ))}
            </div>
            <p className="mt-2.5 border-l-2 border-[#cfc9bc] pl-2.5 text-[12px] leading-relaxed text-[#2c333d]/85">
              {ANALIZ_TURU_ACIKLAMA[tur]}
            </p>
          </section>

          <section
            className={`border-2 border-dashed p-4 transition ${
              suruklenen ? 'border-[#b4472a] bg-[#b4472a]/8' : 'border-[#cfc9bc] bg-white/50'
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setSuruklenen(true)
            }}
            onDragLeave={() => setSuruklenen(false)}
            onDrop={(e) => {
              e.preventDefault()
              setSuruklenen(false)
              if (e.dataTransfer?.files?.length) void gorselEkle(e.dataTransfer.files)
            }}
          >
            <h2 className="mono mb-2.5 text-[11px] font-bold tracking-[0.14em] uppercase">
              2 — Gorsel (istege bagli)
            </h2>
            <p className="mb-3 text-[12px] leading-relaxed text-[#2c333d]/80">
              Surukle birak, yapistir (Ctrl+V) ya da sec. En fazla 6 gorsel, her biri 3,5 MB.
              PNG / JPEG / WebP.
            </p>
            <input
              type="file"
              accept={IZINLI_GORSEL_TURLERI.join(',')}
              multiple
              onChange={(e) => {
                if (e.target.files?.length) void gorselEkle(e.target.files)
                e.target.value = ''
              }}
              className="mono w-full text-[12px] file:mr-3 file:border file:border-[#cfc9bc] file:bg-white file:px-3 file:py-1.5 file:text-[11px] file:tracking-wider hover:file:border-[#b4472a]"
            />
            {gorseller.length > 0 && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {gorseller.map((g) => (
                  <div key={g.id} className="group relative border border-[#cfc9bc] bg-white">
                    <img
                      src={g.onizleme}
                      alt={g.ad}
                      className="h-20 w-full object-cover"
                    />
                    <button
                      onClick={() => setGorseller((x) => x.filter((y) => y.id !== g.id))}
                      className="mono absolute top-0.5 right-0.5 bg-[#14181f]/85 px-1.5 py-0.5 text-[10px] text-white opacity-0 transition group-hover:opacity-100"
                      aria-label="Kaldir"
                    >
                      X
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3 border border-[#cfc9bc] bg-white/50 p-4">
            <h2 className="mono text-[11px] font-bold tracking-[0.14em] uppercase">
              3 — Baglam ve soru
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <input
                value={ders}
                onChange={(e) => setDers(e.target.value)}
                placeholder="Ders / stuyo"
                className="border border-[#cfc9bc] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#b4472a]"
              />
              <input
                value={olcek}
                onChange={(e) => setOlcek(e.target.value)}
                placeholder="Olcek (1/100)"
                className="border border-[#cfc9bc] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#b4472a]"
              />
            </div>
            <input
              value={proje}
              onChange={(e) => setProje(e.target.value)}
              placeholder="Proje konusu (orn. egimli arazide 4 daireli konut)"
              className="w-full border border-[#cfc9bc] bg-white px-2.5 py-2 text-[13px] outline-none focus:border-[#b4472a]"
            />
            <textarea
              value={soru}
              onChange={(e) => setSoru(e.target.value)}
              rows={6}
              placeholder={
                'Neyi sormak istiyorsun? Ornek:\n"Zemin kat plani. Islak hacimleri bir arada topladim ama koridor uzun oldu. Merdiven konumu dogru mu?"\n\nBos birakirsan genel kritik verilir.'
              }
              className="w-full resize-y border border-[#cfc9bc] bg-white px-2.5 py-2 text-[13px] leading-relaxed outline-none focus:border-[#b4472a]"
            />
          </section>

          <div className="flex flex-wrap items-center gap-2">
            {!calisiyor ? (
              <button
                onClick={calistir}
                className="mono flex-1 bg-[#14181f] px-5 py-3 text-[11px] font-bold tracking-[0.14em] text-[#f6f4ef] uppercase hover:bg-[#b4472a]"
              >
                Kritigi Al
              </button>
            ) : (
              <button
                onClick={iptal}
                className="mono flex-1 border border-[#b4472a] px-5 py-3 text-[11px] font-bold tracking-[0.14em] text-[#b4472a] uppercase"
              >
                Durdur
              </button>
            )}
            <button
              onClick={anahtarPaneliniAc}
              className="mono border border-[#cfc9bc] px-3 py-3 text-[11px] tracking-[0.14em] uppercase hover:border-[#b4472a]"
            >
              {anahtarVar ? 'Anahtar OK' : 'Anahtar Gir'}
            </button>
          </div>

          {hata && (
            <div className="border border-[#b4472a]/45 bg-[#b4472a]/8 px-3 py-2.5 text-[13px] leading-relaxed text-[#b4472a]">
              {hata}
            </div>
          )}
        </div>

        {/* SAG: cikti */}
        <div className="min-w-0">
          <div className="flex items-center justify-between border border-b-0 border-[#cfc9bc] bg-[#ebe7de] px-4 py-2.5">
            <span className="mono text-[11px] font-bold tracking-[0.14em] uppercase">
              Kritik {calisiyor && <span className="text-[#b4472a]">— yaziliyor...</span>}
            </span>
            {cikti && !calisiyor && (
              <div className="flex gap-2">
                <button
                  onClick={kopyala}
                  className="mono text-[10px] tracking-[0.12em] uppercase hover:text-[#b4472a]"
                >
                  Kopyala
                </button>
                <button
                  onClick={indir}
                  className="mono text-[10px] tracking-[0.12em] uppercase hover:text-[#b4472a]"
                >
                  .md Indir
                </button>
              </div>
            )}
          </div>
          <div
            ref={ciktiRef}
            className="min-h-[520px] max-h-[calc(100vh-220px)] overflow-y-auto border border-[#cfc9bc] bg-white/70 px-5 py-4 text-[14px]"
          >
            {!cikti && !calisiyor && (
              <div className="flex h-[460px] flex-col items-center justify-center px-6 text-center">
                <div className="mono mb-3 text-[11px] tracking-[0.2em] text-[#2c333d]/40 uppercase">
                  Kritik masasi bos
                </div>
                <p className="max-w-sm text-[13px] leading-relaxed text-[#2c333d]/70">
                  Soldaki alandan kritik turunu sec, paftani ya da maket fotografini yukle ve
                  &laquo;Kritigi Al&raquo; de. Yanit; ne gordugu, guclu yonler, oncelikli sorunlar,
                  olcu kontrolu, jurinin soracagi sorular ve teslime kadar yapilacaklar basliklariyla
                  gelir.
                </p>
              </div>
            )}
            {cikti && <Markdown metin={cikti} />}
            {calisiyor && !cikti && (
              <div className="mono py-10 text-center text-[12px] tracking-wider text-[#2c333d]/60">
                MODEL DUSUNUYOR...
              </div>
            )}
          </div>

          {gecmis.length > 0 && (
            <section className="mt-5 border border-[#cfc9bc] bg-white/50 p-4">
              <div className="mb-2.5 flex items-center justify-between">
                <h2 className="mono text-[11px] font-bold tracking-[0.14em] uppercase">
                  Son kritikler
                </h2>
                <button
                  onClick={() => {
                    gecmisiTemizle()
                    setGecmis([])
                  }}
                  className="mono text-[10px] tracking-[0.12em] uppercase hover:text-[#b4472a]"
                >
                  Temizle
                </button>
              </div>
              <ul className="space-y-1.5">
                {gecmis.map((g) => (
                  <li key={g.id}>
                    <button
                      onClick={() => setCikti(g.metin)}
                      className="w-full border border-[#cfc9bc] bg-white/60 px-3 py-2 text-left text-[12px] hover:border-[#b4472a]"
                    >
                      <span className="mono text-[10px] tracking-wider text-[#2c333d]/60">
                        {new Date(g.tarih).toLocaleString('tr-TR')} — {g.tur}
                      </span>
                      <div className="truncate">{g.baslik}</div>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}
