"""Fleetra Analytics — data-flow scene recomposed for its real size on the login page.
No column labels, smaller central logo, larger type, tighter canvas.

  python3 build_v2.py desktop   -> scene-desktop.html  (cards with data-type chips)
  python3 build_v2.py compact   -> scene-compact.html  (small containers: chips removed, type even larger)

Element ids / structure are the ones the motion (videos/fleetra-login-motion/motion.js) drives."""
import base64, sys
import cv2

VARIANT = sys.argv[1] if len(sys.argv) > 1 else 'desktop'
COMPACT = VARIANT == 'compact'

W, H = 960, 540
import os
HUB_CY = float(os.environ.get('HUB_CY', 220))        # Fleetra mark a little above the card columns: the caption sits in a clear zone
PORT_F = float(os.environ.get('PORT_F', 0.34)) 
OUT_F = float(os.environ.get('OUT_F', 0.40))
DX = float(os.environ.get('DX', 70))
#      # flows leave the source cards from their upper part
BG = '#060b0d'
ORANGE = '#ff5a1f'
CYAN = '#38bdf8'
TXT = '#f4f6f8'
SUB = '#a3adb8'          # descriptions: brighter than before for small sizes
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

def icon(name, x, y, size, color, sw=1.8):
    s = size / 24
    return (f'<g transform="translate({x:.1f},{y:.1f}) scale({s:.3f})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')

def text(x, y, s, size, color, weight=400, anchor='start', ls=0, cls=''):
    return (f'<text class="{cls}" x="{x:.1f}" y="{y:.1f}" font-size="{size}" font-weight="{weight}" fill="{color}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}">{s}</text>')

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])

# ---------------- type scale & geometry ----------------
T_SRC = 24 if COMPACT else 23          # source titles
D_SRC = 15.5 if COMPACT else 14.5        # source descriptions
T_OUT = 22 if COMPACT else 21          # output titles
D_OUT = 14 if COMPACT else 13.5          # output descriptions
CAP = 14.5 if COMPACT else 14            # "Centralise · Croise · Transforme"

CW = 250                               # every card has the same width
LX = 30                                # left column x
RX = W - 30 - CW                       # right column x
CX, CY = W / 2, HUB_CY                    # centre of the Fleetra mark (slightly above the card columns)
COL_CY = 270                           # vertical centre of both card columns
HUB = 92                              # logo tile size (smaller than before)

SRC_H = 124 if COMPACT else 168
SRC_GAP = 24 if COMPACT else 22
OUT_H, OUT_GAP = 96, 14

out = []
out.append('<defs><filter id="hubBlur" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="18"/></filter>'
           '<filter id="hubBlurWide" x="-120%" y="-120%" width="340%" height="340%"><feGaussianBlur stdDeviation="40"/></filter></defs>')
out.append(f'<rect width="{W}" height="{H}" fill="{BG}"/>')

# ---------------- source cards ----------------
def source_card(idn, x, y, color, title, desc, ic, chips):
    g = [f'<g id="{idn}" class="card source">']
    g.append(f'<rect x="{x}" y="{y}" width="{CW}" height="{SRC_H}" rx="15" fill="{CARD}" stroke="{color}" stroke-opacity=".4" stroke-width="1.1"/>')
    g.append(f'<rect x="{x+16}" y="{y+18}" width="38" height="38" rx="10" fill="{color}" fill-opacity=".13"/>')
    g.append(icon(ic, x + 24, y + 26, 22, color, 1.8))
    tx = x + 66
    g.append(text(tx, y + 44, title, T_SRC, TXT, 600, ls=-0.2))
    for i, s in enumerate(desc):
        g.append(text(x + 16, y + 82 + i * (D_SRC + 4), s, D_SRC, SUB, 400))
    if chips:
        yl = y + 120
        g.append(f'<line x1="{x+16}" y1="{yl}" x2="{x+CW-16}" y2="{yl}" stroke="{LINE}" stroke-width="1"/>')
        cw = (CW - 24) / 4
        for i, (ic2, label) in enumerate(chips):
            cx = x + 12 + cw * i + cw / 2
            g.append(icon(ic2, cx - 9, yl + 9, 18, color, 1.7))
            g.append(text(cx, yl + 40, label, 11, SUB, 500, 'middle', -0.1))
    g.append('</g>')
    return ''.join(g)

