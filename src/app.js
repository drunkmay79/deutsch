/* App: Navigation, Ansichten, Sitzungsablauf, Zeitmessung, Start */

var App = {
  view: 'heute', day: 1, misses: [],
  main: null,
  /* aktueller Lerntag: erster nicht abgeschlossener Tag */
  lessonDay: function () {
    var days = (Store.get('prog').days) || {};
    for (var d = 1; d <= D.course.days; d++) { var x = days[d]; if (!(x && x.s1 && x.s1.done && x.s2 && x.s2.done)) return d; }
    return D.course.days;
  },
  go: function (v, opts) {
    TTS.stop();
    Clock.study = false;
    this.view = v;
    if (opts && opts.day) this.day = opts.day;
    document.querySelectorAll('.nav button').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); b.setAttribute('aria-current', b.dataset.v === v ? 'page' : 'false'); });
    this.main.textContent = '';
    window.scrollTo(0, 0);
    (Views[v] || Views.heute)(this.main, opts || {});
  },
  refresh: function () { if (this.view !== 'sitzung' && this.view !== 'gespraech') this.go(this.view); }
};

/* ---------- aktive Lernzeit ---------- */
var Clock = {
  study: false, act: Date.now(), acc: 0, el: null, target: 0, secs: 0,
  start: function (el, targetMin) { this.el = el; this.target = targetMin * 60; this.secs = 0; this.study = true; this.draw(); },
  tick: function () {
    if (!this.study || document.hidden || Date.now() - this.act > 120000) return;
    this.secs++; this.acc++;
    if (this.acc >= 30) this.flush();
    this.draw();
  },
  flush: function () {
    if (!this.acc) return;
    var p = Store.get('prog'), k = dayKey(); p.min = p.min || {};
    p.min[k] = Math.round(((p.min[k] || 0) + this.acc / 60) * 10) / 10; this.acc = 0;
    Store.save('prog');
  },
  draw: function () {
    if (!this.el || !this.el.isConnected) return;
    var s = this.secs, t = this.target;
    this.el.textContent = Math.floor(s / 60) + ':' + pad2(s % 60) + (t ? ' / ' + Math.round(t / 60) + ' Min' : '');
    this.el.classList.toggle('reached', t > 0 && s >= t);
  }
};
setInterval(function () { Clock.tick(); }, 1000);
['pointerdown', 'keydown', 'input'].forEach(function (e) { document.addEventListener(e, function () { Clock.act = Date.now(); }, true); });
document.addEventListener('visibilitychange', function () { if (document.hidden) { Clock.flush(); Store.flush(); } });

/* Bildschirm während der Sitzung anlassen */
var Wake = {
  lock: null,
  on: function () { try { if (navigator.wakeLock && !this.lock) navigator.wakeLock.request('screen').then(function (l) { Wake.lock = l; l.addEventListener('release', function () { Wake.lock = null; }); }).catch(function () { }); } catch (e) { } },
  off: function () { try { if (this.lock) this.lock.release(); } catch (e) { } this.lock = null; }
};

var Views = {};

