import { z } from "zod";
import { photoStorySchema, type PhotoStoryProps } from "../photo/schema";
import { MUSIC, SFX } from "../template/schema";
import { TICKET_SFX } from "../ticket/schema";

/**
 * Reto del mostrador #10 — la suma de la libreta (PLV-20261113-reto-suma-
 * libreta). Reto #6's find-the-error mechanic (question, a 3s countdown with
 * no voice, answer, proof, end card) on a handwritten notebook page.
 *
 * The page is the same sale as the proof recording, summed by hand without
 * the bread: Jitomate $13.30 + Queso $74.00 + Pan $20.00 is $107.30, written
 * as $87.30. Labelled as example figures.
 *
 * Photo: reuses `plv-20261016-libreta-kilo/libreta.jpg` (Codex, 1024x1536,
 * blank lined page). Cover-fitted it scales 1.25x and loses 100px a side;
 * the rules fall every ~45 frame px and the margin rule at frame x ≈ 162.
 *
 * Voice: `-edit` is the ElevenLabs take with pauses cut to 0.35s and the
 * tempo lifted 4% (16.21s; the 19.0s original kept beside it). Its captions
 * are split at `pause.at` into `-pregunta` / `-respuesta` files so "Aquí:"
 * never shares a page with "¿Lo ves?". Take clock: "¿Lo ves?" 2.70–3.14
 * (silence to 3.46), `pause.at` 3.40. Final timeline (+3s after the
 * pause): "Aquí" 6.47, "el total" 7.14, "Son" 8.09, "ciento siete treinta"
 * 8.38–9.75, "no ochenta y siete treinta" 9.75–11.46, "Veinte pesos
 * regalados" 11.46, "Con Punto Listo" 13.11, "la suma" 14.27/14.43, "la caja"
 * 15.35–16.11, "Pruébalo" 16.11, "catorce" 16.96, "sin" 18.12, "tarjeta"
 * 18.41–18.97, voice out 19.21.
 *
 * Proof: `ticket-107-30.png`, the frame at 32.0s of `plv-20260903-venta-por-
 * kilo/01-venta-por-kilo.mp4` (1170x2532). No frame before the cash is typed
 * (~27.3s) shows all three lines — Conchas sits below the fold of the cart —
 * so the card shows the completed ticket, cropped above Pago / Recibido /
 * Cambio: 0.350 kg Jitomate saladet $13.30, 0.500 kg Queso Oaxaca $74.00,
 * 1.000 pz Conchas vainilla $20.00, Total $107.30 (rows 1492–1578).
 */

const SOURCE = { width: 1170, height: 2532 } as const;
const PHOTO = "videos/punto-listo/plv-20261016-libreta-kilo/libreta.jpg";
const STILL = "videos/punto-listo/plv-20261113-reto-suma-libreta/ticket-107-30.png";
const RED = "#D7261E";
const PENCIL = "#5A534C";

const AUDIO = "audio/plv-20261113-reto-suma-libreta-edit.mp3";
const CAPTIONS = "captions/plv-20261113-reto-suma-libreta-edit";

const PAUSE_AT = 3.4; // take clock, in the silence after "¿Lo ves?"
const COUNTDOWN = 3;
const CIRCLE_AT = 7.14; // "el total"
const STRIKE_AT = 8.38; // "ciento"
const RIGHT_AT = 8.6; // "ciento siete treinta"
const CARD_AT = 11.46; // "Veinte pesos regalados"
const RING_AT = 14.43; // "la suma la hace la caja"
const CTA_AT = 16.11; // "Pruébalo"

/** Frame 0's page; it leaves with the photo when the app card takes over. */
function page(
  text: string,
  x: number,
  y: number,
  extra: { size?: number; color?: string; rotate?: number } = {},
) {
  return { type: "hand" as const, text, x, y, from: 0, until: CARD_AT, ...extra };
}

const input = {
  audioFile: AUDIO,
  hasVoice: true,
  pause: {
    at: PAUSE_AT,
    for: COUNTDOWN,
    captions: {
      question: `${CAPTIONS}-pregunta.json`,
      answer: `${CAPTIONS}-respuesta.json`,
    },
  },
  music: MUSIC.nastelbom,

  scenes: [
    {
      name: "La libreta",
      from: 0,
      to: CARD_AT,
      photo: PHOTO,
      zoom: { from: 1, to: 1.06, originX: 0.45, originY: 0.45 },
    },
    {
      name: "Punto Listo",
      from: CARD_AT,
      to: CTA_AT,
      photo: PHOTO,
      zoom: { from: 1.06, to: 1.09, originX: 0.45, originY: 0.45 },
      dim: 0.55,
      blur: 10,
      card: {
        clip: STILL,
        still: true,
        source: SOURCE,
        crop: { left: 122, top: 585, width: 926, height: 1000 },
        ring: {
          left: 140,
          top: 1492,
          width: 900,
          height: 86,
          at: RING_AT - CARD_AT,
        },
        top: 300,
      },
    },
  ],

  overlays: [
    page("Cifras de ejemplo", 690, 440, { size: 48, color: PENCIL, rotate: -1 }),
    page("Jitomate", 210, 520),
    page("13.30", 660, 520),
    page("Queso", 210, 655),
    page("74.00", 660, 655),
    page("Pan", 210, 790),
    page("20.00", 660, 790),
    page("——————————", 190, 880, { size: 100, rotate: -1 }),
    page("Total", 210, 990, { size: 110 }),
    {
      ...page("$87.30", 600, 990, { size: 110 }),
      strike: { at: STRIKE_AT, color: RED },
    },
    {
      type: "pill",
      text: "Reto del mostrador #10",
      y: 270,
      from: 0,
      until: CARD_AT,
    },
    {
      type: "countdown",
      prompt: "¡Comenta dónde está!",
      y: 1150,
      from: PAUSE_AT,
      for: COUNTDOWN,
    },
    {
      type: "circle",
      x: 560,
      y: 1045,
      width: 760,
      height: 170,
      from: CIRCLE_AT,
      until: CARD_AT,
      draw: 0.45,
    },
    {
      type: "hand",
      text: "$107.30",
      x: 560,
      y: 1150,
      size: 130,
      color: RED,
      rotate: -4,
      from: RIGHT_AT,
      until: CARD_AT,
      write: 0.7,
    },
  ],

  sfx: [
    ...[0, 1, 2].map((beat) => ({
      sound: TICKET_SFX.tick,
      at: PAUSE_AT + beat * (COUNTDOWN / 3),
      volume: 0.6,
    })),
    { sound: SFX.softHit, at: CIRCLE_AT, volume: 0.4 },
    { sound: SFX.pop, at: RIGHT_AT, volume: 0.5 },
    { sound: SFX.whoosh, at: CARD_AT - 0.05, volume: 0.4 },
    { sound: SFX.pop, at: RING_AT, volume: 0.55 },
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
    revealAt: { line2: 16.96, note: 18.12, pill: 18.6 },
  },
  end: 20.4,
} satisfies z.input<typeof photoStorySchema>;

export const retoSumaLibretaProps: PhotoStoryProps =
  photoStorySchema.parse(input);
