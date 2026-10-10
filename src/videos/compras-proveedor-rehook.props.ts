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
 * Video 20 — Compras al proveedor, nuevo inicio
 * (PLV-20261009-compras-proveedor-rehook). The 02b recipe on video 07: open
 * on the real cost changing — 9.88 retyped as 10.20 — instead of asking about
 * the last delivery, and cut from 35s to ~20s.
 *
 * "Te costaba" rather than "la vez pasada": the purchase sheet pre-fills the
 * product's registered cost (`purchase-sheet.svelte`), not the last purchase.
 *
 * Same take as 07, `01-compras-proveedor.mp4` (1170x2532, 57.00s, 30fps):
 *  19.75      Bonafont 1 L elegido: existencia 55.000, Costo unitario 9.88
 *  20.75      Cantidad 24 → Importe $237.12
 *  22.25–22.75  se teclea 10.20 → Importe $244.80
 *  25.0       se marca Actualizar costo
 *  27.0–29.5  Registrando… y aviso de compra registrada
 *  31.0–35.5  Editar Bonafont 1 L con Costo 10.20
 *  40.0–43.2  existencia 79.000 (55 + 24)
 *  43.25      Historial: Compra +24.000, Nota 4521
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s.
 */

const SOURCE = { width: 1170, height: 2532 } as const;

const windowAt = (topPx: number): Rect => uiWindow(SOURCE, topPx);

/** El renglón de la compra: cantidad, costo, Actualizar costo e importe. */
const SHEET_LINE = windowAt(950);

/** El historial de movimientos del producto. */
const MOVEMENTS = windowAt(700);

const CLIP =
  "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4";

const input = {
  audioFile: "audio/plv-20261009-compras-proveedor-rehook-edit.mp3",
  captionStyle: "paper",
  music: MUSIC.nastelbom,

  hook: {
    text: "Te costaba $9.88",
    subline: "Hoy te lo dejaron a $10.20.",
    until: 5.64,
    fadeIn: false,
  },

  beats: [
    {
      name: "El costo cambia",
      from: 0,
      to: 5.64,
      layout: "mobile-ui",
      // 9.88 is on screen from frame 0; at 0.65x the 10.20 lands with
      // "diez veinte".
      panes: [
        {
          clip: CLIP,
          trimBefore: 19.8,
          playbackRate: 0.65,
          frame: SHEET_LINE,
        },
      ],
      sfx: [{ sound: SFX.pop, at: 4.6, volume: 0.28 }],
    },
    {
      name: "El costo real",
      from: 5.64,
      to: 11.52,
      layout: "mobile-ui",
      // The checkbox, the purchase saved, and the product's own Costo field
      // showing 10.20 — the whole line on two screens.
      panes: [
        { clip: CLIP, trimBefore: 24.0, playbackRate: 1.65, frame: SHEET_LINE },
      ],
      callout: { text: "Costo al día", left: 40, top: 1120, at: 1.4 },
      sfx: [
        { sound: SFX.whoosh, volume: 0.17 },
        { sound: SFX.ding, at: 1.2, volume: 0.22 },
      ],
    },
    {
      name: "Entra al inventario",
      from: 11.52,
      to: 14.8,
      layout: "mobile-ui",
      // Real time: existencia 79.000 for half a second, then the Historial
      // tab with Compra +24.000 heading the product's movements.
      panes: [{ clip: CLIP, trimBefore: 42.7, frame: MOVEMENTS }],
      sfx: [{ sound: SFX.whoosh, volume: 0.17 }],
    },
  ],

  cta: {
    from: 14.8,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 15.89, note: 16.99, pill: 17.4 },
  },
} satisfies z.input<typeof posDemoSchema>;

export const comprasProveedorRehookProps: PosDemoProps =
  posDemoSchema.parse(input);
