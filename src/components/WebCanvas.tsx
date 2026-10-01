"use client";

import { useEffect, useRef } from "react";
import { defaultWeb, prefersReducedMotion, type WebConfig } from "@/lib/motion";

export type WebStats = { fps: number; nodes: number; tension: number };

type Props = {
  /** Live config. Read every frame, so sliders can mutate it without re-mounting. */
  config?: React.RefObject<WebConfig>;
  /** Where the hub sits, as a fraction of the canvas. */
  center?: [number, number];
  /** Radius as a multiple of the longer canvas side. */
  reach?: number;
  stats?: React.RefObject<WebStats>;
  label: string;
};

type Node = { rx: number; ry: number; dx: number; dy: number; vx: number; vy: number };

/* A spring-mesh spiderweb. Each node is pulled home by a spring, tugged toward the cursor,
   nudged by cursor velocity, and smoothed against its neighbours so a pluck travels as a wave. */
const MID: [number, number] = [0.5, 0.5];

export default function WebCanvas({ config, center = MID, reach = 0.75, stats, label }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cfg = () => config?.current ?? defaultWeb;
    const still = prefersReducedMotion();

    let w = 0;
    let h = 0;
    let dpr = 1;
    let nodes: Node[][] = [];
    let built = "";
    let cx = 0;
    let cy = 0;
    let visible = true;
    let raf = 0;
    let last = performance.now();
    let fpsAcc = 0;
    let fpsFrames = 0;
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, active: false };

    const build = () => {
      const c = cfg();
      const key = `${c.spokes}|${c.rings}|${w}|${h}`;
      if (key === built) return;
      built = key;
      const R = Math.max(w, h) * reach;
      cx = w * center[0];
      cy = h * center[1];
      nodes = [];
      // seeded wobble so the web is hand-spun rather than a perfect polar grid
      let seed = 7;
      const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647 - 0.5);
      const angleJitter = Array.from({ length: c.spokes }, () => rnd() * 0.12);
      for (let i = 0; i <= c.rings; i++) {
        const row: Node[] = [];
        const r = R * Math.pow(i / c.rings, 1.35);
        for (let j = 0; j < c.spokes; j++) {
          const a = (j / c.spokes) * Math.PI * 2 + angleJitter[j];
          const rr = i === 0 ? 0 : r * (1 + rnd() * 0.05);
          row.push({ rx: cx + Math.cos(a) * rr, ry: cy + Math.sin(a) * rr, dx: 0, dy: 0, vx: 0, vy: 0 });
        }
        nodes.push(row);
      }
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      built = "";
      build();
    };

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
      mouse.active = true;
    };
    const onLeave = () => {
      mouse.active = false;
    };
    const onPluck = (e: PointerEvent) => {
      // clicking plucks the web: a radial impulse around the click
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > w || y > h) return;
      for (const row of nodes)
        for (const n of row) {
          const ddx = n.rx + n.dx - x;
          const ddy = n.ry + n.dy - y;
          const d = Math.hypot(ddx, ddy) + 1;
          const f = Math.max(0, 1 - d / 420) * 26;
          n.vx += (ddx / d) * f;
          n.vy += (ddy / d) * f;
        }
    };

    const step = () => {
      const c = cfg();
      mouse.vx = mouse.active ? mouse.x - mouse.px : 0;
      mouse.vy = mouse.active ? mouse.y - mouse.py : 0;
      mouse.px = mouse.x;
      mouse.py = mouse.y;
      const radius = 190;
      let energy = 0;
      for (let i = 1; i < nodes.length; i++) {
        const row = nodes[i];
        const n0 = row.length;
        for (let j = 0; j < n0; j++) {
          const n = row[j];
          const prev = row[(j + n0 - 1) % n0];
          const next = row[(j + 1) % n0];
          const inner = nodes[i - 1][j];
          const outer = nodes[i + 1]?.[j] ?? n;
          let fx = -n.dx * c.stiffness;
          let fy = -n.dy * c.stiffness;
          // neighbour smoothing: waves travel along strands
          fx += ((prev.dx + next.dx + inner.dx + outer.dx) / 4 - n.dx) * 0.06;
          fy += ((prev.dy + next.dy + inner.dy + outer.dy) / 4 - n.dy) * 0.06;
          if (mouse.active) {
            const ddx = mouse.x - (n.rx + n.dx);
            const ddy = mouse.y - (n.ry + n.dy);
            const d = Math.hypot(ddx, ddy);
            if (d < radius) {
              const fall = Math.pow(1 - d / radius, 2);
              fx += ddx * fall * c.pull * 0.06 + mouse.vx * fall * 0.18;
              fy += ddy * fall * c.pull * 0.06 + mouse.vy * fall * 0.18;
            }
          }
          n.vx = (n.vx + fx) * c.damping;
          n.vy = (n.vy + fy) * c.damping;
          n.dx += n.vx;
          n.dy += n.vy;
          energy += Math.abs(n.vx) + Math.abs(n.vy);
        }
      }
      return energy;
    };

    const draw = () => {
      const c = cfg();
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      const pos = (n: Node) => [n.rx + n.dx, n.ry + n.dy] as const;

      // spokes
      ctx.strokeStyle = "rgba(243,239,230,0.5)";
      ctx.lineWidth = 1.1;
      for (let j = 0; j < c.spokes; j++) {
        ctx.beginPath();
        for (let i = 0; i < nodes.length; i++) {
          const [x, y] = pos(nodes[i][j]);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      // rings: each segment sags toward the hub like real silk
      for (let i = 1; i < nodes.length; i++) {
        const row = nodes[i];
        ctx.strokeStyle = `rgba(243,239,230,${0.16 + (i / nodes.length) * 0.32})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        for (let j = 0; j < row.length; j++) {
          const [x1, y1] = pos(row[j]);
          const [x2, y2] = pos(row[(j + 1) % row.length]);
          if (j === 0) ctx.moveTo(x1, y1);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const sx = mx + (cx - mx) * c.sag;
          const sy = my + (cy - my) * c.sag;
          ctx.quadraticCurveTo(sx, sy, x2, y2);
        }
        ctx.stroke();
      }
      // red glow where the cursor is tugging
      if (mouse.active) {
        const g = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        g.addColorStop(0, "rgba(230,36,41,0.22)");
        g.addColorStop(1, "rgba(230,36,41,0)");
        ctx.fillStyle = g;
        ctx.fillRect(mouse.x - 160, mouse.y - 160, 320, 320);
      }
    };

    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible) return;
      const dt = t - last;
      last = t;
      fpsAcc += dt;
      fpsFrames++;
      build();
      const energy = step();
      draw();
      if (stats?.current && fpsAcc >= 500) {
        stats.current.fps = Math.round((fpsFrames * 1000) / fpsAcc);
        stats.current.nodes = nodes.length * (nodes[0]?.length ?? 0);
        stats.current.tension = Math.min(100, Math.round(energy * 2.2));
        fpsAcc = 0;
        fpsFrames = 0;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(canvas);

    if (still) {
      draw();
    } else {
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerdown", onPluck, { passive: true });
      document.addEventListener("pointerleave", onLeave);
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onPluck);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [config, center, reach, stats]);

  return <canvas ref={canvasRef} className="web-canvas" role="img" aria-label={label} />;
}
