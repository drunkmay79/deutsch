/* Inhalte: Tagespakete (fest für Tage 1–14, erzeugt ab Tag 15) und Karten */

var BLOCKS = {
  review:  { de: 'Wiederholung', ru: 'Повторение карточек' },
  new:     { de: 'Neue Wörter und Wendungen', ru: 'Новые слова и выражения' },
  grammar: { de: 'Grammatik im Fachkontext', ru: 'Грамматика на профессиональном материале' },
  diag:    { de: 'Einstufung', ru: 'Входной тест по грамматике' },
  mix:     { de: 'Grammatik gemischt', ru: 'Грамматика недели вперемешку' },
  text:    { de: 'Hören und Lesen', ru: 'Аудирование и чтение' },
  drill:   { de: 'Sprech-Drill', ru: 'Устный перевод фраз на скорость' },
  chat:    { de: 'Gespräch mit Claude', ru: 'Разговор с Claude' },
  fluency: { de: 'Flüssig sprechen 4/3/2', ru: 'Беглость: 4/3/2 и повтор за диктором' },
  wrap:    { de: 'Abschluss', ru: 'Итоги дня' }
};

function sessionsFor(type) {
  if (type === 'diag') return {
    s1: [['diag', 20], ['new', 12], ['text', 13]],
    s2: [['drill', 6], ['chat', 24], ['fluency', 10], ['wrap', 5]]
  };
  if (type === 'review') return {
    s1: [['review', 12], ['new', 6], ['mix', 15], ['text', 12]],
    s2: [['drill', 8], ['chat', 25], ['fluency', 7], ['wrap', 5]]
  };
  return {
    s1: [['review', 10], ['new', 10], ['grammar', 15], ['text', 10]],
    s2: [['drill', 8], ['chat', 22], ['fluency', 10], ['wrap', 5]]
  };
}

/* Fertige Tagesdateien (src/data/days/dNN.js) in die gemeinsamen Sammlungen und den Plan einhängen */
(function registerDays() {
  var days = D.days || {};
  D.vocab = D.vocab || []; D.grammar = D.grammar || {}; D.texts = D.texts || {}; D.scenarios = D.scenarios || {}; D.fluency = D.fluency || {};
  Object.keys(days).map(Number).sort(function (a, b) { return a - b; }).forEach(function (d) {
    var x = days[d];
    if (!x || (D.course.plan || []).some(function (p) { return p.d === d; })) return;
    (x.vocab || []).forEach(function (v) { v.day = d; D.vocab.push(v); });
    if (x.grammar) { x.grammar.day = d; D.grammar[x.grammar.id] = x.grammar; }
    if (x.text) D.texts[x.text.id] = x.text;
    if (x.scenario) D.scenarios[x.scenario.id] = x.scenario;
    if (x.fluency) D.fluency[x.fluency.id] = x.fluency;
    D.course.plan.push({
      d: d, type: x.type || 'lesson', de: x.de, ru: x.ru || '',
      grammar: x.grammar ? x.grammar.id : 'mix:' + Math.ceil(d / 7),
      text: x.text && x.text.id, scenario: x.scenario && x.scenario.id, fluency: x.fluency && x.fluency.id
    });
  });
})();

