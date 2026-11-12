# Hesap — 0.3.8

Kişisel para takibi PWA'sı. Kategorilere ayrılmış gelir/gider, her zaman üstte duran toplam bakiye, aylık özet.

- Tamamen statik. Kendi sunucusu yok. İsteğe bağlı **Google Drive yedeği**: her kullanıcı kendi Google hesabıyla bağlanır, yedek kendi Drive'ına gider (aşağıda).
- Veriler cihazda **IndexedDB** içinde kalır (`hesap-db`, şema 1).
- Çevrimdışı çalışır (service worker).
- iOS Safari: Paylaş → **Ana Ekrana Ekle** ile uygulama gibi açılır.
- Yayın: GitHub Pages (`gokmen123/hesap-pwa`) — **kullanıcı "yayınla" demeden push edilmez**.

## Geliştirme

Derleme adımı yok. Klasörü herhangi bir statik sunucuyla aç:

```bash
python -m http.server 8811 --bind 127.0.0.1
```

Sonra `http://127.0.0.1:8811/index.html`.

Service worker yalnızca `http(s)` üzerinde çalışır (`file://` üzerinde kayıt olmaz).

## Dosyalar

```
index.html            kabuk, tüm görünüm kapları
css/app.css           token'lar + tüm stiller (açık/koyu tema)
js/format.js          TL / tr-TR biçim, tarih, tutar girişi
js/db.js              IndexedDB katmanı, yazma doğrulama, [DEPO] log
js/config.js          GOOGLE_CLIENT_ID (herkese açık OAuth Web istemci kimliği; boşsa Drive kapalı)
js/sync.js            Google girişi + Drive v3 eşitleme, [DRIVE] log
js/app.js             görünümler, formlar, yedek, hata ayıklama
sw.js                 network-first index, cache-first varlıklar
manifest.json         standalone, 180/192/512 ikonlar
fonts/                Outfit (arayüz), Instrument Serif (rakamlar)
icons/                apple-touch-icon, 192, 512, 512-maskable
HESAP_PLAN.md         yapım planı (güncel tutulur)
```

Bağımlılık yok: npm, framework, CDN, analitik yok.

## Veri modeli (kısa)

Miktarlar **tam sayı kuruş** (`4825000` = `48.250,00 TL`).

- `settings` — `theme` (`auto|light|dark`), `seenIntro`, `lastBackupAt`, `drive` (`{connected, email, name, auto}`), `driveToken` (`{access, exp}`, ~1 saat), `driveState` (`{rev, hash, syncedAt, remoteUpdatedAt, fileId, folderId, archiveId, lastArchiveAt}`), `driveWelcomeSeen`, `safetyCopies` (son 3 yerel kopya)
- `categories` — `id, name, color, icon, sortOrder, createdAt, updatedAt`
- `transactions` — `id, type(income|expense|adjust), amount, categoryId, note, date("YYYY-MM-DD"), createdAt, updatedAt`, `adjust` için `adjustSign: 1 | -1`

Toplam bakiye her açılışta kayıtlardan türetilir, ayrı bakiye tablosu yok.
`adjust` kategoriye bağlanmaz, yalnızca toplamı değiştirir.

## Depolama dayanıklılığı

