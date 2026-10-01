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
 * Video 02b — Cobro rápido, nuevo inicio (PLV-20260921-cobro-rapido-rehook).
 * A copy of `cobro-rapido.props.ts` where only the opening changes: the hook
 * plays the 100 being typed and Cambio $62.00 appearing at real speed instead
 * of holding the finished change at 0.25x. Every later beat keeps its original
 * clip and framing, retimed to the new voiceover. Cut from the single take
 * `01-cobro-rapido.mp4` (1170x2532, 29.60s, 30fps).
 *
 * The voiceover is one ElevenLabs take with the pause before "Escaneas"
 * shortened (0.48s → 0.12s); the "cien…" pause is kept.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.6  Inicio dashboard
 *   1.0– 4.3  Venta vacía, campo de escaneo listo
 *   4.5– 5.0  se escanea Peñafiel 600 ml → 1 producto $18.00
 *   7.8–11.2  búsqueda "concha" → Conchas vainilla → 2 productos $38.00
 *  13.6–13.9  se abre el ticket "Venta nueva" (transición)
 *  13.9–14.6  ticket asentado, efectivo 38.00
 *  14.6–15.0  se escribe 100 → Cambio $62.00
 *  15.0–17.9  "Venta lista para cobrar" (estático)
 *  18.0       "Cobrando…"
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
  audioFile: "audio/plv-20260921-cobro-rapido-rehook.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "Cambio: $62.00",
    until: 3.9,
    fadeIn: false,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.9,
      layout: "mobile-ui",
      // Real time from the settled ticket at Total $38.00: the 100 is typed
      // under "cien" and Cambio $62.00 lands at 1.1s. "Cobrando…" (18.0s)
      // only reaches the last two frames of the crossfade, under beat 2.
      panes: [take({ trimBefore: 13.9 })],
    },
    {
      name: "Escaneo y búsqueda",
      from: 3.9,
      to: 9.09,
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
      from: 9.09,
      to: 12.92,
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
      from: 12.92,
      to: 16.56,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 17.7, frame: RECEIPT })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 0.3, volume: 0.22 },
      ],
    },
    {
      name: "Historial",
      from: 16.56,
      to: 20.96,
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
    from: 20.96,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 21.88, note: 22.85, pill: 23.82 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const cobroRapidoRehookProps: PosDemoProps = posDemoSchema.parse(input);
