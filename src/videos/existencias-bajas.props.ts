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
 * Video 09 — Existencias bajas: surte antes (PLV-20260907-existencias-bajas),
 * cut from the single take `01-existencias-bajas.mp4` (1170x2532, 48.03s,
 * 30fps).
 *
 * The record's editing notes forbid the words alerta, notificación and te
 * avisa — the app shows signals when you walk in, it does not push them. The
 * edit follows the same rule: every beat is the owner opening a screen.
 *
 * The negative product is Coca-Cola 1.35 L, deliberately not the Coca-Cola
 * 600 ml whose ledger belongs to video 04.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.9  Inicio con "6 alertas" en el resumen
 *   1.0– 8.5  Existencias filtradas a atención: bajas en ámbar, negativa en rojo
 *   9.0–11.5  /dashboard/productos filtrado a Bonafont
 *  12.0–15.5  hoja Editar producto: Existencia mínima pasa de 6.000 a 12
 *  16.0–18.5  Guardar producto y aviso "Producto actualizado"
 *  19.0–20.5  Existencias completas: 156 productos
 *  21.0–24.5  Filtrar existencias → Estado de existencia → Bajos o negativos
 *  25.0–27.5  la lista filtrada vuelve a seis productos
 *  28.0–31.5  /dashboard/venta y escaneo del producto en negativo
 *  32.0–34.5  Coca-Cola 1.35 L en el ticket a $34.00 con Stock -2.000
 *  35.0–38.5  su fila en existencias con el badge Existencia negativa
 *  39.0–48.0  Estadísticas y su sección Existencias bajas o negativas
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Las filas con badge: existencia, mínimo y señal. */
const SIGNALS = windowAt(700);

/** El bloque Inventario de la hoja de producto, con la existencia mínima. */
const MIN_STOCK = windowAt(1000);

/** El panel de filtros de existencias. */
const FILTER = windowAt(700);

/** El carrito, donde el producto en negativo se cobra igual. */
const CART = windowAt(800);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip:
    "videos/punto-listo/plv-20260907-existencias-bajas/01-existencias-bajas.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? SIGNALS,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260907-existencias-bajas.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Cuándo se acabó?",
    subline: "…y te enteras cuando el cliente lo pide.",
    until: 4.74,
  },

  beats: [
    {
      name: "El anaquel vacío",
      from: 0,
      to: 4.74,
      layout: "mobile-ui",
      // Both badge colours are in frame from the first second: the ámbar of a
      // low stock and the red of a negative one.
      panes: [take({ trimBefore: 2.0 })],
    },
    {
      name: "El mínimo",
      from: 4.74,
      to: 11.75,
      layout: "mobile-ui",
      // Real time: 12 is typed into Existencia mínima and saved inside the
      // line that explains what a mínimo is for.
      panes: [take({ trimBefore: 12.0, frame: MIN_STOCK })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 2.2, volume: 0.28 },
      ],
    },
    {
      name: "La lista para el proveedor",
      from: 11.75,
      to: 17.74,
      layout: "mobile-ui",
      // The filter is opened, "Bajos o negativos" is chosen, and the list
      // collapses to the six products that are the shopping list.
      panes: [take({ trimBefore: 21.0, frame: FILTER })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 4.2, volume: 0.22 },
      ],
    },
    {
      name: "El negativo no frena",
      from: 17.74,
      to: 23.96,
      layout: "mobile-ui",
      // A product sitting at -2.000 is scanned and charged like any other:
      // the line "no te frena la venta" is demonstrated, not asserted.
      panes: [take({ trimBefore: 28.5, playbackRate: 1.1, frame: CART })],
      callout: {
        text: "Negativo = recontar, no parar",
        left: 40,
        top: 1120,
        at: 3.4,
      },
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Desde el celular",
      from: 23.96,
      to: 30.74,
      layout: "mobile-ui",
      // The same signals, in Estadísticas, on the phone — the owner walking
      // in rather than being notified.
      panes: [take({ trimBefore: 39.5, playbackRate: 1.1 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 30.74,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 31.72, note: 32.87, pill: 34.0 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const existenciasBajasProps: PosDemoProps = posDemoSchema.parse(input);
