import { useState } from 'react'
import { useKimlik } from '../lib/kimlik'
import { SayfaBasligi, Bos, Dugme } from '../ui/Parcalar'
import { Segment } from '../ui/Kontroller'
import Basliklar from './forum/Basliklar'
import Arkadaslar from './forum/Arkadaslar'
import Mesajlar from './forum/Mesajlar'
import Kimlik from './forum/Kimlik'
import { bolumBul } from '../ui/bolumler'

type ForumSekme = 'basliklar' | 'arkadaslar' | 'mesajlar'

export default function Forum() {
  const kimlik = useKimlik()
  const [girisPaneliAcik, setGirisPaneliAcik] = useState(false)
  const [sekme, setSekme] = useState<ForumSekme>('basliklar')
  const [mesajHedefi, setMesajHedefi] = useState<{ uid: string; ad: string } | null>(null)

  if (!kimlik.yapilandirilmis) {
    return (
      <div className="kademe">
        <SayfaBasligi etiket="Forum" renk={bolumBul('forum').metin} baslik="Forum henüz kurulmadı" />
        <Bos
          baslik="Backend bağlanmamış"
          aciklama="Bu özellik için ücretsiz bir Firebase projesi gerekiyor. README.md'deki 'Forum kurulumu' bölümünü izleyip proje köküne bir .env.local dosyası ekle."
        />
      </div>
    )
  }

  if (kimlik.yukleniyor) {
    return <div className="kademe etiket py-24 text-center">Yükleniyor…</div>
  }

  if (kimlik.kullanici && kimlik.profilHatasi) {
    return (
      <div className="kademe">
        <SayfaBasligi etiket="Forum" renk={bolumBul('forum').metin} baslik="Profilin yüklenemedi" />
        <Bos
          baslik="Bağlantı sorunu"
          aciklama="Giriş yaptın ama profil bilgin okunamadı. İnternet bağlantını kontrol edip tekrar dene."
        />
        <Dugme onClick={kimlik.profiliYenidenDene} className="mt-4">
          Tekrar dene
        </Dugme>
      </div>
    )
  }

  if (!kimlik.kullanici || !kimlik.profil) {
    return (
      <div className="kademe">
        <SayfaBasligi
          etiket="Forum"
          renk={bolumBul('forum').metin}
          baslik="Teknik sorular sor, cevap ver, arkadaş edin"
          aciklama="Forum tamamen anonimdir: e-postan hiçbir yerde görünmez, diğer kullanıcılar seni yalnızca seçtiğin takma adla görür. Katılmak için ücretsiz bir hesap aç."
        />
        <Dugme onClick={() => setGirisPaneliAcik(true)}>Giriş yap / Hesap oluştur</Dugme>
        <Kimlik acik={girisPaneliAcik} kapat={() => setGirisPaneliAcik(false)} kimlik={kimlik} />
      </div>
    )
  }

  const { uid, takmaAd } = kimlik.profil

  return (
    <div className="kademe">
      <SayfaBasligi
        etiket="Forum"
        renk={bolumBul('forum').metin}
        baslik="Teknik sorular sor, cevap ver, arkadaş edin"
        aciklama="Ahlaki sınırlar içinde kal: hakaret, ayrımcılık ve taciz içeren içerik kaldırılır. Uygunsuz gördüğünü 'Bildir' ile işaretle."
        sag={
          <div className="text-right">
            <div className="text-[14px] font-medium text-murekkep">{takmaAd}</div>
            <button
              onClick={() => void kimlik.cikisYap()}
              className="text-[12.5px] font-medium text-murekkep-3 transition-colors hover:text-kiremit-koyu"
            >
              Çıkış yap
            </button>
          </div>
        }
      />

      <div className="mb-6">
        <Segment
          secenekler={[
            { deger: 'basliklar', ad: 'Başlıklar' },
            { deger: 'arkadaslar', ad: 'Arkadaşlar' },
            { deger: 'mesajlar', ad: 'Mesajlar' },
          ]}
          secili={sekme}
          degistir={setSekme}
        />
      </div>

      {sekme === 'basliklar' && <Basliklar uid={uid} takmaAd={takmaAd} />}
      {sekme === 'arkadaslar' && (
        <Arkadaslar
          uid={uid}
          takmaAd={takmaAd}
          mesajBaslat={(hedefUid, hedefAd) => {
            setMesajHedefi({ uid: hedefUid, ad: hedefAd })
            setSekme('mesajlar')
          }}
        />
      )}
      {sekme === 'mesajlar' && (
        <Mesajlar
          uid={uid}
          takmaAd={takmaAd}
          baslangicHedefi={mesajHedefi}
          hedefTuketildi={() => setMesajHedefi(null)}
        />
      )}
    </div>
  )
}
