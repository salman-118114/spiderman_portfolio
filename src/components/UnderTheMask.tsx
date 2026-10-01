"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import WebCanvas, { type WebStats } from "./WebCanvas";
import { defaultWeb, prefersReducedMotion, type WebConfig } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const techniques = [
  ["Spring-mesh physics", "Canvas 2D web: per-node springs, neighbour coupling and cursor-velocity impulses, DPR-aware and paused off-screen."],
  ["Scroll choreography", "GSAP ScrollTrigger: pinned chapters, scrubbed timelines, a horizontal strip and responsive matchMedia fallbacks."],
  ["Pointer-native UI", "Reticle cursor, silk trail, click-to-shoot webs, magnetic buttons, proximity radar and tilt cards."],
  ["Compositor-only motion", "Animation sticks to transform, opacity and clip-path, so the main thread stays free."],
  ["Accessible by default", "Reduced-motion paths, skip link, visible focus, keyboard-reachable controls and checked contrast."],
  ["Next.js App Router", "Server-rendered shell with client islands, next/font, typed data and a design-token CSS system."],
] as const;

const code = `// one tick of the web
for (const n of nodes) {
  fx = -n.dx * stiffness;              // spring home
  fx += (avgNeighbours - n.dx) * 0.06; // waves travel
  fx += toCursor * pull * falloff;     // tug
  n.vx = (n.vx + fx) * damping;
  n.dx += n.vx;
}`;

const sliders: Array<{ key: keyof WebConfig; label: string; min: number; max: number; step: number }> = [
  { key: "stiffness", label: "Tension", min: 0.01, max: 0.12, step: 0.005 },
  { key: "damping", label: "Damping", min: 0.8, max: 0.98, step: 0.01 },
  { key: "pull", label: "Cursor pull", min: 0, max: 1, step: 0.02 },
  { key: "spokes", label: "Spokes", min: 6, max: 24, step: 1 },
  { key: "rings", label: "Rings", min: 4, max: 14, step: 1 },
];

export default function UnderTheMask() {
  const root = useRef<HTMLElement>(null);
  const config = useRef<WebConfig>({ ...defaultWeb });
  const stats = useRef<WebStats>({ fps: 0, nodes: 0, tension: 0 });
  const [vals, setVals] = useState<WebConfig>({ ...defaultWeb });
  const [live, setLive] = useState<WebStats>({ fps: 0, nodes: 0, tension: 0 });
  const [typed, setTyped] = useState(code);

  // live readout of what the canvas is doing
  useEffect(() => {
    const id = window.setInterval(() => setLive({ ...stats.current }), 400);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduce) return;
      gsap.from(".tech", {
        y: 50,
        opacity: 0,
        duration: 0.7,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: { trigger: ".tech-grid", start: "top 82%" },
      });
      // code "types" itself when it scrolls into view
      const counter = { n: 0 };
      ScrollTrigger.create({
        trigger: ".code",
        start: "top 80%",
        once: true,
        onEnter: () =>
          gsap.to(counter, {
            n: code.length,
            duration: 2.4,
            ease: "none",
            onUpdate: () => setTyped(code.slice(0, Math.round(counter.n))),
          }),
      });
      setTyped("");
    }, el);
    return () => ctx.revert();
  }, []);

  const update = (key: keyof WebConfig, v: number) => {
    config.current = { ...config.current, [key]: v };
    setVals(config.current);
  };

  return (
    <section ref={root} id="lab" className="lab" aria-labelledby="lab-title">
      <header className="sec-head">
        <p className="eyebrow">Chapter 07 · Under the mask</p>
        <h2 id="lab-title" className="display sec-title">
          Built by <span className="red">Spartalabs</span>
        </h2>
        <p className="lab-lede">
          Behind the mask, this site is the point: every effect here is hand-built engineering. Tune the web below and watch the physics respond.
        </p>
      </header>

      <div className="lab-grid">
        <div className="lab-stage">
          <WebCanvas config={config} stats={stats} reach={0.6} label="Live web simulation controlled by the sliders. Move the pointer over it." />
          <dl className="lab-hud" aria-live="off">
            <div>
              <dt>FPS</dt>
              <dd>{live.fps || "–"}</dd>
            </div>
            <div>
              <dt>Nodes</dt>
              <dd>{live.nodes || "–"}</dd>
            </div>
            <div>
              <dt>Web tension</dt>
              <dd>{live.tension}</dd>
            </div>
          </dl>
        </div>

        <form className="lab-controls" onSubmit={(e) => e.preventDefault()} aria-label="Web physics controls">
          {sliders.map((s) => (
            <label key={s.key}>
              <span>
                {s.label} <b>{Number(vals[s.key]).toFixed(s.step < 1 ? 2 : 0)}</b>
              </span>
              <input type="range" min={s.min} max={s.max} step={s.step} value={vals[s.key]} onChange={(e) => update(s.key, Number(e.target.value))} />
            </label>
          ))}
          <button type="button" className="btn btn--ghost" onClick={() => { config.current = { ...defaultWeb }; setVals({ ...defaultWeb }); }}>
            Reset
          </button>
        </form>
      </div>

      <pre className="code" aria-label="Web physics code excerpt">
        <code>{typed}</code>
      </pre>

      <ul className="tech-grid">
        {techniques.map(([t, d], i) => (
          <li key={t} className="tech" data-hover>
            <span className="comic tech-n">0{i + 1}</span>
            <h3 className="display">{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
