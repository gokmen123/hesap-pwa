/* Hesap — Drive eşitleme (0.3.0)
   Telefondaki IndexedDB her zaman asıl kopyadır (çevrimdışı önce).
   Drive tarafı: kullanıcının kendi Google hesabında çalışan bir Apps Script
   web uygulaması (Hesap/hesap_yedek.json). İstekler text/plain POST →
   CORS ön-isteği yok, Google girişi / OAuth penceresi yok.
   Ayarlanmadıysa bu modül hiçbir şey yapmaz. */
window.DriveSync = (function () {
  "use strict";

  var A = null;                     /* app.js'in verdiği yardımcılar */
  var CHECK_GAP_MS = 45000;         /* otomatik kontroller arası en az */
  var NET_TIMEOUT_MS = 25000;
  var AUTO_DELAY_MS = 3500;
  var SAFETY_MAX = 3;

  var cfg = null;                   /* {url, key, auto} */
  var st = { rev: null, hash: null, syncedAt: 0, remoteUpdatedAt: 0, fileId: null };
  var localHash = null;
  var remote = null;                /* son okunan meta */
  var pending = null;               /* null | "push" | "pull" | "conflict" | "first" */
  var status = "idle";              /* idle | checking | ok | offline | error | busy */
  var lastError = "";
  var lastCheckAt = 0;
  var busy = false;
  var dismissedSig = null;
  var autoTimer = null;
  var suppressLocal = false;

  var IC = {
    cloud: '<path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.6 6 6 0 0 0-11.5 1.6A3.6 3.6 0 0 0 7 18.5z"/>',
    up: '<path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.6 6 6 0 0 0-11.5 1.6A3.6 3.6 0 0 0 7 18.5z"/><path d="M12 15.5v-5"/><path d="M9.8 12.4 12 10.2l2.2 2.2"/>',
    down: '<path d="M7 18.5h10.2a4.3 4.3 0 0 0 .6-8.6 6 6 0 0 0-11.5 1.6A3.6 3.6 0 0 0 7 18.5z"/><path d="M12 10.2v5"/><path d="M9.8 13.3 12 15.5l2.2-2.2"/>',
    split: '<path d="M7 4.5v6a4 4 0 0 0 4 4h6"/><path d="M14.5 12l2.5 2.5-2.5 2.5"/><path d="M17 4.5v3"/><path d="M7 19.5v.01M17 19.5v.01"/>',
    phone: '<rect x="6.5" y="3" width="11" height="18" rx="2.5"/><path d="M10.5 6h3"/>',
    drive: '<path d="M8.6 4h6.8l5.6 9.7-3.4 5.8H6.4L3 13.7 8.6 4z"/><path d="M8.6 4l5.6 9.7H21M6.4 19.5l5.6-9.7M3 13.7h11.2"/>',
    check: '<path d="M5 13l4.5 4.5L19 7"/>',
    off: '<path d="M4 4l16 16"/><path d="M9.5 6.2A6 6 0 0 1 17.8 9.9a4.3 4.3 0 0 1 2.4 7.3M16 18.5H7a3.6 3.6 0 0 1-.7-7.1 6 6 0 0 1 .9-2.6"/>',
    warn: '<path d="M12 4 2.8 19.5h18.4L12 4z"/><path d="M12 10v4.2M12 17v.01"/>',
    paste: '<rect x="6" y="4.5" width="12" height="16" rx="2.2"/><path d="M9.5 4.5V3.8a1.3 1.3 0 0 1 1.3-1.3h2.4a1.3 1.3 0 0 1 1.3 1.3v.7"/><path d="M9.5 11h5M9.5 14.5h5"/>',
    copy: '<rect x="8.5" y="8.5" width="11" height="12" rx="2"/><path d="M15.5 8.5V5.8a1.8 1.8 0 0 0-1.8-1.8H6.3a1.8 1.8 0 0 0-1.8 1.8v8.4a1.8 1.8 0 0 0 1.8 1.8h2.2"/>',
    shield: '<path d="M12 3.5 5 6.2v5.4c0 4.3 3 7.6 7 8.9 4-1.3 7-4.6 7-8.9V6.2l-7-2.7z"/><path d="M9.2 12l2 2 3.6-3.8"/>',
    arrow: '<path d="M5 12h13"/><path d="M13 7l5 5-5 5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'
  };
  function ic(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || "") + '</svg>';
  }
  function log(m) { try { DB.log("DRIVE", m); } catch (e) {} }
  function esc(s) { return A.esc(s); }
  function $(s) { return document.querySelector(s); }

  /* ================= YAPILANDIRMA ================= */
  function configured() { return !!(cfg && cfg.url && cfg.key); }

  function validUrl(u) {
    return /^https:\/\/script\.google(usercontent)?\.com\/.+/.test(u || "") ||
      /^http:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//.test(u || "");   /* yerel test */
  }

  /* "https://.../hesap-pwa/#drive=URL&k=ANAHTAR" ya da "URL ANAHTAR" ya da "URL#k=ANAHTAR" */
  function parseSetup(text) {
    text = String(text || "").trim();
    if (!text) return null;
    var url = null, key = null;
    var m = text.match(/[#?&]drive=([^&\s]+)/);
    if (m) {
      try { url = decodeURIComponent(m[1]); } catch (e) { url = m[1]; }
      var k = text.match(/[#?&]k=([^&\s]+)/);
      if (k) { try { key = decodeURIComponent(k[1]); } catch (e2) { key = k[1]; } }
    } else {
      var parts = text.split(/\s+/);
      if (parts.length >= 2) { url = parts[0]; key = parts[1]; }
    }
    if (!url || !key || !validUrl(url) || key.length < 20) return null;
    return { url: url, key: key };
  }

  function saveCfg() {
    return DB.setSetting("drive", cfg ? { url: cfg.url, key: cfg.key, auto: !!cfg.auto } : null);
  }
  function saveSt() {
    return DB.setSetting("driveState", { rev: st.rev, hash: st.hash, syncedAt: st.syncedAt, remoteUpdatedAt: st.remoteUpdatedAt, fileId: st.fileId });
  }

  /* ================= ÖZET / KARMA ================= */
  function canon(s) {
    var cats = s.categories.map(function (c) {
      return [c.id, c.name, c.color, c.icon, c.sortOrder || 0];
    }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    var txs = s.transactions.map(function (t) {
      return [t.id, t.type, t.amount, t.categoryId || null, t.note || "", t.date, t.type === "adjust" ? (t.adjustSign === -1 ? -1 : 1) : 0];
    }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    return JSON.stringify([cats, txs]);
  }

  function fnv(str, seed) {
    var h = seed >>> 0;
    for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return ("0000000" + h.toString(16)).slice(-8);
  }

  function hashOf(s) {
    var txt = canon(s);
    if (window.crypto && crypto.subtle && window.TextEncoder) {
      return crypto.subtle.digest("SHA-256", new TextEncoder().encode(txt)).then(function (buf) {
        return Array.prototype.map.call(new Uint8Array(buf), function (b) { return ("0" + b.toString(16)).slice(-2); }).join("").slice(0, 32);
      }).catch(function () { return fnv(txt, 2166136261) + fnv(txt, 33554467); });
    }
    return Promise.resolve(fnv(txt, 2166136261) + fnv(txt, 33554467));
  }

  function summaryOf(s) {
    var o = { tx: s.transactions.length, cats: s.categories.length, balance: 0, lastDate: null };
    s.transactions.forEach(function (t) {
      if (t.type === "income") o.balance += t.amount;
      else if (t.type === "expense") o.balance -= t.amount;
      else if (t.type === "adjust") o.balance += (t.adjustSign === -1 ? -t.amount : t.amount);
      if (!o.lastDate || t.date > o.lastDate) o.lastDate = t.date;
    });
    return o;
  }

  function localEmpty() { return A.state().transactions.length === 0; }

  function deviceName() {
    var ua = navigator.userAgent || "";
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android";
    if (/Windows/.test(ua)) return "Bilgisayar";
    if (/Mac/.test(ua)) return "Mac";
    return "Tarayıcı";
  }

  /* ================= AĞ ================= */
  function call(op, extra, c) {
    c = c || cfg;
    var body = { k: c.key, op: op, v: 1, app: A.version };
    if (extra) Object.keys(extra).forEach(function (k) { body[k] = extra[k]; });
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, NET_TIMEOUT_MS);
    return fetch(c.url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(body),
      redirect: "follow",
      cache: "no-store",
      credentials: "omit",
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(to);
      if (!r.ok) throw mkErr("http", "Sunucu " + r.status + " döndü");
      return r.text();
    }, function (e) {
      clearTimeout(to);
      throw mkErr("net", e && e.name === "AbortError" ? "Zaman aşımı" : "Bağlanılamadı");
    }).then(function (txt) {
      var j;
      try { j = JSON.parse(txt); } catch (e) { throw mkErr("bad", "Yanıt anlaşılmadı (adres doğru mu?)"); }
      if (!j || j.ok !== true) {
        var code = (j && j.error) || "server";
        var err = mkErr(code, ERRS[code] || ("Hata: " + code));
        err.meta = j && j.meta;
        throw err;
      }
      return j;
    });
  }
  var ERRS = {
    auth: "Anahtar yanlış",
    not_setup: "Drive tarafında kurulum() çalıştırılmamış",
    conflict: "Drive'da daha yeni veri var",
    busy: "Drive meşgul, birazdan tekrar dene",
    bad_file: "Drive'daki dosya bozuk",
    bad_data: "Gönderilen veri geçersiz",
    server: "Drive tarafında hata"
  };
  function mkErr(code, msg) { var e = new Error(msg); e.code = code; return e; }

  /* ================= GÜVENLİK KOPYASI ================= */
  function safetyCopy(reason) {
    var s = A.state();
    if (!s.transactions.length && s.categories.length <= 6) return Promise.resolve(false);
    return DB.getSettings().then(function (all) {
      var list = Array.isArray(all.safetyCopies) ? all.safetyCopies.slice() : [];
      list.unshift({ at: Date.now(), reason: reason, summary: summaryOf(s), data: A.buildBackup() });
      list = list.slice(0, SAFETY_MAX);
      return DB.setSetting("safetyCopies", list).then(function () {
        log("güvenlik kopyası alındı (" + reason + ") · " + s.transactions.length + " hareket · toplam " + list.length);
        return true;
      });
    });
  }

  /* ================= DURUM KONTROLÜ ================= */
  function refreshLocalHash() {
    return hashOf(A.state()).then(function (h) { localHash = h; return h; });
  }

  function localDirty() { return st.rev != null && localHash != null && localHash !== st.hash; }

  function decide(meta) {
    remote = meta;
    if (!meta.exists) return localEmpty() ? null : "first";
    if (meta.hash && meta.hash === localHash) return "same";
    if (st.rev == null) return localEmpty() ? "pull" : "conflict";
    var rChanged = meta.rev !== st.rev;
    var lChanged = localHash !== st.hash;
    if (rChanged && lChanged) return "conflict";
    if (rChanged) return "pull";
    if (lChanged) return "push";
    return null;
  }

  function check(reason, opts) {
    opts = opts || {};
    if (!configured()) return Promise.resolve(null);
    if (busy) return Promise.resolve(null);
    if (navigator.onLine === false) {
      status = "offline";
      paint();
      return Promise.resolve(null);
    }
    var t = Date.now();
    if (!opts.force && t - lastCheckAt < CHECK_GAP_MS) return Promise.resolve(null);
    lastCheckAt = t;
    status = "checking";
    paint();
    return refreshLocalHash().then(function () {
      return call("meta");
    }).then(function (meta) {
      lastError = "";
      var d = decide(meta);
      log("kontrol (" + reason + ") · drive rev:" + meta.rev + " yerel rev:" + st.rev + " → " + (d || "eşit"));
      if (d === "same") {
        st.rev = meta.rev; st.hash = localHash; st.syncedAt = Date.now(); st.remoteUpdatedAt = meta.updatedAt; st.fileId = meta.fileId || st.fileId;
        pending = null; status = "ok";
        return saveSt().then(function () { paint(); return null; });
      }
      pending = (d === "push" || d === "pull" || d === "conflict" || d === "first") ? d : null;
      status = "ok";
      if (meta.fileId) st.fileId = meta.fileId;
      paint();
      if (pending === "push" && cfg.auto) return push(false, { silent: true });
      if (pending && !opts.quiet) maybePrompt();
      return pending;
    }).catch(function (e) {
      status = "error";
      lastError = e.message || "Hata";
      log("kontrol hatası (" + reason + "): " + (e.code || "") + " " + lastError);
      paint();
      return null;
    });
  }

  /* ================= GÖNDER / ÇEK ================= */
  function push(force, opts) {
    opts = opts || {};
    if (!configured() || busy) return Promise.resolve(false);
    busy = true; status = "busy"; paint(); sheetBusy(true);
    var s = A.state();
    var data = A.buildBackup();
    var sum = summaryOf(s);
    return refreshLocalHash().then(function (h) {
      return call("put", {
        baseRev: st.rev == null ? (remote && remote.exists ? -1 : 0) : st.rev,
        force: !!force,
        hash: h,
        device: deviceName(),
        summary: sum,
        data: data
      }).then(function (r) {
        st.rev = r.rev; st.hash = h; st.syncedAt = Date.now(); st.remoteUpdatedAt = r.updatedAt; st.fileId = r.fileId || st.fileId;
        remote = { exists: true, rev: r.rev, hash: h, updatedAt: r.updatedAt, device: deviceName(), summary: sum, fileId: st.fileId };
        pending = null; status = "ok"; lastError = "";
        log("Drive'a yazıldı · rev " + r.rev + " · " + sum.tx + " hareket" + (force ? " (zorla)" : ""));
        return Promise.all([saveSt(), DB.setSetting("lastBackupAt", Date.now())]).then(function () {
          A.state().settings.lastBackupAt = Date.now();
          busy = false; closeSheet(); paint();
          if (!opts.silent) A.toast("Drive'a yedeklendi");
          return true;
        });
      });
    }).catch(function (e) {
      busy = false; sheetBusy(false);
      if (e.code === "conflict") {
        log("gönderme çakıştı · drive rev " + (e.meta && e.meta.rev));
        if (e.meta) remote = e.meta;
        pending = "conflict"; status = "ok"; paint();
        dismissedSig = null;
        showSheet("conflict");
        return false;
      }
      status = "error"; lastError = e.message; paint();
      log("gönderme hatası: " + (e.code || "") + " " + e.message);
      A.toast("Drive'a yazılamadı · " + e.message);
      return false;
    });
  }

  function pull() {
    if (!configured() || busy) return Promise.resolve(false);
    busy = true; status = "busy"; paint(); sheetBusy(true);
    var got;
    return call("get").then(function (r) {
      if (!r.exists || !r.data) throw mkErr("empty", "Drive'da henüz yedek yok");
      got = r;
      var norm = A.normalize(r.data);
      if (norm.error) throw mkErr("bad_file", norm.error);
      return safetyCopy("Drive'dan çekmeden önce").then(function () {
        suppressLocal = true;
        return A.replaceData(norm.cats, norm.txs, norm.theme);
      }).then(function () {
        suppressLocal = false;
        return refreshLocalHash();
      }).then(function (h) {
        st.rev = got.rev; st.hash = h; st.syncedAt = Date.now(); st.remoteUpdatedAt = got.updatedAt; st.fileId = got.fileId || st.fileId;
        remote = got; delete remote.data;
        pending = null; status = "ok"; lastError = "";
        log("Drive'dan alındı · rev " + got.rev + " · " + norm.txs.length + " hareket" + (norm.bad ? " · " + norm.bad + " atlandı" : ""));
        return saveSt();
      }).then(function () {
        busy = false; closeSheet(); paint();
        A.toast("Drive'daki veri yüklendi");
        return true;
      });
    }).catch(function (e) {
      suppressLocal = false;
      busy = false; sheetBusy(false);
      status = "error"; lastError = e.message; paint();
      log("çekme hatası: " + (e.code || "") + " " + e.message);
      A.toast("Drive'dan alınamadı · " + e.message);
      return false;
    });
  }

  /* app.js her veri yüklemesinden sonra çağırır */
  function onLocalChange() {
    if (!configured() || suppressLocal) return;
    refreshLocalHash().then(function () {
      if (st.rev == null) { paint(); return; }
      if (localDirty() && !pending) pending = "push";
      if (!localDirty() && pending === "push") pending = null;
      paint();
      if (localDirty() && cfg.auto && navigator.onLine !== false) {
        clearTimeout(autoTimer);
        autoTimer = setTimeout(function () {
          if (localDirty() && !busy) {
            log("otomatik yedek");
            push(false, { silent: true });
          }
        }, AUTO_DELAY_MS);
      }
    });
  }

  /* ================= SORU SAYFASI ================= */
  function sig() { return (pending || "") + "|" + (remote ? remote.rev : "") + "|" + (localHash || ""); }

  function overlayOpen() {
    return document.querySelector("#sheet.show, #dialog.show, #debug-panel.show, #drv-sheet.show") !== null;
  }

  function maybePrompt() {
    if (!pending || sig() === dismissedSig) return;
    if (overlayOpen()) return;     /* kullanıcı bir şey yapıyor; ana ekrandaki şerit yeter */
    showSheet(pending);
  }

  function sideCard(label, icon, sum, when, extra, cls) {
    sum = sum || { tx: 0, balance: 0 };
    return '<div class="drv-side' + (cls ? " " + cls : "") + '">' +
      '<div class="drv-side-h">' + ic(icon) + '<span>' + esc(label) + '</span></div>' +
      '<div class="drv-side-bal"><span class="num">' + Fmt.plainSgn(sum.balance || 0) + '</span><span class="ccy">TL</span></div>' +
      '<div class="drv-side-m">' + (sum.tx || 0) + ' hareket</div>' +
      '<div class="drv-side-w">' + esc(when || "—") + (extra ? " · " + esc(extra) : "") + '</div>' +
    '</div>';
  }

  function whenText(ms) {
    if (!ms) return "—";
    var d = new Date(ms);
    var diff = Date.now() - ms;
    var hm = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2);
    if (diff < 60000) return "az önce";
    if (Fmt.ymd(d) === Fmt.todayYMD()) return "bugün " + hm;
    var y = new Date(); y.setDate(y.getDate() - 1);
    if (Fmt.ymd(d) === Fmt.ymd(y)) return "dün " + hm;
    return Fmt.fullDate(Fmt.ymd(d)) + " " + hm;
  }

  function lastLocalChange() {
    var m = 0;
    A.state().transactions.forEach(function (t) { if ((t.updatedAt || 0) > m) m = t.updatedAt; });
    A.state().categories.forEach(function (c) { if ((c.updatedAt || 0) > m) m = c.updatedAt; });
    return m;
  }

  function showSheet(kind) {
    var el = $("#drv-sheet"), body = $("#drv-body");
    if (!el) return;
    var ls = summaryOf(A.state());
    var rs = remote && remote.summary;
    var phone = sideCard("Telefon", "phone", ls, whenText(lastLocalChange()), null, "me");
    var drive = sideCard("Drive", "drive", rs, whenText(remote && remote.updatedAt), remote && remote.device, "far");
    var html = "";
    if (kind === "push" || kind === "first") {
      html =
        '<div class="drv-badge up">' + ic("up") + '</div>' +
        '<div class="drv-title">Drive\'a yedek alayım mı?</div>' +
        '<div class="drv-sub">' + (kind === "first" ? "Drive'da henüz yedek yok. Telefondaki kayıtlar Drive'a gönderilsin." : "Telefonda Drive'a gönderilmemiş değişiklik var.") + '</div>' +
        '<div class="drv-cmp">' + phone + '<div class="drv-arrow">' + ic("arrow") + '</div>' + drive + '</div>' +
        '<button class="save-btn" data-drv="push">Evet, Drive\'a yedekle</button>' +
        '<button class="ghost-btn" data-drv="later">Sonra</button>' +
        '<div class="drv-foot">' + ic("shield") + '<span>Drive\'daki önceki dosya <strong>Hesap/eski</strong> klasörüne kopyalanır.</span></div>';
    } else if (kind === "pull") {
      html =
        '<div class="drv-badge down">' + ic("down") + '</div>' +
        '<div class="drv-title">Drive\'da yeni veri var</div>' +
        '<div class="drv-sub">Güncelleyeyim mi? Telefondaki kayıtlar Drive\'dakiyle değişir.</div>' +
        '<div class="drv-cmp">' + drive + '<div class="drv-arrow">' + ic("arrow") + '</div>' + phone + '</div>' +
        '<button class="save-btn" data-drv="pull">Evet, güncelle</button>' +
        '<button class="ghost-btn" data-drv="later">Sonra</button>' +
        '<div class="drv-foot">' + ic("shield") + '<span>Telefondaki mevcut veri önce otomatik <strong>güvenlik kopyasına</strong> alınır.</span></div>';
    } else if (kind === "conflict") {
      html =
        '<div class="drv-badge warn">' + ic("split") + '</div>' +
        '<div class="drv-title">Telefon ve Drive farklı</div>' +
        '<div class="drv-sub">İki tarafta da değişiklik var. Hangisi kalsın?</div>' +
        '<div class="drv-cmp two">' + phone + drive + '</div>' +
        '<button class="save-btn" data-drv="pull">Drive\'dakini al</button>' +
        '<button class="ghost-btn strong" data-drv="pushForce">Telefondakini gönder</button>' +
        '<button class="drv-later" data-drv="later">Sonra karar ver</button>' +
        '<div class="drv-foot">' + ic("shield") + '<span>Hangisini seçersen seç, diğeri silinmez: telefondaki <strong>güvenlik kopyasına</strong>, Drive\'daki <strong>Hesap/eski</strong> klasörüne gider.</span></div>';
    } else return;
    sheetBusy(false);
    body.innerHTML = html;
    el.setAttribute("data-kind", kind);
    $("#drv-backdrop").classList.add("show");
    el.classList.add("show");
  }

  function closeSheet() {
    var el = $("#drv-sheet");
    if (!el) return;
    el.classList.remove("show");
    el.classList.remove("busy");
    $("#drv-backdrop").classList.remove("show");
  }

  function sheetBusy(on) {
    var el = $("#drv-sheet");
    if (!el) return;
    el.classList.toggle("busy", !!on);
    Array.prototype.forEach.call(el.querySelectorAll("button"), function (b) { b.disabled = !!on; });
  }

  /* ================= ANA EKRAN ŞERİDİ ================= */
  function bannerHtml() {
    if (!configured()) return "";
    var t = null, s = "", icon = "cloud", cls = "", act = "";
    if (pending === "pull") { t = "Drive'da yeni veri var"; s = "Dokun, güncelleyeyim mi diye sorayım"; icon = "down"; act = "open"; }
    else if (pending === "conflict") { t = "Telefon ve Drive farklı"; s = "Dokun, hangisi kalsın seç"; icon = "split"; cls = " warn"; act = "open"; }
    else if (pending === "first") { t = "Drive'da yedek yok"; s = "Dokun, ilk yedeği gönder"; icon = "up"; act = "open"; }
    else if (localDirty() || pending === "push") {
      t = "Drive'a gönderilmemiş değişiklik";
      s = navigator.onLine === false ? "Çevrimdışı · internet gelince sorarım" : (cfg.auto ? "Birazdan otomatik yedeklenecek" : "Dokun, Drive'a yedekle");
      icon = "up"; act = navigator.onLine === false ? "" : "open";
    }
    else if (status === "error") { t = "Drive'a ulaşılamadı"; s = lastError || "Ayarlar → Drive yedeği"; icon = "warn"; cls = " warn"; act = "settings"; }
    if (!t) return "";
    return '<button class="bk-banner drv-banner' + cls + '" data-drv="' + (act === "settings" ? "goSettings" : (act ? "banner" : "noop")) + '">' +
      '<div class="bk-ico">' + ic(icon) + '</div>' +
      '<div class="bk-body"><div class="bk-t">' + esc(t) + '</div><div class="bk-s">' + esc(s) + '</div></div>' +
      (act ? '<div class="bk-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>' : '') +
    '</button>';
  }

  function paint() {
    var slot = document.getElementById("drv-slot");
    if (slot) slot.innerHTML = bannerHtml();
    var card = document.getElementById("drv-settings");
    if (card) {
      var mode = configured() ? "on" : "off";
      /* kurulum formu durumdan bağımsız; yazılanı silmemek için yeniden çizme */
      if (mode === "off" && card.getAttribute("data-mode") === "off") return;
      card.setAttribute("data-mode", mode);
      card.innerHTML = settingsInner();
    }
  }

  /* ================= AYARLAR BÖLÜMÜ ================= */
  function statusLine() {
    if (!configured()) return { t: "Bağlı değil", c: "", i: "off" };
    if (busy || status === "busy") return { t: "Eşitleniyor…", c: "busy", i: "cloud" };
    if (status === "checking") return { t: "Kontrol ediliyor…", c: "busy", i: "cloud" };
    if (navigator.onLine === false || status === "offline") return { t: "Çevrimdışı · telefonda saklanıyor", c: "", i: "off" };
    if (status === "error") return { t: lastError || "Hata", c: "warn", i: "warn" };
    if (pending === "pull") return { t: "Drive'da yeni veri var", c: "warn", i: "down" };
    if (pending === "conflict") return { t: "Telefon ve Drive farklı", c: "warn", i: "split" };
    if (pending === "first") return { t: "Drive'da yedek yok", c: "warn", i: "up" };
    if (localDirty() || pending === "push") return { t: "Gönderilmemiş değişiklik var", c: "warn", i: "up" };
    if (st.rev != null) return { t: "Drive ile eşit", c: "ok", i: "check" };
    return { t: "Bağlı", c: "ok", i: "cloud" };
  }

  function maskKey(k) { return k ? "••••••" + String(k).slice(-4) : ""; }

  function settingsInner() {
    if (!configured()) {
      return '<div class="drv-setup">' +
        '<div class="drv-hero">' +
          '<div class="drv-hero-ico">' + ic("drive") + '</div>' +
          '<div><div class="drv-hero-t">Google Drive\'a bağla</div>' +
          '<div class="drv-hero-s">Kayıtlar telefonda kalır, internet gelince Drive\'daki yedekle karşılaştırılır. Giriş ekranı yok, bir kere kurulur.</div></div>' +
        '</div>' +
        '<div class="field-label">Kurulum bağlantısı</div>' +
        '<div class="input-row drv-input">' + ic("link") +
          '<input type="text" id="drv-setup-in" placeholder="Kurulum bağlantısını yapıştır" autocomplete="off" autocapitalize="off" spellcheck="false">' +
          '<button class="drv-paste" data-drv="paste">' + ic("paste") + '<span>Yapıştır</span></button>' +
        '</div>' +
        '<details class="drv-manual"><summary>Adres ve anahtarı ayrı gir</summary>' +
          '<div class="input-row"><input type="text" id="drv-url-in" placeholder="https://script.google.com/macros/s/…/exec" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' +
          '<div class="input-row"><input type="text" id="drv-key-in" placeholder="Anahtar" autocomplete="off" autocapitalize="off" spellcheck="false"></div>' +
        '</details>' +
        '<div class="form-error drv-err" id="drv-err"></div>' +
        '<button class="save-btn" data-drv="connect">Bağla ve test et</button>' +
      '</div>';
    }
    var sl = statusLine();
    var sync = st.syncedAt ? whenText(st.syncedAt) : "Henüz eşitlenmedi";
    var host = "";
    try { host = new URL(cfg.url).host; } catch (e) {}
    return '<div class="drv-status ' + sl.c + '">' +
        '<div class="drv-status-ico">' + ic(sl.i) + '</div>' +
        '<div class="drv-status-b"><div class="drv-status-t">' + esc(sl.t) + '</div>' +
        '<div class="drv-status-s">Son eşitleme: ' + esc(sync) + (st.rev != null ? ' · sürüm ' + st.rev : '') + '</div></div>' +
      '</div>' +
      '<div class="drv-actions">' +
        '<button data-drv="pushNow">' + ic("up") + '<span>Şimdi yedekle</span></button>' +
        '<button data-drv="pullNow">' + ic("down") + '<span>Drive\'dan çek</span></button>' +
        '<button data-drv="test">' + ic("check") + '<span>Test et</span></button>' +
      '</div>' +
      '<div class="set-row">' +
        '<div><div class="k">Otomatik yedekle</div><div class="d">Telefonda değişiklik olunca sormadan Drive\'a gönder. Drive\'dan çekmeden önce her zaman sorar.</div></div>' +
        '<button class="drv-switch' + (cfg.auto ? " on" : "") + '" data-drv="auto" role="switch" aria-checked="' + (cfg.auto ? "true" : "false") + '"><i></i></button>' +
      '</div>' +
      '<button class="set-row" data-drv="safety">' +
        '<div><div class="k">Güvenlik kopyaları</div><div class="d">Drive\'dan çekmeden önce telefondaki veri saklanır (son ' + SAFETY_MAX + ')</div></div>' +
        '<div class="v" id="drv-safety-n">›</div>' +
      '</button>' +
      '<div class="set-row">' +
        '<div><div class="k">Bağlantı</div><div class="d">' + esc(host) + ' · anahtar ' + esc(maskKey(cfg.key)) + '</div></div>' +
        '<button class="drv-mini" data-drv="disconnect">Kaldır</button>' +
      '</div>' +
      (st.fileId ? '<a class="set-row" href="https://drive.google.com/file/d/' + encodeURIComponent(st.fileId) + '/view" target="_blank" rel="noopener">' +
        '<div><div class="k">Drive\'da göster</div><div class="d">Hesap/hesap_yedek.json</div></div><div class="v">›</div></a>' : '');
  }

  function settingsHtml() {
    return '<div class="sec-head"><div class="sec-title">Drive yedeği</div></div>' +
      '<div class="set-group drv-group" id="drv-settings" data-mode="' + (configured() ? "on" : "off") + '">' + settingsInner() + '</div>';
  }

  function setErr(msg) { var e = $("#drv-err"); if (e) { e.textContent = msg || ""; e.classList.toggle("show", !!msg); } }

  function connect() {
    var raw = ($("#drv-setup-in") || {}).value || "";
    var c = parseSetup(raw);
    if (!c) {
      var u = (($("#drv-url-in") || {}).value || "").trim();
      var k = (($("#drv-key-in") || {}).value || "").trim();
      if (u || k) {
        if (!validUrl(u)) { setErr("Adres https://script.google.com/… ile başlamalı"); return; }
        if (k.length < 20) { setErr("Anahtar çok kısa"); return; }
        c = { url: u, key: k };
      }
    }
    if (!c) { setErr(raw ? "Bu bir Hesap kurulum bağlantısı değil" : "Önce kurulum bağlantısını yapıştır"); return; }
    setErr("");
    var btn = document.querySelector('[data-drv="connect"]');
    if (btn) { btn.disabled = true; btn.textContent = "Bağlanıyor…"; }
    return tryConfig(c).then(function (ok) {
      if (!ok && btn) { btn.disabled = false; btn.textContent = "Bağla ve test et"; }
    });
  }

  function tryConfig(c, silentToast) {
    return call("ping", null, c).then(function (r) {
      cfg = { url: c.url, key: c.key, auto: false };
      st = { rev: null, hash: null, syncedAt: 0, remoteUpdatedAt: 0, fileId: r.meta && r.meta.fileId || null };
      dismissedSig = null;
      log("bağlandı · " + (r.meta && r.meta.exists ? "Drive'da rev " + r.meta.rev : "Drive boş"));
      return Promise.all([saveCfg(), saveSt()]).then(function () {
        if (!silentToast) A.toast("Drive bağlandı");
        status = "ok";
        paint();
        lastCheckAt = 0;
        setTimeout(function () { check("bağlantı", { force: true }); }, 300);
        return true;
      });
    }).catch(function (e) {
      log("bağlantı hatası: " + (e.code || "") + " " + e.message);
      setErr(e.message || "Bağlanılamadı");
      return false;
    });
  }

  function testNow() {
    status = "checking"; paint();
    return call("ping").then(function (r) {
      status = "ok"; lastError = "";
      A.toast("Bağlantı sağlam · Drive " + (r.meta && r.meta.exists ? "sürüm " + r.meta.rev : "boş"));
      paint();
      return check("test", { force: true, quiet: false });
    }).catch(function (e) {
      status = "error"; lastError = e.message; paint();
      A.toast("Test başarısız · " + e.message);
    });
  }

  function pasteSetup() {
    var inp = $("#drv-setup-in");
    if (navigator.clipboard && navigator.clipboard.readText) {
      navigator.clipboard.readText().then(function (txt) {
        if (inp) inp.value = (txt || "").trim();
        setErr(parseSetup(txt) ? "" : "Panodaki metin kurulum bağlantısı değil");
      }).catch(function () {
        if (inp) inp.focus();
        setErr("Panoya erişilemedi. Kutuya basılı tut → Yapıştır.");
      });
    } else if (inp) { inp.focus(); }
  }

  function disconnect() {
    A.confirm("Drive bağlantısını kaldır",
      "Telefondaki kayıtlara ve Drive'daki dosyaya <strong>dokunulmaz</strong>. Yalnızca bu cihaz Drive ile eşitlemeyi bırakır.",
      { okText: "Kaldır" }).then(function (ok) {
        if (!ok) return;
        cfg = null; pending = null; status = "idle";
        st = { rev: null, hash: null, syncedAt: 0, remoteUpdatedAt: 0, fileId: null };
        Promise.all([saveCfg(), saveSt()]).then(function () { log("bağlantı kaldırıldı"); paint(); A.toast("Bağlantı kaldırıldı"); });
      });
  }

  /* güvenlik kopyaları listesi (aynı alt sayfada) */
  function showSafety() {
    DB.getSettings().then(function (all) {
      var list = Array.isArray(all.safetyCopies) ? all.safetyCopies : [];
      var rows = list.length ? list.map(function (c, i) {
        return '<div class="drv-copy">' +
          '<div class="drv-copy-b"><div class="drv-copy-t">' + esc(whenText(c.at)) + '</div>' +
          '<div class="drv-copy-s">' + (c.summary ? c.summary.tx : 0) + ' hareket · ' + Fmt.plainSgn(c.summary ? c.summary.balance : 0) + ' TL · ' + esc(c.reason || "") + '</div></div>' +
          '<button class="drv-mini" data-drv="restoreCopy" data-i="' + i + '">Geri yükle</button></div>';
      }).join("") : '<div class="drv-empty">Henüz güvenlik kopyası yok. Drive\'dan veri çekildiğinde telefondaki kayıtlar burada saklanır.</div>';
      $("#drv-body").innerHTML =
        '<div class="drv-badge">' + ic("shield") + '</div>' +
        '<div class="drv-title">Güvenlik kopyaları</div>' +
        '<div class="drv-sub">Drive\'dan çekmeden önce telefonda kalan son ' + SAFETY_MAX + ' durum.</div>' +
        '<div class="drv-copies">' + rows + '</div>' +
        '<button class="ghost-btn" data-drv="later">Kapat</button>';
      sheetBusy(false);
      $("#drv-sheet").setAttribute("data-kind", "safety");
      $("#drv-backdrop").classList.add("show");
      $("#drv-sheet").classList.add("show");
    });
  }

  function restoreCopy(i) {
    DB.getSettings().then(function (all) {
      var list = Array.isArray(all.safetyCopies) ? all.safetyCopies : [];
      var c = list[i];
      if (!c) return;
      closeSheet();
      A.confirm("Güvenlik kopyasını yükle",
        whenText(c.at) + " tarihli <strong>" + (c.summary ? c.summary.tx : 0) + " hareket</strong> geri gelsin mi? Şu anki veri de önce güvenlik kopyasına alınır.",
        { okText: "Geri yükle", danger: false }).then(function (ok) {
          if (!ok) return;
          var norm = A.normalize(c.data);
          if (norm.error) { A.toast("Kopya okunamadı"); return; }
          safetyCopy("Güvenlik kopyası yüklenmeden önce").then(function () {
            return A.replaceData(norm.cats, norm.txs, norm.theme);
          }).then(function () {
            log("güvenlik kopyası geri yüklendi · " + norm.txs.length + " hareket");
            A.toast("Güvenlik kopyası yüklendi");
          });
        });
    });
  }

  /* ================= OLAYLAR ================= */
  function onClick(ev) {
    var t = ev.target.closest ? ev.target.closest("[data-drv]") : null;
    if (!t) {
      if (ev.target.closest && ev.target.closest("#drv-backdrop") && !busy) { dismiss(); }
      return false;
    }
    var a = t.getAttribute("data-drv");
    ev.preventDefault();
    if (a === "push") push(false);
    else if (a === "pushForce") push(true);
    else if (a === "pull") pull();
    else if (a === "later") dismiss();
    else if (a === "banner") { if (pending) showSheet(pending === "push" ? "push" : pending); else check("şerit", { force: true }); }
    else if (a === "goSettings") A.go("settings");
    else if (a === "connect") connect();
    else if (a === "paste") pasteSetup();
    else if (a === "pushNow") {
      if (remote && remote.exists && st.rev != null && remote.rev !== st.rev) { pending = "conflict"; showSheet("conflict"); }
      else push(false);
    }
    else if (a === "pullNow") {
      A.confirm("Drive'dan çek", "Telefondaki kayıtlar Drive'dakiyle değişecek. Mevcut veri önce <strong>güvenlik kopyasına</strong> alınır.",
        { okText: "Çek", danger: false }).then(function (ok) { if (ok) pull(); });
    }
    else if (a === "test") testNow();
    else if (a === "auto") {
      cfg.auto = !cfg.auto;
      saveCfg().then(function () { log("otomatik yedek: " + (cfg.auto ? "açık" : "kapalı")); paint(); if (cfg.auto) onLocalChange(); });
    }
    else if (a === "safety") showSafety();
    else if (a === "restoreCopy") restoreCopy(Number(t.getAttribute("data-i")));
    else if (a === "disconnect") disconnect();
    return true;
  }

  function dismiss() {
    dismissedSig = sig();
    closeSheet();
  }

  /* #drive=…&k=… ile açıldıysa yapılandır ve adresi temizle */
  function consumeHash() {
    var h = location.hash || "";
    if (h.indexOf("drive=") < 0) return Promise.resolve(false);
    var c = parseSetup(h);
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    if (!c) return Promise.resolve(false);
    try { sessionStorage.setItem("hesap_drv_setup", h); } catch (e) {}
    return tryConfig(c).then(function (ok) {
      if (ok && !A.standalone()) {
        /* Safari sekmesi: ana ekrandaki uygulama ayrı depolama kullanır → kopyala-yapıştır yolu */
        A.confirm("Drive bu sekmeye bağlandı",
          "Ana ekrandaki <strong>Hesap</strong> uygulaması ayrı depolama kullanır. Onu da bağlamak için " +
          "<strong>Kopyala</strong>'ya bas, sonra Hesap → Ayarlar → Drive yedeği → <strong>Yapıştır</strong>.",
          { okText: "Kopyala", danger: false }).then(function (ok2) {
            if (!ok2) return;
            var txt = location.origin + location.pathname + h;
            if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { A.toast("Kopyalandı"); });
          });
      }
      return ok;
    });
  }

  /* ================= BAŞLAT ================= */
  function init(api) {
    A = api;
    document.addEventListener("click", function (ev) { if (onClick(ev)) ev.stopPropagation(); }, true);
    return DB.getSettings().then(function (all) {
      var d = all.drive;
      if (d && d.url && d.key) cfg = { url: d.url, key: d.key, auto: !!d.auto };
      var s = all.driveState;
      if (s) st = { rev: s.rev == null ? null : Number(s.rev), hash: s.hash || null, syncedAt: s.syncedAt || 0, remoteUpdatedAt: s.remoteUpdatedAt || 0, fileId: s.fileId || null };
      return refreshLocalHash();
    }).then(function () {
      paint();
      return consumeHash();
    }).then(function () {
      if (configured()) log("hazır · yerel rev " + st.rev + (localDirty() ? " · gönderilmemiş değişiklik" : ""));
      setTimeout(function () { check("açılış"); }, 900);
      window.addEventListener("online", function () {
        log("internet geldi");
        paint();
        setTimeout(function () { check("internet geldi", { force: true }); }, 1200);
      });
      window.addEventListener("offline", function () { status = "offline"; paint(); });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") check("öne geldi");
      });
    });
  }

  return {
    init: init,
    configured: configured,
    bannerHtml: bannerHtml,
    settingsHtml: settingsHtml,
    onLocalChange: onLocalChange,
    check: check,
    paint: paint,
    _state: function () { return { cfg: cfg ? { url: cfg.url, auto: cfg.auto } : null, st: st, pending: pending, status: status, localHash: localHash, remote: remote }; }
  };
})();
