import { COUNT_SECONDS, type VerdadOMitoProps } from "../arya-shorts/verdad-o-mito";
import { SFX } from "../template/schema";

/**
 * 36 · ¿Verdad o mito? Garrapatas (AV-20261203-verdad-o-mito-garrapatas). Sin voz, en español.
 * Second edition of 28 on the topic of 26 (Expediente). Every card restates
 * an approved line: 26 "La transmiten las garrapatas", "Casi se muere",
 * "Un análisis antes de su cirugía de ojos: PLAQUETAS BAJAS", "Sus plaquetas
 * se recuperaron" and "Revisa si tiene garrapatas. Tu veterinario decide."
 * No symptoms, treatments, medicine names or numbers.
 * Same timing as 28: card 1's ring is 0.4 s in on frame 0, each card holds
 * 3.9 s and each explanation 1.9 s (24 characters or fewer keeps it at 13/s).
 * Photos: photos/arya-3.jpg and the 2023-11-18, 2024-01-07 (both before the
 * March 2024 diagnosis) and 2026-10-11 originals, EXIF-rotated and downscaled.
 * None of them repeats in another video of the Nov 28 – Dec 4 week.
 */
const DIR = "videos/arya/av-20261203-verdad-o-mito-garrapatas";
const TICK = "sfx/tick.mp3";
const KNOCK = "sfx/arya/knock.mp3";
const CARD_SECONDS = 3.9;
const FIRST_RING_ELAPSED = 0.4;

const CARDS = [
  {
    statement: "Las garrapatas no son\nnada grave.",
    verdict: "mito",
    explanation: "Pueden pasar ehrlichia.",
    photo: `${DIR}/01-ventana.jpg`,
    focus: "45% 45%",
  },
  {
    statement: "La ehrlichia es leve.",
    verdict: "mito",
    explanation: "Arya casi se muere.",
    photo: `${DIR}/02-sueter-2023-11.jpg`,
    focus: "50% 72%",
  },
  {
    statement: "A Arya se la detectaron\nen un análisis.",
    verdict: "verdad",
    explanation: "Tenía plaquetas bajas.",
    photo: `${DIR}/03-sillon-2024-01.jpg`,
    focus: "50% 28%",
  },
  {
    statement: "Las plaquetas de Arya\nse recuperaron.",
    verdict: "verdad",
    explanation: "Y hoy está feliz.",
    photo: `${DIR}/04-hoy-2026-10.jpg`,
    focus: "50% 52%",
  },
] as const;

const TIMED_CARDS = CARDS.map((card, index) => {
  const ringFrom = index * CARD_SECONDS - FIRST_RING_ELAPSED;
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

export const aryaVerdadOMitoGarrapatasProps: VerdadOMitoProps = {
  title: { lead: "¿", verdad: "Verdad", middle: " o ", mito: "mito", tail: "?" },
  cards: TIMED_CARDS,
  closing: {
    lines: ["Revisa si tiene garrapatas.", "Tu veterinario decide."],
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
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.5 },
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
