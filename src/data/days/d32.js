var D = window.D || (window.D = {});
D.days = D.days || {};
D.days[32] = {
 "d": 32,
 "type": "lesson",
 "de": "Ertragswertverfahren II: Liegenschaftszinssatz und Kapitalisierung",
 "ru": "Доходный подход II: ставка капитализации и капитализация дохода",
 "vocab": [
  {
   "id": "v32-001",
   "kind": "noun",
   "de": "Ertragswert",
   "art": "der",
   "pl": "Ertragswerte",
   "ru": "стоимость по доходному подходу (доходная стоимость)",
   "ex": "Bei vermieteten Mehrfamilienhäusern leite ich den Verkehrswert in erster Linie aus dem Ertragswert ab.",
   "exRu": "Для сдаваемых в аренду многоквартирных домов я вывожу рыночную стоимость прежде всего из доходной стоимости.",
   "cloze": "Bei vermieteten Mehrfamilienhäusern leite ich den Verkehrswert in erster Linie aus dem ___ ab.",
   "ans": "Ertragswert",
   "col": [
    "den Ertragswert ermitteln",
    "der vorläufige Ertragswert",
    "der Ertragswert der baulichen Anlagen"
   ],
   "note": "Результат доходного подхода (Ertragswertverfahren, §§ 27–34 ImmoWertV). ableiten aus + Dat.: aus dem Ertragswert. Gen.: des Ertragswerts / des Ertragswertes."
  },
  {
   "id": "v32-002",
   "kind": "noun",
   "de": "Liegenschaftszinssatz",
   "art": "der",
   "pl": "Liegenschaftszinssätze",
   "ru": "ставка капитализации для недвижимости (выводится комитетом экспертов из цен сделок)",
   "ex": "Den Liegenschaftszinssatz für Mehrfamilienhäuser entnehme ich dem Grundstücksmarktbericht des Gutachterausschusses.",
   "exRu": "Ставку капитализации для многоквартирных домов я беру из отчёта о рынке недвижимости комитета экспертов.",
   "cloze": "Den ___ für Mehrfamilienhäuser entnehme ich dem Grundstücksmarktbericht des Gutachterausschusses.",
   "ans": "Liegenschaftszinssatz",
   "col": [
    "den Liegenschaftszinssatz ableiten",
    "der objektspezifisch angepasste Liegenschaftszinssatz (§ 33 ImmoWertV)",
    "den Liegenschaftszinssatz mit 4,0 % ansetzen"
   ],
   "note": "§ 21 Abs. 2 ImmoWertV: ставка, с которой рыночные стоимости объектов данного типа в среднем приносят обычный для рынка доход. Сокращения: LZ, LiZi. der Satz → die Sätze, поэтому мн. ч. Liegenschaftszinssätze (умлаут)."
  },
  {
   "id": "v32-003",
   "kind": "noun",
   "de": "Bodenwertverzinsung",
   "art": "die",
   "pl": "",
   "ru": "доход, приходящийся на землю (процент на стоимость земли)",
   "ex": "Bei einem Bodenwert von 175.000 Euro und 4 Prozent beträgt die Bodenwertverzinsung 7.000 Euro.",
   "exRu": "При стоимости земли 175 000 евро и ставке 4 % доход, приходящийся на землю, составляет 7000 евро.",
   "cloze": "Bei einem Bodenwert von 175.000 Euro und 4 Prozent beträgt die ___ 7.000 Euro.",
   "ans": "Bodenwertverzinsung",
   "col": [
    "die Bodenwertverzinsung abziehen",
    "der Bodenwertverzinsungsbetrag",
    "Bodenwert × Liegenschaftszinssatz"
   ],
   "note": "Земля не изнашивается, поэтому её «вечную» долю дохода вычитают из Reinertrag; на RND капитализируют только остаток (Gebäudereinertrag), а Bodenwert прибавляют в конце. Ставка — тот же Liegenschaftszinssatz."
  },
  {
   "id": "v32-004",
   "kind": "noun",
   "de": "Barwertfaktor",
   "art": "der",
   "pl": "Barwertfaktoren",
   "ru": "коэффициент приведённой стоимости (капитализации или дисконтирования)",
   "ex": "Bei 4 Prozent und 35 Jahren Restnutzungsdauer beträgt der Barwertfaktor für die Kapitalisierung rund 18,66.",
   "exRu": "При 4 % и оставшемся сроке 35 лет коэффициент капитализации составляет около 18,66.",
   "cloze": "Bei 4 Prozent und 35 Jahren Restnutzungsdauer beträgt der ___ für die Kapitalisierung rund 18,66.",
   "ans": "Barwertfaktor",
   "col": [
    "der Kapitalisierungsfaktor (§ 34 Abs. 2 ImmoWertV)",
    "der Abzinsungsfaktor (§ 34 Abs. 3 ImmoWertV)",
    "den Barwertfaktor berechnen"
   ],
   "note": "Общее понятие: для ряда ежегодных доходов — Kapitalisierungsfaktor, для разовой суммы в будущем — Abzinsungsfaktor. Значения, которых нет в таблице, рассчитывают по формуле, а не интерполируют. Мн. ч.: die Barwertfaktoren (ударение на -to-)."
  },
  {
   "id": "v32-005",
   "kind": "noun",
   "de": "Gebäudereinertrag",
   "art": "der",
   "pl": "Gebäudereinerträge",
   "ru": "чистый доход, приходящийся на здание",
   "ex": "Zieht man die Bodenwertverzinsung vom Reinertrag ab, bleibt ein Gebäudereinertrag von 21.500 Euro.",
   "exRu": "Если вычесть из чистого дохода долю земли, остаётся чистый доход здания в размере 21 500 евро.",
   "cloze": "Zieht man die Bodenwertverzinsung vom Reinertrag ab, bleibt ein ___ von 21.500 Euro.",
   "ans": "Gebäudereinertrag",
   "col": [
    "den Gebäudereinertrag ermitteln",
    "der Reinertragsanteil der baulichen Anlagen",
    "Reinertrag minus Bodenwertverzinsung"
   ],
   "note": "Gebäude + Reinertrag: доля чистого дохода, которую «зарабатывает» здание; именно её умножают на Barwertfaktor. В примере — условие без wenn: Zieht man … ab, bleibt …"
  },
  {
   "id": "v32-006",
   "kind": "noun",
   "de": "Kapitalisierung",
   "art": "die",
   "pl": "Kapitalisierungen",
   "ru": "капитализация (пересчёт будущих доходов в текущую стоимость)",
   "ex": "Für die Kapitalisierung des Gebäudereinertrags wird derselbe Zinssatz verwendet wie für die Bodenwertverzinsung.",
   "exRu": "Для капитализации чистого дохода здания используется та же ставка, что и для расчёта дохода на землю.",
   "cloze": "Für die ___ des Gebäudereinertrags wird derselbe Zinssatz verwendet wie für die Bodenwertverzinsung.",
   "ans": "Kapitalisierung",
   "col": [
    "die Kapitalisierung der Reinerträge",
    "der Kapitalisierungszinssatz",
    "einen Ertrag kapitalisieren"
   ],
   "note": "Годовой доход × Barwertfaktor = сегодняшняя стоимость ряда будущих доходов. Не путать с рыночной капитализацией компании. derselbe … wie — «тот же, что и»."
  },
  {
   "id": "v32-007",
   "kind": "noun",
   "de": "Vervielfältiger",
   "art": "der",
   "pl": "Vervielfältiger",
   "ru": "мультипликатор (прежнее название коэффициента капитализации)",
   "ex": "Die BelWertV bezeichnet den Kapitalisierungsfaktor auch heute noch als Vervielfältiger.",
   "exRu": "В BelWertV коэффициент капитализации и сегодня называется Vervielfältiger.",
   "cloze": "Die BelWertV bezeichnet den Kapitalisierungsfaktor auch heute noch als ___.",
   "ans": "Vervielfältiger",
   "col": [
    "den Reinertrag mit dem Vervielfältiger multiplizieren",
    "der Vervielfältiger nach § 12 BelWertV",
    "der Rohertragsvervielfältiger"
   ],
   "note": "Мн. ч. = ед. ч.: die Vervielfältiger, Dat. Pl.: mit den Vervielfältigern. В ImmoWertV 2021 говорят Kapitalisierungsfaktor (Barwertfaktor); Vervielfältiger — термин § 12 BelWertV и старых заключений. Rohertragsvervielfältiger — другое: цена (стоимость) : годовой валовой доход."
  },
  {
   "id": "v32-008",
   "kind": "noun",
   "de": "Rendite",
   "art": "die",
   "pl": "Renditen",
   "ru": "доходность",
   "ex": "Für Kapitalanleger ist die erzielbare Rendite das wichtigste Kriterium beim Kauf eines Mehrfamilienhauses.",
   "exRu": "Для инвесторов достижимая доходность — главный критерий при покупке многоквартирного дома.",
   "cloze": "Für Kapitalanleger ist die erzielbare ___ das wichtigste Kriterium beim Kauf eines Mehrfamilienhauses.",
   "ans": "Rendite",
   "col": [
    "eine Rendite erzielen",
    "die Nettoanfangsrendite",
    "die Rendite liegt bei … Prozent"
   ],
   "note": "Ударение: Ren-DI-te. Liegenschaftszinssatz — не просто доходность: в первом приближении он близок к Reinertrag : Kaufpreis (Nettoanfangsrendite), но дополнительно учитывает стоимость земли и RND."
  },
  {
   "id": "v32-009",
   "kind": "verb",
   "de": "verzinsen",
   "forms": "verzinst – verzinste – hat verzinst",
   "rek": "etw. (Akk.) mit … % verzinsen; sich verzinsen",
   "ru": "начислять проценты; sich verzinsen — приносить процентный доход",
   "ex": "Ein Käufer erwartet, dass sich sein eingesetztes Kapital mit mindestens 4 Prozent verzinst.",
   "exRu": "Покупатель ожидает, что вложенный капитал будет приносить не менее 4 % в год.",
   "cloze": "Ein Käufer erwartet, dass sich sein eingesetztes Kapital mit mindestens 4 Prozent ___.",
   "ans": "verzinst",
   "col": [
    "sich marktüblich verzinsen",
    "die Verzinsung des Kapitals",
    "verzinst werden"
   ],
   "note": "Неотделяемая приставка ver-: Partizip без ge- (verzinst). В придаточном sich стоит рано: dass sich sein Kapital … verzinst. der Zins — ставка; die Zinsen — проценты как сумма."
  },
  {
   "id": "v32-010",
   "kind": "verb",
   "de": "abzinsen",
   "forms": "zinst ab – zinste ab – hat abgezinst",
   "rek": "etw. (Akk.) (auf + Akk.) abzinsen",
   "ru": "дисконтировать",
   "ex": "Im vereinfachten Verfahren wird der Bodenwert über die Restnutzungsdauer auf den Stichtag abgezinst.",
   "exRu": "В упрощённом методе стоимость земли дисконтируется на дату оценки за период оставшегося срока.",
   "cloze": "Im vereinfachten Verfahren wird der Bodenwert über die Restnutzungsdauer auf den Stichtag ___.",
   "ans": "abgezinst",
   "col": [
    "auf den Wertermittlungsstichtag abzinsen",
    "der Abzinsungsfaktor",
    "aufzinsen ↔ abzinsen"
   ],
   "note": "Отделяемая приставка: Ich zinse den Bodenwert ab; с zu: abzuzinsen. Синоним: diskontieren. Abzinsungsfaktor = 1 / qⁿ (§ 34 Abs. 3 ImmoWertV)."
  },
  {
   "id": "v32-011",
   "kind": "verb",
   "de": "reagieren",
   "forms": "reagiert – reagierte – hat reagiert",
   "rek": "auf + Akk. reagieren",
   "ru": "реагировать (на)",
   "ex": "Der Ertragswert reagiert deutlich auf kleine Änderungen des Liegenschaftszinssatzes.",
   "exRu": "Доходная стоимость заметно реагирует на небольшие изменения ставки капитализации.",
   "cloze": "Der Ertragswert ___ deutlich auf kleine Änderungen des Liegenschaftszinssatzes.",
   "ans": "reagiert",
   "col": [
    "empfindlich auf etw. reagieren",
    "mit Verzögerung reagieren",
    "Worauf reagiert der Wert?"
   ],
   "note": "reagieren auf + Akk.: auf die Zinsänderung, auf den Anstieg. Вопрос: Worauf? Ответ с придаточным: darauf, dass …"
  },
  {
   "id": "v32-012",
   "kind": "verb",
   "de": "ausweisen",
   "forms": "weist aus – wies aus – hat ausgewiesen",
   "rek": "etw. (Akk.) ausweisen",
   "ru": "указывать, приводить (в отчёте, в таблице)",
   "ex": "Für Mehrfamilienhäuser wird im Grundstücksmarktbericht eine Spanne von 3,5 bis 4,5 Prozent ausgewiesen.",
   "exRu": "Для многоквартирных домов в отчёте о рынке указан диапазон от 3,5 до 4,5 %.",
   "cloze": "Für Mehrfamilienhäuser wird im Grundstücksmarktbericht eine Spanne von 3,5 bis 4,5 Prozent ___.",
   "ans": "ausgewiesen",
   "col": [
    "im Marktbericht ausgewiesen",
    "gesondert ausweisen",
    "einen Wert ausweisen"
   ],
   "note": "Отделяемый сильный глагол: Der Bericht weist … aus; wies aus; ausgewiesen. Другие значения: sich ausweisen — предъявлять документ; Bauland ausweisen — отводить под застройку."
  },
  {
   "id": "v32-013",
   "kind": "adj",
   "de": "empfindlich",
   "ru": "чувствительный",
   "ex": "Weil der Ertragswert sehr empfindlich auf den Zinssatz reagiert, zeige ich im Gutachten eine Sensitivitätsrechnung.",
   "exRu": "Поскольку доходная стоимость очень чувствительна к ставке, я привожу в заключении расчёт чувствительности.",
   "cloze": "Weil der Ertragswert sehr ___ auf den Zinssatz reagiert, zeige ich im Gutachten eine Sensitivitätsrechnung.",
   "ans": "empfindlich",
   "col": [
    "empfindlich auf + Akk. reagieren",
    "empfindlich gegenüber Zinsänderungen",
    "die Sensitivitätsanalyse"
   ],
   "note": "empfindlich auf + Akk. reagieren / empfindlich gegenüber + Dat. Существительное: die Empfindlichkeit; в расчётах чаще говорят die Sensitivität."
  },
  {
   "id": "v32-014",
   "kind": "adj",
   "de": "nachschüssig",
   "ru": "постнумерандо (платёж в конце периода)",
   "ex": "Nach ImmoWertV wird jährlich nachschüssig kapitalisiert, obwohl Mieten meist monatlich im Voraus gezahlt werden.",
   "exRu": "По ImmoWertV капитализация производится ежегодно постнумерандо, хотя арендную плату обычно вносят помесячно авансом.",
   "cloze": "Nach ImmoWertV wird jährlich ___ kapitalisiert, obwohl Mieten meist monatlich im Voraus gezahlt werden.",
   "ans": "nachschüssig",
   "col": [
    "jährlich nachschüssig",
    "vorschüssig ↔ nachschüssig",
    "der nachschüssige Rentenbarwertfaktor"
   ],
   "note": "Модель условно считает, что годовой доход поступает в конце года; vorschüssig — в начале периода. Это сознательное упрощение модели ImmoWertV."
  },
  {
   "id": "v32-015",
   "kind": "chunk",
   "de": "über die Restnutzungsdauer kapitalisieren",
   "ru": "капитализировать на оставшийся срок экономической жизни",
   "ex": "Den Gebäudereinertrag kapitalisiere ich über die Restnutzungsdauer von 35 Jahren.",
   "exRu": "Чистый доход здания я капитализирую на оставшийся срок 35 лет.",
   "cloze": "Den Gebäudereinertrag ___ ich über die Restnutzungsdauer von 35 Jahren.",
   "ans": "kapitalisiere",
   "col": [
    "über 35 Jahre kapitalisieren",
    "die Restnutzungsdauer (RND)",
    "die Kapitalisierungsdauer"
   ],
   "note": "über + Akk. = «на протяжении»: über die Restnutzungsdauer, über 35 Jahre. Землю на срок не капитализируют — она не изнашивается."
  },
  {
   "id": "v32-016",
   "kind": "chunk",
   "de": "das vereinfachte Ertragswertverfahren",
   "ru": "упрощённый доходный подход (§ 29 ImmoWertV)",
   "ex": "Das vereinfachte Ertragswertverfahren führt bei gleichen Ansätzen zum selben Ergebnis wie das allgemeine.",
   "exRu": "Упрощённый доходный подход при тех же исходных данных даёт тот же результат, что и общий.",
   "cloze": "Das ___ Ertragswertverfahren führt bei gleichen Ansätzen zum selben Ergebnis wie das allgemeine.",
   "ans": "vereinfachte",
   "col": [
    "das allgemeine Ertragswertverfahren (§ 28 ImmoWertV)",
    "das periodische Ertragswertverfahren (§ 30 ImmoWertV)",
    "den Bodenwert abzinsen"
   ],
   "note": "Формула: весь Reinertrag × Kapitalisierungsfaktor + дисконтированный Bodenwert (без вычета Bodenwertverzinsung). Математически равен общему методу, отличается только структура расчёта. Окончания: das vereinfachte, im vereinfachten Verfahren."
  },
  {
   "id": "v32-017",
   "kind": "phrase",
   "de": "Ein höherer Liegenschaftszinssatz führt zu einem niedrigeren Ertragswert.",
   "ru": "Более высокая ставка капитализации ведёт к более низкой доходной стоимости.",
   "ex": "Ein höherer Liegenschaftszinssatz führt zu einem niedrigeren Ertragswert.",
   "exRu": "Более высокая ставка капитализации ведёт к более низкой доходной стоимости.",
   "cloze": "Ein höherer Liegenschaftszinssatz führt zu einem ___ Ertragswert.",
   "ans": "niedrigeren",
   "col": [
    "zu einem höheren Wert führen",
    "Steigt der Zinssatz, sinkt der Wert.",
    "je höher …, desto niedriger …"
   ],
   "note": "führen zu + Dat.: zu einem niedrigeren Ertragswert (-en после einem). Действуют два эффекта: Barwertfaktor становится меньше, а Bodenwertverzinsung — больше."
  },
  {
   "id": "v32-018",
   "kind": "phrase",
   "de": "Der Liegenschaftszinssatz ist kein Kapitalmarktzins, sondern wird aus Kaufpreisen abgeleitet.",
   "ru": "Ставка капитализации — не ставка рынка капитала: её выводят из цен реальных сделок.",
   "ex": "Der Liegenschaftszinssatz ist kein Kapitalmarktzins, sondern wird aus Kaufpreisen abgeleitet.",
   "exRu": "Ставка капитализации — не ставка рынка капитала: её выводят из цен реальных сделок.",
   "cloze": "Der Liegenschaftszinssatz ist kein Kapitalmarktzins, sondern wird aus Kaufpreisen ___.",
   "ans": "abgeleitet",
   "col": [
    "aus Kaufpreisen und Reinerträgen ableiten",
    "kein …, sondern …",
    "der Kapitalmarktzins / der Bauzins"
   ],
   "note": "kein + существительное …, sondern … — «не…, а…». Ставки по кредитам влияют на него лишь косвенно и с запаздыванием — через цены сделок."
  }
 ],
 "grammar": {
  "id": "g-d32",
  "de": "Bedingungen ohne „wenn“: Verberststellung, bei + Nomen, angenommen",
  "ru": "Условие без wenn: глагол на первом месте, bei + существительное, angenommen / vorausgesetzt",
  "rule": "<p>В анализе чувствительности условие часто выражают <b>без wenn</b>. В отличие от оговорок Tag 20 (sofern, soweit) это язык расчёта: меняется X → меняется Y.</p><table><tr><th>Способ</th><th>Пример</th></tr><tr><td>глагол на 1-м месте</td><td><b>Steigt der Liegenschaftszinssatz, (so/dann) sinkt der Ertragswert.</b></td></tr><tr><td><b>bei</b> + Dat.</td><td><b>Bei einem Zinssatz von 4,5 % ergibt sich ein niedrigerer Wert.</b></td></tr><tr><td><b>im Fall(e)</b> + Gen.</td><td><b>Im Fall eines höheren Zinssatzes sinkt der Wert.</b></td></tr><tr><td><b>ohne</b> + Akk.</td><td><b>Ohne Abzug der Bodenwertverzinsung wäre der Wert überhöht.</b></td></tr><tr><td><b>angenommen, vorausgesetzt, gesetzt den Fall</b></td><td><b>Angenommen, die Mieten bleiben stabil, dann …</b></td></tr></table><ul><li>Главное предложение после него тоже начинается с глагола: <b>…, sinkt der Ertragswert</b>, а не <i>der Ertragswert sinkt</i>.</li><li>После bei — Dativ: <b>bei einem höheren Zinssatz, bei einer Restnutzungsdauer von 25 Jahren, bei gleichbleibenden Mieten</b>.</li><li>После <b>angenommen,</b> / <b>vorausgesetzt,</b> — обычный порядок слов; с <b>dass</b> глагол уходит в конец.</li><li>Реальный сценарий — Indikativ, гипотеза — <b>Konjunktiv II</b>: <b>Läge der Zinssatz bei 4,5 %, ergäbe sich …</b></li></ul><p>Формы: liegen → <b>läge</b>, ergeben → <b>ergäbe</b>, betragen → <b>betrüge</b>, sein → <b>wäre</b>; у других обычно <b>würde</b> + Infinitiv: <b>würde … sinken</b>.</p>",
  "examples": [
   {
    "de": "Steigt der Liegenschaftszinssatz, sinkt der Ertragswert.",
    "ru": "Если ставка капитализации растёт, доходная стоимость снижается."
   },
   {
    "de": "Bei einem Liegenschaftszinssatz von 4,5 Prozent ergibt sich ein Ertragswert von rund 535.000 Euro.",
    "ru": "При ставке капитализации 4,5 % получается доходная стоимость около 535 000 евро."
   },
   {
    "de": "Betrüge die Restnutzungsdauer nur 25 Jahre, läge der Wert rund 11 Prozent niedriger.",
    "ru": "Если бы оставшийся срок составлял лишь 25 лет, стоимость была бы примерно на 11 % ниже."
   },
   {
    "de": "Ohne Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht.",
    "ru": "Без вычета дохода, приходящегося на землю, доходная стоимость была бы завышена."
   },
   {
    "de": "Den Liegenschaftszinssatz aus dem Marktbericht übernehme ich, vorausgesetzt, das Objekt passt zum Modell.",
    "ru": "Ставку из отчёта о рынке я принимаю при условии, что объект соответствует модели."
   },
   {
    "de": "Angenommen, die Mieten bleiben stabil, dann hängt das Ergebnis vor allem vom Zinssatz ab.",
    "ru": "Допустим, арендные ставки останутся стабильными — тогда результат зависит прежде всего от ставки."
   }
  ],
  "drills": [
   {
    "t": "gap",
    "q": "___ der Liegenschaftszinssatz, sinkt der Ertragswert. (steigen, Präsens)",
    "a": [
     "Steigt"
    ],
    "h": "Условие без wenn: спрягаемый глагол стоит на первом месте."
   },
   {
    "t": "gap",
    "q": "Sinkt der Liegenschaftszinssatz, ___ der Ertragswert. (steigen, Präsens)",
    "a": [
     "steigt",
     "so steigt",
     "dann steigt"
    ],
    "h": "Главное предложение после такого условия тоже начинается с глагола (перед ним можно so или dann)."
   },
   {
    "t": "gap",
    "q": "Bei ___ Liegenschaftszinssatz von 4,5 Prozent ergibt sich ein niedrigerer Ertragswert. (unbestimmter Artikel)",
    "a": [
     "einem"
    ],
    "h": "bei + Dativ; der Liegenschaftszinssatz — мужской род → bei einem."
   },
   {
    "t": "gap",
    "q": "Bei einer Restnutzungsdauer von 25 ___ ist der Barwertfaktor deutlich niedriger. (das Jahr)",
    "a": [
     "Jahren"
    ],
    "h": "von + Dativ, мн. ч.: die Jahre → von 25 Jahren (Dativ Plural на -n)."
   },
   {
    "t": "choice",
    "q": "Ich übernehme den Liegenschaftszinssatz aus dem Marktbericht, ___, das Objekt passt zum Modell des Gutachterausschusses.",
    "o": [
     "vorbehaltlich",
     "vorausgesetzt",
     "gesetzt"
    ],
    "a": [
     "vorausgesetzt"
    ],
    "h": "vorausgesetzt, + обычный порядок слов = «при условии, что». После vorbehaltlich нужно существительное в Genitiv, а gesetzt работает только в формуле gesetzt den Fall."
   },
   {
    "t": "choice",
    "q": "Im Fall ___ höheren Liegenschaftszinssatzes sinkt der Ertragswert.",
    "o": [
     "einem",
     "einen",
     "eines"
    ],
    "a": [
     "eines"
    ],
    "h": "im Fall(e) + Genitiv: eines höheren Liegenschaftszinssatzes (м. р., окончание -es)."
   },
   {
    "t": "choice",
    "q": "Ohne ___ Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht.",
    "o": [
     "den",
     "dem",
     "des"
    ],
    "a": [
     "den"
    ],
    "h": "ohne + Akkusativ: der Abzug → ohne den Abzug (часто и без артикля: ohne Abzug)."
   },
   {
    "t": "transform",
    "i": "Ohne „wenn“ umformen: Verb an erster Stelle.",
    "q": "Wenn der Liegenschaftszinssatz steigt, sinkt der Ertragswert.",
    "a": [
     "Steigt der Liegenschaftszinssatz, sinkt der Ertragswert.",
     "Steigt der Liegenschaftszinssatz, so sinkt der Ertragswert.",
     "Steigt der Liegenschaftszinssatz, dann sinkt der Ertragswert."
    ],
    "h": "Глагол из придаточного переходит на первое место; главное предложение начинается с глагола sinkt."
   },
   {
    "t": "gap",
    "q": "Läge der Liegenschaftszinssatz bei 3,5 Prozent, ___ sich ein Ertragswert von rund 622.500 Euro. (ergeben, Konjunktiv II)",
    "a": [
     "ergäbe",
     "so ergäbe",
     "dann ergäbe"
    ],
    "h": "ergeben – ergab → Konjunktiv II: ergäbe (умлаут + -e)."
   },
   {
    "t": "choice",
    "q": "___ die Restnutzungsdauer nur 25 Jahre, würde der Ertragswert um rund 11 Prozent sinken.",
    "o": [
     "Beträgt",
     "Betrug",
     "Betrüge"
    ],
    "a": [
     "Betrüge"
    ],
    "h": "Следствие гипотетическое (würde … sinken), поэтому и условие в Konjunktiv II: betragen – betrug → betrüge."
   },
   {
    "t": "order",
    "q": "bei / einer Restnutzungsdauer / von 25 Jahren / ergäbe sich / ein deutlich niedrigerer / Ertragswert",
    "a": [
     "Bei einer Restnutzungsdauer von 25 Jahren ergäbe sich ein deutlich niedrigerer Ertragswert.",
     "Ein deutlich niedrigerer Ertragswert ergäbe sich bei einer Restnutzungsdauer von 25 Jahren."
    ]
   },
   {
    "t": "transform",
    "i": "Mit „bei“ + Nomen umformen.",
    "q": "Wenn der Bodenwert hoch ist, hat die Bodenwertverzinsung großes Gewicht.",
    "a": [
     "Bei einem hohen Bodenwert hat die Bodenwertverzinsung großes Gewicht.",
     "Bei hohem Bodenwert hat die Bodenwertverzinsung großes Gewicht.",
     "Die Bodenwertverzinsung hat bei einem hohen Bodenwert großes Gewicht.",
     "Die Bodenwertverzinsung hat bei hohem Bodenwert großes Gewicht."
    ],
    "h": "bei + Dativ: bei einem hohen Bodenwert; без артикля — сильное окончание: bei hohem Bodenwert."
   },
   {
    "t": "translate",
    "q": "Если ставка капитализации снижается, доходная стоимость растёт. (ohne „wenn“: Verb an erster Stelle; der Liegenschaftszinssatz)",
    "a": [
     "Sinkt der Liegenschaftszinssatz, steigt der Ertragswert.",
     "Sinkt der Liegenschaftszinssatz, so steigt der Ertragswert.",
     "Sinkt der Liegenschaftszinssatz, dann steigt der Ertragswert.",
     "Fällt der Liegenschaftszinssatz, steigt der Ertragswert.",
     "Fällt der Liegenschaftszinssatz, so steigt der Ertragswert.",
     "Fällt der Liegenschaftszinssatz, dann steigt der Ertragswert."
    ],
    "h": "Sinkt …, steigt …: оба глагола стоят в начале своих частей."
   },
   {
    "t": "fix",
    "q": "Steigt der Liegenschaftszinssatz, der Ertragswert sinkt.",
    "a": [
     "Steigt der Liegenschaftszinssatz, sinkt der Ertragswert.",
     "Steigt der Liegenschaftszinssatz, so sinkt der Ertragswert.",
     "Steigt der Liegenschaftszinssatz, dann sinkt der Ertragswert."
    ],
    "h": "Условие стоит на первом месте, поэтому главное предложение начинается со спрягаемого глагола: sinkt der Ertragswert."
   },
   {
    "t": "gap",
    "q": "Steigen die Kapitalmarktzinsen, ___ sich die Nachfrage nach Renditeobjekten oft ab. (abschwächen, Präsens)",
    "a": [
     "schwächt",
     "so schwächt",
     "dann schwächt"
    ],
    "h": "Главное предложение начинается с глагола; приставка ab уходит в конец: schwächt sich … ab."
   },
   {
    "t": "transform",
    "i": "Mit „im Fall(e)“ + Genitiv umformen.",
    "q": "Falls die Restnutzungsdauer kürzer ist, ergibt sich ein niedrigerer Ertragswert.",
    "a": [
     "Im Fall einer kürzeren Restnutzungsdauer ergibt sich ein niedrigerer Ertragswert.",
     "Im Falle einer kürzeren Restnutzungsdauer ergibt sich ein niedrigerer Ertragswert.",
     "Ein niedrigerer Ertragswert ergibt sich im Fall einer kürzeren Restnutzungsdauer.",
     "Ein niedrigerer Ertragswert ergibt sich im Falle einer kürzeren Restnutzungsdauer."
    ],
    "h": "im Fall(e) + Genitiv; die Restnutzungsdauer (ж. р.) → einer kürzeren Restnutzungsdauer."
   },
   {
    "t": "translate",
    "q": "При более высокой ставке капитализации получается более низкая доходная стоимость. (bei; der Liegenschaftszinssatz; sich ergeben)",
    "a": [
     "Bei einem höheren Liegenschaftszinssatz ergibt sich ein niedrigerer Ertragswert.",
     "Bei höherem Liegenschaftszinssatz ergibt sich ein niedrigerer Ertragswert.",
     "Ein niedrigerer Ertragswert ergibt sich bei einem höheren Liegenschaftszinssatz.",
     "Ein niedrigerer Ertragswert ergibt sich bei höherem Liegenschaftszinssatz."
    ],
    "h": "bei + Dativ: bei einem höheren …zinssatz; подлежащее в Nominativ: ein niedrigerer Ertragswert."
   },
   {
    "t": "transform",
    "i": "Mit „vorausgesetzt“ umformen; die Bedingung bleibt am Ende.",
    "q": "Die tatsächlichen Mieten werden angesetzt, wenn sie marktüblich erzielbar sind.",
    "a": [
     "Die tatsächlichen Mieten werden angesetzt, vorausgesetzt, sie sind marktüblich erzielbar.",
     "Die tatsächlichen Mieten werden angesetzt, vorausgesetzt, dass sie marktüblich erzielbar sind."
    ],
    "h": "vorausgesetzt, + глагол на 2-м месте (sie sind …) или vorausgesetzt, dass + глагол в конце."
   },
   {
    "t": "order",
    "q": "das Ergebnis / ist / belastbar / vorausgesetzt / die Mieten / sind / nachhaltig erzielbar",
    "a": [
     "Das Ergebnis ist belastbar, vorausgesetzt, die Mieten sind nachhaltig erzielbar.",
     "Vorausgesetzt, die Mieten sind nachhaltig erzielbar, ist das Ergebnis belastbar."
    ]
   },
   {
    "t": "fix",
    "q": "Bei einer Restnutzungsdauer von 25 Jahre ergäbe sich ein niedrigerer Ertragswert.",
    "a": [
     "Bei einer Restnutzungsdauer von 25 Jahren ergäbe sich ein niedrigerer Ertragswert."
    ],
    "h": "von + Dativ мн. ч.: von 25 Jahren."
   },
   {
    "t": "transform",
    "i": "Mit „ohne“ + Nomen umformen (der Abzug); Konjunktiv II bleibt.",
    "q": "Wenn man die Bodenwertverzinsung nicht abziehen würde, wäre der Ertragswert überhöht.",
    "a": [
     "Ohne Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht.",
     "Ohne den Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht.",
     "Der Ertragswert wäre ohne Abzug der Bodenwertverzinsung überhöht.",
     "Der Ertragswert wäre ohne den Abzug der Bodenwertverzinsung überhöht."
    ],
    "h": "ohne + Akkusativ; дополнение к Abzug — в Genitiv: der Bodenwertverzinsung."
   },
   {
    "t": "translate",
    "q": "При неизменных арендных ставках стоимость зависит прежде всего от ставки капитализации. (bei; gleichbleibend; der Wert; vor allem; abhängen von; der Liegenschaftszinssatz)",
    "a": [
     "Bei gleichbleibenden Mieten hängt der Wert vor allem vom Liegenschaftszinssatz ab.",
     "Bei gleichbleibenden Mieten hängt der Wert vor allem von dem Liegenschaftszinssatz ab.",
     "Der Wert hängt bei gleichbleibenden Mieten vor allem vom Liegenschaftszinssatz ab.",
     "Der Wert hängt bei gleichbleibenden Mieten vor allem von dem Liegenschaftszinssatz ab."
    ],
    "h": "bei + Dativ мн. ч. без артикля: gleichbleibenden Mieten (-en); abhängen — отделяемый: hängt … ab."
   },
   {
    "t": "transform",
    "i": "Ohne „wenn“ umformen: Verb an erster Stelle.",
    "q": "Wenn die Restnutzungsdauer nur 25 Jahre betrüge, würde der Ertragswert um rund 11 Prozent sinken.",
    "a": [
     "Betrüge die Restnutzungsdauer nur 25 Jahre, würde der Ertragswert um rund 11 Prozent sinken.",
     "Betrüge die Restnutzungsdauer nur 25 Jahre, würde der Ertragswert um rund 11 % sinken.",
     "Betrüge die Restnutzungsdauer nur 25 Jahre, so würde der Ertragswert um rund 11 Prozent sinken.",
     "Betrüge die Restnutzungsdauer nur 25 Jahre, so würde der Ertragswert um rund 11 % sinken.",
     "Betrüge die Restnutzungsdauer nur 25 Jahre, dann würde der Ertragswert um rund 11 Prozent sinken.",
     "Betrüge die Restnutzungsdauer nur 25 Jahre, dann würde der Ertragswert um rund 11 % sinken."
    ],
    "h": "betrüge переходит на первое место; главное предложение начинается с würde."
   },
   {
    "t": "fix",
    "q": "Der Barwertfaktor bleibt gleich, vorausgesetzt, Zinssatz und Restnutzungsdauer sich nicht ändern.",
    "a": [
     "Der Barwertfaktor bleibt gleich, vorausgesetzt, Zinssatz und Restnutzungsdauer ändern sich nicht.",
     "Der Barwertfaktor bleibt gleich, vorausgesetzt, dass sich Zinssatz und Restnutzungsdauer nicht ändern.",
     "Der Barwertfaktor bleibt gleich, vorausgesetzt, dass Zinssatz und Restnutzungsdauer sich nicht ändern."
    ],
    "h": "После vorausgesetzt без dass — обычный порядок: глагол на 2-м месте (ändern sich nicht). С dass глагол уходит в конец."
   },
   {
    "t": "translate",
    "q": "Если бы оставшийся срок был короче, коэффициент капитализации был бы ниже. (Verb an erster Stelle; Konjunktiv II; der Barwertfaktor; niedriger)",
    "a": [
     "Wäre die Restnutzungsdauer kürzer, wäre der Barwertfaktor niedriger.",
     "Wäre die Restnutzungsdauer kürzer, so wäre der Barwertfaktor niedriger.",
     "Wäre die Restnutzungsdauer kürzer, dann wäre der Barwertfaktor niedriger."
    ],
    "h": "sein → wäre в обеих частях; каждая часть начинается с глагола."
   },
   {
    "t": "order",
    "q": "läge / der Liegenschaftszinssatz / bei 4,5 Prozent / würde / der Ertragswert / um rund 7 Prozent / sinken",
    "a": [
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, würde der Ertragswert um rund 7 Prozent sinken."
    ]
   },
   {
    "t": "transform",
    "i": "Ohne „bei“ als hypothetischen Satz umformen: „Läge …“ (Konjunktiv II).",
    "q": "Bei einem Liegenschaftszinssatz von 3,5 Prozent ergäbe sich ein höherer Ertragswert.",
    "a": [
     "Läge der Liegenschaftszinssatz bei 3,5 Prozent, ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 %, ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 Prozent, so ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 %, so ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 Prozent, dann ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 %, dann ergäbe sich ein höherer Ertragswert.",
     "Läge der Liegenschaftszinssatz bei 3,5 Prozent, würde sich ein höherer Ertragswert ergeben.",
     "Läge der Liegenschaftszinssatz bei 3,5 %, würde sich ein höherer Ertragswert ergeben."
    ],
    "h": "liegen bei + Dat. → Läge der Liegenschaftszinssatz bei 3,5 Prozent, …; затем глагол: ergäbe sich …"
   },
   {
    "t": "translate",
    "q": "Допустим, ставка вырастет на половину процентного пункта — тогда стоимость снизится примерно на 7 %. (angenommen; dann; der Zinssatz; der Wert; rund)",
    "a": [
     "Angenommen, der Zinssatz steigt um einen halben Prozentpunkt, dann sinkt der Wert um rund 7 Prozent.",
     "Angenommen, der Zinssatz steigt um einen halben Prozentpunkt, dann sinkt der Wert um rund 7 %.",
     "Angenommen, dass der Zinssatz um einen halben Prozentpunkt steigt, dann sinkt der Wert um rund 7 Prozent.",
     "Angenommen, dass der Zinssatz um einen halben Prozentpunkt steigt, dann sinkt der Wert um rund 7 %.",
     "Angenommen, der Zinssatz steigt um 0,5 Prozentpunkte, dann sinkt der Wert um rund 7 Prozent.",
     "Angenommen, der Zinssatz steigt um 0,5 Prozentpunkte, dann sinkt der Wert um rund 7 %."
    ],
    "h": "angenommen, + обычный порядок слов (der Zinssatz steigt …); дальше dann + глагол: dann sinkt der Wert."
   },
   {
    "t": "fix",
    "q": "Läge der Liegenschaftszinssatz bei 4,5 Prozent, ergibt sich ein Ertragswert von rund 535.000 Euro.",
    "a": [
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, ergäbe sich ein Ertragswert von rund 535.000 Euro.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, würde sich ein Ertragswert von rund 535.000 Euro ergeben.",
     "Liegt der Liegenschaftszinssatz bei 4,5 Prozent, ergibt sich ein Ertragswert von rund 535.000 Euro."
    ],
    "h": "Обе части должны быть в одном наклонении: läge … → ergäbe sich (или würde sich … ergeben)."
   },
   {
    "t": "translate",
    "q": "Если бы ставка капитализации составляла 4,5 %, доходная стоимость была бы примерно на 7 % ниже. (Verb an erster Stelle; der Liegenschaftszinssatz; liegen; Konjunktiv II; rund; Prozent ausschreiben)",
    "a": [
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, wäre der Ertragswert um rund 7 Prozent niedriger.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, so wäre der Ertragswert um rund 7 Prozent niedriger.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, dann wäre der Ertragswert um rund 7 Prozent niedriger.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, wäre der Ertragswert rund 7 Prozent niedriger.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, so wäre der Ertragswert rund 7 Prozent niedriger.",
     "Läge der Liegenschaftszinssatz bei 4,5 Prozent, dann wäre der Ertragswert rund 7 Prozent niedriger."
    ],
    "h": "liegen → läge, sein → wäre; um rund 7 Prozent niedriger — «на 7 % ниже»."
   }
  ],
  "speak": [
   {
    "ru": "Если ставка капитализации растёт, доходная стоимость снижается.",
    "de": "Steigt der Liegenschaftszinssatz, sinkt der Ertragswert."
   },
   {
    "ru": "При ставке капитализации 4,5 % получается около 535 000 евро.",
    "de": "Bei einem Liegenschaftszinssatz von 4,5 Prozent ergeben sich rund 535.000 Euro."
   },
   {
    "ru": "Если бы оставшийся срок составлял только 25 лет, стоимость была бы примерно на 11 % ниже.",
    "de": "Betrüge die Restnutzungsdauer nur 25 Jahre, wäre der Wert um rund 11 Prozent niedriger."
   },
   {
    "ru": "Без вычета дохода на землю доходная стоимость была бы завышена.",
    "de": "Ohne Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht."
   },
   {
    "ru": "Ставку из отчёта о рынке я применяю при условии, что объект соответствует модели.",
    "de": "Den Liegenschaftszinssatz aus dem Marktbericht wende ich an, vorausgesetzt, das Objekt passt zum Modell."
   },
   {
    "ru": "Допустим, арендные ставки останутся стабильными — тогда стоимость зависит в основном от ставки.",
    "de": "Angenommen, die Mieten bleiben stabil, dann hängt der Wert vor allem vom Zinssatz ab."
   },
   {
    "ru": "Если ставки на рынке капитала растут, спрос на доходные объекты часто ослабевает.",
    "de": "Steigen die Kapitalmarktzinsen, schwächt sich die Nachfrage nach Renditeobjekten oft ab."
   },
   {
    "ru": "В случае более высокой ставки капитализации доходная стоимость снижается.",
    "de": "Im Fall eines höheren Liegenschaftszinssatzes sinkt der Ertragswert."
   },
   {
    "ru": "Если бы ставка составляла 3,5 %, получилась бы стоимость около 622 500 евро.",
    "de": "Läge der Zinssatz bei 3,5 Prozent, ergäbe sich ein Wert von rund 622.500 Euro."
   },
   {
    "ru": "При неизменных арендных ставках даже небольшое изменение ставки заметно влияет на результат.",
    "de": "Bei gleichbleibenden Mieten wirkt sich schon eine kleine Zinsänderung deutlich auf das Ergebnis aus."
   },
   {
    "ru": "Если оставшийся срок короче, коэффициент капитализации ниже.",
    "de": "Ist die Restnutzungsdauer kürzer, ist der Barwertfaktor niedriger."
   },
   {
    "ru": "Если бы рынок ожидал более высоких рисков, ставка капитализации была бы выше.",
    "de": "Würde der Markt höhere Risiken erwarten, läge der Liegenschaftszinssatz höher."
   }
  ]
 },
 "text": {
  "id": "t32",
  "kind": "Gutachten-Auszug mit Sensitivitätsrechnung",
  "title": "Gutachten-Auszug: Ertragswert der Ahornstraße 7 und Sensitivität",
  "de": "7.3 Ertragswertermittlung\n\nDas Mehrfamilienhaus Ahornstraße 7 in Musterstadt umfasst sechs Mietwohnungen. Aus dem marktüblich erzielbaren Rohertrag abzüglich der Bewirtschaftungskosten ergibt sich ein jährlicher Reinertrag von rund 28.500 Euro. Der Bodenwert beträgt bei 700 Quadratmetern zu je 250 Euro insgesamt 175.000 Euro.\n\nDer Grundstücksmarktbericht Musterstadt weist für Mehrfamilienhäuser Liegenschaftszinssätze zwischen 3,5 und 4,5 Prozent aus. Wegen der durchschnittlichen Wohnlage und des mittleren Ausstattungsstandards wird ein objektspezifisch angepasster Liegenschaftszinssatz von 4,0 Prozent angesetzt. Eine zusätzliche Marktanpassung ist nicht erforderlich, da die Lage auf dem Grundstücksmarkt bereits im Liegenschaftszinssatz berücksichtigt ist.\n\nDie Bodenwertverzinsung beträgt 4,0 Prozent von 175.000 Euro, also 7.000 Euro. Nach ihrem Abzug verbleibt ein Gebäudereinertrag von 21.500 Euro. Dieser wird über die Restnutzungsdauer von 35 Jahren kapitalisiert; der jährlich nachschüssige Barwertfaktor beträgt 18,6646. Daraus ergibt sich ein Ertragswert der baulichen Anlagen von rund 401.300 Euro. Zuzüglich des Bodenwerts beläuft sich der vorläufige Ertragswert auf rund 576.300 Euro. Besondere objektspezifische Grundstücksmerkmale liegen nicht vor.\n\nSensitivität: Der Ertragswert reagiert empfindlich auf den Liegenschaftszinssatz. Bei einem Zinssatz von 3,5 Prozent ergäbe sich ein Wert von rund 622.500 Euro, also etwa 8 Prozent mehr. Läge der Zinssatz dagegen bei 4,5 Prozent, würde der Wert auf rund 535.100 Euro sinken, das sind rund 7 Prozent weniger. Betrüge die Restnutzungsdauer nur 25 Jahre, ergäbe sich bei unverändertem Zinssatz ein Wert von rund 510.900 Euro. Schon ein halber Prozentpunkt macht hier also mehr als 40.000 Euro aus.",
  "ru": "Фрагмент заключения по многоквартирному дому Ahornstraße 7: от чистого дохода 28 500 € через долю земли и коэффициент 18,6646 к доходной стоимости около 576 300 €, плюс расчёт чувствительности к ставке и оставшемуся сроку.",
  "q": [
   {
    "q": "Woher stammt die Spanne der Liegenschaftszinssätze?",
    "o": [
     "Aus dem Grundstücksmarktbericht Musterstadt",
     "Aus den aktuellen Bauzinsen der Sparkasse",
     "Aus der Beleihungswertermittlungsverordnung"
    ],
    "a": 0
   },
   {
    "q": "Wie hoch ist die Bodenwertverzinsung?",
    "o": [
     "4.000 Euro",
     "7.000 Euro",
     "21.500 Euro"
    ],
    "a": 1
   },
   {
    "q": "Was wird über die Restnutzungsdauer kapitalisiert?",
    "o": [
     "Der Bodenwert",
     "Der gesamte Rohertrag",
     "Der Gebäudereinertrag"
    ],
    "a": 2
   },
   {
    "q": "Was ergäbe sich bei einem Liegenschaftszinssatz von 4,5 Prozent?",
    "o": [
     "Rund 535.100 Euro, etwa 7 Prozent weniger",
     "Rund 622.500 Euro, etwa 8 Prozent mehr",
     "Rund 510.900 Euro, etwa 11 Prozent weniger"
    ],
    "a": 0
   },
   {
    "q": "Warum ist keine zusätzliche Marktanpassung nötig?",
    "o": [
     "Weil der Bodenwert bereits abgezogen wurde",
     "Weil die Marktlage schon im Liegenschaftszinssatz berücksichtigt ist",
     "Weil der Barwertfaktor nachschüssig berechnet wird"
    ],
    "a": 1
   }
  ],
  "retell": "Fassen Sie den Rechenweg vom Reinertrag zum vorläufigen Ertragswert zusammen und erläutern Sie die Sensitivität. Formulieren Sie mindestens zwei Bedingungen ohne „wenn“: einmal mit dem Verb an erster Stelle und einmal mit „bei“ + Nomen.",
  "gl": [
   {
    "de": "der Reinertrag",
    "ru": "чистый доход (валовой доход минус расходы на содержание)"
   },
   {
    "de": "die Bewirtschaftungskosten",
    "ru": "расходы на управление и содержание объекта"
   },
   {
    "de": "objektspezifisch angepasst",
    "ru": "скорректированный с учётом особенностей объекта"
   },
   {
    "de": "die Marktanpassung",
    "ru": "рыночная корректировка"
   },
   {
    "de": "der Ertragswert der baulichen Anlagen",
    "ru": "доходная стоимость строений (капитализированный доход здания)"
   },
   {
    "de": "zuzüglich (+ Gen.)",
    "ru": "плюс, с прибавлением"
   },
   {
    "de": "sich belaufen auf (+ Akk.)",
    "ru": "составлять (о сумме)"
   },
   {
    "de": "der vorläufige Ertragswert",
    "ru": "предварительная доходная стоимость (до учёта особых характеристик объекта)"
   },
   {
    "de": "die Sensitivität",
    "ru": "чувствительность результата к изменению параметров"
   }
  ]
 },
 "scenario": {
  "id": "s32",
  "kind": "fach",
  "title": "Fachgespräch: Was passiert bei 4,5 Prozent?",
  "ru": "Профессиональный разговор с кредитным специалистом Sparkasse Musterstadt о ставке капитализации и чувствительности доходной стоимости",
  "role": "Sie sind Herr Yilmaz, Kreditsachbearbeiter in der Marktfolge der Sparkasse Musterstadt, und gehen mit dem Sachverständigen dessen Ertragswertgutachten zum Mehrfamilienhaus Ahornstraße 7 (Datenkarte) für die Kreditentscheidung durch; siezen Sie ihn. Fragen Sie nacheinander, was der Liegenschaftszinssatz genau ist und warum 4,0 Prozent angesetzt sind und nicht der aktuelle Bauzins, was bei 4,5 Prozent passieren würde, warum die Bodenwertverzinsung abgezogen wird und was wäre, wenn die Restnutzungsdauer nur 25 Jahre betrüge. Haken Sie nach, wenn der Sachverständige Liegenschaftszinssatz, Bauzins und Rendite vermischt, und verlangen Sie klare Wenn-dann-Aussagen, möglichst ohne „wenn“ (Verb an erster Stelle, „bei“ + Nomen, „angenommen“, Konjunktiv II). Stellen Sie nur eine Frage pro Beitrag, korrigieren Sie pro Antwort höchstens einen Fehler, vorzugsweise bei diesen Konstruktionen, erfinden Sie keine Zahlen über die Datenkarte hinaus und nennen Sie am Ende kurz zwei Stärken und einen Verbesserungsvorschlag.",
  "goal": "Объяснить кредитному специалисту, что такое Liegenschaftszinssatz и почему это не ставка по кредитам, как стоимость реагирует на 4,5 % и на более короткий оставшийся срок, зачем вычитают доход на землю — используя условия без wenn и Konjunktiv II.",
  "open": "Guten Tag! Ich gehe gerade Ihr Ertragswertgutachten zur Ahornstraße 7 für die Kreditvorlage durch. Erste Frage: Was genau ist dieser Liegenschaftszinssatz, und warum setzen Sie 4,0 Prozent an und nicht den aktuellen Bauzins?",
  "steps": [
   "Begriff klären: Liegenschaftszinssatz als marktübliche Verzinsung von Verkehrswerten, vom Gutachterausschuss aus Kaufpreisen und Reinerträgen abgeleitet; kein Bauzins und kein Kapitalmarktzins; 4,0 % objektspezifisch innerhalb der Spanne von 3,5 bis 4,5 % gewählt",
   "Sensitivität erfragen: Was passiert bei 4,5 %? Erwartet: rund 535.100 EUR, etwa 7 % weniger; Begründung: niedrigerer Barwertfaktor und höhere Bodenwertverzinsung",
   "Fragen, warum die Bodenwertverzinsung abgezogen wird: Der Boden nutzt sich nicht ab, nur der Gebäudereinertrag wird über die Restnutzungsdauer kapitalisiert, der Bodenwert kommt am Ende hinzu; ohne Abzug wäre der Wert überhöht",
   "Hypothese: Restnutzungsdauer nur 25 Jahre (rund 510.900 EUR, etwa 11 % weniger); einmal nachhaken: „Ist der Liegenschaftszinssatz nicht einfach die Rendite, die ein Käufer bekommt?“ Erwartet: nur in erster Näherung, er berücksichtigt zusätzlich Bodenwert und Restnutzungsdauer",
   "Kurz nach dem Bezug zum Beleihungswert fragen (dort gelten eigene, vorsichtigere Kapitalisierungszinssätze, etwa nach BelWertV), dann abschließen: zwei Stärken, ein Verbesserungsvorschlag, eine Bedingung ohne „wenn“ korrigiert wiederholen lassen"
  ],
  "use": [
   "Der Liegenschaftszinssatz ist kein Kapitalmarktzins, sondern wird aus tatsächlichen Kaufpreisen abgeleitet.",
   "Den Zinssatz von 4,0 Prozent habe ich innerhalb der Spanne des Grundstücksmarktberichts objektspezifisch gewählt.",
   "Steigt der Liegenschaftszinssatz, sinkt der Ertragswert.",
   "Bei einem Liegenschaftszinssatz von 4,5 Prozent ergäbe sich ein Wert von rund 535.100 Euro.",
   "Die Bodenwertverzinsung ziehe ich ab, weil sich der Boden nicht abnutzt.",
   "Nur der Gebäudereinertrag wird über die Restnutzungsdauer kapitalisiert.",
   "Ohne Abzug der Bodenwertverzinsung wäre der Ertragswert überhöht.",
   "Betrüge die Restnutzungsdauer nur 25 Jahre, läge der Wert bei rund 510.900 Euro.",
   "Angenommen, die Mieten bleiben stabil, dann hängt das Ergebnis vor allem vom Zinssatz ab.",
   "In erster Näherung entspricht der Liegenschaftszinssatz der Nettoanfangsrendite, er berücksichtigt aber zusätzlich Bodenwert und Restnutzungsdauer."
  ],
  "facts": "Ahornstraße 7, Musterstadt (fiktiv): Mehrfamilienhaus mit sechs Mietwohnungen; Reinertrag rund 28.500 EUR/Jahr; Bodenwert 700 m² × 250 EUR/m² = 175.000 EUR; Liegenschaftszinssatz 4,0 % (Grundstücksmarktbericht Musterstadt: Spanne für Mehrfamilienhäuser 3,5–4,5 %); Bodenwertverzinsung 7.000 EUR; Gebäudereinertrag 21.500 EUR; Restnutzungsdauer 35 Jahre; Barwertfaktor 18,6646 (jährlich nachschüssig); Ertragswert der baulichen Anlagen rund 401.300 EUR; vorläufiger Ertragswert rund 576.300 EUR; keine boG. Sensitivität: 3,5 % → rund 622.500 EUR (+8 %); 4,5 % → rund 535.100 EUR (−7 %); Restnutzungsdauer 25 Jahre bei 4,0 % → rund 510.900 EUR (−11 %)."
 },
 "fluency": {
  "id": "f32",
  "topic": "Zinsen und Immobilienwerte",
  "ru": "Объясните, как рост ставок на рынке капитала может повлиять на доходную стоимость и почему ставка капитализации меняется не один к одному",
  "points": [
   "Kapitalmarktzinsen steigen: Finanzierung wird teurer, Nachfrage nach Renditeobjekten sinkt",
   "Folge für Kaufpreise und, mit Verzögerung, für die Liegenschaftszinssätze",
   "Warum der Liegenschaftszinssatz nicht eins zu eins mitwandert (Ableitung aus Kaufpreisen der letzten Jahre, Erwartungen an die Mietentwicklung)",
   "Ein Zahlenbeispiel: ein halber Prozentpunkt mehr – rund 7 Prozent weniger Wert",
   "Mindestens drei Bedingungen ohne „wenn“: Verb an erster Stelle, „bei“ + Nomen, „vorausgesetzt“ oder „angenommen“"
  ],
  "model": "Kunden fragen mich oft, ob steigende Zinsen automatisch den Wert ihrer Immobilie senken. Ganz so einfach ist es nicht. Steigen die Kapitalmarktzinsen, wird die Finanzierung teurer, und viele Anleger kaufen vorsichtiger. Bei geringerer Nachfrage geben die Kaufpreise für Renditeobjekte meist nach. Da der Gutachterausschuss die Liegenschaftszinssätze aus solchen Kaufpreisen ableitet, steigen dann auch diese Zinssätze, allerdings mit Verzögerung und nicht eins zu eins. Der Liegenschaftszinssatz ist eben kein Bauzins, sondern zeigt, was Käufer tatsächlich bezahlen. Erwarten die Käufer steigende Mieten, akzeptieren sie auch eine niedrigere Anfangsverzinsung. Für die Bewertung heißt das: Schon ein halber Prozentpunkt beim Liegenschaftszinssatz kann den Ertragswert spürbar verändern, in einem typischen Beispiel um sieben bis acht Prozent. Vorausgesetzt, die Mieten bleiben stabil, hängt das Ergebnis also stark vom Zinssatz ab. Deshalb ergänze ich meine Gutachten gern um eine kleine Sensitivitätsrechnung. Gerade für eine Bank ist das wichtig: Fällt der Wert, sinkt auch die Sicherheit für den Kredit.",
  "shadow": [
   "Steigen die Zinsen, wird die Finanzierung teurer.",
   "Bei geringerer Nachfrage geben die Kaufpreise meist nach.",
   "Der Liegenschaftszinssatz folgt dem Kapitalmarkt nur mit Verzögerung.",
   "Er wird aus tatsächlichen Kaufpreisen und Reinerträgen abgeleitet.",
   "Schon ein halber Prozentpunkt verändert den Ertragswert deutlich.",
   "Vorausgesetzt, die Mieten bleiben stabil, hängt viel vom Zinssatz ab.",
   "Läge der Zinssatz bei 4,5 Prozent, wäre der Wert niedriger.",
   "Fällt der Wert, sinkt auch die Sicherheit für den Kredit."
  ]
 }
};
