export type Ucret = 'ucretsiz' | 'freemium' | 'ucretli'

export type Kategori =
  | 'ai-gorsellestirme'
  | 'plan-cizim'
  | '3d-modelleme'
  | 'harita-arazi'
  | 'analiz-simulasyon'
  | 'doku-malzeme'
  | 'kutuphane-obje'
  | 'grafik-sunum'
  | 'referans-arsiv'
  | 'olcu-standart'

/** Projede hangi asamada ise yarar */
export type Asama = 'arastirma' | 'konsept' | 'tasarim' | 'teknik' | 'sunum'

export type Dogrulama = 'dogrulandi' | 'kismi' | 'dogrulanmadi'

export interface Site {
  id: string
  ad: string
  url: string
  kategori: Kategori
  ucret: Ucret
  asamalar: Asama[]
  /** Bir cumlelik tanim */
  ozet: string
  /** Ogrenciye yonelik detayli anlatim: ne ise yarar, nasil kullanilir, sinirlari */
  anlatim: string
  /** Somut kullanim onerisi - hangi teslimde ise yarar */
  kullanim: string
  etiketler: string[]
  /** Fiyat notu (varsa) */
  fiyatNotu?: string
  /** Dikkat edilmesi gereken sinirlama */
  uyari?: string
  dogrulama: Dogrulama
  turkce?: boolean
}

export interface BilgiMaddesi {
  id: string
  baslik: string
  /** Markdown benzeri duz metin; satir satir render edilir */
  icerik: string
  kaynak: string
  etiketler: string[]
}

export interface BilgiBolumu {
  id: string
  baslik: string
  aciklama: string
  kaynak: string
  maddeler: BilgiMaddesi[]
}

export interface OlcuSatiri {
  ad: string
  deger: string
  not?: string
}

export interface OlcuTablosu {
  id: string
  baslik: string
  kaynak: string
  satirlar: OlcuSatiri[]
}

export interface KontrolMaddesi {
  id: string
  metin: string
  aciklama?: string
  kaynak?: string
}

export interface KontrolListesi {
  id: string
  baslik: string
  aciklama: string
  maddeler: KontrolMaddesi[]
}

export interface Kaynak {
  id: string
  baslik: string
  yazar: string
  tur: 'ders-notu' | 'kitap' | 'standart' | 'makale'
  rol: 'ana' | 'destek'
  guven: 'yuksek' | 'orta' | 'dusuk'
  not: string
}

export type Saglayici = 'anthropic' | 'openai' | 'gemini'

/** Model gucu kademesi: otomatik secimde soru zorlugu buna eslenir. */
export type ModelSeviyesi = 'hizli' | 'dengeli' | 'guclu'

export interface AnahtarKaydi {
  saglayici: Saglayici
  anahtar: string
  /** Elle secim modunda kullanilacak model. Otomatik modda yalnizca "otomatik" kapatilinca devreye girer. */
  model: string
  /** true (varsayilan): model, sorunun zorlugune gore otomatik secilir. false: yukaridaki "model" sabit kullanilir. */
  otomatik: boolean
}

export type AnalizTuru =
  | 'pafta'
  | 'maket'
  | 'plan'
  | 'kesit-gorunus'
  | 'vaziyet'
  | 'konsept'
  | 'temel-tasar'
  | 'genel'

export interface EkGorsel {
  id: string
  ad: string
  mediaType: string
  /** base64, prefix yok */
  veri: string
  onizleme: string
}

/**
 * Forum ve arkadaslik sistemi. Kullanicilar tamamen anonimdir: e-posta yalnizca
 * giris icin kullanilir ve hicbir yerde baskasina gosterilmez; herkesin gordugu
 * tek kimlik kendi sectigi takma addir.
 */
export interface KullaniciProfili {
  uid: string
  takmaAd: string
  olusturulma: number
}

export type ForumKategori =
  | 'cizim-yazilim'
  | 'yapi-teknik'
  | 'studyo-elestiri'
  | 'kariyer-egitim'
  | 'genel'

export interface ForumBasligi {
  id: string
  baslik: string
  icerik: string
  kategori: ForumKategori
  yazarId: string
  yazarAdi: string
  tarih: number
  sonAktivite: number
  cevapSayisi: number
}

export interface ForumCevap {
  id: string
  icerik: string
  yazarId: string
  yazarAdi: string
  tarih: number
}

export type ArkadaslikDurumu = 'bekliyor' | 'kabul'

export interface ArkadaslikIstegi {
  id: string
  gonderenId: string
  gonderenAdi: string
  alanId: string
  alanAdi: string
  durum: ArkadaslikDurumu
  tarih: number
}

export interface ArkadasKaydi {
  uid: string
  takmaAd: string
  beri: number
  /** Bu arkadasligin kaynagi olan arkadasIstekleri belgesinin id'si (silmek icin). */
  istekId: string
}

export interface SohbetOzeti {
  id: string
  katilimcilar: string[]
  digerUid: string
  digerAd: string
  sonMesaj: string
  sonMesajTarih: number
}

export interface SohbetMesaji {
  id: string
  gonderenId: string
  icerik: string
  tarih: number
}