/* ---------- Heute ---------- */
Views.heute = function (el, opts) {
  var d = opts.day || App.day || App.lessonDay();
  App.day = d;
  var m = Content.meta(d), cal = calendarDay();
  var w = D.course.weeks[Content.weekOf(d) - 1];
  var head = h('section', { class: 'dayhead' },
    h('p', { class: 'eyebrow', text: 'Woche ' + w.n + ' · ' + w.de }),
    h('div', { class: 'dayline' },
      h('h1', { class: 'daynum' }, h('span', { text: 'Tag' }), ' ' + d),
      h('div', {},
        h('p', { class: 'daytitle', text: m.de }),
        m.ru ? h('p', { class: 'ru small', text: m.ru }) : null)),
    h('p', { class: 'stichtag', text: 'Stichtag ' + WD[new Date(courseDate(d)).getDay()] + ', ' + fmtDate(courseDate(d)) + paceText(d, cal) }));
  el.appendChild(head);
  var nav = h('div', { class: 'daynav' },
    d > 1 ? h('button', { class: 'btn ghost', type: 'button', text: '← Tag ' + (d - 1), onclick: function () { App.go('heute', { day: d - 1 }); } }) : h('span'),
    d !== App.lessonDay() ? h('button', { class: 'btn ghost', type: 'button', text: 'Aktueller Tag', onclick: function () { App.day = App.lessonDay(); App.go('heute', { day: App.day }); } }) : h('span'),
    d < D.course.days ? h('button', { class: 'btn ghost', type: 'button', text: 'Tag ' + (d + 1) + ' →', onclick: function () { App.go('heute', { day: d + 1 }); } }) : h('span'));
  el.appendChild(nav);

  var body = h('div', { class: 'sessions' }, h('p', { class: 'muted', text: 'Lade …' }));
  el.appendChild(body);
  Content.day(d).then(function (b) {
    body.textContent = '';
    if (!b) return body.appendChild(genCard(d));
    var prog = (Store.get('prog').days || {})[d] || {};
    var ss = sessionsFor(b.type);
    ['s1', 's2'].forEach(function (s, si) {
      var st = prog[s] || {}, blocks = ss[s];
      var doneCount = blocks.filter(function (x) { return st.b && st.b[x[0]]; }).length;
      var card = h('article', { class: 'session' + (st.done ? ' done' : '') },
        h('div', { class: 'sesshead' },
          h('h2', { text: 'Sitzung ' + (si + 1) }),
          h('span', { class: 'pill', text: st.done ? 'erledigt' : doneCount ? doneCount + ' / ' + blocks.length : '45 Min' })),
        h('ol', { class: 'blocks' }, blocks.map(function (x) {
          var on = st.b && st.b[x[0]];
          return h('li', { class: on ? 'ok' : '' }, h('span', { class: 'bname' }, BLOCKS[x[0]].de, h('small', { text: BLOCKS[x[0]].ru })), h('span', { class: 'bmin', text: x[1] + ' Min' }));
        })),
        h('button', {
          class: 'btn ' + (st.done ? 'ghost' : 'primary'), type: 'button',
          text: st.done ? 'Noch einmal öffnen' : doneCount ? 'Fortsetzen' : 'Sitzung ' + (si + 1) + ' starten',
          onclick: function () { App.go('sitzung', { day: d, s: s, bundle: b }); }
        }));
      body.appendChild(card);
    });
  });

  var p = Store.get('prog');
  el.appendChild(h('div', { class: 'stats' },
    stat(Cards.dueToday(), 'Karten heute fällig'),
    stat(Math.round((p.min || {})[dayKey()] || 0) + ' Min', 'heute gelernt'),
    stat(streak() + ' T', 'Serie')));
  if (!AI.ready()) el.appendChild(h('p', { class: 'note', text: !AI.checked ? 'Claude verbindet sich … (Gespräche und Prüfungen durch Claude erscheinen gleich).' : AI.fn ? 'Claude ist für diese Seite nicht freigegeben. Gespräche und Prüfungen durch Claude sind ausgeschaltet; alle anderen Übungen laufen.' : 'Claude ist nur verfügbar, wenn die App in claude.ai geöffnet ist. Alle anderen Übungen laufen.' }));
};
function paceText(d, cal) {
  if (cal < 1) return ' · Kursstart in ' + (1 - cal) + (1 - cal === 1 ? ' Tag' : ' Tagen');
  if (cal === d) return ' · nach Plan';
  if (cal > d) return ' · Plan: Tag ' + Math.min(cal, 91);
  return ' · ' + (d - cal) + ' T voraus';
}
function streak() {
  var m = Store.get('prog').min || {}, n = 0, t = Date.now();
  if (!(m[dayKey(t)] >= 20)) t -= DAY;
  while (m[dayKey(t)] >= 20) { n++; t -= DAY; }
  return n;
}
function genCard(d) {
  var o = Content.meta(d).o;
  var box = h('article', { class: 'session' },
    h('h2', { text: 'Inhalte für Tag ' + d + ' vorbereiten' }),
    h('p', { class: 'doc', text: o[1] }),
    h('p', { class: 'muted small', text: 'Wortschatz: ' + o[2] }),
    h('p', { class: 'muted small', text: 'Grammatik: ' + o[3] }),
    h('p', { class: 'muted small', text: 'Gespräch: ' + o[4] }));
  if (!AI.ready()) { box.appendChild(h('p', { class: 'note', text: 'Dafür braucht die App Claude. Bitte die Seite in claude.ai öffnen und Claude erlauben.' })); return box; }
  var status = h('div', {});
  var b = h('button', { class: 'btn primary', type: 'button', text: 'Jetzt vorbereiten (1–3 Minuten)' });
  b.addEventListener('click', function () {
    b.remove();
    Gen.make(d, status).then(function (g) { if (g) App.go('heute', { day: d }); });
  });
  box.appendChild(b); box.appendChild(status);
  return box;
}

