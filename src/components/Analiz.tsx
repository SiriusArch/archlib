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
import {
  anahtarlariOku,
  gecmiseEkle,
  gecmisOku,
  gecmisiTemizle,
  type GecmisKaydi,
} from '../lib/storage'
import Markdown from './Markdown'
import { SayfaBasligi, BolumBasligi, Dugme, Bos } from '../ui/Parcalar'

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
  }, [anahtarSurumu])

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
        hatalar.push(`${d.name}: desteklenmeyen tur`)
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
    if (hatalar.length) setHata(hatalar.join(' · '))
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
      if ((e as Error)?.name === 'AbortError') setHata('Istek iptal edildi.')
      else setHata((e as Error)?.message || 'Bilinmeyen hata.')
    } finally {
      setCalisiyor(false)
      iptalRef.current = null
    }
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
    <div className="kademe">
      <SayfaBasligi
        etiket="01 — Kritik Masasi"
        renk="text-kiremit-koyu"
        baslik="Paftani juri oncesi bir kez daha oku"
        aciklama="Gorseli ya da soruyu birak. Degerlendirme, I. Hulusi Gungor un Temel Tasar kitabindaki mimari elestiri cercevesi (Bolum 14), Neufert olculeri ve TS/DIN cizim standartlari uzerinden yapilir."
      />

      <div className="grid gap-10 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        {/* ------------------------------------------------------------ sol */}
        <div className="space-y-8">
          <div>
            <BolumBasligi renk="text-kiremit-koyu">1 — Kritik turu</BolumBasligi>
            <div className="grid grid-cols-2 gap-x-5 gap-y-0">
              {TURLER.map((t) => (
                <button
                  key={t}
                  onClick={() => setTur(t)}
                  className={`group flex items-baseline gap-2 border-b border-cizgi py-2.5 text-left transition-colors duration-300 ${
                    tur === t ? 'text-murekkep' : 'text-murekkep-2 hover:text-murekkep'
                  }`}
                >
                  <span
                    className={`inline-block h-[5px] w-[5px] shrink-0 translate-y-[-2px] rounded-full transition-colors duration-300 ${
                      tur === t ? 'bg-kiremit' : 'bg-cizgi-2 group-hover:bg-murekkep-3'
                    }`}
                  />
                  <span className="text-[13px] leading-snug">{ANALIZ_TURU_ADI[t]}</span>
                </button>
              ))}
            </div>
            <p className="mt-3 border-l-2 border-cizgi pl-3 text-[12.5px] leading-relaxed text-murekkep-2">
              {ANALIZ_TURU_ACIKLAMA[tur]}
            </p>
          </div>

          <div>
            <BolumBasligi renk="text-kiremit-koyu">2 — Gorsel</BolumBasligi>
            <div
              className={`border border-dashed px-4 py-5 transition-colors duration-300 ${
                suruklenen ? 'border-kiremit bg-kiremit-soft' : 'border-cizgi-2'
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
              <p className="mb-3 text-[12.5px] leading-relaxed text-murekkep-2">
                Surukle birak, yapistir (Ctrl+V) ya da sec. En fazla 6 gorsel, her biri 3,5 MB.
              </p>
              <label className="etiket inline-block cursor-pointer border border-cizgi-2 px-3 py-2 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep">
                Dosya sec
                <input
                  type="file"
                  accept={IZINLI_GORSEL_TURLERI.join(',')}
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.length) void gorselEkle(e.target.files)
                    e.target.value = ''
                  }}
                />
              </label>

              {gorseller.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-2">
                  {gorseller.map((g) => (
                    <div key={g.id} className="group relative border border-cizgi">
                      <img src={g.onizleme} alt={g.ad} className="h-20 w-full object-cover" />
                      <button
                        onClick={() => setGorseller((x) => x.filter((y) => y.id !== g.id))}
                        className="etiket absolute inset-0 flex items-center justify-center bg-kagit/85 opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        kaldir
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <BolumBasligi renk="text-kiremit-koyu">3 — Baglam ve soru</BolumBasligi>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input
                  value={ders}
                  onChange={(e) => setDers(e.target.value)}
                  placeholder="Ders / stuyo"
                  className="alan"
                />
                <input
                  value={olcek}
                  onChange={(e) => setOlcek(e.target.value)}
                  placeholder="Olcek (1/100)"
                  className="alan"
                />
              </div>
              <input
                value={proje}
                onChange={(e) => setProje(e.target.value)}
                placeholder="Proje konusu"
                className="alan"
              />
              <textarea
                value={soru}
                onChange={(e) => setSoru(e.target.value)}
                rows={6}
                placeholder={
                  'Ornek: "Zemin kat plani. Islak hacimleri bir arada topladim ama koridor uzun oldu. Merdiven konumu dogru mu?"'
                }
                className="alan"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {!calisiyor ? (
              <Dugme onClick={() => void calistir()} dolgu="bg-kiremit" className="flex-1">
                Kritigi al
              </Dugme>
            ) : (
              <button
                onClick={() => iptalRef.current?.abort()}
                className="etiket flex-1 border border-kiremit px-6 py-3 text-kiremit-koyu"
              >
                Durdur
              </button>
            )}
            <button
              onClick={anahtarPaneliniAc}
              className="etiket border border-cizgi px-4 py-3 text-murekkep-2 transition-colors hover:border-murekkep hover:text-murekkep"
            >
              {anahtarVar ? 'Anahtar tamam' : 'Anahtar gir'}
            </button>
          </div>

          {hata && (
            <p className="border-l-2 border-kiremit pl-3 text-[13px] leading-relaxed text-kiremit-koyu">
              {hata}
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------ sag */}
        <div className="min-w-0">
          <BolumBasligi
            renk="text-kiremit-koyu"
            sag={
              cikti && !calisiyor ? (
                <span className="flex gap-4">
                  <button
                    onClick={() => navigator.clipboard?.writeText(cikti).catch(() => {})}
                    className="etiket text-murekkep-3 transition-colors hover:text-murekkep"
                  >
                    Kopyala
                  </button>
                  <button
                    onClick={indir}
                    className="etiket text-murekkep-3 transition-colors hover:text-murekkep"
                  >
                    .md indir
                  </button>
                </span>
              ) : calisiyor ? (
                <span className="etiket text-kiremit-koyu">yaziliyor</span>
              ) : undefined
            }
          >
            Kritik
          </BolumBasligi>

          <div
            ref={ciktiRef}
            className="max-h-[calc(100vh-260px)] min-h-[560px] overflow-y-auto"
          >
            {!cikti && !calisiyor && (
              <Bos
                baslik="Kritik masasi bos"
                aciklama="Soldan kritik turunu sec, paftani ya da maket fotografini yukle ve Kritigi al de. Yanit; ne gordugu, guclu yonler, oncelikli sorunlar, olcu kontrolu, jurinin soracagi sorular ve teslime kadar yapilacaklar basliklariyla gelir."
              />
            )}
            {calisiyor && !cikti && <Bos baslik="Model dusunuyor" />}
            {cikti && <Markdown metin={cikti} />}
          </div>

          {gecmis.length > 0 && (
            <section className="mt-10">
              <BolumBasligi
                sag={
                  <button
                    onClick={() => {
                      gecmisiTemizle()
                      setGecmis([])
                    }}
                    className="etiket text-murekkep-3 transition-colors hover:text-kiremit-koyu"
                  >
                    Temizle
                  </button>
                }
              >
                Son kritikler
              </BolumBasligi>
              <ul>
                {gecmis.map((g) => (
                  <li key={g.id} className="border-b border-cizgi">
                    <button
                      onClick={() => setCikti(g.metin)}
                      className="w-full py-2.5 text-left transition-colors hover:text-kiremit-koyu"
                    >
                      <span className="sayi mr-3 text-[11px] text-murekkep-3">
                        {new Date(g.tarih).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="text-[13.5px] text-murekkep-2">{g.baslik}</span>
                      <span className="etiket ml-2 text-murekkep-3">{g.tur}</span>
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
