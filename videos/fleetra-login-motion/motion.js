/* Fleetra Analytics — 8 s seamless loop (data-flow scene only, no login form).
   Lines never move: only small data packets travel along them.
   0.0–0.5 calm · 0.5–3.4 Recouvrement + Tracking → logo · 2.0–4.8 centralise · croise · transforme
   4.1–7.0 logo → Finance / Performance / Opérations / Décision · 7.0–8.0 back to calm */
gsap.registerPlugin(MotionPathPlugin);
const NS = "http://www.w3.org/2000/svg";
const ORANGE = "#ff5a1f", CYAN = "#38bdf8", MUTED = "#8b95a1", TXT = "#f4f6f8";
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const svg = $("#left-panel");

const ports = Array.from(document.querySelectorAll("#ports > *"));  // [start, arrow] per flow
const FLOWS = ["flow-in-recouvrement", "flow-in-tracking", "flow-out-finance", "flow-out-performance", "flow-out-operations", "flow-out-decision"];
const startPort = (f) => ports[FLOWS.indexOf(f) * 2];
const arrow = (f) => ports[FLOWS.indexOf(f) * 2 + 1];
const staticDots = (f) => document.querySelectorAll('#dots .dot[data-flow="' + f + '"]');
const colorOf = (f) => (f.indexOf("tracking") >= 0 || f.indexOf("operations") >= 0 ? CYAN : ORANGE);
const el = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => e.setAttribute(k, attrs[k]));
  if (parent) parent.appendChild(e);
  return e;
};

/* ---------- geometry of the hub ---------- */
const frame = $("#hub-frame");
const logo = $("#hub image");
const fx = +frame.getAttribute("x"), fy = +frame.getAttribute("y"), fw = +frame.getAttribute("width"), fh = +frame.getAttribute("height"), frx = +frame.getAttribute("rx");
const lx = +logo.getAttribute("x"), ly = +logo.getAttribute("y"), ls = +logo.getAttribute("width");
const lcx = lx + ls / 2, lcy = ly + ls / 2;

/* invisible internal routes: input ports → logo, logo → output ports (no new visible line) */
const internal = el("g", { id: "internal-routes", fill: "none", stroke: "none" }, svg);
const pathEnd = (id) => { const p = document.getElementById(id); return p.getPointAtLength(p.getTotalLength()); };
const pathStart = (id) => document.getElementById(id).getPointAtLength(0);
function route(id, a, b, bend) {
  const d = `M${a.x},${a.y} C${a.x + bend},${a.y} ${b.x - bend},${b.y} ${b.x},${b.y}`;
  el("path", { id, d }, internal);
  return "#" + id;
}
const logoIn = { x: lx - 4, y: lcy }, logoOut = { x: lx + ls + 4, y: lcy };
const IN_ROUTE = {
  "flow-in-recouvrement": route("r-in-recouvrement", pathEnd("flow-in-recouvrement"), logoIn, 22),
  "flow-in-tracking": route("r-in-tracking", pathEnd("flow-in-tracking"), logoIn, 22),
};
const OUT_ROUTE = {};
["flow-out-finance", "flow-out-performance", "flow-out-operations", "flow-out-decision"].forEach((f) => {
  OUT_ROUTE[f] = route("r-" + f, logoOut, pathStart(f), 22);
});

/* ---------- very soft glows (hidden at rest) ---------- */
const defs = el("defs", {}, svg);
const blur = el("filter", { id: "softGlow", x: "-60%", y: "-60%", width: "220%", height: "220%" }, defs);
el("feGaussianBlur", { stdDeviation: "7" }, blur);
const hub = $("#hub");
const halo = $("#hub-halo");
const logoGlow = el("rect", { x: lx + 4, y: ly + 4, width: ls - 8, height: ls - 8, rx: 14, fill: ORANGE, filter: "url(#softGlow)", opacity: 0 });
hub.insertBefore(logoGlow, logo);

/* ---------- data packets ---------- */
function makePacket(col, r) {
  const g = el("g", { opacity: 0 }, $("#packets"));
  g.innerHTML = `<circle r="${r * 2.3}" fill="${col}" opacity=".24"/><circle r="${r}" fill="${col}"/><circle r="${(r * 0.38).toFixed(2)}" fill="#ffffff" opacity=".85"/>`;
  return g;
}
const mp = (path) => ({ path, align: path, alignOrigin: [0.5, 0.5] });

/* source → hub port → into the logo (absorbed) */
function inbound(flow, t0, dur) {
  const g = makePacket(colorOf(flow), 3.2);
  const p0 = pathStart(flow);
  gsap.set(g, { x: p0.x, y: p0.y });
  tl.to(g, { opacity: 1, duration: 0.25, ease: "sine.out" }, t0);
  tl.to(g, { motionPath: mp("#" + flow), duration: dur, ease: "power1.in" }, t0);
  const tIn = t0 + dur;
  tl.to(g, { motionPath: mp(IN_ROUTE[flow]), scale: 0.75, duration: 0.55, ease: "power1.out" }, tIn);
  tl.to(g, { opacity: 0, duration: 0.25, ease: "sine.in" }, tIn + 0.3);
  return tIn;
}
/* out of the logo → hub port → analysis card */
function outbound(flow, t0, dur) {
  const g = makePacket(colorOf(flow), 3.2);
  gsap.set(g, { x: logoOut.x, y: logoOut.y, scale: 0.75 });
  tl.to(g, { opacity: 1, duration: 0.25, ease: "sine.out" }, t0);
  tl.to(g, { motionPath: mp(OUT_ROUTE[flow]), scale: 1, duration: 0.45, ease: "power1.in" }, t0);
  const tPort = t0 + 0.45;
  tl.to(g, { motionPath: mp("#" + flow), duration: dur, ease: "power1.out" }, tPort);
  tl.to(g, { opacity: 0, duration: 0.22, ease: "sine.in" }, tPort + dur - 0.22);
  return { tPort, tArrive: tPort + dur };
}

