import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 01 — Fugas de la tienda. The first cut of the receipt format:
 * five everyday leaks, each one a feature Punto Listo already has a recording
 * for (corte, cobro rápido, venta por kilo, descuentos por cajero,
 * devoluciones autorizadas), so the fix receipt answers them line for line.
 *
 * The amounts are an illustrative day, labelled as such on the receipt. Two of
 * them come straight from the recordings — the $34.50 shortfall in the corte
 * take and the $26.00 Bonafont in the devoluciones take — so the proof beat
 * shows the exact number the first receipt printed.
 */

const CORTE = { width: 1170, height: 2532 } as const;

/** The "Cerrar mi corte" dialog body, inside its rounded border. */
const DIALOG = { left: 66, top: 630, width: 1040, height: 1250 } as const;

/** The Esperado / Diferencia / "Faltan $34.50" block, in source pixels. */
const DIFFERENCE = { left: 113, top: 1164, width: 948, height: 374 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / DIALOG.width;

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.45, bpm: 120 },

  loss: {
    headline: "Lo que tu tienda *pierde* en un día",
    monthHeadline: "Lo que tu tienda *pierde* en un mes",
    store: 'ABARROTES "TU TIENDA"',
    title: "TICKET DE FUGAS",
    disclaimer: "*CIFRAS DE EJEMPLO",
    lines: [
      { label: "FALTANTE EN CAJA", amount: 34.5 },
      { label: "CAMBIO DE MÁS", amount: 12 },
      { label: 'KILO "AL OJO"', amount: 9.5 },
      { label: "DESCUENTO SIN ANOTAR", amount: 25 },
      { label: "DEVOLUCIÓN SIN PERMISO", amount: 26 },
    ],
    subtotalLabel: "FUGAS DEL DÍA",
    multipliers: [
      { label: "DÍAS DEL MES", factor: 30, display: "FUGAS DEL MES" },
    ],
    totalLabel: "TOTAL DEL MES",
    displayDay: "FUGAS HOY",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  fix: {
    headline: "Cada peso,\n*con su ticket.*",
    header: "TICKET · FOLIO 2074",
    lines: [
      "DIFERENCIA DEL CORTE",
      "CAMBIO EXACTO",
      "COBRO AL GRAMO",
      "DESCUENTOS POR CAJERO",
      "DEVOLUCIÓN CON PERMISO",
    ],
    stamp: "TODO QUEDA REGISTRADO",
    displayLabel: "FUGAS A LA VISTA",
  },

  proof: {
    headline: "Y te dice *cuánto falta.*",
    clip: "videos/punto-listo/mobile-v5/01-corte-de-caja.mp4",
    source: CORTE,
    // Opens on the last digits of 2885.59, so the half-typed amount never
    // flashes a four-figure shortfall; -$34.50 lands at 8.4s, 0.6s in.
    trimBefore: 7.8,
    frame: {
      x: DIALOG.left / CORTE.width,
      y: DIALOG.top / CORTE.height,
      width: DIALOG.width / CORTE.width,
      height: DIALOG.height / CORTE.height,
    },
    highlight: {
      left: Math.round((DIFFERENCE.left - DIALOG.left) * CARD_SCALE),
      top: Math.round((DIFFERENCE.top - DIALOG.top) * CARD_SCALE),
      width: Math.round(DIFFERENCE.width * CARD_SCALE),
      height: Math.round(DIFFERENCE.height * CARD_SCALE),
      at: 0.75,
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
} satisfies z.input<typeof ticketStorySchema>;

export const ticketTiendaProps: TicketStoryProps =
  ticketStorySchema.parse(input);
