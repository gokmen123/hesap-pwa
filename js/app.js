/* Hesap — 0.1.0 — ana uygulama */
(function () {
  "use strict";

  var APP_VERSION = "0.3.3";

  /* ================= İKONLAR (yerleşik SVG kümesi) ================= */
  var ICONS = {
    shop: '<path d="M3 10.5l1.4-5.2A2 2 0 0 1 6.3 4h11.4a2 2 0 0 1 1.9 1.3L21 10.5"/><path d="M3 10.5h18v8.5a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19V10.5z"/><path d="M8 4v3M16 4v3M9.5 14.5h5"/>',
    home: '<path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5z"/>',
    cart: '<path d="M6.5 8.5h11l-1 11.2a1.5 1.5 0 0 1-1.5 1.3H9a1.5 1.5 0 0 1-1.5-1.3L6.5 8.5z"/><path d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
    car: '<path d="M3.5 13.5 5.2 8.8A2 2 0 0 1 7.1 7.5h9.8a2 2 0 0 1 1.9 1.3l1.7 4.7"/><path d="M3.5 13.5h17v4.2a1.3 1.3 0 0 1-1.3 1.3H4.8a1.3 1.3 0 0 1-1.3-1.3v-4.2z"/><circle cx="7.2" cy="17.6" r="1.15" fill="currentColor" stroke="none"/><circle cx="16.8" cy="17.6" r="1.15" fill="currentColor" stroke="none"/>',
    wallet: '<path d="M3.5 8.5A2.5 2.5 0 0 1 6 6h11.5A2.5 2.5 0 0 1 20 8.5v9A2.5 2.5 0 0 1 17.5 20H6a2.5 2.5 0 0 1-2.5-2.5v-9z"/><path d="M16.5 13.5h1.5"/><path d="M3.5 9.5h13"/>',
    receipt: '<rect x="7" y="3.5" width="10" height="17" rx="2"/><path d="M10 7.5h4M10 11h4M10 14.5h2.5"/>',
    bolt: '<path d="M13 3.5 6 13.5h5.5L11 20.5 18 10.5h-5.5L13 3.5z"/>',
    drop: '<path d="M12 3.5C12 3.5 6.8 10.2 6.8 14.6a5.2 5.2 0 0 0 10.4 0C17.2 10.2 12 3.5 12 3.5z"/>',
    flame: '<path d="M13 3.2c.4 3.4 4.6 5.6 4.6 10.2A5.6 5.6 0 0 1 7.2 15.6c0-2.1 1.3-3.6 2.4-4.2.3 1.8 1.5 2.6 2.6 2.6C12 10.6 12.4 6.8 13 3.2z"/><path d="M11.2 16.6c0 1.3.8 2.2 1.8 2.2s1.8-.9 1.8-2.2c0-1.2-1-2.2-1.8-3.2-.8 1-1.8 2-1.8 3.2z"/>',
    phone: '<rect x="6.5" y="3" width="11" height="18" rx="2.5"/><path d="M10.5 6h3"/><path d="M11 18h2"/>',
    wifi: '<path d="M2.5 8.5C7.8 3.9 16.2 3.9 21.5 8.5"/><path d="M5.5 12.2c3.7-3 9.3-3 13 0"/><path d="M8.8 15.8c1.9-1.5 4.5-1.5 6.4 0"/><circle cx="12" cy="19" r="1.1" fill="currentColor" stroke="none"/>',
    bag: '<path d="M5 8h14l-1 11.2a1.6 1.6 0 0 1-1.6 1.4H7.6A1.6 1.6 0 0 1 6 19.2L5 8z"/><path d="M8.5 8V6.4a3.5 3.5 0 0 1 7 0V8"/>',
    food: '<path d="M6 3.5v8a2.5 2.5 0 0 0 5 0v-8"/><path d="M8.5 13.5V20.5"/><path d="M16.5 3.5c-1.4 1.6-2 3.4-2 5.5 0 1.6.8 2.6 2 2.6s2-1 2-2.6c0-2.1-.6-3.9-2-5.5z"/><path d="M16.5 11.6V20.5"/>',
    coffee: '<path d="M4.5 8.5h12v6a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-6z"/><path d="M16.5 10.5h1.8a2.4 2.4 0 0 1 0 4.8h-1.8"/><path d="M6 3.5c.6.8.6 1.6 0 2.4M9.5 3.5c.6.8.6 1.6 0 2.4"/>',
    gift: '<rect x="3.5" y="9" width="17" height="11.5" rx="2"/><path d="M3.5 13.5h17M12 9v11.5"/><path d="M12 9C10.5 6 9 4.5 7.5 4.5a2.2 2.2 0 0 0 0 4.5H12zM12 9c1.5-3 3-4.5 4.5-4.5a2.2 2.2 0 0 1 0 4.5H12z"/>',
    tool: '<path d="M14.5 4.5a4.5 4.5 0 0 0-1.8 8.1L5.2 20.1a1.6 1.6 0 0 1-2.3-2.3l7.5-7.5A4.5 4.5 0 0 1 18.5 3l-3 3 1.5 1.5 3-3c.3.8.5 1.7.5 2.6 0 .5-.1 1-.3 1.4z"/>',
    heart: '<path d="M12 20.3l-1.2-1.1C6.3 15.2 3.5 12.7 3.5 9.6A4.6 4.6 0 0 1 8.1 5c1.7 0 3 .8 3.9 2 .9-1.2 2.2-2 3.9-2a4.6 4.6 0 0 1 4.6 4.6c0 3.1-2.8 5.6-7.3 9.6L12 20.3z"/>',
    bank: '<path d="M3.5 9.5 12 4l8.5 5.5"/><path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8"/><path d="M3.5 20.5h17"/>',
    briefcase: '<rect x="3.5" y="7.5" width="17" height="12" rx="2"/><path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5"/><path d="M3.5 12.5h17"/>',
    plane: '<path d="M20.5 4 3.5 11l6.5 2.5L13 20.5l3-5.5 4.5-11z"/><path d="M9.5 13.5 20.5 4"/>',
    book: '<path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H19v15.5H6.5A2.5 2.5 0 0 0 4 21V5.5z"/><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H19"/>',
    paw: '<circle cx="7" cy="8" r="1.9"/><circle cx="12" cy="6" r="1.9"/><circle cx="17" cy="8" r="1.9"/><path d="M12 11c-2.6 0-5 2.2-5 4.4 0 1.5 1.1 2.4 2.4 2.4 1 0 1.7-.4 2.6-.4s1.6.4 2.6.4c1.3 0 2.4-.9 2.4-2.4C17 13.2 14.6 11 12 11z"/>',
    medical: '<path d="M9.5 3.5h5v6h6v5h-6v6h-5v-6h-6v-5h6v-6z"/>',
    tag: '<path d="M11 3.5H5a1.5 1.5 0 0 0-1.5 1.5v6l9.4 9.4a2 2 0 0 0 2.8 0l4.7-4.7a2 2 0 0 0 0-2.8L11 3.5z"/><circle cx="8" cy="8" r="1.3" fill="currentColor" stroke="none"/>',
    star: '<path d="m12 3.8 2.6 5.4 5.9.8-4.3 4.1 1.1 5.9L12 17.2l-5.3 2.8 1.1-5.9-4.3-4.1 5.9-.8L12 3.8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    gear: '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 14.2a1.6 1.6 0 0 0 .3 1.8l.1.1a1.9 1.9 0 1 1-2.7 2.7l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5v.2a1.9 1.9 0 1 1-3.8 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a1.9 1.9 0 1 1-2.7-2.7l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a1.9 1.9 0 1 1 0-3.8h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a1.9 1.9 0 1 1 2.7-2.7l.1.1a1.6 1.6 0 0 0 1.8.3H10a1.6 1.6 0 0 0 1-1.5V4a1.9 1.9 0 1 1 3.8 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a1.9 1.9 0 1 1 2.7 2.7l-.1.1a1.6 1.6 0 0 0-.3 1.8V10a1.6 1.6 0 0 0 1.5 1h.2a1.9 1.9 0 1 1 0 3.8h-.1a1.6 1.6 0 0 0-1.5 1z"/>',
    chevL: '<path d="M15 5l-7 7 7 7"/>',
    chevR: '<path d="M9 5l7 7-7 7"/>',
    homeTab: '<path d="M4 10.8 12 4l8 6.8V20a1 1 0 0 1-1 1h-5.2v-6.2H10.2V21H5a1 1 0 0 1-1-1v-9.2z"/>',
    chart: '<path d="M4 19h16"/><rect x="5.5" y="10" width="3.4" height="7" rx="1"/><rect x="10.3" y="6" width="3.4" height="11" rx="1"/><rect x="15.1" y="8.5" width="3.4" height="8.5" rx="1"/>',
    note: '<path d="M5 6.5h14M5 12h10M5 17.5h7"/>',
    cal: '<rect x="4" y="5.5" width="16" height="15" rx="2.2"/><path d="M4 10h16M8 3.5v4M16 3.5v4"/>',
    trend: '<path d="M5 16l6-8 3.5 4.5L19 8"/>',
    trash: '<path d="M4.5 6.5h15"/><path d="M9 6.5V4.8a1.3 1.3 0 0 1 1.3-1.3h3.4A1.3 1.3 0 0 1 15 4.8v1.7"/><path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5"/>',
    edit: '<path d="M4 20h4.2L19.4 8.8a2.1 2.1 0 0 0-3-3L5.2 17V20z"/><path d="M14.5 7.5l3 3"/>',
    share: '<path d="M12 4v10"/><path d="M8 8l4-4 4 4"/><path d="M5 16.5v1.2A2.3 2.3 0 0 0 7.3 20h9.4A2.3 2.3 0 0 0 19 17.7v-1.2"/>',
    check: '<path d="M5 13l4.5 4.5L19 7"/>'
  };

  function svg(name, size) {
    var d = ICONS[name] || ICONS.tag;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" ' +
      'stroke-linecap="round" stroke-linejoin="round"' + (size ? ' width="' + size + '" height="' + size + '"' : '') +
      '>' + d + '</svg>';
  }
  function svgBold(name) {
    var d = ICONS[name] || ICONS.tag;
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" ' +
      'stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>';
  }

  var ICON_KEYS = ["shop", "home", "cart", "car", "wallet", "receipt", "bolt", "drop", "flame",
    "phone", "wifi", "bag", "food", "coffee", "gift", "tool", "heart", "bank",
    "briefcase", "plane", "book", "paw", "medical", "tag"];

  var PALETTE = ["#F0B429", "#4C8FF0", "#2DB88A", "#F08A4A",
    "#E24B42", "#0E8F82", "#8E7CC3", "#E07A3C",
    "#3B82E8", "#C2557A", "#6BA292", "#A0785A"];

  /* ================= DURUM ================= */
  var S = {
    categories: [],
    transactions: [],
    settings: { theme: "auto" },
    view: "home",
    month: Fmt.ymOf(Fmt.todayYMD()),
    catId: null,
    sheetMode: "new",
    editId: null,
    formType: "expense",
    formCat: null,
    formDate: Fmt.todayYMD(),
    adjustSign: 1,
    persist: null,
    storage: { persisted: null, usage: null, quota: null, standalone: false }
  };

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var esc = function (s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c];
    });
  };
  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
  }
  function now() { return Date.now(); }

  function hexSoft(hex, a) {
    var h = String(hex || "#888888").replace("#", "");
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    var n = parseInt(h, 16);
    var r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  function catStyle(c) {
    var col = (c && c.color) || "#888888";
    return "--cat:" + esc(col) + ";--cat-soft:" + hexSoft(col, 0.14) + ";";
  }
  function catById(id) {
    for (var i = 0; i < S.categories.length; i++) if (S.categories[i].id === id) return S.categories[i];
    return null;
  }

  /* ================= HESAPLAR ================= */
  function txEffect(t) {
    if (t.type === "income") return t.amount;
    if (t.type === "expense") return -t.amount;
    return (t.adjustSign === -1 ? -1 : 1) * t.amount; /* adjust */
  }

  function totalBalance() {
    return S.transactions.reduce(function (s, t) { return s + txEffect(t); }, 0);
  }

  function catBalance(catId) {
    return S.transactions.reduce(function (s, t) {
      if (t.categoryId !== catId || t.type === "adjust") return s;
      return s + (t.type === "income" ? t.amount : -t.amount);
    }, 0);
  }

  function catCount(catId) {
    return S.transactions.filter(function (t) { return t.categoryId === catId; }).length;
  }

  function monthTx(ym) {
    return S.transactions.filter(function (t) { return Fmt.ymOf(t.date) === ym; });
  }

  function monthTotals(ym) {
    var inc = 0, exp = 0, adj = 0, n = 0;
    monthTx(ym).forEach(function (t) {
      if (t.type === "income") inc += t.amount;
      else if (t.type === "expense") exp += t.amount;
      else adj += (t.adjustSign === -1 ? -1 : 1) * t.amount;
      n++;
    });
    return { income: inc, expense: exp, adjust: adj, net: inc - exp + adj, count: n };
  }

  function sortTxDesc(a, b) {
    if (a.date !== b.date) return a.date < b.date ? 1 : -1;
    return (b.createdAt || 0) - (a.createdAt || 0);
  }

  /* ================= KAYIT / KURAL ================= */
  var DEFAULT_CATS = [
    { name: "Dükkan çalışması", color: "#F0B429", icon: "shop" },
    { name: "Ev faturaları", color: "#4C8FF0", icon: "home" },
    { name: "Market", color: "#2DB88A", icon: "cart" },
    { name: "Araba", color: "#F08A4A", icon: "car" }
  ];

  function seedIfEmpty() {
    if (S.categories.length) return Promise.resolve();
    var t = now();
    var list = DEFAULT_CATS.map(function (d, i) {
      return { id: uid(), name: d.name, color: d.color, icon: d.icon, sortOrder: i, createdAt: t, updatedAt: t };
    });
    return Promise.all(list.map(function (c) { return DB.putCategory(c); })).then(function () {
      S.categories = list;
      DB.log("DEPO", "başlangıç kategorileri eklendi: " + list.length);
    });
  }

  /* ================= TEMA ================= */
  var mq = window.matchMedia ? window.matchMedia("(prefers-color-scheme: dark)") : null;

  function applyTheme() {
    var t = S.settings.theme || "auto";
    var dark = t === "dark" || (t === "auto" && mq && mq.matches);
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0E0D0B" : "#F5F3EE");
    var ac = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
    if (ac) ac.setAttribute("content", dark ? "black-translucent" : "default");
  }

  if (mq && mq.addEventListener) {
    mq.addEventListener("change", function () {
      if ((S.settings.theme || "auto") === "auto") applyTheme();
    });
  }

  /* ================= DEPOLAMA SAĞLIĞI ================= */
  function isStandalone() {
    try {
      if (window.navigator.standalone === true) return true;
      if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return true;
      if (window.matchMedia && window.matchMedia("(display-mode: fullscreen)").matches) return true;
    } catch (e) {}
    return false;
  }

  /* persisted() oku; izin yoksa ana ekran uygulamasında persist() iste.
     iOS'ta persist() soru sormaz, ana ekran uygulamasına verme eğilimindedir. */
  function checkStorageHealth() {
    S.storage.standalone = isStandalone();
    var sm = navigator.storage;

    if (!sm || !sm.persisted) {
      S.persist = null;
      DB.log("DEPO", "Storage API yok · kalıcı depolama istenemiyor");
      return Promise.resolve(false);
    }

    return sm.persisted().then(function (p) {
      if (p) { S.persist = true; DB.log("DEPO", "kalıcı depolama: zaten açık"); return true; }

      if (!sm.persist) { S.persist = false; DB.log("DEPO", "kalıcı depolama: kapalı, persist() yok"); return false; }

      /* yalnızca ana ekran uygulamasında iste — Safari sekmesinde iOS zaten vermez */
      if (!S.storage.standalone) {
        S.persist = false;
        DB.log("DEPO", "kalıcı depolama: kapalı (Safari sekmesi, istenmedi)");
        return false;
      }
      return sm.persist().then(function (granted) {
        S.persist = granted;
        DB.log("DEPO", "kalıcı depolama isteği: " + (granted ? "verildi" : "reddedildi"));
        return granted;
      }).catch(function (e) {
        S.persist = false;
        DB.log("DEPO", "persist hatası: " + (e && e.message ? e.message : e));
        return false;
      });
    }).catch(function (e) {
      S.persist = null;
      DB.log("DEPO", "persisted() hatası: " + (e && e.message ? e.message : e));
      return false;
    }).then(function (res) {
      if (!sm.estimate) return res;
      return sm.estimate().then(function (est) {
        if (est) {
          S.storage.usage = est.usage || 0;
          S.storage.quota = est.quota || 0;
          DB.log("DEPO", "kota " + Math.round(S.storage.quota / 1048576) + " MB, kullanım " +
            Math.round(S.storage.usage / 1024) + " KB");
        }
        return res;
      }).catch(function () { return res; });
    });
  }

  /* ================= YEDEK HATIRLATICI ================= */
  /* Veri varken ve son yedek eskimişse ana ekranda tek satır göster.
     Eşik: hiç yedek yoksa 5+ hareket, varsa 30 gün veya 40+ yeni hareket. */
  var BACKUP_DAYS = 30;
  var BACKUP_TX = 40;

  function backupDue() {
    if (!S.transactions.length) return false;
    var last = S.settings.lastBackupAt || 0;
    var since = last ? S.transactions.filter(function (t) { return (t.updatedAt || 0) > last; }).length : S.transactions.length;
    if (!last) return S.transactions.length >= 5;
    var days = (now() - last) / 86400000;
    return days >= BACKUP_DAYS || since >= BACKUP_TX;
  }

  function backupBannerHtml() {
    if (!backupDue()) return "";
    var last = S.settings.lastBackupAt;
    var text = last
      ? "Son yedek " + Fmt.fullDate(Fmt.ymd(new Date(last)))
      : "Henüz yedek almadın";
    return '<button class="bk-banner" data-act="backup">' +
      '<div class="bk-ico">' + svg("share") + '</div>' +
      '<div class="bk-body"><div class="bk-t">' + esc(text) + '</div>' +
      '<div class="bk-s">iCloud ya da Google Drive\'a kaydet</div></div>' +
      '<div class="bk-go">' + svg("chevR") + '</div></button>';
  }

  /* ================= YARDIMCI: DOM ================= */
  function toast(msg) {
    var el = $("#toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () { el.classList.remove("show"); }, 2200);
  }

  var dlgResolve = null;
  function confirmDialog(title, body, opts) {
    opts = opts || {};
    var wrap = $("#dialog");
    $("#dlg-title").textContent = title;
    $("#dlg-body").innerHTML = body || "";
    var ok = $("#dlg-ok");
    ok.textContent = opts.okText || "Sil";
    ok.className = "confirm" + (opts.danger === false ? " neutral" : "");
    /* özel diyaloglar (yedek hedefi) düğme yazılarını değiştirebilir; geri al */
    var cancel = $("#dlg-cancel");
    if (cancel) cancel.textContent = "Vazgeç";
    wrap.classList.add("show");
    return new Promise(function (res) {
      dlgResolve = res;
    });
  }
  function closeDialog(val) {
    $("#dialog").classList.remove("show");
    if (dlgResolve) { var r = dlgResolve; dlgResolve = null; r(val); }
  }

  /* ================= RENDER: KABUK ================= */
  var R = {};

  function render() {
    var dock = $("#dock");
    var noDock = S.view === "settings" || S.view === "cat" || S.view === "manage";
    dock.classList.toggle("hidden", noDock);
    $$("#dock .tab").forEach(function (b) {
      b.classList.toggle("active", b.getAttribute("data-go") === S.view ||
        (b.getAttribute("data-go") === "home" && (S.view === "cat" || S.view === "manage")));
    });

    if (S.view === "home") R.home();
    else if (S.view === "summary") R.summary();
    else if (S.view === "cat") R.catDetail();
    else if (S.view === "settings") R.settings();
    else if (S.view === "manage") R.manage();
    else R.home();

    $$(".view").forEach(function (v) {
      v.classList.toggle("active", v.id === "view-" + S.view);
    });
    window.scrollTo(0, 0);
  }

  function go(view, opts) {
    opts = opts || {};
    S.view = view;
    if (opts.catId !== undefined) S.catId = opts.catId;
    /** kategori detayında ay filtresi: yalnızca özet dağılımından gelindiğinde dolu */
    S.catMonth = (view === "cat" && opts.month) ? opts.month : null;
    render();
  }

  /* ================= RENDER: ANA EKRAN ================= */
  R.home = function () {
    var bal = totalBalance();
    var mt = monthTotals(S.month);
    var heroClass = bal < 0 ? " neg" : "";

    var chipClass = mt.net > 0 ? "up" : (mt.net < 0 ? "down" : "flat");
    var chipText = mt.count === 0
      ? "Bu ay hareket yok"
      : "Bu ay " + Fmt.sgn(mt.net) + " TL";

    var catsHtml = "";
    if (!S.categories.length) {
      catsHtml = '<div class="empty"><strong>Henüz kategori yok</strong>' +
        'Kategori eklemek için yukarıdaki “Düzenle”ye dokun.</div>';
    } else {
      catsHtml = S.categories.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
        .map(function (c) {
          var b = catBalance(c.id), n = catCount(c.id);
          var cls = b > 0 ? "pos" : (b < 0 ? "neg" : "zero");
          return '<button class="cat" data-cat="' + esc(c.id) + '" style="' + catStyle(c) + '">' +
            '<div class="cat-ico">' + svg(c.icon) + '</div>' +
            '<div class="cat-body"><div class="cat-name">' + esc(c.name) + '</div>' +
            '<div class="cat-sub">' + n + ' hareket</div></div>' +
            '<div class="cat-bal ' + cls + '">' + Fmt.plainSgn(b) + '</div></button>';
        }).join("");
    }

    var recent = S.transactions.slice().sort(sortTxDesc).slice(0, 4);
    var recentHtml = "";
    if (!recent.length) {
      recentHtml = '<div class="empty"><strong>Henüz hareket yok</strong>' +
        'Alt ortadaki − ile gider, + ile gelir ekleyebilirsin.</div>';
    } else {
      recentHtml = recent.map(txRowHtml).join("");
    }

    var html =
      '<div class="topbar">' +
        '<div class="brand"><div class="brand-mark">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6v12M17 6v12M7 12h10"/></svg>' +
        '</div><div class="brand-name">Hesap</div></div>' +
        '<button class="icon-btn" data-act="settings" aria-label="Ayarlar">' + svg("gear") + '</button>' +
      '</div>' +

      '<div class="hero">' +
        '<div class="hero-top"><div class="hero-label">Toplam bakiye</div>' +
          '<div class="adj">' +
            '<button data-act="adjust" data-sign="-1" aria-label="Bakiyeyi azalt">' + svgBold("minus") + '</button>' +
            '<button data-act="adjust" data-sign="1" aria-label="Bakiyeyi artır">' + svgBold("plus") + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="hero-amount' + heroClass + '"><span class="num">' + Fmt.plainSgn(bal) + '</span><span class="ccy">TL</span></div>' +
        '<div class="hero-foot">' +
          '<div class="chip ' + chipClass + '">' + svg("trend") + esc(chipText) + '</div>' +
          '<div class="hero-meta">' + mt.count + ' hareket</div>' +
        '</div>' +
      '</div>' +

      '<div class="sec-head"><div class="sec-title">Kategoriler</div>' +
        '<button class="sec-action" data-act="manage">Düzenle</button></div>' +
      (window.DriveSync && DriveSync.configured()
        ? '<div id="drv-slot">' + DriveSync.bannerHtml() + '</div>'
        : backupBannerHtml()) +
      '<div class="cats">' + catsHtml + '</div>' +

      '<div class="sec-head"><div class="sec-title">Son hareketler</div></div>' +
      '<div class="recent">' + recentHtml + '</div>';

    $("#view-home").innerHTML = html;
  };

  function txRowHtml(t, opts) {
    opts = opts || {};
    var cat = t.categoryId ? catById(t.categoryId) : null;
    var isAdj = t.type === "adjust";
    var eff = txEffect(t);
    var cls = eff > 0 ? "pos" : (eff < 0 ? "neg" : "zero");
    var title = t.note ? t.note : (isAdj ? "Bakiye düzeltmesi" : (cat ? cat.name : "Kategorisiz"));
    var sub;
    if (isAdj) sub = "Bakiye düzeltmesi · " + Fmt.dayLabel(t.date);
    else if (opts.showDay) sub = cat ? cat.name : "Kategorisiz";
    else sub = (cat ? cat.name : "Kategorisiz") + " · " + Fmt.dayLabel(t.date);

    var ico;
    if (isAdj) ico = '<div class="tx-ico adjust">' + svg("trend") + '</div>';
    else if (cat) ico = '<div class="tx-ico" style="' + catStyle(cat) + '">' + svg(cat.icon) + '</div>';
    else ico = '<div class="tx-ico adjust">' + svg("tag") + '</div>';

    return '<button class="tx" data-tx="' + esc(t.id) + '">' + ico +
      '<div class="tx-body"><div class="tx-name">' + esc(title) + '</div>' +
      '<div class="tx-note">' + esc(sub) + '</div></div>' +
      '<div class="tx-amt ' + cls + '">' + Fmt.sgn(eff) + '</div></button>';
  }

  /* ================= RENDER: KATEGORİ DETAYI ================= */
  R.catDetail = function () {
    var c = catById(S.catId);
    if (!c) { S.view = "home"; R.home(); return; }
    /* ay filtresi: yalnızca özet dağılımından gelindiğinde o ayki hareketler */
    var only = S.catMonth;
    var list = S.transactions.filter(function (t) {
      if (t.categoryId !== c.id) return false;
      return only ? Fmt.ymOf(t.date) === only : true;
    }).sort(sortTxDesc);
    var bal = catBalance(c.id);
    var cls = bal > 0 ? "pos" : (bal < 0 ? "neg" : "zero");
    var ym = Fmt.monthLabel(only || S.month);

    var body = "";
    if (!list.length) {
      body = '<div class="empty"><strong>Bu kategoride hareket yok</strong>' +
        'Alt ortadaki + / − ile ilk hareketi ekleyebilirsin.</div>';
    } else {
      var lastDay = null;
      body = list.map(function (t) {
        var out = "";
        if (t.date !== lastDay) { out += '<div class="day-lab">' + esc(Fmt.dayLabel(t.date)) + '</div>'; lastDay = t.date; }
        out += txRowHtml(t, { showDay: true });
        return out;
      }).join("");
    }

    $("#view-cat").innerHTML =
      '<div class="nav-back">' +
        '<button class="back" data-act="back">' + svg("chevL") + (only ? 'Özet' : 'Ana Sayfa') + '</button>' +
        '<button class="link-gold" data-act="editCat" data-id="' + esc(c.id) + '">Düzenle</button>' +
      '</div>' +
      '<div class="cat-hero" style="' + catStyle(c) + '">' +
        '<div class="big-ico">' + svg(c.icon) + '</div>' +
        '<div><h1>' + esc(c.name) + '</h1>' +
          '<div class="sum ' + cls + '">' + Fmt.plainSgn(bal) + ' TL</div>' +
          '<div class="meta">' + list.length + ' hareket · ' + esc(ym) + '</div>' +
        '</div>' +
      '</div>' +
      '<div class="tx-list">' + body + '</div>';
  };

  /* ================= RENDER: ÖZET ================= */
  R.summary = function () {
    var ym = S.month;
    var mt = monthTotals(ym);
    var list = monthTx(ym);
    var maxBase = Math.max(mt.income, mt.expense);
    var inPct = maxBase > 0 ? Math.max(2, (mt.income / maxBase) * 100) : 0;
    var outPct = maxBase > 0 ? Math.max(2, (mt.expense / maxBase) * 100) : 0;

    var netCls = mt.net > 0 ? "" : (mt.net < 0 ? " neg" : " zero");
    var netTxt = mt.net > 0 ? "+" + Fmt.money(mt.net) : Fmt.plainSgn(mt.net);

    /* gider dağılımı */
    var byCat = {};
    list.forEach(function (t) {
      if (t.type !== "expense") return;
      var k = t.categoryId || "__none";
      byCat[k] = (byCat[k] || 0) + t.amount;
    });
    var dist = Object.keys(byCat).map(function (k) {
      var c = k === "__none" ? null : catById(k);
      return {
        id: k,
        name: c ? c.name : "Kategorisiz",
        color: c ? c.color : "#8E877C",
        amount: byCat[k]
      };
    }).sort(function (a, b) { return b.amount - a.amount; });

    var totalExp = mt.expense;
    var distHtml;
    if (!dist.length || totalExp <= 0) {
      distHtml = '<div class="empty"><strong>Bu ay gider yok</strong>' +
        'Gider eklenince dağılım burada görünür.</div>';
    } else {
      var acc = 0, segs = [];
      var gap = dist.length > 1 ? 0.45 : 0;
      dist.forEach(function (d, i) {
        var start = acc;
        acc += (d.amount / totalExp) * 100;
        var end = i === dist.length - 1 ? 100 : acc;
        segs.push(d.color + " " + start.toFixed(2) + "% " + end.toFixed(2) + "%");
        if (i < dist.length - 1) {
          segs.push("var(--card) " + end.toFixed(2) + "% " + (end + gap).toFixed(2) + "%");
        }
      });
      var legend = dist.map(function (d) {
        var p = Math.round((d.amount / totalExp) * 100);
        return '<button class="leg" data-dist="' + esc(d.id) + '">' +
          '<i style="background:' + esc(d.color) + '"></i>' +
          '<div style="flex:1;min-width:0"><div class="ln">' + esc(d.name) + '</div>' +
          '<div class="lv">' + Fmt.money(d.amount) + ' TL</div></div>' +
          '<div class="lp">%' + p + '</div></button>';
      }).join("");

      distHtml =
        '<div class="dist-body">' +
          '<div class="donut-wrap"><div class="donut" style="background:conic-gradient(from -90deg,' + segs.join(",") + ')"></div>' +
            '<div class="donut-hole"><div class="dlab">Gider</div>' +
            '<div class="dnum">' + Fmt.money(totalExp) + '</div></div>' +
          '</div>' +
          '<div class="legend">' + legend + '</div>' +
        '</div>';
    }

    var top = list.filter(function (t) { return t.type === "expense"; })
      .sort(function (a, b) { return b.amount - a.amount; }).slice(0, 3);
    var topHtml = !top.length
      ? '<div class="empty"><strong>Bu ay gider yok</strong>En büyük giderler burada listelenir.</div>'
      : top.map(function (t) { return txRowHtml(t); }).join("");

    $("#view-summary").innerHTML =
      '<div class="topbar">' +
        '<div class="brand"><div class="brand-mark">' +
          '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 6v12M17 6v12M7 12h10"/></svg>' +
        '</div><div class="brand-name">Hesap</div></div>' +
        '<button class="icon-btn" data-act="settings" aria-label="Ayarlar">' + svg("gear") + '</button>' +
      '</div>' +

      '<div class="month-nav"><h1>' + esc(Fmt.monthLabel(ym)) + '</h1>' +
        '<div class="chev-pair">' +
          '<button class="icon-btn" data-act="prevMonth" aria-label="Önceki ay">' + svgBold("chevL") + '</button>' +
          '<button class="icon-btn" data-act="nextMonth" aria-label="Sonraki ay">' + svgBold("chevR") + '</button>' +
        '</div></div>' +

      '<div class="net-card">' +
        '<div class="lab">Bu ay net</div>' +
        '<div class="net' + netCls + '"><span class="num">' + netTxt + '</span><span class="ccy">TL</span></div>' +
        '<div class="bars">' +
          '<div class="bar-row"><div class="bar-meta"><span class="k">Gelir</span>' +
            '<span class="v in">' + Fmt.money(mt.income) + '</span></div>' +
            '<div class="track"><i class="in" style="width:' + inPct.toFixed(2) + '%"></i></div></div>' +
          '<div class="bar-row"><div class="bar-meta"><span class="k">Gider</span>' +
            '<span class="v out">' + Fmt.money(mt.expense) + '</span></div>' +
            '<div class="track"><i class="out" style="width:' + outPct.toFixed(2) + '%"></i></div></div>' +
        '</div>' +
      '</div>' +

      '<div class="dist"><h2>Gider dağılımı</h2>' + distHtml + '</div>' +

      '<div class="sec-head"><div class="sec-title">En büyük giderler</div></div>' +
      '<div class="top-exp">' + topHtml + '</div>';
  };

  /* ================= RENDER: AYARLAR ================= */
  function storagePersistHint() {
    if (S.persist === true) return "Açık — iOS bu veriyi kendiliğinden silmez.";
    if (S.storage.standalone) return "Kapalı. Uygulamayı kapatıp ana ekrandan yeniden açınca tekrar istenir.";
    return "Ana ekrana eklenince açılır. Şu an Safari sekmesindesin.";
  }

  function storageUsageHint() {
    if (!S.storage.quota) return "Bilinmiyor";
    var mb = Math.round(S.storage.quota / 1048576);
    var kb = Math.round(S.storage.usage / 1024);
    return kb + " KB kullanılıyor · " + mb + " MB ayrılabilir";
  }

  R.settings = function () {
    var t = S.settings.theme || "auto";
    var lastB = S.settings.lastBackupAt ? Fmt.fullDate(Fmt.ymd(new Date(S.settings.lastBackupAt))) : "Hiç alınmadı";

    $("#view-settings").innerHTML =
      '<div class="nav-back">' +
        '<button class="back" data-act="back">' + svg("chevL") + 'Geri</button>' +
        '<div class="nav-title">Ayarlar</div><div style="width:62px"></div>' +
      '</div>' +

      '<div class="sec-head"><div class="sec-title">Tema</div></div>' +
      '<div class="set-group"><div class="set-row col">' +
        '<div class="theme-seg">' +
          '<button data-themebtn="auto" class="' + (t === "auto" ? "on" : "") + '">Otomatik</button>' +
          '<button data-themebtn="light" class="' + (t === "light" ? "on" : "") + '">Açık</button>' +
          '<button data-themebtn="dark" class="' + (t === "dark" ? "on" : "") + '">Koyu</button>' +
        '</div>' +
      '</div></div>' +

      (window.DriveSync ? DriveSync.settingsHtml() : '') +

      '<div class="sec-head"><div class="sec-title">Dosya yedeği</div></div>' +
      '<div class="set-group">' +
        '<div class="set-row col">' +
          '<div><div class="k">Yedek hedefi</div><div class="d">' + esc(backupTargetHint()) + '</div></div>' +
          '<div class="theme-seg">' +
            '<button data-bktarget="ask" class="' + ((S.settings.backupTarget || "ask") === "ask" ? "on" : "") + '">Sor</button>' +
            '<button data-bktarget="icloud" class="' + (S.settings.backupTarget === "icloud" ? "on" : "") + '">iCloud</button>' +
            '<button data-bktarget="gdrive" class="' + (S.settings.backupTarget === "gdrive" ? "on" : "") + '">Google Drive</button>' +
          '</div>' +
        '</div>' +
        '<button class="set-row" data-act="backup">' +
          '<div><div class="k">Yedek al</div><div class="d">Tüm veriyi tek JSON dosyası olarak dışa aktar</div></div>' +
          '<div class="v">' + esc(lastB) + '</div>' +
        '</button>' +
        '<button class="set-row" data-act="restore">' +
          '<div><div class="k">Yedek yükle</div><div class="d">JSON dosyasından geri yükle (mevcut verinin üzerine yazar)</div></div>' +
          '<div class="v">' + svg("share") + '</div>' +
        '</button>' +
      '</div>' +

      '<div class="note-box"><strong>iPhone notu:</strong> Safari sekmesi ile ana ekrana eklenen uygulama ayrı depolama kullanır. ' +
        'Birinde girdiğin hareket diğerinde görünmez. Simgeyi silersen o depolama da silinir. ' +
        'Bu yüzden ara sıra <strong>Yedek al</strong> ve yedeği <strong>iCloud Drive</strong>\'a kaydet.</div>' +

      '<div class="sec-head"><div class="sec-title">Depolama</div></div>' +
      '<div class="set-group">' +
        '<div class="set-row">' +
          '<div><div class="k">Kalıcı depolama</div><div class="d">' + esc(storagePersistHint()) + '</div></div>' +
          '<div class="v' + (S.persist ? " ok" : (S.persist === false ? " warn" : "")) + '">' +
            esc(S.persist === true ? "Açık" : (S.persist === false ? "Kapalı" : "Bilinmiyor")) + '</div>' +
        '</div>' +
        '<div class="set-row">' +
          '<div><div class="k">Kullanım</div><div class="d">' + esc(storageUsageHint()) + '</div></div>' +
          '<div class="v"></div>' +
        '</div>' +
      '</div>' +

      '<div class="sec-head"><div class="sec-title">Veri</div></div>' +
      '<div class="set-group">' +
        '<button class="set-row" data-act="manage">' +
          '<div><div class="k">Kategoriler</div><div class="d">Ekle, yeniden adlandır, renk ve ikon</div></div>' +
          '<div class="v">' + S.categories.length + '</div>' +
        '</button>' +
      '</div>' +

      '<div class="about">' +
        '<div class="app-name">Hesap</div>' +
        '<button class="ver" data-act="debug">v' + APP_VERSION + '</button>' +
        '<div class="tiny">' + (window.DriveSync && DriveSync.configured()
          ? "Veriler bu cihazda saklanır, Google Drive'a yedeklenir."
          : "Veriler yalnızca bu cihazda saklanır.") + '</div>' +
      '</div>';

    $("#view-settings").classList.add("no-dock");
  };

  /* ================= RENDER: KATEGORİ YÖNETİMİ ================= */
  R.manage = function () {
    var rows = S.categories.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
      .map(function (c) {
        var n = catCount(c.id);
        return '<div class="manage-row" style="' + catStyle(c) + '">' +
          '<div class="cat-ico">' + svg(c.icon) + '</div>' +
          '<div class="cat-body" data-act="editCat" data-id="' + esc(c.id) + '">' +
            '<div class="cat-name">' + esc(c.name) + '</div>' +
            '<div class="cat-sub">' + n + ' hareket</div></div>' +
          '<div class="ops">' +
            '<button class="mini-btn" data-act="editCat" data-id="' + esc(c.id) + '" aria-label="Düzenle">' + svg("edit") + '</button>' +
            '<button class="mini-btn del" data-act="delCat" data-id="' + esc(c.id) + '" aria-label="Sil">' + svg("trash") + '</button>' +
          '</div></div>';
      }).join("");

    var html =
      '<div class="nav-back">' +
        '<button class="back" data-act="back">' + svg("chevL") + 'Geri</button>' +
        '<div class="nav-title">Kategoriler</div><div style="width:62px"></div>' +
      '</div>' +
      (rows || '<div class="empty"><strong>Kategori yok</strong>Aşağıdan ilk kategoriyi ekle.</div>') +
      '<button class="add-cat" data-act="newCat">' + svgBold("plus") + 'Yeni kategori</button>';

    $("#view-manage").innerHTML = html;
    $("#view-manage").classList.add("no-dock");
  };

  /* ================= HAREKET EKLE / DÜZENLE ================= */
  var SHT = { el: $("#sheet"), body: $("#sheet-body") };

  function resetForm(type) {
    S.sheetMode = "new";
    S.editId = null;
    S.formType = type || "expense";
    S.formCat = null;
    S.formDate = Fmt.todayYMD();
    S.adjustSign = 1;
  }

  function openAddSheet(type) {
    resetForm(type);
    renderSheet();
    openSheet();
    setTimeout(function () {
      var inp = $("#amount-input");
      if (inp) inp.focus();
    }, 320);
  }

  function openAdjustSheet(sign) {
    resetForm("adjust");
    S.adjustSign = sign === -1 ? -1 : 1;
    renderSheet();
    openSheet();
    setTimeout(function () {
      var inp = $("#amount-input");
      if (inp) inp.focus();
    }, 320);
  }

  function openEditTx(id) {
    var t = null;
    for (var i = 0; i < S.transactions.length; i++) if (S.transactions[i].id === id) t = S.transactions[i];
    if (!t) return;
    S.sheetMode = "edit";
    S.editId = t.id;
    S.formType = t.type;
    S.formCat = t.categoryId || null;
    S.formDate = t.date;
    S.adjustSign = t.adjustSign === -1 ? -1 : 1;
    renderSheet(t);
    openSheet();
  }

  function openSheet() {
    $("#backdrop").classList.add("show");
    SHT.el.classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeSheet() {
    $("#backdrop").classList.remove("show");
    SHT.el.classList.remove("show");
    document.body.style.overflow = "";
    formError("");
  }

  function formError(msg) {
    var el = $("#form-error");
    if (!el) return;
    el.textContent = msg || "";
    el.classList.toggle("show", !!msg);
  }

  function renderSheet(existing) {
    var isEdit = S.sheetMode === "edit";
    var isAdjust = S.formType === "adjust";
    var isInc = S.formType === "income";
    var t = existing || null;

    var amountVal = "";
    if (t) amountVal = Fmt.money(t.amount);

    var head, sub, mid;

    if (isAdjust) {
      head = isEdit ? "Düzeltmeyi düzenle" : "Bakiye düzeltmesi";
      sub = "Kategoriye yazılmaz, toplam bakiyeyi " + (S.adjustSign < 0 ? "azaltır" : "artırır") + ".";
      mid = '<div class="amount-field' + (S.adjustSign < 0 ? "" : " income") + '">' +
        '<input id="amount-input" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(amountVal) + '" aria-label="Tutar">' +
        '<div class="ccy">Türk Lirası</div></div>' +
        '<div class="field-label">Not</div>' +
        '<div class="input-row">' + svg("note") +
          '<input id="note-input" type="text" maxlength="120" autocomplete="off" placeholder="İsteğe bağlı" value="' + esc(t ? t.note : "") + '"></div>' +
        '<div class="field-label">Tarih</div>' +
        '<div class="input-row date-row">' + svg("cal") +
          '<div class="val" id="date-label">' + esc(Fmt.fullDate(S.formDate)) + '</div>' +
          '<input id="date-input" type="date" value="' + esc(S.formDate) + '" aria-label="Tarih"></div>';
    } else {
      head = isEdit ? "Hareketi düzenle" : "Hareket ekle";
      sub = "";

      var seg = '<div class="seg">' +
        '<button data-type="expense" class="' + (!isInc ? "on" : "") + '">Gider</button>' +
        '<button data-type="income" class="' + (isInc ? "on income" : "") + '">Gelir</button>' +
        '</div>';

      var picks = S.categories.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
        .map(function (c) {
          return '<button class="pick' + (S.formCat === c.id ? " on" : "") + '" data-pick="' + esc(c.id) + '" style="' + catStyle(c) + '">' +
            '<div class="dot">' + svg(c.icon) + '</div><span>' + esc(c.name) + '</span></button>';
        }).join("");
      if (!picks) {
        picks = '<div class="empty" style="grid-column:1/-1"><strong>Kategori yok</strong>Önce Ayarlar → Kategoriler\'den ekle.</div>';
      }

      mid = seg +
        '<div class="amount-field' + (isInc ? " income" : "") + '">' +
        '<input id="amount-input" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(amountVal) + '" aria-label="Tutar">' +
        '<div class="ccy">Türk Lirası</div></div>' +
        '<div class="field-label">Kategori</div>' +
        '<div class="cat-pick">' + picks + '</div>' +
        '<div class="field-label">Not</div>' +
        '<div class="input-row">' + svg("note") +
          '<input id="note-input" type="text" maxlength="120" autocomplete="off" placeholder="İsteğe bağlı" value="' + esc(t ? t.note : "") + '"></div>' +
        '<div class="field-label">Tarih</div>' +
        '<div class="input-row date-row">' + svg("cal") +
          '<div class="val" id="date-label">' + esc(Fmt.fullDate(S.formDate)) + '</div>' +
          '<input id="date-input" type="date" value="' + esc(S.formDate) + '" aria-label="Tarih"></div>';
    }

    var actions = isEdit
      ? '<button class="save-btn" data-act="save">Kaydet</button>' +
        '<button class="danger-btn" data-act="dedit">Hareketi sil</button>'
      : '<button class="save-btn" data-act="save">Kaydet</button>' +
        (isAdjust ? '' : '<button class="ghost-btn" data-act="saveNext">Kaydet ve devam et</button>');

    SHT.body.innerHTML =
      '<div class="sheet-title">' + esc(head) + '</div>' +
      (sub ? '<div class="sheet-sub">' + esc(sub) + '</div>' : '') +
      '<div class="sheet-scroll">' + mid +
        '<div class="form-error" id="form-error"></div>' +
        actions +
      '</div>';

    var inp = $("#amount-input");
    if (inp) {
      inp.value = amountVal;
      inp.addEventListener("input", function () {
        var caretAtEnd = inp.selectionStart === inp.value.length;
        var v = Fmt.liveAmount(inp.value);
        inp.value = v;
        if (caretAtEnd) { try { inp.setSelectionRange(v.length, v.length); } catch (e) {} }
        formError("");
      });
      inp.addEventListener("keydown", function (e) {
        if (e.key === "Enter") { e.preventDefault(); saveForm(false); }
      });
    }
    var di = $("#date-input");
    if (di) di.addEventListener("change", function () {
      S.formDate = di.value || Fmt.todayYMD();
      var lb = $("#date-label");
      if (lb) lb.textContent = Fmt.fullDate(S.formDate);
    });
    var ni = $("#note-input");
    if (ni) ni.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); ni.blur(); saveForm(false); }
    });

    $$("[data-type]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        S.formType = b.getAttribute("data-type");
        renderSheet(t);
        var a = $("#amount-input"); if (a) a.focus();
      });
    });
    $$("[data-pick]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        S.formCat = b.getAttribute("data-pick");
        $$("[data-pick]", SHT.body).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
        formError("");
      });
    });
  }

  function saveForm(andContinue) {
    var amtEl = $("#amount-input");
    var noteEl = $("#note-input");
    var dateEl = $("#date-input");
    var amount = Fmt.parseAmount(amtEl ? amtEl.value : "");
    var date = (dateEl && dateEl.value) || Fmt.todayYMD();
    var note = noteEl ? noteEl.value.trim() : "";

    if (amount <= 0) { formError("Tutar 0'dan büyük olmalı."); if (amtEl) amtEl.focus(); return; }
    if (S.formType !== "adjust" && !S.formCat) { formError("Bir kategori seç."); return; }

    var isEdit = S.sheetMode === "edit";
    var t = now();

    var rec;
    if (isEdit) {
      var old = null;
      for (var i = 0; i < S.transactions.length; i++) if (S.transactions[i].id === S.editId) old = S.transactions[i];
      if (!old) { formError("Hareket bulunamadı."); return; }
      rec = {
        id: old.id,
        type: S.formType,
        amount: amount,
        categoryId: S.formType === "adjust" ? null : S.formCat,
        note: note,
        date: date,
        createdAt: old.createdAt,
        updatedAt: t
      };
      if (S.formType === "adjust") rec.adjustSign = S.adjustSign;
    } else {
      rec = {
        id: uid(),
        type: S.formType,
        amount: amount,
        categoryId: S.formType === "adjust" ? null : S.formCat,
        note: note,
        date: date,
        createdAt: t,
        updatedAt: t
      };
      if (S.formType === "adjust") rec.adjustSign = S.adjustSign;
    }

    DB.putTransaction(rec).then(function (ok) {
      if (!ok) { formError("Kayıt doğrulanamadı, tekrar dene."); return; }
      return loadData().then(function () {
        if (andContinue && !isEdit) {
          var keepCat = S.formCat, keepType = S.formType, keepDate = S.formDate;
          var a = $("#amount-input"); if (a) { a.value = ""; }
          var n = $("#note-input"); if (n) n.value = "";
          S.formCat = keepCat; S.formType = keepType; S.formDate = keepDate;
          formError("");
          render(); /* arkadaki ekran güncel kalsın, alt sayfa açık kalır */
          var ai = $("#amount-input"); if (ai) ai.focus();
          toast("Kaydedildi");
        } else {
          closeSheet();
          render();
          toast(isEdit ? "Güncellendi" : "Kaydedildi");
        }
      });
    }).catch(function (e) {
      DB.log("DEPO", "yazma hatası: " + (e && e.message ? e.message : e));
      formError("Kaydedilemedi. Depolama hatası.");
    });
  }

  function deleteCurrentTx() {
    var id = S.editId;
    if (!id) return;
    confirmDialog("Hareketi sil", "Bu hareket silinsin mi? Bakiyeler buna göre güncellenir.", { okText: "Sil" })
      .then(function (ok) {
        if (!ok) return;
        DB.deleteTransaction(id).then(function () {
          return loadData();
        }).then(function () {
          closeSheet();
          render();
          toast("Silindi");
        });
      });
  }

  /* ================= KATEGORİ FORMU ================= */
  var catForm = { id: null, name: "", color: PALETTE[0], icon: "shop" };

  function openCatSheet(catId) {
    var c = catId ? catById(catId) : null;
    catForm = c
      ? { id: c.id, name: c.name, color: c.color, icon: c.icon }
      : { id: null, name: "", color: PALETTE[Math.floor(Math.random() * PALETTE.length)], icon: "tag" };
    renderCatSheet();
    openSheet();
    setTimeout(function () {
      var n = $("#cat-name");
      if (n) { n.focus(); try { n.setSelectionRange(n.value.length, n.value.length); } catch (e) {} }
    }, 320);
  }

  function renderCatSheet() {
    var isEdit = !!catForm.id;
    var sw = PALETTE.map(function (p) {
      return '<button class="sw' + (catForm.color.toLowerCase() === p.toLowerCase() ? " on" : "") +
        '" data-col="' + esc(p) + '" style="background:' + esc(p) + '" aria-label="' + esc(p) + '"></button>';
    }).join("");
    var ic = ICON_KEYS.map(function (k) {
      return '<button class="ic' + (catForm.icon === k ? " on" : "") + '" data-icon="' + esc(k) + '" aria-label="' + esc(k) + '">' + svg(k) + '</button>';
    }).join("");

    SHT.body.innerHTML =
      '<div class="sheet-title">' + (isEdit ? "Kategoriyi düzenle" : "Yeni kategori") + '</div>' +
      '<div class="sheet-scroll">' +
        '<div class="field-label">Ad</div>' +
        '<div class="input-row">' + svg("tag") +
          '<input id="cat-name" type="text" maxlength="40" autocomplete="off" placeholder="Kategori adı" value="' + esc(catForm.name) + '"></div>' +
        '<div class="field-label">Renk</div>' +
        '<div class="swatches">' + sw + '</div>' +
        '<div class="field-label">İkon</div>' +
        '<div class="icon-grid">' + ic + '</div>' +
        '<div class="form-error" id="form-error"></div>' +
        '<button class="save-btn" data-act="saveCat">Kaydet</button>' +
        (isEdit ? '<button class="danger-btn" data-act="delCat" data-id="' + esc(catForm.id) + '">Kategoriyi sil</button>' : '') +
      '</div>';

    $$("[data-col]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        catForm.color = b.getAttribute("data-col");
        $$("[data-col]", SHT.body).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
    });
    $$("[data-icon]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        catForm.icon = b.getAttribute("data-icon");
        $$("[data-icon]", SHT.body).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
    });
    var n = $("#cat-name");
    if (n) n.addEventListener("input", function () { formError(""); });
  }

  function saveCat() {
    var nameEl = $("#cat-name");
    var name = (nameEl ? nameEl.value : "").trim();
    if (!name) { formError("Kategori adı boş olamaz."); if (nameEl) nameEl.focus(); return; }
    var t = now();
    var rec;
    if (catForm.id) {
      var old = catById(catForm.id);
      if (!old) { formError("Kategori bulunamadı."); return; }
      rec = {
        id: old.id, name: name, color: catForm.color, icon: catForm.icon,
        sortOrder: old.sortOrder || 0, createdAt: old.createdAt, updatedAt: t
      };
    } else {
      var maxOrder = S.categories.reduce(function (m, c) { return Math.max(m, c.sortOrder || 0); }, -1);
      rec = { id: uid(), name: name, color: catForm.color, icon: catForm.icon, sortOrder: maxOrder + 1, createdAt: t, updatedAt: t };
    }
    DB.putCategory(rec).then(function (ok) {
      if (!ok) { formError("Kategori doğrulanamadı, tekrar dene."); return; }
      return loadData().then(function () {
        closeSheet();
        if (S.view !== "manage" && S.view !== "cat") S.view = "manage";
        render();
        toast(catForm.id ? "Kategori güncellendi" : "Kategori eklendi");
      });
    });
  }

  function deleteCat(id) {
    var c = catById(id);
    if (!c) return;
    var n = catCount(id);
    var body = n > 0
      ? '“' + esc(c.name) + '” kategorisinde <strong>' + n + ' hareket</strong> var. Kategoriyle birlikte bu hareketler de silinecek. Bu işlem geri alınamaz.'
      : '“' + esc(c.name) + '” kategorisi silinsin mi?';
    confirmDialog("Kategoriyi sil", body, { okText: n > 0 ? "Hepsini sil" : "Sil" }).then(function (ok) {
      if (!ok) return;
      DB.deleteTransactionsByCategory(id).then(function () {
        return DB.deleteCategory(id);
      }).then(function () {
        return loadData();
      }).then(function () {
        closeSheet();
        if (S.view === "cat" && S.catId === id) S.view = "home";
        if (S.view !== "manage" && S.view !== "home" && S.view !== "summary") S.view = "manage";
        render();
        toast("Kategori silindi");
      });
    });
  }

  /* ================= YEDEK ================= */
  function buildBackup() {
    return {
      app: "hesap",
      format: 1,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      settings: { theme: S.settings.theme || "auto" },
      categories: S.categories.map(function (c) {
        return { id: c.id, name: c.name, color: c.color, icon: c.icon, sortOrder: c.sortOrder, createdAt: c.createdAt, updatedAt: c.updatedAt };
      }),
      transactions: S.transactions.map(function (t) {
        var o = {
          id: t.id, type: t.type, amount: t.amount, categoryId: t.categoryId || null,
          note: t.note || "", date: t.date, createdAt: t.createdAt, updatedAt: t.updatedAt
        };
        if (t.type === "adjust") o.adjustSign = t.adjustSign === -1 ? -1 : 1;
        return o;
      })
    };
  }

  /* yedek hedefi: ios'ta ikisi de Web Share üzerinden gider,
     yalnızca yönlendirme metni ve dosya adı değişir */
  var BACKUP_TARGETS = {
    ask: { label: "Sor", hint: "Her yedekte nereye kaydedeceğini sorar." },
    icloud: { label: "iCloud", hint: "Paylaş → Dosyalar → iCloud Drive", prefix: "hesap-yedek-icloud-" },
    gdrive: { label: "Google Drive", hint: "Paylaş → Google Drive", prefix: "hesap-yedek-gdrive-" }
  };

  function backupTargetHint() {
    var t = S.settings.backupTarget || "ask";
    return (BACKUP_TARGETS[t] || BACKUP_TARGETS.ask).hint;
  }

  function askBackupTarget() {
    var wrap = document.getElementById("dialog");
    document.getElementById("dlg-title").textContent = "Yedeği nereye kaydet?";
    document.getElementById("dlg-body").innerHTML =
      "Paylaşım sayfası açılacak. Orada <strong>Dosyalar → iCloud Drive</strong> ya da " +
      "<strong>Google Drive</strong> seçebilirsin.";
    var ok = document.getElementById("dlg-ok");
    ok.textContent = "iCloud Drive";
    ok.className = "confirm neutral";
    var cancel = document.getElementById("dlg-cancel");
    cancel.textContent = "Google Drive";
    /* dlgResolve'u confirmDialog değil bu diyalog sahiplenir */
    wrap.classList.add("show");
    return new Promise(function (res) {
      /* true = iCloud düğmesi, false = Google Drive düğmesi, null = vazgeç/Esc */
      dlgResolve = function (val) { res(val === true ? "icloud" : (val === false ? "gdrive" : null)); };
    });
  }

  function doBackup() {
    var t = S.settings.backupTarget || "ask";
    var go = (t === "ask") ? askBackupTarget() : Promise.resolve(t);
    go.then(function (target) {
      if (!target) return; /* vazgeçildi */
      var tg = BACKUP_TARGETS[target] || BACKUP_TARGETS.ask;
      var data = buildBackup();
      var txt = JSON.stringify(data, null, 2);
      var stamp = Fmt.todayYMD();
      var fname = (tg.prefix || "hesap-yedek-") + stamp + ".json";

      var done = function (how) {
        DB.setSetting("lastBackupAt", now()).then(function () {
          S.settings.lastBackupAt = now();
          DB.log("YEDEK", "dışa aktarıldı: " + fname + " (" + data.categories.length + " kategori, " +
            data.transactions.length + " hareket, " + txt.length + " bayt) hedef:" + target + " yol:" + how);
          toast("Yedek alındı · " + tg.label);
          if (S.view === "settings") R.settings();
        });
      };

      try {
        var file = new File([txt], fname, { type: "application/json" });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file], title: "Hesap yedeği (" + tg.label + ")" }).then(function () {
            done("paylaşım");
          }).catch(function (err) {
            if (err && err.name === "AbortError") return;
            downloadFile(txt, fname, done);
          });
          return;
        }
      } catch (e) {}

      downloadFile(txt, fname, done);
    });
  }

  function downloadFile(txt, fname, done) {
    try {
      var blob = new Blob([txt], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement("a");
      a.href = url;
      a.download = fname;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      setTimeout(function () {
        URL.revokeObjectURL(url);
        if (a.parentNode) a.parentNode.removeChild(a);
      }, 1500);
      done("indirme");
    } catch (e) {
      DB.log("YEDEK", "indirme hatası: " + (e && e.message ? e.message : e));
      toast("Dosya oluşturulamadı");
    }
  }

  function pickBackup() {
    var inp = document.createElement("input");
    inp.type = "file";
    inp.accept = "application/json,.json";
    inp.style.display = "none";
    document.body.appendChild(inp);
    inp.addEventListener("change", function () {
      var f = inp.files && inp.files[0];
      if (!f) { if (inp.parentNode) inp.parentNode.removeChild(inp); return; }
      var r = new FileReader();
      r.onload = function () {
        if (inp.parentNode) inp.parentNode.removeChild(inp);
        handleImportText(String(r.result || ""));
      };
      r.onerror = function () {
        if (inp.parentNode) inp.parentNode.removeChild(inp);
        DB.log("YEDEK", "dosya okunamadı");
        toast("Dosya okunamadı");
      };
      r.readAsText(f);
    });
    inp.click();
  }

  /* yedek nesnesini doğrula ve temizle — dosyadan yüklemede ve Drive'dan çekmede ortak */
  function normalizeBackup(data) {
    if (!data || data.app !== "hesap" || typeof data.format !== "number") {
      return { error: "Bu dosya bir Hesap yedeği değil (<code>app: \"hesap\"</code> bulunamadı).", code: "app" };
    }
    if (data.format > 1) {
      return { error: "Bu yedek daha yeni bir sürümle alınmış (format " + esc(data.format) + "). Uygulamayı güncelle.", code: "format" };
    }
    if (!Array.isArray(data.categories) || !Array.isArray(data.transactions)) {
      return { error: "Dosyada <code>categories</code> veya <code>transactions</code> listesi yok.", code: "arrays" };
    }
    var cats = [], txs = [], bad = 0, t = now();
    data.categories.forEach(function (c) {
      if (!c || !c.id || typeof c.name !== "string") { bad++; return; }
      cats.push({
        id: String(c.id), name: String(c.name).slice(0, 60),
        color: /^#[0-9a-fA-F]{6}$/.test(c.color || "") ? c.color : "#8E877C",
        icon: ICONS[c.icon] ? c.icon : "tag",
        sortOrder: Number(c.sortOrder) || cats.length,
        createdAt: Number(c.createdAt) || t,
        updatedAt: Number(c.updatedAt) || t
      });
    });
    data.transactions.forEach(function (x) {
      if (!x || !x.id) { bad++; return; }
      if (["income", "expense", "adjust"].indexOf(x.type) < 0) { bad++; return; }
      var amt = Number(x.amount);
      if (!isFinite(amt) || amt <= 0) { bad++; return; }
      var d = String(x.date || "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) { bad++; return; }
      var rec = {
        id: String(x.id), type: x.type, amount: Math.round(amt),
        categoryId: x.type === "adjust" ? null : (x.categoryId ? String(x.categoryId) : null),
        note: String(x.note || "").slice(0, 200),
        date: d,
        createdAt: Number(x.createdAt) || t,
        updatedAt: Number(x.updatedAt) || t
      };
      if (x.type === "adjust") rec.adjustSign = x.adjustSign === -1 ? -1 : 1;
      txs.push(rec);
    });
    var theme = (data.settings && ["auto", "light", "dark"].indexOf(data.settings.theme) >= 0) ? data.settings.theme : (S.settings.theme || "auto");
    return { cats: cats, txs: txs, bad: bad, theme: theme };
  }

  /* tüm veriyi değiştir, yeniden yükle, çiz */
  function replaceData(cats, txs, theme) {
    return DB.replaceAll(cats, txs, { theme: theme || S.settings.theme || "auto", schemaVersion: 1 }).then(function () {
      return loadData();
    }).then(function () {
      applyTheme();
      render();
      return true;
    });
  }

  function handleImportText(txt) {
    var data;
    try { data = JSON.parse(txt); }
    catch (e) {
      DB.log("YEDEK", "bozuk JSON: " + (e && e.message ? e.message : e));
      confirmDialog("Yedek yüklenemedi", "Dosya geçerli JSON değil. Hata: " + esc(e && e.message ? e.message : "bilinmiyor"),
        { okText: "Tamam", danger: false }).then(closeDialog);
      return;
    }
    var n = normalizeBackup(data);
    if (n.error) {
      DB.log("YEDEK", "yüklenemedi: " + n.code);
      confirmDialog("Yedek yüklenemedi", n.error, { okText: "Tamam", danger: false }).then(closeDialog);
      return;
    }
    var cats = n.cats, txs = n.txs, bad = n.bad;

    var msg = "Bu işlem mevcut <strong>" + S.categories.length + " kategori</strong> ve <strong>" +
      S.transactions.length + " hareket</strong> kaydının üzerine yazacak.<br><br>" +
      "Yüklenecek: <strong>" + cats.length + " kategori</strong>, <strong>" + txs.length + " hareket</strong>." +
      (bad ? "<br><br>" + bad + " geçersiz kayıt atlanacak." : "");

    confirmDialog("Yedeği yükle", msg, { okText: "Üzerine yaz" }).then(function (ok) {
      if (!ok) return;
      replaceData(cats, txs, n.theme).then(function () {
        DB.log("YEDEK", "içe aktarıldı: " + cats.length + " kategori, " + txs.length + " hareket" + (bad ? ", " + bad + " atlandı" : ""));
        toast("Yedek yüklendi");
      }).catch(function (e) {
        DB.log("YEDEK", "içe aktarma hatası: " + (e && e.message ? e.message : e));
        toast("Yüklenemedi");
      });
    });
  }

  /* ================= HATA AYIKLAMA ================= */
  function renderDebug() {
    var logs = DB.getLogs();
    var body = $("#debug-body");
    var counts = "kategori:" + S.categories.length + " hareket:" + S.transactions.length;
    if (!logs.length) { body.textContent = "(kayıt yok) " + counts; return; }
    body.innerHTML = logs.slice().reverse().map(function (l) {
      var d = new Date(l.t);
      var hh = ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" + ("0" + d.getSeconds()).slice(-2);
      var line = esc(hh + "  " + l.line);
      return '<div>' + line + '</div>';
    }).join("");
  }

  function openDebug() {
    renderDebug();
    $("#debug-panel").classList.add("show");
    document.body.style.overflow = "hidden";
  }
  function closeDebug() {
    $("#debug-panel").classList.remove("show");
    document.body.style.overflow = "";
  }

  /* ================= VERİ YÜKLE ================= */
  function loadData() {
    return Promise.all([DB.getAll(DB.ST_CAT), DB.getAll(DB.ST_TX), DB.getSettings()]).then(function (r) {
      S.categories = r[0] || [];
      S.transactions = r[1] || [];
      var st = r[2] || {};
      S.settings.theme = ["auto", "light", "dark"].indexOf(st.theme) >= 0 ? st.theme : "auto";
      if (st.lastBackupAt) S.settings.lastBackupAt = st.lastBackupAt;
      S.settings.seenIntro = st.seenIntro === true;
      if (st.build) S.settings.build = st.build;
      if (st.backupTarget) S.settings.backupTarget = st.backupTarget;
      if (window.DriveSync) DriveSync.onLocalChange();
      return true;
    });
  }

  /* ================= OLAY DELEGASYONU ================= */
  document.addEventListener("click", function (ev) {
    var el = ev.target;
    var hit = function (sel) { return el.closest ? el.closest(sel) : null; };

    var t = hit("[data-act]");
    if (t) {
      var act = t.getAttribute("data-act");
      if (act === "settings") { go("settings"); return; }
      if (act === "back") {
        if (S.view === "cat" && S.catMonth) { go("summary"); return; }
        go("home"); return;
      }
      if (act === "manage") { go("manage"); return; }
      if (act === "adjust") { openAdjustSheet(Number(t.getAttribute("data-sign"))); return; }
      if (act === "prevMonth") { S.month = Fmt.addMonths(S.month, -1); render(); return; }
      if (act === "nextMonth") { S.month = Fmt.addMonths(S.month, 1); render(); return; }
      if (act === "save") { saveForm(false); return; }
      if (act === "saveNext") { saveForm(true); return; }
      if (act === "dedit") { deleteCurrentTx(); return; }
      if (act === "saveCat") { saveCat(); return; }
      if (act === "newCat") { openCatSheet(null); return; }
      if (act === "editCat") { openCatSheet(t.getAttribute("data-id")); return; }
      if (act === "delCat") { deleteCat(t.getAttribute("data-id")); return; }
      if (act === "backup") { doBackup(); return; }
      if (act === "restore") { pickBackup(); return; }
      if (act === "debug") { openDebug(); return; }
    }

    var th = hit("[data-themebtn]");
    if (th) {
      var val = th.getAttribute("data-themebtn");
      S.settings.theme = val;
      applyTheme();
      DB.setSetting("theme", val);
      $$("[data-themebtn]", $("#view-settings")).forEach(function (b) {
        b.classList.toggle("on", b.getAttribute("data-themebtn") === val);
      });
      return;
    }

    var bk = hit("[data-bktarget]");
    if (bk) {
      var bkt = bk.getAttribute("data-bktarget");
      S.settings.backupTarget = bkt;
      DB.setSetting("backupTarget", bkt);
      DB.log("YEDEK", "hedef seçildi: " + bkt);
      R.settings();
      toast("Yedek hedefi: " + (BACKUP_TARGETS[bkt] || BACKUP_TARGETS.ask).label);
      return;
    }

    var tab = hit("[data-go]");
    if (tab) { go(tab.getAttribute("data-go")); return; }

    var cat = hit("[data-cat]");
    if (cat) { go("cat", { catId: cat.getAttribute("data-cat") }); return; }

    var tx = hit("[data-tx]");
    if (tx) { openEditTx(tx.getAttribute("data-tx")); return; }

    var dd = hit("[data-dist]");
    if (dd) {
      var id = dd.getAttribute("data-dist");
      if (id && id !== "__none") { go("cat", { catId: id, month: S.month }); }
      else { toast("Kategorisiz giderler"); }
      return;
    }

    var fabMinus = hit("#fab-minus");
    if (fabMinus) { openAddSheet("expense"); return; }
    var fabPlus = hit("#fab-plus");
    if (fabPlus) { openAddSheet("income"); return; }

    if (hit("#backdrop") || hit("#sheet-close")) { closeSheet(); return; }
    if (hit("#debug-close")) { closeDebug(); return; }
    if (hit("#dlg-cancel")) { closeDialog(false); return; }
    if (hit("#dlg-ok")) { closeDialog(true); return; }
    if (hit("#debug-copy")) {
      var txt = DB.getLogs().map(function (l) {
        var d = new Date(l.t);
        return ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ":" +
          ("0" + d.getSeconds()).slice(-2) + "  " + l.line;
      }).join("\n") || "(kayıt yok)";
      var okCopy = function () { toast("Kopyalandı"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(txt).then(okCopy).catch(function () { legacyCopy(txt, okCopy); });
      } else legacyCopy(txt, okCopy);
      return;
    }
    if (hit("#debug-clear")) {
      DB.clearLogs();
      DB.log("DEPO", "log temizlendi · açılış kategori:" + S.categories.length + " hareket:" + S.transactions.length);
      renderDebug();
      toast("Temizlendi");
      return;
    }
  });

  function legacyCopy(txt, cb) {
    var ta = document.createElement("textarea");
    ta.value = txt;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); cb(); } catch (e) { toast("Kopyalanamadı"); }
    document.body.removeChild(ta);
  }

  document.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
      if ($("#dialog").classList.contains("show")) { closeDialog(null); return; }
      var ds = $("#drv-sheet");
      if (ds && ds.classList.contains("show")) { var lb = ds.querySelector('[data-drv="later"]'); if (lb) lb.click(); return; }
      if ($("#debug-panel").classList.contains("show")) { closeDebug(); return; }
      if ($("#sheet").classList.contains("show")) { closeSheet(); return; }
    }
  });

  /* ================= OTOMATİK GÜNCELLEME ================= */
  /* Yayına yeni sürüm girdiğinde uygulama kendini yeniler.
     Ana ekrandaki simgeyi silip yeniden eklemek GEREKMEZ. */
  var UPDATE_CHECK_MS = 60000;
  var updateTimer = null;

  function fetchBuild() {
    return fetch("version.json?t=" + Date.now(), { cache: "no-store" })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) { return j && j.build ? String(j.build) : null; })
      .catch(function () { return null; });
  }

  function applyUpdate(build) {
    var guard = "hesap_upd_" + build;
    try {
      if (sessionStorage.getItem(guard)) return false; /* döngü koruması */
      sessionStorage.setItem(guard, "1");
    } catch (e) {}
    DB.log("NET", "yeni sürüm bulundu: " + build + " · yenileniyor");
    DB.setSetting("build", build).catch(function () {}).then(function () {
      setTimeout(function () { location.reload(); }, 250);
    });
    return true;
  }

  function checkForUpdate(isBoot) {
    return fetchBuild().then(function (build) {
      if (!build) return false;
      var known = S.settings.build || null;
      if (!known) {
        /* ilk kurulum: damgayı yaz, yenileme yok */
        S.settings.build = build;
        DB.setSetting("build", build).catch(function () {});
        DB.log("NET", "ilk sürüm damgası: " + build + " (uygulama " + APP_VERSION + ")");
        return false;
      }
      if (build === known) {
        if (isBoot) DB.log("NET", "sürüm güncel: " + build);
        return false;
      }
      return applyUpdate(build);
    });
  }

  function startUpdateWatch() {
    checkForUpdate(true);

    /* öne geldiğinde kontrol (iOS ana ekran uygulaması arka plandan dönünce) */
    document.addEventListener("visibilitychange", function () {
      if (document.visibilityState === "visible") checkForUpdate(false);
    });
    window.addEventListener("focus", function () { checkForUpdate(false); });

    /* açıkken periyodik kontrol */
    if (updateTimer) clearInterval(updateTimer);
    updateTimer = setInterval(function () {
      if (document.visibilityState === "visible") checkForUpdate(false);
    }, UPDATE_CHECK_MS);

    /* service worker'ın kendisi değiştiyse yenile */
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", function (ev) {
        var d = ev.data;
        if (d && d.type === "SW_ACTIVATED") {
          DB.log("NET", "yeni service worker devrede: " + d.cache);
        }
      });
      navigator.serviceWorker.addEventListener("controllerchange", function () {
        DB.log("NET", "SW kontrolü devraldı · güncel içerik");
      });
    }
  }

  /* ================= DRIVE EŞİTLEME ================= */
  function startDriveSync() {
    if (!window.DriveSync) return;
    DriveSync.init({
      version: APP_VERSION,
      state: function () { return S; },
      buildBackup: buildBackup,
      normalize: normalizeBackup,
      replaceData: replaceData,
      toast: toast,
      esc: esc,
      go: go,
      standalone: isStandalone,
      view: function () { return S.view; },
      render: render,
      confirm: function (title, body, opts) {
        return confirmDialog(title, body, opts).then(function (v) { closeDialog(); return v; });
      }
    }).catch(function (e) {
      DB.log("DRIVE", "başlatılamadı: " + (e && e.message ? e.message : e));
    });
  }

  /* ================= AÇILIŞ ================= */
  function boot() {
    DB.open().then(function () {
      return loadData();
    }).then(function () {
      applyTheme();
      return seedIfEmpty();
    }).then(function () {
      return loadData();
    }).then(function () {
      /* depolama sağlığı: önce oku, izin yoksa ana ekranda tekrar iste */
      return checkStorageHealth();
    }).then(function () {
      DB.log("DEPO", "açılış · kategori:" + S.categories.length + " hareket:" + S.transactions.length +
        " persist:" + S.persist + " standalone:" + S.storage.standalone +
        " tema:" + (S.settings.theme || "auto") + " sürüm:" + APP_VERSION +
        " build:" + (S.settings.build || "—"));
      render();
      startUpdateWatch();
      startDriveSync();
      /* ilk açılış notu (depolama uyarısı) */
      if (!S.settings.seenIntro) {
        DB.setSetting("seenIntro", true);
        S.settings.seenIntro = true;
        /* Drive yedeği açıksa ilk açılışta onun karşılama sayfası gösterilir */
        if (!(window.DriveSync && DriveSync.available())) confirmDialog("Hesap'a hoş geldin",
          "Veriler yalnızca bu cihazda kalır. <br><br><strong>iPhone notu:</strong> Safari sekmesi ile ana ekrana eklenen uygulama ayrı depolama kullanır — birinde girdiğin hareket diğerinde görünmez. Ara sıra <strong>Yedek al</strong>.",
          { okText: "Anladım", danger: false }).then(closeDialog);
      }
    }).catch(function (e) {
      DB.log("DEPO", "açılış hatası: " + (e && e.message ? e.message : e));
      document.body.insertAdjacentHTML("beforeend",
        '<div style="padding:40px 24px;font-size:14px;line-height:1.6">Depolama açılamadı. ' +
        'Safari\'de gizli sekme kullanıyorsan normal sekmeye geç, uygulamayı kapatıp yeniden aç.<br><br>' +
        '<code>' + esc(e && e.message ? e.message : "") + '</code></div>');
    });

    /* service worker */
    if ("serviceWorker" in navigator && location.protocol.indexOf("http") === 0) {
      window.addEventListener("load", function () {
        navigator.serviceWorker.register("sw.js").then(function (reg) {
          DB.log("NET", "SW kayıtlı kapsam:" + (reg.scope || ""));
          reg.addEventListener("updatefound", function () {
            DB.log("NET", "yeni SW sürümü bulundu");
          });
        }).catch(function (e) {
          DB.log("NET", "SW kayıt hatası: " + (e && e.message ? e.message : e));
        });
      });
    }

    window.addEventListener("error", function (e) {
      DB.log("UI", "hata: " + (e && e.message ? e.message : "bilinmeyen"));
    });
  }

  window.HesapDebug = {
    counts: function () { return DB.counts(); },
    dump: buildBackup,
    drive: function () { return window.DriveSync ? DriveSync._state() : null; },
    version: APP_VERSION
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
