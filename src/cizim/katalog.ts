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
  { id: 'kapi-70', ad: 'İç kapı 70', genislik: 0.7, yukseklik: 2.05, esik: 0, not: 'Banyo / WC. Neufert: temiz geçiş en az 60 cm' },
  { id: 'kapi-80', ad: 'İç kapı 80', genislik: 0.8, yukseklik: 2.05, esik: 0, not: 'Oda kapısı, en yaygın ölçü' },
  { id: 'kapi-90', ad: 'İç kapı 90', genislik: 0.9, yukseklik: 2.1, esik: 0, not: 'Engelli erişimi için en az 90 cm net geçiş' },
  { id: 'kapi-100', ad: 'Daire kapısı 100', genislik: 1.0, yukseklik: 2.1, esik: 0, not: 'Yangın dayanımlı daire giriş kapısı' },
  { id: 'kapi-cift-150', ad: 'Çift kanat 150', genislik: 1.5, yukseklik: 2.1, esik: 0, not: 'Salon / toplantı girişi' },
  { id: 'kapi-surme-180', ad: 'Sürme 180', genislik: 1.8, yukseklik: 2.1, esik: 0, not: 'Terasa çıkış, sürme doğrama' },
  { id: 'kapi-kacis-120', ad: 'Kaçış kapısı 120', genislik: 1.2, yukseklik: 2.1, esik: 0, not: 'Kaçış yönünde açılır, panik barlı' },
]

