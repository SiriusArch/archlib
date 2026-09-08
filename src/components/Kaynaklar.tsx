import { KAYNAKLAR } from '../data/kritik'
import { SITELER } from '../data/sites'

const GUVEN_RENK: Record<string, string> = {
  yuksek: 'border-[#1f6f4a]/40 text-[#1f6f4a] bg-[#1f6f4a]/10',
  orta: 'border-[#b4472a]/40 text-[#b4472a] bg-[#b4472a]/10',
  dusuk: 'border-[#2c333d]/30 text-[#2c333d]/70 bg-[#2c333d]/8',
}

export default function Kaynaklar() {
  const ana = KAYNAKLAR.filter((k) => k.rol === 'ana')
  const destek = KAYNAKLAR.filter((k) => k.rol === 'destek')
  const dogrulanmayan = SITELER.filter((s) => s.dogrulama === 'dogrulanmadi')

  return (
    <div className="max-w-4xl">
      <header className="mb-6">
        <h1 className="text-2xl font-bold">Kaynaklar ve Seffaflik</h1>
        <p className="mt-1.5 text-sm leading-relaxed text-[#2c333d]">
          Bu uygulamanin bilgi tabani {KAYNAKLAR.length} kaynaktan olusturuldu. Ana kaynaklar
          dogrudan okunup cikarildi; destek kaynaklar cerceve icin kullanildi. Hangi bilginin
          nereden geldigini bilmen, o bilgiyi juri karsisinda savunabilmen icin gerekli.
        </p>
      </header>

      <section className="mb-8">
        <h2 className="mono mb-3 border-b border-[#cfc9bc] pb-1.5 text-[12px] font-bold tracking-[0.14em] uppercase">
          Ana Kaynaklar — veri tabaninin omurgasi
        </h2>
        <div className="space-y-2.5">
          {ana.map((k) => (
            <article key={k.id} className="border border-[#cfc9bc] bg-white/60 p-4">
              <div className="mb-1 flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-[15px] font-bold">{k.baslik}</h3>
                <span
                  className={`mono border px-1.5 py-0.5 text-[10px] tracking-[0.1em] uppercase ${GUVEN_RENK[k.guven]}`}
                >
                  guven: {k.guven}
                </span>
              </div>
              <div className="mono mb-2 text-[11px] tracking-wider text-[#2c333d]/65">
                {k.yazar} — {k.tur}
              </div>
              <p className="text-[13.5px] leading-relaxed text-[#2c333d]">{k.not}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="mono mb-3 border-b border-[#cfc9bc] pb-1.5 text-[12px] font-bold tracking-[0.14em] uppercase">
          Destek Kaynaklar — cerceve ve kuram
        </h2>
        <div className="space-y-2">
          {destek.map((k) => (
            <article key={k.id} className="border border-[#cfc9bc] bg-white/50 px-4 py-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="text-[14px] font-semibold">{k.baslik}</h3>
                  <div className="mono text-[11px] tracking-wider text-[#2c333d]/60">{k.yazar}</div>
                </div>
                <span
                  className={`mono border px-1.5 py-0.5 text-[10px] tracking-[0.1em] uppercase ${GUVEN_RENK[k.guven]}`}
                >
                  {k.guven}
                </span>
              </div>
              <p className="mt-1.5 text-[13px] leading-relaxed text-[#2c333d]/85">{k.not}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mb-8 border border-[#b4472a]/35 bg-[#b4472a]/8 p-4">
        <h2 className="mono mb-2 text-[12px] font-bold tracking-[0.14em] text-[#b4472a] uppercase">
          Sinirlar — bunlari bilerek kullan
        </h2>
        <ul className="space-y-1.5 text-[13.5px] leading-relaxed text-[#2c333d]">
          <li>
            • Neufert <strong>DIN (Alman) standartlarina</strong> dayanir. Turkiye de ruhsat ve
            yonetmelik uyumu icin <strong>TS standartlari ve yerel imar yonetmeligi</strong> esas
            alinmalidir. Buradaki olculer tasarim rehberidir, yasal dayanak degildir.
          </li>
          <li>
            • Yapay zeka kritigi bir <strong>on degerlendirmedir</strong>. Danismaninin ve jurinin
            yerine gecmez; onlarla konusmadan once fikrini toparlamana yarar.
          </li>
          <li>
            • Model gorsel okumada hata yapabilir. Ozellikle <strong>olcu okumasi</strong> ve
            <strong> kucuk yazilar</strong> icin ciktiyi kendi cizimin uzerinden dogrula.
          </li>
          <li>
            • Katalogdaki fiyat bilgileri erisim aninda gecerliydi; degisebilir. Karar vermeden once
            siteden teyit et.
          </li>
        </ul>
      </section>

      {dogrulanmayan.length > 0 && (
        <section className="mb-8">
          <h2 className="mono mb-3 border-b border-[#cfc9bc] pb-1.5 text-[12px] font-bold tracking-[0.14em] uppercase">
            Katalogda Dogrulanamayan Siteler
          </h2>
          <p className="mb-3 text-[13px] text-[#2c333d]/85">
            Bu sitelerin icerigi erisim sirasinda teyit edilemedi (sunucu engeli ya da yanit
            vermemesi). Aciklamalari temkinli yazildi; kullanmadan once kendin kontrol et.
          </p>
          <ul className="space-y-1.5">
            {dogrulanmayan.map((s) => (
              <li key={s.id} className="border border-[#cfc9bc] bg-white/50 px-4 py-2.5">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-[14px] font-semibold text-[#b4472a] underline underline-offset-2"
                >
                  {s.ad}
                </a>
                <p className="mt-0.5 text-[12.5px] text-[#2c333d]/80">{s.uyari}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="border border-[#cfc9bc] bg-white/50 p-4">
        <h2 className="mono mb-2 text-[12px] font-bold tracking-[0.14em] uppercase">
          Gizlilik
        </h2>
        <p className="text-[13.5px] leading-relaxed text-[#2c333d]">
          ArchLib in sunucusu yoktur; tamamen statik bir sitedir. API anahtarin, kontrol listesi
          isaretlerin ve kritik gecmisin yalnizca bu tarayicinin <span className="mono">localStorage</span>{' '}
          alaninda tutulur. Yukledigin gorseller ve yazdigin metin, analiz sirasinda dogrudan
          sectigin saglayiciya (Anthropic / OpenAI / Google) gonderilir — arada ArchLib e ait
          hicbir sunucu yoktur. Tarayici verisini temizlersen her sey silinir.
        </p>
      </section>
    </div>
  )
}
