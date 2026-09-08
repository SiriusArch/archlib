import type { KontrolListesi, Kaynak, AnalizTuru } from '../types'

export const ANALIZ_TURU_ADI: Record<AnalizTuru, string> = {
  pafta: 'Pafta / Sunum Duzeni',
  maket: 'Maket',
  plan: 'Plan',
  'kesit-gorunus': 'Kesit ve Gorunus',
  vaziyet: 'Vaziyet Plani ve Cevre',
  konsept: 'Konsept ve Fikir',
  'temel-tasar': 'Temel Tasar Calismasi',
  genel: 'Genel Proje Kritigi',
}

export const ANALIZ_TURU_ACIKLAMA: Record<AnalizTuru, string> = {
  pafta:
    'Kompozisyon, cizgi hiyerarsisi, tipografi, antet, olcek ve okuma sirasi uzerinden degerlendirir.',
  maket:
    'Olcek, malzeme-doku secimi, soyutlama duzeyi, taban/topografya ve isik-golge okunurlugu uzerinden degerlendirir.',
  plan: 'Mekan organizasyonu, dolasim, olculendirme, cizim standardi ve Neufert olculeri uzerinden degerlendirir.',
  'kesit-gorunus':
    'Kotlandirma, strüktur ifadesi, malzeme acilimi, cizgi hiyerarsisi ve zemin gosterimi uzerinden degerlendirir.',
  vaziyet:
    'Arsa, imar, kot, gunes-ruzgar yonu, cevre iliskisi, yaklasma ve dolasim kurgusu uzerinden degerlendirir.',
  konsept:
    'Ana fikrin netligi, mimari karsiligi, temsil dili ve fikir ile bicim arasindaki tutarlilik uzerinden degerlendirir.',
  'temel-tasar':
    'Tasar ogeleri ve ilkeleri (tekrar, uygunluk, zitlik, koram, egemenlik, denge, birlik) uzerinden degerlendirir.',
  genel: 'Mimari elestirinin 11 basligini bastan sona uygular.',
}

