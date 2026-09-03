import { z } from "zod";

/**
 * Every video is cut on the same split: the UI takes the top two thirds of the
 * frame, captions take the bottom third. The layouts, the caption band and the
 * crop rectangles are all derived from these two numbers, so the split lives in
 * exactly one place.
 */
export const FRAME = { width: 1080, height: 1920 } as const;

export const UI_ZONE = {
  width: FRAME.width,
  height: (FRAME.height * 2) / 3,
} as const;

/**
 * Crop rectangle expressed as fractions (0–1) of the clip's own frame, so the
 * same numbers work for a 1280x720 desktop master and an 860x1864 phone
 * recording. `{x: 0.22, width: 0.59}` means "start 22% in, show 59% of the
 * width" — the pane scales that region up to fill its box.
 */
export const rectSchema = z.object({
  x: z.number().min(0).max(1),
  y: z.number().min(0).max(1),
  width: z.number().min(0).max(1),
  height: z.number().min(0).max(1),
});

/** Where a clip sits inside the demo panel, in panel pixels. */
export const boxSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  radius: z.number().default(28),
});

export const paneSchema = z.object({
  clip: z.string(),
  still: z.boolean().default(false), // true for a PNG frame instead of a video
  trimBefore: z.number().default(0), // seconds into the source
  playbackRate: z.number().default(1),
  frame: rectSchema.optional(), // omit to show the whole clip
  zoomTo: rectSchema.optional(), // push-in target
  zoomStart: z.number().default(0.5), // seconds into the beat
  zoomEnd: z.number().optional(), // seconds into the beat; defaults to 60% of it
  box: boxSchema.optional(), // omit to fill the panel edge to edge
});

/**
 * A sound attached to an on-screen event. `at` is seconds into the scene that
 * owns the cue, so a sound never floats free of the thing it punctuates.
 */
export const sfxSchema = z.object({
  sound: z.string(),
  at: z.number().default(0),
  volume: z.number().min(0).max(1).default(0.4),
});

/**
 * The bed reused across every Punto Listo video. nastelbom opens with a two
 * second riser, so `trimBefore` drops the intro and the track lands on its
 * downbeat at the same moment the voiceover starts.
 */
export const MUSIC = {
  nastelbom: { src: "music/nastelbom.mp3", trimBefore: 2 },
};

/** The synthesised pack in public/sfx — regenerate with scripts/make-sfx.sh. */
export const SFX = {
  whoosh: "sfx/whoosh.mp3",
  pop: "sfx/pop.mp3",
  ding: "sfx/ding.mp3",
  softHit: "sfx/soft-hit.mp3",
} as const;

export const calloutSchema = z.object({
  text: z.string(),
  left: z.number(), // panel-relative pixels
  top: z.number(),
  at: z.number(), // seconds into the beat
});

export const beatSchema = z.object({
  name: z.string(),
  from: z.number(), // seconds, straight off the cue sheet
  to: z.number(),
  layout: z
    .enum(["panel", "fullframe", "mobile-ui"])
    .default("panel"),
  panes: z.array(paneSchema).min(1),
  callout: calloutSchema.optional(),
  /** Seconds are relative to `from`, so retiming a beat retimes its sounds. */
  sfx: z.array(sfxSchema).default([]),
});

export const posDemoSchema = z.object({
  /** "audio/corte-v1.mp3" — its transcript is read from "captions/corte-v1.json". */
  audioFile: z.string(),
  /** Big copy over the first beat. Captions take over at `until`. */
  hook: z.object({
    text: z.string(),
    subline: z.string().optional(),
    until: z.number(), // seconds
  }),
  /** Ink on paper for panel videos, white-on-video for full-bleed ones. */
  captionStyle: z.enum(["paper", "video"]).default("paper"),
  /**
   * One track reused across every Punto Listo video — sonic branding, same
   * rule as the single ElevenLabs voice. The default level was measured, not
   * guessed: it puts nastelbom (-8.9 LUFS) about 13 dB under the voiceover,
   * which is present in the pauses and out of the way under speech.
   */
  music: z
    .object({
      src: z.string(),
      volume: z.number().min(0).max(1).default(0.07),
      /** Seconds into the track — skip the intro so it opens on the downbeat. */
      trimBefore: z.number().default(0),
    })
    .optional(),
  beats: z.array(beatSchema).min(1),
  cta: z.object({
    from: z.number(), // seconds
    logo: z.string(),
    line1: z.string(),
    line2: z.string(),
    note: z.string(),
    pill: z.string(),
    mobileClip: z.string().optional(),
    sfx: z.array(sfxSchema).default([]),
    /** Absolute seconds — each line lands on the word that says it. */
    revealAt: z.object({
      line2: z.number(),
      note: z.number(),
      pill: z.number(),
    }),
  }),
});

export type PosDemoProps = z.infer<typeof posDemoSchema>;
export type Beat = z.infer<typeof beatSchema>;
export type Pane = z.infer<typeof paneSchema>;
export type Rect = z.infer<typeof rectSchema>;

export type Sfx = z.infer<typeof sfxSchema>;

/**
 * A full-width crop of a recording that exactly fills the UI zone — same
 * aspect ratio, so the UI is neither stretched nor rescaled. `topPx` is the
 * source pixel row the window starts at, which is the number you measure off a
 * still; sliding it up and down the phone screen is how a single take is cut
 * into beats.
 */
export function uiWindow(
  source: { width: number; height: number },
  topPx: number,
): Rect {
  return {
    x: 0,
    y: topPx / source.height,
    width: 1,
    height: (source.width * UI_ZONE.height) / UI_ZONE.width / source.height,
  };
}

/** Convention over configuration: audio/<name>.mp3 → captions/<name>.json */
export function captionsFileFor(audioFile: string): string {
  return audioFile
    .replace(/^audio\//, "captions/")
    .replace(/\.(mp3|m4a|wav)$/, ".json");
}