var Content = {
  gen: {},     // erzeugte Tagesinhalte, nach Tag
  vocabById: null,
  index: function () {
    if (this.vocabById) return;
    var m = {};
    (D.vocab || []).forEach(function (v) { m[v.id] = v; });
    this.vocabById = m;
  },
  weekOf: function (d) { return Math.ceil(d / 7); },
  meta: function (d) {
    var p = (D.course.plan || []).filter(function (x) { return x.d === d; })[0];
    if (p) return { d: d, type: p.type, de: p.de, ru: p.ru, fixed: true, p: p };
    var o = (D.course.outline || []).filter(function (x) { return x[0] === d; })[0];
    if (!o) return null;
    var review = /^Wochenrückblick/.test(o[1]);
    return { d: d, type: review ? 'review' : 'lesson', de: o[1], ru: '', fixed: false, o: o };
  },
  /* Tagespaket laden; null, wenn ein erzeugter Tag noch fehlt */
  day: function (d) {
    var m = this.meta(d), self = this;
    if (!m) return Promise.resolve(null);
    if (m.fixed) return Promise.resolve(this.fixedDay(m));
    return this.loadGen(d).then(function (g) {
      if (!g) return null;
      /* Wochenrückblick: erst die Tage der Woche laden, sonst fehlt die Grammatikmischung */
      return (m.type === 'review' ? self.preloadWeek(d) : Promise.resolve()).then(function () { return self.genDay(m, g); });
    });
  },
  fixedDay: function (m) {
    var p = m.p, d = m.d;
    var b = {
      d: d, type: m.type, de: m.de, ru: m.ru, week: this.weekOf(d),
      vocab: (D.vocab || []).filter(function (v) { return v.day === d; }),
      grammar: null, mix: [],
      text: (D.texts || {})[p.text] || null,
      scenario: (D.scenarios || {})[p.scenario] || null,
      fluency: (D.fluency || {})[p.fluency] || null
    };
    if (p.grammar && p.grammar.indexOf('mix:') === 0) {
      var w = +p.grammar.slice(4);
      b.mix = Object.keys(D.grammar || {}).map(function (k) { return D.grammar[k]; })
        .filter(function (u) { return u.id !== 'g-diag' && Math.ceil(u.day / 7) === w; });
    } else b.grammar = (D.grammar || {})[p.grammar] || null;
    return b;
  },
  /* IDs der erzeugten Inhalte setzen (beim Laden und nach dem Erzeugen) */
  normGen: function (d, g) {
    (g.vocab || []).forEach(function (v, i) { v.id = 'v' + pad2(d) + '-' + ('00' + (i + 1)).slice(-3); v.day = d; });
    if (g.grammar) { g.grammar.id = 'gen-g' + d; g.grammar.day = d; }
    if (g.scenario) g.scenario.id = 'gen-s' + d;
    return g;
  },
  genDay: function (m, g) {
    var d = m.d, b = {
      d: d, type: m.type, de: m.de, ru: g.ru || '', week: this.weekOf(d), generated: true,
      vocab: g.vocab || [], grammar: g.grammar || null, mix: [],
      text: g.text || null, scenario: g.scenario || null, fluency: g.fluency || null
    };
    if (m.type === 'review') {
      var self = this, from = (b.week - 1) * 7 + 1, units = [];
      for (var x = from; x < d; x++) {
        var u = self.fixedUnitOf(x) || (self.gen[x] && self.gen[x].grammar);
        if (u && u.drills) units.push(u);
      }
      b.mix = units;
      if (!b.grammar && !units.length) b.mix = [];
    }
    return b;
  },
  fixedUnitOf: function (d) {
    var p = (D.course.plan || []).filter(function (x) { return x.d === d; })[0];
    return p && D.grammar ? D.grammar[p.grammar] : null;
  },
  loadGen: function (d) {
    var self = this;
    if (this.gen[d]) return Promise.resolve(this.gen[d]);
    return Store.getExtra('gen-d' + pad2(d)).then(function (g) {
      if (g && g.vocab) { self.gen[d] = self.normGen(d, g); return g; }
      return null;
    });
  },
  /* Woche vor einem Rückblick vorab laden, damit die Grammatikmischung vollständig ist */
  preloadWeek: function (d) {
    var from = (this.weekOf(d) - 1) * 7 + 1, ps = [];
    for (var x = from; x < d; x++) if (!this.meta(x).fixed) ps.push(this.loadGen(x));
    return Promise.all(ps);
  }
};

