"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const manifesto =
  "I don't do this for the cape. There is no cape. I do it because I could stop it, and one time I didn't. With great power there must also come great responsibility. So I check the rooftops, then the small streets, then the people nobody is watching.";

const oaths = [
  ["Protect first", "The neighborhood before the headline. A cat in a tree counts."],
  ["Stay human", "Homework, rent, Aunt May's calls. The mask doesn't replace the person."],
  ["Own my mistakes", "Every bad night is data. I patch the suit and keep going."],
];

const hot = new Set(["stop", "responsibility.", "great", "power", "responsibility"]);

export default function Motive() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // word-by-word highlight, scrubbed by scroll
        gsap.fromTo(
          ".m-word",
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.1,
            scrollTrigger: { trigger: ".m-text", start: "top 78%", end: "bottom 45%", scrub: true },
          },
        );
        gsap.from(".oath", {
          y: 60,
          opacity: 0,
          rotate: (i) => (i - 1) * 3,
          duration: 0.9,
          stagger: 0.14,
          ease: "back.out(1.5)",
          scrollTrigger: { trigger: ".oaths", start: "top 82%" },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={root} id="motive" className="motive" aria-labelledby="motive-title">
      <p className="eyebrow">Chapter 03 · Motive &amp; intention</p>
      <h2 id="motive-title" className="sr-only">
        Why I do it
      </h2>
      <p className="m-text display">
        {manifesto.split(" ").map((w, i) => (
          <span key={i} className={`m-word${hot.has(w.toLowerCase()) ? " is-hot" : ""}`}>
            {w}{" "}
          </span>
        ))}
      </p>
      <ol className="oaths">
        {oaths.map(([t, d], i) => (
          <li key={t} className="oath" data-hover>
            <span className="comic oath-n">0{i + 1}</span>
            <h3 className="display">{t}</h3>
            <p>{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
