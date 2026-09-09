/**
 * Aciklik ve donati katalogu.
 *
 * Olculer Neufert (DIN) ve TS kapi/pencere modul olculerinden alindi; ders
 * projesinde dogrudan kullanilabilecek gercekci degerler. Kaynak notu her
 * girdide duruyor ki ogrenci juride nereden geldigini soyleyebilsin.
 */

export interface AciklikTanimi {
  id: string
  ad: string
  genislik: number
  yukseklik: number
  esik: number
  not: string
}

export const KAPILAR: AciklikTanimi[] = [
  { id: 'kapi-70', ad: 'Ic kapi 70', genislik: 0.7, yukseklik: 2.05, esik: 0, not: 'Banyo / WC. Neufert: temiz gecis en az 60 cm' },
  { id: 'kapi-80', ad: 'Ic kapi 80', genislik: 0.8, yukseklik: 2.05, esik: 0, not: 'Oda kapisi, en yaygin olcu' },
  { id: 'kapi-90', ad: 'Ic kapi 90', genislik: 0.9, yukseklik: 2.1, esik: 0, not: 'Engelli erisimi icin en az 90 cm net gecis' },
  { id: 'kapi-100', ad: 'Daire kapisi 100', genislik: 1.0, yukseklik: 2.1, esik: 0, not: 'Yangin dayanimli daire giris kapisi' },
  { id: 'kapi-cift-150', ad: 'Cift kanat 150', genislik: 1.5, yukseklik: 2.1, esik: 0, not: 'Salon / toplanti girisi' },
  { id: 'kapi-surme-180', ad: 'Surme 180', genislik: 1.8, yukseklik: 2.1, esik: 0, not: 'Terasa cikis, surme dograma' },
  { id: 'kapi-kacis-120', ad: 'Kacis kapisi 120', genislik: 1.2, yukseklik: 2.1, esik: 0, not: 'Kacis yonunde acilir, panik barli' },
]

export const PENCERELER: AciklikTanimi[] = [
  { id: 'pen-60', ad: 'Islak hacim 60', genislik: 0.6, yukseklik: 0.6, esik: 1.6, not: 'Banyo / WC havalandirma' },
  { id: 'pen-90', ad: 'Kucuk 90', genislik: 0.9, yukseklik: 1.2, esik: 0.9, not: 'Mutfak, koridor' },
  { id: 'pen-120', ad: 'Standart 120', genislik: 1.2, yukseklik: 1.4, esik: 0.9, not: 'Oda penceresi; TS parapet 90 cm' },
  { id: 'pen-150', ad: 'Genis 150', genislik: 1.5, yukseklik: 1.5, esik: 0.9, not: 'Yatak odasi, calisma' },
  { id: 'pen-180', ad: 'Salon 180', genislik: 1.8, yukseklik: 1.6, esik: 0.8, not: 'Salon; dogal isik icin taban alaninin 1/8 i' },
  { id: 'pen-boy-100', ad: 'Boydan 100', genislik: 1.0, yukseklik: 2.2, esik: 0.05, not: 'Zeminden tavana; korkuluk gerekir' },
  { id: 'pen-serit-240', ad: 'Serit 240', genislik: 2.4, yukseklik: 0.9, esik: 1.5, not: 'Serit pencere, ust bant isik' },
]

export interface DonatiTanimi {
  id: string
  ad: string
  grup: string
  /** metre */
  g: number
  d: number
  y: number
  renk: string
  not: string
}

