# Kışla keşfi

Sicil artık kariyer kararlarını yürünebilir bir 2D kışlada sunar. Aday sınavı ve uzmanlık seçiminin ardından ana ekran kışlaya geçer. Altın işaret, sıradaki kariyer olayıyla görüşülecek kişiyi gösterir. Yaklaşınca görüşme açılır; verilen karar mevcut kariyer, terfi, zincirleme olay ve kayıt sisteminde işlenir.

## Kontroller

- Telefon: sol yön çubuğunu sürükle veya haritada yürünebilir bir noktaya dokun. Yakında **Konuş / Tamamla** düğmesini kullan.
- Klavye: **WASD / oklar** ile yürü, **E** ile etkileşime gir. Görüşmede sol/sağ ok karar verir; **Escape** görüşmeyi karar vermeden kapatır.
- **Hedefe yürü** rota çizer ve karakteri yürütür; binalar geçilmez. Hareket kontrolü rotayı iptal eder.
- **Harita** tüm yerleşkeyi gösterir. Görev işareti, NPC etiketleri ve uzaklık hedefi bulmayı kolaylaştırır.

## Saha görevleri

Eğitmenin yanında talim parkuru, ikmal sorumlusunun yanında sandık teslimatı, nöbetçinin yanında çevre devriyesi başlatılabilir. Mavi işaret sıradaki kontrol noktasıdır; noktaya ulaşıp etkileşim düğmesine basmak gerekir. Sandık alındığında karakter onu taşır.

Her ana karar döneminde bir saha görevi alınabilir. Tamamlanan talim fizik/disiplin, teslimat lojistik/mesleki yetkinlik, devriye harekât/disiplin kazandırır. Bu küçük kazanımlar gerçek değerlendirme değerlerini etkiler; rütbe görev sayacı ana kariyer kararlarıyla ilerler. Görevi bırakmak o dönemin hakkını harcar. Konum, yarım kalan görev ve kullanılan hak mevcut kayda eklenir; eski kayıtlarda varsayılan başlangıç noktası kullanılır.

## Geliştirme ve doğrulama

Bağımlılık veya derleme gerektirmez. Proje kökünde `python -m http.server 8123` ile açılabilir. Harita ve karakter çizimleri `world-art.js`, çarpışma/rota/görev kuralları `world-core.js`, tarayıcı etkileşimleri `world.js`, görünüm `world.css` içindedir.

`node --test tests/*.test.cjs` kariyer regresyonlarını, hedeflerin ulaşılabilirliğini, hareket/karar ayrımını, tek ödül kuralını ve görev kayıtlarını kontrol eder. Testler DOM taklidi kullanır; gerçek cihazın yerleşimini veya pointer capture davranışını doğrulamaz.

Bu sürümde harita çizimi SVG olarak rasterleştirilip görsel incelendi. Çalışma ortamının tarayıcı URL politikası yerel önizlemeye izin vermediğinden gerçek tarayıcı / iOS dokunma QA tamamlanmadı. Cihazda kontrol: yeni kariyer ve eski kayıttan devam, haritada gezinme, çubuk bırakma/iptal, görev alma-tamamlama, görüşmeden çıkma, terfi ve yatay ekran.
