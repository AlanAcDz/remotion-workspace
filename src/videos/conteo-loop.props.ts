import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Loop #5 — el conteo en la libreta (PLV-20261113-conteo-loop). Loop #3's
 * structure (`libreta-loop.props.ts`) on La Libreta's best topic, the count
 * (`libreta-conteo.props.ts`): 24 in, 12 sold, 9 on the shelf asked on the
 * page, answered by Punto Listo's adjustment, and back to the page.
 *
 * Photo: Libreta #2's `libreta.jpg` (Codex, 1024x1536), reused as is. The
 * page's margin rule sits at frame x ≈ 162; captions own y 1280–1680.
 *
 * App: `01-ajuste-menos-3.png`, `plv-20260903-diferencias-inventario/01-
 * diferencias-inventario.mp4` at 17.0s (1170x2532): Existencia contada 9,
 * Actual 12.000 / Contado 9 / Ajuste -3.000, and Motivo "Recuento físico del
 * refrigerador" fully typed (no caret). The Ajuste row is ringed.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.25s and the
 * tempo lifted 4% (original kept beside it), so the card lands by 3.1s:
 * "Llegaron" 0.04, "Vendí" 1.37, "nueve" 2.52, "En Punto Listo" 3.08,
 * "ajuste" 4.20, "menos tres" 4.87, "con su motivo" 5.47, last word ends
 * 6.20 (file 6.45).
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261023-libreta-conteo/libreta.jpg";
const RED = "#D7261E";

/** Frame 0's page; the last scene repeats it so the seam is invisible. */
const PAGE = [
  { type: "hand", text: "Llegaron 24", x: 220, y: 420, write: 0 },
  { type: "hand", text: "Vendí 12", x: 250, y: 560, write: 0 },
  {
    type: "hand",
    text: "Hay  9  ¿?",
    x: 280,
    y: 720,
    size: 124,
    color: RED,
    rotate: -4,
    write: 0,
  },
] as const;

const NUEVE_AT = 2.52;
const CARD_AT = 3.05;
const MENOS_TRES_AT = 4.87;
const BACK_AT = 6.4;
const END = 7.3;

const input = {
  audioFile: "audio/plv-20261113-conteo-loop-edit.mp3",
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
        clip: "videos/punto-listo/plv-20261113-conteo-loop/01-ajuste-menos-3.png",
        still: true,
        source: SOURCE,
        // Existencia contada down to the Motivo field.
        crop: { left: 40, top: 1250, width: 1090, height: 810 },
        // Ajuste -3.000, on "menos tres".
        ring: {
          left: 60,
          top: 1688,
          width: 1050,
          height: 100,
          at: MENOS_TRES_AT - CARD_AT,
        },
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
      // The 9 of "Hay 9 ¿?".
      x: 562,
      y: 790,
      width: 96,
      height: 140,
      from: NUEVE_AT,
      until: CARD_AT,
      draw: 0.3,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1120,
      from: 5.2,
      until: BACK_AT,
    },
    ...PAGE.map((line) => ({ ...line, from: BACK_AT })),
  ],

  sfx: [
    { sound: SFX.softHit, at: NUEVE_AT, volume: 0.3 },
    { sound: SFX.whoosh, at: CARD_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: MENOS_TRES_AT, volume: 0.5 },
    { sound: SFX.pop, at: BACK_AT, volume: 0.35 },
  ],

  captions: { from: 0, until: END },
  end: END,
} satisfies z.input<typeof photoStorySchema>;

export const conteoLoopProps: PhotoStoryProps = photoStorySchema.parse(input);
