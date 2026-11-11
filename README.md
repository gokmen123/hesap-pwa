# Hesap — 0.2.0

Kişisel para takibi PWA'sı. Kategorilere ayrılmış gelir/gider, her zaman üstte duran toplam bakiye, aylık özet.

- Tamamen statik. Sunucu yok, hesap yok, bulut senkron yok.
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

- `settings` — `theme` (`auto|light|dark`), `seenIntro`, `lastBackupAt`
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

## Güncelleme (ana ekran simgesini silmeden)

Yayın = dosyaları sunucuya yükle + `python ../_tools/surum_yaz.py .` çalıştır.
`version.json` içindeki `build` damgası değişir; uygulama açılışta, öne geldiğinde ve açıkken 60 sn'de bir bu dosyayı ağdan okur, damga değiştiyse kendini yeniler.

Service worker her varlığı **network-first** getirir (6 sn zaman aşımı; ağ yoksa önbellek), bu yüzden içerik güncellemesi için `CACHE_NAME` artırmak zorunlu değil. Uygulamayı ana ekrandan silip yeniden eklemek **gerekmez**.

## Sürüm

`0.2.0`. Uygulama sürümü `js/app.js` içindeki `APP_VERSION`; sürüm damgası `version.json`.
