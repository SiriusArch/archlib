export type Sekme = 'analiz' | 'cizim' | 'arazi' | 'katalog' | 'bilgi' | 'liste' | 'kaynak'

export interface BolumTanimi {
  id: Sekme
  ad: string
  alt: string
  /** Sinif adlari statik olmali ki Tailwind tarasin. */
  metin: string
  zemin: string
  kenar: string
  dolgu: string
}

export const BOLUMLER: readonly BolumTanimi[] = [
  {
    id: 'analiz',
    ad: 'Kritik Masasi',
    alt: 'Pafta ve maket analizi',
    metin: 'text-kiremit-koyu',
    zemin: 'bg-kiremit-soft',
    kenar: 'border-kiremit',
    dolgu: 'bg-kiremit',
  },
  {
    id: 'cizim',
    ad: 'Cizim',
    alt: '2B plan ve 3B kutle',
    metin: 'text-mor-koyu',
    zemin: 'bg-mor-soft',
    kenar: 'border-mor',
    dolgu: 'bg-mor',
  },
  {
    id: 'arazi',
    ad: 'Arazi',
    alt: 'Plan, model, kesit',
    metin: 'text-mavi-koyu',
    zemin: 'bg-mavi-soft',
    kenar: 'border-mavi',
    dolgu: 'bg-mavi',
  },
  {
    id: 'katalog',
    ad: 'Arac Kitapligi',
    alt: '48 arac',
    metin: 'text-adacayi-koyu',
    zemin: 'bg-adacayi-soft',
    kenar: 'border-adacayi',
    dolgu: 'bg-adacayi',
  },
  {
    id: 'bilgi',
    ad: 'Bilgi Bankasi',
    alt: 'Kavram, standart, olcu',
    metin: 'text-kehribar-koyu',
    zemin: 'bg-kehribar-soft',
    kenar: 'border-kehribar',
    dolgu: 'bg-kehribar',
  },
  {
    id: 'liste',
    ad: 'Kontrol Listeleri',
    alt: 'Teslim oncesi',
    metin: 'text-mor-koyu',
    zemin: 'bg-mor-soft',
    kenar: 'border-mor',
    dolgu: 'bg-mor',
  },
  {
    id: 'kaynak',
    ad: 'Kaynaklar',
    alt: 'Seffaflik',
    metin: 'text-murekkep',
    zemin: 'bg-kagit-3',
    kenar: 'border-murekkep',
    dolgu: 'bg-murekkep',
  },
]

export function bolumBul(id: Sekme): BolumTanimi {
  return BOLUMLER.find((b) => b.id === id) ?? BOLUMLER[0]
}
