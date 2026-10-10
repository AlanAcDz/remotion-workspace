import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 04 — "Ahí déjelo en cincuenta" (PLV-20261009-ticket-descuentos).
 * Episode 13's structure, kept as the control for 18's cold open: the day's
 * small discounts print from zero, × 30 days, × 12 months.
 *
 * The math is an example, labelled on the receipt: $2.00 + $1.50 + $0.50 +
 * $3.00 + $1.00 = $8.00 a day; × 30 = $240.00; × 12 = $2,880.00.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it). The lines print a second apart
 * from frame 0 so the display reads $8.00 on "Ocho pesos" (4.29); "Por
 * treinta" 7.60, "Por doce" 10.48, "dos mil" 11.83, "Con" 14.53, "el
 * descuento" 15.85, "ves cuánto" 18.11, "Pruébalo" 20.15.
 *
 * Proof: `plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4`
 * (1170x2532), static from 10.5s: the Descuentos por cajero card, Mariana
 * López 930 ventas / $125.53 ringed.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** The Descuentos por cajero card. */
const CARD_CROP = { left: 30, top: 1740, width: 1110, height: 720 } as const;

/** Mariana López's row. */
const MARIANA = { left: 50, top: 2195, width: 1070, height: 115 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / CARD_CROP.width;

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261009-ticket-descuentos-edit.mp3" },

  loss: {
    headline: "Los *descuentitos*\ndel día",
    monthHeadline: "Lo que suman\n*en un año*",
    store: 'ABARROTES "TU TIENDA"',
    title: "DESCUENTITOS",
    disclaimer: "*CIFRAS DE EJEMPLO",
    lines: [
      { label: "AHÍ DÉJELO EN 50", amount: 2.0 },
      { label: "REDONDEO", amount: 1.5 },
      { label: "PERDONO CENTAVOS", amount: 0.5 },
      { label: "POR SER USTED", amount: 3.0 },
      { label: "LE QUITO EL PESO", amount: 1.0 },
    ],
    lineStart: 0,
    lineBeats: 2,
    subtotalLabel: "DESCUENTITOS DEL DÍA",
    multipliers: [
      { label: "DÍAS DEL MES", factor: 30, display: "DESCONTADO AL MES" },
      { label: "MESES DEL AÑO", factor: 12, display: "DESCONTADO AL AÑO" },
    ],
    totalLabel: "TOTAL DEL AÑO",
    displayDay: "DESCONTADO",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Ve cuánto descontó\n*cada cajero.*",
    clip: "videos/punto-listo/plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4",
    source: SOURCE,
    trimBefore: 12.0,
    frame: {
      x: CARD_CROP.left / SOURCE.width,
      y: CARD_CROP.top / SOURCE.height,
      width: CARD_CROP.width / SOURCE.width,
      height: CARD_CROP.height / SOURCE.height,
    },
    highlight: {
      left: Math.round((MARIANA.left - CARD_CROP.left) * CARD_SCALE),
      top: Math.round((MARIANA.top - CARD_CROP.top) * CARD_SCALE),
      width: Math.round(MARIANA.width * CARD_SCALE),
      height: Math.round(MARIANA.height * CARD_SCALE),
      at: 2.3, // "ves cuánto descontó"
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
    multipliers: [7.6, 10.48],
    total: 11.83,
    tear: 14.05,
    pivot: 14.45,
    proof: 15.8,
    cta: 20.1,
    end: 24.2,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketDescuentosProps: TicketStoryProps =
  ticketStorySchema.parse(input);
