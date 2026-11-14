import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Video 49 — Foto por foto #1: no pasa el código
 * (PLV-20261113-fotos-sin-codigo). A new format cut like a TikTok photo
 * post: three shop photos in hard cuts, one big band each, then the app, then
 * photo 1 again so the video loops on its own. No voice: music, bands and one
 * sound per cut. The ask is a pill, since an end card would break the loop.
 *
 * Photos: generated with Codex (1024x1536), the same tiendita in all three.
 * Cover-fitted they scale 1.25x and lose 100px a side; their upper third is
 * calm background, where the bands sit (frame y ≈ 300–460).
 *
 * Proof: `plv-20260903-cobro-rapido/01-cobro-rapido.mp4` (1170x2532), played
 * from 8.3s: "c" is typed at 8.5, "con" brings up Conchas vainilla at 9.1,
 * Enter adds it at 11.0 and the sale reads "2 productos $38.00" (held
 * through 12.4). The approved window is 7.8–11.2s; it starts 0.5s later so
 * the result holds 0.7s instead of 0.2s. Source rows: search field 475–627,
 * results 650–886, "Productos en la venta" 890–1340 (count and total
 * 1180–1305). Same rule as the claims review: the app does not fix the
 * barcode; the way out is searching by name.
 *
 * Audio: PhotoStory requires a voice file, so `sin-voz.mp3` is 8.4s of
 * silence with an empty `sin-voz.json` caption list beside it.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const ART = "videos/punto-listo/plv-20261113-fotos-sin-codigo";
const BAND = { y: 300, size: 88, animate: false } as const;

const PHOTOS = {
  scanner: `${ART}/01-codigo-arrugado.jpg`,
  line: `${ART}/02-fila.jpg`,
  bread: `${ART}/03-pan-sin-codigo.jpg`,
} as const;

const LINE_AT = 1.4;
const BREAD_AT = 2.8;
const APP_AT = 4.2;
const LOOP_AT = 7.6;
const END = 8.4;

/** Seconds into the card at which the sale reads "2 productos $38.00". */
const ADDED_IN_CARD = 2.7;

const FIRST_BAND = {
  ...BAND,
  type: "title",
  text: "No pasa el código.",
} as const;

const input = {
  audioFile: `${ART}/sin-voz.mp3`,
  // No voice to sit under, so the bed carries the video (≈ -16 LUFS).
  music: { ...MUSIC.nastelbom, volume: 0.45 },

  scenes: [
    {
      name: "Foto 1 · código arrugado",
      from: 0,
      to: LINE_AT,
      photo: PHOTOS.scanner,
      zoom: { from: 1, to: 1.03, originX: 0.5, originY: 0.6 },
    },
    {
      name: "Foto 2 · la fila",
      from: LINE_AT,
      to: BREAD_AT,
      photo: PHOTOS.line,
      zoom: { from: 1, to: 1.03, originX: 0.5, originY: 0.6 },
    },
    {
      name: "Foto 3 · pan sin código",
      from: BREAD_AT,
      to: APP_AT,
      photo: PHOTOS.bread,
      zoom: { from: 1, to: 1.03, originX: 0.5, originY: 0.6 },
    },
    {
      name: "Punto Listo · búsqueda por nombre",
      from: APP_AT,
      to: LOOP_AT,
      photo: PHOTOS.bread,
      zoom: { from: 1.03, to: 1.06, originX: 0.5, originY: 0.6 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: "videos/punto-listo/plv-20260903-cobro-rapido/01-cobro-rapido.mp4",
        source: SOURCE,
        trimBefore: 8.3,
        // The search field down to the sale's product count and total.
        crop: { left: 30, top: 450, width: 1110, height: 880 },
        ring: { left: 70, top: 1165, width: 420, height: 155, at: ADDED_IN_CARD },
        top: 500,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "Foto 1 otra vez",
      from: LOOP_AT,
      to: END,
      photo: PHOTOS.scanner,
      zoom: { from: 1.015, to: 1, originX: 0.5, originY: 0.6 },
    },
  ],

  overlays: [
    { ...FIRST_BAND, from: 0, until: LINE_AT },
    {
      ...BAND,
      type: "title",
      text: "Y la fila crece.",
      from: LINE_AT,
      until: BREAD_AT,
    },
    {
      ...BAND,
      type: "title",
      text: "O ni código tiene.",
      from: BREAD_AT,
      until: APP_AT,
    },
    {
      ...BAND,
      type: "title",
      text: "Búscalo por *nombre*.",
      animate: true,
      from: APP_AT,
      until: LOOP_AT,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1340,
      from: 5.4,
      until: LOOP_AT,
    },
    { ...FIRST_BAND, from: LOOP_AT },
  ],

  sfx: [
    { sound: SFX.softHit, at: LINE_AT, volume: 0.45 },
    { sound: SFX.softHit, at: BREAD_AT, volume: 0.45 },
    { sound: SFX.whoosh, at: APP_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: APP_AT + ADDED_IN_CARD, volume: 0.5 },
    { sound: SFX.softHit, at: LOOP_AT, volume: 0.45 },
  ],

  // No voice: the bands carry every word.
  captions: { from: 0, until: 0 },
  end: END,
} satisfies z.input<typeof photoStorySchema>;

export const fotosSinCodigoProps: PhotoStoryProps =
  photoStorySchema.parse(input);
