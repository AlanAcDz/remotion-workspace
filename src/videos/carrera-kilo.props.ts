import { z } from "zod";
import { carreraStorySchema, type CarreraStoryProps } from "../carrera/schema";
import { MUSIC, SFX } from "../template/schema";
import { TICKET_SFX } from "../ticket/schema";

/**
 * La Carrera #1 — libreta vs. Punto Listo (PLV-20261106-carrera-kilo). The
 * first episode of the format: 350 g at $38 a kilo, by hand and in the app.
 *
 * App: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532), one
 * continuous stretch at 1×: the search takes focus at 3.5s, "jitomate" is typed
 * by 5.5s, the line is added at 6.0s (the ~3s pause that follows stays in),
 * the quantity is retyped from 8.9s and the line lands on $13.30 at 10.4s.
 * With trimBefore 3.4 that is 7.0s into the video. `01-total-1330.png` is the
 * take at 10.9s, held once the result has landed.
 *
 * Paper: staged, and labelled so. 38 × 0.35 worked in columns: 190, 114, $13.30.
 *
 * Say "ya tiene el total", never "ya cobró": the sale is not charged yet here.
 *
 * Voice: `-edit` is assembled from two Pablo takes, cut in their own silences
 * (Alan preferred the test take's energy). From the test take: "¡Arrancan!",
 * "¡La libreta… se la lleva!", "¡Trece treinta!" and "¡Gooool de Punto Listo!".
 * From `plv-20261106-carrera-kilo.mp3`: "¿Quién saca la cuenta primero?" and
 * "¡Y Punto Listo ya tiene el total!", because the test take says "ya cobró".
 * "La libreta" 2.31, "Punto Listo" 5.78, "total" 6.73, "Trece" 7.25, "Gooool"
 * 8.11, end 9.15.
 */

const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";

const APP_FINISH = 7.0;
const PAPER_FINISH = 9.8;
const END = 11.2;

const input = {
  audioFile: "audio/plv-20261106-carrera-kilo-edit.mp3",
  music: MUSIC.nastelbom,

  title: "¿Quién saca la cuenta primero?",

  paper: {
    photo: PHOTO,
    offsetY: 240,
    lines: [
      { type: "hand", text: "38 × 0.35", x: 330, y: 228, size: 96, from: 0 },
      { type: "hand", text: "190", x: 470, y: 322, size: 84, from: 1.2, write: 1 },
      { type: "hand", text: "114", x: 420, y: 396, size: 84, from: 3.4, write: 1 },
      { type: "hand", text: "———", x: 340, y: 452, size: 84, from: 5.6, write: 0.4 },
      {
        type: "hand",
        text: "$13.30",
        x: 370,
        y: 510,
        size: 96,
        color: "#D7261E",
        from: 7.6,
        write: PAPER_FINISH - 7.6,
      },
    ],
  },

  app: {
    clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
    source: { width: 1170, height: 2532 },
    trimBefore: 3.4,
    width: 1170,
    height: 780,
    // The search and its results, then the cart once the line is added.
    from: { top: 430 },
    to: { top: 1150 },
    panAt: 2.6,
    // At 11.0s the recording is about to move on to the next product.
    holdStill: "videos/punto-listo/plv-20261106-carrera-kilo/01-total-1330.png",
    holdAt: APP_FINISH + 0.4,
    // The whole jitomate line: name, $/kg, quantity and amount.
    ring: { left: 44, top: 1345, width: 1082, height: 505 },
  },

  finish: { paper: PAPER_FINISH, app: APP_FINISH },
  labels: { paper: "LIBRETA", app: "PUNTO LISTO" },
  disclaimer: "*Dramatización · app a velocidad real",

  pill: { text: "Prueba gratis 14 días · link en la bio", from: 9.9 },

  sfx: [
    // Keys under the search and the quantity, as the recording types them.
    ...[0.3, 0.6, 0.9, 1.2, 1.5, 1.8].map((at) => ({
      sound: TICKET_SFX.tick,
      at,
      volume: 0.2,
    })),
    ...[5.6, 5.9, 6.2, 6.5].map((at) => ({
      sound: TICKET_SFX.tick,
      at,
      volume: 0.2,
    })),
    { sound: SFX.ding, at: APP_FINISH, volume: 0.5 },
    { sound: SFX.softHit, at: PAPER_FINISH, volume: 0.3 },
  ],

  captions: { from: 0, until: 9.4 },
  end: END,
} satisfies z.input<typeof carreraStorySchema>;

export const carreraKiloProps: CarreraStoryProps =
  carreraStorySchema.parse(input);
