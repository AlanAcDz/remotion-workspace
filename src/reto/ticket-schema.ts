import { z } from "zod";
import { ticketStorySchema } from "../ticket/schema";

const receiptLineSchema = z.object({
  label: z.string().max(22),
  amount: z.number(),
  isBold: z.boolean().default(false),
});

const displaySchema = z.object({ label: z.string(), value: z.string() });

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
    items: z.array(receiptLineSchema).min(1).max(5),
    /** Under the second rule: a sale ends TOTAL / EFECTIVO / CAMBIO. */
    summary: z.array(receiptLineSchema).min(1).max(4),
  }),

  /** The line the viewer hunts for: ringed and struck on the reveal. */
  wrongLine: z.object({
    section: z.enum(["items", "summary"]),
    index: z.number().int().min(0),
  }),

  /**
   * The printer's display: before the countdown, from the ring (what the
   * error cost) and from `timing.correct` (the right figure).
   */
  display: z.object({
    start: displaySchema,
    wrong: displaySchema,
    right: displaySchema,
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
   * ringed, the right figure shows on the display, the proof, the CTA, the
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

  proof: ticketStorySchema.shape.proof.unwrap(),
  cta: ticketStorySchema.shape.cta,
});

export type RetoTicketProps = z.infer<typeof retoTicketSchema>;
