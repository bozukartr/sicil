"use strict";

/* ================= SAHA KARİYERİ · ER / UZMAN / ASTSUBAY ================= */
E("er ob cv","*","Takım Çavuşu","İlk gece nöbeti","Acemi Birliği · Nizamiye",
"Nöbet arkadaşın ayakta uyuyor. Bildirirsen ceza alacak; sustuğunda nöbet yerinin sorumluluğu ikinize ait.",
"Uyandırıp sustum","koruma dis-3","Amire bildirdim","kural dogruluk ast-3");
E("er ob cv","*","Devre Arkadaşın","Eksik teçhizat","Koğuş · Dolap Sırası",
"Dağıtılan teçhizatta bir parça eksik. Yan dolaptaki kullanılmayan parçayı alırsan sayım kapanacak.",
"Parçayı aldım","ortbas loj-4","Eksiği yazdırdım","dogruluk duzen");
E("er ob cv","*","Eğitim Çavuşu","Koşu parkuru","Eğitim Alanı",
"Takımın sonundaki arkadaşın nefesi kesildi. Onu beklersen kendi derecen ve takım sıralaması düşecek.",
"Tempomu korudum","tempo ast-5","Yanında kaldım","koruma moral fiz-3");
E("er ob cv","*","Silah Arkadaşın","Atış öncesi","Atış Poligonu",
"Arkadaşının nişangâhında sorun var ve sıra size geldi. Sorunu söylerse tüm takım bekleyecek.",
"Atışa devam ettik","pasif risk","Atışı durdurdum","kural sahiplen");
E("er ob cv","*","Bölük Yazıcısı","İzin çizelgesi","Bölük · Yazıhane",
"Bayram izni için tek boş yer kaldı. Senin ailen yakın, arkadaşının ailesi ülkenin öbür ucunda.",
"İzni kullandım","aile ast-5","Hakkımı ona verdim","feragat moral");
E("er ob cv","*","Kıdemli Er","Yeni gelenler","Koğuş",
"Yeni gelenlere sert davranmanın düzeni hızlı kurduğunu söylüyorlar. Senden de aynı tavrı bekliyorlar.",
"Ben de sertleştim","sertlik","Yanlarına oturdum","mentor moral dis-2");
E("er ob cv","*","Takım Komutanı","Onbaşı seçimi","Bölük · İçtima Alanı",
"Takıma bir onbaşı seçilecek. Çok konuşmayan ama güvenilir birisin; öne çıkmazsan başka biri seçilecek.",
"Geri planda kaldım","geriplan","Göreve talip oldum","gorunur insiyatif");
E("er ob cv","*","Nöbetçi Astsubay","Kayıp mühimmat","Kışla · Depo",
"Sayımda bir mühimmat eksik çıktı. Eksik senin vardiyandan önce oluşmuş olabilir ama defterde son imza senin.",
"Önceki vardiyayı suçladım","yikma sic+3","Sorumluluğu aldım","sahiplen dogruluk");
E("er ob cv","*","Köy Muhtarı","Sel yardımı","Görev Bölgesi",
"Birliğin yakınındaki köyü su bastı. Yardıma gitmek ertesi günkü eğitimi aksatacak.",
"Eğitime hazırlandım","gorev iti-4","Yardıma gittim","temsil moral fiz-3");
E("er ob cv","*","Bölük Astsubayı","Çavuşluk değerlendirmesi","Bölük · Büro",
"Değerlendirme formunda arkadaşlarının hatalarını yazman isteniyor. Form gizli, sonuçları terfilerini etkileyecek.",
"Her şeyi yazdım","kural ast-6","Yalnız ciddi olanları yazdım","esnek dogruluk");

