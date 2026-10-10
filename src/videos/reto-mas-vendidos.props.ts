import { z } from "zod";
import { MUSIC, SFX } from "../template/schema";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";

/**
 * Reto del mostrador #5 — ¿Cuánto vendiste de Red Cola? A, B o C
 * (PLV-20261009-reto-mas-vendidos). The second lettered Reto, over the
 * Productos más vendidos table: 55 × $36 = $1,980.
 *
 * Clip: `plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4`
 * (1170x2532). The table settles at 10.5s and holds still to the end, so the
 * still, the reveal and the answer still are the same frame (14s): the reveal
 * is the mask coming off. The crop starts at Fritos, below the two cigarette
 * rows that top the table.
 *
 * Voice: `-edit` take, pauses cut to 0.35s. The countdown is cut in at 7.86s,
 * inside the 7.69–8.04s silence between "¿total?" and "Mil".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Fritos down to Mantecadas, inside the table's card. */
const ROWS = { left: 30, top: 740, width: 1110, height: 930 } as const;

const frame = {
  x: ROWS.left / SOURCE.width,
  y: ROWS.top / SOURCE.height,
  width: ROWS.width / SOURCE.width,
  height: ROWS.height / SOURCE.height,
};

const geometry = { frame, source: SOURCE };

/** Red Cola 3 L's Importe cell, and its whole row. */
const IMPORTE = { left: 830, top: 1350, width: 270, height: 104 };
const RED_COLA = { left: 50, top: 1340, width: 1070, height: 125 };

const PAUSE = 1.5;
const STILL = "videos/punto-listo/reto/05-mas-vendidos.png";

const input = {
  audioFile: "audio/plv-20261009-reto-mas-vendidos-edit.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #5",
  question: {
    facts: ["55 Red Cola de 3 L", "a $36 cada una"],
    ask: "¿Cuánto vendiste?",
    options: ["$1,890", "$2,080", "$1,980"],
  },
  pause: { at: 7.86, for: PAUSE, prompt: "Comenta A, B o C" },
  card: {
    clip: "videos/punto-listo/plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4",
    source: SOURCE,
    frame,
    still: STILL,
    masks: [toCard(geometry, IMPORTE)],
    answerStill: STILL,
    trimBefore: 11.0,
  },
  answer: {
    at: 0.3,
    text: "Total: $1,980 · C",
    subline: "Punto Listo te dice qué se vende más.",
    correct: 2,
    ring: toCard(geometry, RED_COLA),
  },
  // Every time below is the voice's time plus the 1.5s countdown.
  follow: { text: "Sigue la cuenta para el próximo reto", at: 15.97 + PAUSE },
  cta: {
    from: 18.05 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 19.33 + PAUSE, note: 20.48 + PAUSE, pill: 20.8 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoMasVendidosProps: RetoProps = retoSchema.parse(input);
