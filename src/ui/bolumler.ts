export type Sekme =
  | 'analiz'
  | 'cizim'
  | 'arazi'
  | 'arsiv'
  | 'forum'
  | 'katalog'
  | 'bilgi'
  | 'liste'
  | 'kaynak'

export interface BolumTanimi {
  id: Sekme
  ad: string
  alt: string
  /** Sınıf adları statik olmalı ki Tailwind tarasın. */
  metin: string
  zemin: string
  kenar: string
  dolgu: string
}

export const BOLUMLER: readonly BolumTanimi[] = [
  {
    id: 'analiz',
    ad: 'Kritik Masası',
    alt: 'Pafta ve maket analizi',
    metin: 'text-kiremit-koyu',
    zemin: 'bg-kiremit-soft',
    kenar: 'border-kiremit',
    dolgu: 'bg-kiremit',
  },
  {
    id: 'cizim',
    ad: 'Çizim',
    alt: '2B plan ve 3B kütle',
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
    id: 'arsiv',
    ad: 'Arşiv',
    alt: 'Hazır CAD projeleri',
    metin: 'text-mor-koyu',
    zemin: 'bg-mor-soft',
    kenar: 'border-mor',
    dolgu: 'bg-mor',
  },
  {
    id: 'forum',
    ad: 'Forum',
    alt: 'Soru, cevap, arkadaşlık',
    metin: 'text-mavi-koyu',
    zemin: 'bg-mavi-soft',
    kenar: 'border-mavi',
    dolgu: 'bg-mavi',
  },
  {
    id: 'katalog',
    ad: 'Araç Kitaplığı',
    alt: '48 araç',
    metin: 'text-adacayi-koyu',
    zemin: 'bg-adacayi-soft',
    kenar: 'border-adacayi',
    dolgu: 'bg-adacayi',
  },
  {
    id: 'bilgi',
    ad: 'Bilgi Bankası',
    alt: 'Kavram, standart, ölçü',
    metin: 'text-kehribar-koyu',
    zemin: 'bg-kehribar-soft',
    kenar: 'border-kehribar',
    dolgu: 'bg-kehribar',
  },
  {
    id: 'liste',
    ad: 'Kontrol Listeleri',
    alt: 'Teslimden önce',
    metin: 'text-mor-koyu',
    zemin: 'bg-mor-soft',
    kenar: 'border-mor',
    dolgu: 'bg-mor',
  },
  {
    id: 'kaynak',
    ad: 'Kaynaklar',
    alt: 'Şeffaflık',
    metin: 'text-murekkep',
    zemin: 'bg-kagit-3',
    kenar: 'border-murekkep',
    dolgu: 'bg-murekkep',
  },
]

export function bolumBul(id: Sekme): BolumTanimi {
  return BOLUMLER.find((b) => b.id === id) ?? BOLUMLER[0]
}
