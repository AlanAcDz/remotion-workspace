import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  type PosDemoProps,
} from "../template/schema";
import { appWindow, aryaCta, CUT_SFX } from "./arya-shared";

/**
 * AV-20261026 — Three meds, one list. Cut from the single take
 * `01-treatments-today-mark-taken.mp4` (1206x2622, 30 fps, Premium account).
 *
 * Source landmarks (seconds):
 *   0– 6  Treatments, Active: Antibiotic, then Magic Drops
 *   6–11  scroll down to Paw Boost; 12–19 back up
 *  20–23  Antibiotic, Information: Schedules 08:00 · 20:00, Daily (row 1130)
 *  25–28  Today: overdue Paw Boost, on-time Magic Drops, later Antibiotic
 *  29–31  Magic Drops sheet, Mark as taken at row 2130; tapped at ≈ 31.9
 *  33–39  toast "Dose recorded as taken"
 */

const CLIP =
  "videos/arya/av-20261026-three-meds-one-list/01-treatments-today-mark-taken.mp4";

const input = {
  theme: "arya",
  audioFile: "audio/av-20261026-three-meds-one-list.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Three meds. Three schedules.",
    subline: "One dog.",
    until: 3.99,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.99,
      layout: "mobile-ui",
      // The whole Active list in four seconds: the recorded scroll at 2.75x.
      panes: [{ clip: CLIP, playbackRate: 2.75, frame: appWindow(250) }],
    },
    {
      name: "Added once",
      from: 3.99,
      to: 8.68,
      layout: "mobile-ui",
      panes: [
        {
          clip: CLIP,
          trimBefore: 19.4,
          playbackRate: 0.85,
          frame: appWindow(600),
        },
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "One list",
      from: 8.68,
      to: 10.29,
      layout: "mobile-ui",
      panes: [{ clip: CLIP, trimBefore: 25.3, frame: appWindow(480) }],
      sfx: [CUT_SFX],
    },
    {
      name: "What's done",
      from: 10.29,
      to: 13.25,
      layout: "mobile-ui",
      // The tap lands on "what's done" (12.09s absolute).
      panes: [{ clip: CLIP, trimBefore: 30.1, frame: appWindow(880) }],
      sfx: [CUT_SFX, { sound: SFX.ding, at: 1.8, volume: 0.18 }],
    },
  ],

  cta: aryaCta(13.25, "Try Premium free for 3 days", {
    line2: 13.32,
    note: 14.23,
    pill: 15.41,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaThreeMedsOneListProps: PosDemoProps =
  posDemoSchema.parse(input);
