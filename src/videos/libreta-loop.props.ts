import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Loop #3 — La Libreta en 8 segundos (PLV-20261030-libreta-loop). Crosses the
 * best average-watch format (La Libreta, 6.23s on #2) with the best
 * completion format (the loop, 14.4% on #23): Libreta #1's sum asked on the
 * page, answered by Punto Listo, and back to the page.
 *
 * Photo: Libreta #1's `libreta.jpg` (Codex, 1024x1536), reused as is, so the
 * writing sits where it did in `libreta-kilo.props.ts`.
 *
 * App: `01-jitomate-1330.png`, `plv-20260903-venta-por-kilo/01-venta-por-
 * kilo.mp4` at 11.5s (1170x2532): 1 producto $13.30, Jitomate saladet
 * $38.00 / kg at 0.35, ringed.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it): "a treinta y ocho" 1.50,
 * "kilo" 2.33, "Trece treinta" 2.79, "Sin libreta" 3.69, end 4.5.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";
const RED = "#D7261E";

/** Frame 0's page; the last scene repeats it so the seam is invisible. */
const PAGE = [
  { type: "hand", text: "Jitomate 350 g", x: 220, y: 420, write: 0 },
  { type: "hand", text: "× $38 el kilo", x: 250, y: 560, write: 0 },
  {
    type: "hand",
    text: "= ¿?",
    x: 280,
    y: 720,
    size: 124,
    color: RED,
    rotate: -4,
    write: 0,
  },
] as const;

const CARD_AT = 2.7;
const BACK_AT = 5.0;

const input = {
  audioFile: "audio/plv-20261030-libreta-loop-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: CARD_AT,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, originX: 0.4, originY: 0.42 },
    },
    {
      name: "Punto Listo",
      from: CARD_AT,
      to: BACK_AT,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.07, originX: 0.4, originY: 0.42 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: "videos/punto-listo/plv-20261030-libreta-loop/01-jitomate-1330.png",
        still: true,
        source: SOURCE,
        crop: { left: 40, top: 1170, width: 1090, height: 700 },
        ring: { left: 50, top: 1345, width: 1075, height: 500, at: 0.3 },
        top: 300,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "La libreta otra vez",
      from: BACK_AT,
      to: 6.2,
      photo: PHOTO,
      zoom: { from: 1.03, to: 1, originX: 0.4, originY: 0.42 },
    },
  ],

  overlays: [
    ...PAGE.map((line) => ({ ...line, from: 0, until: CARD_AT })),
    {
      type: "circle",
      x: 400,
      y: 792,
      width: 330,
      height: 190,
      from: 1.5,
      until: CARD_AT,
      draw: 0.4,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1120,
      from: 3.6,
      until: BACK_AT,
    },
    ...PAGE.map((line) => ({ ...line, from: BACK_AT })),
  ],

  sfx: [
    { sound: SFX.softHit, at: 1.5, volume: 0.3 },
    { sound: SFX.whoosh, at: 2.65, volume: 0.4 },
    { sound: SFX.pop, at: 3.0, volume: 0.5 },
    { sound: SFX.pop, at: 5.0, volume: 0.35 },
  ],

  captions: { from: 0, until: 6.2 },
  end: 6.2,
} satisfies z.input<typeof photoStorySchema>;

export const libretaLoopProps: PhotoStoryProps = photoStorySchema.parse(input);
