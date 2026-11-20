import type { ExpedienteProps } from "../arya-shorts/expediente";
import { MUSIC, SFX } from "../template/schema";

/**
 * 26 · Expediente Arya: ¿qué tenía? (AV-20261123-expediente-arya). Sin voz, en español.
 * Arya's true story (About, records 01, 15 and 20) as a case file. Media:
 *   01-arya-2023-11-18-sueter  the main repo's arya-originals/2023-11-18-103422.jpg,
 *                              EXIF-rotated, cropped 1900×2375 from x 450, y 520.
 *                              Taken months before the ehrlichia diagnosis (~March 2024).
 *   02-arya-feliz-sillon       photos/arya-2.jpg (undated, tongue out), 600×750 from x 120, y 150.
 *   03/04/05                   blank Codex textures (desk, manila folder, paper);
 *                              the composition writes every word.
 * No medicine name, no treatment method, no symptom list; the advice ends on the vet.
 * Re-edit of Nov 20, 2026 (supervisor): "se veía sana" and the old Pista 2 are cut
 * (they contradicted About), and so is "Tratamiento de 60 días", to land near 20 s.
 * The marker question starts 0.2 s before frame 0, so "¿Qué" is already written.
 * Line breaks are set by hand for the 720 px card measure. Every line holds at
 * about 13 characters per second or slower; PISTA stamps are not counted.
 */
const DIR = "videos/arya/av-20261123-expediente-arya";
const KNOCK = "sfx/arya/knock.mp3";

const QUESTION_AT = -0.2;
const CLUES_AT = [1.9, 3.4];
const LOW_PLATELETS_AT = 6.5;
const QUIZ_AT = 7.7;
const COUNT_AT = [8, 8.45, 8.9];
const REVEAL_AT = 9.35;
const ANSWER_STAMP_AT = 9.5;
const TICKS_LINE_AT = 9.9;
const OUTCOME_AT = 12.2;
const ADVICE_AT = 14.5;
const CTA_AT = 18.3;

const paperSlap = (at: number) => [
  { sound: SFX.whoosh, at: at - 0.15, volume: 0.12 },
  { sound: SFX.softHit, at, volume: 0.38 },
  { sound: KNOCK, at, volume: 0.25 },
];

const stampHit = (at: number) => [
  { sound: KNOCK, at, volume: 0.7 },
  { sound: SFX.softHit, at, volume: 0.35 },
];

export const aryaExpedienteProps: ExpedienteProps = {
  desk: `${DIR}/03-escritorio.jpg`,
  folder: `${DIR}/04-folder-manila.jpg`,
  paper: `${DIR}/05-papel.jpg`,
  tab: "EXPEDIENTE: ARYA",
  photos: [
    { src: `${DIR}/01-arya-2023-11-18-sueter.jpg`, at: 0, tilt: -4, shift: 0 },
    { src: `${DIR}/02-arya-feliz-sillon.jpg`, at: OUTCOME_AT, tilt: 3, shift: 14 },
  ],
  question: { text: "¿Qué\ntenía?", at: QUESTION_AT },
  cards: [
    {
      at: 0,
      lines: [{ text: "Casi se muere.", at: 0, size: 84 }],
      tilt: -1.4,
    },
    {
      at: CLUES_AT[0],
      label: "PISTA 1",
      lines: [{ text: "Tenía casi\n3 años.", at: CLUES_AT[0], size: 76 }],
      tilt: 1.5,
      shift: 8,
    },
    {
      at: CLUES_AT[1],
      label: "PISTA 2",
      lines: [{ text: "Un análisis antes\nde su cirugía\nde ojos:", at: CLUES_AT[1], size: 66 }],
      stamp: { text: "PLAQUETAS BAJAS", at: LOW_PLATELETS_AT },
      tilt: -1.2,
      shift: -6,
    },
    {
      at: REVEAL_AT,
      headline: { text: "EHRLICHIA", at: ANSWER_STAMP_AT },
      lines: [{ text: "La transmiten\nlas garrapatas.", at: TICKS_LINE_AT, size: 70 }],
      tilt: 1.2,
      shift: 4,
    },
    {
      at: OUTCOME_AT,
      lines: [{ text: "Sus plaquetas\nse recuperaron.", at: OUTCOME_AT, size: 76 }],
      tilt: -1,
    },
    {
      at: ADVICE_AT,
      lines: [
        { text: "Revisa si tiene\ngarrapatas.", at: ADVICE_AT, size: 70 },
        { text: "Tu veterinario\ndecide.", at: ADVICE_AT, size: 70 },
      ],
      tilt: 1.3,
      shift: -4,
    },
  ],
  quiz: { text: "¿Ya sabes?", at: QUIZ_AT, count: COUNT_AT, until: REVEAL_AT },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.25, pill: CTA_AT + 0.5 },
  },
  ctaNote: "Recordatorio de pastillas\npara mascotas",
  music: { ...MUSIC.aryaStory, volume: 0.6 },
  sfx: [
    { sound: SFX.whoosh, at: 0, volume: 0.2 },
    ...stampHit(0.33).map((cue) => ({ ...cue, volume: cue.volume * 0.7 })),
    { sound: "sfx/arya/pencil.mp3", at: 0, volume: 0.5 },
    ...CLUES_AT.flatMap(paperSlap),
    ...stampHit(LOW_PLATELETS_AT),
    { sound: SFX.pop, at: QUIZ_AT, volume: 0.35 },
    ...COUNT_AT.map((at) => ({ sound: "sfx/tick.mp3", at, volume: 0.5 })),
    ...paperSlap(REVEAL_AT),
    ...stampHit(ANSWER_STAMP_AT).map((cue) => ({ ...cue, volume: cue.volume * 0.6 })),
    { sound: "sfx/arya/boom.mp3", at: ANSWER_STAMP_AT, volume: 0.18 },
    ...paperSlap(OUTCOME_AT),
    ...paperSlap(ADVICE_AT),
  ],
  end: 20.5,
};
