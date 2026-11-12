/* Hesap — 0.1.0 — ana uygulama */
(function () {
  "use strict";

  var APP_VERSION = "0.3.8";

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
    check: '<path d="M5 13l4.5 4.5L19 7"/>',
    bell: '<path d="M6 9.5a6 6 0 1 1 12 0c0 5 2 6.5 2 6.5H4s2-1.5 2-6.5z"/><path d="M10 18.5a2 2 0 0 0 4 0"/>'
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
    tombstones: [],
    reminders: [],
    remTombs: [],
    catTombs: [],
    settings: { theme: "auto" },
    view: "home",
    month: Fmt.ymOf(Fmt.todayYMD()),
    year: new Date().getFullYear(),
    summaryMode: "month",
    catId: null,
    catYear: null,
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

  function yearMonths(year) {
    var rows = [];
    for (var m = 1; m <= 12; m++) {
      var key = Fmt.ym(year, m);
      var mt = monthTotals(key);
      rows.push({
        ym: key, month: m,
        label: Fmt.MONTHS[m - 1], short: Fmt.MONTHS_SHORT[m - 1],
        income: mt.income, expense: mt.expense, adjust: mt.adjust, net: mt.net, count: mt.count
      });
    }
    return rows;
  }

  function openingBalance(year) {
    var start = year + "-01-01";
    return S.transactions.reduce(function (s, t) {
      return t.date < start ? s + txEffect(t) : s;
    }, 0);
  }

  function yearTotals(year) {
    var rows = yearMonths(year);
    var inc = 0, exp = 0, adj = 0, net = 0, n = 0;
    rows.forEach(function (r) {
      inc += r.income; exp += r.expense; adj += r.adjust; net += r.net; n += r.count;
    });
    return { year: year, income: inc, expense: exp, adjust: adj, net: net, count: n, months: rows, opening: openingBalance(year) };
  }

  function yearTx(year) {
    var p = String(year);
    return S.transactions.filter(function (t) { return String(t.date).slice(0, 4) === p; });
  }

  function catKindOf(c) {
    return (c && (c.kind === "income" || c.kind === "expense")) ? c.kind : "both";
  }

  var CHART_COLORS = [
    "#E24B42", "#2F6BFF", "#0C9A6A", "#F0A202",
    "#9B5CFF", "#E85D04", "#0AA7B8", "#D72660",
    "#3D8B4F", "#1D4ED8", "#C2410C", "#7C3AED"
  ];
  var DONUT_MIN_DEG = 10;

  function hexRgb(hex) {
    var h = String(hex || "").replace("#", "");
    if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return null;
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function colorDist(a, b) {
    var A = hexRgb(a), B = hexRgb(b);
    if (!A || !B) return 999;
    return Math.abs(A[0]-B[0]) + Math.abs(A[1]-B[1]) + Math.abs(A[2]-B[2]);
  }
  function isDullColor(hex) {
    var rgb = hexRgb(hex);
    if (!rgb) return true;
    var r = rgb[0], g = rgb[1], b = rgb[2];
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var sat = max === 0 ? 0 : (max - min) / max;
    var lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    return sat < 0.28 || lum < 0.22 || lum > 0.84;
  }
  function assignChartColors(parts) {
    var used = [];
    return parts.map(function (p, i) {
      var c = p.color;
      var taken = function (col) {
        return used.some(function (u) { return colorDist(u, col) < 70; });
      };
      if (!c || isDullColor(c) || taken(c)) {
        c = CHART_COLORS[i % CHART_COLORS.length];
        var k = 0;
        while (taken(c) && k < CHART_COLORS.length) {
          k++;
          c = CHART_COLORS[(i + k) % CHART_COLORS.length];
        }
      }
      used.push(c);
      var q = {};
      Object.keys(p).forEach(function (key) { q[key] = p[key]; });
      q.chartColor = c;
      return q;
    });
  }
  function donutSliceLens(parts, total) {
    var circ = 2 * Math.PI * 36;
    var n = parts.length;
    var minLen = circ * (DONUT_MIN_DEG / 360);
    if (n > 1) minLen = Math.min(minLen, (circ * 0.4) / n);
    var raw = parts.map(function (p) { return total ? Math.max(0, p.amount) / total * circ : 0; });
    var out = raw.slice();
    var extra = 0, big = 0;
    for (var i = 0; i < out.length; i++) {
      if (out[i] > 0 && out[i] < minLen) { extra += minLen - out[i]; out[i] = minLen; }
      else if (out[i] >= minLen) big += out[i];
    }
    if (extra > 0 && big > extra) {
      for (var j = 0; j < out.length; j++) {
        if (raw[j] >= minLen) out[j] -= extra * (raw[j] / big);
      }
    }
    return { lens: out, circ: circ, minLen: minLen };
  }
  function pctLabel(amount, total) {
    if (!total || amount <= 0) return "0%";
    var exact = amount / total * 100;
    if (exact < 1) return "<1%";
    return Math.round(exact) + "%";
  }
  function donutSvgAndLegend(parts, total, opts) {
    opts = opts || {};
    parts = assignChartColors(parts);
    var sl = donutSliceLens(parts, total);
    var acc = 0;
    var svg = '<svg class="donut" id="' + esc(opts.svgId || "chart-donut") + '" viewBox="0 0 80 80" aria-hidden="true">';
    parts.forEach(function (p, i) {
      var len = sl.lens[i];
      svg += '<circle class="donut-slice" data-cat="' + esc(p.id || "_") + '" cx="40" cy="40" r="36" fill="none" stroke="' + p.chartColor + '" stroke-width="8" stroke-linecap="butt" ' +
        'stroke-dasharray="' + len.toFixed(3) + " " + (sl.circ - len).toFixed(3) + '" stroke-dashoffset="' + (-acc).toFixed(3) + '"/>';
      acc += len;
    });
    svg += "</svg>";
    var legend = parts.map(function (p) {
      var open = p.id
        ? ' type="button" data-act="' + esc(opts.act || "openCatMonth") + '" data-id="' + esc(p.id) + '"' +
          (opts.month ? ' data-month="' + esc(opts.month) + '"' : "") +
          (opts.year ? ' data-year="' + esc(opts.year) + '"' : "")
        : ' type="button" disabled';
      return '<button class="leg"' + open + '>' +
        '<i class="swatch" style="background:' + p.chartColor + '"></i>' +
        '<div class="name">' + esc(p.name) + " · " + pctLabel(p.amount, total) + "</div>" +
        '<div class="amt">−' + Fmt.money(p.amount) + "</div></button>";
    }).join("");
    return { svg: svg, legend: legend, parts: parts, minLen: sl.minLen };
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
  function toast(msg, opts) {
    opts = opts || {};
    var el = $("#toast");
    el.innerHTML = "";
    var span = document.createElement("span");
    span.textContent = msg;
    el.appendChild(span);
    clearTimeout(toast._t);
    toast._undo = null;
    if (opts.action) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "toast-undo";
      b.textContent = opts.actionLabel || "Geri al";
      b.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        clearTimeout(toast._t);
        el.classList.remove("show");
        var fn = opts.action;
        toast._undo = null;
        if (fn) fn();
      });
      el.appendChild(b);
      toast._undo = opts.action;
    }
    el.classList.add("show");
    toast._t = setTimeout(function () { el.classList.remove("show"); toast._undo = null; }, opts.hold || (opts.action ? 5000 : 2200));
  }

  var dlgResolve, dlgOnConfirm = null;
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
    if (cancel) cancel.textContent = opts.cancelText || "Vazgeç";
    wrap.classList.add("show");
    dlgOnConfirm = (opts && typeof opts.onConfirm === "function") ? opts.onConfirm : null;
    return new Promise(function (res) {
      dlgResolve = res;
    });
  }
  function closeDialog(val) {
    $("#dialog").classList.remove("show");
    dlgOnConfirm = null;
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
    S.catYear = (view === "cat" && opts.year) ? opts.year : null;
    render();
  }

  /* ================= HATIRLATMALAR ================= */
  function reminderDueDate(r) { return r.date; }

  function reminderIsDone(r) { return !!(r && r.done) || !!(r && r.deleted); }

  function reminderIsOverdue(r) {
    if (reminderIsDone(r)) return false;
    return reminderDueDate(r) < Fmt.todayYMD();
  }

  function liveReminders() {
    return (S.reminders || []).slice().sort(function (a, b) {
      if (a.date !== b.date) return a.date < b.date ? -1 : 1;
      return (a.createdAt || 0) - (b.createdAt || 0);
    });
  }

  function remindersHomeHtml() {
    var list = liveReminders();
    var rows = list.filter(function (r) { return !reminderIsDone(r); });
    var html = '<div class="sec-head"><div class="sec-title">Hatırlatmalar</div>' +
      '<div class="sec-actions">' +
        (rows.length ? '<button type="button" class="sec-action" id="rems-ics-all" data-act="remsIcsAll">Tümünü takvime ekle</button>' : '') +
        '<button class="sec-action" data-act="newReminder">Ekle</button>' +
      '</div></div>';
    if (!rows.length) {
      return html + '<div class="empty"><strong>Hatırlatma yok</strong>Ödeme tarihi gelenleri burada görebilirsin.</div>';
    }
    return html + '<div class="rems">' + rows.map(function (r) {
      var cat = r.categoryId ? catById(r.categoryId) : null;
      var over = reminderIsOverdue(r);
      var typ = r.type === "receive" ? "Ödeme al" : "Ödeme yap";
      var when = over ? "Gecikti · " + Fmt.fullDate(r.date) : Fmt.fullDate(r.date);
      if (r.repeat === "monthly") when += " · her ay";
      var sub = typ + " · " + when + (cat ? " · " + cat.name : "") + (r.note ? " · " + r.note : "");
      return '<div class="swipe-row" data-swipe="rem" data-id="' + esc(r.id) + '">' +
        '<div class="swipe-actions"><button type="button" class="swipe-del" data-act="swipeDelRem" data-id="' + esc(r.id) + '">Sil</button></div>' +
        '<div class="swipe-front rem' + (over ? " over" : "") + '" data-rem="' + esc(r.id) + '">' +
          '<div class="rem-ico">' + svg("bell") + '</div>' +
          '<button class="rem-body" data-act="remOpen" data-id="' + esc(r.id) + '">' +
            '<div class="rem-name">' + esc(typ) + (r.note ? " — " + esc(r.note) : "") + '</div>' +
            '<div class="rem-sub">' + esc(sub) + '</div></button>' +
          '<div class="rem-amt ' + (r.type === "receive" ? "get" : "pay") + '">' + Fmt.money(r.amount) + '</div>' +
          '<button class="rem-cal" data-act="remIcs" data-id="' + esc(r.id) + '" aria-label="Takvime ekle">' + svg("cal") + '</button>' +
        '</div></div>';
    }).join("") + '</div>';
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
        'Kategori eklemek için “+ Yeni kategori”ye dokun.</div>';
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
        '<div class="topbar-right">' +
          ((window.DriveSync && DriveSync.configured()) ? '<span id="sync-dot-wrap">' + DriveSync.dotHtml() + '</span>' : '') +
          '<button class="icon-btn" data-act="settings" aria-label="Ayarlar">' + svg("gear") + '</button>' +
        '</div>' +
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
        '<div class="sec-actions">' +
          '<button class="sec-action" data-act="newCat" id="btn-new-cat">+ Yeni kategori</button>' +
        '</div></div>' +
      (window.DriveSync && DriveSync.configured()
        ? '<div id="drv-slot">' + DriveSync.bannerHtml() + '</div>'
        : backupBannerHtml()) +
      '<div class="cats">' + catsHtml + '</div>' +

      remindersHomeHtml() +

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

    return '<div class="swipe-row" data-swipe="tx" data-id="' + esc(t.id) + '">' +
      '<div class="swipe-actions"><button type="button" class="swipe-del" data-act="swipeDelTx" data-id="' + esc(t.id) + '">Sil</button></div>' +
      '<button class="swipe-front tx" data-tx="' + esc(t.id) + '">' + ico +
        '<div class="tx-body"><div class="tx-name">' + esc(title) + '</div>' +
        '<div class="tx-note">' + esc(sub) + '</div></div>' +
        '<div class="tx-amt ' + cls + '">' + Fmt.sgn(eff) + '</div></button></div>';
  }

  /* ================= RENDER: KATEGORİ DETAYI ================= */
  function catFabsHtml(c) {
    var kind = catKindOf(c);
    var html = '<div class="cat-fabs">';
    if (kind !== "income") {
      html += '<button class="cat-fab minus" data-act="catAdd" data-type="expense" data-cat="' + esc(c.id) + '">' +
        svg("minus") + " Gider</button>";
    }
    if (kind !== "expense") {
      html += '<button class="cat-fab plus" data-act="catAdd" data-type="income" data-cat="' + esc(c.id) + '">' +
        svg("plus") + " Gelir</button>";
    }
    html += "</div>";
    return html;
  }

  R.catDetail = function () {
    var c = catById(S.catId);
    if (!c) { S.view = "home"; R.home(); return; }
    var onlyMonth = S.catMonth;
    var onlyYear = S.catYear;
    var list = S.transactions.filter(function (t) {
      if (t.categoryId !== c.id) return false;
      if (onlyMonth) return Fmt.ymOf(t.date) === onlyMonth;
      if (onlyYear) return String(t.date).slice(0, 4) === String(onlyYear);
      return true;
    }).sort(sortTxDesc);
    var bal = 0;
    list.forEach(function (t) { bal += txEffect(t); });
    if (!onlyMonth && !onlyYear) bal = catBalance(c.id);
    var cls = bal > 0 ? "pos" : (bal < 0 ? "neg" : "zero");
    var period = onlyMonth ? Fmt.monthLabel(onlyMonth) : (onlyYear ? String(onlyYear) : "Tüm zamanlar");
    var fromOzet = !!(onlyMonth || onlyYear);

    var body = "";
    if (!list.length) {
      body = '<div class="empty"><strong>Bu kategoride hareket yok</strong>' +
        'Aşağıdaki + / − ile ilk hareketi ekleyebilirsin.</div>';
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
        '<button class="back" data-act="back">' + svg("chevL") + (fromOzet ? "Özet" : "Ana Sayfa") + "</button>" +
        '<button class="link-gold" data-act="editCat" data-id="' + esc(c.id) + '">Düzenle</button>' +
      "</div>" +
      '<div class="cat-hero" style="' + catStyle(c) + '">' +
        '<div class="big-ico">' + svg(c.icon) + "</div>" +
        "<div><h1>" + esc(c.name) + "</h1>" +
          '<div class="sum ' + cls + '" id="cat-balance">' + Fmt.plainSgn(bal) + " TL</div>" +
          '<div class="meta">' + list.length + " hareket · " + esc(period) + "</div>" +
        "</div>" +
      "</div>" +
      catFabsHtml(c) +
      '<div class="tx-list">' + body + "</div>";
  };

  /* ================= RENDER: ÖZET ================= */
  R.summary = function () {
    var mode = S.summaryMode === "year" ? "year" : "month";
    var seg = '<div class="mode-seg' + (mode === "year" ? " year" : "") + '">' +
      '<div class="mode-pill"></div>' +
      '<button type="button" data-act="sumMode" data-mode="month" class="' + (mode === "month" ? "on" : "") + '">Ay</button>' +
      '<button type="button" data-act="sumMode" data-mode="year" class="' + (mode === "year" ? "on" : "") + '">Yıl</button>' +
      '</div>';
    if (mode === "year") {
      document.getElementById("view-summary").innerHTML = seg + renderYearSummary();
      return;
    }
    var mt = monthTotals(S.month);
    var list = monthTx(S.month).sort(sortTxDesc);
    var netClass = mt.net > 0 ? " pos" : (mt.net < 0 ? " neg" : " zero");
    var incPct = mt.income + mt.expense > 0 ? (mt.income / (mt.income + mt.expense) * 100) : 0;
    var expPct = mt.income + mt.expense > 0 ? (mt.expense / (mt.income + mt.expense) * 100) : 0;

    var byCat = {};
    list.forEach(function (t) {
      if (t.type !== "expense") return;
      var k = t.categoryId || "_";
      if (!byCat[k]) byCat[k] = 0;
      byCat[k] += t.amount;
    });
    var parts = Object.keys(byCat).map(function (k) {
      var c = k === "_" ? { name: "Kategorisiz", color: "#8E877C", icon: "tag", id: null } : catById(k);
      return { id: k === "_" ? null : k, name: c ? c.name : "Kategorisiz", color: c ? c.color : "#8E877C", icon: c ? c.icon : "tag", amount: byCat[k] };
    }).sort(function (a, b) { return b.amount - a.amount; });

    var donut = "", legend = "", totalExp = mt.expense;
    if (parts.length) {
      var built = donutSvgAndLegend(parts, totalExp, { svgId: "month-donut", act: "openCatMonth", month: S.month });
      donut = built.svg;
      legend = built.legend;
    } else {
      donut = '<div class="empty" style="padding:20px 0">Bu ay gider yok</div>';
    }

    var top = list.filter(function (t) { return t.type === "expense"; }).slice(0, 6).map(function (t) {
      var c = t.categoryId ? catById(t.categoryId) : null;
      return '<div class="tx">' +
        '<div class="tx-ico" style="--cat:' + (c ? c.color : "#8E877C") + '">' + svg(c ? c.icon : "tag") + "</div>" +
        '<div class="tx-body"><div class="tx-name">' + esc(c ? c.name : "Kategorisiz") + "</div>" +
        '<div class="tx-sub">' + Fmt.fullDate(t.date) + (t.note ? " · " + esc(t.note) : "") + "</div></div>" +
        '<div class="tx-amt out">−' + Fmt.money(t.amount) + "</div></div>";
    }).join("");

    document.getElementById("view-summary").innerHTML = seg +
      '<div class="month-nav">' +
        '<button data-act="prevMonth" aria-label="Önceki ay">' + svg("chevL") + "</button>" +
        '<div class="label">' + Fmt.monthLabel(S.month) + "</div>" +
        '<button data-act="nextMonth" aria-label="Sonraki ay">' + svg("chevR") + "</button>" +
      "</div>" +

      '<div class="net-card' + netClass + '">' +
        '<div class="lab">Bu ay net</div>' +
        '<div class="amt">' + Fmt.sgn(mt.net) + "</div>" +
        '<div class="bars">' +
          '<div class="row"><div class="name">Gelir</div><div class="track"><i class="in" style="width:' + incPct + '%"></i></div>' +
            '<div class="val in">+' + Fmt.money(mt.income) + "</div></div>" +
          '<div class="row"><div class="name">Gider</div><div class="track"><i class="out" style="width:' + expPct + '%"></i></div>' +
            '<div class="val out">−' + Fmt.money(mt.expense) + "</div></div>" +
          (mt.adjust
            ? '<div class="row"><div class="name">Düzeltme</div><div class="track"></div>' +
              '<div class="val">' + Fmt.sgn(mt.adjust) + "</div></div>"
            : "") +
        "</div></div>" +

      '<div class="dist">' +
        "<h2>Gider dağılımı</h2>" +
        '<div class="donut-row">' + donut +
          '<div class="legend">' + (legend || "") + "</div>" +
        "</div></div>" +

      (top
        ? '<div class="top-ex"><h2>En büyük giderler</h2><div class="txs">' + top + "</div></div>"
        : "");
  };

  function renderYearSummary() {
    var y = Number(S.year) || new Date().getFullYear();
    var yt = yearTotals(y);
    var netClass = yt.net > 0 ? "" : (yt.net < 0 ? " neg" : " zero");
    var rowsHtml = "";
    var running = yt.opening;
    yt.months.forEach(function (r) {
      running += r.net;
      var empty = r.count === 0;
      var netCls = r.net > 0 ? "pos" : (r.net < 0 ? "neg" : "");
      rowsHtml += '<tr data-act="openYearMonth" data-month="' + esc(r.ym) + '"' +
        (empty ? ' class="empty-row"' : "") + ">" +
        "<td>" + esc(r.label) + "</td>" +
        '<td class="num in">' + (r.income ? "+" + Fmt.money(r.income) : "—") + "</td>" +
        '<td class="num out">' + (r.expense ? "−" + Fmt.money(r.expense) : "—") + "</td>" +
        '<td class="num net ' + netCls + '">' + (r.count || r.adjust ? Fmt.sgn(r.net) : "—") + "</td>" +
        '<td class="num">' + Fmt.money(running) + "</td>" +
      "</tr>";
    });
    var netFoot = yt.net > 0 ? "pos" : (yt.net < 0 ? "neg" : "");
    var table =
      '<div class="month-nav">' +
        '<button data-act="prevYear" aria-label="Önceki yıl">' + svg("chevL") + "</button>" +
        '<div class="label" id="year-label">' + y + "</div>" +
        '<button data-act="nextYear" aria-label="Sonraki yıl">' + svg("chevR") + "</button>" +
      "</div>" +
      '<div class="year-view">' +
        '<div class="year-cards">' +
          '<div class="y-card in"><div class="lab">Gelir</div><div class="val">+' + Fmt.money(yt.income) + "</div></div>" +
          '<div class="y-card out"><div class="lab">Gider</div><div class="val">−' + Fmt.money(yt.expense) + "</div></div>" +
          '<div class="y-card net' + netClass + '"><div class="lab">Net</div><div class="val">' + Fmt.sgn(yt.net) + "</div></div>" +
        "</div>" +
        '<div class="y-table-wrap"><h2>Aylık gelir gider</h2>' +
          '<table class="y-table" id="year-table">' +
            "<thead><tr><th>Ay</th><th>Gelir</th><th>Gider</th><th>Net</th><th>Bakiye</th></tr></thead>" +
            "<tbody>" + rowsHtml + "</tbody>" +
            "<tfoot><tr>" +
              "<td>Toplam</td>" +
              '<td class="num in">+' + Fmt.money(yt.income) + "</td>" +
              '<td class="num out">−' + Fmt.money(yt.expense) + "</td>" +
              '<td class="num net ' + netFoot + '">' + Fmt.sgn(yt.net) + "</td>" +
              '<td class="num">' + Fmt.money(running) + "</td>" +
            "</tr></tfoot>" +
          "</table></div>" +
        yearBarChart(yt) +
        yearCatBreakdown(y, yt) +
      "</div>";
    return table;
  }

  function yearBarChart(yt) {
    var max = 0;
    yt.months.forEach(function (r) {
      if (r.income > max) max = r.income;
      if (r.expense > max) max = r.expense;
    });
    if (max <= 0) {
      return '<div class="y-chart-wrap"><h2>Aylık karşılaştırma</h2>' +
        '<div class="empty">Bu yıl hareket yok</div></div>';
    }
    var W = 390, H = 168, padL = 8, padR = 8, padT = 8, padB = 22;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var group = innerW / 12;
    var barW = Math.max(5, Math.min(10, group * 0.28));
    var gap = 2;
    var bars = "";
    yt.months.forEach(function (r, i) {
      var cx = padL + group * i + group / 2;
      var hIn = r.income ? (r.income / max) * innerH : 0;
      var hOut = r.expense ? (r.expense / max) * innerH : 0;
      var xIn = cx - barW - gap / 2;
      var xOut = cx + gap / 2;
      if (hIn > 0) bars += '<rect x="' + xIn.toFixed(1) + '" y="' + (padT + innerH - hIn).toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + hIn.toFixed(1) + '" rx="2" fill="#0C9A6A"/>';
      if (hOut > 0) bars += '<rect x="' + xOut.toFixed(1) + '" y="' + (padT + innerH - hOut).toFixed(1) +
        '" width="' + barW.toFixed(1) + '" height="' + hOut.toFixed(1) + '" rx="2" fill="#D6453D"/>';
      bars += '<text x="' + cx.toFixed(1) + '" y="' + (H - 6) +
        '" text-anchor="middle" font-size="9" fill="currentColor" opacity="0.55">' + esc(r.short) + "</text>";
    });
    return '<div class="y-chart-wrap"><h2>Aylık karşılaştırma</h2>' +
      '<svg class="y-chart" id="year-chart" viewBox="0 0 ' + W + " " + H + '" width="100%" height="' + H +
      '" role="img" aria-label="Aylık gelir ve gider çubukları">' + bars + "</svg>" +
      '<div class="y-chart-legend"><span class="in"><i></i>Gelir</span><span class="out"><i></i>Gider</span></div></div>';
  }

  function yearCatBreakdown(year, yt) {
    var list = yearTx(year);
    var byCat = {};
    list.forEach(function (t) {
      if (t.type !== "expense") return;
      var k = t.categoryId || "_";
      if (!byCat[k]) byCat[k] = 0;
      byCat[k] += t.amount;
    });
    var parts = Object.keys(byCat).map(function (k) {
      var c = k === "_" ? { name: "Kategorisiz", color: "#8E877C", icon: "tag", id: null } : catById(k);
      return { id: k === "_" ? null : k, name: c ? c.name : "Kategorisiz", color: c ? c.color : "#8E877C", amount: byCat[k] };
    }).sort(function (a, b) { return b.amount - a.amount; });
    if (!parts.length) {
      return '<div class="dist"><h2>Yıllık gider dağılımı</h2><div class="empty">Bu yıl gider yok</div></div>';
    }
    var total = yt.expense;
    var built = donutSvgAndLegend(parts, total, { svgId: "year-donut", act: "openCatYear", year: year });
    return '<div class="dist"><h2>Yıllık gider dağılımı</h2><div class="donut-row">' + built.svg +
      '<div class="legend" id="year-legend">' + built.legend + "</div></div></div>";
  }

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

  function openAddSheet(type, catId) {
    resetForm(type);
    if (catId) S.formCat = catId;
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

  function sheetViewport() {
    var t = window.__hesapTestViewport;
    if (t && typeof t.height === "number") {
      return { height: Number(t.height), offsetTop: Number(t.offsetTop) || 0, width: Number(t.width) || window.innerWidth, test: true };
    }
    var vv = window.visualViewport;
    if (vv) return { height: vv.height, offsetTop: vv.offsetTop || 0, width: vv.width, test: false };
    return { height: window.innerHeight, offsetTop: 0, width: window.innerWidth, test: false };
  }

  function fitSheetToViewport() {
    var el = SHT.el;
    if (!el || !el.classList.contains("show")) return;
    var vv = sheetViewport();
    var full = window.innerHeight;
    var bottomGap = Math.max(0, full - (vv.offsetTop + vv.height));
    var maxH = Math.max(220, Math.min(vv.height, full * 0.92));
    el.style.top = "auto";
    el.style.bottom = Math.round(bottomGap) + "px";
    el.style.height = Math.round(maxH) + "px";
    el.style.maxHeight = Math.round(maxH) + "px";
    var kb = bottomGap > 60 || vv.height < full - 80 || !!vv.test;
    el.classList.toggle("kb-open", kb);
    if (window.innerWidth >= 620) {
      el.style.left = "50%";
      el.style.right = "auto";
      el.style.width = "min(480px, 100%)";
      el.style.transform = "translate(-50%, 0)";
    }
  }

  function clearSheetViewport() {
    var el = SHT.el;
    if (!el) return;
    el.style.top = "";
    el.style.bottom = "";
    el.style.height = "";
    el.style.maxHeight = "";
    el.style.left = "";
    el.style.right = "";
    el.style.width = "";
    el.style.transform = "";
    el.classList.remove("kb-open");
  }

  function revealFocusedField() {
    if (!SHT.el || !SHT.el.classList.contains("show")) return;
    var ae = document.activeElement;
    if (!ae || !SHT.el.contains(ae)) return;
    if (!/^(INPUT|TEXTAREA|SELECT)$/.test(ae.tagName)) return;
    var scroll = SHT.el.querySelector(".sheet-scroll");
    setTimeout(function () {
      try { ae.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" }); } catch (e) {
        if (scroll) {
          var ar = ae.getBoundingClientRect();
          var sr = scroll.getBoundingClientRect();
          if (ar.bottom > sr.bottom - 8 || ar.top < sr.top + 8) {
            scroll.scrollTop += ar.top - sr.top - Math.max(12, (sr.height - ar.height) / 2);
          }
        }
      }
    }, 60);
  }

  function hookViewport() {
    if (hookViewport._on) return;
    hookViewport._on = true;
    function on() { fitSheetToViewport(); revealFocusedField(); }
    window.addEventListener("resize", on);
    window.addEventListener("hesap-vv-test", on);
    if (window.visualViewport) {
      window.visualViewport.addEventListener("resize", on);
      window.visualViewport.addEventListener("scroll", on);
    }
    document.addEventListener("focusin", function (e) {
      if (!SHT.el || !SHT.el.classList.contains("show")) return;
      if (!SHT.el.contains(e.target)) return;
      fitSheetToViewport();
      revealFocusedField();
    });
  }

  function openSheet() {
    hookViewport();
    $("#backdrop").classList.add("show");
    SHT.el.classList.add("show");
    document.body.style.overflow = "hidden";
    fitSheetToViewport();
  }
  function closeSheet() {
    $("#backdrop").classList.remove("show");
    SHT.el.classList.remove("show");
    document.body.style.overflow = "";
    formError("");
    clearSheetViewport();
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
      mid = {
        pin: '<div class="amount-field' + (S.adjustSign < 0 ? "" : " income") + '">' +
          '<input id="amount-input" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(amountVal) + '" aria-label="Tutar">' +
          '<div class="ccy">Türk Lirası</div></div>',
        scroll:
          '<div class="field-label">Not</div>' +
          '<div class="input-row">' + svg("note") +
            '<input id="note-input" type="text" maxlength="120" autocomplete="off" placeholder="İsteğe bağlı" value="' + esc(t ? t.note : "") + '"></div>' +
          '<div class="field-label">Tarih</div>' +
          '<div class="input-row date-row">' + svg("cal") +
            '<div class="val" id="date-label">' + esc(Fmt.fullDate(S.formDate)) + '</div>' +
            '<input id="date-input" type="date" value="' + esc(S.formDate) + '" aria-label="Tarih"></div>'
      };
    } else {
      head = isEdit ? "Hareketi düzenle" : "Hareket ekle";
      sub = "";

      var seg = '<div class="seg">' +
        '<button data-type="expense" class="' + (!isInc ? "on" : "") + '">Gider</button>' +
        '<button data-type="income" class="' + (isInc ? "on income" : "") + '">Gelir</button>' +
        '</div>';

      var picks = S.categories.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
        .filter(function (c) {
          if (S.formCat === c.id) return true;
          var k = catKindOf(c);
          if (isInc) return k !== "expense";
          return k !== "income";
        })
        .map(function (c) {
          return '<button class="chip-pick' + (S.formCat === c.id ? " on" : "") + '" data-pick="' + esc(c.id) + '" style="' + catStyle(c) + '">' +
            '<div class="dot">' + svg(c.icon) + '</div><span>' + esc(c.name) + '</span></button>';
        }).join("");
      if (!picks) {
        picks = '<div class="empty">Gösterilecek kategori yok</div>';
      }

      mid = {
        pin: seg +
          '<div class="amount-field' + (isInc ? " income" : "") + '">' +
          '<input id="amount-input" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(amountVal) + '" aria-label="Tutar">' +
          '<div class="ccy">Türk Lirası</div></div>' +
          '<div class="field-label">Kategori</div>' +
          '<div class="cat-chips" id="cat-chips">' + picks + '</div>',
        scroll:
          '<div class="field-label">Not</div>' +
          '<div class="input-row">' + svg("note") +
            '<input id="note-input" type="text" maxlength="120" autocomplete="off" placeholder="İsteğe bağlı" value="' + esc(t ? t.note : "") + '"></div>' +
          '<div class="field-label">Tarih</div>' +
          '<div class="input-row date-row">' + svg("cal") +
            '<div class="val" id="date-label">' + esc(Fmt.fullDate(S.formDate)) + '</div>' +
            '<input id="date-input" type="date" value="' + esc(S.formDate) + '" aria-label="Tarih"></div>'
      };
    }

    var actions = isEdit
      ? '<button class="save-btn" data-act="save">Kaydet</button>' +
        '<button class="danger-btn" data-act="dedit">Hareketi sil</button>'
      : '<button class="save-btn" data-act="save">Kaydet</button>' +
        (isAdjust ? '' : '<button class="ghost-btn" data-act="saveNext">Kaydet ve devam et</button>');

    var pinMid = (mid && mid.pin) ? mid.pin : (typeof mid === "string" ? mid : "");
    var scrollMid = (mid && mid.scroll) ? mid.scroll : "";
    SHT.body.innerHTML =
      '<div class="sheet-pin">' +
        '<div class="sheet-title">' + esc(head) + '</div>' +
        (sub ? '<div class="sheet-sub">' + esc(sub) + '</div>' : '') +
        pinMid +
      '</div>' +
      '<div class="sheet-scroll">' + scrollMid +
        '<div class="form-error" id="form-error"></div>' +
        actions +
      '</div>';
    requestAnimationFrame(fitSheetToViewport);

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
        var oldRec = null;
        for (var i = 0; i < S.transactions.length; i++) if (S.transactions[i].id === id) oldRec = S.transactions[i];
        var rec = oldRec ? Object.assign({}, oldRec) : { id: id };
        rec.deleted = true;
        rec.updatedAt = now();
        DB.putTransaction(rec).then(function () {
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
      ? { id: c.id, name: c.name, color: c.color, icon: c.icon, kind: catKindOf(c) }
      : { id: null, name: "", color: PALETTE[Math.floor(Math.random() * PALETTE.length)], icon: "tag", kind: "both" };
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
        '<div class="field-label">Tür</div>' +
        '<div class="seg kind-seg">' +
          '<button type="button" data-kind="both" class="' + (catForm.kind === "both" ? "on" : "") + '">İkisi</button>' +
          '<button type="button" data-kind="income" class="' + (catForm.kind === "income" ? "on income" : "") + '">Gelir</button>' +
          '<button type="button" data-kind="expense" class="' + (catForm.kind === "expense" ? "on" : "") + '">Gider</button>' +
        '</div>' +
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
    $$("[data-kind]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-kind");
        catForm.kind = (k === "income" || k === "expense") ? k : "both";
        $$("[data-kind]", SHT.body).forEach(function (x) {
          x.classList.toggle("on", x === b);
          x.classList.toggle("income", x === b && catForm.kind === "income");
        });
      });
    });
    var n = $("#cat-name");
    if (n) n.addEventListener("input", function () { formError(""); });
    requestAnimationFrame(fitSheetToViewport);
  }

  function saveCat() {
    var nameEl = $("#cat-name");
    var name = (nameEl ? nameEl.value : "").trim();
    if (!name) { formError("Kategori adı boş olamaz."); if (nameEl) nameEl.focus(); return; }
    var t = now();
    var kind = (catForm.kind === "income" || catForm.kind === "expense") ? catForm.kind : "both";
    var rec;
    if (catForm.id) {
      var old = catById(catForm.id);
      if (!old) { formError("Kategori bulunamadı."); return; }
      rec = {
        id: old.id, name: name, color: catForm.color, icon: catForm.icon, kind: kind,
        sortOrder: old.sortOrder || 0, createdAt: old.createdAt, updatedAt: t
      };
    } else {
      var maxOrder = S.categories.reduce(function (m, c) { return Math.max(m, c.sortOrder || 0); }, -1);
      rec = { id: uid(), name: name, color: catForm.color, icon: catForm.icon, kind: kind, sortOrder: maxOrder + 1, createdAt: t, updatedAt: t };
    }
    DB.putCategory(rec).then(function (ok) {
      if (!ok) { formError("Kategori doğrulanamadı, tekrar dene."); return; }
      return loadData().then(function () {
        closeSheet();
        render();
        toast(catForm.id ? "Kategori güncellendi" : "Kategori eklendi");
      });
    });
  }

  function deleteCat(id) {
    var c = catById(id);
    if (!c) return;
    var n = catCount(id);
    if (n <= 0) {
      confirmDialog("Kategoriyi sil", "“" + esc(c.name) + "” kategorisi silinsin mi?", { okText: "Sil" }).then(function (ok) {
        if (ok) tombstoneCategory(id, null);
      });
      return;
    }
    openMoveCatSheet(c, n);
  }

  function openMoveCatSheet(c, n) {
    S.moveCatId = c.id;
    S.moveTarget = "";
    var others = S.categories.filter(function (x) { return x.id !== c.id; });
    var opts = '<button type="button" class="move-opt on" data-move="" id="move-none">Kategorisiz</button>' +
      others.map(function (x) {
        return '<button type="button" class="move-opt" data-move="' + esc(x.id) + '" style="' + catStyle(x) + '">' +
          '<div class="dot" style="width:28px;height:28px;border-radius:9px;display:grid;place-items:center;background:var(--cat-soft);color:var(--cat)">' +
          svg(x.icon) + '</div><span>' + esc(x.name) + "</span></button>";
      }).join("");
    SHT.body.innerHTML =
      '<div class="sheet-pin"><div class="sheet-title">Kategoriyi sil</div>' +
        '<div class="sheet-sub">“' + esc(c.name) + "” içindeki <strong>" + n +
        " hareket</strong> silinmez. Nereye taşınsın?</div></div>" +
      '<div class="sheet-scroll">' +
        '<div class="move-list" id="move-list">' + opts + "</div>" +
        '<button class="save-btn" data-act="confirmMoveCat">Taşı ve sil</button>' +
        '<button class="ghost-btn" data-act="cancel">Vazgeç</button>' +
      "</div>";
    openSheet();
    $$("[data-move]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        S.moveTarget = b.getAttribute("data-move") || "";
        $$("[data-move]", SHT.body).forEach(function (x) { x.classList.remove("on"); });
        b.classList.add("on");
      });
    });
    requestAnimationFrame(fitSheetToViewport);
  }

  function tombstoneCategory(id, moveTo) {
    var when = now();
    var c = catById(id);
    if (!c) return Promise.resolve();
    var moved = S.transactions.filter(function (x) { return x.categoryId === id; }).map(function (x) {
      var o = Object.assign({}, x);
      o.categoryId = moveTo || null;
      o.updatedAt = when;
      return o;
    });
    var tomb = Object.assign({}, c);
    tomb.deleted = true;
    tomb.updatedAt = when;
    return Promise.all(moved.map(function (x) { return DB.putTransaction(x); })).then(function () {
      return DB.putCategory(tomb);
    }).then(function () {
      return loadData();
    }).then(function () {
      closeSheet();
      if (S.view === "cat" && S.catId === id) { S.view = "home"; S.catId = null; }
      render();
      toast(moved.length ? "Kategori silindi, hareketler taşındı" : "Kategori silindi");
    });
  }

  /* ================= HATIRLATMA FORMU ================= */
  var remForm = { id: null, type: "pay", amount: 0, categoryId: null, date: "", repeat: "", note: "" };

  function addMonthsYMD(ymd, n) {
    var p = String(ymd).split("-");
    var y = Number(p[0]), m = Number(p[1]) + n, d = Number(p[2]);
    while (m > 12) { y += 1; m -= 12; }
    while (m < 1) { y -= 1; m += 12; }
    var last = new Date(y, m, 0).getDate();
    if (d > last) d = last;
    return y + "-" + ("0" + m).slice(-2) + "-" + ("0" + d).slice(-2);
  }

  function remById(id) {
    for (var i = 0; i < (S.reminders || []).length; i++) if (S.reminders[i].id === id) return S.reminders[i];
    return null;
  }

  function openReminderSheet(id) {
    var r = id ? remById(id) : null;
    remForm = r
      ? { id: r.id, type: r.type === "receive" ? "receive" : "pay", amount: r.amount, categoryId: r.categoryId || null, date: r.date, repeat: r.repeat || "", note: r.note || "" }
      : { id: null, type: "pay", amount: 0, categoryId: null, date: Fmt.todayYMD(), repeat: "", note: "" };
    renderReminderSheet();
    openSheet();
    setTimeout(function () {
      var inp = $("#rem-amount");
      if (inp) inp.focus();
    }, 320);
  }

  function renderReminderSheet() {
    var isEdit = !!remForm.id;
    var amountVal = remForm.amount ? Fmt.money(remForm.amount) : "";
    var picks = S.categories.slice().sort(function (a, b) { return (a.sortOrder || 0) - (b.sortOrder || 0); })
      .map(function (c) {
        return '<button class="chip-pick' + (remForm.categoryId === c.id ? " on" : "") + '" data-rempick="' + esc(c.id) + '" style="' + catStyle(c) + '">' +
          '<div class="dot">' + svg(c.icon) + '</div><span>' + esc(c.name) + '</span></button>';
      }).join("");
    SHT.body.innerHTML =
      '<div class="sheet-pin">' +
        '<div class="sheet-title">' + (isEdit ? "Hatırlatmayı düzenle" : "Yeni hatırlatma") + '</div>' +
        '<div class="seg">' +
          '<button type="button" data-remtype="pay" class="' + (remForm.type !== "receive" ? "on" : "") + '">Ödeme yap</button>' +
          '<button type="button" data-remtype="receive" class="' + (remForm.type === "receive" ? "on income" : "") + '">Ödeme al</button>' +
        '</div>' +
        '<div class="amount-field' + (remForm.type === "receive" ? " income" : "") + '">' +
          '<input id="rem-amount" type="text" inputmode="decimal" autocomplete="off" placeholder="0,00" value="' + esc(amountVal) + '" aria-label="Tutar">' +
          '<div class="ccy">Türk Lirası</div></div>' +
        '<div class="field-label">Kategori</div>' +
        '<div class="cat-chips">' + (picks || '<div class="empty">Kategori yok</div>') + '</div>' +
      '</div>' +
      '<div class="sheet-scroll">' +
        '<div class="field-label">Tarih</div>' +
        '<div class="input-row date-row">' + svg("cal") +
          '<div class="val" id="rem-date-label">' + esc(Fmt.fullDate(remForm.date)) + '</div>' +
          '<input id="rem-date" type="date" value="' + esc(remForm.date) + '" aria-label="Tarih"></div>' +
        '<div class="field-label">Tekrar</div>' +
        '<div class="seg">' +
          '<button type="button" data-remrepeat="" class="' + (!remForm.repeat ? "on" : "") + '">Yok</button>' +
          '<button type="button" data-remrepeat="monthly" class="' + (remForm.repeat === "monthly" ? "on" : "") + '">Her ay</button>' +
        '</div>' +
        '<div class="field-label">Not</div>' +
        '<div class="input-row">' + svg("note") +
          '<input id="rem-note" type="text" maxlength="120" autocomplete="off" placeholder="İsteğe bağlı" value="' + esc(remForm.note) + '"></div>' +
        '<div class="form-error" id="form-error"></div>' +
        '<button class="save-btn" data-act="saveReminder">Kaydet</button>' +
        (isEdit
          ? '<button class="ghost-btn" data-act="remIcs" data-id="' + esc(remForm.id) + '">Takvime ekle</button>' +
            '<button class="danger-btn" data-act="delReminder" data-id="' + esc(remForm.id) + '">Sil</button>'
          : "") +
      '</div>';
    var inp = $("#rem-amount");
    if (inp) {
      inp.addEventListener("input", function () {
        var caretAtEnd = inp.selectionStart === inp.value.length;
        var v = Fmt.liveAmount(inp.value);
        inp.value = v;
        if (caretAtEnd) { try { inp.setSelectionRange(v.length, v.length); } catch (e) {} }
        formError("");
      });
    }
    var di = $("#rem-date");
    if (di) di.addEventListener("change", function () {
      remForm.date = di.value || Fmt.todayYMD();
      var lb = $("#rem-date-label");
      if (lb) lb.textContent = Fmt.fullDate(remForm.date);
    });
    $$("[data-remtype]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        remForm.type = b.getAttribute("data-remtype") === "receive" ? "receive" : "pay";
        renderReminderSheet();
      });
    });
    $$("[data-remrepeat]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        remForm.repeat = b.getAttribute("data-remrepeat") === "monthly" ? "monthly" : "";
        $$("[data-remrepeat]", SHT.body).forEach(function (x) { x.classList.toggle("on", x === b); });
      });
    });
    $$("[data-rempick]", SHT.body).forEach(function (b) {
      b.addEventListener("click", function () {
        var id = b.getAttribute("data-rempick");
        remForm.categoryId = (remForm.categoryId === id) ? null : id;
        $$("[data-rempick]", SHT.body).forEach(function (x) {
          x.classList.toggle("on", x.getAttribute("data-rempick") === remForm.categoryId);
        });
      });
    });
    requestAnimationFrame(fitSheetToViewport);
  }

  function saveReminder() {
    var amtEl = $("#rem-amount");
    var noteEl = $("#rem-note");
    var dateEl = $("#rem-date");
    var amount = Fmt.parseAmount(amtEl ? amtEl.value : "");
    var date = (dateEl && dateEl.value) || remForm.date || Fmt.todayYMD();
    var note = noteEl ? noteEl.value.trim() : (remForm.note || "");
    if (amount <= 0) { formError("Tutar 0'dan büyük olmalı."); if (amtEl) amtEl.focus(); return; }
    var t = now();
    var rec;
    if (remForm.id) {
      var old = remById(remForm.id);
      if (!old) { formError("Hatırlatma bulunamadı."); return; }
      rec = Object.assign({}, old);
      rec.type = remForm.type === "receive" ? "receive" : "pay";
      rec.amount = amount;
      rec.categoryId = remForm.categoryId || null;
      rec.date = date;
      rec.repeat = remForm.repeat === "monthly" ? "monthly" : null;
      rec.note = note;
      rec.updatedAt = t;
    } else {
      rec = {
        id: uid(), type: remForm.type === "receive" ? "receive" : "pay", amount: amount,
        categoryId: remForm.categoryId || null, date: date,
        repeat: remForm.repeat === "monthly" ? "monthly" : null,
        note: note, done: false, doneAt: null, lastDoneDate: null,
        createdAt: t, updatedAt: t
      };
    }
    var wasNew = !remForm.id;
    var oldRec = wasNew ? null : remById(remForm.id);
    if (wasNew || reminderCalChanged(oldRec, rec)) publishReminderToCalendar(rec, !wasNew);
    DB.putReminder(rec).then(function (ok) {
      if (!ok) { formError("Kaydedilemedi, tekrar dene."); return; }
      return loadData().then(function () {
        closeSheet();
        render();
        toast(wasNew ? "Hatırlatma eklendi. Takvimde Ekle'ye dokun." : (reminderCalChanged(oldRec, rec) ? "Hatırlatma güncellendi. Takvimde Ekle'ye dokun." : "Hatırlatma güncellendi"));
      });
    });
  }

  function deleteReminder(id) {
    var r = remById(id);
    if (!r) return;
    confirmDialog("Hatırlatmayı sil", "Bu hatırlatma silinsin mi?", {
      okText: "Sil",
      onConfirm: function () { cancelReminderOnCalendar(r); }
    }).then(function (ok) {
      if (!ok) { closeAllSwipe(); return; }
      var snap = Object.assign({}, r);
      var tomb = Object.assign({}, r);
      tomb.deleted = true;
      tomb.updatedAt = now();
      DB.putReminder(tomb).then(function () { return loadData(); }).then(function () {
        closeSheet();
        render();
        toast("Hatırlatma silindi", {
          actionLabel: "Geri al",
          action: function () { restoreReminder(snap); }
        });
      });
    });
  }

  function restoreReminder(snap) {
    var rec = Object.assign({}, snap);
    rec.deleted = false;
    rec.updatedAt = now();
    DB.putReminder(rec).then(function () { return loadData(); }).then(function () {
      render();
      toast("Geri alındı");
    });
  }

  function deleteTxById(id) {
    var oldRec = null;
    for (var i = 0; i < S.transactions.length; i++) if (S.transactions[i].id === id) oldRec = S.transactions[i];
    if (!oldRec) return;
    confirmDialog("Hareketi sil", "Bu hareket silinsin mi? Bakiyeler buna göre güncellenir.", { okText: "Sil" }).then(function (ok) {
      if (!ok) { closeAllSwipe(); return; }
      var snap = Object.assign({}, oldRec);
      var rec = Object.assign({}, oldRec);
      rec.deleted = true;
      rec.updatedAt = now();
      DB.putTransaction(rec).then(function () { return loadData(); }).then(function () {
        closeSheet();
        render();
        toast("Silindi", {
          actionLabel: "Geri al",
          action: function () { restoreTx(snap); }
        });
      });
    });
  }

  function restoreTx(snap) {
    var rec = Object.assign({}, snap);
    rec.deleted = false;
    rec.updatedAt = now();
    DB.putTransaction(rec).then(function () { return loadData(); }).then(function () {
      render();
      toast("Geri alındı");
    });
  }

  var SWIPE_W = 88;
  function closeAllSwipe(except) {
    $$(".swipe-row.open").forEach(function (el) {
      if (el === except) return;
      el.classList.remove("open");
      var f = el.querySelector(".swipe-front");
      if (f) { f.style.transform = ""; f.style.transition = ""; }
    });
  }
  function openSwipe(row) {
    if (!row) return;
    closeAllSwipe(row);
    row.classList.add("open");
    var f = row.querySelector(".swipe-front");
    if (f) {
      f.style.transition = "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";
      f.style.transform = "translateX(-" + SWIPE_W + "px)";
    }
  }
  function bindSwipe() {
    if (bindSwipe._on) return;
    bindSwipe._on = true;
    var startX = 0, startY = 0, dx = 0, dy = 0, row = null, front = null, tracking = false, decided = false, pointerId = null, opened = 0;

    function end() {
      if (!tracking) return;
      tracking = false;
      if (front) {
        front.style.transition = "transform 0.22s cubic-bezier(0.32, 0.72, 0, 1)";
        var x = opened + dx;
        if (decided && (x < -SWIPE_W * 0.4 || dx < -36)) openSwipe(row);
        else {
          if (row) row.classList.remove("open");
          front.style.transform = "";
        }
      }
      row = front = null;
      decided = false;
    }

    function down(x, y, target) {
      if (target.closest && target.closest(".swipe-del")) return false;
      var t = target.closest && target.closest(".swipe-row");
      closeAllSwipe(t);
      if (!t) return false;
      row = t;
      front = t.querySelector(".swipe-front");
      startX = x; startY = y; dx = dy = 0;
      tracking = true; decided = false;
      opened = t.classList.contains("open") ? -SWIPE_W : 0;
      if (front) front.style.transition = "none";
      return true;
    }

    function move(x, y, ev) {
      if (!tracking || !front) return;
      dx = x - startX; dy = y - startY;
      if (!decided) {
        if (Math.abs(dx) + Math.abs(dy) < 8) return;
        decided = Math.abs(dx) > Math.abs(dy) * 1.15;
        if (!decided) { tracking = false; front.style.transition = ""; return; }
      }
      if (ev && ev.cancelable) ev.preventDefault();
      var xPos = Math.min(16, Math.max(-SWIPE_W - 24, opened + dx));
      front.style.transform = "translateX(" + xPos + "px)";
    }

    document.addEventListener("touchstart", function (e) {
      var touch = e.changedTouches[0];
      down(touch.clientX, touch.clientY, e.target);
    }, { passive: true });
    document.addEventListener("touchmove", function (e) {
      if (!tracking) return;
      var touch = e.changedTouches[0];
      move(touch.clientX, touch.clientY, e);
    }, { passive: false });
    document.addEventListener("touchend", end);
    document.addEventListener("touchcancel", end);

    document.addEventListener("pointerdown", function (e) {
      if (e.pointerType === "touch") return;
      if (!down(e.clientX, e.clientY, e.target)) return;
      pointerId = e.pointerId;
    });
    document.addEventListener("pointermove", function (e) {
      if (e.pointerType === "touch" || !tracking || e.pointerId !== pointerId) return;
      move(e.clientX, e.clientY, e);
    });
    document.addEventListener("pointerup", function (e) {
      if (e.pointerType === "touch") return;
      end();
    });
    document.addEventListener("pointercancel", function (e) {
      if (e.pointerType === "touch") return;
      end();
    });
  }

  function openReminderActionSheet(id) {
    var r = remById(id);
    if (!r) return;
    S.remActionId = id;
    var typ = r.type === "receive" ? "Ödeme al" : "Ödeme yap";
    var payLabel = r.type === "receive" ? "Alındı – hesaba işle" : "Ödendi – hesaba işle";
    var title = typ + (r.note ? " — " + r.note : "");
    SHT.body.innerHTML =
      '<div class="sheet-pin" id="rem-action-sheet">' +
        '<div class="sheet-title">Hatırlatma</div>' +
        '<div class="sheet-sub">' + esc(title) + "<br>" + Fmt.money(r.amount) + " TL · " + esc(Fmt.fullDate(r.date)) + "</div>" +
      "</div>" +
      '<div class="sheet-scroll rem-action-btns">' +
        '<button class="save-btn" id="rem-post" data-act="remPost" data-id="' + esc(r.id) + '">' + esc(payLabel) + "</button>" +
        '<button class="ghost-btn strong" id="rem-done" data-act="remDone" data-id="' + esc(r.id) + '">Tamamlandı (işlemeden)</button>' +
        '<button class="ghost-btn" id="rem-cancel" data-act="cancel">Vazgeç</button>' +
      "</div>";
    openSheet();
    requestAnimationFrame(fitSheetToViewport);
  }

  function finishReminder(id, asTx) {
    var r = remById(id);
    if (!r) { closeSheet(); return; }
    /* Aylık hatırlatma tamamlanınca seri durmaz; tek seferlikte takvimden kaldır. */
    if (r.repeat !== "monthly") cancelReminderOnCalendar(r);
    var jobs = [];
    var when = now();
    if (asTx) {
      var typ = r.type === "receive" ? "income" : "expense";
      jobs.push(DB.putTransaction({
        id: uid(), type: typ, amount: r.amount, categoryId: r.categoryId || null,
        note: r.note || (r.type === "receive" ? "Ödeme alındı" : "Ödeme yapıldı"),
        date: r.date || Fmt.todayYMD(), createdAt: when, updatedAt: when
      }));
    }
    var rec = Object.assign({}, r);
    rec.updatedAt = when;
    rec.lastDoneDate = r.date;
    if (r.repeat === "monthly") {
      rec.date = addMonthsYMD(r.date, 1);
      rec.done = false;
      rec.doneAt = null;
    } else {
      rec.done = true;
      rec.doneAt = when;
    }
    jobs.push(DB.putReminder(rec));
    Promise.all(jobs).then(function () { return loadData(); }).then(function () {
      closeSheet();
      render();
      toast(asTx ? "Hareket kaydedildi" : (r.repeat === "monthly" ? "Sonraki aya alındı" : "Tamamlandı"));
    });
  }

  function icsEsc(s) {
    return String(s || "").replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
  }
  function reminderCalUid(r) { return "hesap-rem-" + r.id + "@hesap"; }
  function reminderCalTitle(r) {
    var title = (r.type === "receive" ? "Ödeme al" : "Ödeme yap") + ": " + Fmt.money(r.amount) + " TL";
    var cat = r.categoryId ? catById(r.categoryId) : null;
    if (cat) title += " (" + cat.name + ")";
    if (r.note) title += " — " + r.note;
    return title;
  }
  function icsSequence(r, extra) {
    return Math.floor((Number(r && r.updatedAt) || Date.now()) / 1000) + (extra || 0);
  }
  function icsStamp() {
    return new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+Z$/, "Z");
  }
  function reminderVEvent(r, opts) {
    opts = opts || {};
    var cancel = !!opts.cancel;
    var title = reminderCalTitle(r);
    var uid = reminderCalUid(r);
    var day = String(r.date).replace(/-/g, "");
    var start = day + "T090000";
    var end = day + "T093000";
    var seq = icsSequence(r, (cancel || opts.bump) ? 1 : 0);
    var lines = [
      "BEGIN:VEVENT",
      "UID:" + uid,
      "DTSTAMP:" + icsStamp(),
      "DTSTART:" + start,
      "DTEND:" + end,
      "SEQUENCE:" + seq,
      "SUMMARY:" + icsEsc(title)
    ];
    if (cancel) {
      lines.push("STATUS:CANCELLED");
    } else {
      lines.push("DESCRIPTION:" + icsEsc(r.note || ""));
      if (r.repeat === "monthly") {
        var md = Number(String(r.date).slice(8, 10)) || 1;
        lines.push("RRULE:FREQ=MONTHLY;BYMONTHDAY=" + md);
      }
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push("TRIGGER:-P1D");
      lines.push("DESCRIPTION:" + icsEsc(title));
      lines.push("END:VALARM");
      lines.push("BEGIN:VALARM");
      lines.push("ACTION:DISPLAY");
      lines.push("TRIGGER:PT0S");
      lines.push("DESCRIPTION:" + icsEsc(title));
      lines.push("END:VALARM");
    }
    lines.push("END:VEVENT");
    return lines;
  }
  function buildCalendarIcs(rems, opts) {
    opts = opts || {};
    var cancel = !!opts.cancel;
    var lines = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Hesap//TR",
      "CALSCALE:GREGORIAN",
      "METHOD:" + (cancel ? "CANCEL" : "PUBLISH")
    ];
    (rems || []).forEach(function (r) {
      lines = lines.concat(reminderVEvent(r, opts));
    });
    lines.push("END:VCALENDAR");
    return lines.join("\r\n") + "\r\n";
  }
  function reminderIcs(r, opts) { return buildCalendarIcs([r], opts); }
  function openIcsFile(ics, filename) {
    try { window.__hesapLastIcs = { ics: ics, filename: filename || "hesap.ics", at: Date.now() }; } catch (e) {}
    var blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename || "hesap-hatirlatma.ics";
    a.type = "text/calendar";
    document.body.appendChild(a);
    a.click();
    setTimeout(function () { URL.revokeObjectURL(url); if (a.parentNode) a.parentNode.removeChild(a); }, 2000);
    return ics;
  }
  function addReminderToCalendar(id) {
    var r = remById(id);
    if (!r) return;
    var ics = reminderIcs(r);
    openIcsFile(ics, "hesap-hatirlatma-" + String(r.date).replace(/-/g, "") + ".ics");
    return ics;
  }
  function addAllRemindersToCalendar() {
    var rows = liveReminders().filter(function (r) { return !reminderIsDone(r); });
    if (!rows.length) { toast("Eklenecek hatırlatma yok"); return; }
    var ics = buildCalendarIcs(rows);
    openIcsFile(ics, "hesap-hatirlatmalar.ics");
    return ics;
  }
  function publishReminderToCalendar(r, isEdit) {
    if (!r || r.done || r.deleted) return;
    openIcsFile(reminderIcs(r, { bump: !!isEdit }), "hesap-hatirlatma-" + String(r.date).replace(/-/g, "") + ".ics");
  }
  function cancelReminderOnCalendar(r) {
    if (!r) return;
    openIcsFile(reminderIcs(r, { cancel: true }), "hesap-hatirlatma-iptal-" + String(r.date).replace(/-/g, "") + ".ics");
  }
  function reminderCalChanged(old, rec) {
    if (!old) return true;
    return old.date !== rec.date || old.amount !== rec.amount || old.type !== rec.type ||
      (old.note || "") !== (rec.note || "") || (old.categoryId || null) !== (rec.categoryId || null) ||
      (old.repeat || null) !== (rec.repeat || null);
  }

  /* ================= YEDEK ================= */
  function buildBackup() {
    return {
      app: "hesap",
      format: 1,
      appVersion: APP_VERSION,
      exportedAt: new Date().toISOString(),
      settings: { theme: S.settings.theme || "auto" },
      categories: S.categories.concat(S.catTombs || []).map(function (c) {
        var o = { id: c.id, name: c.name, color: c.color, icon: c.icon, sortOrder: c.sortOrder, createdAt: c.createdAt, updatedAt: c.updatedAt, kind: catKindOf(c) };
        if (c.deleted) o.deleted = true;
        return o;
      }),
      reminders: (S.reminders || []).concat(S.remTombs || []).map(function (r) {
        var o = {
          id: r.id, type: r.type, amount: r.amount, categoryId: r.categoryId || null,
          date: r.date, repeat: r.repeat || null, note: r.note || "",
          done: !!r.done, doneAt: r.doneAt || null, lastDoneDate: r.lastDoneDate || null,
          createdAt: r.createdAt, updatedAt: r.updatedAt
        };
        if (r.deleted) o.deleted = true;
        return o;
      }),
      transactions: S.transactions.concat(S.tombstones || []).map(function (t) {
        var o = {
          id: t.id, type: t.type, amount: t.amount, categoryId: t.categoryId || null,
          note: t.note || "", date: t.date, createdAt: t.createdAt, updatedAt: t.updatedAt
        };
        if (t.type === "adjust") o.adjustSign = t.adjustSign === -1 ? -1 : 1;
        if (t.deleted) o.deleted = true;
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
      var recC = {
        id: String(c.id), name: String(c.name).slice(0, 60),
        color: /^#[0-9a-fA-F]{6}$/.test(c.color || "") ? c.color : "#8E877C",
        icon: ICONS[c.icon] ? c.icon : "tag",
        kind: (c.kind === "income" || c.kind === "expense") ? c.kind : "both",
        sortOrder: Number(c.sortOrder) || cats.length,
        createdAt: Number(c.createdAt) || t,
        updatedAt: Number(c.updatedAt) || t
      };
      if (c.deleted) recC.deleted = true;
      cats.push(recC);
    });
    data.transactions.forEach(function (x) {
      if (!x || !x.id) { bad++; return; }
      if (x.deleted) {
        var recT = {
          id: String(x.id),
          type: ["income", "expense", "adjust"].indexOf(x.type) >= 0 ? x.type : "expense",
          amount: Math.round(Math.abs(Number(x.amount))) || 1,
          categoryId: x.categoryId ? String(x.categoryId) : null,
          note: String(x.note || "").slice(0, 200),
          date: /^\d{4}-\d{2}-\d{2}$/.test(String(x.date || "")) ? String(x.date) : "2000-01-01",
          createdAt: Number(x.createdAt) || t,
          updatedAt: Number(x.updatedAt) || t,
          deleted: true
        };
        if (recT.type === "adjust") recT.adjustSign = x.adjustSign === -1 ? -1 : 1;
        txs.push(recT);
        return;
      }
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
    var rems = [];
    (Array.isArray(data.reminders) ? data.reminders : []).forEach(function (r) {
      if (!r || !r.id) { bad++; return; }
      var amt = Math.round(Math.abs(Number(r.amount))) || 0;
      var recR = {
        id: String(r.id),
        type: r.type === "receive" ? "receive" : "pay",
        amount: amt || 1,
        categoryId: r.categoryId ? String(r.categoryId) : null,
        date: /^\d{4}-\d{2}-\d{2}$/.test(String(r.date || "")) ? String(r.date) : "2000-01-01",
        repeat: r.repeat === "monthly" ? "monthly" : null,
        note: String(r.note || "").slice(0, 200),
        done: !!r.done,
        doneAt: r.doneAt ? Number(r.doneAt) : null,
        lastDoneDate: r.lastDoneDate || null,
        createdAt: Number(r.createdAt) || t,
        updatedAt: Number(r.updatedAt) || t
      };
      if (r.deleted) recR.deleted = true;
      rems.push(recR);
    });
    var theme = (data.settings && ["auto", "light", "dark"].indexOf(data.settings.theme) >= 0) ? data.settings.theme : (S.settings.theme || "auto");
    return { cats: cats, txs: txs, rems: rems, bad: bad, theme: theme };
  }

  /* tüm veriyi değiştir, yeniden yükle, çiz */
  function replaceData(cats, txs, theme, rems) {
    return DB.replaceAll(cats, txs, { theme: theme || S.settings.theme || "auto", schemaVersion: 1 }, rems || []).then(function () {
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
    var cats = n.cats, txs = n.txs, rems = n.rems || [], bad = n.bad;

    var msg = "Bu işlem mevcut <strong>" + S.categories.length + " kategori</strong> ve <strong>" +
      S.transactions.length + " hareket</strong> kaydının üzerine yazacak.<br><br>" +
      "Yüklenecek: <strong>" + cats.length + " kategori</strong>, <strong>" + txs.length + " hareket</strong>." +
      (bad ? "<br><br>" + bad + " geçersiz kayıt atlanacak." : "");

    confirmDialog("Yedeği yükle", msg, { okText: "Üzerine yaz" }).then(function (ok) {
      if (!ok) return;
      replaceData(cats, txs, n.theme, rems).then(function () {
        DB.log("YEDEK", "içe aktarıldı: " + cats.length + " kategori, " + txs.length + " hareket, " + rems.length + " hatırlatma" + (bad ? ", " + bad + " atlandı" : ""));
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
    return Promise.all([
      DB.getAll(DB.ST_CAT),
      DB.getAll(DB.ST_TX),
      DB.getSettings(),
      DB.getAll(DB.ST_REM).catch(function () { return []; })
    ]).then(function (r) {
      var allCats = r[0] || [];
      S.catTombs = allCats.filter(function (x) { return !!(x && x.deleted); });
      S.categories = allCats.filter(function (x) { return !(x && x.deleted); });
      S.tombstones = (r[1] || []).filter(function (x) { return !!(x && x.deleted); });
      S.transactions = (r[1] || []).filter(function (x) { return !(x && x.deleted); });
      var allRems = r[3] || [];
      S.remTombs = allRems.filter(function (x) { return !!(x && x.deleted); });
      S.reminders = allRems.filter(function (x) { return !(x && x.deleted); });
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

    var swHit = hit(".swipe-row.open");
    if (swHit && !hit(".swipe-del")) {
      closeAllSwipe();
      ev.preventDefault();
      ev.stopPropagation();
      return;
    }

    var t = hit("[data-act]");
    if (t) {
      var act = t.getAttribute("data-act");
      if (act === "settings") { go("settings"); return; }
      if (act === "back") {
        if (S.view === "cat" && (S.catMonth || S.catYear)) { go("summary"); return; }
        go("home"); return;
      }
      if (act === "manage") { go("manage"); return; }
      if (act === "adjust") { openAdjustSheet(Number(t.getAttribute("data-sign"))); return; }
      if (act === "prevMonth") { S.month = Fmt.addMonths(S.month, -1); render(); return; }
      if (act === "nextMonth") { S.month = Fmt.addMonths(S.month, 1); render(); return; }
      if (act === "prevYear") { S.year = (Number(S.year) || new Date().getFullYear()) - 1; render(); return; }
      if (act === "nextYear") { S.year = (Number(S.year) || new Date().getFullYear()) + 1; render(); return; }
      if (act === "sumMode") {
        S.summaryMode = t.getAttribute("data-mode") === "year" ? "year" : "month";
        render();
        return;
      }
      if (act === "openYearMonth") {
        S.month = t.getAttribute("data-month") || S.month;
        S.summaryMode = "month";
        go("summary");
        return;
      }
      if (act === "openCatMonth") {
        go("cat", { catId: t.getAttribute("data-id"), month: t.getAttribute("data-month") });
        return;
      }
      if (act === "openCatYear") {
        go("cat", { catId: t.getAttribute("data-id"), year: t.getAttribute("data-year") });
        return;
      }
      if (act === "catAdd") {
        ev.preventDefault();
        openAddSheet(t.getAttribute("data-type"), t.getAttribute("data-cat"));
        return;
      }
      if (act === "save") { saveForm(false); return; }
      if (act === "saveNext") { saveForm(true); return; }
      if (act === "dedit") { deleteCurrentTx(); return; }
      if (act === "saveCat") { saveCat(); return; }
      if (act === "newCat") { openCatSheet(null); return; }
      if (act === "editCat") { openCatSheet(t.getAttribute("data-id")); return; }
      if (act === "delCat") { deleteCat(t.getAttribute("data-id")); return; }
      if (act === "confirmMoveCat") { tombstoneCategory(S.moveCatId, S.moveTarget || null); return; }
      if (act === "cancel") { closeSheet(); return; }
      if (act === "newReminder") { openReminderSheet(null); return; }
      if (act === "saveReminder") { saveReminder(); return; }
      if (act === "remOpen") { ev.preventDefault(); openReminderActionSheet(t.getAttribute("data-id")); return; }
      if (act === "remPost") { ev.preventDefault(); finishReminder(t.getAttribute("data-id") || S.remActionId, true); return; }
      if (act === "remDone") { ev.preventDefault(); finishReminder(t.getAttribute("data-id") || S.remActionId, false); return; }
      if (act === "remsIcsAll") { ev.preventDefault(); ev.stopPropagation(); addAllRemindersToCalendar(); return; }
      if (act === "remIcs") { ev.preventDefault(); ev.stopPropagation(); addReminderToCalendar(t.getAttribute("data-id")); return; }
      if (act === "delReminder" || act === "swipeDelRem") { ev.preventDefault(); ev.stopPropagation(); deleteReminder(t.getAttribute("data-id")); return; }
      if (act === "swipeDelTx") { ev.preventDefault(); ev.stopPropagation(); deleteTxById(t.getAttribute("data-id")); return; }
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
    if (hit("#dlg-ok")) {
      var conf = dlgOnConfirm;
      dlgOnConfirm = null;
      if (typeof conf === "function") { try { conf(); } catch (e) {} }
      closeDialog(true);
      return;
    }
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
      state: function () {
        return {
          settings: S.settings,
          categories: S.categories.concat(S.catTombs || []),
          transactions: S.transactions.concat(S.tombstones || []),
          reminders: (S.reminders || []).concat(S.remTombs || []),
          view: S.view
        };
      },
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
  /* 0.3.7 göçü yerel (tamamlanmış) kopyayı yazdı; 8 Ara kaydı yanlışlıkla done kaldı.
     Yalnızca o eski tamamlanma damgası eşleşirse bir kez açılır. Sonradan gerçek tamamlamaya dokunulmaz. */
  var STALE_REM_ID = "a2c9a852-b953-4af4-b5ac-67a1460c25b7";
  var STALE_REM_DONE_AT = 1794476755794;
  function maybeRepairStaleReminder() {
    var r = remById(STALE_REM_ID);
    if (!r || !r.done || r.deleted) return Promise.resolve(false);
    if (Number(r.doneAt) !== STALE_REM_DONE_AT) return Promise.resolve(false);
    if (r.date !== "2026-12-08" || Number(r.amount) !== 85700) return Promise.resolve(false);
    var rec = Object.assign({}, r);
    rec.done = false;
    rec.doneAt = null;
    rec.lastDoneDate = null;
    rec.updatedAt = now();
    return DB.putReminder(rec).then(function (ok) {
      if (!ok) return false;
      DB.log("HATIRLATMA", "8 Ara kaydı yeniden açıldı (eski tamamlanma geri alındı)");
      return loadData().then(function () { return true; });
    });
  }

  function boot() {
    DB.open().then(function () {
      return loadData();
    }).then(function () {
      applyTheme();
      return seedIfEmpty();
    }).then(function () {
      return loadData();
    }).then(function () {
      return maybeRepairStaleReminder();
    }).then(function () {
      /* depolama sağlığı: önce oku, izin yoksa ana ekranda tekrar iste */
      return checkStorageHealth();
    }).then(function () {
      DB.log("DEPO", "açılış · kategori:" + S.categories.length + " hareket:" + S.transactions.length +
        " hatırlatma:" + (S.reminders || []).length +
        " persist:" + S.persist + " standalone:" + S.storage.standalone +
        " tema:" + (S.settings.theme || "auto") + " sürüm:" + APP_VERSION +
        " build:" + (S.settings.build || "—"));
      render();
      bindSwipe();
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
    counts: function () {
      return Promise.all([
        DB.getAll(DB.ST_TX),
        DB.getAll(DB.ST_CAT),
        DB.getAll(DB.ST_REM).catch(function () { return []; })
      ]).then(function (r) {
        var all = r[0] || [], cats = r[1] || [], rems = r[2] || [];
        return {
          categories: cats.filter(function (x) { return !x.deleted; }).length,
          catTombs: cats.filter(function (x) { return !!x.deleted; }).length,
          transactions: all.filter(function (x) { return !x.deleted; }).length,
          tombstones: all.filter(function (x) { return !!x.deleted; }).length,
          reminders: rems.filter(function (x) { return !x.deleted; }).length,
          remTombs: rems.filter(function (x) { return !!x.deleted; }).length
        };
      });
    },
    dump: buildBackup,
    drive: function () { return window.DriveSync ? DriveSync._state() : null; },
    version: APP_VERSION,
    yearTotals: yearTotals,
    monthTotals: monthTotals,
    pctLabel: pctLabel,
    assignChartColors: assignChartColors,
    donutSliceLens: donutSliceLens,
    isDullColor: isDullColor,
    reminderIcs: function (id, opts) {
      var r = remById(id);
      return r ? reminderIcs(r, opts) : null;
    },
    remindersIcs: function () {
      var rows = liveReminders().filter(function (r) { return !reminderIsDone(r); });
      return buildCalendarIcs(rows);
    },
    lastIcs: function () { return window.__hesapLastIcs || null; },
    state: function () { return S; }
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
