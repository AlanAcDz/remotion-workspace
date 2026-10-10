import { z } from "zod";
import { posDemoSchema, rectSchema } from "../template/schema";

/** A rectangle in card pixels — where a mask or the answer ring sits. */
const cardRectSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
});

export const retoSchema = z.object({
  /** One ElevenLabs take; the countdown is cut into it at `pause.at`. */
  audioFile: z.string(),
  music: z.object({
    src: z.string(),
    /** Under the voice, same level as PosDemo's bed. */
    volume: z.number().min(0).max(1).default(0.07),
    /** The countdown has no voice, so the bed comes up to carry it. */
    countdownVolume: z.number().min(0).max(1).default(0.22),
    trimBefore: z.number().default(0),
  }),

  episode: z.string(), // "RETO DEL MOSTRADOR #1"
  question: z.object({
    facts: z.array(z.string()).min(1).max(3),
    ask: z.string(),
    /**
     * Multiple choice: lettered A, B, C… under the card, so the comment the
     * countdown asks for is one letter instead of a typed amount.
     */
    options: z.array(z.string()).min(2).max(3).optional(),
  }),

  /**
   * Seconds into the voice take where the question has been asked and the
   * answer not yet said. The voice stops there for `for` seconds — three
   * beats of nastelbom — while the countdown runs.
   */
  pause: z.object({
    at: z.number(),
    for: z.number().default(1.5),
    prompt: z.string().default("¡Comenta tu respuesta!"),
  }),

  card: z.object({
    clip: z.string(),
    source: z.object({ width: z.number(), height: z.number() }),
    frame: rectSchema,
    /** A frame of the clip shown while the question is asked. */
    still: z.string(),
    /** Card-pixel boxes covering numbers in the still that would give it away. */
    masks: z.array(cardRectSchema).default([]),
    /** Seconds into the clip where the reveal starts playing. */
    trimBefore: z.number(),
    /**
     * A frame of the answered state. The recording moves on to other screens
     * soon after the answer lands, so the card holds on this from `holdAt`.
     */
    answerStill: z.string(),
    holdAt: z.number().default(2.5), // seconds into the reveal
  }),

  answer: z.object({
    /** Seconds after the reveal starts that the value lands in the UI. */
    at: z.number(),
    text: z.string(), // "Cambio: $92.70"
    subline: z.string(),
    /** Index into `question.options` of the right one, marked at `at`. */
    correct: z.number().int().min(0).optional(),
    ring: cardRectSchema,
  }),

  /**
   * Replaces the subline before the CTA, when the voice asks for the follow:
   * "Sigue la cuenta para el próximo reto". `at` is on the final timeline.
   */
  follow: z.object({ text: z.string(), at: z.number() }).optional(),

  /** Same end card as PosDemo; every time here is on the final timeline. */
  cta: posDemoSchema.shape.cta,
});

export type RetoProps = z.infer<typeof retoSchema>;

const CARD_WIDTH = 940;
const MAX_CARD_HEIGHT = 1000;

/** The card takes the crop's aspect, capped so it clears the platform UI. */
type CardGeometry = Pick<RetoProps["card"], "frame" | "source">;

export function cardSize(card: CardGeometry): {
  width: number;
  height: number;
} {
  const aspect =
    (card.frame.width * card.source.width) /
    (card.frame.height * card.source.height);
  const height = Math.round(CARD_WIDTH / aspect);

  if (height <= MAX_CARD_HEIGHT) {
    return { width: CARD_WIDTH, height };
  }

  return {
    width: Math.round(MAX_CARD_HEIGHT * aspect),
    height: MAX_CARD_HEIGHT,
  };
}

/** Source pixels → card pixels, for measuring masks and rings off a still. */
export function toCard(
  card: CardGeometry,
  rect: { left: number; top: number; width: number; height: number },
) {
  const { width } = cardSize(card);
  const scale = width / (card.frame.width * card.source.width);
  const originX = card.frame.x * card.source.width;
  const originY = card.frame.y * card.source.height;

  return {
    left: Math.round((rect.left - originX) * scale),
    top: Math.round((rect.top - originY) * scale),
    width: Math.round(rect.width * scale),
    height: Math.round(rect.height * scale),
  };
}
