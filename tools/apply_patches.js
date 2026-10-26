// Wendet Korrekturen auf die Inhaltsdateien an und prüft sie danach.
// Aufruf: node tools/apply_patches.js patches.json
// Patch: { path: ["grammar","g-tempus","drills",12,"a"], mode: "replace"|"set"|"append", find, replace, value_json }
const fs = require('fs');
const path = require('path');
const DATA = path.join(__dirname, '..', 'src', 'data');
const FILES = {
  vocab: { file: 'vocab_w1_2.js', keys: ['vocab'] },
  grammar: { file: 'grammar_w1_2.js', keys: ['grammar'] },
  texts: { file: 'practice_w1_2.js', keys: ['texts', 'scenarios', 'fluency', 'interview'] },
  scenarios: { file: 'practice_w1_2.js' }, fluency: { file: 'practice_w1_2.js' }, interview: { file: 'practice_w1_2.js' }
};

function load() {
  global.window = {};
  for (const f of ['vocab_w1_2.js', 'grammar_w1_2.js', 'practice_w1_2.js']) {
    delete require.cache[require.resolve(path.join(DATA, f))];
    require(path.join(DATA, f));
  }
  return window.D;
}

function step(cur, key) {
  if (Array.isArray(cur) && typeof key === 'string' && !/^\d+$/.test(key)) {
    const hit = cur.find(x => x && x.id === key);
    if (!hit) throw new Error('id not found: ' + key);
    return hit;
  }
  return cur[typeof key === 'string' && /^\d+$/.test(key) ? +key : key];
}

function apply(D, p) {
  const keys = p.path.slice();
  if (!keys.length || !(keys[0] in D)) throw new Error('bad root ' + keys[0]);
  let parent = D;
  for (let i = 0; i < keys.length - 1; i++) {
    parent = step(parent, keys[i]);
    if (parent == null) throw new Error('missing at ' + keys.slice(0, i + 1).join('.'));
  }
  let last = keys[keys.length - 1];
  if (Array.isArray(parent) && typeof last === 'string' && /^\d+$/.test(last)) last = +last;
  if (Array.isArray(parent) && typeof last === 'string') {
    const idx = parent.findIndex(x => x && x.id === last);
    if (idx < 0) throw new Error('id not found: ' + last);
    last = idx;
  }
  if (p.mode === 'replace') {
    const s = parent[last];
    if (typeof s !== 'string') throw new Error('not a string at ' + keys.join('.'));
    const n = s.split(p.find).length - 1;
    if (n !== 1) throw new Error('find occurs ' + n + 'x at ' + keys.join('.') + ': ' + p.find);
    parent[last] = s.replace(p.find, () => p.replace);
  } else if (p.mode === 'set') {
    parent[last] = JSON.parse(p.value_json);
  } else if (p.mode === 'append') {
    const arr = parent[last];
    if (!Array.isArray(arr)) throw new Error('not an array at ' + keys.join('.'));
    const v = JSON.parse(p.value_json);
    (Array.isArray(v) ? v : [v]).forEach(x => { if (!arr.includes(x)) arr.push(x); });
  } else throw new Error('bad mode ' + p.mode);
}

function write(D) {
  const head = 'var D = window.D || (window.D = {});\n';
  fs.writeFileSync(path.join(DATA, 'vocab_w1_2.js'), head + 'D.vocab = ' + JSON.stringify(D.vocab, null, 1) + ';\n');
  fs.writeFileSync(path.join(DATA, 'grammar_w1_2.js'), head + 'D.grammar = ' + JSON.stringify(D.grammar, null, 1) + ';\n');
  fs.writeFileSync(path.join(DATA, 'practice_w1_2.js'), head + ['texts', 'scenarios', 'fluency', 'interview'].map(k => 'D.' + k + ' = ' + JSON.stringify(D[k], null, 1) + ';').join('\n') + '\n');
}

function validate(D) {
  const errs = [];
  const ids = new Set();
  D.vocab.forEach(v => {
    if (ids.has(v.id)) errs.push('dup id ' + v.id); ids.add(v.id);
    ['day', 'kind', 'de', 'ru', 'ex', 'exRu', 'cloze', 'ans'].forEach(k => { if (v[k] === undefined || v[k] === '') errs.push(v.id + ' missing ' + k); });
    if (v.cloze && v.cloze.split('___').length !== 2) errs.push(v.id + ' cloze gaps');
    if (v.cloze && v.cloze.replace('___', v.ans) !== v.ex) errs.push(v.id + ' cloze != ex');
    if (v.kind === 'noun' && (!v.art || v.pl === undefined)) errs.push(v.id + ' noun art/pl');
  });
  Object.values(D.grammar).forEach(u => {
    (u.drills || []).forEach((x, i) => {
      const at = u.id + '.drills.' + i;
      if (!Array.isArray(x.a) || !x.a.length || x.a.some(a => typeof a !== 'string' || !a.trim())) errs.push(at + ' answers');
      if ((x.t === 'gap' || x.t === 'choice') && x.q.split('___').length !== 2) errs.push(at + ' gap count');
      if (x.t === 'choice' && (!x.o || x.o.length !== 3 || !x.o.includes(x.a[0]))) errs.push(at + ' choice options');
      if (x.t === 'order') {
        const chunks = x.q.split(/\s*\/\s*/).join(' ').toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).sort().join(' ');
        x.a.forEach(a => { const w = a.toLowerCase().replace(/[.,!?]/g, '').split(/\s+/).sort().join(' '); if (w !== chunks) errs.push(at + ' order words: ' + a); });
      }
    });
    (u.speak || []).forEach((s, i) => { if (!s.ru || !s.de) errs.push(u.id + '.speak.' + i); });
  });
  Object.values(D.texts).forEach(t => (t.q || []).forEach((q, i) => { if (!(q.a >= 0 && q.a < q.o.length)) errs.push(t.id + '.q.' + i); }));
  Object.values(D.fluency).forEach(f => { if (!f.shadow || f.shadow.length < 6) errs.push(f.id + ' shadow'); });
  return errs;
}

if (require.main === module) {
  const patches = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const D = load();
  let ok = 0; const failed = [];
  for (const p of patches) {
    try { apply(D, p); ok++; } catch (e) { failed.push({ p, err: e.message }); }
  }
  const errs = validate(D);
  console.log('applied', ok, 'failed', failed.length);
  failed.forEach(f => console.log('FAILED', JSON.stringify(f.p.path), f.err));
  if (errs.length) { console.log('VALIDATION', errs.length); errs.slice(0, 40).forEach(e => console.log(' ', e)); }
  if (process.argv.includes('--write')) { write(D); console.log('written'); }
}
module.exports = { load, apply, validate, write };
