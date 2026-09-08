import { useEffect, useState } from 'react'
import type { Saglayici } from '../types'
import { SAGLAYICILAR, saglayiciBul } from '../lib/llm'
import { anahtarlariOku, anahtarYaz, anahtarSil, aktifSaglayiciYaz } from '../lib/storage'

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
    if (!acik) return
    const kayitlar = anahtarlariOku()
    const k = kayitlar[secili]
    setAnahtar(k?.anahtar ?? '')
    setModel(k?.model ?? saglayiciBul(secili).varsayilanModel)
    setMesaj('')
  }, [acik, secili])

  useEffect(() => {
    if (acik) setSecili(aktif)
  }, [acik, aktif])

  if (!acik) return null

  const bilgi = saglayiciBul(secili)
  const kayitli = anahtarlariOku()

  function kaydet() {
    if (!anahtar.trim()) {
      setMesaj('Anahtar bos olamaz.')
      return
    }
    anahtarYaz({ saglayici: secili, anahtar: anahtar.trim(), model: model.trim() || bilgi.varsayilanModel })
    aktifSaglayiciYaz(secili)
    aktifDegisti(secili)
    guncellendi()
    setMesaj('Kaydedildi. Anahtar yalnizca bu tarayicida saklanir.')
  }

  function sil() {
    anahtarSil(secili)
    setAnahtar('')
    guncellendi()
    setMesaj('Anahtar silindi.')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-[#14181f]/60 p-4 backdrop-blur-sm"
      onClick={kapat}
    >
      <div
        className="my-8 w-full max-w-2xl border border-[#cfc9bc] bg-[#f6f4ef] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#cfc9bc] px-6 py-4">
          <h2 className="mono text-sm font-bold tracking-[0.14em] uppercase">API Anahtari</h2>
          <button
            onClick={kapat}
            className="mono px-2 text-lg leading-none text-[#2c333d] hover:text-[#b4472a]"
            aria-label="Kapat"
          >
            X
          </button>
        </div>

        <div className="space-y-5 px-6 py-5">
          <p className="text-sm leading-relaxed text-[#2c333d]">
            ArchLib in sunucusu yoktur. Analiz istegi tarayicindan dogrudan sectigin saglayiciya
            gider; anahtarin yalnizca bu tarayicinin <span className="mono">localStorage</span>{' '}
            alaninda saklanir, hicbir yere gonderilmez. Token maliyetini kendi hesabin karsilar.
          </p>

          <div>
            <div className="mono mb-2 text-[11px] font-bold tracking-[0.14em] text-[#2c333d] uppercase">
              Saglayici
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              {SAGLAYICILAR.map((s) => {
                const varMi = Boolean(kayitli[s.id]?.anahtar)
                return (
                  <button
                    key={s.id}
                    onClick={() => setSecili(s.id)}
                    className={`border px-3 py-2.5 text-left text-sm transition ${
                      secili === s.id
                        ? 'border-[#b4472a] bg-[#b4472a]/10'
                        : 'border-[#cfc9bc] bg-white/50 hover:border-[#a89f8c]'
                    }`}
                  >
                    <div className="font-semibold">{s.ad}</div>
                    <div className="mono mt-0.5 text-[10px] tracking-wider text-[#2c333d]/70">
                      {varMi ? 'ANAHTAR KAYITLI' : 'ANAHTAR YOK'}
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          <p className="border-l-2 border-[#cfc9bc] pl-3 text-xs leading-relaxed text-[#2c333d]/85">
            {bilgi.not}
          </p>

          <div>
            <label className="mono mb-1.5 block text-[11px] font-bold tracking-[0.14em] uppercase">
              API Anahtari
            </label>
            <div className="flex gap-2">
              <input
                type={goster ? 'text' : 'password'}
                value={anahtar}
                onChange={(e) => setAnahtar(e.target.value)}
                placeholder={bilgi.anahtarOnEk ? `${bilgi.anahtarOnEk}...` : 'AIza...'}
                autoComplete="off"
                spellCheck={false}
                className="mono w-full border border-[#cfc9bc] bg-white px-3 py-2 text-sm outline-none focus:border-[#b4472a]"
              />
              <button
                onClick={() => setGoster((g) => !g)}
                className="mono border border-[#cfc9bc] px-3 text-[11px] tracking-wider whitespace-nowrap hover:border-[#a89f8c]"
              >
                {goster ? 'GIZLE' : 'GOSTER'}
              </button>
            </div>
            <a
              href={bilgi.anahtarAdresi}
              target="_blank"
              rel="noreferrer noopener"
              className="mt-1.5 inline-block text-xs text-[#b4472a] underline underline-offset-2"
            >
              Anahtari buradan al
            </a>
          </div>

          <div>
            <label className="mono mb-1.5 block text-[11px] font-bold tracking-[0.14em] uppercase">
              Model
            </label>
            <input
              list={`modeller-${secili}`}
              value={model}
              onChange={(e) => setModel(e.target.value)}
              spellCheck={false}
              className="mono w-full border border-[#cfc9bc] bg-white px-3 py-2 text-sm outline-none focus:border-[#b4472a]"
            />
            <datalist id={`modeller-${secili}`}>
              {bilgi.modeller.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            <p className="mt-1.5 text-xs text-[#2c333d]/70">
              Listeden secebilir ya da elle yazabilirsin. Model adlari saglayici tarafinda
              degisebilir; "model bulunamadi" hatasi alirsan buradan guncelle.
            </p>
          </div>

          {mesaj && (
            <div className="border border-[#cfc9bc] bg-white/70 px-3 py-2 text-xs text-[#2c333d]">
              {mesaj}
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-[#cfc9bc] pt-4">
            <button
              onClick={kaydet}
              className="mono bg-[#14181f] px-5 py-2.5 text-[11px] font-bold tracking-[0.14em] text-[#f6f4ef] uppercase hover:bg-[#b4472a]"
            >
              Kaydet ve Kullan
            </button>
            <button
              onClick={sil}
              className="mono border border-[#cfc9bc] px-4 py-2.5 text-[11px] tracking-[0.14em] uppercase hover:border-[#b4472a] hover:text-[#b4472a]"
            >
              Sil
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
