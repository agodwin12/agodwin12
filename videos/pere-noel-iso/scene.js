/* World construction: HQ island (workshop), town island (houses), sleigh. Everything is static SVG; motion lives in index.html */

const R = mulberry32(2024);

/* ---------------- islands ---------------- */
function island(x, y, W, D, id) {
  const J1 = P(W * 0.74, D * 0.8, -3.4), J2 = P(W * 0.3, D * 0.78, -2.8), J3 = P(W * 0.78, D * 0.26, -3.0), A = P(W * 0.5, D * 0.5, -6.2);
  const Wl = P(0, D, -0.55), Wr = P(W, D, -0.55), Wt = P(W, 0, -0.55);
  let s = "";
  /* rock underbelly */
  s += poly([Wl, Wr, J1, A, J2], "url(#gRockL)");
  s += poly([Wt, Wr, J1, A, J3], "url(#gRockR)");
  /* facets */
  s += poly([P(W * 0.2, D, -0.55), P(W * 0.42, D, -0.55), J2], "rgba(255,255,255,.07)");
  s += poly([P(W * 0.55, D, -0.55), P(W * 0.8, D, -0.55), P(W * 0.62, D * 0.9, -2.6)], "rgba(0,0,40,.18)");
  s += poly([P(W, D * 0.2, -0.55), P(W, D * 0.55, -0.55), P(W * 0.86, D * 0.4, -2.3)], "rgba(255,255,255,.06)");
  s += poly([P(W, D * 0.62, -0.55), P(W, D * 0.9, -0.55), P(W * 0.9, D * 0.78, -2.6)], "rgba(0,0,40,.22)");
  /* icy slab */
  s += box(0, 0, -0.55, W, D, 0.55, "#cfe1ff");
  /* snow top: slightly inset rounded look */
  s += poly([P(0, 0, 0), P(W, 0, 0), P(W, D, 0), P(0, D, 0)], "url(#gGround)");
  /* snow drift lips along the front edges */
  const lipL = [], lipR = [];
  const n = 14;
  for (let i = 0; i <= n; i++) lipL.push(P((W * i) / n, D, 0.001 + (i % 2 ? 0.0 : 0)));
  s += `<polyline points="${pts(lipL)}" stroke="#ffffff" stroke-width="3" fill="none" opacity=".9"/>`;
  for (let i = 0; i <= n; i++) lipR.push(P(W, (D * i) / n, 0.001));
  s += `<polyline points="${pts(lipR)}" stroke="#ffffff" stroke-width="3" fill="none" opacity=".9"/>`;
  return `<g id="${id}" class="isl">${s}</g>`;
}

