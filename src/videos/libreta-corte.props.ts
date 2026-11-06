import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "La Libreta" 04 — los $26 que no faltaban (PLV-20261106-libreta-corte). A cut
 * worked on paper comes up $26 short, and the app shows why: a refund nobody
 * wrote down. About 12s with the app at ~3s, a length not tried before.
 *
 * Photo: Libreta #1's `libreta.jpg` (Codex, 1024x1536).
 *
 * Figures: the demo store's, from `plv-20260907-devoluciones-autorizadas/01-
 * devoluciones-autorizadas.mp4` at 45s (1170x2532), exported as `01-corte.png`:
 * Inicial $925.81, Efectivo $1,475.96, Devoluciones $26.00, Esperado $2,375.77.
 * They add up: 925.81 + 1,475.96 = 2,401.77, minus 26 = 2,375.77. "Efectivo" is
 * gross, and Esperado already takes the refund off.
 *
 * Tone: nobody took anything. It is a refund that was not noted.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "veintiséis" 1.44, "No faltan" 2.77,
 * "devolución" 4.04, "En Punto Listo" 5.31, "tu corte" 6.53, "descuenta" 7.45,
 * "Pruébalo" 8.38, "14" 9.33, "sin tarjeta" 10.28, end 11.0.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";
const SHOT = "videos/punto-listo/plv-20261106-libreta-corte/01-corte.png";
const RED = "#D7261E";

/** Inicial, Esperado and the Efectivo card with its Devoluciones line. */
const CROP = { left: 30, top: 760, width: 1110, height: 800 } as const;

const CARD_AT = 2.75;
const ESPERADO_AT = 5.3;
const CTA_AT = 8.3;

const card = {
  clip: SHOT,
  still: true,
  source: SOURCE,
  crop: CROP,
  top: 300,
} as const;

const input = {
  audioFile: "audio/plv-20261106-libreta-corte-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: CARD_AT,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, originX: 0.42, originY: 0.45 },
    },
    {
      name: "Punto Listo · devoluciones",
      from: CARD_AT,
      to: ESPERADO_AT,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.07, originX: 0.42, originY: 0.45 },
      dim: 0.55,
      blur: 10,
      card: {
        ...card,
        ring: { left: 100, top: 1425, width: 540, height: 95, at: 1.3 },
      },
    },
    {
      name: "Punto Listo · esperado",
      from: ESPERADO_AT,
      to: CTA_AT,
      photo: PHOTO,
      zoom: { from: 1.07, to: 1.08, originX: 0.42, originY: 0.45 },
      dim: 0.55,
      blur: 10,
      card: {
        ...card,
        ring: { left: 70, top: 955, width: 460, height: 175, at: 1.25 },
      },
    },
  ],

  overlays: [
    { type: "hand", text: "Inicial $925.81", x: 215, y: 320, size: 84, from: 0, until: CARD_AT },
    { type: "hand", text: "+ Ventas efectivo $1,475.96", x: 215, y: 430, size: 72, from: 0, until: CARD_AT },
    { type: "hand", text: "= $2,401.77", x: 215, y: 540, size: 84, from: 0, until: CARD_AT },
    { type: "hand", text: "En cajón $2,375.77", x: 215, y: 680, size: 84, from: 0, until: CARD_AT },
    {
      type: "hand",
      text: "Faltan $26",
      x: 250,
      y: 860,
      size: 130,
      color: RED,
      rotate: -4,
      from: 0,
      until: CARD_AT,
    },
    {
      type: "circle",
      x: 520,
      y: 925,
      width: 640,
      height: 210,
      from: 1.44,
      until: CARD_AT,
      draw: 0.45,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: 1.44, volume: 0.3 },
    { sound: SFX.whoosh, at: 2.7, volume: 0.4 },
    { sound: SFX.pop, at: 4.05, volume: 0.5 },
    { sound: SFX.pop, at: 6.55, volume: 0.45 },
  ],

  captions: { from: 0, until: CTA_AT },

  cta: {
    from: CTA_AT,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 9.3, note: 10.28, pill: 10.7 },
  },
  end: 11.9,
} satisfies z.input<typeof photoStorySchema>;

export const libretaCorteProps: PhotoStoryProps = photoStorySchema.parse(input);
