import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  type PosDemoProps,
} from "../template/schema";
import { appWindow, aryaCta, CUT_SFX, photoPane, PHOTOS } from "./arya-shared";

/**
 * AV-20261106 — Refill before it runs out. Cut from the single take
 * `02-mark-taken-refill.mp4` (1206x2622, 30 fps, Premium account).
 *
 * Source landmarks (seconds):
 *   0– 6  Today: Paw Boost (1 chew) · 09:00 · Take now!
 *   6– 9  dose sheet, Mark as taken at row 2145; tapped at ≈ 9.5
 *  10     toast, and Low stock alerts · Paw Boost · 3 doses left appears
 *  11–18  "It's time to refill Arya's medication!" notification (rows 180–410)
 *  18–22  Refill Medication sheet; Confirm Refill at row 2330
 *  22–29  30 typed on the keypad
 *  29–32  Confirm Refill; the screen flashes blank 32.4–32.7, so no beat
 *         reaches past 32
 */

const CLIP =
  "videos/arya/av-20261106-refill-before-it-runs-out/02-mark-taken-refill.mp4";

const TODAY = appWindow(150);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261106-refill-before-it-runs-out.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Sunday night. Last pill.",
    subline: "Pharmacy's closed.",
    until: 5.2,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.0,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-4.jpg", PHOTOS.stockLandscape, {
          centerX: 0.58,
          centerY: 0.6,
        }),
      ],
    },
    {
      name: "Pharmacy closed",
      from: 3.0,
      to: 5.2,
      layout: "mobile-ui",
      panes: [
        photoPane(
          "videos/arya/av-20261106-refill-before-it-runs-out/01-paw-boost.jpg",
          PHOTOS.square,
          { centerX: 0.5, centerY: 0.5 },
        ),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Counts down",
      from: 5.2,
      to: 8.0,
      layout: "mobile-ui",
      panes: [
        // The tap lands on "every dose" (6.88s absolute), then the window
        // rides up to the toast and the new Low stock card.
        {
          clip: CLIP,
          trimBefore: 7.8,
          frame: appWindow(1000),
          zoomTo: TODAY,
          zoomStart: 1.75,
          zoomEnd: 2.3,
        },
      ],
      sfx: [CUT_SFX, { sound: SFX.ding, at: 1.7, volume: 0.18 }],
    },
    {
      name: "Warns you",
      from: 8.0,
      to: 9.4,
      layout: "mobile-ui",
      panes: [{ clip: CLIP, trimBefore: 11.3, frame: TODAY }],
      sfx: [CUT_SFX],
    },
    {
      name: "Refill",
      from: 9.4,
      to: 10.6,
      layout: "mobile-ui",
      panes: [{ clip: CLIP, trimBefore: 29.6, frame: appWindow(1000) }],
      sfx: [CUT_SFX],
    },
  ],

  cta: aryaCta(10.6, "Try Premium free for 3 days", {
    line2: 10.68,
    note: 11.74,
    pill: 12.96,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaRefillBeforeItRunsOutProps: PosDemoProps =
  posDemoSchema.parse(input);