/* ---------- Karten: Inhalt zu einer Karten-ID ---------- */
var Cards = {
  get: function (id) {
    Content.index();
    var m;
    if ((m = /^v(\d\d)-\d{3}$/.exec(id))) {
      var d = +m[1];
      var v = Content.vocabById[id];
      if (!v && Content.gen[d]) v = (Content.gen[d].vocab || []).filter(function (x) { return x.id === id; })[0];
      return v ? Object.assign({ type: 'vocab' }, v) : null;
    }
    if ((m = /^(g-[a-z0-9-]+)#(\d+)$/.exec(id))) {
      var u = (D.grammar || {})[m[1]], s = u && u.speak && u.speak[+m[2]];
      return s ? { id: id, type: 'satz', ru: s.ru, de: s.de, unit: u.de } : null;
    }
    if ((m = /^gen-g(\d+)#(\d+)$/.exec(id))) {
      var g = Content.gen[+m[1]], sp = g && g.grammar && g.grammar.speak && g.grammar.speak[+m[2]];
      return sp ? { id: id, type: 'satz', ru: sp.ru, de: sp.de, unit: g.grammar.de } : null;
    }
    var x = (Store.get('xcards').items || {})[id] || (Store.get('custom').items || {})[id];
    return x ? Object.assign({ id: id }, x) : null;
  },
  /* Tage, deren erzeugte Inhalte für diese Karten geladen sein müssen */
  needDays: function (ids) {
    var days = {};
    ids.forEach(function (id) {
      var m = /^v(\d\d)-/.exec(id) || /^gen-g(\d+)#/.exec(id);
      if (m && !Content.meta(+m[1]).fixed) days[+m[1]] = 1;
    });
    return Object.keys(days).map(Number);
  },
  srs: function () { var s = Store.get('srs'); s.c = s.c || {}; return s.c; },
  due: function (now) {
    now = now || Date.now();
    var c = this.srs(), out = [];
    for (var id in c) if (c[id].due <= now) out.push(id);
    out.sort(function (a, b) { return c[a].due - c[b].due; });
    return out;
  },
  dueToday: function () { return this.due(startOfDay() + DAY + 4 * 3600000 - 1).length; },
  grade: function (id, g) {
    var c = this.srs();
    c[id] = FSRS.review(c[id], g);
    Store.save('srs');
    var p = Store.get('prog'); var k = dayKey();
    p.rev = p.rev || {}; p.rev[k] = (p.rev[k] || 0) + 1;
    Store.save('prog');
  },
  /* Neue Karte nach der Einführung aufnehmen */
  learn: function (id, g) {
    var c = this.srs();
    if (c[id]) return;
    c[id] = FSRS.review(null, g || 3);
    Store.save('srs');
  },
  addX: function (type, body) {
    var x = Store.get('xcards'); x.items = x.items || {};
    var id = (type === 'fix' || type === 'task' ? 'e-' : 'p-') + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
    x.items[id] = Object.assign({ type: type, at: Date.now() }, body);
    this.trimX(x);
    Store.save('xcards');
    this.learn(id, 2);
    return id;
  },
  /* Dokumentgrenze 256 KiB in Bytes: die sichersten Karten zuerst entfernen */
  trimX: function (x) {
    var bytes = function () { var s = JSON.stringify(x); return window.TextEncoder ? new TextEncoder().encode(s).length : s.length * 2; };
    if (bytes() < 220000) return;
    var c = this.srs();
    var ids = Object.keys(x.items).sort(function (a, b) { return ((c[b] && c[b].s) || 0) - ((c[a] && c[a].s) || 0); });
    while (ids.length && bytes() >= 200000) { var batch = ids.splice(0, 20); batch.forEach(function (id) { delete x.items[id]; delete c[id]; }); }
    Store.save('srs');
  },
  label: function (c) {
    if (!c) return '';
    if (c.art) return c.art + ' ' + c.de;
    return c.de || c.right || '';
  }
};
DOCS.push('xcards');
