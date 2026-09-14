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
 * Video 10 — Descuentos por cajero (PLV-20260907-descuentos-por-cajero), cut
 * from two takes recorded at the same viewport, as the record's editing notes
 * require: `01-caja-cajera.mp4` (33.60s) carries beats 1 to 3 from Mariana's
 * register, and `02-estadisticas-dueno.mp4` (18.17s) carries beats 4 and 5
 * from the owner's Estadísticas. Both are 1170x2532 at 30fps.
 *
 * Tone note from the record: five pesos is an ordinary discount, not a fraud.
 * The closing beats stay on the table, never on the cashier.
 *
 * Cashier take landmarks (seconds):
 *   0.0– 6.5  se arma la venta: Paketaxo Quexo 70 g y Sabritas 49 g
 *   7.0– 9.5  2 productos, $44.00
 *  10.0–11.5  ticket abierto con Descuento de la venta en 0.00
 *  12.0–14.5  se teclea 5 → Descuento $5.00 y Total $39.00
 *  15.0–16.5  efectivo 50 → Cambio $11.00
 *  17.0–20.5  Venta completada: ticket folio 2169 con su descuento
 *  21.0–23.5  Historial: folio 2169 a nombre de Mariana López
 *  24.0–33.6  el folio expandido, con Descuento $5.00 en el detalle
 *
 * Owner take landmarks (seconds):
 *   0.0– 0.9  Inicio del dueño
 *   1.0– 6.5  Estadísticas: ventas netas y Descuentos aplicados $223.99
 *   7.0– 8.5  métodos de pago y señales de existencias
 *   9.0–18.1  Productos más vendidos y la tabla Descuentos por cajero
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** El resumen del ticket: descuento, total y cambio. */
const TICKET = windowAt(1000);

/** El ticket emitido y, antes, el resumen de la venta. */
const RECEIPT = windowAt(900);

/** La fila del folio en el historial y su detalle expandido. */
const HISTORY = windowAt(1000);

/** Los totales del periodo, arriba de Estadísticas. */
const TOTALS = windowAt(700);

/** La tabla Descuentos por cajero. */
const BY_CASHIER = windowAt(1145);

const CASHIER =
  "videos/punto-listo/plv-20260907-descuentos-por-cajero/01-caja-cajera.mp4";
const OWNER =
  "videos/punto-listo/plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4";

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (clip: string, options: ClipOptions = {}) => ({
  clip,
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? TICKET,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260907-descuentos-por-cajero.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Cuánto se descuenta sin ti?",
    subline: "…cuando tú no estás.",
    until: 4.13,
  },

  beats: [
    {
      name: "Cuando tú no estás",
      from: 0,
      to: 4.13,
      layout: "mobile-ui",
      // Held on the open ticket with the discount field still at 0.00 — the
      // field the question is about, before anyone touches it.
      panes: [take(CASHIER, { trimBefore: 10.0, playbackRate: 0.5 })],
    },
    {
      name: "El descuento se permite",
      from: 4.13,
      to: 9.53,
      layout: "mobile-ui",
      // The 5 is typed, the total drops to $39.00, and the sale is charged:
      // the cashier does this alone, which is the point of the line.
      panes: [
        take(CASHIER, {
          trimBefore: 11.5,
          playbackRate: 1.57,
          frame: RECEIPT,
        }),
      ],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 0.9, volume: 0.28 },
        { sound: SFX.ding, at: 4.3, volume: 0.22 },
      ],
    },
    {
      name: "Y queda registrado",
      from: 9.53,
      to: 15.32,
      layout: "mobile-ui",
      // Folio 2169, Mariana López, and Descuento $5.00 in the same expanded
      // record — folio and name, exactly as the line says.
      panes: [
        take(CASHIER, {
          trimBefore: 21.0,
          playbackRate: 1.05,
          frame: HISTORY,
        }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Por cajero",
      from: 15.32,
      to: 21.2,
      layout: "mobile-ui",
      // Second session, owner's view: from the period total of Descuentos
      // aplicados down to the per-cashier table.
      panes: [
        take(OWNER, { trimBefore: 6.5, playbackRate: 1.1, frame: TOTALS }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Se ven",
      from: 21.2,
      to: 26.89,
      layout: "mobile-ui",
      // The table is the protagonist of the close, per the editing notes:
      // two cashiers, two totals, no accusation.
      panes: [take(OWNER, { trimBefore: 12.4, frame: BY_CASHIER })],
      callout: {
        text: "Se permiten. Se ven.",
        left: 40,
        top: 1120,
        at: 2.6,
      },
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 26.89,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 27.86, note: 29.04, pill: 30.2 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const descuentosPorCajeroProps: PosDemoProps =
  posDemoSchema.parse(input);
