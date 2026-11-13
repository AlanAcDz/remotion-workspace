import { z } from "zod";

/** A transcoded copy in public/vidanta-familia/ and where it starts in the original. */
const clipSchema = z.object({
  src: z.string(),
  /** Second of the original phone recording that the copy's frame 0 shows. */
  sourceOffset: z.number().default(0),
});

/** A stretch of one clip, in the original recording's seconds. */
const shotSchema = z.object({
  clip: z.string(),
  from: z.number(),
  to: z.number(),
});

const segmentBaseSchema = z.object({
  name: z.string(),
  /**
   * The script line, split into the chunks shown one after another. Joined
   * with spaces they read exactly as the script; "\n" only breaks the layout.
   */
  chunks: z.array(z.string()).min(1),
  /** Seconds on screen. Replaced by the voice length plus `voicePadding`. */
  duration: z.number().positive(),
  /** "vidanta-familia/voz/03.mp3" once the voiceover exists. */
  voice: z.string().optional(),
  voicePadding: z.number().default(0.4),
  /** The numbered space ("1 · Café del Lago"), shown top-left as it opens. */
  chapter: z.string().optional(),
  /** Set the caption larger, in the serif: the hook. */
  isEmphasized: z.boolean().default(false),
});

const footageSegmentSchema = segmentBaseSchema.extend({
  kind: z.literal("footage"),
  shots: z.array(shotSchema).min(1),
});

const endCardSegmentSchema = segmentBaseSchema.extend({
  kind: z.literal("end-card"),
});

export const segmentSchema = z.discriminatedUnion("kind", [
  footageSegmentSchema,
  endCardSegmentSchema,
]);

export const vidantaFamiliaSchema = z.object({
  clips: z.record(z.string(), clipSchema),
  segments: z.array(segmentSchema).min(1),
  music: z.object({
    src: z.string(),
    /** Seconds dropped from the head of the track. */
    trimBefore: z.number().default(0),
    /** Level while the captions carry the story. */
    volume: z.number().min(0).max(1),
    /** Level once any segment has a voice. */
    underVoiceVolume: z.number().min(0).max(1),
    fadeOut: z.number().default(2.5),
  }),
  endCard: z.object({
    /** Typeset wordmark, not a logo: "VidantaWorld". */
    title: z.string(),
    subtitle: z.string(),
    logo: z.string(),
    tags: z.array(z.string()),
  }),
});

export type VidantaFamiliaProps = z.infer<typeof vidantaFamiliaSchema>;
export type VidantaFamiliaSegment = VidantaFamiliaProps["segments"][number];
export type VidantaFamiliaShot = z.infer<typeof shotSchema>;
export type VidantaFamiliaClip = z.infer<typeof clipSchema>;
