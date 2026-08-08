"use strict";

/* Faz 5: kararların birkaç kart sonra yeni dosyalar olarak geri dönmesini sağlayan olaylar. */
const CHAIN_LABELS={
  ch_tedarik_denetim_acik:"Tedarik ihalesi denetime açıldı",ch_tedarik_denetim_hizli:"Hızlı tedarik dosyası geri döndü",
  ch_tedarik_son_acik:"Tedarik kurulunun nihai kararı",ch_tedarik_son_hizli:"Eksik teslimat soruşturması",
  ch_kara_sel_emniyet:"Sınır köprüsü sel dosyasında",ch_kara_sel_hiz:"Hızlı açılan köprü yeniden inceleniyor",
  ch_kara_son_emniyet:"Köylülerin teşekkür ziyareti",ch_kara_son_hiz:"Köprü hasarının sorumluluğu",
  ch_deniz_firtina_bakim:"Eski bakım kararı fırtınada sınanıyor",ch_deniz_firtina_gorev:"Ertelenen arıza denizde büyüdü",
  ch_deniz_son_bakim:"Makine dairesi raporu",ch_deniz_son_gorev:"Seyir emniyeti kurulu",
  ch_hava_alarm_rapor:"Sensör ikazı yeni sortide döndü",ch_hava_alarm_sessiz:"Kapatılan ikaz yeniden belirdi",
  ch_hava_son_rapor:"Uçuş emniyeti incelemesi",ch_hava_son_sessiz:"Filo kayıt soruşturması",
  ch_subay_genc_destek:"Yetiştirdiğin subay kritik görevde",ch_subay_genc_mesafe:"Genç subayın dosyası masanda",
  ch_subay_son_destek:"Eski öğrencinin terfi günü",ch_subay_son_mesafe:"Geçmiş sicil itirazı",
  ch_nco_cirak_ogret:"Yetiştirdiğin personel eğitmen oldu",ch_nco_cirak_hiz:"Eksik eğitim sahada ortaya çıktı",
  ch_nco_son_ogret:"Birlik usulü senden sonra yaşıyor",ch_nco_son_hiz:"Eski çırağın disiplin dosyası"
};

const MID_RANKS="tg ut yz bb yb al g1 g2 g3 uo uc ac akc au aku ab";

/* Ortak tedarik zinciri */
E(MID_RANKS,"*","Tedarik Komisyonu","Acil alım kararı","Karargâh · İhale Salonu",
"Görev için kritik sistem altı ay gecikecek. Tek kaynak alımı hız kazandırıyor; açık ihale ise görev takvimini riske atıyor.",
"Açık ihaleyi korudum","seffaf duzen sic-2 +ch_tedarik_basladi @ch_tedarik_denetim_acik:5",
"Tek kaynaktan aldım","iliski kapali loj+4 +ch_tedarik_basladi @ch_tedarik_denetim_hizli:5",{no:"ch_tedarik_basladi,ch_tedarik_bitti",w:2});
E("*","*","Teftiş Kurulu","Geçmiş alım incelemesi","Bakanlık · Denetim",
"Yıllar önce açık ihale uğruna geciken sistemin görev kaybı şimdi önüne kondu. Kurul, kararın sorumluluğunu kimin taşıdığını soruyor.",
"Kararı savundum","dogruluk sahiplen -ch_tedarik_denetim_acik @ch_tedarik_son_acik:4",
"Takvimi kuruma yükledim","yikma sic+4 -ch_tedarik_denetim_acik @ch_tedarik_son_acik:4",{req:"ch_tedarik_denetim_acik",pri:9});
E("*","*","Denetleme Heyeti","Teslimat farkı","Karargâh · Kabul Komisyonu",
"Hızla alınan sistemlerin bir kısmı şartnameyi karşılamıyor. Eski tedarikçinin yöneticisi bugün etkili bir isim.",
"Kabulü durdurdum","direnc dogruluk loj-5 -ch_tedarik_denetim_hizli @ch_tedarik_son_hizli:4",
"Eksikleri sahada kapattım","kapali iliski tek-4 -ch_tedarik_denetim_hizli @ch_tedarik_son_hizli:4",{req:"ch_tedarik_denetim_hizli",pri:9});
E("*","*","Tedarik Kurulu","Nihai karar","Ankara · Kurul Salonu",
"Kurul, şeffaf süreci koruduğunu ancak görev takvimini iyi yönetemediğini yazdı. Karar yıllık siciline bağlanacak.",
"Eleştiriyi kabul ettim","dogruluk ogrenme sic+4 -ch_tedarik_son_acik -ch_tedarik_basladi +ch_tedarik_bitti",
"Karara itiraz ettim","direnc kar+3 sic-3 -ch_tedarik_son_acik -ch_tedarik_basladi +ch_tedarik_bitti",{req:"ch_tedarik_son_acik",pri:9});
E("*","*","Soruşturma Başkanı","Eksik teslimat","Ankara · İnceleme Odası",
"Tek kaynak kararındaki ilişki ağı dosyada görünüyor. Sistemi zamanında yetiştirmiş olman, eksik kabulün sorumluluğunu silmiyor.",
"Bütün kaydı açtım","seffaf sahiplen iti+4 kar-5 -ch_tedarik_son_hizli -ch_tedarik_basladi +ch_tedarik_bitti",
"Üst onayı gösterdim","yikma kapali sic+3 iti-6 -ch_tedarik_son_hizli -ch_tedarik_basladi +ch_tedarik_bitti",{req:"ch_tedarik_son_hizli",pri:9});

