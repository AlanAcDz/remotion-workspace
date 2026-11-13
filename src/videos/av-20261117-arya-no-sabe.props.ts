import type { NoSabeProps } from "../arya-shorts/no-sabe";
import { MUSIC, SFX } from "../template/schema";

/**
 * 20 · Arya no sabe (AV-20261117-arya-no-sabe). Sin voz, en español.
 * The same true story as 15, told from what Arya does not know. Every photo is
 * a 2026 original the account has not shown (15 used Oct 11 15:53:43 as HOY,
 * 16 cropped the eye of Aug 16), rotated per EXIF to 3000×4000:
 *   line 1 · 01-cara       Aug 21 21:24:37, tight frontal face, eyes to camera
 *   line 2 · 02-mirada     Oct 11 15:53:37, looking up with a tilt, puzzled
 *   line 3 · 03-sillon     Aug 27 12:05:29, sitting calm on the leather couch
 *   line 4 · 04-calabaza   Sep 11 11:25:16, biting her pumpkin toy, the punchline
 * Line 4's text sits over the pillow at the top so it leaves the toy visible.
 * Lines 5 and 6 play over 15's hug clip (approved by Alan on Nov 6, 2026),
 * referenced in place. "A las 8 hay premio" is pending Alan's confirmation.
 * Holds stay at or under 13 characters per second; line 4 gets extra air.
 * Line 1 opens with "Arya no sabe" already set and the push-in under way.
 * The CTA has no "Descarga" line, as in the record; its note is drawn by the
 * format in two rows because the template's single row runs under the pill.
 */
const DIR = "videos/arya/av-20261117-arya-no-sabe";

const LINE_2 = 2.4;
const LINE_3 = 4.7;
const PUNCHLINE = 8;
const HUG = 10.9;
const LINE_6 = 12.4;
const CTA = 14;

export const aryaNoSabeProps: NoSabeProps = {
  shots: [
    {
      from: 0,
      src: `${DIR}/01-cara-20260821_212437.jpg`,
      crop: { x: 0.35, y: 0, width: 0.48 },
      focus: { x: 0.59, y: 0.21 },
    },
    {
      from: LINE_2,
      src: `${DIR}/02-mirada-arriba-20261011_155337.jpg`,
      crop: { x: 0.26, y: 0.11, width: 0.42 },
      focus: { x: 0.47, y: 0.29 },
    },
    {
      from: LINE_3,
      src: `${DIR}/03-sillon-20260827_120529.jpg`,
      crop: { x: 0.18, y: 0.07, width: 0.6 },
      focus: { x: 0.48, y: 0.34 },
    },
    {
      from: PUNCHLINE,
      src: `${DIR}/04-calabaza-20260911_112516.jpg`,
      crop: { x: 0.125, y: 0, width: 0.75 },
      focus: { x: 0.42, y: 0.48 },
    },
  ],
  clip: { from: HUG, src: "videos/arya/av-20261112-sesenta-dias/14-alan-hug-slow.mp4" },
  lines: [
    { from: 0, text: "Arya no sabe\nque casi se muere.", lead: 12 },
    { from: LINE_2, text: "No sabe qué son\nlas plaquetas." },
    { from: LINE_3, text: "No sabe que fueron\ndos meses de pastillas." },
    { from: PUNCHLINE, text: "Solo sabe que a las 8\nhay premio.", top: 330 },
    { from: HUG, text: "Yo sí sé." },
    { from: LINE_6, text: "Por eso hice Arya." },
  ],
  wordGap: 4,
  push: 1.1,
  cta: {
    from: CTA,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "",
    pill: "Enlace en la bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA + 0.1, note: CTA + 0.4, pill: CTA + 0.7 },
  },
  ctaNote: "Recordatorio de pastillas\npara mascotas",
  music: { ...MUSIC.aryaStory, volume: 0.8 },
  sfx: [{ sound: SFX.softHit, at: HUG, volume: 0.25 }],
  end: 16.5,
};
