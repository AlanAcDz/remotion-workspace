import type { CartaSantaProps } from "../arya-shorts/carta-santa";
import { MUSIC, SFX } from "../template/schema";

/**
 * 34 · Carta a Santa de La Escupe-Pastillas (AV-20261201-carta-a-santa).
 * Sin voz, en español. The Diario's pencil hand (17, 24) writing as the alias
 * from 23. Evidence photos: 01 is the original 2023-12-24-233632.jpg (Christmas
 * Eve) cropped 2200×2538 from x 824, y 1150; 02 is 2023-11-14-155432.jpg
 * cropped 2254×2600 from x 1450, y 200; both scaled to 1040×1200. 03 is 23's
 * mugshot unchanged; 04 is photos/arya-1.jpg as the signed photo. Paper, stamp, strikes and the tag are drawn in code.
 * Each sheet reads at 13 characters per second or slower, captions included;
 * the question gets 2.7 s for 31 characters.
 */
const DIR = "videos/arya/av-20261201-carta-a-santa";
const PENCIL = "sfx/arya/pencil.mp3";
const KNOCK = "sfx/arya/knock.mp3";

const PAW_AT = 13.0;

const SHEETS: CartaSantaProps["sheets"] = [
  {
    from: 0,
    to: 3.4,
    headStart: 6,
    lines: [
      { text: "Querido Santa:", at: 0, isAccent: true },
      { text: "Este año fui buena.", at: 0.6 },
    ],
    evidence: { src: `${DIR}/01-evidencia-a-nochebuena.jpg`, caption: "Evidencia A", tilt: -3 },
  },
  {
    from: 3.4,
    to: 7.4,
    lines: [
      { text: "Me tomé todas", at: 3.5, struckAt: 4.75 },
      { text: "mis pastillas.", at: 4.0, struckAt: 5.0 },
      { text: "Casi todas.", at: 5.4, isAccent: true },
    ],
    evidence: { src: `${DIR}/02-evidencia-b-cama.jpg`, caption: "Evidencia B", tilt: 2.5 },
  },
  {
    from: 7.4,
    to: 11.6,
    lines: [
      { text: "Nunca escupí", at: 7.5, struckAt: 8.6 },
      { text: "ninguna.", at: 8.0, struckAt: 8.85 },
      { text: "Bueno… siete.", at: 9.2, isAccent: true },
    ],
    evidence: { src: `${DIR}/03-evidencia-c-ficha.jpg`, caption: "Evidencia C (ignorar)", tilt: -2 },
  },
  {
    from: 11.6,
    to: 18.5,
    lines: [
      { text: "Con cariño,", at: 11.7 },
      { text: "La Escupe-Pastillas", at: 12.2, isAccent: true },
    ],
    pawAt: PAW_AT,
    evidence: {
      src: `${DIR}/04-firma-arya.jpg`,
      caption: "😇",
      tilt: 3,
      photo: { width: 400, height: 460, top: 560 },
    },
  },
];

const QUESTION_AT = 13.4;
const CTA_AT = 16.1;
const strikes = SHEETS.flatMap((sheet) => sheet.lines.flatMap((line) => line.struckAt ?? []));
const corrections = SHEETS.flatMap((sheet) => sheet.lines.filter((line) => line.isAccent && line.at > 0).map((line) => line.at));

export const aryaCartaASantaProps: CartaSantaProps = {
  sheets: SHEETS,
  question: { text: "¿Se porta bien\no le toca carbón?", emoji: "👇", at: QUESTION_AT },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Recordatorio de pastillas\npara mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.15, pill: CTA_AT + 0.45 },
  },
  music: { ...MUSIC.aryaDemo, volume: 0.6 },
  sfx: [
    ...SHEETS.map((sheet) => ({ sound: PENCIL, at: sheet.from, volume: 0.4 })),
    ...SHEETS.slice(0, -1).map((sheet) => ({ sound: SFX.whoosh, at: sheet.to - 0.3, volume: 0.22 })),
    ...SHEETS.slice(1, -1).map((sheet) => ({ sound: SFX.softHit, at: sheet.from + 0.05, volume: 0.3 })),
    ...strikes.filter((_, index) => index % 2 === 0).map((at) => ({ sound: KNOCK, at, volume: 0.3 })),
    ...strikes.map((at) => ({ sound: PENCIL, at, volume: 0.28 })),
    ...corrections.map((at) => ({ sound: PENCIL, at, volume: 0.36 })),
    { sound: KNOCK, at: PAW_AT, volume: 0.55 },
    { sound: SFX.softHit, at: PAW_AT + 0.02, volume: 0.45 },
    { sound: KNOCK, at: QUESTION_AT, volume: 0.5 },
    { sound: SFX.pop, at: QUESTION_AT + 0.1, volume: 0.35 },
  ],
  end: 18.5,
};
