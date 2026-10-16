import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  type PosDemoProps,
} from "../template/schema";
import {
  appWindow,
  aryaCta,
  calloutSfx,
  CUT_SFX,
  panelRow,
} from "./arya-shared";

/**
 * AV-20261021 — Did I already give it? Cut from the single simulator take
 * `01-today-mark-taken-history.mp4` (1206x2622, 30 fps, last frame held).
 *
 * Source landmarks (seconds):
 *   0– 6  Today: Antibiotic (1 pill) · 08:00 · Take now!
 *   6– 9  dose sheet, Mark as taken at row 2145; tapped at ≈ 9.2
 *  10–13  toast "Dose recorded as taken" (rows 193–350)
 *  14–19  Treatments → Antibiotic, Information
 *  20–24  History: summary (rows 976–1554), "Taken at 07:52" at row 2060
 *  25–27  previous days scroll
 */

const CLIP =
  "videos/arya/av-20261021-did-i-give-it/01-today-mark-taken-history.mp4";

const TODAY = appWindow(160);
const SHEET = appWindow(1000);
const HISTORY_TOP = 850;
const HISTORY = appWindow(HISTORY_TOP);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261021-did-i-give-it.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Did I give her the pill this morning?",
    subline: "…or was that yesterday?",
    until: 3.83,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.83,
      layout: "mobile-ui",
      panes: [{ clip: CLIP, frame: TODAY, playbackRate: 0.6 }],
    },
    {
      name: "Guessing",
      from: 3.83,
      to: 8.37,
      layout: "mobile-ui",
      // Holds the pending dose until just before the sheet opens at 6s.
      panes: [
        { clip: CLIP, trimBefore: 2.4, playbackRate: 0.75, frame: TODAY },
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Mark as taken",
      from: 8.37,
      to: 12.9,
      layout: "mobile-ui",
      panes: [
        // The tap lands on "Mark as taken" (10.01s absolute); the window then
        // rides up to the toast at the top of Today.
        {
          clip: CLIP,
          trimBefore: 7.5,
          frame: SHEET,
          zoomTo: TODAY,
          zoomStart: 1.85,
          zoomEnd: 2.45,
        },
      ],
      sfx: [CUT_SFX, { sound: SFX.ding, at: 1.75, volume: 0.18 }],
    },
    {
      name: "History",
      from: 12.9,
      to: 17.3,
      layout: "mobile-ui",
      panes: [
        { clip: CLIP, trimBefore: 20.2, playbackRate: 0.85, frame: HISTORY },
      ],
      // Lands on "saves the time" (13.10s absolute).
      callout: {
        text: "Taken at 07:52",
        left: 420,
        top: panelRow(2110, HISTORY_TOP),
        at: 0.2,
      },
      sfx: [CUT_SFX, calloutSfx(0.2)],
    },
  ],

  cta: aryaCta(17.3, "Pill Reminder for pets", {
    line2: 17.44,
    note: 18.5,
    pill: 19.96,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaDidIGiveItProps: PosDemoProps = posDemoSchema.parse(input);
