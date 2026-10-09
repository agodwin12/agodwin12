/* ===================== BUILD THE WORLD ===================== */
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));
const DUR = 38;

/* stars */
(function () {
  const r = mulberry32(7);
  let s = "";
  for (let i = 0; i < 150; i++) {
    const x = r() * 1920, y = r() * 760, sz = 0.8 + r() * 1.9;
    s += `<circle class="st" cx="${f1(x)}" cy="${f1(y)}" r="${f1(sz)}" fill="#fff" opacity="${f1(0.35 + r() * 0.6)}"/>`;
  }
  $("#stars").innerHTML = s;
})();

/* gift icon for brand marks (reuses giftSVG, scaled) */
function markGift() {
  return `<g transform="scale(0.62) translate(0,10)">${giftSVG(1.5, "#e63946", "#ffd35a").replace(/<ellipse class="halo"[^>]*>/g, "")}</g>`;
}
$("#markGift").innerHTML = markGift();
$("#outroGift").innerHTML = markGift();

/* ---- HQ ---- */
const HQ = [];
HQ.push({ d: -5, svg: island(0, 0, 13, 13, "islHQ") });
HQ.push({ d: 1, svg: workshop(2.0, 1.4) });
HQ.push({ d: 12.8, svg: giantGift(8.6, 1.2, 3) });
[[0.9, 0.9], [1.0, 6.4], [0.8, 10.2], [7.8, 6.2], [11.7, 0.8], [11.8, 6.0], [4.8, 11.6], [7.6, 12.2], [12.2, 11.4]].forEach(([x, y], i) => {
  HQ.push({ d: x + y + 1, svg: pine(x, y, 0.9 + (i % 3) * 0.14) });
});
[[1.6, 5.9], [11.4, 7.2]].forEach(([x, y]) => HQ.push({ d: x + y, svg: wrapO(x, y, 0, lamp(), "bi") }));
HQ.push({ d: 14, svg: wrapO(6.2, 11.0, 0, snowman(), "bi") });
/* belt */
const beltSVG = (() => {
  let s = shadowQuad(1.3, 8.1, 8.6, 1.1, 0.25);
  s += box(1.4, 8.2, 0, 0.3, 0.8, 0.42, "#39437f") + box(9.0, 8.2, 0, 0.3, 0.8, 0.42, "#39437f");
  s += box(1.3, 8.2, 0.42, 8.2, 0.8, 0.16, "#2a3166");
  s += `<g id="beltStripes">`;
  for (let i = 0; i < 18; i++) {
    const x0 = 1.35 + i * 0.46;
    s += poly([P(x0, 8.22, 0.585), P(x0 + 0.1, 8.22, 0.585), P(x0 + 0.1, 8.98, 0.585), P(x0, 8.98, 0.585)], "rgba(255,211,90,.55)");
  }
  s += `</g>`;
  return s;
})();
HQ.push({ d: 15, svg: `<g class="bi" id="belt">${beltSVG}</g>` });
/* elves behind the belt */
[[3.2, "#d33a3a", "#2f9e63"], [5.2, "#2f9e63", "#d33a3a"], [7.2, "#d33a3a", "#2f9e63"]].forEach(([x, hat, suit], i) => {
  HQ.push({ d: x + 7.4, svg: wrapO(x, 7.5, 0, elf(hat, suit), "bi elf elf" + i) });
});
/* launch pad */
const padC = P(10.9, 9.1, 0.02);
const padSVG = `<g class="bi" id="pad">
  <ellipse cx="${f1(padC[0])}" cy="${f1(padC[1])}" rx="${f1(erx(1.9))}" ry="${f1(ery(1.9))}" fill="#27306b"/>
  <ellipse cx="${f1(padC[0])}" cy="${f1(padC[1])}" rx="${f1(erx(1.65))}" ry="${f1(ery(1.65))}" fill="none" stroke="#ffd35a" stroke-width="4" stroke-dasharray="14 12" id="padRing"/>
  <ellipse cx="${f1(padC[0])}" cy="${f1(padC[1])}" rx="${f1(erx(1.1))}" ry="${f1(ery(1.1))}" fill="#1b2255"/>
  <ellipse id="padGlow" cx="${f1(padC[0])}" cy="${f1(padC[1])}" rx="${f1(erx(1.9))}" ry="${f1(ery(1.9))}" fill="url(#gHalo)" opacity=".5" style="mix-blend-mode:screen"/>
</g>`;
HQ.push({ d: 17, svg: padSVG });
HQ.sort((a, b) => a.d - b.d);
$("#gHQ").innerHTML = HQ.map((o) => o.svg).join("");

/* ---- Town ---- */
const TOWN = [];
const TX = 20;
TOWN.push({ d: -50, svg: wrapO(TX, 0, 0, island(0, 0, 34, 17.5, "islTown"), "") });
/* street, sidewalks */
const roadSVG = (() => {
  let s = poly([P(TX, 5.7, 0.02), P(TX + 34, 5.7, 0.02), P(TX + 34, 9.9, 0.02), P(TX, 9.9, 0.02)], "#dde8ff");
  s += poly([P(TX, 6.3, 0.03), P(TX + 34, 6.3, 0.03), P(TX + 34, 9.3, 0.03), P(TX, 9.3, 0.03)], "#3a4678");
  for (let i = 0; i < 22; i++) {
    const x0 = TX + 0.6 + i * 1.55;
    s += poly([P(x0, 7.68, 0.04), P(x0 + 0.8, 7.68, 0.04), P(x0 + 0.8, 7.92, 0.04), P(x0, 7.92, 0.04)], "#ffd35a", 'opacity=".75"');
  }
  return `<g class="bi" id="road">${s}</g>`;
})();
TOWN.push({ d: -40, svg: roadSVG });

