import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  uiWindow,
  UI_ZONE,
  type PosDemoProps,
  type Rect,
} from "../template/schema";

/**
 * Video 04 — Diferencias de inventario (PLV-20260903-diferencias-inventario),
 * cut from the single take `01-diferencias-inventario.mp4` (1170x2532,
 * 29.27s, 30fps).
 *
 * The record's claim review withdrew "el ajuste conserva quién lo hizo", so
 * the edit never frames a person: it stays on the count, the difference and
 * the movement the count leaves behind.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.7  Inicio
 *   1.0– 4.6  Coca-Cola 600 ml, Detalle: existencia actual 12.000, mínima 5.000
 *   5.0– 9.4  Historial: 46 movimientos de venta, con fecha y cantidad
 *  10.0–12.9  vuelve a Conteo con la existencia contada en 12.000
 *  13.0–14.6  se escribe 9 → Actual 12.000, Contado 9, Ajuste -3.000
 *  15.0–17.5  se escribe el motivo "Recuento físico del refrigerador"
 *  17.9–19.8  diálogo "¿Registrar el resultado del conteo?" (12.000 → 9.000)
 *  20.0–24.4  existencia actual 9.000 y aviso "Conteo registrado"
 *  24.6–29.2  Historial: 47 movimientos, encabezados por el Ajuste -3.000
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Panel pixels per source pixel, for placing overlays on top of the UI. */
const PANEL_SCALE = UI_ZONE.width / SOURCE.width;

/** Las tarjetas de existencia actual y mínima, con el campo de conteo. */
const STOCK = windowAt(900);

/** El campo de conteo con el desglose Actual / Contado / Ajuste debajo. */
const COUNT = windowAt(1145);

/** La lista de movimientos, encabezada por el más reciente. */
const MOVEMENTS = windowAt(950);

/** "Existencia contada" está en la fila 1300 del recorte de conteo. */
const COUNT_LABEL_ROW = Math.round((1300 - 1145) * PANEL_SCALE);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip:
    "videos/punto-listo/plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? COUNT,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260903-diferencias-inventario.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Te falta producto?",
    subline: "…y no sabes cuándo cambió.",
    until: 3.96,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.96,
      layout: "mobile-ui",
      // Held on the system's 12.000 with the count still empty — the state the
      // hook describes.
      panes: [take({ trimBefore: 1.5, playbackRate: 0.3, frame: STOCK })],
    },
    {
      name: "Historial",
      from: 3.96,
      to: 8.77,
      layout: "mobile-ui",
      // Rides the recorded scroll through the movement list rather than
      // cutting, so the dates and quantities stay readable.
      panes: [take({ trimBefore: 5.0, playbackRate: 0.9 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Conteo físico",
      from: 8.77,
      to: 14.22,
      layout: "mobile-ui",
      // Real time: the 9 is typed, -3.000 appears under "capturas tu conteo
      // físico", and the note is written before the beat ends.
      panes: [take({ trimBefore: 11.6 })],
      callout: {
        text: "Sistema 12 · Conteo 9",
        left: 60,
        top: COUNT_LABEL_ROW - 100,
        at: 1.9,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 1.7, volume: 0.22 },
      ],
    },
    {
      name: "Ajuste registrado",
      from: 14.22,
      to: 18.61,
      layout: "mobile-ui",
      // The confirmation dialog spells out 12.000 → 9.000 (-3.000), then the
      // existencia lands on 9.000 with its confirmation notice.
      panes: [take({ trimBefore: 17.9, playbackRate: 0.95, frame: STOCK })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 2.4, volume: 0.22 },
      ],
    },
    {
      name: "Registro para revisar",
      from: 18.61,
      to: 23.05,
      layout: "mobile-ui",
      // The list now opens on the Ajuste -3.000 with its date and note, above
      // the sales that came before it.
      panes: [take({ trimBefore: 24.6, frame: MOVEMENTS })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 23.05,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 24.1, note: 25.39, pill: 26.45 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const diferenciasInventarioProps: PosDemoProps =
  posDemoSchema.parse(input);
