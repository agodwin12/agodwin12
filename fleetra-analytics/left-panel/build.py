"""Generates left-panel/index.html : static, clean data-flow diagram (Sources -> Fleetra Analytics -> Analyses).
Every element carries an id/class so the same SVG can later be animated (GSAP / HyperFrames)."""
import base64, io, math
import cv2

W, H = 1182, 875
BG = '#060b0d'
ORANGE = '#ff5a1f'
CYAN = '#38bdf8'
TXT = '#f4f6f8'
MUTED = '#8b95a1'
CARD = '#0c1217'
LINE = 'rgba(255,255,255,0.10)'

ICONS = {
    'db': '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/>',
    'file': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h6"/>',
    'card': '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20M6 15h4"/>',
    'cal': '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    'alert': '<path d="M12 3 2.5 20h19z"/><path d="M12 10v5M12 18v.01"/>',
    'bars': '<path d="M5 21v-9M12 21V5M19 21v-6"/>',
    'pin': '<path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/>',
    'truck': '<path d="M2 6h11v10H2zM13 9h4l4 4v3h-8z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    'fence': '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
    'power': '<path d="M12 3v9"/><path d="M6.3 7.3a8 8 0 1 0 11.4 0"/>',
    'pie': '<path d="M21 12A9 9 0 1 1 12 3v9z"/><path d="M15 3.5A9 9 0 0 1 20.5 9H15z"/>',
    'activity': '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
    'check': '<circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/>',
}

