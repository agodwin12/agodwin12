import numpy as np, cv2, sys

src = cv2.imread('orig.png')
W = 1182
img = src[:, :W].copy()
H = img.shape[0]
f = img.astype(np.float32)
hsv = cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
Hh, Ss, Vv = hsv[..., 0].astype(np.float32), hsv[..., 1] / 255.0, hsv[..., 2] / 255.0

def rrect(x0, y0, x1, y1, r, grow=0):
    m = np.zeros((H, W), np.uint8)
    x0 -= grow; y0 -= grow; x1 += grow; y1 += grow; r += grow
    cv2.rectangle(m, (x0 + r, y0), (x1 - r, y1), 255, -1)
    cv2.rectangle(m, (x0, y0 + r), (x1, y1 - r), 255, -1)
    for cx, cy in [(x0 + r, y0 + r), (x1 - r, y0 + r), (x0 + r, y1 - r), (x1 - r, y1 - r)]:
        cv2.circle(m, (cx, cy), r, 255, -1)
    return m > 0

def box(x0, y0, x1, y1):
    m = np.zeros((H, W), bool)
    m[y0:y1, x0:x1] = True
    return m

# panels (blocks, core, cards)
panels = [
    (62, 408, 362, 553, 22), (62, 574, 362, 723, 22),
    (561, 391, 741, 579, 42),
    (874, 203, 1145, 337, 22), (874, 354, 1145, 490, 22), (874, 506, 1145, 638, 22), (874, 654, 1145, 795, 22),
]
interior = np.zeros((H, W), bool)
halo = np.zeros((H, W), bool)
halo_small = np.zeros((H, W), bool)
for p in panels:
    interior |= rrect(*p, grow=0)
    halo |= rrect(*p, grow=16)
    halo_small |= rrect(*p, grow=5)

# colour candidates (saturated, bright): flows, particles, rings, pins
blue = (Hh > 92) & (Hh < 128) & (Ss > 0.25) & (Vv > 0.22)
cand = ((Ss > 0.38) & (Vv > 0.30)) | blue
cand = cand & ~halo_small
cand_u8 = cand.astype(np.uint8)
n, lab, stats, _ = cv2.connectedComponentsWithStats(cand_u8, connectivity=8)

# zones where flows / rings / pins live
zones = np.zeros((H, W), bool)
zones |= box(362, 425, 562, 675)      # left flows
zones |= box(738, 245, 878, 705)      # right flows
zones |= rrect(650 - 178, 483 - 178, 650 + 178, 483 + 178, 178)  # orbit rings around the core

zones &= ~(box(738, 270, 810, 344) | box(816, 358, 842, 388))
keep_cand = np.zeros((H, W), bool)
for i in range(1, n):
    x, y, w, h, area = stats[i]
    comp = lab == i
    inz = (comp & zones).sum()
    if inz < 0.6 * area:
        continue
    if area >= 45:
        keep_cand |= comp
k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9))
cand_region_f = cv2.GaussianBlur(cv2.dilate(keep_cand.astype(np.uint8), k).astype(np.float32), (0,0), 3.0)
cand_region = cand_region_f > 0.05

# text blocks: headline and bottom strip
head_region = box(58, 132, 445, 308)
strip_region = box(46, 782, 722, 846)
text_region = head_region | strip_region

lum_region = (halo | text_region) & ~interior

maxc = f.max(axis=2) / 255.0
maxc_pre = maxc
alpha_lum = np.clip((maxc - 0.17) / (0.85 - 0.17) * 1.25, 0, 1) ** 0.95
# stronger floor removal on photo-prone areas (not around panel glows)
alpha = np.zeros((H, W), np.float32)
alpha_strip = np.clip((maxc - 0.30) / (0.80 - 0.30) * 1.3, 0, 1)
hue_ok = ((((Hh < 28) | ((Hh > 92) & (Hh < 130))) & (Ss > 0.25)) | (maxc_pre > 0.62)).astype(np.float32)
hue_w = cv2.GaussianBlur(hue_ok, (0,0), 1.2)
hue_w = np.clip(hue_w * 1.6, 0, 1)
halo_only = halo & ~text_region & ~interior
alpha[lum_region] = alpha_lum[lum_region]
alpha[halo_only] = (alpha_lum * hue_w)[halo_only]
softcand = np.clip(cand_region_f * 1.6, 0, 1)
sel = cand_region & ~interior & ~halo & ~head_region & ~strip_region
alpha[sel] = (alpha_lum * softcand)[sel]
alpha_exact = np.clip((maxc - 0.05) / 0.95, 0, 1)
sat_pen = 1.0 - np.clip((Ss - 0.35) * 3.0, 0, 1)
alpha[head_region & ~interior] = alpha_exact[head_region & ~interior]
alpha[strip_region & ~interior] = (alpha_exact * sat_pen)[strip_region & ~interior]
alpha[interior] = 1.0


# --- pins: tight boxes, closed shape
pin_boxes = [(572,114,604,160),(668,218,690,244),(988,134,1024,178)]
pin_mask = np.zeros((H, W), bool)
for (x0,y0,x1,y1) in pin_boxes:
    sub = ((Ss > 0.55) & (Vv > 0.45))[y0:y1, x0:x1].astype(np.uint8)
    sub = cv2.morphologyEx(sub, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(9,9)))
    pin_mask[y0:y1, x0:x1] |= sub > 0
