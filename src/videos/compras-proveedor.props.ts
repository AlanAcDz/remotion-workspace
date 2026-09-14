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
 * Video 07 — Compras al proveedor (PLV-20260907-compras-proveedor), cut from
 * the single take `01-compras-proveedor.mp4` (1170x2532, 57.00s, 30fps).
 *
 * The record flagged a seed gap for beat 5 — a supplier history of one row.
 * The recorded demo no longer has it: Purificadora del Valle already carries
 * six purchases, so the closing line runs as approved rather than trimmed.
 *
 * Because the supplier is seeded, the "Nuevo proveedor" dialog in the take is
 * opened and dismissed rather than saved, which is the fallback the editing
 * notes describe. The hook therefore sits on the purchase history itself —
 * the thing the question is actually about.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.9  Inicio
 *   1.0– 3.5  Compras: 24 compras con proveedor, nota y total
 *   4.0– 5.5  pestaña Proveedores con tres proveedores
 *   6.0– 8.5  diálogo Nuevo proveedor (se abre y se cierra sin guardar)
 *  12.0–12.9  hoja Registrar compra vacía
 *  13.0–17.5  Proveedor Purificadora del Valle y Referencia Nota 4521
 *  18.0–20.5  se elige Bonafont 1 L · pz → existencia actual 55.000
 *  21.0–24.5  Cantidad 24 y Costo unitario 10.20 → Importe $244.80
 *  25.0–26.5  se marca Actualizar costo
 *  27.0–29.5  Registrando… → 25 compras y aviso de compra registrada
 *  31.0–35.5  Editar Bonafont 1 L con el campo Costo ya en 10.20
 *  36.0–39.5  Existencias: Bonafont 1 L en 79.000 (55 + 24)
 *  40.0–45.5  Historial del producto: movimiento Compra +24.000, Nota 4521
 *  46.0–57.0  /dashboard/compras filtrado a Purificadora: seis compras
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** La tabla de compras: proveedor, nota, productos y total. */
const PURCHASES = windowAt(600);

/** La lista de compras encuadrada un poco más abajo, para el hook. */
const HISTORY = windowAt(700);

/** La cabecera de la hoja de compra: proveedor, referencia y producto. */
const SHEET_TOP = windowAt(650);

/** El renglón de la compra: cantidad, costo, Actualizar costo e importe. */
const SHEET_LINE = windowAt(950);

/** El historial de movimientos del producto. */
const MOVEMENTS = windowAt(700);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip:
    "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? PURCHASES,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260907-compras-proveedor.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿A cuánto fue la última vez?",
    subline: "…o te vas de memoria.",
    until: 5.19,
  },

  beats: [
    {
      name: "La nota perdida",
      from: 0,
      to: 5.19,
      layout: "mobile-ui",
      // The question is about the last delivery, so the hook opens on the
      // purchases that are already there rather than on an empty form.
      panes: [take({ trimBefore: 1.2, playbackRate: 0.8, frame: HISTORY })],
    },
    {
      name: "Registrar la compra",
      from: 5.19,
      to: 12.19,
      layout: "mobile-ui",
      // Proveedor, qué entró y a cuánto — filled in the order the line names
      // them, at recording speed.
      panes: [
        take({ trimBefore: 12.0, playbackRate: 1.29, frame: SHEET_TOP }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "El costo real",
      from: 12.19,
      to: 18.88,
      layout: "mobile-ui",
      // Runs from the 10.20 already typed, through the Actualizar costo
      // checkbox, and lands on the product's own Costo field showing 10.20 —
      // the claim proved on two screens inside one line.
      panes: [
        take({ trimBefore: 24.0, playbackRate: 1.65, frame: SHEET_LINE }),
      ],
      callout: { text: "Costo al día", left: 40, top: 1120, at: 1.4 },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 1.2, volume: 0.22 },
      ],
    },
    {
      name: "Entra al inventario",
      from: 18.88,
      to: 23.78,
      layout: "mobile-ui",
      // Real time: the existencia reads 79.000 and the first movement is a
      // Compra of +24.000 tied to Nota 4521.
      panes: [take({ trimBefore: 40.0, frame: MOVEMENTS })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "La próxima visita",
      from: 23.78,
      to: 30.44,
      layout: "mobile-ui",
      // The supplier's own history, six purchases deep, with the one just
      // recorded at the top.
      panes: [take({ trimBefore: 46.0 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 30.44,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 31.38, note: 32.6, pill: 33.7 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const comprasProveedorProps: PosDemoProps = posDemoSchema.parse(input);
