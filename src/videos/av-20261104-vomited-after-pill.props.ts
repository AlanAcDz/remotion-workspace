import { z } from "zod";
import { MUSIC, posDemoSchema, type PosDemoProps } from "../template/schema";
import {
  appWindow,
  aryaCta,
  calloutSfx,
  CUT_SFX,
  panelRow,
  PHOTO_CALLOUT,
  photoPane,
  PHOTOS,
} from "./arya-shared";

/**
 * AV-20261104 — Threw up after the pill. Photos of Arya resting (no vomit,
 * no pills), then the History tab of `04-mark-taken-history.mp4` (the same
 * take as AV-20261021): "Taken at 07:52" at source row 2060 from 20 to 24s.
 */

const DIR = "videos/arya/av-20261104-vomited-after-pill";

const HISTORY_TOP = 850;

const input = {
  theme: "arya",
  audioFile: "audio/av-20261104-vomited-after-pill.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Your dog threw up right after the pill.",
    subline: "Now what?",
    until: 3.29,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.29,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-4.jpg", PHOTOS.stockLandscape, {
          centerX: 0.58,
          centerY: 0.6,
        }),
      ],
    },
    {
      name: "Don't re-dose",
      from: 3.29,
      to: 8.27,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-1.jpg", PHOTOS.stockPortrait, {
          centerX: 0.62,
          centerY: 0.45,
        }),
      ],
      callout: { text: "Don't re-dose on your own", ...PHOTO_CALLOUT, at: 0.2 },
      sfx: [CUT_SFX, calloutSfx(0.2)],
    },
    {
      name: "Note both times",
      from: 8.27,
      to: 10.44,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-3.jpg", PHOTOS.stockLandscape, {
          centerX: 0.5,
          centerY: 0.5,
        }),
      ],
      callout: { text: "Note both times", ...PHOTO_CALLOUT, at: 0.2 },
      sfx: [CUT_SFX, calloutSfx(0.2)],
    },
    {
      name: "Call your vet",
      from: 10.44,
      to: 11.82,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-2.jpg", PHOTOS.stockPortrait, {
          centerX: 0.5,
          centerY: 0.4,
        }),
      ],
      callout: { text: "Call your vet", ...PHOTO_CALLOUT, at: 0.2 },
      sfx: [CUT_SFX, calloutSfx(0.2)],
    },
    {
      name: "Urgent care",
      from: 11.82,
      to: 15.54,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/03-arya-cone-sleeping.jpg`, PHOTOS.portrait, {
          centerX: 0.6,
          centerY: 0.55,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "When you gave it",
      from: 15.54,
      to: 17.85,
      layout: "mobile-ui",
      panes: [
        {
          clip: `${DIR}/04-mark-taken-history.mp4`,
          trimBefore: 20.2,
          frame: appWindow(HISTORY_TOP),
        },
      ],
      // Lands on "when you gave it" (17.03s absolute).
      callout: {
        text: "Taken at 07:52",
        left: 420,
        top: panelRow(2110, HISTORY_TOP),
        at: 1.45,
      },
      sfx: [CUT_SFX, calloutSfx(1.45)],
    },
  ],

  cta: aryaCta(17.85, "Pill Reminder for pets", {
    line2: 17.9,
    note: 18.15,
    pill: 18.4,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaVomitedAfterPillProps: PosDemoProps =
  posDemoSchema.parse(input);
