import { KAYNAKLAR } from '../data/kritik'
import { SITELER } from '../data/sites'
import { SayfaBasligi, BolumBasligi } from '../ui/Parcalar'

const GUVEN_SINIF: Record<string, string> = {
  yuksek: 'text-adacayi-koyu',
  orta: 'text-kehribar-koyu',
  dusuk: 'text-murekkep-3',
}

export default function Kaynaklar() {
  const ana = KAYNAKLAR.filter((k) => k.rol === 'ana')
  const destek = KAYNAKLAR.filter((k) => k.rol === 'destek')
  const dogrulanmayan = SITELER.filter((s) => s.dogrulama === 'dogrulanmadi')

  return (
    <div className="kademe max-w-4xl">
      <SayfaBasligi
        etiket="06 — Kaynaklar"
        baslik="Hangi bilgi nereden geliyor"
        aciklama={`Bu uygulamanin bilgi tabani ${KAYNAKLAR.length} kaynaktan olusturuldu. Ana kaynaklar dogrudan okunup cikarildi; destek kaynaklar cerceve icin kullanildi. Nereden geldigini bilmen, o bilgiyi juri karsisinda savunabilmen icin gerekli.`}
      />

      <section className="mb-14">
        <BolumBasligi>Ana kaynaklar — veri tabaninin omurgasi</BolumBasligi>
        <div className="border-t border-cizgi">
          {ana.map((k) => (
            <article key={k.id} className="border-b border-cizgi py-5">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                <h3 className="font-baslik text-[21.5px] leading-tight text-murekkep">{k.baslik}</h3>
                <span className={`etiket ${GUVEN_SINIF[k.guven]}`}>guven {k.guven}</span>
              </div>
              <div className="etiket mt-1 text-murekkep-3">
                {k.yazar} · {k.tur}
              </div>
              <p className="mt-3 max-w-3xl text-[15.5px] leading-relaxed text-murekkep-2">{k.not}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <BolumBasligi>Destek kaynaklar — cerceve ve kuram</BolumBasligi>
        <div className="border-t border-cizgi">
          {destek.map((k) => (
            <article key={k.id} className="border-b border-cizgi py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-0.5">
                <h3 className="font-baslik text-[18px] text-murekkep">
                  {k.baslik}
                  <span className="ml-2 text-[14.5px] text-murekkep-3">{k.yazar}</span>
                </h3>
                <span className={`etiket ${GUVEN_SINIF[k.guven]}`}>{k.guven}</span>
              </div>
              <p className="mt-2 max-w-3xl text-[14.5px] leading-relaxed text-murekkep-2">{k.not}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-14 bg-kiremit-soft px-6 py-6">
        <h2 className="etiket mb-3 text-kiremit-koyu">Sinirlar — bunlari bilerek kullan</h2>
        <ul className="space-y-2.5 text-[15.5px] leading-relaxed text-murekkep-2">
          <li>
            Neufert <strong className="font-medium text-murekkep">DIN (Alman) standartlarina</strong>{' '}
            dayanir. Turkiye de ruhsat ve yonetmelik uyumu icin{' '}
            <strong className="font-medium text-murekkep">TS standartlari ve yerel imar yonetmeligi</strong>{' '}
            esas alinmalidir. Buradaki olculer tasarim rehberidir, yasal dayanak degildir.
          </li>
          <li>
            Yapay zeka kritigi bir{' '}
            <strong className="font-medium text-murekkep">on degerlendirmedir</strong>. Danismaninin
            ve jurinin yerine gecmez; onlarla konusmadan once fikrini toparlamana yarar.
          </li>
          <li>
            Model gorsel okumada hata yapabilir. Ozellikle olcu okumasi ve kucuk yazilar icin
            ciktiyi kendi cizimin uzerinden dogrula.
          </li>
          <li>
            Arazi araci OpenStreetMap (ODbL) ve AWS Terrain Tiles verisi kullanir. Veri gonullu
            katkiyla toplanir; eksik ya da guncel olmayabilir. Bina yuksekligi etiketli degilse iki
            kat varsayilir. Kullandiginda kaynak belirtmen gerekir.
          </li>
          <li>
            Katalogdaki fiyat bilgileri derleme aninda gecerliydi; degisebilir. Karar vermeden once
            siteden teyit et.
          </li>
        </ul>
      </section>

      {dogrulanmayan.length > 0 && (
        <section className="mb-14">
          <BolumBasligi>Katalogda dogrulanamayan siteler</BolumBasligi>
          <p className="mb-4 text-[15.5px] leading-relaxed text-murekkep-2">
            Bu sitelerin icerigi erisim sirasinda teyit edilemedi (sunucu engeli ya da yanit
            vermemesi). Aciklamalari temkinli yazildi; kullanmadan once kendin kontrol et.
          </p>
          <ul className="border-t border-cizgi">
            {dogrulanmayan.map((s) => (
              <li key={s.id} className="border-b border-cizgi py-3">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-baslik text-[18px] text-murekkep underline decoration-cizgi-2 underline-offset-4 transition-colors hover:text-kiremit-koyu"
                >
                  {s.ad}
                </a>
                <p className="mt-1 text-[14px] leading-relaxed text-murekkep-2">{s.uyari}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <BolumBasligi>Gizlilik</BolumBasligi>
        <p className="max-w-3xl text-[15.5px] leading-relaxed text-murekkep-2">
          ArchLib in sunucusu yoktur; tamamen statik bir sitedir. API anahtarin, kontrol listesi
          isaretlerin ve kritik gecmisin yalnizca bu tarayicinin{' '}
          <code className="bg-kagit-3 px-1 py-0.5 text-[13.5px]">localStorage</code> alaninda tutulur.
          Yukledigin gorseller ve yazdigin metin, analiz sirasinda dogrudan sectigin saglayiciya
          (Anthropic / OpenAI / Google) gonderilir — arada ArchLib e ait hicbir sunucu yoktur.
          Arazi araci OpenStreetMap, Nominatim ve AWS Terrain Tiles servislerine dogrudan istek
          atar. Tarayici verisini temizlersen her sey silinir.
        </p>
      </section>
    </div>
  )
}
