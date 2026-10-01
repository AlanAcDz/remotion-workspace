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
 * Video 06b — Catálogo Base, nuevo inicio (PLV-20261001-catalogo-base-rehook).
 * The 02b recipe applied to the weakest original: open on the result landing
 * in real time ("Se agregaron 45 productos.") instead of asking how many
 * afternoons a manual capture would take, and cut the whole video to ~20s.
 * Cut from the single take `01-catalogo-base.mp4` (1170x2532, 59.83s, 30fps).
 *
 * The record's editing notes still apply: no time promises, "casi todos" stays
 * in the line about barcodes, and Maseca 1 kg carries the same $26.00 from the
 * price edit to the register.
 *
 * Source landmarks used (seconds into the recording):
 *   5.0–12.5  scroll por las filas con nombre, código de barras y precio
 *  25.0–27.4  Revisa antes de agregar: 45 por agregar (estático)
 *  27.5       "Productos agregados · Se agregaron 45 productos."
 *  36.5       se teclea 26 en Precio venta (aviso Sugerido debajo)
 *  49.25      se escanea 7501077400 → Maseca 1 kg $26.00 en la lista
 *  49.75      Maseca 1 kg entra a la venta: 1 producto $26.00
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Las filas del paquete, con su código de barras y su precio. */
const ROWS = windowAt(700);

/** El resumen "Revisa antes de agregar" y la confirmación que lo sigue. */
const IMPORT = windowAt(600);

/** La hoja de edición, con Precio venta y el aviso Sugerido. */
const PRODUCT = windowAt(800);

/** La pantalla de venta: buscador, resultados y la línea agregada. */
const SALE = windowAt(230);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip: "videos/punto-listo/plv-20260903-catalogo-base/01-catalogo-base.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? ROWS,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20261001-catalogo-base-rehook.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "45 productos agregados",
    subline: "Ninguno capturado a mano",
    until: 4.59,
    fadeIn: false,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.59,
      layout: "mobile-ui",
      // Near real time (0.8x): the review screen holds, then "Se agregaron 45
      // productos." lands on "agregados" (1.75s), and the beat ends before the
      // product list replaces it at 30.0s of the source.
      panes: [take({ trimBefore: 26.1, playbackRate: 0.8, frame: IMPORT })],
      sfx: [{ sound: SFX.ding, at: 1.75, volume: 0.22 }],
    },
    {
      name: "Ya vienen listos",
      from: 4.59,
      to: 11.53,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 6.0 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Tu precio",
      from: 11.53,
      to: 12.71,
      layout: "mobile-ui",
      // "26" is typed 0.6s in, on "precio".
      panes: [take({ trimBefore: 35.9, frame: PRODUCT })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 0.65, volume: 0.28 },
      ],
    },
    {
      name: "Al escáner",
      from: 12.71,
      to: 15.02,
      layout: "mobile-ui",
      // The code is scanned and Maseca 1 kg enters the sale at $26.00 on
      // "escáner" — the price set one beat earlier.
      panes: [take({ trimBefore: 48.5, frame: SALE })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 1.25, volume: 0.22 },
      ],
    },
  ],

  cta: {
    from: 15.02,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 15.96, note: 17.11, pill: 17.6 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const catalogoBaseRehookProps: PosDemoProps = posDemoSchema.parse(input);
