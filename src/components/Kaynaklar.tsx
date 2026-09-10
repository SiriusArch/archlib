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
        aciklama={`Bu uygulamanın bilgi tabanı ${KAYNAKLAR.length} kaynaktan oluşturuldu. Ana kaynaklar doğrudan okunup çıkarıldı; destek kaynaklar çerçeve için kullanıldı. Nereden geldiğini bilmen, o bilgiyi jüri karşısında savunabilmen için gerekli.`}
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
          <PanelBasligi baslik="Destek kaynaklar" sag={<span className="etiket">çerçeve</span>} />
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
          <h2 className="mb-3 text-[16px] text-kiremit-koyu">Sınırlar — bunları bilerek kullan</h2>
          <ul className="space-y-2.5 text-[14.5px] leading-relaxed text-murekkep-2">
            <li>
              Neufert{' '}
              <strong className="font-medium text-murekkep">DIN (Alman) standartlarına</strong>{' '}
              dayanır. Türkiye’de ruhsat ve yönetmelik uyumu için{' '}
              <strong className="font-medium text-murekkep">
                TS standartları ve yerel imar yönetmeliği
              </strong>{' '}
              esas alınmalıdır. Buradaki ölçüler tasarım rehberidir, yasal dayanak değildir.
            </li>
            <li>
              Yapay zekâ kritiği bir{' '}
              <strong className="font-medium text-murekkep">ön değerlendirmedir</strong>.
              Danışmanının ve jürinin yerine geçmez; onlarla konuşmadan önce fikrini toparlamana
              yarar.
            </li>
            <li>
              Model görsel okumada hata yapabilir. Özellikle ölçü okuması ve küçük yazılar için
              çıktıyı kendi çizimin üzerinden doğrula.
            </li>
            <li>
              Arazi aracı OpenStreetMap (ODbL) ve AWS Terrain Tiles verisi kullanır. Veri gönüllü
              katkıyla toplanır; eksik ya da güncel olmayabilir. Bina yüksekliği etiketli değilse
              iki kat varsayılır. Kullandığında kaynak belirtmen gerekir.
            </li>
            <li>
              Katalogdaki fiyat bilgileri derleme anında geçerliydi; değişebilir. Karar vermeden
              önce siteden teyit et.
            </li>
          </ul>
        </section>

        {dogrulanmayan.length > 0 && (
          <Panel>
            <PanelBasligi
              baslik="Katalogda doğrulanamayan siteler"
              sag={<span className="sayi text-[13px] text-murekkep-3">{dogrulanmayan.length}</span>}
            />
            <p className="px-5 pt-4 text-[14.5px] leading-relaxed text-murekkep-2">
              Bu sitelerin içeriği erişim sırasında teyit edilemedi (sunucu engeli ya da yanıt
              vermemesi). Açıklamaları temkinli yazıldı; kullanmadan önce kendin kontrol et.
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
            ArchLib’in sunucusu yoktur; tamamen statik bir sitedir. API anahtarın, kontrol listesi
            işaretlerin ve kritik geçmişin yalnızca bu tarayıcının{' '}
            <code className="rounded-[4px] bg-kagit-3 px-1 py-0.5 text-[13px]">localStorage</code>{' '}
            alanında tutulur. Yüklediğin görseller ve yazdığın metin, analiz sırasında doğrudan
            seçtiğin sağlayıcıya (Anthropic / OpenAI / Google) gönderilir — arada ArchLib’e ait
            hiçbir sunucu yoktur. Arazi aracı OpenStreetMap, Nominatim ve AWS Terrain Tiles
            servislerine doğrudan istek atar. Tarayıcı verisini temizlersen her şey silinir.
          </p>
        </Panel>
      </div>
    </div>
  )
}
