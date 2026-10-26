/* Gemeinsame Bausteine: Symbole, Antwortfeld, Bewertungsknöpfe, Karten, Chat */

var ICON = {
  speak: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  stop: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" fill="currentColor"/></svg>',
  back: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mic: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M6 11a6 6 0 0 0 12 0M12 17v4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  send: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12l16-8-6 16-2.5-6.5L4 12z" fill="currentColor"/></svg>'
};
function icon(name, cls) { return h('span', { class: 'ic ' + (cls || ''), html: ICON[name] }); }

function speakBtn(textFn, label) {
  var b = h('button', { class: 'btn-icon', type: 'button', title: label || 'Anhören', 'aria-label': label || 'Anhören' }, icon('speak'));
  b.addEventListener('click', function () { TTS.speak(typeof textFn === 'function' ? textFn() : textFn); });
  if (!TTS.ok) b.hidden = true;
  return b;
}

function dictHint() {
  return h('p', { class: 'hint' }, icon('mic', 'sm'), ' Sprechen statt tippen: Mikrofon der Handy-Tastatur, am PC Windows + H (Mac: zweimal Fn).');
}

function answerBox(opts) {
  opts = opts || {};
  var ta = h('textarea', { class: 'answer', rows: opts.rows || 2, placeholder: opts.ph || 'Ihre Antwort …', autocapitalize: 'sentences', spellcheck: 'false', id: opts.id || ('a' + Math.random().toString(36).slice(2, 7)) });
  if (opts.value) ta.value = opts.value;
  ta.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey && opts.onEnter) { e.preventDefault(); opts.onEnter(); }
  });
  setTimeout(function () { if (opts.focus !== false) ta.focus(); }, 30);
  return ta;
}

/* Vorschau der Intervalle für die vier Bewertungsknöpfe */
function ivLabel(id, g) {
  var c = FSRS.review(JSON.parse(JSON.stringify(Cards.srs()[id] || {})), g);
  if (g === 1) return '10 Min';
  var days = Math.round((c.due - startOfDay()) / DAY);
  return days <= 1 ? '1 T' : days + ' T';
}
function gradeRow(id, onGrade, primary) {
  var names = ['', 'Nochmal', 'Schwer', 'Gut', 'Leicht'];
  var row = h('div', { class: 'grades' });
  [1, 2, 3, 4].forEach(function (g) {
    row.appendChild(h('button', {
      class: 'grade g' + g + (primary === g ? ' primary' : ''), type: 'button',
      onclick: function () { onGrade(g); }
    }, h('b', { text: names[g] }), h('small', { text: id ? ivLabel(id, g) : '' })));
  });
  return row;
}

function artClass(a) { return a === 'der' ? 'art-der' : a === 'die' ? 'art-die' : a === 'das' ? 'art-das' : ''; }
function wordHead(c) {
  return h('div', { class: 'word' },
    c.art ? h('span', { class: 'art ' + artClass(c.art), text: c.art }) : null,
    h('span', { class: 'de', text: c.de }),
    speakBtn((c.art ? c.art + ' ' : '') + c.de));
}

/* Vollständige Wortkarte (Einführung und Lösung) */
function wordCard(c) {
  var meta = [];
  if (c.pl !== undefined && c.art) meta.push(c.pl ? 'Pl. ' + c.pl : 'ohne Plural');
  if (c.forms) meta.push(c.forms);
  if (c.rek) meta.push(c.rek);
  return h('div', { class: 'wcard' },
    wordHead(c),
    meta.length ? h('p', { class: 'meta', text: meta.join(' · ') }) : null,
    h('p', { class: 'ru', text: c.ru }),
    c.ex ? h('div', { class: 'ex' }, h('p', { class: 'doc', text: c.ex }), speakBtn(c.ex, 'Beispiel anhören')) : null,
    c.exRu ? h('p', { class: 'ru small', text: c.exRu }) : null,
    c.col && c.col.length ? h('ul', { class: 'col' }, c.col.map(function (x) { return h('li', { text: x }); })) : null,
    c.note ? h('p', { class: 'note', text: c.note }) : null);
}

/* Verteiler für Wiederholungskarten.
   Liefert ein Element; ruft onGrade(g) einmal auf. */
