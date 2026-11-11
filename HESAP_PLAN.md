# Hesap — Yapım Planı

Bu belge, **Hesap** uygulamasını sıfırdan yazmak için yeterlidir. Başka bir açıklama beklenmez. Okuyan asistan (Claude, Windows PC `GOKMEN_LENOVO`) buradaki kapsamın dışına çıkmaz, GitHub'a kullanıcı onayı olmadan hiçbir şey göndermez ve kod yazmaya bu plana sadık kalarak başlar.

**Bugünkü durum (2026-11-11):** **0.2.0 yazıldı ve test edildi.** Kod: `Hesap/hesap-pwa/`. Yayın (GitHub Pages) **yapılmadı** — kullanıcı "yayınla" demeden push edilmez.

---

## 1. Amaç

Hesap, hesap makinesi değil; kişisel para takip uygulamasıdır.

Kullanıcı kategorilere ayırarak (ör. Dükkan çalışması, Ev faturaları, Market, Araba) gelir ve gider girer. Üstte her zaman bir **toplam bakiye** durur; bu bakiye artılı/eksili düzeltilebilir. Her kategorinin kendi adı, rengi, ikonu ve bakiyesi vardır. Veriler telefonda kalır, PC açık olmak zorunda değildir, sunucu yoktur.

Para birimi **TL**. Sayılar Türkçe biçimde: `48.250,00` (binlik ayırıcı nokta, ondalık virgül, her zaman iki basamak).

---

## 2. Platform ve barınma

### 2.1 iOS Safari PWA (şimdi yapılacak iş)

- Tamamen statik bir PWA. Kendi sunucusu **yok**. PC'ye, LAN'a veya evdeki bir makineye **bağımlı değil**.
- Barınma: **GitHub Pages**. Kullanıcı hesabı: `gokmen123`. Önerilen repo adı: `hesap-pwa`. Canlı adres beklentisi: `https://gokmen123.github.io/hesap-pwa/`
- Asistanın kutusunda `gh` oturumu açık olabilir. **PC'deki Claude, kullanıcının açık onayı olmadan `git push` yapmaz, repo oluşturmaz, Pages'i yayınlamaz.** Önce kullanıcıya "yayınlayayım mı?" diye sorar.
- Ana ekrana eklenebilir (manifest + ikonlar, `apple-touch-icon`, `display: standalone`, uygun `theme-color` / `background-color`).
- Çevrimdışı çalışır (service worker).
- Veri telefonda **IndexedDB**'de durur.

### 2.2 Android (şimdi yapılmaz)

Aynı tasarım daha sonra Android Studio ile kurulacak. Bu iş paketine Android kodu, Gradle, emülatör veya APK **dahil değildir.** Kullanıcı ayrıca istemeden başlama.

### 2.3 iOS depolama uyarısı (zorunlu)

Safari sekmesi ile ana ekrana eklenen uygulama **ayrı depolama** kullanır. Birinde girilen hareket diğerinde görünmez. Uygulama Ayarlar'da ve uygun bir ilk açılış notunda bunu açık, kısa Türkçe ile söylemeli; yedek almanın bu yüzden önemli olduğunu belirtmeli. Kullanıcıyı korkutmadan, net yaz.

---

## 3. Referans tasarım (bire bir uy)

Açık tema birincil görünümdür. Kullanıcı ilk koyu taslağı "fazla karanlık / siyah" buldu; açık tema ona göre çizildi. Koyu tema durur, ayarlardan seçilir.

Dosyalar bu planla aynı klasörde:

| Dosya | Ne |
|---|---|
| `acik/ekran1.png` | Ana ekran (açık) |
| `acik/ekran2.png` | Hareket ekle alt sayfası (açık) |
| `acik/ekran3.png` | Kategori detayı — Ev faturaları (açık) |
| `acik/ekran4.png` | Aylık özet (açık) |
| `acik/mockup.html` | Açık temanın etkileşimli maketi (CSS token kaynağı) |
| `ekran1.png` … `ekran4.png` | Aynı dört ekran, koyu tema |
| `mockup.html` | Koyu temanın maketi |
| `fonts/Outfit-VariableFont_wght.ttf` | Arayüz yazısı (yerel dosya, CDN yok) |
| `fonts/InstrumentSerif-Regular.ttf` | Rakamlar (yerel dosya, CDN yok) |

