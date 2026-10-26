/* Kern: Hilfsfunktionen, Speicher (lokal + claude db), FSRS, Sprachausgabe, Claude, Antwortprüfung */
var D = window.D || (window.D = {});

/* ---------- Hilfsfunktionen ---------- */
var $ = function (sel, root) { return (root || document).querySelector(sel); };
function h(tag, attrs) {
  var el = document.createElement(tag);
  if (attrs) for (var k in attrs) {
    var v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'text') el.textContent = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
  return el;
}
function add(el, c) {
  if (c == null || c === false) return;
  if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
  el.appendChild(c.nodeType ? c : document.createTextNode(String(c)));
}
function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
function pad2(n) { return (n < 10 ? '0' : '') + n; }
var DAY = 86400000;
function dayKey(t) { var d = new Date(t || Date.now()); return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate()); }
function startOfDay(t) { var d = new Date(t || Date.now()); d.setHours(0, 0, 0, 0); return d.getTime(); }
function fmtDate(t) { var d = new Date(t); return pad2(d.getDate()) + '.' + pad2(d.getMonth() + 1) + '.' + d.getFullYear(); }
var WD = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
function courseDate(n) { var p = D.course.start.split('-'); return new Date(+p[0], +p[1] - 1, +p[2] + n - 1).getTime(); }
function calendarDay() { return Math.floor((startOfDay() - courseDate(1)) / DAY) + 1; }

/* ---------- Speicher: localStorage sofort, claude db im Hintergrund ---------- */
var DOCS = ['profile', 'settings', 'srs', 'prog', 'errs', 'chats', 'custom', 'exam'];
/* Kompakte Form der Kartenstände: ein Array pro Karte statt eines Objekts (Dokumentgrenze 256 KB) */
function r2(x) { return Math.round((x || 0) * 100) / 100; }
var Pack = {
  srs: {
    out: function (d) {
      var p = {}, c = d.c || {};
      for (var id in c) { var x = c[id]; p[id] = [r2(x.s), r2(x.d), Math.round((x.due || 0) / 60000), Math.round((x.last || 0) / 60000), x.reps || 0, x.lapses || 0, x.st || 1]; }
      return { t: d.t, p: p };
    },
    in: function (d) {
      if (!d || !d.p) return d;
      var c = {};
      for (var id in d.p) { var a = d.p[id]; c[id] = { s: a[0], d: a[1], due: a[2] * 60000, last: a[3] * 60000, reps: a[4], lapses: a[5], st: a[6] }; }
      return { t: d.t, c: c };
    }
  }
};
/* Zusammenführen zweier Stände desselben Dokuments (lokal, entfernt), damit Handy und PC sich nicht überschreiben */
function uniq(list, keyf) { var m = {}, out = []; (list || []).forEach(function (x) { var k = keyf(x); if (!m[k]) { m[k] = 1; out.push(x); } }); return out; }
function maxMap(a, b) { var o = Object.assign({}, a || {}); for (var k in b || {}) o[k] = Math.max(o[k] || 0, b[k] || 0); return o; }
var Merge = {
  srs: function (l, r) {
    var c = Object.assign({}, r.c || {}), lc = l.c || {};
    for (var id in lc) if (!c[id] || (lc[id].last || 0) >= (c[id].last || 0)) c[id] = lc[id];
    return { c: c };
  },
  prog: function (l, r) {
    var o = Object.assign({}, r, l);
    o.min = maxMap(r.min, l.min); o.rev = maxMap(r.rev, l.rev); o.mdone = maxMap(r.mdone, l.mdone);
    o.g = Object.assign({}, r.g || {});
    for (var k in l.g || {}) if (!o.g[k] || l.g[k][1] >= o.g[k][1]) o.g[k] = l.g[k];
    o.seenRule = Object.assign({}, r.seenRule || {}, l.seenRule || {});
    o.diag = l.diag || r.diag;
    o.days = {};
    [r.days || {}, l.days || {}].forEach(function (src) {
      for (var d in src) {
        var x = src[d], y = o.days[d] || (o.days[d] = {});
        ['s1', 's2'].forEach(function (s) {
          if (!x[s]) return;
          var ys = y[s] || (y[s] = { b: {} }); ys.b = ys.b || {};
          for (var b in x[s].b || {}) ys.b[b] = Math.max(ys.b[b] || 0, x[s].b[b] || 0);
          if (x[s].done) ys.done = Math.max(ys.done || 0, x[s].done);
        });
      }
    });
    o.misses = uniq((r.misses || []).concat(l.misses || []), function (m) { return m.day + '|' + m.q; })
      .filter(function (m) { return !(o.mdone[m.day] >= (m.at || 0)); }).slice(-80);
    return o;
  },
  errs: function (l, r) {
    return { list: uniq((r.list || []).concat(l.list || []), function (e) { return e.t + '|' + e.wrong; }).sort(function (a, b) { return a.t - b.t; }).slice(-400) };
  },
  chats: function (l, r) {
    var o = { list: uniq((r.list || []).concat(l.list || []), function (e) { return e.t + '|' + e.sc; }).sort(function (a, b) { return a.t - b.t; }).slice(-150) };
    var lt = l.curT || 0, rt = r.curT || 0;
    o.cur = lt >= rt ? (l.cur || null) : (r.cur || null); o.curT = Math.max(lt, rt);
    return o;
  },
  xcards: function (l, r) { return { items: Object.assign({}, r.items || {}, l.items || {}) }; },
  exam: function (l, r) { return { list: uniq((l.list || []).concat(r.list || []), function (x) { return x.id; }) }; },
  custom: function (l, r) {
    var srs = (Store.get('srs').c) || {};
    return {
      items: Object.assign({}, r.items || {}, l.items || {}),
      queue: uniq((r.queue || []).concat(l.queue || []), function (x) { return x; }).filter(function (id) { return !srs[id]; })
    };
  }
};

