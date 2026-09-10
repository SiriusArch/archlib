# ArchLib

Mimarlik ogrencileri icin AI destekli **arac kitapligi**, **olcu bilgi bankasi** ve
**pafta / maket kritik sistemi**.

Cekirdek ozellikler sunucusuz calisir. Kullanici kendi API anahtarini girer (Anthropic / OpenAI /
Google Gemini), token maliyetini kendi hesabi karsilar. Anahtar yalnizca tarayicinin `localStorage`
alaninda tutulur. Tek istisna: **Forum** (hesap, arkadaslik, sohbet) opsiyonel bir Firebase
backend'i gerektirir — bkz. asagidaki "Forum kurulumu" bolumu.

---

## Ne var icinde

| Bolum | Icerik |
| --- | --- |
| **Kritik Masasi** | Gorsel veya yazili soruyu mimarlik profesoru rolunde analiz eder. 8 kritik turu: pafta, maket, plan, kesit-gorunus, vaziyet, konsept, temel tasar, genel. |
| **Arac Kitapligi** | 48 arac; kategori, ucret ve proje asamasina gore filtrelenir. Her kartta "projende nerede kullanirsin" aciklamasi var. |
| **Bilgi Bankasi** | Temel tasar ilkeleri, mimari elestiri cercevesi, teknik cizim standartlari, yapi bilgisi + 15 olcu tablosu. |
| **Kontrol Listeleri** | Pafta teslim listesi (18 madde), maket listesi (11 madde), proje kritigi 11 basligi. Isaretler tarayicida saklanir. |
| **Kaynaklar** | Bilgi tabaninin geldigi 16 kaynak, guven duzeyleri ve sinirlar. |
| **Forum** | Teknik basliklar, cevaplar, arkadaslik ve birebir sohbet. Tamamen anonim: e-posta yalnizca giris icindir, herkes birbirini takma adla gorur. Opsiyoneldir; calismasi icin kendi ucretsiz Firebase projeni kurman gerekir (asagida). |

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

Uygulamanin geri kalaninda gizli anahtar yoktur. Netlify tarafinda hicbir environment variable
tanimlamana gerek yok; her kullanici kendi AI anahtarini tarayiciya girer. Yalnizca **Forum**
ozelligini acmak istersen asagidaki Firebase degiskenlerini eklemen gerekir.

---

## Forum kurulumu (opsiyonel)

Forum, hesap, arkadaslik ve sohbet ozellikleri Firebase (Authentication + Firestore) uzerinde
calisir. Bu tek gercek backend bagimliligimizdir; kurulmazsa Forum sekmesi "henuz kurulmadi"
mesaji gosterir, uygulamanin geri kalani etkilenmez. Kurulum tamamen ucretsizdir (Firebase
Spark plani).

1. [console.firebase.google.com](https://console.firebase.google.com) adresinde yeni bir proje ac.
2. Sol menudan **Build > Authentication > Get started**, **Sign-in method** sekmesinden
   **Email/Password** saglayicisini etkinlestir.
3. Sol menudan **Build > Firestore Database > Create database**, **production mode** ile olustur
   (bolge olarak sana yakin birini sec, sonradan degistirilemez).
4. Firestore ekraninda **Rules** sekmesine gec, bu depodaki `firestore.rules` dosyasinin tum
   icerigini yapistir ve **Publish** de.
5. Proje ayarlarina git (disli ikonu > **Project settings**), **Your apps** altinda **Web** (`</>`)
   simgesiyle bir uygulama ekle. Sana verilen `firebaseConfig` nesnesindeki degerleri kopyala.
6. Proje kokune bir `.env.local` dosyasi olustur (bu dosya `.gitignore` icinde, repoya gitmez):

   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_MESSAGING_SENDER_ID=...
   VITE_FIREBASE_APP_ID=...
   ```

7. `npm run dev` ile yeniden baslat. Forum sekmesi artik giris/kayit ekranini gostermeli.
8. **Netlify/Vercel'e yayinlarken**: ayni degiskenleri Site settings > Environment variables
   (Netlify) ya da Project settings > Environment Variables (Vercel) kismina tek tek ekle, sonra
   yeniden deploy et. `VITE_` on eki olmadan Vite bu degiskenleri derlemeye dahil etmez.

**Beklenen bir uyari**: kategori filtreli forum listesini ya da sohbet listesini ilk kez
kullandiginda, tarayici konsolunda Firestore'dan "The query requires an index" hatasi ve bir
baglanti gorebilirsin. Bu normaldir — baglantiya tikla, Firebase konsolunda index'i olustur
(birkaç dakika surer), sayfayi yenile.

**Guvenlik notu**: `firebaseConfig` icindeki `apiKey` gizli bir sir DEGILDIR; Firebase bu deger
tarayicida gorunecek sekilde tasarlanmistir, gercek erisim kontrolu `firestore.rules` dosyasiyla
saglanir. Yine de `.env.local` dosyasini commitleme (zaten `.gitignore`'da).

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
    firebase.ts     Firebase baglantisi (yalnizca forum icin, opsiyonel)
    kimlik.ts       giris/kayit, anonim profil yonetimi
    forum.ts        forum basliklari + cevaplar (Firestore)
    sosyal.ts       arkadaslik istekleri + birebir sohbet (Firestore)
    moderasyon.ts   basit kufur filtresi + rapor olusturma
  components/
    Analiz.tsx      kritik masasi
    Katalog.tsx     arac kitapligi
    BilgiBankasi.tsx
    Listeler.tsx
    Kaynaklar.tsx
    AnahtarPaneli.tsx
    Forum.tsx       forum sekmesinin kabugu (sekmeler + giris kapisi)
    forum/
      Kimlik.tsx      giris/kayit modali
      Basliklar.tsx   baslik listesi + detay + cevaplar
      Arkadaslar.tsx  arkadas arama, istekler, liste
      Mesajlar.tsx    sohbet listesi + birebir yazisma
    Markdown.tsx
  App.tsx
  main.tsx
  types.ts
  index.css
firestore.rules      Firebase konsoluna yapistirilacak guvenlik kurallari
```

## Sinirlar

- Neufert **DIN (Alman)** standartlarina dayanir. Turkiye de ruhsat ve yonetmelik uyumu icin
  **TS standartlari ve yerel imar yonetmeligi** esas alinmalidir.
- Yapay zeka kritigi bir **on degerlendirmedir**; danismanin ve jurinin yerine gecmez.
- Model gorsel okumada, ozellikle kucuk yazi ve olcu okumasinda hata yapabilir. Ciktiyi kendi
  cizimin uzerinden dogrula.
- Katalogdaki fiyat bilgileri derleme aninda gecerliydi; degisebilir.
