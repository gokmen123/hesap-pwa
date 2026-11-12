/* Hesap — biçimlendirme yardımcıları (TL / tr-TR, tarih) */
window.Fmt = (function () {
  "use strict";

  var MONTHS = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
                "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
  var MONTHS_SHORT = ["Oca", "Şub", "Mar", "Nis", "May", "Haz",
                      "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];

  var nf;
  try {
    nf = new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  } catch (e) {
    nf = { format: function (v) { return String(v).replace(".", ","); } };
  }

  /* kuruş -> "48.250,00" */
  function money(kurus) {
    return nf.format((Number(kurus) || 0) / 100);
  }

  /* + işaretli / − işaretli */
  function sgn(kurus) {
    var k = Number(kurus) || 0;
    if (k > 0) return "+" + money(k);
    if (k < 0) return "−" + money(-k);
    return money(0);
  }

  /* negatifse − , pozitifse işaretsiz (kahraman/kategori bakiyesi) */
  function plainSgn(kurus) {
    var k = Number(kurus) || 0;
    if (k < 0) return "−" + money(-k);
    return money(k);
  }

  function pad2(n) { return (n < 10 ? "0" : "") + n; }

  /* Date -> "YYYY-MM-DD" (yerel takvim günü) */
  function ymd(d) {
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1) + "-" + pad2(d.getDate());
  }

  function todayYMD() { return ymd(new Date()); }

  function parseYMD(s) {
    var p = String(s || "").split("-");
    return { y: Number(p[0]) || 1970, m: Number(p[1]) || 1, d: Number(p[2]) || 1 };
  }

  /* "2026-11-11" -> "11 Kasım" */
  function dayLabel(s) {
    var p = parseYMD(s);
    return p.d + " " + MONTHS[p.m - 1];
  }

  /* "2026-11-11" -> "11 Kasım 2026" */
  function fullDate(s) {
    var p = parseYMD(s);
    return p.d + " " + MONTHS[p.m - 1] + " " + p.y;
  }

  /* "2026-11" -> "Kasım 2026" */
  function monthLabel(ym) {
    var p = String(ym || "").split("-");
    var m = Number(p[1]) || 1;
    return MONTHS[m - 1] + " " + (p[0] || "");
  }

  function ymOf(dateStr) { return String(dateStr || "").slice(0, 7); }

  function yearOf(dateStr) {
    var y = Number(String(dateStr || "").slice(0, 4));
    return y || new Date().getFullYear();
  }

  /* "2026-04" — 0-11 ay indisi */
  function monthIndex(ym) {
    var m = Number(String(ym || "").split("-")[1] || 0);
    return Math.max(1, Math.min(12, m)) - 1;
  }

  function ym(year, month) {
    return year + "-" + pad2(month);
  }

  /* "2026-11" + n ay */
  function addMonths(ym, delta) {
    var p = String(ym).split("-");
    var d = new Date(Number(p[0]), Number(p[1]) - 1 + delta, 1);
    return d.getFullYear() + "-" + pad2(d.getMonth() + 1);
  }

  /* Yazarken Türkçe binlik ayırıcı ekle, ondalık virgülü koru */
  function liveAmount(raw) {
    var s = String(raw == null ? "" : raw).replace(/[^\d,.]/g, "").replace(/\./g, "");
    var parts = s.split(",");
    var int = parts[0].replace(/^0+(?=\d)/, "");
    if (int.length > 11) int = int.slice(0, 11);
    var dec = parts.length > 1 ? parts.slice(1).join("").replace(/\D/g, "").slice(0, 2) : null;
    if (int === "" && dec === null) return "";
    var intF = int.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    if (dec === null) return intF;
    return (intF === "" ? "0" : intF) + "," + dec;
  }

  /* "1.234,56" -> 123456 kuruş */
  function parseAmount(text) {
    var s = String(text == null ? "" : text).trim().replace(/\./g, "").replace(",", ".");
    if (!s) return 0;
    var v = parseFloat(s);
    if (!isFinite(v) || v < 0) return 0;
    return Math.round(v * 100);
  }

  return {
    MONTHS: MONTHS,
    MONTHS_SHORT: MONTHS_SHORT,
    money: money,
    sgn: sgn,
    plainSgn: plainSgn,
    ymd: ymd,
    todayYMD: todayYMD,
    parseYMD: parseYMD,
    dayLabel: dayLabel,
    fullDate: fullDate,
    monthLabel: monthLabel,
    ymOf: ymOf,
    yearOf: yearOf,
    monthIndex: monthIndex,
    ym: ym,
    addMonths: addMonths,
    liveAmount: liveAmount,
    parseAmount: parseAmount
  };
})();
