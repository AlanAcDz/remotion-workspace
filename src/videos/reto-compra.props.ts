import { z } from "zod";
import { MUSIC, SFX } from "../template/schema";
import { retoSchema, toCard, type RetoProps } from "../reto/schema";

/**
 * Reto del mostrador #3 — ¿De cuánto es la compra? (PLV-20261001-reto-compra).
 * 24 Bonafont 1 L a $10.20 = $244.80, from the supplier-purchase take.
 *
 * Clip: `plv-20260907-compras-proveedor/01-compras-proveedor.mp4` (1170x2532).
 *   21.6   Cantidad 24 with the old cost 9.88 and Importe $237.12 (the still;
 *          cost, importe and total are masked so the old numbers never show)
 *   22.2   Costo unitario retyped: 1 → Importe $24.00 (the reveal starts here,
 *          so the old 9.88 is never seen unmasked)
 *   22.5   10.2 → Importe $244.80, Total $244.80
 *
 * Voice: one take; the countdown is cut in at 6.9s, inside the 6.63–7.17s
 * silence between "¿De cuánto es la compra?" and "Doscientos".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Cantidad down to the purchase total, inside the sheet. */
const SHEET = { left: 0, top: 1100, width: 870, height: 930 } as const;

const frame = {
  x: SHEET.left / SOURCE.width,
  y: SHEET.top / SOURCE.height,
  width: SHEET.width / SOURCE.width,
  height: SHEET.height / SOURCE.height,
};

const card = { frame, source: SOURCE };

/** Source-pixel boxes over the stale cost, importe and total. */
const COSTO = { left: 88, top: 1396, width: 698, height: 104 };
const IMPORTE = { left: 66, top: 1630, width: 400, height: 76 };
const TOTAL = { left: 30, top: 1922, width: 320, height: 70 };

/** "Importe: $244.80", ringed once it lands. */
const IMPORTE_RING = { left: 66, top: 1626, width: 520, height: 86 };

const PAUSE = 1.5;

const input = {
  audioFile: "audio/plv-20261001-reto-compra.mp3",
  music: { ...MUSIC.nastelbom, volume: 0.07, countdownVolume: 0.22 },
  episode: "RETO DEL MOSTRADOR #3",
  question: {
    facts: ["Llegan 24 aguas de 1 L", "a $10.20 cada una"],
    ask: "¿De cuánto es la compra?",
  },
  pause: { at: 6.9, for: PAUSE },
  card: {
    clip: "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4",
    source: SOURCE,
    frame,
    still: "videos/punto-listo/reto/03-compra-pregunta.png",
    answerStill: "videos/punto-listo/reto/03-compra-respuesta.png",
    masks: [COSTO, IMPORTE, TOTAL].map((rect) => toCard(card, rect)),
    trimBefore: 22.2,
  },
  answer: {
    at: 0.35,
    text: "Compra: $244.80",
    subline: "Y las 24 piezas entran al inventario.",
    ring: toCard(card, IMPORTE_RING),
  },
  cta: {
    from: 15.19 + PAUSE,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 16.25 + PAUSE, note: 17.55 + PAUSE, pill: 18.0 + PAUSE },
  },
} satisfies z.input<typeof retoSchema>;

export const retoCompraProps: RetoProps = retoSchema.parse(input);
