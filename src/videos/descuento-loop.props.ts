import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Video 30 — "¿Me lo deja en cuarenta?" en 8 segundos
 * (PLV-20261023-descuento-loop). Loop #2: video 23's format on another topic,
 * so the loop is tested apart from the Coca. The last frame returns to the
 * first and the ask is a pill, since an end card would break the loop.
 *
 * Photo: `mostrador.jpg`, generated with Codex (1024x1536): a customer's hand
 * sliding coins and a bill across the counter. Cover-fitted it scales 1.25x,
 * so the hand sits at frame y ≈ 1440–1690 and the shelves above are calm.
 *
 * App: `descuentos-por-cajero.png`, the owner's take
 * `plv-20260907-descuentos-por-cajero/02-estadisticas-dueno.mp4` at 14s
 * (1170x2532): Descuentos por cajero, Mariana López 930 ventas $125.53 and
 * Alan Acuña 927 ventas $98.46. Same tone as 10: a five-peso discount is
 * ordinary, so nothing on screen accuses the cashier.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (original kept beside it): "cinco allá" 1.55, "¿quién los
 * dio?" 2.49–3.3, "Con Punto Listo" 3.51, "ves el descuento" 4.51, "cajero"
 * 5.74, end 6.24.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261023-descuento-loop/mostrador.jpg";
const ASK = {
  type: "bubble",
  text: "¿Me lo deja en 40?",
  x: 70,
  y: 330,
} as const;

const input = {
  audioFile: "audio/plv-20261023-descuento-loop-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "El mostrador",
      from: 0,
      to: 3.45,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, originX: 0.5, originY: 0.7 },
    },
    {
      name: "Descuentos por cajero",
      from: 3.45,
      to: 6.5,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.08, originX: 0.5, originY: 0.7 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: "videos/punto-listo/plv-20261023-descuento-loop/descuentos-por-cajero.png",
        still: true,
        source: SOURCE,
        crop: { left: 40, top: 1720, width: 1090, height: 760 },
        // Both cashiers' rows, on "ves el descuento".
        ring: { left: 50, top: 2180, width: 1070, height: 280, at: 1.05 },
        top: 260,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "El mostrador otra vez",
      from: 6.5,
      to: 7.4,
      photo: PHOTO,
      zoom: { from: 1.03, to: 1, originX: 0.5, originY: 0.7 },
    },
  ],

  overlays: [
    { ...ASK, from: 0, until: 3.45 },
    {
      type: "bubble",
      text: "Ándele pues 👍",
      x: 420,
      y: 640,
      side: "right",
      from: 1.5,
      until: 3.45,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1040,
      from: 4.6,
      until: 6.5,
    },
    { ...ASK, from: 6.5 },
  ],

  sfx: [
    { sound: SFX.pop, at: 1.5, volume: 0.5 },
    { sound: SFX.whoosh, at: 3.4, volume: 0.4 },
    { sound: SFX.pop, at: 4.5, volume: 0.5 },
    { sound: SFX.pop, at: 6.5, volume: 0.35 },
  ],

  captions: { from: 0, until: 7.4 },
  end: 7.4,
} satisfies z.input<typeof photoStorySchema>;

export const descuentoLoopProps: PhotoStoryProps = photoStorySchema.parse(input);