function reviewCard(id, card, mode, onGrade0) {
  /* jede Karte wird genau einmal bewertet */
  var graded = false;
  var onGrade = function (g) { if (graded) return; graded = true; onGrade0(g); };
  var st = (Cards.srs()[id] || {}).st || 1;
  var reps = (Cards.srs()[id] || {}).reps || 0;
  var wrap = h('div', { class: 'rcard' });
  var isWord = card.type === 'vocab' || card.type === 'cust';
  var prompt, answers, solution, kindLabel;

  if (isWord && st <= 1) {
    var pool = distractors(card);
    if (pool.length >= 3) return mcCard(card, pool, onGrade);
  }
  if (isWord) {
    var useCloze = st >= 3 && card.cloze && card.ans && reps % 2 === 1;
    if (useCloze) {
      kindLabel = 'Lücke im Satz';
      prompt = h('div', {}, h('p', { class: 'doc big', html: esc(card.cloze).replace('___', '<span class="gap">___</span>') }), card.exRu ? h('p', { class: 'ru small', text: card.exRu }) : null);
      answers = [card.ans]; solution = function () { return wordCard(card); };
    } else {
      kindLabel = card.art ? 'Auf Deutsch, mit Artikel' : 'Auf Deutsch';
      prompt = h('p', { class: 'ru big', text: card.ru });
      answers = card.art ? [card.art + ' ' + card.de] : [card.de];
      solution = function () { return wordCard(card); };
    }
    var sayText = useCloze ? card.ex : Cards.label(card);
  } else if (card.type === 'fix') {
    kindLabel = 'Fehler finden und korrigieren';
    prompt = h('p', { class: 'doc big wrongline', text: card.wrong });
    answers = [card.right];
    solution = function () { return h('div', {}, h('p', { class: 'doc big', text: card.right }), card.why ? h('p', { class: 'ru small', text: card.why }) : null); };
    sayText = card.right;
  } else if (card.type === 'task') {
    kindLabel = card.i || 'Aufgabe';
    prompt = h('p', { class: (card.t === 'translate' ? 'ru' : 'doc') + ' big', text: card.q });
    answers = card.a; sayText = card.a[0];
    solution = function () { return h('p', { class: 'doc big', text: card.a[0] }); };
  } else {
    kindLabel = card.unit ? 'Sprechen: ' + card.unit : 'Sagen Sie es auf Deutsch';
    prompt = h('p', { class: 'ru big', text: card.ru });
    answers = [card.de]; sayText = card.de;
    solution = function () { return h('p', { class: 'doc big', text: card.de }); };
  }

  wrap.appendChild(h('p', { class: 'eyebrow', text: kindLabel }));
  wrap.appendChild(prompt);
  var res = h('div', { class: 'result' });

  if (mode === 'speak') {
    var showBtn = h('button', { class: 'btn primary', type: 'button', text: 'Laut gesagt – Lösung zeigen' });
    showBtn.addEventListener('click', function () {
      showBtn.remove();
      res.appendChild(solution());
      if (Store.get('settings').autoTts !== false) TTS.speak(sayText);
      var row = gradeRow(id, onGrade, 3);
      res.appendChild(row);
      row.querySelector('.primary').focus();
    });
    wrap.appendChild(h('p', { class: 'hint', text: 'Sprechen Sie die Antwort laut aus, dann aufdecken und ehrlich bewerten.' }));
    wrap.appendChild(showBtn);
  } else {
    var checked = false;
    var ta = answerBox({ rows: card.type === 'vocab' ? 1 : 2, value: card.type === 'fix' ? card.wrong : '', onEnter: function () { chk.click(); } });
    var chk = h('button', { class: 'btn primary', type: 'button', text: 'Prüfen' });
    chk.addEventListener('click', function () {
      if (checked) return; checked = true;
      var r = checkAnswer(ta.value, answers);
      chk.remove(); ta.readOnly = true;
      res.appendChild(verdict(r, ta.value));
      res.appendChild(solution());
      if (Store.get('settings').autoTts !== false) TTS.speak(sayText);
      var prim = r.res === 'ok' ? 3 : r.res === 'near' ? 2 : 1;
      var row = gradeRow(id, onGrade, prim);
      res.appendChild(row);
      if (r.res === 'wrong' && !isWord && AI.ready()) res.appendChild(aiCheckBtn(kindLabel + ': ' + (card.ru || card.wrong || card.q), answers, ta.value, function (ok) { if (ok && wrap.isConnected) onGrade(3); }));
      row.querySelector('.primary').focus();
    });
    wrap.appendChild(ta);
    wrap.appendChild(dictHint());
    wrap.appendChild(chk);
  }
  wrap.appendChild(res);
  return wrap;
}