/* ---------------- gift monument (logo) ---------------- */
function giantGift(ox, oy, sz) {
  const body = "#d83a45", rib = "#ffd35a";
  const f = faces(body), fr = faces(rib);
  const a = 0;
  let s = "";
  s += `<g class="gg-shadow">${shadowQuad(-0.2, -0.1, sz + 1.0, sz + 0.8, 0.3)}</g>`;
  /* body */
  const bh = sz * 0.82;
  let b = box(0, 0, 0, sz, sz, bh, body);
  const rw = sz * 0.16, mid = sz / 2;
  b += poly([P(mid - rw, 0, bh + 0.001), P(mid + rw, 0, bh + 0.001), P(mid + rw, sz, bh + 0.001), P(mid - rw, sz, bh + 0.001)], fr.t);
  b += poly([P(0, mid - rw, bh + 0.002), P(sz, mid - rw, bh + 0.002), P(sz, mid + rw, bh + 0.002), P(0, mid + rw, bh + 0.002)], fr.t);
  b += poly([P(mid - rw, sz, bh), P(mid + rw, sz, bh), P(mid + rw, sz, 0), P(mid - rw, sz, 0)], fr.l);
  b += poly([P(sz, mid - rw, bh), P(sz, mid + rw, bh), P(sz, mid + rw, 0), P(sz, mid - rw, 0)], fr.r);
  s += `<g class="gg-body">${b}</g>`;
  /* lid */
  const lo = 0.14, lh = sz * 0.2;
  let l = box(-lo, -lo, bh, sz + lo * 2, sz + lo * 2, lh, mix(body, "#ffffff", 0.06));
  const L0 = bh + lh;
  l += poly([P(mid - rw, -lo, L0 + 0.001), P(mid + rw, -lo, L0 + 0.001), P(mid + rw, sz + lo, L0 + 0.001), P(mid - rw, sz + lo, L0 + 0.001)], fr.t);
  l += poly([P(-lo, mid - rw, L0 + 0.002), P(sz + lo, mid - rw, L0 + 0.002), P(sz + lo, mid + rw, L0 + 0.002), P(-lo, mid + rw, L0 + 0.002)], fr.t);
  l += poly([P(mid - rw, sz + lo, L0), P(mid + rw, sz + lo, L0), P(mid + rw, sz + lo, bh), P(mid - rw, sz + lo, bh)], fr.l);
  l += poly([P(sz + lo, mid - rw, L0), P(sz + lo, mid + rw, L0), P(sz + lo, mid + rw, bh), P(sz + lo, mid - rw, bh)], fr.r);
  s += `<g class="gg-lid">${l}</g>`;
  /* bow */
  const [bx, by] = P(mid, mid, L0 + 0.02);
  const k = sz * 0.3;
  const bow =
    `<g class="gg-bow"><ellipse cx="${f1(bx - 46 * k)}" cy="${f1(by - 26 * k)}" rx="${f1(46 * k)}" ry="${f1(28 * k)}" fill="${fr.t}" transform="rotate(-28 ${f1(bx - 46 * k)} ${f1(by - 26 * k)})"/>` +
    `<ellipse cx="${f1(bx - 46 * k)}" cy="${f1(by - 26 * k)}" rx="${f1(26 * k)}" ry="${f1(14 * k)}" fill="${sh(rib, 0.8)}" transform="rotate(-28 ${f1(bx - 46 * k)} ${f1(by - 26 * k)})"/>` +
    `<ellipse cx="${f1(bx + 46 * k)}" cy="${f1(by - 26 * k)}" rx="${f1(46 * k)}" ry="${f1(28 * k)}" fill="${fr.l}" transform="rotate(28 ${f1(bx + 46 * k)} ${f1(by - 26 * k)})"/>` +
    `<ellipse cx="${f1(bx + 46 * k)}" cy="${f1(by - 26 * k)}" rx="${f1(26 * k)}" ry="${f1(14 * k)}" fill="${sh(rib, 0.65)}" transform="rotate(28 ${f1(bx + 46 * k)} ${f1(by - 26 * k)})"/>` +
    `<circle cx="${f1(bx)}" cy="${f1(by - 10 * k)}" r="${f1(22 * k)}" fill="${fr.t}"/></g>`;
  s += bow;
  return wrapO(ox, oy, 0, s, "", "giantGift");
}

