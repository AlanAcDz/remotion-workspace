import type { TrileProps } from "../arya-shorts/trile";
import { SFX } from "../template/schema";

/**
 * 11 · Find the pill (AV-20261108-find-the-pill). No voice.
 * Eight honest swaps, faster each time, all landing on a wood knock. The table
 * and cup are Codex. `02-rug-yellow-piece.mp4` is the 1.17 s shot from
 * MOVIE.mp4, slowed to 1.5 s; the yellow piece is not a real pill, it only
 * reads as one. The sheet is the real dose sheet from the Oct 16 take.
 */
const DIR = "videos/arya/av-20261108-find-the-pill";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const SWAP_FROM = 0.4;
const SWAPS = [
  { a: 0, b: 1, seconds: 1.15 },
  { a: 1, b: 2, seconds: 1.05 },
  { a: 0, b: 2, seconds: 0.95 },
  { a: 0, b: 1, seconds: 0.85 },
  { a: 1, b: 2, seconds: 0.75 },
  { a: 0, b: 1, seconds: 0.7 },
  { a: 0, b: 2, seconds: 0.6 },
  { a: 1, b: 2, seconds: 0.55 },
];
const swapEnds = SWAPS.reduce<number[]>(
  (ends, swap) => [...ends, (ends[ends.length - 1] ?? SWAP_FROM) + swap.seconds],
  [],
);

const COUNTDOWN = [7.8, 8.35, 8.9];
const LIFT_AT = 9.5;
const CLIP_AT = 10.7;
const SHEET_AT = 12.2;
const CTA_AT = 13.7;

export const aryaFindThePillProps: TrileProps = {
  table: `${DIR}/01-table.jpg`,
  cup: `${DIR}/cup.png`,
  swaps: SWAPS,
  swapFrom: SWAP_FROM,
  landAt: 0.2,
  stopAt: 7,
  countdown: COUNTDOWN,
  liftAt: LIFT_AT,
  hook: "Keep your eye on the pill.",
  ask: "Comment A, B or C.",
  clip: {
    src: `${DIR}/02-rug-yellow-piece.mp4`,
    from: CLIP_AT,
    to: SHEET_AT,
    rate: 0.78,
    text: "She spat it out at 8:04.",
  },
  sheet: {
    src: `${DIR}/03-dose-sheet.jpg`,
    from: SHEET_AT,
    to: CTA_AT,
    text: "Log what really happened.",
  },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Pill Reminder for pets",
    pill: "Link in bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.25, pill: CTA_AT + 0.5 },
  },
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.7 },
  sfx: [
    { sound: KNOCK, at: 0.2, volume: 0.9 },
    ...swapEnds.map((at) => ({ sound: KNOCK, at, volume: 0.65 })),
    ...COUNTDOWN.map((at) => ({ sound: TICK, at, volume: 0.6 })),
    { sound: SFX.whoosh, at: LIFT_AT, volume: 0.4 },
    { sound: SFX.pop, at: CLIP_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: SHEET_AT, volume: 0.25 },
  ],
  end: 15.7,
};

