/**
 * Arsiv — indirilebilir hazir proje kaynaklari.
 *
 * ArchLib dosya barindirmiyor; burada listelenen siteler AutoCAD (DWG),
 * SketchUp (SKP), Revit (RVT) ve benzeri formatlarda gercek, indirilebilir
 * mimari proje dosyalari sunan disaridaki kaynaklardir. Her biri turune,
 * formatina ve ucretine gore siniflandirildi; "dogrulama" alani sitenin
 * bugun erisilebilir olup olmadigini gosterir.
 */

import type { ArsivFormat, ArsivKaynagi, ArsivTur, Ucret } from '../types'

export const ARSIV_TUR_ADI: Record<ArsivTur, string> = {
  konut: 'Konut',
  'ticari-kamu': 'Ticari ve Kamu',
  kulturel: 'Kültürel Yapı',
  'kentsel-peyzaj': 'Kentsel ve Peyzaj',
  'tarihi-roleve': 'Tarihi Rölöve',
  'detay-blok': 'Detay ve Blok',
  'mobilya-obje': 'Mobilya ve Obje',
}

export const ARSIV_FORMAT_ADI: Record<ArsivFormat, string> = {
  dwg: 'DWG',
  skp: 'SKP',
  rvt: 'RVT',
  pdf: 'PDF',
  '3ds': '3DS',
  obj: 'OBJ',
  ifc: 'IFC',
}

export const ARSIV_UCRET_ADI: Record<Ucret, string> = {
  ucretsiz: 'Ücretsiz',
  freemium: 'Ücretsiz + Ücretli',
  ucretli: 'Ücretli',
}