/* ---------------- workshop ---------------- */
function workshop(ox, oy) {
  const w = 5.6, d = 4, h = 3.2, rh = 1.9, ov = 0.5;
  const wall = "#c9404a", roofC = "#2f4aa8";
  let s = "";
  s += shadowQuad(-0.3, -0.2, w + 1.3, d + 1.1, 0.3);
  s += box(0, 0, 0, w, d, h, wall, { cls: "ws-wall" });
  /* wall stripes (white vertical candy trim) */
  for (let i = 0; i < 6; i++) {
    const x0 = 0.35 + i * 0.95;
    s += poly([P(x0, d, 0), P(x0 + 0.22, d, 0), P(x0 + 0.22, d, h), P(x0, d, h)], "rgba(255,255,255,.16)");
  }
  /* door */
  const dx = 2.2, dw = 1.2, dh = 1.9;
  s += poly([P(dx, d, 0), P(dx + dw, d, 0), P(dx + dw, d, dh), P(dx, d, dh)], "#5a2f2a");
  s += poly([P(dx + 0.12, d, 0), P(dx + dw - 0.12, d, 0), P(dx + dw - 0.12, d, dh - 0.12), P(dx + 0.12, d, dh - 0.12)], "#ffd27a", 'class="ws-doorlit"');
  s += `<polygon points="${pts([P(dx, d, 0), P(dx + dw, d, 0), P(dx + dw, d, dh), P(dx, d, dh)])}" fill="none" stroke="#f3f7ff" stroke-width="3.5"/>`;
  const dcx = P(dx + dw / 2, d, 1.0);
  s += `<ellipse class="halo2" cx="${f1(dcx[0])}" cy="${f1(dcx[1] + 20)}" rx="${f1(S * 1.8)}" ry="${f1(S * 1.4)}" fill="url(#gHalo)" style="mix-blend-mode:screen"/>`;
  /* windows lit from the start */
  [0.35, 3.6].forEach((x0) => {
    s += winL(x0, 1.0, 1.2, 1.3, d, { cls: "lit-now" });
  });
  [0.7, 2.2].forEach((y0) => {
    s += winR(y0, 1.0, 1.0, 1.3, w, { cls: "lit-now" });
  });
  /* sign board across the lintel */
  const sg = [P(1.75, d + 0.03, 2.62), P(3.55, d + 0.03, 2.62), P(3.55, d + 0.03, 2.1), P(1.75, d + 0.03, 2.1)];
  s += poly(sg, "#fff4d8");
  s += `<polygon points="${pts(sg)}" fill="none" stroke="#a8742e" stroke-width="3"/>`;
  const sp = P(1.88, d + 0.04, 2.2);
  s += `<text transform="matrix(${f1(C / 100)} ${f1(H / 100)} 0 ${f1(S / 100)} ${f1(sp[0])} ${f1(sp[1])})" font-family="IDisp" font-weight="900" font-size="34" fill="#b02a36" letter-spacing="1">ATELIER</text>`;
  /* roof */
  const rp = roofParts(w, d, h, rh, ov, roofC, wall);
  s += rp.back + rp.snowB + rp.gable + rp.front + rp.snowF;
  s += chimneyAt(3.6, 0.5, 1.0, 0.9, h, rh, d, ov, h + rh + 1.3, "#b4573a", false);
  /* ridge star */
  const sp2 = P(w * 0.5, d / 2, h + rh + 0.6);
  s += `<g class="ws-star">${star(sp2[0], sp2[1], 22, 9, "#ffd35a")}<circle cx="${f1(sp2[0])}" cy="${f1(sp2[1])}" r="44" fill="url(#gHalo)" style="mix-blend-mode:screen" opacity=".85"/></g>`;
  return wrapO(ox, oy, 0, s, "bi", "workshop");
}

/* chimney sitting on the back roof slope (roof ridge runs along x) */
function chimneyAt(cx, cy, cw, cd, h, rh, d, ov, top, color, ember = true) {
  const zr = (yy) => h + rh * ((yy + ov) / (d / 2 + ov));
  const zA = zr(cy + cd), zB = zr(cy);
  const bf = faces(color);
  let s = poly([P(cx, cy + cd, top), P(cx + cw, cy + cd, top), P(cx + cw, cy + cd, zA), P(cx, cy + cd, zA)], bf.l);
  s += `<polygon points="${pts([P(cx + cw, cy, top), P(cx + cw, cy + cd, top), P(cx + cw, cy + cd, zA), P(cx + cw, cy, zB)])}" fill="${bf.r}"/>`;
  s += poly([P(cx - 0.06, cy - 0.06, top), P(cx + cw + 0.06, cy - 0.06, top), P(cx + cw + 0.06, cy + cd + 0.06, top), P(cx - 0.06, cy + cd + 0.06, top)], "#e8f0ff");
  s += poly([P(cx + 0.13, cy + 0.12, top + 0.01), P(cx + cw - 0.13, cy + 0.12, top + 0.01), P(cx + cw - 0.13, cy + cd - 0.1, top + 0.01), P(cx + 0.13, cy + cd - 0.1, top + 0.01)], "#241a2a");
  if (ember) s += poly([P(cx + 0.2, cy + 0.2, top + 0.02), P(cx + cw - 0.2, cy + 0.2, top + 0.02), P(cx + cw - 0.2, cy + cd - 0.18, top + 0.02), P(cx + 0.2, cy + cd - 0.18, top + 0.02)], "#ff9a3c", 'class="ember" opacity="0"');
  return s;
}