/* ---------- Sitzung ---------- */
Views.sitzung = function (el, opts) {
  var d = opts.day, s = opts.s, b = opts.bundle;
  var blocks = sessionsFor(b.type)[s];
  var prog = Store.get('prog'); prog.days = prog.days || {};
  var dp = prog.days[d] = prog.days[d] || {}; dp[s] = dp[s] || { b: {} }; dp[s].b = dp[s].b || {};
  var idx = 0;
  while (idx < blocks.length - 1 && dp[s].b[blocks[idx][0]]) idx++;
  if (dp[s].done) idx = opts.idx || 0;
  Wake.on();
  var top = h('div', { class: 'runhead' });
  var timer = h('span', { class: 'clock' });
  var holder = h('div', { class: 'block' });
  el.appendChild(top); el.appendChild(holder);
  if (b.type === 'review') Content.preloadWeek(d);

  var run = {
    stat: function () { },
    miss: function (m) { m.day = d; App.misses.push(m); App.misses = App.misses.slice(-60); }
  };
  function draw() {
    top.textContent = '';
    var cur = blocks[idx];
    top.appendChild(h('div', { class: 'runbar' },
      h('button', { class: 'btn-icon', type: 'button', 'aria-label': 'Zurück zu Heute', onclick: function () { Wake.off(); App.go('heute', { day: d }); } }, icon('back')),
      h('span', { class: 'runtitle', text: 'Tag ' + d + ' · Sitzung ' + (s === 's1' ? 1 : 2) }),
      timer));
    top.appendChild(h('ol', { class: 'pips' }, blocks.map(function (x, k) {
      return h('li', { class: (k === idx ? 'cur ' : '') + (dp[s].b[x[0]] ? 'ok' : '') },
        h('button', { type: 'button', title: BLOCKS[x[0]].de, 'aria-label': (k + 1) + '. ' + BLOCKS[x[0]].de, onclick: function () { idx = k; start(); } }, String(k + 1)));
    })));
    top.appendChild(h('div', { class: 'blockhead' },
      h('h2', {}, h('span', { class: 'num', text: (idx + 1) + '.' }), ' ' + BLOCKS[cur[0]].de),
      h('p', { class: 'ru small', text: BLOCKS[cur[0]].ru })));
  }
  function start() {
    TTS.stop();
    draw();
    holder.textContent = '';
    var cur = blocks[idx];
    Clock.start(timer, cur[1]);
    var inner = h('div', {});
    holder.appendChild(inner);
    var finished = false;
    var ctx = {
      b: b, el: inner, run: run, done: function () {
        if (finished) return; finished = true;
        dp[s].b[cur[0]] = Date.now(); Store.save('prog');
        Clock.flush();
        if (idx < blocks.length - 1) { idx++; start(); window.scrollTo(0, 0); }
        else complete();
      }
    };
    try { (Runners[cur[0]] || function (c) { c.done(); })(ctx); }
    catch (e) { inner.appendChild(h('p', { class: 'note', text: 'Dieser Block konnte nicht geladen werden: ' + e.message })); }
    holder.appendChild(h('div', { class: 'blockfoot' }, h('button', { class: 'btn ghost', type: 'button', text: idx < blocks.length - 1 ? 'Block beenden →' : 'Sitzung beenden', onclick: ctx.done })));
  }
  function complete() {
    dp[s].done = Date.now(); Store.save('prog'); Clock.flush(); Store.flush(); Wake.off(); Clock.study = false;
    holder.textContent = ''; top.textContent = '';
    var both = dp.s1 && dp.s1.done && dp.s2 && dp.s2.done;
    holder.appendChild(h('div', { class: 'empty finish' },
      h('p', { class: 'eyebrow', text: 'Tag ' + d }),
      h('h2', { text: both ? 'Tag ' + d + ' abgeschlossen' : 'Sitzung ' + (s === 's1' ? 1 : 2) + ' geschafft' }),
      h('p', { class: 'muted', text: both ? 'Morgen geht es mit Tag ' + (d + 1) + ' weiter.' : s === 's1' ? 'Sitzung 2 am besten später am Tag: Gespräch, Sprechen, Abschluss.' : 'Sitzung 1 ist noch offen.' }),
      h('button', { class: 'btn primary', type: 'button', text: 'Zur Übersicht', onclick: function () { App.day = both ? App.lessonDay() : d; App.go('heute', { day: App.day }); } })));
  }
  start();
};

/* ---------- Gespräch (frei) ---------- */
var FREE = [
  { id: 'free-tutor', kind: 'tutor', title: 'Freies Gespräch mit Tutor', ru: 'Свободный разговор с преподавателем', role: 'Du bist ein freundlicher, geduldiger Deutschlehrer. Ihr unterhaltet euch über Beruf, Immobilien, Alltag in Deutschland und Pläne des Lerners. Stelle offene Fragen, die zu längeren Antworten führen.', open: 'Guten Tag! Worüber möchten Sie heute sprechen? Wir können auch einfach mit Ihrem Tag anfangen: Was haben Sie heute schon gemacht?' },
  { id: 'free-spk', kind: 'interview', title: 'Vorstellungsgespräch: Sparkasse', ru: 'Собеседование в Шпаркассе', role: 'Ihr seid zwei Gesprächspartner einer Sparkasse im Ruhrgebiet: Frau Becker (Personalreferentin) und Herr Schulte (Abteilungsleiter Kreditsicherheiten / Immobilienbewertung). Kennzeichne, wer spricht („Frau Becker:“ / „Herr Schulte:“). Führe ein realistisches Vorstellungsgespräch für die Stelle „Sachverständiger für Immobilienbewertung (m/w/d)“: Begrüßung, Selbstpräsentation, Werdegang, Fachfragen (Beleihungswert, Verfahren, Prüfung externer Gutachten, Unabhängigkeit vom Vertrieb), Motivation, Stärken und Schwächen, Rahmenbedingungen, Fragen des Bewerbers. Freundlich, aber prüfend; frage nach, wenn Antworten vage sind.', open: 'Frau Becker: Guten Tag, schön, dass Sie da sind. Haben Sie gut zu uns gefunden? Herr Schulte: Guten Tag. Erzählen Sie uns doch zuerst etwas über sich.' },
  { id: 'free-buero', kind: 'interview', title: 'Vorstellungsgespräch: Gutachterbüro', ru: 'Собеседование в оценочной фирме', role: 'Du bist Herr Wagner, Inhaber eines Sachverständigenbüros für Immobilienbewertung im Ruhrgebiet mit fünf Mitarbeitern. Du suchst einen Sachverständigen für Verkehrswertgutachten (Einfamilienhäuser, Eigentumswohnungen, Mehrfamilienhäuser) für Privatkunden, Gerichte und Banken. Frage praxisnah: Ablauf einer Bewertung, Umgang mit schwierigen Eigentümern, Software, Arbeitsweise, Termintreue, Deutsch im Gutachten.', open: 'Guten Tag, Herr Wagner mein Name. Setzen Sie sich bitte. Sie haben ja einen interessanten Lebenslauf – erzählen Sie mal, wie Sie zur Immobilienbewertung gekommen sind.' },
  { id: 'free-fach', kind: 'fach', title: 'Fachgespräch mit Prüfer', ru: 'Профессиональный разговор с экзаменатором', role: 'Du bist ein erfahrener öffentlich bestellter Sachverständiger und führst ein Fachgespräch. Frage nacheinander nach Verkehrswert (§ 194 BauGB), ImmoWertV 2021, Bodenwert, Vergleichs-, Sach- und Ertragswertverfahren, besonderen objektspezifischen Grundstücksmerkmalen, Rechten in Abteilung II, Beleihungswert. Lass dir Begriffe erklären und frage nach Beispielen.', open: 'Guten Tag. Beginnen wir mit einer Grundfrage: Wie ist der Verkehrswert definiert, und welche Rolle spielt der Wertermittlungsstichtag?' },
  { id: 'free-eig', kind: 'roleplay', title: 'Eigentümer bei der Ortsbesichtigung', ru: 'Владелец на осмотре объекта', role: 'Du bist Herr Krämer, 68, Eigentümer eines freistehenden Einfamilienhauses (Baujahr 1974, teilweise modernisiert) in Musterstadt. Du willst einen möglichst hohen Wert, erzählst gern, übertreibst die Modernisierungen etwas und spielst Mängel herunter (feuchter Keller, alte Ölheizung). Der Lerner ist der Gutachter.', open: 'Guten Tag, kommen Sie rein! Ich habe schon Kaffee gemacht. Also, das Haus ist top in Schuss, da werden Sie nichts finden. Wo wollen Sie anfangen?' },
  { id: 'free-kb', kind: 'roleplay', title: 'Kreditberater der Sparkasse', ru: 'Кредитный консультант Шпаркассы', role: 'Du bist Frau Yilmaz, Kreditberaterin einer Sparkasse. Du hast einen Kunden, der eine Eigentumswohnung kaufen will, und brauchst schnell eine Einschätzung zum Beleihungswert. Du drängst etwas auf Tempo und einen höheren Wert, weil der Kunde wichtig ist. Der Lerner ist der Gutachter in der Marktfolge.', open: 'Hallo, gut dass ich Sie erwische! Ich habe hier eine Finanzierung, die bis Freitag durch muss. Die Wohnung kostet 340.000 Euro – das passt doch, oder?' }
];

