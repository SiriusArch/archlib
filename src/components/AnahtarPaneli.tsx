import { useEffect, useState } from 'react'
import type { Saglayici } from '../types'
import { SAGLAYICILAR, saglayiciBul } from '../lib/llm'
import { anahtarlariOku, anahtarYaz, anahtarSil, aktifSaglayiciYaz } from '../lib/storage'
import { Cip } from '../ui/Kontroller'

interface Props {
  acik: boolean
  kapat: () => void
  aktif: Saglayici
  aktifDegisti: (s: Saglayici) => void
  guncellendi: () => void
}

export default function AnahtarPaneli({ acik, kapat, aktif, aktifDegisti, guncellendi }: Props) {
  const [secili, setSecili] = useState<Saglayici>(aktif)
  const [anahtar, setAnahtar] = useState('')
  const [model, setModel] = useState('')
  const [goster, setGoster] = useState(false)
  const [mesaj, setMesaj] = useState('')

  useEffect(() => {
    if (acik) setSecili(aktif)
  }, [acik, aktif])

  useEffect(() => {
    if (!acik) return
    const k = anahtarlariOku()[secili]
    setAnahtar(k?.anahtar ?? '')
    setModel(k?.model ?? saglayiciBul(secili).varsayilanModel)
    setMesaj('')
    setGoster(false)
  }, [acik, secili])

  if (!acik) return null

  const bilgi = saglayiciBul(secili)
  const kayitli = anahtarlariOku()

  function kaydet() {
    if (!anahtar.trim()) {
      setMesaj('Anahtar boş olamaz.')
      return
    }
    anahtarYaz({
      saglayici: secili,
      anahtar: anahtar.trim(),
      model: model.trim() || bilgi.varsayilanModel,
    })
    aktifSaglayiciYaz(secili)
    aktifDegisti(secili)
    guncellendi()
    setMesaj('Kaydedildi. Anahtar yalnızca bu tarayıcıda saklanır.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-murekkep/40 p-4 backdrop-blur-[3px]"
      onClick={kapat}
    >
      <div
        className="animasyon-sayfa my-10 w-full max-w-xl overflow-hidden rounded-[10px] border border-cizgi bg-kart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-cizgi px-6 py-4">
          <div>
            <div className="etiket">Bağlantı</div>
            <h2 className="mt-1 text-[22px] leading-tight text-murekkep">API anahtarı</h2>
          </div>
          <button
            onClick={kapat}
            className="shrink-0 pt-1 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-[14.5px] leading-relaxed text-murekkep-2">
            ArchLib’in sunucusu yoktur. Analiz isteği tarayıcından doğrudan seçtiğin sağlayıcıya
            gider; anahtarın yalnızca bu tarayıcının{' '}
            <code className="rounded-[4px] bg-kagit-3 px-1 py-0.5 text-[13px]">localStorage</code>{' '}
            alanında saklanır, hiçbir yere gönderilmez. Token maliyetini kendi hesabın karşılar.
          </p>

          <div>
            <div className="etiket mb-2">Sağlayıcı</div>
            <div className="flex flex-wrap gap-1.5">
              {SAGLAYICILAR.map((s) => (
                <Cip key={s.id} secili={secili === s.id} onClick={() => setSecili(s.id)}>
                  {s.ad}
                  <span className="ml-1.5 text-[11.5px] opacity-60">
                    {kayitli[s.id]?.anahtar ? 'kayıtlı' : 'boş'}
                  </span>
                </Cip>
              ))}
            </div>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-murekkep-3">{bilgi.not}</p>
          </div>

          <div>
            <label className="etiket mb-1.5 block">Anahtar</label>
            <div className="flex items-center gap-3">
              <input
                type={goster ? 'text' : 'password'}
                value={anahtar}
                onChange={(e) => setAnahtar(e.target.value)}
                placeholder={bilgi.anahtarOnEk ? `${bilgi.anahtarOnEk}...` : 'AIza...'}
                autoComplete="off"
                spellCheck={false}
                className="alan sayi"
              />
              <button
                onClick={() => setGoster((g) => !g)}
                className="shrink-0 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-murekkep"
              >
                {goster ? 'gizle' : 'göster'}
              </button>
            </div>
            <a
              href={bilgi.anahtarAdresi}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-2 inline-block text-[13px] font-medium text-kiremit-koyu underline decoration-kiremit/35 underline-offset-4"
            >
              Anahtarı buradan al
            </a>
          </div>

          <div>
            <label className="etiket mb-1.5 block">Model</label>
            <input
              list={`modeller-${secili}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              spellCheck={false}
              className="alan sayi"
            />
            <datalist id={`modeller-${secili}`}>
              {bilgi.modeller.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <p className="mt-1.5 text-[13px] leading-relaxed text-murekkep-3">
              Listeden seçebilir ya da elle yazabilirsin. "Model bulunamadı (404)" hatası alırsan
              buradan güncelle.
            </p>
          </div>

          {mesaj && (
            <p className="rounded-[7px] bg-adacayi-soft px-3.5 py-2.5 text-[13.5px] text-adacayi-koyu">
              {mesaj}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-4 border-t border-cizgi pt-4">
            <button
              onClick={kaydet}
              className="rounded-[7px] bg-kiremit px-5 py-2.5 text-[14.5px] font-medium text-white transition-opacity duration-200 hover:opacity-90"
            >
              Kaydet ve kullan
            </button>
            <button
              onClick={() => {
                anahtarSil(secili)
                setAnahtar('')
                guncellendi()
                setMesaj('Anahtar silindi.')
              }}
              className="text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
