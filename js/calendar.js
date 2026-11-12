/* Hesap — Google Takvim (0.3.9)
   Hatırlatmaları bağlanan Gmail hesabındaki "Hesap Hatırlatmalar"
   takvimine yazar. İzin yoksa sessizce bekler; hata göstermez.
   Kapsam: calendar.events + calendar.app.created (yalnızca bu uygulamanın
   oluşturduğu takvim). Okul hesabına ve diğer takvimlere dokunulmaz. */
window.HesapCalendar = (function () {
  "use strict";

  var C = window.HESAP_CONFIG || {};
  var CAL_EVENTS = C.CALENDAR_SCOPE || "https://www.googleapis.com/auth/calendar.events";
  var CAL_APP = C.CALENDAR_APP_SCOPE || "https://www.googleapis.com/auth/calendar.app.created";
  var CAL_NAME = "Hesap Hatırlatmalar";
  var TZ = "Europe/Istanbul";
  var QUEUE_KEY = "calendarQueue";
  var H = null;
  var ensuredId = null;
  var asking = false;
  var running = false;
  var kicked = false;

  function log(m) { if (H && H.log) H.log(m); }
  function online() {
    if (window.__hesapCalOffline) return false;
    return !H || H.online();
  }
  var inflight = {};
  function gate(key, fn) {
    var run = function () {
      return Promise.resolve().then(fn).then(function (v) { if (inflight[key] === p) delete inflight[key]; return v; },
        function (e) { if (inflight[key] === p) delete inflight[key]; throw e; });
    };
    var p;
    if (inflight[key]) p = inflight[key].then(run, run);
    else p = run();
    inflight[key] = p;
    return p;
  }
  function cfg() { return (H && H.getCfg && H.getCfg()) || null; }
  function hasToken() { return !!(H && H.hasToken && H.hasToken()); }
  function hasScope() { return !!(H && H.hasCalScope && H.hasCalScope()); }

  function scopesOf(s) {
    return String(s || "").replace(/\+/g, " ").split(/\s+/).filter(Boolean);
  }
  function scopeHasCal(s) {
    var set = scopesOf(s);
    for (var i = 0; i < set.length; i++) {
      if (set[i] === CAL_EVENTS || set[i] === CAL_APP || set[i] === "https://www.googleapis.com/auth/calendar") return true;
    }
    return false;
  }

  function attach(host) {
    H = host || null;
  }

  function titleOf(r) {
    if (H && H.reminderTitle) return H.reminderTitle(r);
    var tip = (r && r.type === "receive") ? "Ödeme al" : "Ödeme yap";
    return tip + (r && r.note ? " — " + r.note : "");
  }

  function eventBody(r) {
    var day = String(r.date || "");
    var body = {
      summary: titleOf(r),
      description: r.note || "",
      start: { dateTime: day + "T09:00:00", timeZone: TZ },
      end: { dateTime: day + "T09:30:00", timeZone: TZ },
      reminders: {
        useDefault: false,
        overrides: [
          { method: "popup", minutes: 24 * 60 },
          { method: "popup", minutes: 0 }
        ]
      },
      extendedProperties: { private: { hesapId: String(r.id), app: "hesap" } }
    };
    if (r.repeat === "monthly") body.recurrence = ["RRULE:FREQ=MONTHLY"];
    return body;
  }

  function calPath(calId, rest) {
    return "/calendar/v3/calendars/" + encodeURIComponent(calId) + (rest || "");
  }

  function api(path, opts) {
    return H.api(path, opts);
  }

  function useCal(id) {
    ensuredId = id;
    if (H && H.saveCalCfg) return H.saveCalCfg({ calendarId: id }).then(function () { return id; });
    return Promise.resolve(id);
  }

  function ensureCalendar() {
    if (ensuredId) return Promise.resolve(ensuredId);
    var c = cfg();
    var known = c && c.calendarId;
    var start = known
      ? api(calPath(known), { allow404: true }).then(function (got) {
          return (got && got.id) ? useCal(got.id) : createOrPrimary();
        }).catch(function () { return createOrPrimary(); })
      : createOrPrimary();
    return start;
  }

  function findNamed(items) {
    items = items || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i] && items[i].summary === CAL_NAME && !items[i].deleted) return items[i];
    }
    return null;
  }

  function createOrPrimary() {
    return api("/calendar/v3/users/me/calendarList?maxResults=250", { allow404: true }).then(function (list) {
      var found = findNamed(list && list.items);
      if (found) { log("mevcut takvim bulundu: " + found.id); return useCal(found.id); }
      return insertNamed();
    }).catch(function () { return insertNamed(); });
  }

  function insertNamed() {
    return api("/calendar/v3/calendars", {
      method: "POST",
      type: "application/json",
      body: JSON.stringify({ summary: CAL_NAME, timeZone: TZ })
    }).then(function (n) {
      log("takvim oluşturuldu: " + ((n && n.id) || ""));
      return useCal(n.id);
    }).catch(function (e) {
      log("takvim oluşturulamadı, birincil kullanılacak: " + (e && e.message ? e.message : e));
      return useCal("primary");
    });
  }

  function lookupByHesapId(calId, remId) {
    var q = "privateExtendedProperty=" + encodeURIComponent("hesapId=" + remId) + "&maxResults=3";
    return api(calPath(calId, "/events?" + q), { allow404: true }).then(function (r) {
      var items = (r && r.items) || [];
      return items[0] || null;
    }).catch(function () { return null; });
  }

  function upsertEvent(rec) {
    if (!rec || !rec.id || rec.deleted || rec.done) return Promise.resolve(null);
    return gate("cal:" + rec.id, function () { return ensureCalendar().then(function (calId) {
      function after(ev) {
        if (ev && ev.id && ev.id !== rec.googleEventId && H && H.patchReminder) {
          return H.patchReminder({ id: rec.id, googleEventId: ev.id }).then(function () { return ev; });
        }
        return ev;
      }
      function insert() {
        return lookupByHesapId(calId, rec.id).then(function (found) {
          if (found && found.id) return patch(found.id);
          return api(calPath(calId, "/events"), {
            method: "POST",
            type: "application/json",
            body: JSON.stringify(eventBody(rec))
          });
        });
      }
      function patch(eid) {
        return api(calPath(calId, "/events/" + encodeURIComponent(eid)), {
          method: "PATCH",
          type: "application/json",
          body: JSON.stringify(eventBody(rec)),
          allow404: true
        }).then(function (ev) { return ev || insert(); });
      }
      return (rec.googleEventId ? patch(rec.googleEventId) : insert()).then(after);
    }); });
  }

  function deleteEvent(rec) {
    if (!rec || !rec.id) return Promise.resolve();
    return gate("cal:" + rec.id, function () { return ensureCalendar().then(function (calId) {
      function drop(eid) {
        if (!eid) return Promise.resolve();
        return api(calPath(calId, "/events/" + encodeURIComponent(eid)), { method: "DELETE", allow404: true, raw: true }).catch(function () {});
      }
      var start = rec.googleEventId ? drop(rec.googleEventId) : Promise.resolve();
      return start.then(function () { return lookupByHesapId(calId, rec.id); }).then(function (found) {
        return found ? drop(found.id) : null;
      }).then(function () {
        if (rec.googleEventId && H && H.patchReminder) {
          return H.patchReminder({ id: rec.id, googleEventId: null });
        }
      });
    }); });
  }

  function loadQueue() {
    return DB.getSettings().then(function (all) {
      return Array.isArray(all[QUEUE_KEY]) ? all[QUEUE_KEY].slice() : [];
    }).catch(function () { return []; });
  }
  function saveQueue(list) { return DB.setSetting(QUEUE_KEY, list || []); }

  function enqueue(kind, rec) {
    if (!rec || !rec.id) return Promise.resolve();
    return loadQueue().then(function (list) {
      list = (list || []).filter(function (x) { return !(x.kind === kind && x.rec && x.rec.id === rec.id); });
      list.push({ kind: kind, rec: rec, at: Date.now(), tries: 0 });
      return saveQueue(list);
    });
  }

  function processQueue() {
    if (running) return Promise.resolve();
    if (!hasScope() || !hasToken() || !online()) return Promise.resolve();
    running = true;
    return loadQueue().then(function (list) {
      if (!list.length) return;
      var left = [];
      var chain = Promise.resolve();
      list.forEach(function (op) {
        chain = chain.then(function () {
          var job = op.kind === "delete" ? deleteEvent(op.rec) : upsertEvent(op.rec);
          return job.catch(function (e) {
            var tries = (op.tries || 0) + 1;
            if (tries < 8) left.push({ kind: op.kind, rec: op.rec, at: Date.now(), tries: tries });
            log("takvim kuyruğu: " + op.kind + " " + (op.rec && op.rec.id) + " · " + (e && e.message ? e.message : e));
            if (e && e.code === "auth" && H && H.needAuth) H.needAuth();
          });
        });
      });
      return chain.then(function () { return saveQueue(left); });
    }).then(function () { running = false; }, function () { running = false; });
  }

  function runOrQueue(kind, rec) {
    if (!hasScope() || !hasToken() || !online()) return enqueue(kind, rec);
    var job = kind === "delete" ? deleteEvent(rec) : upsertEvent(rec);
    return job.catch(function (e) {
      log("takvim " + kind + " ertelendi: " + (e && e.message ? e.message : e));
      if (e && e.code === "auth" && H && H.needAuth) H.needAuth();
      return enqueue(kind, rec);
    });
  }

  function activeReminders() {
    var list = (H && H.reminders) ? H.reminders() : [];
    return (list || []).filter(function (r) { return r && !r.deleted && !r.done; });
  }

  function backfill() {
    if (!hasScope() || !hasToken() || !online()) return Promise.resolve();
    var list = activeReminders();
    var chain = Promise.resolve();
    list.forEach(function (r) {
      chain = chain.then(function () { return upsertEvent(r).catch(function (e) { return enqueue("upsert", r); }); });
    });
    return chain.then(function () {
      if (H && H.saveCalCfg) return H.saveCalCfg({ calendarBackfilled: true });
    });
  }

  function askConsent() {
    if (asking || !H || !H.confirm) return Promise.resolve(false);
    if (!hasToken() || hasScope()) return Promise.resolve(hasScope());
    var c = cfg();
    if (!c || !c.connected) return Promise.resolve(false);
    asking = true;
    return H.confirm(
      "Google Takvim izni",
      "Hatırlatmaların, bağladığın <strong>Gmail</strong> hesabındaki <strong>Hesap Hatırlatmalar</strong> takvimine yazılacak " +
      "(1 gün önce ve gününde saat 09:00 uyarı). Okul hesabına ve diğer takvimlerine dokunulmaz. " +
      "İstediğin zaman Ayarlar’dan yeniden izin verebilirsin.",
      { okText: "İzin ver", cancelText: "Şimdi değil", danger: false }
    ).then(function (ok) {
      asking = false;
      if (ok) {
        if (H.saveCalCfg) H.saveCalCfg({ calendarDenied: false });
        if (H.startCalAuth) H.startCalAuth();
        return true;
      }
      if (H.saveCalCfg) return H.saveCalCfg({ calendarDenied: true }).then(function () { return false; });
      return false;
    }).catch(function () { asking = false; return false; });
  }

  function maybeAsk() {
    var c = cfg();
    if (!c || !c.connected || c.calendarDenied || hasScope() || !hasToken() || !online()) return;
    if (document.querySelector("#drv-sheet.show, #sheet.show")) return;
    if (!activeReminders().length) return;
    askConsent();
  }

  function onReminderSaved(rec) {
    if (!rec || rec.deleted || rec.done) return;
    if (hasScope()) return runOrQueue("upsert", rec);
    maybeAsk();
  }
  function onReminderDeleted(rec) {
    if (!rec) return;
    if (hasScope()) return runOrQueue("delete", rec);
  }

  function kick(reason) {
    kicked = true;
    if (hasScope() && hasToken() && online()) {
      return ensureCalendar().then(function () { return processQueue(); }).then(function () { return backfill(); }).catch(function (e) {
        log("takvim başlatma: " + (e && e.message ? e.message : e));
        if (e && e.code === "auth" && H && H.needAuth) H.needAuth();
      });
    }
    if (reason === "auth-return") return Promise.resolve();
    setTimeout(function () { maybeAsk(); }, 800);
    return Promise.resolve();
  }

  function requestAccess() {
    var c = cfg();
    if (c && H && H.saveCalCfg) H.saveCalCfg({ calendarDenied: false });
    if (hasScope()) return kick("elle");
    return askConsent();
  }

  function debug() {
    return loadQueue().then(function (q) {
      return {
        hasScope: hasScope(),
        hasToken: hasToken(),
        calendarId: ensuredId || (cfg() && cfg().calendarId) || null,
        denied: !!(cfg() && cfg().calendarDenied),
        queue: q.length
      };
    });
  }

  return {
    attach: attach,
    kick: kick,
    maybeAsk: maybeAsk,
    askConsent: askConsent,
    requestAccess: requestAccess,
    onReminderSaved: onReminderSaved,
    onReminderDeleted: onReminderDeleted,
    backfill: backfill,
    processQueue: processQueue,
    hasScope: hasScope,
    scopeHasCal: scopeHasCal,
    eventBody: eventBody,
    debug: debug,
    CAL_EVENTS: CAL_EVENTS,
    CAL_APP: CAL_APP,
    CAL_NAME: CAL_NAME
  };
})();
