import { z } from "zod";
import { chatStorySchema, type ChatStoryProps } from "../chat/schema";
import { MUSIC } from "../template/schema";

/**
 * "El Chat" 03 — "Jefe, el señor quiere su dinero" (PLV-20261030-chat-
 * devolucion). A customer brings back two waters; the cashier hits Devolver
 * and Punto Listo asks for the owner's credentials, so the owner comes down
 * to authorise it. The return gets its own folio and shows up in her cut.
 *
 * The override is typed on the cashier's own screen (ADR 0004), so the owner
 * says "ahorita bajo", never "te autorizo desde aquí".
 *
 * Photo: `01-agua-foto.jpg`, generated with Codex (generic, unbranded), cut
 * to 1024x1280 from the 1024x1536 original.
 *
 * Screenshots, all from `plv-20260907-devoluciones-autorizadas/
 * 01-devoluciones-autorizadas.mp4` (1170x2532), in Mariana's session:
 *  02-autorizacion.png  15.5s, crop 1090x1310 from (40, 610): Devolver venta
 *                       completa with empty Correo / Contraseña del administrador
 *  03-devuelta.png      29s, crop 1090x1000 from (40, 930): Folio 2082 ·
 *                       Devuelta · $26.00 · Bonafont 1 L 2.000 × $13.00
 *  04-corte.png         45s, crop 1090x380 from (40, 1180): Efectivo
 *                       $1,475.96 · Devoluciones: $26.00
 * "Reverso creado con folio 2109" is the take's toast at 21–24.5s.
 */

const DIR = "videos/punto-listo/plv-20261030-chat-devolucion";

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.3 },
  contact: { name: "Mariana (caja)", initials: "M" },
  clock: "10:41",

  messages: [
    {
      from: "me",
      at: 0,
      time: "10:02 a. m.",
      text: "¿Cómo va la mañana?",
    },
    {
      from: "them",
      at: 0,
      time: "10:05 a. m.",
      text: "Tranquila jefe 👍",
    },
    {
      from: "them",
      at: 0,
      time: "10:41 a. m.",
      image: { src: `${DIR}/01-agua-foto.jpg`, width: 1024, height: 1280 },
    },
    {
      from: "them",
      at: 0,
      time: "10:41 a. m.",
      text: "Jefe, el señor quiere\nsu dinero 😬",
    },
    {
      from: "them",
      at: 1.5,
      typing: 0.9,
      time: "10:41 a. m.",
      text: "Dice que el agua venía abierta\nFolio 2082, $26",
    },
    {
      from: "them",
      at: 3.5,
      typing: 1.0,
      time: "10:42 a. m.",
      text: "Le di Devolver y me pide\ntu autorización 🔒",
    },
    {
      from: "them",
      at: 4.6,
      time: "10:42 a. m.",
      image: {
        src: `${DIR}/02-autorizacion.png`,
        width: 1090,
        height: 1310,
        ring: { left: 60, top: 480, width: 970, height: 430, at: 0.7 },
      },
    },
    {
      from: "me",
      at: 7.3,
      typing: 1.1,
      time: "10:42 a. m.",
      text: "Sí, así está puesto 😉",
    },
    {
      from: "me",
      at: 8.9,
      typing: 1.0,
      time: "10:42 a. m.",
      text: "Ahorita bajo y la autorizo",
    },
    {
      from: "me",
      at: 10.8,
      time: "10:45 a. m.",
      image: {
        src: `${DIR}/03-devuelta.png`,
        width: 1090,
        height: 1000,
        ring: { left: 30, top: 430, width: 420, height: 210, at: 0.6 },
      },
    },
    {
      from: "me",
      at: 12.5,
      typing: 1.1,
      time: "10:45 a. m.",
      text: "Ya quedó: con su propio\nfolio y ligada a la venta ✅",
    },
    {
      from: "them",
      at: 14.4,
      typing: 0.8,
      time: "10:46 a. m.",
      text: "¿Y los $26 que le di?",
    },
    {
      from: "me",
      at: 15.8,
      time: "10:46 a. m.",
      image: {
        src: `${DIR}/04-corte.png`,
        width: 1090,
        height: 380,
        ring: { left: 80, top: 245, width: 480, height: 85, at: 0.5 },
      },
    },
    {
      from: "me",
      at: 17.3,
      typing: 1.0,
      time: "10:46 a. m.",
      text: "Salen en tu corte 👌",
    },
  ],

  cta: {
    from: 19.2,
    takeaway: "Las devoluciones\npiden autorización.",
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [],
    revealAt: { line2: 19.7, note: 20.2, pill: 20.6 },
  },
  end: 22.8,
} satisfies z.input<typeof chatStorySchema>;

export const chatDevolucionProps: ChatStoryProps =
  chatStorySchema.parse(input);