/* Kara Kuvvetleri: sınır köprüsü */
E(MID_RANKS,"k","İstihkâm Bölüğü","Sınır köprüsü","Sınır Hattı · Dere Yatağı",
"Köylülerin de kullandığı köprü ağır araç geçişi için güçlendirilmeli. Tam kapatma güvenli; geçici şerit görevi aksatmayacak.",
"Köprüyü kapattım","ihtiyat duzen ope-3 +ch_kara_kopru @ch_kara_sel_emniyet:6",
"Geçici şerit açtım","insiyatif risk ope+4 +ch_kara_kopru @ch_kara_sel_hiz:6",{no:"ch_kara_kopru,ch_kara_bitti",w:2});
E("*","k","Afet Koordinasyon","Ani sel","Sınır İlçesi",
"Tam kapattığın köprü selde ayakta kaldı; ancak karşı yakadaki köye yardım gecikiyor.",
"Askerî geçişi açtım","insiyatif temsil -ch_kara_sel_emniyet @ch_kara_son_emniyet:3",
"Emniyet kontrolünü bekledim","ihtiyat dis+4 iti-3 -ch_kara_sel_emniyet @ch_kara_son_emniyet:3",{req:"ch_kara_sel_emniyet",pri:9});
E("*","k","İstihkâm Kontrol Ekibi","Sel hasarı","Sınır Hattı",
"Geçici şeridin dolgusu çöktü ve bir yardım aracı hasar gördü. İlk karardaki hız baskısı tutanakta senin imzanı taşıyor.",
"Sorumluluğu aldım","sahiplen dogruluk sic-4 -ch_kara_sel_hiz @ch_kara_son_hiz:3",
"Uygulama ekibini suçladım","yikma sic+3 ast-6 -ch_kara_sel_hiz @ch_kara_son_hiz:3",{req:"ch_kara_sel_hiz",pri:9});
E("*","k","İlçe Heyeti","Teşekkür ziyareti","Garnizon",
"Köprü yeniden açıldı. Köylüler yardımı hatırlıyor; üst makam ise sivil temasın görünür olmasını istemiyor.",
"Ekibi öne çıkardım","geriplan sahiplen iti+4 -ch_kara_son_emniyet -ch_kara_kopru +ch_kara_bitti",
"Töreni kabul ettim","gorunur temsil kar+3 -ch_kara_son_emniyet -ch_kara_kopru +ch_kara_bitti",{req:"ch_kara_son_emniyet",pri:9});
E("*","k","Hasar Komisyonu","Sorumluluk kararı","Karargâh",
"Komisyon, geçici şerit kararını görev baskısıyla açıklanabilir buldu; personel hatası savunması ise kabul edilmedi.",
"Karara razı oldum","dogruluk ruh+3 -ch_kara_son_hiz -ch_kara_kopru +ch_kara_bitti",
"Dosyayı üst makama taşıdım","iliski kar+4 iti-3 -ch_kara_son_hiz -ch_kara_kopru +ch_kara_bitti",{req:"ch_kara_son_hiz",pri:9});