src_total = 2 * SRC_H + SRC_GAP
S1 = (LX, COL_CY - src_total / 2)
S2 = (LX, S1[1] + SRC_H + SRC_GAP)
out.append(source_card('src-recouvrement', *S1, ORANGE, 'Recouvrement',
                       ['Données financières', 'et contractuelles'],
                       'db', None if COMPACT else [('file', 'Contrats'), ('card', 'Paiements'), ('cal', 'Échéances'), ('alert', 'Arriérés')]))
out.append(source_card('src-tracking', *S2, CYAN, 'Tracking',
                       ['Données opérationnelles', 'de la flotte'],
                       'pin', None if COMPACT else [('pin', 'Positions'), ('truck', 'Trajets'), ('fence', 'Géofencing'), ('power', 'Coupure')]))

# ---------------- hub (logo only) ----------------
HX0, HY0 = CX - HUB / 2, CY - HUB / 2
HX1, HY1 = HX0 + HUB, HY0 + HUB
out.append('<g id="hub" class="hub" data-phase="2">')
out.append(f'<g id="hub-halo" opacity=".55"><rect x="{HX0+5}" y="{HY0+5}" width="{HUB-10}" height="{HUB-10}" rx="22" fill="{ORANGE}" fill-opacity=".42" filter="url(#hubBlur)"/>'
           f'<rect x="{HX0-8}" y="{HY0-8}" width="{HUB+16}" height="{HUB+16}" rx="30" fill="#ff8a4c" fill-opacity=".10" filter="url(#hubBlurWide)"/></g>')
out.append(f'<image id="hub-logo" href="data:image/png;base64,@@LOGO@@" x="{HX0}" y="{HY0}" width="{HUB}" height="{HUB}"/>')
out.append(f'<rect x="{HX0+0.5}" y="{HY0+0.5}" width="{HUB-1}" height="{HUB-1}" rx="{0.229*HUB:.1f}" fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="1" id="hub-frame"/>')
out.append('</g>')
from PIL import ImageFont
_f = ImageFont.truetype('/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf', CAP)
CAP_W = _f.getlength('Centralise · Croise · Transforme') + 0.2 * 31 + 24   # content width + small padding
PILL_H = CAP * 1.95
PILL = (CX - CAP_W / 2, HY1 + 18, CAP_W, PILL_H)
CAP_Y = PILL[1] + PILL_H / 2 + CAP * 0.36
caption = (f'<g id="caption-layer"><rect x="{PILL[0]:.1f}" y="{PILL[1]:.1f}" width="{PILL[2]:.1f}" height="{PILL[3]:.1f}" rx="{PILL[3]/2:.1f}" '
           f'fill="{CARD}" fill-opacity=".85" stroke="#ffffff" stroke-opacity=".07" stroke-width="1"/>'
           + text(CX, CAP_Y, 'Centralise · Croise · Transforme', CAP, '#d3d9e0', 500, 'middle', 0.2, 'hub-caption') + '</g>')

# ---------------- output cards ----------------
OUTS = [
    ('out-finance', 'Finance', ['Suivi des performances', 'financières'], 'bars', ORANGE),
    ('out-performance', 'Performance', ['Analyse de la flotte', 'et des indicateurs'], 'pie', ORANGE),
    ('out-operations', 'Opérations', ['Activité et comportement', 'des véhicules'], 'activity', CYAN),
    ('out-decision', 'Décision', ['Données fiables pour', 'mieux décider'], 'check', ORANGE),
]
out_total = 4 * OUT_H + 3 * OUT_GAP
top = COL_CY - out_total / 2
centers = []
for i, (idn, title, desc, ic, col) in enumerate(OUTS):
    y = top + i * (OUT_H + OUT_GAP)
    centers.append(y + OUT_H / 2)
    out.append(f'<g id="{idn}" class="card output">')
    out.append(f'<rect x="{RX}" y="{y:.1f}" width="{CW}" height="{OUT_H}" rx="15" fill="{CARD}" stroke="{col}" stroke-opacity=".4" stroke-width="1.1"/>')
    out.append(f'<rect x="{RX+15}" y="{y+(OUT_H-38)/2:.1f}" width="38" height="38" rx="10" fill="{col}" fill-opacity=".13"/>')
    out.append(icon(ic, RX + 15 + 8, y + (OUT_H - 38) / 2 + 8, 22, col, 1.8))
    out.append(text(RX + 66, y + 36, title, T_OUT, TXT, 600, ls=-0.2))
    for k, s in enumerate(desc):
        out.append(text(RX + 66, y + 58 + k * (D_OUT + 3.5), s, D_OUT, SUB, 400))
    out.append('</g>')

# keep everything inside the canvas
assert top > 4 and top + out_total < H - 4, (top, out_total)
assert S2[1] + SRC_H < H - 4
assert PILL[1] + PILL[3] < H