Piksel piksel kopya şart değil; boşluk, tipografi, kart köşeleri, renkler, alt bar ve kahraman bakiyesi makete **yakın** olsun. Maketteki rakamlar örnek veridir, uygulamaya sabit yazılmaz.

### 3.1 Tipografi

- Arayüz: **Outfit** (değişken ağırlık 100–900). Sistem yedeği: `-apple-system, sans-serif`.
- Rakamlar (toplam bakiye, kategori bakiyesi, hareket tutarı, özet rakamları): **Instrument Serif**.
- Fontlar `fonts/` altından `@font-face` ile yüklenir. Google Fonts veya başka CDN **kullanılmaz** (çevrimdışı + veri tasarrufu).

### 3.2 Tasarım token'ları

Açık tema (`acik/mockup.html` `:root`):

```css
--bg: #F5F3EE;            /* sıcak kırık beyaz tuval */
--bg-soft: #FBFAF7;
--card: #FFFFFF;          /* yumuşak gölgeli beyaz kart */
--card-lift: #FFFFFF;
--line: rgba(28, 24, 18, 0.08);
--line-strong: rgba(28, 24, 18, 0.14);
--text: #1C1915;
--text-dim: #6B655C;
--text-faint: #8E877C;
--gold: #0E8F82;          /* birincil: teal (değişken adı maketten) */
--gold-soft: rgba(14, 143, 130, 0.12);
--sage: #0C9A6A;          /* gelir yeşili */
--coral: #E24B42;         /* gider mercanı */
--blue: #3B82E8;
--terra: #E07A3C;
--market: #1AAA78;
--shop: #E0A01A;
--shadow: 0 2px 10px rgba(40, 32, 20, 0.06), 0 1px 2px rgba(40, 32, 20, 0.04);
--shadow-lift: 0 8px 28px rgba(40, 32, 20, 0.08), 0 1px 3px rgba(40, 32, 20, 0.04);
```

Açık temada ek sabitler:

- Marka rozeti: `linear-gradient(160deg, #2AC4B2, #0E8F82)`
- Kaydet / gelir (artı) düğmesi: `linear-gradient(180deg, #2AC4B2, #0E8F82)`, yazı beyaz
- Gider (eksi) tarafı: mercan `#E24B42`, açık mercan zemin
- Kategori kiremitleri (renkli kare ikon, beyaz çizgi):
  - Dükkan çalışması: `#F0B429` (amber)
  - Ev faturaları: `#4C8FF0` (mavi)
  - Market: `#2DB88A` (yeşil)
  - Araba: `#F08A4A` (turuncu)
- Kart köşesi ~18px, kahraman kart ~24px, alt sayfa üst köşe 28px
- Telefon güvenli alan: üst ~52px, alt ~22px, yatay dolgu 20px

Koyu tema (`mockup.html` `:root`) — sıcak mürekkep ve pirinç, düz siyah değil:

```css
--bg: #0E0D0B;
--bg-soft: #141310;
--card: #1C1A16;
--card-lift: #221F19;
--line: rgba(244, 238, 224, 0.08);
--line-strong: rgba(244, 238, 224, 0.14);
--text: #F4EEE0;
--text-dim: #9A9488;
--text-faint: #6E695F;
--gold: #E4C07A;          /* pirinç vurgu */
--gold-soft: rgba(228, 192, 122, 0.16);
--sage: #C5D4B0;
--coral: #E09A86;
--blue: #8AA8C8;
--terra: #D4926A;
--market: #8FBF9F;
--shop: #E4C07A;
```

Koyu temada kategori ikonları düz dolgu değil, düşük opak zemin + vurgu rengi (maketteki gibi). Artı / kaydet düğmesi pirinç gradyan `linear-gradient(180deg, #F0D39A, #D4AE62)`, yazı `#1A1408`.

İnce film tane (noise) makette var; abartma, isteğe bağlı ve çok düşük opaklıkta olabilir. Performansı bozmasın.

### 3.3 Tema davranışı

Ayarlar'da üç seçenek, kullanıcı dilinde:

- **Otomatik** — `prefers-color-scheme` izlenir (varsayılan).
- **Açık**
- **Koyu**

Seçim IndexedDB'de saklanır, anında uygulanır. Sistem teması değişince yalnız Otomatik açıksa arayüz güncellenir.

---

## 4. Ekranlar

