"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { films, type Film } from "@/lib/films";
import { hasFinePointer } from "@/lib/motion";

gsap.registerPlugin(ScrollTrigger);

function Card({ f }: { f: Film }) {
  const ref = useRef<HTMLElement>(null);

  // 3D tilt + glare that follows the pointer
  const onMove = (e: React.PointerEvent) => {
    if (!hasFinePointer() || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    gsap.to(ref.current, { rotateY: (px - 0.5) * 16, rotateX: (0.5 - py) * 12, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    ref.current.style.setProperty("--gx", `${px * 100}%`);
    ref.current.style.setProperty("--gy", `${py * 100}%`);
  };
  const onLeave = () => ref.current && gsap.to(ref.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1,0.5)", overwrite: "auto" });

  return (
    <li className="file-slot">
      <article
        ref={ref}
        className={`file universe-${f.universe.toLowerCase()}`}
        style={{ "--hue": f.hue } as React.CSSProperties}
        onPointerMove={onMove}
        onPointerLeave={onLeave}
        data-id={f.id}
        data-hover
      >
        <span className="file-glare" aria-hidden="true" />
        <header>
          <span className="comic file-id">File {f.id}</span>
          <span className="file-year display">{f.year}</span>
        </header>
        <h3 className="display file-title">{f.title}</h3>
        {f.upcoming && <span className="file-tag comic">Coming soon</span>}
        <dl>
          <div>
            <dt>Spider</dt>
            <dd>{f.spider}</dd>
          </div>
          <div>
            <dt>Opposition</dt>
            <dd>{f.foe}</dd>
          </div>
          <div>
            <dt>Universe</dt>
            <dd>{f.universe}</dd>
          </div>
        </dl>
        <p className="file-note">&ldquo;{f.note}&rdquo;</p>
      </article>
    </li>
  );
}

export default function CaseFiles() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      // desktop + motion: pin the section and slide the strip sideways with scroll
      mm.add("(min-width: 900px) and (prefers-reduced-motion: no-preference)", () => {
        const track = el.querySelector<HTMLElement>(".files-track")!;
        gsap.set(track, { overflow: "visible", maxWidth: "none" });
        const dist = () => track.scrollWidth - window.innerWidth + 120;
        const tween = gsap.to(track, {
          x: () => -dist(),
          ease: "none",
          scrollTrigger: {
            trigger: el,
            start: "top top",
            end: () => `+=${dist()}`,
            pin: true,
            scrub: 0.7,
            invalidateOnRefresh: true,
            anticipatePin: 1,
            onUpdate: (self) => {
              el.style.setProperty("--p", self.progress.toFixed(3));
            },
          },
        });
        // cards rise as they enter the viewport from the right
        gsap.utils.toArray<HTMLElement>(".file").forEach((card) => {
          gsap.from(card, {
            y: 80,
            opacity: 0.2,
            ease: "none",
            scrollTrigger: { trigger: card, containerAnimation: tween, start: "left 100%", end: "left 62%", scrub: true },
          });
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="files" className="files" aria-labelledby="files-title">
      <header className="files-head">
        <p className="eyebrow">Chapter 05 · Case files</p>
        <h2 id="files-title" className="display sec-title">
          Every film, <span className="red">on record</span>
        </h2>
        <p className="files-lede">My work history, in release order. Scroll to move along the strand.</p>
      </header>
      <ul className="files-track" aria-label="Spider-Man films, chronologically">
        {films.map((f) => (
          <Card key={f.id} f={f} />
        ))}
      </ul>
      <div className="files-rail" aria-hidden="true">
        <span className="files-rail-thread" />
        <span className="files-rail-spider" />
      </div>
    </section>
  );
}