E("uo uc","*","Tim Komutanı","Sözleşme yenileme","Personel Şubesi",
"Profesyonel kadroya geçmek uzun görevler ve daha az aile zamanı demek. Önünde imzalanmayı bekleyen sözleşme var.",
"İmzalamadım","aile kar-3","İmzaladım","gorev ozveri");
E("uo uc","*","Yeni Katılan Er","İlk eğitim","Tim Odası",
"Yeni er aynı hatayı üçüncü kez yapıyor. Bağırmak hızlı, yeniden göstermek ise bütün akşamını alacak.",
"Sertçe uyardım","sertlik","Baştan öğrettim","mentor ozveri");
E("uo uc","*","Muhabereci","Arızalı telsiz","Arazi · Kontrol Noktası",
"Yedek telsizin bataryası zayıf. Göreve çıkmak mümkün ama bağlantının kesilme riski var.",
"Göreve çıktım","risk ope+4","Değişim istedim","ihtiyat loj-3");
E("uo uc","*","Tim Arkadaşın","Yorgunluk","Geçici Üs Bölgesi",
"Arkadaşın dört gecedir doğru düzgün uyumadı ve devriye sırası onda. Yerine geçersen sen de dinlenemeyeceksin.",
"Sırasını tuttum","feragat destek","Kendi nöbetine gitti","kural ast-5");
E("uo uc","*","Bölük Komutanı","Zor görev","Brifing Çadırı",
"Tecrübeli personel olarak riskli keşif görevine gönüllü arıyor. Kimse gözünü kaldırmıyor.",
"Sessiz kaldım","geriplan pasif","Gönüllü oldum","insiyatif risk");
E("uo uc","*","İkmal Astsubayı","Kışlık malzeme","Depo",
"Kaliteli bot sayısı sınırlı. Kendi numaranı ayırabilir veya en çok arazide kalan ere verebilirsin.",
"Kendime ayırdım","menfaat ast-4","Ere verdim","koruma feragat");
E("uo uc","*","Eşin","Yeni tayin","Telefon",
"Yeni görev yerinde lojman yok ve tayini kabul etmek aile düzenini yeniden bozacak.",
"Tayini reddettim","aile sic-4","Göreve gittim","gorev ail-8");
E("uo uc","*","Kurs Komutanı","Uzmanlık kursu","Sınıf Okulu",
"Kursun son sınavına hazırlanmak için izin günlerini kullanman gerekiyor. Başarı yeni bir uzmanlık kapısı açacak.",
"İzin yaptım","dinlenme tek-4","Çalıştım","ogrenme ozveri");
E("uo uc","*","Takım Subayı","Hatalı koordinat","Harekât Merkezi",
"Emirdeki koordinatın yanlış olduğunu fark ettin. Subay senden kıdemsiz ama karar onun imzasını taşıyor.",
"Emri uyguladım","itaat ope-5","Yanlışı söyledim","direnc dogruluk");
E("uo uc","*","Sağlık Memuru","Eski sakatlık","Revir",
"Dizindeki sakatlık yeniden başladı. Rapor alırsan timin personel eksiği büyüyecek.",
"Sakladım","sakla fiz-6","Rapor aldım","destek dinlenme");

E("ac akc au","*","Bölük Astsubayı","Nöbet çizelgesi","Bölük · Büro",
"İki personelin ailevi mazereti aynı haftaya denk geldi. İkisine de izin verirsen kalan ekip ağır yük taşıyacak.",
"İzinleri reddettim","kural harcama","Yükü paylaştırdım","esnek koruma loj-3");
E("ac akc au","*","Genç Teğmen","İlk arazi görevi","Bölük · Brifing",
"Yeni teğmenin planında sahada çalışmayacak bir ayrıntı var. Herkesin içinde düzeltmek otoritesini zedeleyebilir.",
"Toplantıda söyledim","dogruluk ast-3","Sonra yalnız konuştum","mentor mesafe");
E("ac akc au","*","İkmal Personeli","Sayım farkı","Depo",
"Yıllardır devreden küçük bir sayım farkı buldun. Düzeltmek geçmiş dönemlerin tamamını incelemek demek.",
"Devrettim","savsakla","Sayımı açtım","duzen ozveri");
E("ac akc au","*","Emrindeki Çavuş","Disiplin olayı","Bölük",
"Başarılı bir çavuş öfkeyle yeni bir ere vurdu. Resmî işlem timin düzenini sarsacak.",
"Aramızda çözdüm","ortbas","Tutanak tuttum","kural dogruluk ast-4");
E("ac akc au","*","Kursiyerler","Ders saati","Eğitim Merkezi",
"Programdaki konu eski ve sahada artık farklı uygulanıyor. Müfredattan çıkmak denetimde sorun olabilir.",
"Kitabı anlattım","itaat ihmal","Sahadakini öğrettim","insiyatif ogrenme");
E("ac akc au","*","Ailen","Hafta sonu","Lojman",
"Çocuğunun gösterisi, birliğin gönüllü hazırlık çalışmasıyla aynı saatte. Çalışmaya sen olmadan da devam edilebilir.",
"Birlikte kaldım","gorev ail-8","Gösteriye gittim","aile sic-3");
E("ac akc au","*","Harekât Subayı","Personel seçimi","Karargâh",
"Zor göreve en tecrübeli personeli göndermek başarı şansını artıracak ama aynı kişileri sürekli yıpratacak.",
"En iyileri seçtim","tempo harcama","Görevi paylaştırdım","koruma ope-4");
E("ac akc au","*","Denetleme Heyeti","Hazırlık raporu","Bölük",
"Hazırlık oranı hedefin altında. Birkaç kalemi iyimser yazarsan birlik denetimi geçecek.",
"Rakamı yükselttim","ortbas sic+4","Gerçeği yazdım","dogruluk ope-4");
E("ac akc au","*","Genç Astsubay","Meslek tavsiyesi","Kantin",
"Genç astsubay senden yol göstermeni istiyor. Onu yetiştirmek kendi hazırlık zamanından götürecek.",
"Kaynak verdim","mesafe tek+2","Yanıma aldım","mentor ozveri");
E("ac akc au","*","Birlik Komutanı","Başarı takdiri","Tören Alanı",
"Başarılı faaliyetin takdiri sana verilecek; işin büyük bölümünü hazırlayan ekip törende anılmayacak.",
"Takdiri aldım","gorunur ast-5","Ekibi öne çıkardım","sahiplen moral");

