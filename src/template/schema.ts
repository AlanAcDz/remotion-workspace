import { z } from "zod";

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
    .enum(["panel", "fullframe", "mobile-upper-half"])
    .default("panel"),
  panes: z.array(paneSchema).min(1),
  callout: calloutSchema.optional(),
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
  beats: z.array(beatSchema).min(1),
  cta: z.object({
    from: z.number(), // seconds
    logo: z.string(),
    line1: z.string(),
    line2: z.string(),
    note: z.string(),
    pill: z.string(),
    mobileClip: z.string().optional(),
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

/** Convention over configuration: audio/<name>.mp3 → captions/<name>.json */
export function captionsFileFor(audioFile: string): string {
  return audioFile
    .replace(/^audio\//, "captions/")
    .replace(/\.(mp3|m4a|wav)$/, ".json");
}
