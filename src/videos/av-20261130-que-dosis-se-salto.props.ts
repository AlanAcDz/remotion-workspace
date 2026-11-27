import type { QueDosisProps } from "../arya-shorts/que-dosis";
import { SFX } from "../template/schema";

/**
 * 33 · ¿Qué dosis se saltó? (AV-20261130-que-dosis-se-salto). No voice, in
 * Spanish. A find-the-gap game on the app's own dose history, then the
 * reminder and the overdue flag on Today.
 *
 * Stills are 1206 × 2622 screenshots of the Arya dev app in Spanish on the
 * iPhone 18 Pro simulator, captured 2026-11-27 with demo data: Arya, one daily
 * treatment "Pastilla" (1 pastilla) at 13:00, every dose logged except
 * Tuesday 24/11, which was never marked (Free tier: one pet, one treatment).
 * - `01-historial.jpg` (Pastilla › Historial, scrolled): day headers and rows
 *   for Thu 26 (row 1012–1182), Wed 25 (1303–1473), Tue 24 "Pendientes"
 *   (1594–1764) and Mon 23 (1885–2055); row text ends near column 905.
 * - `02-hoy-a-tiempo.jpg` (Hoy, no gap seeded): "Resumen de hoy" ≈ 282,
 *   "DOSIS A TIEMPO" ≈ 654, the row with "¡Tomar ahora!" 697–867.
 * - `03-hoy-dosis-atrasada.jpg` (Hoy, gap seeded): "MIENTRAS NO ESTABAS" with
 *   "1 dosis necesita confirmación" 697–866, "DOSIS ATRASADAS" with the
 *   24/11 13:00 row 987–1157, row cards span columns 48–1157.
 */
const DIR = "videos/arya/av-20261130-que-dosis-se-salto";
const TICK = "sfx/tick.mp3";

const TIME_UP_AT = 5.0;
const BRIDGE_AT = 7.0;
const BRIDGE_LINE_2_AT = 7.6;
const REMIND_AT = 9.8;
const BANNER_AT = 10.2;
const FLAG_AT = 12.4;
const FLAG_RING_AFTER = 0.6;
const CTA_AT = 14.9;
export const QUE_DOSIS_END = 17.3;

export const aryaQueDosisProps: QueDosisProps = {
  board: {
    src: `${DIR}/01-historial.jpg`,
    crop: { left: 0, top: 915, width: 960, height: 1160 },
    gap: { left: 8, top: 1588, width: 944, height: 182 },
  },
  question: "¿Qué dosis\nse saltó?",
  timerLabel: "Tienes 5 segundos ⏱️",
  timeUpAt: TIME_UP_AT,
  reveal: "¡El martes! 👀",
  bridgeAt: BRIDGE_AT,
  bridgeLine2At: BRIDGE_LINE_2_AT,
  bridge: ["Así se ve un", "“creo que sí\nse la di”."],
  photo: "videos/arya/photos/arya-5.jpg",
  remindAt: REMIND_AT,
  remind: {
    line: "Arya te avisa\nantes de que pase.",
    still: {
      src: `${DIR}/02-hoy-a-tiempo.jpg`,
      crop: { left: 0, top: 200, width: 1206, height: 690 },
    },
    bannerAt: BANNER_AT,
  },
  flagAt: FLAG_AT,
  flag: {
    line: "Y si se pasa,\nte lo marca.",
    still: {
      src: `${DIR}/03-hoy-dosis-atrasada.jpg`,
      crop: { left: 0, top: 200, width: 1206, height: 990 },
    },
    ring: { at: FLAG_RING_AFTER, left: 40, top: 979, width: 1126, height: 186 },
  },
  notification: {
    icon: "videos/arya/store-videos/app-icon.png",
    title: "¡Hora de darle sus medicamentos a Arya!",
    body: "Arya: Pastilla (1 pastilla)",
    time: "ahora",
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
  music: { src: "music/arya-store-video-bed.mp3", trimBefore: 0, volume: 0.6 },
  sfx: [
    { sound: SFX.pop, at: 0, volume: 0.25 },
    ...[1, 2].map((at) => ({ sound: TICK, at, volume: 0.35 })),
    ...[3, 3.5, 4, 4.5].map((at) => ({ sound: TICK, at, volume: 0.6 })),
    { sound: SFX.softHit, at: TIME_UP_AT, volume: 0.4 },
    { sound: SFX.pop, at: TIME_UP_AT + 0.05, volume: 0.4 },
    { sound: SFX.whoosh, at: BRIDGE_AT, volume: 0.25 },
    { sound: SFX.softHit, at: BRIDGE_LINE_2_AT, volume: 0.35 },
    { sound: SFX.whoosh, at: REMIND_AT, volume: 0.25 },
    { sound: SFX.ding, at: BANNER_AT, volume: 0.35 },
    { sound: SFX.whoosh, at: FLAG_AT, volume: 0.25 },
    { sound: SFX.pop, at: FLAG_AT + FLAG_RING_AFTER, volume: 0.35 },
  ],
};
