import { KAYNAKLAR } from '../data/kritik'
import { SITELER } from '../data/sites'
import { SayfaBasligi } from '../ui/Parcalar'
import { Panel, PanelBasligi } from '../ui/Kontroller'

const GUVEN_SINIF: Record<string, string> = {
  yuksek: 'border-adacayi/45 bg-adacayi-soft text-adacayi-koyu',
  orta: 'border-kehribar/45 bg-kehribar-soft text-kehribar-koyu',
  dusuk: 'border-cizgi-2 bg-kagit-2 text-murekkep-3',
}

function Guven({ guven }: { guven: string }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-[3px] text-[11.5px] leading-none font-medium ${GUVEN_SINIF[guven]}`}
    >
      {guven}
    </span>
  )
}

export default function Kaynaklar() {
  const ana = KAYNAKLAR.filter((k) => k.rol === 'ana')
  const destek = KAYNAKLAR.filter((k) => k.rol === 'destek')
  const dogrulanmayan = SITELER.filter((s) => s.dogrulama === 'dogrulanmadi')

  return (
    <div className="kademe max-w-4xl">
      <SayfaBasligi
        etiket="Kaynaklar"
        baslik="Hangi bilgi nereden geliyor"
        aciklama={`Bu uygulamanin bilgi tabani ${KAYNAKLAR.length} kaynaktan olusturuldu. Ana kaynaklar dogrudan okunup cikarildi; destek kaynaklar cerceve icin kullanildi. Nereden geldigini bilmen, o bilgiyi juri karsisinda savunabilmen icin gerekli.`}
      />

      <div className="space-y-3.5">
        <Panel>
          <PanelBasligi baslik="Ana kaynaklar" sag={<span className="etiket">omurga</span>} />
          {ana.map((k) => (
            <article key={k.id} className="border-b border-cizgi/70 px-5 py-4 last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-1">
                <h3 className="text-[18px] leading-tight text-murekkep">{k.baslik}</h3>
                <Guven guven={k.guven} />
              </div>
              <div className="etiket mt-1">
                {k.yazar} · {k.tur}
              </div>
              <p className="mt-2.5 max-w-3xl text-[14.5px] leading-relaxed text-murekkep-2">
                {k.not}
              </p>
            </article>
          ))}
        </Panel>

        <Panel>
          <PanelBasligi baslik="Destek kaynaklar" sag={<span className="etiket">cerceve</span>} />
          {destek.map((k) => (
            <article key={k.id} className="border-b border-cizgi/70 px-5 py-3.5 last:border-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-5 gap-y-0.5">
                <h3 className="text-[16px] text-murekkep">
                  {k.baslik}
                  <span className="ml-2 text-[14px] font-normal text-murekkep-3">{k.yazar}</span>
                </h3>
                <Guven guven={k.guven} />
              </div>
              <p className="mt-1.5 max-w-3xl text-[14px] leading-relaxed text-murekkep-2">{k.not}</p>
            </article>
          ))}
        </Panel>

        <section className="rounded-[8px] border border-kiremit/25 bg-kiremit-soft px-6 py-5">
          <h2 className="mb-3 text-[16px] text-kiremit-koyu">Sinirlar — bunlari bilerek kullan</h2>
          <ul className="space-y-2.5 text-[14.5px] leading-relaxed text-murekkep-2">
            <li>
              Neufert{' '}
              <strong className="font-medium text-murekkep">DIN (Alman) standartlarina</strong>{' '}
              dayanir. Turkiye de ruhsat ve yonetmelik uyumu icin{' '}
              <strong className="font-medium text-murekkep">
                TS standartlari ve yerel imar yonetmeligi
              </strong>{' '}
              esas alinmalidir. Buradaki olculer tasarim rehberidir, yasal dayanak degildir.
            </li>
            <li>
              Yapay zeka kritigi bir{' '}
              <strong className="font-medium text-murekkep">on degerlendirmedir</strong>.
              Danismaninin ve jurinin yerine gecmez; onlarla konusmadan once fikrini toparlamana
              yarar.
            </li>
            <li>
              Model gorsel okumada hata yapabilir. Ozellikle olcu okumasi ve kucuk yazilar icin
              ciktiyi kendi cizimin uzerinden dogrula.
            </li>
            <li>
              Arazi araci OpenStreetMap (ODbL) ve AWS Terrain Tiles verisi kullanir. Veri gonullu
              katkiyla toplanir; eksik ya da guncel olmayabilir. Bina yuksekligi etiketli degilse
              iki kat varsayilir. Kullandiginda kaynak belirtmen gerekir.
            </li>
            <li>
              Katalogdaki fiyat bilgileri derleme aninda gecerliydi; degisebilir. Karar vermeden
              once siteden teyit et.
            </li>
          </ul>
        </section>

        {dogrulanmayan.length > 0 && (
          <Panel>
            <PanelBasligi
              baslik="Katalogda dogrulanamayan siteler"
              sag={<span className="sayi text-[13px] text-murekkep-3">{dogrulanmayan.length}</span>}
            />
            <p className="px-5 pt-4 text-[14.5px] leading-relaxed text-murekkep-2">
              Bu sitelerin icerigi erisim sirasinda teyit edilemedi (sunucu engeli ya da yanit
              vermemesi). Aciklamalari temkinli yazildi; kullanmadan once kendin kontrol et.
            </p>
            <ul className="mt-3 border-t border-cizgi">
              {dogrulanmayan.map((s) => (
                <li key={s.id} className="border-b border-cizgi/70 px-5 py-3 last:border-0">
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="text-[15.5px] font-medium text-murekkep underline decoration-cizgi-2 underline-offset-4 transition-colors hover:text-kiremit-koyu"
                  >
                    {s.ad}
                  </a>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-murekkep-2">{s.uyari}</p>
                </li>
              ))}
            </ul>
          </Panel>
        )}

        <Panel>
          <PanelBasligi baslik="Gizlilik" />
          <p className="max-w-3xl px-5 py-4 text-[14.5px] leading-relaxed text-murekkep-2">
            ArchLib in sunucusu yoktur; tamamen statik bir sitedir. API anahtarin, kontrol listesi
            isaretlerin ve kritik gecmisin yalnizca bu tarayicinin{' '}
            <code className="rounded-[4px] bg-kagit-3 px-1 py-0.5 text-[13px]">localStorage</code>{' '}
            alaninda tutulur. Yukledigin gorseller ve yazdigin metin, analiz sirasinda dogrudan
            sectigin saglayiciya (Anthropic / OpenAI / Google) gonderilir — arada ArchLib e ait
            hicbir sunucu yoktur. Arazi araci OpenStreetMap, Nominatim ve AWS Terrain Tiles
            servislerine dogrudan istek atar. Tarayici verisini temizlersen her sey silinir.
          </p>
        </Panel>
      </div>
    </div>
  )
}
