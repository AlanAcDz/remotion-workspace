import type { DiferenciasProps } from "../arya-shorts/diferencias";
import { SFX } from "../template/schema";

/**
 * 31 · Encuentra las diferencias 2 (AV-20261128-encuentra-las-diferencias-2).
 * No voice; sequel to 25 with the same format. `01-arya-navidad.jpg` is the
 * original 2023-12-25-134045.jpg (4032×3024, Arya asleep on a blanket next to
 * a drawer unit) scaled to 2000×1500; every coordinate below is a pixel of
 * that file. Both panes show rows 60–1143 at full width.
 * Landmarks: the left bead chain hangs from (1495, 0) to (1442, 325) over dark
 * fabric, with plain fabric 85 px to its right; the thin gap between the two
 * drawers runs from (0, 322) up to (700, 235), with plain wood 80 px above it;
 * the blanket right of her front paw is clear around (1800, 1000).
 * Her face (x ≥ 1650, y 380–1000) is never covered.
 * Each line holds for about 13 characters per second or slower.
 */
const DIR = "videos/arya/av-20261128-encuentra-las-diferencias-2";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const TIMER_END = 7;
const HINT_AT = 3.5;
const GAP_AT = 7.35;
const CHAIN_AT = 7.95;
const PILL_AT = 8.6;
const TIE_IN_AT = 11.2;
const CTA_AT = 13.8;
const QUESTION_AT = CTA_AT + 0.8;

const TICKS = Array.from({ length: TIMER_END * 2 }, (_, index) => index * 0.5);
const PILL = { x: 1800, y: 1000 } as const;

export const aryaEncuentraLasDiferencias2Props: DiferenciasProps = {
  photo: `${DIR}/01-arya-navidad.jpg`,
  photoSize: { width: 2000, height: 1500 },
  crop: { x: 0, y: 60, width: 2000 },
  tag: "PARTE 2",
  reveals: [
    {
      difference: {
        kind: "clone",
        at: { x: 70, y: 250 },
        width: 260,
        height: 90,
        from: { x: 0, y: -80 },
      },
      ring: { x: 200, y: 298, radius: 150 },
      revealAt: GAP_AT,
    },
    {
      difference: {
        kind: "clone",
        at: { x: 1418, y: -40 },
        width: 100,
        height: 440,
        from: { x: 85, y: 0 },
      },
      ring: { x: 1468, y: 245, radius: 130 },
      revealAt: CHAIN_AT,
    },
    {
      difference: { kind: "pill", at: PILL, width: 76, rotate: 16 },
      ring: { ...PILL, radius: 90 },
      revealAt: PILL_AT,
    },
  ],
  lines: [
    { text: "Encuentra las\n3 diferencias", from: 0, to: HINT_AT },
    { text: "Pista: una es\nuna pastilla 👀", from: HINT_AT, to: TIMER_END },
    { text: "¡Tiempo!", from: TIMER_END, to: PILL_AT, pop: true },
    { text: "Siesta navideña…\ncon sorpresa 🎁", from: PILL_AT, to: TIE_IN_AT, pop: true },
    { text: "¿Ya se la diste\no la escondió?", from: TIE_IN_AT, to: CTA_AT },
  ],
  timerEnd: TIMER_END,
  pushIn: { from: TIE_IN_AT, to: TIE_IN_AT + 1.4, at: PILL, zoom: 1.5 },
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
  question: { text: "¿Cuántas encontraste? 👇", at: QUESTION_AT },
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.7 },
  duckAt: TIMER_END,
  sfx: [
    ...TICKS.map((at) => ({ sound: TICK, at, volume: at >= TIMER_END - 2 ? 0.75 : 0.5 })),
    { sound: KNOCK, at: TIMER_END, volume: 0.9 },
    { sound: SFX.softHit, at: TIMER_END, volume: 0.35 },
    { sound: SFX.pop, at: GAP_AT, volume: 0.45 },
    { sound: SFX.pop, at: CHAIN_AT, volume: 0.45 },
    { sound: SFX.pop, at: PILL_AT, volume: 0.55 },
    { sound: SFX.softHit, at: PILL_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: TIE_IN_AT, volume: 0.18 },
    { sound: SFX.pop, at: QUESTION_AT, volume: 0.35 },
  ],
  end: CTA_AT + 3,
};