/* ---------------- ordinary houses ---------------- */
const HOUSES = [];
function house(id, ox, oy, w, d, h, rh, wall, roofC, o = {}) {
  const ov = 0.35;
  const cx = w * 0.72, cy = d * 0.16, cw = 0.7, cd = 0.7;
  const ch = h + rh + 0.55;
  let s = shadowQuad(-0.2, -0.1, w + 0.9, d + 0.7, 0.28);
  s += box(0, 0, 0, w, d, h, wall);
  /* door + windows */
  const dx = w * 0.42;
  s += poly([P(dx, d, 0), P(dx + 0.85, d, 0), P(dx + 0.85, d, 1.55), P(dx, d, 1.55)], "#6b3f2c");
  s += `<polygon points="${pts([P(dx, d, 0), P(dx + 0.85, d, 0), P(dx + 0.85, d, 1.55), P(dx, d, 1.55)])}" fill="none" stroke="#f3f7ff" stroke-width="3"/>`;
  const wr = P(dx + 0.42, d, 1.0);
  s += `<circle cx="${f1(wr[0])}" cy="${f1(wr[1] - 6)}" r="12" fill="none" stroke="#2c8f5a" stroke-width="5"/><circle cx="${f1(wr[0] + 7)}" cy="${f1(wr[1] + 2)}" r="3.5" fill="#e63946"/>`;
  s += winL(0.5, 0.9, 0.95, 1.0, d);
  s += winL(w - 1.45, 0.9, 0.95, 1.0, d);
  s += winR(d * 0.28, 0.9, 0.95, 1.0, w);
  /* roof */
  const rp = roofParts(w, d, h, rh, ov, roofC, wall);
  s += rp.back + rp.snowB + rp.gable + rp.front + rp.snowF;
  s += chimneyAt(cx, cy, cw, cd, h, rh, d, ov, ch, "#b4573a");
  const hs = { id, ox, oy, w, d, h, chx: ox + cx + cw / 2, chy: oy + cy + cd / 2, chz: ch + 0.1 };
  HOUSES.push(hs);
  return { depth: ox + oy + w * 0.5 + d * 0.5, svg: wrapO(ox, oy, 0, s, "bi house", id) };
}

