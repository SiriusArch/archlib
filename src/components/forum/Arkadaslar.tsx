import { useEffect, useState } from 'react'
import type { ArkadasKaydi, ArkadaslikIstegi } from '../../types'
import {
  arkadaslariDinle,
  arkadaslikIstegiGonder,
  arkadaslikSil,
  gelenIstekleriDinle,
  istegiKabulEt,
  istegiReddet,
  kullaniciAra,
} from '../../lib/sosyal'
import { BolumBasligi, Kart } from '../../ui/Parcalar'

export default function Arkadaslar({
  uid,
  takmaAd,
  mesajBaslat,
}: {
  uid: string
  takmaAd: string
  mesajBaslat: (uid: string, ad: string) => void
}) {
  const [arama, setArama] = useState('')
  const [sonuclar, setSonuclar] = useState<{ uid: string; takmaAd: string }[]>([])
  const [ariyor, setAriyor] = useState(false)
  const [mesaj, setMesaj] = useState('')
  const [istekler, setIstekler] = useState<ArkadaslikIstegi[]>([])
  const [arkadaslar, setArkadaslar] = useState<ArkadasKaydi[]>([])

  useEffect(() => gelenIstekleriDinle(uid, setIstekler), [uid])
  useEffect(() => arkadaslariDinle(uid, setArkadaslar), [uid])

  useEffect(() => {
    if (arama.trim().length < 2) {
      setSonuclar([])
      return
    }
    const zamanlayici = window.setTimeout(() => {
      setAriyor(true)
      kullaniciAra(arama, uid)
        .then(setSonuclar)
        .finally(() => setAriyor(false))
    }, 300)
    return () => window.clearTimeout(zamanlayici)
  }, [arama, uid])

  const arkadasUidleri = new Set(arkadaslar.map((a) => a.uid))
  const istekliUidler = new Set(istekler.map((i) => i.gonderenId))

  async function istekGonder(hedefUid: string, hedefAd: string) {
    setMesaj('')
    try {
      await arkadaslikIstegiGonder(uid, takmaAd, hedefUid, hedefAd)
      setMesaj(`${hedefAd} kişisine istek gönderildi.`)
    } catch (e) {
      setMesaj((e as Error).message)
    }
  }

  async function istegiKabulEtmeyiDene(istek: ArkadaslikIstegi) {
    try {
      await istegiKabulEt(istek)
    } catch (e) {
      setMesaj((e as Error).message || 'İstek kabul edilemedi.')
    }
  }

  async function istegiReddetmeyiDene(istekId: string) {
    try {
      await istegiReddet(istekId)
    } catch (e) {
      setMesaj((e as Error).message || 'İstek reddedilemedi.')
    }
  }

  async function arkadaslikSilmeyiDene(istekId: string) {
    try {
      await arkadaslikSil(istekId)
    } catch (e) {
      setMesaj((e as Error).message || 'Arkadaşlıktan çıkarılamadı.')
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <BolumBasligi>Arkadaş ekle</BolumBasligi>
        <input
          value={arama}
          onChange={(e) => setArama(e.target.value)}
          placeholder="Takma ada göre ara (en az 2 harf)…"
          className="alan"
        />
        {mesaj && <p className="mt-2 text-[13.5px] text-murekkep-3">{mesaj}</p>}
        {ariyor && <p className="mt-2 text-[13.5px] text-murekkep-3">Aranıyor…</p>}
        {sonuclar.length > 0 && (
          <div className="mt-3 space-y-2">
            {sonuclar.map((s) => (
              <Kart key={s.uid} className="flex items-center justify-between gap-3 p-3.5">
                <span className="text-[14.5px] text-murekkep">{s.takmaAd}</span>
                {arkadasUidleri.has(s.uid) ? (
                  <span className="text-[13px] text-murekkep-3">arkadaşsınız</span>
                ) : (
                  <button
                    onClick={() => void istekGonder(s.uid, s.takmaAd)}
                    className="text-[13px] font-medium text-mavi-koyu hover:text-mavi"
                  >
                    İstek gönder
                  </button>
                )}
              </Kart>
            ))}
          </div>
        )}
      </section>

      {istekler.length > 0 && (
        <section>
          <BolumBasligi>Gelen istekler</BolumBasligi>
          <div className="space-y-2">
            {istekler.map((i) => (
              <Kart key={i.id} className="flex items-center justify-between gap-3 p-3.5">
                <span className="text-[14.5px] text-murekkep">{i.gonderenAdi}</span>
                <span className="flex gap-3">
                  <button
                    onClick={() => void istegiKabulEtmeyiDene(i)}
                    className="text-[13px] font-medium text-adacayi-koyu hover:text-adacayi"
                  >
                    Kabul et
                  </button>
                  <button
                    onClick={() => void istegiReddetmeyiDene(i.id)}
                    className="text-[13px] font-medium text-murekkep-3 hover:text-kiremit-koyu"
                  >
                    Reddet
                  </button>
                </span>
              </Kart>
            ))}
          </div>
        </section>
      )}

      <section>
        <BolumBasligi>Arkadaşların ({arkadaslar.length})</BolumBasligi>
        {arkadaslar.length === 0 ? (
          <p className="text-[14.5px] text-murekkep-3">
            Henüz arkadaşın yok. Yukarıdan takma adla arayıp istek gönder.
          </p>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {arkadaslar
              .filter((a) => !istekliUidler.has(a.uid))
              .map((a) => (
                <Kart key={a.uid} className="flex items-center justify-between gap-3 p-4">
                  <span className="text-[14.5px] text-murekkep">{a.takmaAd}</span>
                  <span className="flex shrink-0 gap-3">
                    <button
                      onClick={() => mesajBaslat(a.uid, a.takmaAd)}
                      className="text-[13px] font-medium text-mavi-koyu hover:text-mavi"
                    >
                      Mesaj
                    </button>
                    <button
                      onClick={() => void arkadaslikSilmeyiDene(a.istekId)}
                      className="text-[13px] font-medium text-murekkep-3 hover:text-kiremit-koyu"
                    >
                      Çıkar
                    </button>
                  </span>
                </Kart>
              ))}
          </div>
        )}
      </section>
    </div>
  )
}
