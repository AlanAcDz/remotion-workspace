import type { TierListProps } from "../arya-shorts/tier-list";
import { MUSIC, SFX } from "../template/schema";

/**
 * 14 · Pill dodge tier list (AV-20261111-pill-dodge-tier-list). No voice.
 * Four Codex cards in the store mascot's style; the composition writes every
 * word. C to S, so the best tier lands last. The health line stays on screen
 * because this video is about that exact moment.
 */
const DIR = "videos/arya/av-20261111-pill-dodge-tier-list";
const STEP = 2.5;

const ENTRIES = [
  { tier: "C", image: `${DIR}/01-swallower.png`, name: "The Instant Swallower", line: "Zero skill. Good dog." },
  { tier: "B", image: `${DIR}/02-surgeon.png`, name: "The Food Surgeon", line: "Eats around the pill." },
  { tier: "A", image: `${DIR}/03-thief.png`, name: "The Peanut Butter Thief", line: "Licks it clean. Leaves the pill." },
  { tier: "S", image: `${DIR}/04-magician.png`, name: "The Tiny Magician", line: "Hides it in the cheek. Spits it out 5 seconds later." },
].map((entry, index) => ({
  ...entry,
  from: index * STEP,
  flyAt: index * STEP + STEP - 0.4,
}));

const ASK_AT = 10;
const HEALTH_AT = 12.1;
const CTA_AT = 14;

export const aryaTierListProps: TierListProps = {
  title: "Ranking how dogs dodge pills",
  entries: ENTRIES,
  ask: { text: "What tier is your dog? 👇", from: ASK_AT, to: HEALTH_AT },
  health: { text: "Not sure it went down?\nDon't give another.\nAsk your vet.", from: HEALTH_AT, to: CTA_AT },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "",
    line2: "Arya",
    note: "Pill Reminder for pets",
    pill: "Link in bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT, note: CTA_AT + 0.25, pill: CTA_AT + 0.5 },
  },
  music: { ...MUSIC.aryaDemo, volume: 0.75 },
  sfx: [
    ...ENTRIES.flatMap((entry) => [
      { sound: SFX.pop, at: entry.from + 0.1, volume: 0.5 },
      { sound: "sfx/arya/knock.mp3", at: entry.flyAt + 0.3, volume: 0.45 },
    ]),
    { sound: SFX.ding, at: ASK_AT, volume: 0.35 },
  ],
  end: 16,
};
