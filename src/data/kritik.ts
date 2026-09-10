import type { KontrolListesi, Kaynak, AnalizTuru } from '../types'

export const ANALIZ_TURU_ADI: Record<AnalizTuru, string> = {
  pafta: 'Pafta / Sunum Düzeni',
  maket: 'Maket',
  plan: 'Plan',
  'kesit-gorunus': 'Kesit ve Görünüş',
  vaziyet: 'Vaziyet Planı ve Çevre',
  konsept: 'Konsept ve Fikir',
  'temel-tasar': 'Temel Tasar Çalışması',
  genel: 'Genel Proje Kritiği',
}

export const ANALIZ_TURU_ACIKLAMA: Record<AnalizTuru, string> = {
  pafta:
    'Kompozisyon, çizgi hiyerarşisi, tipografi, antet, ölçek ve okuma sırası üzerinden değerlendirir.',
  maket:
    'Ölçek, malzeme-doku seçimi, soyutlama düzeyi, taban/topografya ve ışık-gölge okunurluğu üzerinden değerlendirir.',
  plan: 'Mekân organizasyonu, dolaşım, ölçülendirme, çizim standardı ve Neufert ölçüleri üzerinden değerlendirir.',
  'kesit-gorunus':
    'Kotlandırma, strüktür ifadesi, malzeme açılımı, çizgi hiyerarşisi ve zemin gösterimi üzerinden değerlendirir.',
  vaziyet:
    'Arsa, imar, kot, güneş-rüzgâr yönü, çevre ilişkisi, yaklaşma ve dolaşım kurgusu üzerinden değerlendirir.',
  konsept:
    'Ana fikrin netliği, mimari karşılığı, temsil dili ve fikir ile biçim arasındaki tutarlılık üzerinden değerlendirir.',
  'temel-tasar':
    'Tasar öğeleri ve ilkeleri (tekrar, uygunluk, zıtlık, koram, egemenlik, denge, birlik) üzerinden değerlendirir.',
  genel: 'Mimari eleştirinin 11 başlığını baştan sona uygular.',
}