const HS = [
  ["hN1", 23, 2.0, 4.2, 3.4, 2.4, 1.5, "#f2b45a", "#d6453d"],
  ["hN2", 29, 2.0, 4.2, 3.4, 2.5, 1.5, "#7ac6c0", "#2f4aa8"],
  ["hN3", 35.5, 2.0, 4.2, 3.4, 2.4, 1.5, "#e8806f", "#31395e"],
  ["hN4", 41.5, 2.0, 4.2, 3.4, 2.5, 1.5, "#b59be6", "#d6453d"],
  ["hN5", 47, 2.0, 4.2, 3.4, 2.4, 1.5, "#f2d36a", "#2e8a62"],
  ["hS1", 23.5, 10.8, 4.2, 3.4, 2.4, 1.5, "#6fa8dc", "#c9403f"],
  ["hS3", 36, 10.8, 4.2, 3.4, 2.5, 1.5, "#f2b45a", "#2f4aa8"],
  ["hS4", 42, 10.8, 4.2, 3.4, 2.4, 1.5, "#85d2a0", "#d6453d"],
  ["hS5", 47.5, 10.8, 4.2, 3.4, 2.5, 1.5, "#e58aa8", "#31395e"],
];
HS.forEach((a) => TOWN.push(house(...a)));
TOWN.push(heroHouse("hero", 29.5, 10.8));
/* town decor */
[[26.8, 1.0], [32.7, 0.9], [39.1, 1.0], [44.9, 0.9], [51.2, 1.2], [28.5, 12.6], [35.5, 12.2], [41.0, 12.4], [46.9, 12.3], [22.0, 15.6], [27.0, 16.2], [38.0, 16.0], [44.0, 16.4], [51.5, 15.8], [21.5, 3.0], [52.5, 8.0]].forEach(([x, y], i) => {
  TOWN.push({ d: x + y + 1, svg: pine(x, y, 0.8 + (i % 4) * 0.12) });
});
for (let i = 0; i < 9; i++) {
  const x = TX + 2.5 + i * 3.7;
  TOWN.push({ d: x + 5.9, svg: wrapO(x, 5.9, 0, lamp(), "bi lamp") });
  if (i % 2 === 0 && i !== 2) TOWN.push({ d: x + 9.9, svg: wrapO(x + 1.8, 9.7, 0, lamp(), "bi lamp") });
}
TOWN.push({ d: 40, svg: wrapO(25.5, 15.7, 0, snowman(), "bi") });
TOWN.push({ d: 60, svg: wrapO(48.8, 14.9, 0, snowman(), "bi") });
TOWN.sort((a, b) => a.d - b.d);
$("#gTown").innerHTML = TOWN.map((o) => o.svg).join("");

/* ---- Clouds ---- */
(function () {
  const spots = [[-4, 2, 1.4, 0.8], [8, 16, 1.7, 0.7], [18, 22, 2, 0.7], [24, -4, 1.6, 0.6], [40, 24, 2.2, 0.7], [56, 10, 1.8, 0.6], [30, 28, 1.8, 0.55], [-6, 14, 1.2, 0.6], [62, -2, 1.5, 0.5], [12, -8, 1.2, 0.5]];
  $("#gClouds").innerHTML = spots.map(([x, y, sc, op]) => cloud(x, y, sc, op)).join("");
})();