Alt gezinme (maket): **Ana Sayfa** | ortadan bölünmüş **+ / −** (FAB) | **Özet**. Ayarlar ana ekrandaki dişli / ikon düğmesinden açılır. FAB her ana akışta görünür (ana sayfa ve özet). Eksi gider, artı gelir ekleme sayfasını açar; tür önceden seçili gelir.

### 4.1 Ana ekran

- Sol üst: marka rozeti + "Hesap"
- Sağ üst: Ayarlar
- Kahraman kart:
  - etiket: "Toplam bakiye"
  - büyük rakam + "TL"
  - sağ üstte küçük **+** ve **−** (bakiye düzeltmesi; kategoriye yazılmaz)
  - alt satır: "Bu ay +9.250,00 TL" gibi ayın net'i ve hareket sayısı
- "Kategoriler" başlığı + "Düzenle" (kategori yönetimi)
- Kategori kartları: renkli ikon, ad, hareket sayısı, o kategorinin bakiyesi (gelir yeşil, gider kırmızı). Karta dokununca kategori detayı açılır.
- "Son hareketler": en yeni birkaç hareket (not veya yoksa kategori adı, kategori · tarih, tutar)
- Boş durum: kategori veya hareket yoksa dürüst, kısa bir metin; sahte veri gösterme

Bakiye düzeltmesi: küçük bir alt sayfa veya diyalog; tutar istenir, isteğe bağlı not. Bu kayıt türü `adjust` olur, bir kategoriye bağlanmaz, toplam bakiyeyi değiştirir, kategori bakiyelerini değiştirmez.

### 4.2 Hareket ekle (alt sayfa / bottom sheet)

Sıra (önce asıl iş, sonra ayrıntı):