function verdict(r, user) {
  if (r.res === 'ok') return h('p', { class: 'verdict ok' }, icon('check', 'sm'), ' Richtig', r.note ? h('span', { class: 'small', text: ' · ' + r.note }) : null);
  if (r.res === 'near') return h('div', { class: 'verdict near' }, h('p', { text: r.note || 'Fast richtig' }), h('p', { class: 'doc', html: diffHtml(user, r.best) }));
  return h('div', { class: 'verdict wrong' }, h('p', { text: user.trim() ? 'Nicht ganz. Richtig wäre:' : 'Lösung:' }), h('p', { class: 'doc', html: user.trim() ? diffHtml(user, r.best) : esc(r.best) }));
}

/* Claude prüft eine abweichende Antwort */
function aiCheckBtn(task, answers, user, cb) {
  var box = h('div', { class: 'aicheck' });
  var b = h('button', { class: 'btn ghost', type: 'button', text: 'Meine Variante von Claude prüfen lassen' });
  b.addEventListener('click', function () {
    b.disabled = true; b.textContent = 'Claude prüft …';
    AI.json(Prompts.check(task, answers, user), { modelTier: 'quick' }).then(function (r) {
      b.remove();
      box.appendChild(h('div', { class: 'verdict ' + (r.ok ? 'ok' : 'wrong') },
        h('p', { text: r.ok ? 'Claude: Ihre Variante ist korrekt.' : 'Claude: Nicht korrekt.' }),
        r.right ? h('p', { class: 'doc', text: r.right }) : null,
        r.why_ru ? h('p', { class: 'ru small', text: r.why_ru }) : null));
      if (cb) cb(!!r.ok, r);
    }).catch(function (e) { b.disabled = false; b.textContent = 'Meine Variante von Claude prüfen lassen'; var m = AI.msg(e); if (m) toast(m); });
  });
  box.appendChild(b);
  return box;
}

function distractors(card) {
  Content.index();
  var all = (D.vocab || []).concat.apply([], Object.keys(Content.gen).map(function (k) { return Content.gen[k].vocab || []; }));
  var same = all.filter(function (v) { return v.id !== card.id && v.kind === card.kind && v.ru !== card.ru; });
  if (same.length < 3) same = all.filter(function (v) { return v.id !== card.id && v.ru !== card.ru; });
  return shuffle(same).slice(0, 3);
}
function mcCard(card, pool, onGrade) {
  var wrap = h('div', { class: 'rcard' });
  wrap.appendChild(h('p', { class: 'eyebrow', text: 'Was bedeutet …?' }));
  wrap.appendChild(wordHead(card));
  var opts = shuffle(pool.map(function (v) { return v.ru; }).concat([card.ru]));
  var list = h('div', { class: 'choices' }), res = h('div', { class: 'result' });
  if (Store.get('settings').autoTts !== false) setTimeout(function () { TTS.speak(Cards.label(card)); }, 150);
  opts.forEach(function (o) {
    var b = h('button', { class: 'choice', type: 'button', text: o });
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(list.children, function (x) { x.disabled = true; if (x.textContent === card.ru) x.classList.add('right'); });
      if (o === card.ru) { b.classList.add('right'); res.appendChild(h('p', { class: 'verdict ok', role: 'status' }, icon('check', 'sm'), ' Richtig')); setTimeout(function () { onGrade(3); }, 700); }
      else {
        b.classList.add('wrong');
        res.appendChild(h('p', { class: 'verdict wrong', role: 'status', text: 'Falsch. Richtig ist: ' + card.ru }));
        res.appendChild(wordCard(card));
        res.appendChild(h('button', { class: 'btn primary', type: 'button', text: 'Weiter', onclick: function () { onGrade(1); } }));
      }
    });
    list.appendChild(b);
  });
  wrap.appendChild(list); wrap.appendChild(res);
  return wrap;
}

/* ---------- Chat mit Claude ---------- */
/* laufende Antwort beim Verlassen der Ansicht abbrechen */
var Chat = { ctl: null, stop: function () { if (this.ctl) { try { this.ctl.abort(); } catch (e) { } this.ctl = null; } } };
function setCur(cur) { var c = Store.get('chats'); c.cur = cur; c.curT = Date.now(); Store.save('chats'); }