var Store = {
  data: {}, db: null, uid: null, dirty: {}, timers: {}, busy: {}, online: false, ready: false, listeners: [], lastT: {}, dead: {}, tooBig: {},
  key: function (n) { return 'gd1:' + n; },
  enc: function (n, d) { return Pack[n] ? Pack[n].out(d) : d; },
  dec: function (n, d) { return Pack[n] ? Pack[n].in(d) : d; },
  load: function () {
    var self = this;
    DOCS.forEach(function (n) {
      var v = null;
      try { v = self.dec(n, JSON.parse(localStorage.getItem(self.key(n)) || 'null')); } catch (e) { v = null; }
      self.data[n] = v || { t: 0 };
    });
  },
  get: function (n) { return this.data[n] || (this.data[n] = { t: 0 }); },
  local: function (n) { try { localStorage.setItem(this.key(n), JSON.stringify(this.enc(n, this.get(n)))); } catch (e) { /* voll oder gesperrt */ } },
  save: function (n) {
    var d = this.get(n); d.t = Date.now();
    this.local(n);
    this.dirty[n] = true; this.tooBig[n] = false;
    var self = this;
    clearTimeout(this.timers[n]);
    this.timers[n] = setTimeout(function () { self.push(n); }, 4000);
  },
  push: function (n) {
    var self = this;
    if (!this.db || !this.uid || !this.dirty[n] || this.tooBig[n]) return Promise.resolve();
    if (this.busy[n]) { this.busy[n].then(function () { self.push(n); }); return this.busy[n]; }
    this.dirty[n] = false;
    var body = JSON.parse(JSON.stringify(this.enc(n, this.get(n))));
    this.lastT[n] = body.t;
    var p = this.ref(n).set(body).catch(function (e) {
      var c = e && e.code;
      if (c === 'quota_exceeded' || c === 'invalid_argument') {
        self.tooBig[n] = true;
        toast('Online-Speicher: Dokument „' + n + '“ ist zu groß. Daten bleiben auf diesem Gerät.');
      } else self.dirty[n] = true;
    }).then(function () { self.busy[n] = null; });
    this.busy[n] = p;
    return p;
  },
  flush: function () { var self = this; DOCS.concat(Object.keys(this.dirty)).forEach(function (n) { clearTimeout(self.timers[n]); self.push(n); }); },
  ref: function (n) { return this.db.doc('data/users/' + this.uid + '/' + n); },
  /* Objekt an Ort und Stelle ersetzen: Ansichten behalten ihre Referenz */
  replaceIn: function (n, obj) {
    var cur = this.get(n);
    Object.keys(cur).forEach(function (k) { delete cur[k]; });
    Object.assign(cur, obj);
  },
  /* entfernten Stand einarbeiten; schreibt zurück, wenn lokal etwas dazukam */
  absorb: function (n, raw) {
    if (!raw) { if (this.get(n).t) { this.dirty[n] = true; this.push(n); } return false; }
    var local = this.get(n), remote = this.dec(n, JSON.parse(JSON.stringify(raw)));
    var merged;
    if (!local.t) merged = remote;
    else if (Merge[n]) merged = Object.assign(Merge[n](local, remote), { t: Math.max(local.t || 0, remote.t || 0) });
    else merged = (local.t || 0) >= (remote.t || 0) ? JSON.parse(JSON.stringify(local)) : remote;
    var before = JSON.stringify(this.enc(n, local));
    this.replaceIn(n, merged);
    var noT = function (x) { var c = Object.assign({}, x); delete c.t; return JSON.stringify(c); };
    var differs = noT(this.enc(n, merged)) !== noT(raw);
    if (differs && merged !== remote) this.save(n); else this.local(n);
    return before !== JSON.stringify(this.enc(n, merged));
  },
  /* Online-Speicher verbinden, Stände zusammenführen und auf Änderungen anderer Geräte hören */
  connect: function (db, uid) {
    var self = this;
    this.db = db; this.uid = uid; this.online = true;
    return Promise.all(DOCS.map(function (n) {
      return self.ref(n).get().then(function (snap) { self.absorb(n, snap.exists ? snap.data() : null); }).catch(function () { });
    })).then(function () {
      self.ready = true;
      DOCS.forEach(function (n) { self.watch(n); });
      self.retryExtras();
      self.listeners.forEach(function (f) { f(); });
    });
  },
  watch: function (n) {
    var self = this;
    this.dead[n] = false;
    try {
      this.ref(n).onSnapshot(function (snap) {
        if (!snap.exists || snap.metadata.hasPendingWrites) return;
        var raw = snap.data();
        if (raw.t === self.lastT[n] || raw.t === self.get(n).t) return;
        if (self.absorb(n, raw)) self.listeners.forEach(function (f) { f(n); });
      }, function () { self.dead[n] = true; });
    } catch (e) { this.dead[n] = true; }
  },
  /* nach Rückkehr in den Tab: abgerissene Abos neu lesen */
  resync: function () {
    var self = this;
    if (!this.db || !this.uid) return;
    DOCS.forEach(function (n) {
      if (!self.dead[n]) return;
      self.ref(n).get().then(function (snap) { if (snap.exists && self.absorb(n, snap.data())) self.listeners.forEach(function (f) { f(n); }); self.watch(n); }).catch(function () { });
    });
  },
  /* einzelne Zusatzdokumente (erzeugte Tagesinhalte) */
  pending: function () { try { return JSON.parse(localStorage.getItem('gd1:pendingExtra') || '[]'); } catch (e) { return []; } },
  setPending: function (list) { try { localStorage.setItem('gd1:pendingExtra', JSON.stringify(list)); } catch (e) { } },
  getExtra: function (n) {
    var self = this, local = null;
    try { local = JSON.parse(localStorage.getItem(this.key(n)) || 'null'); } catch (e) { }
    if (!this.db || !this.uid) return Promise.resolve(local);
    return this.ref(n).get().then(function (s) {
      if (s.exists) {
        var r = s.data();
        try { localStorage.setItem(self.key(n), JSON.stringify(r)); } catch (e) { }
        return r;
      }
      if (local) self.putExtra(n, local);
      return local;
    }).catch(function () { return local; });
  },
  setExtra: function (n, body) {
    body.t = Date.now();
    try { localStorage.setItem(this.key(n), JSON.stringify(body)); } catch (e) { }
    return this.putExtra(n, body);
  },
  putExtra: function (n, body) {
    var self = this;
    var mark = function (on) { var l = self.pending().filter(function (x) { return x !== n; }); if (on) l.push(n); self.setPending(l); };
    if (!this.db || !this.uid) { mark(true); return Promise.resolve(); }
    var ref = this.ref(n);
    return ref.set(body).catch(function () {
      return new Promise(function (r) { setTimeout(r, 1000 + Math.random() * 2000); }).then(function () { return ref.set(body); });
    }).then(function () { mark(false); }).catch(function () { mark(true); });
  },
  retryExtras: function () {
    var self = this;
    this.pending().forEach(function (n) {
      var body = null;
      try { body = JSON.parse(localStorage.getItem(self.key(n)) || 'null'); } catch (e) { }
      if (!body) return;
      self.ref(n).get().then(function (s) { if (!s.exists) self.putExtra(n, body); else self.setPending(self.pending().filter(function (x) { return x !== n; })); }).catch(function () { });
    });
  }
};

