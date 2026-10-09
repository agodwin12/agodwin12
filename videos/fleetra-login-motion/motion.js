/* Fleetra Analytics — 8 s seamless loop (data-flow scene only).
   Fixed camera, fixed lines: only data packets and micro-interactions move.
   0.0–1.0  calm
   1.0–2.5  packets leave Recouvrement (orange) and Tracking (blue)
   2.5–4.0  both flows reach the hub and converge to its centre
   3.5–4.8  orange + blue packets gather and mix around the centre, the hub reacts (centralise · croise · transforme)
   4.8–6.9  new packets leave the centre: Finance → Performance → Opérations → Décision
   6.5–8.0  everything settles back to the calm state (frame 8 s == frame 0) */
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
const pathStart = (id) => document.getElementById(id).getPointAtLength(0);
const pathEnd = (id) => { const p = document.getElementById(id); return p.getPointAtLength(p.getTotalLength()); };

/* ---------- hub geometry ---------- */
const frame = $("#hub-frame");
const logo = $("#hub-logo");
const halo = $("#hub-halo");
const lx = +logo.getAttribute("x"), ly = +logo.getAttribute("y"), ls = +logo.getAttribute("width");
const C = { x: lx + ls / 2, y: ly + ls / 2 };
gsap.set(logo, { filter: "brightness(1)" });   // explicit start value so the filter interpolates cleanly           // centre of the Fleetra mark

/* invisible internal routes (no new visible line): port → centre, centre → port */
const internal = el("g", { id: "internal-routes", fill: "none", stroke: "none" }, svg);
function route(id, a, b, bend) {
  el("path", { id, d: `M${a.x},${a.y} C${a.x + bend},${a.y} ${b.x - bend},${b.y} ${b.x},${b.y}` }, internal);
  return "#" + id;
}
const IN_ROUTE = {
  "flow-in-recouvrement": route("r-in-rec", pathEnd("flow-in-recouvrement"), C, 40),
  "flow-in-tracking": route("r-in-trk", pathEnd("flow-in-tracking"), C, 40),
};
const OUT_ROUTE = {};
["flow-out-finance", "flow-out-performance", "flow-out-operations", "flow-out-decision"].forEach((f) => {
  OUT_ROUTE[f] = route("r-" + f, C, pathStart(f), 40);
});

/* ---------- data packet: coloured halo + coloured ring + white core (readable on dark and on the orange tile) ---------- */
function makePacket(col) {
  const g = el("g", { opacity: 0 }, $("#packets"));
  g.innerHTML = `<circle r="8.5" fill="${col}" opacity=".2"/><circle r="4.2" fill="${col}"/><circle r="1.9" fill="#ffffff" opacity=".95"/>`;
  return g;
}
const mp = (path, start = 0, end = 1) => ({ path, align: path, alignOrigin: [0.5, 0.5], start, end });

/* ---------- inbound: source → hub port → centre → short swirl → absorbed ---------- */
const SWIRL_R = 13;
const SWIRL_END = 4.45;                 // all packets are absorbed together
const swirlCount = {};   // orange at 0/120/240°, blue at 60/180/300° → the two families interleave
function inbound(flow, t0, dur, ease) {
  const g = makePacket(colorOf(flow));
  const p0 = pathStart(flow);
  gsap.set(g, { x: p0.x, y: p0.y, scale: 0.4 });
  /* appears at the source and eases into the line */
  tl.to(g, { opacity: 1, scale: 1, duration: 0.35, ease: "sine.out" }, t0);
  tl.to(g, { motionPath: mp("#" + flow), duration: dur, ease }, t0);
  const tPort = t0 + dur;
  /* continues inside the hub and slows down at the centre */
  tl.to(g, { motionPath: mp(IN_ROUTE[flow]), duration: 0.6, ease: "power2.out" }, tPort);
  const tC = tPort + 0.6;
  /* gathers on a small circle around the centre and turns with the other packets (orange and blue mix) */
  swirlCount[flow] = (swirlCount[flow] || 0) + 1;
  const a0 = ((swirlCount[flow] - 1) * 120 + (colorOf(flow) === CYAN ? 60 : 0)) * Math.PI / 180;
  const w = 2.4;                                          // rad/s, slow
  const pts = [];
  const steps = Math.max(2, Math.round((SWIRL_END - tC) / 0.1));
  for (let i = 1; i <= steps; i++) {
    const t = tC + ((SWIRL_END - tC) * i) / steps;
    const r = SWIRL_R * Math.min(1, (t - tC) / 0.3);
    const a = a0 + w * (t - tC);
    pts.push({ x: C.x + r * Math.cos(a), y: C.y + r * Math.sin(a), duration: (SWIRL_END - tC) / steps, ease: "none" });
  }
  tl.to(g, { keyframes: pts, scale: 0.85 }, tC);
  /* absorbed into the centre */
  tl.to(g, { x: C.x, y: C.y, scale: 0.2, opacity: 0, duration: 0.35, ease: "power2.in" }, SWIRL_END);
  return tPort;
}

