// Prüft eine Tagesdatei src/data/days/dNN.js (oder alle, ohne Argument).
// Aufruf: node tools/check_day.js 15   |   node tools/check_day.js
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'src', 'data');
const DAYS = path.join(DATA, 'days');

function loadAll() {
  global.window = {};
  ['course.js', 'vocab_w1_2.js', 'grammar_w1_2.js', 'practice_w1_2.js'].forEach(f => require(path.join(DATA, f)));
  /* andere Tage werden gerade evtl. noch geschrieben: kaputte Dateien überspringen */
  if (fs.existsSync(DAYS)) fs.readdirSync(DAYS).filter(f => /^d\d\d\.js$/.test(f)).sort().forEach(f => {
    try { require(path.join(DAYS, f)); } catch (err) { console.log('  (übersprungen: ' + f + ' – ' + err.message.split('\n')[0] + ')'); }
  });
  window.D.days = window.D.days || {};
  Object.keys(window.D.days).forEach(k => (window.D.days[k].vocab || []).forEach(v => { v.day = +k; window.D.vocab.push(v); }));
  return window.D;
}
const words = s => String(s || '').split(/\s+/).filter(Boolean).length;
const sortWords = s => s.toLowerCase().replace(/[.,!?;:„“"]/g, '').split(/\s+/).filter(Boolean).sort().join(' ');

function checkDay(D, d) {
  const e = [], w = [];
  const x = (D.days || {})[d];
  const pad = String(d).padStart(2, '0');
  if (!x) return { e: ['day ' + d + ' missing in D.days'], w };
  if (x.d !== d) e.push('d field');
  if (!['lesson', 'review'].includes(x.type)) e.push('type');
  if (!x.de || !x.ru) e.push('de/ru title');
  const review = x.type === 'review';
  const voc = x.vocab || [];
  if (voc.length !== (review ? 10 : 18)) e.push('vocab count ' + voc.length);
  voc.forEach((v, i) => {
    const at = 'vocab ' + (v.id || i);
    if (v.id !== 'v' + pad + '-' + String(i + 1).padStart(3, '0')) e.push(at + ' id');
    ['kind', 'de', 'ru', 'ex', 'exRu', 'cloze', 'ans'].forEach(k => { if (typeof v[k] !== 'string' || !v[k].trim()) e.push(at + ' missing ' + k); });
    if (!['noun', 'verb', 'adj', 'adv', 'chunk', 'phrase'].includes(v.kind)) e.push(at + ' kind');
    if (v.kind === 'noun' && (!['der', 'die', 'das'].includes(v.art) || typeof v.pl !== 'string')) e.push(at + ' noun art/pl');
    if (v.kind === 'verb' && !v.forms) e.push(at + ' verb forms');
    if (v.cloze && v.cloze.split('___').length !== 2) e.push(at + ' cloze gaps');
    if (v.cloze && v.cloze.replace('___', v.ans) !== v.ex) e.push(at + ' cloze != ex');
    const n = words(v.ex); if (n < 6 || n > 20) w.push(at + ' ex length ' + n);
  });
  // Dubletten gegen den ganzen Kurs
  const seen = {};
  D.vocab.forEach(v => { if (v.day !== d) seen[String(v.de).toLowerCase()] = v.id || v.day; });
  voc.forEach(v => { if (seen[String(v.de).toLowerCase()]) e.push('duplicate of ' + seen[String(v.de).toLowerCase()] + ': ' + v.de); });
  const g = x.grammar;
  if (!review) {
    if (!g) e.push('grammar missing');
    else {
      if (g.id !== 'g-d' + pad) e.push('grammar id');
      if (!g.de || !g.ru) e.push('grammar title');
      if (typeof g.rule !== 'string' || g.rule.length < 500 || g.rule.length > 1800) e.push('rule length ' + (g.rule || '').length);
      if (!Array.isArray(g.examples) || g.examples.length < 5) e.push('examples');
      if (!Array.isArray(g.drills) || g.drills.length !== 30) e.push('drills count ' + (g.drills || []).length);
      const types = {};
      (g.drills || []).forEach((q, i) => {
        const at = 'drill ' + i;
        types[q.t] = (types[q.t] || 0) + 1;
        if (!['gap', 'choice', 'transform', 'order', 'translate', 'fix'].includes(q.t)) e.push(at + ' type');
        if (typeof q.q !== 'string' || !q.q.trim()) e.push(at + ' q');
        if (!Array.isArray(q.a) || !q.a.length || q.a.some(a => typeof a !== 'string' || !a.trim())) e.push(at + ' a');
        if ((q.t === 'gap' || q.t === 'choice') && q.q.split('___').length !== 2) e.push(at + ' gap count');
        if (q.t === 'choice' && (!Array.isArray(q.o) || q.o.length !== 3 || !q.o.includes(q.a[0]))) e.push(at + ' choice options');
        if (q.t === 'transform' && !q.i) e.push(at + ' transform instruction');
        if (q.t === 'order') { const c = sortWords(q.q.split(/\s*\/\s*/).join(' ')); q.a.forEach(a => { if (sortWords(a) !== c) e.push(at + ' order words: ' + a); }); }
        if (q.t === 'fix' && q.a.some(a => a.trim() === q.q.trim())) e.push(at + ' fix unchanged');
      });
      ['gap', 'choice', 'transform', 'translate', 'fix'].forEach(t => { if (!types[t]) w.push('no ' + t + ' drills'); });
      if (!Array.isArray(g.speak) || g.speak.length !== 12 || g.speak.some(s => !s.ru || !s.de)) e.push('speak');
    }
  } else if (g) w.push('review day has own grammar (ok, but mix is normal)');
  const t = x.text;
  if (!t || t.id !== 't' + pad) e.push('text id');
  else {
    const n = words(t.de); if (n < 140 || n > 280) e.push('text length ' + n);
    if (!Array.isArray(t.q) || t.q.length < 4) e.push('text questions');
    (t.q || []).forEach((q, i) => { if (!Array.isArray(q.o) || !(q.a >= 0 && q.a < q.o.length)) e.push('text q ' + i); });
    if (!t.retell || !t.title || !t.kind) e.push('text fields');
    if (!Array.isArray(t.gl) || t.gl.length < 5) e.push('glossary');
  }
  const s = x.scenario;
  if (!s || s.id !== 's' + pad) e.push('scenario id');
  else {
    ['kind', 'title', 'ru', 'role', 'goal', 'open'].forEach(k => { if (!s[k]) e.push('scenario ' + k); });
    if (!['tutor', 'interview', 'roleplay', 'fach'].includes(s.kind)) e.push('scenario kind');
    if (!Array.isArray(s.steps) || s.steps.length < 3) e.push('scenario steps');
    if (!Array.isArray(s.use) || s.use.length < 5) e.push('scenario use');
  }
  const f = x.fluency;
  if (!f || f.id !== 'f' + pad) e.push('fluency id');
  else {
    if (!f.topic || !f.ru) e.push('fluency topic');
    if (!Array.isArray(f.points) || f.points.length < 4) e.push('fluency points');
    const n = words(f.model); if (n < 100 || n > 190) e.push('model length ' + n);
    if (!Array.isArray(f.shadow) || f.shadow.length !== 8) e.push('shadow count');
  }
  return { e, w };
}

if (require.main === module) {
  const D = loadAll();
  const list = process.argv[2] ? [+process.argv[2]] : Object.keys(D.days || {}).map(Number).sort((a, b) => a - b);
  let bad = 0;
  list.forEach(d => {
    const r = checkDay(D, d);
    if (r.e.length) bad++;
    console.log('Tag ' + d + ': ' + (r.e.length ? r.e.length + ' Fehler' : 'ok') + (r.w.length ? ', ' + r.w.length + ' Hinweise' : ''));
    r.e.forEach(x => console.log('  FEHLER ' + x));
    r.w.forEach(x => console.log('  hinweis ' + x));
  });
  process.exit(bad ? 1 : 0);
}
module.exports = { loadAll, checkDay };
