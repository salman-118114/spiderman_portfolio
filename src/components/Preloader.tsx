"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { markReady, prefersReducedMotion } from "@/lib/motion";

const SPOKES = 12;
const RINGS = 5;

/* The web spins itself in, the spider-sense tingles, then the curtain snaps up. */
export default function Preloader() {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      el.style.display = "none";
      markReady();
      return;
    }
    document.documentElement.style.overflow = "hidden";
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        onComplete: () => {
          el.style.display = "none";
          document.documentElement.style.overflow = "";
          markReady();
        },
      });
      tl.fromTo(".pl-spoke", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55, stagger: 0.04, ease: "power2.out" })
        .fromTo(".pl-ring", { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.5, stagger: 0.07, ease: "power1.out" }, "-=0.25")
        .fromTo(".pl-word", { yPercent: 110 }, { yPercent: 0, duration: 0.5, ease: "back.out(2)" }, "-=0.3")
        .to(".pl-svg", { scale: 1.08, duration: 0.12, yoyo: true, repeat: 3, ease: "none", transformOrigin: "50% 50%" })
        .to(".pl-sense", { opacity: 1, scale: 1.4, duration: 0.3, ease: "power2.out" }, "<")
        .to(el, { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "power4.inOut" }, "+=0.1");
    }, el);
    const skip = () => ctx.revert();
    // Failsafe: never trap the visitor behind the intro.
    const failsafe = window.setTimeout(() => {
      el.style.display = "none";
      document.documentElement.style.overflow = "";
      markReady();
    }, 5000);
    return () => {
      window.clearTimeout(failsafe);
      skip();
      document.documentElement.style.overflow = "";
    };
  }, []);

  const spokes = Array.from({ length: SPOKES }, (_, i) => {
    const a = (i / SPOKES) * Math.PI * 2;
    return <line key={i} className="pl-spoke" x1="100" y1="100" x2={100 + Math.cos(a) * 92} y2={100 + Math.sin(a) * 92} pathLength={1} />;
  });
  const rings = Array.from({ length: RINGS }, (_, k) => {
    const r = ((k + 1) / RINGS) * 92;
    const pts = Array.from({ length: SPOKES }, (_, i) => {
      const a = (i / SPOKES) * Math.PI * 2;
      return `${100 + Math.cos(a) * r},${100 + Math.sin(a) * r}`;
    }).join(" ");
    return <polygon key={k} className="pl-ring" points={pts} pathLength={1} />;
  });

  return (
    <div ref={root} className="preloader" role="status" aria-label="Loading">
      <div className="pl-sense" aria-hidden="true" />
      <svg className="pl-svg" viewBox="0 0 200 200" aria-hidden="true">
        {spokes}
        {rings}
      </svg>
      <p className="pl-word-wrap">
        <span className="pl-word display">Thwip.</span>
      </p>
    </div>
  );
}
