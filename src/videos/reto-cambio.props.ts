import { z } from "zod";
import { MUSIC, SFX } from "../template/schema";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";

/**
 * Reto del mostrador #1 — ¿Cuánto das de cambio? (PLV-20261001-reto-cambio).
 * The 02b opening (a real number, answered on screen within a second) turned
 * into a quiz like 03b's, with a countdown that asks for a comment.
 *
 * Clip: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532).
 *   26.7   ticket dialog: Total $107.30, Cambio "Ingresa efectivo" (the still)
 *   27.1   efectivo recibido starts being retyped
 *   27.5   200 → Cambio $92.70
 *
 * Voice: one take; the countdown is cut in at 7.0s, inside the 6.73–7.22s
 * silence between "¿Cuánto das de cambio?" and "Noventa".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Payment buttons down to "Venta lista para cobrar". */
const DIALOG = { left: 0, top: 1220, width: 1170, height: 1070 } as const;

const frame = {
  x: DIALOG.left / SOURCE.width,
  y: DIALOG.top / SOURCE.height,
  width: DIALOG.width / SOURCE.width,
  height: DIALOG.height / SOURCE.height,
};

/** The Cambio row, in source pixels. */
const CAMBIO = { left: 60, top: 2050, width: 1050, height: 115 };

const PAUSE = 1.5;

const input = {
  audioFile: "audio/plv-20261001-reto-cambio.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #1",
  question: {
    facts: ["Total: $107.30", "Te pagan con: $200"],
    ask: "¿Cuánto das de cambio?",
  },
  pause: { at: 7.0, for: PAUSE },
  card: {
    clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
    source: SOURCE,
    frame,
    still: "videos/punto-listo/reto/01-cambio-pregunta.png",
    answerStill: "videos/punto-listo/reto/01-cambio-respuesta.png",
    trimBefore: 27.1,
  },
  answer: {
    at: 0.4,
    text: "Cambio: $92.70",
    subline: "Punto Listo lo calcula solo.",
    ring: toCard({ frame, source: SOURCE }, CAMBIO),
  },
  // Every time below is the voice's time plus the 1.5s countdown.
  cta: {
    from: 15.05 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 16.02 + PAUSE, note: 17.25 + PAUSE, pill: 17.7 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoCambioProps: RetoProps = retoSchema.parse(input);
