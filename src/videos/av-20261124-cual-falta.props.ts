import type { CualFaltaProps } from "../arya-shorts/cual-falta";
import { SFX } from "../template/schema";

/**
 * 27 · ¿Cuál falta? (AV-20261124-cual-falta). No voice, in Spanish. A memory
 * test: six cartoon pills for three seconds, two shuffles, one comes back
 * empty, then the turn into "¿ya se la di?" and the Spanish app.
 *
 * The three stills are frames of store-videos/clips/ios/es/01-today-dose.mp4
 * (1206 × 2622, demo data: Maya, Magic Drops):
 * - `01-dosis-pendiente.jpg` at 0.5 s: "DOSIS A TIEMPO" rows ≈ 635–670, Maya's
 *   row 698–925 with "¡Tomar ahora!" (row centre ≈ 811).
 * - `02-hoja-de-dosis.jpg` at 4.5 s: sheet top ≈ 1460, photo 1540–1910,
 *   "Marcar como tomada" 2165–2290 (centre 603, 2228), "Marcar como omitida"
 *   2328–2453.
 * - `03-dosis-tomada.jpg` at 6.87 s: the same row checked, 698–865, before
 *   the toast fires and the row leaves the list.
 * Every crop keeps other pets' avatars, counts and events out, so the screen
 * shows one pet and one treatment (Free tier).
 */
const DIR = "videos/arya/av-20261124-cual-falta";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const COVER_AT = 3.0;
const SHUFFLE_AT = 3.25;
const SHUFFLE_STEP = 0.45;
const OPEN_AT = 4.25;
const COUNTDOWN = [4.5, 5.0, 5.5];
const REVEAL_AT = 6.0;
const TURN_AT = 7.1;
const TURN_LINE_2_AT = 8.0;
const APP_AT = 9.9;
const SHEET_AT = 10.8;
const TAKEN_AT = 11.9;
const CTA_AT = 13.4;

/**
 * Tight 1:1 crops on a 900 px card: the row from the right edge of its avatar,
 * the sheet from its title down, cut inside the buttons' rounded ends.
 */
const ROW_CROP = { left: 236, width: 900 };

export const aryaCualFaltaProps: CualFaltaProps = {
  missing: 2,
  shuffles: [
    [2, 3, 0, 4, 5, 1],
    [3, 5, 4, 1, 2, 0],
  ],
  memorizeEnd: COVER_AT,
  coverAt: COVER_AT,
  shuffleAt: SHUFFLE_AT,
  shuffleStep: SHUFFLE_STEP,
  openAt: OPEN_AT,
  countdown: COUNTDOWN,
  revealAt: REVEAL_AT,
  turnAt: TURN_AT,
  turnLine2At: TURN_LINE_2_AT,
  appAt: APP_AT,
  hook: "Memoriza las 6.\nTienes 3 segundos.",
  question: "¿Cuál falta?",
  reveal: "¿Le atinaste? 👇",
  turn: ["Ahora imagina eso…", "con\n“¿ya se la di?”"],
  app: {
    lines: [
      { text: "Arya sí se acuerda.", from: APP_AT, to: TAKEN_AT },
      { text: "Cada toma, anotada.", from: TAKEN_AT, to: CTA_AT },
    ],
    shots: [
      {
        src: `${DIR}/01-dosis-pendiente.jpg`,
        from: APP_AT,
        to: SHEET_AT,
        crop: { ...ROW_CROP, top: 690, height: 244 },
        tap: { at: 0.5, x: 1085, y: 811 },
      },
      {
        src: `${DIR}/02-hoja-de-dosis.jpg`,
        from: SHEET_AT,
        to: TAKEN_AT,
        crop: { left: 175, top: 1925, width: 856, height: 545 },
        tap: { at: 0.6, x: 950, y: 2228 },
      },
      {
        src: `${DIR}/03-dosis-tomada.jpg`,
        from: TAKEN_AT,
        to: CTA_AT,
        crop: { ...ROW_CROP, top: 688, height: 186 },
        ring: { at: 0.3, left: 240, top: 693, width: 892, height: 176 },
      },
    ],
  },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Recordatorio de pastillas\npara mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.25, pill: CTA_AT + 0.5 },
  },
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.6 },
  duckAt: CTA_AT,
  sfx: [
    { sound: SFX.pop, at: 0, volume: 0.3 },
    { sound: SFX.pop, at: 0.15, volume: 0.25 },
    { sound: TICK, at: 1, volume: 0.35 },
    { sound: TICK, at: 2, volume: 0.35 },
    { sound: SFX.whoosh, at: COVER_AT, volume: 0.3 },
    { sound: KNOCK, at: SHUFFLE_AT + SHUFFLE_STEP, volume: 0.6 },
    { sound: KNOCK, at: SHUFFLE_AT + 2 * SHUFFLE_STEP, volume: 0.6 },
    { sound: SFX.pop, at: OPEN_AT, volume: 0.3 },
    ...COUNTDOWN.map((at) => ({ sound: TICK, at, volume: 0.6 })),
    { sound: SFX.softHit, at: REVEAL_AT, volume: 0.4 },
    { sound: SFX.ding, at: REVEAL_AT + 0.05, volume: 0.3 },
    { sound: SFX.whoosh, at: TURN_AT, volume: 0.25 },
    { sound: SFX.softHit, at: TURN_LINE_2_AT, volume: 0.35 },
    { sound: SFX.whoosh, at: APP_AT, volume: 0.25 },
    { sound: SFX.pop, at: APP_AT + 0.5, volume: 0.35 },
    { sound: SFX.pop, at: SHEET_AT + 0.6, volume: 0.35 },
    { sound: SFX.ding, at: TAKEN_AT + 0.3, volume: 0.3 },
  ],
  end: 15.4,
};
