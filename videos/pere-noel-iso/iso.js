/* Isometric toolkit — pure functions that return SVG strings.
   Coordinates: x runs right-down, y runs left-down, z is up (world units = tiles). */
const S = 46;
const C = 0.866 * S;
const H = 0.5 * S;
const P = (x, y, z = 0) => [(x - y) * C, (x + y) * H - z * S];
const f1 = (n) => (Math.round(n * 10) / 10).toString();
const pts = (a) => a.map((p) => f1(p[0]) + "," + f1(p[1])).join(" ");

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* colour helpers */
const h2r = (h) => { if (h.length === 4) h = "#" + h[1] + h[1] + h[2] + h[2] + h[3] + h[3]; return [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); };
const r2h = (a) => "#" + a.map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
const sh = (h, f) => r2h(h2r(h).map((v) => v * f));
const mix = (a, b, t) => {
  const A = h2r(a), B = h2r(b);
  return r2h(A.map((v, i) => v + (B[i] - v) * t));
};
const NIGHT = "#2a3a8c";
const faces = (c) => {
  const b = mix(c, NIGHT, 0.1);
  return { t: mix(b, "#ffffff", 0.2), l: sh(b, 0.84), r: sh(b, 0.6) };
};

const poly = (a, fill, extra = "") => `<polygon points="${pts(a)}" fill="${fill}" ${extra}/>`;

/* axis-aligned box. o: {id, cls, stroke, noTop} */
function box(x, y, z, w, d, h, c, o = {}) {
  const f = faces(c);
  const st = o.stroke ? `stroke="${o.stroke}" stroke-width="1.2" stroke-linejoin="round"` : "";
  const cl = o.cls ? `class="${o.cls}"` : "";
  const idp = (s) => (o.id ? `id="${o.id}${s}"` : "");
  let s = "";
  if (!o.noTop)
    s += `<polygon ${idp("T")} ${cl} points="${pts([P(x, y, z + h), P(x + w, y, z + h), P(x + w, y + d, z + h), P(x, y + d, z + h)])}" fill="${f.t}" ${st}/>`;
  s += `<polygon ${idp("L")} ${cl} points="${pts([P(x, y + d, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x, y + d, z)])}" fill="${f.l}" ${st}/>`;
  s += `<polygon ${idp("R")} ${cl} points="${pts([P(x + w, y, z + h), P(x + w, y + d, z + h), P(x + w, y + d, z), P(x + w, y, z)])}" fill="${f.r}" ${st}/>`;
  return s;
}

/* iso ellipse radii for a ground circle of radius r */
const erx = (r) => r * S * 1.2247;
const ery = (r) => r * S * 0.7071;

function cyl(x, y, z, r, h, fill, o = {}) {
  const [cx, cb] = P(x, y, z);
  const ct = cb - h * S;
  const rx = erx(r), ry = ery(r);
  const top = o.top || mix(fill.startsWith("#") ? fill : "#cccccc", "#ffffff", 0.25);
  return (
    `<path d="M${f1(cx - rx)},${f1(cb)} L${f1(cx - rx)},${f1(ct)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(cx + rx)},${f1(ct)} L${f1(cx + rx)},${f1(cb)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(cx - rx)},${f1(cb)}Z" fill="${fill}"/>` +
    `<ellipse cx="${f1(cx)}" cy="${f1(ct)}" rx="${f1(rx)}" ry="${f1(ry)}" fill="${top}"/>`
  );
}

function cone(x, y, z, r, h, fill) {
  const [cx, cb] = P(x, y, z);
  const rx = erx(r), ry = ery(r);
  const ay = cb - h * S;
  return `<path d="M${f1(cx - rx)},${f1(cb)} L${f1(cx)},${f1(ay)} L${f1(cx + rx)},${f1(cb)} A${f1(rx)},${f1(ry)} 0 0 1 ${f1(cx - rx)},${f1(cb)}Z" fill="${fill}"/>`;
}

const sphere = (x, y, z, r, fill = "url(#gSnow)") => {
  const [cx, cy] = P(x, y, z);
  return `<circle cx="${f1(cx)}" cy="${f1(cy)}" r="${f1(r * S)}" fill="${fill}"/>`;
};