export const KONTROL_LISTELERI: KontrolListesi[] = [
  {
    id: 'pafta',
    baslik: 'Pafta Teslim Kontrol Listesi',
    aciklama:
      'Teslimden once tek tek isaretle. Cogu pafta, tasarim kotu oldugu icin degil, bu maddelerden birkaci atlandigi icin puan kaybeder.',
    maddeler: [
      {
        id: 'p1',
        metin: 'Sol kenarda 5 cm dosyalama seridi bos birakildi mi?',
        kaynak: 'Neufert s.6 / DIN',
      },
      {
        id: 'p2',
        metin: 'Antet en sagda ve eksiksiz mi?',
        aciklama:
          'Universite-fakulte-bolum, ders, proje adi, pafta adi, ogrenci ad-soyad-no, danisman, tarih, OLCEK, pafta no.',
        kaynak: 'Neufert s.6 + MIM 153',
      },
      {
        id: 'p3',
        metin: 'Her cizimin olcegi yazili mi? Ana olcek buyuk, digerleri kucuk mu?',
        kaynak: 'DIN 825',
      },
      {
        id: 'p4',
        metin: 'Vaziyet planinda ve tum planlarda KUZEY ISARETI var mi?',
        aciklama: 'Zorunludur, unutulmasi en sik yapilan hatalardan biridir.',
        kaynak: 'Neufert s.6',
      },
      {
        id: 'p5',
        metin: 'Planlar tum paftalarda AYNI BAKIS YONUNDE yerlestirildi mi?',
        kaynak: 'MIM 244',
      },
      {
        id: 'p6',
        metin: 'Cizgi kalinligi hiyerarsisi kuruldu mu?',
        aciklama:
          'Kesite giren en kalin, gorunus orta, kapi-pencere duvardan ince, tefris ve olcu cizgisi en ince. Kesite giren alanlar koyulastirildi mi?',
        kaynak: 'TS / Temel Tasar "etkili cevre" ilkesi',
      },
      {
        id: 'p7',
        metin: 'Kesit cizgileri planda tam olarak gosterildi mi, bakis yonu ve harf var mi?',
        aciklama: 'Bakis yonune dogru alfabetik sira, buyuk harf (A-A, B-B).',
        kaynak: 'MIM 244',
      },
      {
        id: 'p8',
        metin: 'Dis olculendirme 4 cizgi halinde yapildi mi?',
        aciklama: '1. blok olcusu, 2. cephe hareketleri, 3. tasiyici akslar, 4. doluluk-bosluk.',
        kaynak: 'MIM 244',
      },
      {
        id: 'p9',
        metin: 'Kapi ve pencere poz numaralari ve olculeri yazildi mi? (K1 90/220 formatinda)',
        kaynak: 'Neufert s.6, MIM 244',
      },
      {
        id: 'p10',
        metin: 'Mahal isimleri, mahal numaralari ve alanlar (m2) yazildi mi?',
        aciklama: 'Oda numarasi daire icinde, mahal numarasi elips icinde, alan kare icinde.',
        kaynak: 'Neufert s.6, MIM 244',
      },
      {
        id: 'p11',
        metin: 'Kotlar verildi mi? Kaba ve bitmis kot ayri ayri mi?',
        aciklama: 'Zemin kat doseme ustu +-0.00. Tum kotlar sabit roper kotuna baglandi mi?',
        kaynak: 'MIM 244',
      },
      {
        id: 'p12',
        metin: 'Merdivende cikis hatti, ok, daire, basamak numaralari ve n x r / b yazildi mi?',
        aciklama: 'Cikis aksi ilk basamakta daire ile baslar, son basamakta ok ile biter.',
        kaynak: 'DIN 107, MIM 153',
      },
      {
        id: 'p13',
        metin: 'Olculer cizimi cevirmeden okunabiliyor mu?',
        aciklama: 'Sag taraf icin sagdan, sol taraf icin soldan yazilir.',
        kaynak: 'Neufert s.6',
      },
      {
        id: 'p14',
        metin: 'Paftada tek bir ANA GORSEL (egemenlik) var mi?',
        aciklama:
          'Ayni buyuklukte 6 gorsel paftayi durgunlastirir. Koram (kademeli olcu) ile okuma sirasi kur.',
        kaynak: 'Temel Tasar, Bolum 5.2.1.4 ve 8',
      },
      {
        id: 'p15',
        metin: 'Ust uste binen gorsellerde alttaki gorselin bir kenari disari tasiyor mu?',
        aciklama:
          'Ortme kurali: orten cisim ortuleni TAM kapatmamali. Yarim kalan bindirmeler belirsizlik uretir.',
        kaynak: 'Temel Tasar, Bolum 5.1',
      },
      {
        id: 'p16',
        metin: 'En fazla 2 font ailesi ve 3 ana + 1 vurgu renk kullanildi mi?',
        aciklama: 'Fazla font/renk karakter birligini bozar.',
        kaynak: 'Temel Tasar, karakter birligi',
      },
      {
        id: 'p17',
        metin: 'Olceksiz cizilen kisimlarda olculerin alti cizildi mi?',
        kaynak: 'DIN 825',
      },
      {
        id: 'p18',
        metin: 'Baski cozunurlugu yeterli mi? (A1 pafta icin en az 150-300 dpi)',
        aciklama:
          'Ucretsiz arka plan silme araclarinin ciktilari genellikle dusuk cozunurluklu gelir; kontrol et.',
      },
    ],
  },
  {
    id: 'maket',
    baslik: 'Maket Kontrol Listesi',
    aciklama:
      'Maket, Temel Tasar da tasarimin KONTROL ARACI olarak tanimlanir (Bolum 3.1.6). Once dusunme araci, sonra sunum nesnesidir.',
    maddeler: [
      {
        id: 'm1',
        metin: 'Olcek dogru secildi mi ve maket uzerinde yaziyor mu?',
        aciklama:
          'Kentsel 1/500-1/1000, vaziyet 1/200-1/500, bina 1/100-1/200, kismi/detay 1/50-1/20.',
      },
      {
        id: 'm2',
        metin: 'Olcek gostergesi var mi? (insan figuru, arac, agac)',
        aciklama: 'Insan figuru olcek algisini kuran en guclu ogedir.',
      },
      {
        id: 'm3',
        metin: 'Soyutlama duzeyi tutarli mi?',
        aciklama:
          'Bir maket ya tumuyle soyut (tek malzeme, beyaz kutle) ya tumuyle gercekci olmali. Yari yolda kalan maket karakter birligini bozar.',
        kaynak: 'Temel Tasar, karakter birligi',
      },
      {
        id: 'm4',
        metin: 'Malzeme secimi doku ilkesine uygun mu?',
        aciklama:
          'Sert dokulu, sicak renkli, parlak yuzeyler YAKIN; yumusak dokulu, soguk renkli, mat yuzeyler UZAK etkisi yapar. Ana kutleyi one cikarmak icin bunu kullan.',
        kaynak: 'Temel Tasar, Bolum 7.6',
      },
      {
        id: 'm5',
        metin: 'Topografya kot kot modellendi mi? Kontur araligi yaziyor mu?',
        aciklama: 'Egimli arazide kot farkini gostermek projenin en kritik kararlarindan biridir.',
      },
      {
        id: 'm6',
        metin: 'Taban (kaide) temiz ve maketle uyumlu mu?',
        aciklama: 'Kaide maketin bir parcasidir; kirli veya duzensiz kaide tum isi asagi ceker.',
      },
      {
        id: 'm7',
        metin: 'Isik-golge okunuyor mu?',
        aciklama:
          'Kutle hareketleri golge uretmiyorsa cephe duz ve durgun okunur. Isik-golge, etkili cevre ilkesinin uc boyutlu karsiligidir.',
        kaynak: 'Temel Tasar, Bolum 5.2.3',
      },
      {
        id: 'm8',
        metin: 'Birlesim yerleri ve kesim kenarlari temiz mi?',
        aciklama: 'Yapistirici izi, ezik karton kenari ve egri kesim isciligi puan kaybettirir.',
      },
      {
        id: 'm9',
        metin: 'Cevre dokusu (komsu yapilar) gosterildi mi?',
        aciklama:
          'Mimari elestiri kontrol listesinin 3. maddesi CEVRE ILE ILISKI. Tek basina duran maket bu soruyu cevaplayamaz.',
        kaynak: 'Temel Tasar, Bolum 14.1.5',
      },
      {
        id: 'm10',
        metin: 'Ic mekan gosterilecekse sokulebilir kat / kesit maketi dusunuldu mu?',
      },
      {
        id: 'm11',
        metin: 'Maket fotografi icin notr fon ve tek yonlu isik hazirlandi mi?',
        aciklama: 'Paftaya girecek maket fotografi de bir temsil karari, gelisiguzel cekim degil.',
      },
    ],
  },
  {
    id: 'proje',
    baslik: 'Proje Kritigi: 11 Baslik',
    aciklama:
      'I. Hulusi Gungor, Temel Tasar Bolum 14.1.5. Her baslik AYRI AYRI incelenir ve HERBIRI ICIN NOT ALINIR.',
    maddeler: [
      {
        id: 'k1',
        metin: 'Arsa, imar durumu, imar yonetmeligi ve arazi kotlarina gore durum',
      },
      { id: 'k2', metin: 'Gunes ve ruzgar yonune gore konum' },
      { id: 'k3', metin: 'Cevre ile iliski' },
      {
        id: 'k4',
        metin: 'Yapi programina gore mekanlar, aralarindaki baglantilar ve gecisler saglandi mi',
      },
      { id: 'k5', metin: 'Ana mekanin ozgunlugu, mesaji ve kitleye yansimasi' },
      { id: 'k6', metin: 'Yapinin strukturu' },
      { id: 'k7', metin: 'Secilen malzemeler, yapim tarzi, yapim teknolojisi' },
      {
        id: 'k8',
        metin:
          'Estetik yonden ele alinis: kullanilan oge ve ilkeler, duzenleme esaslari, denge ve karakter birligi',
      },
      { id: 'k9', metin: 'Mekanlar, kitleler ve yapi kisimlari arasindaki oranlar' },
      { id: 'k10', metin: 'Ozgunluk: diger yapi veya mimarlarin etkisinde mi' },
      { id: 'k11', metin: 'Ekonomi, isletme ve bakim acisindan durum' },
    ],
  },
]

