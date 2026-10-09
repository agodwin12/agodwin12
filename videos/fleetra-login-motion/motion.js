/* Fleetra Analytics — 8 s seamless loop.
   Lines never move: only small data packets travel along them.
   0.0–0.5 rest · 0.5–3.2 sources → hub · 2.0–4.6 centralise/croise/transforme · 4.3–6.9 hub → analyses · 6.9–8.0 rest */
gsap.registerPlugin(MotionPathPlugin);
const NS = "http://www.w3.org/2000/svg";
const ORANGE = "#ff5a1f", CYAN = "#38bdf8", MUTED = "#8b95a1", TXT = "#f4f6f8";
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });

const ports = Array.from(document.querySelectorAll("#ports > *"));  // [start, arrow] per flow
const FLOWS = ["flow-in-recouvrement", "flow-in-tracking", "flow-out-finance", "flow-out-performance", "flow-out-operations", "flow-out-decision"];
const startPort = (f) => ports[FLOWS.indexOf(f) * 2];
const arrow = (f) => ports[FLOWS.indexOf(f) * 2 + 1];
const staticDots = (f) => document.querySelectorAll('#dots .dot[data-flow="' + f + '"]');
const colorOf = (f) => (f.includes("tracking") || f.includes("operations") ? CYAN : ORANGE);

