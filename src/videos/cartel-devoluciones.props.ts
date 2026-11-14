import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "El Cartel" 02 en 8 segundos — "No se aceptan devoluciones" (PLV-20261113-
 * cartel-devoluciones). El Cartel #1 in the loop's length: the sign is
 * lettered from frame 0, Punto Listo answers it with two stills, and the last
 * scene eases back to frame 0's framing and lettering. A pill, no end card.
 *
 * Photo: `cartel.jpg`, generated with Codex (1024x1536, `cartel-raw.png` is
 * the original): a blank fluorescent-yellow cartulina taped beside a
 * tiendita's register. Cover-fitted it scales 1.25x and loses 100px a side:
 * image (x, y) lands at frame (1.25x - 100, 1.25y). The poster spans image
 * x ≈ 140–910, y ≈ 112–1022, so frame x ≈ 75–1037, y ≈ 140–1278; the black
 * marker lettering is written by the composition, so it is exact.
 *
 * Proof, both from `plv-20260907-devoluciones-autorizadas/01-devoluciones-
 * autorizadas.mp4` (1170x2532), in Mariana's (cashier) session, reused from
 * `plv-20261030-chat-devolucion/`:
 *  02-autorizacion.png  15.5s, 1090x1310: Devolver venta completa · folio
 *                       2082 · Correo / Contraseña del administrador, typed
 *                       on the cashier's own screen (ADR 0004)
 *  03-devuelta.png      29s, 1090x1000: Folio 2082 · Mariana López ·
 *                       Devuelta · $26.00
 *
 * Voice: `-edit` is the ElevenLabs take with its one long pause (0.58s after
 * the question) cut to 0.35s and the tempo lifted 4% (original kept beside
 * it), 8.04s: "devoluciones" 0.71, "Mejor así" 1.74, "en Punto Listo" 2.60,
 * "cada devolución" 3.78, "pide la autorización" 4.74, "dueño" 5.95, "y
 * queda" 6.53, "folio" 7.35, end 7.81.
 */

const SOURCE = { width: 1090 } as const;
const DIR = "videos/punto-listo/plv-20261113-cartel-devoluciones";
const PROOF = "videos/punto-listo/plv-20261030-chat-devolucion";
const PHOTO = `${DIR}/cartel.jpg`;
const MARKER = "#151515";

const CIRCLE_AT = 0.72; // "devoluciones"
const CARD_AT = 2.6; // "en Punto Listo"
const PILL_AT = 4.1; // "devolución"
const FOLIO_AT = 6.5; // "y queda con su folio"
const FOLIO_WORD_AT = 7.35; // "folio"
const BACK_AT = 7.95;
const END = 8.5;

const ZOOM_ORIGIN = { originX: 0.5, originY: 0.4 } as const;
const BEHIND_CARD = { dim: 0.55, blur: 10 } as const;

/** The lettering on the poster, as it is on frame 0. */
const SIGN = { type: "hand", color: MARKER, rotate: -1, write: 0 } as const;
const LETTERING = [
  { ...SIGN, text: "NO SE ACEPTAN", x: 180, y: 560, size: 124 },
  { ...SIGN, text: "DEVOLUCIONES", x: 170, y: 760, size: 128 },
] as const;

const input = {
  audioFile: "audio/plv-20261113-cartel-devoluciones-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "El cartel",
      from: 0,
      to: CARD_AT,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, ...ZOOM_ORIGIN },
    },
    {
      name: "Punto Listo · autorización",
      from: CARD_AT,
      to: FOLIO_AT,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.07, ...ZOOM_ORIGIN },
      ...BEHIND_CARD,
      card: {
        clip: `${PROOF}/02-autorizacion.png`,
        still: true,
        source: { ...SOURCE, height: 1310 },
        // Devolver venta completa down to the administrator's password field.
        crop: { left: 0, top: 0, width: 1090, height: 920 },
        top: 290,
      },
    },
    {
      name: "Punto Listo · folio",
      from: FOLIO_AT,
      to: BACK_AT,
      photo: PHOTO,
      zoom: { from: 1.07, to: 1.08, ...ZOOM_ORIGIN },
      ...BEHIND_CARD,
      card: {
        clip: `${PROOF}/03-devuelta.png`,
        still: true,
        source: { ...SOURCE, height: 1000 },
        // Folio 2082, Mariana López, Devuelta and $26.00, above the products.
        crop: { left: 0, top: 0, width: 1090, height: 640 },
        ring: {
          left: 35,
          top: 30,
          width: 300,
          height: 100,
          at: FOLIO_WORD_AT - FOLIO_AT,
        },
        top: 400,
      },
    },
    {
      // Eases back to frame 0's framing, so the loop seam is invisible.
      name: "El cartel otra vez",
      from: BACK_AT,
      to: END,
      photo: PHOTO,
      zoom: { from: 1.03, to: 1, ...ZOOM_ORIGIN },
    },
  ],

  overlays: [
    ...LETTERING.map((line) => ({ ...line, from: 0, until: CARD_AT })),
    {
      type: "circle",
      x: 556,
      y: 830,
      width: 840,
      height: 210,
      from: CIRCLE_AT,
      until: CARD_AT,
      draw: 0.4,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      y: 1150,
      from: PILL_AT,
      until: BACK_AT,
    },
    ...LETTERING.map((line) => ({ ...line, from: BACK_AT })),
  ],

  sfx: [
    { sound: SFX.softHit, at: CIRCLE_AT, volume: 0.3 },
    { sound: SFX.whoosh, at: CARD_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: PILL_AT, volume: 0.5 },
    { sound: SFX.whoosh, at: FOLIO_AT - 0.05, volume: 0.25 },
    { sound: SFX.pop, at: BACK_AT, volume: 0.35 },
  ],

  captions: { from: 0, until: BACK_AT },
  end: END,
} satisfies z.input<typeof photoStorySchema>;

export const cartelDevolucionesProps: PhotoStoryProps =
  photoStorySchema.parse(input);
