import type { DiaryProps } from "../arya-shorts/diary";
import { aryaDiaryProps } from "./av-20261107-diary-of-a-dog-on-meds.props";

/**
 * 17 · Diario de una perrita con pastillas (AV-20261114-diario-de-una-perrita).
 * The clean Spanish twin of 10: language is the only variable, so everything
 * but the words is taken from 10's props (notebook, polaroids, page timings,
 * music, SFX, signature and stamp beats, 16.6 s). The banner is redrawn in
 * Spanish at the English crop's size (1206x212) with the app's real wording
 * (es.json notifications.medicationTimeForPet); no Spanish capture exists.
 */
const DIR = "videos/arya/av-20261114-diario-de-una-perrita";

const LINES = [
  ["Día 1.", "Lo escondieron en queso.", "Me comí el queso.", "Guardé la pastilla."],
  ["Día 2.", "Crema de cacahuate.", "La dejé limpia.", "Dejé la pastilla", "en el piso.", "Un regalo."],
  ["Día 3.", "Una mano.", "En mi boca.", "Qué grosería."],
  ["Día 4.", "El teléfono hizo ding", "a las 8:00.", "Otra vez.", "8:00 en punto."],
  ["Día 5.", "Ya no se les olvida.", "Voy a tener que", "empezar a tragármela."],
];

export const aryaDiarioProps: DiaryProps = {
  ...aryaDiaryProps,
  pages: aryaDiaryProps.pages.map((page, index) => ({ ...page, lines: LINES[index] })),
  banner: { ...aryaDiaryProps.banner, src: `${DIR}/07-banner-recordatorio.jpg` },
  stamp: { line1: "Arya: Pill Reminder", line2: "Enlace en la bio" },
};
