import { useState } from 'react'
import type { KimlikDurumu } from '../../lib/kimlik'
import { Segment } from '../../ui/Kontroller'
import { Dugme } from '../../ui/Parcalar'

interface Props {
  acik: boolean
  kapat: () => void
  kimlik: KimlikDurumu
}

export default function Kimlik({ acik, kapat, kimlik }: Props) {
  const [mod, setMod] = useState<'giris' | 'kayit'>('giris')
  const [eposta, setEposta] = useState('')
  const [sifre, setSifre] = useState('')
  const [takmaAd, setTakmaAd] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  if (!acik) return null

  async function gonder() {
    setHata('')
    if (!eposta.trim() || !sifre) {
      setHata('E-posta ve şifre gerekli.')
      return
    }
    setGonderiliyor(true)
    try {
      if (mod === 'kayit') await kimlik.kayitOl(eposta, sifre, takmaAd)
      else await kimlik.girisYap(eposta, sifre)
      kapat()
      setSifre('')
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
        className="animasyon-sayfa my-10 w-full max-w-md overflow-hidden rounded-[10px] border border-cizgi bg-kart"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-6 border-b border-cizgi px-6 py-4">
          <div>
            <div className="etiket">Forum</div>
            <h2 className="mt-1 text-[22px] leading-tight text-murekkep">
              {mod === 'kayit' ? 'Hesap oluştur' : 'Giriş yap'}
            </h2>
          </div>
          <button
            onClick={kapat}
            className="shrink-0 pt-1 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
          >
            Kapat
          </button>
        </div>

        <div className="space-y-4 px-6 py-5">
          <Segment
            secenekler={[
              { deger: 'giris', ad: 'Giriş yap' },
              { deger: 'kayit', ad: 'Hesap oluştur' },
            ]}
            secili={mod}
            degistir={setMod}
          />

          <p className="text-[13.5px] leading-relaxed text-murekkep-3">
            Forumda tamamen anonimsin: e-posta yalnızca giriş içindir ve kimseye gösterilmez.
            Diğer kullanıcılar seni yalnızca aşağıda seçeceğin <strong>takma adla</strong> görür.
          </p>

          {mod === 'kayit' && (
            <div>
              <label className="etiket mb-1.5 block">Takma ad</label>
              <input
                value={takmaAd}
                onChange={(e) => setTakmaAd(e.target.value)}
                placeholder="ör. GölgeliCephe"
                spellCheck={false}
                className="alan"
              />
            </div>
          )}

          <div>
            <label className="etiket mb-1.5 block">E-posta</label>
            <input
              type="email"
              value={eposta}
              onChange={(e) => setEposta(e.target.value)}
              placeholder="sen@ornek.com"
              autoComplete="email"
              className="alan sayi"
            />
          </div>

          <div>
            <label className="etiket mb-1.5 block">Şifre</label>
            <input
              type="password"
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder={mod === 'kayit' ? 'en az 6 karakter' : '••••••••'}
              autoComplete={mod === 'kayit' ? 'new-password' : 'current-password'}
              className="alan sayi"
              onKeyDown={(e) => e.key === 'Enter' && void gonder()}
            />
          </div>

          {hata && (
            <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-kiremit-koyu">
              {hata}
            </p>
          )}

          <Dugme onClick={() => void gonder()} disabled={gonderiliyor} className="w-full">
            {gonderiliyor ? 'Gönderiliyor…' : mod === 'kayit' ? 'Hesap oluştur' : 'Giriş yap'}
          </Dugme>
        </div>
      </div>
    </div>
  )
}