/* Deniz Kuvvetleri: ertelenen bakım */
E(MID_RANKS,"d","Başçarkçı","Şaft titreşimi","Seyir · Makine Dairesi",
"Şaft titreşimi limit içinde ama yükseliyor. Limana dönüş görevi kesecek; izleyerek devam etmek planı koruyacak.",
"Bakım için döndüm","ihtiyat duzen ope-4 +ch_deniz_saft @ch_deniz_firtina_bakim:5",
"Seyre devam ettim","gorev risk ope+5 +ch_deniz_saft @ch_deniz_firtina_gorev:5",{no:"ch_deniz_saft,ch_deniz_bitti",w:2});
E("*","d","Gemi Komutanı","Fırtına geçişi","Açık Deniz",
"Erken bakım sayesinde sistem sağlam; fakat yardım çağrısı alan başka bir gemiye ulaşmak için emniyet limitini aşman gerekiyor.",
"Yardıma yöneldim","risk koruma -ch_deniz_firtina_bakim @ch_deniz_son_bakim:3",
"Emniyet rotasında kaldım","ihtiyat dis+3 iti-3 -ch_deniz_firtina_bakim @ch_deniz_son_bakim:3",{req:"ch_deniz_firtina_bakim",pri:9});
E("*","d","Başçarkçı","Büyüyen arıza","Açık Deniz · Makine Dairesi",
"Ertelenen titreşim fırtınada kritik seviyeye çıktı. Görev sürüyor ama ani duruş riski artık gerçek.",
"Görevi kesip döndüm","dogruluk ihtiyat ope-5 -ch_deniz_firtina_gorev @ch_deniz_son_gorev:3",
"Düşük güçle sürdürdüm","risk tek+3 ruh-5 -ch_deniz_firtina_gorev @ch_deniz_son_gorev:3",{req:"ch_deniz_firtina_gorev",pri:9});
E("*","d","Filo Komutanlığı","Makine raporu","Filo Karargâhı",
"İlk bakım kararının gemiyi koruduğu kayda geçti. Son fırtınadaki yardım tercihin ise ayrıca değerlendirilecek.",
"Raporu ekiple paylaştım","sahiplen moral iti+3 -ch_deniz_son_bakim -ch_deniz_saft +ch_deniz_bitti",
"Başarıyı üstlendim","gorunur sic+4 ast-5 -ch_deniz_son_bakim -ch_deniz_saft +ch_deniz_bitti",{req:"ch_deniz_son_bakim",pri:9});
E("*","d","Seyir Emniyeti Kurulu","Görev sonrası","Filo Karargâhı",
"Gemi limana döndü; kayıtlar ilk ikazın ertelendiğini açıkça gösteriyor. Kurul senden son savunmanı istiyor.",
"Kararı açıkça anlattım","seffaf sahiplen iti+3 sic-4 -ch_deniz_son_gorev -ch_deniz_saft +ch_deniz_bitti",
"İkazın belirsizliğini vurguladım","kapali tek+3 iti-5 -ch_deniz_son_gorev -ch_deniz_saft +ch_deniz_bitti",{req:"ch_deniz_son_gorev",pri:9});

