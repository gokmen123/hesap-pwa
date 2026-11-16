/* Hesap — genel_test (genel regresyon testi)
   Çalıştırma:  cd tests && npm install && npx playwright install chromium && node genel_test.js
   - Uygulama yerel bir HTTP sunucusundan, başsız Chromium'da, BOŞ ve geçici bir profille açılır.
   - js/config.js testte boş GOOGLE_CLIENT_ID ile değiştirilir: Drive/Takvim tamamen kapalı.
     Google'a giden her istek engellenir ve test başarısız sayılır. Gerçek veriye dokunulmaz.
   - Bu klasör index.html veya sw.js tarafından yüklenmez/önbelleğe alınmaz. */
"use strict";
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const ROOT = path.resolve(__dirname, "..");
const MIME = { ".js": "text/javascript", ".css": "text/css", ".html": "text/html", ".json": "application/json",
  ".png": "image/png", ".ttf": "font/ttf", ".svg": "image/svg+xml" };

let passed = 0, failed = 0;
const fails = [];
function ok(cond, name, extra) {
  if (cond) { passed++; console.log("  ✓ " + name); }
  else { failed++; fails.push(name); console.log("  ✗ " + name + (extra !== undefined ? "  → " + JSON.stringify(extra) : "")); }
}
function eq(a, b, name) { ok(JSON.stringify(a) === JSON.stringify(b), name, { beklenen: b, gelen: a }); }

function startServer() {
  return new Promise(res => {
    const srv = http.createServer((q, r) => {
      let p = path.join(ROOT, decodeURIComponent(q.url.split("?")[0]));
      if (!p.startsWith(ROOT)) { r.writeHead(403); return r.end(); }
      if (p.endsWith(path.sep) || p === ROOT) p = path.join(p, "index.html");
      fs.readFile(p, (e, d) => {
        if (e) { r.writeHead(404); return r.end(); }
        r.writeHead(200, { "content-type": MIME[path.extname(p)] || "application/octet-stream", "cache-control": "no-store" });
        r.end(d);
      });
    });
    srv.listen(0, "127.0.0.1", () => res(srv));
  });
}

