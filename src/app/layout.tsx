import type { Metadata, Viewport } from "next";
import { Anton, Bangers, Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import "./sections.css";

const anton = Anton({ weight: "400", subsets: ["latin"], variable: "--font-display" });
const bangers = Bangers({ weight: "400", subsets: ["latin"], variable: "--font-comic" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-body" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: "Peter Parker — Friendly Neighborhood Portfolio",
  description:
    "Spider-Man's own portfolio: his origin, habits, powers, motive and every film case file. A fan-made interactive showcase built by Spartalabs.",
};

export const viewport: Viewport = {
  themeColor: "#07070d",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${anton.variable} ${bangers.variable} ${grotesk.variable} ${mono.variable}`}
    >
      <head>
        {/* Marks JS-capable browsers so JS-only overlays never show without a script. */}
        <script dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
