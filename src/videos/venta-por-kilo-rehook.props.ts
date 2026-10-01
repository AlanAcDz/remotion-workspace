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
 * Video 03b — Venta por kilo, nuevo inicio (PLV-20260921-venta-por-kilo-rehook).
 * A copy of `venta-por-kilo.props.ts` where only the opening changes: the hook
 * poses the 350 g at $38/kg sum and lets $13.30 appear at real speed just
 * after "¿cuánto es?". Every later beat keeps its original clip and framing,
 * retimed to the new voiceover. Cut from the single take
 * `01-venta-por-kilo.mp4` (1170x2532, 42.93s, 30fps).
 *
 * The voiceover is one ElevenLabs take with the "…" pause shortened
 * (0.69s → 0.25s) and the pause after "¿cuánto es?" shortened (0.93s → 0.73s),
 * so $13.30 holds on screen before "Agregas".
 *
 * The record's editing notes rule out scale b-roll — "la interfaz es la
 * prueba" — so every beat is a crop into the numbers themselves: 0.35, the
 * $38.00 / kg label, the mixed-unit ticket and the -0.350 movement.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.6  Inicio dashboard
 *   3.8– 5.5  búsqueda "jitomate" → Jitomate saladet $38.00 / kg
 *   6.17      la línea del jitomate entra al carrito
 *   6.2– 8.3  1 producto $3.80 con cantidad 0.1
 *   8.5–10.3  se escribe 0.35 en la cantidad
 *  10.4–12.9  Jitomate saladet $13.30, $38.00 / kg, Stock 11.061 (estático)
 *  13.0–16.5  búsqueda "queso" → Queso Oaxaca $148.00 / kg
 *  17.0–20.5  Queso Oaxaca a 0.5 kg → 2 productos $87.30
 *  21.0–23.0  búsqueda "conchas" → Conchas vainilla 120 g (pieza)
 *  23.2–25.5  3 productos $107.30 (kg + kg + pz)
 *  26.0–30.5  ticket: efectivo 200 → Cambio $92.70
 *  31.0–34.8  Venta completada: 0.350 kg, 0.500 kg y 1.000 pz en el folio 2074
 *  35.0–37.3  Existencias del jitomate: existencia actual 10.711
 *  37.5–42.9  Historial: movimiento Venta -0.350 ligado al folio 2074
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Panel pixels per source pixel, for placing overlays on top of the UI. */
const PANEL_SCALE = UI_ZONE.width / SOURCE.width;

/** Una sola línea del carrito: cantidad, precio por kilo y su importe. */
const LINE = windowAt(1145);

/** La tarjeta del ticket emitido, donde conviven kg y pz. */
const RECEIPT = windowAt(700);

/** La lista de movimientos de existencias del producto. */
const MOVEMENTS = windowAt(850);

/** "$38.00 / kg · Stock 11.061" está en la fila 1580 del recorte de línea. */
const PRICE_PER_KG_ROW = Math.round((1580 - 1145) * PANEL_SCALE);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? LINE,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260921-venta-por-kilo-rehook.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "350 g a $38/kg = ¿?",
    until: 4.62,
    fadeIn: false,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.62,
      layout: "mobile-ui",
      // Real time from the first frame with the jitomate line in the cart:
      // 0.35 is typed under "¿cuánto es?" and $13.30 lands at 4.2s, 0.29s after
      // the question ends (3.91s), then holds until "Agregas". Starting any
      // earlier would show the empty cart.
      panes: [take({ trimBefore: 6.2 })],
      sfx: [{ sound: SFX.pop, at: 4.2, volume: 0.28 }],
    },
    {
      name: "Captura 0.350",
      from: 4.62,
      to: 10.15,
      layout: "mobile-ui",
      // The quantity is typed at human speed under the line that dictates it.
      panes: [take({ trimBefore: 8.4, playbackRate: 0.9 })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 2.0, volume: 0.28 },
      ],
    },
    {
      name: "Importe proporcional",
      from: 10.15,
      to: 14.76,
      layout: "mobile-ui",
      // Held nearly still on $13.30 beside $38.00 / kg: the multiplication is
      // the claim, so it stays on screen for the whole line.
      panes: [take({ trimBefore: 10.4, playbackRate: 0.35 })],
      callout: {
        text: "Cálculo proporcional",
        left: 60,
        top: PRICE_PER_KG_ROW + 210,
        at: 0.6,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 0.5, volume: 0.22 },
      ],
    },
    {
      name: "Unidades mezcladas",
      from: 14.76,
      to: 19.78,
      layout: "mobile-ui",
      // The emitted ticket is the only frame where the units are written out
      // next to each other: 0.350 kg, 0.500 kg and 1.000 pz.
      panes: [take({ trimBefore: 31.3, playbackRate: 0.75, frame: RECEIPT })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Descuento fraccionario",
      from: 19.78,
      to: 24.12,
      layout: "mobile-ui",
      // The movement carries the same 0.350 back into inventory, tied to the
      // folio the sale just created.
      panes: [take({ trimBefore: 37.6, frame: MOVEMENTS })],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 0.4, volume: 0.22 },
      ],
    },
  ],

  cta: {
    from: 24.12,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 25.12, note: 26.23, pill: 27.21 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const ventaPorKiloRehookProps: PosDemoProps = posDemoSchema.parse(input);
