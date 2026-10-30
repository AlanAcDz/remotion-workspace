import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * "El Cartel" 01 — "Se solicita cajero de confianza" (PLV-20261030-cartel-
 * cajero). A new format on the PhotoStory template: the hand-lettered sign
 * every tiendita tapes to its window owns the first frame, then Punto Listo
 * answers it. Variable: shares (0 on every video so far).
 *
 * Photo: `cartel.jpg`, generated with Codex (1024x1536): a blank fluorescent
 * poster taped to a shop window. Cover-fitted it scales 1.25x and loses
 * 100px a side: image (x, y) lands at frame (1.25x - 100, 1.25y). The poster
 * spans frame x ≈ 90–1005, y ≈ 305–1070; the lettering is written by the
 * composition in a black marker, so it is exact.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the tempo
 * lifted 4% (original kept beside it): "confianza" 1.28, "Ya lo encontraste"
 * 2.17, "¿Y ahora le das tu contraseña?" 3.19, "En Punto Listo" 5.06,
 * "propio usuario" 6.83, "ve la venta" 7.88, "su corte" 10.01, "Compras"
 * 10.77, "estadísticas" 11.57, "equipo" 12.71, "solo los ves tú" 13.48,
 * "Pruébalo" 14.64, "14" 15.64, "sin tarjeta" 16.82, end 17.6.
 *
 * Proof: `plv-20260903-permisos-cajero/` (1170x2532), the 05 takes:
 *  03-equipo.png       02-sesion-dueno.mp4 at 7s: Mariana López · Cajero ·
 *                      "Podrá cobrar ventas y administrar únicamente su
 *                      propio corte de caja."
 *  01-menu-cajero.png  01-sesion-cajero.mp4 at 2.5s: Cobrar venta, Corte de
 *                      caja, Historial, Catálogo, Existencias, Devoluciones
 *  02-menu-dueno.png   02-sesion-dueno.mp4 at 2.5s: adds Compras,
 *                      Estadísticas and Equipo
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261030-cartel-cajero/cartel.jpg";
const DIR = "videos/punto-listo/plv-20261030-cartel-cajero";
const MARKER = "#151515";

const SIGN_END = 5.0;
const MENU_AT = 7.85;
const OWNER_AT = 10.6;
const CTA_AT = 14.6;

const BEHIND_CARD = { dim: 0.55, blur: 10 } as const;

/** The lettering on the poster, as it is on frame 0. */
const SIGN = { type: "hand", color: MARKER, rotate: -1, write: 0 } as const;

const input = {
  audioFile: "audio/plv-20261030-cartel-cajero-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "El cartel",
      from: 0,
      to: SIGN_END,
      photo: PHOTO,
      zoom: { from: 1, to: 1.06, originX: 0.5, originY: 0.36 },
    },
    {
      name: "Punto Listo · su usuario",
      from: SIGN_END,
      to: MENU_AT,
      photo: PHOTO,
      zoom: { from: 1.06, to: 1.08, originX: 0.5, originY: 0.36 },
      ...BEHIND_CARD,
      card: {
        clip: `${DIR}/03-equipo.png`,
        still: true,
        source: SOURCE,
        // Mariana López, her Cajero role and what it allows.
        crop: { left: 30, top: 1100, width: 1110, height: 800 },
        ring: { left: 50, top: 1345, width: 1075, height: 290, at: 1.9 },
        top: 260,
      },
    },
    {
      name: "Punto Listo · lo que ve",
      from: MENU_AT,
      to: OWNER_AT,
      photo: PHOTO,
      zoom: { from: 1.08, to: 1.09, originX: 0.5, originY: 0.36 },
      ...BEHIND_CARD,
      card: {
        clip: `${DIR}/01-menu-cajero.png`,
        still: true,
        source: SOURCE,
        // Mostrador, Inventario y compras and Control: the cashier's menu.
        crop: { left: 0, top: 240, width: 900, height: 1000 },
        ring: { left: 20, top: 325, width: 860, height: 900, at: 0.3 },
        top: 220,
        width: 820,
      },
    },
    {
      name: "Punto Listo · lo que ves tú",
      from: OWNER_AT,
      to: CTA_AT,
      photo: PHOTO,
      zoom: { from: 1.09, to: 1.1, originX: 0.5, originY: 0.36 },
      ...BEHIND_CARD,
      card: {
        clip: `${DIR}/02-menu-dueno.png`,
        still: true,
        source: SOURCE,
        // Inventario y compras down to Equipo, in the owner's menu.
        crop: { left: 0, top: 820, width: 900, height: 1000 },
        // Estadísticas and Equipo: "estadísticas y tu equipo".
        ring: { left: 20, top: 1460, width: 860, height: 345, at: 0.95 },
        top: 220,
        width: 820,
      },
    },
  ],

  overlays: [
    { ...SIGN, text: "SE SOLICITA", x: 215, y: 400, size: 118, from: 0, until: SIGN_END },
    { ...SIGN, text: "CAJERO(A)", x: 205, y: 560, size: 158, from: 0, until: SIGN_END },
    { ...SIGN, text: "DE CONFIANZA", x: 175, y: 780, size: 116, from: 0, until: SIGN_END },
    {
      type: "circle",
      x: 545,
      y: 850,
      width: 820,
      height: 190,
      from: 1.25,
      until: SIGN_END,
      draw: 0.4,
    },
    {
      type: "bubble",
      text: "Jefe, ¿y la contraseña? 🙏",
      x: 110,
      y: 1150,
      side: "right",
      from: 3.15,
      until: SIGN_END,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: 1.25, volume: 0.3 },
    { sound: SFX.pop, at: 3.15, volume: 0.5 },
    { sound: SFX.whoosh, at: 4.95, volume: 0.4 },
    { sound: SFX.whoosh, at: 7.8, volume: 0.25 },
    { sound: SFX.whoosh, at: 10.55, volume: 0.25 },
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
    revealAt: { line2: 15.6, note: 16.8, pill: 17.2 },
  },
  end: 18.9,
} satisfies z.input<typeof photoStorySchema>;

export const cartelCajeroProps: PhotoStoryProps = photoStorySchema.parse(input);