/* gentle pulses */
function pulsePort(e, t, col) {
  tl.to(e, { attr: { fill: col }, duration: 0.18, ease: "sine.out" }, t);
  tl.to(e, { attr: { fill: "#060b0d" }, duration: 0.6, ease: "sine.inOut" }, t + 0.35);
}
function pulseArrow(e, t) {
  tl.to(e, { scale: 1.35, transformOrigin: "100% 50%", duration: 0.16, ease: "sine.out" }, t);
  tl.to(e, { scale: 1, transformOrigin: "100% 50%", duration: 0.45, ease: "sine.inOut" }, t + 0.16);
}
function hideStatic(flow, tOut, tIn) {
  tl.to(staticDots(flow), { opacity: 0, duration: 0.3, ease: "sine.inOut" }, tOut);
  tl.to(staticDots(flow), { opacity: 1, duration: 0.5, ease: "sine.inOut" }, tIn);
}

/* ---------- PHASES 2 & 3 — Recouvrement (orange) then Tracking (blue) ---------- */
const IN_DUR = 1.4;
[
  ["flow-in-recouvrement", "#src-recouvrement", [0.5, 0.8, 1.1]],
  ["flow-in-tracking", "#src-tracking", [0.9, 1.2, 1.5]],
].forEach(([flow, card, starts]) => {
  const border = $(card + " > rect");
  tl.to(border, { attr: { "stroke-opacity": 0.75 }, duration: 0.4, ease: "sine.out" }, starts[0] - 0.15);
  tl.to(border, { attr: { "stroke-opacity": 0.4 }, duration: 0.9, ease: "sine.inOut" }, starts[2] + 0.5);
  hideStatic(flow, starts[0] - 0.1, 3.6);
  pulsePort(startPort(flow), starts[0], colorOf(flow));
  starts.forEach((t) => pulseArrow(arrow(flow), inbound(flow, t, IN_DUR) - 0.05));
});

/* ---------- PHASE 4 — centralise · croise · transforme ---------- */
tl.to(frame, { attr: { "stroke-width": 1.8, "stroke-opacity": 1 }, duration: 0.5, ease: "sine.out" }, 2.0);
tl.to(frame, { attr: { "stroke-width": 1.25, "stroke-opacity": 0.9 }, duration: 0.9, ease: "sine.inOut" }, 4.6);
tl.to(halo, { opacity: 1, duration: 1.0, ease: "sine.out" }, 2.2);
tl.to(halo, { opacity: 0.55, duration: 1.4, ease: "sine.inOut" }, 4.3);
tl.to(logoGlow, { opacity: 0.45, duration: 0.7, ease: "sine.out" }, 2.9);
tl.to(logoGlow, { opacity: 0, duration: 1.0, ease: "sine.inOut" }, 4.0);
tl.to(logo, { scale: 1.04, transformOrigin: "50% 50%", duration: 0.6, ease: "sine.out" }, 3.0);
tl.to(logo, { scale: 1, transformOrigin: "50% 50%", duration: 0.9, ease: "sine.inOut" }, 3.6);

/* caption words light up in sequence */
[["#w1", 3.1], ["#w2", 3.5], ["#w3", 3.9]].forEach(([w, t]) => {
  tl.to(w, { fill: TXT, duration: 0.3, ease: "sine.out" }, t);
  tl.to(w, { fill: MUTED, duration: 0.8, ease: "sine.inOut" }, t + 0.9);
});

/* ---------- PHASE 5 — redistribution to the analyses ---------- */
const OUT_DUR = 1.4;
[
  ["flow-out-finance", "#out-finance", 4.1],
  ["flow-out-performance", "#out-performance", 4.3],
  ["flow-out-operations", "#out-operations", 4.5],
  ["flow-out-decision", "#out-decision", 4.7],
].forEach(([flow, card, t]) => {
  hideStatic(flow, t + 0.3, 7.2);
  const a = outbound(flow, t, OUT_DUR);
  outbound(flow, t + 0.38, OUT_DUR);
  pulsePort(startPort(flow), a.tPort, colorOf(flow));
  const arrive = a.tArrive - 0.1;
  pulseArrow(arrow(flow), arrive);
  const rects = document.querySelectorAll(card + " > rect");
  tl.to(rects[0], { attr: { "stroke-opacity": 0.85 }, duration: 0.3, ease: "sine.out" }, arrive);
  tl.to(rects[0], { attr: { "stroke-opacity": 0.4 }, duration: 0.9, ease: "sine.inOut" }, arrive + 0.6);
  tl.to(rects[1], { attr: { "fill-opacity": 0.26 }, duration: 0.3, ease: "sine.out" }, arrive);
  tl.to(rects[1], { attr: { "fill-opacity": 0.13 }, duration: 0.9, ease: "sine.inOut" }, arrive + 0.6);
});
/* all states are back to the reference by ~7.7 s; frame 0 and frame 8 s are identical */
