"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import WebCanvas from "./WebCanvas";
import { films } from "@/lib/films";
import { hasFinePointer, prefersReducedMotion, whenReady } from "@/lib/motion";

const HERO_CENTER: [number, number] = [0.72, 0.4];

function Letters({ text }: { text: string }) {
  return (
    <>
      {text.split("").map((ch, i) => (
        <span key={i} className="hl" aria-hidden="true">
          {ch}
        </span>
      ))}
      <span className="sr-only">{text}</span>
    </>
  );
}

export default function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = prefersReducedMotion();
    const ctx = gsap.context(() => {
      if (reduce) return;
      // entrance waits for the preloader curtain
      gsap.set(".hl", { yPercent: 120, rotation: 8 });
      gsap.set(".hero-fade", { opacity: 0, y: 24 });
      whenReady().then(() => {
        gsap
          .timeline({ defaults: { ease: "back.out(1.6)" } })
          .to(".hl", { yPercent: 0, rotation: 0, duration: 0.8, stagger: 0.045 })
          .to(".hero-fade", { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: "power3.out" }, "-=0.5");
      });

      // letters react to the pointer: they lean away and bounce back
      if (hasFinePointer()) {
        const letters = gsap.utils.toArray<HTMLElement>(".hl");
        const quick = letters.map((l) => ({
          y: gsap.quickTo(l, "y", { duration: 0.5, ease: "power3.out" }),
          r: gsap.quickTo(l, "rotation", { duration: 0.6, ease: "power3.out" }),
          s: gsap.quickTo(l, "scale", { duration: 0.5, ease: "power3.out" }),
        }));
        const onMove = (e: PointerEvent) => {
          letters.forEach((l, i) => {
            const r = l.getBoundingClientRect();
            const dx = e.clientX - (r.left + r.width / 2);
            const dy = e.clientY - (r.top + r.height / 2);
            const d = Math.hypot(dx, dy);
            const f = Math.max(0, 1 - d / 260);
            quick[i].y((dy > 0 ? -1 : 1) * f * 26);
            quick[i].r(dx * -0.04 * f);
            quick[i].s(1 + f * 0.12);
          });
        };
        const onLeave = () => quick.forEach((q) => (q.y(0), q.r(0), q.s(1)));
        el.addEventListener("pointermove", onMove);
        el.addEventListener("pointerleave", onLeave);
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="top" className="hero" aria-labelledby="hero-title">
      <div className="hero-web" aria-hidden="false">
        <WebCanvas center={HERO_CENTER} reach={0.8} label="An interactive spiderweb. Move the pointer through it to tug the strands; click to pluck." />
      </div>
      <div className="hero-inner">
        <p className="eyebrow hero-fade">Portfolio · Queens, New York · Est. 2002 (on screen)</p>
        <h1 id="hero-title" className="display hero-title">
          <span className="hero-line">
            <Letters text="PETER" />
          </span>
          <span className="hero-line hero-line--red">
            <Letters text="PARKER" />
          </span>
        </h1>
        <p className="hero-sub hero-fade">
          Your <strong>friendly neighborhood</strong> Spider-Man. Photographer by deadline, scientist by curiosity, hero because I couldn&apos;t not be.
        </p>
        <div className="hero-cta hero-fade">
          <a className="btn" href="#files" data-magnetic>
            View my case files
          </a>
          <a className="btn btn--ghost" href="#signal" data-magnetic>
            Send a signal
          </a>
        </div>
        <ul className="hero-stats hero-fade" aria-label="At a glance">
          <li>
            <b className="display">{films.length}</b>
            <span>films on file</span>
          </li>
          <li>
            <b className="display">3+1</b>
            <span>Peters, plus Miles</span>
          </li>
          <li>
            <b className="display">∞</b>
            <span>rooftops</span>
          </li>
        </ul>
        <p className="hero-hint hero-fade" aria-hidden="true">
          <span className="comic">Psst:</span> drag your cursor through the web. Click anywhere to shoot one.
        </p>
      </div>
      <a className="hero-scroll" href="#sense" aria-label="Scroll to the next chapter">
        <span>swing down</span>
        <i aria-hidden="true" />
      </a>
    </section>
  );
}
