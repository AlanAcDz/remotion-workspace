import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 02 — Kilo "al ojo" (PLV-20261001-ticket-kilo). The first
 * episode's tweaks: one leak instead of five, narrated, with the printer
 * already running on frame 0 and the month total landing at ~11s.
 *
 * The math is an illustrative example, labelled on the receipt: 20 g of
 * jitomate at $38/kg is $0.76 a sale; × 60 sales a day = $45.60; × 30 days =
 * $1,368.00.
 *
 * Voice: one ElevenLabs take (22.76s). The story beats are pinned to its words
 * — "sesenta" 7.50, "treinta" 9.58, "mil" 10.81, "Con" 14.34, "capturas"
 * 15.37, "Pruébalo" 19.45 — while the sales print on the half-second grid.
 *
 * Proof: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532):
 * the quantity is retyped from 8.9s, reads 0.350 at 10.1s and the line lands
 * on $13.30 at 10.5s — 2.0s into the beat, on "importe".
 */

const VENTA = { width: 1170, height: 2532 } as const;

/** The jitomate line with its quantity field, inside the cart. */
const LINE_CROP = { left: 0, top: 1100, width: 1170, height: 800 } as const;

/** The whole jitomate line: name, $/kg, quantity and amount. */
const LINE = { left: 40, top: 1285, width: 1095, height: 495 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / LINE_CROP.width;

const SALES = 11;

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261001-ticket-kilo.mp3" },

  loss: {
    headline: "Regalas *20 gramos*\npor venta",
    monthHeadline: "Lo que cuesta\n*en un mes*",
    store: 'ABARROTES "TU TIENDA"',
    title: "JITOMATE A $38/KG",
    disclaimer: "*CIFRAS DE EJEMPLO",
    lines: Array.from({ length: SALES }, (_, index) => ({
      label: `VENTA ${index + 1}: +20 G`,
      amount: 0.76,
    })),
    lineStart: 0.5,
    lineBeats: 1,
    unit: 0.76,
    multipliers: [
      { label: "VENTAS AL DÍA", factor: 60, display: "REGALADO HOY" },
      { label: "DÍAS DEL MES", factor: 30, display: "REGALADO AL MES" },
    ],
    totalLabel: "TOTAL DEL MES",
    displayDay: "REGALADO",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Captura el *peso exacto.*",
    clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
    source: VENTA,
    trimBefore: 8.5,
    frame: {
      x: LINE_CROP.left / VENTA.width,
      y: LINE_CROP.top / VENTA.height,
      width: LINE_CROP.width / VENTA.width,
      height: LINE_CROP.height / VENTA.height,
    },
    highlight: {
      left: Math.round((LINE.left - LINE_CROP.left) * CARD_SCALE),
      top: Math.round((LINE.top - LINE_CROP.top) * CARD_SCALE),
      width: Math.round(LINE.width * CARD_SCALE),
      height: Math.round(LINE.height * CARD_SCALE),
      at: 2.0,
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
    multipliers: [7.5, 9.58],
    total: 10.81,
    tear: 13.35,
    pivot: 14.25,
    proof: 15.37,
    cta: 19.45,
    end: 23.8,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketKiloProps: TicketStoryProps = ticketStorySchema.parse(input);