def icon(name, x, y, size, color, sw=1.7, cls=''):
    s = size / 24
    return (f'<g class="{cls}" transform="translate({x},{y}) scale({s})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])

def text(x, y, s, size, color, weight=400, anchor='start', ls=0, cls='', op=1):
    return (f'<text class="{cls}" x="{x}" y="{y}" font-size="{size}" font-weight="{weight}" fill="{color}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}" opacity="{op}">{s}</text>')

out = []
out.append(f'<defs><radialGradient id="hubGlow"><stop offset="0" stop-color="{ORANGE}" stop-opacity=".16"/><stop offset="1" stop-color="{ORANGE}" stop-opacity="0"/></radialGradient></defs>')
out.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

CY = 447
# ---------- column labels ----------
LAB = 178
out.append(text(56, LAB, 'SOURCES', 12, MUTED, 600, 'start', 2.4, 'col-label'))
out.append(text(592, LAB, 'TRANSFORMATION', 12, MUTED, 600, 'middle', 2.4, 'col-label'))
out.append(text(860, LAB, 'ANALYSE &amp; DÉCISION', 12, MUTED, 600, 'start', 2.4, 'col-label'))
for x0, x1 in [(56, 100), (592 - 20, 592 + 20), (860, 904)]:
    pass

# ---------- source cards ----------
def source_card(idn, x, y, color, title, sub_lines, ic, items):
    w, h = 272, 170
    g = [f'<g id="{idn}" class="card source">']
    g.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="16" fill="{CARD}" stroke="{color}" stroke-opacity=".45" stroke-width="1.2"/>')
    g.append(f'<rect x="{x+20}" y="{y+20}" width="38" height="38" rx="10" fill="{color}" fill-opacity=".13"/>')
    g.append(icon(ic, x + 28, y + 28, 22, color, 1.7))
    g.append(text(x + 70, y + 36, title, 19, TXT, 600))
    for i, s in enumerate(sub_lines):
        g.append(text(x + 70, y + 56 + i * 16, s, 12.5, MUTED, 400))
    g.append(f'<line x1="{x+20}" y1="{y+92}" x2="{x+w-20}" y2="{y+92}" stroke="{LINE}" stroke-width="1"/>')
    for i, (ic2, label) in enumerate(items):
        cx = x + 20 + i * 58
        g.append(f'<g class="chip">' + icon(ic2, cx + 15, y + 106, 22, color, 1.5, 'chip-ic') +
                 text(cx + 26, y + 148, label, 10.5, MUTED, 500, 'middle') + '</g>')
    g.append('</g>')
    return ''.join(g)

SRC1 = (56, 262)
SRC2 = (56, 462)
out.append(source_card('src-recouvrement', *SRC1, ORANGE, 'Recouvrement',
                       ['Données financières', 'et contractuelles'], 'db',
                       [('file', 'Contrats'), ('card', 'Paiements'), ('cal', 'Échéances'), ('alert', 'Arriérés')]))
out.append(source_card('src-tracking', *SRC2, CYAN, 'Tracking',
                       ['Données opérationnelles', 'de la flotte'], 'pin',
                       [('pin', 'Positions'), ('truck', 'Trajets'), ('fence', 'Géofencing'), ('power', 'Coupure')]))

# ---------- hub ----------
HX0, HX1, HY0, HY1 = 504, 680, CY - 88, CY + 88
out.append(f'<g id="hub" class="hub">')
out.append(f'<circle cx="592" cy="{CY}" r="170" fill="url(#hubGlow)"/>')
out.append(f'<rect x="{HX0-14}" y="{HY0-14}" width="{HX1-HX0+28}" height="{HY1-HY0+28}" rx="30" fill="none" stroke="{ORANGE}" stroke-opacity=".22" stroke-width="1" stroke-dasharray="3 6" id="hub-ring"/>')
out.append(f'<rect x="{HX0}" y="{HY0}" width="{HX1-HX0}" height="{HY1-HY0}" rx="22" fill="{CARD}" stroke="{ORANGE}" stroke-opacity=".85" stroke-width="1.5"/>')
out.append(f'<image href="data:image/png;base64,@@LOGO@@" x="{592-31}" y="{CY-66}" width="62" height="62"/>')
out.append(text(592, CY + 38, 'Fleetra', 22, TXT, 700, 'middle'))
out.append(text(592, CY + 62, 'Analytics', 22, TXT, 400, 'middle'))
out.append('</g>')
out.append(text(592, HY1 + 52, 'Centralise · Croise · Transforme', 13, MUTED, 500, 'middle', .4, 'hub-caption'))

# ---------- output cards ----------
OUTS = [
    ('out-finance', 'Finance', ['Suivi des performances', 'financières'], 'bars', ORANGE),
    ('out-performance', 'Performance', ['Analyse de la flotte', 'et des indicateurs'], 'pie', ORANGE),
    ('out-operations', 'Opérations', ['Analyse de l\'activité et du', 'comportement des véhicules'], 'activity', ORANGE),
    ('out-decision', 'Décision', ['Des données fiables pour', 'de meilleures décisions'], 'check', ORANGE),
]
OX, OW, OH, GAP = 860, 266, 100, 20
top = CY - (4 * OH + 3 * GAP) / 2
centers = []
for i, (idn, title, sub, ic, col) in enumerate(OUTS):
    y = top + i * (OH + GAP)
    centers.append(y + OH / 2)
    out.append(f'<g id="{idn}" class="card output">')
    out.append(f'<rect x="{OX}" y="{y}" width="{OW}" height="{OH}" rx="16" fill="{CARD}" stroke="{col}" stroke-opacity=".38" stroke-width="1.2"/>')
    out.append(f'<rect x="{OX+18}" y="{y+(OH-40)/2}" width="40" height="40" rx="11" fill="{col}" fill-opacity=".13"/>')
    out.append(icon(ic, OX + 18 + 9, y + (OH - 40) / 2 + 9, 22, col, 1.7))
    out.append(text(OX + 74, y + 40, title, 19, TXT, 600))
    for k, s in enumerate(sub):
        out.append(text(OX + 74, y + 60 + k * 16, s, 12.5, MUTED, 400))
    out.append('</g>')

# ---------- connections ----------
conns = []
def path(p0, p3, dx=88):
    c1 = (p0[0] + dx, p0[1]); c2 = (p3[0] - dx, p3[1])
    return p0, c1, c2, p3

# sources -> hub
s1 = path((SRC1[0] + 272, SRC1[1] + 85), (HX0, CY - 20), 88)
s2 = path((SRC2[0] + 272, SRC2[1] + 85), (HX0, CY + 20), 88)
conns += [('flow-in-recouvrement', s1, ORANGE), ('flow-in-tracking', s2, CYAN)]
ports = [CY - 33, CY - 11, CY + 11, CY + 33]
for (idn, *_), py, cy_, (_, _, _, _, col) in zip(OUTS, ports, centers, OUTS):
    conns.append((idn.replace('out-', 'flow-out-'), path((HX1, py), (OX, cy_), 88), col))

lines, dots, nodes = [], [], []
for idn, (p0, c1, c2, p3), col in conns:
    d = f'M{p0[0]},{p0[1]} C{c1[0]},{c1[1]} {c2[0]},{c2[1]} {p3[0]},{p3[1]}'
    lines.append(f'<path id="{idn}" class="flow" d="{d}" fill="none" stroke="{col}" stroke-opacity=".6" stroke-width="1.4" stroke-linecap="round"/>')
    for t in (0.3, 0.7):
        x, y = bez(p0, c1, c2, p3, t)
        dots.append(f'<g class="dot" data-flow="{idn}"><circle cx="{x:.1f}" cy="{y:.1f}" r="7" fill="{col}" opacity=".16"/><circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{col}"/></g>')
    x, y = p0
    nodes.append(f'<circle class="port" cx="{x}" cy="{y}" r="3.6" fill="{BG}" stroke="{col}" stroke-width="1.5"/>')
    x, y = p3
    nodes.append(f'<path class="arrow" d="M{x-9},{y-4.6} L{x},{y} L{x-9},{y+4.6} Z" fill="{col}" fill-opacity=".9"/>')

# connections go under cards, so insert before cards: rebuild order
body = ''.join(out)
first_card = body.index('<g id="src-recouvrement"')
body = body[:first_card] + '<g id="flows">' + ''.join(lines) + '</g>' + body[first_card:]
body += '<g id="ports">' + ''.join(nodes) + '</g>' + '<g id="dots">' + ''.join(dots) + '</g>'

# logo from the original mockup (hub icon), rounded mask
src = cv2.imread('/home/user/agodwin12/fleetra-analytics/work/orig.png')
ic = src[423:490, 618:685]
ic = cv2.resize(ic, (146, 146), interpolation=cv2.INTER_CUBIC)
import numpy as np
mask = np.zeros(ic.shape[:2], np.uint8)
r = 29
cv2.rectangle(mask, (r, 0), (145 - r, 145), 255, -1); cv2.rectangle(mask, (0, r), (145, 145 - r), 255, -1)
for cx, cy in [(r, r), (145 - r, r), (r, 145 - r), (145 - r, 145 - r)]:
    cv2.circle(mask, (cx, cy), r, 255, -1)
mask = cv2.GaussianBlur(mask, (0, 0), 0.8)
rgba = np.dstack([ic, mask])
ok, buf = cv2.imencode('.png', rgba)
body = body.replace('@@LOGO@@', base64.b64encode(buf.tobytes()).decode())

html = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Fleetra Analytics — partie gauche</title>
<style>
  html,body{{margin:0;background:{BG};}}
  svg{{display:block;font-family:"Inter Display","Inter",system-ui,sans-serif;}}
</style></head>
<body><svg id="left-panel" width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">{body}</svg></body></html>'''
open('/home/user/agodwin12/fleetra-analytics/left-panel/index.html', 'w').write(html)
print('ok')
