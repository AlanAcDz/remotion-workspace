import { z } from "zod";
import { MUSIC, SFX } from "../template/schema";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";

/**
 * Reto del mostrador #2 — ¿Cuánto cobras? (PLV-20261001-reto-kilo).
 * 350 g de jitomate a $38/kg + 0.5 kg de queso Oaxaca a $148/kg = $87.30.
 *
 * Clip: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532).
 *   16.0   jitomate 0.35 kg = $13.30 in the sale, queso Oaxaca $148.00 found
 *          (the still)
 *   18.5   queso Oaxaca in the sale at 0.1 kg; the quantity is retyped
 *   19.0   0.5 → $74.00 and "2 productos $87.30"
 *
 * Voice: one take; the countdown is cut in at 9.95s, inside the 9.67–10.31s
 * silence between "¿Cuánto cobras?" and "Ochenta".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** From "1 producto / 2 productos" down to the queso line's quantity. */
const CART = { left: 0, top: 1160, width: 1170, height: 1170 } as const;

const frame = {
  x: CART.left / SOURCE.width,
  y: CART.top / SOURCE.height,
  width: CART.width / SOURCE.width,
  height: CART.height / SOURCE.height,
};

/** "2 productos · $87.30", in source pixels. */
const TOTAL = { left: 70, top: 1180, width: 560, height: 130 };

const PAUSE = 1.5;

const input = {
  audioFile: "audio/plv-20261001-reto-kilo.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #2",
  question: {
    facts: ["350 g de jitomate a $38/kg", "½ kg de queso a $148/kg"],
    ask: "¿Cuánto cobras?",
  },
  pause: { at: 9.95, for: PAUSE },
  card: {
    clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
    source: SOURCE,
    frame,
    still: "videos/punto-listo/reto/02-kilo-pregunta.png",
    answerStill: "videos/punto-listo/reto/02-kilo-respuesta.png",
    trimBefore: 18.5,
  },
  answer: {
    at: 0.5,
    text: "Total: $87.30",
    subline: "Punto Listo calcula cada kilo.",
    ring: toCard({ frame, source: SOURCE }, TOTAL),
  },
  cta: {
    from: 16.25 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 17.23 + PAUSE, note: 18.5 + PAUSE, pill: 18.95 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoKiloProps: RetoProps = retoSchema.parse(input);
