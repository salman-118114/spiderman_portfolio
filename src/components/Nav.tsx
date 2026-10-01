const links = [
  ["#sense", "Spider-sense"],
  ["#origin", "Origin"],
  ["#motive", "Motive"],
  ["#powers", "Powers"],
  ["#files", "Case files"],
  ["#verse", "Multiverse"],
  ["#lab", "Under the mask"],
  ["#signal", "Signal"],
] as const;

export default function Nav() {
  return (
    <header className="nav">
      <a className="nav-logo comic" href="#top" aria-label="Peter Parker — back to top">
        <svg viewBox="0 0 40 40" width="26" height="26" aria-hidden="true" fill="currentColor">
          <ellipse cx="20" cy="24" rx="6" ry="8" />
          <circle cx="20" cy="13" r="4" />
          <path d="M14 20 4 12M13 25 2 26M14 30 5 38M26 20l10-8M27 25l11 1M26 30l9 8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <span>P. Parker</span>
      </a>
      <nav aria-label="Sections">
        <ul>
          {links.map(([href, label]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
      </nav>
      <span className="nav-badge">A Spartalabs build</span>
    </header>
  );
}