export const KONTROL_LISTELERI: KontrolListesi[] = [
  {
    id: 'pafta',
    baslik: 'Pafta Teslim Kontrol Listesi',
    aciklama:
      'Teslimden önce tek tek işaretle. Çoğu pafta, tasarım kötü olduğu için değil, bu maddelerden birkaçı atlandığı için puan kaybeder.',
    maddeler: [
      {
        id: 'p1',
        metin: 'Sol kenarda 5 cm dosyalama şeridi boş bırakıldı mı?',
        kaynak: 'Neufert s.6 / DIN',
      },
      {
        id: 'p2',
        metin: 'Antet en sağda ve eksiksiz mi?',
        aciklama:
          'Üniversite-fakülte-bölüm, ders, proje adı, pafta adı, öğrenci ad-soyad-no, danışman, tarih, ÖLÇEK, pafta no.',
        kaynak: 'Neufert s.6 + MİM 153',
      },
      {
        id: 'p3',
        metin: 'Her çizimin ölçeği yazılı mı? Ana ölçek büyük, diğerleri küçük mü?',
        kaynak: 'DIN 825',
      },
      {
        id: 'p4',
        metin: 'Vaziyet planında ve tüm planlarda KUZEY İŞARETİ var mı?',
        aciklama: 'Zorunludur, unutulması en sık yapılan hatalardan biridir.',
        kaynak: 'Neufert s.6',
      },
      {
        id: 'p5',
        metin: 'Planlar tüm paftalarda AYNI BAKIŞ YÖNÜNDE yerleştirildi mi?',
        kaynak: 'MİM 244',
      },
      {
        id: 'p6',
        metin: 'Çizgi kalınlığı hiyerarşisi kuruldu mu?',
        aciklama:
          'Kesite giren en kalın, görünüş orta, kapı-pencere duvardan ince, tefriş ve ölçü çizgisi en ince. Kesite giren alanlar koyulaştırıldı mı?',
        kaynak: 'TS / Temel Tasar "etkili çevre" ilkesi',
      },
      {
        id: 'p7',
        metin: 'Kesit çizgileri planda tam olarak gösterildi mi, bakış yönü ve harf var mı?',
        aciklama: 'Bakış yönüne doğru alfabetik sıra, büyük harf (A-A, B-B).',
        kaynak: 'MİM 244',
      },
      {
        id: 'p8',
        metin: 'Dış ölçülendirme 4 çizgi halinde yapıldı mı?',
        aciklama: '1. blok ölçüsü, 2. cephe hareketleri, 3. taşıyıcı akslar, 4. doluluk-boşluk.',
        kaynak: 'MİM 244',
      },
      {
        id: 'p9',
        metin: 'Kapı ve pencere poz numaraları ve ölçüleri yazıldı mı? (K1 90/220 formatında)',
        kaynak: 'Neufert s.6, MİM 244',
      },
      {
        id: 'p10',
        metin: 'Mahal isimleri, mahal numaraları ve alanlar (m²) yazıldı mı?',
        aciklama: 'Oda numarası daire içinde, mahal numarası elips içinde, alan kare içinde.',
        kaynak: 'Neufert s.6, MİM 244',
      },
      {
        id: 'p11',
        metin: 'Kotlar verildi mi? Kaba ve bitmiş kot ayrı ayrı mı?',
        aciklama: 'Zemin kat döşeme üstü +-0.00. Tüm kotlar sabit röper kotuna bağlandı mı?',
        kaynak: 'MİM 244',
      },
      {
        id: 'p12',
        metin: 'Merdivende çıkış hattı, ok, daire, basamak numaraları ve n x r / b yazıldı mı?',
        aciklama: 'Çıkış aksı ilk basamakta daire ile başlar, son basamakta ok ile biter.',
        kaynak: 'DIN 107, MİM 153',
      },
      {
        id: 'p13',
        metin: 'Ölçüler çizimi çevirmeden okunabiliyor mu?',
        aciklama: 'Sağ taraf için sağdan, sol taraf için soldan yazılır.',
        kaynak: 'Neufert s.6',
      },
      {
        id: 'p14',
        metin: 'Paftada tek bir ANA GÖRSEL (egemenlik) var mı?',
        aciklama:
          'Aynı büyüklükte 6 görsel paftayı durgunlaştırır. Koram (kademeli ölçü) ile okuma sırası kur.',
        kaynak: 'Temel Tasar, Bölüm 5.2.1.4 ve 8',
      },
      {
        id: 'p15',
        metin: 'Üst üste binen görsellerde alttaki görselin bir kenarı dışarı taşıyor mu?',
        aciklama:
          'Örtme kuralı: örten cisim örtüleni TAM kapatmamalı. Yarım kalan bindirmeler belirsizlik üretir.',
        kaynak: 'Temel Tasar, Bölüm 5.1',
      },
      {
        id: 'p16',
        metin: 'En fazla 2 font ailesi ve 3 ana + 1 vurgu renk kullanıldı mı?',
        aciklama: 'Fazla font/renk karakter birliğini bozar.',
        kaynak: 'Temel Tasar, karakter birliği',
      },
      {
        id: 'p17',
        metin: 'Ölçeksiz çizilen kısımlarda ölçülerin altı çizildi mi?',
        kaynak: 'DIN 825',
      },
      {
        id: 'p18',
        metin: 'Baskı çözünürlüğü yeterli mi? (A1 pafta için en az 150-300 dpi)',
        aciklama:
          'Ücretsiz arka plan silme araçlarının çıktıları genellikle düşük çözünürlüklü gelir; kontrol et.',
      },
    ],
  },
  {
    id: 'maket',
    baslik: 'Maket Kontrol Listesi',
    aciklama:
      'Maket, Temel Tasar\'da tasarımın KONTROL ARACI olarak tanımlanır (Bölüm 3.1.6). Önce düşünme aracı, sonra sunum nesnesidir.',
    maddeler: [
      {
        id: 'm1',
        metin: 'Ölçek doğru seçildi mi ve maket üzerinde yazıyor mu?',
        aciklama:
          'Kentsel 1/500-1/1000, vaziyet 1/200-1/500, bina 1/100-1/200, kısmi/detay 1/50-1/20.',
      },
      {
        id: 'm2',
        metin: 'Ölçek göstergesi var mı? (insan figürü, araç, ağaç)',
        aciklama: 'İnsan figürü ölçek algısını kuran en güçlü öğedir.',
      },
      {
        id: 'm3',
        metin: 'Soyutlama düzeyi tutarlı mı?',
        aciklama:
          'Bir maket ya tümüyle soyut (tek malzeme, beyaz kütle) ya tümüyle gerçekçi olmalı. Yarı yolda kalan maket karakter birliğini bozar.',
        kaynak: 'Temel Tasar, karakter birliği',
      },
      {
        id: 'm4',
        metin: 'Malzeme seçimi doku ilkesine uygun mu?',
        aciklama:
          'Sert dokulu, sıcak renkli, parlak yüzeyler YAKIN; yumuşak dokulu, soğuk renkli, mat yüzeyler UZAK etkisi yapar. Ana kütleyi öne çıkarmak için bunu kullan.',
        kaynak: 'Temel Tasar, Bölüm 7.6',
      },
      {
        id: 'm5',
        metin: 'Topografya kot kot modellendi mi? Kontur aralığı yazıyor mu?',
        aciklama: 'Eğimli arazide kot farkını göstermek projenin en kritik kararlarından biridir.',
      },
      {
        id: 'm6',
        metin: 'Taban (kaide) temiz ve maketle uyumlu mu?',
        aciklama: 'Kaide maketin bir parçasıdır; kirli veya düzensiz kaide tüm işi aşağı çeker.',
      },
      {
        id: 'm7',
        metin: 'Işık-gölge okunuyor mu?',
        aciklama:
          'Kütle hareketleri gölge üretmiyorsa cephe düz ve durgun okunur. Işık-gölge, etkili çevre ilkesinin üç boyutlu karşılığıdır.',
        kaynak: 'Temel Tasar, Bölüm 5.2.3',
      },
      {
        id: 'm8',
        metin: 'Birleşim yerleri ve kesim kenarları temiz mi?',
        aciklama: 'Yapıştırıcı izi, ezik karton kenarı ve eğri kesim işçiliği puan kaybettirir.',
      },
      {
        id: 'm9',
        metin: 'Çevre dokusu (komşu yapılar) gösterildi mi?',
        aciklama:
          'Mimari eleştiri kontrol listesinin 3. maddesi ÇEVRE İLE İLİŞKİ. Tek başına duran maket bu soruyu cevaplayamaz.',
        kaynak: 'Temel Tasar, Bölüm 14.1.5',
      },
      {
        id: 'm10',
        metin: 'İç mekân gösterilecekse sökülebilir kat / kesit maketi düşünüldü mü?',
      },
      {
        id: 'm11',
        metin: 'Maket fotoğrafı için nötr fon ve tek yönlü ışık hazırlandı mı?',
        aciklama: 'Paftaya girecek maket fotoğrafı da bir temsil kararı, gelişigüzel çekim değil.',
      },
    ],
  },
  {
    id: 'proje',
    baslik: 'Proje Kritiği: 11 Başlık',
    aciklama:
      'İ. Hulûsi Güngör, Temel Tasar Bölüm 14.1.5. Her başlık AYRI AYRI incelenir ve HER BİRİ İÇİN NOT ALINIR.',
    maddeler: [
      {
        id: 'k1',
        metin: 'Arsa, imar durumu, imar yönetmeliği ve arazi kotlarına göre durum',
      },
      { id: 'k2', metin: 'Güneş ve rüzgâr yönüne göre konum' },
      { id: 'k3', metin: 'Çevre ile ilişki' },
      {
        id: 'k4',
        metin: 'Yapı programına göre mekânlar, aralarındaki bağlantılar ve geçişler sağlandı mı',
      },
      { id: 'k5', metin: 'Ana mekânın özgünlüğü, mesajı ve kitleye yansıması' },
      { id: 'k6', metin: 'Yapının strüktürü' },
      { id: 'k7', metin: 'Seçilen malzemeler, yapım tarzı, yapım teknolojisi' },
      {
        id: 'k8',
        metin:
          'Estetik yönden ele alınış: kullanılan öğe ve ilkeler, düzenleme esasları, denge ve karakter birliği',
      },
      { id: 'k9', metin: 'Mekânlar, kütleler ve yapı kısımları arasındaki oranlar' },
      { id: 'k10', metin: 'Özgünlük: diğer yapı veya mimarların etkisinde mi' },
      { id: 'k11', metin: 'Ekonomi, işletme ve bakım açısından durum' },
    ],
  },
]