Views.gespraech = function (el, opts) {
  Clock.study = true; Clock.el = null;
  el.appendChild(h('h1', { class: 'viewtitle', text: 'Gespräch' }));
  el.appendChild(h('p', { class: 'ru small', text: 'Свободная практика: выберите собеседника. Ошибки после разговора можно добавить в карточки.' }));
  if (opts.sc) {
    var sc = opts.sc;
    el.appendChild(h('button', { class: 'btn ghost', type: 'button', text: '← Andere Gesprächspartner', onclick: function () { App.go('gespraech'); } }));
    el.appendChild(scenarioIntro(sc));
    if (!AI.ready()) { el.appendChild(h('p', { class: 'note', text: 'Claude ist hier nicht verfügbar.' })); return; }
    el.appendChild(chatPanel(sc, { key: sc.id, onDone: function () { App.go('gespraech'); } }));
    return;
  }
  if (opts.qbank) return qbank(el);
  var cur = Store.get('chats').cur;
  var grid = h('div', { class: 'partners' });
  FREE.forEach(function (sc) {
    grid.appendChild(h('button', { class: 'partner', type: 'button', onclick: function () { App.go('gespraech', { sc: sc }); } },
      h('b', { text: sc.title }), h('span', { class: 'ru small', text: sc.ru }), cur && cur.key === sc.id ? h('span', { class: 'pill', text: 'läuft' }) : null));
  });
  grid.appendChild(h('button', { class: 'partner', type: 'button', onclick: function () { App.go('gespraech', { qbank: true }); } },
    h('b', { text: 'Interview-Fragenbank' }), h('span', { class: 'ru small', text: 'Банк вопросов: ответ голосом → оценка и образец' })));
  el.appendChild(grid);
};

function qbank(el) {
  var cats = { alle: 'Alle', start: 'Einstieg', werdegang: 'Werdegang', motivation: 'Motivation', fach: 'Fachfragen', bank: 'Bank', staerken: 'Stärken', situation: 'Situationen', rahmen: 'Rahmen', fragen: 'Eigene Fragen' };
  var cat = 'alle', list = D.interview || [];
  el.appendChild(h('button', { class: 'btn ghost', type: 'button', text: '← Andere Gesprächspartner', onclick: function () { App.go('gespraech'); } }));
  var chips = h('div', { class: 'chips' }), stage = h('div', { class: 'stage' });
  Object.keys(cats).forEach(function (k) {
    chips.appendChild(h('button', { class: 'chip' + (k === cat ? ' on' : ''), type: 'button', text: cats[k], onclick: function (ev) { cat = k; Array.prototype.forEach.call(chips.children, function (c) { c.classList.remove('on'); }); ev.target.classList.add('on'); pick(); } }));
  });
  el.appendChild(chips); el.appendChild(stage);
  function pick() {
    var pool = list.filter(function (q) { return cat === 'alle' || q.cat === cat; });
    var q = pool[Math.floor(Math.random() * pool.length)];
    stage.textContent = '';
    if (!q) return stage.appendChild(h('p', { text: 'Keine Fragen.' }));
    stage.appendChild(h('div', { class: 'rcard' },
      h('p', { class: 'eyebrow', text: cats[q.cat] || q.cat }),
      h('p', { class: 'doc big', text: q.q }), speakBtn(q.q),
      h('p', { class: 'ru small', text: q.ru }),
      h('details', {}, h('summary', { text: 'Tipp und Schlüsselwendungen' }), h('p', { class: 'ru small', text: q.tip }), h('div', { class: 'chips' }, (q.key || []).map(function (k) { return h('span', { class: 'chip static', text: k }); })))));
    var ta = answerBox({ rows: 5, focus: false, ph: 'Erst laut antworten, dann diktieren …' });
    stage.appendChild(ta); stage.appendChild(dictHint());
    var row = h('div', { class: 'row' });
    if (AI.ready()) {
      var ck = h('button', { class: 'btn primary', type: 'button', text: 'Antwort bewerten lassen' });
      ck.addEventListener('click', function () { if (ta.value.trim().length < 20) { toast('Bitte ausführlicher antworten.'); return; } ck.disabled = true; stage.insertBefore(feedbackPanel(Prompts.interviewAnswer(q, ta.value), { src: 'interview', modelLabel: 'Musterantwort' }), row); });
      row.appendChild(ck);
    }
    row.appendChild(h('button', { class: 'btn', type: 'button', text: 'Nächste Frage', onclick: pick }));
    stage.appendChild(row);
    TTS.speak(q.q);
  }
  pick();
}

