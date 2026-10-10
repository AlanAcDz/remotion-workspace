import { z } from "zod";
import { MUSIC, SFX } from "../template/schema";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";

/**
 * Reto del mostrador #4 — ¿Cuánto das de cambio? A, B o C
 * (PLV-20261009-reto-cambio-opciones). Reto #1's structure with the answer as
 * three lettered options: #1–#3 asked for a typed amount and got no comments.
 *
 * Clip: `plv-20260903-cobro-rapido/01-cobro-rapido.mp4` (1170x2532).
 *   14.1   ticket sheet: Total $38.00, Cambio "Ingresa efectivo" (the still)
 *   14.6   "1" typed — "El efectivo recibido no cubre el total" for 0.4s
 *   15.0   100 → Cambio $62.00
 *
 * Voice: `-edit` is the ElevenLabs take with every pause cut to 0.35s
 * (original kept beside it). The countdown is cut in at 6.57s, inside the
 * 6.39–6.75s silence between "¿cambio?" and "Sesenta".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Payment buttons down to the Cambio row. */
const SHEET = { left: 0, top: 1230, width: 1170, height: 960 } as const;

const frame = {
  x: SHEET.left / SOURCE.width,
  y: SHEET.top / SOURCE.height,
  width: SHEET.width / SOURCE.width,
  height: SHEET.height / SOURCE.height,
};

/** The Cambio row, in source pixels. */
const CAMBIO = { left: 60, top: 2050, width: 1050, height: 110 };

const PAUSE = 1.5;

const input = {
  audioFile: "audio/plv-20261009-reto-cambio-opciones-edit.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #4",
  question: {
    facts: ["Total: $38", "Te pagan con: $100"],
    ask: "¿Cuánto das de cambio?",
    options: ["$52", "$62", "$72"],
  },
  pause: { at: 6.57, for: PAUSE, prompt: "Comenta A, B o C" },
  card: {
    clip: "videos/punto-listo/plv-20260903-cobro-rapido/01-cobro-rapido.mp4",
    source: SOURCE,
    frame,
    still: "videos/punto-listo/reto/04-cambio-pregunta.png",
    answerStill: "videos/punto-listo/reto/04-cambio-respuesta.png",
    trimBefore: 14.4,
  },
  answer: {
    at: 0.6,
    text: "Cambio: $62 · B",
    subline: "Punto Listo lo calcula solo.",
    correct: 1,
    ring: toCard({ frame, source: SOURCE }, CAMBIO),
  },
  // Every time below is the voice's time plus the 1.5s countdown.
  follow: { text: "Sigue la cuenta para el próximo reto", at: 12.83 + PAUSE },
  cta: {
    from: 14.95 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 16.06 + PAUSE, note: 17.1 + PAUSE, pill: 17.45 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoCambioOpcionesProps: RetoProps = retoSchema.parse(input);
