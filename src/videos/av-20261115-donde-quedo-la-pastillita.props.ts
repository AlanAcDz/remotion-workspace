import type { TrileVacioProps } from "../arya-shorts/trile-vacio";
import { SFX } from "../template/schema";

/**
 * 18 · ¿Dónde quedó la pastillita? (AV-20261115-donde-quedo-la-pastillita).
 * No voice. Version 2 of 11 (Find the pill), in Spanish, with six honest swaps
 * instead of eight and a twist: A, B and C lift one after another onto empty
 * spots. Table, cup and rug clip are 11's, referenced in place; the yellow
 * piece in the rug clip is a toy piece that only reads as a pill.
 *
 * `01-hoja-de-dosis.jpg` is the frame at 4.5 s of
 * store-videos/clips/ios/es/01-today-dose.mp4 (sheet fully open 4.0–6.0 s).
 * Source landmarks (1206 × 2622): sheet top row ≈ 1461, "Marcar como tomada"
 * rows ≈ 2165–2290, "Marcar como omitida" rows ≈ 2328–2454. The card crops
 * from row 1475, just inside the sheet, so the omitida button lands at card
 * row ≈ 634.
 */
const DIR = "videos/arya/av-20261115-donde-quedo-la-pastillita";
const TRILE_DIR = "videos/arya/av-20261108-find-the-pill";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const LAND_AT = 0.3;
const SWAP_FROM = 0.4;
const SWAPS = [
  { a: 0, b: 1, seconds: 1.15 },
  { a: 1, b: 2, seconds: 1 },
  { a: 0, b: 2, seconds: 0.9 },
  { a: 0, b: 1, seconds: 0.8 },
  { a: 1, b: 2, seconds: 0.7 },
  { a: 0, b: 2, seconds: 0.65 },
];
const swapEnds = SWAPS.reduce<number[]>(
  (ends, swap) => [...ends, (ends[ends.length - 1] ?? SWAP_FROM) + swap.seconds],
  [],
);

const STOP_AT = 5.6;
const COUNTDOWN = [5.65, 6.15, 6.65];
const LIFTS = [7.2, 7.55, 7.9];
const QUESTION_AT = 8.4;
const CLIP_AT = 9.7;
const SHEET_AT = 11.7;
const CTA_AT = 13.9;

export const aryaDondeQuedoLaPastillitaProps: TrileVacioProps = {
  table: `${TRILE_DIR}/01-table.jpg`,
  cup: `${TRILE_DIR}/cup.png`,
  swaps: SWAPS,
  swapFrom: SWAP_FROM,
  hoverFrom: 360,
  landAt: LAND_AT,
  stopAt: STOP_AT,
  countdown: COUNTDOWN,
  lifts: LIFTS,
  questionAt: QUESTION_AT,
  hook: "¿Dónde quedó la pastillita?",
  ask: "Comenta A, B o C.",
  question: "¿Y la pastilla?",
  clip: {
    src: `${TRILE_DIR}/02-rug-yellow-piece.mp4`,
    from: CLIP_AT,
    to: SHEET_AT,
    rate: 0.6,
    text: "La escupió a las 8:04.",
  },
  sheet: {
    src: `${DIR}/01-hoja-de-dosis.jpg`,
    from: SHEET_AT,
    to: CTA_AT,
    text: "Anota lo que de verdad pasó.",
    cropTop: 1475,
    ringTop: 634,
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
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.7 },
  duckAt: LIFTS[0] - 0.2,
  sfx: [
    { sound: KNOCK, at: LAND_AT, volume: 0.9 },
    ...swapEnds.map((at) => ({ sound: KNOCK, at, volume: 0.65 })),
    ...COUNTDOWN.map((at) => ({ sound: TICK, at, volume: 0.6 })),
    ...LIFTS.map((at) => ({ sound: SFX.pop, at, volume: 0.35 })),
    { sound: SFX.softHit, at: QUESTION_AT, volume: 0.4 },
    { sound: SFX.pop, at: CLIP_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: SHEET_AT, volume: 0.25 },
  ],
  end: 15.9,
};
