import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 03 — El yogur que nadie vio (PLV-20261009-ticket-merma). The
 * first "total first" episode: the year's merma is on the printer's display
 * on frame 0, then the receipt prints how a normal week gets there.
 *
 * The math is an example at the demo catalog's costs, labelled on the
 * receipt: Dan Up 3 × $16.72 + Leche Alpura 2 × $24.32 + Conchas 4 × $15.20 +
 * Yakult 5 × $7.60 = $197.60 a week; × 52 = $10,275.20 a year.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 6% (original kept beside it): "Tres" 3.43, "dos" 4.58,
 * "cuatro" 5.59, "cinco" 6.66, "Por cincuenta" 10.99, "diez mil" 13.03,
 * "Con" 15.70, "registras" 16.81, "Y queda" 20.96, "Pruébalo" 24.28.
 *
 * Proof: `plv-20261009-ticket-merma/01-merma-caducado.mp4` (1170x2532), shot
 * for this video — Dan Up fresa 350 g counted 38 → 35:
 *   5.0   35 typed → Ajuste -3.000
 *   7.0–7.5  Motivo "Caducado" typed
 *  10.0   "¿Registrar el resultado del conteo?" 38.000 → 35.000
 *  16.5   Historial: Ajuste -3.000 · 9 oct 2026 · Caducado on top
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Existencia contada down to the Motivo field. */
const COUNT_CROP = { top: 1270, height: 930 } as const;

/** The history list, headed by the new Ajuste. Same size as COUNT_CROP. */
const HISTORY_CROP = { top: 880, height: 930 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / SOURCE.width;

const crop = ({ top, height }: { top: number; height: number }) => ({
  x: 0,
  y: top / SOURCE.height,
  width: 1,
  height: height / SOURCE.height,
});

const ring = (
  cropTop: number,
  rect: { left: number; top: number; width: number; height: number },
  at: number,
) => ({
  left: Math.round(rect.left * CARD_SCALE),
  top: Math.round((rect.top - cropTop) * CARD_SCALE),
  width: Math.round(rect.width * CARD_SCALE),
  height: Math.round(rect.height * CARD_SCALE),
  at,
});

const PROOF_AT = 16.8;

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261009-ticket-merma-edit.mp3" },

  coldOpen: {
    headline: "Lo que se te *vence*\nen un año",
    until: 3.3,
  },

  loss: {
    headline: "Una semana\nde *merma*",
    monthHeadline: "Por *52 semanas*",
    store: 'ABARROTES "TU TIENDA"',
    title: "LO QUE SE VENCIÓ",
    disclaimer: "*CIFRAS DE EJEMPLO, A COSTO",
    lines: [
      { label: "DAN UP FRESA ×3", amount: 50.16 },
      { label: "LECHE ALPURA ×2", amount: 48.64 },
      { label: "CONCHAS ×4", amount: 60.8 },
      { label: "YAKULT ×5", amount: 38.0 },
    ],
    // Beat 7 is 3.5s: the first line waits out the cold open, then each
    // prints on its product's name.
    lineStart: 7,
    lineBeats: 2,
    subtotalLabel: "MERMA DE LA SEMANA",
    multipliers: [
      { label: "SEMANAS DEL AÑO", factor: 52, display: "MERMA DEL AÑO" },
    ],
    totalLabel: "TOTAL DEL AÑO",
    displayDay: "MERMA",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Registra la merma\n*con su motivo.*",
    clip: "videos/punto-listo/plv-20261009-ticket-merma/01-merma-caducado.mp4",
    source: SOURCE,
    trimBefore: 5.1,
    frame: crop(COUNT_CROP),
    // Ajuste -3.000 and Motivo "Caducado", ringed once the word is typed.
    highlight: ring(
      COUNT_CROP.top,
      { left: 70, top: 1700, width: 1030, height: 340 },
      2.4,
    ),
    cut: {
      at: 20.95 - PROOF_AT, // "Y queda en el historial"
      trimBefore: 16.6,
      frame: crop(HISTORY_CROP),
      highlight: ring(
        HISTORY_CROP.top,
        { left: 35, top: 975, width: 1100, height: 303 },
        0.3,
      ),
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
    multipliers: [10.98],
    total: 13.03,
    tear: 15.2,
    pivot: 15.65,
    proof: PROOF_AT,
    cta: 24.2,
    end: 28.6,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketMermaProps: TicketStoryProps =
  ticketStorySchema.parse(input);
