import type { FlipbookProps } from "../arya-shorts/flipbook";
import { MUSIC, SFX } from "../template/schema";

/**
 * 15 · 60 días en 12 segundos (AV-20261112-sesenta-dias). Sin voz, en español.
 * The photos run in date order (Oct 2023 to Feb 2024) but the antibiotics
 * started around March 2024: Alan confirmed on Nov 6, 2026 that the photo-to-day
 * mapping is illustrative, since nothing about her looks different on them.
 * HOY is Oct 11, 2026. The hug shot is undated, used with Alan's OK;
 * `14-alan-hug-slow.mp4` is its 1.17 s stretched to 3.4 s with motion
 * interpolation, because the closing line needs 3 s to read.
 * Each line holds for about 13 characters per second or slower.
 */
const DIR = "videos/arya/av-20261112-sesenta-dias";
const p = (name: string) => ({ photo: `${DIR}/${name}.jpg` });

const PHOTOS = {
  chair: p("01-2023-10-15-230653"),
  rug: p("02-2023-10-15-230957"),
  sofaArm: p("03-2023-10-26-152605"),
  pinkBed: p("04-2023-11-14-155432"),
  orange: p("05-2023-11-18-103422"),
  toys: p("06-2023-12-24-233632"),
  sofa: p("08-2024-01-07-213937"),
  orangeClose: p("09-2024-01-19-102827"),
  pen: p("10-2024-02-05-155134"),
};

const CLIP_FROM = 6.4;
const CLIP_TO = 8.2;
const TODAY_AT = 10.8;
const HUG_AT = 12.4;
const CTA_AT = 15.4;

const FLIPS = [
  { from: 0, ...PHOTOS.chair },
  { from: 0.8, ...PHOTOS.rug },
  { from: 2, ...PHOTOS.sofaArm },
  { from: 3, ...PHOTOS.pinkBed },
  { from: 3.9, ...PHOTOS.orange },
  { from: 4.8, ...PHOTOS.toys },
  { from: 5.6, ...PHOTOS.sofa },
  { from: CLIP_TO, ...PHOTOS.orangeClose },
  { from: 9.5, ...PHOTOS.pen },
];

export const aryaSesentaDiasProps: FlipbookProps = {
  flips: FLIPS,
  days: [
    [0, 0],
    [1.9, 0],
    [2, 1],
    [4.2, 1],
    [4.8, 14],
    [5.8, 14],
    [6.4, 31],
    [7.6, 31],
    [CLIP_TO, 60],
  ],
  lines: [
    { from: 0, text: "Me dijeron que podía morir." },
    { from: 2, text: "Ehrlichia. Dos meses de antibióticos." },
    { from: 4.8, text: "¿Ya se la di?" },
    { from: CLIP_FROM, text: "¿O eso fue ayer?" },
    { from: CLIP_TO, text: "Sus plaquetas se recuperaron." },
  ],
  held: {
    clip: { src: `${DIR}/12-rug-toys-night.mp4`, from: CLIP_FROM, to: CLIP_TO },
    today: { src: `${DIR}/11-hoy-2026-10-11.jpg`, from: TODAY_AT, to: HUG_AT, label: "HOY", text: "Sigue aquí." },
    hug: { src: `${DIR}/14-alan-hug-slow.mp4`, from: HUG_AT, to: CTA_AT + 0.3, rate: 1, text: "Hice una app para no volver a preguntármelo." },
  },
  dayLabel: "DÍA",
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "Descarga",
    line2: "Arya",
    note: "Prueba Premium gratis 3 días",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT + 0.1, note: CTA_AT + 0.3, pill: CTA_AT + 0.5 },
  },
  music: { ...MUSIC.aryaStory, volume: 0.9 },
  sfx: [
    ...[...FLIPS.map((flip) => flip.from), 7.6, 7.8, 8].map((at) => ({ sound: "sfx/tick.mp3", at, volume: 0.22 })),
    { sound: SFX.softHit, at: TODAY_AT, volume: 0.5 },
  ],
  end: 17.4,
};