/* Hava Kuvvetleri: aralıklı sensör ikazı */
E(MID_RANKS,"h","Uçuş Emniyet Subayı","Aralıklı sensör ikazı","Filo · Brifing Odası",
"İkaz yerde tekrar üretilemiyor. Uçağı bakıma ayırmak sorti planını düşürecek; kaydı açık tutarak uçurmak mümkün.",
"Uçağı ayırdım","ihtiyat dogruluk ope-4 +ch_hava_sensor @ch_hava_alarm_rapor:5",
"İkazı kapattım","kapali gorev ope+5 +ch_hava_sensor @ch_hava_alarm_sessiz:5",{no:"ch_hava_sensor,ch_hava_bitti",w:2});
E("*","h","Filo Harekât","Yeni alarm","Ana Jet Üssü",
"Bakıma ayırdığın uçakta kablo kusuru bulundu. Aynı serideki uçakları durdurmak alarm görevini zayıflatacak.",
"Seriyi kontrol ettirdim","duzen sahiplen -ch_hava_alarm_rapor @ch_hava_son_rapor:3",
"Yalnız uçağı onardım","ihtiyat ope+3 -ch_hava_alarm_rapor @ch_hava_son_rapor:3",{req:"ch_hava_alarm_rapor",pri:9});
E("*","h","Pilot","Havada ikaz","Görev Bölgesi",
"Daha önce kapatılan ikaz havada yeniden belirdi. Pilot görevi sürdürebilir ama dönüşte kayıtların tamamı incelenecek.",
"Hemen dönüş emri verdim","dogruluk ihtiyat ope-5 -ch_hava_alarm_sessiz @ch_hava_son_sessiz:3",
"Görevi tamamlattım","gorev risk ope+5 ruh-4 -ch_hava_alarm_sessiz @ch_hava_son_sessiz:3",{req:"ch_hava_alarm_sessiz",pri:9});
E("*","h","Uçuş Emniyeti","Teknik inceleme","Ana Jet Üssü",
"Seri kontrolü iki yeni kusur daha buldu. Sorti sayısı düştü ama olası bir kazanın önüne geçildi.",
"Bakım ekibini öne çıkardım","sahiplen mentor iti+4 -ch_hava_son_rapor -ch_hava_sensor +ch_hava_bitti",
"Kararı sicile yazdırdım","gorunur sic+4 ast-4 -ch_hava_son_rapor -ch_hava_sensor +ch_hava_bitti",{req:"ch_hava_son_rapor",pri:9});
E("*","h","Filo Kayıt Kurulu","Kapatılan ikaz","Karargâh",
"İlk ikazı neden kapattığın soruluyor. Görev başarısı dosyada; fakat risk değerlendirmesinin yazılı izi yok.",
"Eksikliği kabul ettim","dogruluk sahiplen sic-4 -ch_hava_son_sessiz -ch_hava_sensor +ch_hava_bitti",
"Görev sonucunu savundum","kapali gorunur sic+3 iti-5 -ch_hava_son_sessiz -ch_hava_sensor +ch_hava_bitti",{req:"ch_hava_son_sessiz",pri:9});

/* Subay ve astsubay kariyerlerinin ayrı mentorluk zincirleri */
E("ut yz bb yb al","*","Genç Teğmen","İlk komuta yılı","Bölük · Mesai Sonu",
"Genç teğmen karar vermekte zorlanıyor. Onu her hafta çalıştırmak kendi hazırlık zamanından götürecek.",
"Düzenli mentorluk yaptım","mentor ozveri +ch_subay_mentor @ch_subay_genc_destek:7",
"Kaynakları verip bıraktım","mesafe tek+2 +ch_subay_mentor @ch_subay_genc_mesafe:7",{no:"ch_subay_mentor,ch_subay_bitti",w:2});
E("*","*","Harekât Merkezi","Kritik görev","Müşterek Karargâh",
"Yetiştirdiğin subay riskli görevde inisiyatif aldı. Plan doğru, fakat üst makam yetki aşımı görüyor.",
"Kararının arkasında durdum","sahiplen direnc -ch_subay_genc_destek @ch_subay_son_destek:4",
"Usul hatasını yazdım","kural sic+3 ast-4 -ch_subay_genc_destek @ch_subay_son_destek:4",{req:"ch_subay_genc_destek",pri:9});
E("*","*","Personel Başkanlığı","Olumsuz sicil","Karargâh",
"Yıllar önce kendi hâline bıraktığın subayın dosyası masanda. Gelişemediği gerekçesiyle komuta görevinden alınması isteniyor.",
"Yeni fırsat verdim","mentor sic-3 -ch_subay_genc_mesafe @ch_subay_son_mesafe:4",
"Dosyayı onayladım","mesafe kural sic+3 -ch_subay_genc_mesafe @ch_subay_son_mesafe:4",{req:"ch_subay_genc_mesafe",pri:9});
E("*","*","Eski Teğmenin","Terfi töreni","Karargâh Bahçesi",
"Yıllar önce yetiştirdiğin subay terfi etti. Konuşmasında adını anmak istiyor; tören kurumsal olarak hassas.",
"Ekibini anmasını istedim","geriplan mentor iti+3 -ch_subay_son_destek -ch_subay_mentor +ch_subay_bitti",
"Davetini kabul ettim","gorunur iliski kar+4 -ch_subay_son_destek -ch_subay_mentor +ch_subay_bitti",{req:"ch_subay_son_destek",pri:9});
E("*","*","Sicil İtiraz Kurulu","Geçmiş değerlendirme","Personel Başkanlığı",
"Eski subay, yeterli rehberlik görmeden olumsuz değerlendirildiğini söylüyor. İlk yıllardaki kayıtlar senin imzanı taşıyor.",
"Payımı kabul ettim","sahiplen dogruluk sic-3 -ch_subay_son_mesafe -ch_subay_mentor +ch_subay_bitti",
"Kayıtları savundum","kural kapali iti-3 -ch_subay_son_mesafe -ch_subay_mentor +ch_subay_bitti",{req:"ch_subay_son_mesafe",pri:9});

