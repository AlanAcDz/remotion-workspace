import type { DiaryProps } from "../arya-shorts/diary";
import { MUSIC, SFX } from "../template/schema";

/**
 * 10 · Diary of a dog on meds (AV-20261107-diary-of-a-dog-on-meds).
 * No voice. `01-notebook.jpg` is Codex (1024x1536) drawn 1.25x and pushed left
 * so the chewed corner stays in frame. The polaroids are Arya, one per day, and
 * the banner is the real notification cropped from the Oct 16 take, status bar
 * out (it reads 19:58).
 */
const DIR = "videos/arya/av-20261107-diary-of-a-dog-on-meds";
const PENCIL = "sfx/arya/pencil.mp3";

const PAGES = [
  { from: 0, to: 3.1, photo: `${DIR}/02-day1.jpg`, headStart: 8, lines: ["Day 1.", "They hid it in cheese.", "I ate the cheese.", "I kept the pill."] },
  { from: 3.1, to: 6.3, photo: `${DIR}/03-day2.jpg`, lines: ["Day 2.", "Peanut butter.", "Licked it clean.", "Left the pill", "on the floor.", "A gift."] },
  { from: 6.3, to: 8.3, photo: `${DIR}/04-day3.jpg`, lines: ["Day 3.", "A hand.", "In my mouth.", "Rude."] },
  { from: 8.3, to: 11.3, photo: `${DIR}/05-day4.jpg`, lines: ["Day 4.", "The phone went ding", "at 8:00.", "Again.", "Exactly 8:00."] },
  { from: 11.3, to: 16.6, photo: `${DIR}/06-day5.jpg`, lines: ["Day 5.", "They don't forget", "anymore.", "I may have to", "start swallowing."] },
];

const BANNER_AT = 9.15;
const SIGN_AT = 13.6;
const STAMP_AT = 14.3;

export const aryaDiaryProps: DiaryProps = {
  notebook: `${DIR}/01-notebook.jpg`,
  pages: PAGES,
  banner: { src: `${DIR}/07-reminder-banner.jpg`, at: BANNER_AT, until: 11.0 },
  signAt: SIGN_AT,
  stampAt: STAMP_AT,
  logo: "videos/arya/logo.png",
  stamp: { line1: "Arya: Pill Reminder", line2: "Link in bio" },
  music: { ...MUSIC.aryaDemo, volume: 0.75 },
  sfx: [
    ...PAGES.map((page) => ({ sound: PENCIL, at: page.from, volume: 0.5 })),
    ...PAGES.slice(0, -1).map((page) => ({ sound: SFX.whoosh, at: page.to - 0.3, volume: 0.22 })),
    { sound: SFX.ding, at: BANNER_AT, volume: 0.5 },
    { sound: PENCIL, at: SIGN_AT, volume: 0.25 },
    { sound: SFX.softHit, at: STAMP_AT + 0.16, volume: 0.6 },
  ],
  end: 16.6,
};