export const ARSIV_KAYNAKLARI: ArsivKaynagi[] = [
  {
    id: '3d-warehouse',
    ad: '3D Warehouse',
    url: 'https://3dwarehouse.sketchup.com',
    turler: ['mobilya-obje', 'konut', 'ticari-kamu'],
    formatlar: ['skp', 'obj'],
    ucret: 'ucretsiz',
    ozet: "SketchUp'ın resmî model kütüphanesi; 5,8 milyondan fazla hazır 3B model.",
    anlatim:
      'Trimble tarafından işletilen resmî SketchUp deposu. Bina kütleleri, iç mekân projeleri, mobilya ve donatı modelleri dahil milyonlarca dosya doğrudan .skp olarak iniyor; çoğu OBJ olarak da dışa aktarılabiliyor. Kalite kullanıcıdan kullanıcıya değişir — indirmeden önce model sayfasındaki görüntüleyiciyle geometriyi kontrol et.',
    kullanim: 'Maket ve sunum için hazır kütle veya donatı modeli; kendi projene ölçekleyip yerleştirebilirsin.',
    etiketler: ['sketchup', 'hazır model', 'mobilya', 'kütle'],
    dogrulama: 'dogrulandi',
    turkce: true,
  },
  {
    id: 'cadbull',
    ad: 'Cadbull',
    url: 'https://www.cadbull.com',
    turler: ['konut', 'ticari-kamu', 'kentsel-peyzaj', 'detay-blok'],
    formatlar: ['dwg', 'skp', 'rvt', 'pdf'],
    ucret: 'freemium',
    ozet: '273.000’in üzerinde dosyayla dünyanın en büyük DWG/SKP/Revit kütüphanelerinden biri.',
    anlatim:
      'Villa, çok katlı konut, altyapı ve kentsel tasarım projelerinin tam plan-kesit-görünüş takımlarını barındırıyor. Ücretsiz dosyalar doğrudan iniyor; "Gold" etiketli dosyalar üyelik veya kredi gerektiriyor. Çizim kalitesi ve ölçek notu her dosya sayfasında ayrı ayrı belirtiliyor.',
    kullanim: 'Emsal proje incelemesi ve teknik çizim standardı karşılaştırması için gerçek ölçekli DWG indir.',
    etiketler: ['dwg', 'villa', 'kat planı', 'detay'],
    fiyatNotu: 'Çoğu dosya ücretsiz; "Gold" dosyalar için üyelik/kredi gerekir.',
    dogrulama: 'dogrulandi',
  },
  {
    id: 'cadblocksfree',
    ad: 'CADblocksfree',
    url: 'https://www.cadblocksfree.com',
    turler: ['detay-blok', 'mobilya-obje'],
    formatlar: ['dwg', 'rvt', '3ds'],
    ucret: 'ucretsiz',
    ozet: 'Tamamen ücretsiz 2B/3B CAD blokları ve hazır modeller kütüphanesi.',
    anlatim:
      'Kapı, pencere, mobilya, araç, insan figürü gibi paftaya doğrudan eklenebilecek küçük ölçekli blokların yanı sıra bazı tam proje dosyaları da sunuyor. Kayıt gerektirmiyor; dosyalar doğrudan indiriliyor.',
    kullanim: 'Paftana insan figürü, araç, mobilya sembolü gibi ölçek ve doku unsurları eklemek için.',
    etiketler: ['blok', 'sembol', 'mobilya', 'ücretsiz'],
    dogrulama: 'dogrulandi',
  },
  {
    id: 'dwg-ru',
    ad: 'DWG.ru',
    url: 'https://dwg.ru',
    turler: ['konut', 'ticari-kamu', 'detay-blok'],
    formatlar: ['dwg'],
    ucret: 'ucretsiz',
    ozet: 'Mühendis ve mimarların paylaştığı devasa bir Rus DWG kütüphanesi.',
    anlatim:
      'Konut, endüstriyel yapı ve altyapı projelerinin tam teknik dosyalarını içeren, forum tabanlı bir paylaşım sitesi. Arşiv çok geniş ama arayüz ve çoğu dosya açıklaması Rusça; tarayıcı çevirisiyle gezinmek gerekiyor. Bazı dosyalar için üyelik/forum katılımı istenir.',
    kullanim: 'Batı kaynaklarında az bulunan endüstriyel veya toplu konut tipolojilerini incelemek için.',
    etiketler: ['dwg', 'rusça', 'endüstriyel', 'forum'],
    uyari: 'Arayüz ve dosya açıklamaları Rusça; bazı indirmeler için forum üyeliği gerekebilir.',
    dogrulama: 'dogrulandi',
    turkce: false,
  },
  {
    id: 'turbosquid',
    ad: 'TurboSquid',
    url: 'https://www.turbosquid.com',
    turler: ['konut', 'ticari-kamu', 'kentsel-peyzaj', 'mobilya-obje'],
    formatlar: ['skp', 'obj', '3ds', 'rvt'],
    ucret: 'freemium',
    ozet: '260.000’den fazla mimari 3B modelin satıldığı, sektörün en büyük pazaryerlerinden biri.',
    anlatim:
      'Bina, kentsel doku, peyzaj ve iç mekân modelleri; çoğu ücretli ama "Free" filtresiyle binlerce ücretsiz dosyaya da ulaşılıyor. Dosyalar genelde birden fazla formatta (SKP, OBJ, 3DS, FBX) birlikte satılıyor.',
    kullanim: 'Sunum render’ı için hazır bağlam/çevre modelleri (bina kütlesi, sokak mobilyası, araç).',
    etiketler: ['3b model', 'render', 'pazaryeri', 'sketchup'],
    fiyatNotu: '"Free" filtresiyle ücretsiz dosyalar da var; çoğu model ücretlidir.',
    dogrulama: 'dogrulandi',
  },
  {
    id: 'habs-haer',
    ad: 'HABS/HAER (Library of Congress)',
    url: 'https://www.loc.gov/collections/historic-american-buildings-landscapes-and-engineering-records/',
    turler: ['tarihi-roleve', 'kulturel'],
    formatlar: ['dwg', 'pdf'],
    ucret: 'ucretsiz',
    ozet: 'ABD Kongre Kütüphanesi’nin kamuya açık tarihi yapı rölöve arşivi.',
    anlatim:
      'Historic American Buildings Survey/Engineering Record programı kapsamında ölçülüp çizilmiş binlerce tarihi yapının tam rölöve paftalarını (plan, kesit, görünüş, detay) barındırır. Kamu malı olduğu için telif sorunu yok; çizim kalitesi çok yüksek ve akademik referans olarak sıkça kullanılır.',
    kullanim: 'Rölöve dersi ve tarihi yapı analizi ödevlerinde referans çizim standardı olarak.',
    etiketler: ['rölöve', 'tarihi yapı', 'kamu malı', 'akademik'],
    uyari: 'Arşiv İngilizce; içerik ABD’deki tarihi yapılarla sınırlıdır.',
    dogrulama: 'kismi',
    turkce: false,
  },
  {
    id: 'behance',
    ad: 'Behance',
    url: 'https://www.behance.net',
    turler: ['konut', 'ticari-kamu', 'kulturel', 'kentsel-peyzaj'],
    formatlar: ['pdf', 'dwg', 'skp'],
    ucret: 'ucretsiz',
    ozet: 'Öğrenci ve profesyonellerin proje dosyalarını da paylaştığı dünyanın en büyük portfolyo platformu.',
    anlatim:
      'Çoğu proje yalnızca görsel sunum paylaşır; ama pek çok mimarlık öğrencisi ve ofis, proje açıklamasına DWG/SKP indirme bağlantısı da ekliyor. Aranacak anahtar kelime: proje başlığı + "download files" ya da "kaynak dosya".',
    kullanim: 'Güncel öğrenci projelerinden sunum diline ve pafta kompozisyonuna ilham almak.',
    etiketler: ['portfolyo', 'öğrenci projesi', 'sunum', 'ilham'],
    uyari: 'Dosya indirme her projede yok; kaynak dosya paylaşımı proje sahibinin insiyatifindedir.',
    dogrulama: 'kismi',
  },
]

export function arsivKaynakBul(id: string): ArsivKaynagi | undefined {
  return ARSIV_KAYNAKLARI.find((k) => k.id === id)
}
