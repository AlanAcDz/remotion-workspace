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
 * Video 02 — Cobro rápido: folio y cambio (PLV-20260903-cobro-rapido), cut
 * from the single take `01-cobro-rapido.mp4` (1170x2532, 29.60s, 30fps).
 *
 * The edit opens on the change already calculated rather than on an empty
 * cart, which is what the record's editing notes ask for: "El primer segundo
 * debe mostrar Cambio o el ticket, no una pantalla vacía."
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.6  Inicio dashboard
 *   1.0– 4.3  Venta vacía, campo de escaneo listo
 *   4.5– 5.0  se escanea Peñafiel 600 ml → 1 producto $18.00
 *   7.8–11.2  búsqueda "concha" → Conchas vainilla → 2 productos $38.00
 *  13.6–14.8  se abre el ticket "Venta nueva", efectivo 38.00
 *  14.9–15.3  se escribe 100 → Cambio $62.00
 *  15.3–17.4  "Venta lista para cobrar" (estático)
 *  17.7–21.5  Venta completada: ticket folio 2053, recibido $100, cambio $62
 *  21.8–25.0  Historial de ventas: folio 2053 con cajero y Efectivo
 *  25.2–29.6  folio 2053 expandido con sus productos
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Panel pixels per source pixel, for placing overlays on top of the UI. */
const PANEL_SCALE = UI_ZONE.width / SOURCE.width;

/** Buscador y su lista de resultados, con las primeras filas del carrito. */
const SEARCH = windowAt(480);

/** El cuerpo del diálogo de cobro: efectivo recibido, Total y Cambio. */
const TICKET = windowAt(1145);

/** La tarjeta del ticket emitido, con folio, productos y totales. */
const RECEIPT = windowAt(700);

/** Las tarjetas de folio, sin los selectores de fecha de arriba. */
const HISTORY = windowAt(900);

/** "Venta lista para cobrar" está en la fila 1795; el globo se apoya arriba. */
const CAMBIO_NOTE_ROW = Math.round((1795 - 1145) * PANEL_SCALE);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip: "videos/punto-listo/plv-20260903-cobro-rapido/01-cobro-rapido.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? TICKET,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260903-cobro-rapido.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Se te hace fila…",
    subline: "…mientras sacas cuentas con la calculadora?",
    until: 4.14,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.14,
      layout: "mobile-ui",
      // Held almost still on the finished change, so the first frame already
      // answers the hook instead of showing an empty sale.
      panes: [take({ trimBefore: 15.5, playbackRate: 0.25 })],
    },
    {
      name: "Escaneo y búsqueda",
      from: 4.14,
      to: 9.52,
      layout: "mobile-ui",
      // One pass over both ways of adding a product: the scan at 4.5s and the
      // "concha" search that resolves at 11.1s, compressed into the line that
      // names them.
      panes: [take({ trimBefore: 4.4, playbackRate: 1.28, frame: SEARCH })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 0.47, volume: 0.28 },
        { sound: SFX.pop, at: 5.2, volume: 0.28 },
      ],
    },
    {
      name: "Cambio",
      from: 9.52,
      to: 13.4,
      layout: "mobile-ui",
      // Real time: the 100 is typed under "Pones con cuánto te pagaron" and
      // $62.00 lands on "ves el cambio exacto".
      panes: [take({ trimBefore: 13.7, playbackRate: 0.9 })],
      callout: {
        text: "El cambio aparece al momento",
        left: 40,
        top: CAMBIO_NOTE_ROW - 94,
        at: 1.9,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 1.67, volume: 0.22 },
      ],
    },
    {
      name: "Ticket con folio",
      from: 13.4,
      to: 17.15,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 17.7, frame: RECEIPT })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 0.3, volume: 0.22 },
      ],
    },
    {
      name: "Historial",
      from: 17.15,
      to: 21.13,
      layout: "mobile-ui",
      // Opens on the folio row that carries cajero and Efectivo, then the
      // recorded tap expands it right as the narration names both.
      panes: [take({ trimBefore: 21.8, frame: HISTORY })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 3.4, volume: 0.28 },
      ],
    },
  ],

  cta: {
    from: 21.13,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 22.42, note: 23.63, pill: 24.6 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const cobroRapidoProps: PosDemoProps = posDemoSchema.parse(input);
