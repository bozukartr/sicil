# Sicil — görev günü ve serbest hareket

Ana oynanış artık kart seçerek ilerlemez. Aday sınavı ve uzmanlık seçiminin ardından kışlada bir görev günü başlar. Eski sicil, rütbe ve kariyer kayıtları korunur. Aday ve rütbe geçiş sınavları bu ilk dönüşüm aşamasında mevcut biçimindedir.

## Hareket

- Telefon: oyun alanının sol %70'inde istediğin yere bas ve sürükle. Joystick parmağının altında belirir; uzun sürüklemede merkezi de parmağı takip eder. Küçük hareketlerde ölü bölge, daha uzun hareketlerde analog hız vardır.
- Bırakınca veya dokunma iptal edilince karakter durur. Başka parmak kontrolü devralmaz. İkinci parmakla etkileşim düğmesi kullanılabilir.
- Oyun alanının sağ tarafına dokunarak rota seçebilirsin. **Harita** görünümünde tüm harita dokunarak rota seçimine ayrılır. **Hedefe yürü** düğmesi de kullanılabilir.
- Klavye: WASD / oklar ile yürü, E ile etkileşime gir. Envanterden Escape ile çıkılır. Pencere odağı kaybı, ekran boyutu değişikliği ve dosya/terfi ekranı hareketi durdurur.

## Yedi aşamalı görev günü

1. Koğuş önündeki dolap noktasında üniformanı kuşan.
2. İçtima meydanında birliğe katıl.
3. Karargâhta komutandan görev al.
4. İkmalden telsiz ve saha çantanı teslim al.
5. İşaretli noktalarda sahadaki görevi tamamla.
6. Komutana rapor ver; sicil ve rütbe görev ilerlemesi burada güncellenir.
7. Koğuş noktasında dinlen, yeni güne başla.

Günler sırayla talim parkuru, sandık teslimatı ve çevre devriyesi görevleri verir. Her aşama konum kontrolü gerektirir. Rapor bir kez işlenir; aynı noktaya tekrar basmak ödülü çoğaltmaz. Gün içi saat, tamamlanan aşamalarla ilerler; gerçek zamanlı geri sayım yoktur. Bir rapor mevcut kariyer takvimine bir gün ekler. Rütbe görev eşikleri oyun ölçeğindedir.

## Teçhizat ve enerji

Envanterde üniforma, telsiz, saha çantası ve kumanya görülür. Üniforma kuşanılınca karakterin kıyafeti değişir; ikmal görevinde alınan sandık elde görünür. Yürüyüş ve saha çalışması enerji harcar. Enerji 25'in altına düşerse hareket yavaşlar, fakat karakter kilitlenmez. Günde bir kumanya 25 enerji sağlar. Dinlenme enerjiyi ve kumanyayı yeniler.

Rapor notu kalan enerjiye bağlıdır: 65 + enerjinin %35'i. Görev türüne göre fizik/disiplin, lojistik/mesleki yetkinlik veya harekât/disiplin kazanılır; rapor notu sicil katkısını belirler. Kazanımlar mevcut azalan verim ve terfi değerlendirme kurallarından geçer.

## Kayıt ve kapsam

Konum, gün/aşama, görev kontrol noktası, ekipman, enerji ve kullanılmış kumanya saklanır. Eski bir saha görevi yarım kaldıysa yeni sistem aynı görev ve kontrol noktasından devam eder. Rapor uygulanırken kapanan oyunda terfi eşiği yeniden kontrol edilir; rapor ödülü tekrar verilmez.

Bu aşama mevcut tek kışlada oynanır. Koğuş hazırlığı ve dinlenme bina önündeki etkileşim noktalarıdır; gezilebilir bina içleri, takım yönetimi ve NPC ilişkileri henüz eklenmedi.

## Geliştirme ve doğrulama

Derleme veya yeni bağımlılık yoktur. `python -m http.server 8123` ile proje kökünden açılabilir. `touch-control.js` joystick matematiği, `duty-core.js` görev günü kuralları, `world.js` tarayıcı etkileşimlerini içerir.

`node --test tests/*.test.cjs` — hareket, çoklu pointer, iptal/odak kaybı, görev akışı, ödül tekrarı, kayıt taşıma ve terfi sınırı regresyonlarını çalıştırır. Testler DOM taklidi kullanır. Gerçek iOS pointer capture ve responsive yerleşim testi değildir. Çalışma ortamının yerel tarayıcı önizleme kısıtı nedeniyle gerçek cihaz görsel/dokunma QA tamamlanmadı.
