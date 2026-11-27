import type { QueCaminoProps } from "../arya-shorts/que-camino";
import { SFX } from "../template/schema";

/**
 * 35 · ¿Qué camino lleva al queso? (AV-20261202-que-camino). No voice.
 * `01-arya-cara.jpg` is the original 2023-10-15-230957.jpg (Arya in the blue
 * flower dress by the crate), auto-rotated to 3024×4032, cropped to the 1048 px
 * square at (917, 1149) and scaled to 800×800. Her nose sits near (470, 495)
 * and the face's middle near (390, 420), so the circle centres on (0.49, 0.52).
 *
 * Puzzle, one column per row (L ≈ 250, M ≈ 540, R ≈ 830):
 *   A: L → R → M → L → M  pastilla
 *   B: M → L → R → M → R  hueso
 *   C: R → M → L → R → L  queso (the answer)
 * Each row-to-row step swaps exactly two pairs, and every crossing falls at
 * about 1/3 or 2/3 of the step, so no three ropes ever meet at one point.
 * Each line holds for about 13 characters per second or slower.
 */
const DIR = "videos/arya/av-20261202-que-camino";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const A = 0;
const B = 1;
const C = 2;

const TIMER_END = 5.5;
const TRACE_SECONDS = 0.8;
const TRACE_A = 6.1;
const TRACE_B = 8.0;
const TRACE_C = 9.9;
const TWIST_AT = 11.6;
const BETRAYAL_AT = 12.1;
const ASK_AT = 14.3;
const CTA_AT = 16.3;

const TICKS = Array.from({ length: TIMER_END * 2 }, (_, index) => index * 0.5);

export const aryaQueCaminoProps: QueCaminoProps = {
  face: `${DIR}/01-arya-cara.jpg`,
  faceCenter: { x: 0.49, y: 0.52 },
  faceSpan: 0.7,
  rows: [790, 940, 1090, 1240, 1392],
  routes: [
    { label: "A", xs: [250, 820, 545, 255, 540] },
    { label: "B", xs: [540, 250, 835, 530, 830] },
    { label: "C", xs: [830, 545, 250, 830, 250] },
  ],
  items: [
    { kind: "cheese", x: 250 },
    { kind: "pill", x: 540 },
    { kind: "bone", x: 830 },
  ],
  drawIn: 1.1,
  timerEnd: TIMER_END,
  traces: [
    { route: A, from: TRACE_A, to: TRACE_A + TRACE_SECONDS, isRight: false },
    { route: B, from: TRACE_B, to: TRACE_B + TRACE_SECONDS, isRight: false },
    { route: C, from: TRACE_C, to: TRACE_C + TRACE_SECONDS, isRight: true },
  ],
  twistAt: TWIST_AT,
  lines: [
    { text: "¿Qué camino\nlleva al queso?", from: 0, to: 3 },
    { text: "Sigue la línea\ncon los ojos 👀", from: 3, to: TIMER_END },
    { text: "¡Tiempo!", from: TIMER_END, to: TRACE_A, pop: true },
    { text: "Camino A", from: TRACE_A, to: TRACE_B, pop: true },
    { text: "Camino B", from: TRACE_B, to: TRACE_C, pop: true },
    { text: "Camino C", from: TRACE_C, to: TWIST_AT, pop: true },
    {
      text: "Plot twist: el\nqueso tenía pastilla",
      from: TWIST_AT,
      to: ASK_AT,
      pop: true,
    },
    {
      text: "¿Cuál elegiste?\nA, B o C 👇",
      from: ASK_AT,
      to: CTA_AT,
      pop: true,
    },
  ],
  bubbles: [
    {
      text: "¡Ni loca! 🙅‍♀️",
      from: TRACE_A + TRACE_SECONDS,
      to: TRACE_B,
      reaction: "shake",
    },
    {
      text: "¿Un hueso?\nMeh.",
      from: TRACE_B + TRACE_SECONDS,
      to: TRACE_C,
      reaction: "tilt",
    },
    {
      text: "¡ESO! 🧀",
      from: TRACE_C + TRACE_SECONDS,
      to: TWIST_AT,
      reaction: "hop",
    },
    { text: "Traición 😑", from: BETRAYAL_AT, to: ASK_AT, reaction: "shake" },
  ],
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
  duckAt: TIMER_END,
  sfx: [
    ...TICKS.map((at) => ({
      sound: TICK,
      at,
      volume: at >= TIMER_END - 2 ? 0.75 : 0.5,
    })),
    { sound: KNOCK, at: TIMER_END, volume: 0.9 },
    { sound: SFX.softHit, at: TIMER_END, volume: 0.35 },
    ...[TRACE_A, TRACE_B, TRACE_C].map((at) => ({
      sound: SFX.whoosh,
      at,
      volume: 0.16,
    })),
    { sound: SFX.softHit, at: TRACE_A + TRACE_SECONDS, volume: 0.45 },
    { sound: SFX.pop, at: TRACE_A + TRACE_SECONDS, volume: 0.4 },
    { sound: SFX.softHit, at: TRACE_B + TRACE_SECONDS, volume: 0.45 },
    { sound: SFX.pop, at: TRACE_B + TRACE_SECONDS, volume: 0.4 },
    { sound: SFX.ding, at: TRACE_C + TRACE_SECONDS, volume: 0.45 },
    { sound: SFX.pop, at: TWIST_AT, volume: 0.55 },
    { sound: KNOCK, at: TWIST_AT, volume: 0.6 },
    { sound: SFX.softHit, at: BETRAYAL_AT, volume: 0.35 },
    { sound: SFX.pop, at: ASK_AT, volume: 0.4 },
  ],
  end: CTA_AT + 2,
};
