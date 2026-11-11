/* Hesap — IndexedDB katmanı (hesap-db, şema 1)
   Miktarlar tam sayı kuruş. Blob saklanmaz; düz JSON nesneleri. */
window.DB = (function () {
  "use strict";

  var DB_NAME = "hesap-db";
  var DB_VERSION = 1;
  var ST_CAT = "categories";
  var ST_TX = "transactions";
  var ST_SET = "settings";

  var dbPromise = null;
  var LOG = [];

  function log(tag, msg) {
    var line = "[" + tag + "] " + msg;
    LOG.push({ t: Date.now(), line: line });
    if (LOG.length > 400) LOG.shift();
    try { console.log(line); } catch (e) {}
  }

  function getLogs() { return LOG.slice(); }
  function clearLogs() { LOG = []; }

  function open() {
    if (dbPromise) return dbPromise;
    dbPromise = new Promise(function (resolve, reject) {
      if (!window.indexedDB) { reject(new Error("IndexedDB yok")); return; }
      var req;
      try { req = indexedDB.open(DB_NAME, DB_VERSION); }
      catch (e) { reject(e); return; }

      req.onupgradeneeded = function (ev) {
        var db = req.result;
        if (!db.objectStoreNames.contains(ST_CAT)) {
          var c = db.createObjectStore(ST_CAT, { keyPath: "id" });
          c.createIndex("sortOrder", "sortOrder", { unique: false });
        }
        if (!db.objectStoreNames.contains(ST_TX)) {
          var t = db.createObjectStore(ST_TX, { keyPath: "id" });
          t.createIndex("date", "date", { unique: false });
          t.createIndex("categoryId", "categoryId", { unique: false });
        }
        if (!db.objectStoreNames.contains(ST_SET)) {
          db.createObjectStore(ST_SET, { keyPath: "key" });
        }
        log("DEPO", "şema oluşturuldu v" + DB_VERSION);
      };

      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error || new Error("Açılamadı")); };
      req.onblocked = function () { log("DEPO", "bağlantı bloklandı"); };
    });
    return dbPromise;
  }

  function txStore(db, names, mode) {
    return db.transaction(names, mode || "readonly");
  }

  function wrap(req) {
    return new Promise(function (resolve, reject) {
      req.onsuccess = function () { resolve(req.result); };
      req.onerror = function () { reject(req.error); };
    });
  }

  function txDone(tx) {
    return new Promise(function (resolve, reject) {
      tx.oncomplete = function () { resolve(true); };
      tx.onerror = function () { reject(tx.error); };
      tx.onabort = function () { reject(tx.error || new Error("İşlem iptal")); };
    });
  }

  /* ---- okuma ---- */
  function getAll(store) {
    return open().then(function (db) {
      return wrap(txStore(db, [store]).objectStore(store).getAll());
    });
  }

  function getSettings() {
    return open().then(function (db) {
      return wrap(txStore(db, [ST_SET]).objectStore(ST_SET).getAll()).then(function (rows) {
        var o = {};
        (rows || []).forEach(function (r) { o[r.key] = r.value; });
        return o;
      });
    });
  }

  function setSetting(key, value) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_SET], "readwrite");
      tx.objectStore(ST_SET).put({ key: key, value: value });
      return txDone(tx).then(function () {
        return wrap(txStore(db, [ST_SET]).objectStore(ST_SET).get(key));
      }).then(function (back) {
        var ok = back && back.value === value;
        log("DEPO", "ayar yazıldı " + key + "=" + JSON.stringify(value) + " doğrulama:" + (ok ? "OK" : "HATA"));
        return ok;
      });
    });
  }

  /* ---- yazma (her yazmadan sonra okuyarak doğrula) ---- */
  function putCategory(cat) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_CAT], "readwrite");
      tx.objectStore(ST_CAT).put(cat);
      return txDone(tx).then(function () {
        return wrap(txStore(db, [ST_CAT]).objectStore(ST_CAT).get(cat.id)).then(function (back) {
          var ok = !!back && back.name === cat.name;
          log("DEPO", "kategori yazıldı " + cat.name + " doğrulama:" + (ok ? "OK" : "HATA"));
          return ok;
        });
      });
    });
  }

  function putTransaction(t) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_TX], "readwrite");
      tx.objectStore(ST_TX).put(t);
      return txDone(tx).then(function () {
        return wrap(txStore(db, [ST_TX]).objectStore(ST_TX).get(t.id)).then(function (back) {
          var ok = !!back && back.amount === t.amount;
          log("DEPO", "hareket yazıldı " + t.type + " " + t.amount + " doğrulama:" + (ok ? "OK" : "HATA"));
          return ok;
        });
      });
    });
  }

  function deleteTransaction(id) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_TX], "readwrite");
      tx.objectStore(ST_TX).delete(id);
      return txDone(tx).then(function () {
        return wrap(txStore(db, [ST_TX]).objectStore(ST_TX).get(id)).then(function (back) {
          var ok = !back;
          log("DEPO", "hareket silindi doğrulama:" + (ok ? "OK" : "HATA"));
          return ok;
        });
      });
    });
  }

  function deleteCategory(id) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_CAT], "readwrite");
      tx.objectStore(ST_CAT).delete(id);
      return txDone(tx).then(function () {
        return wrap(txStore(db, [ST_CAT]).objectStore(ST_CAT).get(id)).then(function (back) {
          var ok = !back;
          log("DEPO", "kategori silindi doğrulama:" + (ok ? "OK" : "HATA"));
          return ok;
        });
      });
    });
  }

  /* kategoriye bağlı tüm hareketleri sil */
  function deleteTransactionsByCategory(categoryId) {
    return getAll(ST_TX).then(function (all) {
      var ids = all.filter(function (t) { return t.categoryId === categoryId; }).map(function (t) { return t.id; });
      if (!ids.length) { log("DEPO", "kategori hareketleri silindi: 0"); return 0; }
      return open().then(function (db) {
        var tx = txStore(db, [ST_TX], "readwrite");
        var store = tx.objectStore(ST_TX);
        ids.forEach(function (id) { store.delete(id); });
        return txDone(tx).then(function () {
          log("DEPO", "kategori hareketleri silindi: " + ids.length);
          return ids.length;
        });
      });
    });
  }

  /* Tüm veriyi tek işlemde değiştir (yedek yükleme) */
  function replaceAll(categories, transactions, settings) {
    return open().then(function (db) {
      var tx = txStore(db, [ST_CAT, ST_TX, ST_SET], "readwrite");
      var cs = tx.objectStore(ST_CAT);
      var ts = tx.objectStore(ST_TX);
      var ss = tx.objectStore(ST_SET);
      cs.clear(); ts.clear();
      (categories || []).forEach(function (c) { cs.put(c); });
      (transactions || []).forEach(function (t) { ts.put(t); });
      Object.keys(settings || {}).forEach(function (k) { ss.put({ key: k, value: settings[k] }); });
      return txDone(tx).then(function () {
        return Promise.all([getAll(ST_CAT), getAll(ST_TX)]).then(function (r) {
          var ok = r[0].length === (categories || []).length && r[1].length === (transactions || []).length;
          log("DEPO", "toplu yazma kategori:" + r[0].length + " hareket:" + r[1].length + " doğrulama:" + (ok ? "OK" : "HATA"));
          return ok;
        });
      });
    });
  }

  function counts() {
    return Promise.all([getAll(ST_CAT), getAll(ST_TX)]).then(function (r) {
      return { categories: r[0].length, transactions: r[1].length };
    });
  }

  function clearAll() {
    return open().then(function (db) {
      var tx = txStore(db, [ST_CAT, ST_TX], "readwrite");
      tx.objectStore(ST_CAT).clear();
      tx.objectStore(ST_TX).clear();
      return txDone(tx);
    });
  }

  return {
    open: open,
    log: log,
    getLogs: getLogs,
    clearLogs: clearLogs,
    getAll: getAll,
    getSettings: getSettings,
    setSetting: setSetting,
    putCategory: putCategory,
    putTransaction: putTransaction,
    deleteTransaction: deleteTransaction,
    deleteCategory: deleteCategory,
    deleteTransactionsByCategory: deleteTransactionsByCategory,
    replaceAll: replaceAll,
    counts: counts,
    clearAll: clearAll,
    ST_CAT: ST_CAT,
    ST_TX: ST_TX
  };
})();
