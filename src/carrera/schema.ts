import { z } from "zod";
import { handSchema } from "../photo/schema";
import { posDemoSchema, sfxSchema } from "../template/schema";

/** The rows of the recording the app card shows, in the source's own pixels. */
const windowSchema = z.object({ top: z.number() });

export const carreraStorySchema = z.object({
  /** "audio/x.mp3" — its captions are read from "captions/x.json". */
  audioFile: z.string(),
  music: posDemoSchema.shape.music,

  /** The question both halves are racing to answer. */
  title: z.string(),

  paper: z.object({
    /** Fills the top half, width-fitted; `offsetY` slides it up, in frame px. */
    photo: z.string(),
    offsetY: z.number().default(0),
    /** Written on the page. `y` is measured from the top of the frame. */
    lines: z.array(handSchema),
  }),

  /** Plays at 1× from frame 0: a speed-up would break the "velocidad real" label. */
  app: z.object({
    clip: z.string(),
    source: z.object({ width: z.number(), height: z.number() }),
    trimBefore: z.number(),
    left: z.number().default(0), // source pixels
    width: z.number(),
    height: z.number(),
    /** The card pans between these rows. The footage itself is not retimed. */
    from: windowSchema,
    to: windowSchema,
    panAt: z.number(),
    panFor: z.number().default(0.5),
    /**
     * The recording moves on to the next product after the result lands, so
     * the card holds on this frame of it from `holdAt`.
     */
    holdStill: z.string(),
    holdAt: z.number(),
    /** Ringed when the app finishes. Source pixels, like the windows. */
    ring: z.object({
      left: z.number(),
      top: z.number(),
      width: z.number(),
      height: z.number(),
    }),
  }),

  /** Seconds each side finishes; the earlier one gets the badge. */
  finish: z.object({ paper: z.number(), app: z.number() }),
  labels: z.object({ paper: z.string(), app: z.string() }),
  /** Always on screen: the paper half is staged, and the viewer should know. */
  disclaimer: z.string(),

  /** A small call to action; there is no end card. */
  pill: z.object({ text: z.string(), from: z.number() }),

  /** Sounds on absolute seconds. */
  sfx: z.array(sfxSchema).default([]),
  /** Seconds the word captions show between. */
  captions: z.object({ from: z.number(), until: z.number() }),
  /** Seconds — the video's length. */
  end: z.number(),
});

export type CarreraStoryProps = z.infer<typeof carreraStorySchema>;
