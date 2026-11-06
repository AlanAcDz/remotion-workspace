import { z } from "zod";
import { chatStorySchema, type ChatStoryProps } from "../chat/schema";
import { MUSIC } from "../template/schema";

/**
 * "El Chat" 04 — "que si no hay Buen Fin" (PLV-20261106-chat-buen-fin). Airs on
 * the Buen Fin's first day. Against Chat #3: no small talk, a voice note moving
 * on frame 0, and about 12s instead of 22.8s. The CTA stays the same.
 *
 * Tone: a five-peso discount is normal, not a fraud. Never accuse the cashier.
 *
 * Photo: `01-mostrador-foto.jpg`, generated with Codex (generic, unbranded),
 * cut to 1024x1280 from the 1024x1536 original.
 *
 * Screenshots, from `plv-20260907-descuentos-por-cajero/01-caja-cajera.mp4`
 * (1170x2532), in Mariana's session:
 *  02-venta-descuento.png  14s, crop 1110x1110 from (30, 960): Descuento 5,
 *                          Subtotal $44.00, Descuento $5.00, Total $39.00
 *  03-folio-2169.png       25s, crop 1110x1440 from (30, 960): Folio 2169,
 *                          Mariana López, $39.00, Descuento $5.00
 *
 * Voice note: one take on the `punto-listo-chat` preset (3.6s, unedited).
 * `wordTimes` are the take's own, from its caption JSON.
 */

const DIR = "videos/punto-listo/plv-20261106-chat-buen-fin";

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.3 },
  contact: { name: "Mariana (caja)", initials: "M" },
  clock: "5:12",

  messages: [
    {
      from: "them",
      at: 0,
      time: "5:11 p. m.",
      image: { src: `${DIR}/01-mostrador-foto.jpg`, width: 1024, height: 1280 },
    },
    {
      from: "them",
      at: 0,
      time: "5:12 p. m.",
      voice: {
        src: "audio/plv-20261106-chat-buen-fin.mp3",
        duration: 3.6,
        transcript: "Jefe, la señora dice que\nsi no hay Buen Fin…\nle hice cinco pesos.",
        wordTimes: [
          0.05, 0.45, 0.59, 0.93, 1.16, 1.26, 1.39, 1.49, 1.61, 1.81, 2.33, 2.43,
          2.62, 2.96,
        ],
      },
    },
    {
      from: "them",
      at: 3.7,
      time: "5:12 p. m.",
      image: {
        src: `${DIR}/02-venta-descuento.png`,
        width: 1110,
        height: 1110,
        ring: { left: 30, top: 860, width: 1050, height: 215, at: 0.4 },
      },
    },
    {
      from: "me",
      at: 5.9,
      typing: 1.1,
      time: "5:13 p. m.",
      text: "Ándale, ahí queda\ncon tu nombre 😂",
    },
    {
      from: "me",
      at: 7.1,
      time: "5:13 p. m.",
      image: {
        src: `${DIR}/03-folio-2169.png`,
        width: 1110,
        height: 1440,
        ring: { left: 30, top: 1335, width: 1050, height: 90, at: 0.5 },
      },
    },
  ],

  cta: {
    from: 9.2,
    takeaway: "Cada descuento\nqueda registrado.",
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [],
    revealAt: { line2: 9.7, note: 10.2, pill: 10.6 },
  },
  end: 11.6,
} satisfies z.input<typeof chatStorySchema>;

export const chatBuenFinProps: ChatStoryProps = chatStorySchema.parse(input);