/* ---------- Karten ---------- */
Views.karten = function (el) {
  el.appendChild(h('h1', { class: 'viewtitle', text: 'Karten' }));
  var c = Cards.srs(), ids = Object.keys(c), now = Date.now();
  var due = Cards.due(now).length, safe = ids.filter(function (id) { return c[id].s >= 21; }).length;
  el.appendChild(h('div', { class: 'stats' }, stat(due, 'jetzt fällig'), stat(ids.length, 'Karten gesamt'), stat(safe, 'sicher (≥ 3 Wochen)')));
  var holder = h('div', {});
  var startBtn = h('button', { class: 'btn primary', type: 'button', text: due ? 'Jetzt ' + due + ' Karten wiederholen' : 'Extra-Runde starten' });
  startBtn.addEventListener('click', function () {
    el.textContent = '';
    el.appendChild(h('button', { class: 'btn ghost', type: 'button', text: '← Karten', onclick: function () { App.go('karten'); } }));
    var t = h('span', { class: 'clock' }); el.appendChild(h('div', { class: 'runbar' }, h('span', { class: 'runtitle', text: 'Freie Wiederholung' }), t));
    Clock.start(t, 0);
    var box = h('div', {}); el.appendChild(box);
    reviewRunner(box, function () { App.go('karten'); }, null);
  });
  el.appendChild(startBtn);
  el.appendChild(h('h2', { class: 'sub', text: 'Wortschatz' }));
  var q = h('input', { type: 'search', id: 'voc-q', placeholder: 'Suchen (deutsch oder russisch) …', class: 'search' });
  var list = h('ul', { class: 'voclist' });
  el.appendChild(q); el.appendChild(list); el.appendChild(holder);
  var all = (D.vocab || []).slice();
  Object.keys(Content.gen).forEach(function (k) { all = all.concat(Content.gen[k].vocab || []); });
  function draw() {
    var s = q.value.trim().toLowerCase();
    list.textContent = '';
    all.filter(function (v) { return !s || v.de.toLowerCase().indexOf(s) >= 0 || (v.ru || '').toLowerCase().indexOf(s) >= 0; }).slice(0, 120).forEach(function (v) {
      var st = c[v.id], lvl = !st ? 'neu' : st.s >= 21 ? 'sicher' : 'lernt';
      list.appendChild(h('li', {}, h('span', { class: 'lvl ' + lvl, text: lvl }),
        h('span', { class: 'vde' }, v.art ? h('span', { class: 'art ' + artClass(v.art), text: v.art + ' ' }) : null, v.de),
        h('span', { class: 'vru', text: v.ru }), speakBtn((v.art ? v.art + ' ' : '') + v.de)));
    });
  }
  q.addEventListener('input', draw);
  draw();
};

/* ---------- Plan und Fortschritt ---------- */
Views.plan = function (el) {
  el.appendChild(h('h1', { class: 'viewtitle', text: 'Plan und Fortschritt' }));
  var p = Store.get('prog'), days = p.days || {}, min = p.min || {};
  var doneDays = Object.keys(days).filter(function (d) { return days[d].s1 && days[d].s1.done && days[d].s2 && days[d].s2.done; }).length;
  var total = Object.keys(min).reduce(function (a, k) { return a + min[k]; }, 0);
  el.appendChild(h('div', { class: 'stats' }, stat(doneDays + ' / 91', 'Tage abgeschlossen'), stat(Math.round(total / 60 * 10) / 10 + ' h', 'Lernzeit gesamt'), stat(streak() + ' T', 'Serie')));
  el.appendChild(h('h2', { class: 'sub', text: 'Lernzeit der letzten 14 Tage' }));
  el.appendChild(minutesChart(min));
  var chats = (Store.get('chats').list || []).filter(function (c) { return c.scores; });
  if (chats.length) { el.appendChild(h('h2', { class: 'sub', text: 'Gespräche: Bewertung im Verlauf' })); el.appendChild(scoreChart(chats.slice(-20))); }
  if (p.diag) { el.appendChild(h('h2', { class: 'sub', text: 'Einstufung (Tag 1)' })); el.appendChild(diagTable(p.diag)); }
  var g = p.g || {};
  var units = Object.keys(g).filter(function (k) { return k !== 'mix'; });
  if (units.length) {
    el.appendChild(h('h2', { class: 'sub', text: 'Grammatik: Trefferquote' }));
    el.appendChild(h('table', { class: 'tbl' }, h('tr', {}, h('th', { text: 'Thema' }), h('th', { text: 'Richtig' })), units.map(function (k) {
      var u = (D.grammar || {})[k] || (Content.gen[+k.replace('gen-g', '')] || {}).grammar || { de: k };
      var r = g[k]; var pc = Math.round(100 * r[0] / Math.max(1, r[1]));
      return h('tr', { class: pc < 70 ? 'weak' : '' }, h('td', { text: u.de }), h('td', { text: pc + ' % (' + r[1] + ')' }));
    })));
  }
  var w = Prompts.weakSpots();
  if (w) el.appendChild(h('p', { class: 'note', text: 'Häufigste Fehler bisher: ' + w + '. Claude berücksichtigt das in Gesprächen und neuen Inhalten.' }));
  el.appendChild(h('h2', { class: 'sub', text: 'Kursplan' }));
  var cur = App.lessonDay();
  D.course.weeks.forEach(function (wk) {
    var row = h('div', { class: 'weekrow' }, h('p', { class: 'wk' }, h('b', { text: 'Woche ' + wk.n }), ' ' + wk.de));
    var chips = h('div', { class: 'daychips' });
    for (var d = (wk.n - 1) * 7 + 1; d <= wk.n * 7; d++) {
      var x = days[d] || {}, cls = x.s1 && x.s1.done && x.s2 && x.s2.done ? 'full' : (x.s1 && x.s1.done) || (x.s2 && x.s2.done) ? 'half' : '';
      (function (dd, m) {
        chips.appendChild(h('button', { class: 'dchip ' + cls + (dd === cur ? ' cur' : ''), type: 'button', title: m ? m.de : '', 'aria-label': 'Tag ' + dd + (m ? ': ' + m.de : ''), onclick: function () { App.go('heute', { day: dd }); } }, String(dd)));
      })(d, Content.meta(d));
    }
    row.appendChild(chips); el.appendChild(row);
  });
};

