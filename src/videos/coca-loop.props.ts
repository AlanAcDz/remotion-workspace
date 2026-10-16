import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Video 23 — "¿Se acabó la Coca?" en 8 segundos (PLV-20261016-coca-loop).
 * Video 17's topic and take at a third of its length, with one variable
 * changed: duration. The last frame returns to the first, so the video loops
 * on its own; the ask is a pill, since an end card would break the loop.
 *
 * Photo: `refri.jpg`, generated with Codex (1024x1536): a shop fridge whose
 * cola shelf is empty. Cover-fitted it scales 1.25x, so the empty shelf sits
 * at frame y ≈ 625–1125.
 *
 * App: `plv-20260907-existencias-bajas/coca-negativa.png` (1170x2532, the
 * filtered list at 7.2s of the take): Coca-Cola 1.35 L at -2.000 with its
 * Existencia negativa badge, ringed. Same rule as 09 and 17: the app filters,
 * it does not warn — no alerta, notificación or "te avisa".
 *
 * Voice: `-v2-edit` is the second ElevenLabs take with pauses cut to 0.35s
 * and the tempo lifted 4% (original kept beside it): "pidieron" 2.34, "Con"
 * 3.10, "ves lo que va bajo" 4.16, "antes de que te la pidan" 5.39–6.6. The
 * first take ("bajo…") ended the word abruptly; "bajo," lets it decay.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-coca-loop/refri.jpg";
const ASK = { type: "bubble", text: "¿Tiene Coca?", x: 80, y: 330 } as const;

const input = {
  audioFile: "audio/plv-20261016-coca-loop-v2-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "El refri",
      from: 0,
      to: 3.05,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, originX: 0.5, originY: 0.45 },
    },
    {
      name: "Existencias",
      from: 3.05,
      to: 6.1,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.08, originX: 0.5, originY: 0.45 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: "videos/punto-listo/plv-20260907-existencias-bajas/coca-negativa.png",
        still: true,
        source: SOURCE,
        crop: { left: 40, top: 150, width: 1090, height: 950 },
        ring: { left: 50, top: 150, width: 1070, height: 570, at: 1.15 },
        top: 230,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "El refri otra vez",
      from: 6.1,
      to: 7.2,
      photo: PHOTO,
      zoom: { from: 1.03, to: 1, originX: 0.5, originY: 0.45 },
    },
  ],

  overlays: [
    { ...ASK, from: 0, until: 3.05 },
    {
      type: "bubble",
      text: "Se acabó… 😬",
      x: 400,
      y: 760,
      side: "right",
      from: 1.8,
      until: 3.05,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1120,
      from: 4.4,
      until: 6.1,
    },
    { ...ASK, from: 6.1 },
  ],

  sfx: [
    { sound: SFX.pop, at: 1.8, volume: 0.5 },
    { sound: SFX.whoosh, at: 3.0, volume: 0.4 },
    { sound: SFX.pop, at: 4.2, volume: 0.5 },
    { sound: SFX.pop, at: 6.1, volume: 0.35 },
  ],

  captions: { from: 0, until: 7.2 },
  end: 7.2,
} satisfies z.input<typeof photoStorySchema>;

export const cocaLoopProps: PhotoStoryProps = photoStorySchema.parse(input);
