/* Shared motion helpers: reduced-motion check and a "preloader finished" gate. */

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const hasFinePointer = () =>
  typeof window !== "undefined" && window.matchMedia("(hover: hover) and (pointer: fine)").matches;

let resolveReady: () => void = () => {};
const readyPromise: Promise<void> = new Promise((res) => {
  resolveReady = res;
});

/** Sections await this before playing their entrance animation. */
export const whenReady = () => readyPromise;
export const markReady = () => resolveReady();

export type WebConfig = {
  spokes: number;
  rings: number;
  stiffness: number;
  damping: number;
  pull: number;
  sag: number;
};

export const defaultWeb: WebConfig = {
  spokes: 14,
  rings: 9,
  stiffness: 0.045,
  damping: 0.9,
  pull: 0.32,
  sag: 0.14,
};
