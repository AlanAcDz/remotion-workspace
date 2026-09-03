import { Audio } from "@remotion/media";
import { interpolate, staticFile, useVideoConfig } from "remotion";
import type { PosDemoProps } from "../schema";

// The track is trimmed to its downbeat, so a real fade would swallow the very
// hit we lined up with the voiceover. This is only a click guard.
const LEAD_IN = 0.03; // seconds
const DUCK_UNDER_CTA = 1.5; // seconds
const CTA_LEVEL = 0.25; // fraction of the bed level

interface MusicBedProps {
  music: NonNullable<PosDemoProps["music"]>;
  /** Frame the CTA starts on — the bed steps aside for the ask. */
  ctaFrom: number;
}

/**
 * The layer the viewer should only notice once it's gone: in on the downbeat
 * with the first word, flat under the voiceover, then pulled down to a whisper
 * as the CTA lands so the final ask sits in relative quiet.
 */
export function MusicBed({ music, ctaFrom }: MusicBedProps) {
  const { fps } = useVideoConfig();
  const level = music.volume;

  return (
    <Audio
      name="Música"
      src={staticFile(music.src)}
      trimBefore={Math.round(music.trimBefore * fps)}
      loop
      volume={(frame) =>
        interpolate(
          frame,
          [0, fps * LEAD_IN, ctaFrom, ctaFrom + fps * DUCK_UNDER_CTA],
          [0, level, level, level * CTA_LEVEL],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        )
      }
    />
  );
}
