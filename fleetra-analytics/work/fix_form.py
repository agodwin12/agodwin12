import numpy as np, cv2
from PIL import Image, ImageDraw, ImageFont

SRC = '../fleetra-image-complete.png'
OUT = '../fleetra-image-complete-v2.png'
im = cv2.imread(SRC)
H, W = im.shape[:2]

X0, X1 = 1235, 1775            # columns that hold the form content
SHIFT = 91                      # re-centre the shortened block vertically

def vfill(img, y0, y1, x0=X0, x1=X1):
    """fill rows y0..y1 by interpolating the clean rows above/below, column by column"""
    def ref(ya, yb):
        r = img[ya:yb, x0:x1].astype(np.float32).mean(axis=0)
        return cv2.GaussianBlur(r.reshape(1, -1, 3), (0, 0), sigmaX=30, borderType=cv2.BORDER_REPLICATE).reshape(-1, 3)
    top = ref(y0 - 4, y0)
    bot = ref(y1, y1 + 4)
    n = y1 - y0
    for i in range(n):
        t = (i + 0.5) / n
        img[y0 + i, x0:x1] = (top * (1 - t) + bot * t).astype(np.uint8)

# 1. logo block + two-line title: remove (rows 92..312)
vfill(im, 92, 314)

# 2. move subtitle -> button up so the block is centred again
block = im[314:800, X0:X1].copy()
im[314 - SHIFT:800 - SHIFT, X0:X1] = block
vfill(im, 800 - SHIFT, 812)

# 3. one-line header: [logo] Bienvenue dans Fleetra Analytics
src_full = cv2.imread(SRC)
icon = src_full[104:162, 1258:1315]                     # original logo icon (57x58)
sub_y = 333 - SHIFT                                      # subtitle centre after the shift
BOLD = '/usr/share/fonts/opentype/inter/InterDisplay-Bold.otf'
LEFT, RIGHT = 1262, 1741
AVAIL = RIGHT - LEFT

def layout(s):
    f = ImageFont.truetype(BOLD, s)
    w1 = f.getlength('Bienvenue dans ')
    w2 = f.getlength('Fleetra Analytics')
    icon_h = round(1.18 * s)
    gap = round(0.36 * s)
    return f, w1, w2, icon_h, gap, icon_h + gap + w1 + w2

s = 60
while s > 20:
    f, w1, w2, icon_h, gap, total = layout(s)
    if total <= AVAIL:
        break
    s -= 0.5
f, w1, w2, icon_h, gap, total = layout(s)
print('font size', s, 'total width', round(total), 'avail', AVAIL, 'icon', icon_h)

SS = 4
Wc, Hc = (RIGHT - LEFT + 40) * SS, 140 * SS
layer = Image.new('RGBA', (Wc, Hc), (0, 0, 0, 0))
d = ImageDraw.Draw(layer)
fb = ImageFont.truetype(BOLD, round(s * SS))
cap = fb.getbbox('H')                                   # (l, t, r, b) -> cap height
cap_h = cap[3] - cap[1]
cy = Hc // 2
tx = round((icon_h + gap) * SS)
base_y = cy + cap_h // 2
WHITE, ORANGE = (250, 250, 250, 255), (238, 75, 12, 255)
d.text((tx, base_y), 'Bienvenue dans ', font=fb, fill=WHITE, anchor='ls')
d.text((tx + w1 * SS, base_y), 'Fleetra Analytics', font=fb, fill=ORANGE, anchor='ls')

# logo icon, rounded-rect mask, vertically centred on the capital letters
ic = cv2.resize(icon, (icon_h, icon_h), interpolation=cv2.INTER_AREA)
ic_big = cv2.resize(icon, (icon_h * SS, icon_h * SS), interpolation=cv2.INTER_CUBIC)
ic_rgb = Image.fromarray(cv2.cvtColor(ic_big, cv2.COLOR_BGR2RGB))
mask = Image.new('L', ic_rgb.size, 0)
ImageDraw.Draw(mask).rounded_rectangle((0, 0, ic_rgb.size[0] - 1, ic_rgb.size[1] - 1), radius=int(0.2 * ic_rgb.size[0]), fill=255)
layer.paste(ic_rgb, (0, cy - ic_rgb.size[1] // 2), mask)

layer = layer.resize((Wc // SS, Hc // SS), Image.LANCZOS)
la = np.array(layer).astype(np.float32)
alpha = la[..., 3:4] / 255.0
rgb = la[..., :3][..., ::-1]                             # to BGR

# vertical placement: title baseline sits ~32px above subtitle centre (same rhythm as before)
cap_px = cap_h / SS
base_target = sub_y - 40
cy_target = base_target - cap_px / 2
oy = int(round(cy_target - Hc / SS / 2))
ox = LEFT
reg = im[oy:oy + layer.size[1], ox:ox + layer.size[0]].astype(np.float32)
im[oy:oy + layer.size[1], ox:ox + layer.size[0]] = np.clip(rgb * alpha + reg * (1 - alpha), 0, 255).astype(np.uint8)

cv2.imwrite(OUT, im)
print('saved', OUT, 'title centre y', round(cy_target))