# ---------------- connections ----------------
def path(p0, p3, dx1, dx2=None):
    dx2 = dx1 if dx2 is None else dx2
    return p0, (p0[0] + dx1, p0[1]), (p3[0] - dx2, p3[1]), p3

conns = []
conns.append(('flow-in-recouvrement', path((LX + CW, S1[1] + SRC_H * PORT_F), (HX0, CY - 13), 40, 100), ORANGE))
conns.append(('flow-in-tracking', path((LX + CW, S2[1] + SRC_H * PORT_F), (HX0, CY + 13), 40, 100), CYAN))
ports = [CY - 24, CY - 8, CY + 8, CY + 24]
for (idn, *_r), py, cy_ in zip(OUTS, ports, centers):
    col = _r[3]
    conns.append((idn.replace('out-', 'flow-out-'), path((HX1, py), (RX, cy_ - OUT_H / 2 + OUT_H * OUT_F), 145, 45), col))

lines, dots, nodes = [], [], []
for idn, (p0, c1, c2, p3), col in conns:
    d = f'M{p0[0]:.1f},{p0[1]:.1f} C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p3[0]:.1f},{p3[1]:.1f}'
    phase = 1 if idn.startswith('flow-in') else 4
    fam = 'operational' if col == CYAN else 'financial'
    lines.append(f'<path id="{idn}" class="flow" data-phase="{phase}" data-family="{fam}" d="{d}" fill="none" stroke="{col}" stroke-opacity=".65" stroke-width="1.5" stroke-linecap="round"/>')
    for t in (0.33, 0.68):
        x, y = bez(p0, c1, c2, p3, t)
        if PILL[0] - 6 < x < PILL[0] + PILL[2] + 6 and PILL[1] - 6 < y < PILL[1] + PILL[3] + 6:
            continue
        dots.append(f'<g class="dot" data-flow="{idn}" data-phase="{phase}" data-family="{fam}"><circle cx="{x:.1f}" cy="{y:.1f}" r="2.6" fill="{col}"/></g>')
    x, y = p0
    nodes.append(f'<circle class="port" cx="{x:.1f}" cy="{y:.1f}" r="3.8" fill="{col}" fill-opacity="0" stroke="{col}" stroke-width="1.5"/>')
    x, y = p3
    nodes.append(f'<path class="arrow" d="M{x-9:.1f},{y-4.8:.1f} L{x:.1f},{y:.1f} L{x-9:.1f},{y+4.8:.1f} Z" fill="{col}" fill-opacity=".95"/>')

body = ''.join(out)
first_card = body.index('<g id="src-recouvrement"')
body = body[:first_card] + '<g id="flows">' + ''.join(lines) + '</g>' + body[first_card:]
body += '<g id="ports">' + ''.join(nodes) + '</g>' + '<g id="dots">' + ''.join(dots) + '</g>' + caption

logo = cv2.imread('/home/user/agodwin12/fleetra-analytics/assets/fleetra-logo.png', cv2.IMREAD_UNCHANGED)
logo = cv2.resize(logo, (448, 448), interpolation=cv2.INTER_AREA)
ok, buf = cv2.imencode('.png', logo)
body = body.replace('@@LOGO@@', base64.b64encode(buf.tobytes()).decode())

html = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Fleetra Analytics — scène {VARIANT}</title>
<style>html,body{{margin:0;background:{BG};}} svg{{display:block;font-family:"Inter Display","Inter",system-ui,sans-serif;}}</style></head>
<body><svg id="left-panel" width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">{body}</svg></body></html>'''
open(f'/home/user/agodwin12/fleetra-analytics/left-panel/scene-{VARIANT}.html', 'w').write(html)
# clearance between every flow and the caption pill (must stay positive)
import math
def dist_rect(px, py, r):
    dx = max(r[0] - px, 0, px - (r[0] + r[2])); dy = max(r[1] - py, 0, py - (r[1] + r[3])); return math.hypot(dx, dy)
per = {n: round(min(dist_rect(*bez(p0, c1, c2, p3, i / 400), PILL) for i in range(401)), 1) for n, (p0, c1, c2, p3), _c in conns}
print(per, 'PILL', [round(v) for v in PILL])
clear = min(per.values())
print('caption clearance to flows:', round(clear, 1), 'px  | pill width', round(PILL[2]), '| hub', HUB)
assert clear >= 10 or os.environ.get('SEARCH'), 'caption overlaps a flow'
print('ok', VARIANT, W, H)
