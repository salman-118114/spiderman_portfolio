"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const beats = [
  { n: "01", title: "The bite", text: "A school trip, a lab, a spider. By morning the walls were optional and my alarm clock was in pieces." },
  { n: "02", title: "The loss", text: "I learned the hard way what happens when I look away. Someone who believed in me paid for it. I carry that." },
  { n: "03", title: "The choice", text: "So I put on the mask. Not for glory — there's no cape, no pay. Because I can help, and so I must." },
];

/* Pinned chapter: scroll scrubs one timeline.
   Beat 1 a spider lowers on a thread and bites (red flash) · beat 2 the city dims, rain falls ·
   beat 3 the mask draws itself line by line. */
export default function Origin() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.set(".mask-line", { strokeDashoffset: 1 });
        gsap.set(".mask-eye", { opacity: 0 });
        gsap.set(".beat", { position: "absolute", left: 0, top: 0, opacity: 0, marginBottom: 0 });
        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: { trigger: el, start: "top top", end: "+=320%", pin: true, scrub: 0.6, anticipatePin: 1 },
        });
        // beat 1
        tl.fromTo(".og-hang", { y: -380 }, { y: 70, duration: 1, ease: "power1.inOut" }, 0)
          .fromTo(".beat-0", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 0.1)
          .to(".og-bite", { opacity: 1, scale: 1.4, duration: 0.15 }, 0.95)
          .to(".og-bite", { opacity: 0, scale: 2.2, duration: 0.25 }, 1.1)
          // beat 2
          .to(".beat-0", { opacity: 0, y: -40, duration: 0.3 }, 1.4)
          .fromTo(".beat-1", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 1.55)
          .to(".og-dim", { opacity: 0.78, duration: 0.6 }, 1.4)
          .to(".og-hang", { y: 260, opacity: 0, duration: 0.5 }, 1.45)
          .fromTo(".og-rain", { opacity: 0 }, { opacity: 1, duration: 0.5 }, 1.6)
          // beat 3
          .to(".beat-1", { opacity: 0, y: -40, duration: 0.3 }, 2.8)
          .to(".og-rain, .og-dim", { opacity: 0, duration: 0.5 }, 2.9)
          .fromTo(".beat-2", { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.4 }, 3.0)
          .to(".mask-line", { strokeDashoffset: 0, duration: 1, stagger: 0.08 }, 2.95)
          .to(".mask-eye", { opacity: 1, duration: 0.4 }, 3.8)
          .to(".og-mask", { scale: 1.06, duration: 0.4, ease: "power2.out" }, 3.9);
        // chapter counter
        const counter = el.querySelector<HTMLElement>(".og-count");
        ScrollTrigger.create({
          trigger: el,
          start: "top top",
          end: "+=320%",
          onUpdate: (self) => {
            if (counter) counter.textContent = `0${Math.min(3, Math.floor(self.progress * 3) + 1)} / 03`;
          },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="origin" className="origin" aria-labelledby="origin-title">
      <div className="og-stage" aria-hidden="true">
        <div className="og-city" />
        <div className="og-dim" />
        <div className="og-hang">
          <span className="og-thread" />
          <svg className="og-spider" viewBox="0 0 40 40" width="76" height="76" fill="currentColor">
            <ellipse cx="20" cy="24" rx="7" ry="9" />
            <circle cx="20" cy="13" r="4.5" />
            <path d="M14 20 4 12M13 25 2 26M14 30 5 38M26 20l10-8M27 25l11 1M26 30l9 8" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
            <path d="M20 22v6" stroke="#e62429" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <span className="og-bite" />
        <div className="og-rain">
          {Array.from({ length: 28 }, (_, i) => (
            <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 7) * 0.1}s` }} />
          ))}
        </div>
        <svg className="og-mask" viewBox="0 0 200 240">
          <path className="mask-line" pathLength={1} d="M100 18C150 18 176 68 171 120 166 176 132 212 100 222 68 212 34 176 29 120 24 68 50 18 100 18Z" />
          <path className="mask-line" pathLength={1} d="M100 18V222" />
          <path className="mask-line" pathLength={1} d="M100 60C70 62 44 76 32 96M100 60C130 62 156 76 168 96" />
          <path className="mask-line" pathLength={1} d="M100 110C66 112 40 128 30 148M100 110C134 112 160 128 170 148" />
          <path className="mask-line" pathLength={1} d="M100 160C78 162 56 172 46 186M100 160C122 162 144 172 154 186" />
          <path className="mask-eye" d="M58 108C68 90 92 94 98 116 90 134 66 136 58 108Z" />
          <path className="mask-eye" d="M142 108C132 90 108 94 102 116 110 134 134 136 142 108Z" />
        </svg>
      </div>

      <div className="og-copy">
        <p className="eyebrow">Chapter 02 · Origin · <span className="og-count">01 / 03</span></p>
        <h2 id="origin-title" className="display og-title">How I got here</h2>
        <div className="og-beats">
          {beats.map((b, i) => (
            <article key={b.n} className={`beat beat-${i}`}>
              <span className="comic beat-n">{b.n}</span>
              <h3 className="display">{b.title}</h3>
              <p>{b.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
