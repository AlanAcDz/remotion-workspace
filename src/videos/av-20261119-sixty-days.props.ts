import type { FlipbookProps } from "../arya-shorts/flipbook";
import { aryaSesentaDiasProps as es } from "./av-20261112-sesenta-dias.props";

/**
 * 22 · 60 days in 12 seconds (AV-20261119-sixty-days). No voice, English.
 * A clean twin of 15 (AryaSesentaDias): same photos, clip, cuts, music, SFX
 * and 17.4 s length, read from 15's props so they cannot drift. Only the
 * words change, so the two videos' numbers isolate the language.
 */
const ENGLISH_LINES = [
  "They told me she might die.",
  "Ehrlichia. Two months of antibiotics.",
  "Did I give it?",
  "Or was that yesterday?",
  "Her platelets recovered.",
];

export const aryaSixtyDaysProps: FlipbookProps = {
  ...es,
  lines: es.lines.map((line, index) => ({ ...line, text: ENGLISH_LINES[index] })),
  held: {
    ...es.held,
    today: { ...es.held.today, label: "TODAY", text: "Still here." },
    hug: { ...es.held.hug, text: "I built an app so I'd never have to ask again." },
  },
  dayLabel: "DAY",
  cta: {
    ...es.cta,
    line1: "Download",
    line2: "Arya",
    note: "Try Premium free for 3 days",
    pill: "Link in bio",
  },
};
