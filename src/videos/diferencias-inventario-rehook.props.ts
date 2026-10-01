import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  uiWindow,
  type PosDemoProps,
  type Rect,
} from "../template/schema";

/**
 * Video 04b — Diferencias de inventario, nuevo inicio
 * (PLV-20261001-diferencias-inventario-rehook). The 02b recipe: open on the
 * number changing in real time — the 9 typed against the system's 12 and
 * -3.000 appearing — instead of asking whether product is missing. Cut to
 * ~19s from the single take `01-diferencias-inventario.mp4` (1170x2532,
 * 29.27s, 30fps).
 *
 * The original's review found the history in this take holds only Venta
 * movements (plus the new Ajuste), so the narration no longer lists "compras".
 * The note on screen reads "Recuento físico del refrigerador", hence "refri".
 *
 * Source landmarks used (seconds into the recording):
 *  10.0–12.2  Conteo con existencia actual 12.000 y Ajuste Pendiente
 *  12.25      se escribe 9 → Contado 9, Ajuste -3.000
 *  14.75      se escribe el motivo "Recuento físico del refrigerador"
 *  17.9–19.8  diálogo "¿Registrar el resultado del conteo?" (12.000 → 9.000)
 *  20.0–24.4  existencia actual 9.000 y aviso "Conteo registrado"
 *  24.6–29.2  Historial: 47 movimientos, encabezados por el Ajuste -3.000
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Las tarjetas de existencia, el campo de conteo, el motivo y el botón. */
const STOCK = windowAt(900);

/** El campo de conteo con el desglose Actual / Contado / Ajuste debajo. */
const COUNT = windowAt(1145);

/** La lista de movimientos, encabezada por el más reciente. */
const MOVEMENTS = windowAt(950);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip: "videos/punto-listo/plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? COUNT,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20261001-diferencias-inventario-rehook.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "Sistema: 12",
    subline: "En el refri: 9",
    until: 3.88,
    fadeIn: false,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.88,
      layout: "mobile-ui",
      // Real time: 12.000 on screen under "doce", then the 9 is typed and
      // -3.000 appears at 1.95s, between "refri" and "nueve".
      panes: [take({ trimBefore: 10.3 })],
      sfx: [{ sound: SFX.pop, at: 1.95, volume: 0.28 }],
    },
    {
      name: "Ajuste con fecha y nota",
      from: 3.88,
      to: 9.44,
      layout: "mobile-ui",
      // The note is typed, the confirmation spells out 12.000 → 9.000, and
      // "Conteo registrado" lands before the beat ends.
      panes: [take({ trimBefore: 14.6, playbackRate: 1.05, frame: STOCK })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 5.2, volume: 0.22 },
      ],
    },
    {
      name: "Historial",
      from: 9.44,
      to: 13.69,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 24.6, frame: MOVEMENTS })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 13.69,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 14.72, note: 16.03, pill: 16.5 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const diferenciasInventarioRehookProps: PosDemoProps =
  posDemoSchema.parse(input);
