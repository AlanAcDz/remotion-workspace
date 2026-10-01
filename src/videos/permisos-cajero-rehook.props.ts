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
 * Video 05b — Permisos de cajero, nuevo inicio
 * (PLV-20261001-permisos-cajero-rehook). The weakest original (1.77s average
 * on TikTok) opened on an abstract question. This cut opens on the comparison
 * itself: both sessions' menus side by side from frame 0, so the difference is
 * visible before a word is understood.
 *
 * Takes: `01-sesion-cajero.mp4` (13.17s) and `02-sesion-dueno.mp4` (17.17s),
 * both 1170x2532 at 30fps and recorded at the same viewport, so one crop
 * frames both drawers identically.
 *
 * The original's review found the cashier menu *does* show Catálogo and
 * Existencias; what it lacks is Compras, Estadísticas and Equipo — the only
 * three items the narration names.
 *
 * Landmarks (seconds): both drawers fully open by 1.25s and stay open until
 * ~3.5s. Cashier: Corte de caja (inicial $1,058.23, esperado $2,649.76) from
 * 4.5s. Owner: Equipo with Dueño / Cajero and the cashier's permission note
 * from 4.5s.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/**
 * The drawer from "Mostrador" down to the role card ("Rol: Cajero" /
 * "Rol: Dueño"), which labels each side in the app's own words.
 */
const DRAWER: Rect = {
  x: 0,
  y: 250 / SOURCE.height,
  width: 760 / SOURCE.width,
  height: 1830 / SOURCE.height,
};

/** Same aspect, pushed in on the half of the menu where the two differ. */
const DRAWER_LOWER: Rect = {
  x: 0,
  y: 900 / SOURCE.height,
  width: 490 / SOURCE.width,
  height: 1180 / SOURCE.height,
};

/** A small push-in over the hook, same aspect and bottom edge as DRAWER. */
const DRAWER_PUSH: Rect = {
  x: 0,
  y: (250 + 1830 * 0.15) / SOURCE.height,
  width: (760 * 0.85) / SOURCE.width,
  height: (1830 * 0.85) / SOURCE.height,
};

const CORTE = windowAt(300);
const EQUIPO = windowAt(300);

/** Two cards with the drawer's aspect, side by side in the UI zone. */
const CARD_HEIGHT = 1228;
const CARD_WIDTH = Math.round((CARD_HEIGHT * 760) / 1830);
const CARD_TOP = Math.round((UI_ZONE.height - CARD_HEIGHT) / 2);
const GAP = UI_ZONE.width - CARD_WIDTH * 2 - 40;
const LEFT_CARD = {
  left: 20,
  top: CARD_TOP,
  width: CARD_WIDTH,
  height: CARD_HEIGHT,
  radius: 28,
};
const RIGHT_CARD = { ...LEFT_CARD, left: 20 + CARD_WIDTH + GAP };

const CASHIER =
  "videos/punto-listo/plv-20260903-permisos-cajero/01-sesion-cajero.mp4";
const OWNER =
  "videos/punto-listo/plv-20260903-permisos-cajero/02-sesion-dueno.mp4";

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (clip: string, options: ClipOptions = {}) => ({
  clip,
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? DRAWER,
  playbackRate: options.playbackRate ?? 1,
});

/** Both drawers, cashier left and owner right, optionally pushing in. */
const sideBySide = (
  trimBefore: number,
  zoom?: { to: Rect; start: number; end: number },
) =>
  [
    { clip: CASHIER, box: LEFT_CARD },
    { clip: OWNER, box: RIGHT_CARD },
  ].map(({ clip, box }) => ({
    ...take(clip, { trimBefore, playbackRate: 0.5 }),
    box,
    ...(zoom
      ? { zoomTo: zoom.to, zoomStart: zoom.start, zoomEnd: zoom.end }
      : {}),
  }));

const input = {
  audioFile: "audio/plv-20261001-permisos-cajero-rehook.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "Tu cajero vs. tú",
    subline: "Mismo sistema, otro menú",
    until: 4.93,
    fadeIn: false,
  },

  beats: [
    {
      name: "Dos menús",
      from: 0,
      to: 4.93,
      layout: "mobile-ui",
      // Both drawers open from frame 0, pushing in slowly so the frame is
      // never still.
      panes: sideBySide(1.3, { to: DRAWER_PUSH, start: 0, end: 4.9 }),
    },
    {
      name: "Su propio corte",
      from: 4.93,
      to: 8.44,
      layout: "mobile-ui",
      panes: [take(CASHIER, { trimBefore: 4.4, frame: CORTE })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Fuera de su acceso",
      from: 8.44,
      to: 13.05,
      layout: "mobile-ui",
      // Back to the comparison, pushed into the half where the owner has
      // Compras, Estadísticas and Equipo and the cashier has nothing.
      panes: sideBySide(1.6, { to: DRAWER_LOWER, start: 0.2, end: 1.6 }),
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.pop, at: 1.6, volume: 0.28 },
      ],
    },
    {
      name: "Cada quien su cuenta",
      from: 13.05,
      to: 17.81,
      layout: "mobile-ui",
      panes: [take(OWNER, { trimBefore: 4.4, frame: EQUIPO })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 17.81,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 18.86, note: 19.93, pill: 20.4 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const permisosCajeroRehookProps: PosDemoProps =
  posDemoSchema.parse(input);
