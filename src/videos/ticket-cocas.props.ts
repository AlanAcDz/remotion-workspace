import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 07 — tres Cocas (PLV-20261106-ticket-cocas). The week's control:
 * episode 13's structure, unchanged on purpose, where the total builds from
 * zero, even though the app arrives late.
 *
 * The math is an example, labelled on the receipt: 3 × $22.00 = $66.00 a week;
 * × 4 = $264.00 a month; × 12 = $3,168.00 a year. $22.00 is Coca-Cola 600 ml's
 * suggested price in the Catálogo Base, not a confirmed demo-store price.
 *
 * Tone: no suggestion of theft. Three pieces can be shrinkage, a capture error
 * or an unrecorded sale. The app records the difference; it neither prevents
 * it nor says why it happened.
 *
 * Proof: `plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4`
 * (1170x2532):
 *  12.25      9 typed → Contado 9, Ajuste -3.000
 *  14.75–17   Motivo "Recuento físico del refrigerador" typed
 *  24.6–29.2  Historial headed by Ajuste -3.000 · Recuento físico del refrigerador
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "Tres por veintidós" 2.67, "sesenta y
 * seis" 4.09, "Por cuatro" 6.03, "doscientos" 7.46, "Por doce" 9.46, "tres mil"
 * 10.41, "En Punto Listo" 12.86, "capturas" 13.75, "con su motivo" 16.25,
 * "Pruébalo" 17.17, end 19.75.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

interface SourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Existencia contada down to the Motivo field. */
const COUNT_CROP = { left: 40, top: 1250, width: 1090, height: 800 } as const;

/** The history, headed by the adjustment. Same size. */
const HISTORY_CROP = { left: 40, top: 880, width: 1090, height: 800 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / COUNT_CROP.width;

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

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261106-ticket-cocas-edit.mp3" },

  loss: {
    headline: "Te faltan\n*tres Cocas*",
    monthHeadline: "Lo que se va\n*en un año*",
    store: 'ABARROTES "TU TIENDA"',
    title: "LO QUE NO CUADRÓ",
    disclaimer: "*CIFRAS DE EJEMPLO",
    // One line per Coca: the schema wants two or more, and the total builds.
    lines: [
      { label: "COCA 600 ML", amount: 22.0 },
      { label: "COCA 600 ML", amount: 22.0 },
      { label: "COCA 600 ML", amount: 22.0 },
    ],
    lineStart: 2,
    lineBeats: 2,
    subtotalLabel: "EN LA SEMANA",
    multipliers: [
      { label: "SEMANAS DEL MES", factor: 4, display: "SE VAN AL MES" },
      { label: "MESES DEL AÑO", factor: 12, display: "SE VAN AL AÑO" },
    ],
    totalLabel: "TOTAL DEL AÑO",
    displayDay: "SE FUERON",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Captura tu conteo\ny *queda con su motivo.*",
    clip: "videos/punto-listo/plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4",
    source: SOURCE,
    trimBefore: 11.4, // the 9 lands 0.85s in
    frame: frameOf(COUNT_CROP),
    highlight: ring(
      COUNT_CROP,
      { left: 95, top: 1465, width: 985, height: 345 },
      1.0,
    ),
    cut: {
      at: 2.55, // "con su motivo"
      trimBefore: 25.0,
      frame: frameOf(HISTORY_CROP),
      highlight: ring(
        HISTORY_CROP,
        { left: 45, top: 975, width: 1080, height: 300 },
        0.4,
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
    multipliers: [6.0, 9.45],
    total: 10.4,
    tear: 12.1,
    pivot: 12.5,
    proof: 13.7,
    cta: 17.1,
    end: 21.4,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketCocasProps: TicketStoryProps =
  ticketStorySchema.parse(input);