export const KAYNAKLAR: Kaynak[] = [
  {
    id: 'yapi-bilgisi-notlar',
    baslik: 'Yapı Bilgisi ders notları (MİM 153)',
    yazar: 'Trakya Üniversitesi Mimarlık Fakültesi ders slaytları',
    tur: 'ders-notu',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabanı kaynağı. İskelet ve çelik sistemler, temeller, drenaj, dilatasyon, baca ve adım adım 1/50 plan çizimi. 152 sayfa slayt fotoğrafı olarak okundu.',
  },
  {
    id: 'temel-tasar',
    baslik: 'Temel Tasar',
    yazar: 'İ. Hulûsi Güngör',
    tur: 'kitap',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabanı kaynağı. Türkiye’de temel tasar eğitiminin kurucu metni. Bu uygulamadaki analiz motorunun omurgası olan Bölüm 14 (Mimari Eleştiri ve Yorum) buradan gelir.',
  },
  {
    id: 'neufert',
    baslik: 'Yapı Tasarım Bilgisi (Neufert)',
    yazar: 'Ernst Neufert',
    tur: 'standart',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabanı kaynağı. Ölçü bankasının tamamı buradan. DIN standartlarına dayanır; Türkiye’de yönetmelik uyumu için TS standartları ile çapraz kontrol gerekir.',
  },
  {
    id: 'mim244',
    baslik: 'Yapı Elemanları Tasarımı yardımcı ders notları (MİM 244)',
    yazar: 'Dr. Ecem Edis grubu',
    tur: 'ders-notu',
    rol: 'ana',
    guven: 'yuksek',
    not: 'TS 5319 taramaları, çizgi tipleri, ölçülendirme, poz ve mahal numaralandırma, 1/50 plan-kesit-görünüş içeriği. "Mimarlıkta Teknik Resim 1" dosyasının içinde bulundu.',
  },
  {
    id: 'canbulat',
    baslik: 'İç Mimarlıkta Teknik Resim',
    yazar: 'Prof. Dr. M. Tahsin Canbulat',
    tur: 'kitap',
    rol: 'destek',
    guven: 'yuksek',
    not: 'Çizim gereçleri, kâğıt normları, çizgi çeşitleri, tasarı geometri ve perspektif. Remzi Kitabevi, 2018. İçindekiler ve çizim standartları bölümü okundu.',
  },
  {
    id: 'ching',
    baslik: 'Mimarlık: Biçim, Mekân ve Düzen',
    yazar: 'Francis D. K. Ching',
    tur: 'kitap',
    rol: 'destek',
    guven: 'yuksek',
    not: 'YEM Yayın, 2002. Düzen ilkeleri (eksen, simetri, hiyerarşi, datum, ritim, dönüşüm) ve organizasyon tipleri (merkezi, doğrusal, ışınsal, kümeli, gridal). Metin katmanı çıkarılarak tarandı.',
  },
  {
    id: 'vitruvius',
    baslik: 'Mimarlık Üzerine On Kitap',
    yazar: 'Vitruvius',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarlığın kurucu metni. Firmitas-utilitas-venustas üçgeni. Çeviri metni tarandı; ayrıntılı alıntılar için kaynak doğrulaması önerilir.',
  },
  {
    id: 'pallasmaa',
    baslik: 'Tenin Gözleri',
    yazar: 'Juhani Pallasmaa',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarlıkta duyusal algı ve dokunma. Temel Tasar’ın doku bölümüyle doğrudan konuşur. 90 sayfalık kısmi metin.',
  },
  {
    id: 'lecorbusier',
    baslik: 'Bir Mimarlığa Doğru (Vers une architecture)',
    yazar: 'Le Corbusier',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Kısa alıntı metni (7 sayfa). Modülor ve modern mimarlık manifestosunun çerçevesi için.',
  },
  {
    id: 'kuban',
    baslik: 'Mimarlık Kavramları',
    yazar: 'Doğan Kuban',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarlık kavramlarının Türkçe karşılıkları ve tarihsel çerçevesi.',
  },
  {
    id: 'tanyeli',
    baslik: 'Yıkarak Yapmak',
    yazar: 'Uğur Tanyeli',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Metis Yayınları. Türkiye’de mimarlık ve modernleşme eleştirisi. Kuramsal çerçeve için.',
  },
  {
    id: 'eldem',
    baslik: 'Türk Evi Plan Tipleri',
    yazar: 'Sedad Hakkı Eldem',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Türk evi plan tipolojisi. Yerel mimarlık referansı ve plan şema analizi için.',
  },
  {
    id: 'bizley',
    baslik: 'Architecture in Detail II',
    yazar: 'Graham Bizley',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: '21 çağdaş yapının detay çizimleri. Taranmış görüntü; metin katmanı yok, ayrıntılı veri çıkarılamadı.',
  },
  {
    id: 'temel-tasarim-ilkeleri',
    baslik: 'Temel Tasarım ve Tasarım İlkeleri',
    yazar: 'Derleme',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: '576 sayfa taranmış görüntü; metin katmanı yok. İçeriği Temel Tasar (Güngör) ile örtüşüyor, o kaynak esas alındı.',
  },
  {
    id: 'mimarlik-101',
    baslik: 'Herkes İçin Mimarlık 101',
    yazar: 'Nicole Bridge',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Giriş düzeyi mimarlık tarihi ve kavram kılavuzu.',
  },
  {
    id: 'mimarlik-genel',
    baslik: 'Mimarlık (genel)',
    yazar: 'Belirtilmemiş',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: 'Yazar ve künye belirsiz. İçerik doğrulanmadan referans gösterilmemeli.',
  },
]
