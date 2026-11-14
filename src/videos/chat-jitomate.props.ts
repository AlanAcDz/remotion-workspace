import { z } from "zod";
import { chatStorySchema, type ChatStoryProps } from "../chat/schema";
import { MUSIC } from "../template/schema";

/**
 * "El Chat" 05 — "Jefe, ¿a cómo el jitomate?" (PLV-20261113-chat-jitomate).
 * The line is waiting and the cashier doesn't know the price per kilo; the
 * owner tells her to look it up in Punto Listo and type 0.35, and the total
 * comes out on its own. Chat #3's structure (photo on frame 0), cut to ~15s.
 *
 * The sale is not charged yet in the screenshot, so she says "Ya salió",
 * never "ya cobré".
 *
 * Photo: `01-jitomate-foto.jpg`, generated with Codex (generic, unbranded),
 * cut to 1024x1280 from (0, 170) of the 1024x1536 original.
 *
 * Screenshot: `02-jitomate-1330.png`, `plv-20260903-venta-por-kilo/01-venta-
 * por-kilo.mp4` at 11.5s (1170x2532, identical to libreta-loop's
 * `01-jitomate-1330.png`), crop 1090x700 from (40, 1170): 1 producto $13.30 ·
 * Jitomate saladet $38.00 / kg · 0.35 · $13.30. The ring sits on the sale
 * total ($13.30 under "1 producto").
 *
 * Pacing: no voice, so each bubble is held about 13 characters per second
 * per line before the next one pushes it up.
 */

const DIR = "videos/punto-listo/plv-20261113-chat-jitomate";

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.3 },
  contact: { name: "Mariana (caja)", initials: "M" },
  clock: "12:48",

  messages: [
    // Unscripted filler: without it frame 0 opens on empty wallpaper.
    {
      from: "me",
      at: 0,
      time: "11:52 a. m.",
      text: "¿Cómo va todo por allá?",
    },
    {
      from: "them",
      at: 0,
      time: "12:47 p. m.",
      image: { src: `${DIR}/01-jitomate-foto.jpg`, width: 1024, height: 1280 },
    },
    {
      from: "them",
      at: 0,
      time: "12:47 p. m.",
      text: "Jefe, ¿a cómo el jitomate?\nYa hay fila 😬",
    },
    {
      from: "me",
      at: 3.0,
      typing: 0.8,
      time: "12:48 p. m.",
      text: "A 38 el kilo",
    },
    {
      from: "them",
      at: 4.9,
      typing: 0.9,
      time: "12:48 p. m.",
      text: "¿Y 350 gramos cuánto es? 😅",
    },
    {
      from: "me",
      at: 7.1,
      typing: 1.1,
      time: "12:48 p. m.",
      text: "Búscalo en Punto Listo\ny pon 0.35",
    },
    {
      from: "them",
      at: 9.4,
      typing: 0.8,
      time: "12:49 p. m.",
      image: {
        src: `${DIR}/02-jitomate-1330.png`,
        width: 1090,
        height: 700,
        ring: { left: 30, top: 50, width: 290, height: 96, at: 0.6 },
      },
    },
    {
      from: "them",
      at: 11.8,
      typing: 0.8,
      time: "12:49 p. m.",
      text: "Ya salió: $13.30 🙌",
    },
    {
      from: "me",
      at: 13.5,
      typing: 1.0,
      time: "12:49 p. m.",
      text: "Así ya no me preguntas 😂",
    },
  ],

  cta: {
    from: 15.7,
    takeaway: "El precio por kilo\nya está en la caja.",
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [],
    revealAt: { line2: 16.2, note: 16.7, pill: 17.1 },
  },
  end: 19.3,
} satisfies z.input<typeof chatStorySchema>;

export const chatJitomateProps: ChatStoryProps = chatStorySchema.parse(input);