/* ---------------- hero house with cutaway interior ---------------- */
function heroHouse(id, ox, oy) {
  const w = 5.4, d = 4.6, h = 2.9, rh = 1.7, ov = 0.4;
  const wall = "#5b8fd9", roofC = "#d6453d";
  const cx = 3.5, cy = 0.0, cw = 1.1, cd = 0.8;
  const topZ = h + rh + 0.8;
  const roofZ = (yy) => h + rh * ((yy + ov) / (d / 2 + ov));
  let s = shadowQuad(-0.3, -0.2, w + 1.1, d + 0.9, 0.3);
  /* ---- interior ---- */
  let inn = "";
  /* floor */
  inn += poly([P(0, 0, 0.02), P(w, 0, 0.02), P(w, d, 0.02), P(0, d, 0.02)], "#c98853");
  for (let i = 1; i < 9; i++) inn += `<polyline points="${pts([P((w * i) / 9, 0, 0.03), P((w * i) / 9, d, 0.03)])}" stroke="rgba(80,40,20,.22)" stroke-width="1.5"/>`;
  /* rug */
  inn += poly([P(1.6, 1.3, 0.04), P(3.9, 1.3, 0.04), P(3.9, 3.4, 0.04), P(1.6, 3.4, 0.04)], "#b3333f");
  inn += poly([P(1.8, 1.5, 0.05), P(3.7, 1.5, 0.05), P(3.7, 3.2, 0.05), P(1.8, 3.2, 0.05)], "none", 'stroke="#f2cf7a" stroke-width="3"');
  /* back walls (inner faces) */
  inn += poly([P(0, 0, 0), P(0, d, 0), P(0, d, h), P(0, 0, h)], "#f0c98b");
  inn += poly([P(0, 0, 0), P(w, 0, 0), P(w, 0, h), P(0, 0, h)], "#f7d9a2");
  for (let i = 1; i < 12; i++) {
    inn += `<polyline points="${pts([P(0, 0, 0.02 + 0), P(0, 0, 0)])}" stroke="none"/>`;
    inn += `<polyline points="${pts([P((w * i) / 12, 0, 0), P((w * i) / 12, 0, h)])}" stroke="rgba(190,120,70,.13)" stroke-width="5"/>`;
  }
  /* baseboards */
  inn += poly([P(0, 0, 0), P(w, 0, 0), P(w, 0, 0.22), P(0, 0, 0.22)], "#7b4a2f");
  inn += poly([P(0, 0, 0), P(0, d, 0), P(0, d, 0.22), P(0, 0, 0.22)], "#6a3e27");
  /* window on x=0 wall with night view + curtains */
  const wq = [P(0, 1.3, 1.1), P(0, 2.6, 1.1), P(0, 2.6, 2.3), P(0, 1.3, 2.3)];
  inn += poly(wq, "#0d1850");
  for (let i = 0; i < 6; i++) {
    const p = P(0, 1.45 + (i * 0.2) % 1.1, 1.3 + ((i * 37) % 10) / 10);
    inn += `<circle cx="${f1(p[0])}" cy="${f1(p[1])}" r="2" fill="#fff6c8"/>`;
  }
  inn += `<polygon points="${pts(wq)}" fill="none" stroke="#fff4e0" stroke-width="5"/>`;
  inn += poly([P(0, 1.2, 2.45), P(0, 1.55, 2.45), P(0, 1.7, 0.95), P(0, 1.2, 0.95)], "#a12b3c");
  inn += poly([P(0, 2.35, 2.45), P(0, 2.7, 2.45), P(0, 2.7, 0.95), P(0, 2.55, 0.95)], "#a12b3c");
  /* frames on y=0 wall */
  inn += poly([P(0.9, 0, 1.5), P(1.9, 0, 1.5), P(1.9, 0, 2.3), P(0.9, 0, 2.3)], "#3d6fb0", 'stroke="#7a4a2d" stroke-width="5"');
  inn += poly([P(2.1, 0, 1.7), P(2.7, 0, 1.7), P(2.7, 0, 2.3), P(2.1, 0, 2.3)], "#f0a8a8", 'stroke="#7a4a2d" stroke-width="5"');
  /* chimney breast + fireplace */
  inn += box(3.0, 0, 0, 2.0, 0.9, 1.3, "#8d93a6");
  inn += poly([P(3.35, 0.9, 0), P(4.65, 0.9, 0), P(4.65, 0.9, 0.9), P(3.35, 0.9, 0.9)], "#1a0f14");
  inn += `<g id="fire"><polygon points="${pts([P(3.7, 0.88, 0.02), P(4.3, 0.88, 0.02), P(4.1, 0.88, 0.7), P(3.9, 0.88, 0.45)])}" fill="#ff7a1c"/><polygon points="${pts([P(3.82, 0.88, 0.02), P(4.18, 0.88, 0.02), P(4.0, 0.88, 0.45)])}" fill="#ffd45a"/></g>`;
  inn += `<ellipse id="fireGlow" cx="${f1(P(4.0, 1.6, 0.4)[0])}" cy="${f1(P(4.0, 1.6, 0.4)[1])}" rx="${f1(S * 2.2)}" ry="${f1(S * 1.3)}" fill="url(#gHalo)" style="mix-blend-mode:screen"/>`;
  inn += box(2.85, 0, 1.3, 2.3, 1.0, 0.14, "#6b4430");
  /* stockings */
  [3.2, 3.9, 4.6].forEach((x0, i) => {
    inn += poly([P(x0, 1.0, 1.3), P(x0 + 0.26, 1.0, 1.3), P(x0 + 0.26, 1.0, 0.82), P(x0 + 0.42, 1.0, 0.68), P(x0 + 0.1, 1.0, 0.6), P(x0, 1.0, 0.82)], ["#d6453d", "#2f9e63", "#d6453d"][i]);
    inn += poly([P(x0, 1.0, 1.3), P(x0 + 0.26, 1.0, 1.3), P(x0 + 0.26, 1.0, 1.18), P(x0, 1.0, 1.18)], "#fff");
  });
  /* flue interior (lower) */
  inn += box(3.45, 0, 1.44, cw, cd, topZ - 1.44 - 0.0, "#b4573a", { id: id + "FlueLo", cls: "fluelo" });
  /* tree */
  let tr = "";
  tr += shadowQuad(-0.9, -0.8, 1.9, 1.7, 0.22);
  tr += cyl(0, 0, 0, 0.14, 0.45, "#6b4630", { top: "#8a5d40" });
  [[0.95, 0.4, 0.95], [0.8, 0.95, 0.9], [0.62, 1.5, 0.85], [0.44, 2.0, 0.8]].forEach(([r, z, hh]) => {
    tr += cone(0, 0, z, r, hh, "url(#gTreeA)");
  });
  const tstar = P(0, 0, 2.9);
  tr += star(tstar[0], tstar[1] - 6, 20, 8, "#ffd35a");
  tr += `<circle class="tree-halo" cx="${f1(tstar[0])}" cy="${f1(tstar[1] - 6)}" r="${f1(S * 1.2)}" fill="url(#gHalo)" opacity="0" style="mix-blend-mode:screen"/>`;
  const lcols = ["#ff5a5a", "#ffd35a", "#5ad1ff", "#ff8cf0", "#7dff9a"];
  for (let i = 0; i < 16; i++) {
    const t = i / 16;
    const z = 0.7 + t * 1.9;
    const rr = (1 - t) * 0.72 + 0.1;
    const ang = i * 2.4;
    const p = P(Math.cos(ang) * rr, Math.sin(ang) * rr, z);
    tr += `<circle class="orn" cx="${f1(p[0])}" cy="${f1(p[1])}" r="4.2" fill="${lcols[i % 5]}" opacity=".9"/>`;
  }
  inn += wrapO(1.2, 2.5, 0, tr, "heroTree");
  /* gifts already under the tree */
  inn += wrapO(0.7, 3.5, 0, giftSVG(0.5, "#3f8fe0", "#ffe27a"));
  inn += wrapO(2.0, 3.65, 0, giftSVG(0.42, "#9b5de5", "#fff"));
  /* the delivered gift (revealed during the hero beat) */
  inn += wrapO(1.5, 3.2, 0, giftSVG(0.62, "#e63946", "#ffd35a"), "", "heroGiftLanded");
  /* armchair */
  inn += box(3.7, 2.9, 0, 1.2, 1.1, 0.55, "#3d5a9b");
  inn += box(3.7, 2.9, 0.55, 1.2, 0.22, 0.7, "#34508d");
  /* warm light wash */
  const lw = P(1.5, 1.5, 1.3);
  inn += `<ellipse id="roomWash" cx="${f1(lw[0])}" cy="${f1(lw[1])}" rx="${f1(S * 3.6)}" ry="${f1(S * 2.4)}" fill="url(#gHalo)" opacity=".55" style="mix-blend-mode:screen"/>`;
  s += `<g id="${id}Interior">${inn}</g>`;
  /* ---- front walls (will turn into ghosts) ---- */
  let fw = "";
  fw += box(0, 0, 0, w, d, h, wall, { noTop: true, id: id + "Wall", cls: "hw", stroke: "rgba(255,255,255,.0)" });
  fw += poly([P(0.4, d, 0), P(w - 0.4, d, 0), P(w - 0.4, d, 0.25), P(0.4, d, 0.25)], "rgba(255,255,255,.18)");
  const dx = 2.3;
  fw += poly([P(dx, d, 0), P(dx + 0.95, d, 0), P(dx + 0.95, d, 1.7), P(dx, d, 1.7)], "#e8e2cf");
  fw += `<polygon points="${pts([P(dx, d, 0), P(dx + 0.95, d, 0), P(dx + 0.95, d, 1.7), P(dx, d, 1.7)])}" fill="none" stroke="#f3f7ff" stroke-width="3"/>`;
  const wr = P(dx + 0.47, d, 1.05);
  fw += `<circle cx="${f1(wr[0])}" cy="${f1(wr[1] - 8)}" r="14" fill="none" stroke="#2c8f5a" stroke-width="6"/><circle cx="${f1(wr[0] + 8)}" cy="${f1(wr[1] + 2)}" r="4" fill="#e63946"/>`;
  fw += winL(0.5, 0.95, 1.05, 1.1, d);
  fw += winL(w - 1.55, 0.95, 1.05, 1.1, d);
  fw += winR(0.7, 0.95, 1.0, 1.1, w);
  fw += winR(2.7, 0.95, 1.0, 1.1, w);
  s += `<g id="${id}Walls">${fw}</g>`;
  /* ---- roof (lifts away) ---- */
  const rp = roofParts(w, d, h, rh, ov, roofC, wall);
  s += `<g id="${id}Roof">${rp.back + rp.gable + rp.front + rp.snowB + rp.snowF}</g>`;
  /* ---- chimney upper ---- */
  const zA = roofZ(cy + cd), zB = roofZ(cy);
  const bf = faces("#b4573a");
  let up = "";
  up += `<polygon class="chup" points="${pts([P(cx, cy + cd, topZ), P(cx + cw, cy + cd, topZ), P(cx + cw, cy + cd, zA), P(cx, cy + cd, zA)])}" fill="${bf.l}"/>`;
  up += `<polygon class="chup" points="${pts([P(cx + cw, cy, topZ), P(cx + cw, cy + cd, topZ), P(cx + cw, cy + cd, zA), P(cx + cw, cy, zB)])}" fill="${bf.r}"/>`;
  up += `<polygon class="chup" points="${pts([P(cx - 0.06, cy - 0.06, topZ), P(cx + cw + 0.06, cy - 0.06, topZ), P(cx + cw + 0.06, cy + cd + 0.06, topZ), P(cx - 0.06, cy + cd + 0.06, topZ)])}" fill="#e8f0ff"/>`;
  up += `<polygon class="chup" points="${pts([P(cx + 0.14, cy + 0.12, topZ + 0.01), P(cx + cw - 0.14, cy + 0.12, topZ + 0.01), P(cx + cw - 0.14, cy + cd - 0.1, topZ + 0.01), P(cx + 0.14, cy + cd - 0.1, topZ + 0.01)])}" fill="#241a2a"/>`;
  s += `<g id="${id}Chimney">${up}</g>`;
  HOUSES.push({ id, ox, oy, w, d, h, hero: true, chx: ox + cx + cw / 2, chy: oy + cy + cd / 2, chz: topZ + 0.1, topZ });
  return { depth: ox + oy + w * 0.5 + d * 0.5, svg: wrapO(ox, oy, 0, s, "bi house", id) };
}

