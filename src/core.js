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
var DOCS = ['profile', 'settings', 'srs', 'prog', 'errs', 'chats', 'custom'];
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
var Store = {
  data: {}, db: null, uid: null, dirty: {}, timers: {}, busy: {}, online: false, listeners: [],
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
  save: function (n) {
    var d = this.get(n); d.t = Date.now();
    try { localStorage.setItem(this.key(n), JSON.stringify(this.enc(n, d))); } catch (e) { /* voll oder gesperrt */ }
    this.dirty[n] = true;
    var self = this;
    clearTimeout(this.timers[n]);
    this.timers[n] = setTimeout(function () { self.push(n); }, 4000);
  },
  push: function (n) {
    var self = this;
    if (!this.db || !this.uid || !this.dirty[n]) return Promise.resolve();
    if (this.busy[n]) { this.busy[n].then(function () { self.push(n); }); return this.busy[n]; }
    this.dirty[n] = false;
    var body = JSON.parse(JSON.stringify(this.enc(n, this.get(n))));
    var p = this.ref(n).set(body).catch(function (e) {
      self.dirty[n] = true;
      if (e && e.code === 'quota_exceeded') toast('Online-Speicher ist voll. Daten bleiben auf diesem Gerät.');
    }).then(function () { self.busy[n] = null; });
    this.busy[n] = p;
    return p;
  },
  flush: function () { var self = this; DOCS.concat(Object.keys(this.dirty)).forEach(function (n) { clearTimeout(self.timers[n]); self.push(n); }); },
  ref: function (n) { return this.db.doc('data/users/' + this.uid + '/' + n); },
  /* Online-Speicher verbinden und neuere Stände übernehmen */
  connect: function (db, uid) {
    var self = this;
    this.db = db; this.uid = uid; this.online = true;
    return Promise.all(DOCS.map(function (n) {
      return self.ref(n).get().then(function (snap) {
        var remote = snap.exists ? snap.data() : null;
        var local = self.get(n);
        if (remote && (remote.t || 0) > (local.t || 0)) {
          self.data[n] = self.dec(n, JSON.parse(JSON.stringify(remote)));
          try { localStorage.setItem(self.key(n), JSON.stringify(remote)); } catch (e) { }
        } else if (local.t && (!remote || (remote.t || 0) < local.t)) {
          self.dirty[n] = true; self.push(n);
        }
      }).catch(function () { });
    })).then(function () { self.listeners.forEach(function (f) { f(); }); });
  },
  /* einzelne Zusatzdokumente (erzeugte Tagesinhalte) */
  getExtra: function (n) {
    var self = this, local = null;
    try { local = JSON.parse(localStorage.getItem(this.key(n)) || 'null'); } catch (e) { }
    if (!this.db || !this.uid) return Promise.resolve(local);
    return this.ref(n).get().then(function (s) { return s.exists ? s.data() : local; }).catch(function () { return local; });
  },
  setExtra: function (n, body) {
    body.t = Date.now();
    try { localStorage.setItem(this.key(n), JSON.stringify(body)); } catch (e) { }
    if (this.db && this.uid) return this.ref(n).set(body).catch(function () { });
    return Promise.resolve();
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
    if (c === 'not_granted' || c === 'sampling_disabled' || c === 'not_declared' || c === 'capability_disabled') { this.off = true; App.refresh(); return 'Claude ist in dieser Ansicht nicht freigegeben. Übungen ohne Claude funktionieren weiter.'; }
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
  if (a === b) return 0;
  var m = a.length, n = b.length; if (!m) return n; if (!n) return m;
  var prev = new Array(n + 1), cur = new Array(n + 1), i, j;
  for (j = 0; j <= n; j++) prev[j] = j;
  for (i = 1; i <= m; i++) {
    cur[0] = i;
    for (j = 1; j <= n; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    var t = prev; prev = cur; cur = t;
  }
  return prev[n];
}
/* Ergebnis: {res: 'ok'|'near'|'wrong', best, note} */
function checkAnswer(user, answers) {
  var u = normA(user), uf = foldA(user), best = answers[0], bestD = 1e9, note = '';
  if (!u) return { res: 'wrong', best: best, note: '' };
  for (var i = 0; i < answers.length; i++) {
    var a = answers[i], an = normA(a);
    if (u === an) {
      if (caseA(user) !== caseA(a)) note = 'Groß- und Kleinschreibung beachten.';
      return { res: 'ok', best: a, note: note };
    }
    if (uf === foldA(a)) return { res: 'ok', best: a, note: 'Achten Sie auf ä, ö, ü und ß.' };
    var d = lev(uf, foldA(a));
    if (d < bestD) { bestD = d; best = a; }
  }
  var tol = Math.max(1, Math.floor(normA(best).length / 18));
  if (bestD <= tol) return { res: 'near', best: best, note: 'Fast richtig – ein Tippfehler?' };
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
