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
 * Video 05 — Permisos de cajero (PLV-20260903-permisos-cajero), cut from two
 * takes recorded at the same viewport so the menus can be compared directly:
 * `01-sesion-cajero.mp4` (13.17s) and `02-sesion-dueno.mp4` (17.17s), both
 * 1170x2532 at 30fps.
 *
 * The record's editing notes ask for "dos clips nombrados y con encuadre
 * idéntico", so the cashier beats and the owner beat share one crop window
 * (MENU): the only thing that changes between them is the list itself.
 *
 * Cashier take landmarks (seconds):
 *   0.0– 0.9  /dashboard/venta del cajero
 *   1.0– 3.5  navegación desplegada: Mostrador, Inventario y compras, Control
 *   4.0– 7.6  Corte de caja del propio cajero: inicial $1,058.23, esperado $2,649.76
 *   8.0–13.1  vuelve a /dashboard/venta
 *
 * Owner take landmarks (seconds):
 *   0.0– 0.9  Inicio del dueño
 *   1.2– 3.5  navegación desplegada: suma Compras, Estadísticas y Equipo
 *   4.0– 9.5  /dashboard/members: Alan Acuña (Dueño) y Mariana López (Cajero)
 *  10.0–17.1  Estadísticas: ventas netas y desglose por método de pago
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** Panel pixels per source pixel, for placing overlays on top of the UI. */
const PANEL_SCALE = UI_ZONE.width / SOURCE.width;

/** The shared framing: the whole navigation list, cashier or owner. */
const MENU = windowAt(200);

/** El corte de caja: apertura, inicial y esperado del turno. */
const CORTE = windowAt(300);

/** La lista de miembros con su rol y lo que ese rol permite. */
const EQUIPO = windowAt(300);

/** El menú del cajero termina en "Devoluciones" (fila 1300); el globo va debajo. */
const MENU_END_ROW = Math.round((1300 - 200) * PANEL_SCALE);

const CASHIER = "videos/punto-listo/plv-20260903-permisos-cajero/01-sesion-cajero.mp4";
const OWNER = "videos/punto-listo/plv-20260903-permisos-cajero/02-sesion-dueno.mp4";

interface ClipOptions {
  trimBefore?: number;
  playbackRate?: number;
  frame?: Rect;
}

const take = (clip: string, options: ClipOptions = {}) => ({
  clip,
  trimBefore: options.trimBefore ?? 0,
  frame: options.frame ?? MENU,
  playbackRate: options.playbackRate ?? 1,
});

const input = {
  audioFile: "audio/plv-20260903-permisos-cajero.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "¿Tu cajero ve tus costos?",
    subline: "…cuánto le ganas a cada producto.",
    until: 3.15,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.15,
      layout: "mobile-ui",
      // The cashier's own menu, held still: what it does not list is the
      // answer to the hook.
      panes: [take(CASHIER, { trimBefore: 1.2, playbackRate: 0.3 })],
    },
    {
      name: "Venta y corte propio",
      from: 3.15,
      to: 8.08,
      layout: "mobile-ui",
      // One continuous move from the menu into the cashier's own Corte de
      // caja, which is the half of the sentence that is easy to miss.
      panes: [take(CASHIER, { trimBefore: 3.4, frame: CORTE })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Acceso restringido",
      from: 8.08,
      to: 13.98,
      layout: "mobile-ui",
      // Back to the identical framing and held there, so the viewer can read
      // the whole list while the line enumerates what is missing from it.
      panes: [take(CASHIER, { trimBefore: 1.0, playbackRate: 0.35 })],
      callout: {
        text: "Solo lo necesario para cobrar",
        left: 40,
        top: MENU_END_ROW + 40,
        at: 1.2,
      },
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Vista del dueño",
      from: 13.98,
      to: 19.18,
      layout: "mobile-ui",
      // Same window, second session: Corte de caja, Historial de ventas and
      // Estadísticas are all on screen at once, which is exactly the three
      // things the line claims the owner reviews.
      panes: [take(OWNER, { trimBefore: 1.2, playbackRate: 0.45 })],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
    {
      name: "Acceso individual",
      from: 19.18,
      to: 24.01,
      layout: "mobile-ui",
      // Two named members with their own accounts and roles — no shared
      // password anywhere in the frame.
      panes: [
        take(OWNER, { trimBefore: 4.0, playbackRate: 0.9, frame: EQUIPO }),
      ],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 24.01,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 24.94, note: 26.04, pill: 27.1 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const permisosCajeroProps: PosDemoProps = posDemoSchema.parse(input);