pin_alpha = cv2.GaussianBlur(pin_mask.astype(np.float32), (0,0), 0.8)
alpha = np.maximum(alpha, pin_alpha)

# --- orbit annulus (dashed ring + thin arcs) with lower thresholds
yy, xx = np.mgrid[0:H, 0:W]
rr = np.hypot(xx - 650, yy - 483)
ann = (rr > 92) & (rr < 186)
ring_c = ((Ss > 0.33) & (Vv > 0.20) & ann & ~interior).astype(np.uint8)
n2, lab2, st2, _ = cv2.connectedComponentsWithStats(ring_c, connectivity=8)
ring_keep = np.zeros((H, W), bool)
for i in range(1, n2):
    if st2[i][4] >= 12:
        ring_keep |= lab2 == i
ring_keep = cv2.dilate(ring_keep.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE,(5,5))) > 0
ring_keep &= ann
ring_a = np.where(ring_keep, np.clip((maxc - 0.14) / 0.5 * 1.3, 0, 1), 0).astype(np.float32)
# (photo-derived ring pixels dropped: rings are redrawn cleanly below)


# --- concentric location rings under the pins (redrawn, subtle)
SS = 4
ringlayer = np.zeros((H*SS, W*SS), np.uint8)
for (cx, cy, base) in [(587, 156, 1.0), (1005, 178, 1.0), (680, 252, 0.45), (783, 150, 0.4)]:
    for k, (rx, ry, th) in enumerate([(22, 7, 2), (42, 13, 2), (64, 19, 2)]):
        cv2.ellipse(ringlayer, (int(cx*SS), int(cy*SS)), (int(rx*base*SS), int(ry*base*SS)), 0, 0, 360, 255, th*SS//2, cv2.LINE_AA)
orb = np.zeros((H*SS, W*SS), np.uint8)
C0 = (650*SS, 481*SS)
def arc(r, a0, a1, th, val):
    cv2.ellipse(orb, C0, (r*SS, r*SS), 0, a0, a1, val, th*SS//2, cv2.LINE_AA)
# dashed outer ring
for k in range(0, 360, 6):
    arc(166, k, k+3.2, 2, 150)
arc(146, 200, 335, 2, 105); arc(146, 20, 150, 2, 105)
arc(124, 0, 360, 2, 80)
arc(105, 0, 360, 2, 60)
orb = cv2.resize(orb, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)/255.0
ringlayer = cv2.resize(ringlayer, (W, H), interpolation=cv2.INTER_AREA).astype(np.float32)/255.0
orb_mask = (np.hypot(xx - 650, yy - 481) > 100)

# truck zone near the Finance curve
alpha[262:376, 738:800] = 0
core_b = ((Vv > 0.55) & (Ss > 0.28)).astype(np.uint8)
core_soft = cv2.GaussianBlur(cv2.dilate(core_b, np.ones((3,3),np.uint8)).astype(np.float32), (0,0), 0.9)
alpha[322:376, 800:842] = np.minimum(alpha[322:376, 800:842], core_soft[322:376, 800:842])
alpha[306:334, 702:744] = 0   # road glints near the top of the orbit
# soften panel interior edges
a_soft = cv2.GaussianBlur(interior.astype(np.float32), (0, 0), 1.0)
ring_color = np.array([30, 120, 255], np.float32)  # BGR orange
ring_a2 = np.maximum(ringlayer * 0.42, orb * orb_mask)
alpha = np.maximum(alpha * (~interior), a_soft)

# drop isolated specks (leftover photo lights)
sp = (alpha > 0.15).astype(np.uint8)
n4, lab4, st4, _ = cv2.connectedComponentsWithStats(sp, connectivity=8)
for i in range(1, n4):
    if st4[i][4] < 14:
        alpha[lab4 == i] = 0

# un-premultiply colour for lum regions
a3 = np.clip(alpha, 1e-3, 1)[..., None]
col = np.where(interior[..., None], f, np.clip(f / np.maximum(a3, 0.05), 0, 255))
col = np.clip(col, 0, 255)

new_a = np.maximum(alpha, ring_a2)
w_old = (alpha / np.maximum(new_a, 1e-3))[..., None]
col = col * np.where(ring_a2[..., None] > alpha[..., None], 0, 1) + ring_color * np.where(ring_a2[..., None] > alpha[..., None], 1, 0)
alpha = new_a
rgba = np.dstack([col, alpha * 255]).astype(np.uint8)  # BGRA
cv2.imwrite('left_transparent.png', rgba)

def over(bg):
    bgc = np.zeros_like(f); bgc[:] = bg
    a = alpha[..., None]
    return np.clip(col * a + bgc * (1 - a), 0, 255).astype(np.uint8)

cv2.imwrite('prev_dark.png', over((14, 12, 12)))     # BGR of dark bg
cv2.imwrite('prev_mid.png', over((120, 120, 120)))
cv2.imwrite('../fleetra-scene-transparent.png', rgba)
cv2.imwrite('../fleetra-scene-fond-sombre.png', over((14, 12, 12)))
print('done', rgba.shape)