const shadowQuad = (x, y, w, d, op = 0.28) =>
  poly([P(x, y, 0.01), P(x + w, y, 0.01), P(x + w, y + d, 0.01), P(x, y + d, 0.01)], `rgba(8,14,50,${op})`);

/* a wrapper whose local origin sits at world (ox,oy,oz); inner is drawn in coordinates relative to it */
function wrapO(ox, oy, oz, inner, cls = "", id = "") {
  const [a, b] = P(ox, oy, oz);
  return `<g transform="translate(${f1(a)},${f1(b)})"><g ${id ? `id="${id}"` : ""} class="${cls}">${inner}</g></g>`;
}

/* ---------- windows (relative coords) ---------- */
function winL(x, z, ww, hh, yp, o = {}) {
  const q = [P(x, yp, z), P(x + ww, yp, z), P(x + ww, yp, z + hh), P(x, yp, z + hh)];
  const cx = P(x + ww / 2, yp, z + hh / 2);
  const m1 = [P(x + ww / 2, yp, z), P(x + ww / 2, yp, z + hh)];
  const m2 = [P(x, yp, z + hh / 2), P(x + ww, yp, z + hh / 2)];
  return (
    `<g class="win ${o.cls || ""}">` +
    poly(q, "#16245a") +
    poly(q, "#ffd873", 'class="wlit" opacity="0"') +
    `<polyline points="${pts(m1)}" stroke="#2b1b14" stroke-width="2" fill="none"/>` +
    `<polyline points="${pts(m2)}" stroke="#2b1b14" stroke-width="2" fill="none"/>` +
    `<polygon points="${pts(q)}" fill="none" stroke="#f3f7ff" stroke-width="3" stroke-linejoin="round"/>` +
    `<ellipse class="halo" cx="${f1(cx[0])}" cy="${f1(cx[1] + 8)}" rx="${f1(ww * S * 1.5)}" ry="${f1(hh * S * 1.1)}" fill="url(#gHalo)" opacity="0" style="mix-blend-mode:screen"/>` +
    `</g>`
  );
}
function winR(y, z, ww, hh, xp, o = {}) {
  const q = [P(xp, y, z), P(xp, y + ww, z), P(xp, y + ww, z + hh), P(xp, y, z + hh)];
  const cx = P(xp, y + ww / 2, z + hh / 2);
  const m1 = [P(xp, y + ww / 2, z), P(xp, y + ww / 2, z + hh)];
  const m2 = [P(xp, y, z + hh / 2), P(xp, y + ww, z + hh / 2)];
  return (
    `<g class="win ${o.cls || ""}">` +
    poly(q, "#101a48") +
    poly(q, "#f3b95a", 'class="wlit" opacity="0"') +
    `<polyline points="${pts(m1)}" stroke="#2b1b14" stroke-width="2" fill="none"/>` +
    `<polyline points="${pts(m2)}" stroke="#2b1b14" stroke-width="2" fill="none"/>` +
    `<polygon points="${pts(q)}" fill="none" stroke="#dfe8fb" stroke-width="3" stroke-linejoin="round"/>` +
    `<ellipse class="halo" cx="${f1(cx[0])}" cy="${f1(cx[1] + 8)}" rx="${f1(ww * S * 1.4)}" ry="${f1(hh * S * 1.1)}" fill="url(#gHalo)" opacity="0" style="mix-blend-mode:screen"/>` +
    `</g>`
  );
}