E("aku ab akb","*","Birlik Komutanı","Devir teslim","Karargâh",
"Yeni komutan birliğin yıllardır çalışan düzenini hızlıca değiştirmek istiyor. Tecrübene güveniyor ama itiraz beklemiyor.",
"Uyum sağladım","itaat kapali","Riskleri anlattım","direnc dogruluk");
E("aku ab akb","*","Personel Temsilcileri","Ortak talep","Toplantı Salonu",
"Personelin özlük talebi makul ama üst makama taşımak seni 'sorun çıkaran' kişi yapabilir.",
"Dosyayı kapattım","pasif ast-6","Üst makama taşıdım","koruma insiyatif");
E("aku ab akb","*","Tedarikçi","Emeklilik teklifi","Şehir · Restoran",
"Bir tedarikçi emeklilik sonrası iş teklif ediyor. Karşılığında bugün yalnızca tanışıklığınızı sürdürmeni istiyor.",
"Görüşmeyi sürdürdüm","yolsuz menfaat","Teklifi reddettim","durust mesafe");
E("aku ab akb","*","Kaza İnceleme Heyeti","Bakım kaydı","Birlik · Hangar",
"Kazaya karışan aracın bakım eksiği aylar önce rapor edilmiş. Rapor senin masandan geçmiş ama kaynak ayrılmamış.",
"Kaynak yoktu dedim","yikma loj-5","Payımı kabul ettim","sahiplen dogruluk");
E("aku ab akb","*","Eğitim Şube","Yeni talimname","Karargâh",
"Yeni talimname sahadaki tecrübeyi dikkate almıyor. Yazılı görüş vermek aylar sürecek bir tartışma başlatabilir.",
"Sessiz kaldım","geriplan ihmal","Görüş yazdım","ogrenme direnc");
E("aku ab akb","*","Genç Bölük Komutanı","Kriz","Bölük",
"Genç komutan kritik anda senden karar istiyor. Kararı sen verirsen onu kurtarır ama gelişmesini geciktirirsin.",
"Kararı ben verdim","sahiplen lid-3","Seçenekleri anlattım","mentor lid+5");
E("aku ab akb","*","Eski Silah Arkadaşın","Veda","Telefon",
"Yıllarca birlikte görev yaptığın arkadaşın ağır hasta. Ziyaret, önemli bir denetim hazırlığıyla aynı güne denk geliyor.",
"Denetimde kaldım","gorev ruh-4","Ziyarete gittim","aile destek sic-3");
E("aku ab akb","*","Kuvvet Astsubayı","Kurumsal hafıza","Karargâh",
"Emekliliğe yaklaşırken yılların saha notlarını eğitim arşivine dönüştürmen isteniyor. Aylar sürecek ve adı başkasına yazılabilir.",
"Notları kendime sakladım","menfaat tek-4","Arşivi hazırladım","mentor ogrenme ozveri");
E("aku ab akb","*","Tören Subayı","Son içtima","Tören Alanı",
"Son büyük içtimanda konuşma hakkın var. Personel senden başarı hikâyesi değil, dürüst bir meslek özeti bekliyor.",
"Resmî metni okudum","kural temsil","Bedelleri de anlattım","seffaf mentor");
E("akb","*","Ailen","Emeklilik sabahı","Ev · Mutfak",
"Astsubay Kıdemli Başçavuş olarak son görevin bitti. Sabah yine erkenden uyandın; ilk kez senden emir bekleyen kimse yok.",
"Birliği aradım","gorev ail-3","Sofrada kaldım","aile dinlenme");

