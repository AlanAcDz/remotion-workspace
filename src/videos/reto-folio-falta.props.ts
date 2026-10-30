import { z } from "zod";
import { retoTicketSchema, type RetoTicketProps } from "../reto/ticket-schema";
import { MUSIC } from "../template/schema";
import { formatMoney } from "../ticket/theme";

/**
 * Reto del mostrador #8 — "¿Cuál ticket falta?" (PLV-20261030-reto-folio-
 * falta). Reto #6/#7's hunt on a new topic: the day's paper tickets are
 * 2051, 2052 and 2054, so the paper total is short by sale 2053. The ringed
 * and struck line is that total, which really is wrong; the folio lines are
 * not. Tone: the paper got lost, nobody took anything.
 *
 * Figures: 2052 ($11.00) and 2053 ($38.00, Alan Acuña, Efectivo) are the demo
 * store's, from `plv-20260903-cobro-rapido/01-cobro-rapido.mp4`; 2051 and
 * 2054 are examples. Paper: $45.50 + $11.00 + $27.00 = $83.50.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it). The countdown sits in the
 * silence after "¿Cuál falta?" (6.23–6.56). After it (+3s): "El dos mil
 * cincuenta y tres" 9.54, "pero la venta no" 12.97, "En Punto Listo" 14.08,
 * "quién lo cobró" 16.54, "qué llevaba" 18.71, "Pruébalo" 19.54, end 22.3.
 *
 * Proof: the same take (1170x2532):
 *  22.4–25.0  Historial de ventas: Folio 2053 · Alan Acuña · Efectivo · $38.00
 *  25.2–29.6  Folio 2053 expanded: Peñafiel 600 ml and Conchas vainilla,
 *             Método de pago Efectivo
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const CLIP = "videos/punto-listo/plv-20260903-cobro-rapido/01-cobro-rapido.mp4";

interface SourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** The Folio 2053 card, collapsed. */
const CARD_CROP = { left: 30, top: 900, width: 1110, height: 720 } as const;

/** The same card expanded: its products and payment method. */
const DETAIL_CROP = { left: 30, top: 1620, width: 1110, height: 720 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / CARD_CROP.width;

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
  audioFile: "audio/plv-20261030-reto-folio-falta-edit.mp3",
  music: { ...MUSIC.nastelbom },

  receipt: {
    store: 'ABARROTES "TU TIENDA"',
    title: "TICKETS DEL DÍA",
    disclaimer: "*CIFRAS DE EJEMPLO",
    items: [
      { label: "FOLIO 2051", amount: 45.5 },
      { label: "FOLIO 2052", amount: 11.0 },
      { label: "FOLIO 2054", amount: 27.0 },
    ],
    summary: [{ label: "TOTAL EN PAPEL", amount: 83.5, isBold: true }],
  },
  wrongLine: { section: "summary", index: 0 },
  display: {
    start: { label: "TICKETS EN PAPEL", value: "3" },
    wrong: { label: "FALTA EL FOLIO", value: "2053" },
    right: { label: "VENTA 2053", value: formatMoney(38) },
  },

  pause: { at: 6.4, for: 3, prompt: "¿Ya lo viste?" },

  headlines: {
    ask: "Falta *un ticket.*\n¿Cuál es?",
    reveal: "El *2053.*\nEl papel se perdió…",
    proof: "…pero la venta\n*sigue ahí.*",
    cta: "Pruébalo gratis *14 días*",
    share: "Mándaselo al que\n*guarda los tickets* 👀",
  },

  timing: {
    ring: 9.55,
    correct: 12.95,
    proof: 14.05,
    cta: 19.5,
    share: 22.35,
    end: 24.4,
  },

  proof: {
    headline: "…pero la venta\n*sigue ahí.*",
    clip: CLIP,
    source: SOURCE,
    trimBefore: 22.4, // the history replaces the ticket dialog at 22.4
    frame: frameOf(CARD_CROP),
    // Folio 2053 with its cashier, payment and total: "quién lo cobró".
    highlight: ring(
      CARD_CROP,
      { left: 53, top: 948, width: 1063, height: 612 },
      2.4,
    ),
    cut: {
      at: 4.4, // "y qué llevaba"
      trimBefore: 26.0,
      frame: frameOf(DETAIL_CROP),
      highlight: ring(
        DETAIL_CROP,
        { left: 53, top: 1700, width: 1063, height: 490 },
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
} satisfies z.input<typeof retoTicketSchema>;

export const retoFolioFaltaProps: RetoTicketProps =
  retoTicketSchema.parse(input);