E("uo uc ac akc au aku ab","*","Yeni Uzman","İlk görev ayı","Tim Odası",
"Yeni personel temel usulleri ezberliyor ama nedenlerini bilmiyor. Baştan öğretmek haftalar sürecek.",
"Uygulamalı öğrettim","mentor ozveri +ch_nco_cirak @ch_nco_cirak_ogret:7",
"Kontrol listesini verdim","tempo tek+3 +ch_nco_cirak @ch_nco_cirak_hiz:7",{no:"ch_nco_cirak,ch_nco_bitti",w:2});
E("*","*","Eğitim Merkezi","Yeni eğitmen","Sınıf Okulu",
"Yetiştirdiğin personel eğitmen oldu ve senin usulünü programa almak istiyor. Yazılı doktrinle bazı farklar var.",
"Usulü belgeledim","ogrenme mentor -ch_nco_cirak_ogret @ch_nco_son_ogret:4",
"Sözlü bırakmasını istedim","kapali tek+3 -ch_nco_cirak_ogret @ch_nco_son_ogret:4",{req:"ch_nco_cirak_ogret",pri:9});
E("*","*","Bölük Astsubayı","Saha hatası","Geçici Üs",
"Hızlı yetiştirdiğin personel kontrol listesinin dışındaki arızada yanlış karar verdi. Olay büyümeden durduruldu.",
"Eğitimi ben tamamladım","sahiplen mentor -ch_nco_cirak_hiz @ch_nco_son_hiz:4",
"Kişisel hata yazdım","yikma kural sic+3 -ch_nco_cirak_hiz @ch_nco_son_hiz:4",{req:"ch_nco_cirak_hiz",pri:9});
E("*","*","Sınıf Okulu","Birlik usulü","Eğitim Salonu",
"Senin geliştirdiğin uygulama artık farklı birliklerde kullanılıyor. İsminin resmî dokümana yazılması önerildi.",
"Ekip adıyla kaydettim","geriplan sahiplen iti+4 -ch_nco_son_ogret -ch_nco_cirak +ch_nco_bitti",
"Kendi adımla kaydettim","gorunur sic+4 ast-3 -ch_nco_son_ogret -ch_nco_cirak +ch_nco_bitti",{req:"ch_nco_son_ogret",pri:9});
E("*","*","Disiplin Kurulu","Eski çırağın dosyası","Birlik Karargâhı",
"Eksik eğitimle başlayan hata alışkanlığa dönüştü. Personel, ilk görevinde yeterli rehberlik görmediğini savunuyor.",
"Sorumluluğu paylaştım","sahiplen dogruluk sic-3 -ch_nco_son_hiz -ch_nco_cirak +ch_nco_bitti",
"Kendi sorumluluğu dedim","yikma sertlik ast-5 -ch_nco_son_hiz -ch_nco_cirak +ch_nco_bitti",{req:"ch_nco_son_hiz",pri:9});

/* Profilin bazı karar seçeneklerini açtığı olaylar. */
E("yz bb yb al g1 g2 g3 ac akc au aku ab","*","Kurul Sekreteri","Kapalı değerlendirme","Karargâh",
"Kurul sonucu önceden şekillendirilmiş görünüyor. Tutanakta itiraz şerhi açtırmak mümkün, fakat herkes susuyor.",
"Şerh koydurdum","direnc seffaf iti+4","Sessizce imzaladım","itaat sic+3",{lreq:"trait_durust",lneed:"Dürüst profil gerekli",w:2});
E("ut yz bb yb al uo uc ac akc au","*","Görev Komutanı","Dar zaman penceresi","Harekât Merkezi",
"Plan güvenli fakat fırsat kapanıyor. Yetki sınırında kalan daha hızlı bir manevra öneriliyor.",
"Planı korudum","ihtiyat dis+3","Manevrayı uyguladım","insiyatif risk ope+5",{rreq:"trait_atilgan",rneed:"Atılgan profil gerekli",w:2});
E("tg ut yz bb uo uc ac akc","*","Personel Subayı","Zor durumdaki ast","Birlik Karargâhı",
"Başarılı bir personelin aile krizi performansını düşürdü. Mevzuat değerlendirme dışı destek için alan bırakıyor.",
"Destek dönemi açtım","koruma mentor sic-2","Standart işlemi uyguladım","kural sic+3",{lreq:"trait_koruyucu",lneed:"Koruyucu profil gerekli",w:2});
E("bb yb al g1 g2 g3 aku ab","*","Personel Başkanı","Kritik atama","Ankara",
"Kariyerinde büyük sıçrama yaratacak görev için resmî listede değilsin. Doğrudan görüşme talep edebilirsin.",
"Listede bekledim","geriplan dis+3","Görüşme istedim","iliski gorunur kar+5",{rreq:"trait_kariyerci",rneed:"Kariyerci profil gerekli",w:2});

