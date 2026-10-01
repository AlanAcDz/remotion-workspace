import { z } from "zod";
import { rectSchema } from "../template/schema";

/** The synthesised sounds this format adds — regenerate with scripts/make-sfx.sh. */
export const TICKET_SFX = {
  printer: "sfx/printer.mp3",
  tear: "sfx/tear.mp3",
  tick: "sfx/tick.mp3",
} as const;

/**
 * Copy with its accent words wrapped in asterisks: "Lo que tu tienda *pierde*"
 * paints "pierde" tomato. Kept as one string so it stays editable in Studio.
 */
const headlineSchema = z.string();

const lossLineSchema = z.object({
  label: z.string().max(22), // 36px mono on the paper fits 22 chars + amount
  amount: z.number().positive(),
});

export const ticketStorySchema = z.object({
  music: z.object({
    src: z.string(),
    /**
     * No voiceover rides on top, so the bed carries the video: 0.45 puts the
     * mix, printer included, at -14 LUFS — what the platforms normalise to.
     */
    volume: z.number().min(0).max(1).default(0.45),
    trimBefore: z.number().default(0),
    /** Every cue lands on this grid; nastelbom is a steady 120. */
    bpm: z.number().default(120),
  }),

  /** Optional narration; without it the video is text, music and printer. */
  voice: z
    .object({
      audioFile: z.string(),
      /**
       * Scales the printer, ticks and tear under the narration. At full level
       * they sit as loud as the voice and the two compete; 0.17 (~-15 dB)
       * keeps the printer felt without distracting from the voice.
       */
      mechanicalLevel: z.number().min(0).max(1).default(0.17),
    })
    .optional(),

  loss: z.object({
    headline: headlineSchema,
    /** Replaces `headline` when the first multiplier prints. */
    monthHeadline: headlineSchema,
    store: z.string(),
    title: z.string(),
    /** Printed under the title: the numbers are an example, not a claim. */
    disclaimer: z.string(),
    lines: z.array(lossLineSchema).min(2).max(12),
    /** Beat the first line prints on, and beats between lines. */
    lineStart: z.number().default(2),
    lineBeats: z.number().default(2),
    /**
     * What the multipliers multiply. Defaults to the sum of the lines (a day
     * of leaks); set it when the lines are repeats of one amount, so "× 60
     * ventas" multiplies one sale rather than the ones on the paper.
     */
    unit: z.number().positive().optional(),
    /** Prints a rule and the lines' sum before the multipliers when set. */
    subtotalLabel: z.string().optional(),
    multipliers: z
      .array(
        z.object({
          label: z.string(),
          factor: z.number().positive(),
          /** What the printer's display calls the running total from here. */
          display: z.string(),
        }),
      )
      .min(1)
      .max(3),
    totalLabel: z.string(),
    displayDay: z.string(),
  }),

  /** The brand reveal between the two receipts. */
  pivot: z.object({
    kicker: z.string(),
    logo: z.string(),
  }),

  /** The answer receipt. Optional: a single-leak episode can go straight to proof. */
  fix: z
    .object({
      headline: headlineSchema,
      header: z.string(),
      /** One per loss line, in the same order, so each leak gets its answer. */
      lines: z.array(z.string().max(24)).min(2).max(6),
      stamp: z.string(),
      displayLabel: z.string(),
    })
    .optional(),

  /** Optional real-UI beat: a recording cropped to the moment that proves it. */
  proof: z
    .object({
      headline: headlineSchema,
      clip: z.string(),
      /** Pixel size of the recording, so the card takes the crop's aspect. */
      source: z.object({ width: z.number(), height: z.number() }),
      trimBefore: z.number(),
      frame: rectSchema,
      /** Card-pixel rectangle ringed once the value appears. */
      highlight: z.object({
        left: z.number(),
        top: z.number(),
        width: z.number(),
        height: z.number(),
        at: z.number(), // seconds into the proof beat
      }),
    })
    .optional(),

  cta: z.object({
    headline: headlineSchema,
    logo: z.string(),
    lines: z.array(z.string()).min(1).max(3),
    pill: z.string(),
    displayLabel: z.string(),
    displayValue: z.string(),
  }),

  /**
   * Narrated episodes pin their story beats to the words instead of the beat
   * grid: seconds for each multiplier, the total, the tear, the pivot, the
   * proof, the CTA and the end. The receipt lines stay on the grid.
   */
  timing: z
    .object({
      multipliers: z.array(z.number()),
      total: z.number(),
      tear: z.number(),
      pivot: z.number(),
      proof: z.number().optional(),
      cta: z.number(),
      end: z.number(),
    })
    .optional(),
});

export type TicketStoryProps = z.infer<typeof ticketStorySchema>;
