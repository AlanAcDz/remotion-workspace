import { z } from "zod";
import { chatStorySchema, type ChatStoryProps } from "../chat/schema";
import { MUSIC } from "../template/schema";

/**
 * "El Chat" 01 — "Jefe, faltan $399" (PLV-20261016-chat-faltante). The
 * cashier closes the drawer against everything sold, comes up $399 short and
 * panics; the owner's cash cut shows the $399.16 was paid by card, which
 * never enters the drawer's expected cash.
 *
 * The numbers are the demo store's: `mobile-v5/01-corte-de-caja.mp4` at 2s
 * (1170x2532) shows Inicial $1,218.50, Esperado $2,920.09, Efectivo
 * $1,701.59, Tarjeta $399.16, Transferencia $0.00. The cashier expected
 * $2,920.09 + $399.16 = $3,319.25 and counted $2,920.09.
 *
 * Screenshot: `01-corte-tarjeta.png`, that frame cropped to 1070x950 from
 * (50, 960) — Esperado down to the Tarjeta card, which is ringed.
 */

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.3 },
  contact: { name: "Lalo (caja)", initials: "L" },
  clock: "9:47",

  messages: [
    {
      from: "them",
      at: 0,
      time: "1:10 p. m.",
      text: "Buenas, jefe ☀️",
    },
    {
      from: "them",
      at: 0,
      time: "1:12 p. m.",
      text: "¿Le pido más garrafones\nal de la purificadora?",
    },
    {
      from: "me",
      at: 0,
      time: "1:15 p. m.",
      text: "Sí, pídele 10",
    },
    {
      from: "me",
      at: 0,
      time: "6:05 p. m.",
      text: "¿Cómo va la tarde?",
    },
    {
      from: "them",
      at: 0,
      time: "6:07 p. m.",
      text: "Tranquilo, jefe 👍\nYa vino el del pan",
    },
    {
      from: "them",
      at: 0,
      time: "9:47 p. m.",
      text: "Jefe… faltan $399 en la caja 😰",
    },
    {
      from: "them",
      at: 1.5,
      typing: 0.8,
      time: "9:47 p. m.",
      text: "Ya conté dos veces",
    },
    {
      from: "them",
      at: 2.9,
      typing: 0.8,
      time: "9:47 p. m.",
      text: "Le juro que no agarré nada 🙏",
    },
    {
      from: "me",
      at: 4.9,
      typing: 1.2,
      time: "9:48 p. m.",
      text: "Pérame, lo veo en el sistema",
    },
    {
      from: "me",
      at: 6.0,
      time: "9:48 p. m.",
      image: {
        src: "videos/punto-listo/plv-20261016-chat-faltante/01-corte-tarjeta.png",
        width: 1070,
        height: 950,
        ring: { left: 50, top: 614, width: 970, height: 326, at: 0.7 },
      },
    },
    {
      from: "me",
      at: 8.6,
      typing: 1.4,
      time: "9:48 p. m.",
      text: "No falta nada 😅\nEsos $399.16 fueron con tarjeta",
    },
    {
      from: "me",
      at: 10.0,
      typing: 0.9,
      time: "9:48 p. m.",
      text: "La tarjeta no entra al cajón",
    },
    {
      from: "them",
      at: 11.5,
      typing: 0.9,
      time: "9:49 p. m.",
      text: "Uff… me salvó, jefe 🙌",
    },
  ],

  cta: {
    from: 13.2,
    takeaway: "El corte separa efectivo,\ntarjeta y transferencia.",
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [],
    revealAt: { line2: 13.7, note: 14.2, pill: 14.6 },
  },
  end: 16.8,
} satisfies z.input<typeof chatStorySchema>;

export const chatFaltanteProps: ChatStoryProps = chatStorySchema.parse(input);
