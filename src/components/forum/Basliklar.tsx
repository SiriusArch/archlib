import { useEffect, useMemo, useState } from 'react'
import type { ForumBasligi, ForumCevap, ForumKategori } from '../../types'
import { FORUM_KATEGORI_ADI, basliklariDinle, basligOlustur, basligiSil, cevapEkle, cevabiSil, cevaplariDinle } from '../../lib/forum'
import { raporOlustur } from '../../lib/moderasyon'
import { goreliZaman } from '../../lib/zaman'
import { BolumBasligi, Bos, Dugme, Kart, Rozet } from '../../ui/Parcalar'

const KATEGORILER = Object.keys(FORUM_KATEGORI_ADI) as ForumKategori[]

function YeniBaslikFormu({
  yazarId,
  yazarAdi,
  kapat,
}: {
  yazarId: string
  yazarAdi: string
  kapat: () => void
}) {
  const [baslik, setBaslik] = useState('')
  const [icerik, setIcerik] = useState('')
  const [kategori, setKategori] = useState<ForumKategori>('genel')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  async function gonder() {
    setHata('')
    setGonderiliyor(true)
    try {
      await basligOlustur(baslik, icerik, kategori, yazarId, yazarAdi)
      kapat()
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setGonderiliyor(false)
    }
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
          <h2 className="text-[20px] leading-tight text-murekkep">Yeni başlık</h2>
          <button
            onClick={kapat}
            className="shrink-0 pt-1 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
          >
            Kapat
          </button>
        </div>
        <div className="space-y-3.5 px-6 py-5">
          <select
            value={kategori}
            onChange={(e) => setKategori(e.target.value as ForumKategori)}
            className="alan"
          >
            {KATEGORILER.map((k) => (
              <option key={k} value={k}>
                {FORUM_KATEGORI_ADI[k]}
              </option>
            ))}
          </select>
          <input
            value={baslik}
            onChange={(e) => setBaslik(e.target.value)}
            placeholder="Başlık (ör. Betonarme kolon boyutlandırmada hata mı yapıyorum?)"
            className="alan"
          />
          <textarea
            value={icerik}
            onChange={(e) => setIcerik(e.target.value)}
            rows={6}
            placeholder="Sorunu ya da konuyu anlat. Teknik ve saygılı bir dil kullan."
            className="alan"
          />
          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] text-kiremit-koyu">
              {hata}
            </p>
          )}
          <Dugme onClick={() => void gonder()} disabled={gonderiliyor} className="w-full">
            {gonderiliyor ? 'Paylaşılıyor…' : 'Paylaş'}
          </Dugme>
        </div>
      </div>
    </div>
  )
}

