import type { LoteriaProps } from "../arya-shorts/loteria";
import { SFX } from "../template/schema";

/**
 * 19 · Lotería de la pastilla (AV-20261116-loteria-de-la-pastilla). Sin voz,
 * en español. Nine Codex cards in the store mascot's style; the composition
 * writes every number and name, and the 8:00 on La Alarma's blank screen.
 * Per-card pace follows the record (1.3 s down to 0.9 s, 1.4 s for the last).
 * Squares fill out of reading order; La Valiente's bean completes the tabla.
 * The CTA holds 3.3 s instead of the record's 2 s so its 39-character note
 * reads at 13 characters per second.
 */
const DIR = "videos/arya/av-20261116-loteria-de-la-pastilla";

const CALLS = [
  { name: "El Queso", image: "01-queso", cell: 4, seconds: 1.3 },
  { name: "La Pastilla", image: "02-pastilla", cell: 2, seconds: 1.2 },
  { name: "La Escondida", image: "03-escondida", cell: 6, seconds: 1.1 },
  { name: "El Escupitajo", image: "04-escupitajo", cell: 0, seconds: 1 },
  { name: "El Cacahuate", image: "05-cacahuate", cell: 8, seconds: 1 },
  { name: "La Mano", image: "06-mano", cell: 1, seconds: 0.9 },
  { name: "La Fugitiva", image: "07-fugitiva", cell: 7, seconds: 0.9 },
  { name: "La Alarma", image: "08-alarma", cell: 3, seconds: 0.9 },
  { name: "La Valiente", image: "09-valiente", cell: 5, seconds: 1.4 },
];

/** The first bean lands before 1 s; later ones a beat after the flip. */
const FIRST_LAND = 0.7;
const LAND = 0.45;

const ALARM_LABEL = {
  text: "8:00",
  x: 0.487,
  y: 0.47,
  size: 0.125,
  rotate: -4.5,
  color: "#5B3A26",
};

const starts = CALLS.reduce<number[]>(
  (acc, call, index) => [...acc, index === 0 ? 0 : acc[index - 1] + CALLS[index - 1].seconds],
  [],
);
const round = (seconds: number) => Math.round(seconds * 100) / 100;

const CARDS = CALLS.map((call, index) => ({
  name: call.name,
  image: `${DIR}/${call.image}.png`,
  cell: call.cell,
  from: round(starts[index]),
  land: round(starts[index] + (index === 0 ? FIRST_LAND : LAND)),
  ...(call.image === "08-alarma" ? { label: ALARM_LABEL } : {}),
}));

const LOTERIA_AT = round(starts[8] + CALLS[8].seconds);
const ASK_AT = round(LOTERIA_AT + 1.2);
const LINE_AT = ASK_AT + 2;
const CTA_AT = LINE_AT + 2;

export const aryaLoteriaProps: LoteriaProps = {
  hook: { text: "¡Corre y se va con…", to: CARDS[2].from },
  cards: CARDS,
  loteria: { text: "¡LOTERÍA!", at: LOTERIA_AT },
  lines: [
    { text: "¿Qué carta es\ntu perro? 👇", from: ASK_AT, to: LINE_AT },
    { text: "Que no se te pase\nni una.", from: LINE_AT, to: CTA_AT },
  ],
  grain: `${DIR}/00-paper-grain.jpg`,
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Recordatorio de pastillas para mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.2, pill: CTA_AT + 0.5 },
  },
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.7 },
  sfx: [
    ...CARDS.map((card) => ({ sound: "sfx/arya/knock.mp3", at: card.land, volume: 0.6 })),
    { sound: SFX.ding, at: LOTERIA_AT, volume: 0.5 },
  ],
  end: CTA_AT + 3.3,
};
