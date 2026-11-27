import type { JuicioProps } from "../arya-shorts/juicio";
import { SFX } from "../template/schema";

/**
 * 37 · El juicio de La Escupe-Pastillas (AV-20261204-el-juicio). Sin voz, en español.
 * Arya keeps the alias from 23 (Se busca) and 30 (Lucha) and the same mugshot crop.
 * Evidence media, all real Arya:
 * - A: original `20260821_212437.jpg` (4000×3000 with EXIF rotation) → 1200×1600.
 * - B: `photos/arya-2.jpg` (750×1000), tongue out on the sofa.
 * - C: `undated-rug-yellow-piece.mp4` (720×1280, 1.2 s), muted, slowed to half
 *   speed and held on its last frame (3.2 s). The yellow piece sits at source
 *   (450, 915) at the start and settles at (460, 955) from 1.7 s of the slowed clip.
 *   The video never says what the piece is.
 * Every line holds for 13 characters per second or slower; the CTA note gets
 * 2.6 s (15 characters per second), the same treatment as 23 and 30.
 */
const DIR = "videos/arya/av-20261204-el-juicio";
const KNOCK = "sfx/arya/knock.mp3";
const BOOM = "sfx/arya/boom.mp3";
const TICK = "sfx/tick.mp3";

const HOOK_STRIKES = [0.1, 0.43, 0.76];
const CASE_AT = 0.25;
const EVIDENCE_AT = [2.3, 4.2, 6.1];
const MARK_AT = 7.2;
const JURY_AT = 8.3;
const TIMER_END = JURY_AT + 3;
const VERDICT_AT = TIMER_END;
const LINE_AT = 11.75;
const QUESTION_AT = 13.75;
const CTA_AT = 15.95;
const TICKS = Array.from({ length: 6 }, (_, index) => JURY_AT + index * 0.5);

const knock = (at: number, volume = 0.65) => [
  { sound: KNOCK, at, volume },
  { sound: SFX.softHit, at, volume: volume * 0.55 },
];

export const aryaElJuicioProps: JuicioProps = {
  photo: `${DIR}/01-arya-mugshot.jpg`,
  plate: "ACUSADA: ARYA",
  headers: [
    { text: "ORDEN EN LA SALA", at: 0, size: 80 },
    { text: "EVIDENCIA A", at: EVIDENCE_AT[0], size: 104 },
    { text: "EVIDENCIA B", at: EVIDENCE_AT[1], size: 104 },
    { text: "EVIDENCIA C", at: EVIDENCE_AT[2], size: 104 },
    { text: "EL JURADO ERES TÚ", at: JURY_AT, size: 84 },
    { text: "VEREDICTO", at: VERDICT_AT, size: 110 },
    { text: "¿Y TU PERRO?", at: QUESTION_AT, size: 104 },
  ],
  caseLine: { text: "Caso: La Escupe-Pastillas", at: CASE_AT },
  evidence: [
    {
      letter: "A",
      text: "Cero arrepentimiento.",
      at: EVIDENCE_AT[0],
      media: {
        src: `${DIR}/02-evidencia-a-mirada.jpg`,
        kind: "image",
        width: 1200,
        height: 1600,
        focus: { x: 75, y: 60, width: 1050 },
      },
    },
    {
      letter: "B",
      text: "Sonrisa sospechosa.",
      at: EVIDENCE_AT[1],
      media: {
        src: `${DIR}/03-evidencia-b-sonrisa.jpg`,
        kind: "image",
        width: 750,
        height: 1000,
        focus: { x: 70, y: 170, width: 620 },
      },
    },
    {
      letter: "C",
      text: "La escena del crimen.",
      at: EVIDENCE_AT[2],
      media: {
        src: `${DIR}/04-evidencia-c-alfombra.mp4`,
        kind: "video",
        width: 720,
        height: 1280,
        focus: { x: 120, y: 380, width: 560 },
        mark: { x: 460, y: 955, r: 72, at: MARK_AT },
      },
    },
  ],
  jury: {
    question: { text: "¿Culpable o inocente?", at: JURY_AT },
    guilty: "CULPABLE",
    innocent: "INOCENTE",
    timerFrom: JURY_AT,
    timerEnd: TIMER_END,
  },
  verdict: {
    stamp: "CULPABLE…",
    at: VERDICT_AT,
    line: { text: "…de ser demasiado linda.", at: LINE_AT },
  },
  question: { text: "¿Culpable o inocente? 👇", at: QUESTION_AT },
  strikes: [...HOOK_STRIKES, VERDICT_AT],
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Recordatorio de pastillas\npara mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.15, pill: CTA_AT + 0.45 },
    question: { text: "¿Culpable o inocente? 👇", at: CTA_AT + 0.8 },
  },
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.6 },
  sfx: [
    ...HOOK_STRIKES.flatMap((at, index) => knock(at, index === 0 ? 0.75 : 0.6)),
    { sound: BOOM, at: HOOK_STRIKES[0], volume: 0.22 },
    ...EVIDENCE_AT.flatMap((at) => [
      { sound: SFX.whoosh, at: at - 0.3, volume: 0.16 },
      { sound: SFX.softHit, at, volume: 0.3 },
    ]),
    { sound: SFX.pop, at: MARK_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: JURY_AT - 0.25, volume: 0.16 },
    ...TICKS.map((at) => ({ sound: TICK, at, volume: at >= TIMER_END - 1 ? 0.7 : 0.5 })),
    ...knock(VERDICT_AT, 0.8),
    { sound: BOOM, at: VERDICT_AT, volume: 0.32 },
    { sound: SFX.pop, at: LINE_AT, volume: 0.3 },
    ...knock(QUESTION_AT, 0.45),
    { sound: SFX.pop, at: QUESTION_AT + 0.1, volume: 0.3 },
  ],
  end: CTA_AT + 2.6,
};