1. Tür: **Gider** / **Gelir** (FAB'den gelen ön seçim korunur, değiştirilebilir)
2. Tutar (büyük, odak burada; Türkçe biçim)
3. Kategori (2 sütunlu seçim, mevcut kategoriler)
4. Not (isteğe bağlı)
5. Tarih (varsayılan bugün, değiştirilebilir)

Düğmeler:

- **Kaydet** — kaydeder, sayfayı kapatır, ana ekrana / geldiği yere döner.
- **Kaydet ve devam et** — kaydeder, tutarı ve notu temizler, tür + kategori + tarihi bırakır; peş peşe fatura girmek için. Makette bu düğme yok, **uygulamada zorunlu**. Kaydet'in altında veya yanında, birincil düğmeden daha sakin görünsün.

Doğrulama: tutar > 0 olmalı, kategori seçili olmalı. Hata kısa ve Türkçe.

Düzenleme: mevcut harekete dokununca aynı sayfa dolu açılır; kaydet günceller. Silme burada veya detayda, onaylı.

### 4.3 Kategori detayı

- Geri, kategori adı, "Düzenle" (ad / renk / ikon)
- Büyük ikon, kategori bakiyesi, "N hareket · Ay Yıl"
- Hareketler **tarihe göre gruplu** (ör. "10 Kasım"), yeni tarih üstte
- Satır: not (veya kısa açıklama), isteğe bağlı alt satır, tutar
- Satıra dokun: düzenle / sil
- O kategoride hareket yoksa dürüst boş durum

### 4.4 Kategori yönetimi

Ana ekrandaki "Düzenle" veya ayarlardan:

- Ekle (ad, renk, ikon)
- Yeniden adlandır
- Renk değiştir
- İkon değiştir
- Sil — onay iste. Kategoride hareket varsa kullanıcıya sor: hareketleri de sil veya (yalnızca kullanıcı daha sonra isterse başka bir seçenek öner; şimdilik silme onayında sayıyı göster, onaysız silme). Varsayılanı kendi başına "başka kategoriye taşı" yapma; gerekirse kullanıcıya öner, onaysız ekleme.

Başlangıç kategorileri (maketle aynı, silinebilir / düzenlenebilir):

| Ad | Renk (açık) | İkon fikri |
|---|---|---|
| Dükkan çalışması | `#F0B429` | dükkan / çanta |
| Ev faturaları | `#4C8FF0` | ev / fatura |
| Market | `#2DB88A` | alışveriş / sepet |
| Araba | `#F08A4A` | araba |

İkonlar küçük bir yerleşik kümeden seçilir (SVG, harici ikon paketi şart değil). Yeni kategori eklerken bu kümeden ikon ve hazır renkler sun.

### 4.5 Aylık özet

- Ay seçici (varsayılan içinde bulunulan ay; önceki / sonraki)
- "Bu ay net" büyük rakam
- **Gelir** ve **Gider** çubukları (maketteki gibi yan yana, gerçek oranlar)
- **Gider dağılımı** halka / dilim grafik:
  - Dilime veya yan listedeki kategoriye dokununca o kategorinin, **o ayki** hareketlerinin listesi açılır (kategori detayı, ay filtresiyle veya aynı ayın hareketleri)
  - O ay gider yoksa **sahte 0'lı pasta çizme**. Dürüst boş durum yaz.
- "En büyük giderler" listesi (o ay, tutara göre)

### 4.6 Ayarlar

- Tema: Otomatik / Açık / Koyu
- **Yedek al** — tek JSON dosyası, tek dokunuşla dışa aktarım (Web Share veya dosya indirme; iOS Safari'de çalışacak yol)
- **Yedek yükle** — JSON seç, doğrula, içe aktar. Mevcut verinin üzerine yazacağını açıkça onaylat. Bozuk dosyayı sessizce yeme; hata göster.
- iOS sekme / ana ekran depolama uyarısı (kısa)
- Hakkında: uygulama adı, sürüm rozeti
- Sürüm rozetine dokununca **hata ayıklama paneli** açılır (aşağıda)

---

## 5. Veri modeli

IndexedDB adı önerisi: `hesap-db`. Şema sürümü 1 ile başla.

**Miktarlar tam sayı kuruş olarak saklanır** (1 TL = 100 kuruş). `4825000` = `48.250,00 TL`. Ondalık kayması olmasın. Arayüzde her zaman Türkçe biçim.

### 5.1 `settings` (key-value)

- `theme`: `"auto"` | `"light"` | `"dark"` (varsayılan `"auto"`)
- `schemaVersion`: sayı
- isteğe bağlı: `lastBackupAt`

### 5.2 `categories`

```ts
{
  id: string,          // uuid
  name: string,
  color: string,       // #RRGGBB
  icon: string,        // yerleşik ikon anahtarı
  sortOrder: number,
  createdAt: number,   // epoch ms
  updatedAt: number
}
```

### 5.3 `transactions`

```ts
{
  id: string,
  type: "income" | "expense" | "adjust",
  amount: number,      // kuruş, her zaman pozitif
  categoryId: string | null,  // adjust için null
  note: string,        // boş olabilir
  date: string,        // "YYYY-MM-DD" (yerel takvim günü, UTC kaydırması yapma)
  createdAt: number,
  updatedAt: number
}
```

### 5.4 Bakiye hesabı

- Toplam bakiye = Σ gelir − Σ gider + Σ düzeltme (`adjust`: artı tutar ekler, eksi düzeltme çıkarıyorsa `type: "adjust"` ve işaret için ayrı `direction` veya negatif olmayan tutar + `adjustSign: 1 | -1`). Hangisini seçersen tutarlı uygula; dışa aktarım şemasında açık yaz.
- Kategori bakiyesi = o kategorideki Σ gelir − Σ gider. Düzeltmeler kategoriye girmez.
- "Bu ay" hesapları `date` alanının ayına göre (cihazın yerel günü).

Silinen hareket bakiyeden düşer / eklenir. Düzenleme eski etkiyi geri alıp yenisini uygular. Hesap her zaman kayıtlardan türetilir; ayrı bir "bakiye tablosunu" tek kaynak yapma (kaybolursa sapar). İstersen önbellek tut, ama açılışta kayıtlardan doğrula.

### 5.5 Yazma doğrulaması

Müzik PWA'da iOS IndexedDB'de Blob'ların kaybolduğu görüldü. **Blob saklama.** Düz JSON nesneleri ve gerekirse ArrayBuffer kullan. Her yazmadan sonra okuyarak doğrula (`[DEPO]` log). `navigator.storage.persist()` iste, sonucu logla; Safari sekmesinde `persist: false` olabilir, buna güvenme. Açılışta kayıt sayılarını logla.

### 5.6 Yedek JSON (tek dosya)

Örnek şekil:

```json
{
  "app": "hesap",
  "format": 1,
  "appVersion": "0.1.0",
  "exportedAt": "2026-11-11T08:00:00+03:00",
  "settings": { "theme": "auto" },
  "categories": [],
  "transactions": []
}
```

İçe aktarım: `app === "hesap"` ve tanıdık `format` kontrolü. Turu tamamla: dışa aktar → içe aktar → bakiyeler ve kayıtlar aynı.

---

## 6. Service worker, çevrimdışı, sürüm

Müzik PWA (`gokmen123/muzik-ios-pwa`) ile aynı fikir:

- `CACHE_NAME` örneği: `hesap-pwa-v1` — **her yayında artır**
- `index.html` **önce ağ, ağ yoksa önbellek** (`network-first`). Yeni sürüm hemen görünsün.
- Diğer yerel varlıklar (CSS, JS, font, ikon, manifest): önbellek-önce veya kurulumda `precache`. Fontlar çevrimdışı çalışacak kadar önbellekte olsun.
- Eski önbellek adlarını `activate` içinde sil.
- Uygulama sürümü **0.1.0** ile başlar. Arayüzde (ayarlar / rozet) görünür.
- `manifest.json`: ad "Hesap", `standalone`, ikonlar (en az 180 ve 192/512). `theme-color` açık temaya uygun (ör. `#F5F3EE`).

---

## 7. Hata ayıklama paneli

Müzik PWA'daki gibi: **sürüm rozetine dokununca** açılır.

- Kayıtlar en yeni altta veya üstte, kaydırılabilir
- Düğmeler: **Kopyala**, **Temizle**
- Etiketler: `[DEPO]`, `[NET]`, `[UI]`, `[YEDEK]` (gerekirse)
- Açılışta `[DEPO] açılış` satırı: kategori sayısı, hareket sayısı, persist durumu. Sayılar 0'dan büyükse depo çalışıyor demektir.
- Yazma doğrulama sonucu, içe/dışa aktarım, tema değişimi, ciddi hatalar loglanır
- Üretimde de vardır (gizli tutulmaz, yalnız rozetin arkasındadır)

---

## 8. Dosya yapısı önerisi

Repo kökü (önerilen ad `hesap-pwa`):

```
hesap-pwa/
  index.html
  css/app.css          /* veya stiller index içinde; bölmek serbest */
  js/app.js
  js/db.js
  js/format.js         /* TL / tr-TR */
  sw.js
  manifest.json
  fonts/
    Outfit-VariableFont_wght.ttf
    InstrumentSerif-Regular.ttf
  icons/
    apple-touch-icon.png
    icon-192.png
    icon-512.png
  README.md
  HESAP_PLAN.md        /* bu plan, güncel tut */
```

Bağımlılık olmasın: derleme adımı, npm, framework şart değil. Vanilya HTML/CSS/JS yeterli ve telefon için daha hafif. Kullanıcı istemeden React/Vue vs. ekleme.

Telefon depolaması ve veri kullanımı düşük tutulsun: büyük kütüphane, gereksiz görsel, analitik yok.

---

## 9. Biçim ve dil

- Arayüz dili Türkçe (İ, ğ, ş doğru).
- Tarih: "10 Kasım", "11 Kasım 2026", ay başlığı "Kasım 2026"
- Sayı: `Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })` — `48.250,00`
- Pozitif hareketlerde `+`, negatiflerde `−` (veya `-`), sıfır işaretsiz
- Saat / takvim her zaman cihazın yerel zamanı (Europe/Istanbul beklenir)

---

## 10. Yapılmayacaklar (onaysız ekleme)

Kullanıcı istemedi. Kendi başına ekleme, kısıtlama veya tasarım kararı koyma; önce öner, onay al. Özellikle yok:

- Giriş, hesap, bulut senkron, Google ile oturum
- Face ID / şifre kilidi
- Banka / kart bağlantısı
- Bütçe, limit, "şu kadar harcama" tavanı
- Kalabalık pano, gereksiz grafik, jargon
- Bildirim, abonelik, reklam, analitik
- Çoklu para birimi
- Paylaşılan ev hesabı / çok kullanıcılı yapı
- Android sürümü (ayrı istek gelene kadar)

Hızlı ol. Belirsiz bir ayrıntıda takılırsan makul, dar bir varsayım seç, kullanıcıya söyle; gizli özellik ekleme.

---

## 11. Test kontrol listesi

Yayın öncesi (önce masaüstü Safari / Chrome, sonra mümkünse iPhone; iPhone sonucu kullanıcıdan da gelebilir):

1. Gelir ekle, gider ekle, bakiyeler (toplam + kategori) doğru
2. Hareket düzenle ve sil, bakiyeler güncellenir
3. Bakiye + / − düzeltmesi toplamı değiştirir, kategori bakiyesine dokunmaz
4. "Kaydet ve devam et" tutarı/notu temizler, tür ve kategoriyi bırakır, ikinci kayıt da yazılır
5. Kategori ekle / yeniden adlandır / renk / ikon / sil
6. Ana ekrandan kapatıp **ana ekran uygulamasından** tekrar aç: hareketler duruyor (`[DEPO] açılış` sayısı > 0, ses/veri kaybı yok)
7. Çevrimdışı: uygulama açılır, eski kayıtlar görünür, yeni kayıt yazılır
8. Yedek al → (isteğe bağlı veriyi sil veya başka bağlam) → yedek yükle: tur tamam, bakiyeler aynı
9. Tema: Otomatik / Açık / Koyu anında değişir, seçim kalıcıdır
10. Türkçe sayı ve tarih biçimi doğru (`48.250,00`, ay adları)
11. Özet: dilime dokununca o kategorinin o ayki hareketleri açılır; gider yokken sahte pasta yok
12. Service worker: sürüm artınca (ağ varken) yeni `index.html` gelir
13. Hata ayıklama paneli: rozet, kopyala, temizle çalışır

---

## 12. Sürüm ve yayın kuralı

- İlk sürüm: **0.1.0**
- Her yayında: uygulama sürümünü ve `CACHE_NAME` değerini artır
- **Kullanıcı "yayınla" (veya açık eşdeğeri) demeden `git push` / GitHub Pages yok**
- Repo yoksa oluşturmayı da önce sor
- Yayın sonrası güncel linki kullanıcıya ver (`https://gokmen123.github.io/hesap-pwa/` artı gerekirse `?v=` değil, SW network-first yeterli)

Drive belgesi: her önemli değişiklikten sonra `Projeler/Hesap_Projesi.md` ve `Projeler/Hesap/HESAP_PLAN.md` güncellenir (kullanıcının duran kuralı).

---

## 13. İşin yapılacağı yerler

- Plan + maket + fontlar (bu paket):
  - PC: `C:\Users\Ali Çalışma\Documents\KreaUygulamalari\Hesap\`
  - Kutu kopyası: `/workspace/hesap/`
  - Drive: `Projeler/Hesap/` ve `Projeler/Hesap_Projesi.md`
- Kod: kullanıcı onaylarsa ayrı `hesap-pwa` klasörü / GitHub reposu. Bu paket yalnızca plan ve tasarımdır, uygulama kodu içermez.

Müzik PWA referansı (davranış, SW, debug, IDB dersleri): `https://gokmen123.github.io/muzik-ios-pwa/`, repo `gokmen123/muzik-ios-pwa`. Oradaki şarkı/ses kodunu kopyalama; yalnızca PWA pratikleri.

---

## 14. İlerleme günlüğü

| Tarih | Not |
|---|---|
| 2026-11-11 | Plan ve tasarım hazır, kod yok. Açık tema birincil. Koyu tema duruyor. Yayın yok. |
| 2026-11-11 | **0.1.0 yazıldı** (`hesap-pwa/`, vanilya HTML/CSS/JS, bağımlılık yok). Ana ekran, hareket ekle/düzenle/sil, Kaydet ve devam et, kategori detayı (tarih gruplu), kategori yönetimi (ekle/ad/renk/ikon/sil), aylık özet (net, gelir/gider çubukları, halka dağılım, dilime dokun → o ayın hareketleri, en büyük giderler), ayarlar (tema Otomatik/Açık/Koyu, yedek al/yükle, depolama notu, sürüm rozeti → hata ayıklama paneli). IndexedDB `hesap-db` v1, kuruş tam sayı, her yazmadan sonra okuyarak doğrulama (`[DEPO]`). Service worker network-first index + precache, `hesap-pwa-v1`. manifest + 180/192/512/512-maskable ikon. |
| 2026-11-11 | Chrome (Playwright, 390x844) testleri: gelir/gider ekleme ve bakiyeler, düzenle/sil, bakiye düzeltmesi (kategoriye dokunmuyor), Kaydet ve devam et (tutar+not temizlenir, tür/kategori/tarih kalır, arka ekran güncellenir), kategori ekle/ad değiştir/sil (hareketli kategoride onay + hareketlerle birlikte silme), yedek al/yükle turu (bakiyeler aynı), bozuk JSON reddi, tema anında değişim + kalıcılık, ay gezinme + boş durumda sahte pasta yok, çevrimdışı açılış + çevrimdışı yazma, SW önbelleği (13 varlık), hata ayıklama paneli (kopyala/temizle). Yayın yok. |
| 2026-11-11 | **0.1.1 — dayanıklılık.** `persisted()` önce okunur, izin yoksa yalnızca ana ekran uygulamasında `persist()` istenir (Safari sekmesinde istenmez). Ayarlar'a **Depolama** bölümü: kalıcı depolama durumu (Açık/Kapalı) + kullanım/kota. Ana ekranda yedek hatırlatıcı: hiç yedek yoksa 5+ hareket, varsa 30 gün veya 40+ yeni hareket sonrası tek satır uyarı; dokununca yedek alır. iPhone notu "simgeyi silersen depolama da silinir" ve "iCloud Drive'a kaydet" ile güncellendi. `CACHE_NAME` → `hesap-pwa-v2`. |
| 2026-11-11 | **0.2.0 — ana ekran simgesi silmeden güncelleme.** Service worker baştan yazıldı: her varlık **network-first** (6 sn zaman aşımı, ağ yoksa önbellek). `version.json` sürüm damgası eklendi; uygulama açılışta, öne geldiğinde (visibilitychange/focus) ve açıkken 60 sn'de bir damgayı okur, değiştiyse kendini yeniler (`location.reload`, sessionStorage ile döngü koruması). Yayın = dosyaları yükle + `surum_yaz.py` çalıştır; **simgeyi silip yeniden eklemek gerekmez**. Yedek hedefi seçici (Sor / iCloud / Google Drive) eklendi, dosya adı hedefe göre (`hesap-yedek-icloud-*`, `hesap-yedek-gdrive-*`), Web Share ile ilgili uygulamaya kaydediliyor. `CACHE_NAME` → `hesap-pwa-v3`. |Bundan sonraki satırları sen ekle (ne yaptın, hangi sürüm, yayınlandı mı).

---

## 15. Sorun yaşarsan

Takılır, hata alır veya bu planda çözülmeyen bir şeye denk gelirsen **kullanıcıya sormadan önce veya onun yanında** Grok Bot'a (bu planı yazan asistan) yaz. Grok Bot, kullanıcının sohbetindeki asistanıdır; Çoklu Uzaktan üzerinden ulaşılır.

Bu PC'de, yalnızca yerel uç:

`POST http://127.0.0.1:8772/ai_gonder`

JSON gövde:

- `hedef`: `"grokbot"`
- `kimden`: `"claude"`
- `mesaj`: ne olduğunu anlatan düz metin

PowerShell örneği (göndermeden önce metni kendi durumuna göre doldur):

```powershell
Invoke-RestMethod -Uri http://127.0.0.1:8772/ai_gonder -Method POST -ContentType 'application/json' -Body (@{
  hedef  = 'grokbot'
  kimden = 'claude'
  mesaj  = 'Hesap: <ne oldu>. Hata: <tam metin>. Denediklerim: <adımlar>. Dosya/sürüm: <yol ve 0.x.y>.'
} | ConvertTo-Json)
```

Mesajda şunlar olsun:

1. Ne olduğunu (hangi işte takıldın)
2. Tam hata metni (kısaltma, ekran görüntüsü yetmezse metni yapıştır)
3. Ne denediğin
4. Hangi dosya / hangi sürüm (`0.1.0` vb., ilgili dosya yolu)

Kısa otomatik onaylar (`ok`, `tamam`, `anladım`) gönderme; sistem bunları düşürür. Aynı hedefe en az 5 saniye ara. Ayrıntılı kural: `C:\Users\Ali Çalışma\Documents\KreaUygulamalari\CokluUzaktan\YAPAY_ZEKA_ILETISIM.md`

Uygulama kapalıysa, kutu bulunamazsa veya uç cevap vermezse kullanıcıya kendi sohbetinde "Grok Bot'a yazamadım, şu hata çıktı" de; hedef adını uydurma, başka porta veya dış adrese gönderme.
