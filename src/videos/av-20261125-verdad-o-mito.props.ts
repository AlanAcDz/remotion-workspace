import { COUNT_SECONDS, type VerdadOMitoProps } from "../arya-shorts/verdad-o-mito";
import { MUSIC, SFX } from "../template/schema";

/**
 * 28 · ¿Verdad o mito? (AV-20261125-verdad-o-mito). Sin voz, en español.
 * Every statement comes from a claim Alan already approved: 03 (don't double
 * a missed dose), 05 (two fixed times for "every 12 hours") and 08 (don't
 * re-dose after vomiting, call the vet; note when you gave it).
 * Card 1's ring is 0.4 s in on frame 0 so the game is already running.
 * Each explanation holds 1.9 s: 24 characters or fewer keeps it at 13/s.
 * Photos are downscaled copies of real Arya photos (no-sabe 02 and 03,
 * photos/arya-1 and arya-2).
 */
const DIR = "videos/arya/av-20261125-verdad-o-mito";
const TICK = "sfx/tick.mp3";
const KNOCK = "sfx/arya/knock.mp3";
const CARD_SECONDS = 3.9;
const FIRST_RING_ELAPSED = 0.4;

const CARDS = [
  {
    statement: "Si olvidé una dosis,\nle doy doble.",
    verdict: "mito",
    explanation: "Pregúntale a tu vet.",
    photo: `${DIR}/01-mirada-arriba.jpg`,
    focus: "50% 42%",
  },
  {
    statement: "Cada 12 horas =\ncuando me acuerde.",
    verdict: "mito",
    explanation: "Horas fijas: 8 am y 8 pm.",
    photo: `${DIR}/02-sillon.jpg`,
    focus: "50% 36%",
  },
  {
    statement: "Vomitó la pastilla:\nle doy otra.",
    verdict: "mito",
    explanation: "Llama a tu vet primero.",
    photo: `${DIR}/03-cojin.jpg`,
    focus: "50% 45%",
  },
  {
    statement: "Sirve anotar a qué hora\nse la di.",
    verdict: "verdad",
    explanation: "Arya la guarda por ti.",
    photo: `${DIR}/04-sonrisa.jpg`,
    focus: "50% 38%",
  },
] as const;

const TIMED_CARDS = CARDS.map((card, index) => {
  const ringFrom = index === 0 ? -FIRST_RING_ELAPSED : index * CARD_SECONDS - FIRST_RING_ELAPSED;
  return {
    ...card,
    from: index === 0 ? 0 : ringFrom,
    ringFrom,
    to: ringFrom + CARD_SECONDS,
  };
});

const CLOSING_AT = TIMED_CARDS[TIMED_CARDS.length - 1].to;
const CTA_AT = CLOSING_AT + 0.8;

const stampSfx = (verdict: "verdad" | "mito", at: number) =>
  verdict === "mito"
    ? [
        { sound: KNOCK, at, volume: 0.6 },
        { sound: "sfx/arya/boom.mp3", at, volume: 0.28 },
        { sound: SFX.softHit, at, volume: 0.35 },
      ]
    : [
        { sound: KNOCK, at, volume: 0.55 },
        { sound: SFX.ding, at: at + 0.05, volume: 0.4 },
      ];

export const aryaVerdadOMitoProps: VerdadOMitoProps = {
  title: { lead: "¿", verdad: "Verdad", middle: " o ", mito: "mito", tail: "?" },
  cards: TIMED_CARDS,
  closing: {
    lines: ["Tu veterinario decide.", "Arya te recuerda."],
    at: CLOSING_AT,
    secondAt: CLOSING_AT + 0.6,
  },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Recordatorio de pastillas\npara mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT + 0.2, note: CTA_AT + 0.45, pill: CTA_AT + 0.7 },
  },
  music: { ...MUSIC.aryaDemo, volume: 0.5 },
  sfx: [
    ...TIMED_CARDS.flatMap((card) => [
      ...Array.from({ length: COUNT_SECONDS }, (_, second) => card.ringFrom + second)
        .filter((at) => at >= 0)
        .map((at) => ({ sound: TICK, at, volume: 0.6 })),
      ...stampSfx(card.verdict, card.ringFrom + COUNT_SECONDS),
    ]),
    { sound: TICK, at: 0, volume: 0.6 },
    ...TIMED_CARDS.slice(1).map((card) => ({ sound: SFX.whoosh, at: card.from - 0.15, volume: 0.2 })),
    { sound: SFX.pop, at: CLOSING_AT, volume: 0.35 },
  ],
  end: CTA_AT + 2.2,
};
