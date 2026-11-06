import type { FiveSecondProps } from "../arya-shorts/five-second";
import { MUSIC, SFX } from "../template/schema";

/**
 * 12 · The 5-second test (AV-20261109-five-second-test). No voice.
 * The five seconds are real: the count is the mechanism. `01-history.jpg` is
 * the History screen at 22 s of the Oct 16 take, 1206x2622; "Taken at 07:52"
 * sits at source rows 1975-2130.
 */
const DIR = "videos/arya/av-20261109-five-second-test";
const TICK = "sfx/tick.mp3";
const PROOF_AT = 7.6;
const CTA_AT = 10;

export const aryaFiveSecondProps: FiveSecondProps = {
  question: "5 seconds.\nWhen was your dog's last dose?",
  exact: "The exact time.",
  exactAt: 2.5,
  timesUp: { text: "Time's up.", from: 5, to: 5.4 },
  cantSay: { text: "Can't say?\nNeither could I.", to: PROOF_AT },
  proof: {
    src: `${DIR}/01-history.jpg`,
    from: PROOF_AT,
    to: CTA_AT,
    text: "So I built something that does.",
    cropTop: 1730,
    cropHeight: 440,
    ringTop: 1965,
    ringHeight: 170,
  },
  cta: {
    from: CTA_AT,
    logo: "videos/arya/logo.png",
    line1: "Download",
    line2: "Arya",
    note: "Pill Reminder for pets",
    pill: "Link in bio",
    sfx: [{ sound: SFX.softHit, at: 0, volume: 0.3 }],
    revealAt: { line2: CTA_AT + 0.1, note: CTA_AT + 0.3, pill: CTA_AT + 0.5 },
  },
  music: { ...MUSIC.aryaDemo, volume: 0.55 },
  sfx: [
    ...[0, 1, 2, 3, 4].map((at) => ({ sound: TICK, at, volume: 0.9 })),
    { sound: SFX.pop, at: 2.5, volume: 0.35 },
    { sound: "sfx/arya/boom.mp3", at: 5, volume: 0.6 },
    { sound: SFX.whoosh, at: PROOF_AT, volume: 0.25 },
    { sound: SFX.ding, at: PROOF_AT + 0.4, volume: 0.35 },
  ],
  end: 12,
};
