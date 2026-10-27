/* Anweisungen an Claude. Jeder Aufruf ist gedächtnislos: alles Nötige steht im Text. */

var Prompts = {
  learner: function () {
    var p = Store.get('profile');
    var s = 'LERNER: ' + (p.name || 'Der Lerner') + '. ' + (p.summary || 'Erfahrener Immobilienbewerter mit langjähriger Berufserfahrung im Bereich Kreditsicherheiten, DEKRA-zertifizierter Sachverständiger für Immobilienbewertung (D1).') +
      ' Deutschniveau B1–B2, Muttersprachen Ukrainisch und Russisch. Ziel: ' + (p.goal || 'Stelle als Gutachter bei einer Sparkasse oder in einem Gutachterbüro.') +
      ' Er schreibt oft per Spracheingabe: fehlende Satzzeichen und Großschreibung nicht bewerten.';
    var w = this.weakSpots();
    if (w) s += ' Typische Fehler bisher: ' + w + '.';
    return s;
  },
  weakSpots: function () {
    var errs = (Store.get('errs').list || []).slice(-150), n = {};
    errs.forEach(function (e) { if (e.cat) n[e.cat] = (n[e.cat] || 0) + 1; });
    var names = { adj: 'Adjektivendungen', kasus: 'Kasus', verbstellung: 'Verbstellung', tempus: 'Zeitformen', praep: 'Präpositionen', artikel: 'Artikel', wortwahl: 'Wortwahl', rektion: 'Rektion', konj: 'Konjunktiv' };
    return Object.keys(n).sort(function (a, b) { return n[b] - n[a]; }).slice(0, 4).map(function (k) { return names[k] || k; }).join(', ');
  },

  chatRules: function (sc, extraWords) {
    return [
      'Du bist Gesprächspartner in einer Sprachlern-App (Deutsch B1–B2, Fachgebiet Immobilienbewertung und Bank).',
      'ROLLE: ' + sc.role,
      sc.facts ? 'DATEN ZUR SITUATION (der Lerner kennt sie auch): ' + sc.facts : '',
      this.learner(),
      sc.steps && sc.steps.length ? 'GESPRÄCHSVERLAUF, den du nach und nach abdeckst: ' + sc.steps.join(' | ') : '',
      (sc.use && sc.use.length) || extraWords ? 'ZIELWENDUNGEN: Bring den Lerner durch passende Fragen dazu, diese Wendungen selbst zu benutzen, ohne sie vorzusagen: ' + (sc.use || []).concat(extraWords || []).join('; ') : '',
      'REGELN:',
      '- Bleib in deiner Rolle, sprich natürlich und siez den Lerner.',
      '- Antworte kurz: höchstens 2–3 Sätze, dann genau eine Frage. Der Lerner soll deutlich mehr sprechen als du.',
      '- Wenn die letzte Nachricht des Lerners Grammatik- oder Wortfehler hatte (Kasus, Adjektivendungen, Verbstellung, Zeitformen, Präpositionen, Artikel, falsches Wort), füge GANZ AM ENDE eine eigene Zeile hinzu, die mit „✎ “ beginnt und nur die korrigierte Fassung seines Satzes enthält. Keine Korrekturzeile, wenn alles stimmte.',
      '- Wenn der Lerner auf Russisch schreibt oder um Hilfe bittet, hilf kurz (Russisch erlaubt) und kehre dann zur Rolle zurück.',
      '- Erfinde keine Fakten über echte Institutionen oder Personen.',
      '- Keine Aufzählungen und kein Markdown, nur gesprochene Sprache.'
    ].filter(Boolean).join('\n');
  },

  evaluate: function (sc, turns) {
    var log = turns.map(function (t) { return (t.role === 'user' ? 'LERNER: ' : 'PARTNER: ') + t.content.replace(/\n✎ .*$/s, ''); }).join('\n');
    return [
      'Du bist Deutschlehrer und bewertest ein Übungsgespräch. Situation: ' + (sc.title || '') + '. ' + (sc.role || ''),
      this.learner(),
      'Bewerte NUR die Beiträge des LERNERS. Der Lerner ist B1–B2; sei ehrlich, aber ermutigend.',
      'Antworte nur mit JSON in genau dieser Form:',
      '{"scores":{"grammatik":1-5,"wortschatz":1-5,"fachsprache":1-5,"ausdruck":1-5},',
      ' "summary_ru":"2–4 Sätze auf Russisch: was gut war, was als Nächstes zu üben ist",',
      ' "errors":[{"wrong":"Originalformulierung des Lerners","right":"korrigierte Fassung","why_ru":"kurze Erklärung auf Russisch","cat":"adj|kasus|verbstellung|tempus|praep|artikel|wortwahl|rektion|konj|andere"}],',
      ' "better":[{"yours":"Formulierung des Lerners","better":"natürlichere, professionellere Fassung"}],',
      ' "phrases":[{"de":"nützliche Wendung für diese Situation","ru":"Übersetzung"}]}',
      'Höchstens 10 errors (die wichtigsten zuerst, keine Zeichensetzung), höchstens 4 better, höchstens 5 phrases.',
      'GESPRÄCH:', log
    ].join('\n');
  },

  check: function (task, answers, user) {
    return [
      'Prüfe die Antwort eines Deutschlerners (B1–B2) auf eine Übungsaufgabe.',
      'AUFGABE: ' + task,
      'MUSTERLÖSUNG(EN): ' + answers.join(' || '),
      'ANTWORT DES LERNERS: ' + user,
      'Ist die Antwort grammatisch korrekt und erfüllt sie die Aufgabe (auch wenn sie anders formuliert ist als die Musterlösung)? Großschreibung und Satzzeichen nicht bewerten.',
      'Antworte nur mit JSON: {"ok":true|false,"right":"korrigierte Fassung der Lernerantwort (oder die Antwort selbst, wenn sie stimmt)","why_ru":"1–2 Sätze auf Russisch"}'
    ].join('\n');
  },

  explainDrill: function (task, right, user) {
    return [
      'Ein Deutschlerner (B1–B2, Muttersprache Russisch) hat bei einer Übung geantwortet.',
      'AUFGABE: ' + task, 'RICHTIG: ' + right, 'LERNER: ' + (user || '(keine Antwort)'),
      'Erkläre auf Russisch in 2–4 kurzen Sätzen, warum die richtige Lösung so lautet und was am Lernerbeitrag falsch ist. Nenne die Regel und ein zweites kurzes Beispiel auf Deutsch. Kein Markdown.'
    ].join('\n');
  },

  retell: function (text, user) {
    return [
      'Ein Deutschlerner (B1–B2) hat diesen Text mündlich nacherzählt (per Spracheingabe, Satzzeichen nicht bewerten).',
      'TEXT: ' + text.slice(0, 3000),
      'NACHERZÄHLUNG: ' + user,
      'Antworte nur mit JSON: {"ru":"Rückmeldung auf Russisch, 2–3 Sätze: Inhalt und Sprache","de":"korrigierte, natürliche Fassung der Nacherzählung auf Deutsch (gleicher Umfang)","errors":[{"wrong":"…","right":"…","why_ru":"…","cat":"adj|kasus|verbstellung|tempus|praep|artikel|wortwahl|rektion|konj|andere"}]}',
      'Höchstens 6 errors.'
    ].join('\n');
  },

  monologue: function (topic, user) {
    return [
      'Ein Deutschlerner (B1–B2) hat einen kurzen Monolog zum Thema „' + topic + '“ gehalten (per Spracheingabe, Satzzeichen nicht bewerten).',
      this.learner(),
      'MONOLOG: ' + user,
      'Antworte nur mit JSON: {"ru":"Rückmeldung auf Russisch, 2–3 Sätze","de":"verbesserte Fassung, natürlich und professionell, ähnlich lang","errors":[{"wrong":"…","right":"…","why_ru":"…","cat":"adj|kasus|verbstellung|tempus|praep|artikel|wortwahl|rektion|konj|andere"}]}',
      'Höchstens 8 errors.'
    ].join('\n');
  },

  interviewAnswer: function (q, user) {
    return [
      'Vorstellungsgespräch-Training. Stelle: Gutachter für Immobilienbewertung bzw. Kreditsicherheiten bei einer Sparkasse oder einem Gutachterbüro.',
      this.learner(),
      'FRAGE: ' + q.q, 'HINWEIS FÜR GUTE ANTWORT: ' + (q.tip || ''),
      'ANTWORT DES BEWERBERS (diktiert): ' + user,
      'Antworte nur mit JSON: {"score":1-5,"ru":"Rückmeldung auf Russisch: Inhalt, Wirkung, Sprache (3–4 Sätze)","de":"verbesserte Musterantwort in der Ich-Form, 60–120 Wörter, passend zum Profil des Bewerbers","errors":[{"wrong":"…","right":"…","why_ru":"…","cat":"adj|kasus|verbstellung|tempus|praep|artikel|wortwahl|rektion|konj|andere"}]}',
      'Höchstens 6 errors.'
    ].join('\n');
  },

  moreDrills: function (u, n) {
    var sample = (u.drills || []).slice(0, 6).map(function (x) { return JSON.stringify(x); }).join('\n');
    return [
      'Erstelle ' + n + ' NEUE Übungen zum Grammatikthema „' + u.de + '“ für einen Deutschlerner B1–B2 (Immobilienbewertung, Bank, Vorstellungsgespräch).',
      this.learner(),
      'Format wie diese Beispiele (Typen gap, transform, translate, fix; bei gap genau ein ___; a = Liste ALLER korrekten Varianten; q bei translate auf Russisch):',
      sample,
      'Antworte nur mit einem JSON-Array von Objekten.'
    ].join('\n');
  },

  /* Tagesinhalte für Tage ab 15 in drei Teilen */
  genVocab: function (o, known) {
    return [
      'Du erstellst Lerninhalte für Tag ' + o[0] + ' eines 13-wöchigen Deutschkurses (B1–B2) für einen Immobiliengutachter.',
      this.learner(),
      'THEMA: ' + o[1] + '. WORTSCHATZ-SCHWERPUNKT: ' + o[2] + '.',
      'Erstelle 18 Einträge: etwa 8 Nomen, 4 Verben, 2 Adjektive/Adverbien, 4 Wendungen (Nomen-Verb-Verbindungen oder Redemittel). Fachlich korrekt nach ImmoWertV 2021, BelWertV, BauGB, WoFlV, GEG.',
      'Diese Wörter und Wendungen kennt der Lerner schon. Nicht noch einmal aufnehmen; bei Wiederholungstagen stattdessen neue, verwandte Wendungen wählen: ' + known.join(', '),
      'Antworte nur mit einem JSON-Array. Jedes Element:',
      '{"kind":"noun|verb|adj|adv|chunk|phrase","de":"Wort ohne Artikel bzw. Wendung","art":"der|die|das (nur Nomen)","pl":"Pluralform oder \\"\\" (nur Nomen)","forms":"3. Sg. – Präteritum – Perfekt (nur Verben)","rek":"Rektion, optional","ru":"russische Übersetzung","ex":"Beispielsatz 8–18 Wörter, Fachkontext","exRu":"Übersetzung","cloze":"ex mit genau einer Lücke ___","ans":"genau der Text aus ex, der in der Lücke fehlt","note":"optionale kurze Anmerkung auf Russisch"}'
    ].join('\n');
  },
  genGrammar: function (o) {
    return [
      'Du erstellst eine Grammatikeinheit für Tag ' + o[0] + ' eines Deutschkurses (B1–B2) für einen Immobiliengutachter. Tagesthema: ' + o[1] + '.',
      this.learner(),
      'GRAMMATIKTHEMA: ' + o[3] + '. Alle Sätze aus dem Fachkontext (' + o[2] + ').',
      'Antworte nur mit einem JSON-Objekt:',
      '{"de":"Titel deutsch","ru":"Titel russisch","rule":"Erklärung auf Russisch als HTML (<p>, <b>, <ul>, <li>, <table>), 600–1400 Zeichen, deutsche Beispiele in <b>",',
      ' "examples":[{"de":"…","ru":"…"}] (5 Stück),',
      ' "drills":[24 Übungen: {"t":"gap","q":"Satz mit genau einem ___","a":["Lücke"],"h":"Hinweis russisch, optional"} | {"t":"choice","q":"… ___ …","o":["a","b","c"],"a":["richtige Option"]} | {"t":"transform","i":"kurze Anweisung","q":"Ausgangssatz","a":["alle korrekten Varianten"]} | {"t":"translate","q":"russischer Satz","a":["deutsche Varianten"]} | {"t":"fix","q":"Satz mit genau einem Fehler","a":["korrigierter Satz"]}; Mischung, leicht → schwer],',
      ' "speak":[10 Sätze zum mündlichen Übersetzen: {"ru":"…","de":"…"}, 6–16 Wörter, mit dieser Grammatik]}'
    ].join('\n');
  },
  genPractice: function (o, review) {
    return [
      'Du erstellst Übungsmaterial für Tag ' + o[0] + ' eines Deutschkurses (B1–B2) für einen Immobiliengutachter, der sich bei Sparkassen und Gutachterbüros bewirbt.',
      this.learner(),
      'THEMA: ' + o[1] + '. WORTSCHATZ: ' + o[2] + '. GESPRÄCH: ' + o[4] + '.',
      review ? 'Dies ist ein Wochenrückblick: Das Gespräch ist ein Probe-Vorstellungsgespräch bzw. Fachgespräch mit Fragen aus der ganzen Woche.' : '',
      'Fiktive Orte (z. B. Musterstadt im Ruhrgebiet), keine erfundenen Fakten über reale Institutionen.',
      'Antworte nur mit einem JSON-Objekt:',
      '{"ru":"russischer Tagestitel",',
      ' "text":{"kind":"Textsorte","title":"…","de":"Text 150–250 Wörter, Absätze mit \\n\\n","ru":"Zusammenfassung russisch, 1 Satz","q":[{"q":"Frage","o":["A","B","C"],"a":0}] (4 Fragen),"retell":"Anweisung zum Nacherzählen","gl":[{"de":"Begriff mit Artikel","ru":"…"}] (6–8)},',
      ' "scenario":{"kind":"interview|roleplay|fach","title":"…","ru":"…","role":"Anweisung an Claude, 2–5 Sätze, Rolle und Situation, siezen","goal":"Ziel für den Lerner auf Russisch","open":"erste Replik","steps":["3–6 Gesprächsschritte"],"use":["6–8 Zielwendungen"],"facts":"Datenkarte oder leer"},',
      ' "fluency":{"topic":"Thema für einen Monolog","ru":"…","points":["4–6 Stichpunkte"],"model":"Mustermonolog 120–160 Wörter, Ich-Form","shadow":["8 Sätze zum Nachsprechen"]}}'
    ].join('\n');
  },

  binder: function () {
    return [
      'Auf dem Foto ist eine Seite aus Lernunterlagen zur Immobilienbewertung (Deutschland).',
      'Wähle bis zu 15 fachlich wichtige Begriffe und Wendungen aus, die ein Gutachter aktiv benutzen sollte.',
      'Antworte nur mit einem JSON-Array: [{"de":"Wort ohne Artikel bzw. Wendung","art":"der|die|das oder leer","pl":"Plural oder leer","ru":"russische Übersetzung","ex":"kurzer Beispielsatz aus dem Fachkontext","exRu":"Übersetzung"}]',
      'Wenn die Seite unlesbar ist, antworte mit [].'
    ].join('\n');
  },

  examPhoto: function () {
    return [
      'Auf dem Foto sind Multiple-Choice-Prüfungsfragen zur Immobilienbewertung (z. B. DEKRA D1, Folie oder Buchseite). Grün oder anders markierte Antworten sind die richtigen.',
      '„(1+)“ bedeutet: eine oder mehrere Antworten sind richtig, „(1)“: genau eine.',
      'Antworte nur mit einem JSON-Array, ein Objekt pro Frage:',
      '[{"kind":"mc","id":"Fragecode vom Foto oder leer","q":"Fragetext","multi":true|false,"o":["Antwort 1","Antwort 2","…"],"a":[Indizes der richtigen Antworten, ab 0],"marked":true|false,"ru":"Erklärung auf Russisch, 2–4 Sätze: warum richtig/falsch","say":"Begründung auf Deutsch in 1–2 Sätzen, die der Lerner mündlich sagen kann"}]',
      'Rechenaufgaben (z. B. „O-004“, Daten und „max. n Punkte“) stattdessen so: {"kind":"calc","id":"…","q":"vollständige Aufgabe mit allen Daten, Zeilen mit \\n","points":"max. n Punkte","solution":["Schritt 1 mit Rechnung","…"],"answer":"Ergebnis","ru":"Erklärung auf Russisch","say":"Rechenweg in 2–4 Sätzen zum Nachsprechen"}. Offene Fragen ohne Antworten: "kind":"open" mit "answer" (Musterantwort) und "solution" (Stichpunkte).',
      'Texte genau abschreiben. Wenn keine Markierung erkennbar ist, bestimme die richtigen Antworten fachlich, setze "marked": false und schreibe in "ru", dass dies Claudes Einschätzung ist.',
      'Wenn nichts lesbar ist, antworte mit [].'
    ].join('\n');
  },
  examExplain: function (x, user) {
    return [
      'Prüfungstraining Immobilienbewertung (DEKRA D1). Der Lerner (Deutsch B1–B2) begründet mündlich (diktiert) die richtige Lösung einer Prüfungsfrage.',
      'FRAGE / AUFGABE: ' + x.q,
      x.kind === 'calc' || x.kind === 'open'
        ? 'MUSTERLÖSUNG: ' + (Array.isArray(x.solution) ? x.solution : x.solution ? [String(x.solution)] : []).join(' | ') + (x.answer ? ' | ERGEBNIS: ' + x.answer : '')
        : 'RICHTIGE ANTWORT(EN): ' + x.a.map(function (i) { return x.o[i]; }).join(' | ') + '\nFALSCHE ANTWORTEN: ' + x.o.filter(function (_, i) { return x.a.indexOf(i) < 0; }).join(' | '),
      (x.kind === 'calc' ? 'RECHENWEG DES LERNERS (mündlich erklärt): ' : 'BEGRÜNDUNG DES LERNERS: ') + user,
      'Antworte nur mit JSON: {"score":1-5,"ru":"Rückmeldung auf Russisch: fachlich richtig? sprachlich? 2–3 Sätze","de":"fachlich präzise, gut sprechbare Musterbegründung in 2–4 Sätzen, nah an der Formulierung des Lerners","errors":[{"wrong":"…","right":"…","why_ru":"…","cat":"adj|kasus|verbstellung|tempus|praep|artikel|wortwahl|rektion|konj|andere"}]}',
      'Höchstens 6 errors.'
    ].join('\n');
  },

  improvePitch: function (pitch) {
    return [
      'Verbessere diese Selbstpräsentation für ein Vorstellungsgespräch (Stelle: Gutachter / Sachbearbeiter Kreditsicherheiten bei einer Sparkasse).',
      this.learner(),
      'Ziel: etwa 2 Minuten gesprochen (220–280 Wörter), natürlich, selbstbewusst, Niveau B2, gut sprechbar (kurze Sätze), keine Floskeln. Fakten nicht erfinden.',
      'TEXT: ' + pitch,
      'Antworte nur mit dem verbesserten Text.'
    ].join('\n');
  }
};
