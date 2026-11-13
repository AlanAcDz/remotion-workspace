import { z } from "zod";

/** A transcoded copy in public/bon/ and where it starts in the original. */
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
  /**
   * A small label in the top-left corner while this shot is on screen.
   * Consecutive shots with the same label share one label.
   */
  label: z.string().optional(),
});

/** One caption on screen. "\n" only breaks the layout. */
const chunkSchema = z.object({
  text: z.string(),
  /** Second of the voiceover where she starts saying it. */
  at: z.number().optional(),
});

const segmentBaseSchema = z.object({
  name: z.string(),
  /**
   * The line split for the screen. Joined with spaces they read exactly as
   * spoken; "{plannerName}" is replaced by the `plannerName` prop.
   */
  chunks: z.array(chunkSchema).min(1),
  /** Seconds on screen without a voiceover. */
  duration: z.number().positive(),
  /** Second of the voiceover where the segment begins. */
  start: z.number().optional(),
  /** A small chapter mark in the top-left corner while the segment opens. */
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

export const bonSchema = z.object({
  plannerName: z.string(),
  clips: z.record(z.string(), clipSchema),
  segments: z.array(segmentSchema).min(1),
  /** One continuous voice file that starts on frame 0. */
  voiceover: z
    .object({
      src: z.string(),
      /** Seconds the end card stays after the voice ends. */
      endHold: z.number().default(3),
    })
    .optional(),
  music: z.object({
    src: z.string(),
    /** Seconds dropped from the head of the track. */
    trimBefore: z.number().default(0),
    /** Level while the captions carry the story. */
    volume: z.number().min(0).max(1),
    /** Level under the voiceover. */
    underVoiceVolume: z.number().min(0).max(1),
    /** Level on the end card once the voice has ended. */
    endCardVolume: z.number().min(0).max(1),
    fadeOut: z.number().default(2.5),
  }),
  endCard: z.object({
    logo: z.string(),
    tags: z.array(z.string()),
  }),
});

export type BonProps = z.infer<typeof bonSchema>;
export type BonSegment = BonProps["segments"][number];
export type BonShot = z.infer<typeof shotSchema>;
export type BonClip = z.infer<typeof clipSchema>;
