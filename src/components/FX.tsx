"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

type Shot = { x: number; y: number; ox: number; oy: number; t: number; seed: number };
const TRAIL = 16;

/* Global effects layer:
   · reticle cursor (dot + web ring) that grows on interactive elements
   · silk trail that follows the pointer
   · click = web-shooter: a line fires from the bottom corner and splats into a web
   · magnetic buttons ([data-magnetic])
   · spider on a thread that lowers as you scroll + a scroll-progress strand */
export default function FX() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<HTMLDivElement>(null);
  const spiderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reduce = prefersReducedMotion();
    const fine = hasFinePointer();
    const root = document.documentElement;
    const cleanups: Array<() => void> = [];

    /* scroll progress + dangling spider (transform-only) */
    const onScroll = () => {
      const max = root.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
      if (threadRef.current && spiderRef.current) {
        const len = window.innerHeight * (0.12 + p * 0.55);
        threadRef.current.style.transform = `scaleY(${len})`;
        spiderRef.current.style.transform = `translateY(${len}px)`;
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    cleanups.push(() => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    });

    if (!reduce && spiderRef.current) {
      const sway = gsap.to(".fx-hang", { rotation: 5, duration: 2.4, yoyo: true, repeat: -1, ease: "sine.inOut", transformOrigin: "50% 0%" });
      cleanups.push(() => sway.kill());
    }

    if (!fine || reduce) return () => cleanups.forEach((fn) => fn());

    /* pointer-driven layer */
    root.classList.add("cursor-on");
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    let dpr = 1;
    let w = 0;
    let h = 0;
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const mouse = { x: w / 2, y: h / 2 };
    const ring = { x: w / 2, y: h / 2 };
    const trail = Array.from({ length: TRAIL }, () => ({ x: w / 2, y: h / 2 }));
    const shots: Shot[] = [];
    let moved = false;

    const onMove = (e: PointerEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (!moved) {
        moved = true;
        ring.x = e.clientX;
        ring.y = e.clientY;
        trail.forEach((p) => {
          p.x = e.clientX;
          p.y = e.clientY;
        });
      }
      const t = e.target as HTMLElement | null;
      root.classList.toggle("cursor-hover", !!t?.closest("a,button,input,textarea,label,[data-hover]"));
      // magnetic pull
      document.querySelectorAll<HTMLElement>("[data-magnetic]").forEach((el) => {
        const r = el.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const d = Math.hypot(e.clientX - cx, e.clientY - cy);
        const reach = Math.max(r.width, r.height) * 0.9;
        if (d < reach) gsap.to(el, { x: (e.clientX - cx) * 0.3, y: (e.clientY - cy) * 0.3, duration: 0.4, ease: "power3.out", overwrite: "auto" });
        else gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.4)", overwrite: "auto" });
      });
    };
    const onDown = (e: PointerEvent) => {
      root.classList.add("cursor-down");
      const fromRight = e.clientX > w / 2;
      shots.push({ x: e.clientX, y: e.clientY, ox: fromRight ? w : 0, oy: h, t: performance.now(), seed: Math.random() * 6 });
    };
    const onUp = () => root.classList.remove("cursor-down");
    const onLeave = () => root.classList.add("cursor-hide");
    const onEnter = () => root.classList.remove("cursor-hide");
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerenter", onEnter);

    const SHOOT = 240;
    const FADE = 1500;
    let raf = 0;
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      ring.x += (mouse.x - ring.x) * 0.2;
      ring.y += (mouse.y - ring.y) * 0.2;
      if (dotRef.current) dotRef.current.style.transform = `translate3d(${mouse.x}px,${mouse.y}px,0)`;
      if (ringRef.current) ringRef.current.style.transform = `translate3d(${ring.x}px,${ring.y}px,0)`;

      ctx.clearRect(0, 0, w, h);

      // silk trail: each point eases toward the one ahead of it
      let lx = mouse.x;
      let ly = mouse.y;
      ctx.lineCap = "round";
      for (let i = 0; i < TRAIL; i++) {
        const p = trail[i];
        p.x += (lx - p.x) * 0.42;
        p.y += (ly - p.y) * 0.42;
        ctx.strokeStyle = `rgba(243,239,230,${(1 - i / TRAIL) * 0.55})`;
        ctx.lineWidth = Math.max(0.6, 2 - i * 0.1);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
        lx = p.x;
        ly = p.y;
      }

      // web shots
      for (let i = shots.length - 1; i >= 0; i--) {
        const s = shots[i];
        const age = now - s.t;
        if (age > SHOOT + FADE) {
          shots.splice(i, 1);
          continue;
        }
        const flight = Math.min(1, age / SHOOT);
        const e = 1 - Math.pow(1 - flight, 3);
        const hx = s.ox + (s.x - s.ox) * e;
        const hy = s.oy + (s.y - s.oy) * e;
        const alpha = age < SHOOT ? 0.9 : 1 - (age - SHOOT) / FADE;
        ctx.strokeStyle = `rgba(243,239,230,${alpha * 0.85})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.ox, s.oy);
        ctx.lineTo(hx, hy);
        ctx.stroke();
        if (age > SHOOT) {
          const grow = Math.min(1, (age - SHOOT) / 220);
          ctx.strokeStyle = `rgba(243,239,230,${alpha})`;
          ctx.lineWidth = 1.2;
          const spokes = 8;
          for (let k = 0; k < spokes; k++) {
            const a = (k / spokes) * Math.PI * 2 + s.seed;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + Math.cos(a) * 46 * grow, s.y + Math.sin(a) * 46 * grow);
            ctx.stroke();
          }
          for (const r of [14, 28, 42]) {
            ctx.beginPath();
            for (let k = 0; k <= spokes; k++) {
              const a = (k / spokes) * Math.PI * 2 + s.seed;
              const rr = r * grow * (1 - 0.14);
              const px = s.x + Math.cos(a) * rr;
              const py = s.y + Math.sin(a) * rr;
              const ma = ((k - 0.5) / spokes) * Math.PI * 2 + s.seed;
              const mx = s.x + Math.cos(ma) * rr * 0.86;
              const my = s.y + Math.sin(ma) * rr * 0.86;
              if (k === 0) ctx.moveTo(px, py);
              else ctx.quadraticCurveTo(mx, my, px, py);
            }
            ctx.stroke();
          }
        }
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      cleanups.forEach((fn) => fn());
      root.classList.remove("cursor-on", "cursor-hover", "cursor-down", "cursor-hide");
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerenter", onEnter);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="fx-canvas" aria-hidden="true" />
      <div ref={dotRef} className="cursor" aria-hidden="true" />
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <svg viewBox="0 0 44 44" fill="none" stroke="currentColor" strokeWidth="1.4">
          <circle cx="22" cy="22" r="19" />
          <circle cx="22" cy="22" r="10" />
          <path d="M22 3v38M3 22h38M8.6 8.6l26.8 26.8M35.4 8.6 8.6 35.4" />
        </svg>
      </div>
      <div className="fx-progress" aria-hidden="true">
        <div ref={barRef} className="fx-progress-bar" />
      </div>
      <div className="fx-hang" aria-hidden="true">
        <div ref={threadRef} className="fx-thread" />
        <div ref={spiderRef} className="fx-spider">
          <svg viewBox="0 0 40 40" width="34" height="34" fill="currentColor">
            <ellipse cx="20" cy="24" rx="7" ry="9" />
            <circle cx="20" cy="13" r="4.5" />
            <path d="M14 20 4 12M13 25 2 26M14 30 5 38M26 20l10-8M27 25l11 1M26 30l9 8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M20 22v6" stroke="#e62429" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
      </div>
    </>
  );
}
