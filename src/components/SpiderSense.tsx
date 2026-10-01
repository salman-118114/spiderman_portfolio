"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { hasFinePointer, prefersReducedMotion } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

const threats = [
  { label: "Pumpkin bomb", x: 60, y: 14 },
  { label: "Four mechanical arms", x: 78, y: 30 },
  { label: "A very fast vulture", x: 70, y: 54 },
  { label: "Pop quiz", x: 56, y: 72 },
  { label: "Rent notice", x: 76, y: 80 },
  { label: "Fake drone army", x: 50, y: 40 },
];

/* A proximity radar. Danger glows as the pointer nears it — spider-sense, literally.
   Touch devices get an automatic sweep instead. */
export default function SpiderSense() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const items = Array.from(el.querySelectorAll<HTMLElement>(".threat"));
    const reduce = prefersReducedMotion();
    const set = (it: HTMLElement, p: number) => {
      it.style.setProperty("--p", p.toFixed(3));
      it.classList.toggle("is-alert", p > 0.55);
    };

    if (reduce) {
      items.forEach((it) => set(it, 0.7));
      return;
    }

    const ctx = gsap.context(() => {
      // headline words pop in as the section arrives
      gsap.from(".sense-head .word", {
        yPercent: 110,
        duration: 0.8,
        stagger: 0.07,
        ease: "back.out(1.7)",
        scrollTrigger: { trigger: el, start: "top 70%" },
      });
    }, el);

    let cleanup = () => {};
    if (hasFinePointer()) {
      const onMove = (e: PointerEvent) => {
        items.forEach((it) => {
          const r = it.getBoundingClientRect();
          const d = Math.hypot(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
          set(it, Math.max(0, 1 - d / 300));
        });
        el.style.setProperty("--mx", `${e.clientX - el.getBoundingClientRect().left}px`);
        el.style.setProperty("--my", `${e.clientY - el.getBoundingClientRect().top}px`);
      };
      const onLeave = () => items.forEach((it) => set(it, 0));
      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      cleanup = () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    } else {
      let i = 0;
      const id = window.setInterval(() => {
        items.forEach((it, k) => set(it, k === i % items.length ? 1 : 0));
        i++;
      }, 1300);
      cleanup = () => window.clearInterval(id);
    }
    return () => {
      cleanup();
      ctx.revert();
    };
  }, []);

  return (
    <section ref={root} id="sense" className="sense" aria-labelledby="sense-title">
      <div className="sense-glow" aria-hidden="true" />
      <div className="sense-head">
        <p className="eyebrow">Chapter 01 · Who&apos;s calling</p>
        <h2 id="sense-title" className="display sense-title">
          <span className="line">
            <span className="word">Can</span> <span className="word">you</span> <span className="word">feel</span>
          </span>
          <span className="line">
            <span className="word red">that?</span>
          </span>
        </h2>
        <p className="sense-copy">
          That prickle at the back of my neck is my <strong>spider-sense</strong>. It tells me trouble is close before I can see it. Move your pointer around:
          hidden dangers light up as you get near. (On a phone? Watch it sweep on its own.)
        </p>
      </div>
      <ul className="radar" aria-label="Things my spider-sense warns me about">
        {threats.map((t) => (
          <li key={t.label} className="threat" style={{ left: `${t.x}%`, top: `${t.y}%` }}>
            <span className="threat-lines" aria-hidden="true">
              {Array.from({ length: 8 }, (_, i) => (
                <i key={i} style={{ rotate: `${i * 22.5}deg` }} />
              ))}
            </span>
            <span className="threat-label comic">{t.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
