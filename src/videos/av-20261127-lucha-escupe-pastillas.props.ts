import type { LuchaProps } from "../arya-shorts/lucha";
import { MUSIC, SFX } from "../template/schema";

/**
 * 30 · Lucha: La Escupe-Pastillas vs. El Queso (AV-20261127-lucha-escupe-pastillas).
 * Sin voz, en español. Arya keeps the alias from 23 (Se busca) and the same
 * mugshot crop; the luchador mask is drawn over it in the composition with
 * her eyes left open. El Queso and El Jamón are blank Codex art (no text),
 * cut out of their cream backgrounds; the composition writes every word.
 * The ring bell is synthesised with ffmpeg (two strikes, peak -1 dBFS).
 * The banner uses the app's real reminder wording (`notifications.medicationTimeForPet`,
 * body "{pet}: {treatment}" with no dose); the treatment name is demo data.
 * Every line holds for 13 characters per second or slower; the CTA note gets
 * 2.6 s (15 characters per second), the same treatment as 23.
 */
const DIR = "videos/arya/av-20261127-lucha-escupe-pastillas";
const BELL = `${DIR}/04-ring-bell.mp3`;
const KNOCK = "sfx/arya/knock.mp3";
const BOOM = "sfx/arya/boom.mp3";

const ROUNDS_AT = [2, 4.3, 7.2];
const MOVES_AT = ROUNDS_AT.map((at) => at + 0.25);
const PAYOFFS_AT = [3.1, 6, 8.85];
const COUNT_AT = [10, 10.4, 10.8];
const WINNER_AT = 11.2;
const BANNER_AT = 12.55;
const REMATCH_AT = 12.8;
const CTA_AT = 15.15;

const hit = (at: number, volume = 0.55) => [
  { sound: KNOCK, at, volume },
  { sound: SFX.softHit, at, volume: volume * 0.6 },
];

export const aryaLuchaProps: LuchaProps = {
  photo: `${DIR}/01-arya-mugshot.jpg`,
  queso: `${DIR}/02-el-queso.png`,
  jamon: `${DIR}/03-el-jamon.png`,
  hook: { headline: "LUCHA ESTELAR", sub: "a 3 caídas." },
  plates: { left: "LA ESCUPE-\nPASTILLAS", right: "EL QUESO" },
  rounds: [
    {
      title: "1ª CAÍDA",
      at: ROUNDS_AT[0],
      move: { text: "La escupe.", at: MOVES_AT[0] },
      payoff: { text: "PUNTO PARA ARYA", at: PAYOFFS_AT[0] },
    },
    {
      title: "2ª CAÍDA",
      at: ROUNDS_AT[1],
      move: { text: "La esconde en el cachete.", at: MOVES_AT[1] },
      payoff: { text: "PUNTO PARA ARYA", at: PAYOFFS_AT[1] },
    },
    {
      title: "3ª CAÍDA",
      at: ROUNDS_AT[2],
      move: { text: "El Queso trae refuerzos…", at: MOVES_AT[2] },
      payoff: { text: "¡EL JAMÓN!", at: PAYOFFS_AT[2] },
    },
  ],
  count: [
    { text: "1", at: COUNT_AT[0] },
    { text: "2", at: COUNT_AT[1] },
    { text: "3!", at: COUNT_AT[2] },
  ],
  winner: { text: "¡GANA EL QUESO!", at: WINNER_AT },
  banner: {
    at: BANNER_AT,
    title: "¡Hora de darle sus medicamentos a Arya!",
    body: "Arya: Pastilla de la mañana",
    time: "ahora",
    icon: "videos/arya/store-videos/app-icon.png",
  },
  rematch: { text: "Revancha:\nmañana a las 8:00.", at: REMATCH_AT },
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
  music: { ...MUSIC.aryaDemo, volume: 0.5 },
  sfx: [
    { sound: BELL, at: 0, volume: 0.55 },
    { sound: KNOCK, at: 0, volume: 0.6 },
    ...ROUNDS_AT.map((at) => ({ sound: SFX.whoosh, at: at - 0.2, volume: 0.16 })),
    ...PAYOFFS_AT.slice(0, 2).flatMap((at) => hit(at)),
    { sound: SFX.whoosh, at: PAYOFFS_AT[2] - 0.25, volume: 0.2 },
    ...hit(PAYOFFS_AT[2], 0.65),
    ...COUNT_AT.flatMap((at) => hit(at, 0.7)),
    { sound: BOOM, at: COUNT_AT[2], volume: 0.3 },
    { sound: BELL, at: WINNER_AT, volume: 0.55 },
    { sound: SFX.pop, at: WINNER_AT + 0.05, volume: 0.35 },
    { sound: SFX.ding, at: BANNER_AT, volume: 0.45 },
    { sound: SFX.pop, at: REMATCH_AT, volume: 0.25 },
  ],
  end: CTA_AT + 2.75,
};