/* Her uzmanlık için ek bir derinlik olayı. */
const DEEP_SPECIALTY_EVENTS=[
  ["k","piyade","İleri Karakol","Yerel rehberin verdiği kısa rota mayın kayıtlarıyla çelişiyor.","Kayıtlı rotada kaldım","ihtiyat dis+3","Rehberle ilerledim","risk ope+4"],
  ["k","topcu","Ateş İdare","Yeni yazılımın hedef çözümü eski tabloyla iki mil farklı çıktı.","Atışı durdurdum","dogruluk tek+4 ope-3","Yazılımı esas aldım","risk ope+5 tek-3"],
  ["k","tank","Zırhlı Bölük","Dar geçitte öndeki aracın motor sıcaklığı yükseliyor.","Kol düzenini korudum","koruma loj-3","Aracı geride bıraktım","tempo ope+4 ast-4"],
  ["k","ikmal","Dağıtım Merkezi","Kritik stokun dijital kaydı ile fizikî sayımı uyuşmuyor.","Sevkiyatı durdurdum","duzen dogruluk","Elle dağıtıma geçtim","insiyatif loj-4 ope+3"],
  ["d","guverte","Köprüüstü","Dar kanalda kılavuz kaptan ile harp merkezi farklı rota istiyor.","Kılavuzu izledim","ihtiyat tek+3","Askerî rotayı seçtim","gorev risk ope+4"],
  ["d","makine","Makine Dairesi","Yedek pompanın bakım süresi doldu; ana pompa ise titreşim yapıyor.","Sistemi durdurdum","duzen ope-4","Yükü paylaştırdım","risk tek+4 ruh-3"],
  ["d","deniz_piyadesi","Çıkarma Gemisi","Kıyı keşfi ile son hava raporu farklı çıkarma noktaları gösteriyor.","Yeni keşif istedim","ihtiyat ope-3","İlk plana bağlı kaldım","gorev risk ope+4"],
  ["d","ikmal","Filo İkmal","Yabancı limandaki parça sertifikalı ancak tedarik zinciri kapalı.","Parçayı reddettim","dogruluk loj-4","Kontrollü kabul ettim","insiyatif tek+3"],
  ["h","pilotaj","Filo Brifingi","Görev liderinin hava tahmini, meteoroloji ikazından daha iyimser.","İkazı esas aldım","ihtiyat dis+3","Lider planını izledim","itaat ope+4 ruh-3"],
  ["h","hava_savunma","Komuta Merkezi","Sivil koridordaki iz yalnızca bir sensörde tehdit görünüyor.","Teşhisi sürdürdüm","ihtiyat tek+3","Angajman hazırladım","risk ope+4 ruh-3"],
  ["h","teknik","Bakım Hangarı","Uçuş hattı parçayı bekliyor; test cihazı kalibrasyonu dün doldu.","Testi yeniledim","duzen ope-4","Mevcut ölçümü kullandım","gorev tek-4 sic+3"],
  ["h","lojistik","Hava Ulaştırma","Acil yük uçağın ağırlık merkezini emniyet payının sınırına getiriyor.","Yükü azalttım","ihtiyat loj-3","Tam yük kalktım","risk ope+5 ruh-3"]
];
DEEP_SPECIALTY_EVENTS.forEach(item=>E("*",item[0],item[2],"Uzmanlık Kararı","Görev Alanı",item[3],item[4],item[5],item[6],item[7],{req:"uz_"+item[1],w:2}));
