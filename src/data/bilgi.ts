import type { BilgiBolumu } from '../types'

export const BILGI_BOLUMLERI: BilgiBolumu[] = [
  // ============================================================
  {
    id: 'temel-tasar-ilkeler',
    baslik: 'Temel Tasar: Ogeler ve Ilkeler',
    aciklama:
      'Her mimari elestirinin dili bu kavramlarla kurulur. Bir paftaya "guzel" ya da "kotu" demek yerine hangi ilkenin calistigini ya da bozuldugunu soyleyebilmek gerekir.',
    kaynak: 'I. Hulusi Gungor, Temel Tasar (Bolum 7-8)',
    maddeler: [
      {
        id: 'tt-ogeler',
        baslik: 'Tasar ogeleri',
        icerik:
          'Nokta, cizgi, yuzey, hacim, OLCU, DOKU, renk, deger, ARALIK, YON, hareket, isik-golge.\n\nBir tasarim bu ogelerin tasar ilkeleri geregince bir araya gelmesiyle olusur. Yuzeysel bir araya gelisler ZEMIN ANLATIMI, hacimsel olanlar SEKIL ANLATIMI uretir.\n\nPafta karsiligi: bir paftada da ayni ogeler is basindadir. Cizgi kalinligi bir "deger" karari, tarama bir "doku" karari, boslugun buyuklugu bir "aralik" karariidir.',
        kaynak: 'Temel Tasar, Bolum 7',
        etiketler: ['oge', 'temel tasar', 'pafta'],
      },
      {
        id: 'tt-eksen',
        baslik: 'Tekrar - Uygunluk - Zitlik ekseni',
        icerik:
          'TEKRAR: hersey birbirinin aynidir.\nUYGUNLUK: tam ayni degil, ama benzer taraflar vardir.\nZITLIK: hicbir benzer taraf yoktur.\n\n"Uygunluk, tekrar ile zitlik arasindaki yolun yarisidir."\n\nUygunluk mutlak benzerlikle degil, RAHAT HISSEDILEBILIR BIR YAKINLIKLA saglanir. Uygunluk turleri: yon, bicim, olcu, aralik, doku ve deger uygunlugu.\n\nUygunluk dort grupta toplanir: fiziksel uygunluk, hizmet uygunlugu, bicim uygunlugu, uslup uygunlugu.\n\nTeshis kurali: Bir duzenleme sikici geliyorsa uygunluk fazla / zitlik azdir. Dagimik geliyorsa zitlik fazla / uygunluk azdir.',
        kaynak: 'Temel Tasar, Bolum 8.3',
        etiketler: ['uygunluk', 'zitlik', 'tekrar', 'elestiri'],
      },
      {
        id: 'tt-tekrar',
        baslik: 'Tekrar ve turleri',
        icerik:
          'Bir ogenin aynen ya da cok yakin ozellikte birden fazla kullanilmasi. Aralarindaki benzerlik BIRLESTIRICI BIR BAG gorevi yapar; tasar olusturmada cabuklastirici rol oynar.\n\nTAM TEKRAR: olcu, bicim, renk, deger ve doku tam ayni, ESIT ARALIK ve AYNI YONDE.\nDEGISKEN TEKRAR: temel oge korunur, bir ozellik kademeli degisir.\nARDISIK TEKRAR: bicimlerin belirli bir duzen icinde (yatay, dusey, capraz) BIR ATLAYARAK ard arda tekrarlanmasi. Renk ve deger eklenerek petek, kabartma ve dekoratif yuzeyler uretilir.\n\nProf. Friedrick Hess in dersteki gosterimi: tahtaya tek bir kus cizip "bu o kadar etkili degil" der, yanina birkac kus daha cizip "goruyorsunuz, tekrar etki yaratiyor" der.',
        kaynak: 'Temel Tasar, Bolum 8.1',
        etiketler: ['tekrar', 'ritim', 'cephe'],
      },
      {
        id: 'tt-denge',
        baslik: 'Denge: bakisik ve bakisimsiz',
        icerik:
          'BAKISIK (simetrik) denge tekduzenlik (monotonluk) meydana getirir. Her iki cephesi de bakisik olan bir binada bakisim tekduzenligi kacinilmaz kilar.\n\nBAKISIMSIZ DENGE, esit olmayan ogelerin gorsel agirliklarinin dengelenmesidir; canlilik uretir.\n\nOrnek 1 - Roma da bir apartman (V. Monaco, A. Luccichenti, J. Lafuente): cift dairenin bakisik tertiplenmesinin getirecegi tekduzenligi gidermek icin on cephedeki balkonlarda degisiklik yapilmis, balkonlar BIR KAT ATLAYARAK tekrarlanarak bakisimsiz ve cekici bir gorunus elde edilmistir.\n\nOrnek 2 - Berlin Corbusierhaus (Le Corbusier): birbirinin benzeri cok sayida dairenin bir arada bulundugu binada, tekduzenlikten kacinmak icin cephede degisiklige gidilmis ve bakisimsiz denge uygulanmistir.',
        kaynak: 'Temel Tasar, Bolum 8',
        etiketler: ['denge', 'simetri', 'cephe', 'monotonluk'],
      },
      {
        id: 'tt-yon-zitligi',
        baslik: 'Yon zitligi: Anitkabir ornegi',
        icerik:
          'Ord. Prof. Emin Onat ile Prof. Orhan Arda nin ortak eseri ANITKABIR planlamasinda YON ZITLIGI kullanilmistir.\n\nAnit ekseni ile Aslanli Yol un ekseni birbirine diktir. Bu yuzden birinden digerine gecerken takip edilen yonler de birbirine diktir. Aniti YANDAN gorerek yaklasan kisi, meydana girdigi noktada birden anita dogru doner; onu tam karsidan, baska bir gorus acisiyla ve daha buyuk boyutta algilar. Bu ani donus, ziyaretcinin daha fazla ilgi duyarak ve etkilenerek anita yaklasmasini saglar.\n\nDers: dolasim, sadece ulasim degil ALGI KURGUSUDUR. Vaziyet planinda yaklasma yonunu bir tasarim karari olarak ele al.',
        kaynak: 'Temel Tasar, Bolum 8',
        etiketler: ['yon zitligi', 'dolasim', 'algi', 'Anitkabir', 'vaziyet'],
      },
      {
        id: 'tt-doku',
        baslik: 'Doku ve mekan iliskisi',
        icerik:
          'Uc grup: SERT (kaba), ORTA SERT, YUMUSAK dokular.\n\nTEMEL KURAL: Sert dokulu, sicak renkli, parlak yuzeyli cisimler bulunduklari yerden DAHA YAKINDA; yumusak dokulu, soguk renkli, mat yuzeyli cisimler DAHA UZAKTA etki yapar.\n\nRuhsal etkiler:\n- Yumusak doku: SUKUNET ve RAHATLIK.\n- Sert doku: DINAMIK duygular; insani uyanik tutar, azim ve iradeyi destekler, heyecan verir.\n- Anitta sert doku; mabette, istirahat kosesinde, okuma salonunda yumusak doku uygun duser.\n\nMekan-doku eslesmesi:\n- Oturma, uyuma, dinlenme (evler, oteller, hastaneler): YUMUSAK doku. Bazi koselere canlilik icin orta sert / sert doku.\n- Calisma ve spor mekanlari: orta sert ve yer yer sert doku.\n- Mutfak hareketli bir yer oldugu icin orta sertlikte dokulari kaldirir.\n\nDERINLIK ETKISI: Tavani sert dokulu bir mekan ALCAK, yan duvarlari sert dokulu bir oda DAR, karsi duvari sert dokulu bir yer daha AZ DERIN gorulur.\n\nIsil etki: Doseme ve mobilya malzemesi secilirken ISINMA ISISI KATSAYISI DUSUK (ilimli) gerecler tercih edilmeli.\n\n(Doğrulama: Prof. Dr. Ayfer Aytug, "Mimaride Doku Kullaniminin Psikolojik Etkileri Uzerine Bir Arastirma", YTU Fen Bilimleri Enstitusu.)',
        kaynak: 'Temel Tasar, Bolum 7.6',
        etiketler: ['doku', 'malzeme', 'mekan', 'derinlik', 'psikoloji'],
      },
      {
        id: 'tt-ortme',
        baslik: 'Ortme ve derinlik: pafta kompozisyonunun kurali',
        icerik:
          'Bir yakinlik-uzaklik farkinin duyulmasiyla DERINLIK anlatimi ve uc boyutluluk etkisi dogar.\n\nOrtmedeki anlatim belirliligini artirmak icin renk farki, deger farki ya da kuvvetli cevre cizgileri kullanilarak orten cisim, ortulen cisimden daha belirgin ayirt edilir.\n\nKRITIK KURAL: Ortme olayinda belirliligin saglanmasi icin orten cisim ortuleni TAM OLARAK KAPATMAMALI; ortulen cismin bir kismi orten cismin cevre cizgisinden TASMALIDIR.\n\nOrtulen cisim geometrik bir bicime sahipse arkadaki bicimi dogru algilamak mumkundur. Serbest bicimde belirsizlik olusur; bu belirsizlik ancak orten cismin SAYDAMLIGI ile giderilebilir.\n\nPafta karsiligi: gorseller ust uste bindirilecekse, alttaki gorselin en az bir kenari mutlaka disari tasmali. Yarim kalan, tam kapanmayan bindirmeler paftada belirsizlik uretir.',
        kaynak: 'Temel Tasar, Bolum 5.1',
        etiketler: ['ortme', 'derinlik', 'kompozisyon', 'pafta'],
      },
      {
        id: 'tt-etkili-cevre',
        baslik: 'Etkili cevre: neden cizgi kalinligi hiyerarsisi sart',
        icerik:
          'Bicimler cevre cizgileri ile belirli hale gelir. Zayif, ince ve az belirli cisimler gozde kuvvetli etki yapmaz. Kuvvetli cevre cizgilerine sahip bicimler daha ilgi cekicidir; anlatimlari daha kesin ve kuvvetlidir.\n\nIsik ve golge, uc boyutlu nesnelerin kenarlarini daha belirgin hale getirir. Misirlilar alcak kabartmalarda kenar cizgilerinin etrafini derince oyarak golge dusecek bolge olusturmuslardir.\n\nPafta karsiligi: bir plan paftasinin okunmamasinin en yaygin sebebi, kesite giren ve girmeyen her seyin AYNI KALINLIKTA cizilmesidir. Kesit cizgisi en kalin, gorunus orta, tarama ve olcu cizgisi en ince olmalidir. Bu estetik bir tercih degil, ALGI ZORUNLULUGUDUR.',
        kaynak: 'Temel Tasar, Bolum 5.2.3',
        etiketler: ['cizgi kalinligi', 'hiyerarsi', 'pafta', 'algi'],
      },
      {
        id: 'tt-olcu-derecelenmesi',
        baslik: 'Duzenli olcu derecelenmesi ve koram',
        icerik:
          'Nesnelerin gelisiguzel degil, kucukten buyuge ya da buyukten kucuge dogru duzenli bir konum almasi. Bu, duzenli olcu perspektifidir (Gibson). Nesneler uzaklastikca kucuk gorunur; bu durum DERINLIK HISSI olusturur.\n\nDuzenli olcu derecelenmesinin en ust kademesi KORAM dir (gradasyon).\n\nPafta karsiligi: ayni buyuklukte 6 gorsel yan yana koymak paftayi durgunlastirir. Bir ana gorsel (egemenlik) + kademeli olarak kuculen destek gorseller derinlik ve okuma sirasi uretir.',
        kaynak: 'Temel Tasar, Bolum 5.2.1.4',
        etiketler: ['koram', 'gradasyon', 'derinlik', 'kompozisyon'],
      },
      {
        id: 'tt-surec',
        baslik: 'Tasarim sureci: yedi asama',
        icerik:
          '1. Konunun ve programin verilmesi - konunun iyice programlanmasi, kosullarin belirtilmesi.\n2. Ana fikirlerin yakalanmasi - mekanlar ve kosullari dikkate alinarak gercekci ANA FIKIRLERIN yakalanmasi. Bu bir tasarimlama safhasidir; tasarin secilmesidir.\n3. Tasarimlama asamasi - veriler, olanaklar ve kosullar gozden gecirilir; yogun zihin calismasi.\n4. Bir tasarimin olusmasi - cozumler henuz kesin seklini almamis olsa da bir olcuyu ve yerlesme duzenini goruntuler.\n5. Tasari calismasi - zihinde belirli hale gelen tasarimin KAGIDA GECIRILMESI.\n6. Tasarimin kontrolu - cizilmis tasari, zihindeki tasarimla karsilastirilir. Boylece MAKET YAPMA ve hatta modelin gerceklestirilmesine kadar gidilir.\n7. Gelistirme asamasi - tasar ile tasarim arasinda fark kalmayincaya kadar gorsel algilama calismasi yapilir.\n\nKavram ayrimi: TASARIM zihinde canlanan sekildir. TASARI, bunun kagit uzerinde ifade edilmis ilk halidir. TASAR ise ozgunluk tasiyan, bir amaca hizmet eden fikir urunudur.\n\nMAKET, 6. asamanin araci olarak tanimlanir: zihindeki ile cizileni karsilastirma ve kontrol araci. Sunum nesnesi olmadan once bir DUSUNME ARACIDIR.',
        kaynak: 'Temel Tasar, Bolum 3',
        etiketler: ['surec', 'maket', 'tasarim', 'yontem'],
      },
    ],
  },

  // ============================================================
  {
    id: 'mimari-elestiri',
    baslik: 'Mimari Elestiri ve Yorum',
    aciklama:
      'Bu uygulamadaki analiz motorunun dogrudan omurgasi. Saglikli bir elestirinin sartlari ve incelenmesi gereken 11 baslik.',
    kaynak: 'I. Hulusi Gungor, Temel Tasar (Bolum 14)',
    maddeler: [
      {
        id: 'me-gerekler',
        baslik: 'Saglikli elestirinin dort gereği',
        icerik:
          '1. YETERLI BILGI - Elestirmenin konu hakkinda etrafli bilgisi olmali; o eseri digerleriyle kiyaslayabilecek kadar genis kulture sahip olmali.\n\n2. ELESTIRI DILI - Kavramlarin ve ilkelerin dilini ve mahiyetini bilmeli. Bir kavram farkli anlasiliyorsa, elestirmen tek kisi olsa bile sozu yanlis anlasilabilir.\n\n3. IYI DEGERLENDIRME - Nesne COK YONLU degerlendirilmelidir; degisik yonlerden olumlu ve olumsuz taraflari arastirilmalidir. Herbir bakimdan ortaya cikan ARTI ve EKSI degerler toplanmali ve derecelerine gore siralanmalidir. Bir JURI calismasinda birkac eser kiyaslaniyorsa; eksi degerlerin en az sakincali olani ve arti degerlerin en cok yarar saglayanlari gosterilerek degerlendirme yapilmalidir.\n\n4. TARAFSIZLIK - Eserlerin sahibinden hoslaniyor ya da hoslanmiyor olman, o tur eserlerin hosuna gidip gitmemesi elestiriyi degistirmemeli. "Bir davanin haksiz tarafin kazanmasi suretiyle sonuclanmasi herkesi ne derece uzerse, elbette tutarsiz ve haksiz bir elestiri de o derecede tepkiye ve hosnutsuzluga neden olur."\n\nMies van der Rohe: "Elestirmenin rolu bir sanat yapitini kendisine has ifadelerle aciklamaktir."',
        kaynak: 'Temel Tasar, Bolum 14.1',
        etiketler: ['elestiri', 'juri', 'yontem', 'tarafsizlik'],
      },
      {
        id: 'me-inceleme',
        baslik: 'Mimari elestiride inceleme konulari (11 baslik)',
        icerik:
          'Mimari elestiri proje ya da yapilar uzerinde yapilir; her ikisinde de incelenecek hususlar aynidir. Oncelik sirasi anlamina gelmemek kosulu ile su hususlar AYRI AYRI incelenir ve HERBIRI ICIN NOT ALINIR:\n\n1. Eserin ARSAYA, IMAR DURUMUNA, IMAR YONETMELIGINE ve ARAZI KOTLARINA gore durumu\n2. GUNES ve RUZGAR yonune gore konumu\n3. CEVRE ile ILISKISI\n4. YAPI PROGRAMINA gore gerekli MEKANLARIN ve bunlar arasindaki BAGLANTILARIN ve GECISLERIN saglanip saglanmadigi\n5. ANA MEKANIN OZGUNLUGU, mesaji ve kitleye yansimasi\n6. Yapinin STRUKTURU\n7. Secilen MALZEMELER, yapim tarzi, yapim teknolojisi\n8. Yapinin ESTETIK yonden ele alinisi, kullanilan OGE ve ILKELER, duzenleme esaslari, DENGE ve KARAKTER BIRLIGI\n9. MEKANLAR, KITLELER, YAPI KISIMLARI arasindaki ORANLAR\n10. Yapinin OZGUNLUGU, diger yapi ya da mimarlarin ETKISINDE olup olmadigi\n11. EKONOMI, ISLETME ve BAKIM acisindan yapinin durumu',
        kaynak: 'Temel Tasar, Bolum 14.1.5',
        etiketler: ['elestiri', 'kontrol listesi', 'juri', 'kritik'],
      },
      {
        id: 'me-ornek',
        baslik: 'Uygulamali elestiri ornekleri',
        icerik:
          'Ornek A - Karakter birligi bozulmus yapi grubu:\n"Cepheleri cok farklidir. Soldan birincisi sagir ve nokta pencereli, ikincisi dortlu gruptan olusan kare pencereli, ucuncusu cam giydirmelidir. Binalarda yonler, malzemeler, oranlar birbirine yabancidir. Bloklarin bazilarinin uzeri duz, birisi dogrusal egimli, digeri ikisi egimsiz. Bir bakista bu yapilar bir butun gibi degil, ayri ayri mimarlarin elinden cikmis gibi durmaktadir."\n\nOrnek B - Kismi tutarlilik, kismi kopus:\n"Bu yapida pencere kullaniminda her iki cephe karakter birligi halindedir. Ancak 5. kattan sonraki renk yahut malzeme degisimi, cepheye golge dusurmek uzere konan celik profillerin bir tarafta dik acili birlesimine karsin diger tarafta kavisli hal, butunlugu bozmaktadir."\n\nOrnek C - Asiri uygunluk / az zitlik:\n"Evet, hic akla gelmeyen bu tur cephe ilginctir. FAKAT DOGRU MUDUR? Isletme, kullanim, bakim yonunden yarar ve avantaj var midir?" ... "Duzenleme bakimindan dengeli, karakter birligi icinde, uygunluklarin asiri derecede cok, zitliklarin az oldugu bir duzenleme turu kullanilmistir. Cizgi ogesi o kadar fazla ki, monotonlugu kirmak icin kullanilan yon zitliklarina ve cizgilerdeki olcu farklarina (kalin, ince) ragmen SIKICILIK ve YORGUNLUK vermektedir."\n\nElestiri dilinin modeli budur: once ne gorulduğunu tarif et, sonra hangi ilkenin bozuldugunu adlandır, sonra sonucu soyle.',
        kaynak: 'Temel Tasar, Bolum 14.2',
        etiketler: ['elestiri', 'ornek', 'karakter birligi', 'cephe'],
      },
    ],
  },

  // ============================================================
  {
    id: 'teknik-cizim',
    baslik: 'Teknik Cizim ve Pafta Standartlari',
    aciklama:
      'Paftanin okunabilirligi bir uslup meselesi degil, standart meselesidir. Bu bolumdeki kurallar DIN ve TS standartlarina dayanir.',
    kaynak: 'Neufert (s.6-8) + TS 5319 / MIM 244 ders notlari',
    maddeler: [
      {
        id: 'tc-pafta-duzeni',
        baslik: 'Pafta duzeni ve antet',
        icerik:
          'DOSYALAMA icin paftalarin SOL KENARINDA 5 CM lik bir serit BOS birakilmalidir.\nEN SAGDA ANTET yer alir.\n\nAntet sunlari kapsamalidir:\n1. Cizimin niteligi (eskiz, avan, uygulama v.s.)\n2. Yapinin cizilen kisminin tarifi (vaziyet plani, plan, kesit, gorunus v.s.)\n3. Olcegi\n4. Gerektiginde ebatlari\n\nRuhsat projesinde ayrica: mal sahibinin ismi/imzasi, mimarin ismi/imzasi, gerektiginde proje mudurunun imzasi, ana muteahhidin imzasi, kontrollik teskilati bilgisi.\n\nVAZIYET PLANLARINDA VE PLANLARDA KUZEY ISARETININ BULUNMASI ZORUNLUDUR.\n\nOgrenci paftasi antedi: universite / fakulte / bolum, ders kodu ve adi, proje adi, pafta adi, ogrenci ad-soyad ve numara, danisman, tarih, olcek, pafta no.\n\nTipik pafta sirasi: temel - bodrum kat - zemin kat - ust kat - kiris duzeni - asik duzeni - kesit - guney/dogu/kuzey/bati gorunusu - vaziyet plani - bahce plani.',
        kaynak: 'Neufert s.6 (DIN 6, 15, 16, 36, 406, 823, 1352, 1356)',
        etiketler: ['pafta', 'antet', 'DIN', 'duzen'],
      },
      {
        id: 'tc-olcek',
        baslik: 'Olcekler (DIN 825)',
        icerik:
          'Mimari cizimler icin: 1:1, 1:2,5, 1:5, 1:10, 1:20, 1:25, 1:50, 1:100, 1:200, 1:250\nVaziyet planlari icin: 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000, 1:25000\n\nKurallar:\n- Antet uzerinde cizimin ANA OLCEGI BUYUK, geri kalan olcekler kucuk yazilir; alanlara ait olduklari cizimin yaninda tekrar edilir.\n- Tum nesneler olcege uygun cizilmeli.\n- OLCEKSIZ cizilen kisimlarda olculerin ALTI CIZILMELIDIR.\n\nOlcek-icerik iliskisi (uygulama projesi): 1/50, 1/20, 1/10, 1/5, 1/1.\n- 1/50: plan, kesit, gorunus (temel uygulama olcegi)\n- 1/20 - 1/10: sistem detaylari (kismi plan, kesit, gorunus)\n- 1/5, 1/2, 1/1: nokta detaylari ve imalat detaylari\n\nOnemli: Olcek buyudukce gosterilecek bilgi ARTAR, azaldikca SADELESIR. Cizim olcegi degistikce tarama ve gosterim de sadelesir. 1/200 e 1/50 detayini tasimak paftayi okunmaz yapar.',
        kaynak: 'Neufert s.6 (DIN 825) + MIM 244 ders notlari',
        etiketler: ['olcek', 'DIN 825', 'detay', 'pafta'],
      },
      {
        id: 'tc-olculendirme',
        baslik: 'Olculendirme kurallari',
        icerik:
          '- Tum olculer KABA OLCULERDIR (duvar kalinliklari).\n- Mimari cizimde 1 m nin ALTINDAKI olculer CM, 1 m nin UZERINDEKILER M olarak belirtilir.\n- MERDIVEN olculeri CIKIS AKSI boyunca; RIHT YUKSEKLIGI USTTE, BASAMAK GENISLIGI ALTTA yazilir.\n- PENCERE ve KAPI olculeri ORTA AKS uzerine; GENISLIK USTTE, YUKSEKLIK ALTTA yazilir. (Orn. K7 90/220)\n- Doseme kotlari ZEMIN KAT DOSEMESI USTU +-0,00 kabul edilerek belirlenir; kaba ve bitmis kot AYRI AYRI gosterilir.\n- ODA NUMARALARI daire icine, ALANLAR kare/dikdortgen icine m2 olarak yazilir.\n- KESIT CIZGILERI kesik cizgi ile ifade edilir ve BAKIS YONUNE DOGRU ALFABETIK SIRA ile BUYUK HARFLERLE isimlendirilir.\n- Olculer cizimi CEVIRMEDEN OKUNABILECEK sekilde yazilir. Cizimin sag tarafi icin olcu cizgisi dogrultusunda SAGDAN, sol tarafi icin SOLDAN yazilir.\n- Olcu baglama cizgileri ve olcu cizgileri kesistikleri sinir noktasinin 1-2 mm otesine tasirilir. Olcu cizgisi, olculendirdigi elemanin kose noktasina 1-2 mm yaklasmalidir.\n\nPLAN DIS OLCULENDIRME SIRASI (distan ice):\n1. cizgi: blok olcusu\n2. cizgi: cephe hareketleri\n3. cizgi: tasiyici akslar\n4. cizgi: doluluk ve bosluklar\n\nIC OLCULENDIRME: her hacimde enine ve boyuna IKISER olcu cizgisi. Birinci cizgide hacmin net en ve boyu; ikinci cizgide kapi, pencere, kolon genislikleri ve komsu duvarlara uzakliklari.\n\nKESITTE IC OLCULENDIRME: bir cizgide doseme ustunden doseme ustune KABA INSAAT KAT YUKSEKLIKLERI; ikinci cizgide doseme kaplama kalinligi, parapet, pencere, kapi ve bolme duvar yukseklikleri, lento-tavan mesafesi, tasiyici sistem kalinliklari, dusuk doseme yukseklikleri.',
        kaynak: 'Neufert s.6 + MIM 244 Yapi Elemanlari Tasarimi ders notlari',
        etiketler: ['olculendirme', 'kot', 'plan', 'kesit'],
      },
      {
        id: 'tc-semboller',
        baslik: 'Cizim sembolleri ve gosterim kurallari (DIN 107)',
        icerik:
          '- Pencerelerde SOL TARAF HEP NISLI, SAG TARAF NISSIZ gosterilir.\n- TEK KOLLU merdivenler AHSAP uygulamaya, CIFT KOLLU merdivenler BETON uygulamaya musaittir.\n- Her kat planinda MERDIVEN KOVASINDAN GECEN YATAY KESIT, dosemeden yaklasik 1/3 KAT YUKSEKLIGINDEDIR.\n- Basamaklar +-0,000 dan yukariya ve asagiya dogru SUREKLI numaralandirilir. +-0,00 altindakiler onlerine EKSI isareti alir.\n- CIKIS AKSI ilk basamakta bir DAIRE ile baslar, en son basamakta bir OK ile sona erer (bodrumda bile).\n- Merdiven kesiti sembolik olarak zikzakli yamuk bir dogru cizgi ile gosterilir; anlamin yanlis yorumlanmayacagi yerlerde zikzaklar atilabilir.\n- Merdiven baslangic katina uygun sekilde 2/3 hattindan kesilir; ust katin basamaklari KESIK CIZGI ile cizilir.\n- RAMPADA yon oku rampanin MERKEZ HATTINDA yer almali, surekli ince cizgi ile cizilmeli; alttan yukselis noktasinda bir DAIRE, ust yukselme noktasinda ACIK BIR OK olmalidir.\n- Kesitlerde ve gorunuslerde DOGAL ZEMIN NOKTA NOKTA, ONERILEN ZEMIN DEVAMLI CIZGI ile gosterilir; her ikisine ait kotlandirma eksiksiz yapilir.\n- Bütün kotlar SABIT ROPER KOTU ile baglantilandirilir.\n\nELEMAN POZ NUMARALARI:\nMerdivenler M1, M2... | Kapilar K1, K2... | Camli kapilar CK1... | Camekanlar CMK1... | Pencereler P1, P2... | Giris kapilari GK1... | Gomme dolaplar GD1...\nMAHAL NUMARALARI (elips icinde): Bodrum B-01... | Zemin Z-01... | Birinci kat 101, 102... | n inci kat n01, n02...\nTASIYICI SISTEM (dort karakter, ilk harf eleman + kat + eleman no): Kolon S201 | Doseme T201 | Duvar D201 | Kiris K201',
        kaynak: 'Neufert s.7-8 (DIN 107) + MIM 244 ders notlari',
        etiketler: ['sembol', 'DIN 107', 'merdiven', 'poz numarasi', 'mahal'],
      },
      {
        id: 'tc-cizgi',
        baslik: 'Cizgi hiyerarsisi ve tarama',
        icerik:
          'Cizgi cesitleri kalinliklarina, koyuluk tonlarina, renklerine ve bicimlerine gore ayrilir (TS / DIN).\n\nPLANDA KALINLIK HIYERARSISI (kalindan inceye):\n1. KESITE GIREN elemanlar (duvar, kolon, doseme) - en kalin. Kat planlarinin kesit gecirilen yerlerinde IC ALANLAR KOYULASTIRILIR.\n2. GORUNUSE giren, kesite girmeyen elemanlar - orta.\n3. Kapi ve pencere - duvara gore DAHA INCE cizgi.\n4. Tefris, tarama, olcu cizgisi, aks cizgisi - en ince.\n5. Ust kattan gelen / kesik cizgi - ince kesikli.\n\nTARAMA: TS 5319 "Teknik resim - Taramalar - Kesit yuzeyinin ve malzemenin gosterilisi" esas alinir. Cizim olcegi degistikce tarama sadelesir; 1/200 de tarama tamamen kaldirilabilir.\n\nEn sik hata: her seyi ayni kalinlikta cizmek. Bu, Temel Tasar terimiyle ETKILI CEVRE ilkesinin ihlalidir; pafta okunmaz hale gelir.',
        kaynak: 'TS 5319, MIM 244 ders notlari, Ic Mimarlikta Teknik Resim (T. Canbulat)',
        etiketler: ['cizgi kalinligi', 'tarama', 'TS 5319', 'hiyerarsi'],
      },
      {
        id: 'tc-1-50',
        baslik: '1/50 plan, kesit ve gorunuste ne bulunmali',
        icerik:
          '1/50 PLANDA:\n- Tasiyici aks sistemi, statik projeye uygun harf ve sayilarla (X ekseninde harfler, Y ekseninde sayilar).\n- Planlar her paftada AYNI BAKIS YONUNDE yerlestirilir; secilen koordinat sistemi mimari, statik ve tesisat projelerinde aynen ve ayni yonde kullanilir.\n- Kesit cizgisinin TUMU ve BAKIS YONU gosterilir.\n- Tasiyici elemanlar (kolon vb.) ayri cizim teknigi ve gercek boyutlariyla, icleri koyulastirilmis.\n- Sabit tezgahlar, lavabo, eviye, dus teknesi; kombi/soba yeri ve bacalari.\n- Dusey donatim borulari ve kanallar, gercek yer ve olculerinde.\n- Doseme desenleri, egimler, suzgec yerleri, kaplama derz yerleri.\n- Dogramalar detayina uygun ve sematik; acilan kanatlar belirtilir; aks cizgileri uzerinde en ve yukseklik (K7 90/220 gibi).\n- Esas giris onu tretuvar kotu +-0.00 kabul edilerek tum kot farklari, KABA ve BITMIS kot AYRI AYRI.\n- Merdivende: numara, basamak adedi, genislik ve riht yuksekligi. Cikis hattinin basamaklari kestigi noktalar cikis yonunde numaralanir, son basamakta ok ucu ile biter.\n- Zemin kat planinda cevre tanzimi (tretuvar, baglanti yollari, giris platolari, ciceklikler), kaba ve bitmis kotlariyla.\n- Cati plani: meyiller, su toplama yerleri, dereler, tesisat ve asansor cikintilari, bacalar, cati cikis delikleri, kotlar.\n\n1/50 KESITTE:\n- Biri MERDIVENDEN, digeri KONSTRUKTIF OZELLIGI olan yerlerden EN AZ IKI KESIT.\n- Kesitin gectigi mahallerin kodlari ve isimleri.\n- Asma tavan yapilan mahallerde asma tavan alt yuzu ile bitmis doseme arasindaki NET KAT YUKSEKLIGI ayri bir olcu cizgisiyle.\n- Pencere alti dolu kisimlarin yapim sekli; kiris bitisi, duvar dolgusu ayri ayri kotlandirilmis; radyator yuksekligi.\n- Cephedeki gunes kiricilar, malzeme acilimlari, cati konstruksiyonu gercek sekil ve olculeriyle.\n- Drenaj sistemi ve yalitim aciklamalari.\n\n1/50 GORUNUSTE:\n- BUTUN gorunusler cizilir.\n- Zemin altinda kalan yapi kisimlari, cepheye arkadan baglanan bolumler.\n- Cephe kaplama malzemesi, yagmur inisleri ve oluklar, kapi ve pencere gorunusleri.\n- Sacaklar, balkonlar, doseme, denizlik alti, lento alti, kalkan duvarlari, oluk, mahya, baca ve cikintilara KOT verilir.',
        kaynak: 'MIM 244 Yapi Elemanlari Tasarimi - Dr. Ecem Edis grubu ders notlari',
        etiketler: ['1/50', 'plan', 'kesit', 'gorunus', 'uygulama projesi'],
      },
      {
        id: 'tc-plan-cizim-sirasi',
        baslik: 'Plan cizim sirasi (uygulamali)',
        icerik:
          'Trakya Universitesi Mimarlik Fakultesi hafif celik yapi uygulamasindan adim adim cizim sirasi:\n\n1. AKSLARIN CIZILMESI - bodrum katta cizilen akslar diger tum paftalarda AYNI YERE gelmelidir.\n2. DUVARLAR - iceride 2 cm, disarida 3 cm duvar kaplamalari hesaba katilir.\n3. PENCERELER - ic siva ve dis siva ile pencere kasasi birlesimine dikkat. Pencerenin merkezinden gececek ve ACILIS YONUNUN TERSI istikametinde poz numarasi ve olcusu verilir. Kapi/pencere duvara gore DAHA INCE cizgi.\n4. KAPI-PENCERE DESTEKLERI - duvar birlesim noktalarinda min 3 celik C profil bir arada; ortalama 60 cm araliklarla dikmeler. Kapi/pencere yerlerine gore mesafe kisalabilir ama daha uzak OLMAMALIDIR.\n5-6. IC DUVARLAR VE KAPILAR - dikme yerlerini belirlemeden once kapi dogramalari cizilir. Kapi kasasinin her iki tarafina montaj dikmesi cizilmeli; kasalar her iki tarafta 2 cm tasacak kalinlikta.\n7. VERANDA / TERAS - kesite GIRMEYEN, gorunuse giren duzlemler DAHA INCE CIZGI ile. Basamaklara ait rihtlar numaralandirilir.\n8. MERDIVEN - iki kollu merdivende SAHANLIK GENISLIGI minimum BASAMAK UZUNLUGU kadar. Cikis hatti cizilmeli, n x r / b degerleri ve basamak sayilari yazilmali. Baslangic katina uygun sekilde 2/3 hattindan kesilir; ust katin basamaklari kesik cizgi.\n9. KURANGLEZ - bodrum perde duvarlariyla birlikte. Kuranglez derinligi MAKSIMUM 2 METRE; kuranglez duvari 0.00 kotundan 10-15 cm yukari cikabilir.\n10. KESITLER - A-A icin belirtilen tum adimlar ayni sirayla B-B kesit cizgisi uzerinden tekrarlanir.',
        kaynak: 'MIM 153 Yapi Bilgisi ders notlari (Trakya Univ. Mimarlik Fakultesi)',
        etiketler: ['cizim sirasi', 'plan', 'aks', 'merdiven', 'kuranglez'],
      },
    ],
  },

  // ============================================================
  {
    id: 'yapi-bilgisi',
    baslik: 'Yapi Bilgisi: Strüktür ve Elemanlar',
    aciklama:
      'Mimari elestiri kontrol listesinin 6. maddesi "yapinin strukturu". Bir projeyi savunabilmek icin tasiyici sistemini bilmek zorunludur.',
    kaynak: 'MIM 153 Yapi Bilgisi ders notlari (9-12. hafta)',
    maddeler: [
      {
        id: 'yb-iskelet',
        baslik: 'Iskelet (karkas) yapilar',
        icerik:
          'Yatay ve dusey tasiyicilardan olusan elemanlar butunudur. DUVARLAR TASIYICI DEGILDIR.\n\nHesap ve yapim ekonomisi icin uygun aks mesafeleri (izgara) ile calisilir; dusey tasiyicilar aks sistemine gore yerlestirilir.\n\nTarihsel mantik: Tasin cekme dayanimi dusuktur, bu yuzden aciklikler sinirlidir - kemer sistemleri gelisir. 1700 lerde cimento, 1800 lerde patent. Cimento + kum + cakil + su = BETON. Beton cekme ve darbeye dayaniksizdir, bu yuzden celik cubukla donatilir = BETONARME. Cekmenin tamami celik cubuklarca karsilanir. Celik ile betonun birlikte calismasi KENETLENME (ADERANS) ile saglanir.\n\nTasiyici elemanlar: dosemeler, kirisler, kolonlar/perdeler, temeller.',
        kaynak: 'MIM 153, 9-10. hafta',
        etiketler: ['iskelet', 'karkas', 'betonarme', 'struktur'],
      },
      {
        id: 'yb-kolon-kiris',
        baslik: 'Kolon ve kiris olculeri',
        icerik:
          'KOLONLAR:\n- TS 500: kolonun EN KUCUK KESIT BOYUTU >= 25 cm.\n- L ve T kesitli kolonlarda en kucuk kalinlik 20 cm olabilir.\n- Ornek dikdortgen kolon: 25x50; boyuna donati O14, etriye O8, pas payi 3 cm.\n- Dairesel kolonlarda etriye yerine FRET kullanilir (burkulmaya karsi).\n- Etriyenin gorevi: donatiyi birbirine baglamak + kesme kuvvetlerini almak.\n- PERDE KOLON: fazla yuk veya kolon aralari yakinsa. Kalinlik d >= 15 cm, uzunluk >= 7d.\n\nKIRISLER:\n- Donati yerlesimi: MONTAJ DEMIRI (ust), PILYE (egik), ESAS DEMIR (alt / cekme bolgesi).\n- Kiris yuk altinda deforme olur: ust lifler basinc, alt lifler cekme. Tarafsiz eksen ortada. Cekme bolgesine (alt) esas demir konur.\n- Esas demirler arasi mesafe >= celik capi veya >= 2 cm. Yeterli genislik yoksa iki sira.\n- En az 3 adet O12 cekme donatisi; montaj demiri en az 2 adet O12.\n- Etriye O8, en fazla 20 cm aralik.\n- Tasiyici kiris (19 cm duvar altinda): yukseklik >= 30 cm, genislik >= 25 cm.\n- Subasman kirisi: 15-20 cm (grobeton ve blokajin korunmasi icin).\n- Bag kirisi: 25/25 veya 30/25. Temel pabuclarini yatay kuvvetlere karsi baglar.\n\nDOSEMELER: kirissiz (mantar) doseme, kirisli plak doseme (tek/cift dogrultuda calisan), asmolen doseme, kaset doseme.',
        kaynak: 'MIM 153, 9-10. hafta; TS 500',
        etiketler: ['kolon', 'kiris', 'donati', 'TS 500', 'betonarme'],
      },
      {
        id: 'yb-temel',
        baslik: 'Temeller',
        icerik:
          'Temel tipi, zemin emniyet gerilmesi iliskisine gore secilir.\n\nYUZEYSEL TEMELLER:\n1. Tekil (munferit) temeller\n2. Surekli (mutemadi) temeller\n3. Radye jeneral: plak / ters kemer / rijit radye / mantar\n\nDERIN TEMELLER:\n1. Ayak temeller\n2. Kazik temeller (celik / ahsap / betonarme)\n3. Kuyu temeller\n\nTEKIL TEMEL: her dusey tasiyicinin altina somel; kolon ayagin ustune oturur. Perdeler uzunluklari boyunca surekli temel ayagina oturur. Butun kolon ve perdeler BAG KIRISI ile birbirine baglanir; bag kirisleri DEPREM sirasinda ortaya cikan YANAL KUVVETLERI alarak dusey elemanlardaki hasari onler. Saglam zeminde veya kolon sayisinin seyrek / aralarinin genis oldugu iskelet sistemlerde kullanilir.\n\nSUREKLI TEMEL: bir dogrultuda surekli; tasiyici duvarlar veya kolon dizileri altinda.\n\nRADYE TEMEL: kolonlar her iki yonde surekli kirislerle baglanir, kiris aralari radye dosemesi ile kapatilir. Doseme kalinligi >= 30 cm. DEPREM BOLGELERINDE UYGUNDUR. Gunumuzde tek kalin plak tercih ediliyor; kirisli plakta kalip ve demir iscilik artar. Donati miktari acisindan iki sistem arasinda fark yoktur. SU IZOLASYONU acisindan tekil ve surekli temele gore avantajlidir.',
        kaynak: 'MIM 153, 9-10. hafta',
        etiketler: ['temel', 'radye', 'deprem', 'bag kirisi'],
      },
      {
        id: 'yb-celik',
        baslik: 'Celik iskelet sistemler',
        icerik:
          '19. yy sonu: artan nufus, cok katlilasma, hafif yapi ihtiyaci ve endustri devrimi CELIK ISKELET SISTEMLERI dogurdu. 20. yy basinda kolay islenebilme ve sekil verilebilme BETONARME yi one cikardi.\n\nDonum noktalari: Brooklyn Koprusu (1870-1883); 1889 Fransiz Ihtilali 100. yil - Eiffel Kulesi ve Galeries des Machines.\n\nOZELLIKLER: Dovulerek, preslenerek veya haddeden gecirilerek sekillendirilir. Teknik yonden IZOTROP ve HOMOJENDIR. Fabrikada profil olarak uretilir, santiyede kesilip birlestirilir; on yapima uygundur. Detay ve birlesimler karmasiktir, ozen ister.\nSt 37 = 37 kgf/mm2 (~370 N/mm2) cekme dayanimi (DIN). TS de St yerine Fe veya C sembolu kullanilir.\n\nDEZAVANTAJLAR: Ulkemizde maliyetli; kucuk ve alcak yapida yaygin degil; YANGINA karsi tasiyicilarin korunmasi gerekir; PASLANMAYA karsi ince kesitlerde tedbir ve periyodik bakim gerekir; ince kesitlerde BURKULMA riski - cok parcali cubuk ve sandvic plak ile cozulur.\n\nPROFIL TURLERI: L (kosebent) - kafes kiris ve cok parcali eleman; U - kafes kiris, cok parcali kolon/kiris, cati asikleri; I profil; T profil - cam cercevesi ve cati elemanlari; Z profil; boru ve kutu profiller - duzlem ve uzay kafes kirisler.\n\nYANAL YUKLER: Ruzgar ve deprem icin perde duvar, capraz baglama veya moment dayanimli (rijit) cerceve gerekir. Dolgu: prekast beton, kesme tas, tugla veya gazbeton.\n\nUZAY KAFES: Celik cubuklar (boru) + dugum noktalari (kure). Hafif, hizli, endustrilesmis; ortuye istenen formu verir. Birim eleman 6 cubuk + 4 dugum noktasindan olusan dortyuzludur. Ornek: Sabiha Gokcen Havalimani, Tekeli-Sisa Mimarlik, 2001, Istanbul (tonozsal / tek egrilikli uzay kafes).',
        kaynak: 'MIM 153, 11-12. hafta',
        etiketler: ['celik', 'profil', 'uzay kafes', 'yangin', 'St 37'],
      },
      {
        id: 'yb-drenaj-dilatasyon',
        baslik: 'Drenaj, dilatasyon ve bacalar',
        icerik:
          'DRENAJ: Yapilari yuzeysel ve yeralti sularinin zararlarindan korumak icin sularin toplanmasi, denetim altina alinmasi ve uzaklastirilmasi. Iki temel sistem: YERALTI ve YUZEY drenaji.\nYuzey drenaji: yagmur ve yuzey sularini dogal drenaj duzenine veya belediyenin yagmur suyu kanalina yonlendirmek icin arazinin derecelendirilmesi ve duzlestirilmesi. Akis kanal kapasitesini asiyorsa suyu tutacak havuz gerekir.\n- Nem ve su yalitim membrani, temelin ust kismindan baslayip zemin seviyesinden 150 MM yuksekligine kadar devam etmeli.\n- Beton kagir duvarlar 2 mm bitumlu kaplamayla ortulmus, en az 10 mm kalinliginda portland cimentolu harcla bohcalanmali.\n- Drenaj borusu alti min 50 mm.\n\nDILATASYON DERZI su durumlarda ongorulmelidir:\n- Farkli yuklenmeler nedeniyle farkli cokmelerin beklendigi yapilarda\n- Mimarisi geregi COK UZUN yapilarda\n- Yapilarin yatay ve dusey surekliliginin bozuldugu yerlerde\n- Az ve cok katli yapi bloklarinin kesisme duzlemlerinde\nDerz yapinin TUMUNDE ve TEMELLERDE ongorulmelidir.\n\nBACALAR:\n- Mumkun oldugunca bir arada gruplandirilmali, cati uzerine EN AZ SAYIDA cikarilmali.\n- Ruzgar nedeniyle geri tepme olmamasi icin en yuksek cati mahyasi seviyesinden ya da komsu bina ust kotundan EN AZ 50 CM daha yukariya cikarilmali.\n- Yagmur, kar ve kus etkilerini onlemek icin uzerine baslik yapilmali.\n- Tesisat bacalari: ortak mahallere acilabilen ve mudahale edilebilen bacalardir. Cok buyuk binalarda icinde yurunebilen kat yapilir. TS 2167 "Tesisat baca ve kanallarinin projelendirilmesi ve duzenlenmesi kurallari" gecerlidir.',
        kaynak: 'MIM 153 Yapi Bilgisi ders notlari; TS 2167',
        etiketler: ['drenaj', 'dilatasyon', 'baca', 'yalitim', 'TS 2167'],
      },
    ],
  },
]