function BaslikDetayi({
  baslik,
  uid,
  takmaAd,
  kapat,
}: {
  baslik: ForumBasligi
  uid: string
  takmaAd: string
  kapat: () => void
}) {
  const [cevaplar, setCevaplar] = useState<ForumCevap[]>([])
  const [yeniCevap, setYeniCevap] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  useEffect(() => cevaplariDinle(baslik.id, setCevaplar), [baslik.id])

  async function cevapGonder() {
    setHata('')
    setGonderiliyor(true)
    try {
      await cevapEkle(baslik.id, yeniCevap, uid, takmaAd)
      setYeniCevap('')
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setGonderiliyor(false)
    }
  }

  async function baslikSilmeyiDene() {
    try {
      await basligiSil(baslik.id)
      kapat()
    } catch (e) {
      setHata((e as Error).message || 'Başlık silinemedi.')
    }
  }

  async function cevapSilmeyiDene(cevapId: string) {
    try {
      await cevabiSil(baslik.id, cevapId)
    } catch (e) {
      setHata((e as Error).message || 'Cevap silinemedi.')
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-murekkep/45 p-4 backdrop-blur-[3px]"
      onClick={kapat}
    >
      <div
        className="animasyon-sayfa my-10 w-full max-w-2xl overflow-hidden rounded-[10px] border border-cizgi bg-kart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-cizgi px-7 py-5">
          <div>
            <div className="etiket text-mavi-koyu">{FORUM_KATEGORI_ADI[baslik.kategori]}</div>
            <h2 className="mt-1.5 text-[24px] leading-tight text-murekkep">{baslik.baslik}</h2>
            <p className="mt-1 text-[13px] text-murekkep-3">
              {baslik.yazarAdi} · {goreliZaman(baslik.tarih)}
            </p>
          </div>
          <button
            onClick={kapat}
            className="etiket shrink-0 pt-1 text-murekkep-3 transition-colors hover:text-kiremit"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-6 px-7 py-6">
          <p className="text-[16px] leading-relaxed whitespace-pre-wrap text-murekkep-2">
            {baslik.icerik}
          </p>

          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] text-kiremit-koyu">
              {hata}
            </p>
          )}

          <div className="flex flex-wrap gap-4 border-t border-cizgi pt-4 text-[13px]">
            {baslik.yazarId === uid ? (
              <button
                onClick={() => void baslikSilmeyiDene()}
                className="font-medium text-kiremit-koyu transition-colors hover:text-kiremit"
              >
                Başlığı sil
              </button>
            ) : (
              <button
                onClick={() => void raporOlustur('forum-basligi', baslik.id, uid, 'uygunsuz içerik')}
                className="font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
              >
                Bildir
              </button>
            )}
          </div>

          <section>
            <h3 className="etiket mb-3 text-murekkep-3">{cevaplar.length} cevap</h3>
            <div className="space-y-3">
              {cevaplar.map((c) => (
                <div key={c.id} className="rounded-[7px] border border-cizgi bg-kagit px-4 py-3">
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <span className="text-[13.5px] font-medium text-murekkep">{c.yazarAdi}</span>
                    <span className="text-[12px] text-murekkep-3">{goreliZaman(c.tarih)}</span>
                  </div>
                  <p className="text-[14.5px] leading-relaxed whitespace-pre-wrap text-murekkep-2">
                    {c.icerik}
                  </p>
                  <div className="mt-1.5 flex gap-3 text-[12px]">
                    {c.yazarId === uid ? (
                      <button
                        onClick={() => void cevapSilmeyiDene(c.id)}
                        className="font-medium text-murekkep-3 hover:text-kiremit-koyu"
                      >
                        Sil
                      </button>
                    ) : (
                      <button
                        onClick={() => void raporOlustur('forum-cevabi', c.id, uid, 'uygunsuz içerik')}
                        className="font-medium text-murekkep-3 hover:text-kiremit-koyu"
                      >
                        Bildir
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {cevaplar.length === 0 && (
                <p className="text-[14px] text-murekkep-3">Henüz cevap yok. İlk cevabı sen yaz.</p>
              )}
            </div>
          </section>

          <div className="border-t border-cizgi pt-4">
            <textarea
              value={yeniCevap}
              onChange={(e) => setYeniCevap(e.target.value)}
              rows={3}
              placeholder="Cevabını yaz…"
              className="alan"
            />
            <Dugme
              onClick={() => void cevapGonder()}
              disabled={gonderiliyor || !yeniCevap.trim()}
              className="mt-2.5"
            >
              Cevapla
            </Dugme>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Basliklar({ uid, takmaAd }: { uid: string; takmaAd: string }) {
  const [basliklar, setBasliklar] = useState<ForumBasligi[]>([])
  const [kategori, setKategori] = useState<ForumKategori | 'hepsi'>('hepsi')
  const [arama, setArama] = useState('')
  const [yeniAcik, setYeniAcik] = useState(false)
  const [secili, setSecili] = useState<ForumBasligi | null>(null)

  useEffect(() => basliklariDinle(kategori, setBasliklar), [kategori])

  const filtreli = useMemo(() => {
    const q = arama.trim().toLocaleLowerCase('tr-TR')
    if (!q) return basliklar
    return basliklar.filter((b) => `${b.baslik} ${b.icerik}`.toLocaleLowerCase('tr-TR').includes(q))
  }, [basliklar, arama])

  return (
    <div>
      <BolumBasligi
        sag={<Dugme onClick={() => setYeniAcik(true)}>Yeni başlık</Dugme>}
      >
        Başlıklar
      </BolumBasligi>

      <div className="mb-5 grid gap-3 sm:grid-cols-[1fr_220px]">
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Başlıklarda ara…"
          className="alan"
        />
        <select
          value={kategori}
          onChange={(e) => setKategori(e.target.value as ForumKategori | 'hepsi')}
          className="alan"
        >
          <option value="hepsi">Tüm kategoriler</option>
          {KATEGORILER.map((k) => (
            <option key={k} value={k}>
              {FORUM_KATEGORI_ADI[k]}
            </option>
          ))}
        </select>
      </div>

      {filtreli.length === 0 ? (
        <Bos baslik="Henüz başlık yok" aciklama="İlk soruyu sen sor." />
      ) : (
        <div className="space-y-2.5">
          {filtreli.map((b) => (
            <Kart key={b.id} onClick={() => setSecili(b)} vurgu="bg-mavi" className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Rozet className="border-mavi/45 text-mavi-koyu">
                      {FORUM_KATEGORI_ADI[b.kategori]}
                    </Rozet>
                    <span className="text-[12.5px] text-murekkep-3">{goreliZaman(b.sonAktivite)}</span>
                  </div>
                  <h3 className="mt-1.5 truncate text-[16px] leading-tight text-murekkep">
                    {b.baslik}
                  </h3>
                  <p className="mt-1 text-[13px] text-murekkep-3">{b.yazarAdi}</p>
                </div>
                <div className="sayi shrink-0 text-right text-[13px] text-murekkep-3">
                  <div className="text-[18px] text-murekkep">{b.cevapSayisi}</div>
                  <div>cevap</div>
                </div>
              </div>
            </Kart>
          ))}
        </div>
      )}

      {yeniAcik && (
        <YeniBaslikFormu yazarId={uid} yazarAdi={takmaAd} kapat={() => setYeniAcik(false)} />
      )}
      {secili && (
        <BaslikDetayi baslik={secili} uid={uid} takmaAd={takmaAd} kapat={() => setSecili(null)} />
      )}
    </div>
  )
}
