import type { BilgiBolumu } from '../types'

export const BILGI_BOLUMLERI: BilgiBolumu[] = [
  // ============================================================
  {
    id: 'temel-tasar-ilkeler',
    baslik: 'Temel Tasar: Öğeler ve İlkeler',
    aciklama:
      'Her mimari eleştirinin dili bu kavramlarla kurulur. Bir paftaya "güzel" ya da "kötü" demek yerine hangi ilkenin çalıştığını ya da bozulduğunu söyleyebilmek gerekir.',
    kaynak: 'İ. Hulûsi Güngör, Temel Tasar (Bölüm 7-8)',
    maddeler: [
      {
        id: 'tt-ogeler',
        baslik: 'Tasar öğeleri',
        icerik:
          'Nokta, çizgi, yüzey, hacim, ÖLÇÜ, DOKU, renk, değer, ARALIK, YÖN, hareket, ışık-gölge.\n\nBir tasarım bu öğelerin tasar ilkeleri gereğince bir araya gelmesiyle oluşur. Yüzeysel bir araya gelişler ZEMİN ANLATIMI, hacimsel olanlar ŞEKİL ANLATIMI üretir.\n\nPafta karşılığı: bir paftada da aynı öğeler iş başındadır. Çizgi kalınlığı bir "değer" kararı, tarama bir "doku" kararı, boşluğun büyüklüğü bir "aralık" kararıdır.',
        kaynak: 'Temel Tasar, Bölüm 7',
        etiketler: ['öge', 'temel tasar', 'pafta'],
      },
      {
        id: 'tt-eksen',
        baslik: 'Tekrar - Uygunluk - Zıtlık ekseni',
        icerik:
          'TEKRAR: her şey birbirinin aynıdır.\nUYGUNLUK: tam aynı değil, ama benzer taraflar vardır.\nZITLIK: hiçbir benzer taraf yoktur.\n\n"Uygunluk, tekrar ile zıtlık arasındaki yolun yarısıdır."\n\nUygunluk mutlak benzerlikle değil, RAHAT HİSSEDİLEBİLİR BİR YAKINLIKLA sağlanır. Uygunluk türleri: yön, biçim, ölçü, aralık, doku ve değer uygunluğu.\n\nUygunluk dört grupta toplanır: fiziksel uygunluk, hizmet uygunluğu, biçim uygunluğu, üslup uygunluğu.\n\nTeşhis kuralı: Bir düzenleme sıkıcı geliyorsa uygunluk fazla / zıtlık azdır. Dağınık geliyorsa zıtlık fazla / uygunluk azdır.',
        kaynak: 'Temel Tasar, Bölüm 8.3',
        etiketler: ['uygunluk', 'zıtlık', 'tekrar', 'eleştiri'],
      },
      {
        id: 'tt-tekrar',
        baslik: 'Tekrar ve türleri',
        icerik:
          'Bir öğenin aynen ya da çok yakın özellikte birden fazla kullanılması. Aralarındaki benzerlik BİRLEŞTİRİCİ BİR BAĞ görevi yapar; tasar oluşturmada çabuklaştırıcı rol oynar.\n\nTAM TEKRAR: ölçü, biçim, renk, değer ve doku tam aynı, EŞİT ARALIK ve AYNI YÖNDE.\nDEĞİŞKEN TEKRAR: temel öge korunur, bir özellik kademeli değişir.\nARDIŞIK TEKRAR: biçimlerin belirli bir düzen içinde (yatay, düşey, çapraz) BİR ATLAYARAK ard arda tekrarlanması. Renk ve değer eklenerek petek, kabartma ve dekoratif yüzeyler üretilir.\n\nProf. Friedrick Hess’in dersteki gösterimi: tahtaya tek bir kuş çizip "bu o kadar etkili değil" der, yanına birkaç kuş daha çizip "görüyorsunuz, tekrar etki yaratıyor" der.',
        kaynak: 'Temel Tasar, Bölüm 8.1',
        etiketler: ['tekrar', 'ritim', 'cephe'],
      },
      {
        id: 'tt-denge',
        baslik: 'Denge: bakışık ve bakışımsız',
        icerik:
          'BAKIŞIK (simetrik) denge tekdüzenlik (monotonluk) meydana getirir. Her iki cephesi de bakışık olan bir binada bakışım tekdüzenliği kaçınılmaz kılar.\n\nBAKIŞIMSIZ DENGE, eşit olmayan öğelerin görsel ağırlıklarının dengelenmesidir; canlılık üretir.\n\nÖrnek 1 - Roma’da bir apartman (V. Monaco, A. Luccichenti, J. Lafuente): çift dairenin bakışık tertiplenmesinin getireceği tekdüzenliği gidermek için ön cephedeki balkonlarda değişiklik yapılmış, balkonlar BİR KAT ATLAYARAK tekrarlanarak bakışımsız ve çekici bir görünüş elde edilmiştir.\n\nÖrnek 2 - Berlin Corbusierhaus (Le Corbusier): birbirinin benzeri çok sayıda dairenin bir arada bulunduğu binada, tekdüzenlikten kaçınmak için cephede değişikliğe gidilmiş ve bakışımsız denge uygulanmıştır.',
        kaynak: 'Temel Tasar, Bölüm 8',
        etiketler: ['denge', 'simetri', 'cephe', 'monotonluk'],
      },
      {
        id: 'tt-yon-zitligi',
        baslik: 'Yön zıtlığı: Anıtkabir örneği',
        icerik:
          'Ord. Prof. Emin Onat ile Prof. Orhan Arda’nın ortak eseri ANITKABİR planlamasında YÖN ZITLIĞI kullanılmıştır.\n\nAnıt ekseni ile Aslanlı Yol’un ekseni birbirine diktir. Bu yüzden birinden diğerine geçerken takip edilen yönler de birbirine diktir. Anıtı YANDAN görerek yaklaşan kişi, meydana girdiği noktada birden anıta doğru döner; onu tam karşıdan, başka bir görüş açısıyla ve daha büyük boyutta algılar. Bu ani dönüş, ziyaretçinin daha fazla ilgi duyarak ve etkilenerek anıta yaklaşmasını sağlar.\n\nDers: dolaşım, sadece ulaşım değil ALGI KURGUSUDUR. Vaziyet planında yaklaşma yönünü bir tasarım kararı olarak ele al.',
        kaynak: 'Temel Tasar, Bölüm 8',
        etiketler: ['yön zıtlığı', 'dolaşım', 'algı', 'Anıtkabir', 'vaziyet'],
      },
      {
        id: 'tt-doku',
        baslik: 'Doku ve mekân ilişkisi',
        icerik:
          'Üç grup: SERT (kaba), ORTA SERT, YUMUŞAK dokular.\n\nTEMEL KURAL: Sert dokulu, sıcak renkli, parlak yüzeyli cisimler bulundukları yerden DAHA YAKINDA; yumuşak dokulu, soğuk renkli, mat yüzeyli cisimler DAHA UZAKTA etki yapar.\n\nRuhsal etkiler:\n- Yumuşak doku: SÜKÛNET ve RAHATLIK.\n- Sert doku: DİNAMİK duygular; insanı uyanık tutar, azim ve iradeyi destekler, heyecan verir.\n- Anıtta sert doku; mabette, istirahat köşesinde, okuma salonunda yumuşak doku uygun düşer.\n\nMekân-doku eşleşmesi:\n- Oturma, uyuma, dinlenme (evler, oteller, hastaneler): YUMUŞAK doku. Bazı köşelere canlılık için orta sert / sert doku.\n- Çalışma ve spor mekânları: orta sert ve yer yer sert doku.\n- Mutfak hareketli bir yer olduğu için orta sertlikte dokuları kaldırır.\n\nDERİNLİK ETKİSİ: Tavanı sert dokulu bir mekân ALÇAK, yan duvarları sert dokulu bir oda DAR, karşı duvarı sert dokulu bir yer daha AZ DERİN görülür.\n\nIsıl etki: Döşeme ve mobilya malzemesi seçilirken ISINMA ISISI KATSAYISI DÜŞÜK (ılımlı) gereçler tercih edilmeli.\n\n(Doğrulama: Prof. Dr. Ayfer Aytuğ, "Mimaride Doku Kullanımının Psikolojik Etkileri Üzerine Bir Araştırma", YTÜ Fen Bilimleri Enstitüsü.)',
        kaynak: 'Temel Tasar, Bölüm 7.6',
        etiketler: ['doku', 'malzeme', 'mekân', 'derinlik', 'psikoloji'],
      },
      {
        id: 'tt-ortme',
        baslik: 'Örtme ve derinlik: pafta kompozisyonunun kuralı',
        icerik:
          'Bir yakınlık-uzaklık farkının duyulmasıyla DERİNLİK anlatımı ve üç boyutluluk etkisi doğar.\n\nÖrtmedeki anlatım belirliliğini artırmak için renk farkı, değer farkı ya da kuvvetli çevre çizgileri kullanılarak örten cisim, örtülen cisimden daha belirgin ayırt edilir.\n\nKRİTİK KURAL: Örtme olayında belirliliğin sağlanması için örten cisim örtüleni TAM OLARAK KAPATMAMALI; örtülen cismin bir kısmı örten cismin çevre çizgisinden TAŞMALIDIR.\n\nÖrtülen cisim geometrik bir biçime sahipse arkadaki biçimi doğru algılamak mümkündür. Serbest biçimde belirsizlik oluşur; bu belirsizlik ancak örten cismin SAYDAMLIĞI ile giderilebilir.\n\nPafta karşılığı: görseller üst üste bindirilecekse, alttaki görselin en az bir kenarı mutlaka dışarı taşmalı. Yarım kalan, tam kapanmayan bindirmeler paftada belirsizlik üretir.',
        kaynak: 'Temel Tasar, Bölüm 5.1',
        etiketler: ['örtme', 'derinlik', 'kompozisyon', 'pafta'],
      },
      {
        id: 'tt-etkili-cevre',
        baslik: 'Etkili çevre: neden çizgi kalınlığı hiyerarşisi şart',
        icerik:
          'Biçimler çevre çizgileri ile belirli hale gelir. Zayıf, ince ve az belirli cisimler gözde kuvvetli etki yapmaz. Kuvvetli çevre çizgilerine sahip biçimler daha ilgi çekicidir; anlatımları daha kesin ve kuvvetlidir.\n\nIşık ve gölge, üç boyutlu nesnelerin kenarlarını daha belirgin hale getirir. Mısırlılar alçak kabartmalarda kenar çizgilerinin etrafını derince oyarak gölge düşecek bölge oluşturmuşlardır.\n\nPafta karşılığı: bir plan paftasının okunmamasının en yaygın sebebi, kesite giren ve girmeyen her şeyin AYNI KALINLIKTA çizilmesidir. Kesit çizgisi en kalın, görünüş orta, tarama ve ölçü çizgisi en ince olmalıdır. Bu estetik bir tercih değil, ALGI ZORUNLULUĞUDUR.',
        kaynak: 'Temel Tasar, Bölüm 5.2.3',
        etiketler: ['çizgi kalınlığı', 'hiyerarşi', 'pafta', 'algı'],
      },
      {
        id: 'tt-olcu-derecelenmesi',
        baslik: 'Düzenli ölçü derecelenmesi ve koram',
        icerik:
          'Nesnelerin gelişigüzel değil, küçükten büyüğe ya da büyükten küçüğe doğru düzenli bir konum alması. Bu, düzenli ölçü perspektifidir (Gibson). Nesneler uzaklaştıkça küçük görünür; bu durum DERİNLİK HİSSİ oluşturur.\n\nDüzenli ölçü derecelenmesinin en üst kademesi KORAM’dır (gradasyon).\n\nPafta karşılığı: aynı büyüklükte 6 görsel yan yana koymak paftayı durgunlaştırır. Bir ana görsel (egemenlik) + kademeli olarak küçülen destek görseller derinlik ve okuma sırası üretir.',
        kaynak: 'Temel Tasar, Bölüm 5.2.1.4',
        etiketler: ['koram', 'gradasyon', 'derinlik', 'kompozisyon'],
      },
      {
        id: 'tt-surec',
        baslik: 'Tasarım süreci: yedi aşama',
        icerik:
          '1. Konunun ve programın verilmesi - konunun iyice programlanması, koşulların belirtilmesi.\n2. Ana fikirlerin yakalanması - mekânlar ve koşulları dikkate alınarak gerçekçi ANA FİKİRLERİN yakalanması. Bu bir tasarımlama safhasıdır; tasarın seçilmesidir.\n3. Tasarımlama aşaması - veriler, olanaklar ve koşullar gözden geçirilir; yoğun zihin çalışması.\n4. Bir tasarımın oluşması - çözümler henüz kesin şeklini almamış olsa da bir ölçüyü ve yerleşme düzenini görüntüler.\n5. Tasarı çalışması - zihinde belirli hale gelen tasarımın KÂĞIDA GEÇİRİLMESİ.\n6. Tasarımın kontrolü - çizilmiş tasarı, zihindeki tasarımla karşılaştırılır. Böylece MAKET YAPMA ve hatta modelin gerçekleştirilmesine kadar gidilir.\n7. Geliştirme aşaması - tasar ile tasarım arasında fark kalmayıncaya kadar görsel algılama çalışması yapılır.\n\nKavram ayrımı: TASARIM zihinde canlanan şekildir. TASARI, bunun kâğıt üzerinde ifade edilmiş ilk halidir. TASAR ise özgünlük taşıyan, bir amaca hizmet eden fikir ürünüdür.\n\nMAKET, 6. aşamanın aracı olarak tanımlanır: zihindeki ile çizileni karşılaştırma ve kontrol aracı. Sunum nesnesi olmadan önce bir DÜŞÜNME ARACIDIR.',
        kaynak: 'Temel Tasar, Bölüm 3',
        etiketler: ['süreç', 'maket', 'tasarım', 'yöntem'],
      },
    ],
  },

  // ============================================================
  {
    id: 'mimari-elestiri',
    baslik: 'Mimari Eleştiri ve Yorum',
    aciklama:
      'Bu uygulamadaki analiz motorunun doğrudan omurgası. Sağlıklı bir eleştirinin şartları ve incelenmesi gereken 11 başlık.',
    kaynak: 'İ. Hulûsi Güngör, Temel Tasar (Bölüm 14)',
    maddeler: [
      {
        id: 'me-gerekler',
        baslik: 'Sağlıklı eleştirinin dört gereği',
        icerik:
          '1. YETERLİ BİLGİ - Eleştirmenin konu hakkında etraflı bilgisi olmalı; o eseri diğerleriyle kıyaslayabilecek kadar geniş kültüre sahip olmalı.\n\n2. ELEŞTİRİ DİLİ - Kavramların ve ilkelerin dilini ve mahiyetini bilmeli. Bir kavram farklı anlaşılıyorsa, eleştirmen tek kişi olsa bile sözü yanlış anlaşılabilir.\n\n3. İYİ DEĞERLENDİRME - Nesne ÇOK YÖNLÜ değerlendirilmelidir; değişik yönlerden olumlu ve olumsuz tarafları araştırılmalıdır. Her bir bakımdan ortaya çıkan ARTI ve EKSİ değerler toplanmalı ve derecelerine göre sıralanmalıdır. Bir JÜRİ çalışmasında birkaç eser kıyaslanıyorsa; eksi değerlerin en az sakıncalı olanı ve artı değerlerin en çok yarar sağlayanları gösterilerek değerlendirme yapılmalıdır.\n\n4. TARAFSIZLIK - Eserlerin sahibinden hoşlanıyor ya da hoşlanmıyor olman, o tür eserlerin hoşuna gidip gitmemesi eleştiriyi değiştirmemeli. "Bir davanın haksız tarafın kazanması suretiyle sonuçlanması herkesi ne derece üzerse, elbette tutarsız ve haksız bir eleştiri de o derecede tepkiye ve hoşnutsuzluğa neden olur."\n\nMies van der Rohe: "Eleştirmenin rolü bir sanat yapıtını kendisine has ifadelerle açıklamaktır."',
        kaynak: 'Temel Tasar, Bölüm 14.1',
        etiketler: ['eleştiri', 'jüri', 'yöntem', 'tarafsızlık'],
      },
      {
        id: 'me-inceleme',
        baslik: 'Mimari eleştiride inceleme konuları (11 başlık)',
        icerik:
          'Mimari eleştiri proje ya da yapılar üzerinde yapılır; her ikisinde de incelenecek hususlar aynıdır. Öncelik sırası anlamına gelmemek koşulu ile şu hususlar AYRI AYRI incelenir ve HER BİRİ İÇİN NOT ALINIR:\n\n1. Eserin ARSAYA, İMAR DURUMUNA, İMAR YÖNETMELİĞİNE ve ARAZİ KOTLARINA göre durumu\n2. GÜNEŞ ve RÜZGÂR yönüne göre konumu\n3. ÇEVRE ile İLİŞKİSİ\n4. YAPI PROGRAMINA göre gerekli MEKÂNLARIN ve bunlar arasındaki BAĞLANTILARIN ve GEÇİŞLERİN sağlanıp sağlanmadığı\n5. ANA MEKÂNIN ÖZGÜNLÜĞÜ, mesajı ve kitleye yansıması\n6. Yapının STRÜKTÜRÜ\n7. Seçilen MALZEMELER, yapım tarzı, yapım teknolojisi\n8. Yapının ESTETİK yönden ele alınışı, kullanılan ÖGE ve İLKELER, düzenleme esasları, DENGE ve KARAKTER BİRLİĞİ\n9. MEKÂNLAR, KÜTLELER, YAPI KISIMLARI arasındaki ORANLAR\n10. Yapının ÖZGÜNLÜĞÜ, diğer yapı ya da mimarların ETKİSİNDE olup olmadığı\n11. EKONOMİ, İŞLETME ve BAKIM açısından yapının durumu',
        kaynak: 'Temel Tasar, Bölüm 14.1.5',
        etiketler: ['eleştiri', 'kontrol listesi', 'jüri', 'kritik'],
      },
      {
        id: 'me-ornek',
        baslik: 'Uygulamalı eleştiri örnekleri',
        icerik:
          'Örnek A - Karakter birliği bozulmuş yapı grubu:\n"Cepheleri çok farklıdır. Soldan birincisi sağır ve nokta pencereli, ikincisi dörtlü gruptan oluşan kare pencereli, üçüncüsü cam giydirmelidir. Binalarda yönler, malzemeler, oranlar birbirine yabancıdır. Blokların bazılarının üzeri düz, birisi doğrusal eğimli, diğeri ikisi eğimsiz. Bir bakışta bu yapılar bir bütün gibi değil, ayrı ayrı mimarların elinden çıkmış gibi durmaktadır."\n\nÖrnek B - Kısmi tutarlılık, kısmi kopuş:\n"Bu yapıda pencere kullanımında her iki cephe karakter birliği halindedir. Ancak 5. kattan sonraki renk yahut malzeme değişimi, cepheye gölge düşürmek üzere konan çelik profillerin bir tarafta dik açılı birleşimine karşın diğer tarafta kavisli hal, bütünlüğü bozmaktadır."\n\nÖrnek C - Aşırı uygunluk / az zıtlık:\n"Evet, hiç akla gelmeyen bu tür cephe ilginçtir. FAKAT DOĞRU MUDUR? İşletme, kullanım, bakım yönünden yarar ve avantaj var mıdır?" ... "Düzenleme bakımından dengeli, karakter birliği içinde, uygunlukların aşırı derecede çok, zıtlıkların az olduğu bir düzenleme türü kullanılmıştır. Çizgi öğesi o kadar fazla ki, monotonluğu kırmak için kullanılan yön zıtlıklarına ve çizgilerdeki ölçü farklarına (kalın, ince) rağmen SIKICILIK ve YORGUNLUK vermektedir."\n\nEleştiri dilinin modeli budur: önce ne görüldüğünü tarif et, sonra hangi ilkenin bozulduğunu adlandır, sonra sonucu söyle.',
        kaynak: 'Temel Tasar, Bölüm 14.2',
        etiketler: ['eleştiri', 'örnek', 'karakter birliği', 'cephe'],
      },
    ],
  },

  // ============================================================
  {
    id: 'teknik-cizim',
    baslik: 'Teknik Çizim ve Pafta Standartları',
    aciklama:
      'Paftanın okunabilirliği bir üslup meselesi değil, standart meselesidir. Bu bölümdeki kurallar DIN ve TS standartlarına dayanır.',
    kaynak: 'Neufert (s.6-8) + TS 5319 / MİM 244 ders notları',
    maddeler: [
      {
        id: 'tc-pafta-duzeni',
        baslik: 'Pafta düzeni ve antet',
        icerik:
          'DOSYALAMA için paftaların SOL KENARINDA 5 CM’lik bir şerit BOŞ bırakılmalıdır.\nEN SAĞDA ANTET yer alır.\n\nAntet şunları kapsamalıdır:\n1. Çizimin niteliği (eskiz, avan, uygulama v.s.)\n2. Yapının çizilen kısmının tarifi (vaziyet planı, plan, kesit, görünüş v.s.)\n3. Ölçeği\n4. Gerektiğinde ebatları\n\nRuhsat projesinde ayrıca: mal sahibinin ismi/imzası, mimarın ismi/imzası, gerektiğinde proje müdürünün imzası, ana müteahhidin imzası, kontrollük teşkilatı bilgisi.\n\nVAZİYET PLANLARINDA VE PLANLARDA KUZEY İŞARETİNİN BULUNMASI ZORUNLUDUR.\n\nÖğrenci paftası antedi: üniversite / fakülte / bölüm, ders kodu ve adı, proje adı, pafta adı, öğrenci ad-soyad ve numara, danışman, tarih, ölçek, pafta no.\n\nTipik pafta sırası: temel - bodrum kat - zemin kat - üst kat - kiriş düzeni - aşık düzeni - kesit - güney/doğu/kuzey/batı görünüşü - vaziyet planı - bahçe planı.',
        kaynak: 'Neufert s.6 (DIN 6, 15, 16, 36, 406, 823, 1352, 1356)',
        etiketler: ['pafta', 'antet', 'DIN', 'düzen'],
      },
      {
        id: 'tc-olcek',
        baslik: 'Ölçekler (DIN 825)',
        icerik:
          'Mimari çizimler için: 1:1, 1:2,5, 1:5, 1:10, 1:20, 1:25, 1:50, 1:100, 1:200, 1:250\nVaziyet planları için: 1:500, 1:1000, 1:2000, 1:2500, 1:5000, 1:10000, 1:25000\n\nKurallar:\n- Antet üzerinde çizimin ANA ÖLÇEĞİ BÜYÜK, geri kalan ölçekler küçük yazılır; alanlara ait oldukları çizimin yanında tekrar edilir.\n- Tüm nesneler ölçeğe uygun çizilmeli.\n- ÖLÇEKSİZ çizilen kısımlarda ölçülerin ALTI ÇİZİLMELİDİR.\n\nÖlçek-içerik ilişkisi (uygulama projesi): 1/50, 1/20, 1/10, 1/5, 1/1.\n- 1/50: plan, kesit, görünüş (temel uygulama ölçeği)\n- 1/20 - 1/10: sistem detayları (kısmi plan, kesit, görünüş)\n- 1/5, 1/2, 1/1: nokta detayları ve imalat detayları\n\nÖnemli: Ölçek büyüdükçe gösterilecek bilgi ARTAR, azaldıkça SADELEŞİR. Çizim ölçeği değiştikçe tarama ve gösterim de sadeleşir. 1/200’e 1/50 detayını taşımak paftayı okunmaz yapar.',
        kaynak: 'Neufert s.6 (DIN 825) + MİM 244 ders notları',
        etiketler: ['ölçek', 'DIN 825', 'detay', 'pafta'],
      },
      {
        id: 'tc-olculendirme',
        baslik: 'Ölçülendirme kuralları',
        icerik:
          '- Tüm ölçüler KABA ÖLÇÜLERDİR (duvar kalınlıkları).\n- Mimari çizimde 1 m’nin ALTINDAKİ ölçüler CM, 1 m’nin ÜZERİNDEKİLER M olarak belirtilir.\n- MERDİVEN ölçüleri ÇIKIŞ AKSI boyunca; RIHT YÜKSEKLİĞİ ÜSTTE, BASAMAK GENİŞLİĞİ ALTTA yazılır.\n- PENCERE ve KAPI ölçüleri ORTA AKS üzerine; GENİŞLİK ÜSTTE, YÜKSEKLİK ALTTA yazılır. (Örn. K7 90/220)\n- Döşeme kotları ZEMİN KAT DÖŞEMESİ ÜSTÜ +-0,00 kabul edilerek belirlenir; kaba ve bitmiş kot AYRI AYRI gösterilir.\n- ODA NUMARALARI daire içine, ALANLAR kare/dikdörtgen içine m² olarak yazılır.\n- KESİT ÇİZGİLERİ kesik çizgi ile ifade edilir ve BAKIŞ YÖNÜNE DOĞRU ALFABETİK SIRA ile BÜYÜK HARFLERLE isimlendirilir.\n- Ölçüler çizimi ÇEVİRMEDEN OKUNABİLECEK şekilde yazılır. Çizimin sağ tarafı için ölçü çizgisi doğrultusunda SAĞDAN, sol tarafı için SOLDAN yazılır.\n- Ölçü bağlama çizgileri ve ölçü çizgileri kesiştikleri sınır noktasının 1-2 mm ötesine taşırılır. Ölçü çizgisi, ölçülendirdiği elemanın köşe noktasına 1-2 mm yaklaşmalıdır.\n\nPLAN DIŞ ÖLÇÜLENDİRME SIRASI (dıştan içe):\n1. çizgi: blok ölçüsü\n2. çizgi: cephe hareketleri\n3. çizgi: taşıyıcı akslar\n4. çizgi: doluluk ve boşluklar\n\nİÇ ÖLÇÜLENDİRME: her hacimde enine ve boyuna İKİŞER ölçü çizgisi. Birinci çizgide hacmin net en ve boyu; ikinci çizgide kapı, pencere, kolon genişlikleri ve komşu duvarlara uzaklıkları.\n\nKESİTTE İÇ ÖLÇÜLENDİRME: bir çizgide döşeme üstünden döşeme üstüne KABA İNŞAAT KAT YÜKSEKLİKLERİ; ikinci çizgide döşeme kaplama kalınlığı, parapet, pencere, kapı ve bölme duvar yükseklikleri, lento-tavan mesafesi, taşıyıcı sistem kalınlıkları, düşük döşeme yükseklikleri.',
        kaynak: 'Neufert s.6 + MİM 244 Yapı Elemanları Tasarımı ders notları',
        etiketler: ['ölçülendirme', 'kot', 'plan', 'kesit'],
      },
      {
        id: 'tc-semboller',
        baslik: 'Çizim sembolleri ve gösterim kuralları (DIN 107)',
        icerik:
          '- Pencerelerde SOL TARAF HEP MENTEŞELİ, SAĞ TARAF MENTEŞESİZ gösterilir.\n- TEK KOLLU merdivenler AHŞAP uygulamaya, ÇİFT KOLLU merdivenler BETON uygulamaya müsaittir.\n- Her kat planında MERDİVEN KOVASINDAN GEÇEN YATAY KESİT, döşemeden yaklaşık 1/3 KAT YÜKSEKLİĞİNDEDİR.\n- Basamaklar +-0,000’dan yukarıya ve aşağıya doğru SÜREKLİ numaralandırılır. +-0,00 altındakiler önlerine EKSİ işareti alır.\n- ÇIKIŞ AKSI ilk basamakta bir DAİRE ile başlar, en son basamakta bir OK ile sona erer (bodrumda bile).\n- Merdiven kesiti sembolik olarak zikzaklı yamuk bir doğru çizgi ile gösterilir; anlamın yanlış yorumlanmayacağı yerlerde zikzaklar atılabilir.\n- Merdiven başlangıç katına uygun şekilde 2/3 hattından kesilir; üst katın basamakları KESİK ÇİZGİ ile çizilir.\n- RAMPADA yön oku rampanın MERKEZ HATTINDA yer almalı, sürekli ince çizgi ile çizilmeli; alttan yükseliş noktasında bir DAİRE, üst yükselme noktasında AÇIK BİR OK olmalıdır.\n- Kesitlerde ve görünüşlerde DOĞAL ZEMİN NOKTA NOKTA, ÖNERİLEN ZEMİN DEVAMLI ÇİZGİ ile gösterilir; her ikisine ait kotlandırma eksiksiz yapılır.\n- Bütün kotlar SABİT RÖPER KOTU ile bağlantılandırılır.\n\nELEMAN POZ NUMARALARI:\nMerdivenler M1, M2... | Kapılar K1, K2... | Camlı kapılar CK1... | Camekânlar CMK1... | Pencereler P1, P2... | Giriş kapıları GK1... | Gömme dolaplar GD1...\nMAHAL NUMARALARI (elips içinde): Bodrum B-01... | Zemin Z-01... | Birinci kat 101, 102... | n’inci kat n01, n02...\nTAŞIYICI SİSTEM (dört karakter, ilk harf eleman + kat + eleman no): Kolon S201 | Döşeme T201 | Duvar D201 | Kiriş K201',
        kaynak: 'Neufert s.7-8 (DIN 107) + MİM 244 ders notları',
        etiketler: ['sembol', 'DIN 107', 'merdiven', 'poz numarası', 'mahal'],
      },
      {
        id: 'tc-cizgi',
        baslik: 'Çizgi hiyerarşisi ve tarama',
        icerik:
          'Çizgi çeşitleri kalınlıklarına, koyuluk tonlarına, renklerine ve biçimlerine göre ayrılır (TS / DIN).\n\nPLANDA KALINLIK HİYERARŞİSİ (kalından inceye):\n1. KESİTE GİREN elemanlar (duvar, kolon, döşeme) - en kalın. Kat planlarının kesit geçirilen yerlerinde İÇ ALANLAR KOYULAŞTIRILIR.\n2. GÖRÜNÜŞE giren, kesite girmeyen elemanlar - orta.\n3. Kapı ve pencere - duvara göre DAHA İNCE çizgi.\n4. Tefriş, tarama, ölçü çizgisi, aks çizgisi - en ince.\n5. Üst kattan gelen / kesik çizgi - ince kesikli.\n\nTARAMA: TS 5319 "Teknik resim - Taramalar - Kesit yüzeyinin ve malzemenin gösterilişi" esas alınır. Çizim ölçeği değiştikçe tarama sadeleşir; 1/200’de tarama tamamen kaldırılabilir.\n\nEn sık hata: her şeyi aynı kalınlıkta çizmek. Bu, Temel Tasar terimiyle ETKİLİ ÇEVRE ilkesinin ihlalidir; pafta okunmaz hale gelir.',
        kaynak: 'TS 5319, MİM 244 ders notları, İç Mimarlıkta Teknik Resim (T. Canbulat)',
        etiketler: ['çizgi kalınlığı', 'tarama', 'TS 5319', 'hiyerarşi'],
      },
      {
        id: 'tc-1-50',
        baslik: '1/50 plan, kesit ve görünüşte ne bulunmalı',
        icerik:
          '1/50 PLANDA:\n- Taşıyıcı aks sistemi, statik projeye uygun harf ve sayılarla (X ekseninde harfler, Y ekseninde sayılar).\n- Planlar her paftada AYNI BAKIŞ YÖNÜNDE yerleştirilir; seçilen koordinat sistemi mimari, statik ve tesisat projelerinde aynen ve aynı yönde kullanılır.\n- Kesit çizgisinin TÜMÜ ve BAKIŞ YÖNÜ gösterilir.\n- Taşıyıcı elemanlar (kolon vb.) ayrı çizim tekniği ve gerçek boyutlarıyla, içleri koyulaştırılmış.\n- Sabit tezgâhlar, lavabo, eviye, duş teknesi; kombi/soba yeri ve bacaları.\n- Düşey donatım boruları ve kanallar, gerçek yer ve ölçülerinde.\n- Döşeme desenleri, eğimler, süzgeç yerleri, kaplama derz yerleri.\n- Doğramalar detayına uygun ve şematik; açılan kanatlar belirtilir; aks çizgileri üzerinde en ve yükseklik (K7 90/220 gibi).\n- Esas giriş önü tretuvar kotu +-0.00 kabul edilerek tüm kot farkları, KABA ve BİTMİŞ kot AYRI AYRI.\n- Merdivende: numara, basamak adedi, genişlik ve rıht yüksekliği. Çıkış hattının basamakları kestiği noktalar çıkış yönünde numaralanır, son basamakta ok ucu ile biter.\n- Zemin kat planında çevre tanzimi (tretuvar, bağlantı yolları, giriş platoları, çiçeklikler), kaba ve bitmiş kotlarıyla.\n- Çatı planı: meyiller, su toplama yerleri, dereler, tesisat ve asansör çıkıntıları, bacalar, çatı çıkış delikleri, kotlar.\n\n1/50 KESİTTE:\n- Biri MERDİVENDEN, diğeri KONSTRÜKTİF ÖZELLİĞİ olan yerlerden EN AZ İKİ KESİT.\n- Kesitin geçtiği mahallerin kodları ve isimleri.\n- Asma tavan yapılan mahallerde asma tavan alt yüzü ile bitmiş döşeme arasındaki NET KAT YÜKSEKLİĞİ ayrı bir ölçü çizgisiyle.\n- Pencere altı dolu kısımların yapım şekli; kiriş bitişi, duvar dolgusu ayrı ayrı kotlandırılmış; radyatör yüksekliği.\n- Cephedeki güneş kırıcılar, malzeme açılımları, çatı konstrüksiyonu gerçek şekil ve ölçüleriyle.\n- Drenaj sistemi ve yalıtım açıklamaları.\n\n1/50 GÖRÜNÜŞTE:\n- BÜTÜN görünüşler çizilir.\n- Zemin altında kalan yapı kısımları, cepheye arkadan bağlanan bölümler.\n- Cephe kaplama malzemesi, yağmur inişleri ve oluklar, kapı ve pencere görünüşleri.\n- Saçaklar, balkonlar, döşeme, denizlik altı, lento altı, kalkan duvarları, oluk, mahya, baca ve çıkıntılara KOT verilir.',
        kaynak: 'MİM 244 Yapı Elemanları Tasarımı - Dr. Ecem Edis grubu ders notları',
        etiketler: ['1/50', 'plan', 'kesit', 'görünüş', 'uygulama projesi'],
      },
      {
        id: 'tc-plan-cizim-sirasi',
        baslik: 'Plan çizim sırası (uygulamalı)',
        icerik:
          'Trakya Üniversitesi Mimarlık Fakültesi hafif çelik yapı uygulamasından adım adım çizim sırası:\n\n1. AKSLARIN ÇİZİLMESİ - bodrum katta çizilen akslar diğer tüm paftalarda AYNI YERE gelmelidir.\n2. DUVARLAR - içeride 2 cm, dışarıda 3 cm duvar kaplamaları hesaba katılır.\n3. PENCERELER - iç sıva ve dış sıva ile pencere kasası birleşimine dikkat. Pencerenin merkezinden geçecek ve AÇILIŞ YÖNÜNÜN TERSİ istikametinde poz numarası ve ölçüsü verilir. Kapı/pencere duvara göre DAHA İNCE çizgi.\n4. KAPI-PENCERE DESTEKLERİ - duvar birleşim noktalarında min 3 çelik C profil bir arada; ortalama 60 cm aralıklarla dikmeler. Kapı/pencere yerlerine göre mesafe kısalabilir ama daha uzak OLMAMALIDIR.\n5-6. İÇ DUVARLAR VE KAPILAR - dikme yerlerini belirlemeden önce kapı doğramaları çizilir. Kapı kasasının her iki tarafına montaj dikmesi çizilmeli; kasalar her iki tarafta 2 cm taşacak kalınlıkta.\n7. VERANDA / TERAS - kesite GİRMEYEN, görünüşe giren düzlemler DAHA İNCE ÇİZGİ ile. Basamaklara ait rıhtlar numaralandırılır.\n8. MERDİVEN - iki kollu merdivende SAHANLIK GENİŞLİĞİ minimum BASAMAK UZUNLUĞU kadar. Çıkış hattı çizilmeli, n x r / b değerleri ve basamak sayıları yazılmalı. Başlangıç katına uygun şekilde 2/3 hattından kesilir; üst katın basamakları kesik çizgi.\n9. KURANGLEZ - bodrum perde duvarlarıyla birlikte. Kuranglez derinliği MAKSİMUM 2 METRE; kuranglez duvarı 0.00 kotundan 10-15 cm yukarı çıkabilir.\n10. KESİTLER - A-A için belirtilen tüm adımlar aynı sırayla B-B kesit çizgisi üzerinden tekrarlanır.',
        kaynak: 'MİM 153 Yapı Bilgisi ders notları (Trakya Üniv. Mimarlık Fakültesi)',
        etiketler: ['çizim sırası', 'plan', 'aks', 'merdiven', 'kuranglez'],
      },
    ],
  },

  // ============================================================
  {
    id: 'yapi-bilgisi',
    baslik: 'Yapı Bilgisi: Strüktür ve Elemanlar',
    aciklama:
      'Mimari eleştiri kontrol listesinin 6. maddesi "yapının strüktürü". Bir projeyi savunabilmek için taşıyıcı sistemini bilmek zorunludur.',
    kaynak: 'MİM 153 Yapı Bilgisi ders notları (9-12. hafta)',
    maddeler: [
      {
        id: 'yb-iskelet',
        baslik: 'İskelet (karkas) yapılar',
        icerik:
          'Yatay ve düşey taşıyıcılardan oluşan elemanlar bütünüdür. DUVARLAR TAŞIYICI DEĞİLDİR.\n\nHesap ve yapım ekonomisi için uygun aks mesafeleri (ızgara) ile çalışılır; düşey taşıyıcılar aks sistemine göre yerleştirilir.\n\nTarihsel mantık: Taşın çekme dayanımı düşüktür, bu yüzden açıklıklar sınırlıdır - kemer sistemleri gelişir. 1700’lerde çimento, 1800’lerde patent. Çimento + kum + çakıl + su = BETON. Beton çekme ve darbeye dayanıksızdır, bu yüzden çelik çubukla donatılır = BETONARME. Çekmenin tamamı çelik çubuklarca karşılanır. Çelik ile betonun birlikte çalışması KENETLENME (ADERANS) ile sağlanır.\n\nTaşıyıcı elemanlar: döşemeler, kirişler, kolonlar/perdeler, temeller.',
        kaynak: 'MİM 153, 9-10. hafta',
        etiketler: ['iskelet', 'karkas', 'betonarme', 'strüktür'],
      },
      {
        id: 'yb-kolon-kiris',
        baslik: 'Kolon ve kiriş ölçüleri',
        icerik:
          'KOLONLAR:\n- TS 500: kolonun EN KÜÇÜK KESİT BOYUTU >= 25 cm.\n- L ve T kesitli kolonlarda en küçük kalınlık 20 cm olabilir.\n- Örnek dikdörtgen kolon: 25x50; boyuna donatı Ø14, etriye Ø8, pas payı 3 cm.\n- Dairesel kolonlarda etriye yerine FRET kullanılır (burkulmaya karşı).\n- Etriyenin görevi: donatıyı birbirine bağlamak + kesme kuvvetlerini almak.\n- PERDE KOLON: fazla yük veya kolon araları yakınsa. Kalınlık d >= 15 cm, uzunluk >= 7d.\n\nKİRİŞLER:\n- Donatı yerleşimi: MONTAJ DEMİRİ (üst), PİLYE (eğik), ESAS DEMİR (alt / çekme bölgesi).\n- Kiriş yük altında deforme olur: üst lifler basınç, alt lifler çekme. Tarafsız eksen ortada. Çekme bölgesine (alt) esas demir konur.\n- Esas demirler arası mesafe >= çelik çapı veya >= 2 cm. Yeterli genişlik yoksa iki sıra.\n- En az 3 adet Ø12 çekme donatısı; montaj demiri en az 2 adet Ø12.\n- Etriye Ø8, en fazla 20 cm aralık.\n- Taşıyıcı kiriş (19 cm duvar altında): yükseklik >= 30 cm, genişlik >= 25 cm.\n- Subasman kirişi: 15-20 cm (grobeton ve blokajın korunması için).\n- Bağ kirişi: 25/25 veya 30/25. Temel pabuçlarını yatay kuvvetlere karşı bağlar.\n\nDÖŞEMELER: kirişsiz (mantar) döşeme, kirişli plak döşeme (tek/çift doğrultuda çalışan), asmolen döşeme, kaset döşeme.',
        kaynak: 'MİM 153, 9-10. hafta; TS 500',
        etiketler: ['kolon', 'kiriş', 'donatı', 'TS 500', 'betonarme'],
      },
      {
        id: 'yb-temel',
        baslik: 'Temeller',
        icerik:
          'Temel tipi, zemin emniyet gerilmesi ilişkisine göre seçilir.\n\nYÜZEYSEL TEMELLER:\n1. Tekil (münferit) temeller\n2. Sürekli (mütemadi) temeller\n3. Radye jeneral: plak / ters kemer / rijit radye / mantar\n\nDERİN TEMELLER:\n1. Ayak temeller\n2. Kazık temeller (çelik / ahşap / betonarme)\n3. Kuyu temeller\n\nTEKİL TEMEL: her düşey taşıyıcının altına somel; kolon ayağın üstüne oturur. Perdeler uzunlukları boyunca sürekli temel ayağına oturur. Bütün kolon ve perdeler BAĞ KİRİŞİ ile birbirine bağlanır; bağ kirişleri DEPREM sırasında ortaya çıkan YANAL KUVVETLERİ alarak düşey elemanlardaki hasarı önler. Sağlam zeminde veya kolon sayısının seyrek / aralarının geniş olduğu iskelet sistemlerde kullanılır.\n\nSÜREKLİ TEMEL: bir doğrultuda sürekli; taşıyıcı duvarlar veya kolon dizileri altında.\n\nRADYE TEMEL: kolonlar her iki yönde sürekli kirişlerle bağlanır, kiriş araları radye döşemesi ile kapatılır. Döşeme kalınlığı >= 30 cm. DEPREM BÖLGELERİNDE UYGUNDUR. Günümüzde tek kalın plak tercih ediliyor; kirişli plakta kalıp ve demir işçilik artar. Donatı miktarı açısından iki sistem arasında fark yoktur. SU İZOLASYONU açısından tekil ve sürekli temele göre avantajlıdır.',
        kaynak: 'MİM 153, 9-10. hafta',
        etiketler: ['temel', 'radye', 'deprem', 'bağ kirişi'],
      },
      {
        id: 'yb-celik',
        baslik: 'Çelik iskelet sistemler',
        icerik:
          '19. yy sonu: artan nüfus, çok katlılaşma, hafif yapı ihtiyacı ve endüstri devrimi ÇELİK İSKELET SİSTEMLERİ doğurdu. 20. yy başında kolay işlenebilme ve şekil verilebilme BETONARME’yi öne çıkardı.\n\nDönüm noktaları: Brooklyn Köprüsü (1870-1883); 1889 Fransız İhtilali 100. yıl - Eiffel Kulesi ve Galeries des Machines.\n\nÖZELLİKLER: Dövülerek, preslenerek veya haddeden geçirilerek şekillendirilir. Teknik yönden İZOTROP ve HOMOJENDİR. Fabrikada profil olarak üretilir, şantiyede kesilip birleştirilir; ön yapıma uygundur. Detay ve birleşimler karmaşıktır, özen ister.\nSt 37 = 37 kgf/mm² (~370 N/mm²) çekme dayanımı (DIN). TS’de St yerine Fe veya C sembolü kullanılır.\n\nDEZAVANTAJLAR: Ülkemizde maliyetli; küçük ve alçak yapıda yaygın değil; YANGINA karşı taşıyıcıların korunması gerekir; PASLANMAYA karşı ince kesitlerde tedbir ve periyodik bakım gerekir; ince kesitlerde BURKULMA riski - çok parçalı çubuk ve sandviç plak ile çözülür.\n\nPROFİL TÜRLERİ: L (köşebent) - kafes kiriş ve çok parçalı eleman; U - kafes kiriş, çok parçalı kolon/kiriş, çatı aşıkları; I profil; T profil - cam çerçevesi ve çatı elemanları; Z profil; boru ve kutu profiller - düzlem ve uzay kafes kirişler.\n\nYANAL YÜKLER: Rüzgâr ve deprem için perde duvar, çapraz bağlama veya moment dayanımlı (rijit) çerçeve gerekir. Dolgu: prekast beton, kesme taş, tuğla veya gazbeton.\n\nUZAY KAFES: Çelik çubuklar (boru) + düğüm noktaları (küre). Hafif, hızlı, endüstrileşmiş; örtüye istenen formu verir. Birim eleman 6 çubuk + 4 düğüm noktasından oluşan dörtyüzlüdür. Örnek: Sabiha Gökçen Havalimanı, Tekeli-Sisa Mimarlık, 2001, İstanbul (tonozsal / tek eğrilikli uzay kafes).',
        kaynak: 'MİM 153, 11-12. hafta',
        etiketler: ['çelik', 'profil', 'uzay kafes', 'yangın', 'St 37'],
      },
      {
        id: 'yb-drenaj-dilatasyon',
        baslik: 'Drenaj, dilatasyon ve bacalar',
        icerik:
          'DRENAJ: Yapıları yüzeysel ve yeraltı sularının zararlarından korumak için suların toplanması, denetim altına alınması ve uzaklaştırılması. İki temel sistem: YERALTI ve YÜZEY drenajı.\nYüzey drenajı: yağmur ve yüzey sularını doğal drenaj düzenine veya belediyenin yağmur suyu kanalına yönlendirmek için arazinin derecelendirilmesi ve düzleştirilmesi. Akış kanal kapasitesini aşıyorsa suyu tutacak havuz gerekir.\n- Nem ve su yalıtım membranı, temelin üst kısmından başlayıp zemin seviyesinden 150 MM yüksekliğine kadar devam etmeli.\n- Beton kâgir duvarlar 2 mm bitümlü kaplamayla örtülmüş, en az 10 mm kalınlığında portland çimentolu harçla böhçalanmalı.\n- Drenaj borusu altı min 50 mm.\n\nDİLATASYON DERZİ şu durumlarda öngörülmelidir:\n- Farklı yüklenmeler nedeniyle farklı çökmelerin beklendiği yapılarda\n- Mimarisi gereği ÇOK UZUN yapılarda\n- Yapıların yatay ve düşey sürekliliğinin bozulduğu yerlerde\n- Az ve çok katlı yapı bloklarının kesişme düzlemlerinde\nDerz yapının TÜMÜNDE ve TEMELLERDE öngörülmelidir.\n\nBACALAR:\n- Mümkün olduğunca bir arada gruplandırılmalı, çatı üzerine EN AZ SAYIDA çıkarılmalı.\n- Rüzgâr nedeniyle geri tepme olmaması için en yüksek çatı mahyası seviyesinden ya da komşu bina üst kotundan EN AZ 50 CM daha yukarıya çıkarılmalı.\n- Yağmur, kar ve kuş etkilerini önlemek için üzerine başlık yapılmalı.\n- Tesisat bacaları: ortak mahallere açılabilen ve müdahale edilebilen bacalardır. Çok büyük binalarda içinde yürünebilen kat yapılır. TS 2167 "Tesisat baca ve kanallarının projelendirilmesi ve düzenlenmesi kuralları" geçerlidir.',
        kaynak: 'MİM 153 Yapı Bilgisi ders notları; TS 2167',
        etiketler: ['drenaj', 'dilatasyon', 'baca', 'yalıtım', 'TS 2167'],
      },
    ],
  },
]
