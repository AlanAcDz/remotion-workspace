import { z } from "zod";
import { posDemoSchema } from "../template/schema";

/** A box in the image's own pixels, ringed `at` seconds after the image lands. */
const imageRingSchema = z.object({
  left: z.number(),
  top: z.number(),
  width: z.number(),
  height: z.number(),
  at: z.number(),
});

const messageSchema = z
  .object({
    /** "them" is the cashier (left, white); "me" is the owner holding the phone. */
    from: z.enum(["them", "me"]),
    /** Seconds the bubble lands. 0 puts it on screen from frame 0 (the thumbnail). */
    at: z.number().min(0),
    /**
     * Seconds of typing before `at`: "escribiendo…" and a dots bubble for
     * "them", the text appearing in the input bar for "me".
     */
    typing: z.number().min(0).default(0),
    /** "9:47 p. m." — printed in the bubble's corner. */
    time: z.string(),
    text: z.string().optional(),
    image: z
      .object({
        src: z.string(),
        /** Pixel size of the file, so the bubble takes its aspect. */
        width: z.number(),
        height: z.number(),
        ring: imageRingSchema.optional(),
      })
      .optional(),
  })
  .refine((message) => message.text || message.image, {
    message: "A message needs text, an image or both",
  });

export const chatStorySchema = z.object({
  music: z.object({
    src: z.string(),
    /** No voice rides on top, so the bed carries the video (see TicketStory). */
    volume: z.number().min(0).max(1).default(0.3),
    trimBefore: z.number().default(0),
  }),

  /** The other side of the chat, as the owner's phone shows them. */
  contact: z.object({
    name: z.string(),
    initials: z.string().max(2),
    status: z.string().default("en línea"),
  }),
  /** The status bar's clock. */
  clock: z.string(),

  messages: z.array(messageSchema).min(1),

  /** PosDemo's end card, plus the one line the chat proved. Times are absolute. */
  cta: posDemoSchema.shape.cta.extend({
    takeaway: z.string(),
  }),
  /** Seconds — the video's length. */
  end: z.number(),
});

export type ChatStoryProps = z.infer<typeof chatStorySchema>;
export type ChatMessage = ChatStoryProps["messages"][number];