function minutesChart(min) {
  var W = 340, H = 140, pad = 24, n = 14, bw = (W - pad - 6) / n;
  var vals = []; for (var i = n - 1; i >= 0; i--) { var k = dayKey(Date.now() - i * DAY); vals.push({ k: k, v: min[k] || 0 }); }
  var max = Math.max(90, Math.max.apply(null, vals.map(function (x) { return x.v; })));
  var y = function (v) { return H - 18 - (v / max) * (H - 30); };
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Lernminuten pro Tag">';
  s += '<line x1="' + pad + '" x2="' + W + '" y1="' + y(90) + '" y2="' + y(90) + '" class="goal"/><text x="0" y="' + (y(90) + 4) + '" class="axis">90</text>';
  vals.forEach(function (x, i) {
    var hgt = Math.max(0, H - 18 - y(x.v));
    s += '<rect x="' + (pad + i * bw + 2) + '" y="' + y(x.v) + '" width="' + (bw - 4) + '" height="' + hgt + '" rx="2" class="' + (x.v >= 90 ? 'cbarok' : 'cbar') + '"><title>' + x.k + ': ' + Math.round(x.v) + ' Min</title></rect>';
    if (i % 2 === 1 || i === n - 1) s += '<text x="' + (pad + i * bw + bw / 2) + '" y="' + (H - 4) + '" class="axis" text-anchor="middle">' + x.k.slice(8) + '.</text>';
  });
  return h('div', { class: 'chartbox', html: s + '</svg>' });
}
function scoreChart(list) {
  var W = 340, H = 120, n = list.length, keys = ['grammatik', 'wortschatz', 'fachsprache', 'ausdruck'];
  var x = function (i) { return 20 + (n === 1 ? 0 : i * (W - 30) / (n - 1)); }, y = function (v) { return H - 14 - (v - 1) / 4 * (H - 28); };
  var avg = list.map(function (c) { var s = 0, k = 0; keys.forEach(function (q) { if (c.scores[q]) { s += +c.scores[q]; k++; } }); return k ? s / k : 0; });
  var s = '<svg viewBox="0 0 ' + W + ' ' + H + '" class="chart" role="img" aria-label="Durchschnittliche Gesprächsbewertung">';
  [1, 3, 5].forEach(function (v) { s += '<line x1="20" x2="' + W + '" y1="' + y(v) + '" y2="' + y(v) + '" class="grid"/><text x="2" y="' + (y(v) + 4) + '" class="axis">' + v + '</text>'; });
  s += '<polyline fill="none" class="line" points="' + avg.map(function (v, i) { return x(i) + ',' + y(v); }).join(' ') + '"/>';
  avg.forEach(function (v, i) { s += '<circle cx="' + x(i) + '" cy="' + y(v) + '" r="' + (i === n - 1 ? 4 : 2.5) + '" class="dot"><title>' + list[i].sc + ': ' + v.toFixed(1) + '</title></circle>'; });
  return h('div', { class: 'chartbox', html: s + '</svg>' });
}

