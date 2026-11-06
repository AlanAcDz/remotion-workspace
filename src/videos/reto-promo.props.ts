import { z } from "zod";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Reto del mostrador #9 — la promo que te hace perder (PLV-20261106-reto-
 * promo). Airs the day before the Buen Fin. Against #6–#8: money at stake, the
 * real product screen on frame 0, two options and a 1.5s countdown.
 *
 * Screen: `plv-20260907-compras-proveedor/01-compras-proveedor.mp4` (1170x2532)
 * at 34–35.5s, Editar producto, Bonafont 1 L: Precio venta 13.00, Costo 10.20.
 * The crop stops above "Opcional; sirve para ver márgenes": the app has no
 * margin view, so that line must not be on screen.
 *
 * The math is an example, labelled on screen. A, 10% off: 2 × $11.70 = $23.40,
 * less $20.40 = +$3.00. B, second at half price: $13.00 + $6.50 = $19.50, less
 * $20.40 = −$0.90. Never say the app builds promos or works out margins:
 * discounts apply to a whole sale, not to a product.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it). The countdown sits in the silence after
 * "¿A o B?" (3.02–3.36). On the take's clock: "La B" 3.38, "Vendes" 4.09, "te
 * costaron" 6.65, "En Punto Listo" 8.30, "Pruébalo" 11.58, "14" 12.48, "sin
 * tarjeta" 13.52, end 14.3.
 *
 * The working builds with the voice, so the screen never sits still: the ring
 * goes to Precio on "Vendes", to Costo on "te costaron", and "Pierdes $0.90"
 * lands as the sentence ends. It closes on the A's +$3.00 at "ves tu costo".
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const STILL = "videos/punto-listo/plv-20261106-reto-promo/01-precio-costo.png";

/** Precio venta and Costo, above the helper line. */
const FIELDS = { left: 30, top: 1780, width: 820, height: 432 } as const;

const frame = {
  x: FIELDS.left / SOURCE.width,
  y: FIELDS.top / SOURCE.height,
  width: FIELDS.width / SOURCE.width,
  height: FIELDS.height / SOURCE.height,
};

const PAUSE = 1.5;

/** Card-pixel boxes around each field, for the ring to move between. */
const toFields = (rect: { left: number; top: number; width: number; height: number }) =>
  toCard({ frame, source: SOURCE }, rect);
const BOTH = toFields({ left: 40, top: 1790, width: 800, height: 412 });
const PRICE = toFields({ left: 40, top: 1795, width: 800, height: 195 });
const COST = toFields({ left: 40, top: 2005, width: 800, height: 195 });

const input = {
  audioFile: "audio/plv-20261106-reto-promo-edit.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #9",
  question: {
    facts: ["Bonafont 1 L"],
    ask: "¿Con cuál pierdes?",
    options: ["10% de descuento", "2ª a mitad de precio"],
  },
  pause: { at: 3.2, for: PAUSE, prompt: "Comenta A o B" },
  card: {
    clip: "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4",
    source: SOURCE,
    frame,
    still: STILL,
    answerStill: STILL,
    trimBefore: 34.2,
    holdAt: 0.5,
  },
  answer: {
    at: 0.2,
    text: "¡La B!",
    subline: "",
    // Each row lands with its words: voice time plus the countdown.
    steps: [
      { at: 4.09 + PAUSE, text: "Vendes 2: $13.00 + $6.50 = $19.50" },
      { at: 6.65 + PAUSE, text: "Te costaron: 2 × $10.20 = $20.40" },
      { at: 7.95 + PAUSE, text: "Pierdes $0.90", tone: "big" },
      { at: 9.35 + PAUSE, text: "Con la A ganas $3.00" },
      { at: 9.35 + PAUSE, text: "*Cifras de ejemplo", tone: "note" },
    ],
    ringMoves: [
      { ...PRICE, at: 4.09 + PAUSE },
      { ...COST, at: 6.65 + PAUSE },
      { ...BOTH, at: 9.35 + PAUSE },
    ],
    correct: 1,
    ring: BOTH,
  },
  cta: {
    from: 11.55 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 12.48 + PAUSE, note: 13.52 + PAUSE, pill: 13.9 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoPromoProps: RetoProps = retoSchema.parse(input);
