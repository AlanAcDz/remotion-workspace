import { z } from "zod";
import { ticketStorySchema } from "../ticket/schema";

/**
 * "Reto del mostrador" played on a printed receipt: the viewer hunts for the
 * wrong line instead of doing the sum. Reuses El Ticket's printer, paper and
 * closing receipt.
 */
export const retoTicketSchema = z.object({
  /** One ElevenLabs take; the countdown is cut into it at `pause.at`. */
  audioFile: z.string(),
  music: z.object({
    src: z.string(),
    volume: z.number().min(0).max(1).default(0.12),
    /** The countdown has no voice, so the bed comes up to carry it. */
    countdownVolume: z.number().min(0).max(1).default(0.3),
    trimBefore: z.number().default(0),
  }),

  receipt: z.object({
    store: z.string(),
    title: z.string(),
    disclaimer: z.string(),
    items: z
      .array(z.object({ label: z.string().max(22), amount: z.number() }))
      .min(1)
      .max(5),
    total: z.number(),
    paid: z.number(),
    /** What was handed back — the error. */
    change: z.number(),
  }),

  /** On the voice take's own clock; the countdown sits at `pause.at`. */
  pause: z.object({
    at: z.number(),
    for: z.number().default(3),
    prompt: z.string().default("¿Ya lo viste?"),
  }),

  headlines: z.object({
    /** Over the receipt from frame 0 — the thumbnail. */
    ask: z.string(),
    reveal: z.string(),
    proof: z.string(),
    cta: z.string(),
    /** Swapped in once the voice is done: the share ask. */
    share: z.string(),
  }),

  /**
   * Seconds on the final timeline (after the countdown): the wrong line is
   * ringed, the right change shows on the display, the proof, the CTA, the
   * share ask and the end.
   */
  timing: z.object({
    ring: z.number(),
    correct: z.number(),
    proof: z.number(),
    cta: z.number(),
    share: z.number(),
    end: z.number(),
  }),

  /** The right change on the display after the reveal. */
  correctChange: z.number(),

  proof: ticketStorySchema.shape.proof.unwrap().omit({ cut: true }),
  cta: ticketStorySchema.shape.cta,
});

export type RetoTicketProps = z.infer<typeof retoTicketSchema>;
