import type { SeBuscaProps } from "../arya-shorts/se-busca";
import { MUSIC, SFX } from "../template/schema";

/**
 * 23 · Se busca: La Escupe-Pastillas (AV-20261120-se-busca). Sin voz, en español.
 * Publishes Friday Nov 20, 2026 (Día de la Revolución); the Revolution is only
 * the poster's period style. The mugshot is `photos/arya-5.jpg` cropped to her
 * head and chest (640×755 from x 130, y 50); sepia is a CSS filter. Paper and
 * wall are blank Codex textures; the composition writes every word.
 * The banner uses the app's real reminder wording (`notifications.medicationTimeForPet`,
 * body "{pet}: {treatment}" with no dose); the treatment name is demo data.
 * Each line holds for about 13 characters per second or slower.
 * Capture beat: the camera pulls back, the reminder drops with its ding and the
 * slip, then CAPTURADA slams a beat later so the reminder reads as what caught her.
 */
const DIR = "videos/arya/av-20261120-se-busca";
const KNOCK = "sfx/arya/knock.mp3";

const ALIAS_AT = 0.3;
const CRIMES_AT = [2.8, 5.5, 7.5];
const REWARD_AT = 9.5;
const CAPTURE_AT = 11.6;
const BANNER_AT = 11.75;
const SLIP_AT = 11.95;
const STAMP_AT = 12.45;
const QUESTION_AT = 14.4;
const CTA_AT = 16.8;

const stampHit = (at: number) => [
  { sound: KNOCK, at, volume: 0.7 },
  { sound: SFX.softHit, at, volume: 0.35 },
];

export const aryaSeBuscaProps: SeBuscaProps = {
  photo: `${DIR}/01-arya-mugshot.jpg`,
  paper: `${DIR}/02-poster-paper.jpg`,
  wall: `${DIR}/03-wood-wall.jpg`,
  title: "SE BUSCA",
  aliasLead: "Arya, alias",
  alias: "“La Escupe-Pastillas”",
  aliasAt: ALIAS_AT,
  crimes: [
    { label: "DELITO 1", text: "Se come el queso. Deja la pastilla.", at: CRIMES_AT[0] },
    { label: "DELITO 2", text: "Finge que ya se la tragó.", at: CRIMES_AT[1] },
    { label: "DELITO 3", text: "La esconde en el cachete.", at: CRIMES_AT[2] },
  ],
  reward: { label: "RECOMPENSA", text: "un premio", at: REWARD_AT },
  capture: {
    at: CAPTURE_AT,
    stamp: { text: "CAPTURADA", at: STAMP_AT },
    slip: { text: "Todos los días.\n8:00 en punto.", at: SLIP_AT },
    banner: {
      at: BANNER_AT,
      title: "¡Hora de darle sus medicamentos a Arya!",
      body: "Arya: Pastilla de la mañana",
      time: "ahora",
      icon: "videos/arya/store-videos/app-icon.png",
    },
  },
  question: { text: "¿De qué acusarías\na tu perro?", emoji: "👇", at: QUESTION_AT },
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
  music: { ...MUSIC.aryaDemo, volume: 0.75 },
  sfx: [
    { sound: KNOCK, at: 0, volume: 0.65 },
    { sound: SFX.softHit, at: 0, volume: 0.4 },
    { sound: "sfx/printer.mp3", at: ALIAS_AT, volume: 0.3 },
    ...[CRIMES_AT[0], REWARD_AT, CAPTURE_AT].map((at) => ({ sound: SFX.whoosh, at: at - 0.4, volume: 0.14 })),
    ...CRIMES_AT.flatMap(stampHit),
    { sound: "sfx/printer.mp3", at: REWARD_AT, volume: 0.3 },
    { sound: SFX.ding, at: BANNER_AT, volume: 0.45 },
    { sound: KNOCK, at: SLIP_AT, volume: 0.35 },
    ...stampHit(STAMP_AT),
    { sound: KNOCK, at: STAMP_AT + 0.1, volume: 0.6 },
    { sound: "sfx/arya/boom.mp3", at: STAMP_AT, volume: 0.3 },
    { sound: KNOCK, at: QUESTION_AT, volume: 0.5 },
    { sound: SFX.pop, at: QUESTION_AT + 0.1, volume: 0.35 },
  ],
  end: 18.9,
};
