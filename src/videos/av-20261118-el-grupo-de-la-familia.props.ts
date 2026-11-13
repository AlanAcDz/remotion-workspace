import type { AryaChatProps, ChatCapture } from "../arya-shorts/chat";
import { MUSIC, SFX } from "../template/schema";

/**
 * 21 · El grupo de la familia (AV-20261118-el-grupo-de-la-familia). Sin voz,
 * en español. Read off Sofi's phone: the family finds out two people gave
 * Maya the same pill; the next day Sofi takes over the dose and sends a
 * screen recording. The app keeps one record on one phone, so the chat only
 * ever sees Sofi's capture, never shared data.
 *
 * `01-today-dose-es.mp4` is the Spanish store clip
 * (`store-videos/clips/ios/es/01-today-dose.mp4`) from 4.0 s to 12.0 s, 30 fps,
 * 1206x2622. Landmarks, in frames of this file:
 * - 0-62: the sheet is open and still. Title rows 1965-2015, "Marcar como
 *   tomada" rows 2162-2286 (centre 603, 2224), "Marcar como omitida" to 2430.
 * - 63: the button is pressed. 67: Maya's row gets its check behind the sheet.
 *   70-74: the sheet slides away. 75-93: the checked row, clean:
 *   "Dosis a tiempo" rows 640-668, the row 699-865, "Eventos pendientes" 945.
 * - 94-96: the toast "Dosis registrada como tomada" fades in at rows 214-370
 *   and the checked row leaves the list. Other pets' avatars start at row 371,
 *   so the toast is shown as a band.
 * `02-dose-checked-es.png` is frame 86, held as the proof once the toast has
 * fired. Every crop keeps other pets' names, avatars, counts and events out.
 *
 * Line 7 is the record's fallback, "Y ya no hay duda 👏": the store clip only
 * shows the scheduled time (09:05), not the time the dose was taken, and the
 * Spanish History capture failed when the simulator runtime dropped out.
 */
const DIR = "videos/arya/av-20261118-el-grupo-de-la-familia";
const TAKE = `${DIR}/01-today-dose-es.mp4`;

const NEXT_DAY_AT = 5.9;
const CAPTURE_AT = 6.5;
const CLOSER_AT = 13.7;
const CTA_AT = 16.0;

/** Seconds after Sofi's message lands. */
const TAP_AT = 1.2;
const TOAST_AT = 2.0;

const SHEET = { at: 0, left: 27, top: 1950, width: 1152 };
const CHECKED_ROW = { at: 0, left: 27, top: 532, width: 1152 };

const capture: ChatCapture = {
  width: 860,
  height: 358,
  shots: [
    {
      src: TAKE,
      from: 0,
      trimBefore: 27 / 30,
      windows: [SHEET],
      taps: [{ at: TAP_AT, x: 603, y: 2224 }],
    },
    // Cuts to the row as the sheet starts to leave, so the check lands on screen.
    { src: TAKE, from: 1.3, trimBefore: 66 / 30, windows: [CHECKED_ROW] },
    {
      src: TAKE,
      from: TOAST_AT,
      trimBefore: 94 / 30,
      windows: [{ at: 0, left: 27, top: 50, width: 1152 }],
      band: { top: 200, bottom: 366 },
    },
    { src: `${DIR}/02-dose-checked-es.png`, from: 3.4, trimBefore: 0, windows: [CHECKED_ROW] },
  ],
};

const MESSAGES_AT = [0, 1.3, 2.8, 4.3, CAPTURE_AT, 10.2, 11.7];

export const aryaElGrupoDeLaFamiliaProps: AryaChatProps = {
  group: { name: "Familia 🐶", members: "Mamá, Papá, Sofi" },
  members: {
    mama: { name: "Mamá", initial: "M", color: "#237A7A" },
    papa: { name: "Papá", initial: "P", color: "#C0643A" },
    sofi: { name: "Sofi", initial: "S", color: "#7A5AA6" },
  },
  me: "sofi",
  items: [
    { kind: "message", from: "mama", at: MESSAGES_AT[0], time: "1:05 p. m.", text: "¿Quién le dio la pastilla\na Maya?" },
    { kind: "message", from: "papa", at: MESSAGES_AT[1], typing: 1.3, time: "1:06 p. m.", text: "Yo, en la mañana ☀️" },
    { kind: "message", from: "sofi", at: MESSAGES_AT[2], time: "1:06 p. m.", text: "¿Cómo? Yo también 😳" },
    { kind: "message", from: "mama", at: MESSAGES_AT[3], typing: 0.7, time: "1:07 p. m.", text: "Le estoy marcando\na la veterinaria." },
    { kind: "divider", at: NEXT_DAY_AT, text: "Al día siguiente" },
    {
      kind: "message",
      from: "sofi",
      at: CAPTURE_AT,
      time: "9:19 a. m.",
      text: "Listo. Yo se la doy\ny aquí queda anotado.",
      capture,
    },
    { kind: "message", from: "mama", at: MESSAGES_AT[5], typing: 0.6, time: "9:20 a. m.", text: "Y ya no hay duda 👏" },
    { kind: "message", from: "papa", at: MESSAGES_AT[6], typing: 0.6, time: "9:21 a. m.", text: "Entonces yo ya no le doy 😅" },
  ],
  closer: { text: "Que no dependa\nde la memoria.", from: CLOSER_AT },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "Descarga",
    line2: "Arya",
    note: "Recordatorio de pastillas\npara mascotas",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT + 0.1, note: CTA_AT + 0.3, pill: CTA_AT + 0.6 },
  },
  music: { ...MUSIC.aryaDemo, volume: 0.72 },
  sfx: [
    ...[MESSAGES_AT[1], MESSAGES_AT[3], MESSAGES_AT[5], MESSAGES_AT[6]].map((at) => ({ sound: SFX.pop, at, volume: 0.3 })),
    ...[MESSAGES_AT[2], CAPTURE_AT].map((at) => ({ sound: SFX.whoosh, at: at - 0.05, volume: 0.16 })),
    { sound: "sfx/tick.mp3", at: NEXT_DAY_AT, volume: 0.25 },
    { sound: "sfx/tick.mp3", at: CAPTURE_AT + TAP_AT, volume: 0.35 },
    { sound: SFX.ding, at: CAPTURE_AT + TOAST_AT + 0.05, volume: 0.22 },
    { sound: SFX.softHit, at: CLOSER_AT, volume: 0.3 },
  ],
  end: 18.4,
};
