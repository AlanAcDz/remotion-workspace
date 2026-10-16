import { z } from "zod";
import { MUSIC, posDemoSchema, type PosDemoProps } from "../template/schema";
import { appWindow, aryaCta, CUT_SFX, photoPane, PHOTOS } from "./arya-shared";

/**
 * AV-20261102 — The vet asks: every dose? Two photos of Arya, then the single
 * take `02-history-summary-scroll.mp4` (1206x2622, 30 fps).
 *
 * Source landmarks (seconds):
 *   0– 5  Treatments with Antibiotic
 *   5– 8  Information; History tapped at ≈ 8
 *   8–10  History summary: 92%, 24 of 26 taken (rows 980–1560)
 *  11–33  scroll through the days; both "Dose skipped" rows pass 16–24
 */

const CLIP =
  "videos/arya/av-20261102-vet-asks-every-dose/02-history-summary-scroll.mp4";

const LIST = appWindow(300);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261102-vet-asks-every-dose.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "“Has she been getting every dose?”",
    subline: "— your vet, at the follow-up",
    until: 4.1,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.1,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-3.jpg", PHOTOS.stockLandscape, {
          centerX: 0.5,
          centerY: 0.5,
        }),
      ],
    },
    {
      name: "Mostly?",
      from: 4.1,
      to: 6.69,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-2.jpg", PHOTOS.stockPortrait, {
          centerX: 0.5,
          centerY: 0.38,
          zoom: 1.2,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Open her treatment",
      from: 6.69,
      to: 9.33,
      layout: "mobile-ui",
      // Treatments → Information → History, ending on the History tap.
      panes: [{ clip: CLIP, trimBefore: 3.6, playbackRate: 1.7, frame: LIST }],
      sfx: [CUT_SFX],
    },
    {
      name: "Taken or skipped",
      from: 9.33,
      to: 12.4,
      layout: "mobile-ui",
      // The first "Dose skipped" scrolls in on "skipped" (10.96s absolute).
      panes: [{ clip: CLIP, trimBefore: 14.6, frame: LIST }],
      sfx: [CUT_SFX],
    },
    {
      name: "Just the record",
      from: 12.4,
      to: 14.7,
      layout: "mobile-ui",
      panes: [
        { clip: CLIP, trimBefore: 9, playbackRate: 0.5, frame: appWindow(850) },
      ],
      sfx: [CUT_SFX],
    },
  ],

  cta: aryaCta(14.7, "Pill Reminder for pets", {
    line2: 14.76,
    note: 15.56,
    pill: 16.63,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaVetAsksEveryDoseProps: PosDemoProps =
  posDemoSchema.parse(input);
