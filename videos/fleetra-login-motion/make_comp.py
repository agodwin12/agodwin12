"""Builds index.html (HyperFrames composition) from the validated static left panel.
The SVG is reused verbatim; only the caption is split into <tspan>s so each word can light up."""
import re, pathlib

SRC = pathlib.Path('../../fleetra-analytics/left-panel/index.html').read_text()
svg = re.search(r'<svg id="left-panel".*?</svg>', SRC, re.S).group(0)
# fill the composition box (keep the 1182x875 design coordinates via viewBox)
svg = svg.replace('width="1182" height="875" viewBox', 'width="100%" height="100%" viewBox', 1)
svg = svg.replace('Centralise · Croise · Transforme',
                  '<tspan id="w1">Centralise</tspan> · <tspan id="w2">Croise</tspan> · <tspan id="w3">Transforme</tspan>')
# moving data packets live above the ports
svg = svg.replace('</svg>', '<g id="trace-layer"></g><g id="packets"></g></svg>')

timeline = pathlib.Path('motion.js').read_text()

html = f'''<!doctype html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=2364, height=1750" />
<title>Fleetra Analytics — flux de données</title>
<script src="vendor/gsap.min.js"></script>
<script src="vendor/MotionPathPlugin.min.js"></script>
<style>
  @font-face {{ font-family: "Inter Display"; font-weight: 400; src: url("fonts/InterDisplay-Regular.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 500; src: url("fonts/InterDisplay-Medium.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 600; src: url("fonts/InterDisplay-SemiBold.otf") format("opentype"); }}
  @font-face {{ font-family: "Inter Display"; font-weight: 700; src: url("fonts/InterDisplay-Bold.otf") format("opentype"); }}
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  html, body {{ width: 2364px; height: 1750px; overflow: hidden; background: #060b0d; }}
  #root {{ position: relative; width: 100%; height: 100%; overflow: hidden; background: #060b0d; }}
  #root svg {{ position: absolute; inset: 0; display: block; font-family: "Inter Display", sans-serif; }}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="8" data-width="2364" data-height="1750">
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
print('index.html written', len(html))
