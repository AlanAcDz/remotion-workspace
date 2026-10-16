import { z } from "zod";
import { chatStorySchema, type ChatStoryProps } from "../chat/schema";
import { MUSIC } from "../template/schema";

/**
 * "El Chat" 02 — "Jefe, estos ya vencieron" (PLV-20261016-chat-yogures). The
 * cashier sends a photo of expired yogurts; the owner records them as merma
 * before they are thrown out.
 *
 * Photo: `01-yogures-foto.jpg`, generated with Codex (generic, unbranded) and
 * cropped to 1024x1200. "Dan Up" is named only in the text and in the demo
 * store's screenshot.
 *
 * Screenshot: `02-historial-caducado.png`, `plv-20261009-ticket-merma/
 * 01-merma-caducado.mp4` at 17s (1170x2532) cropped to 1110x950 from
 * (30, 330): Dan Up fresa 350 g, Historial, Ajuste -3.000 · Caducado ringed.
 * The app records the adjustment and its reason; it does not track expiry
 * dates, so nothing here says it warns about them.
 */

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.3 },
  contact: { name: "Lalo (caja)", initials: "L" },
  clock: "8:12",

  messages: [
    {
      from: "me",
      at: 0,
      time: "7:58 a. m.",
      text: "¿Ya abriste?",
    },
    {
      from: "them",
      at: 0,
      time: "8:01 a. m.",
      text: "Sí jefe, ya está abierto 👍",
    },
    {
      from: "them",
      at: 0,
      time: "8:12 a. m.",
      image: {
        src: "videos/punto-listo/plv-20261016-chat-yogures/01-yogures-foto.jpg",
        width: 1024,
        height: 1200,
      },
    },
    {
      from: "them",
      at: 0,
      time: "8:12 a. m.",
      text: "Jefe, estos ya vencieron 😬",
    },
    {
      from: "them",
      at: 1.6,
      typing: 0.9,
      time: "8:12 a. m.",
      text: "3 Dan Up de fresa\n¿Los tiro?",
    },
    {
      from: "me",
      at: 3.4,
      typing: 1.0,
      time: "8:13 a. m.",
      text: "Sí, pero apártalos tantito",
    },
    {
      from: "me",
      at: 5.0,
      typing: 1.1,
      time: "8:13 a. m.",
      text: "Primero los registro como merma",
    },
    {
      from: "me",
      at: 6.4,
      time: "8:14 a. m.",
      image: {
        src: "videos/punto-listo/plv-20261016-chat-yogures/02-historial-caducado.png",
        width: 1110,
        height: 950,
        ring: { left: 20, top: 650, width: 1070, height: 294, at: 0.7 },
      },
    },
    {
      from: "me",
      at: 8.6,
      typing: 1.1,
      time: "8:14 a. m.",
      text: "Listo: -3, motivo Caducado ✅",
    },
    {
      from: "them",
      at: 10.0,
      typing: 0.8,
      time: "8:14 a. m.",
      text: "¿Y eso pa' qué, jefe?",
    },
    {
      from: "me",
      at: 11.9,
      typing: 1.3,
      time: "8:15 a. m.",
      text: "Pa' que quede anotado\ny no nomás se pierda 😉",
    },
  ],

  cta: {
    from: 13.8,
    takeaway: "Registra la merma\ncon su motivo.",
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [],
    revealAt: { line2: 14.3, note: 14.8, pill: 15.2 },
  },
  end: 17.4,
} satisfies z.input<typeof chatStorySchema>;

export const chatYoguresProps: ChatStoryProps = chatStorySchema.parse(input);