/** Neufert olculeriyle donati kutlesi; 3B'de kutle, 2B'de sembol olarak cizilir. */
export const DONATILAR: DonatiTanimi[] = [
  // --- yasama
  { id: 'kanepe-3', ad: 'Kanepe 3 kisilik', grup: 'Yasama', g: 2.1, d: 0.9, y: 0.8, renk: '#8d9a7c', not: 'Neufert: kisi basi 60 cm oturma genisligi' },
  { id: 'kanepe-2', ad: 'Kanepe 2 kisilik', grup: 'Yasama', g: 1.5, d: 0.9, y: 0.8, renk: '#8d9a7c', not: '' },
  { id: 'koltuk', ad: 'Tekli koltuk', grup: 'Yasama', g: 0.8, d: 0.85, y: 0.8, renk: '#8d9a7c', not: '' },
  { id: 'sehpa', ad: 'Orta sehpa', grup: 'Yasama', g: 1.1, d: 0.6, y: 0.4, renk: '#b08c62', not: 'Kanepeye 40 cm mesafe birak' },
  { id: 'tv-unite', ad: 'TV unitesi', grup: 'Yasama', g: 1.8, d: 0.45, y: 0.5, renk: '#7e7a72', not: 'Ekran uzakligi: kosegen x 2.5' },
  { id: 'televizyon', ad: 'Televizyon (duvar)', grup: 'Yasama', g: 1.1, d: 0.08, y: 0.68, renk: '#2b2e30', not: 'Duvara montaj; ekran uzakligi kosegen x 2.5' },
  { id: 'hali', ad: 'Hali', grup: 'Yasama', g: 2.0, d: 1.4, y: 0.02, renk: '#a97b4c', not: 'Kanepenin on ayaklari hali uzerinde olmali' },
  // --- yemek
  { id: 'masa-4', ad: 'Yemek masasi 4', grup: 'Yemek', g: 1.2, d: 0.8, y: 0.75, renk: '#b08c62', not: 'Kisi basi 60x40 cm; sandalye icin 80 cm cekme' },
  { id: 'masa-6', ad: 'Yemek masasi 6', grup: 'Yemek', g: 1.8, d: 0.9, y: 0.75, renk: '#b08c62', not: '' },
  { id: 'masa-yuvarlak', ad: 'Yuvarlak masa 120', grup: 'Yemek', g: 1.2, d: 1.2, y: 0.75, renk: '#b08c62', not: '' },
  { id: 'sandalye', ad: 'Sandalye', grup: 'Yemek', g: 0.45, d: 0.5, y: 0.85, renk: '#9a8769', not: '' },
  // --- mutfak
  { id: 'tezgah-180', ad: 'Mutfak tezgahi 180', grup: 'Mutfak', g: 1.8, d: 0.6, y: 0.9, renk: '#8e97a3', not: 'DIN 18022: tezgah derinligi 60, yukseklik 85-90 cm' },
  { id: 'tezgah-240', ad: 'Mutfak tezgahi 240', grup: 'Mutfak', g: 2.4, d: 0.6, y: 0.9, renk: '#8e97a3', not: '' },
  { id: 'ada', ad: 'Mutfak adasi', grup: 'Mutfak', g: 1.8, d: 0.9, y: 0.9, renk: '#8e97a3', not: 'Ada ile tezgah arasi en az 120 cm' },
  { id: 'buzdolabi', ad: 'Buzdolabi', grup: 'Mutfak', g: 0.7, d: 0.7, y: 1.85, renk: '#8e97a3', not: '' },
  { id: 'ocak', ad: 'Ocak / firin', grup: 'Mutfak', g: 0.6, d: 0.6, y: 0.9, renk: '#8e97a3', not: 'Yanina en az 40 cm tezgah birak' },
  // --- yatak
  { id: 'yatak-tek', ad: 'Tek kisilik yatak', grup: 'Yatak', g: 0.9, d: 2.0, y: 0.5, renk: '#9a8c9f', not: 'Neufert: 90x200; yaninda 70 cm gecis' },
  { id: 'yatak-cift', ad: 'Cift kisilik yatak', grup: 'Yatak', g: 1.6, d: 2.0, y: 0.5, renk: '#9a8c9f', not: '160x200; iki yandan 70 cm gecis' },
  { id: 'komodin', ad: 'Komodin', grup: 'Yatak', g: 0.45, d: 0.4, y: 0.55, renk: '#b08c62', not: '' },
  { id: 'gardirop', ad: 'Gardirop 200', grup: 'Yatak', g: 2.0, d: 0.6, y: 2.2, renk: '#b08c62', not: 'Askilik derinligi en az 55 cm' },
  { id: 'calisma-masa', ad: 'Calisma masasi', grup: 'Yatak', g: 1.2, d: 0.6, y: 0.75, renk: '#b08c62', not: '' },
  // --- islak hacim
  { id: 'klozet', ad: 'Klozet', grup: 'Islak hacim', g: 0.4, d: 0.7, y: 0.4, renk: '#7f93a0', not: 'Onunde 60x60 cm serbest alan' },
  { id: 'lavabo', ad: 'Lavabo', grup: 'Islak hacim', g: 0.6, d: 0.5, y: 0.85, renk: '#7f93a0', not: 'Ayna onu 70 cm hareket alani' },
  { id: 'dus', ad: 'Dus 90x90', grup: 'Islak hacim', g: 0.9, d: 0.9, y: 0.05, renk: '#7f93a0', not: 'En az 80x80; tercihen 90x90' },
  { id: 'kuvet', ad: 'Kuvet 170', grup: 'Islak hacim', g: 1.7, d: 0.75, y: 0.55, renk: '#7f93a0', not: '' },
  { id: 'camasir', ad: 'Camasir makinesi', grup: 'Islak hacim', g: 0.6, d: 0.6, y: 0.85, renk: '#7f93a0', not: '' },
  // --- sirkulasyon / yapisal
  { id: 'merdiven-duz', ad: 'Duz kollu merdiven', grup: 'Sirkulasyon', g: 1.1, d: 3.2, y: 0.02, renk: '#a3705a', not: '2h+t=63; rihtim 17.5, basamak 28 cm' },
  { id: 'merdiven-u', ad: 'U merdiven', grup: 'Sirkulasyon', g: 2.4, d: 2.6, y: 0.02, renk: '#a3705a', not: 'Sahanlik en az kol genisligi kadar' },
  { id: 'asansor', ad: 'Asansor 110x140', grup: 'Sirkulasyon', g: 1.1, d: 1.4, y: 0.02, renk: '#a3705a', not: 'DIN 15306: 6 kisi / 450 kg' },
  { id: 'asansor-sedye', ad: 'Sedye asansoru', grup: 'Sirkulasyon', g: 1.4, d: 2.4, y: 0.02, renk: '#a3705a', not: 'Saglik yapilarinda zorunlu' },
  // --- ofis / egitim
  { id: 'ofis-masa', ad: 'Ofis masasi', grup: 'Ofis', g: 1.6, d: 0.8, y: 0.75, renk: '#7e8a95', not: 'Kisi basi en az 8 m² calisma alani' },
  { id: 'toplanti-8', ad: 'Toplanti masasi 8', grup: 'Ofis', g: 2.4, d: 1.2, y: 0.75, renk: '#7e8a95', not: '' },
  { id: 'sira', ad: 'Ogrenci sirasi', grup: 'Ofis', g: 1.2, d: 0.5, y: 0.75, renk: '#7e8a95', not: 'Derslikte kisi basi 1.5-2 m²' },
  // --- dis
  { id: 'agac', ad: 'Agac', grup: 'Dis mekan', g: 4.0, d: 4.0, y: 6.0, renk: '#6f8460', not: 'Tac capi 4 m, govde 6 m' },
  { id: 'arac', ad: 'Otomobil', grup: 'Dis mekan', g: 1.8, d: 4.5, y: 1.5, renk: '#6c7079', not: 'Otopark cebi 2.5x5.0 m' },
]

export const DONATI_GRUPLARI = Array.from(new Set(DONATILAR.map((d) => d.grup)))

export function donatiBul(id: string): DonatiTanimi {
  return DONATILAR.find((d) => d.id === id) ?? DONATILAR[0]
}

export function aciklikBul(tur: 'kapi' | 'pencere', id: string): AciklikTanimi {
  const liste = tur === 'kapi' ? KAPILAR : PENCERELER
  return liste.find((a) => a.id === id) ?? liste[2]
}
