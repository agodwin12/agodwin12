"""Compose the final login mockup: rendered left panel + validated login form, with a clean 2px separator (no glow)."""
import cv2, numpy as np

LEFT_W = 1182
SEP_X0, SEP_X1 = 1185, 1187          # 2px crisp line
CLEAN_X1 = 1232                       # glow of the old separator ends before this column
SEP_BGR = np.array([31, 90, 255], np.float32)   # Fleetra orange #ff5a1f

full = cv2.imread('../fleetra-image-complete-v2.png')   # validated form (right side)
H = full.shape[0]

# 1. left panel
left = cv2.imread('left-panel@2x.png')
full[:, :LEFT_W] = cv2.resize(left, (LEFT_W, H), interpolation=cv2.INTER_AREA)

# 2. separator: wipe the old glowing bar, restore each side's background, draw a flat line
left_bg = full[:, LEFT_W - 6:LEFT_W - 2].astype(np.float32).mean(axis=1)            # per row
right_bg = full[:, CLEAN_X1:CLEAN_X1 + 8].astype(np.float32).mean(axis=1)
right_bg = cv2.GaussianBlur(right_bg.reshape(-1, 1, 3), (0, 0), sigmaX=0.1, sigmaY=6).reshape(-1, 3)
for x in range(LEFT_W, SEP_X0):
    full[:, x] = left_bg.astype(np.uint8)
for x in range(SEP_X1, CLEAN_X1):
    full[:, x] = right_bg.astype(np.uint8)
full[:, SEP_X0:SEP_X1] = SEP_BGR.astype(np.uint8)

cv2.imwrite('../fleetra-login-final-v5.png', full)

ref = cv2.imread('../fleetra-image-complete-v2.png')
print('form area identical (x >= %d):' % CLEAN_X1, np.array_equal(ref[:, CLEAN_X1:], full[:, CLEAN_X1:]))
