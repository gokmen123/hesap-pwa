/* Hesap — Google Drive eşitleme (0.3.7)
   Telefondaki IndexedDB her zaman asıl kopyadır (yazmalar önce buraya).
   Açılışta, bağlanınca ve internet gelince: çevrimiçiyken Drive'dan
   Hesap/hesap_veri.json ÖNCE çekilir (soru yok); üzerine yazmadan önce
   son 3 yerel güvenlik kopyası alınır. Sonra yerel değişiklikler otomatik
   (gecikmeli) Drive'a gönderilir. Çevrimdışı telefon kopyasıyla sessiz çalışır.
   Çakışma: kayıt id + updatedAt ile birleştirilir, kayıt sessizce kaybolmaz;
   silinen kayıtlar tombstone (deleted) olarak durur, birleştirmede geri gelmez.
   birleşemezse (bozuk dosya vb.) ancak o zaman soru sayfası çıkar.
   Otomatik eşitleme varsayılan açık.
   Kapsam yalnızca `drive.file`. Eski `hesap_yedek.json` (uygulama oluşturmadıysa)
   okunup yeni uygulama dosyası `Hesap/hesap_veri.json` oluşturulur; eski dosyaya
   dokunulmaz. Kapsam yetmezse yerel IndexedDB yüklenir. Yeni kullanıcıda boş
   Drive hata vermez, klasör/dosya uygulama tarafından açılır.
   Boş yerel, dolu Drive'ın üzerine yazılmaz.
   Her kullanıcı kendi Google hesabıyla bağlanır (OAuth tam sayfa yönlendirme).
   config.js'de GOOGLE_CLIENT_ID yoksa bu modül hiçbir şey yapmaz. */
