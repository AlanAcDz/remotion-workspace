import { z } from "zod";
import { retoTicketSchema, type RetoTicketProps } from "../reto/ticket-schema";
import { MUSIC } from "../template/schema";
import { formatMoney } from "../ticket/theme";

/**
 * Reto del mostrador #7 — "Faltan $399… pero no falta nada"
 * (PLV-20261023-reto-error-corte). Reto #6's hunt on a cash cut instead of a
 * sale: the cashier's own sum adds the card sales to the drawer's expected
 * cash, so $399.16 "is missing". Same topic and figures as Chat 22, so the
 * two formats compare on a fixed topic.
 *
 * The figures are the demo store's, from `mobile-v5/01-corte-de-caja.mp4` at
 * 2s: Inicial $1,218.50 + Efectivo $1,701.59 = Esperado $2,920.09, and
 * Tarjeta $399.16 apart. The cashier's paper adds the card too: $3,319.25
 * expected against $2,920.09 counted.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it). The countdown sits in the
 * silence after "¿Dónde está el error?" (6.06–6.38). After it (+3s): "Aquí"
 * 9.36, "No se suma" 13.05, "Con Punto Listo" 14.91, "separa" 16.75,
 * "Pruébalo" 19.91, end 22.87.
 *
 * Proof: `corte-tarjeta.png`, the same take at 2s (1170x2532). A still,
 * because the take scrolls the cut screen around 4.5s and its "Cerrar mi
 * corte" dialog then types a count with a real shortfall.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Esperado down to the Tarjeta card. */
const CUT_CROP = { left: 30, top: 935, width: 1110, height: 1005 } as const;

/** The Tarjeta card. */
const CARD_ROW = { left: 95, top: 1565, width: 985, height: 345 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / CUT_CROP.width;

const input = {
  audioFile: "audio/plv-20261023-reto-error-corte-edit.mp3",
  music: { ...MUSIC.nastelbom },

  receipt: {
    store: 'ABARROTES "TU TIENDA"',
    title: "CORTE DE CAJA",
    disclaimer: "*CIFRAS DE EJEMPLO",
    items: [
      { label: "FONDO INICIAL", amount: 1218.5 },
      { label: "VENTAS EFECTIVO", amount: 1701.59 },
      { label: "VENTAS TARJETA", amount: 399.16 },
    ],
    summary: [
      { label: "ESPERADO", amount: 3319.25, isBold: true },
      { label: "CONTADO", amount: 2920.09 },
      { label: "FALTAN", amount: 399.16, isBold: true },
    ],
  },
  wrongLine: { section: "items", index: 2 },
  display: {
    start: { label: "FALTAN", value: formatMoney(399.16) },
    wrong: { label: "NO ENTRA AL CAJÓN", value: formatMoney(399.16) },
    right: { label: "NO FALTA NADA", value: formatMoney(0) },
  },

  pause: { at: 6.2, for: 3, prompt: "¿Ya lo viste?" },

  headlines: {
    ask: "Faltan *$399.*\n¿Dónde está el error?",
    reveal: "La tarjeta\n*no entra al cajón.*",
    proof: "El corte separa\n*efectivo y tarjeta.*",
    cta: "Pruébalo gratis *14 días*",
    share: "Mándaselo al que\n*hace el corte* 👀",
  },

  timing: {
    ring: 9.4,
    correct: 13.05,
    proof: 14.85,
    cta: 19.85,
    share: 22.9,
    end: 25.0,
  },

  proof: {
    headline: "El corte separa\n*efectivo y tarjeta.*",
    clip: "videos/punto-listo/plv-20261023-reto-error-corte/corte-tarjeta.png",
    still: true,
    source: SOURCE,
    trimBefore: 0,
    frame: {
      x: CUT_CROP.left / SOURCE.width,
      y: CUT_CROP.top / SOURCE.height,
      width: CUT_CROP.width / SOURCE.width,
      height: CUT_CROP.height / SOURCE.height,
    },
    highlight: {
      left: Math.round((CARD_ROW.left - CUT_CROP.left) * CARD_SCALE),
      top: Math.round((CARD_ROW.top - CUT_CROP.top) * CARD_SCALE),
      width: Math.round(CARD_ROW.width * CARD_SCALE),
      height: Math.round(CARD_ROW.height * CARD_SCALE),
      at: 1.9, // "separa"
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

export const retoErrorCorteProps: RetoTicketProps =
  retoTicketSchema.parse(input);
