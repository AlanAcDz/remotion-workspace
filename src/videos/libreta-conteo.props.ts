import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "La Libreta" 02 — el conteo a mano (PLV-20261023-libreta-conteo). The 04b
 * count (Coca-Cola 600 ml: 12 in the system, 9 in the fridge) worked out in a
 * shop notebook: 24 in, 12 sold, 12 left… 9 counted. The 12 is struck and a 9
 * written over it, and the 3 are gone without a trace; then Punto Listo keeps
 * the difference as an adjustment with its reason.
 *
 * Photo: `libreta.jpg`, generated with Codex (1024x1536, blank lined page).
 * Cover-fitted it scales 1.25x and loses 100px a side: image (x, y) lands at
 * frame (1.25x - 100, 1.25y). The page's margin rule sits at frame x ≈ 162
 * and the page runs from y ≈ 240 to 1700; captions own y 1280–1680, so the
 * writing stays above 1250.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "Vendí" 1.54, "quedar doce" 2.86,
 * "refri hay nueve" 5.00, "tachas el doce" 7.24, "pones nueve" 8.52, "¿Y los
 * otros tres?" 9.52, "Ya nadie sabe" 10.90, "En Punto Listo" 11.98,
 * "capturas" 12.80, "la diferencia" 14.37, "con su motivo" 16.37,
 * "Pruébalo" 17.50, "14" 18.46, "sin tarjeta" 19.61, end 20.46.
 *
 * Proof: `plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4`
 * (1170x2532):
 *  10.0–12.2  Existencia actual 12.000, Ajuste Pendiente
 *  12.25      9 typed → Contado 9, Ajuste -3.000
 *  14.75–17   Motivo "Recuento físico del refrigerador" typed
 *  24.6–29.2  Historial headed by Ajuste -3.000 · Recuento físico del refrigerador
 * From trimBefore 11.2 the 9 lands on "capturas tu conteo" and the reason is
 * typed under "con su motivo"; the history card follows on the same words.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261023-libreta-conteo/libreta.jpg";
const CLIP =
  "videos/punto-listo/plv-20260903-diferencias-inventario/01-diferencias-inventario.mp4";
const RED = "#D7261E";

/** The writing leaves with the page when the app card takes over. */
const PAGE_END = 11.95;
const HISTORY_AT = 16.3;
const CTA_AT = 17.45;

const input = {
  audioFile: "audio/plv-20261023-libreta-conteo-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: PAGE_END,
      photo: PHOTO,
      zoom: { from: 1, to: 1.08, originX: 0.42, originY: 0.4 },
    },
    {
      name: "Punto Listo · conteo",
      from: PAGE_END,
      to: HISTORY_AT,
      photo: PHOTO,
      zoom: { from: 1.08, to: 1.11, originX: 0.42, originY: 0.4 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: CLIP,
        source: SOURCE,
        // Existencia contada down to the Motivo field.
        crop: { left: 40, top: 1250, width: 1090, height: 800 },
        trimBefore: 11.2,
        // Actual / Contado / Ajuste, on "la diferencia".
        ring: { left: 95, top: 1465, width: 985, height: 345, at: 2.45 },
        top: 260,
      },
    },
    {
      name: "Punto Listo · historial",
      from: HISTORY_AT,
      to: CTA_AT,
      photo: PHOTO,
      zoom: { from: 1.11, to: 1.12, originX: 0.42, originY: 0.4 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: CLIP,
        source: SOURCE,
        crop: { left: 40, top: 880, width: 1090, height: 800 },
        trimBefore: 25.0,
        // Ajuste -3.000 · Recuento físico del refrigerador.
        ring: { left: 45, top: 975, width: 1080, height: 300, at: 0.2 },
        top: 260,
      },
    },
  ],

  overlays: [
    { type: "hand", text: "Coca 600", x: 220, y: 330, size: 104, from: 0, until: PAGE_END },
    {
      type: "hand",
      text: "Llegaron: 24",
      x: 240,
      y: 480,
      from: 0.05,
      until: PAGE_END,
      write: 0.7,
    },
    {
      type: "hand",
      text: "Vendí: 12",
      x: 240,
      y: 620,
      from: 1.5,
      until: PAGE_END,
      write: 0.6,
    },
    {
      type: "hand",
      text: "Quedan: 12",
      x: 240,
      y: 760,
      from: 2.85,
      until: PAGE_END,
      write: 0.7,
    },
    {
      type: "hand",
      text: "Hay: 9",
      x: 240,
      y: 930,
      size: 120,
      color: RED,
      rotate: -4,
      from: 5.35,
      until: PAGE_END,
      write: 0.5,
    },
    // The 12 struck out, then the 9 written over it.
    {
      type: "hand",
      text: "——",
      x: 532,
      y: 742,
      size: 110,
      color: RED,
      rotate: -6,
      from: 7.3,
      until: PAGE_END,
      write: 0.35,
    },
    {
      type: "hand",
      text: "9",
      x: 690,
      y: 735,
      size: 120,
      from: 8.55,
      until: PAGE_END,
      write: 0.25,
    },
    {
      type: "hand",
      text: "¿y los otros 3?",
      x: 250,
      y: 1110,
      size: 96,
      color: RED,
      rotate: -3,
      from: 9.5,
      until: PAGE_END,
      write: 0.8,
    },
    {
      type: "circle",
      x: 545,
      y: 1160,
      width: 660,
      height: 170,
      from: 10.85,
      until: PAGE_END,
      draw: 0.45,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: 7.3, volume: 0.35 },
    { sound: SFX.softHit, at: 10.85, volume: 0.3 },
    { sound: SFX.whoosh, at: 11.9, volume: 0.4 },
    { sound: SFX.pop, at: 14.4, volume: 0.5 },
    { sound: SFX.whoosh, at: 16.25, volume: 0.3 },
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
    revealAt: { line2: 18.45, note: 19.6, pill: 20.0 },
  },
  end: 21.8,
} satisfies z.input<typeof photoStorySchema>;

export const libretaConteoProps: PhotoStoryProps = photoStorySchema.parse(input);