function chatPanel(sc, opts) {
  opts = opts || {};
  var key = opts.key;
  var chats = Store.get('chats'), dead = false;
  var turns = (chats.cur && chats.cur.key === key && chats.cur.turns && chats.cur.turns.length) ? chats.cur.turns.slice() : [{ role: 'assistant', content: sc.open || 'Guten Tag! Schön, dass Sie da sind.' }];
  var rules = Prompts.chatRules(sc, opts.words);
  var ctl = null, busy = false;
  var wrap = h('div', { class: 'chat' });
  var log = h('div', { class: 'log', 'aria-live': 'polite' });
  var tts = h('input', { type: 'checkbox', id: 'chat-tts' });
  tts.checked = Store.get('settings').chatTts !== false;
  tts.addEventListener('change', function () { var s = Store.get('settings'); s.chatTts = tts.checked; Store.save('settings'); });

  function persist() {
    if (dead) return;
    setCur({ key: key, turns: turns.slice(-40), t: Date.now() });
  }
  function bubble(t) {
    var b = h('div', { class: 'msg ' + (t.role === 'user' ? 'me' : 'them') });
    fillBubble(b, t.content);
    return b;
  }
  function fillBubble(b, text) {
    b.textContent = '';
    var parts = String(text).split(/\n(?=✎ )/);
    b.appendChild(h('p', { text: parts[0].trim() }));
    if (parts[1]) b.appendChild(h('p', { class: 'fix' }, h('span', { class: 'fixlabel', text: 'Besser so' }), ' ' + parts[1].replace(/^✎\s*/, '').trim()));
    if (!b.classList.contains('me')) {
      var main = parts[0].trim();
      b.appendChild(speakBtn(main));
    }
  }
  turns.forEach(function (t) { log.appendChild(bubble(t)); });
  var ta = answerBox({ rows: 3, ph: 'Antworten Sie auf Deutsch …', focus: false, onEnter: function () { send(); } });
  var sendBtn = h('button', { class: 'btn primary', type: 'button' }, icon('send', 'sm'), ' Senden');
  var stopBtn = h('button', { class: 'btn ghost', type: 'button', text: 'Stopp', hidden: true });
  sendBtn.addEventListener('click', send);
  stopBtn.addEventListener('click', function () { if (ctl) ctl.abort(); });

  function send() {
    var text = ta.value.trim();
    if (!text || busy) return;
    if (!AI.ready()) { toast('Claude ist nicht verfügbar.'); return; }
    ta.value = '';
    turns.push({ role: 'user', content: text });
    log.appendChild(bubble(turns[turns.length - 1]));
    var b = h('div', { class: 'msg them pending', 'aria-busy': 'true' }, h('p', { class: 'muted', text: 'schreibt …' }));
    log.appendChild(b); b.scrollIntoView({ block: 'end', behavior: 'smooth' });
    busy = true; sendBtn.disabled = true; stopBtn.hidden = false;
    ctl = new AbortController(); Chat.ctl = ctl;
    persist();
    var input = [{ role: 'user', content: rules }].concat(turns.slice(-30));
    if (input[1] && input[1].role === 'assistant' && turns.length > 30) input.splice(1, 0, { role: 'user', content: '(Früherer Teil des Gesprächs ausgelassen.)' });
    AI.fn(input, {
      modelTier: Store.get('settings').chatTier || 'quick', cache: false, signal: ctl.signal,
      onText: function (u) { b.classList.remove('pending'); fillBubble(b, u.text); }
    }).then(function (r) {
      if (dead) return;
      turns.push({ role: 'assistant', content: r.text });
      fillBubble(b, r.text); persist();
      if (tts.checked && wrap.isConnected) TTS.speak(r.text.split(/\n✎ /)[0]);
    }).catch(function (e) {
      if (dead) return;
      if (e && e.text) { turns.push({ role: 'assistant', content: e.text }); fillBubble(b, e.text); }
      else b.remove();
      var m = AI.msg(e); if (m && wrap.isConnected) toast(m);
      persist();
    }).then(function () {
      b.removeAttribute('aria-busy');
      busy = false; sendBtn.disabled = false; stopBtn.hidden = true;
      if (Chat.ctl === ctl) Chat.ctl = null;
      if (wrap.isConnected) b.scrollIntoView({ block: 'end' });
    });
  }

  var endBtn = h('button', { class: 'btn', type: 'button', text: 'Beenden und auswerten' });
  endBtn.addEventListener('click', function () {
    var learnerTurns = turns.filter(function (t) { return t.role === 'user'; }).length;
    if (learnerTurns < 2) { toast('Für eine Auswertung bitte mindestens zwei Antworten schreiben.'); return; }
    if (ctl) ctl.abort();
    dead = true;
    wrap.replaceWith(evaluationPanel(sc, turns.slice(), function () {
      setCur(null);
      if (opts.onDone) opts.onDone();
    }));
  });
  var resetBtn = h('button', { class: 'btn ghost', type: 'button', text: 'Neu beginnen' });
  resetBtn.addEventListener('click', function () {
    dead = true;
    if (ctl) ctl.abort();
    TTS.stop();
    setCur(null);
    wrap.replaceWith(chatPanel(sc, opts));
  });

  wrap.appendChild(log);
  wrap.appendChild(h('div', { class: 'composer' }, ta, dictHint(),
    h('div', { class: 'row' }, sendBtn, stopBtn, h('label', { class: 'toggle', for: 'chat-tts' }, tts, ' Antworten vorlesen'))));
  wrap.appendChild(h('div', { class: 'row end' }, resetBtn, endBtn));
  if (turns.length === 1 && tts.checked && opts.speakOpen !== false) setTimeout(function () { TTS.speak(turns[0].content); }, 200);
  return wrap;
}

