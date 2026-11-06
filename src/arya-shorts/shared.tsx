import { loadFont as loadCinzel } from "@remotion/google-fonts/Cinzel";
import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  interpolate,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { MusicBed } from "../template/components/music-bed";
import { SfxCues } from "../template/components/sfx-cues";
import "../template/fonts";
import { CtaScene } from "../template/scenes/cta-scene";
import type { PosDemoProps, Sfx } from "../template/schema";
import { THEMES, ThemeContext } from "../template/theme";

/** The trailer's title face. Exported so the call cannot be tree-shaken away. */
export const { fontFamily: cinzel } = loadCinzel("normal", {
  weights: ["700"],
  subsets: ["latin"],
});

export const ARYA = THEMES.arya;
export const TEAL = "#39ACAC";
export const CORAL = "#F5BEA3";
export const POPPINS = ARYA.fontFamily;

const SNAP = Easing.bezier(0.16, 1, 0.3, 1);

/** 0 → 1 between two frames, clamped. */
export function ramp(
  frame: number,
  from: number,
  to: number,
  easing: (input: number) => number = SNAP,
): number {
  return interpolate(frame, [from, to], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing,
  });
}

export function useSeconds() {
  const { fps } = useVideoConfig();
  return (seconds: number) => Math.round(seconds * fps);
}

interface ShortFrameProps {
  background: string;
  music?: PosDemoProps["music"];
  /** Second the bed steps aside; defaults to never. */
  duckAt?: number;
  sfx: Sfx[];
  children: ReactNode;
}

/** Horizontally centers an absolute box on the 1080 px canvas. */
export function centered(width: number) {
  return { left: (1080 - width) / 2, width, boxSizing: "border-box" } as const;
}

/** Arya's theme, the bed and the absolute-seconds sound cues of every short. */
export function ShortFrame({
  background,
  music,
  duckAt,
  sfx,
  children,
}: ShortFrameProps) {
  const { durationInFrames, fps } = useVideoConfig();

  return (
    <ThemeContext.Provider value={ARYA}>
      <AbsoluteFill style={{ backgroundColor: background, overflow: "hidden" }}>
        {music ? (
          <MusicBed
            music={music}
            ctaFrom={
              duckAt === undefined ? durationInFrames : Math.round(duckAt * fps)
            }
          />
        ) : null}
        <SfxCues cues={sfx} />
        {children}
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
}

/** PosDemo's end card on cream, faded in over whatever came before it. */
export function EndCard({ cta }: { cta: PosDemoProps["cta"] }) {
  const sec = useSeconds();

  return (
    <Sequence name="CTA" from={sec(cta.from)}>
      <EndCardFade cta={cta} />
    </Sequence>
  );
}

function EndCardFade({ cta }: { cta: PosDemoProps["cta"] }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ARYA.colors.background,
        opacity: ramp(frame, 0, 6),
      }}
    >
      <CtaScene cta={cta} />
    </AbsoluteFill>
  );
}

/** The teal and cream capsule from the store characters. */
export function Capsule({ width, rotate = 0 }: { width: number; rotate?: number }) {
  const height = width * 0.44;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 44"
      style={{ rotate: `${rotate}deg`, display: "block" }}
      aria-hidden
    >
      <defs>
        <clipPath id="capsule-shape">
          <rect x="1.5" y="1.5" width="97" height="41" rx="20.5" />
        </clipPath>
      </defs>
      <g clipPath="url(#capsule-shape)">
        <rect width="50" height="44" fill={TEAL} />
        <rect x="50" width="50" height="44" fill="#FFF8EF" />
        <rect x="8" y="8" width="84" height="6" rx="3" fill="#FFFFFF" opacity="0.45" />
      </g>
      <rect
        x="1.5"
        y="1.5"
        width="97"
        height="41"
        rx="20.5"
        fill="none"
        stroke="#1F5E5E"
        strokeWidth="3"
      />
    </svg>
  );
}

export function PawPrint({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <g fill={color}>
        <ellipse cx="50" cy="68" rx="25" ry="21" />
        <ellipse cx="19" cy="46" rx="10.5" ry="14" transform="rotate(-20 19 46)" />
        <ellipse cx="39" cy="26" rx="10.5" ry="15" transform="rotate(-6 39 26)" />
        <ellipse cx="62" cy="26" rx="10.5" ry="15" transform="rotate(6 62 26)" />
        <ellipse cx="81" cy="46" rx="10.5" ry="14" transform="rotate(20 81 46)" />
      </g>
    </svg>
  );
}