/* ---------- FSRS-5 (Standardparameter, Zielbehaltensrate 90 %) ---------- */
var FSRS = {
  w: [0.40255, 1.18385, 3.173, 15.69105, 7.1949, 0.5345, 1.4604, 0.0046, 1.54575, 0.1192, 1.01925, 1.9395, 0.11, 0.29605, 2.2698, 0.2315, 2.9898, 0.51655, 0.6621],
  F: 19 / 81, C: -0.5,
  clampD: function (d) { return Math.min(10, Math.max(1, d)); },
  d0: function (g) { return this.clampD(this.w[4] - Math.exp(this.w[5] * (g - 1)) + 1); },
  R: function (t, s) { return Math.pow(1 + this.F * t / s, this.C); },
  /* card: {s,d,due,last,reps,lapses,st}; g: 1 Nochmal, 2 Schwer, 3 Gut, 4 Leicht */
  review: function (c, g, now) {
    var w = this.w; now = now || Date.now();
    c = Object.assign({ reps: 0, lapses: 0, st: 1 }, c || {});
    if (!c.s) {
      c.s = w[g - 1]; c.d = this.d0(g);
    } else {
      var elapsed = Math.max(0, (now - (c.last || now)) / DAY);
      if (elapsed < 0.5) {
        c.s = c.s * Math.exp(w[17] * (g - 3 + w[18]));
      } else {
        var r = this.R(elapsed, c.s);
        if (g === 1) {
          c.s = Math.min(c.s, w[11] * Math.pow(c.d, -w[12]) * (Math.pow(c.s + 1, w[13]) - 1) * Math.exp(w[14] * (1 - r)));
          c.lapses++;
        } else {
          c.s = c.s * (Math.exp(w[8]) * (11 - c.d) * Math.pow(c.s, -w[9]) * (Math.exp(w[10] * (1 - r)) - 1) * (g === 2 ? w[15] : 1) * (g === 4 ? w[16] : 1) + 1);
        }
      }
      var dd = -w[6] * (g - 3);
      var d1 = c.d + dd * (10 - c.d) / 9;
      c.d = this.clampD(w[7] * this.d0(4) + (1 - w[7]) * d1);
    }
    c.s = Math.max(0.1, c.s);
    c.reps++; c.last = now;
    if (g === 1) { c.due = now + 10 * 60000; c.st = Math.max(1, (c.st || 1) - 1); }
    else {
      var days = Math.min(60, Math.max(1, Math.round(c.s)));
      c.due = startOfDay(now) + days * DAY + 4 * 3600000;
      if (g >= 3) c.st = Math.min(4, (c.st || 1) + 1);
    }
    return c;
  }
};

