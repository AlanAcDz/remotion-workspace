import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { SFX } from "../template/schema";

/**
 * Video 32 — La Calaverita: el yogur que nadie vio
 * (PLV-20261023-calaverita-merma). A Día de Muertos calavera literaria for
 * the yogurt that expired at the back of the fridge, ending on Punto Listo's
 * merma adjustment. An experimental format: only the logo and the palette are
 * fixed, so it gets its own music bed; the voice is the standard one.
 *
 * Illustrations: generated with Codex (1024x1536), one series — the fridge,
 * La Flaca reading the date, the tendero at his tablet as she leaves. Cover-
 * fitted they scale 1.25x and lose 100px a side; papel picado owns frame
 * y < 130 and the calm band below it holds the verses.
 *
 * Music: `punto-listo-calaverita-bed.mp3`, Eleven Music (40s, -13.5 LUFS):
 * jarana, requinto and marimba at 100 bpm.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses over 0.55s cut to 0.55s,
 * at its own tempo, so the verse keeps its breath (original kept beside it):
 * "Al fondo" 2.84, "lo nuevo" 7.21, "Llegó la Flaca" 10.78, "Ya caducó"
 * 14.04, "El tendero" 17.88, "ajuste" 21.66, "motivo" 22.51, "historial"
 * 23.84, "Este Día de Muertos" 25.70, "Pruébalo" 30.04, "14" 30.92, "sin
 * tarjeta" 32.09, end 32.98.
 *
 * Proof: `plv-20261009-ticket-merma/01-merma-caducado.mp4` (1170x2532), Dan
 * Up fresa 350 g counted 38 → 35: Ajuste -3.000 at 5.0s, Motivo "Caducado"
 * typed 7.0–7.5s, Historial with Ajuste -3.000 · Caducado from 16.5s. The
 * app records the adjustment and its reason; it does not track expiry dates.
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const ART = "videos/punto-listo/plv-20261023-calaverita-merma";
const CLIP = "videos/punto-listo/plv-20261009-ticket-merma/01-merma-caducado.mp4";
const VERSE_Y = 165;
const VERSE_SIZE = 62;

/** Each couplet shows while it is said. */
const COUPLETS = [
  { text: "Al fondo del refri estaba\nun yogur, *solito y fiel*;", from: 2.8, until: 7.15 },
  { text: "lo nuevo llegó adelante\ny nadie *se acordó de él.*", from: 7.15, until: 10.7 },
  { text: "Llegó la Flaca en domingo\ny le revisó *la fecha*:", from: 10.7, until: 13.95 },
  { text: "—Ya caducó, compadrito,\n*esta merma ya está hecha.*", from: 13.95, until: 17.8 },
  { text: "El tendero no lo tira\nsin dejarlo *registrado*:", from: 17.8, until: 21.5 },
] as const;

const CARD_AT = 21.5;
const HISTORY_AT = 23.75;
const CLOSING_AT = 25.6;
const CTA_AT = 30.0;

const input = {
  audioFile: "audio/plv-20261023-calaverita-merma-edit.mp3",
  music: {
    src: "music/punto-listo-calaverita-bed.mp3",
    trimBefore: 0,
    volume: 0.13,
  },

  scenes: [
    {
      name: "El refri",
      from: 0,
      to: 10.7,
      photo: `${ART}/01-refri.jpg`,
      // Toward the lonely yogurt at the back of the shelf.
      zoom: { from: 1, to: 1.14, originX: 0.74, originY: 0.46 },
    },
    {
      name: "La Flaca",
      from: 10.7,
      to: 17.8,
      photo: `${ART}/02-catrina.jpg`,
      zoom: { from: 1, to: 1.08, originX: 0.55, originY: 0.5 },
    },
    {
      name: "El tendero",
      from: 17.8,
      to: CARD_AT,
      photo: `${ART}/03-tendero.jpg`,
      zoom: { from: 1, to: 1.05, originX: 0.6, originY: 0.6 },
    },
    {
      name: "Punto Listo · ajuste",
      from: CARD_AT,
      to: HISTORY_AT,
      photo: `${ART}/03-tendero.jpg`,
      zoom: { from: 1.05, to: 1.07, originX: 0.6, originY: 0.6 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: CLIP,
        source: SOURCE,
        // Existencia contada down to the Motivo field.
        crop: { left: 0, top: 1270, width: 1170, height: 930 },
        trimBefore: 6.0,
        // Ajuste -3.000 and Motivo "Caducado", on "motivo".
        ring: { left: 70, top: 1700, width: 1030, height: 340, at: 1.1 },
        top: 220,
      },
    },
    {
      name: "Punto Listo · historial",
      from: HISTORY_AT,
      to: CLOSING_AT,
      photo: `${ART}/03-tendero.jpg`,
      zoom: { from: 1.07, to: 1.08, originX: 0.6, originY: 0.6 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: CLIP,
        source: SOURCE,
        crop: { left: 0, top: 880, width: 1170, height: 930 },
        trimBefore: 16.6,
        // Ajuste -3.000 · Caducado, on top of the history.
        ring: { left: 35, top: 975, width: 1100, height: 303, at: 0.2 },
        top: 220,
      },
    },
    {
      name: "Hasta el otro año",
      from: CLOSING_AT,
      to: CTA_AT,
      photo: `${ART}/02-catrina.jpg`,
      zoom: { from: 1.08, to: 1.0, originX: 0.55, originY: 0.5 },
    },
  ],

  overlays: [
    {
      type: "title",
      text: "Para el yogur\n*que nadie vio*",
      kicker: "CALAVERITA 💀",
      y: VERSE_Y + 30,
      size: 84,
      animate: false,
      from: 0,
      until: 2.8,
    },
    ...COUPLETS.map((couplet) => ({
      type: "title" as const,
      text: couplet.text,
      y: VERSE_Y,
      size: VERSE_SIZE,
      from: couplet.from,
      until: couplet.until,
    })),
    // The last couplet sits under the app card.
    {
      type: "title",
      text: "ajuste con su motivo,\ny en su historial, *guardado.*",
      y: 1150,
      size: VERSE_SIZE,
      from: CARD_AT,
      until: CLOSING_AT,
    },
  ],

  sfx: [
    { sound: SFX.whoosh, at: 10.65, volume: 0.3 },
    { sound: SFX.whoosh, at: 17.75, volume: 0.3 },
    { sound: SFX.whoosh, at: CARD_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: CARD_AT + 1.1, volume: 0.5 },
    { sound: SFX.pop, at: HISTORY_AT + 0.2, volume: 0.4 },
  ],

  // The bands carry the verse; captions only for the closing line.
  captions: { from: CLOSING_AT, until: CTA_AT },

  cta: {
    from: CTA_AT,
    logo: "videos/punto-listo/logo.png",
    line1: "Pruébalo gratis",
    line2: "14 días",
    note: "sin tarjeta",
    pill: "El link está en la bio",
    sfx: [{ sound: SFX.softHit, volume: 0.3 }],
    revealAt: { line2: 30.9, note: 32.05, pill: 32.5 },
  },
  end: 34.3,
} satisfies z.input<typeof photoStorySchema>;

export const calaveritaMermaProps: PhotoStoryProps =
  photoStorySchema.parse(input);
