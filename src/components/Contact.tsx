"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { prefersReducedMotion } from "@/lib/motion";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const shot = useRef<HTMLSpanElement>(null);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!prefersReducedMotion() && shot.current) {
      gsap.fromTo(
        shot.current,
        { scaleX: 0, opacity: 1, transformOrigin: "0% 50%" },
        { scaleX: 1, duration: 0.35, ease: "power3.out", onComplete: () => void gsap.to(shot.current, { opacity: 0, duration: 0.8 }) },
      );
    }
    setSent(true);
  };

  return (
    <section id="signal" className="signal" aria-labelledby="signal-title">
      <div className="signal-beam" aria-hidden="true" />
      <p className="eyebrow">Chapter 08 · Send a signal</p>
      <h2 id="signal-title" className="display signal-title">
        Need a hero?
        <br />
        <span className="red">Light the signal.</span>
      </h2>
      <form className="signal-form" onSubmit={onSubmit}>
        <label>
          <span>Your name</span>
          <input name="name" required autoComplete="name" placeholder="Mary Jane" />
        </label>
        <label>
          <span>What&apos;s happening in the neighborhood?</span>
          <textarea name="msg" required rows={4} placeholder="A crane is swinging over 5th Avenue…" />
        </label>
        <button className="btn" type="submit" data-magnetic>
          Thwip it
        </button>
        <span ref={shot} className="signal-shot" aria-hidden="true" />
        <p className="signal-status" role="status">
          {sent ? "Signal sent. (This is a front-end demo — Spartalabs can wire it to your real backend.)" : ""}
        </p>
      </form>
      <footer className="foot">
        <p>© Peter Parker (fictional) · A Spartalabs build · Next.js, GSAP, canvas.</p>
        <p>Fan-made tribute. Spider-Man and related characters are trademarks of Marvel and Sony; this project is not affiliated with or endorsed by them.</p>
      </footer>
    </section>
  );
}
