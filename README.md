# ArchLib

Mimarlik ogrencileri icin AI destekli **arac kitapligi**, **olcu bilgi bankasi** ve
**pafta / maket kritik sistemi**.

Sunucusuz calisir. Kullanici kendi API anahtarini girer (Anthropic / OpenAI / Google Gemini),
token maliyetini kendi hesabi karsilar. Anahtar yalnizca tarayicinin `localStorage` alaninda tutulur.

---

## Ne var icinde

| Bolum | Icerik |
| --- | --- |
| **Kritik Masasi** | Gorsel veya yazili soruyu mimarlik profesoru rolunde analiz eder. 8 kritik turu: pafta, maket, plan, kesit-gorunus, vaziyet, konsept, temel tasar, genel. |
| **Arac Kitapligi** | 48 arac; kategori, ucret ve proje asamasina gore filtrelenir. Her kartta "projende nerede kullanirsin" aciklamasi var. |
| **Bilgi Bankasi** | Temel tasar ilkeleri, mimari elestiri cercevesi, teknik cizim standartlari, yapi bilgisi + 15 olcu tablosu. |
| **Kontrol Listeleri** | Pafta teslim listesi (18 madde), maket listesi (11 madde), proje kritigi 11 basligi. Isaretler tarayicida saklanir. |
| **Kaynaklar** | Bilgi tabaninin geldigi 16 kaynak, guven duzeyleri ve sinirlar. |

## Bilgi tabaninin kaynagi

**Ana kaynaklar** (dogrudan okunup cikarildi):
- **Yapi Bilgisi ders notlari (MIM 153)** — iskelet ve celik sistemler, temeller, drenaj,
  dilatasyon, baca, adim adim 1/50 plan cizimi
- **I. Hulusi Gungor, Temel Tasar** — tasar ogeleri ve ilkeleri; **Bolum 14 Mimari Elestiri ve
  Yorum** analiz motorunun omurgasidir
- **Ernst Neufert, Yapi Tasarim Bilgisi** — olcu bankasinin tamami
- **MIM 244 Yapi Elemanlari Tasarimi ders notlari** (Dr. Ecem Edis grubu) — TS 5319 taramalari,
  cizgi tipleri, olculendirme, poz/mahal numaralandirma, 1/50 pafta icerigi

**Destek kaynaklar**: Ching, Vitruvius, Pallasmaa, Le Corbusier, Kuban, Tanyeli, Eldem, Canbulat,
Bridge, Bizley ve digerleri. Guven duzeyleri uygulama icindeki *Kaynaklar* sekmesinde listelidir.

---

## Kurulum ve calistirma

Node.js 20 veya ustu gerekir.

```bash
npm install
npm run dev
```

Uretim derlemesi:

```bash
npm run build
npm run preview
```

## Netlify ile yayinlama

### Secenek A — GitHub uzerinden (onerilen)

1. Bu klasoru bir GitHub deposuna gonder.
2. Netlify > **Add new site** > **Import an existing project** > GitHub deposunu sec.
3. Ayarlar `netlify.toml` dosyasindan otomatik okunur:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node surumu: 20
4. **Deploy** de. Her `git push` sonrasi otomatik yeniden yayinlanir.

### Secenek B — Elle yukleme

Bilgisayarinda Node varsa:

```bash
npm install
npm run build
```

Olusan `dist` klasorunu [app.netlify.com/drop](https://app.netlify.com/drop) sayfasina surukle.

### Ortam degiskeni gerekmez

Uygulamada gizli anahtar yoktur. Netlify tarafinda hicbir environment variable tanimlamana
gerek yok; her kullanici kendi anahtarini tarayiciya girer.

---

## Teknik notlar

- **Yigin**: Vite 6 + React 19 + TypeScript + Tailwind CSS 4 (`@tailwindcss/vite`).
- **Cok saglayicili AI katmani**: `src/lib/llm.ts`. Uc saglayicida da SSE ile akisli yanit
  ve gorsel (vision) destegi var.
- **Anthropic** tarayicidan cagrilirken `anthropic-dangerous-direct-browser-access: true`
  basligi gonderilir; bu olmadan CORS engeli olusur.
- **Model adlari degisebilir**. Anahtar panelindeki model alani serbest metindir; "model
  bulunamadi (404)" hatasi alirsan model adini oradan guncelle.
- **Prompt**: `src/lib/prompt.ts`. Sistem promptu; elestiri ilkeleri, temel tasar cercevesi,
  cizim standartlari, olcu bankasi ve yapi bilgisi bloklarindan derlenir. Cikti formati
  6 baslikta sabitlenmistir.
- **Markdown**: `src/components/Markdown.tsx` — bagimsiz, `dangerouslySetInnerHTML`
  kullanmayan kucuk bir render edici.

## Klasor yapisi

```
src/
  data/
    sites.ts        48 aracin katalogu
    bilgi.ts        kavram ve standart bilgi bolumleri
    olculer.ts      Neufert olcu tablolari
    kritik.ts       kontrol listeleri + kaynak kunyeleri
  lib/
    llm.ts          cok saglayicili API katmani (akisli + vision)
    prompt.ts       profesor sistem promptu
    storage.ts      localStorage sarmalayicisi
  components/
    Analiz.tsx      kritik masasi
    Katalog.tsx     arac kitapligi
    BilgiBankasi.tsx
    Listeler.tsx
    Kaynaklar.tsx
    AnahtarPaneli.tsx
    Markdown.tsx
  App.tsx
  main.tsx
  types.ts
  index.css
```

## Sinirlar

- Neufert **DIN (Alman)** standartlarina dayanir. Turkiye de ruhsat ve yonetmelik uyumu icin
  **TS standartlari ve yerel imar yonetmeligi** esas alinmalidir.
- Yapay zeka kritigi bir **on degerlendirmedir**; danismanin ve jurinin yerine gecmez.
- Model gorsel okumada, ozellikle kucuk yazi ve olcu okumasinda hata yapabilir. Ciktiyi kendi
  cizimin uzerinden dogrula.
- Katalogdaki fiyat bilgileri derleme aninda gecerliydi; degisebilir.
