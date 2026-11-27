import {
  type QueAcabaDePasarProps,
  type QuizRound,
  TIMER_SECONDS,
} from "../arya-shorts/que-acaba-de-pasar";
import { SFX } from "../template/schema";

/**
 * 32 · ¿Qué acaba de pasar? (AV-20261129-que-acaba-de-pasar). Sin voz, en español.
 * Face-first quiz modelled on 28 · ¿Verdad o mito?: each round is a real
 * photo of Arya, three options and a 3 s bar, then the answer stamps.
 * Round 1's bar is 0.5 s in on frame 0 so the game is already running;
 * the clock ticks every half second, louder in the last second.
 * Options stay up the whole 4.5 s round; each punchline holds about 1.4 s
 * at 18 characters or fewer, so every line reads at 13 characters/s or slower.
 * Photos are 1200 px wide copies of the originals 20260816_211038.jpg,
 * 2023-10-15-230653.jpg and 2024-01-19-102827.jpg (sesenta-dias originals).
 * The answers are playful fiction about the moment, not health advice.
 */
const DIR = "videos/arya/av-20261129-que-acaba-de-pasar";
const TICK = "sfx/tick.mp3";
const KNOCK = "sfx/arya/knock.mp3";
const REVEAL_SECONDS = 1.5;
const ROUND_SECONDS = TIMER_SECONDS + REVEAL_SECONDS;
const FIRST_TIMER_ELAPSED = 0.5;

const ROUNDS = [
  {
    photo: `${DIR}/01-cabeza-ladeada.jpg`,
    focus: "50% 12%",
    options: ["Oyó «paseo»", "Vio una ardilla", "Oyó «pastilla»"],
    answer: "C",
    punchline: "Ya planea escapar.",
  },
  {
    photo: `${DIR}/02-debajo-de-la-silla.jpg`,
    focus: "50% 32%",
    options: ["Escupió la pastilla", "Se cayó algo", "Odia el vestido"],
    answer: "A",
    punchline: "Y se escondió.",
  },
  {
    photo: `${DIR}/03-ojos-de-suplica.jpg`,
    focus: "50% 80%",
    options: ["Rompió un cojín", "Ya se la tomó", "Vio al gato"],
    answer: "B",
    punchline: "Y exige su premio.",
  },
] satisfies Omit<QuizRound, "from" | "timerFrom" | "to">[];

const TIMED_ROUNDS: QuizRound[] = ROUNDS.map((round, index) => {
  const timerFrom = index * ROUND_SECONDS - FIRST_TIMER_ELAPSED;
  return {
    ...round,
    from: index === 0 ? 0 : timerFrom,
    timerFrom,
    to: timerFrom + ROUND_SECONDS,
  };
});

const CLOSING_AT = TIMED_ROUNDS[TIMED_ROUNDS.length - 1].to;
const CTA_AT = CLOSING_AT + 1;

export const aryaQueAcabaDePasarProps: QueAcabaDePasarProps = {
  question: "¿Qué acaba de pasar?",
  rounds: TIMED_ROUNDS,
  closing: {
    lines: ["¿Cuántas le atinaste?", "Comenta: 0, 1, 2 o 3 👇"],
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
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.52 },
  sfx: [
    ...TIMED_ROUNDS.flatMap((round) => {
      const stampAt = round.timerFrom + TIMER_SECONDS;
      return [
        ...Array.from({ length: TIMER_SECONDS * 2 }, (_, half) => round.timerFrom + half / 2)
          .filter((at) => at >= 0)
          .map((at) => ({ sound: TICK, at, volume: at >= stampAt - 1 ? 0.7 : 0.5 })),
        { sound: KNOCK, at: stampAt, volume: 0.55 },
        { sound: SFX.ding, at: stampAt + 0.05, volume: 0.4 },
      ];
    }),
    ...TIMED_ROUNDS.slice(1).map((round) => ({ sound: SFX.whoosh, at: round.from - 0.15, volume: 0.2 })),
    { sound: SFX.pop, at: CLOSING_AT, volume: 0.35 },
  ],
  end: CTA_AT + 2.4,
};
