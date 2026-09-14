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
 * Video 06 — Catálogo Base: de la captura a la caja
 * (PLV-20260903-catalogo-base), cut from the single take
 * `01-catalogo-base.mp4` (1170x2532, 59.83s, 30fps).
 *
 * The record's editing notes set the spine: one product (Maseca 1 kg) travels
 * from the pack to the register, and the hook opens on the list already
 * scrolling rather than on the Catálogo Base cover.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.9  Inicio
 *   1.0– 4.5  Catálogo Base: 47 productos seleccionados y los seis paquetes
 *   5.0–12.5  scroll por las filas con nombre, código de barras y precio
 *  13.0–15.5  vuelve al encabezado con la lista de paquetes a la vista
 *  16.0–19.5  búsqueda "Raid Max" y se desmarca → 46 productos
 *  21.0–24.5  búsqueda "vasos #8" y se desmarca → 45 productos
 *  25.0–27.5  Revisa antes de agregar: 45 por agregar, 0 omitidos, 7 categorías
 *  28.0–29.8  Agregando productos… → "Se agregaron 45 productos."
 *  30.0–33.5  Maseca 1 kg con precio $25.00 y badge Sugerido
 *  34.0–38.5  hoja Editar producto: aviso ámbar y el precio pasa a 26
 *  40.0–43.5  el filtro de precios por revisar queda vacío (toast Producto actualizado)
 *  44.0–45.9  Maseca 1 kg a $26.00, ya sin badge
 *  46.0–49.5  /dashboard/venta y escaneo de 7501077400050
 *  50.0–59.8  Maseca 1 kg cobrándose a $26.00 en el ticket
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Las filas del paquete, con su código de barras y su precio. */
const ROWS = windowAt(700);

/** El resumen "Revisa antes de agregar" y la confirmación que lo sigue. */
const IMPORT = windowAt(600);

/** La ficha del producto: precio, badge Sugerido y la hoja de edición. */
const PRODUCT = windowAt(800);

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
  audioFile: "audio/plv-20260903-catalogo-base.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Capturar todo a mano?",
    subline: "¿Cuántas tardes te tomaría?",
    until: 5.74,
  },

  beats: [
    {
      name: "Las tardes de captura",
      from: 0,
      to: 5.74,
      layout: "mobile-ui",
      // Opens on the list already moving, per the editing notes: the scale of
      // the catalogue is the hook, not the cover page.
      panes: [take({ trimBefore: 5.5 })],
    },
    {
      name: "Ya vienen listos",
      from: 5.74,
      to: 14.98,
      layout: "mobile-ui",
      // Rides the recorded scroll across rows that each carry a name, a
      // barcode and a price, then arrives back at the six packs — the two
      // halves of the line, in the order the line says them.
      panes: [take({ trimBefore: 6.0 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Solo lo que vendes",
      from: 14.98,
      to: 19.56,
      layout: "mobile-ui",
      // Three actions in one short line, so this runs brisk: the second
      // uncheck drops the counter to 45, the review screen counts them, and
      // "Se agregaron 45 productos." lands on "y los agregas".
      panes: [take({ trimBefore: 22.2, playbackRate: 1.7, frame: IMPORT })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 3.7, volume: 0.22 },
      ],
    },
    {
      name: "El precio es tuyo",
      from: 19.56,
      to: 25.17,
      layout: "mobile-ui",
      // The badge, the amber notice and the typing all belong to this line;
      // the price lands on 26 before it ends.
      panes: [
        take({ trimBefore: 30.2, playbackRate: 1.43, frame: PRODUCT }),
      ],
      callout: {
        text: "Sugerido hasta que pones el tuyo",
        left: 40,
        top: 1120,
        at: 2.4,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 3.6, volume: 0.28 },
      ],
    },
    {
      name: "De la lista a la caja",
      from: 25.17,
      to: 31.59,
      layout: "mobile-ui",
      // Same product, same price: $26.00 without the badge, then scanned and
      // charged at $26.00. That equality is the whole payoff.
      panes: [
        take({ trimBefore: 44.3, playbackRate: 1.25, frame: PRODUCT }),
      ],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 4.6, volume: 0.22 },
      ],
    },
  ],

  cta: {
    from: 31.59,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 32.7, note: 33.83, pill: 35.4 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const catalogoBaseProps: PosDemoProps = posDemoSchema.parse(input);
