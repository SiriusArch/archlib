import { useCallback, useEffect, useRef, useState } from 'react'
import type { AnalizTuru, EkGorsel, ModelSeviyesi, Saglayici } from '../types'
import { ANALIZ_TURU_ADI, ANALIZ_TURU_ACIKLAMA } from '../data/kritik'
import {
  analizCagir,
  dosyayiOku,
  saglayiciBul,
  otomatikModelSec,
  SEVIYE_ADI,
  IZINLI_GORSEL_TURLERI,
  MAKS_GORSEL_BOYUT,
} from '../lib/llm'
import { modelSeviyesiTahminiYap } from '../lib/zorluk'
import { sistemPromptu, kullaniciPromptu } from '../lib/prompt'
import {
  anahtarlariOku,
  gecmiseEkle,
  gecmisOku,
  gecmisiTemizle,
  type GecmisKaydi,
} from '../lib/storage'
import Markdown from './Markdown'
import { SayfaBasligi, Bos } from '../ui/Parcalar'
import { Panel, PanelBasligi, Cip } from '../ui/Kontroller'

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
  const [kullanilanModel, setKullanilanModel] = useState('')
  const [kullanilanSeviye, setKullanilanSeviye] = useState<ModelSeviyesi | null>(null)
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
        hatalar.push(`${d.name}: desteklenmeyen tür`)
        continue
      }
      if (d.size > MAKS_GORSEL_BOYUT) {
        hatalar.push(`${d.name}: 3,5 MB sınırını aşıyor (${(d.size / 1024 / 1024).toFixed(1)} MB)`)
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
        hatalar.push(`${d.name}: okunamadı`)
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
      setHata('Önce API anahtarını gir.')
      anahtarPaneliniAc()
      return
    }
    if (!soru.trim() && gorseller.length === 0) {
      setHata('Bir görsel yükle ya da sorunu yaz.')
      return
    }

    const aktifKayit = anahtarlariOku()[saglayici]
    if (!aktifKayit?.anahtar) {
      setHata('API anahtarı okunamadı. Paneli açıp yeniden kaydet.')
      anahtarPaneliniAc()
      return
    }

    const bilgi = saglayiciBul(saglayici)
    const otomatik = aktifKayit.otomatik ?? true
    const seviye = otomatik
      ? modelSeviyesiTahminiYap({ soru, gorselSayisi: gorseller.length, tur, proje, olcek, ders })
      : null
    const model = seviye ? otomatikModelSec(bilgi, seviye) : aktifKayit.model || bilgi.varsayilanModel

    const kontrol = new AbortController()
    iptalRef.current = kontrol
    setCalisiyor(true)
    setCikti('')
    setKullanilanModel(model)
    setKullanilanSeviye(seviye)

    let biriken = ''
    try {
      await analizCagir({
        saglayici,
        anahtar: aktifKayit.anahtar,
        model,
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
      if ((e as Error)?.name === 'AbortError') setHata('İstek iptal edildi.')
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
        etiket="Kritik"
        renk="text-kiremit-koyu"
        baslik="Paftanı jüri öncesi bir kez daha oku"
        aciklama="Görseli ya da soruyu bırak. Değerlendirme, İ. Hulûsi Güngör'ün Temel Tasar kitabındaki mimari eleştiri çerçevesi (Bölüm 14), Neufert ölçüleri ve TS/DIN çizim standartları üzerinden yapılır."
        sag={
          <button
            onClick={anahtarPaneliniAc}
            className={`rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-colors duration-200 ${
              anahtarVar
                ? 'border-adacayi/45 bg-adacayi-soft text-adacayi-koyu'
                : 'border-kiremit/45 bg-kiremit-soft text-kiremit-koyu'
            }`}
          >
            {anahtarVar ? `${saglayiciBul(saglayici).ad} bağlı` : 'API anahtarı gerekli'}
          </button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,352px)_minmax(0,1fr)]">
        {/* ------------------------------------------------------------ sol */}
        <div className="space-y-3.5">
          <Panel>
            <PanelBasligi baslik="Kritik türü" />
            <div className="px-4 py-3.5">
              <div className="flex flex-wrap gap-1.5">
                {TURLER.map((t) => (
                  <Cip key={t} secili={tur === t} onClick={() => setTur(t)}>
                    {ANALIZ_TURU_ADI[t]}
                  </Cip>
                ))}
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-murekkep-3">
                {ANALIZ_TURU_ACIKLAMA[tur]}
              </p>
            </div>
          </Panel>

          <Panel>
            <PanelBasligi
              baslik="Görsel"
              sag={
                <span className="sayi text-[13px] text-murekkep-3">{gorseller.length} / 6</span>
              }
            />
            <div className="px-4 py-3.5">
              <div
                className={`rounded-[7px] border border-dashed px-4 py-5 text-center transition-colors duration-300 ${
                  suruklenen ? 'border-kiremit bg-kiremit-soft' : 'border-cizgi-2 bg-kagit'
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
                <p className="mb-3 text-[13.5px] leading-relaxed text-murekkep-3">
                  Sürükle bırak, yapıştır (Ctrl+V) ya da seç.
                  <br />
                  En fazla 6 görsel, her biri 3,5 MB.
                </p>
                <label className="inline-block cursor-pointer rounded-[6px] border border-cizgi bg-kart px-3.5 py-2 text-[13.5px] font-medium text-murekkep-2 transition-colors hover:border-cizgi-2 hover:text-murekkep">
                  Dosya seç
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
              </div>

              {gorseller.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {gorseller.map((g) => (
                    <div
                      key={g.id}
                      className="group relative overflow-hidden rounded-[6px] border border-cizgi"
                    >
                      <img src={g.onizleme} alt={g.ad} className="h-20 w-full object-cover" />
                      <button
                        onClick={() => setGorseller((x) => x.filter((y) => y.id !== g.id))}
                        className="absolute inset-0 flex items-center justify-center bg-kart/88 text-[13px] font-medium text-kiremit-koyu opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        Kaldır
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </Panel>

          <Panel>
            <PanelBasligi baslik="Bağlam ve soru" />
            <div className="space-y-3 px-4 py-3.5">
              <div className="grid grid-cols-2 gap-3">
                <input
                  value={ders}
                  onChange={(e) => setDers(e.target.value)}
                  placeholder="Ders / stüdyo"
                  className="alan"
                />
                <input
                  value={olcek}
                  onChange={(e) => setOlcek(e.target.value)}
                  placeholder="Ölçek (1/100)"
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
                  'Örnek: "Zemin kat planı. Islak hacimleri bir arada topladım ama koridor uzun oldu. Merdiven konumu doğru mu?"'
                }
                className="alan"
              />
            </div>
          </Panel>

          {calisiyor ? (
            <button
              onClick={() => iptalRef.current?.abort()}
              className="w-full rounded-[7px] border border-kiremit bg-kiremit-soft px-5 py-3.5 text-[15px] font-medium text-kiremit-koyu transition-opacity hover:opacity-90"
            >
              Durdur
            </button>
          ) : (
            <button
              onClick={() => void calistir()}
              className="w-full rounded-[7px] bg-kiremit px-5 py-3.5 text-[15px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Kritiği al
            </button>
          )}

          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-kiremit-koyu">
              {hata}
            </p>
          )}
        </div>

        {/* ------------------------------------------------------------ sag */}
        <div className="min-w-0 space-y-3.5">
          <Panel>
            <PanelBasligi
              baslik="Kritik"
              sag={
                cikti && !calisiyor ? (
                  <span className="flex gap-3.5">
                    <button
                      onClick={() => navigator.clipboard?.writeText(cikti).catch(() => {})}
                      className="text-[13px] font-medium text-murekkep-3 transition-colors hover:text-murekkep"
                    >
                      Kopyala
                    </button>
                    <button
                      onClick={indir}
                      className="text-[13px] font-medium text-murekkep-3 transition-colors hover:text-murekkep"
                    >
                      .md indir
                    </button>
                  </span>
                ) : calisiyor ? (
                  <span className="text-[13px] font-medium text-kiremit-koyu">yazılıyor</span>
                ) : undefined
              }
            />
            {kullanilanModel && (
              <p className="border-b border-cizgi/70 px-4 py-1.5 text-[12.5px] text-murekkep-3">
                {kullanilanSeviye ? `Otomatik seçim: ${SEVIYE_ADI[kullanilanSeviye]} · ` : 'Model: '}
                <span className="sayi">{kullanilanModel}</span>
              </p>
            )}
            <div
              ref={ciktiRef}
              className="max-h-[calc(100vh-250px)] min-h-[520px] overflow-y-auto px-6 py-5"
            >
              {!cikti && !calisiyor && (
                <Bos
                  baslik="Kritik masası boş"
                  aciklama="Soldan kritik türünü seç, paftanı ya da maket fotoğrafını yükle ve Kritiği al de. Yanıt; ne gördüğü, güçlü yönler, öncelikli sorunlar, ölçü kontrolü, jürinin soracağı sorular ve teslime kadar yapılacaklar başlıklarıyla gelir."
                />
              )}
              {calisiyor && !cikti && <Bos baslik="Model düşünüyor" />}
              {cikti && <Markdown metin={cikti} />}
            </div>
          </Panel>

          {gecmis.length > 0 && (
            <Panel>
              <PanelBasligi
                baslik="Son kritikler"
                sag={
                  <button
                    onClick={() => {
                      gecmisiTemizle()
                      setGecmis([])
                    }}
                    className="text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
                  >
                    Temizle
                  </button>
                }
              />
              <ul>
                {gecmis.map((g) => (
                  <li key={g.id} className="border-b border-cizgi/70 last:border-0">
                    <button
                      onClick={() => setCikti(g.metin)}
                      className="flex w-full items-baseline gap-3 px-4 py-2.5 text-left transition-colors hover:bg-kagit-2/70"
                    >
                      <span className="sayi shrink-0 text-[12.5px] text-murekkep-3">
                        {new Date(g.tarih).toLocaleDateString('tr-TR')}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-[14.5px] text-murekkep-2">
                        {g.baslik}
                      </span>
                      <span className="shrink-0 text-[12.5px] text-murekkep-3">{g.tur}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  )
}
