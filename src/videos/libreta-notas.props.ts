import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "La Libreta" 03 — las notas del proveedor (PLV-20261030-libreta-notas).
 * Same notebook, a new paper artifact: the supplier's delivery slips piled on
 * the page. "¿A cuánto te dejó el Bonafont la última vez?" — the answer is in
 * some slip, somewhere. In Punto Listo, picking the product brings up the
 * cost it had on file ($9.88); today's $10.20 is typed with the slip number,
 * and the stock goes up on its own.
 *
 * Photo: `libreta-notas.jpg`, generated with Codex (1024x1536): the blank
 * page from Libreta #2 with illegible pink, yellow and white slips over its
 * lower third. Cover-fitted it scales 1.25x and loses 100px a side: image
 * (x, y) lands at frame (1.25x - 100, 1.25y). The page is blank from frame
 * y ≈ 250 to 1125; the slips sit at frame y ≈ 1160–1745.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "proveedor" 0.97, "Busca la nota" 3.49,
 * "si la encuentras" 4.78, "En Punto Listo" 6.21, "eliges el producto" 7.19,
 * "nueve ochenta y ocho" 10.54, "Hoy" 11.80, "diez veinte" 12.78, "registras"
 * 13.87, "con su nota" 14.83, "la existencia sube sola" 15.89, "Pruébalo"
 * 17.62, "14" 18.57, "sin tarjeta" 19.66, end 20.4.
 *
 * Proof: `plv-20260907-compras-proveedor/01-compras-proveedor.mp4`
 * (1170x2532), the same take as 07, 20 and 27:
 *  20.0–22.0  Bonafont 1 L chosen: Existencia actual 55.000, Costo 9.88
 *             (exported as `01-costo-988.png` at 20.6)
 *  22.0–22.75 Costo unitario retyped 9.88 → 10.20
 *  44.0       Historial: Compra +24.000 · Compra Nota 4521
 *             (exported as `02-historial-compra.png`)
 * The 9.88 is the cost the product had on file, so the copy says "el costo
 * que tenías", not "el último costo".
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261030-libreta-notas/libreta-notas.jpg";
const DIR = "videos/punto-listo/plv-20261030-libreta-notas";
const CLIP =
  "videos/punto-listo/plv-20260907-compras-proveedor/01-compras-proveedor.mp4";
const RED = "#D7261E";

/** Producto down to Importe, on the purchase sheet. */
const FORM_CROP = { left: 30, top: 800, width: 820, height: 940 } as const;

/** The Costo unitario label and field. */
const COST_FIELD = { left: 60, top: 1330, width: 760, height: 200 } as const;

const PAGE_END = 6.15;
const RETYPE_AT = 11.75;
const HISTORY_AT = 15.0;
const CTA_AT = 17.55;

const input = {
  audioFile: "audio/plv-20261030-libreta-notas-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: PAGE_END,
      photo: PHOTO,
      zoom: { from: 1, to: 1.08, originX: 0.5, originY: 0.55 },
    },
    {
      name: "Punto Listo · costo",
      from: PAGE_END,
      to: RETYPE_AT,
      photo: PHOTO,
      zoom: { from: 1.08, to: 1.11, originX: 0.5, originY: 0.55 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: `${DIR}/01-costo-988.png`,
        still: true,
        source: SOURCE,
        crop: FORM_CROP,
        ring: { ...COST_FIELD, at: 4.3 }, // "nueve ochenta y ocho"
        top: 220,
        width: 860,
      },
    },
    {
      name: "Punto Listo · diez veinte",
      from: RETYPE_AT,
      to: HISTORY_AT,
      photo: PHOTO,
      zoom: { from: 1.11, to: 1.12, originX: 0.5, originY: 0.55 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: CLIP,
        source: SOURCE,
        crop: FORM_CROP,
        // The field clears at 22.0 and reads 10.20 by 22.75: "diez veinte".
        trimBefore: 21.6,
        ring: { ...COST_FIELD, at: 1.2 },
        top: 220,
        width: 860,
      },
    },
    {
      name: "Punto Listo · historial",
      from: HISTORY_AT,
      to: CTA_AT,
      photo: PHOTO,
      zoom: { from: 1.12, to: 1.13, originX: 0.5, originY: 0.55 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: `${DIR}/02-historial-compra.png`,
        still: true,
        source: SOURCE,
        // Bonafont 1 L, its tabs and the Compra +24.000 · Nota 4521 row.
        crop: { left: 30, top: 330, width: 1110, height: 1080 },
        ring: { left: 50, top: 975, width: 1075, height: 370, at: 0.25 },
        top: 230,
      },
    },
  ],

  overlays: [
    {
      type: "hand",
      text: "Bonafont 1 L",
      x: 230,
      y: 330,
      size: 104,
      from: 0,
      until: PAGE_END,
      write: 0,
    },
    {
      type: "hand",
      text: "¿a cómo me lo dejó?",
      x: 245,
      y: 480,
      from: 0.9,
      until: PAGE_END,
      write: 1.0,
    },
    {
      type: "hand",
      text: "¿y la nota?",
      x: 300,
      y: 680,
      size: 110,
      color: RED,
      rotate: -4,
      from: 3.45,
      until: PAGE_END,
      write: 0.6,
    },
    // Around the pile of slips: "si la encuentras".
    {
      type: "circle",
      x: 625,
      y: 1450,
      width: 1000,
      height: 580,
      from: 4.75,
      until: PAGE_END,
      draw: 0.45,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: 3.45, volume: 0.35 },
    { sound: SFX.softHit, at: 4.75, volume: 0.3 },
    { sound: SFX.whoosh, at: 6.1, volume: 0.4 },
    { sound: SFX.pop, at: 10.45, volume: 0.5 },
    { sound: SFX.whoosh, at: 11.7, volume: 0.25 },
    { sound: SFX.whoosh, at: 14.95, volume: 0.3 },
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
    revealAt: { line2: 18.55, note: 19.65, pill: 20.0 },
  },
  end: 21.6,
} satisfies z.input<typeof photoStorySchema>;

export const libretaNotasProps: PhotoStoryProps = photoStorySchema.parse(input);
