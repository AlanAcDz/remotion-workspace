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
 * AV-20261023 — Forgot your dog's medication? One photo of Arya per rule of
 * thumb, then the History tab of `05-mark-taken-history.mp4` (the same take
 * as AV-20261021): "Taken at 07:52" at source row 2060 between 20 and 24s.
 */

const CLIP =
  "videos/arya/av-20261023-forgot-dog-medication/05-mark-taken-history.mp4";

const HISTORY_TOP = 850;
const HISTORY = appWindow(HISTORY_TOP);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261023-forgot-dog-medication.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Forgot your dog's meds?",
    subline: "Don't double the next dose.",
    until: 4.09,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.09,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-1.jpg", PHOTOS.stockPortrait, {
          centerX: 0.62,
          centerY: 0.45,
        }),
      ],
    },
    {
      name: "A few hours late",
      from: 4.09,
      to: 8.2,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-2.jpg", PHOTOS.stockPortrait, {
          centerX: 0.5,
          centerY: 0.4,
        }),
      ],
      callout: {
        text: "A few hours late → give it",
        ...PHOTO_CALLOUT,
        at: 1.15,
      },
      sfx: [CUT_SFX, calloutSfx(1.15)],
    },
    {
      name: "Next dose soon",
      from: 8.2,
      to: 11.92,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-3.jpg", PHOTOS.stockLandscape, {
          centerX: 0.5,
          centerY: 0.5,
        }),
      ],
      callout: { text: "Next dose soon → skip it", ...PHOTO_CALLOUT, at: 0.3 },
      sfx: [CUT_SFX, calloutSfx(0.3)],
    },
    {
      name: "Call your vet",
      from: 11.92,
      to: 15.78,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-4.jpg", PHOTOS.stockLandscape, {
          centerX: 0.58,
          centerY: 0.6,
        }),
      ],
      callout: {
        text: "Insulin, seizure, heart → call your vet",
        ...PHOTO_CALLOUT,
        at: 0.3,
      },
      sfx: [CUT_SFX, calloutSfx(0.3)],
    },
    {
      name: "Last dose",
      from: 15.78,
      to: 19.4,
      layout: "mobile-ui",
      panes: [
        { clip: CLIP, trimBefore: 20.2, playbackRate: 0.85, frame: HISTORY },
      ],
      // Lands on "the last one" (18.18s absolute).
      callout: {
        text: "Taken at 07:52",
        left: 420,
        top: panelRow(2110, HISTORY_TOP),
        at: 2.4,
      },
      sfx: [CUT_SFX, calloutSfx(2.4)],
    },
  ],

  cta: aryaCta(19.4, "Pill Reminder for pets", {
    line2: 19.5,
    note: 19.75,
    pill: 19.95,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaForgotDogMedicationProps: PosDemoProps =
  posDemoSchema.parse(input);
