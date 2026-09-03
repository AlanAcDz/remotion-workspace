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
 * Video 01 — Corte de caja, cut from the single take
 * `mobile-v5/01-corte-de-caja.mp4` (1170x2532, 26.57s, 30fps).
 *
 * Every beat is a window into one continuous recording rather than a separate
 * select, which is what lets the "Diferencia" beat play the dialog, the close,
 * and the closed-corte record as one unbroken take.
 *
 * Source landmarks (seconds into the recording):
 *   0.0– 0.6  Inicio dashboard
 *   1.0– 4.0  Corte de caja, abierto (static)
 *   6.4– 7.4  "Cerrar mi corte" dialog opens, field still on its placeholder
 *   7.5– 8.5  2885.59 is typed in
 *   8.5–10.9  Diferencia -$34.50 / "Faltan $34.50 en el cajón." (static)
 *  11.0–11.4  "Cerrando…"
 *  11.5–15.2  Corte cerrado: record card + green confirmation (static)
 *  15.5–18.9  Historial de ventas, top of the folio list (static)
 *  19.0–21.4  the folio list scrolls
 *  21.5–26.5  Folio 2074 expanded with its line items
 */

const SOURCE = { width: 1170, height: 2532 } as const;

/**
 * Every crop is the same full-width window slid down the phone screen, written
 * as the source pixel row it starts at — the number you measure off a still.
 * `uiWindow` gives it the UI zone's aspect, so the recording lands at 1:1 with
 * no distortion and no resampling.
 */
const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Panel pixels per source pixel, for placing overlays on top of the UI. */
const PANEL_SCALE = UI_ZONE.width / SOURCE.width;

/** Everything under the app header: title, buttons and the summary card. */
const SUMMARY_TOP = 145;
const SUMMARY = windowAt(SUMMARY_TOP);

/** The Efectivo / Tarjeta / Transferencia cards — what the hook asks about. */
const CASH_CARDS = windowAt(1145);

/**
 * Holds the whole "Cerrar mi corte" dialog, and — once the corte closes
 * underneath it — the closed record card lands inside the same window.
 */
const CLOSING = windowAt(573);

/** The folio cards, without the date pickers above them. */
const SALES_HISTORY = windowAt(900);

/** "Cobrar venta", "Ventas de hoy" and "Cajas abiertas". */
const HOME = windowAt(SUMMARY_TOP);

/** "$2,920.09" sits at source row 1070; the badge rides beside it. */
const ESPERADO_ROW = Math.round((1070 - SUMMARY_TOP) * PANEL_SCALE);

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (options: ClipOptions = {}) => ({
  clip: "videos/punto-listo/mobile-v5/01-corte-de-caja.mp4",
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? SUMMARY,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/corte-v1.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Te ha faltado dinero en la caja?",
    subline: "…y nadie sabe por qué.",
    until: 4.2,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.2,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 1.2, playbackRate: 0.4, frame: CASH_CARDS })],
    },
    {
      name: "Esperado",
      from: 4.2,
      to: 9.9,
      layout: "mobile-ui",
      panes: [take({ trimBefore: 1, playbackRate: 0.3 })],
      // Lands on "cuánto debería haber en caja" (6.97s absolute) rather than
      // on "Punto Listo", so the number arrives with the words that name it.
      callout: {
        text: "Esperado $2,920.09",
        left: 380,
        top: ESPERADO_ROW - 54,
        at: 2.77,
      },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 2.77, volume: 0.3 },
      ],
    },
    {
      name: "Diferencia",
      from: 9.9,
      to: 14.82,
      layout: "mobile-ui",
      panes: [
        // Real time, one take: the cash is typed under "Cuentas el efectivo",
        // -$34.50 appears under "si hay diferencia", and the corte closes into
        // its record card right as the voiceover says "dónde buscar" (14.00s).
        take({ trimBefore: 7.35, frame: CLOSING }),
      ],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        // 11.60s absolute — the word "diferencia", value already on screen.
        { sound: SFX.ding, at: 1.7, volume: 0.22 },
      ],
    },
    {
      name: "Folio",
      from: 14.82,
      to: 18.44,
      layout: "mobile-ui",
      panes: [
        // Opens on the list, then rides the recorded scroll under "cada venta
        // queda registrada con su folio" and stops before the take cuts to the
        // expanded folio at 21.5s.
        take({ trimBefore: 17.6, playbackRate: 0.9, frame: SALES_HISTORY }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Dispositivos",
      from: 18.44,
      to: 21.72,
      layout: "mobile-ui",
      panes: [
        // The take only spends its first 0.6s on Inicio, so this beat holds it
        // at 0.15x instead of running past the navigation.
        take({ playbackRate: 0.15, frame: HOME }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 21.72,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta, sin instalar nada",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 22.93, note: 23.99, pill: 25.28 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const corteProps: PosDemoProps = posDemoSchema.parse(input);