export const KAYNAKLAR: Kaynak[] = [
  {
    id: 'yapi-bilgisi-notlar',
    baslik: 'Yapi Bilgisi ders notlari (MIM 153)',
    yazar: 'Trakya Universitesi Mimarlik Fakultesi ders slaytlari',
    tur: 'ders-notu',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabani kaynagi. Iskelet ve celik sistemler, temeller, drenaj, dilatasyon, baca ve adim adim 1/50 plan cizimi. 152 sayfa slayt fotografi olarak okundu.',
  },
  {
    id: 'temel-tasar',
    baslik: 'Temel Tasar',
    yazar: 'I. Hulusi Gungor',
    tur: 'kitap',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabani kaynagi. Turkiye de temel tasar egitiminin kurucu metni. Bu uygulamadaki analiz motorunun omurgasi olan Bolum 14 (Mimari Elestiri ve Yorum) buradan gelir.',
  },
  {
    id: 'neufert',
    baslik: 'Yapi Tasarim Bilgisi (Neufert)',
    yazar: 'Ernst Neufert',
    tur: 'standart',
    rol: 'ana',
    guven: 'yuksek',
    not: 'Ana veri tabani kaynagi. Olcu bankasinin tamami buradan. DIN standartlarina dayanir; Turkiye de yonetmelik uyumu icin TS standartlari ile capraz kontrol gerekir.',
  },
  {
    id: 'mim244',
    baslik: 'Yapi Elemanlari Tasarimi yardimci ders notlari (MIM 244)',
    yazar: 'Dr. Ecem Edis grubu',
    tur: 'ders-notu',
    rol: 'ana',
    guven: 'yuksek',
    not: 'TS 5319 taramalari, cizgi tipleri, olculendirme, poz ve mahal numaralandirma, 1/50 plan-kesit-gorunus icerigi. "Mimarlikta Teknik Resim 1" dosyasinin icinde bulundu.',
  },
  {
    id: 'canbulat',
    baslik: 'Ic Mimarlikta Teknik Resim',
    yazar: 'Prof. Dr. M. Tahsin Canbulat',
    tur: 'kitap',
    rol: 'destek',
    guven: 'yuksek',
    not: 'Cizim gerecleri, kagit normlari, cizgi cesitleri, tasari geometri ve perspektif. Remzi Kitabevi, 2018. Icindekiler ve cizim standartlari bolumu okundu.',
  },
  {
    id: 'ching',
    baslik: 'Mimarlik: Bicim, Mekan ve Duzen',
    yazar: 'Francis D. K. Ching',
    tur: 'kitap',
    rol: 'destek',
    guven: 'yuksek',
    not: 'YEM Yayin, 2002. Duzen ilkeleri (eksen, simetri, hiyerarsi, datum, ritim, donusum) ve organizasyon tipleri (merkezi, dogrusal, isinsal, kumeli, gridal). Metin katmani cikarilarak tarandi.',
  },
  {
    id: 'vitruvius',
    baslik: 'Mimarlik Uzerine On Kitap',
    yazar: 'Vitruvius',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarligin kurucu metni. Firmitas-utilitas-venustas ucgeni. Ceviri metni tarandi; ayrintili alintilar icin kaynak dogrulamasi onerilir.',
  },
  {
    id: 'pallasmaa',
    baslik: 'Tenin Gozleri',
    yazar: 'Juhani Pallasmaa',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarlikta duyusal algi ve dokunma. Temel Tasar in doku bolumuyle dogrudan konusur. 90 sayfalik kismi metin.',
  },
  {
    id: 'lecorbusier',
    baslik: 'Bir Mimarliga Dogru (Vers une architecture)',
    yazar: 'Le Corbusier',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Kisa alinti metni (7 sayfa). Modulor ve modern mimarlik manifestosunun cercevesi icin.',
  },
  {
    id: 'kuban',
    baslik: 'Mimarlik Kavramlari',
    yazar: 'Dogan Kuban',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Mimarlik kavramlarinin Turkce karsiliklari ve tarihsel cercevesi.',
  },
  {
    id: 'tanyeli',
    baslik: 'Yikarak Yapmak',
    yazar: 'Ugur Tanyeli',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Metis Yayinlari. Turkiye de mimarlik ve modernlesme elestirisi. Kuramsal cerceve icin.',
  },
  {
    id: 'eldem',
    baslik: 'Turk Evi Plan Tipleri',
    yazar: 'Sedad Hakki Eldem',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Turk evi plan tipolojisi. Yerel mimarlik referansi ve plan sema analizi icin.',
  },
  {
    id: 'bizley',
    baslik: 'Architecture in Detail II',
    yazar: 'Graham Bizley',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: '21 cagdas yapinin detay cizimleri. Taranmis goruntu; metin katmani yok, ayrintili veri cikarilamadi.',
  },
  {
    id: 'temel-tasarim-ilkeleri',
    baslik: 'Temel Tasarim ve Tasarim Ilkeleri',
    yazar: 'Derleme',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: '576 sayfa taranmis goruntu; metin katmani yok. Icerigi Temel Tasar (Gungor) ile ortusuyor, o kaynak esas alindi.',
  },
  {
    id: 'mimarlik-101',
    baslik: 'Herkes Icin Mimarlik 101',
    yazar: 'Nicole Bridge',
    tur: 'kitap',
    rol: 'destek',
    guven: 'orta',
    not: 'Giris duzeyi mimarlik tarihi ve kavram kilavuzu.',
  },
  {
    id: 'mimarlik-genel',
    baslik: 'Mimarlik (genel)',
    yazar: 'Belirtilmemis',
    tur: 'kitap',
    rol: 'destek',
    guven: 'dusuk',
    not: 'Yazar ve kunye belirsiz. Icerik dogrulanmadan referans gosterilmemeli.',
  },
]
