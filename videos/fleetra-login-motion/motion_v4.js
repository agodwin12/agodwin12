/* Fleetra Analytics — v4 loop (4 s). Fixed lines, fixed camera; only particles and micro-interactions move.
   1. entry   : one particle per source (its own colour) travels to the hub's single entry point
   2. receive : the hub breathes (scale 1 → 1.04 → 1) and its halo brightens for an instant (300 ms, ease-in-out)
   3. exit    : one particle per result, alternating orange / blue (= crossed data), 80 ms apart
   4. arrival : the result card's border brightens 0.08 → 0.2 → 0.08 (400 ms)
   Every particle has the same size, the same halo and the same speed in px/s: a longer line takes longer. */
gsap.registerPlugin(MotionPathPlugin);
const NS = "http://www.w3.org/2000/svg";
const ORANGE = "#ff5a1f", CYAN = "#38bdf8";
const $ = (s) => document.querySelector(s);
const tl = gsap.timeline({ paused: true });
const LOOP = 4.0;

const len = (id) => document.getElementById(id).getTotalLength();
const IN = ["flow-in-recouvrement", "flow-in-tracking"];
const OUT = ["flow-out-finance", "flow-out-performance", "flow-out-operations", "flow-out-decision"];
const CARD = { "flow-out-finance": "#out-finance", "flow-out-performance": "#out-performance", "flow-out-operations": "#out-operations", "flow-out-decision": "#out-decision" };

/* one constant speed for every particle: entry ≈ 1.0 s, longest exit ≈ 1.4 s */
const L_IN = Math.max(...IN.map(len));
const L_OUT = Math.max(...OUT.map(len));
const SPEED = (L_IN + L_OUT) / 2.4;            // px / s

function particle(flow, col, t0) {
  const g = document.createElementNS(NS, "g");
  g.innerHTML = `<circle r="5" fill="${col}" opacity=".3"/><circle r="2" fill="${col}"/>`;   // 4 px core + light halo
  $("#packets").appendChild(g);
  const p = document.getElementById(flow).getPointAtLength(0);
  gsap.set(g, { x: p.x, y: p.y, opacity: 0 });
  const dur = len(flow) / SPEED;
  tl.to(g, { motionPath: { path: "#" + flow, align: "#" + flow, alignOrigin: [0.5, 0.5] }, duration: dur, ease: "none" }, t0);
  tl.to(g, { opacity: 1, duration: 0.12, ease: "none" }, t0);
  tl.to(g, { opacity: 0, duration: 0.12, ease: "none" }, t0 + dur - 0.12);
  return t0 + dur;
}

/* 1 — entry */
const T_IN = 0.2;
const arrive = Math.max(particle(IN[0], ORANGE, T_IN), particle(IN[1], CYAN, T_IN));

/* 2 — the hub receives */
const core = $("#hub-core"), halo = $("#hub-halo");
tl.to(core, { scale: 1.04, transformOrigin: "50% 50%", duration: 0.15, ease: "sine.inOut" }, arrive);
tl.to(core, { scale: 1, transformOrigin: "50% 50%", duration: 0.15, ease: "sine.inOut" }, arrive + 0.15);
tl.to(halo, { attr: { "fill-opacity": 0.55 }, duration: 0.15, ease: "sine.inOut" }, arrive);
tl.to(halo, { attr: { "fill-opacity": 0.35 }, duration: 0.3, ease: "sine.inOut" }, arrive + 0.15);

/* 3 — exit, alternating colours, 80 ms apart */
const T_OUT = arrive + 0.3;
let last = 0;
OUT.forEach((flow, i) => {
  const end = particle(flow, i % 2 ? CYAN : ORANGE, T_OUT + i * 0.08);
  /* 4 — arrival: the card border brightens briefly */
  const border = $(CARD[flow] + " > rect");
  tl.to(border, { attr: { stroke: "rgba(255,255,255,0.2)" }, duration: 0.2, ease: "sine.inOut" }, end - 0.05);
  tl.to(border, { attr: { stroke: "rgba(255,255,255,0.08)" }, duration: 0.2, ease: "sine.inOut" }, end + 0.15);
  last = Math.max(last, end + 0.35);
});
/* everything is back to rest before the loop point */
if (last > LOOP) console.warn("loop too short", last);