async function main() {
  const srv = await startServer();
  const BASE = "http://127.0.0.1:" + srv.address().port + "/";
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: "block", locale: "tr-TR" });
  const googleHits = [];
  await ctx.route("**/js/config.js", r => r.fulfill({ contentType: "text/javascript",
    body: 'window.HESAP_CONFIG={GOOGLE_CLIENT_ID:"",DRIVE_SCOPE:"",CALENDAR_SCOPE:"",CALENDAR_APP_SCOPE:""};' }));
  await ctx.route(/google|gstatic/, r => { googleHits.push(r.request().url()); return r.abort(); });
  const p = await ctx.newPage();
  p.setDefaultTimeout(8000);
  const pageErrors = [];
  p.on("pageerror", e => pageErrors.push(e.message));

  const W = ms => p.waitForTimeout(ms);
  const S = () => p.evaluate(() => {
    const s = HesapDebug.state();
    return { cats: s.categories.slice().sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0)).map(c => ({ id: c.id, name: c.name, kind: c.kind })),
      txs: s.transactions.map(t => ({ id: t.id, type: t.type, amount: t.amount, categoryId: t.categoryId, note: t.note })) };
  });
  const heroText = () => p.textContent("#view-home .hero-amount .num");
  const fabs = () => p.$$eval("#view-cat .cat-fab", els => els.map(e => e.getAttribute("data-type") + (e.offsetParent ? "" : ":gizli")));
  async function openApp() {
    await p.goto(BASE + "index.html"); await W(1200);
    if (await p.$("#dialog.show")) { await p.click("#dlg-ok"); await W(350); }
  }
  async function goHome() { await p.evaluate(() => { const b = document.querySelector('[data-go="home"]'); b && b.click(); }); await W(300); }
  async function addCategory(name, kind) {
    await goHome();
    await p.click("#btn-new-cat"); await W(450);
    await p.fill("#cat-name", name);
    if (kind) await p.click('#sheet [data-kind="' + kind + '"]');
    await p.click('#sheet [data-act="saveCat"]'); await W(700);
  }
  async function openCat(name) { await goHome(); await p.click('#view-home .cat:has(.cat-name:text-is("' + name + '"))'); await W(400); }
  async function saveAmount(amount, note) {
    await p.fill("#amount-input", amount);
    if (note !== undefined && await p.$("#note-input")) await p.fill("#note-input", note);
    await p.click('#sheet [data-act="save"]'); await W(700);
  }
  async function closeOverlays() {
    await p.evaluate(() => { if (document.querySelector("#dialog.show")) document.getElementById("dlg-cancel").click(); }); await W(300);
    await p.evaluate(() => { const b = document.querySelector("#backdrop.show"); if (b) b.click(); }); await W(350);
  }

  try {
    console.log("\n# 1. Sürüm tutarlılığı");
    const ver = JSON.parse(fs.readFileSync(path.join(ROOT, "version.json"), "utf8"));
    const appJs = fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8");
    const swJs = fs.readFileSync(path.join(ROOT, "sw.js"), "utf8");
    const indexHtml = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
    const readme = fs.readFileSync(path.join(ROOT, "README.md"), "utf8");
    const appVer = (appJs.match(/APP_VERSION\s*=\s*"([^"]+)"/) || [])[1];
    ok(/^\d+\.\d+\.\d+$/.test(ver.version), "version.json sürümü x.y.z biçiminde", ver.version);
    ok(/^\d{8}-\d{6}$/.test(String(ver.build)), "version.json build damgası YYYYAAGG-SSDDss", ver.build);
    eq(appVer, ver.version, "js/app.js APP_VERSION = version.json");
    ok(readme.split("\n")[0].includes(ver.version), "README başlığındaki sürüm güncel", readme.split("\n")[0]);
    ok(/CACHE_NAME\s*=\s*"hesap-pwa-v\d+"/.test(swJs), "sw.js CACHE_NAME tanımlı");
    ok(!/tests\//.test(indexHtml) && !/tests\//.test(swJs), "index.html ve sw.js test klasörüne başvurmuyor");
    ok(fs.readFileSync(path.join(ROOT, "js/sync.js"), "utf8").includes('FILE_NAME = "hesap_veri.json"'), "Drive dosya adı değişmemiş (hesap_veri.json)");

    console.log("\n# 2. Açılış");
    await openApp();
    let st = await S();
    eq(st.cats.map(c => c.name), ["Dükkan çalışması", "Ev faturaları", "Market", "Araba"], "boş profilde 4 başlangıç kategorisi");
    eq(st.txs.length, 0, "başlangıçta hareket yok");
    eq(await p.evaluate(() => HesapDebug.version), ver.version, "çalışan uygulama sürümü = version.json");

    console.log("\n# 3. Kategoriler (yeni kategoride Gelir/Gider butonları)");
    await openCat("Market");
    const eskiFabs = await fabs();
    eq(eskiFabs, ["expense", "income"], "mevcut kategoride Gider + Gelir butonu var");
    await addCategory("Test Yeni");
    st = await S();
    ok(st.cats.some(c => c.name === "Test Yeni"), "yeni kategori kaydedildi");
    ok(await p.isVisible('#view-home .cat:has(.cat-name:text-is("Test Yeni"))'), "yeni kategori ana ekranda görünüyor");
    await openCat("Test Yeni");
    eq(await fabs(), eskiFabs, "YENİ kategoride de Gider + Gelir butonları var (mevcutla aynı)");
    await addCategory("Sadece Gelir", "income");
    await openCat("Sadece Gelir");
    eq(await fabs(), ["income"], "Tür=Gelir kategoride yalnızca Gelir butonu");
    await addCategory("Sadece Gider", "expense");
    await openCat("Sadece Gider");
    eq(await fabs(), ["expense"], "Tür=Gider kategoride yalnızca Gider butonu");
    await p.click('#view-cat [data-act="editCat"]'); await W(450);
    await p.click('#sheet [data-kind="both"]'); await p.click('#sheet [data-act="saveCat"]'); await W(700);
    await openCat("Sadece Gider");
    eq(await fabs(), ["expense", "income"], "Tür İkisi yapılınca iki buton da geliyor");
    await p.evaluate(() => document.querySelector('[data-act="settings"]').click()); await W(300);
    await p.click('#view-settings [data-act="manage"]'); await W(300);
    await p.click('#view-manage [data-act="newCat"]'); await W(450);
    await p.fill("#cat-name", "Yönetimden"); await p.click('#sheet [data-act="saveCat"]'); await W(700);
    await openCat("Yönetimden");
    eq(await fabs(), ["expense", "income"], "Kategori yönetiminden eklenen kategoride de iki buton var");

    console.log("\n# 4. Gelir / gider hareketleri ve bakiyeler");
    await openCat("Test Yeni");
    await p.click('#view-cat .cat-fab[data-type="expense"]'); await W(450);
    await saveAmount("100", "test gider");
    await p.click('#view-cat .cat-fab[data-type="income"]'); await W(450);
    await saveAmount("250,50", "test gelir");
    st = await S();
    const yeniId = st.cats.find(c => c.name === "Test Yeni").id;
    const yeniTx = st.txs.filter(t => t.categoryId === yeniId);
    eq(yeniTx.map(t => t.type + ":" + t.amount).sort(), ["expense:10000", "income:25050"], "yeni kategoriye gider 100 + gelir 250,50 (kuruş) eklendi");
    ok((await p.textContent("#cat-balance")).includes("150,50"), "kategori bakiyesi +150,50", await p.textContent("#cat-balance"));
    await goHome();
    await p.click("#fab-minus"); await W(450);
    await p.click('#cat-chips [data-pick]:has-text("Market")'); await saveAmount("40");
    await p.click("#fab-plus"); await W(450);
    await p.click('#cat-chips [data-pick]:has-text("Test Yeni")'); await saveAmount("9,50");
    st = await S();
    eq(st.txs.length, 4, "4 hareket var");
    ok((await heroText()).includes("120,00"), "toplam bakiye 120,00 (250,50 − 100 − 40 + 9,50)", await heroText());
    await goHome();
    await p.click("#fab-minus"); await W(450);
    await p.fill("#amount-input", "5");
    await p.click('#sheet [data-act="save"]'); await W(400);
    ok((await p.textContent("#form-error")).length > 0, "kategori seçilmeden kayıt engelleniyor");
    await closeOverlays();
    st = await S(); eq(st.txs.length, 4, "hatalı kayıt eklenmedi");

    console.log("\n# 5. Bakiye düzeltme");
    await goHome();
    await p.click('#view-home [data-act="adjust"][data-sign="1"]'); await W(450);
    await saveAmount("30");
    ok((await heroText()).includes("150,00"), "bakiye +30 düzeltme → 150,00", await heroText());
    st = await S(); ok(st.txs.some(t => t.type === "adjust" && t.categoryId === null), "düzeltme kategorisiz 'adjust' kaydı");

    console.log("\n# 6. Hareket düzenle / sil");
    await openCat("Test Yeni");
    await p.click('#view-cat [data-tx]:has-text("test gider")'); await W(450);
    await saveAmount("110");
    st = await S(); eq(st.txs.find(t => t.note === "test gider").amount, 11000, "hareket düzenlendi (110)");
    await p.click('#view-cat [data-tx]:has-text("test gider")'); await W(450);
    await p.click('#sheet [data-act="dedit"]'); await W(350); await p.click("#dlg-ok"); await W(700);
    st = await S(); ok(!st.txs.some(t => t.note === "test gider"), "hareket silindi");
    await goHome();
    ok((await heroText()).includes("250,00"), "silme sonrası bakiye 250,00", await heroText());

    console.log("\n# 7. Kalıcılık (yeniden açılış)");
    const once = await S();
    await openApp();
    const sonra = await S();
    eq(sonra, once, "yeniden açılışta kategoriler ve hareketler aynen yüklendi");
    ok((await heroText()).includes("250,00"), "yeniden açılışta bakiye aynı");
    await openCat("Test Yeni");
    eq(await fabs(), ["expense", "income"], "yeniden açılışta yeni kategoride butonlar duruyor");

    console.log("\n# 8. Kategori silme (tombstone, veri kaybı yok)");
    await openCat("Yönetimden");
    await p.click('#view-cat [data-act="editCat"]'); await W(450);
    await p.click('#sheet [data-act="delCat"]'); await W(350); await p.click("#dlg-ok"); await W(800);
    st = await S(); ok(!st.cats.some(c => c.name === "Yönetimden"), "boş kategori silindi");
    let dump = await p.evaluate(() => HesapDebug.dump());
    ok(dump.categories.some(c => c.name === "Yönetimden" && c.deleted === true), "silinen kategori yedekte tombstone olarak duruyor (eşitlemede geri gelmez)");

    console.log("\n# 9. Yedek al / yükle");
    dump = await p.evaluate(() => HesapDebug.dump());
    eq([dump.app, dump.format, dump.appVersion], ["hesap", 1, ver.version], "yedek başlığı (app, format, sürüm)");
    ok(dump.categories.every(c => ["both", "income", "expense"].includes(c.kind)), "yedekte her kategorinin türü var");
    eq(dump.transactions.filter(t => !t.deleted).length, sonra.txs.length, "yedekte tüm hareketler var");
    // eski biçim (kind alanı olmayan) yedek: geriye dönük uyum
    const eski = { app: "hesap", format: 1, categories: [
        { id: "eski-1", name: "Eski Kategori", color: "#4C8FF0", icon: "home", sortOrder: 0, createdAt: 1, updatedAt: 1 }],
      transactions: [{ id: "eski-t1", type: "income", amount: 5000, categoryId: "eski-1", note: "eski", date: "2026-11-01", createdAt: 1, updatedAt: 1 }] };
    async function restore(obj) {
      await p.evaluate(() => document.querySelector('[data-act="settings"]').click()); await W(300);
      const [fc] = await Promise.all([p.waitForEvent("filechooser"), p.click('#view-settings [data-act="restore"]')]);
      await fc.setFiles({ name: "yedek.json", mimeType: "application/json", buffer: Buffer.from(typeof obj === "string" ? obj : JSON.stringify(obj)) });
      await W(600);
    }
    await restore(eski);
    ok(!!(await p.$("#dialog.show")), "yedek yüklemeden önce onay soruluyor");
    await p.click("#dlg-cancel"); await W(400);
    st = await S(); eq(st.txs.length, sonra.txs.length, "Vazgeç'te veri değişmedi");
    await restore(eski); await p.click("#dlg-ok"); await W(900);
    st = await S();
    eq(st.cats.map(c => c.name), ["Eski Kategori"], "eski biçim yedek yüklendi");
    await openCat("Eski Kategori");
    eq(await fabs(), ["expense", "income"], "türü olmayan (eski) kategoride iki buton da var");
    await restore("{bozuk json"); 
    ok((await p.textContent("#dlg-title")).includes("yüklenemedi"), "bozuk JSON reddedildi");
    await closeOverlays();
    await restore({ app: "hesap", format: 99, categories: [], transactions: [] });
    ok((await p.textContent("#dlg-body")).includes("daha yeni"), "daha yeni format reddedildi");
    await closeOverlays();
    st = await S(); eq(st.cats.map(c => c.name), ["Eski Kategori"], "reddedilen yedekler veriyi bozmadı");
    await restore(dump); await p.click("#dlg-ok"); await W(900);
    const geri = await S();
    eq(geri.txs.slice().sort((a, b) => a.id < b.id ? -1 : 1), sonra.txs.slice().sort((a, b) => a.id < b.id ? -1 : 1), "alınan yedek geri yüklenince hareketler birebir aynı");
    eq(geri.cats.map(c => c.id).sort(), sonra.cats.filter(c => c.name !== "Yönetimden").map(c => c.id).sort(), "alınan yedek geri yüklenince kategoriler aynı");
    await goHome();
    ok((await heroText()).includes("250,00"), "geri yükleme sonrası bakiye 250,00");

    console.log("\n# 10. Özet ekranı");
    await p.click('[data-go="summary"]'); await W(500);
    ok(await p.isVisible("#view-summary"), "Özet (Ay) açılıyor");
    await p.click('#view-summary [data-mode="year"]'); await W(500);
    ok((await p.textContent("#view-summary")).includes("Aylık gelir gider"), "Özet (Yıl) tablosu açılıyor");
    const yt = await p.evaluate(() => HesapDebug.yearTotals(new Date().getFullYear()));
    eq([yt.income, yt.expense], [25050 + 950, 4000], "yıllık gelir/gider toplamları (kuruş)");

    console.log("\n# 11. Hatırlatmalar");
    await goHome();
    if (await p.$('#view-home [data-act="newReminder"]')) {
      await p.click('#view-home [data-act="newReminder"]'); await W(450);
      const amt = await p.$("#sheet input[inputmode=decimal]");
      if (amt) await amt.fill("75");
      await p.click('#sheet [data-act="saveReminder"]'); await W(700);
      const rems = await p.evaluate(() => HesapDebug.state().reminders.length);
      eq(rems, 1, "hatırlatma eklendi");
    } else ok(true, "hatırlatma butonu yok (atlandı)");

    console.log("\n# 12. Güvenlik");
    eq(googleHits, [], "testte Google'a (Drive/Takvim) hiç istek gitmedi");
    eq(pageErrors, [], "sayfada JS hatası yok");
  } catch (e) {
    failed++; fails.push("beklenmeyen hata: " + e.message);
    console.log("  ✗ beklenmeyen hata: " + e.stack);
  } finally {
    await browser.close(); srv.close();
  }
  console.log("\n==== genel_test: " + passed + " geçti, " + failed + " başarısız ====");
  if (failed) { console.log("Başarısız: \n - " + fails.join("\n - ")); process.exit(1); }
}
main();