function scoreBars(scores) {
  var names = { grammatik: 'Grammatik', wortschatz: 'Wortschatz', fachsprache: 'Fachsprache', ausdruck: 'Ausdruck und Wirkung' };
  return h('div', { class: 'scores' }, Object.keys(names).map(function (k) {
    var v = Math.max(0, Math.min(5, +scores[k] || 0));
    return h('div', { class: 'score' }, h('span', { text: names[k] }), h('span', { class: 'bar' }, h('i', { style: 'width:' + v * 20 + '%' })), h('b', { text: v + '/5' }));
  }));
}

/* Liste von Fehlern/Wendungen mit Häkchen; liefert {el, picked()} */
function pickList(items, render) {
  var boxes = [];
  var el = h('ul', { class: 'picks' }, items.map(function (it, i) {
    var cb = h('input', { type: 'checkbox', id: 'pk' + i + Math.random().toString(36).slice(2, 5) });
    cb.checked = true; boxes.push(cb);
    return h('li', {}, h('label', { for: cb.id }, cb, h('div', {}, render(it))));
  }));
  return { el: el, picked: function () { return items.filter(function (_, i) { return boxes[i].checked; }); } };
}

function logErrors(list, src) {
  var e = Store.get('errs'); e.list = e.list || [];
  list.forEach(function (x) { e.list.push({ t: Date.now(), wrong: x.wrong, right: x.right, why: x.why_ru || x.why || '', cat: x.cat || 'andere', src: src }); });
  e.list = e.list.slice(-400);
  Store.save('errs');
}

