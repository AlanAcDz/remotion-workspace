import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";

/**
 * Video 45 — "¿A cuánto la das? #1: la Coca de 600" (PLV-20261113-a-cuanto-
 * coca). A new format on the PhotoStory template, built to earn comments: a
 * question the shop owner answers with their own shop. Frame 0 is the counter
 * photo with the question on a band, the three prices on the tent card and a
 * "Comenta tu precio 👇" bubble; then Punto Listo answers over the dimmed
 * photo, and a pill instead of an end card.
 *
 * Photo: `coca-mostrador.jpg`, generated with Codex (1024x1536): an unbranded
 * 600 ml cola (plain red label) beside a blank white tent card on a worn
 * counter. Cover-fitted it scales 1.25x and loses 100px a side: image (x, y)
 * lands at frame (1.25x - 100, 1.25y). The bottle spans frame x ≈ 230–470,
 * y ≈ 520–1375; the tent card's face x ≈ 500–1005, y ≈ 955–1385, and the
 * prices are written on it by the composition, so they are exact.
 *
 * Proof: stills of `plv-20260903-catalogo-base/01-catalogo-base.mp4`
 * (1170x2532). The proof product is Maseca, so the voice never says "Coca"
 * over the app.
 *  01-editar-precio-26.png  at 38.4s: Editar producto, Maseca 1 kg, Precio
 *                           venta 26 (it read 25.00 at 34–36s). Cropped to
 *                           Producto … Precio venta (source y 580–2000); the
 *                           Costo field and its "márgenes" helper sit below
 *                           the fold, outside the crop.
 *  02-venta-maseca-26.png   at 52s: Productos en la venta, 1 producto
 *                           $26.00, Maseca 1 kg $26.00 / pz.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.2s (0.35s left
 * the voice ending at 10.5s) and the tempo lifted 4% (original kept beside
 * it). Voiced onsets on the edit: "¿Dieciocho?" 2.87, "¿Veinte?" 3.78,
 * "¿Veintidós?" 4.57–5.34, "Cuando lo subas" 5.52, "en Punto Listo"
 * 6.38–7.24, "una vez" 7.85–8.32, "y así se cobra en caja" 8.63–9.96.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const DIR = "videos/punto-listo/plv-20261113-a-cuanto-coca";
const PHOTO = `${DIR}/coca-mostrador.jpg`;
const MARKER = "#151515";

const PRICE_18_AT = 2.85;
const PRICE_20_AT = 3.76;
const PRICE_22_AT = 4.55;
const EDIT_AT = 5.4;
const CHARGE_AT = 8.58;
const PILL_AT = 6.55;
const END = 10.2;

const BEHIND_CARD = { dim: 0.55, blur: 10 } as const;

/** Written on the tent card in a black marker, one price per line. */
const PRICE = {
  type: "hand",
  x: 655,
  size: 130,
  color: MARKER,
  rotate: -2,
  write: 0.35,
  until: EDIT_AT,
} as const;

const input = {
  audioFile: "audio/plv-20261113-a-cuanto-coca-edit.mp3",
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "El mostrador",
      from: 0,
      to: EDIT_AT,
      photo: PHOTO,
      zoom: { from: 1, to: 1.05, originX: 0.6, originY: 0.62 },
    },
    {
      name: "Punto Listo · precio",
      from: EDIT_AT,
      to: CHARGE_AT,
      photo: PHOTO,
      zoom: { from: 1.05, to: 1.07, originX: 0.6, originY: 0.62 },
      ...BEHIND_CARD,
      card: {
        clip: `${DIR}/01-editar-precio-26.png`,
        still: true,
        source: SOURCE,
        // Producto (Maseca 1 kg) down to Precio venta (26).
        crop: { left: 24, top: 580, width: 830, height: 1420 },
        ring: { left: 34, top: 1852, width: 808, height: 136, at: 0.6 },
        top: 240,
        width: 640,
      },
    },
    {
      name: "Punto Listo · cobro",
      from: CHARGE_AT,
      to: END,
      photo: PHOTO,
      zoom: { from: 1.07, to: 1.08, originX: 0.6, originY: 0.62 },
      ...BEHIND_CARD,
      card: {
        clip: `${DIR}/02-venta-maseca-26.png`,
        still: true,
        source: SOURCE,
        // Productos en la venta: 1 producto $26.00, Maseca 1 kg $26.00 / pz.
        crop: { left: 30, top: 880, width: 1110, height: 820 },
        ring: { left: 50, top: 1380, width: 1075, height: 150, at: 0.45 },
        top: 600,
      },
    },
  ],

  overlays: [
    {
      type: "title",
      kicker: "¿A CUÁNTO LA DAS? #1",
      text: "¿A cuánto das la\n*Coca de 600*?",
      y: 285,
      size: 76,
      animate: false,
      from: 0,
      until: EDIT_AT,
    },
    { ...PRICE, text: "$18", y: 975, from: PRICE_18_AT },
    { ...PRICE, text: "$20", y: 1100, from: PRICE_20_AT },
    { ...PRICE, text: "$22", y: 1225, from: PRICE_22_AT },
    {
      type: "bubble",
      text: "Comenta tu precio 👇",
      x: 130,
      y: 1395,
      from: 0,
      until: EDIT_AT,
    },
    {
      type: "pill",
      text: "Prueba gratis 14 días · link en la bio",
      // Between the cards (bottom ≈ 1335) and the caption band (≈ 1495).
      y: 1352,
      from: PILL_AT,
    },
  ],

  sfx: [
    { sound: SFX.softHit, at: PRICE_18_AT, volume: 0.3 },
    { sound: SFX.softHit, at: PRICE_20_AT, volume: 0.3 },
    { sound: SFX.softHit, at: PRICE_22_AT, volume: 0.3 },
    { sound: SFX.whoosh, at: EDIT_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: PILL_AT, volume: 0.45 },
    { sound: SFX.whoosh, at: CHARGE_AT - 0.05, volume: 0.25 },
  ],

  // The band, the card and the bubble carry the question on the photo.
  captions: { from: EDIT_AT, until: END },
  end: END,
} satisfies z.input<typeof photoStorySchema>;

export const aCuantoCocaProps: PhotoStoryProps = photoStorySchema.parse(input);
