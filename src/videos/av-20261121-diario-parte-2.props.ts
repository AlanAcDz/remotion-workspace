import type { DiaryProps } from "../arya-shorts/diary";
import { SFX } from "../template/schema";
import { aryaDiarioProps } from "./av-20261114-diario-de-una-perrita.props";

/**
 * 24 · Diario de una perrita · Parte 2 (AV-20261121-diario-parte-2).
 * Sequel to 17: same notebook, music, signature and stamp, new entries and
 * four Arya photos 17 did not use (crops of photos/arya-1, arya-no-sabe 02 and
 * 03, and the original 20261011_155343). The banner is 17's Spanish banner with
 * the body redrawn as "Arya: Pastilla de la mañana" (23's wording, no dose).
 * Pages are 3.5–4.3 s so every page reads at ≤13 chars/s. "Me subieron de
 * queso a jamón." is split in two lines: one line would run past the page.
 */
const DIR = "videos/arya/av-20261121-diario-parte-2";
const PENCIL = "sfx/arya/pencil.mp3";

const PAGES = [
  { from: 0, to: 4.3, photo: `${DIR}/01-dia14-almohada.jpg`, headStart: 18, lines: ["Día 14.", "Me subieron de queso", "a jamón.", "Respeto el esfuerzo."] },
  { from: 4.3, to: 8.1, photo: `${DIR}/02-dia15-oreja-arriba.jpg`, lines: ["Día 15.", "Oigo el frasco", "desde dos cuartos.", "Ya me fui."] },
  { from: 8.1, to: 11.6, photo: `${DIR}/03-dia16-sillon.jpg`, lines: ["Día 16.", "Sonó su teléfono.", "La alarma me delató."] },
  { from: 11.6, to: 18.1, photo: `${DIR}/04-dia60-mirada.jpg`, lines: ["Día 60.", "Ya no hay pastillas.", "Extraño el jamón."] },
];

const BANNER_AT = 8.7;
const SIGN_AT = 15.0;
const STAMP_AT = 15.6;

export const aryaDiarioParte2Props: DiaryProps = {
  ...aryaDiarioProps,
  pages: PAGES,
  banner: { src: `${DIR}/05-banner-recordatorio.jpg`, at: BANNER_AT, until: 11.1 },
  signAt: SIGN_AT,
  stampAt: STAMP_AT,
  badge: { text: "PARTE 2", until: 17.8 },
  sfx: [
    ...PAGES.map((page) => ({ sound: PENCIL, at: page.from, volume: 0.5 })),
    ...PAGES.slice(0, -1).map((page) => ({ sound: SFX.whoosh, at: page.to - 0.3, volume: 0.22 })),
    { sound: SFX.ding, at: BANNER_AT, volume: 0.5 },
    { sound: PENCIL, at: SIGN_AT, volume: 0.25 },
    { sound: SFX.softHit, at: STAMP_AT + 0.16, volume: 0.6 },
  ],
  end: 18.1,
};
