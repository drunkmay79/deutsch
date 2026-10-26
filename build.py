# -*- coding: utf-8 -*-
"""Sammelt src/ zu einer Seite für claude.ai: dist/gutachter-deutsch.html
Aufruf: python3 build.py"""
import io, os, sys, time

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


css = rd('styles.css')
js = '\n;\n'.join('/* ===== %s ===== */\n%s' % (f, rd(f)) for f in JS if os.path.exists(os.path.join(SRC, f)))
for bad in ('</script', '</style'):
    if bad in js or bad in css:
        sys.exit('Fehler: %s in den Quellen' % bad)
html = rd('shell.html').replace('/*__CSS__*/', css).replace('/*__JS__*/', js)
os.makedirs(os.path.dirname(OUT), exist_ok=True)
with io.open(OUT, 'w', encoding='utf-8', newline='\n') as f:
    f.write(html)
print('%s: %d Bytes, %s' % (os.path.relpath(OUT, ROOT), len(html.encode('utf-8')), time.strftime('%Y-%m-%d %H:%M')))
