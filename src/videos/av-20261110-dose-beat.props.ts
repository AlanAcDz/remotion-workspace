import type { DoseBeatProps } from "../arya-shorts/dose-beat";

/**
 * 13 · I made a beat out of my dog's meds (AV-20261110-dose-beat). No voice.
 * `01-frequency-loop.mp4` is `store-videos/clips/ios/en/05-frequency.mp4`
 * time-remapped: its four taps (source 2.5, 4.5, 6.5, 8.6 s: Monday, Wednesday,
 * Friday on, Sunday off) land every 0.6 s, then the same 2.4 s plays backwards,
 * and that 4.8 s cycle runs twice. The audio is the store bed's beats 25-33
 * (15-19.8 s), two passes. Weekly is Premium, so the note stays on screen.
 */
const DIR = "videos/arya/av-20261110-dose-beat";

const MONDAY = { x: 484, y: 1132 };
const WEDNESDAY = { x: 246, y: 1275 };
const FRIDAY = { x: 853, y: 1275 };
const SUNDAY = { x: 205, y: 1132 };

const CYCLE = [
  { at: 0, ...MONDAY },
  { at: 0.6, ...WEDNESDAY },
  { at: 1.2, ...FRIDAY },
  { at: 1.8, ...SUNDAY },
  { at: 3.0, ...SUNDAY },
  { at: 3.6, ...FRIDAY },
  { at: 4.2, ...WEDNESDAY },
];

export const aryaDoseBeatProps: DoseBeatProps = {
  clip: `${DIR}/01-frequency-loop.mp4`,
  audio: "audio/av-20261110-dose-beat.mp3",
  cropTop: 470,
  taps: [...CYCLE, ...CYCLE.map((tap) => ({ ...tap, at: tap.at + 4.8 }))],
  character: "videos/arya/store-videos/characters/smart-scheduling.png",
  sticker: "I made a beat out of my dog's med schedule 🎧",
  note: "Arya: Pill Reminder · Try Premium free for 3 days",
  end: 9.6,
};
