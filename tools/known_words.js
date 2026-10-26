// Listet den bisherigen Wortschatz und die Grammatikthemen des Kurses (für die Planung neuer Tage).
// Aufruf: node tools/known_words.js            → Wörter, eine Zeile pro Eintrag
//         node tools/known_words.js grammar    → Grammatikthemen mit Tag
const { loadAll } = require('./check_day.js');
const D = loadAll();
if (process.argv[2] === 'grammar') {
  Object.values(D.grammar).concat(Object.values(D.days || {}).map(x => x.grammar).filter(Boolean))
    .sort((a, b) => a.day - b.day).forEach(u => console.log('Tag ' + u.day + ': ' + u.de));
} else {
  D.vocab.forEach(v => console.log(v.de));
}
