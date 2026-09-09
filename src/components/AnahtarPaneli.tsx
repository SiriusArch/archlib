import { useEffect, useState } from 'react'
import type { Saglayici } from '../types'
import { SAGLAYICILAR, saglayiciBul } from '../lib/llm'
import { anahtarlariOku, anahtarYaz, anahtarSil, aktifSaglayiciYaz } from '../lib/storage'
import { Dugme } from '../ui/Parcalar'

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
      setMesaj('Anahtar bos olamaz.')
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
    setMesaj('Kaydedildi. Anahtar yalnizca bu tarayicida saklanir.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-murekkep/45 p-4 backdrop-blur-[3px]"
      onClick={kapat}
    >
      <div
        className="animasyon-sayfa my-10 w-full max-w-2xl border border-cizgi bg-kagit"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-cizgi px-7 py-5">
          <div>
            <div className="etiket text-murekkep-3">Baglanti</div>
            <h2 className="font-baslik mt-1.5 text-[24px] leading-tight text-murekkep">
              API anahtari
            </h2>
          </div>
          <button
            onClick={kapat}
            className="etiket pt-1 text-murekkep-3 transition-colors hover:text-kiremit"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-7 px-7 py-6">
          <p className="max-w-xl text-[13.5px] leading-relaxed text-murekkep-2">
            ArchLib in sunucusu yoktur. Analiz istegi tarayicindan dogrudan sectigin saglayiciya
            gider; anahtarin yalnizca bu tarayicinin{' '}
            <code className="bg-kagit-3 px-1 py-0.5 text-[12px]">localStorage</code> alaninda
            saklanir, hicbir yere gonderilmez. Token maliyetini kendi hesabin karsilar.
          </p>

          <div>
            <div className="etiket mb-3 text-murekkep-3">Saglayici</div>
            <div className="grid gap-0 sm:grid-cols-3">
              {SAGLAYICILAR.map((s) => {
                const varMi = Boolean(kayitli[s.id]?.anahtar)
                const seciliMi = secili === s.id
                return (
                  <button
                    key={s.id}
                    onClick={() => setSecili(s.id)}
                    className="group relative border-t border-cizgi py-3 pr-4 text-left sm:border-t-0"
                  >
                    <span
                      className={`font-baslik block text-[16px] transition-colors duration-300 ${
                        seciliMi ? 'text-murekkep' : 'text-murekkep-3 group-hover:text-murekkep-2'
                      }`}
                    >
                      {s.ad}
                    </span>
                    <span className="etiket mt-1 block text-murekkep-3">
                      {varMi ? 'kayitli' : 'bos'}
                    </span>
                    <span
                      className={`absolute -top-px left-0 h-[2px] w-[calc(100%-1rem)] origin-left bg-kiremit transition-transform duration-400 ease-[cubic-bezier(0.22,1,0.36,1)] sm:top-auto sm:-bottom-1 ${
                        seciliMi ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                      }`}
                    />
                  </button>
                )
              })}
            </div>
            <p className="mt-4 border-l-2 border-cizgi pl-3 text-[12.5px] leading-relaxed text-murekkep-2">
              {bilgi.not}
            </p>
          </div>

          <div>
            <label className="etiket mb-2 block text-murekkep-3">Anahtar</label>
            <div className="flex items-end gap-3">
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
                className="etiket shrink-0 pb-2 text-murekkep-3 transition-colors hover:text-murekkep"
              >
                {goster ? 'gizle' : 'goster'}
              </button>
            </div>
            <a
              href={bilgi.anahtarAdresi}
              target="_blank"
              rel="noreferrer noopener"
              className="etiket mt-2 inline-block text-kiremit-koyu underline decoration-kiremit/40 underline-offset-4"
            >
              Anahtari buradan al
            </a>
          </div>

          <div>
            <label className="etiket mb-2 block text-murekkep-3">Model</label>
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
            <p className="mt-2 text-[12.5px] leading-relaxed text-murekkep-3">
              Listeden secebilir ya da elle yazabilirsin. "Model bulunamadi (404)" hatasi alirsan
              buradan guncelle.
            </p>
          </div>

          {mesaj && <p className="text-[13px] text-adacayi-koyu">{mesaj}</p>}

          <div className="flex flex-wrap items-center gap-4 border-t border-cizgi pt-5">
            <Dugme onClick={kaydet} dolgu="bg-kiremit">
              Kaydet ve kullan
            </Dugme>
            <button
              onClick={() => {
                anahtarSil(secili)
                setAnahtar('')
                guncellendi()
                setMesaj('Anahtar silindi.')
              }}
              className="etiket text-murekkep-3 transition-colors hover:text-kiremit-koyu"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
