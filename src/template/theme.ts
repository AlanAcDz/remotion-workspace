import { createContext, useContext } from "react";

/**
 * Everything brand-specific the PosDemo template paints with. Layout, timing
 * and motion stay shared; a brand only swaps type and colour. The CTA logo box
 * lives here too because each brand's logo has its own aspect ratio.
 */
export interface Theme {
  fontFamily: string;
  weights: {
    /** Hook headline, captions, CTA headline. */
    display: number;
    /** Subline, callout, CTA note and pill. */
    emphasis: number;
  };
  colors: {
    background: string;
    /** Primary text, caption stroke and the tint of every shadow. */
    ink: string;
    /** Hook subline, active caption word, CTA line 2. */
    accent: string;
    /** CTA pill fill. */
    pill: string;
    onPill: string;
    muted: string;
    surface: string;
    callout: string;
    onCallout: string;
  };
  ctaLogo: {
    /** CTA over the background alone. */
    full: { width: number; top: number };
    /** CTA sharing the frame with a mobile clip. */
    compact: { width: number; top: number };
  };
}

export const THEMES = {
  "punto-listo": {
    fontFamily: "Archivo",
    weights: { display: 700, emphasis: 700 },
    colors: {
      background: "#F7F3EB",
      ink: "#221E18",
      accent: "#DE5134",
      pill: "#DE5134",
      onPill: "#FFFFFF",
      muted: "#6B6357",
      surface: "#FFFFFF",
      callout: "#221E18",
      onCallout: "#FBF9F6",
    },
    ctaLogo: {
      full: { width: 480, top: 520 },
      compact: { width: 300, top: 1300 },
    },
  },
  /**
   * Arya teal (#39ACAC) fails contrast as text on cream, so text and the pill
   * use a deeper shade of the same hue; Gentle Coral carries the callouts.
   */
  arya: {
    fontFamily: "Poppins",
    weights: { display: 700, emphasis: 600 },
    colors: {
      background: "#FFF8EF",
      ink: "#192626",
      accent: "#237A7A",
      pill: "#237A7A",
      onPill: "#FFFFFF",
      muted: "#667777",
      surface: "#FFFFFF",
      callout: "#F5BEA3",
      onCallout: "#192626",
    },
    ctaLogo: {
      full: { width: 340, top: 330 },
      compact: { width: 150, top: 1230 },
    },
  },
} as const satisfies Record<string, Theme>;

export type ThemeName = keyof typeof THEMES;

export const THEME_NAMES = Object.keys(THEMES) as [ThemeName, ...ThemeName[]];

// Punto Listo is the default so components rendered outside PosDemo (reto,
// ticket) keep their original look without a provider.
export const ThemeContext = createContext<Theme>(THEMES["punto-listo"]);

export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** "#221E18", 0.1 → "rgba(34, 30, 24, 0.1)" */
export function withAlpha(hex: string, alpha: number): string {
  const value = Number.parseInt(hex.slice(1), 16);
  const r = (value >> 16) & 255;
  const g = (value >> 8) & 255;
  const b = value & 255;

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
