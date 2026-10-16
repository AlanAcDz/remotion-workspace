import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 05 — El precio que no subiste (PLV-20261016-ticket-precio).
 * The control of the week of Oct 19: episode 13's structure, where the total
 * builds from zero (it beat 18's "total first").
 *
 * The math is an example, labelled on the receipt: each line is what a cost
 * rise eats per day when the shelf price stays put — $30.00 + $12.00 +
 * $10.00 + $5.00 = $57.00 a day; × 30 = $1,710.00; × 12 = $20,520.00.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 6% (original kept beside it): "Coca" 1.40, "garrafón" 6.01,
 * "cincuenta y siete" 8.91, "Por treinta" 12.06, "Por doce" 14.86, "veinte
 * mil" 16.18, "Con" 18.46, "actualizas" 20.97, "y lo ves" 22.49, "precio de
 * venta" 23.60, "Pruébalo" 24.62, "tarjeta" 27.21.
 *
 * Proof: `plv-20260907-compras-proveedor/01-compras-proveedor.mp4`
 * (1170x2532), the same take as 07 and 20:
 *  22.25–22.75  Costo unitario retyped 9.88 → 10.20
 *  25.0         Actualizar costo checked
 *  34.0–35.5    Editar producto: Precio venta 13.00, Costo 10.20
 * The app never suggests a price; it keeps the new cost next to the price.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

interface SourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Cantidad, Costo unitario, Actualizar costo and Importe on the purchase. */
const PURCHASE_CROP = { left: 30, top: 1100, width: 800, height: 600 } as const;

/** Precio venta and Costo on the product sheet. Same size as PURCHASE_CROP. */
const PRODUCT_CROP = { left: 30, top: 1770, width: 800, height: 600 } as const;

/** The 10.20 field and its Actualizar costo checkbox. */
const COST_FIELD = { left: 75, top: 1385, width: 720, height: 230 } as const;

/** Precio venta down to the Costo field. */
const PRICE_AND_COST = { left: 50, top: 1795, width: 735, height: 410 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / PURCHASE_CROP.width;

const frameOf = (crop: SourceRect) => ({
  x: crop.left / SOURCE.width,
  y: crop.top / SOURCE.height,
  width: crop.width / SOURCE.width,
  height: crop.height / SOURCE.height,
});

const ring = (crop: SourceRect, rect: SourceRect, at: number) => ({
  left: Math.round((rect.left - crop.left) * CARD_SCALE),
  top: Math.round((rect.top - crop.top) * CARD_SCALE),
  width: Math.round(rect.width * CARD_SCALE),
  height: Math.round(rect.height * CARD_SCALE),
  at,
});

const CLIP =
  "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4";

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261016-ticket-precio-edit.mp3" },

  loss: {
    headline: "Lo que *subió*\ny tú no",
    monthHeadline: "Lo que dejas\nde ganar *en un año*",
    store: 'ABARROTES "TU TIENDA"',
    title: "AUMENTOS QUE NO COBRASTE",
    disclaimer: "*CIFRAS DE EJEMPLO",
    lines: [
      { label: "COCA 600 +1.50 ×20", amount: 30.0 },
      { label: "GARRAFÓN +3 ×4", amount: 12.0 },
      { label: "PAN BLANCO +2 ×5", amount: 10.0 },
      { label: "PAPAS +0.50 ×10", amount: 5.0 },
    ],
    // Coca is on the paper from frame 0 (the thumbnail); the rest lead the
    // narration slightly, so the display reads $57.00 before it is said.
    lineStart: 0,
    lineBeats: 3,
    subtotalLabel: "AL DÍA",
    multipliers: [
      { label: "DÍAS DEL MES", factor: 30, display: "DEJAS DE GANAR AL MES" },
      { label: "MESES DEL AÑO", factor: 12, display: "DEJAS DE GANAR AL AÑO" },
    ],
    totalLabel: "TOTAL DEL AÑO",
    displayDay: "DEJAS DE GANAR",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Costo nuevo,\n*junto a tu precio.*",
    clip: CLIP,
    source: SOURCE,
    trimBefore: 23.0, // 10.20 already typed; the checkbox ticks 2s in
    frame: frameOf(PURCHASE_CROP),
    highlight: ring(PURCHASE_CROP, COST_FIELD, 2.1), // "actualizas el costo"
    cut: {
      at: 2.8, // "y lo ves junto a tu precio"
      trimBefore: 34.0,
      frame: frameOf(PRODUCT_CROP),
      highlight: ring(PRODUCT_CROP, PRICE_AND_COST, 0.6),
    },
  },

  cta: {
    headline: "Pruébalo gratis *14 días*",
    logo: "videos/punto-listo/logo.png",
    lines: ["SIN TARJETA", "SIN INSTALAR NADA"],
    pill: "LINK EN LA BIO",
    displayLabel: "PRUEBA GRATIS",
    displayValue: "14 DÍAS",
  },

  timing: {
    multipliers: [12.06, 14.86],
    total: 16.18,
    tear: 17.95,
    pivot: 18.35,
    proof: 19.7,
    cta: 24.5,
    end: 29.4,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketPrecioProps: TicketStoryProps =
  ticketStorySchema.parse(input);
