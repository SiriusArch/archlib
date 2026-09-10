import { useState } from 'react'
import type { KimlikDurumu } from '../../lib/kimlik'
import { Segment } from '../../ui/Kontroller'
import { Dugme } from '../../ui/Parcalar'
import { Portal } from '../../ui/Portal'

interface Props {
  acik: boolean
  kapat: () => void
  kimlik: KimlikDurumu
}

/** Takma ad secme adimi — Google/Microsoft ile ilk girişten sonra gösterilir. */
function TakmaAdAdimi({ kimlik, kapat }: { kimlik: KimlikDurumu; kapat: () => void }) {
  const [takmaAd, setTakmaAd] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)

  async function onayla() {
    setHata('')
    setGonderiliyor(true)
    try {
      await kimlik.takmaAdBelirle(takmaAd)
      kapat()
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setGonderiliyor(false)
    }
  }

  return (
    <>
      <div className="flex items-start justify-between gap-6 border-b border-cizgi px-6 py-4">
        <div>
          <div className="etiket">Forum</div>
          <h2 className="mt-1 text-[22px] leading-tight text-murekkep">Takma ad seç</h2>
        </div>
        <button
          onClick={() => void kimlik.cikisYap().then(kapat)}
          className="shrink-0 pt-1 text-[13px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
        >
          Çıkış yap
        </button>
      </div>
      <div className="space-y-4 px-6 py-5">
        <p className="text-[13.5px] leading-relaxed text-murekkep-3">
          Giriş yaptığın hesabın gerçek adı ya da e-postası forumda <strong>hiçbir yerde</strong>{' '}
          kullanılmaz. Diğer kullanıcıların seni göreceği tek isim, aşağıda seçeceğin takma ad.
        </p>
        <div>
          <label className="etiket mb-1.5 block">Takma ad</label>
          <input
            value={takmaAd}
            onChange={(e) => setTakmaAd(e.target.value)}
            placeholder="ör. GölgeliCephe"
            spellCheck={false}
            autoFocus
            className="alan"
            onKeyDown={(e) => e.key === 'Enter' && void onayla()}
          />
        </div>
        {hata && (
          <p className="rounded-[7px] bg-kiremit-soft px-3.5 py-2.5 text-[13.5px] leading-relaxed text-kiremit-koyu">
            {hata}
          </p>
        )}
        <Dugme onClick={() => void onayla()} disabled={gonderiliyor} className="w-full">
          {gonderiliyor ? 'Kaydediliyor…' : 'Devam et'}
        </Dugme>
      </div>
    </>
  )
}

export default function Kimlik({ acik, kapat, kimlik }: Props) {
  const [mod, setMod] = useState<'giris' | 'kayit'>('giris')
  const [eposta, setEposta] = useState('')
  const [sifre, setSifre] = useState('')
  const [takmaAd, setTakmaAd] = useState('')
  const [hata, setHata] = useState('')
  const [gonderiliyor, setGonderiliyor] = useState(false)
  const [oauthGonderiliyor, setOauthGonderiliyor] = useState<'google' | 'microsoft' | null>(null)

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

  async function oauthGonder(saglayici: 'google' | 'microsoft') {
    setHata('')
    setOauthGonderiliyor(saglayici)
    try {
      if (saglayici === 'google') await kimlik.googleIleGirisYap()
      else await kimlik.microsoftIleGirisYap()
      // Yeni kullanicida takmaAdGerekli true olur; modal acik kalir ve
      // Kimlik bilesenindeki takmaAdGerekli kontrolu devreye girer. Mevcut
      // kullanicida profil zaten var, kapatabiliriz.
      if (!kimlik.takmaAdGerekli) kapat()
    } catch (e) {
      setHata((e as Error).message)
    } finally {
      setOauthGonderiliyor(null)
    }
  }

  return (
    <Portal>
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-murekkep/40 p-4 backdrop-blur-[3px]"
      onClick={kapat}
    >
      <div
        className="animasyon-sayfa my-6 max-h-[calc(100vh-3rem)] w-full max-w-md overflow-y-auto rounded-[10px] border border-cizgi bg-kart"
        onClick={(e) => e.stopPropagation()}
      >
        {kimlik.takmaAdGerekli ? (
          <TakmaAdAdimi kimlik={kimlik} kapat={kapat} />
        ) : (
          <>
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
              <p className="text-[13.5px] leading-relaxed text-murekkep-3">
                Forumda tamamen anonimsin: e-posta ya da hangi yöntemle girdiğin kimseye
                gösterilmez. Diğer kullanıcılar seni yalnızca seçeceğin <strong>takma adla</strong>{' '}
                görür.
              </p>

              <div className="space-y-2">
                <Dugme
                  tur="ikincil"
                  onClick={() => void oauthGonder('google')}
                  disabled={oauthGonderiliyor !== null}
                  className="w-full"
                >
                  {oauthGonderiliyor === 'google' ? 'Bağlanıyor…' : 'Google ile devam et'}
                </Dugme>
                <Dugme
                  tur="ikincil"
                  onClick={() => void oauthGonder('microsoft')}
                  disabled={oauthGonderiliyor !== null}
                  className="w-full"
                >
                  {oauthGonderiliyor === 'microsoft' ? 'Bağlanıyor…' : 'Microsoft ile devam et'}
                </Dugme>
              </div>

              <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-cizgi" />
                <span className="etiket text-murekkep-3">veya e-posta ile</span>
                <span className="h-px flex-1 bg-cizgi" />
              </div>

              <Segment
                secenekler={[
                  { deger: 'giris', ad: 'Giriş yap' },
                  { deger: 'kayit', ad: 'Hesap oluştur' },
                ]}
                secili={mod}
                degistir={setMod}
              />

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

              <Dugme
                onClick={() => void gonder()}
                disabled={gonderiliyor || oauthGonderiliyor !== null}
                className="w-full"
              >
                {gonderiliyor ? 'Gönderiliyor…' : mod === 'kayit' ? 'Hesap oluştur' : 'Giriş yap'}
              </Dugme>
            </div>
          </>
        )}
      </div>
    </div>
    </Portal>
  )
}