/* ---------- Sprachausgabe ---------- */
var TTS = {
  voices: [], ok: 'speechSynthesis' in window,
  init: function () {
    if (!this.ok) return;
    var self = this;
    var load = function () { self.voices = speechSynthesis.getVoices().filter(function (v) { return /^de/i.test(v.lang); }); };
    load();
    try { speechSynthesis.addEventListener('voiceschanged', load); } catch (e) { }
  },
  voice: function () {
    var pref = (Store.get('settings').voice) || '';
    var v = this.voices.filter(function (x) { return x.voiceURI === pref; })[0];
    if (v) return v;
    var rank = function (x) { return (/de-DE/i.test(x.lang) ? 4 : 0) + (/natural|neural|online|google/i.test(x.name) ? 2 : 0) + (x.localService ? 0 : 1); };
    return this.voices.slice().sort(function (a, b) { return rank(b) - rank(a); })[0] || null;
  },
  speak: function (text, opts) {
    if (!this.ok || !text) return;
    opts = opts || {};
    speechSynthesis.cancel();
    var rate = (opts.rate || Store.get('settings').rate || 0.95);
    var parts = String(text).replace(/\s+/g, ' ').match(/[^.!?…]+[.!?…]*[»“"]?\s*/g) || [text];
    var v = this.voice(), n = parts.length;
    parts.forEach(function (p, i) {
      var u = new SpeechSynthesisUtterance(p.trim());
      u.lang = 'de-DE'; u.rate = rate; if (v) u.voice = v;
      if (i === n - 1 && opts.onend) u.onend = opts.onend;
      speechSynthesis.speak(u);
    });
  },
  stop: function () { if (this.ok) speechSynthesis.cancel(); }
};

/* ---------- Kurzer Signalton ---------- */
var Beep = {
  ctx: null,
  play: function (freq, ms) {
    try {
      this.ctx = this.ctx || new (window.AudioContext || window.webkitAudioContext)();
      var o = this.ctx.createOscillator(), g = this.ctx.createGain();
      o.frequency.value = freq || 880; o.connect(g); g.connect(this.ctx.destination);
      g.gain.setValueAtTime(0.15, this.ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + (ms || 300) / 1000);
      o.start(); o.stop(this.ctx.currentTime + (ms || 300) / 1000);
    } catch (e) { }
  }
};

/* ---------- Claude ---------- */
var AI = {
  fn: null, off: false, checked: false,
  ready: function () { return !!this.fn && !this.off; },
  msg: function (e) {
    var c = e && e.code;
    if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled' || c === 'capability_removed') { this.off = true; return 'Claude ist in dieser Ansicht nicht freigegeben. Übungen ohne Claude funktionieren weiter.'; }
    if (c === 'image_rejected' || c === 'images_unavailable') return 'Dieses Foto geht nicht. Bitte ein anderes wählen (JPEG oder PNG, nicht zu groß).';
    if (c === 'empty_completion' || c === 'prompt_too_large') return 'Claude konnte darauf nicht antworten. Bitte kürzer oder anders formulieren.';
    if (c === 'rate_limited') return 'Zu viele Anfragen oder Nutzungslimit erreicht. Bitte später noch einmal.';
    if (c === 'session_expired') return 'Bitte bei claude.ai neu anmelden.';
    if (c === 'invalid_json') return 'Antwort war unvollständig. Bitte noch einmal versuchen.';
    if (c === 'refused') return 'Claude hat diese Anfrage abgelehnt. Bitte anders formulieren.';
    if (c === 'cancelled') return '';
    return 'Verbindung unterbrochen. Bitte noch einmal versuchen.';
  },
  text: function (input, opts) {
    if (!this.ready()) return Promise.reject({ code: 'not_granted' });
    return this.fn(input, Object.assign({ modelTier: 'default' }, opts || {})).then(function (r) { return r.text; });
  },
  json: function (input, opts) {
    if (!this.ready()) return Promise.reject({ code: 'not_granted' });
    return this.fn.json(input, Object.assign({ modelTier: 'default' }, opts || {}));
  }
};

/* ---------- Antwortprüfung ---------- */
function normA(s) {
  return String(s || '').toLowerCase()
    .replace(/[„“"«»‚‘'’`]/g, '')
    .replace(/[.,!?;:…()\[\]]+/g, ' ')
    .replace(/\s[–—-]\s/g, ' ')
    .replace(/\s+/g, ' ').trim();
}
function foldA(s) { return normA(s).replace(/ß/g, 'ss').replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue'); }
function caseA(s) { return String(s || '').replace(/[„“"«»‚‘'’`.,!?;:…()]+/g, ' ').replace(/\s+/g, ' ').trim().replace(/^./, function (c) { return c.toLowerCase(); }); }
function lev(a, b) {
  /* Editierdistanz mit Vertauschung benachbarter Buchstaben (OSA) */
  if (a === b) return 0;
  var m = a.length, n = b.length, i, j;
  if (!m) return n; if (!n) return m;
  var d = [];
  for (i = 0; i <= m; i++) { d[i] = [i]; }
  for (j = 0; j <= n; j++) d[0][j] = j;
  for (i = 1; i <= m; i++) for (j = 1; j <= n; j++) {
    var c = a[i - 1] === b[j - 1] ? 0 : 1;
    d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + c);
    if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
  }
  return d[m][n];
}
/* Anmerkungen in Klammern („sich (Dat.) …“) muss niemand mittippen */
function stripAnn(s) { return String(s || '').replace(/\s*\([^)]*\)/g, ''); }
/* Tippfehler-Toleranz pro Wort: kurze Wörter (Artikel, Endungen, Modalformen) und Umlautfehler zählen als Fehler,
   in langen Wörtern ist ein vertauschter Buchstabe im Wortstamm erlaubt, aber nie in den letzten zwei Buchstaben. */
function tokenNear(u, a) {
  if (u === a) return 0;
  var uf = foldA(u), af = foldA(a);
  if (uf === af) return 0;
  if (af.length <= 5) return -1;
  var base = function (x) { return x.replace(/ä/g, 'a').replace(/ö/g, 'o').replace(/ü/g, 'u'); };
  if (base(u) === base(a)) return -1;
  if (lev(uf, af) !== 1 || uf.slice(-2) !== af.slice(-2)) return -1;
  return 1;
}
/* Ergebnis: {res: 'ok'|'near'|'wrong', best, note} */
function checkAnswer(user, answers) {
  var cands = [];
  answers.forEach(function (a) { cands.push(a); var b = stripAnn(a); if (b !== a && b.trim()) cands.push(b); });
  var us = stripAnn(user), u = normA(us), uf = foldA(us), i, a;
  if (!u) return { res: 'wrong', best: answers[0], note: '' };
  for (i = 0; i < cands.length; i++) {
    a = cands[i];
    if (u === normA(a)) return { res: 'ok', best: a, note: caseA(us) !== caseA(a) ? 'Groß- und Kleinschreibung beachten.' : '' };
    if (uf === foldA(a)) return { res: 'ok', best: a, note: 'Achten Sie auf ä, ö, ü und ß.' };
  }
  var ut = u.split(' ');
  for (i = 0; i < cands.length; i++) {
    var at = normA(cands[i]).split(' ');
    if (at.length !== ut.length) continue;
    var typos = 0, fine = true;
    for (var k = 0; k < at.length && fine; k++) { var r = tokenNear(ut[k], at[k]); if (r < 0) fine = false; else typos += r; }
    if (fine && typos <= (at.length >= 8 ? 2 : 1)) return { res: 'near', best: cands[i], note: 'Fast richtig – nur ein Tippfehler im Wortstamm.' };
  }
  var best = cands[0], bestD = 1e9;
  cands.forEach(function (c) { var d = lev(uf, foldA(c)); if (d < bestD) { bestD = d; best = c; } });
  return { res: 'wrong', best: best, note: '' };
}
/* Wortweiser Vergleich: markiert Wörter der Lösung, die in der Antwort fehlen */
function diffHtml(user, right) {
  var a = normA(user).split(' '), bRaw = String(right).split(/\s+/), b = bRaw.map(normA);
  var m = a.length, n = b.length, L = [];
  for (var i = 0; i <= m; i++) { L[i] = []; for (var j = 0; j <= n; j++) L[i][j] = 0; }
  for (i = m - 1; i >= 0; i--) for (j = n - 1; j >= 0; j--) L[i][j] = a[i] === b[j] ? L[i + 1][j + 1] + 1 : Math.max(L[i + 1][j], L[i][j + 1]);
  var keep = {}; i = 0; j = 0;
  while (i < m && j < n) { if (a[i] === b[j]) { keep[j] = 1; i++; j++; } else if (L[i + 1][j] >= L[i][j + 1]) i++; else j++; }
  return bRaw.map(function (w, k) { return keep[k] ? esc(w) : '<mark>' + esc(w) + '</mark>'; }).join(' ');
}

/* ---------- Kurze Hinweise ---------- */
function toast(text) {
  var t = h('div', { class: 'toast', role: 'status', text: text });
  document.body.appendChild(t);
  setTimeout(function () { t.classList.add('out'); }, 2600);
  setTimeout(function () { t.remove(); }, 3200);
}
