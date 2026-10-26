/* Die Bausteine einer Sitzung. Jeder bekommt ctx = {b: Tagespaket, el: Container, done(), run} */

var Runners = {};

/* ---------- 1. Wiederholung ---------- */
Runners.review = function (ctx) { reviewRunner(ctx.el, ctx.done, ctx.run); };

function modeSwitch(onChange) {
  var s = Store.get('settings'), mode = s.mode || 'speak';
  var wrap = h('div', { class: 'seg', role: 'group', 'aria-label': 'Antwortmodus' });
  [['speak', 'Sprechen'], ['type', 'Schreiben']].forEach(function (m) {
    var b = h('button', { type: 'button', class: mode === m[0] ? 'on' : '', text: m[1], 'aria-pressed': mode === m[0] ? 'true' : 'false' });
    b.addEventListener('click', function () {
      s.mode = m[0]; Store.save('settings');
      Array.prototype.forEach.call(wrap.children, function (x) { x.classList.remove('on'); x.setAttribute('aria-pressed', 'false'); });
      b.classList.add('on'); b.setAttribute('aria-pressed', 'true');
      onChange(m[0]);
    });
    wrap.appendChild(b);
  });
  return wrap;
}

function reviewRunner(el, done, run) {
  var ids = Cards.due().slice(0, 200);
  var stage = h('div', { class: 'stage' });
  var counter = h('p', { class: 'counter' });
  var cur = null, n = 0;
  el.appendChild(h('div', { class: 'toolbar' }, counter, modeSwitch(function () { if (cur) show(cur); })));
  el.appendChild(stage);
  stage.appendChild(h('p', { class: 'muted', text: 'Karten werden geladen …' }));

  var need = Cards.needDays(ids);
  Promise.all(need.map(function (d) { return Content.loadGen(d); })).then(function () {
    ids = ids.filter(function (id) { return !!Cards.get(id); });
    if (!ids.length) return empty();
    next();
  });

  function empty() {
    stage.textContent = '';
    var all = Object.keys(Cards.srs());
    stage.appendChild(h('div', { class: 'empty' },
      h('p', { class: 'big', text: all.length ? 'Alles wiederholt. Keine Karte ist fällig.' : 'Noch keine Karten. Sie entstehen im Block „Neue Wörter“.' }),
      all.length ? h('button', {
        class: 'btn', type: 'button', text: 'Extra-Runde: die 20 schwierigsten Karten', onclick: function () {
          var c = Cards.srs();
          ids = all.filter(function (id) { return Cards.get(id); }).sort(function (a, b) { return (c[a].s || 0) - (c[b].s || 0); }).slice(0, 20);
          next();
        }
      }) : null,
      h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: done })));
  }
  function next() {
    if (!ids.length) {
      cur = null;
      stage.textContent = '';
      stage.appendChild(h('div', { class: 'empty' }, h('p', { class: 'big', text: 'Geschafft: ' + n + ' Karten wiederholt.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: done })));
      counter.textContent = '';
      return;
    }
    cur = ids.shift();
    show(cur);
  }
  function show(id) {
    counter.textContent = n + ' erledigt · ' + (ids.length + 1) + ' offen';
    stage.textContent = '';
    var card = Cards.get(id);
    stage.appendChild(reviewCard(id, card, Store.get('settings').mode || 'speak', function (g) {
      Cards.grade(id, g); n++;
      if (run) run.stat(g >= 3);
      if (g === 1) ids.splice(Math.min(4, ids.length), 0, id);
      next();
    }));
  }
}

/* ---------- 2. Neue Wörter ---------- */
Runners.new = function (ctx) {
  var srs = Cards.srs();
  var items = ctx.b.vocab.filter(function (v) { return !srs[v.id]; });
  var cust = Store.get('custom'); cust.queue = cust.queue || [];
  var extra = cust.queue.slice(0, 8).map(function (id) { return Cards.get(id); }).filter(Boolean);
  items = items.concat(extra);
  var el = ctx.el;
  if (!items.length) {
    el.appendChild(h('div', { class: 'empty' }, h('p', { class: 'big', text: 'Die Wörter dieses Tages sind schon in Ihren Karten.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done })));
    return;
  }
  var batches = [];
  for (var i = 0; i < items.length; i += 6) batches.push(items.slice(i, i + 6));
  var bi = 0, stage = h('div', { class: 'stage' }), counter = h('p', { class: 'counter' });
  el.appendChild(h('div', { class: 'toolbar' }, counter));
  el.appendChild(stage);
  intro(0);

  function intro(k) {
    var batch = batches[bi];
    counter.textContent = 'Gruppe ' + (bi + 1) + ' von ' + batches.length + ' · Wort ' + (k + 1) + ' von ' + batch.length;
    stage.textContent = '';
    var c = batch[k];
    stage.appendChild(h('p', { class: 'hint', text: 'Hören, laut nachsprechen, das Beispiel einmal laut lesen.' }));
    stage.appendChild(wordCard(c));
    if (Store.get('settings').autoTts !== false) setTimeout(function () { TTS.speak(Cards.label(c)); }, 120);
    stage.appendChild(h('div', { class: 'row' },
      k > 0 ? h('button', { class: 'btn ghost', type: 'button', text: 'Zurück', onclick: function () { intro(k - 1); } }) : null,
      h('button', { class: 'btn primary', type: 'button', text: k < batch.length - 1 ? 'Nächstes Wort' : 'Jetzt abfragen', onclick: function () { if (k < batch.length - 1) intro(k + 1); else quiz(shuffle(batch), 0); } })));
  }
  function quiz(list, k) {
    if (k >= list.length) {
      bi++;
      if (bi < batches.length) return intro(0);
      stage.textContent = '';
      stage.appendChild(h('div', { class: 'empty' }, h('p', { class: 'big', text: items.length + ' neue Karten aufgenommen. Morgen kommen sie in der Wiederholung.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done })));
      return;
    }
    counter.textContent = 'Abfrage · ' + (k + 1) + ' von ' + list.length;
    var c = list[k];
    stage.textContent = '';
    var wrap = h('div', { class: 'rcard' });
    wrap.appendChild(h('p', { class: 'eyebrow', text: c.art ? 'Auf Deutsch, mit Artikel' : 'Auf Deutsch' }));
    wrap.appendChild(h('p', { class: 'ru big', text: c.ru }));
    var res = h('div', { class: 'result' });
    var show = h('button', { class: 'btn primary', type: 'button', text: 'Laut gesagt – Lösung zeigen' });
    show.addEventListener('click', function () {
      show.remove();
      res.appendChild(wordHead(c));
      TTS.speak(Cards.label(c));
      res.appendChild(gradeRow(null, function (g) {
        Cards.learn(c.id, g);
        var cq = Store.get('custom'); cq.queue = cq.queue || [];
        var q = cq.queue.indexOf(c.id);
        if (q >= 0) { cq.queue.splice(q, 1); Store.save('custom'); }
        if (ctx.run) ctx.run.stat(g >= 3);
        quiz(list, k + 1);
      }, 3));
    });
    wrap.appendChild(show); wrap.appendChild(res);
    stage.appendChild(wrap);
  }
};

/* ---------- 3. Grammatik ---------- */
Runners.grammar = function (ctx) {
  var u = ctx.b.grammar;
  if (!u) return Runners.mix(ctx);
  drillRunner(ctx, u, u.drills.slice(), { rule: true });
};
Runners.diag = function (ctx) {
  var u = D.grammar && D.grammar['g-diag'];
  if (!u) return ctx.el.appendChild(h('p', { text: 'Einstufungstest fehlt.' }));
  drillRunner(ctx, u, u.drills.slice(), { diag: true, intro: u.rule });
};
Runners.mix = function (ctx) {
  var units = ctx.b.mix && ctx.b.mix.length ? ctx.b.mix : (ctx.b.grammar ? [ctx.b.grammar] : []);
  if (!units.length) {
    ctx.el.appendChild(h('div', { class: 'empty' }, h('p', { text: 'Für diese Woche gibt es noch keine Grammatik zum Mischen.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done })));
    return;
  }
  var g = Store.get('prog').g || {};
  var pool = [];
  units.forEach(function (u) {
    var st = g[u.id] || [0, 0], acc = st[1] ? st[0] / st[1] : 0.5;
    var take = Math.round(3 + (1 - acc) * 5);
    shuffle(u.drills).slice(0, take).forEach(function (x) { pool.push(Object.assign({ _u: u.id, _ude: u.de }, x)); });
  });
  drillRunner(ctx, { id: 'mix', de: 'Grammatik gemischt', drills: [] }, shuffle(pool).slice(0, 22), { mix: true });
};

function drillTask(x) {
  var lab = { gap: 'Lücke füllen', choice: 'Richtige Form wählen', transform: x.i || 'Umformen', order: 'Satz bauen', translate: 'Übersetzen', fix: 'Fehler korrigieren' }[x.t] || 'Aufgabe';
  return lab + ': ' + x.q;
}

function drillRunner(ctx, u, list, opt) {
  var el = ctx.el, stage = h('div', { class: 'stage' }), counter = h('p', { class: 'counter' });
  var right = 0, total = 0, tagStats = {}, retried = {};
  el.appendChild(h('div', { class: 'toolbar' }, counter));
  if (opt.rule && u.rule) {
    var det = h('details', { class: 'rule' }, h('summary', {}, h('b', { text: u.de }), h('span', { class: 'ru small', text: ' · ' + (u.ru || '') })),
      h('div', { class: 'rulebody', html: u.rule }),
      u.examples && u.examples.length ? h('ul', { class: 'examples' }, u.examples.map(function (e) { return h('li', {}, h('p', { class: 'doc', text: e.de }), h('p', { class: 'ru small', text: e.ru }), speakBtn(e.de)); })) : null);
    var seen = Store.get('prog').seenRule || {};
    if (!seen[u.id]) det.open = true;
    det.addEventListener('toggle', function () { var p = Store.get('prog'); p.seenRule = p.seenRule || {}; p.seenRule[u.id] = 1; Store.save('prog'); });
    el.appendChild(det);
  }
  if (opt.intro) el.appendChild(h('div', { class: 'rulebody', html: opt.intro }));
  el.appendChild(stage);
  var queue = list.slice(), i = 0;
  next();

  function next() {
    if (!queue.length) return finish();
    var x = queue.shift();
    i++;
    counter.textContent = 'Übung ' + i + ' · noch ' + queue.length + (total ? ' · ' + Math.round(100 * right / total) + ' % richtig' : '');
    stage.textContent = '';
    stage.appendChild(renderDrill(x, function (ok, user) {
      total++; if (ok) right++;
      if (ctx.run) ctx.run.stat(ok);
      if (opt.diag && x.tag) { tagStats[x.tag] = tagStats[x.tag] || [0, 0]; tagStats[x.tag][1]++; if (ok) tagStats[x.tag][0]++; }
      var uid = x._u || u.id;
      var p = Store.get('prog'); p.g = p.g || {}; p.g[uid] = p.g[uid] || [0, 0]; p.g[uid][1]++; if (ok) p.g[uid][0]++; Store.save('prog');
      if (!ok) {
        if (ctx.run) ctx.run.miss({ t: x.t, i: drillTask(x).split(': ')[0], q: x.q, a: x.a, user: user, cat: catOf(uid) });
        var key = x.q;
        if (!retried[key] && !opt.diag) { retried[key] = 1; queue.splice(Math.min(3, queue.length), 0, x); }
        /* Claude hat eine abweichende Lösung als richtig bestätigt: Wertung zurücknehmen */
        return function undo() {
          right++;
          var pp = Store.get('prog'); if (pp.g && pp.g[uid]) { pp.g[uid][0]++; Store.save('prog'); }
          if (ctx.run && ctx.run.unmiss) ctx.run.unmiss(x.q);
          var qi = queue.indexOf(x); if (qi >= 0) queue.splice(qi, 1);
        };
      }
    }, next));
  }
  function finish() {
    stage.textContent = '';
    var box = h('div', { class: 'empty' }, h('p', { class: 'big', text: right + ' von ' + total + ' richtig' }));
    if (opt.diag) {
      var p = Store.get('prog'); p.diag = tagStats; Store.save('prog');
      box.appendChild(diagTable(tagStats));
    }
    if (!opt.diag && AI.ready() && u.drills && u.drills.length) {
      var more = h('button', { class: 'btn', type: 'button', text: '8 weitere Übungen von Claude' });
      more.addEventListener('click', function () {
        more.disabled = true; more.textContent = 'Claude erstellt Übungen …';
        AI.json(Prompts.moreDrills(u, 8), { modelTier: 'default', cache: false }).then(function (arr) {
          arr = (Array.isArray(arr) ? arr : []).filter(function (x) { return x && x.t && x.q && Array.isArray(x.a) && x.a.length; });
          if (!arr.length) throw { code: 'invalid_json' };
          queue = arr; next();
        }).catch(function (e) { more.disabled = false; more.textContent = '8 weitere Übungen von Claude'; var m = AI.msg(e); if (m) toast(m); });
      });
      box.appendChild(more);
    }
    box.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done }));
    stage.appendChild(box);
  }
}

function catOf(uid) {
  return { 'g-tempus': 'tempus', 'g-kausal': 'verbstellung', 'g-nebensatz': 'verbstellung', 'g-praep': 'praep', 'g-adj': 'adj', 'g-relativ': 'kasus', 'g-passiv': 'tempus', 'g-zustand': 'tempus', 'g-gegensatz': 'verbstellung', 'g-zahlen': 'andere', 'g-konj2': 'konj' }[uid] || 'andere';
}

var TAGS = { tempus: 'Zeitformen', adj: 'Adjektivendungen', kasus: 'Kasus', praep: 'Präpositionen', nebensatz: 'Nebensätze', passiv: 'Passiv', konj2: 'Konjunktiv II', relativ: 'Relativsätze', rektion: 'Rektion', zahlen: 'Zahlen', wortstellung: 'Wortstellung', ndekl: 'N-Deklination' };
function diagTable(st) {
  var rows = Object.keys(st).sort(function (a, b) { return st[a][0] / st[a][1] - st[b][0] / st[b][1]; });
  return h('table', { class: 'tbl' }, h('tr', {}, h('th', { text: 'Thema' }), h('th', { text: 'Richtig' })),
    rows.map(function (k) { var r = st[k]; return h('tr', { class: r[0] < r[1] ? 'weak' : '' }, h('td', { text: TAGS[k] || k }), h('td', { text: r[0] + ' / ' + r[1] })); }));
}

/* Eine Übung darstellen. report(ok, user) einmal; next() zum Weitergehen */
function renderDrill(x, report, next) {
  var wrap = h('div', { class: 'rcard drill' });
  var lab = drillTask(x).split(': ')[0];
  wrap.appendChild(h('p', { class: 'eyebrow', text: lab + (x._ude ? ' · ' + x._ude : '') }));
  var res = h('div', { class: 'result' });
  var reported = false, undo = null;
  function done(ok, user, r) {
    if (reported) return; reported = true;
    undo = report(ok, user);
    if (r) res.appendChild(verdict(r, user));
    if (x.t === 'translate' || x.t === 'transform' || x.t === 'fix') res.appendChild(h('p', { class: 'doc', text: x.a[0] }));
    var full = (x.t === 'gap' || x.t === 'choice' ? x.q.replace('___', x.a[0]) : x.a[0]).replace(/\s*\([^)]*\)/g, '');
    if (Store.get('settings').autoTts !== false) TTS.speak(full);
    if (x.h && !ok) res.appendChild(h('p', { class: 'ru small', text: x.h }));
    var row = h('div', { class: 'row' }, speakBtn(full));
    if (!ok && AI.ready()) {
      var ex = h('button', { class: 'btn ghost', type: 'button', text: 'Erklären (Claude)' });
      ex.addEventListener('click', function () {
        ex.disabled = true; ex.textContent = 'Claude erklärt …';
        AI.text(Prompts.explainDrill(drillTask(x), x.a[0], user), { modelTier: 'quick' }).then(function (t) { ex.replaceWith(h('p', { class: 'ru small expl', text: t })); })
          .catch(function (e) { ex.disabled = false; ex.textContent = 'Erklären (Claude)'; var m = AI.msg(e); if (m) toast(m); });
      });
      row.appendChild(ex);
    }
    var nb = h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: next });
    row.appendChild(nb);
    res.appendChild(row);
    if (!ok && (x.t === 'translate' || x.t === 'transform') && AI.ready() && user) res.appendChild(aiCheckBtn(drillTask(x), x.a, user, function (good) { if (good && undo) { undo(); undo = null; toast('Als richtig gewertet'); } }));
    setTimeout(function () { nb.focus(); }, 50);
  }

  if (x.t === 'choice') {
    wrap.appendChild(h('p', { class: 'doc big', html: esc(x.q).replace('___', '<span class="gap">___</span>') }));
    var ch = h('div', { class: 'choices' });
    shuffle(x.o).forEach(function (o) {
      var b = h('button', { class: 'choice', type: 'button', text: o });
      b.addEventListener('click', function () {
        var ok = x.a.indexOf(o) >= 0;
        Array.prototype.forEach.call(ch.children, function (c) { c.disabled = true; if (x.a.indexOf(c.textContent) >= 0) c.classList.add('right'); });
        if (!ok) b.classList.add('wrong');
        done(ok, o, ok ? { res: 'ok', best: o } : { res: 'wrong', best: x.a[0] });
      });
      ch.appendChild(b);
    });
    wrap.appendChild(ch);
  } else if (x.t === 'order') {
    var chunks = shuffle(x.q.split(/\s*\/\s*/)), built = [];
    var line = h('div', { class: 'built', 'aria-live': 'polite' }), pool = h('div', { class: 'chips' });
    function draw() {
      line.textContent = ''; pool.textContent = '';
      built.forEach(function (c, k) { line.appendChild(h('button', { class: 'chip on', type: 'button', text: c, onclick: function () { if (!reported) { built.splice(k, 1); draw(); } } })); });
      var left = chunks.slice(); built.forEach(function (c) { left.splice(left.indexOf(c), 1); });
      left.forEach(function (c) { pool.appendChild(h('button', { class: 'chip', type: 'button', text: c, onclick: function () { if (!reported) { built.push(c); draw(); } } })); });
    }
    draw();
    wrap.appendChild(line); wrap.appendChild(pool);
    var ck = h('button', { class: 'btn primary', type: 'button', text: 'Prüfen' });
    ck.addEventListener('click', function () {
      var user = built.join(' '); var r = checkAnswer(user, x.a);
      ck.remove(); done(r.res !== 'wrong', user, r);
    });
    wrap.appendChild(ck);
  } else {
    var qText = x.t === 'gap' ? h('p', { class: 'doc big', html: esc(x.q).replace('___', '<span class="gap">___</span>') })
      : h('p', { class: (x.t === 'translate' ? 'ru' : 'doc') + ' big', text: x.q });
    if (x.t === 'transform' && x.i) wrap.appendChild(h('p', { class: 'instr', text: x.i }));
    wrap.appendChild(qText);
    var ta = answerBox({ rows: x.t === 'gap' ? 1 : 2, value: x.t === 'fix' ? x.q : '', ph: x.t === 'gap' ? 'Lücke …' : 'Ihre Antwort …', onEnter: function () { ck2.click(); } });
    var ck2 = h('button', { class: 'btn primary', type: 'button', text: 'Prüfen' });
    ck2.addEventListener('click', function () {
      var user = ta.value.trim();
      var r = checkAnswer(user, x.a);
      if (x.t === 'fix' && normA(user) === normA(x.q)) r = { res: 'wrong', best: x.a[0] };
      ck2.remove(); ta.readOnly = true;
      done(r.res !== 'wrong', user, r);
    });
    var skip = h('button', { class: 'btn ghost', type: 'button', text: 'Weiß ich nicht', onclick: function () { ta.readOnly = true; ck2.remove(); skip.remove(); done(false, '', { res: 'wrong', best: x.a[0] }); } });
    wrap.appendChild(ta);
    if (x.t !== 'gap') wrap.appendChild(dictHint());
    wrap.appendChild(h('div', { class: 'row' }, skip, ck2));
  }
  wrap.appendChild(res);
  return wrap;
}

/* ---------- 4. Hören und Lesen ---------- */
Runners.text = function (ctx) {
  var t = ctx.b.text, el = ctx.el;
  if (!t) { el.appendChild(h('div', { class: 'empty' }, h('p', { text: 'Kein Text für heute.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done }))); return; }
  var steps = ['Hören', 'Fragen', 'Lesen', 'Nacherzählen'], si = 0;
  var tabs = h('div', { class: 'steps' }), stage = h('div', { class: 'stage' });
  el.appendChild(h('p', { class: 'eyebrow', text: t.kind || 'Text' }));
  el.appendChild(h('h3', { class: 'doc-title', text: t.title }));
  el.appendChild(tabs); el.appendChild(stage);
  var rate = 0.9;
  function drawTabs() {
    tabs.textContent = '';
    steps.forEach(function (s, k) { tabs.appendChild(h('button', { type: 'button', class: k === si ? 'on' : '', text: (k + 1) + '. ' + s, onclick: function () { si = k; go(); } })); });
  }
  function player() {
    var playing = false;
    var b = h('button', { class: 'btn primary', type: 'button' }, icon('speak', 'sm'), ' Text anhören');
    b.addEventListener('click', function () {
      if (playing) { TTS.stop(); playing = false; b.lastChild.textContent = ' Text anhören'; return; }
      playing = true; b.lastChild.textContent = ' Stopp';
      TTS.speak(t.de.replace(/\n+/g, ' '), { rate: rate, onend: function () { playing = false; b.lastChild.textContent = ' Text anhören'; } });
    });
    var sel = h('select', { id: 'rate-sel', 'aria-label': 'Tempo' }, [['0.8', 'langsam'], ['0.9', 'normal'], ['1.05', 'schnell']].map(function (r) { var o = h('option', { value: r[0], text: r[1] }); if (+r[0] === rate) o.selected = true; return o; }));
    sel.addEventListener('change', function () { rate = +sel.value; });
    return h('div', { class: 'row' }, b, h('label', { class: 'inline', for: 'rate-sel' }, 'Tempo ', sel));
  }
  function go() {
    drawTabs(); stage.textContent = ''; TTS.stop();
    if (si === 0) {
      stage.appendChild(h('p', { class: 'hint', text: 'Zuerst nur hören, ohne Text. Worum geht es? Wer, was, wo, welche Zahlen?' }));
      if (!TTS.ok) stage.appendChild(h('p', { class: 'note', text: 'Dieser Browser kann nicht vorlesen. Lesen Sie den Text einmal schnell und gehen Sie zu den Fragen.' }));
      stage.appendChild(player());
      stage.appendChild(h('button', { class: 'btn', type: 'button', text: 'Weiter zu den Fragen', onclick: function () { si = 1; go(); } }));
    } else if (si === 1) {
      var ok = 0, n = 0;
      (t.q || []).forEach(function (q, qi) {
        var box = h('div', { class: 'mcq' }, h('p', { class: 'doc', text: (qi + 1) + '. ' + q.q }));
        var ch = h('div', { class: 'choices' });
        q.o.forEach(function (o, k) {
          var b = h('button', { class: 'choice', type: 'button', text: o });
          b.addEventListener('click', function () {
            Array.prototype.forEach.call(ch.children, function (c, j) { c.disabled = true; if (j === q.a) c.classList.add('right'); });
            n++; if (k === q.a) ok++; else b.classList.add('wrong');
            box.appendChild(h('p', { class: 'verdict ' + (k === q.a ? 'ok' : 'wrong'), role: 'status', text: k === q.a ? 'Richtig' : 'Falsch. Richtig ist: ' + q.o[q.a] }));
            if (ctx.run) ctx.run.stat(k === q.a);
          });
          ch.appendChild(b);
        });
        box.appendChild(ch); stage.appendChild(box);
      });
      stage.appendChild(h('button', { class: 'btn', type: 'button', text: 'Weiter zum Text', onclick: function () { si = 2; go(); } }));
    } else if (si === 2) {
      stage.appendChild(player());
      t.de.split(/\n\n+/).forEach(function (para) { stage.appendChild(h('div', { class: 'para' }, h('p', { class: 'doc', text: para }), speakBtn(para))); });
      if (t.ru) stage.appendChild(h('p', { class: 'ru small', text: t.ru }));
      if (t.gl && t.gl.length) stage.appendChild(h('dl', { class: 'gloss' }, t.gl.map(function (g) { return [h('dt', { text: g.de }), h('dd', { text: g.ru })]; })));
      stage.appendChild(h('button', { class: 'btn', type: 'button', text: 'Weiter zum Nacherzählen', onclick: function () { si = 3; go(); } }));
    } else {
      stage.appendChild(h('p', { class: 'instr', text: t.retell || 'Erzählen Sie den Text mit eigenen Worten nach.' }));
      stage.appendChild(h('p', { class: 'hint', text: 'Zuerst laut erzählen (1–2 Minuten). Danach diktieren und von Claude prüfen lassen.' }));
      var ta = answerBox({ rows: 5, ph: 'Nacherzählung …', focus: false });
      stage.appendChild(ta); stage.appendChild(dictHint());
      var row = h('div', { class: 'row' });
      if (AI.ready()) {
        var ck = h('button', { class: 'btn', type: 'button', text: 'Von Claude prüfen lassen' });
        ck.addEventListener('click', function () {
          if (ta.value.trim().length < 20) { toast('Bitte etwas ausführlicher erzählen.'); return; }
          ck.disabled = true;
          stage.insertBefore(feedbackPanel(Prompts.retell(t.de, ta.value), { src: 'text' }), row);
        });
        row.appendChild(ck);
      }
      row.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Block beenden', onclick: ctx.done }));
      stage.appendChild(row);
    }
  }
  go();
};

/* ---------- 5. Sprech-Drill ---------- */
Runners.drill = function (ctx) {
  var b = ctx.b, items = [];
  if (b.grammar && b.grammar.speak) items = b.grammar.speak.map(function (s, i) { return { id: b.grammar.id + '#' + i, ru: s.ru, de: s.de }; });
  else if (b.mix && b.mix.length) b.mix.forEach(function (u) { (u.speak || []).forEach(function (s, i) { items.push({ id: u.id + '#' + i, ru: s.ru, de: s.de }); }); });
  items = shuffle(items).slice(0, 12);
  b.vocab.filter(function (v) { return v.kind === 'chunk' || v.kind === 'phrase'; }).forEach(function (v) { items.push({ id: v.id, ru: v.ru, de: v.de, vocab: true }); });
  items = items.slice(0, 18);
  var el = ctx.el, stage = h('div', { class: 'stage' }), counter = h('p', { class: 'counter' }), hard = [], k = 0, t0 = 0;
  el.appendChild(h('div', { class: 'toolbar' }, counter));
  el.appendChild(h('p', { class: 'hint', text: 'So schnell wie möglich laut auf Deutsch sagen. Dann aufdecken, anhören, einmal korrekt nachsprechen.' }));
  el.appendChild(stage);
  var list = items.slice();
  show();
  function show() {
    if (k >= list.length) {
      if (hard.length) { list = hard; hard = []; k = 0; toast('Noch einmal die schwierigen Sätze'); }
      else {
        stage.textContent = '';
        stage.appendChild(h('div', { class: 'empty' }, h('p', { class: 'big', text: 'Sprech-Drill geschafft.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done })));
        counter.textContent = '';
        return;
      }
    }
    var it = list[k]; t0 = Date.now();
    counter.textContent = 'Satz ' + (k + 1) + ' von ' + list.length;
    stage.textContent = '';
    var res = h('div', { class: 'result' });
    var showBtn = h('button', { class: 'btn primary', type: 'button', text: 'Lösung zeigen' });
    showBtn.addEventListener('click', function () {
      var sec = Math.round((Date.now() - t0) / 1000);
      showBtn.remove();
      res.appendChild(h('p', { class: 'doc big', text: it.de }));
      res.appendChild(h('p', { class: 'muted small', text: sec + ' s' }));
      TTS.speak(it.de);
      res.appendChild(h('div', { class: 'row' }, speakBtn(it.de)));
      res.appendChild(gradeRow(Cards.srs()[it.id] ? it.id : null, function (g) {
        if (Cards.srs()[it.id]) Cards.grade(it.id, g); else Cards.learn(it.id, g);
        if (ctx.run) ctx.run.stat(g >= 3);
        if (g <= 2) hard.push(it);
        k++; show();
      }, 3));
    });
    stage.appendChild(h('div', { class: 'rcard' }, h('p', { class: 'ru big', text: it.ru }), showBtn, res));
  }
};

/* ---------- 6. Gespräch ---------- */
Runners.chat = function (ctx) {
  var sc = ctx.b.scenario, el = ctx.el;
  if (!sc) { el.appendChild(h('div', { class: 'empty' }, h('p', { text: 'Kein Gespräch für heute.' }), h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done }))); return; }
  var pitch = Store.get('profile').pitch;
  var intro = scenarioIntro(sc);
  el.appendChild(intro);
  if (!AI.ready()) {
    el.appendChild(h('div', { class: 'note' }, h('p', { text: 'Claude ist in dieser Ansicht nicht verfügbar. Üben Sie trotzdem: Beantworten Sie die Leitfragen laut, je 1–2 Minuten.' }),
      h('ol', {}, (sc.steps || []).map(function (s) { return h('li', { class: 'doc', text: s }); }))));
    el.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done }));
    return;
  }
  var key = 'd' + ctx.b.d + '-' + (sc.id || 'sc');
  var hasCur = Store.get('chats').cur && Store.get('chats').cur.key === key;
  var start = h('button', { class: 'btn primary', type: 'button', text: hasCur ? 'Gespräch fortsetzen' : 'Gespräch beginnen' });
  start.addEventListener('click', function () {
    start.remove();
    var mini = h('details', { class: 'scenmini' }, h('summary', { text: sc.title + ' · Ziel und Wendungen' }));
    intro.replaceWith(mini); mini.appendChild(intro);
    el.appendChild(chatPanel(sc, { key: key, words: ctx.b.vocab.slice(0, 8).map(Cards.label), onDone: ctx.done }));
  });
  el.appendChild(start);
  if (pitch && /interview/.test(sc.kind || '')) el.appendChild(h('details', { class: 'pitchref' }, h('summary', { text: 'Meine Selbstpräsentation (zum Nachlesen)' }), h('p', { class: 'doc', text: pitch })));
};

function scenarioIntro(sc) {
  var kinds = { interview: 'Vorstellungsgespräch', roleplay: 'Rollenspiel', fach: 'Fachgespräch', tutor: 'Gespräch mit Tutor' };
  return h('div', { class: 'scen' },
    h('p', { class: 'eyebrow', text: kinds[sc.kind] || 'Gespräch' }),
    h('h3', { text: sc.title }),
    sc.ru ? h('p', { class: 'ru small', text: sc.ru }) : null,
    sc.goal ? h('p', { class: 'ru', text: sc.goal }) : null,
    sc.facts ? h('div', { class: 'facts' }, h('p', { class: 'eyebrow', text: 'Daten' }), h('p', { class: 'doc', text: sc.facts })) : null,
    sc.use && sc.use.length ? h('div', {}, h('p', { class: 'eyebrow', text: 'Versuchen Sie diese Wendungen' }),
      h('div', { class: 'chips' }, sc.use.map(function (u) { return h('button', { class: 'chip', type: 'button', text: u, onclick: function () { TTS.speak(u); } }); }))) : null);
}

/* ---------- 7. Flüssig sprechen 4/3/2 ---------- */
Runners.fluency = function (ctx) {
  var f = ctx.b.fluency, el = ctx.el;
  if (!f) { el.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: ctx.done })); return; }
  var pitch = Store.get('profile').pitch;
  var shadow = f.shadow || [];
  if (ctx.b.type === 'review' && pitch) shadow = (pitch.match(/[^.!?]+[.!?]/g) || []).map(function (s) { return s.trim(); }).filter(function (s) { return s.length > 8; }).slice(0, 10);
  el.appendChild(h('p', { class: 'eyebrow', text: 'Thema' }));
  el.appendChild(h('h3', { text: f.topic }));
  if (f.ru) el.appendChild(h('p', { class: 'ru small', text: f.ru }));
  el.appendChild(h('ul', { class: 'points' }, (f.points || []).map(function (p) { return h('li', { text: p }); })));
  el.appendChild(h('p', { class: 'hint', text: 'Dreimal dasselbe erzählen: 4 Minuten, dann 3, dann 2. Gleicher Inhalt, jedes Mal flüssiger. Nicht stoppen, nicht korrigieren.' }));

  var rounds = [240, 180, 120], r = 0, left = rounds[0], tmr = null, endAt = 0;
  var big = h('p', { class: 'timer', text: '4:00' });
  var lab = h('p', { class: 'counter', text: 'Runde 1 von 3' });
  var go = h('button', { class: 'btn primary', type: 'button', text: 'Start' });
  var model = h('details', { class: 'model' }, h('summary', { text: 'Mustertext (nach Runde 1 anhören)' }), h('p', { class: 'doc', text: f.model || '' }), speakBtn(f.model || ''));
  var after = h('div', {});
  go.addEventListener('click', function () {
    if (tmr) { clearInterval(tmr); tmr = null; go.textContent = 'Weiter'; return; }
    go.textContent = 'Pause';
    endAt = Date.now() + left * 1000;
    tmr = setInterval(function () {
      /* Block verlassen: Zeitgeber anhalten */
      if (!big.isConnected) { clearInterval(tmr); tmr = null; return; }
      /* freies Sprechen ohne Berühren zählt als aktive Lernzeit */
      Clock.act = Date.now();
      left = Math.max(0, Math.round((endAt - Date.now()) / 1000));
      big.textContent = Math.floor(left / 60) + ':' + pad2(left % 60);
      if (left <= 0) {
        clearInterval(tmr); tmr = null; Beep.play(880, 350);
        r++;
        if (r < 3) {
          left = rounds[r]; big.textContent = Math.floor(left / 60) + ':00'; lab.textContent = 'Runde ' + (r + 1) + ' von 3'; go.textContent = 'Start';
          if (r === 1) model.open = true;
        } else { go.remove(); big.textContent = 'Fertig'; lab.textContent = 'Drei Runden geschafft'; finale(); }
      }
    }, 1000);
  });
  var skip = h('button', { class: 'btn ghost', type: 'button', text: 'Runde überspringen', onclick: function () { left = 0; endAt = Date.now(); if (!tmr) go.click(); } });
  el.appendChild(h('div', { class: 'timerbox' }, lab, big, h('div', { class: 'row' }, go, skip)));
  el.appendChild(model);
  el.appendChild(after);

  function finale() {
    if (AI.ready()) {
      after.appendChild(h('p', { class: 'hint', text: 'Optional: Diktieren Sie Ihre 2-Minuten-Fassung und lassen Sie sie prüfen.' }));
      var ta = answerBox({ rows: 5, focus: false, ph: 'Ihre Fassung …' });
      var ck = h('button', { class: 'btn', type: 'button', text: 'Von Claude prüfen lassen' });
      ck.addEventListener('click', function () { if (ta.value.trim().length < 30) { toast('Bitte etwas länger.'); return; } ck.disabled = true; after.insertBefore(feedbackPanel(Prompts.monologue(f.topic, ta.value), { src: 'monolog' }), shadowBox); });
      after.appendChild(ta); after.appendChild(dictHint()); after.appendChild(ck);
    }
    var shadowBox = shadowing(shadow, ctx.done);
    after.appendChild(shadowBox);
  }
};

function shadowing(list, done) {
  var box = h('div', { class: 'shadow' }, h('h4', { text: 'Nachsprechen (Shadowing)' }), h('p', { class: 'hint', text: 'Satz anhören und sofort mitsprechen oder direkt danach wiederholen. Auf Betonung und Endungen achten.' }));
  var ul = h('ol', { class: 'shadowlist' });
  list.forEach(function (s, i) { ul.appendChild(h('li', { id: 'sh' + i }, h('p', { class: 'doc', text: s }), speakBtn(s))); });
  var running = false;
  var all = h('button', { class: 'btn', type: 'button', text: 'Alle nacheinander mit Pausen' });
  all.addEventListener('click', function () {
    if (running) { running = false; TTS.stop(); all.textContent = 'Alle nacheinander mit Pausen'; return; }
    running = true; all.textContent = 'Stopp';
    var i = 0;
    (function step() {
      if (!running || i >= list.length) { running = false; all.textContent = 'Alle nacheinander mit Pausen'; return; }
      Array.prototype.forEach.call(ul.children, function (li, k) { li.classList.toggle('on', k === i); });
      var s = list[i];
      TTS.speak(s, { rate: 0.9, onend: function () { setTimeout(function () { i++; step(); }, 1200 + s.length * 75); } });
    })();
  });
  box.appendChild(all); box.appendChild(ul);
  if (done) box.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Block beenden', onclick: function () { running = false; TTS.stop(); done(); } }));
  return box;
}

/* ---------- 8. Abschluss ---------- */
Runners.wrap = function (ctx) {
  var el = ctx.el, p = Store.get('prog'), k = dayKey();
  var min = Math.round((p.min || {})[k] || 0);
  el.appendChild(h('div', { class: 'stats' },
    stat(min + ' Min', 'heute gelernt'),
    stat(((p.rev || {})[k] || 0), 'Karten wiederholt'),
    stat(Cards.dueToday(), 'heute noch fällig')));
  var misses = (p.misses || []).filter(function (m) { return m.day === ctx.b.d; });
  if (misses.length) {
    el.appendChild(h('h4', { text: 'Heutige Fehler aus den Übungen → als Karten' }));
    var pl = pickList(misses, function (m) { return [h('p', { class: (m.t === 'translate' ? 'ru' : 'doc'), text: m.q }), h('p', { class: 'doc', text: m.a[0] }), m.user ? h('p', { class: 'muted small', text: 'Ihre Antwort: ' + m.user }) : null]; });
    el.appendChild(pl.el);
    el.appendChild(h('button', {
      class: 'btn', type: 'button', text: 'Ausgewählte übernehmen', onclick: function (ev) {
        var chosen = pl.picked();
        chosen.forEach(function (m) { Cards.addX('task', { t: m.t, i: m.i, q: m.q, a: m.a }); });
        logErrors(chosen.map(function (m) { return { wrong: m.user || '–', right: m.a[0], why: m.i, cat: m.cat }; }), 'drill');
        var pp = Store.get('prog'); pp.mdone = pp.mdone || {}; pp.mdone[ctx.b.d] = Date.now();
        pp.misses = (pp.misses || []).filter(function (m) { return m.day !== ctx.b.d; }); Store.save('prog');
        ev.target.disabled = true; ev.target.textContent = chosen.length + ' Karten aufgenommen';
      }
    }));
  } else el.appendChild(h('p', { class: 'muted', text: 'Keine offenen Übungsfehler von heute.' }));
  var nd = ctx.b.d + 1, nm = Content.meta(nd);
  if (nm && !nm.fixed && AI.ready()) {
    var genBox = h('div', { class: 'note' });
    Content.loadGen(nd).then(function (g) {
      if (g) return;
      genBox.appendChild(h('p', { text: 'Tipp: Inhalte für morgen schon jetzt vorbereiten lassen (dauert 1–3 Minuten).' }));
      genBox.appendChild(h('button', { class: 'btn', type: 'button', text: 'Tag ' + nd + ' vorbereiten', onclick: function (ev) { ev.target.disabled = true; Gen.make(nd, genBox); } }));
    });
    el.appendChild(genBox);
  }
  el.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Tag abschließen', onclick: ctx.done }));
};
function stat(v, l) { return h('div', { class: 'stat' }, h('b', { text: String(v) }), h('span', { text: l })); }

/* ---------- Tagesinhalte erzeugen (ab Tag 15) ---------- */
/* Antworten von Claude prüfen und bereinigen; null = Teil unbrauchbar */
var GenCheck = {
  arr: function (x, key) { return Array.isArray(x) ? x : x && Array.isArray(x[key]) ? x[key] : Array.isArray(x && x.items) ? x.items : null; },
  strs: function (a) { return Array.isArray(a) ? a.filter(function (x) { return typeof x === 'string' && x.trim(); }) : []; },
  vocab: function (r) {
    var list = (this.arr(r, 'vocab') || []).filter(function (v) { return v && typeof v.de === 'string' && v.de.trim() && typeof v.ru === 'string' && v.ru.trim(); }).map(function (v) {
      if (typeof v.ex !== 'string') delete v.ex;
      if (!v.ex || typeof v.cloze !== 'string' || typeof v.ans !== 'string' || v.cloze.split('___').length !== 2 || v.cloze.replace('___', v.ans) !== v.ex) { delete v.cloze; delete v.ans; }
      if (v.art && !/^(der|die|das)$/.test(v.art)) delete v.art;
      if (Array.isArray(v.col)) v.col = GenCheck.strs(v.col); else delete v.col;
      return v;
    });
    return list.length >= 10 ? list : null;
  },
  drill: function (x) {
    if (!x || typeof x.q !== 'string' || !x.q.trim() || ['gap', 'choice', 'transform', 'translate', 'fix', 'order'].indexOf(x.t) < 0) return false;
    x.a = GenCheck.strs(x.a); if (!x.a.length) return false;
    if ((x.t === 'gap' || x.t === 'choice') && x.q.split('___').length !== 2) return false;
    if (x.t === 'choice') { x.o = GenCheck.strs(x.o); if (x.o.length < 2 || x.o.indexOf(x.a[0]) < 0) return false; }
    return true;
  },
  grammar: function (r) {
    if (!r || typeof r !== 'object') return null;
    var g = r.grammar && r.grammar.drills ? r.grammar : r;
    g.drills = (Array.isArray(g.drills) ? g.drills : []).filter(GenCheck.drill);
    g.speak = (Array.isArray(g.speak) ? g.speak : []).filter(function (x) { return x && typeof x.ru === 'string' && typeof x.de === 'string'; });
    g.examples = (Array.isArray(g.examples) ? g.examples : []).filter(function (x) { return x && typeof x.de === 'string'; });
    if (typeof g.rule !== 'string') g.rule = '';
    if (typeof g.de !== 'string') g.de = 'Grammatik';
    return g.drills.length >= 12 ? g : null;
  },
  practice: function (r) {
    if (!r || typeof r !== 'object') return null;
    var t = r.text, sc = r.scenario, f = r.fluency;
    if (!t || typeof t.de !== 'string' || t.de.length < 200) return null;
    t.q = (Array.isArray(t.q) ? t.q : []).filter(function (q) { return q && typeof q.q === 'string' && Array.isArray(q.o) && q.o.length >= 2 && q.a === +q.a && q.a >= 0 && q.a < q.o.length; });
    t.gl = (Array.isArray(t.gl) ? t.gl : []).filter(function (g) { return g && g.de && g.ru; });
    if (!sc || typeof sc.role !== 'string' || !sc.role.trim()) return null;
    sc.steps = GenCheck.strs(sc.steps); sc.use = GenCheck.strs(sc.use);
    if (typeof sc.open !== 'string' || !sc.open.trim()) sc.open = 'Guten Tag! Schön, dass Sie da sind.';
    if (typeof sc.facts !== 'string') delete sc.facts;
    if (!f || typeof f.topic !== 'string') return null;
    f.points = GenCheck.strs(f.points); f.shadow = GenCheck.strs(f.shadow);
    if (typeof f.model !== 'string') f.model = '';
    return { text: t, scenario: sc, fluency: f, ru: typeof r.ru === 'string' ? r.ru : '' };
  }
};

var Gen = {
  running: {}, partial: {},
  /* alle schon erzeugten Tage laden, damit Claude keine Wörter doppelt liefert */
  known: function (d) {
    var ps = [];
    for (var x = 15; x < d; x++) ps.push(Content.loadGen(x));
    return Promise.all(ps).then(function () {
      var seen = {}, out = [];
      (D.vocab || []).concat.apply([], Object.keys(Content.gen).map(function (k) { return Content.gen[k].vocab || []; }))
        .forEach(function (v) { var k = String(v.de).toLowerCase(); if (!seen[k]) { seen[k] = 1; out.push(v.de); } });
      return out;
    });
  },
  make: function (d, box) {
    if (this.running[d]) return this.running[d];
    var m = Content.meta(d), o = m && m.o;
    if (!o) return Promise.resolve(null);
    var have = this.partial[d] || (this.partial[d] = {});
    var parts = { vocab: 'Wörter', grammar: 'Grammatik', practice: 'Text, Gespräch, Monolog' };
    var status = {};
    Object.keys(have).forEach(function (k) { status[k] = 'ok'; });
    var line = h('ul', { class: 'genstatus' });
    function draw() { line.textContent = ''; Object.keys(parts).forEach(function (k) { line.appendChild(h('li', { class: status[k] || '', text: parts[k] + (status[k] === 'ok' ? ' – fertig' : status[k] === 'err' ? ' – Fehler' : ' …') })); }); }
    if (box) { box.textContent = ''; box.appendChild(h('p', { text: 'Claude bereitet Tag ' + d + ' vor: ' + o[1] })); box.appendChild(line); draw(); }
    var review = m.type === 'review';
    function call(k, prompt) {
      if (have[k]) return Promise.resolve(have[k]);
      return AI.json(prompt, { modelTier: 'default', cache: false }).then(function (r) {
        var v = GenCheck[k](r);
        if (!v) throw { code: 'invalid_json' };
        have[k] = v; status[k] = 'ok'; draw(); return v;
      }).catch(function (e) { status[k] = 'err'; draw(); throw e; });
    }
    /* vorher prüfen, ob ein anderes Gerät den Tag schon vorbereitet hat */
    var p = Store.getExtra('gen-d' + pad2(d)).then(function (g) {
      if (g && g.vocab) { Content.gen[d] = Content.normGen(d, g); return g; }
      return this.known(d).then(function (known) {
        return Promise.allSettled([
          call('vocab', Prompts.genVocab(o, known)),
          call('grammar', Prompts.genGrammar(o)),
          call('practice', Prompts.genPractice(o, review))
        ]).then(function (rs) {
          var bad = rs.filter(function (x) { return x.status === 'rejected'; });
          if (bad.length) throw bad[0].reason;
          var pr = have.practice;
          var body = Content.normGen(d, { vocab: have.vocab, grammar: have.grammar, text: pr.text, scenario: pr.scenario, fluency: pr.fluency, ru: pr.ru });
          Content.gen[d] = body;
          delete Gen.partial[d];
          return Store.setExtra('gen-d' + pad2(d), body).then(function () { return body; });
        });
      });
    }.bind(this)).then(function (body) {
      if (box) { box.textContent = ''; box.appendChild(h('p', { text: 'Tag ' + d + ' ist vorbereitet.' })); }
      return body;
    }).catch(function (e) {
      var msg = AI.msg(e);
      if (box) {
        box.appendChild(h('p', { text: (msg || 'Abgebrochen.') + (Object.keys(have).length ? ' Fertige Teile bleiben erhalten.' : '') }));
        if (!AI.off) box.appendChild(h('button', { class: 'btn', type: 'button', text: 'Erneut versuchen', onclick: function () { Gen.make(d, box); } }));
      }
      return null;
    }).then(function (x) { delete Gen.running[d]; return x; });
    this.running[d] = p;
    return p;
  }
};
