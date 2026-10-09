"""Fleetra Analytics — data-flow scene, "pro" finish (v4).

Same content and structure as v3 (2 sources -> hub -> 4 results), redrawn on an 8 px grid:
  * neutral cards (white 3 % fill, white 8 % border), colour only on source icon cases and input lines
  * results are neutral (they come from the *crossing* of both sources); output lines soft white
  * bigger hub (128) centred on the common axis of both card columns, soft orange halo
  * one entry point / one exit point on the hub, identical Bezier tension, no crossings
  * background depth (glow, dot grid, vignette) in its own #bg-layer so the alpha render can drop it

  python3 build_v4.py            -> scene-pro.html (+ checks printed)
"""
import base64, math
import cv2
from PIL import ImageFont

W, H = 960, 540
BG = '#081318'
ORANGE = '#ff5a1f'
CYAN = '#38bdf8'
TXT = '#f4f6f8'
SUB = '#a3adb8'
NEUTRAL_ICON = '#e5e7eb'
CARD_FILL = 'rgba(255,255,255,0.03)'
CARD_STROKE = 'rgba(255,255,255,0.08)'
OUT_LINE = 'rgba(255,255,255,0.35)'
HUB_PORT = 'rgba(255,255,255,0.55)'
LABEL = '#6b7280'
FONT_MED = '/usr/share/fonts/opentype/inter/InterDisplay-Medium.otf'

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
    return (f'<g transform="translate({x:g},{y:g}) scale({s:.4f})" fill="none" stroke="{color}" '
            f'stroke-width="{sw}" stroke-linecap="round" stroke-linejoin="round">{ICONS[name]}</g>')

def text(x, y, s, size, color, weight=400, anchor='start', ls=0, cls='', family=None):
    fam = f' font-family="{family}"' if family else ''
    return (f'<text class="{cls}" x="{x:g}" y="{y:g}" font-size="{size}" font-weight="{weight}" fill="{color}" '
            f'text-anchor="{anchor}" letter-spacing="{ls}"{fam}>{s}</text>')

def bez(p0, p1, p2, p3, t):
    u = 1 - t
    return (u**3 * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t**3 * p3[0],
            u**3 * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t**3 * p3[1])

# ---------------- grid (all multiples of 8 except the 4 px line tweaks) ----------------
PAD = 16                 # same inner margin in every card
GAP = 16                 # same gap between cards, left and right
LX, CW = 24, 272
RX = W - LX - CW         # 664
AXIS = 272               # common vertical axis of both columns = hub icon centre
CX = W / 2               # hub centred between the columns
HUB = 128
SRC_H, OUT_H = 176, 96
PORT_R = 3               # attach points: hollow 6 px circles
TENSION = 0.5            # identical Bezier tension for every connector

src_top = AXIS - (2 * SRC_H + GAP) / 2
out_top = AXIS - (4 * OUT_H + 3 * GAP) / 2
S = [(LX, src_top), (LX, src_top + SRC_H + GAP)]
O = [(RX, out_top + i * (OUT_H + GAP)) for i in range(4)]
HX0, HY0 = CX - HUB / 2, AXIS - HUB / 2
HX1, HY1 = HX0 + HUB, HY0 + HUB

out = []
# ---------------- defs ----------------
out.append(
    '<defs>'
    '<radialGradient id="bgGlow"><stop offset="0" stop-color="#ff5a1e" stop-opacity="0.07"/>'
    '<stop offset="1" stop-color="#ff5a1e" stop-opacity="0"/></radialGradient>'
    '<radialGradient id="bgVignette" cx="50%" cy="50%" r="75%"><stop offset="0.55" stop-color="#000" stop-opacity="0"/>'
    '<stop offset="1" stop-color="#000" stop-opacity="0.45"/></radialGradient>'
    '<pattern id="bgDots" width="24" height="24" patternUnits="userSpaceOnUse"><circle cx="12" cy="12" r="1" fill="rgba(255,255,255,0.04)"/></pattern>'
    '<filter id="hubShadow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="40"/></filter>'
    '</defs>')

# ---------------- background (own layer: dropped for the alpha render) ----------------
out.append(f'<g id="bg-layer"><rect width="{W}" height="{H}" fill="{BG}"/>'
           f'<rect width="{W}" height="{H}" fill="url(#bgDots)"/>'
           f'<circle cx="{CX:g}" cy="{AXIS}" r="{0.4 * W:g}" fill="url(#bgGlow)"/>'
           f'<rect width="{W}" height="{H}" fill="url(#bgVignette)"/></g>')

# ---------------- column labels ----------------
MONO = "'DejaVu Sans Mono', 'Liberation Mono', monospace"
out.append(text(LX, S[0][1] - 12, 'SOURCES', 11, LABEL, 400, ls='0.88', cls='col-label', family=MONO))
out.append(text(RX, O[0][1] - 12, 'RÉSULTATS', 11, LABEL, 400, ls='0.88', cls='col-label', family=MONO))

# ---------------- cards ----------------
def card_frame(x, y, h):
    return f'<rect x="{x}" y="{y:g}" width="{CW}" height="{h}" rx="14" fill="{CARD_FILL}" stroke="{CARD_STROKE}" stroke-width="1"/>'