- Açılışta `navigator.storage.persisted()` okunur; izin yoksa **yalnızca ana ekran uygulamasında** `persist()` istenir (iOS'ta soru sormaz, ana ekran uygulamasına verme eğilimindedir). Safari sekmesinde istenmez.
- Ayarlar → **Depolama**: kalıcı depolama durumu (Açık / Kapalı) ve kullanım / kota.
- Ana ekranda **yedek hatırlatıcı**: hiç yedek yoksa 5+ hareket sonrası, varsa 30 gün veya 40+ yeni hareket sonrası tek satır uyarı.
- iOS ana ekran uygulamaları Safari'nin 7 günlük silme kuralından muaftır; kalıcı depolama da kota/sistem baskısı silmelerine karşı muafiyet sağlar. Simgeyi silmek veya Ayarlar'dan site verisini silmek yine de veriyi götürür — bu yüzden cihaz dışı yedek şart.

## Yedek

Ayarlar → **Yedek al** tek JSON dosyası üretir (Web Share, desteklenmiyorsa indirme). Yedek hedefi Ayarlar'dan seçilir: **Sor** (her yedekte sorar), **iCloud** veya **Google Drive**. iPhone'da paylaşım sayfasında ilgili uygulama seçilirse kopya cihaz dışında kalır; dosya adı hedefe göre `hesap-yedek-icloud-…` / `hesap-yedek-gdrive-…` olur.
**Yedek yükle** dosyayı doğrular (`app: "hesap"`, `format`, diziler), üzerine yazmadan önce onay ister, bozuk dosyada hata gösterir.

> iPhone notu: Safari sekmesi ile ana ekrana eklenen uygulama ayrı depolama kullanır. Birinde girilen hareket diğerinde görünmez. Bu yüzden yedek önemli.

## Drive yedeği (0.3.8)

Telefondaki IndexedDB her zaman asıl kopyadır; yazmalar önce telefona gider, uygulama çevrimdışı tam çalışır. 0.3.2'den itibaren internet varken açılışta Drive'dan otomatik çekilir, değişiklikler sormadan geri gönderir (otomatik eşitleme varsayılan açık). 0.3.7: kapsam yalnızca `drive.file`. Uygulama dosyası `Hesap/hesap_veri.json` (uygulamanın oluşturduğu). İlk açılışta eski `hesap_yedek.json` hâlâ görünüyorsa içeriği yeni dosyaya kopyalanır, eski dosyaya dokunulmaz; görünmüyorsa yerel IndexedDB yüklenir. Yeni/boş Drive hata vermez. Jeton süresi bitince sessiz yenileme + kuyruk; geçici ağ/5xx yeniden denenir; eşzamanlı gönderimler kilitlenir; durum küçük bir noktayla gösterilir, uyarı yalnızca yeniden giriş gerektiğinde çıkar. Silinen kayıtlar tombstone olarak kalır. 0.3.5: yıllık özet, kategori çipleri, hatırlatmalar, kategori yönetimi. 0.3.6: canlı gider dağılımı renkleri, kaydırarak Sil, hatırlatma klavyesi. 0.3.7 ayrıca: hatırlatmaya dokununca Ödendi/Alındı – hesaba işle, Tamamlandı (işlemeden) veya Vazgeç. 0.3.8: hatırlatma kaydedilince takvim dosyası (.ics) aynı dokunuşta açılır (UID sabit, aylıkta RRULE, 1 gün önce ve gününde 09:00 alarm). Tümünü takvime ekle. Silme/tamamlamada METHOD:CANCEL (aylık tamamlamada seri iptal edilmez). Çakışmada kayıtlar id + updatedAt ile birleştirilir. **Her kullanıcı kendi Google hesabıyla bağlanır.**

- **Yapılandırma:** `js/config.js` → `GOOGLE_CLIENT_ID` (Google Cloud OAuth 2.0 *Web* istemci kimliği; gizli değil). Boşsa Drive özelliği tamamen kapalıdır, hiçbir istek atılmaz, eski ilk açılış notu gösterilir. Kurulum adımları: repo dışında `GOOGLE_KURULUM.md`.
- **Kapsam:** `https://www.googleapis.com/auth/drive.file` — hassas olmayan kapsam (doğrulama gerekmez); uygulama yalnızca kendi oluşturduğu dosyaları görür. `drive.appdata` yerine seçildi çünkü kullanıcı yedeği Drive'ında görebilmeli (gizli klasör değil).
- **Giriş:** OAuth 2.0 istemci tarafı akışı (`response_type=token`), **tam sayfa yönlendirme**, dönüş adresi uygulamanın kendisi (`https://gokmen123.github.io/hesap-pwa/`). iOS ana ekran (standalone) PWA'sında açılır pencere ve GIS popup güvenilir dönmediği için popup kullanılmaz. `state` doğrulanır, belirteç adres çubuğundan hemen silinir (`history.replaceState`).
- **Belirteç ~1 saat.** Süresi dolunca: açılışta / internet gelince / gönderilecek değişiklik varken, ekranda açık sayfa yoksa **sessiz yönlendirme** (`prompt=none`, `login_hint=<e-posta>`, en fazla 10 dk'da bir). Sessiz olmazsa ana ekranda **"Drive'a yeniden bağlan"** şeridi ve Ayarlar'da düğme. E-posta Drive `about` uç noktasından alınır (ek kapsam yok).
- **İlk açılış:** "Kayıtların güvende kalsın" karşılama sayfası — **Google ile bağlan** / **Şimdilik geç** (bir daha sormaz; Ayarlar'dan bağlanılır).
- **Drive REST (v3):** klasör `Hesap` (+ `Hesap/eski`), dosya `hesap_veri.json` (multipart yükleme). Eski `hesap_yedek.json` varsa yalnızca okunup yeni dosyaya kopyalanır, üzerine yazılmaz. Özet bilgiler `appProperties` içinde (`rev, hash, at, device, tx, bal, last`) → kontrol için dosyayı indirmeye gerek yok. Yazmadan hemen önce Drive `rev` tekrar okunur (iyimser kilit; uyuşmazsa çakışma). Üzerine yazmadan önce eski sürüm sunucu tarafında `Hesap/eski/` klasörüne kopyalanır (saatte en fazla bir; çakışmada "Telefondakini gönder" ile her zaman). Hiçbir dosya silinmez.
- **Karar mantığı** (açılışta, internet gelince, uygulama öne gelince — en az 45 sn arayla): yerel veri karması (SHA-256) son eşitlenen karma ile, Drive `rev` son eşitlenen `rev` ile karşılaştırılır.
  - yalnızca telefon değişti → **"Drive'a yedek alayım mı?"** (Otomatik yedekle açıksa sormadan)
  - yalnızca Drive değişti → **"Drive'da yeni veri var"**, güncelleyeyim mi?
  - ikisi de → **çakışma** sayfası (iki tarafın bakiye/hareket/tarih özeti): *Drive'dakini al* / *Telefondakini gönder* / *Sonra*
  - Drive boş, telefonda veri var → ilk yedek sorusu; hiç eşitlenmemiş + telefon boş → Drive'dan çekme sorusu.
  - *Sonra* → aynı durum tekrar sorulmaz; ana ekranda tek satır şerit kalır.
- **Güvenlik kopyası:** Drive'dan çekmeden önce telefondaki veri saklanır (son 3); Ayarlar → Drive yedeği → **Güvenlik kopyaları**.
- Ayarlar → Drive yedeği: durum, son eşitleme, **Şimdi yedekle**, **Drive'dan çek**, **Kontrol et**, **Otomatik yedekle**, **Güvenlik kopyaları**, Google hesabı (ad + e-posta), **Drive'da göster**, **Kaldır** (belirteci iptal eder, yalnızca bağlantıyı unutur; veriye dokunmaz).

## Güncelleme (ana ekran simgesini silmeden)

Yayın = dosyaları sunucuya yükle + `python ../_tools/surum_yaz.py .` çalıştır.
`version.json` içindeki `build` damgası değişir; uygulama açılışta, öne geldiğinde ve açıkken 60 sn'de bir bu dosyayı ağdan okur, damga değiştiyse kendini yeniler.

Service worker her varlığı **network-first** getirir (6 sn zaman aşımı; ağ yoksa önbellek), bu yüzden içerik güncellemesi için `CACHE_NAME` artırmak zorunlu değil. Uygulamayı ana ekrandan silip yeniden eklemek **gerekmez**.

## Sürüm

`0.3.8`. Uygulama sürümü `js/app.js` içindeki `APP_VERSION`; sürüm damgası `version.json`.