function evaluationPanel(sc, turns, onDone) {
  var wrap = h('div', { class: 'eval' }, h('h3', { text: 'Auswertung' }), h('p', { class: 'muted', text: 'Claude wertet das Gespräch aus …' }));
  AI.json(Prompts.evaluate(sc, turns), { modelTier: 'default' }).then(function (r) {
    wrap.textContent = '';
    wrap.appendChild(h('h3', { text: 'Auswertung: ' + (sc.title || 'Gespräch') }));
    if (r.scores) wrap.appendChild(scoreBars(r.scores));
    if (r.summary_ru) wrap.appendChild(h('p', { class: 'ru', text: r.summary_ru }));
    var errs = (r.errors || []).filter(function (x) { return x && x.wrong && x.right; });
    var ph = (r.phrases || []).filter(function (x) { return x && x.de; });
    var el, pl;
    if (errs.length) {
      wrap.appendChild(h('h4', { text: 'Fehler → als Karten üben' }));
      el = pickList(errs, function (x) { return [h('p', { class: 'doc wrongline', text: x.wrong }), h('p', { class: 'doc', text: x.right }), x.why_ru ? h('p', { class: 'ru small', text: x.why_ru }) : null]; });
      wrap.appendChild(el.el);
    }
    if (r.better && r.better.length) {
      wrap.appendChild(h('h4', { text: 'Natürlicher formuliert' }));
      wrap.appendChild(h('ul', { class: 'better' }, r.better.map(function (b) { return h('li', {}, h('p', { class: 'muted', text: b.yours }), h('p', { class: 'doc', text: b.better }), speakBtn(b.better)); })));
    }
    if (ph.length) {
      wrap.appendChild(h('h4', { text: 'Nützliche Wendungen → als Karten' }));
      pl = pickList(ph, function (x) { return [h('p', { class: 'doc', text: x.de }), h('p', { class: 'ru small', text: x.ru })]; });
      wrap.appendChild(pl.el);
    }
    var c = Store.get('chats'); c.list = c.list || [];
    c.list.push({ t: Date.now(), d: App.day, sc: sc.title, kind: sc.kind || '', scores: r.scores || null });
    c.list = c.list.slice(-150); Store.save('chats');
    wrap.appendChild(h('button', {
      class: 'btn primary', type: 'button', text: 'Übernehmen und weiter', onclick: function () {
        var pe = el ? el.picked() : [], pp = pl ? pl.picked() : [];
        logErrors(errs, 'chat');
        pe.forEach(function (x) { Cards.addX('fix', { wrong: x.wrong, right: x.right, why: x.why_ru || '' }); });
        pp.forEach(function (x) { Cards.addX('phr', { de: x.de, ru: x.ru || '' }); });
        if (pe.length + pp.length) toast((pe.length + pp.length) + ' Karten aufgenommen');
        onDone();
      }
    }));
  }).catch(function (e) {
    wrap.textContent = '';
    wrap.appendChild(h('p', { text: AI.msg(e) || 'Auswertung abgebrochen.' }));
    wrap.appendChild(h('div', { class: 'row' },
      h('button', { class: 'btn', type: 'button', text: 'Erneut auswerten', onclick: function () { wrap.replaceWith(evaluationPanel(sc, turns, onDone)); } }),
      h('button', { class: 'btn ghost', type: 'button', text: 'Ohne Auswertung weiter', onclick: onDone })));
  });
  return wrap;
}

/* Rückmeldung auf freie Sprechtexte (Nacherzählung, Monolog, Interviewantwort) */
function feedbackPanel(promptText, opts) {
  var wrap = h('div', { class: 'fb' }, h('p', { class: 'muted', text: 'Claude liest …' }));
  AI.json(promptText, { modelTier: 'default' }).then(function (r) {
    wrap.textContent = '';
    if (r.score) wrap.appendChild(h('p', { class: 'scoreline', text: 'Bewertung: ' + r.score + '/5' }));
    if (r.ru) wrap.appendChild(h('p', { class: 'ru', text: r.ru }));
    if (r.de) wrap.appendChild(h('div', { class: 'model' }, h('p', { class: 'eyebrow', text: opts && opts.modelLabel || 'Verbesserte Fassung' }), h('p', { class: 'doc', text: r.de }), speakBtn(r.de)));
    var errs = (r.errors || []).filter(function (x) { return x && x.wrong && x.right; });
    if (errs.length) {
      var pl = pickList(errs, function (x) { return [h('p', { class: 'doc wrongline', text: x.wrong }), h('p', { class: 'doc', text: x.right }), x.why_ru ? h('p', { class: 'ru small', text: x.why_ru }) : null]; });
      wrap.appendChild(h('h4', { text: 'Fehler → als Karten üben' }));
      wrap.appendChild(pl.el);
      wrap.appendChild(h('button', {
        class: 'btn', type: 'button', text: 'Ausgewählte als Karten übernehmen', onclick: function (ev) {
          logErrors(errs, opts && opts.src || 'frei');
          pl.picked().forEach(function (x) { Cards.addX('fix', { wrong: x.wrong, right: x.right, why: x.why_ru || '' }); });
          ev.target.disabled = true; ev.target.textContent = 'Übernommen';
        }
      }));
    }
  }).catch(function (e) {
    wrap.textContent = '';
    wrap.appendChild(h('p', { text: AI.msg(e) || 'Abgebrochen.' }));
    if (!AI.off && !(e && e.code === 'cancelled')) wrap.appendChild(h('button', { class: 'btn', type: 'button', text: 'Erneut prüfen', onclick: function () { wrap.replaceWith(feedbackPanel(promptText, opts)); } }));
  });
  return wrap;
}
