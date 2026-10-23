import { z } from "zod";
import { posDemoSchema, sfxSchema } from "../template/schema";

/** A rectangle in the source recording's own pixels. */
const sourceRectSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
});

/** A recording (or a still of one) on a card over the dimmed photo. */
const cardSchema = z.object({
  clip: z.string(),
  still: z.boolean().default(false),
  source: z.object({ width: z.number(), height: z.number() }),
  crop: sourceRectSchema,
  trimBefore: z.number().default(0),
  /** Ringed `at` seconds into the scene. Source pixels, like `crop`. */
  ring: sourceRectSchema.extend({ at: z.number() }).optional(),
  top: z.number().default(220), // frame pixels
  width: z.number().default(960),
});

const sceneSchema = z.object({
  name: z.string(),
  from: z.number(), // seconds
  to: z.number(),
  /** Full-bleed background, cover-fitted to 1080x1920. */
  photo: z.string(),
  /** A slow push-in; the handwriting rides along with the paper. */
  zoom: z
    .object({
      from: z.number().default(1),
      to: z.number().default(1.06),
      originX: z.number().default(0.5),
      originY: z.number().default(0.5),
    })
    .default({ from: 1, to: 1.06, originX: 0.5, originY: 0.5 }),
  /** 0–1 darkening, and blur in px, so a card on top reads first. */
  dim: z.number().min(0).max(1).default(0),
  blur: z.number().default(0),
  card: cardSchema.optional(),
});

const timedSchema = z.object({
  from: z.number(), // seconds; 0 is on screen on frame 0
  until: z.number().optional(),
});

/** Written on the paper, left to right, in a ballpoint hand. */
const handSchema = timedSchema.extend({
  type: z.literal("hand"),
  text: z.string(),
  x: z.number(),
  y: z.number(), // baseline-ish top of the text box, frame pixels
  size: z.number().default(96),
  color: z.string().default("#1C3A8C"),
  rotate: z.number().default(-2),
  /** Seconds the pen takes; 0 is already written. */
  write: z.number().default(0.6),
});

/** A hand-drawn loop around something on the paper. */
const circleSchema = timedSchema.extend({
  type: z.literal("circle"),
  x: z.number(), // centre
  y: z.number(),
  width: z.number(),
  height: z.number(),
  color: z.string().default("#D7261E"),
  draw: z.number().default(0.4),
});

/** A speech bubble — someone at the counter. */
const bubbleSchema = timedSchema.extend({
  type: z.literal("bubble"),
  text: z.string(),
  x: z.number(),
  y: z.number(),
  side: z.enum(["left", "right"]).default("left"),
});

/** A small call to action that does not end the video (loops keep going). */
const pillSchema = timedSchema.extend({
  type: z.literal("pill"),
  text: z.string(),
  y: z.number(),
});

/**
 * Big copy on a paper band: a format's title card, a list's entry, a verse.
 * "*word*" is painted tomato and "\n" breaks the line.
 */
const titleSchema = timedSchema.extend({
  type: z.literal("title"),
  text: z.string(),
  y: z.number(), // top of the band, frame pixels
  size: z.number().default(72),
  /** A small tomato chip on the band's top edge: "#1", "CALAVERITA". */
  kicker: z.string().optional(),
  /** The band rises in; false holds it set, as on frame 0. */
  animate: z.boolean().default(true),
});

export const overlaySchema = z.discriminatedUnion("type", [
  handSchema,
  circleSchema,
  bubbleSchema,
  pillSchema,
  titleSchema,
]);

export const photoStorySchema = z.object({
  /** "audio/x.mp3" — its captions are read from "captions/x.json". */
  audioFile: z.string(),
  music: posDemoSchema.shape.music,
  scenes: z.array(sceneSchema).min(1),
  overlays: z.array(overlaySchema).default([]),
  /** Sounds on absolute seconds: a pop per bubble, a whoosh per card. */
  sfx: z.array(sfxSchema).default([]),
  /** Seconds the word captions show between. */
  captions: z.object({ from: z.number(), until: z.number() }),
  /** PosDemo's end card; omit it for a loop. */
  cta: posDemoSchema.shape.cta.optional(),
  /** Seconds — the video's length. */
  end: z.number(),
});

export type PhotoStoryProps = z.infer<typeof photoStorySchema>;
export type PhotoScene = PhotoStoryProps["scenes"][number];
export type PhotoOverlay = PhotoStoryProps["overlays"][number];