export const PENCERELER: AciklikTanimi[] = [
  { id: 'pen-60', ad: 'Islak hacim 60', genislik: 0.6, yukseklik: 0.6, esik: 1.6, not: 'Banyo / WC havalandırma' },
  { id: 'pen-90', ad: 'Küçük 90', genislik: 0.9, yukseklik: 1.2, esik: 0.9, not: 'Mutfak, koridor' },
  { id: 'pen-120', ad: 'Standart 120', genislik: 1.2, yukseklik: 1.4, esik: 0.9, not: 'Oda penceresi; TS parapet 90 cm' },
  { id: 'pen-150', ad: 'Geniş 150', genislik: 1.5, yukseklik: 1.5, esik: 0.9, not: 'Yatak odası, çalışma' },
  { id: 'pen-180', ad: 'Salon 180', genislik: 1.8, yukseklik: 1.6, esik: 0.8, not: 'Salon; doğal ışık için taban alanının 1/8’i' },
  { id: 'pen-boy-100', ad: 'Boydan 100', genislik: 1.0, yukseklik: 2.2, esik: 0.05, not: 'Zeminden tavana; korkuluk gerekir' },
  { id: 'pen-serit-240', ad: 'Şerit 240', genislik: 2.4, yukseklik: 0.9, esik: 1.5, not: 'Şerit pencere, üst bant ışık' },
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
  // --- yaşama
  { id: 'kanepe-3', ad: 'Kanepe 3 kişilik', grup: 'Yaşama', g: 2.1, d: 0.9, y: 0.8, renk: '#8d9a7c', not: 'Neufert: kişi başı 60 cm oturma genişliği' },
  { id: 'kanepe-2', ad: 'Kanepe 2 kişilik', grup: 'Yaşama', g: 1.5, d: 0.9, y: 0.8, renk: '#8d9a7c', not: '' },
  { id: 'koltuk', ad: 'Tekli koltuk', grup: 'Yaşama', g: 0.8, d: 0.85, y: 0.8, renk: '#8d9a7c', not: '' },
  { id: 'sehpa', ad: 'Orta sehpa', grup: 'Yaşama', g: 1.1, d: 0.6, y: 0.4, renk: '#b08c62', not: 'Kanepeye 40 cm mesafe bırak' },
  { id: 'tv-unite', ad: 'TV ünitesi', grup: 'Yaşama', g: 1.8, d: 0.45, y: 0.5, renk: '#7e7a72', not: 'Ekran uzaklığı: köşegen x 2.5' },
  { id: 'televizyon', ad: 'Televizyon (duvar)', grup: 'Yaşama', g: 1.1, d: 0.08, y: 0.68, renk: '#2b2e30', not: 'Duvara montaj; ekran uzaklığı köşegen x 2.5' },
  { id: 'hali', ad: 'Halı', grup: 'Yaşama', g: 2.0, d: 1.4, y: 0.02, renk: '#a97b4c', not: 'Kanepenin ön ayakları halı üzerinde olmalı' },
  // --- yemek
  { id: 'masa-4', ad: 'Yemek masası 4', grup: 'Yemek', g: 1.2, d: 0.8, y: 0.75, renk: '#b08c62', not: 'Kişi başı 60x40 cm; sandalye için 80 cm çekme' },
  { id: 'masa-6', ad: 'Yemek masası 6', grup: 'Yemek', g: 1.8, d: 0.9, y: 0.75, renk: '#b08c62', not: '' },
  { id: 'masa-yuvarlak', ad: 'Yuvarlak masa 120', grup: 'Yemek', g: 1.2, d: 1.2, y: 0.75, renk: '#b08c62', not: '' },
  { id: 'sandalye', ad: 'Sandalye', grup: 'Yemek', g: 0.45, d: 0.5, y: 0.85, renk: '#9a8769', not: '' },
  // --- mutfak
  { id: 'tezgah-180', ad: 'Mutfak tezgâhı 180', grup: 'Mutfak', g: 1.8, d: 0.6, y: 0.9, renk: '#8e97a3', not: 'DIN 18022: tezgâh derinliği 60, yükseklik 85-90 cm' },
  { id: 'tezgah-240', ad: 'Mutfak tezgâhı 240', grup: 'Mutfak', g: 2.4, d: 0.6, y: 0.9, renk: '#8e97a3', not: '' },
  { id: 'ada', ad: 'Mutfak adası', grup: 'Mutfak', g: 1.8, d: 0.9, y: 0.9, renk: '#8e97a3', not: 'Ada ile tezgâh arası en az 120 cm' },
  { id: 'buzdolabi', ad: 'Buzdolabı', grup: 'Mutfak', g: 0.7, d: 0.7, y: 1.85, renk: '#8e97a3', not: '' },
  { id: 'ocak', ad: 'Ocak / fırın', grup: 'Mutfak', g: 0.6, d: 0.6, y: 0.9, renk: '#8e97a3', not: 'Yanına en az 40 cm tezgâh bırak' },
  // --- yatak
  { id: 'yatak-tek', ad: 'Tek kişilik yatak', grup: 'Yatak', g: 0.9, d: 2.0, y: 0.5, renk: '#9a8c9f', not: 'Neufert: 90x200; yanında 70 cm geçiş' },
  { id: 'yatak-cift', ad: 'Çift kişilik yatak', grup: 'Yatak', g: 1.6, d: 2.0, y: 0.5, renk: '#9a8c9f', not: '160x200; iki yandan 70 cm geçiş' },
  { id: 'komodin', ad: 'Komodin', grup: 'Yatak', g: 0.45, d: 0.4, y: 0.55, renk: '#b08c62', not: '' },
  { id: 'gardirop', ad: 'Gardırop 200', grup: 'Yatak', g: 2.0, d: 0.6, y: 2.2, renk: '#b08c62', not: 'Askılık derinliği en az 55 cm' },
  { id: 'calisma-masa', ad: 'Çalışma masası', grup: 'Yatak', g: 1.2, d: 0.6, y: 0.75, renk: '#b08c62', not: '' },
  // --- ıslak hacim
  { id: 'klozet', ad: 'Klozet', grup: 'Islak hacim', g: 0.4, d: 0.7, y: 0.4, renk: '#7f93a0', not: 'Önünde 60x60 cm serbest alan' },
  { id: 'lavabo', ad: 'Lavabo', grup: 'Islak hacim', g: 0.6, d: 0.5, y: 0.85, renk: '#7f93a0', not: 'Ayna önü 70 cm hareket alanı' },
  { id: 'dus', ad: 'Duş 90x90', grup: 'Islak hacim', g: 0.9, d: 0.9, y: 0.05, renk: '#7f93a0', not: 'En az 80x80; tercihen 90x90' },
  { id: 'kuvet', ad: 'Küvet 170', grup: 'Islak hacim', g: 1.7, d: 0.75, y: 0.55, renk: '#7f93a0', not: '' },
  { id: 'camasir', ad: 'Çamaşır makinesi', grup: 'Islak hacim', g: 0.6, d: 0.6, y: 0.85, renk: '#7f93a0', not: '' },
  // --- sirkülasyon / yapısal
  { id: 'merdiven-duz', ad: 'Düz kollu merdiven', grup: 'Sirkülasyon', g: 1.1, d: 3.2, y: 0.02, renk: '#a3705a', not: '2h+t=63; rıhtım 17.5, basamak 28 cm' },
  { id: 'merdiven-u', ad: 'U merdiven', grup: 'Sirkülasyon', g: 2.4, d: 2.6, y: 0.02, renk: '#a3705a', not: 'Sahanlık en az kol genişliği kadar' },
  { id: 'asansor', ad: 'Asansör 110x140', grup: 'Sirkülasyon', g: 1.1, d: 1.4, y: 0.02, renk: '#a3705a', not: 'DIN 15306: 6 kişi / 450 kg' },
  { id: 'asansor-sedye', ad: 'Sedye asansörü', grup: 'Sirkülasyon', g: 1.4, d: 2.4, y: 0.02, renk: '#a3705a', not: 'Sağlık yapılarında zorunlu' },
  // --- ofis / eğitim
  { id: 'ofis-masa', ad: 'Ofis masası', grup: 'Ofis', g: 1.6, d: 0.8, y: 0.75, renk: '#7e8a95', not: 'Kişi başı en az 8 m² çalışma alanı' },
  { id: 'toplanti-8', ad: 'Toplantı masası 8', grup: 'Ofis', g: 2.4, d: 1.2, y: 0.75, renk: '#7e8a95', not: '' },
  { id: 'sira', ad: 'Öğrenci sırası', grup: 'Ofis', g: 1.2, d: 0.5, y: 0.75, renk: '#7e8a95', not: 'Derslikte kişi başı 1.5-2 m²' },
  // --- dış
  { id: 'agac', ad: 'Ağaç', grup: 'Dış mekân', g: 4.0, d: 4.0, y: 6.0, renk: '#6f8460', not: 'Taç çapı 4 m, gövde 6 m' },
  { id: 'arac', ad: 'Otomobil', grup: 'Dış mekân', g: 1.8, d: 4.5, y: 1.5, renk: '#6c7079', not: 'Otopark cebi 2.5x5.0 m' },
]

export const DONATI_GRUPLARI = Array.from(new Set(DONATILAR.map((d) => d.grup)))

export function donatiBul(id: string): DonatiTanimi {
  return DONATILAR.find((d) => d.id === id) ?? DONATILAR[0]
}

export function aciklikBul(tur: 'kapi' | 'pencere', id: string): AciklikTanimi {
  const liste = tur === 'kapi' ? KAPILAR : PENCERELER
  return liste.find((a) => a.id === id) ?? liste[2]
}
