import { z } from "zod";
import { retoTicketSchema, type RetoTicketProps } from "../reto/ticket-schema";
import { MUSIC } from "../template/schema";
import { formatMoney } from "../ticket/theme";

/**
 * Reto del mostrador #6 — ¿Dónde está el error? (PLV-20261016-reto-error-
 * cambio). The first Reto where the viewer hunts instead of computing: the
 * receipt is printed on frame 0 with the change $50 too high.
 *
 * The receipt is the same sale as the proof recording, so the answer is the
 * app's own: Jitomate 0.350 kg $13.30 + Queso Oaxaca 0.500 kg $74.00 +
 * Conchas vainilla $20.00 = $107.30; efectivo $200.00; cambio $92.70, printed
 * as $142.70. Labelled as example figures.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it). Before the countdown: "¿Lo ves?"
 * 2.70. After it (+3s): "Aquí" 6.70, "Eran noventa" 8.36, "se dieron" 10.26,
 * "Con Punto Listo" 12.88, "calcula el cambio" 14.72, "Pruébalo" 16.41,
 * "tarjeta" 18.77.
 *
 * Proof: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532):
 * 200 typed into Efectivo recibido ~27.3s, Cambio $92.70 settled by 27.7s.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/** Efectivo recibido down to the Cambio row. */
const CHARGE_CROP = { left: 30, top: 1470, width: 1110, height: 710 } as const;

/** The Cambio row. */
const CHANGE_ROW = { left: 50, top: 2045, width: 1070, height: 115 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / CHARGE_CROP.width;

const input = {
  audioFile: "audio/plv-20261016-reto-error-cambio-edit.mp3",
  music: { ...MUSIC.nastelbom },

  receipt: {
    store: 'ABARROTES "TU TIENDA"',
    title: "NOTA DE VENTA",
    disclaimer: "*CIFRAS DE EJEMPLO",
    items: [
      { label: "JITOMATE 0.350 KG", amount: 13.3 },
      { label: "QUESO OAXACA 0.500 KG", amount: 74.0 },
      { label: "CONCHAS VAINILLA", amount: 20.0 },
    ],
    summary: [
      { label: "TOTAL", amount: 107.3, isBold: true },
      { label: "EFECTIVO", amount: 200.0 },
      { label: "CAMBIO", amount: 142.7, isBold: true },
    ],
  },
  wrongLine: { section: "summary", index: 2 },
  display: {
    start: { label: "TOTAL", value: formatMoney(107.3) },
    wrong: { label: "SE DIERON DE MÁS", value: formatMoney(142.7 - 92.7) },
    right: { label: "CAMBIO CORRECTO", value: formatMoney(92.7) },
  },

  pause: { at: 3.5, for: 3, prompt: "¿Ya lo viste?" },

  headlines: {
    ask: "Tiene un error\nde *$50.* ¿Lo ves?",
    reveal: "El error:\n*el cambio.*",
    proof: "La caja calcula\n*el cambio sola.*",
    cta: "Pruébalo gratis *14 días*",
    share: "Mándaselo al que\n*cobra en tu tienda* 👀",
  },

  timing: {
    ring: 6.75,
    correct: 8.4,
    proof: 12.85,
    cta: 16.35,
    share: 19.4,
    end: 21.4,
  },

  proof: {
    headline: "La caja calcula\n*el cambio sola.*",
    clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
    source: SOURCE,
    trimBefore: 26.1,
    frame: {
      x: CHARGE_CROP.left / SOURCE.width,
      y: CHARGE_CROP.top / SOURCE.height,
      width: CHARGE_CROP.width / SOURCE.width,
      height: CHARGE_CROP.height / SOURCE.height,
    },
    highlight: {
      left: Math.round((CHANGE_ROW.left - CHARGE_CROP.left) * CARD_SCALE),
      top: Math.round((CHANGE_ROW.top - CHARGE_CROP.top) * CARD_SCALE),
      width: Math.round(CHANGE_ROW.width * CARD_SCALE),
      height: Math.round(CHANGE_ROW.height * CARD_SCALE),
      at: 1.75, // "calcula el cambio sola"
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

export const retoErrorCambioProps: RetoTicketProps =
  retoTicketSchema.parse(input);
