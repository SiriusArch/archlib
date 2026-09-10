import { useEffect, useRef, useState } from 'react'
import type { SohbetMesaji, SohbetOzeti } from '../../types'
import { mesajGonder, mesajlariDinle, sohbetiBaslat, sohbetleriDinle } from '../../lib/sosyal'
import { raporOlustur } from '../../lib/moderasyon'
import { goreliZaman } from '../../lib/zaman'
import { BolumBasligi, Bos, Dugme } from '../../ui/Parcalar'

export default function Mesajlar({
  uid,
  takmaAd,
  baslangicHedefi,
  hedefTuketildi,
}: {
  uid: string
  takmaAd: string
  baslangicHedefi: { uid: string; ad: string } | null
  hedefTuketildi: () => void
}) {
  const [sohbetler, setSohbetler] = useState<SohbetOzeti[]>([])
  const [aktifId, setAktifId] = useState<string | null>(null)
  const [mesajlar, setMesajlar] = useState<SohbetMesaji[]>([])
  const [yeniMesaj, setYeniMesaj] = useState('')
  const [hata, setHata] = useState('')
  const sonRef = useRef<HTMLDivElement>(null)

  useEffect(() => sohbetleriDinle(uid, setSohbetler), [uid])

  useEffect(() => {
    if (!baslangicHedefi) return
    let iptal = false
    sohbetiBaslat(uid, takmaAd, baslangicHedefi.uid, baslangicHedefi.ad).then((id) => {
      if (!iptal) setAktifId(id)
    })
    hedefTuketildi()
    return () => {
      iptal = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baslangicHedefi])

  useEffect(() => {
    if (!aktifId) return
    return mesajlariDinle(aktifId, setMesajlar)
  }, [aktifId])

  useEffect(() => {
    sonRef.current?.scrollIntoView({ block: 'end' })
  }, [mesajlar])

  const aktifSohbet = sohbetler.find((s) => s.id === aktifId)

  async function gonder() {
    if (!aktifId || !yeniMesaj.trim()) return
    setHata('')
    try {
      await mesajGonder(aktifId, uid, yeniMesaj)
      setYeniMesaj('')
    } catch (e) {
      setHata((e as Error).message)
    }
  }

  return (
    <div>
      <BolumBasligi>Mesajlar</BolumBasligi>
      {sohbetler.length === 0 ? (
        <Bos
          baslik="Henüz sohbetin yok"
          aciklama="Arkadaşlar sekmesinden bir arkadaşına 'Mesaj' diyerek başlat."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-[220px_1fr]">
          <div className="space-y-1.5">
            {sohbetler.map((s) => (
              <button
                key={s.id}
                onClick={() => setAktifId(s.id)}
                className={`block w-full rounded-[7px] border px-3.5 py-2.5 text-left transition-colors ${
                  s.id === aktifId
                    ? 'border-mavi bg-mavi-soft'
                    : 'border-cizgi bg-kart hover:border-cizgi-2'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="truncate text-[14px] font-medium text-murekkep">{s.digerAd}</span>
                  <span className="shrink-0 text-[11.5px] text-murekkep-3">
                    {goreliZaman(s.sonMesajTarih)}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-murekkep-3">{s.sonMesaj}</p>
              </button>
            ))}
          </div>

          <div className="flex min-h-[420px] flex-col rounded-[8px] border border-cizgi bg-kart">
            {!aktifSohbet ? (
              <div className="flex flex-1 items-center justify-center text-[14px] text-murekkep-3">
                Bir sohbet seç
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between border-b border-cizgi px-4 py-3">
                  <span className="text-[14.5px] font-medium text-murekkep">
                    {aktifSohbet.digerAd}
                  </span>
                  <button
                    onClick={() =>
                      void raporOlustur('mesaj', aktifSohbet.id, uid, 'uygunsuz sohbet')
                    }
                    className="text-[12.5px] font-medium text-murekkep-3 hover:text-kiremit-koyu"
                  >
                    Bildir
                  </button>
                </div>
                <div className="flex-1 space-y-2.5 overflow-y-auto px-4 py-3">
                  {mesajlar.map((m) => (
                    <div
                      key={m.id}
                      className={`max-w-[75%] rounded-[8px] px-3.5 py-2 text-[14px] leading-relaxed whitespace-pre-wrap ${
                        m.gonderenId === uid
                          ? 'ml-auto bg-mavi-soft text-murekkep'
                          : 'bg-kagit-2 text-murekkep-2'
                      }`}
                    >
                      {m.icerik}
                    </div>
                  ))}
                  <div ref={sonRef} />
                </div>
                <div className="border-t border-cizgi p-3">
                  {hata && <p className="mb-2 text-[13px] text-kiremit-koyu">{hata}</p>}
                  <div className="flex gap-2">
                    <input
                      value={yeniMesaj}
                      onChange={(e) => setYeniMesaj(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && void gonder()}
                      placeholder="Mesaj yaz…"
                      className="alan flex-1"
                    />
                    <Dugme onClick={() => void gonder()} disabled={!yeniMesaj.trim()}>
                      Gönder
                    </Dugme>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
