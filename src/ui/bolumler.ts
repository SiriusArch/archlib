export type Sekme = 'analiz' | 'arazi' | 'katalog' | 'bilgi' | 'liste' | 'kaynak'

export interface BolumTanimi {
  id: Sekme
  no: string
  ad: string
  alt: string
  /** Bolum rengi — Tailwind renk adi (index.css @theme icinde tanimli) */
  renk: 'kiremit' | 'mavi' | 'adacayi' | 'kehribar' | 'mor' | 'murekkep'
  /** Sinif adlari statik olmali ki Tailwind tarasin. */
  metin: string
  zemin: string
  kenar: string
  dolgu: string
}

export const BOLUMLER: readonly BolumTanimi[] = [
  {
    id: 'analiz',
    no: '01',
    ad: 'Kritik Masasi',
    alt: 'Pafta ve maket analizi',
    renk: 'kiremit',
    metin: 'text-kiremit-koyu',
    zemin: 'bg-kiremit-soft',
    kenar: 'border-kiremit',
    dolgu: 'bg-kiremit',
  },
  {
    id: 'arazi',
    no: '02',
    ad: 'Arazi',
    alt: 'Konumdan plan, model, kesit',
    renk: 'mavi',
    metin: 'text-mavi-koyu',
    zemin: 'bg-mavi-soft',
    kenar: 'border-mavi',
    dolgu: 'bg-mavi',
  },
  {
    id: 'katalog',
    no: '03',
    ad: 'Arac Kitapligi',
    alt: '48 arac',
    renk: 'adacayi',
    metin: 'text-adacayi-koyu',
    zemin: 'bg-adacayi-soft',
    kenar: 'border-adacayi',
    dolgu: 'bg-adacayi',
  },
  {
    id: 'bilgi',
    no: '04',
    ad: 'Bilgi Bankasi',
    alt: 'Kavram, standart, olcu',
    renk: 'kehribar',
    metin: 'text-kehribar-koyu',
    zemin: 'bg-kehribar-soft',
    kenar: 'border-kehribar',
    dolgu: 'bg-kehribar',
  },
  {
    id: 'liste',
    no: '05',
    ad: 'Kontrol Listeleri',
    alt: 'Teslim oncesi',
    renk: 'mor',
    metin: 'text-mor-koyu',
    zemin: 'bg-mor-soft',
    kenar: 'border-mor',
    dolgu: 'bg-mor',
  },
  {
    id: 'kaynak',
    no: '06',
    ad: 'Kaynaklar',
    alt: 'Seffaflik',
    renk: 'murekkep',
    metin: 'text-murekkep',
    zemin: 'bg-kagit-3',
    kenar: 'border-murekkep',
    dolgu: 'bg-murekkep',
  },
]

export function bolumBul(id: Sekme): BolumTanimi {
  return BOLUMLER.find((b) => b.id === id) ?? BOLUMLER[0]
}
