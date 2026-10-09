"""Builds index.html (HyperFrames composition) from the validated static left panel.
The SVG is reused verbatim; only the caption is split into <tspan>s so each word can light up."""
import re, pathlib, sys
TRANSPARENT = '--transparent' in sys.argv   # alpha render: no scene background at all
MOTION = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--motion=')), 'motion.js')
DURATION = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--duration=')), '8')
SCENE = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--scene=')), 'desktop')

SRC = pathlib.Path(f'../../fleetra-analytics/left-panel/scene-{SCENE}.html').read_text()
svg = re.search(r'<svg id="left-panel".*?</svg>', SRC, re.S).group(0)
# fill the composition box (keep the 1182x875 design coordinates via viewBox)
VW, VH = map(int, re.search(r'viewBox="0 0 (\d+) (\d+)"', svg).groups())
SCALE = int(next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--scale=')), '2'))
CW_, CH_ = VW * SCALE, VH * SCALE               # 2x by default for crisp text; --scale=1 for the light web file
svg = re.sub(r'width="\d+" height="\d+" viewBox', 'width="100%" height="100%" viewBox', svg, count=1)
svg = svg.replace('Centralise · Croise · Transforme',
                  '<tspan id="w1">Centralise</tspan> · <tspan id="w2">Croise</tspan> · <tspan id="w3">Transforme</tspan>')
# moving data packets live above the ports
# packets travel above the lines; the caption pill stays on top of everything
cap = re.search(r'<g id="caption-layer">.*?</g>', svg, re.S)
cap_html = cap.group(0) if cap else ''
svg = svg.replace(cap_html, '')
svg = svg.replace('</svg>', '<g id="trace-layer"></g><g id="packets"></g>' + cap_html + '</svg>')
BG = 'transparent' if TRANSPARENT else ('#081318' if 'bg-layer' in svg else '#060b0d')
if TRANSPARENT:
    svg, n = re.subn(rf'<rect width="{VW}" height="{VH}" fill="#060b0d"/>', '', svg)
    svg, n2 = re.subn(r'<g id="bg-layer">.*?</g>', '', svg, flags=re.S)   # v4 scenes keep their background in one layer
    assert n + n2 == 1, 'scene background not found'

timeline = pathlib.Path(MOTION).read_text()

html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width={CW_}, height={CH_}" />
<title>Fleetra Analytics — flux de données</title>
<script src="vendor/gsap.min.js"></script>
<script src="vendor/MotionPathPlugin.min.js"></script>
<style>
  @font-face {{ font-family: "Inter Display"; font-weight: 400; src: url("fonts/InterDisplay-Regular.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 500; src: url("fonts/InterDisplay-Medium.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 600; src: url("fonts/InterDisplay-SemiBold.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 700; src: url("fonts/InterDisplay-Bold.otf") format("opentype"); }}
  @font-face {{ font-family: "DejaVu Sans Mono"; font-weight: 400; src: url("fonts/DejaVuSansMono.ttf") format("truetype"); }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: {CW_}px; height: {CH_}px; overflow: hidden; background: {BG}; }}
  #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: {BG}; }}
  #root svg {{ position: absolute; inset: 0; display: block; font-family: "Inter Display", sans-serif; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DURATION}" data-width="{CW_}" data-height="{CH_}">
{svg}
</div>
<script>
{timeline}
window.__timelines["main"] = tl;
tl.seek(0);
</script>
</body>
</html>
'''
pathlib.Path('index.html').write_text(html)
print('index.html written', SCENE, CW_, CH_, 'transparent' if TRANSPARENT else 'opaque')
