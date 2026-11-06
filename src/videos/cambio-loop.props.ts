import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Loop #4 — ¿Te pagan con doscientos? (PLV-20261106-cambio-loop). A strict copy
 * of Loop #3's structure and timing with only the topic changed, from kilo to
 * change, to tell the format apart from the topic.
 *
 * Photo: Libreta #1's `libreta.jpg`, as in `libreta-loop.props.ts`.
 *
 * App: `reto/01-cambio-respuesta.png` (1170x2532), from `plv-20260903-venta-
 * por-kilo/01-venta-por-kilo.mp4`: Efectivo recibido 200, Total $107.30,
 * Cambio $92.70.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "doscientos" 2.08, "Noventa" 3.16,
 * "Sin libreta" 4.55, end 5.25. The question runs longer than Loop #3's, so the
 * page returns at 5.3s instead of 5.0s, after "Sin libreta".
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";
const RED = "#D7261E";

/** Frame 0's page; the last scene repeats it so the seam is invisible. */
const PAGE = [
  { type: "hand", text: "Cuenta $107.30", x: 220, y: 420, write: 0 },
  { type: "hand", text: "Pagó $200", x: 250, y: 560, write: 0 },
  {
    type: "hand",
    text: "Cambio = ¿?",
    x: 220,
    y: 720,
    size: 124,
    color: RED,
    rotate: -4,
    write: 0,
  },
] as const;

const CARD_AT = 2.7;
const BACK_AT = 5.3;
const END = 6.4;

const input = {
  audioFile: "audio/plv-20261106-cambio-loop-edit.mp3",
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
        clip: "videos/punto-listo/reto/01-cambio-respuesta.png",
        still: true,
        source: SOURCE,
        crop: { left: 40, top: 1440, width: 1090, height: 760 },
        ring: { left: 70, top: 1950, width: 1030, height: 210, at: 0.3 },
        top: 300,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "La libreta otra vez",
      from: BACK_AT,
      to: END,
      photo: PHOTO,
      zoom: { from: 1.03, to: 1, originX: 0.4, originY: 0.42 },
    },
  ],

  overlays: [
    ...PAGE.map((line) => ({ ...line, from: 0, until: CARD_AT })),
    {
      type: "circle",
      x: 700,
      y: 790,
      width: 250,
      height: 180,
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
    { sound: SFX.pop, at: BACK_AT, volume: 0.35 },
  ],

  captions: { from: 0, until: END },
  end: END,
} satisfies z.input<typeof photoStorySchema>;

export const cambioLoopProps: PhotoStoryProps = photoStorySchema.parse(input);