/* ---------- a data packet travelling along a fixed line ---------- */
function packet(flow, t0, dur) {
  const col = colorOf(flow);
  const g = document.createElementNS(NS, "g");
  g.innerHTML = `<circle r="6" fill="${col}" opacity=".22"/><circle r="2.8" fill="${col}"/><circle r="1.1" fill="#ffffff" opacity=".85"/>`;
  $("#packets").appendChild(g);
  const p0 = document.getElementById(flow).getPointAtLength(0);
  gsap.set(g, { opacity: 0, x: p0.x, y: p0.y });
  tl.to(g, { motionPath: { path: "#" + flow, align: "#" + flow, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "power1.inOut" }, t0);
  tl.to(g, { opacity: 1, duration: 0.25, ease: "sine.out" }, t0);
  tl.to(g, { opacity: 0, duration: 0.22, ease: "sine.in" }, t0 + dur - 0.22);
}

/* small, gentle pulses */
function pulsePort(el, t, col) {
  tl.to(el, { attr: { fill: col }, duration: 0.18, ease: "sine.out" }, t);
  tl.to(el, { attr: { fill: "#060b0d" }, duration: 0.6, ease: "sine.inOut" }, t + 0.35);
}
function pulseArrow(el, t) {
  tl.to(el, { scale: 1.35, transformOrigin: "100% 50%", duration: 0.16, ease: "sine.out" }, t);
  tl.to(el, { scale: 1, transformOrigin: "100% 50%", duration: 0.45, ease: "sine.inOut" }, t + 0.16);
}
function hideStatic(flow, tOut, tIn) {
  tl.to(staticDots(flow), { opacity: 0, duration: 0.3, ease: "sine.inOut" }, tOut);
  tl.to(staticDots(flow), { opacity: 1, duration: 0.6, ease: "sine.inOut" }, tIn);
}

/* ---------- PHASE 2 & 3 — sources feed the hub ---------- */
const IN_DUR = 1.5;
const IN = [
  ["flow-in-recouvrement", "#src-recouvrement", [0.5, 0.85, 1.2]],
  ["flow-in-tracking", "#src-tracking", [1.0, 1.35, 1.7]],
];
IN.forEach(([flow, card, starts]) => {
  const col = colorOf(flow);
  const border = $(card + " > rect");
  tl.to(border, { attr: { "stroke-opacity": 0.75 }, duration: 0.4, ease: "sine.out" }, starts[0] - 0.15);
  tl.to(border, { attr: { "stroke-opacity": 0.4 }, duration: 0.9, ease: "sine.inOut" }, starts[2] + 0.5);
  hideStatic(flow, starts[0] - 0.1, 3.5);
  starts.forEach((t, i) => {
    if (i === 0) pulsePort(startPort(flow), t, col);
    packet(flow, t, IN_DUR);
    pulseArrow(arrow(flow), t + IN_DUR - 0.1);
  });
});

/* ---------- PHASE 4 — centralise · croise · transforme ---------- */
const frame = $("#hub-frame");
tl.to(frame, { attr: { "stroke-width": 1.9, "stroke-opacity": 1 }, duration: 0.5, ease: "sine.out" }, 2.1);
tl.to(frame, { attr: { "stroke-width": 1.25, "stroke-opacity": 0.9 }, duration: 0.9, ease: "sine.inOut" }, 4.4);

/* a short light trace runs once around the frame = processing */
(function () {
  const x = +frame.getAttribute("x"), y = +frame.getAttribute("y"), w = +frame.getAttribute("width"), h = +frame.getAttribute("height"), rx = +frame.getAttribute("rx");
  const r = document.createElementNS(NS, "rect");
  Object.entries({ x, y, width: w, height: h, rx, fill: "none", stroke: "#ffb08f", "stroke-width": 2, "stroke-linecap": "round" }).forEach(([k, v]) => r.setAttribute(k, v));
  $("#trace-layer").appendChild(r);
  const L = r.getTotalLength();
  gsap.set(r, { attr: { "stroke-dasharray": `${(L * 0.16).toFixed(1)} ${L.toFixed(1)}`, "stroke-dashoffset": 0 }, opacity: 0 });
  tl.to(r, { opacity: 0.9, duration: 0.35, ease: "sine.out" }, 2.9);
  tl.to(r, { attr: { "stroke-dashoffset": -L }, duration: 1.7, ease: "power1.inOut" }, 2.9);
  tl.to(r, { opacity: 0, duration: 0.4, ease: "sine.in" }, 4.2);
})();

/* logo: barely perceptible breath */
tl.to("#hub image", { scale: 1.045, transformOrigin: "50% 50%", duration: 0.6, ease: "sine.out" }, 2.9);
tl.to("#hub image", { scale: 1, transformOrigin: "50% 50%", duration: 0.9, ease: "sine.inOut" }, 3.5);

/* caption words light up in sequence */
[["#w1", 3.0], ["#w2", 3.45], ["#w3", 3.9]].forEach(([w, t]) => {
  tl.to(w, { fill: TXT, duration: 0.3, ease: "sine.out" }, t);
  tl.to(w, { fill: MUTED, duration: 0.8, ease: "sine.inOut" }, t + 0.9);
});

/* ---------- PHASE 5 — distribution to the analyses ---------- */
const OUT_DUR = 1.6;
const OUT = [
  ["flow-out-finance", "#out-finance", 4.3],
  ["flow-out-performance", "#out-performance", 4.5],
  ["flow-out-operations", "#out-operations", 4.7],
  ["flow-out-decision", "#out-decision", 4.9],
];
OUT.forEach(([flow, card, t]) => {
  const col = colorOf(flow);
  hideStatic(flow, t - 0.1, 7.1);
  pulsePort(startPort(flow), t, col);
  packet(flow, t, OUT_DUR);
  packet(flow, t + 0.38, OUT_DUR);
  const arrive = t + OUT_DUR - 0.1;
  pulseArrow(arrow(flow), arrive);
  const rects = document.querySelectorAll(card + " > rect");
  const border = rects[0], tile = rects[1];
  tl.to(border, { attr: { "stroke-opacity": 0.85 }, duration: 0.3, ease: "sine.out" }, arrive);
  tl.to(border, { attr: { "stroke-opacity": 0.4 }, duration: 1.0, ease: "sine.inOut" }, arrive + 0.6);
  tl.to(tile, { attr: { "fill-opacity": 0.26 }, duration: 0.3, ease: "sine.out" }, arrive);
  tl.to(tile, { attr: { "fill-opacity": 0.13 }, duration: 1.0, ease: "sine.inOut" }, arrive + 0.6);
});
/* everything is back to the reference state by ~7.7 s; the loop restarts on the same frame */
