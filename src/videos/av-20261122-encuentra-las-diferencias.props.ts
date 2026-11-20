import type { DiferenciasProps } from "../arya-shorts/diferencias";
import { SFX } from "../template/schema";

/**
 * 25 · Encuentra las 3 diferencias (AV-20261122-encuentra-las-diferencias).
 * No voice. `01-arya-sillon.jpg` is the original 2023-10-26-152605.jpg
 * (4032×3024, Arya on the sofa arm) scaled to 2000×1500; every coordinate
 * below is a pixel of that file. Both panes show rows 281–1364 at full width.
 * Landmarks: the green toy spans x 195–352, y 845–950; the stitched seam on
 * the sofa back runs down x ≈ 455–490 to the crease at y ≈ 605, with plain
 * leather 90 px to its left; her right front paw ends near (1380, 1080).
 * Each line holds for about 13 characters per second or slower.
 */
const DIR = "videos/arya/av-20261122-encuentra-las-diferencias";
const KNOCK = "sfx/arya/knock.mp3";
const TICK = "sfx/tick.mp3";

const TIMER_END = 7;
const HINT_AT = 3.5;
const SEAM_AT = 7.35;
const TOY_AT = 7.95;
const PILL_AT = 8.6;
const TIE_IN_AT = 10.9;
const CTA_AT = 13.3;

const TICKS = Array.from({ length: TIMER_END * 2 }, (_, index) => index * 0.5);

export const aryaEncuentraLasDiferenciasProps: DiferenciasProps = {
  photo: `${DIR}/01-arya-sillon.jpg`,
  photoSize: { width: 2000, height: 1500 },
  crop: { x: 0, y: 281, width: 2000 },
  reveals: [
    {
      difference: {
        kind: "clone",
        at: { x: 425, y: 250 },
        width: 100,
        height: 410,
        from: { x: -90, y: 0 },
      },
      ring: { x: 472, y: 450, radius: 165 },
      revealAt: SEAM_AT,
    },
    {
      difference: {
        kind: "recolor",
        at: { x: 274, y: 897 },
        rx: 120,
        ry: 90,
        color: "#F2558F",
      },
      ring: { x: 274, y: 897, radius: 115 },
      revealAt: TOY_AT,
    },
    {
      difference: { kind: "pill", at: { x: 1438, y: 1085 }, width: 80, rotate: -18 },
      ring: { x: 1438, y: 1085, radius: 90 },
      revealAt: PILL_AT,
    },
  ],
  lines: [
    { text: "Encuentra las\n3 diferencias", from: 0, to: HINT_AT },
    { text: "Pista: una es\nuna pastilla 👀", from: HINT_AT, to: TIMER_END },
    { text: "¡Tiempo!", from: TIMER_END, to: PILL_AT, pop: true },
    { text: "La pastilla que\n“ya se tomó”.", from: PILL_AT, to: TIE_IN_AT, pop: true },
    { text: "Si ni en la foto\nla encuentras…", from: TIE_IN_AT, to: CTA_AT },
  ],
  timerEnd: TIMER_END,
  pushIn: { from: TIE_IN_AT, to: TIE_IN_AT + 1.4, at: { x: 1438, y: 1085 }, zoom: 1.8 },
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
  duckAt: TIMER_END,
  sfx: [
    ...TICKS.map((at) => ({ sound: TICK, at, volume: at >= TIMER_END - 2 ? 0.75 : 0.5 })),
    { sound: KNOCK, at: TIMER_END, volume: 0.9 },
    { sound: SFX.softHit, at: TIMER_END, volume: 0.35 },
    { sound: SFX.pop, at: SEAM_AT, volume: 0.45 },
    { sound: SFX.pop, at: TOY_AT, volume: 0.45 },
    { sound: SFX.pop, at: PILL_AT, volume: 0.55 },
    { sound: SFX.softHit, at: PILL_AT, volume: 0.4 },
    { sound: SFX.whoosh, at: TIE_IN_AT, volume: 0.18 },
  ],
  end: CTA_AT + 2,
};
