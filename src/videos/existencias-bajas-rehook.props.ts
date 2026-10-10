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
 * Video 17 — Existencias bajas, nuevo inicio
 * (PLV-20261009-existencias-bajas-rehook). Video 09 cut to ~18s with a hook
 * that names the Mexican shop and its product — "tu tiendita", "la Coca" —
 * over the Coca-Cola 1.35 L sitting at -2.000 with its red badge.
 *
 * Same take as 09, `01-existencias-bajas.mp4` (1170x2532, 48.03s, 30fps):
 *   6.0– 8.5  lista filtrada con Coca-Cola 1.35 L arriba (Existencia negativa)
 *  12.0–15.5  Existencia mínima de Bonafont 1 L pasa de 6.000 a 12
 *  21.0–25.0  Filtrar existencias → Bajos o negativos → seis productos
 *
 * The list holds still for only 2.5s, so the hook is a frame of it
 * (`coca-negativa.png`, 7.2s) pushing in, rather than the scroll.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s.
 * The same rule as 09 holds: no alerta, notificación or te avisa.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Coca-Cola 1.35 L at the top, Doraditas and Peñafiel Twist under it. */
const COCA = windowAt(110);

/** El bloque Inventario de la hoja de producto, con la existencia mínima. */
const MIN_STOCK = windowAt(1000);

/** El panel de filtros de existencias. */
const FILTER = windowAt(700);

const CLIP =
  "videos/punto-listo/plv-20260907-existencias-bajas/01-existencias-bajas.mp4";

/** The same window shrunk 8% toward its top edge, so the push-in keeps the Coca. */
const pushToTop = (rect: Rect, amount: number): Rect => ({
  x: rect.x + (rect.width * amount) / 2,
  y: rect.y,
  width: rect.width * (1 - amount),
  height: rect.height * (1 - amount),
});

const input = {
  audioFile: "audio/plv-20261009-existencias-bajas-rehook-edit.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Se acabó la Coca?",
    subline: "…y te enteras cuando el cliente la pide.",
    until: 4.71,
    fadeIn: false,
  },

  beats: [
    {
      name: "La Coca en negativo",
      from: 0,
      to: 4.71,
      layout: "mobile-ui",
      panes: [
        {
          clip: "videos/punto-listo/plv-20260907-existencias-bajas/coca-negativa.png",
          still: true,
          frame: COCA,
          zoomTo: pushToTop(COCA, 0.08),
          zoomStart: 0,
          zoomEnd: 4.71,
        },
      ],
    },
    {
      name: "El mínimo",
      from: 4.71,
      to: 8.35,
      layout: "mobile-ui",
      // Real time: 12 is typed into Existencia mínima and saved on "mínimo".
      panes: [{ clip: CLIP, trimBefore: 12.0, frame: MIN_STOCK }],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 2.2, volume: 0.28 },
      ],
    },
    {
      name: "La lista para el proveedor",
      from: 8.35,
      to: 12.83,
      layout: "mobile-ui",
      // "Bajos o negativos" is chosen and the list collapses to six products
      // on "lista", 3.45s in at 1.1x.
      panes: [
        { clip: CLIP, trimBefore: 21.2, playbackRate: 1.1, frame: FILTER },
      ],
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 3.45, volume: 0.22 },
      ],
    },
  ],

  cta: {
    from: 12.83,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 13.76, note: 15.06, pill: 15.45 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const existenciasBajasRehookProps: PosDemoProps =
  posDemoSchema.parse(input);
