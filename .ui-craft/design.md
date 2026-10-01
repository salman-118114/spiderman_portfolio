# Design memory — Peter Parker portfolio (Spartalabs showcase)

## Story
Spider-Man's own portfolio. Central metaphor: **the web** — tension, snap, release. Voice: Peter's, dry and warm.
## Structure (arc: personal case-file → proof → maker's credit)
Hero (interactive web) → Spider-sense radar → Origin (pinned, scrubbed) → Motive (word highlight) → Powers & habits (radar chart) → Case files (pinned horizontal film strip) → Multiverse (glitch tiles) → Under the mask (live physics lab, Spartalabs credit) → Signal (contact).
## Motion language: "thwip-and-settle" (playful) — fast launch, small overshoot, calm settle.
Tokens in `src/app/globals.css`. Only transform/opacity/clip-path animated. Reduced motion shows final states.
## Decisions
- 2026-10-01: GSAP + ScrollTrigger, no smooth-scroll lib. Canvas web is hand-rolled (src/components/WebCanvas.tsx).
- Film data in src/lib/films.ts. "Brand New Day" (2026) and "Beyond the Spider-Verse" (2027) are deliberately plot-free — verify dates/details before launch.
- Contact form is front-end only.