/* ---------- roof along x. returns {back,front,gable,snowB,snowF} polygons (relative coords) ---------- */
function roofParts(w, d, h, rh, ov, roofC, wallC, snowC = "#f4f8ff") {
  const yb = -ov, yf = d + ov, yr = d / 2, x0 = -ov, x1 = w + ov;
  const rb = faces(roofC), rf = faces(roofC);
  const back = poly([P(x0, yb, h), P(x1, yb, h), P(x1, yr, h + rh), P(x0, yr, h + rh)], rb.t);
  const front = poly([P(x0, yf, h), P(x1, yf, h), P(x1, yr, h + rh), P(x0, yr, h + rh)], rf.l);
  const gf = faces(wallC);
  const gable = poly([P(w, 0, h), P(w, d, h), P(w, yr, h + rh)], gf.r);
  /* snow caps (scalloped lower edge) */
  const sn = (yEdge, col) => {
    const n = 8, a = [];
    a.push(P(x0 - 0.02, yr, h + rh + 0.06));
    a.push(P(x1 + 0.02, yr, h + rh + 0.06));
    for (let i = n; i >= 0; i--) {
      const xx = x0 + ((x1 - x0) * i) / n;
      const t = 0.5 + (i % 2 ? 0.16 : 0.04);
      a.push(P(xx, yr + (yEdge - yr) * t, h + rh - rh * t + 0.04));
    }
    return poly(a, col);
  };
  const snowB = sn(yb, mix(snowC, "#9fb6e8", 0.35));
  const snowF = sn(yf, snowC);
  const snowG = poly([P(w + 0.02, 0, h + 0.02), P(w + 0.02, d, h + 0.02), P(w + 0.02, yr, h + rh + 0.02), P(w + 0.02, yr + 0.05, h + rh * 0.6)], "rgba(0,0,0,0)");
  return { back, front, gable, snowB, snowF, snowG };
}

/* ---------- pine tree ---------- */
function pine(x, y, sc = 1, snow = true) {
  let s = shadowQuad(-0.5 * sc, -0.4 * sc, 1.3 * sc, 1.1 * sc, 0.22);
  s += cyl(0, 0, 0, 0.12 * sc, 0.5 * sc, "#6b4630", { top: "#8a5d40" });
  const tiers = [
    [0.7, 0.35, 1.0],
    [0.58, 0.95, 0.95],
    [0.44, 1.5, 0.9],
    [0.3, 2.0, 0.85],
  ];
  tiers.forEach(([r, z, hh]) => {
    s += cone(0, 0, z * sc * 0.85 + 0.2, r * sc, hh * sc, "url(#gTreeA)");
  });
  if (snow) {
    tiers.forEach(([r, z, hh]) => {
      const zb = z * sc * 0.85 + 0.2;
      const rr = r * sc * 0.55;
      const [cx, cb] = P(0, 0, zb + hh * sc * 0.45);
      const ay = P(0, 0, zb + hh * sc)[1];
      const rx = erx(rr), ry = ery(rr);
      s += `<path d="M${f1(cx - rx)},${f1(cb)} L${f1(cx)},${f1(ay)} L${f1(cx + rx)},${f1(cb)} Q${f1(cx + rx * 0.5)},${f1(cb + ry * 1.5)} ${f1(cx)},${f1(cb + ry * 0.6)} Q${f1(cx - rx * 0.5)},${f1(cb + ry * 1.5)} ${f1(cx - rx)},${f1(cb)}Z" fill="#f2f7ff" opacity=".96"/>`;
    });
  }
  return wrapO(x, y, 0, s, "bi");
}

/* ---------- gift (relative to its bottom-centre) ---------- */
function giftSVG(sz, body, ribbon, o = {}) {
  const a = -sz / 2, rw = sz * 0.14;
  let s = box(a, a, 0, sz, sz, sz, body);
  const rf = faces(ribbon);
  s += poly([P(-rw, a, sz + 0.001), P(rw, a, sz + 0.001), P(rw, a + sz, sz + 0.001), P(-rw, a + sz, sz + 0.001)], rf.t);
  s += poly([P(a, -rw, sz + 0.002), P(a + sz, -rw, sz + 0.002), P(a + sz, rw, sz + 0.002), P(a, rw, sz + 0.002)], rf.t);
  s += poly([P(-rw, a + sz, sz), P(rw, a + sz, sz), P(rw, a + sz, 0), P(-rw, a + sz, 0)], rf.l);
  s += poly([P(a + sz, -rw, sz), P(a + sz, rw, sz), P(a + sz, rw, 0), P(a + sz, -rw, 0)], rf.r);
  /* bow */
  const [bx, by] = P(0, 0, sz + 0.02);
  const bs = sz * S * 0.28;
  s += `<ellipse cx="${f1(bx - bs * 0.75)}" cy="${f1(by - bs * 0.35)}" rx="${f1(bs * 0.8)}" ry="${f1(bs * 0.5)}" fill="${rf.t}" transform="rotate(-22 ${f1(bx - bs * 0.75)} ${f1(by - bs * 0.35)})"/>`;
  s += `<ellipse cx="${f1(bx + bs * 0.75)}" cy="${f1(by - bs * 0.35)}" rx="${f1(bs * 0.8)}" ry="${f1(bs * 0.5)}" fill="${rf.l}" transform="rotate(22 ${f1(bx + bs * 0.75)} ${f1(by - bs * 0.35)})"/>`;
  s += `<circle cx="${f1(bx)}" cy="${f1(by - bs * 0.1)}" r="${f1(bs * 0.34)}" fill="${rf.t}"/>`;
  return s;
}