/* ---------------- sleigh + reindeer (origin at ground under centre of sleigh, flying toward +x) ---------------- */
function reindeer(lead, tag) {
  const brown = "#9a6540";
  let s = "";
  s += `<g class="legs-b">` + box(-0.32, -0.12, 0, 0.1, 0.1, 0.55, sh(brown, 0.8)) + box(0.3, -0.12, 0, 0.1, 0.1, 0.55, sh(brown, 0.8)) + `</g>`;
  s += box(-0.5, -0.2, 0.5, 1.0, 0.4, 0.42, brown);
  s += `<g class="legs-f">` + box(-0.32, 0.12, 0, 0.1, 0.1, 0.55, brown) + box(0.3, 0.12, 0, 0.1, 0.1, 0.55, brown) + `</g>`;
  s += box(0.35, -0.11, 0.78, 0.22, 0.22, 0.5, brown);
  s += box(0.5, -0.14, 1.12, 0.38, 0.28, 0.26, mix(brown, "#fff", 0.08));
  s += box(-0.62, -0.08, 0.76, 0.14, 0.16, 0.14, "#f3f7ff");
  /* antlers */
  const a0 = P(0.62, 0, 1.4), a1 = P(0.52, -0.3, 1.9), a2 = P(0.56, 0.32, 1.9);
  s += `<path d="M${f1(a0[0])},${f1(a0[1])} L${f1(a1[0])},${f1(a1[1])} M${f1(a0[0])},${f1(a0[1])} L${f1(a2[0])},${f1(a2[1])} M${f1((a0[0] + a1[0]) / 2)},${f1((a0[1] + a1[1]) / 2)} l-10,-12 M${f1((a0[0] + a2[0]) / 2)},${f1((a0[1] + a2[1]) / 2)} l10,-12" stroke="#e4c79a" stroke-width="3.5" stroke-linecap="round" fill="none"/>`;
  const nose = P(0.9, 0, 1.22);
  if (lead) s += `<circle cx="${f1(nose[0])}" cy="${f1(nose[1])}" r="6" fill="#ff3b3b"/><circle cx="${f1(nose[0])}" cy="${f1(nose[1])}" r="30" fill="url(#gRed)" style="mix-blend-mode:screen"/>`;
  else s += `<circle cx="${f1(nose[0])}" cy="${f1(nose[1])}" r="4" fill="#2b1b14"/>`;
  s += `<polyline points="${pts([P(-0.1, -0.2, 0.92), P(-0.1, 0.2, 0.92)])}" stroke="#f1c24a" stroke-width="3" fill="none"/>`;
  return `<g class="rd ${tag}">${s}</g>`;
}

