# -*- coding: utf-8 -*-
"""Sammelt src/ zu einer Seite für claude.ai: dist/gutachter-deutsch.html
Aufruf: python3 build.py"""
import io, json, os, re, sys, time

ROOT = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(ROOT, 'src')
OUT = os.path.join(ROOT, 'dist', 'gutachter-deutsch.html')
# --no-days: ohne die Tagesdateien ab Tag 15 bauen (z. B. während sie noch entstehen)
DAYS = [] if '--no-days' in sys.argv else sorted('data/days/' + f for f in os.listdir(os.path.join(SRC, 'data', 'days')) if f.endswith('.js')) if os.path.isdir(os.path.join(SRC, 'data', 'days')) else []
JS = ['data/course.js', 'data/vocab_w1_2.js', 'data/grammar_w1_2.js', 'data/practice_w1_2.js'] + DAYS + \
     ['core.js', 'content.js', 'prompts.js', 'ui.js', 'blocks.js', 'app.js']


def rd(p):
    with io.open(os.path.join(SRC, p), 'r', encoding='utf-8') as f:
        return f.read().replace('\r\n', '\n')


DAY = re.compile(r'^(.*?D\.days\[\d+\]\s*=\s*)(\{.*\})\s*;?\s*$', re.S)


def compact(p):
    # Tagesdateien: JSON ohne Einrückung (spart ~30 % der Seite); sonst unverändert
    s = rd(p)
    m = DAY.match(s) if p.startswith('data/days/') else None
    if not m:
        return s
    try:
        return m.group(1) + json.dumps(json.loads(m.group(2)), ensure_ascii=False, separators=(',', ':')) + ';'
    except ValueError:
        return s


css = rd('styles.css')
js = '\n;\n'.join('/* ===== %s ===== */\n%s' % (f, compact(f)) for f in JS if os.path.exists(os.path.join(SRC, f)))
for bad in ('</script', '</style'):
    if bad in js or bad in css:
        sys.exit('Fehler: %s in den Quellen' % bad)
html = rd('shell.html').replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('%s: %d Bytes, %s' % (os.path.relpath(OUT, ROOT), len(html.encode('utf-8')), time.strftime('%Y-%m-%d %H:%M')))