window.DriveSync = (function () {
  "use strict";

  var C = window.HESAP_CONFIG || {};
  var CLIENT_ID = C.GOOGLE_CLIENT_ID || "";
  var SCOPE = C.DRIVE_SCOPE || "https://www.googleapis.com/auth/drive.file";
  var AUTH_URL = C.AUTH_URL || "https://accounts.google.com/o/oauth2/v2/auth";
  var REVOKE_URL = C.REVOKE_URL || "https://oauth2.googleapis.com/revoke";
  var API = C.DRIVE_API || "https://www.googleapis.com";
  var REDIRECT = C.REDIRECT_URI || (location.origin + location.pathname.replace(/index\.html$/, ""));

  var FOLDER_NAME = "Hesap";
  var ARCHIVE_NAME = "eski";
  var FILE_NAME = "hesap_veri.json";
  var LEGACY_FILE_NAME = "hesap_yedek.json";
  var FOLDER_MIME = "application/vnd.google-apps.folder";
  var ARCHIVE_MIN_MS = 60 * 60 * 1000;
  var CHECK_GAP_MS = 45000;
  var NET_TIMEOUT_MS = 25000;
  var AUTO_DELAY_MS = 3500;
  var SILENT_GAP_MS = 10 * 60 * 1000;
  var SAFETY_MAX = 3;
  var OAUTH_KEY = "hesap_oauth";

  var A = null;
  var cfg = null;                   /* {connected, email, name, auto} */
  var tok = null;                   /* {access, exp} */
  var st = { rev: null, hash: null, syncedAt: 0, remoteUpdatedAt: 0, fileId: null, folderId: null, archiveId: null, lastArchiveAt: 0 };
  var localHash = null;
  var remote = null;
  var pending = null;               /* null | push | pull | conflict | first */
  var status = "idle";              /* idle | checking | ok | offline | error | busy | auth */
  var needInteractive = false;
  var lastError = "";
  var lastCheckAt = 0;
  var busy = false;
  var opChain = Promise.resolve();
  var mergePushTries = 0;
  var PENDING_KEY = "hesap_pending_op";
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
  function ic(n) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (IC[n] || "") + '</svg>';
  }
  var GLOGO = '<svg class="g-logo" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>';
  function log(m) { try { DB.log("DRIVE", m); } catch (e) {} }
  function esc(s) { return A.esc(s); }
  function $(s) { return document.querySelector(s); }
  function mkErr(code, msg) { var e = new Error(msg); e.code = code; return e; }

  /* ================= DURUM ================= */
  function available() { return !!CLIENT_ID; }
  function configured() { return available() && !!(cfg && cfg.connected); }
  function hasToken() { return !!(tok && tok.access && tok.exp - 60000 > Date.now()); }

  function saveCfg() {
    return DB.setSetting("drive", cfg ? {
      connected: !!cfg.connected, email: cfg.email || null, name: cfg.name || null,
      auto: cfg.auto !== false, autoOnDefault: true,
      wideScope: !!cfg.wideScope, adoptDenied: !!cfg.adoptDenied,
      ownFile: !!cfg.ownFile
    } : null);
  }
  function saveTok() { return DB.setSetting("driveToken", tok); }
  function saveSt() {
    return DB.setSetting("driveState", {
      rev: st.rev, hash: st.hash, syncedAt: st.syncedAt, remoteUpdatedAt: st.remoteUpdatedAt,
      fileId: st.fileId, folderId: st.folderId, archiveId: st.archiveId, lastArchiveAt: st.lastArchiveAt
    });
  }
  function freshSt() { return { rev: null, hash: null, syncedAt: 0, remoteUpdatedAt: 0, fileId: null, folderId: null, archiveId: null, lastArchiveAt: 0 }; }

  /* ================= GİRİŞ (yönlendirme) ================= */
  function rnd() {
    var a = new Uint8Array(16);
    (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach(function (_, i) { a[i] = Math.random() * 256; });
    return Array.prototype.map.call(a, function (b) { return ("0" + b.toString(16)).slice(-2); }).join("");
  }

  function scopeList() {
    return SCOPE;
  }

  function startAuth(intent, silent) {
    var state = rnd();
    var scope = scopeList();
    try {
      sessionStorage.setItem(OAUTH_KEY, JSON.stringify({ state: state, intent: intent || "check", silent: !!silent, at: Date.now() }));
      if (silent) sessionStorage.setItem("hesap_silent_at", String(Date.now()));
    } catch (e) {}
    var q = {
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT,
      response_type: "token",
      scope: scope,
      include_granted_scopes: "false",
      state: state
    };
    if (silent) q.prompt = "none";
    else if (!cfg || !cfg.email) q.prompt = "select_account";
    if (cfg && cfg.email) q.login_hint = cfg.email;
    var url = AUTH_URL + "?" + Object.keys(q).map(function (k) { return k + "=" + encodeURIComponent(q[k]); }).join("&");
    log((silent ? "sessiz " : "") + "Google girişine yönlendiriliyor · amaç: " + intent + " · kapsam: drive.file");
    status = "busy"; paint();
    setTimeout(function () { location.assign(url); }, silent ? 0 : 120);
    return new Promise(function () {});   /* sayfa ayrılıyor */
  }

  /* Google'dan dönüşte #access_token=… / #error=… */
  function consumeRedirect() {
    var h = location.hash || "";
    if (!/[#&](access_token|error)=/.test(h)) return null;
    var p = {};
    h.replace(/^#/, "").split("&").forEach(function (kv) {
      var i = kv.indexOf("=");
      if (i > 0) { try { p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1).replace(/\+/g, " ")); } catch (e) {} }
    });
    try { history.replaceState(null, "", location.pathname + location.search); } catch (e) {}
    var saved = null;
    try { saved = JSON.parse(sessionStorage.getItem(OAUTH_KEY) || "null"); sessionStorage.removeItem(OAUTH_KEY); } catch (e) {}
    if (!saved || !p.state || p.state !== saved.state) {
      log("giriş dönüşü reddedildi (state uyuşmadı)");
      return { ok: false, intent: null, error: "state" };
    }
    if (p.access_token) {
      tok = { access: p.access_token, exp: Date.now() + (Number(p.expires_in) || 3600) * 1000 };
      needInteractive = false;
      log("Google girişi tamam · belirteç " + Math.round((tok.exp - Date.now()) / 60000) + " dk");
      return { ok: true, intent: saved.intent, silent: saved.silent };
    }
    log("Google girişi: " + (p.error || "hata") + (saved.silent ? " (sessiz)" : ""));
    if (saved.silent) needInteractive = true;
    return { ok: false, intent: saved.intent, silent: saved.silent, error: p.error || "error" };
  }

  function canAutoSilent(reason) {
    if (needInteractive || navigator.onLine === false) return false;
    if (overlayOpen()) return false;
    if (["açılış", "internet geldi", "öne geldi", "401"].indexOf(reason) < 0) return false;
    var v = A.view();
    if (v !== "home" && v !== "summary" && v !== "settings") return false;
    var last = 0;
    try { last = Number(sessionStorage.getItem("hesap_silent_at") || 0); } catch (e) {}
    return Date.now() - last > SILENT_GAP_MS;
  }

  /* ================= DRIVE REST ================= */
  function delay(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
  function backoffMs(attempt) { return Math.min(400 * Math.pow(2, attempt), 4000); }

  function api(path, opts) {
    opts = opts || {};
    var attempt = opts._attempt || 0;
    var max = opts._max != null ? opts._max : 3;
    if (!hasToken()) return Promise.reject(mkErr("auth", "Google oturumu gerekli"));
    var ctl = window.AbortController ? new AbortController() : null;
    var to = setTimeout(function () { if (ctl) ctl.abort(); }, NET_TIMEOUT_MS);
    var headers = { Authorization: "Bearer " + tok.access };
    if (opts.type) headers["Content-Type"] = opts.type;
    function retry() {
      return delay(backoffMs(attempt)).then(function () {
        return api(path, Object.assign({}, opts, { _attempt: attempt + 1 }));
      });
    }
    return fetch(API + path, {
      method: opts.method || "GET", headers: headers, body: opts.body, cache: "no-store",
      signal: ctl ? ctl.signal : undefined
    }).then(function (r) {
      clearTimeout(to);
      if (r.status === 401) { tok = null; saveTok(); throw mkErr("auth", "Google oturumu sona erdi"); }
      if (r.status === 404 && opts.allow404) return null;
      if (!r.ok) {
        if ((r.status >= 500 || r.status === 429) && attempt < max) return retry();
        return r.text().then(function (txt) {
          var msg = "Drive " + r.status;
          try { var j = JSON.parse(txt); if (j.error && j.error.message) msg += " · " + j.error.message; } catch (e) {}
          throw mkErr(r.status === 403 ? "forbidden" : (r.status === 409 ? "conflict" : "http"), msg);
        });
      }
      return opts.raw ? r.text() : r.json();
    }, function (e) {
      clearTimeout(to);
      if (attempt < max && !(e && e.name === "AbortError" && opts.noRetryTimeout)) return retry();
      throw mkErr("net", e && e.name === "AbortError" ? "Zaman aşımı" : "Bağlanılamadı");
    });
  }

  function qs(o) { return Object.keys(o).map(function (k) { return k + "=" + encodeURIComponent(o[k]); }).join("&"); }
  function qEsc(s) { return String(s).replace(/\\/g, "\\\\").replace(/'/g, "\\'"); }

  function findOne(q) {
    return findAll(q).then(function (list) { return list[0] || null; });
  }
  function findAll(q) {
    return api("/drive/v3/files?" + qs({ q: q, spaces: "drive", fields: "files(id,name,modifiedTime,parents,appProperties)", pageSize: 20 }))
      .then(function (r) { return (r && r.files) || []; });
  }
  function scoreBackup(f) {
    var ap = (f && f.appProperties) || {};
    var rev = Number(ap.rev || 0);
    var tx = Number(ap.tx || 0);
    return (rev > 0 ? 100000 : 0) + tx * 10 + rev;
  }
  function pickBackup(list) {
    if (!list || !list.length) return null;
    return list.slice().sort(function (a, b) { return scoreBackup(b) - scoreBackup(a); })[0];
  }

  function folderOk(id) {
    if (!id) return Promise.resolve(false);
    return api("/drive/v3/files/" + encodeURIComponent(id) + "?fields=id,trashed", { allow404: true })
      .then(function (f) { return !!(f && !f.trashed); });
  }

  function ensureFolder(create) {
    return folderOk(st.folderId).then(function (ok) {
      if (ok) return st.folderId;
      return findAll("name='" + FOLDER_NAME + "' and mimeType='" + FOLDER_MIME + "' and trashed=false").then(function (folders) {
        var rootOne = null;
        (folders || []).forEach(function (f) {
          if ((f.parents || []).indexOf("root") >= 0) rootOne = rootOne || f;
        });
        var chosen = rootOne || (folders && folders[0]) || null;
        if (chosen) { st.folderId = chosen.id; return chosen.id; }
        if (!create) return null;
        return api("/drive/v3/files?fields=id", { method: "POST", type: "application/json", body: JSON.stringify({ name: FOLDER_NAME, mimeType: FOLDER_MIME, parents: ["root"] }) })
          .then(function (n) { st.folderId = n.id; log("Drive'da Hesap klasörü oluşturuldu"); return n.id; });
      });
    });
  }

  function ensureArchive() {
    return folderOk(st.archiveId).then(function (ok) {
      if (ok) return st.archiveId;
      return findOne("name='" + ARCHIVE_NAME + "' and mimeType='" + FOLDER_MIME + "' and trashed=false and '" + qEsc(st.folderId) + "' in parents").then(function (f) {
        if (f) { st.archiveId = f.id; return f.id; }
        return api("/drive/v3/files?fields=id", { method: "POST", type: "application/json", body: JSON.stringify({ name: ARCHIVE_NAME, mimeType: FOLDER_MIME, parents: [st.folderId] }) })
          .then(function (n) { st.archiveId = n.id; return n.id; });
      });
    });
  }

  function metaFromFile(f) {
    var ap = (f && f.appProperties) || {};
    var rev = Number(ap.rev || 0);
    return {
      exists: !!f && rev > 0,
      rev: rev,
      hash: ap.hash || null,
      updatedAt: Number(ap.at || 0) || (f && f.modifiedTime ? Date.parse(f.modifiedTime) : 0),
      device: ap.device || null,
      summary: ap.tx != null ? { tx: Number(ap.tx), balance: Number(ap.bal || 0), lastDate: ap.last || null } : null,
      fileId: f ? f.id : null
    };
  }

  function isLegacyFile(f) {
    return !!(f && f.name === LEGACY_FILE_NAME);
  }
  function isOwnFile(f) {
    return !!(f && f.name === FILE_NAME && !f.trashed);
  }

  function findBackupFile() {
    var byId = st.fileId
      ? api("/drive/v3/files/" + encodeURIComponent(st.fileId) + "?fields=id,name,trashed,modifiedTime,parents,appProperties", { allow404: true })
      : Promise.resolve(null);
    return byId.then(function (f) {
      if (isOwnFile(f)) return f;
      if (f && isLegacyFile(f)) st.fileId = null;
      else if (!f || f.trashed) st.fileId = null;
      return findAll("name='" + FILE_NAME + "' and trashed=false").then(function (all) {
        var chosen = pickBackup(all);
        if (chosen && chosen.parents && chosen.parents[0]) st.folderId = chosen.parents[0];
        return chosen;
      });
    });
  }

  function findLegacyFile() {
    return findAll("name='" + LEGACY_FILE_NAME + "' and trashed=false").then(function (all) {
      return pickBackup(all);
    });
  }

  function hydrateMeta(f, data) {
    var m = metaFromFile(f);
    if (!f) return m;
    if (m.exists) {
      if (data) m.data = data;
      return m;
    }
    if (!data) return m;
    var norm = A.normalize(data);
    if (norm.error) return m;
    var sync = data.sync || {};
    m.exists = true;
    m.rev = Number(sync.rev || 1) || 1;
    m.hash = sync.hash || null;
    m.updatedAt = Number(sync.updatedAt || 0) || m.updatedAt;
    m.device = sync.device || m.device;
    m.summary = summaryOf({ categories: norm.cats, transactions: norm.txs });
    m.data = data;
    m.adopted = true;
    return m;
  }

  function remoteMeta() {
    return findBackupFile().then(function (f) {
      if (f) st.fileId = f.id;
      var m = metaFromFile(f);
      if (m.exists || !f) return m;
      return api("/drive/v3/files/" + encodeURIComponent(f.id) + "?alt=media", { raw: true, allow404: true }).then(function (txt) {
        if (!txt) return m;
        var data;
        try { data = JSON.parse(txt); } catch (e) { return m; }
        m = hydrateMeta(f, data);
        if (m.exists && !m.hash) {
          return hashOf({ categories: (A.normalize(data).cats || []), transactions: (A.normalize(data).txs || []) }).then(function (h) {
            m.hash = h; return m;
          });
        }
        return m;
      }).catch(function () { return m; });
    });
  }

  function remoteGet() {
    return remoteMeta().then(function (m) {
      if (!m.exists) return m;
      if (m.data) return m;
      return api("/drive/v3/files/" + encodeURIComponent(m.fileId) + "?alt=media", { raw: true }).then(function (txt) {
        try { m.data = JSON.parse(txt); } catch (e) { throw mkErr("bad_file", "Drive'daki dosya bozuk"); }
        return hydrateMeta({ id: m.fileId, modifiedTime: null, appProperties: { rev: String(m.rev), hash: m.hash, at: String(m.updatedAt || 0), device: m.device } }, m.data);
      });
    });
  }

  function multipart(meta, content) {
    var b = "hesap" + rnd();
    var body = "--" + b + "\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n" + JSON.stringify(meta) +
      "\r\n--" + b + "\r\nContent-Type: application/json\r\n\r\n" + content + "\r\n--" + b + "--";
    return { type: "multipart/related; boundary=" + b, body: body };
  }

  function stamp() {
    var d = new Date(), p = function (n) { return ("0" + n).slice(-2); };
    return d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + "-" + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds());
  }

  /* iyimser kilit: yazmadan hemen önce Drive sürümüne bak */
  function remotePut(data, hash, summary, baseRev, force) {
    return remoteMeta().then(function (cur) {
      if (!force && cur.exists && baseRev !== cur.rev) {
        var e = mkErr("conflict", "Drive'da daha yeni veri var"); e.meta = cur; throw e;
      }
      var rev = (cur.exists ? cur.rev : 0) + 1;
      var at = Date.now();
      data.sync = { rev: rev, updatedAt: at, device: deviceName(), hash: hash };
      var ap = { app: "hesap", rev: String(rev), hash: hash, at: String(at), device: deviceName(),
                 tx: String(summary.tx), bal: String(summary.balance), last: summary.lastDate || "" };
      var archive = Promise.resolve();
      if (cur.exists && (force || Date.now() - (st.lastArchiveAt || 0) > ARCHIVE_MIN_MS)) {
        archive = ensureArchive().then(function (aid) {
          return api("/drive/v3/files/" + encodeURIComponent(cur.fileId) + "/copy?fields=id", {
            method: "POST", type: "application/json",
            body: JSON.stringify({ name: "hesap_yedek_r" + cur.rev + "_" + stamp() + ".json", parents: [aid] })
          });
        }).then(function () { st.lastArchiveAt = Date.now(); log("önceki Drive sürümü eski/ klasörüne kopyalandı (r" + cur.rev + ")"); })
          .catch(function (e) { log("arşiv kopyası alınamadı: " + e.message); });
      }
      var content = JSON.stringify(data);
      function createNew() {
        return ensureFolder(true).then(function (fid) {
          var mp = multipart({ name: FILE_NAME, mimeType: "application/json", parents: [fid], appProperties: ap }, content);
          return api("/upload/drive/v3/files?uploadType=multipart&fields=id,modifiedTime,appProperties",
            { method: "POST", type: mp.type, body: mp.body });
        });
      }
      return archive.then(function () {
        if (cur.exists && cur.fileId && !isLegacyFile({ name: cur.name || FILE_NAME })) {
          var mp = multipart({ appProperties: ap }, content);
          return api("/upload/drive/v3/files/" + encodeURIComponent(cur.fileId) + "?uploadType=multipart&fields=id,name,modifiedTime,appProperties",
            { method: "PATCH", type: mp.type, body: mp.body }).catch(function (e) {
              if (e.code !== "forbidden") throw e;
              log("bu dosyaya yazılamadı · yeni uygulama dosyası oluşturulacak (eski dosya duruyor)");
              return createNew();
            });
        }
        return createNew();
      }).then(function (f) {
        st.fileId = f.id;
        return { rev: rev, updatedAt: at, fileId: f.id };
      });
    });
  }

  function fetchAccount() {
    return api("/drive/v3/about?fields=user(emailAddress,displayName)").then(function (r) {
      var u = (r && r.user) || {};
      cfg = cfg || { auto: true };
      if (cfg.auto !== false) cfg.auto = true;
      cfg.connected = true;
      cfg.email = u.emailAddress || cfg.email || null;
      cfg.name = u.displayName || cfg.name || null;
      return saveCfg();
    });
  }
  /* ================= ÖZET / KARMA ================= */
  function canon(s) {
    var cats = s.categories.map(function (c) {
      return [c.id, c.name, c.color, c.icon, c.sortOrder || 0, catKind(c), c.deleted ? 1 : 0];
    }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    var txs = s.transactions.map(function (t) {
      return [t.id, t.type, t.amount, t.categoryId || null, t.note || "", t.date, t.type === "adjust" ? (t.adjustSign === -1 ? -1 : 1) : 0, t.deleted ? 1 : 0];
    }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    var rems = (s.reminders || []).map(function (r) {
      return [r.id, r.type, Number(r.amount) || 0, r.categoryId || null, r.date || "", r.repeat || "", r.note || "", r.done ? 1 : 0, r.deleted ? 1 : 0];
    }).sort(function (a, b) { return a[0] < b[0] ? -1 : 1; });
    return JSON.stringify([cats, txs, rems]);
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

  function isTomb(t) { return !!(t && t.deleted); }
  function liveList(list) {
    return (list || []).filter(function (t) { return !isTomb(t); });
  }

  function summaryOf(s) {
    var txs = liveList(s.transactions);
    var o = { tx: txs.length, cats: s.categories.length, balance: 0, lastDate: null };
    txs.forEach(function (t) {
      if (t.type === "income") o.balance += t.amount;
      else if (t.type === "expense") o.balance -= t.amount;
      else if (t.type === "adjust") o.balance += (t.adjustSign === -1 ? -t.amount : t.amount);
      if (!o.lastDate || t.date > o.lastDate) o.lastDate = t.date;
    });
    return o;
  }

  function localEmpty() { return liveList(A.state().transactions).length === 0; }

  function deviceName() {
    var ua = navigator.userAgent || "";
    if (/iPhone/.test(ua)) return "iPhone";
    if (/iPad/.test(ua)) return "iPad";
    if (/Android/.test(ua)) return "Android";
    if (/Windows/.test(ua)) return "Bilgisayar";
    if (/Mac/.test(ua)) return "Mac";
    return "Tarayıcı";
  }

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
    if (st.rev == null) return localEmpty() ? "pull" : "merge";
    var rChanged = meta.rev !== st.rev;
    var lChanged = localHash !== st.hash;
    if (rChanged && lChanged) return "merge";
    if (rChanged) return "pull";
    if (lChanged) return "push";
    return "same";
  }

  function newId() {
    return (window.crypto && crypto.randomUUID) ? crypto.randomUUID() : ("x" + Date.now().toString(36) + Math.random().toString(36).slice(2, 10));
  }

  function catKind(c) {
    return (c && (c.kind === "income" || c.kind === "expense")) ? c.kind : "both";
  }
  function sameCat(a, b) {
    return a.name === b.name && a.color === b.color && a.icon === b.icon &&
      (Number(a.sortOrder) || 0) === (Number(b.sortOrder) || 0) &&
      catKind(a) === catKind(b) && !!a.deleted === !!b.deleted;
  }
  function sameRem(a, b) {
    return a.type === b.type && Number(a.amount) === Number(b.amount) &&
      (a.categoryId || null) === (b.categoryId || null) && a.date === b.date &&
      (a.repeat || "") === (b.repeat || "") && (a.note || "") === (b.note || "") &&
      !!a.done === !!b.done && !!a.deleted === !!b.deleted;
  }
  function sameTx(a, b) {
    return a.type === b.type && Number(a.amount) === Number(b.amount) &&
      (a.categoryId || null) === (b.categoryId || null) && (a.note || "") === (b.note || "") &&
      a.date === b.date && (a.type !== "adjust" || (a.adjustSign === -1 ? -1 : 1) === (b.adjustSign === -1 ? -1 : 1)) &&
      !!a.deleted === !!b.deleted;
  }
  function pickNewer(a, b) {
    var at = Number(a.updatedAt || 0), bt = Number(b.updatedAt || 0);
    if (bt > at) return b;
    if (at > bt) return a;
    return null;
  }

  /* İki taraftaki kayıtları id + updatedAt ile birleştir. Aynı id, aynı zaman, farklı içerik:
     yereldeki kalır, Drive'daki yeni id ile kopyalanır — kayıt kaybolmaz. */
  function mergeStates(local, remoteNorm) {
    var cats = {};
    (local.categories || []).forEach(function (c) { cats[c.id] = c; });
    (remoteNorm.cats || []).forEach(function (c) {
      if (!cats[c.id]) { cats[c.id] = c; return; }
      var a = cats[c.id];
      if (isTomb(a) || isTomb(c)) {
        var newerC = pickNewer(a, c);
        if (newerC) { cats[c.id] = newerC; return; }
        cats[c.id] = isTomb(a) ? a : c;
        return;
      }
      if (sameCat(a, c)) {
        if (Number(c.updatedAt || 0) > Number(a.updatedAt || 0)) cats[c.id] = c;
        return;
      }
      var n = pickNewer(a, c);
      if (n) { cats[c.id] = n; return; }
      var copy = {};
      Object.keys(c).forEach(function (k) { copy[k] = c[k]; });
      copy.id = newId();
      copy.updatedAt = Date.now();
      cats[copy.id] = copy;
    });
    var txs = {};
    (local.transactions || []).forEach(function (t) { txs[t.id] = t; });
    (remoteNorm.txs || []).forEach(function (t) {
      if (!txs[t.id]) { txs[t.id] = t; return; }
      var a = txs[t.id];
      if (isTomb(a) || isTomb(t)) {
        var newer = pickNewer(a, t);
        if (newer) { txs[t.id] = newer; return; }
        /* aynı an: silme kazansın, kayıt geri gelmesin */
        txs[t.id] = isTomb(a) ? a : t;
        return;
      }
      if (sameTx(a, t)) {
        if (Number(t.updatedAt || 0) > Number(a.updatedAt || 0)) txs[t.id] = t;
        return;
      }
      var n = pickNewer(a, t);
      if (n) { txs[t.id] = n; return; }
      var copy = {};
      Object.keys(t).forEach(function (k) { copy[k] = t[k]; });
      copy.id = newId();
      copy.updatedAt = Date.now();
      if (copy.note) copy.note = String(copy.note);
      txs[copy.id] = copy;
    });
    var remMap = {};
    (local.reminders || []).forEach(function (r) { remMap[r.id] = r; });
    (remoteNorm.rems || []).forEach(function (r) {
      if (!remMap[r.id]) { remMap[r.id] = r; return; }
      var a = remMap[r.id];
      if (isTomb(a) || isTomb(r)) {
        var newerR = pickNewer(a, r);
        if (newerR) { remMap[r.id] = newerR; return; }
        remMap[r.id] = isTomb(a) ? a : r;
        return;
      }
      if (sameRem(a, r)) {
        if (Number(r.updatedAt || 0) > Number(a.updatedAt || 0)) remMap[r.id] = r;
        return;
      }
      var nR = pickNewer(a, r);
      if (nR) { remMap[r.id] = nR; return; }
      var copyR = {};
      Object.keys(r).forEach(function (k) { copyR[k] = r[k]; });
      copyR.id = newId();
      copyR.updatedAt = Date.now();
      remMap[copyR.id] = copyR;
    });
    var catList = Object.keys(cats).map(function (k) { return cats[k]; })
      .sort(function (a, b) { return (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0); });
    var txList = Object.keys(txs).map(function (k) { return txs[k]; });
    var remList = Object.keys(remMap).map(function (k) { return remMap[k]; });
    return { cats: catList, txs: txList, rems: remList, theme: (local.settings && local.settings.theme) || remoteNorm.theme };
  }

  function queueOp(op) {
    try { sessionStorage.setItem(PENDING_KEY, JSON.stringify({ op: op, at: Date.now() })); } catch (e) {}
  }
  function takeQueuedOp() {
    try {
      var raw = sessionStorage.getItem(PENDING_KEY);
      if (raw) sessionStorage.removeItem(PENDING_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function exclusive(fn) {
    var run = opChain.then(function () {
      busy = true; status = "busy"; paint();
      return Promise.resolve().then(fn);
    });
    opChain = run.then(function () { busy = false; paint(); }, function () { busy = false; paint(); });
    return run;
  }

  function needAuth(reason, intent) {
    queueOp(intent || reason || "check");
    if (canAutoSilent(reason)) return startAuth(intent || "check", true);
    status = "auth";
    paint();
    return Promise.resolve(null);
  }

  function markMigrated() {
    if (!cfg) cfg = {};
    cfg.ownFile = true;
    return saveCfg();
  }

  function writeOwnFromState() {
    /* Yeni uygulama dosyasını yerel (birleştirilmiş) veriden oluştur; eski yedeğe dokunma. */
    return push(true, { silent: true, _excl: true, migrate: true }).then(function (ok) {
      return markMigrated().then(function () { return ok; });
    });
  }

  function importLegacyThenWrite(legacy) {
    return api("/drive/v3/files/" + encodeURIComponent(legacy.id) + "?alt=media", { raw: true }).then(function (txt) {
      var data;
      try { data = JSON.parse(txt); } catch (e) { data = null; }
      var n = data ? A.normalize(data) : { error: "bozuk" };
      if (n.error) {
        log("eski yedek okunamadı (" + n.error + ") · yerel kullanılacak");
        return writeOwnFromState();
      }
      log("eski hesap_yedek.json bulundu · uygulama dosyasına kopyalanacak (eski dosya duruyor)");
      function afterLocal() {
        return writeOwnFromState();
      }
      if (localEmpty()) {
        return safetyCopy("eski yedekten göç").then(function () {
          return A.replaceData(n.cats, n.txs, n.theme, n.rems);
        }).then(function () { A.render(); return refreshLocalHash(); }).then(afterLocal);
      }
      var merged = mergeStates(A.state(), n);
      return safetyCopy("eski yedekten birleşim").then(function () {
        return A.replaceData(merged.cats, merged.txs, merged.theme, merged.rems);
      }).then(function () { A.render(); return refreshLocalHash(); }).then(afterLocal);
    }).catch(function (e) {
      log("eski yedek görünmedi veya okunamadı · yerel kullanılacak: " + (e.message || e.code || ""));
      if (localEmpty()) return markMigrated();
      return writeOwnFromState();
    });
  }

  /* Uygulama dosyası yoksa: görünür eski yedekten veya yerel veriden hesap_veri.json oluştur. */
  function maybeMigrate(reason) {
    if (!configured() || !hasToken()) return Promise.resolve(null);
    if (navigator.onLine === false) return Promise.resolve(null);
    if (cfg && cfg.ownFile && st.fileId) return Promise.resolve(null);
    return findBackupFile().then(function (own) {
      if (isOwnFile(own)) {
        st.fileId = own.id;
        if (own.parents && own.parents[0]) st.folderId = own.parents[0];
        return markMigrated().then(function () { return own; });
      }
      return findLegacyFile().then(function (legacy) {
        if (legacy) return importLegacyThenWrite(legacy);
        if (localEmpty()) {
          log("Drive boş · yeni kullanıcı, temiz başlangıç (" + (reason || "") + ")");
          return markMigrated();
        }
        log("uygulama dosyası yok · yerel veriden oluşturulacak (" + (reason || "") + ")");
        return writeOwnFromState();
      });
    }).catch(function (e) {
      if (e.code === "auth") throw e;
      log("göç denemesi: " + (e.message || e.code || ""));
      if (localEmpty()) return markMigrated();
      return writeOwnFromState().catch(function () { return markMigrated(); });
    });
  }

  function check(reason, opts) {
    opts = opts || {};
    if (!configured()) return Promise.resolve(null);
    if (!opts._excl) return exclusive(function () { return check(reason, Object.assign({}, opts, { _excl: true })); });
    if (navigator.onLine === false) { status = "offline"; paint(); return Promise.resolve(null); }
    var t = Date.now();
    if (!opts.force && t - lastCheckAt < CHECK_GAP_MS) return Promise.resolve(null);
    if (!hasToken()) {
      /* belirteç yok: açılışta her zaman, sonradan yalnızca gönderilecek değişiklik varsa sessiz yenile */
      if (reason === "açılış" || reason === "internet geldi" || localDirty() || opts.force) return needAuth(reason);
      return Promise.resolve(null);   /* gönderilecek bir şey yok; uyarı gösterme */
    }
    lastCheckAt = t;
    status = "checking";
    paint();
    return maybeMigrate(reason).then(function () {
      return refreshLocalHash();
    }).then(function () {
      return remoteMeta();
    }).then(function (meta) {
      lastError = "";
      var d = decide(meta);
      log("kontrol (" + reason + ") · drive rev:" + meta.rev + " yerel rev:" + st.rev + " → " + (d || "eşit"));
      if (d === "same") {
        st.rev = meta.rev; st.hash = localHash; st.syncedAt = Date.now(); st.remoteUpdatedAt = meta.updatedAt;
        if (meta.fileId) st.fileId = meta.fileId;
        pending = null; status = "ok";
        return saveSt().then(function () { paint(); return null; });
      }
      pending = (d === "push" || d === "pull" || d === "conflict" || d === "first" || d === "merge") ? d : null;
      status = "ok";
      saveSt();
      paint();
      var sub = { silent: true, reason: reason, _excl: true };
      if (pending === "pull") return pull(sub);
      if (pending === "merge") return mergeFromDrive(sub);
      if ((pending === "push" || pending === "first") && cfg.auto !== false) return push(false, { silent: true, _excl: true });
      if (pending && !opts.quiet && cfg.auto === false) maybePrompt();
      return pending;
    }).catch(function (e) {
      if (e.code === "auth") { log("oturum düştü (" + reason + ")"); return needAuth("401"); }
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
    if (!configured()) return Promise.resolve(false);
    if (!opts._excl) return exclusive(function () { return push(force, Object.assign({}, opts, { _excl: true })); });
    if (!hasToken()) {
      queueOp(force ? "pushForce" : "push");
      if (opts.silent) { status = "auth"; paint(); return needAuth("401", force ? "pushForce" : "push"); }
      return startAuth(force ? "pushForce" : "push", false);
    }
    if (localEmpty() && remote && remote.exists && !force) {
      log("yerel boş, Drive dolu · gönderilmedi, Drive alınacak");
      return pull({ silent: true, reason: "boş yerel, dolu Drive", _excl: true });
    }
    status = "busy"; paint(); sheetBusy(true);
    var s = A.state();
    var data = A.buildBackup();
    var sum = summaryOf(s);
    var h;
    return refreshLocalHash().then(function (hh) {
      h = hh;
      var base = st.rev == null ? (remote && remote.exists ? -1 : 0) : st.rev;
      return remotePut(data, h, sum, base, !!force);
    }).then(function (r) {
      st.rev = r.rev; st.hash = h; st.syncedAt = Date.now(); st.remoteUpdatedAt = r.updatedAt; st.fileId = r.fileId;
      remote = { exists: true, rev: r.rev, hash: h, updatedAt: r.updatedAt, device: deviceName(), summary: sum, fileId: r.fileId };
      pending = null; status = "ok"; lastError = "";
      log("Drive'a yazıldı · rev " + r.rev + " · " + sum.tx + " hareket" + (force ? " (zorla)" : ""));
      mergePushTries = 0;
      return Promise.all([saveSt(), DB.setSetting("lastBackupAt", Date.now())]).then(function () {
        A.state().settings.lastBackupAt = Date.now();
        closeSheet(); paint();
        if (!opts.silent) A.toast("Drive'a yedeklendi");
        return true;
      });
    }).catch(function (e) {
      sheetBusy(false);
      if (e.code === "conflict") {
        log("gönderme çakıştı · drive rev " + (e.meta && e.meta.rev) + " · birleştirilecek");
        if (e.meta) remote = e.meta;
        pending = "merge"; status = "ok"; paint();
        dismissedSig = null;
        return mergeFromDrive({ silent: true, reason: "gönderme çakışması", _excl: true, _fromPush: true });
      }
      if (e.code === "auth") {
        closeSheet();
        queueOp(force ? "pushForce" : "push");
        return opts.silent ? needAuth("401", force ? "pushForce" : "push") : startAuth(force ? "pushForce" : "push", false);
      }
      status = "error"; lastError = e.message; paint();
      log("gönderme hatası: " + (e.code || "") + " " + e.message);
      return false;
    });
  }

  function pull(opts) {
    opts = opts || {};
    if (!configured()) return Promise.resolve(false);
    if (!opts._excl) return exclusive(function () { return pull(Object.assign({}, opts, { _excl: true })); });
    if (!hasToken()) { queueOp("pull"); return startAuth("pull", false); }
    status = "busy"; paint(); sheetBusy(true);
    var got, norm, wasEmpty = localEmpty();
    return remoteGet().then(function (r) {
      if (!r.exists || !r.data) throw mkErr("empty", "Drive'da henüz yedek yok");
      got = r;
      norm = A.normalize(r.data);
      if (norm.error) throw mkErr("bad_file", "Drive'daki dosya okunamadı");
      return safetyCopy("Drive'dan çekmeden önce");
    }).then(function () {
      suppressLocal = true;
      return A.replaceData(norm.cats, norm.txs, norm.theme, norm.rems);
    }).then(function () {
      suppressLocal = false;
      return refreshLocalHash();
    }).then(function (h) {
      st.rev = got.rev; st.hash = h; st.syncedAt = Date.now(); st.remoteUpdatedAt = got.updatedAt; st.fileId = got.fileId;
      delete got.data; remote = got;
      pending = null; status = "ok"; lastError = "";
      log("Drive'dan alındı · rev " + got.rev + " · " + liveList(norm.txs).length + " hareket" + (norm.bad ? " · " + norm.bad + " atlandı" : "") + (opts.reason ? " (" + opts.reason + ")" : ""));
      return saveSt();
    }).then(function () {
      closeSheet(); paint();
      if (!opts.silent || wasEmpty) A.toast("Drive'dan " + liveList(norm.txs).length + " hareket yüklendi");
      return safetyCopy("Drive'dan alındı").then(function () { return true; });
    }).catch(function (e) {
      suppressLocal = false;
      sheetBusy(false);
      if (e.code === "auth") { closeSheet(); queueOp("pull"); return opts.silent ? needAuth("401", "pull") : startAuth("pull", false); }
      status = "error"; lastError = e.message; paint();
      log("çekme hatası: " + (e.code || "") + " " + e.message);
      return false;
    });
  }

  function mergeFromDrive(opts) {
    opts = opts || {};
    if (!configured()) return Promise.resolve(false);
    if (!opts._excl) return exclusive(function () { return mergeFromDrive(Object.assign({}, opts, { _excl: true })); });
    if (!hasToken()) { queueOp("check"); return startAuth("check", false); }
    status = "busy"; paint(); sheetBusy(true);
    var got, merged;
    return remoteGet().then(function (r) {
      if (!r.exists || !r.data) throw mkErr("empty", "Drive'da henüz yedek yok");
      got = r;
      var norm = A.normalize(r.data);
      if (norm.error) throw mkErr("bad_file", "Drive'daki dosya okunamadı");
      merged = mergeStates(A.state(), norm);
      return safetyCopy("birleştirmeden önce");
    }).then(function () {
      suppressLocal = true;
      return A.replaceData(merged.cats, merged.txs, merged.theme, merged.rems);
    }).then(function () {
      suppressLocal = false;
      return refreshLocalHash();
    }).then(function (h) {
      st.rev = got.rev; st.hash = got.hash || null; st.syncedAt = Date.now();
      st.remoteUpdatedAt = got.updatedAt; st.fileId = got.fileId;
      delete got.data; remote = got;
      pending = localHash && got.hash && localHash === got.hash ? null : "push";
      status = "ok"; lastError = "";
      log("birleştirildi · rev " + got.rev + " · " + merged.txs.length + " hareket" + (opts.reason ? " (" + opts.reason + ")" : ""));
      return saveSt();
    }).then(function () {
      closeSheet(); paint();
      if (!opts.silent) A.toast("Telefon ve Drive birleştirildi");
      if (cfg.auto !== false && hasToken() && navigator.onLine !== false && localDirty()) {
        if (opts._fromPush && mergePushTries >= 2) {
          log("birleştirme sonrası gönderim sınırı");
          mergePushTries = 0;
          return true;
        }
        mergePushTries += 1;
        return push(false, { silent: true, _excl: true });
      }
      return true;
    }).catch(function (e) {
      suppressLocal = false;
      sheetBusy(false);
      if (e.code === "auth") { closeSheet(); queueOp("check"); return opts.silent ? needAuth("401") : startAuth("check", false); }
      if (e.code === "bad_file" || e.code === "empty") {
        pending = "conflict"; status = "ok"; paint();
        log("birleştirilemedi: " + e.message);
        if (!opts.quiet) showSheet("conflict");
        return false;
      }
      status = "error"; lastError = e.message; paint();
      log("birleştirme hatası: " + (e.code || "") + " " + e.message);
      return false;
    });
  }

  /* app.js her veri yüklemesinden sonra çağırır */
  function scheduleAutoPush(delay) {
    if (!configured() || (cfg && cfg.auto === false)) return;
    if (navigator.onLine === false) return;
    if (!hasToken()) {
      queueOp("push");
      if (canAutoSilent("token")) needAuth("token", "push");
      return;
    }
    clearTimeout(autoTimer);
    autoTimer = setTimeout(function () {
      if (busy) { scheduleAutoPush(800); return; }
      if (localDirty() || (st.rev == null && !localEmpty())) {
        log("otomatik yedek");
        push(false, { silent: true });
      }
    }, delay == null ? AUTO_DELAY_MS : delay);
  }

  function onLocalChange() {
    if (!configured() || suppressLocal || !A) return;
    refreshLocalHash().then(function () {
      var shouldPush = false;
      if (st.rev == null) {
        if (!localEmpty()) { pending = "first"; shouldPush = true; }
        paint();
      } else {
        if (localDirty() && !pending) pending = "push";
        if (!localDirty() && pending === "push") pending = null;
        shouldPush = localDirty();
        paint();
      }
      if (shouldPush) scheduleAutoPush();
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
    (A.state().reminders || []).forEach(function (r) { if ((r.updatedAt || 0) > m) m = r.updatedAt; });
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

  /* ================= KARŞILAMA (ilk açılış) ================= */
  function showWelcome() {
    var el = $("#drv-sheet");
    if (!el || !available()) return false;
    sheetBusy(false);
    $("#drv-body").innerHTML =
      '<div class="drv-welcome-art">' +
        '<div class="drv-w-phone">' + ic("phone") + '</div>' +
        '<div class="drv-w-line"><i></i><i></i><i></i></div>' +
        '<div class="drv-w-drive">' + ic("drive") + '</div>' +
      '</div>' +
      '<div class="drv-title">Kayıtların güvende kalsın</div>' +
      '<div class="drv-sub">Hesap kayıtlarını telefonunda tutar, kendi Google Drive\'ına da yedekler. Telefon değişse de, uygulama silinse de geri gelir.</div>' +
      '<ul class="drv-points">' +
        '<li>' + ic("phone") + '<span><strong>Önce telefon.</strong> İnternet olmadan da çalışır, kopya hep telefonda.</span></li>' +
        '<li>' + ic("cloud") + '<span><strong>Sorarak eşitler.</strong> İnternet gelince "Drive\'a yedek alayım mı?" diye sorar.</span></li>' +
        '<li>' + ic("shield") + '<span><strong>Yalnızca kendi dosyası.</strong> Drive\'ında sadece <em>Hesap</em> klasörünü görür.</span></li>' +
      '</ul>' +
      '<button class="g-btn" data-drv="connect">' + GLOGO + '<span>Google ile bağlan</span></button>' +
      '<button class="drv-later" data-drv="skipWelcome">Şimdilik geç</button>' +
      '<div class="drv-foot center">' + ic("shield") + '<span>Ayarlar → Drive yedeği\'nden istediğin zaman bağlanabilirsin.</span></div>';
    el.setAttribute("data-kind", "welcome");
    $("#drv-backdrop").classList.add("show");
    el.classList.add("show");
    return true;
  }

  /* ================= ANA EKRAN ŞERİDİ ================= */
  function bannerHtml() {
    if (!configured()) return "";
    /* Yalnızca yeniden giriş gerektiğinde mesaj; diğer durumlar durum noktası. */
    if (status !== "auth") return "";
    return '<button class="bk-banner drv-banner warn" data-drv="reauth">' +
      '<div class="bk-ico">' + ic("link") + '</div>' +
      '<div class="bk-body"><div class="bk-t">Drive\'a yeniden bağlan</div><div class="bk-s">Google oturumu sona erdi · dokun</div></div>' +
      '<div class="bk-go"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5l7 7-7 7"/></svg></div>' +
    '</button>';
  }

  function dotKind() {
    if (!configured()) return { k: "off", t: "Bağlı değil", a: "noop" };
    if (status === "auth") return { k: "auth", t: "Drive'a yeniden bağlan", a: "reauth" };
    if (busy || status === "busy" || status === "checking") return { k: "busy", t: "Eşitleniyor…", a: "noop" };
    if (navigator.onLine === false || status === "offline") return { k: "off", t: "Çevrimdışı", a: "noop" };
    if (status === "error") return { k: "warn", t: lastError || "Drive'a ulaşılamadı", a: "goSettings" };
    if (pending === "conflict") return { k: "warn", t: "Telefon ve Drive farklı", a: "banner" };
    if (localDirty() || pending === "push" || pending === "first") return { k: "pend", t: "Gönderilmemiş değişiklik var", a: "noop" };
    return { k: "ok", t: "Drive ile eşit", a: "noop" };
  }
  function dotHtml() {
    if (!configured()) return "";
    var d = dotKind();
    return '<button type="button" class="sync-dot ' + d.k + '" id="sync-dot" data-drv="' + d.a + '" aria-label="' + esc(d.t) + '" title="' + esc(d.t) + '"></button>';
  }

  function paint() {
    var slot = document.getElementById("drv-slot");
    if (slot) slot.innerHTML = bannerHtml();
    var card = document.getElementById("drv-settings");
    if (card) card.innerHTML = settingsInner();
    var wrap = document.getElementById("sync-dot-wrap");
    if (wrap) wrap.innerHTML = dotHtml();
  }

  /* ================= AYARLAR ================= */
  function statusLine() {
    if (!configured()) return { t: "Bağlı değil", c: "", i: "off" };
    if (busy || status === "busy") return { t: "Eşitleniyor…", c: "busy", i: "cloud" };
    if (status === "checking") return { t: "Kontrol ediliyor…", c: "busy", i: "cloud" };
    if (navigator.onLine === false || status === "offline") return { t: "Çevrimdışı · telefonda saklanıyor", c: "", i: "off" };
    if (status === "auth") return { t: "Google oturumu sona erdi", c: "warn", i: "link" };
    if (status === "error") return { t: lastError || "Hata", c: "warn", i: "warn" };
    if (pending === "pull") return { t: "Drive'da yeni veri var", c: "warn", i: "down" };
    if (pending === "conflict") return { t: "Telefon ve Drive farklı", c: "warn", i: "split" };
    if (pending === "first") return { t: "Drive'da yedek yok", c: "warn", i: "up" };
    if (localDirty() || pending === "push") return { t: "Gönderilmemiş değişiklik var", c: "warn", i: "up" };
    if (st.rev != null) return { t: "Drive ile eşit", c: "ok", i: "check" };
    return { t: "Bağlı", c: "ok", i: "cloud" };
  }

  function settingsInner() {
    if (!configured()) {
      return '<div class="drv-setup">' +
        '<div class="drv-hero">' +
          '<div class="drv-hero-ico">' + ic("drive") + '</div>' +
          '<div><div class="drv-hero-t">Google Drive\'a yedekle</div>' +
          '<div class="drv-hero-s">Kayıtlar telefonda kalır; internet varken kendi Drive\'ındaki <strong>Hesap</strong> klasörüyle kendiliğinden eşitlenir.</div></div>' +
        '</div>' +
        '<button class="g-btn" data-drv="connect">' + GLOBO() + '<span>Google ile bağlan</span></button>' +
        '<div class="drv-fine">Uygulama Drive\'ında yalnızca kendi oluşturduğu dosyaları görür.</div>' +
      '</div>';
    }
    var sl = statusLine();
    var sync = st.syncedAt ? whenText(st.syncedAt) : "Henüz eşitlenmedi";
    var reauth = status === "auth"
      ? '<div class="drv-reauth"><button class="g-btn" data-drv="reauth">' + GLOBO() + '<span>Drive\'a yeniden bağlan</span></button></div>'
      : '';
    return '<div class="drv-status ' + sl.c + '">' +
        '<div class="drv-status-ico">' + ic(sl.i) + '</div>' +
        '<div class="drv-status-b"><div class="drv-status-t">' + esc(sl.t) + '</div>' +
        '<div class="drv-status-s">Son eşitleme: ' + esc(sync) + (st.rev != null ? ' · sürüm ' + st.rev : '') + '</div></div>' +
      '</div>' + reauth +
      '<div class="drv-actions">' +
        '<button data-drv="pushNow">' + ic("up") + '<span>Şimdi yedekle</span></button>' +
        '<button data-drv="pullNow">' + ic("down") + '<span>Drive\'dan çek</span></button>' +
        '<button data-drv="test">' + ic("check") + '<span>Kontrol et</span></button>' +
      '</div>' +
      '<button class="set-row" data-drv="adoptRetry"><div><div class="k">Drive\'daki yedeği al</div><div class="d">' +
        'Drive\'daki Hesap yedeğini telefona yükler. Mevcut veri önce güvenlik kopyasına alınır.' +
        '</div></div><div class="v">›</div></button>' +
      '<div class="set-row">' +
        '<div><div class="k">Otomatik eşitle</div><div class="d">Açılışta Drive\'dan alır, değişiklikleri sormadan geri gönderir. Çevrimdışı telefonda çalışır.</div></div>' +
        '<button class="drv-switch' + (cfg.auto ? " on" : "") + '" data-drv="auto" role="switch" aria-checked="' + (cfg.auto ? "true" : "false") + '"><i></i></button>' +
      '</div>' +
      '<button class="set-row" data-drv="safety">' +
        '<div><div class="k">Güvenlik kopyaları</div><div class="d">Drive\'dan çekmeden önce telefondaki veri saklanır (son ' + SAFETY_MAX + ')</div></div>' +
        '<div class="v">›</div>' +
      '</button>' +
      '<div class="set-row">' +
        '<div class="drv-acct">' + GLOBO() + '<div><div class="k">' + esc(cfg.name || "Google hesabı") + '</div><div class="d">' + esc(cfg.email || "") + '</div></div></div>' +
        '<button class="drv-mini" data-drv="disconnect">Kaldır</button>' +
      '</div>' +
      (st.folderId ? '<a class="set-row" href="https://drive.google.com/drive/folders/' + encodeURIComponent(st.folderId) + '" target="_blank" rel="noopener">' +
        '<div><div class="k">Drive\'da göster</div><div class="d">Hesap/hesap_veri.json</div></div><div class="v">›</div></a>' : '');
  }
  function GLOBO() { return GLOGO; }

  function settingsHtml() {
    if (!available()) return "";
    return '<div class="sec-head"><div class="sec-title">Drive yedeği</div></div>' +
      '<div class="set-group drv-group" id="drv-settings">' + settingsInner() + '</div>';
  }

  function connect() {
    if (navigator.onLine === false) { A.toast("İnternet yok · bağlanınca tekrar dene"); return; }
    DB.setSetting("driveWelcomeSeen", true);
    startAuth("connect", false);
  }

  function testNow() {
    if (!hasToken()) return startAuth("check", false);
    return check("elle", { force: true }).then(function (p) {
      if (status === "ok" && !p) A.toast("Drive ile eşit");
    });
  }

  function disconnect() {
    A.confirm("Drive bağlantısını kaldır",
      "Telefondaki kayıtlara ve Drive'daki dosyaya <strong>dokunulmaz</strong>. Yalnızca bu cihaz Drive ile eşitlemeyi bırakır.",
      { okText: "Kaldır" }).then(function (ok) {
        if (!ok) return;
        var t = tok && tok.access;
        if (t) { try { fetch(REVOKE_URL + "?token=" + encodeURIComponent(t), { method: "POST", mode: "no-cors" }).catch(function () {}); } catch (e) {} }
        cfg = null; tok = null; pending = null; status = "idle"; needInteractive = false;
        st = freshSt();
        Promise.all([saveCfg(), saveTok(), saveSt()]).then(function () { log("bağlantı kaldırıldı"); paint(); A.toast("Bağlantı kaldırıldı"); });
      });
  }

  function showSafety() {
    DB.getSettings().then(function (all) {
      var list = Array.isArray(all.safetyCopies) ? all.safetyCopies : [];
      var rows = list.length ? list.map(function (c, i) {
        return '<div class="drv-copy">' +
          '<div class="drv-copy-b"><div class="drv-copy-t">' + esc(whenText(c.at)) + '</div>' +
          '<div class="drv-copy-s">' + (c.summary ? c.summary.tx : 0) + ' hareket · ' + Fmt.plainSgn(c.summary ? c.summary.balance : 0) + ' TL · ' + esc(c.reason || "") + '</div></div>' +
          '<button class="drv-mini" data-drv="restoreCopy" data-i="' + i + '">Geri yükle</button></div>';
      }).join("") : '<div class="drv-empty">Henüz güvenlik kopyası yok. Drive\'dan veri çekildiğinde telefondaki kayıtlar burada saklanır.</div>';
      sheetBusy(false);
      $("#drv-body").innerHTML =
        '<div class="drv-badge">' + ic("shield") + '</div>' +
        '<div class="drv-title">Güvenlik kopyaları</div>' +
        '<div class="drv-sub">Drive\'dan çekmeden önce telefonda kalan son ' + SAFETY_MAX + ' durum.</div>' +
        '<div class="drv-copies">' + rows + '</div>' +
        '<button class="ghost-btn" data-drv="later">Kapat</button>';
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
            return A.replaceData(norm.cats, norm.txs, norm.theme, norm.rems);
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
      if (ev.target.closest && ev.target.closest("#drv-backdrop") && !busy) {
        if ($("#drv-sheet").getAttribute("data-kind") === "welcome") skipWelcome(); else dismiss();
      }
      return false;
    }
    var a = t.getAttribute("data-drv");
    ev.preventDefault();
    if (a === "push") push(false);
    else if (a === "pushForce") push(true);
    else if (a === "pull") pull();
    else if (a === "later") dismiss();
    else if (a === "banner") { if (pending) showSheet(pending === "push" ? "push" : pending); else check("şerit", { force: true }); }
    else if (a === "reauth") startAuth("check", false);
    else if (a === "goSettings") A.go("settings");
    else if (a === "connect") connect();
    else if (a === "skipWelcome") skipWelcome();
    else if (a === "pushNow") {
      if (remote && remote.exists && st.rev != null && remote.rev !== st.rev) mergeFromDrive({ reason: "elle yedek" });
      else push(false);
    }
    else if (a === "pullNow") {
      A.confirm("Drive'dan çek", "Telefondaki kayıtlar Drive'dakiyle değişecek. Mevcut veri önce <strong>güvenlik kopyasına</strong> alınır.",
        { okText: "Çek", danger: false }).then(function (ok) { if (ok) pull(); });
    }
    else if (a === "test") testNow();
    else if (a === "adoptRetry") {
      A.confirm("Drive'daki yedeği al", "Telefondaki kayıtlar Drive'dakiyle değişecek. Mevcut veri önce <strong>güvenlik kopyasına</strong> alınır.",
        { okText: "Al", danger: false }).then(function (ok) {
          if (!ok) return;
          maybeMigrate("yedek alma").then(function () { return pull(); });
        });
    }
    else if (a === "auto") {
      cfg.auto = !cfg.auto;
      saveCfg().then(function () { log("otomatik yedek: " + (cfg.auto ? "açık" : "kapalı")); paint(); if (cfg.auto) onLocalChange(); });
    }
    else if (a === "safety") showSafety();
    else if (a === "restoreCopy") restoreCopy(Number(t.getAttribute("data-i")));
    else if (a === "disconnect") disconnect();
    return true;
  }

  function dismiss() { dismissedSig = sig(); closeSheet(); }
  function skipWelcome() {
    DB.setSetting("driveWelcomeSeen", true);
    closeSheet();
    log("karşılama: şimdilik geçildi");
  }

  /* ================= BAŞLAT ================= */
  /* init: {welcome:true} ise ilk açılış karşılaması gösterilebilir. true döner = karşılama gösterildi */
  function init(api) {
    A = api;
    if (!available()) return Promise.resolve(false);
    document.addEventListener("click", function (ev) { if (onClick(ev)) ev.stopPropagation(); }, true);
    var ret = null, welcomeShown = false;
    return DB.getSettings().then(function (all) {
      var d = all.drive;
      if (d && d.connected) {
        var migrated = !!d.autoOnDefault;
        cfg = {
          connected: true, email: d.email || null, name: d.name || null,
          auto: migrated ? !!d.auto : true, autoOnDefault: true,
          wideScope: !!d.wideScope, adoptDenied: !!d.adoptDenied,
          ownFile: !!d.ownFile
        };
        if (!migrated) log("otomatik eşitleme varsayılan olarak açıldı");
      }
      var t = all.driveToken;
      if (t && t.access && t.exp) tok = { access: t.access, exp: Number(t.exp) };
      var s = all.driveState;
      if (s) { st = freshSt(); Object.keys(st).forEach(function (k) { if (s[k] !== undefined) st[k] = s[k]; }); }
      ret = consumeRedirect();
      if (ret && ret.ok) {
        return saveTok().then(function () {
          return saveCfg().then(function () {
            return fetchAccount().catch(function (e) { log("hesap bilgisi alınamadı: " + e.message); });
          });
        });
      }
      if (ret && !ret.ok && !ret.silent && ret.error === "access_denied") {
        A.toast("Google bağlantısı iptal edildi");
      }
      if (ret && !ret.ok && ret.silent) status = "auth";
      if (!configured() && !all.driveWelcomeSeen && !(ret && ret.ok)) { welcomeShown = showWelcome(); }
    }).then(function () {
      if (configured() && cfg && cfg.autoOnDefault) return saveCfg();
    }).then(function () {
      return refreshLocalHash();
    }).then(function () {
      if (configured()) A.render();   /* açılıştaki ilk çizim ayar yüklenmeden yapıldı */
      paint();
      if (configured()) log("hazır · " + (cfg.email || "") + " · otomatik " + (cfg.auto !== false ? "açık" : "kapalı") + " · yerel rev " + st.rev + (hasToken() ? " · oturum açık" : " · oturum yok"));
      if (ret && ret.ok) {
        if (ret.intent === "connect") A.toast("Google Drive bağlandı");
        lastCheckAt = 0;
        var queued = takeQueuedOp();
        var delayMs = ret.intent === "connect" ? 700 : 500;
        setTimeout(function () {
          var op = (queued && queued.op) || ret.intent;
          if (op === "push" || op === "pushForce") {
            return refreshLocalHash().then(function () { return remoteMeta(); }).then(function (m) { remote = m; return push(op === "pushForce", { silent: true }); }).catch(function () { return check("açılış", { force: true }); });
          }
          if (op === "pull") return pull();
          return check(ret.intent === "connect" ? "bağlantı" : "açılış", { force: true });
        }, delayMs);
      } else if (configured() && status !== "auth") {
        setTimeout(function () { check("açılış", { force: false }); }, 900);
      }
      window.addEventListener("online", function () {
        log("internet geldi");
        paint();
        setTimeout(function () { check("internet geldi", { force: true }); }, 1200);
      });
      window.addEventListener("offline", function () { status = "offline"; paint(); });
      document.addEventListener("visibilitychange", function () {
        if (document.visibilityState === "visible") check("öne geldi");
      });
      return welcomeShown;
    });
  }

  return {
    init: init,
    available: available,
    configured: configured,
    bannerHtml: bannerHtml,
    settingsHtml: settingsHtml,
    onLocalChange: onLocalChange,
    check: check,
    paint: paint,
    dotHtml: dotHtml,
    _state: function () { return { cfg: cfg, hasToken: hasToken(), st: st, pending: pending, status: status, needInteractive: needInteractive, localHash: localHash, remote: remote, ownFile: !!(cfg && cfg.ownFile), fileName: FILE_NAME }; }
  };
})();
