import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "La Libreta" 01 — el kilo a mano (PLV-20261016-libreta-kilo). The 350 g at
 * $38/kg sum from 03b and Reto #2, worked out by hand in a shop notebook and
 * got wrong ($12.30), circled, corrected ($13.30); then Punto Listo does it.
 *
 * Photo: `libreta.jpg`, generated with Codex (1024x1536, blank lined page).
 * Cover-fitted to 1080x1920 it scales 1.25x and loses 100px each side, so an
 * image point (x, y) lands at (1.25x - 100, 1.25y); the page's margin rule is
 * at frame x ≈ 162. The numbers are written in the composition, not by the
 * image model, so they are exact.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.4s and the tempo
 * lifted 4% (original kept beside it): "a treinta y ocho" 2.53, "En la
 * libreta" 4.11, "Doce treinta" 5.27, "¿Seguro?" 6.22, "trece treinta" 7.60,
 * "Un peso menos" 8.68, "En Punto Listo" 11.27, "escribes" 12.23, "el total"
 * 14.79, "Pruébalo" 16.29, "14" 17.30, "sin tarjeta" 18.41, end 19.47.
 *
 * Proof: `plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4` (1170x2532):
 *   6.2– 8.3  Jitomate saladet in the cart at 0.1
 *   8.5–10.3  0.35 typed
 *  10.4–12.9  Jitomate saladet $13.30, $38.00 / kg (static)
 * From trimBefore 7.6 the typing lands on "escribes" and $13.30 holds until
 * the CTA, before the take moves on to the queso search.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";
const RED = "#D7261E";

/** The writing leaves with the page when the app card takes over. */
const PAGE_END = 11.15;

const input = {
  audioFile: "audio/plv-20261016-libreta-kilo-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: PAGE_END,
      photo: PHOTO,
      zoom: { from: 1, to: 1.08, originX: 0.4, originY: 0.42 },
    },
    {
      name: "Punto Listo",
      from: PAGE_END,
      to: 16.2,
      photo: PHOTO,
      zoom: { from: 1.08, to: 1.12, originX: 0.4, originY: 0.42 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: "videos/punto-listo/plv-20260903-venta-por-kilo/01-venta-por-kilo.mp4",
        source: SOURCE,
        crop: { left: 40, top: 1180, width: 1090, height: 680 },
        trimBefore: 7.6,
        ring: { left: 50, top: 1350, width: 1070, height: 490, at: 3.6 },
        top: 260,
      },
    },
  ],

  overlays: [
    { type: "hand", text: "Jitomate 350 g", x: 220, y: 420, from: 0, until: PAGE_END },
    {
      type: "hand",
      text: "× $38 el kilo",
      x: 250,
      y: 560,
      from: 2.5,
      until: PAGE_END,
      write: 0.8,
    },
    {
      type: "hand",
      text: "= $12.30",
      x: 280,
      y: 720,
      size: 124,
      from: 5.2,
      until: PAGE_END,
      write: 0.6,
    },
    {
      type: "circle",
      x: 505,
      y: 792,
      width: 500,
      height: 200,
      from: 6.15,
      until: PAGE_END,
      draw: 0.45,
    },
    {
      type: "hand",
      text: "$13.30",
      x: 560,
      y: 930,
      size: 124,
      color: RED,
      rotate: -4,
      from: 7.55,
      until: PAGE_END,
      write: 0.55,
    },
    {
      type: "hand",
      text: "−$1 en una venta",
      x: 330,
      y: 1110,
      size: 84,
      color: RED,
      rotate: -3,
      from: 8.65,
      until: PAGE_END,
      write: 0.9,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: 6.2, volume: 0.35 },
    { sound: SFX.whoosh, at: 11.1, volume: 0.4 },
    { sound: SFX.pop, at: 14.8, volume: 0.5 },
  ],

  captions: { from: 0, until: 16.2 },

  cta: {
    from: 16.2,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 17.3, note: 18.4, pill: 18.9 },
  },
  end: 20.7,
} satisfies z.input<typeof photoStorySchema>;

export const libretaKiloProps: PhotoStoryProps = photoStorySchema.parse(input);