/* ---------- outbound: centre → hub port → analysis card ---------- */
function outbound(flow, t0, dur) {
  const g = makePacket(colorOf(flow));
  gsap.set(g, { x: C.x, y: C.y, scale: 0.3 });
  tl.to(g, { opacity: 1, scale: 1, duration: 0.3, ease: "sine.out" }, t0);
  tl.to(g, { motionPath: mp(OUT_ROUTE[flow]), duration: 0.5, ease: "power1.in" }, t0);
  const tPort = t0 + 0.5;
  tl.to(g, { motionPath: mp("#" + flow), duration: dur, ease: "power2.out" }, tPort);
  const tArr = tPort + dur;
  tl.to(g, { opacity: 0, scale: 0.6, duration: 0.18, ease: "sine.in" }, tArr - 0.12);
  return { tPort, tArr };
}

/* ---------- micro-interactions ---------- */
function portOn(e, t, col) {
  tl.to(e, { attr: { "fill-opacity": 1 }, duration: 0.2, ease: "sine.out" }, t);
  tl.to(e, { attr: { "fill-opacity": 0 }, duration: 0.7, ease: "sine.inOut" }, t + 0.4);
}
function arrowTap(e, t) {
  tl.to(e, { scale: 1.3, transformOrigin: "100% 50%", duration: 0.18, ease: "sine.out" }, t);
  tl.to(e, { scale: 1, transformOrigin: "100% 50%", duration: 0.5, ease: "sine.inOut" }, t + 0.18);
}
function hideStatic(flow, tOut, tIn) {
  tl.to(staticDots(flow), { opacity: 0, duration: 0.35, ease: "sine.inOut" }, tOut);
  tl.to(staticDots(flow), { opacity: 1, duration: 0.6, ease: "sine.inOut" }, tIn);
}
function cardOn(card, t) {
  const rects = document.querySelectorAll(card + " > rect");
  tl.to(rects[0], { attr: { "stroke-opacity": 0.75 }, duration: 0.3, ease: "sine.out" }, t);
  tl.to(rects[0], { attr: { "stroke-opacity": 0.4 }, duration: 0.75, ease: "sine.inOut" }, t + 0.4);
  tl.to(rects[1], { attr: { "fill-opacity": 0.22 }, duration: 0.3, ease: "sine.out" }, t);
  tl.to(rects[1], { attr: { "fill-opacity": 0.13 }, duration: 0.75, ease: "sine.inOut" }, t + 0.4);
}

/* ---------- 1–2.5 s : sources emit (orange and blue move slightly differently) ---------- */
const IN = [
  /* flow, card, departures, travel, ease */
  ["flow-in-recouvrement", "#src-recouvrement", [1.0, 1.28, 1.56], 1.55, "power2.in"],
  ["flow-in-tracking", "#src-tracking", [1.12, 1.42, 1.72], 1.45, "sine.in"],
];
IN.forEach(([flow, card, starts, dur, ease]) => {
  const border = $(card + " > rect");
  tl.to(border, { attr: { "stroke-opacity": 0.72 }, duration: 0.4, ease: "sine.out" }, starts[0] - 0.2);
  tl.to(border, { attr: { "stroke-opacity": 0.4 }, duration: 1.0, ease: "sine.inOut" }, starts[2] + 0.4);
  portOn(startPort(flow), starts[0] - 0.05, colorOf(flow));
  hideStatic(flow, starts[0] - 0.15, 4.6);
  starts.forEach((t) => arrowTap(arrow(flow), inbound(flow, t, dur, ease) - 0.06));
});

/* ---------- 2.8–4.8 s : centralise · croise · transforme ---------- */
tl.to(halo, { opacity: 0.9, duration: 1.3, ease: "sine.inOut" }, 2.8);
tl.to(halo, { opacity: 0.55, duration: 1.6, ease: "sine.inOut" }, 4.8);
tl.to(frame, { attr: { "stroke-opacity": 0.34 }, duration: 0.8, ease: "sine.out" }, 3.0);
tl.to(frame, { attr: { "stroke-opacity": 0.14 }, duration: 1.2, ease: "sine.inOut" }, 4.8);
tl.to(logo, { filter: "brightness(1.08)", duration: 0.9, ease: "sine.inOut" }, 3.6);
tl.to(logo, { filter: "brightness(1)", duration: 1.2, ease: "sine.inOut" }, 4.7);
/* caption words light up one after the other, then return to the caption's own resting colour */
const CAP_REST = $(".hub-caption").getAttribute("fill") || MUTED;
const CAP_LIT = CAP_REST.toLowerCase() === MUTED ? TXT : "#ffffff";
[["#w1", 3.3], ["#w2", 3.75], ["#w3", 4.2]].forEach(([w, t]) => {
  gsap.set(w, { fill: CAP_REST });
  tl.to(w, { fill: CAP_LIT, duration: 0.35, ease: "sine.out" }, t);
  tl.to(w, { fill: CAP_REST, duration: 0.9, ease: "sine.inOut" }, t + 0.8);
});

/* ---------- 4.8–6.9 s : redistribution, in succession ---------- */
const OUT_DUR = 1.1;
[
  ["flow-out-finance", "#out-finance", 4.7],
  ["flow-out-performance", "#out-performance", 4.88],
  ["flow-out-operations", "#out-operations", 5.06],
  ["flow-out-decision", "#out-decision", 5.24],
].forEach(([flow, card, t]) => {
  hideStatic(flow, t + 0.3, 7.15);
  const a = outbound(flow, t, OUT_DUR);
  outbound(flow, t + 0.22, OUT_DUR);
  portOn(startPort(flow), a.tPort - 0.05, colorOf(flow));
  arrowTap(arrow(flow), a.tArr - 0.1);
  cardOn(card, a.tArr - 0.1);
});
/* every state is back to the reference by ~7.85 s */