CHIP_FS = 11
def source_card(idn, x, y, color, title, desc, ic, chips):
    g = [f'<g id="{idn}" class="card source">', card_frame(x, y, SRC_H)]
    g.append(f'<rect x="{x+PAD}" y="{y+PAD:g}" width="40" height="40" rx="10" fill="{color}" fill-opacity=".14"/>')
    g.append(icon(ic, x + PAD + 9, y + PAD + 9, 22, color))
    g.append(text(x + PAD + 40 + 12, y + PAD + 27, title, 21, TXT, 600, ls=-0.2))
    for i, s in enumerate(desc):
        g.append(text(x + PAD, y + 82 + i * 18, s, 14, SUB))
    yl = y + 114
    g.append(f'<line x1="{x+PAD}" y1="{yl:g}" x2="{x+CW-PAD}" y2="{yl:g}" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>')
    col = (CW - 2 * PAD) / 4                     # 4 equal columns of 60 px
    for i, (ic2, label) in enumerate(chips):
        cx = x + PAD + col * i + col / 2
        g.append(icon(ic2, cx - 9, yl + 10, 18, '#9ca3af', 1.7))
        g.append(text(cx, yl + 46, label, CHIP_FS, '#9ca3af', 500, 'middle'))
    g.append('</g>')
    return ''.join(g)

SOURCES = [
    ('src-recouvrement', ORANGE, 'Recouvrement', ['Données financières', 'et contractuelles'], 'db',
     [('file', 'Contrats'), ('card', 'Paiements'), ('cal', 'Échéances'), ('alert', 'Arriérés')]),
    ('src-tracking', CYAN, 'Tracking', ['Données opérationnelles', 'de la flotte'], 'pin',
     [('pin', 'Positions'), ('truck', 'Trajets'), ('fence', 'Géofencing'), ('power', 'Coupure')]),
]
for (x, y), (idn, col, title, desc, ic, chips) in zip(S, SOURCES):
    out.append(source_card(idn, x, y, col, title, desc, ic, chips))

RESULTS = [
    ('out-finance', 'Finance', ['Suivi des performances', 'financières'], 'bars'),
    ('out-performance', 'Performance', ['Analyse de la flotte', 'et des indicateurs'], 'pie'),
    ('out-operations', 'Opérations', ['Activité et comportement', 'des véhicules'], 'activity'),
    ('out-decision', 'Décision', ['Données fiables pour', 'mieux décider'], 'check'),
]
for (x, y), (idn, title, desc, ic) in zip(O, RESULTS):
    out.append(f'<g id="{idn}" class="card output">' + card_frame(x, y, OUT_H))
    out.append(f'<rect x="{x+PAD}" y="{y+(OUT_H-40)/2:g}" width="40" height="40" rx="10" fill="rgba(255,255,255,0.06)"/>')
    out.append(icon(ic, x + PAD + 9, y + (OUT_H - 40) / 2 + 9, 22, NEUTRAL_ICON))
    out.append(text(x + PAD + 52, y + 40, title, 20, TXT, 600, ls=-0.2))
    for k, s in enumerate(desc):
        out.append(text(x + PAD + 52, y + 61 + k * 17, s, 13.5, SUB))
    out.append('</g>')

# ---------------- hub ----------------
out.append('<g id="hub">')
out.append(f'<rect id="hub-halo" x="{HX0:g}" y="{HY0:g}" width="{HUB}" height="{HUB}" rx="{0.229*HUB:.1f}" '
           f'fill="#ff5a1e" fill-opacity="0.35" filter="url(#hubShadow)"/>')      # = box-shadow 0 0 80px rgba(255,90,30,.35)
out.append('<g id="hub-core">')
out.append(f'<image id="hub-logo" href="data:image/png;base64,@@LOGO@@" x="{HX0:g}" y="{HY0:g}" width="{HUB}" height="{HUB}"/>')
out.append(f'<rect id="hub-frame" x="{HX0+0.5:g}" y="{HY0+0.5:g}" width="{HUB-1}" height="{HUB-1}" rx="{0.229*HUB:.1f}" '
           f'fill="none" stroke="#ffffff" stroke-opacity=".14" stroke-width="1"/>')
out.append('</g></g>')

# slogan pill under the hub (outside the centring calculation)
CAP = 13.5
cap_w = ImageFont.truetype(FONT_MED, int(CAP * 10)).getlength('Centralise · Croise · Transforme') / 10 + 0.2 * 31 + 28
PILL = (CX - cap_w / 2, HY1 + 20, cap_w, 28)
caption = (f'<g id="caption-layer"><rect x="{PILL[0]:.1f}" y="{PILL[1]:g}" width="{PILL[2]:.1f}" height="{PILL[3]}" rx="14" '
           f'fill="rgba(255,255,255,0.04)" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>'
           + text(CX, PILL[1] + 18.5, 'Centralise · Croise · Transforme', CAP, '#d3d9e0', 500, 'middle', 0.2, 'hub-caption') + '</g>')