/* ---------- star ---------- */
function star(cx, cy, R, r, fill) {
  const a = [];
  for (let i = 0; i < 10; i++) {
    const rr = i % 2 ? r : R;
    const ang = -Math.PI / 2 + (i * Math.PI) / 5;
    a.push([cx + rr * Math.cos(ang), cy + rr * Math.sin(ang)]);
  }
  return poly(a, fill);
}

/* ---------- elf (relative to feet) ---------- */
function elf(hat = "#d33a3a", suit = "#2f9e63") {
  let s = `<ellipse cx="0" cy="3" rx="${f1(S * 0.34)}" ry="${f1(S * 0.17)}" fill="rgba(8,14,50,.3)"/>`;
  s += `<g class="elf-body">`;
  s += cyl(-0.08, 0, 0, 0.1, 0.34, "#3b2a24", { top: "#4d382f" });
  s += cyl(0.12, 0, 0, 0.1, 0.34, "#3b2a24", { top: "#4d382f" });
  s += cyl(0, 0, 0.3, 0.22, 0.5, suit, { top: mix(suit, "#fff", 0.2) });
  s += cyl(0, 0, 0.5, 0.235, 0.07, "#f1c24a", { top: "#ffe08a" });
  s += `<g class="elf-arm">` + cyl(0.22, 0.12, 0.62, 0.065, 0.28, mix(suit, "#fff", 0.12), { top: "#ffd9b8" }) + `</g>`;
  s += sphere(0, 0, 0.98, 0.2, "url(#gSkin)");
  s += cone(0, 0, 1.0, 0.24, 0.62, hat);
  s += sphere(0.0, 0, 1.64, 0.07, "url(#gSnow)");
  s += `</g>`;
  return s;
}

/* ---------- lamp (relative) ---------- */
function lamp() {
  let s = shadowQuad(-0.25, -0.1, 0.7, 0.5, 0.2);
  s += cyl(0, 0, 0, 0.08, 2.2, "#2a2f54", { top: "#3b4170" });
  s += `<ellipse class="lamp-halo" cx="0" cy="${f1(P(0, 0, 2.35)[1])}" rx="${f1(S * 1.0)}" ry="${f1(S * 0.85)}" fill="url(#gHalo)" style="mix-blend-mode:screen"/>`;
  s += sphere(0, 0, 2.3, 0.18, "#ffe6a1");
  return s;
}

/* ---------- snowman ---------- */
function snowman() {
  let s = shadowQuad(-0.5, -0.4, 1.3, 1.1, 0.2);
  s += sphere(0, 0, 0.45, 0.45);
  s += sphere(0, 0, 1.1, 0.33);
  s += sphere(0, 0, 1.6, 0.24);
  const [hx, hy] = P(0, 0, 1.6);
  s += `<circle cx="${f1(hx - 5)}" cy="${f1(hy - 3)}" r="2" fill="#1a1a2e"/><circle cx="${f1(hx + 6)}" cy="${f1(hy - 3)}" r="2" fill="#1a1a2e"/>`;
  s += `<polygon points="${f1(hx)},${f1(hy)} ${f1(hx + 18)},${f1(hy + 5)} ${f1(hx)},${f1(hy + 6)}" fill="#ff8a2b"/>`;
  s += cyl(0, 0, 1.78, 0.18, 0.08, "#d33a3a", { top: "#e85a5a" });
  s += `<path d="M${f1(hx - 22)},${f1(hy + 14)} q22,10 44,0" stroke="#d33a3a" stroke-width="7" fill="none" stroke-linecap="round"/>`;
  return s;
}
