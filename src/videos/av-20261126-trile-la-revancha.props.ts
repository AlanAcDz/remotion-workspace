import {
  revealSlot,
  type Swap,
  type TrileRevanchaProps,
} from "../arya-shorts/trile-revancha";
import { SFX } from "../template/schema";

/**
 * 29 · Trile: la revancha (AV-20261126-trile-la-revancha). No voice.
 * Rematch of 18 (¿Dónde quedó la pastillita?) with four cups and a fair game:
 * the pill starts under B, every swap is honest, and the cup that lifts is the
 * one the swaps leave it under (D). `revealSlot` throws at load if the swaps
 * and `LIFT_SLOT` ever disagree. Then the twist: Arya's rug clip.
 *
 * Pill path, slot after each swap (A = 0 … D = 3):
 *   B → (B↔C) C → (A↔D) C → (C↔D) D → (A↔B) D → (A↔D) A → (B↔C) A → (A↔C) C → (C↔D) D
 *
 * No new media. Table, cup and rug clip are 11's, the Spanish dose sheet is
 * 18's, all referenced in place. Sheet landmarks are 18's: the card crops from
 * source row 1475, so "Marcar como omitida" lands at card row ≈ 634.
 */
const TRILE_DIR = "videos/arya/av-20261108-find-the-pill";
const SHEET_DIR = "videos/arya/av-20261115-donde-quedo-la-pastillita";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const A = 0;
const B = 1;
const C = 2;
const D = 3;

const PILL_START = B;
const LIFT_SLOT = D;
const LAND_AT = 0.3;
const SWAP_FROM = 0.35;
const SWAPS: Swap[] = [
  { a: B, b: C, seconds: 0.85 },
  { a: A, b: D, seconds: 0.75 },
  { a: C, b: D, seconds: 0.65 },
  { a: A, b: B, seconds: 0.6 },
  { a: D, b: A, seconds: 0.55 },
  { a: B, b: C, seconds: 0.5 },
  { a: A, b: C, seconds: 0.45 },
  { a: C, b: D, seconds: 0.45 },
];
const swapEnds = SWAPS.reduce<number[]>(
  (ends, swap) => [...ends, (ends[ends.length - 1] ?? SWAP_FROM) + swap.seconds],
  [],
);

const STOP_AT = 5.2;
const COUNTDOWN = [5.3, 5.8, 6.3];
const LIFT_AT = 6.85;
const SNATCH_AT = 8.45;
const CLIP_AT = 8.7;
const SHEET_AT = 11.1;
const CTA_AT = 13.5;

export const aryaTrileLaRevanchaProps: TrileRevanchaProps = {
  table: `${TRILE_DIR}/01-table.jpg`,
  cup: `${TRILE_DIR}/cup.png`,
  pillStart: PILL_START,
  swaps: SWAPS,
  swapFrom: SWAP_FROM,
  hoverFrom: 360,
  landAt: LAND_AT,
  stopAt: STOP_AT,
  countdown: COUNTDOWN,
  liftSlot: LIFT_SLOT,
  liftAt: LIFT_AT,
  snatchAt: SNATCH_AT,
  hook: "La revancha.\nAhora son 4.",
  ask: "¿Cuál?\nA, B, C o D.",
  found: "¡Ahí estaba!",
  clip: {
    src: `${TRILE_DIR}/02-rug-yellow-piece.mp4`,
    from: CLIP_AT,
    to: SHEET_AT,
    rate: 0.5,
    text: "…y aun así\nse la ganó Arya.",
  },
  sheet: {
    src: `${SHEET_DIR}/01-hoja-de-dosis.jpg`,
    from: SHEET_AT,
    to: CTA_AT,
    text: "Anota lo que de verdad pasó.",
    cropTop: 1475,
    ringTop: 634,
  },
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
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.7 },
  duckAt: LIFT_AT - 0.2,
  sfx: [
    { sound: KNOCK, at: LAND_AT, volume: 0.9 },
    ...swapEnds.map((at) => ({ sound: KNOCK, at, volume: 0.65 })),
    ...COUNTDOWN.map((at) => ({ sound: TICK, at, volume: 0.6 })),
    { sound: SFX.pop, at: LIFT_AT, volume: 0.4 },
    { sound: SFX.ding, at: LIFT_AT + 0.1, volume: 0.35 },
    { sound: SFX.whoosh, at: SNATCH_AT, volume: 0.35 },
    { sound: SFX.pop, at: CLIP_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: SHEET_AT, volume: 0.25 },
  ],
  end: 15.6,
};

revealSlot(aryaTrileLaRevanchaProps);
