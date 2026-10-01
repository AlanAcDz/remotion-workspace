import { plexMono } from "./fonts";

/** Punto Listo's DESIGN.md palette, plus the one paper tone this format adds. */
export const COLORS = {
  tomato: "#E44D2E",
  ink: "#1F1A17",
  shopFloor: "#F7F4EF",
  paper: "#FBF8F1",
  paperInk: "#2A2522",
  muted: "#8A8078",
  success: "#047857",
  successGlow: "#4ADE80",
} as const;

export const MONO = `"${plexMono}", monospace`;
export const SANS = "Archivo";

/**
 * The printer's slot is the one fixed landmark: paper emerges from it, the
 * display sits under it, and the headline owns everything above the paper.
 */
export const STAGE = {
  headlineTop: 190,
  paperTop: 450,
  slotY: 1240,
  paperLeft: 160,
  paperWidth: 760,
} as const;

export function formatMoney(value: number): string {
  return `$${value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}