/* ---------- Mehr ---------- */
Views.mehr = function (el) {
  el.appendChild(h('h1', { class: 'viewtitle', text: 'Mehr' }));
  var prof = Store.get('profile'), set = Store.get('settings');

  /* Selbstpräsentation */
  var pitchBox = h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'Meine Selbstpräsentation' }),
    h('p', { class: 'ru small', text: 'Самопрезентация для собеседования (~2 минуты). Слушайте, повторяйте за диктором, улучшайте вместе с Claude.' }));
  var pta = h('textarea', { id: 'pitch', rows: 9, class: 'answer doc' }); pta.value = prof.pitch || '';
  pitchBox.appendChild(pta);
  var prow = h('div', { class: 'row' },
    h('button', { class: 'btn', type: 'button', text: 'Speichern', onclick: function () { prof.pitch = pta.value.trim(); Store.save('profile'); toast('Gespeichert'); } }),
    speakBtn(function () { return pta.value; }, 'Selbstpräsentation anhören'));
  if (AI.ready()) prow.appendChild(h('button', {
    class: 'btn ghost', type: 'button', text: 'Mit Claude verbessern', onclick: function (ev) {
      if (pta.value.trim().length < 50) { toast('Bitte zuerst einen Text eingeben.'); return; }
      var b = ev.target; b.disabled = true; b.textContent = 'Claude überarbeitet …';
      AI.text(Prompts.improvePitch(pta.value), { modelTier: 'default', cache: false }).then(function (t) {
        b.disabled = false; b.textContent = 'Mit Claude verbessern';
        pitchBox.appendChild(h('div', { class: 'model' }, h('p', { class: 'eyebrow', text: 'Vorschlag von Claude' }), h('p', { class: 'doc', text: t }), h('div', { class: 'row' }, speakBtn(t), h('button', { class: 'btn', type: 'button', text: 'Übernehmen', onclick: function () { pta.value = t; prof.pitch = t; Store.save('profile'); toast('Übernommen'); } }))));
      }).catch(function (e) { b.disabled = false; b.textContent = 'Mit Claude verbessern'; var m = AI.msg(e); if (m) toast(m); });
    }
  }));
  pitchBox.appendChild(prow);
  pitchBox.appendChild(h('button', { class: 'btn ghost', type: 'button', text: 'Satz für Satz nachsprechen', onclick: function (ev) { ev.target.replaceWith(shadowing((pta.value.match(/[^.!?]+[.!?]/g) || []).map(function (s) { return s.trim(); }), null)); } }));
  el.appendChild(pitchBox);

  /* Ordner fotografieren */
  var binder = h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'Seite aus dem Ordner → Karten' }),
    h('p', { class: 'ru small', text: 'Сфотографируйте страницу из папки с материалами — Claude выберет термины, и они войдут в блок «Новые слова».' }));
  var file = h('input', { type: 'file', id: 'binder-file', accept: 'image/*', capture: 'environment' });
  var out = h('div', {});
  file.addEventListener('change', function () {
    var f = file.files && file.files[0]; if (!f) return;
    out.textContent = ''; out.appendChild(h('p', { class: 'muted', text: 'Claude liest die Seite …' }));
    AI.fn.json(Prompts.binder(), { images: [f], modelTier: 'default', cache: false }).then(function (arr) {
      arr = (Array.isArray(arr) ? arr : []).filter(function (x) { return x && x.de && x.ru; });
      out.textContent = '';
      if (!arr.length) return out.appendChild(h('p', { text: 'Keine Begriffe erkannt. Bitte ein schärferes Foto versuchen.' }));
      var pl = pickList(arr, function (x) { return [h('p', { class: 'doc' }, x.art ? h('span', { class: 'art ' + artClass(x.art), text: x.art + ' ' }) : null, x.de), h('p', { class: 'ru small', text: x.ru })]; });
      out.appendChild(pl.el);
      out.appendChild(h('button', {
        class: 'btn primary', type: 'button', text: 'In „Neue Wörter“ aufnehmen', onclick: function (ev) {
          var cu = Store.get('custom'); cu.items = cu.items || {}; cu.queue = cu.queue || [];
          pl.picked().forEach(function (x) {
            var id = 'c-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
            cu.items[id] = { type: 'cust', kind: x.art ? 'noun' : 'chunk', de: x.de, art: x.art || '', pl: x.pl || '', ru: x.ru, ex: x.ex || '', exRu: x.exRu || '' };
            cu.queue.push(id);
          });
          Store.save('custom'); ev.target.disabled = true; ev.target.textContent = 'Aufgenommen';
        }
      }));
    }).catch(function (e) { out.textContent = ''; out.appendChild(h('p', { text: e && e.code === 'images_unavailable' ? 'Bilder sind in dieser Ansicht nicht verfügbar.' : (AI.msg(e) || 'Abgebrochen.') })); });
  });
  binder.appendChild(AI.ready() ? h('label', { class: 'btn', for: 'binder-file' }, 'Foto aufnehmen oder wählen', file) : h('p', { class: 'note', text: 'Dafür braucht die App Claude.' }));
  binder.appendChild(out);
  el.appendChild(binder);

  /* Fehlerliste */
  var errs = (Store.get('errs').list || []).slice(-30).reverse();
  if (errs.length) el.appendChild(h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'Letzte Fehler' }),
    h('ul', { class: 'errlist' }, errs.map(function (e) { return h('li', {}, h('p', { class: 'doc wrongline', text: e.wrong }), h('p', { class: 'doc', text: e.right }), e.why ? h('p', { class: 'ru small', text: e.why }) : null); }))));

  /* Einstellungen */
  var sp = h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'Einstellungen' }));
  var vsel = h('select', { id: 'voice' }, h('option', { value: '', text: 'automatisch' }));
  TTS.voices.forEach(function (v) { var o = h('option', { value: v.voiceURI, text: v.name + ' (' + v.lang + ')' }); if (set.voice === v.voiceURI) o.selected = true; vsel.appendChild(o); });
  vsel.addEventListener('change', function () { set.voice = vsel.value; Store.save('settings'); TTS.speak('Guten Tag, ich bin Ihre Stimme für den Kurs.'); });
  var rate = h('input', { type: 'range', id: 'rate', min: '0.7', max: '1.2', step: '0.05', value: String(set.rate || 0.95) });
  var rateV = h('span', { class: 'muted', text: String(set.rate || 0.95) });
  rate.addEventListener('change', function () { set.rate = +rate.value; rateV.textContent = rate.value; Store.save('settings'); TTS.speak('So klingt das neue Tempo.'); });
  var tier = h('select', { id: 'tier' }, h('option', { value: 'quick', text: 'schnell (kurze Wartezeit)' }), h('option', { value: 'default', text: 'gründlich (bessere Antworten, langsamer)' }));
  tier.value = set.chatTier || 'quick';
  tier.addEventListener('change', function () { set.chatTier = tier.value; Store.save('settings'); });
  var auto = h('input', { type: 'checkbox', id: 'autotts' }); auto.checked = set.autoTts !== false;
  auto.addEventListener('change', function () { set.autoTts = auto.checked; Store.save('settings'); });
  var name = h('input', { type: 'text', id: 'pname', value: prof.name || '' });
  name.addEventListener('change', function () { prof.name = name.value.trim(); Store.save('profile'); });
  sp.appendChild(h('div', { class: 'form' },
    h('label', { for: 'pname' }, 'Name'), name,
    h('label', { for: 'voice' }, 'Stimme'), TTS.voices.length ? vsel : h('p', { class: 'muted small', text: 'Keine deutsche Stimme gefunden. Auf Android: Einstellungen → Sprachausgabe → Google, Deutsch installieren.' }),
    h('label', { for: 'rate' }, 'Sprechtempo'), h('div', { class: 'row' }, rate, rateV),
    h('label', { for: 'tier' }, 'Gesprächspartner'), tier,
    h('label', { class: 'toggle', for: 'autotts' }, auto, ' Lösungen automatisch vorlesen')));
  el.appendChild(sp);

  /* Daten */
  var dp = h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'Daten' }),
    h('p', { class: 'small muted', text: Store.online ? 'Fortschritt wird in Ihrem claude.ai-Konto gespeichert und ist auf Handy und PC gleich.' : 'Fortschritt wird nur auf diesem Gerät gespeichert.' }));
  var exp = h('button', { class: 'btn', type: 'button', text: 'Sicherung herunterladen' });
  exp.addEventListener('click', function () {
    var data = {}; DOCS.forEach(function (n) { data[n] = Store.get(n); });
    var json = JSON.stringify({ app: 'gutachter-deutsch', v: 1, at: Date.now(), data: data });
    (window.claude && claude.use ? claude.use('downloads') : Promise.resolve(null)).then(function (dl) {
      if (!dl) { toast('Herunterladen ist hier nicht möglich.'); return; }
      return dl.save({ filename: 'gutachter-deutsch-' + dayKey() + '.json', data: json });
    }).catch(function () { });
  });
  var imp = h('input', { type: 'file', id: 'imp', accept: 'application/json,.json' });
  imp.addEventListener('change', function () {
    var f = imp.files && imp.files[0]; if (!f) return;
    var r = new FileReader();
    r.onload = function () {
      try {
        var j = JSON.parse(r.result);
        if (j.app !== 'gutachter-deutsch') throw new Error('x');
        Object.keys(j.data).forEach(function (n) { Store.data[n] = j.data[n]; Store.save(n); });
        toast('Sicherung geladen'); App.go('heute');
      } catch (e) { toast('Diese Datei ist keine Sicherung dieser App.'); }
    };
    r.readAsText(f);
  });
  dp.appendChild(h('div', { class: 'row' }, exp, h('label', { class: 'btn ghost', for: 'imp' }, 'Sicherung laden', imp)));
  el.appendChild(dp);

  el.appendChild(h('section', { class: 'panel' }, h('h2', { class: 'sub', text: 'So funktioniert der Kurs' }),
    h('div', { class: 'ru small', html: '<p><b>Каждый день — 2 сессии по 45 минут.</b> Утром: повторение карточек, новые слова, грамматика, аудирование. Вечером: устный перевод, разговор с Claude, беглость 4/3/2, итоги.</p><p><b>Карточки</b> планируются по алгоритму FSRS: ответили легко — карточка вернётся позже, ошиблись — сегодня же. Отвечайте вслух, потом честно оценивайте.</p><p><b>Голосовой ввод</b>: на телефоне — микрофон на клавиатуре (Gboard), на Windows — Win + H. Распознавание речи иногда «исправляет» окончания, поэтому в грамматике лучше печатать.</p><p><b>Дни 1–14</b> подготовлены заранее, начиная с 15-го дня Claude готовит материалы по плану курса с учётом ваших ошибок (кнопка «Tag vorbereiten»).</p>' })));
};

/* ---------- Start ---------- */
function boot() {
  Store.load();
  var s = Store.get('settings'); if (!s.mode) s.mode = 'speak';
  TTS.init();
  App.main = $('#main');
  document.querySelectorAll('.nav button').forEach(function (b) { b.addEventListener('click', function () { App.go(b.dataset.v); }); });
  App.day = App.lessonDay();
  App.go('heute');
  var C = window.claude;
  if (!C || !C.use) { AI.checked = true; App.refresh(); return; }
  C.use('sample').then(function (fn) { AI.fn = fn; AI.checked = true; App.refresh(); });
  Promise.all([C.use('db'), C.use('user')]).then(function (r) {
    var db = r[0], user = r[1];
    if (!db || !user) return;
    return user.id().then(function (uid) {
      if (!uid) return;
      return Store.connect(db, uid).then(function () {
        $('#sync').classList.add('on'); $('#sync').title = 'Mit claude.ai synchronisiert';
        App.day = App.lessonDay();
        App.refresh();
      });
    });
  }).catch(function () { });
}
