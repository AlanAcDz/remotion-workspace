import { z } from "zod";
import { MUSIC } from "../template/schema";
import { ticketStorySchema, type TicketStoryProps } from "../ticket/schema";

/**
 * "El Ticket" 06 — Lo que no vendiste (PLV-20261030-ticket-no-vendiste). The
 * week's control, on the structure that won (the total builds from zero):
 * the sales a shop missed because the product had run out.
 *
 * The math is an example, labelled on the receipt, at the demo store's
 * prices: Bonafont 1 L $13.00 × 4 = $52.00 and Coca-Cola 1.35 L $34.00 × 2 =
 * $68.00, so $120.00 a week; × 4 = $480.00 a month.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it): "Cuatro Bonafont" 2.25, "Dos
 * Coca" 4.43, "Ciento veinte" 7.39, "Por cuatro semanas" 10.23,
 * "cuatrocientos ochenta" 11.65, "En Punto Listo" 13.50, "su mínimo" 14.95,
 * "con un filtro" 17.15, "lo que va bajo" 18.26, "Pruébalo" 20.41, end 23.4.
 *
 * Proof: `plv-20260907-existencias-bajas/01-existencias-bajas.mp4`
 * (1170x2532), the same take as 09, 17 and 23:
 *  12.9–13.6  Bonafont 1 L's Existencia mínima retyped 6.000 → 12
 *  25.0–27.5  Existencias filtered to bajos o negativos: 6 productos
 * Same rule as 09: the app filters, it does not warn — no alerta,
 * notificación or "te avisa".
 */

const SOURCE = { width: 1170, height: 2532 } as const;

interface SourceRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Inventario down to Existencia mínima, on the product sheet. */
const SHEET_CROP = { left: 30, top: 1260, width: 1090, height: 900 } as const;

/** Filtros (1), the count and the first low product. Same size. */
const LIST_CROP = { left: 40, top: 470, width: 1090, height: 900 } as const;

/** Card pixels per source pixel — the proof card is 860 wide. */
const CARD_SCALE = 860 / SHEET_CROP.width;

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
  "videos/punto-listo/plv-20260907-existencias-bajas/01-existencias-bajas.mp4";

const input = {
  music: { ...MUSIC.nastelbom, volume: 0.12, bpm: 120 },
  voice: { audioFile: "audio/plv-20261030-ticket-no-vendiste-edit.mp3" },

  loss: {
    headline: "Lo que *no vendiste*\nesta semana",
    monthHeadline: "Lo que se va\n*en un mes*",
    store: 'ABARROTES "TU TIENDA"',
    title: "VENTAS QUE NO PASARON",
    disclaimer: "*CIFRAS DE EJEMPLO",
    lines: [
      { label: "NO HABÍA BONAFONT ×4", amount: 52.0 },
      { label: "NO HABÍA COCA 1.35 ×2", amount: 68.0 },
    ],
    // Each line prints half a second before the voice names it.
    lineStart: 4,
    lineBeats: 4,
    subtotalLabel: "EN LA SEMANA",
    multipliers: [
      { label: "SEMANAS DEL MES", factor: 4, display: "SE VAN AL MES" },
    ],
    totalLabel: "TOTAL DEL MES",
    displayDay: "SE FUERON",
  },

  pivot: {
    kicker: "Con",
    logo: "videos/punto-listo/logo.png",
  },

  proof: {
    headline: "Ponle su mínimo\ny *filtra lo que va bajo.*",
    clip: CLIP,
    source: SOURCE,
    trimBefore: 12.8, // the 12 lands 0.8s in, on "su mínimo"
    frame: frameOf(SHEET_CROP),
    highlight: ring(
      SHEET_CROP,
      { left: 40, top: 1890, width: 800, height: 210 },
      0.9,
    ),
    cut: {
      at: 2.65, // "con un filtro"
      trimBefore: 25.2,
      frame: frameOf(LIST_CROP),
      highlight: ring(
        LIST_CROP,
        { left: 46, top: 785, width: 1070, height: 535 },
        1.0,
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
    multipliers: [10.2],
    total: 11.6,
    tear: 12.55,
    pivot: 13.0,
    proof: 14.5,
    cta: 20.35,
    end: 25.0,
  },
} satisfies z.input<typeof ticketStorySchema>;

export const ticketNoVendisteProps: TicketStoryProps =
  ticketStorySchema.parse(input);