# ---------------- connectors ----------------
HUB_IN = (HX0, AXIS)          # single entry point: middle of the hub's left edge
HUB_OUT = (HX1, AXIS)         # single exit point: middle of the hub's right edge

def connector(a, b):
    """a, b = attach-point centres; the line stops at the hollow circles' edge."""
    p0 = (a[0] + PORT_R, a[1]); p3 = (b[0] - PORT_R, b[1])
    d = TENSION * (p3[0] - p0[0])
    return p0, (p0[0] + d, p0[1]), (p3[0] - d, p3[1]), p3

conns = []
for (x, y), (idn, col, *_r) in zip(S, SOURCES):
    conns.append(('flow-in-' + idn[4:], connector((x + CW, y + SRC_H / 2), HUB_IN), col, col))
for (x, y), (idn, *_r) in zip(O, RESULTS):
    conns.append(('flow-out-' + idn[4:], connector(HUB_OUT, (x, y + OUT_H / 2)), OUT_LINE, OUT_LINE))

lines, ports = [], []
port_pts = {}
for idn, (p0, c1, c2, p3), col, pcol in conns:
    d = f'M{p0[0]:g},{p0[1]:g} C{c1[0]:g},{c1[1]:g} {c2[0]:g},{c2[1]:g} {p3[0]:g},{p3[1]:g}'
    op = '' if col == OUT_LINE else ' stroke-opacity=".7"'
    lines.append(f'<path id="{idn}" class="flow" d="{d}" fill="none" stroke="{col}"{op} stroke-width="1.5" stroke-linecap="round"/>')
    start = (p0[0] - PORT_R, p0[1]); end = (p3[0] + PORT_R, p3[1])
    port_pts.setdefault(start, pcol if idn.startswith('flow-in') else HUB_PORT)
    port_pts.setdefault(end, HUB_PORT if idn.startswith('flow-in') else OUT_LINE)
for (x, y), c in port_pts.items():
    ports.append(f'<circle class="port" cx="{x:g}" cy="{y:g}" r="{PORT_R}" fill="none" stroke="{c}" stroke-width="1.5"/>')

body = ''.join(out)
first_card = body.index('<g id="src-recouvrement"')
body = (body[:first_card] + '<g id="flows">' + ''.join(lines) + '</g>' + body[first_card:]
        + '<g id="ports">' + ''.join(ports) + '</g>' + caption)

logo = cv2.imread('/home/user/agodwin12/fleetra-analytics/assets/fleetra-logo.png', cv2.IMREAD_UNCHANGED)
logo = cv2.resize(logo, (512, 512), interpolation=cv2.INTER_AREA)
ok, buf = cv2.imencode('.png', logo)
body = body.replace('@@LOGO@@', base64.b64encode(buf.tobytes()).decode())

html = f'''<!doctype html>
<html lang="fr"><head><meta charset="utf-8"><title>Fleetra Analytics — scène pro</title>
<style>html,body{{margin:0;background:{BG};}} svg{{display:block;font-family:"Inter Display","Inter",system-ui,sans-serif;}}</style></head>
<body><svg id="left-panel" width="{W}" height="{H}" viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg">{body}</svg></body></html>'''
open('/home/user/agodwin12/fleetra-analytics/left-panel/scene-pro.html', 'w').write(html)

# ---------------- checks ----------------
def centre(rect_top, h): return rect_top + h / 2
col_left = (S[0][1] + S[1][1] + SRC_H) / 2
col_right = (O[0][1] + O[3][1] + OUT_H) / 2
print('axis: hub icon centre', AXIS, '| left column centre', col_left, '| right column centre', col_right)
print('hub horizontal centre', CX, '| midpoint between columns', (LX + CW + RX) / 2)
print('gaps left', S[1][1] - (S[0][1] + SRC_H), '| gaps right', {O[i+1][1] - (O[i][1] + OUT_H) for i in range(3)})
# chip labels: horizontal room between neighbours
f = ImageFont.truetype(FONT_MED, CHIP_FS * 10)
colw = (CW - 2 * PAD) / 4
for _i, _c, _t, _d, _ic, chips in SOURCES:
    w = [f.getlength(l) / 10 for _, l in chips]
    gaps = [colw - (w[i] + w[i + 1]) / 2 for i in range(3)]
    print('chip label min gap', _t, round(min(gaps), 1), 'px')
# no crossings: every output line shares x(t) (same start, same end x, same tension) so y order is preserved
samples = [[bez(*c[1], t) for t in [i / 200 for i in range(201)]] for c in conns if c[0].startswith('flow-out')]
cross = any(samples[k][i][1] > samples[k + 1][i][1] for k in range(3) for i in range(201))
print('output lines cross:', cross)
# caption clearance to every line
def dist_rect(px, py, r):
    dx = max(r[0] - px, 0, px - (r[0] + r[2])); dy = max(r[1] - py, 0, py - (r[1] + r[3])); return math.hypot(dx, dy)
print('caption clearance to lines:', round(min(dist_rect(*bez(*c[1], i / 400), PILL) for c in conns for i in range(401)), 1), 'px')
print('grid: cards', S, O, '| hub', (HX0, HY0, HUB))