/* ---- Route (trail) + sleigh ---- */
const T0 = 10.4, RAMP = 1.2, V = 2.5, X0 = 10.9;
const ss = (a) => { a = Math.max(0, Math.min(1, a)); return a * a * (3 - 2 * a); };
function slx(t) {
  if (t <= T0) return X0;
  const u = t - T0;
  if (u < RAMP) return X0 + (V * u * u) / (2 * RAMP);
  return X0 + (V * RAMP) / 2 + V * (u - RAMP);
}
function sly(t) {
  const u = Math.max(0, t - T0);
  return 9.1 + (7.6 - 9.1) * ss(u / 4) + 0.7 * Math.sin(u * 0.8) * ss(u / 6);
}
function slz(t) {
  const u = Math.max(0, t - T0);
  return 0.35 + 6.7 * ss(u / 4.2) + 0.28 * Math.sin(u * 1.4) * ss(u / 5) + (u > 17 ? 3.0 * ss((u - 17) / 3) : 0);
}
function slS(t) {
  const [a, b] = P(slx(t), sly(t), slz(t));
  return { x: a, y: b };
}
function slRot(t) {
  const a = slS(t - 0.05), b = slS(t + 0.05);
  const ang = (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
  return (ang - 30) * 0.7;
}

$("#gFx").innerHTML = `<g id="sleigh">${sleighSVG()}</g>`;

/* route path built from samples */
(function () {
  const a = [];
  for (let t = T0; t <= 31; t += 0.25) {
    const p = P(slx(t), sly(t), slz(t) * 0.92 + 0.2);
    a.push(f1(p[0]) + "," + f1(p[1]));
  }
  $("#gRoute").innerHTML =
    `<polyline id="routeFull" points="${a.join(" ")}" fill="none" stroke="rgba(255,211,90,.35)" stroke-width="3" stroke-dasharray="3 14" stroke-linecap="round"/>` +
    `<polyline id="trail" points="${a.join(" ")}" fill="none" stroke="#ffe9a8" stroke-width="7" stroke-linecap="round" stroke-linejoin="round" style="mix-blend-mode:screen"/>` +
    `<polyline id="trailGlow" points="${a.join(" ")}" fill="none" stroke="#ffb347" stroke-width="22" stroke-linecap="round" stroke-linejoin="round" opacity=".35" style="mix-blend-mode:screen"/>`;
})();

/* ===================== TIMELINE ===================== */
const tl = gsap.timeline({ paused: true });
const camEl = $("#cam");
gsap.set(camEl, { svgOrigin: "0 0", x: 0, y: 0, scale: 1 });

/* camera helpers: camera looks at world-screen point (wx,wy) placed at screen (sx,sy) with zoom k */
const CS = (wx, wy, k, sx = 960, sy = 540) => ({ x: sx - k * wx, y: sy - k * wy, scale: k });
function camMove(t, dur, from, to, ease = "power3.inOut") {
  tl.fromTo(camEl, { ...from }, { ...to, duration: dur, ease, immediateRender: false }, t);
}
/* sampled path tween: fn(t)->{x,y,scale?,rotation?} */
function sampled(el, t0, t1, step, fn, props = ["x", "y", "scale", "rotation"]) {
  const n = Math.max(1, Math.round((t1 - t0) / step));
  for (let i = 0; i < n; i++) {
    const a = t0 + ((t1 - t0) * i) / n, b = t0 + ((t1 - t0) * (i + 1)) / n;
    const A = fn(a), B = fn(b);
    const from = {}, to = {};
    props.forEach((p) => { if (A[p] !== undefined) { from[p] = A[p]; to[p] = B[p]; } });
    tl.fromTo(el, from, { ...to, duration: b - a, ease: "none", immediateRender: false }, a);
  }
}

/* ---- camera plan ---- */
const gC = P(10.1, 2.7, 1.6);          // giant gift
const hqC = P(6.6, 6.4, 0.8);
const padCam = P(9.4, 7.6, 1.0);
const startCam = CS(gC[0], gC[1], 2.15, 1380, 600);
const gift2 = CS(gC[0], gC[1], 2.35, 1380, 600);
gsap.set(camEl, startCam);
camMove(0, 4.0, startCam, gift2, "sine.inOut");
const hqView = CS(hqC[0], hqC[1] - 30, 0.92);
camMove(4.0, 3.3, gift2, hqView, "power3.inOut");
const padView = (() => { const c = P(slx(T0 + 0.25) + 1.4, sly(T0 + 0.25) + 0.6, slz(T0 + 0.25) * 0.5); return CS(c[0], c[1], 1.12); })();
camMove(7.3, 3.1, hqView, padView, "sine.inOut");

/* follow the sleigh T0..18.6 */
const followK = (t) => 1.12 - 0.2 * ss((t - T0) / 6);
function followFn(t) {
  const sx = slx(t + 0.25) + 1.4, sy = sly(t + 0.25) + 0.6, sz = slz(t + 0.25) * 0.5;
  const c = P(sx, sy, sz);
  const k = followK(t);
  return CS(c[0], c[1], k);
}
sampled(camEl, T0, 18.6, 0.2, followFn, ["x", "y", "scale"]);

/* ---- hero shot ---- */
const HERO = HOUSES.find((h) => h.hero);
const heroC = P(HERO.ox + 2.7, HERO.oy + 2.4, 2.0);
const heroView = CS(heroC[0], heroC[1], 2.75, 960, 610);
const heroView2 = CS(heroC[0], heroC[1] - 6, 3.0, 960, 615);
const fEnd = followFn(18.6);
camMove(18.6, 1.7, fEnd, heroView, "power3.inOut");
camMove(20.3, 4.0, heroView, heroView2, "sine.inOut");

/* pull out to town, then to world */
const townC = P(36.5, 8.3, 1.2);
const townView = CS(townC[0], townC[1] - 20, 0.7);
camMove(24.3, 2.9, heroView2, townView, "power3.inOut");
const worldC = P(30, 8, 0);
const worldView = CS(790, 590, 0.54, 720, 560);
camMove(27.3, 5.2, townView, worldView, "power2.inOut");
camMove(32.5, 5.5, worldView, CS(790, 560, 0.6, 960, 540), "sine.inOut");

/* ===================== INTRO: gift monument ===================== */
tl.fromTo("#giantGift .gg-body", { y: 140, opacity: 0, scaleY: 0.6 }, { y: 0, opacity: 1, scaleY: 1, duration: 0.9, ease: "back.out(1.5)", immediateRender: true }, 0.2);
tl.fromTo("#giantGift .gg-lid", { y: -560, opacity: 0 }, { y: 0, opacity: 1, duration: 1.0, ease: "bounce.out", immediateRender: true }, 0.75);
tl.fromTo("#giantGift .gg-bow", { scale: 0, opacity: 0, transformOrigin: "50% 100%" }, { scale: 1, opacity: 1, duration: 0.9, ease: "elastic.out(1,0.5)", immediateRender: true }, 1.6);
tl.fromTo("#giantGift .gg-shadow", { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.6);
tl.to("#giantGift .gg-bow", { y: -6, duration: 0.7, yoyo: true, repeat: 3, ease: "sine.inOut" }, 2.5);

/* sparkles helper (world-space, in gFx) */
let sparkId = 0;
function sparkle(t, wx, wy, wz, n, rad, cols = ["#ffd35a", "#fff", "#ffb347"], sz = 9, up = 30) {
  const [cx, cy] = P(wx, wy, wz);
  const rr = mulberry32(100 + sparkId);
  for (let i = 0; i < n; i++) {
    const id = "sp" + sparkId++;
    const el = document.createElementNS("http://www.w3.org/2000/svg", "g");
    el.setAttribute("id", id);
    el.innerHTML = star(0, 0, sz * (0.7 + rr() * 0.8), sz * 0.32, cols[i % cols.length]);
    $("#gFx").appendChild(el);
    const ang = (i / n) * Math.PI * 2 + rr() * 0.4;
    const dist = rad * (0.55 + rr() * 0.6);
    gsap.set(el, { x: cx, y: cy, opacity: 0, scale: 0.1 });
    tl.to(el, { opacity: 1, scale: 1, duration: 0.12, ease: "none" }, t);
    tl.to(el, { x: cx + Math.cos(ang) * dist, y: cy + Math.sin(ang) * dist * 0.7 - up, rotation: 120, duration: 0.85, ease: "power2.out" }, t);
    tl.to(el, { opacity: 0, scale: 0.2, duration: 0.45, ease: "power1.in" }, t + 0.4);
  }
}
sparkle(1.7, 10.1, 2.7, 4.2, 18, 150);
sparkle(1.9, 10.1, 2.7, 4.2, 12, 230);

/* intro title */
(function () {
  const spans = (t) => t.split("").map((c) => (c === " " ? `<span class="ch">&nbsp;</span>` : `<span class="ch">${c}</span>`)).join("");
  $("#l1").innerHTML = spans("PÈRE NOËL");
  $("#l2").innerHTML = `<span class="amp ch">&amp;</span><span class="ch">&nbsp;</span>` + spans("Cie");
})();
gsap.set(["#intro", "#stats", "#outro"], { opacity: 1 });
tl.fromTo("#iKick", { opacity: 0, x: -30 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, 0.9);
tl.fromTo("#intro .ch", { yPercent: 115 }, { yPercent: 0, duration: 0.8, ease: "power4.out", stagger: 0.045 }, 1.0);
tl.fromTo("#iTag", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" }, 2.1);
tl.to("#intro", { x: -140, opacity: 0, duration: 0.7, ease: "power3.in" }, 3.55);

/* ===================== HQ BUILD-IN (4.0 → 6) ===================== */
tl.fromTo("#islHQ", { y: 380, opacity: 0 }, { y: 0, opacity: 1, duration: 1.4, ease: "power3.out" }, 3.75);
tl.fromTo("#gClouds .cloud", { opacity: 0 }, { opacity: (i, el) => parseFloat(el.getAttribute("data-op")), duration: 2, ease: "sine.out", stagger: 0.12 }, 3);
tl.fromTo("#gHQ .bi", { y: -120, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75, ease: "back.out(1.5)", stagger: 0.08 }, 4.1);
gsap.set("#gTown .bi, #islTown", { opacity: 0 });

/* drifting clouds */
tl.fromTo("#gClouds .cloud", { x: 0 }, { x: (i) => (i % 2 ? -90 : 90), duration: DUR, ease: "none" }, 0);

/* workshop life: star pulse, smoke */
tl.to("#gHQ .ws-star", { scale: 1.12, svgOrigin: "0 0", duration: 0.6, yoyo: true, repeat: 15, ease: "sine.inOut", transformOrigin: "50% 50%" }, 4.5);
(function () {
  const ch = P(2.0 + 4.05, 1.4 + 0.95, 3.2 + 1.9 + 1.2 + 0.3);
  for (let i = 0; i < 9; i++) {
    const el = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    el.setAttribute("r", "20");
    el.setAttribute("fill", "#e9f0ff");
    $("#gHQfx").appendChild(el);
    gsap.set(el, { x: ch[0], y: ch[1], opacity: 0, scale: 0.4 });
    const cyc = 3.6;
    tl.fromTo(el, { x: ch[0], y: ch[1], scale: 0.4 }, { x: ch[0] + 110, y: ch[1] - 300, scale: 2.4, duration: cyc, ease: "power1.out", repeat: 8, immediateRender: false }, 4.2 + i * 0.4);
    tl.to(el, { keyframes: { opacity: [0, 0.8, 0], easeEach: "none" }, duration: cyc, repeat: 8, immediateRender: false }, 4.2 + i * 0.4);
  }
})();

/* elves busy */
$$(".elf").forEach((el, i) => {
  tl.fromTo(el.querySelector(".elf-body"), { y: 0 }, { y: -7, duration: 0.3, yoyo: true, repeat: 19, ease: "sine.inOut", immediateRender: false }, 4.6 + i * 0.1);
  tl.fromTo(el.querySelector(".elf-arm"), { rotation: -22 }, { rotation: 28, transformOrigin: "50% 10%", duration: 0.3, yoyo: true, repeat: 19, ease: "sine.inOut", immediateRender: false }, 4.6 + i * 0.1);
});
tl.fromTo("#padRing", { strokeDashoffset: 0 }, { strokeDashoffset: -520, duration: 30, ease: "none" }, 4);

/* conveyor + gifts */
(function () {
  const cols = [["#e63946", "#ffd35a"], ["#3f8fe0", "#fff"], ["#2fbf71", "#ffe27a"], ["#9b5de5", "#fff"], ["#ff9f1c", "#fff"], ["#00b4d8", "#ffe27a"], ["#ef476f", "#fff"], ["#ffd23f", "#e63946"]];
  const y0 = 8.6, z0 = 0.6;
  const holder = $("#gHQfx");
  const sackW = [10.3, 9.1, 1.25];
  cols.forEach(([c1, c2], i) => {
    const x0 = 2.0 + i * 0.95;
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.innerHTML = wrapO(x0, y0, z0, giftSVG(0.5, c1, c2));
    holder.appendChild(g);
    const el = g;
    const arrive = 5.9 + (9.3 - x0) / 1.6;
    gsap.set(el, { opacity: 0 });
    tl.fromTo(el, { opacity: 0, scale: 0.2, y: -90 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2)", immediateRender: false, transformOrigin: "0 0" }, 4.4 + i * 0.12);
    const dx = (9.3 - x0) * C, dy = (9.3 - x0) * H;
    tl.fromTo(el, { x: 0 }, { x: dx, duration: arrive - 5.9, ease: "none", immediateRender: false }, 5.9);
    /* the y offset along the belt is combined using a second element transform on the inner group */
    const inner = el.querySelector("g g");
    tl.fromTo(inner, { y: 0 }, { y: dy, duration: arrive - 5.9, ease: "none", immediateRender: false }, 5.9);
    /* hop into sack */
    const tx = (sackW[0] - x0) * C - (sackW[1] - y0) * C;
    const ty = (sackW[0] - x0) * H + (sackW[1] - y0) * H - (sackW[2] - z0) * S;
    tl.to(el, { x: tx, duration: 0.5, ease: "none" }, arrive);
    tl.to(inner, { y: ty - 110, duration: 0.25, ease: "power2.out" }, arrive);
    tl.to(inner, { y: ty, duration: 0.25, ease: "power2.in" }, arrive + 0.25);
    tl.to(el, { opacity: 0, scale: 0.6, duration: 0.15, transformOrigin: "0 0" }, arrive + 0.45);
  });
})();

/* ===================== SLEIGH ===================== */
const sleighEl = $("#sleigh");
const s0 = slS(0);
gsap.set(sleighEl, { x: s0.x, y: s0.y, opacity: 0 });
tl.fromTo(sleighEl, { opacity: 0, scale: 0.3 }, { opacity: 1, scale: 1, duration: 0.6, ease: "back.out(2)", immediateRender: false, transformOrigin: "0 0" }, 4.9);
tl.fromTo("#sleigh", { y: s0.y - 80 }, { y: s0.y, duration: 0.6, ease: "bounce.out", immediateRender: false }, 5.0);
sampled(sleighEl, T0, 31, 0.2, (t) => ({ x: slS(t).x, y: slS(t).y, rotation: slRot(t) }), ["x", "y", "rotation"]);
/* idle bob before takeoff */
/* gallop */
$$("#sleigh .rd").forEach((el, i) => {
  const lf = el.querySelector(".legs-f"), lb = el.querySelector(".legs-b");
  tl.fromTo(lf, { rotation: -22 }, { rotation: 22, transformOrigin: "50% 0%", duration: 0.22, yoyo: true, repeat: 79, ease: "sine.inOut", immediateRender: false }, T0 + (i % 2) * 0.05);
  tl.fromTo(lb, { rotation: 22 }, { rotation: -22, transformOrigin: "50% 0%", duration: 0.22, yoyo: true, repeat: 79, ease: "sine.inOut", immediateRender: false }, T0 + (i % 2) * 0.05);
});
/* trail */
(function () {
  const trail = $("#trail"), glow = $("#trailGlow"), full = $("#routeFull");
  const L = trail.getTotalLength();
  const tail = 520;
  [trail, glow].forEach((el) => {
    el.style.strokeDasharray = tail + " " + (L + 2000);
  });
  gsap.set([trail, glow], { strokeDashoffset: tail });
  const total = 31 - T0;
  tl.fromTo([trail, glow], { strokeDashoffset: tail }, { strokeDashoffset: tail - L, duration: total, ease: "none", immediateRender: false }, T0);
  full.style.strokeDasharray = "3 14";
  tl.fromTo(full, { opacity: 0 }, { opacity: 1, duration: 1.0 }, 27.6);
  tl.to(full, { opacity: 0, duration: 0.8 }, 37.2);
})();

/* ===================== TOWN BUILD-IN ===================== */
tl.fromTo("#islTown", { y: 420, opacity: 0 }, { y: 0, opacity: 1, duration: 1.6, ease: "power3.out" }, 11.2);
tl.fromTo("#gTown .bi", { y: -140, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "back.out(1.5)", stagger: 0.07 }, 12.2);

/* ===================== DROPS ===================== */
function landT(chx) { return T0 + (chx - (X0 + (V * RAMP) / 2 - V * RAMP)) / V; }
const giftColors = [["#e63946", "#ffd35a"], ["#3f8fe0", "#fff"], ["#2fbf71", "#ffe27a"], ["#9b5de5", "#fff"], ["#ff9f1c", "#fff"], ["#00b4d8", "#ffe27a"], ["#ef476f", "#fff"], ["#ffd23f", "#e63946"], ["#4dd6a0", "#fff"], ["#ff6b9a", "#ffe27a"]];
const order = HOUSES.filter((h) => !h.hero).sort((a, b) => a.chx - b.chx);
const FLIGHT = 0.95;

function lightHouse(id, t) {
  tl.to(`#${id} .wlit`, { opacity: 1, duration: 0.4, ease: "power2.out" }, t);
  tl.to(`#${id} .halo`, { opacity: 0.95, duration: 0.6, ease: "power2.out" }, t);
  tl.to(`#${id} .ember`, { opacity: 1, duration: 0.4 }, t);
}
function ping(t, wx, wy, wz, label = "+1") {
  const [cx, cy] = P(wx, wy, wz);
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.innerHTML = `<circle r="30" fill="#ffd35a"/><circle r="30" fill="none" stroke="#fff" stroke-width="3" opacity=".7"/><text text-anchor="middle" y="9" font-family="IDisp" font-weight="900" font-size="26" fill="#3b2300">${label}</text>`;
  $("#gFx").appendChild(g);
  gsap.set(g, { x: cx, y: cy, opacity: 0, scale: 0 });
  tl.to(g, { opacity: 1, scale: 1, y: cy - 70, duration: 0.45, ease: "back.out(2.5)" }, t);
  tl.to(g, { y: cy - 130, opacity: 0, duration: 0.7, ease: "power1.in" }, t + 0.7);
}
function ring(t, wx, wy, r0, r1, col = "#ffd35a") {
  const [cx, cy] = P(wx, wy, 0.06);
  const e = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
  e.setAttribute("fill", "none");
  e.setAttribute("stroke", col);
  e.setAttribute("stroke-width", "5");
  e.setAttribute("cx", f1(cx));
  e.setAttribute("cy", f1(cy));
  e.setAttribute("rx", f1(erx(r0)));
  e.setAttribute("ry", f1(ery(r0)));
  e.setAttribute("opacity", "0");
  e.style.mixBlendMode = "screen";
  $("#gFx").appendChild(e);
  tl.fromTo(e, { attr: { rx: erx(r0), ry: ery(r0) }, opacity: 0.95 }, { attr: { rx: erx(r1), ry: ery(r1) }, opacity: 0, duration: 1.1, ease: "power2.out", immediateRender: false }, t);
}

function makeGift(i, size = 0.5) {
  const [c1, c2] = giftColors[i % giftColors.length];
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.innerHTML = giftSVG(size, c1, c2);
  $("#gFx").appendChild(g);
  gsap.set(g, { opacity: 0 });
  return g;
}

order.forEach((h, i) => {
  const tLand = landT(h.chx);
  const tRel = tLand - FLIGHT;
  const g = makeGift(i);
  const sp0 = { x: slx(tRel), y: sly(tRel), z: slz(tRel) - 0.2 };
  const fn = (t) => {
    const u = Math.max(0, Math.min(1, (t - tRel) / FLIGHT));
    const x = sp0.x + (h.chx - sp0.x) * u;
    const y = sp0.y + (h.chy - sp0.y) * u;
    const z = sp0.z + (h.chz - sp0.z) * u * u + 1.2 * Math.sin(Math.PI * u) * (1 - u);
    const p = P(x, y, z);
    return { x: p[0], y: p[1], rotation: u * 300 * (i % 2 ? 1 : -1), scale: 0.6 + 0.4 * (1 - Math.abs(u - 0.5) * 0.5) };
  };
  const a0 = fn(tRel);
  tl.set(g, { opacity: 1, x: a0.x, y: a0.y }, tRel);
  sampled(g, tRel, tLand, 0.08, fn, ["x", "y", "rotation", "scale"]);
  tl.to(g, { y: "+=26", scale: 0.35, opacity: 0, duration: 0.22, ease: "power2.in" }, tLand);
  lightHouse(h.id, tLand + 0.1);
  ping(tLand + 0.05, h.chx, h.chy, h.chz + 0.4);
  ring(tLand + 0.15, h.ox + h.w / 2, h.oy + h.d / 2, 0.6, 4.0);
  sparkle(tLand + 0.05, h.chx, h.chy, h.chz, 8, 70, ["#ffd35a", "#fff"], 8, 30);
});

/* ===================== HERO BEAT ===================== */
(function () {
  const tLand = landT(HERO.chx);
  const tRel = tLand - FLIGHT;
  const g = makeGift(0, 0.62);
  const sp0 = { x: slx(tRel), y: sly(tRel), z: slz(tRel) - 0.2 };
  const fn = (t) => {
    const u = Math.max(0, Math.min(1, (t - tRel) / FLIGHT));
    const x = sp0.x + (HERO.chx - sp0.x) * u;
    const y = sp0.y + (HERO.chy - sp0.y) * u;
    const z = sp0.z + (HERO.chz - sp0.z) * u * u + 0.9 * Math.sin(Math.PI * u) * (1 - u);
    const p = P(x, y, z);
    return { x: p[0], y: p[1], rotation: u * 360, scale: 1 };
  };
  const a0 = fn(tRel);
  tl.set(g, { opacity: 1, x: a0.x, y: a0.y, rotation: 0 }, tRel);
  sampled(g, tRel, tLand, 0.06, fn, ["x", "y", "rotation", "scale"]);

  /* cutaway: roof lifts, walls turn to ghosts, chimney becomes x-ray */
  tl.to("#heroRoof", { y: -240, opacity: 0, duration: 1.0, ease: "power3.out" }, 18.9);
  tl.to("#heroWalls", { opacity: 0.1, duration: 0.9, ease: "power2.inOut" }, 19.2);
  tl.to("#heroChimney .chup", { opacity: 0.28, duration: 0.5 }, 19.5);
  tl.to("#heroFlueLoL, #heroFlueLoR, #heroFlueLoT", { opacity: 0.3, duration: 0.5 }, 19.6);

  /* fall down the flue */
  const cx = HERO.chx, cy = HERO.chy;
  const down = (t) => {
    const u = Math.max(0, Math.min(1, (t - tLand) / 1.15));
    const z = HERO.chz + (1.2 - HERO.chz) * u * u;
    const p = P(cx, cy + 0.05, z);
    return { x: p[0], y: p[1], rotation: 360 + u * 120, scale: 1 - 0.1 * u };
  };
  sampled(g, tLand, tLand + 1.15, 0.05, down, ["x", "y", "rotation", "scale"]);
  /* settle onto the hearth */
  const hearthA = P(cx, cy + 0.05, 1.2), hearthB = P(cx, HERO.oy + 1.5, 0.12);
  const tH = tLand + 1.15;
  tl.to("#fireGlow", { opacity: 1, scale: 1.35, svgOrigin: `${f1(P(HERO.ox + 4.0, HERO.oy + 1.6, 0.4)[0])} ${f1(P(HERO.ox + 4.0, HERO.oy + 1.6, 0.4)[1])}`, duration: 0.25, yoyo: true, repeat: 1, ease: "power2.out" }, tH);
  const ex = (t) => {
    const u = Math.max(0, Math.min(1, (t - tH) / 0.55));
    const p = P(cx, cy + 0.05 + (HERO.oy + 1.5 - cy) * u, 0.9 - 0.8 * u * u + 0.45 * Math.sin(Math.PI * u));
    return { x: p[0], y: p[1], rotation: 480 + u * 20, scale: 1 };
  };
  sampled(g, tH, tH + 0.55, 0.05, ex, ["x", "y", "rotation", "scale"]);
  /* hop toward the tree */
  const tT = tH + 0.55;
  const treeSpot = { x: HERO.ox + 1.5, y: HERO.oy + 3.2 };
  const hop = (t) => {
    const u = Math.max(0, Math.min(1, (t - tT) / 0.75));
    const x = cx + (treeSpot.x - cx) * u, y = HERO.oy + 1.5 + (treeSpot.y - HERO.oy - 1.5) * u;
    const z = 0.12 + 1.3 * Math.sin(Math.PI * u);
    const p = P(x, y, z);
    return { x: p[0], y: p[1], rotation: 500 + u * 220, scale: 1 };
  };
  sampled(g, tT, tT + 0.75, 0.05, hop, ["x", "y", "rotation", "scale"]);
  const tEnd = tT + 0.75;
  tl.set(g, { opacity: 0 }, tEnd);
  gsap.set("#heroGiftLanded", { opacity: 0 });
  tl.fromTo("#heroGiftLanded", { opacity: 0, scale: 0.5, y: -26 }, { opacity: 1, scale: 1, y: 0, duration: 0.5, ease: "back.out(2.4)", immediateRender: false }, tEnd);
  sparkle(tEnd, treeSpot.x + HERO.ox - HERO.ox, treeSpot.y, 0.6, 22, 130, ["#ffd35a", "#fff", "#ff7aa8", "#7ae0ff"], 11, 30);
  ping(tEnd + 0.1, treeSpot.x, treeSpot.y, 1.6, "+1");
  ring(tEnd, HERO.ox + HERO.w / 2, HERO.oy + HERO.d / 2, 0.6, 5.5);
  /* tree + room come alive */
  gsap.set("#heroTree .orn", { opacity: 0.12 });
  tl.to("#heroTree .orn", { opacity: 1, duration: 0.3, stagger: 0.05, ease: "none" }, tEnd + 0.1);
  tl.to("#heroTree .orn", { opacity: 0.45, duration: 0.45, yoyo: true, repeat: 7, stagger: { each: 0.07, repeat: 0 }, ease: "sine.inOut" }, tEnd + 0.9);
  gsap.set("#heroTree .tree-halo", { opacity: 0 });
  tl.to("#heroTree .tree-halo", { opacity: 0.9, duration: 0.6 }, tEnd + 0.1);
  tl.to("#fire", { scaleY: 1.18, svgOrigin: `${f1(P(HERO.ox + 4.0, HERO.oy + 0.88, 0.02)[0])} ${f1(P(HERO.ox + 4.0, HERO.oy + 0.88, 0.02)[1])}`, duration: 0.22, yoyo: true, repeat: 41, ease: "sine.inOut" }, 21.0);
  lightHouse("hero", tEnd + 0.15);
  /* close the dollhouse */
  tl.to("#heroRoof", { y: 0, opacity: 1, duration: 0.9, ease: "power3.inOut" }, 24.3);
  tl.to("#heroWalls", { opacity: 1, duration: 0.8, ease: "power2.inOut" }, 24.4);
  tl.to("#heroChimney .chup", { opacity: 1, duration: 0.5 }, 24.4);
  tl.to("#heroFlueLoL, #heroFlueLoR, #heroFlueLoT", { opacity: 1, duration: 0.5 }, 24.4);
})();

/* ===================== NETWORK PULSE (finale) ===================== */
(function () {
  const all = HOUSES.slice().sort((a, b) => a.ox - b.ox);
  all.forEach((h, i) => ring(28.6 + i * 0.22, h.ox + h.w / 2, h.oy + h.d / 2, 0.8, 5.0, i % 2 ? "#7ae0ff" : "#ffd35a"));
  /* town lamps swell as a wave */
  tl.fromTo("#gTown .lamp-halo", { scale: 1, transformOrigin: "50% 50%" }, { scale: 1.5, duration: 0.5, yoyo: true, repeat: 1, stagger: 0.07, ease: "sine.inOut", immediateRender: false }, 29.0);
})();

/* ===================== HUD ===================== */
tl.fromTo("#brand", { opacity: 0, y: -20 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 4.2);
tl.to("#brand", { opacity: 0, duration: 0.4 }, 33.0);

const chapters = [["#c1", 4.5, 9.6], ["#c2", 10.6, 18.3], ["#c3", 19.6, 24.0], ["#c4", 27.6, 32.7]];
chapters.forEach(([id, a, b]) => {
  tl.fromTo(id, { opacity: 0, x: -60 }, { opacity: 1, x: 0, duration: 0.7, ease: "power3.out" }, a);
  tl.fromTo(id + " .n", { scale: 0.7, transformOrigin: "0% 100%" }, { scale: 1, duration: 0.7, ease: "back.out(1.8)" }, a);
  tl.to(id, { opacity: 0, x: 40, duration: 0.5, ease: "power2.in" }, b);
});
tl.fromTo("#prog", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 10.4);
tl.fromTo("#progFill", { scaleX: 0 }, { scaleX: 1, duration: 22.6, ease: "none" }, 10.4);
tl.to("#prog", { opacity: 0, duration: 0.5 }, 33.0);

/* counter */
tl.fromTo("#count", { opacity: 0, y: -24 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 11.2);
tl.to("#count", { opacity: 0, duration: 0.5 }, 33.0);
const fmt = (n) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
const cnt = { v: 0 };
$("#cntNum").textContent = "0";
tl.fromTo(cnt, { v: 0 }, { v: 2104583917, duration: 21.5, ease: "power2.in", onUpdate: () => { $("#cntNum").textContent = fmt(cnt.v); }, immediateRender: false }, 11.4);

/* stats */
(function () {
  const cards = [["#s1", 27.7, "#n1", 2.1, 1], ["#s2", 28.3, "#n2", 99.97, 2], ["#s3", 28.9, "#n3", 195, 0]];
  cards.forEach(([id, t, nid, target, dec]) => {
    tl.fromTo(id, { opacity: 0, x: 120, scale: 0.94 }, { opacity: 1, x: 0, scale: 1, duration: 0.8, ease: "back.out(1.4)" }, t);
    tl.to(id, { opacity: 0, x: 80, duration: 0.5, ease: "power2.in" }, 32.4);
    const o = { v: 0 };
    tl.fromTo(o, { v: 0 }, { v: target, duration: 1.8, ease: "power2.out", onUpdate: () => { $(nid).textContent = o.v.toFixed(dec).replace(".", ","); }, immediateRender: false }, t + 0.2);
  });
})();

/* ===================== OUTRO ===================== */
tl.fromTo("#oVeil", { opacity: 0 }, { opacity: 1, duration: 1.2, ease: "power2.inOut" }, 32.9);
tl.fromTo("#oLogo", { opacity: 0, scale: 0.4, y: 60 }, { opacity: 1, scale: 1, y: 0, duration: 0.9, ease: "back.out(1.8)" }, 33.5);
tl.fromTo("#oName", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power4.out" }, 34.0);
tl.fromTo("#oLine", { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out" }, 34.5);
tl.fromTo("#oCta", { opacity: 0, y: 30, scale: 0.9 }, { opacity: 1, y: 0, scale: 1, duration: 0.7, ease: "back.out(1.6)" }, 35.0);
tl.fromTo("#oCred", { opacity: 0 }, { opacity: 1, duration: 0.8 }, 35.8);
tl.to("#oCta", { boxShadow: "0 0 90px rgba(255,211,90,.75)", duration: 0.7, yoyo: true, repeat: 1, ease: "sine.inOut" }, 35.8);

/* ===================== AMBIENT: stars, snow, aurora ===================== */
$$("#stars .st").forEach((el, i) => {
  if (i % 3 === 0) tl.fromTo(el, { opacity: 0.25 }, { opacity: 1, duration: 1.1 + (i % 5) * 0.2, yoyo: true, repeat: 5, ease: "sine.inOut", immediateRender: false }, (i % 7) * 0.3);
});
tl.fromTo("#aurora1", { x: -80, opacity: 0.8 }, { x: 120, opacity: 1, duration: DUR, ease: "sine.inOut" }, 0);
tl.fromTo("#aurora2", { x: 100 }, { x: -140, duration: DUR, ease: "sine.inOut" }, 0);

/* falling snow — screen-space overlay, wrapped y so it loops seamlessly */
(function () {
  const r = mulberry32(55);
  const svg = $("#stage");
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("id", "snow");
  svg.appendChild(g);
  const wrapY = gsap.utils.wrap(-30, 1110);
  for (let i = 0; i < 90; i++) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    const rad = 1.6 + r() * 3.4;
    c.setAttribute("r", f1(rad));
    c.setAttribute("fill", "#fff");
    c.setAttribute("opacity", f1(0.35 + r() * 0.55));
    g.appendChild(c);
    const x0 = r() * 1920, y0 = r() * 1080, sp = 60 + r() * 120;
    gsap.set(c, { x: x0, y: y0 });
    tl.to(c, { y: y0 + sp * DUR, x: x0 + (r() - 0.5) * 220, duration: DUR, ease: "none", modifiers: { y: (v) => wrapY(parseFloat(v)) + "px" } }, 0);
  }
})();

