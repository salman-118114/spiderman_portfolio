const variants = [
  ["Miles Morales", "Into the Spider-Verse · 2018", "Bitten in Brooklyn. Leaps of faith are the whole job."],
  ["Gwen Stacy", "Into the Spider-Verse · 2018", "Spider-Gwen, a.k.a. Ghost-Spider. Drummer. Fast on her feet."],
  ["Peter B. Parker", "Into the Spider-Verse · 2018", "Older, tireder, still shows up. Mentor by accident."],
  ["Spider-Man Noir", "Into the Spider-Verse · 2018", "Black-and-white 1930s detective. Voiced by Nicolas Cage."],
  ["Peni Parker", "Into the Spider-Verse · 2018", "Pilots the SP//dr mech with a radioactive spider inside."],
  ["Spider-Ham", "Into the Spider-Verse · 2018", "Peter Porker. Cartoon physics, real courage."],
  ["Miguel O'Hara", "Across the Spider-Verse · 2023", "Spider-Man 2099. Keeps the multiverse in order. Intensely."],
  ["Hobie Brown", "Across the Spider-Verse · 2023", "Spider-Punk. Guitar, attitude, zero tolerance for authority."],
] as const;

/* Pure CSS motion: RGB-split + glitch on hover, so the multiverse costs no JS. */
export default function Variants() {
  return (
    <section id="verse" className="verse" aria-labelledby="verse-title">
      <header className="sec-head">
        <p className="eyebrow">Chapter 06 · The multiverse</p>
        <h2 id="verse-title" className="display sec-title">
          Other <span className="red">Spiders</span> I&apos;ve met
        </h2>
        <p className="verse-lede">Anyone can wear the mask. Hover a name to tune the frequency.</p>
      </header>
      <ul className="verse-grid">
        {variants.map(([name, from, line], i) => (
          <li key={name} className="variant" data-hover style={{ "--i": i } as React.CSSProperties}>
            <span className="variant-n comic">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="variant-name display" data-text={name}>
              {name}
            </h3>
            <p className="variant-from">{from}</p>
            <p className="variant-line">{line}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