function sleighSVG() {
  let s = "";
  /* soft glow under the sleigh */
  s += `<ellipse cx="0" cy="${f1(S * 0.1)}" rx="${f1(S * 3.2)}" ry="${f1(S * 1.1)}" fill="url(#gHalo)" opacity=".5" style="mix-blend-mode:screen"/>`;
  /* far reindeer first */
  const pair = (x, lead) => {
    let r = "";
    r += wrapO(x, -0.55, 0.35, reindeer(false, "rd-a"));
    r += wrapO(x, 0.55, 0.35, reindeer(lead, "rd-b"));
    return r;
  };
  s += wrapO(4.3, 0, 0, pair(0, true));
  s += wrapO(2.9, 0, 0, pair(0, false));
  /* harness */
  const hz = 0.95;
  [[-0.55, 0], [0.55, 0]].forEach(([yy]) => {
    s += `<polyline points="${pts([P(1.05, yy * 0.5, 0.6), P(2.55, yy, hz + 0.2), P(4.0, yy, hz + 0.2)])}" stroke="#f1c24a" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  });
  /* sleigh */
  s += box(-1.1, -0.5, 0.0, 2.4, 0.08, 0.14, "#f1c24a");
  s += box(-1.1, 0.42, 0.0, 2.4, 0.08, 0.14, "#f1c24a");
  s += box(-0.9, -0.38, 0.14, 1.9, 0.76, 0.5, "#d33a3a");
  s += poly([P(-0.82, -0.3, 0.64), P(0.92, -0.3, 0.64), P(0.92, 0.3, 0.64), P(-0.82, 0.3, 0.64)], "#6e1420");
  s += box(-0.92, -0.4, 0.64, 0.22, 0.8, 0.55, "#c42f3a");
  s += box(0.95, -0.34, 0.14, 0.34, 0.68, 0.34, "#b82a34");
  /* sack with gifts */
  const sk = P(-0.2, 0, 0.9);
  s += `<path d="M${f1(sk[0] - 44)},${f1(sk[1] + 12)} C${f1(sk[0] - 56)},${f1(sk[1] - 40)} ${f1(sk[0] - 20)},${f1(sk[1] - 74)} ${f1(sk[0] + 6)},${f1(sk[1] - 66)} C${f1(sk[0] + 34)},${f1(sk[1] - 66)} ${f1(sk[0] + 58)},${f1(sk[1] - 34)} ${f1(sk[0] + 44)},${f1(sk[1] + 12)}Z" fill="url(#gSack)"/>`;
  s += `<g id="sackGifts">` + wrapO(-0.3, 0, 0.95, giftSVG(0.42, "#4db6e8", "#ffe27a")) + wrapO(0.12, 0.1, 0.95, giftSVG(0.38, "#9b5de5", "#fff")) + `</g>`;
  /* Santa */
  let sa = "";
  sa += cyl(0, 0, 0, 0.26, 0.55, "#d6303c", { top: "#ee505b" });
  sa += cyl(0, 0, 0.3, 0.275, 0.08, "#2b1b14", { top: "#3b2b24" });
  sa += sphere(0, 0, 0.72, 0.2, "url(#gSkin)");
  sa += `<path d="${(() => { const p = P(0, 0, 0.62); return `M${f1(p[0] - 11)},${f1(p[1] - 2)} Q${f1(p[0])},${f1(p[1] + 26)} ${f1(p[0] + 11)},${f1(p[1] - 2)} Q${f1(p[0])},${f1(p[1] + 8)} ${f1(p[0] - 11)},${f1(p[1] - 2)}Z`; })()}" fill="#fff"/>`;
  sa += cone(0, 0, 0.8, 0.24, 0.6, "#d6303c");
  sa += sphere(0.0, 0, 1.4, 0.07, "url(#gSnow)");
  sa += `<g class="santa-arm">` + cyl(0.2, 0.15, 0.2, 0.07, 0.4, "#d6303c", { top: "#ffd9b8" }) + `</g>`;
  s += wrapO(0.1, 0, 0.55, sa, "santa");
  return s;
}

/* ---------------- clouds ---------------- */
function cloud(x, y, sc, op) {
  const [cx, cy] = P(x, y, -9);
  let s = "";
  const blobs = [[0, 0, 150, 46], [-110, 12, 100, 36], [120, 14, 110, 38], [40, -26, 90, 34], [-50, -22, 80, 30]];
  blobs.forEach(([bx, by, rx, ry]) => (s += `<ellipse cx="${bx}" cy="${by}" rx="${rx}" ry="${ry}" fill="url(#gCloud)"/>`));
  return `<g transform="translate(${f1(cx)},${f1(cy)}) scale(${sc})"><g class="cloud" data-op="${op}">${s}</g></g>`;
}
