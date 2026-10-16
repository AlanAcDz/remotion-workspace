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
 * AV-20261028 — Every 12 hours.
 *
 * `02-create-twice-a-day.mp4` (1206x2622, 30 fps), New Medication form:
 *  21–33  Treatment Duration: Temporary, End Date → Oct 30, 2026 (row 840)
 *  34–43  Frequency Daily, Times per day → Twice a day, Preview calendar
 *  44–50  suggested Dose 1 08:00 and Dose 2 20:00 (rows 1010 and 1160) with
 *         Respect Sleep Schedule on
 *
 * `03-reminder-banner.mp4`: the real "Time for Arya's medication!" banner
 * from 20.1 to 27.4s (rows 175–375). The status bar is frozen at 19:58, so
 * every window starts below it.
 */

const DIR = "videos/arya/av-20261028-every-12-hours";
const FORM = `${DIR}/02-create-twice-a-day.mp4`;
const BANNER = `${DIR}/03-reminder-banner.mp4`;

const FORM_TOP = 250;
const FORM_WINDOW = appWindow(FORM_TOP);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261028-every-12-hours.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaDemo,

  hook: {
    text: "Your vet said every 12 hours.",
    subline: "Here's how to stick to it.",
    until: 4.93,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 4.93,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-5.jpg", PHOTOS.square, {
          centerX: 0.46,
          centerY: 0.5,
        }),
      ],
    },
    {
      name: "Two times",
      from: 4.93,
      to: 9.09,
      layout: "mobile-ui",
      // Twice a day is picked, then 08:00 and 20:00 appear on "8 and 8".
      panes: [{ clip: FORM, trimBefore: 42.6, frame: FORM_WINDOW }],
      callout: {
        text: "8 AM · 8 PM",
        left: 300,
        top: panelRow(1270, FORM_TOP),
        at: 2.05,
      },
      sfx: [CUT_SFX, calloutSfx(2.05)],
    },
    {
      name: "Finish the course",
      from: 9.09,
      to: 12.21,
      layout: "mobile-ui",
      panes: [{ clip: FORM, trimBefore: 30.2, frame: FORM_WINDOW }],
      callout: {
        text: "Finish the course",
        left: 300,
        top: panelRow(1250, FORM_TOP),
        at: 0.5,
      },
      sfx: [CUT_SFX, calloutSfx(0.5)],
    },
    {
      name: "Ask your vet",
      from: 12.21,
      to: 15.24,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-1.jpg", PHOTOS.stockPortrait, {
          centerX: 0.62,
          centerY: 0.45,
        }),
      ],
      callout: { text: "Ask before changing times", ...PHOTO_CALLOUT, at: 1.3 },
      sfx: [CUT_SFX, calloutSfx(1.3)],
    },
    {
      name: "Spaces the doses",
      from: 15.24,
      to: 17.3,
      layout: "mobile-ui",
      panes: [{ clip: FORM, trimBefore: 45, frame: FORM_WINDOW }],
      sfx: [CUT_SFX],
    },
    {
      name: "Reminds you",
      from: 17.3,
      to: 19.4,
      layout: "mobile-ui",
      // The banner drops in 0.7s into the beat, on "reminds you".
      panes: [{ clip: BANNER, trimBefore: 19.4, frame: appWindow(160) }],
      sfx: [CUT_SFX],
    },
  ],

  cta: aryaCta(19.4, "Pill Reminder for pets", {
    line2: 19.45,
    note: 19.7,
    pill: 19.9,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaEvery12HoursProps: PosDemoProps = posDemoSchema.parse(input);
