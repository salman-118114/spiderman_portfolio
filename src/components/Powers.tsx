"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/* Self-assessed, obviously. */
const stats = [
  ["Wall-crawling", 100],
  ["Spider-sense", 96],
  ["Agility", 98],
  ["Quips", 99],
  ["Web engineering", 92],
  ["Strength", 90],
  ["Science", 88],
  ["Stamina", 78],
] as const;

const habits = [
  ["03:12", "Patrols until 3 a.m., makes first period at 8:05. Mostly."],
  ["Always", "Quips mid-fight. It's a coping mechanism and also just who I am."],
  ["Nightly", "Tinkers with web-fluid formulas. The chemistry never sits still."],
  ["Daily", "Photographs the city. Good light, bad angles, great rooftops."],
  ["Lunch", "Corner-deli sandwiches. Pizza when the week allows it."],
  ["After patrol", "Calls Aunt May. Tells her I'm fine. Sometimes it's true."],
];

const SIZE = 320;
const C = SIZE / 2;
const R = 118;

const point = (i: number, v: number) => {
  const a = (i / stats.length) * Math.PI * 2 - Math.PI / 2;
  return [C + Math.cos(a) * R * (v / 100), C + Math.sin(a) * R * (v / 100)] as const;
};

export default function Powers() {
  const root = useRef<HTMLElement>(null);
  const [active, setActive] = useState<number | null>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".radar-shape",
          { scale: 0, rotation: -40, transformOrigin: "50% 50%" },
          { scale: 1, rotation: 0, duration: 1.4, ease: "elastic.out(1, 0.55)", scrollTrigger: { trigger: ".radar-chart", start: "top 75%" } },
        );
        gsap.from(".radar-outline", { strokeDashoffset: 1, duration: 1.6, ease: "power2.out", scrollTrigger: { trigger: ".radar-chart", start: "top 75%" } });
        gsap.from(".habit", {
          x: -50,
          opacity: 0,
          duration: 0.7,
          stagger: 0.09,
          ease: "power3.out",
          scrollTrigger: { trigger: ".habits", start: "top 80%" },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);

  const shape = stats.map(([, v], i) => point(i, v).join(",")).join(" ");

  return (
    <section ref={root} id="powers" className="powers" aria-labelledby="powers-title">
      <header className="sec-head">
        <p className="eyebrow">Chapter 04 · Skills &amp; habits</p>
        <h2 id="powers-title" className="display sec-title">
          The power set <span className="red">&amp; the daily grind</span>
        </h2>
      </header>

      <div className="powers-grid">
        <figure className="radar-chart">
          <svg viewBox={`-80 -24 ${SIZE + 160} ${SIZE + 48}`} role="img" aria-label="Radar chart of Spider-Man's abilities">
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <polygon
                key={k}
                className="radar-grid"
                points={stats.map((_, i) => point(i, 100 * k).join(",")).join(" ")}
              />
            ))}
            {stats.map((_, i) => {
              const [x, y] = point(i, 100);
              return <line key={i} className="radar-grid" x1={C} y1={C} x2={x} y2={y} />;
            })}
            <g className="radar-shape">
              <polygon className="radar-fill" points={shape} />
              <polygon className="radar-outline" points={shape} pathLength={1} />
              {stats.map(([, v], i) => {
                const [x, y] = point(i, v);
                return <circle key={i} className={`radar-dot${active === i ? " is-on" : ""}`} cx={x} cy={y} r={active === i ? 6 : 4} />;
              })}
            </g>
            {stats.map(([name], i) => {
              const [x, y] = point(i, 128);
              return (
                <text key={name} className={`radar-label${active === i ? " is-on" : ""}`} x={x} y={y} textAnchor={x < C - 6 ? "end" : x > C + 6 ? "start" : "middle"} dominantBaseline="middle">
                  {name}
                </text>
              );
            })}
          </svg>
          <figcaption className="sr-only">Ratings out of 100.</figcaption>
          <ul className="stat-list">
            {stats.map(([name, v], i) => (
              <li
                key={name}
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                tabIndex={0}
                data-hover
              >
                <span>{name}</span>
                <b className="comic">{v}</b>
              </li>
            ))}
          </ul>
        </figure>

        <div className="habits">
          <h3 className="display habits-title">Habits, logged</h3>
          <ul>
            {habits.map(([when, what]) => (
              <li key={when} className="habit" data-hover>
                <span className="habit-when">{when}</span>
                <span className="habit-what">{what}</span>
                <i aria-hidden="true" />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
