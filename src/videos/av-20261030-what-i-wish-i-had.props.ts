import { z } from "zod";
import { MUSIC, posDemoSchema, type PosDemoProps } from "../template/schema";
import {
  appWindow,
  aryaCta,
  calloutSfx,
  CUT_SFX,
  panelRow,
  photoPane,
  PHOTOS,
} from "./arya-shared";

/**
 * AV-20261030 — What I wish I had. Alan's cloned voice; one app take per point.
 *
 * Takes (1206x2622, 30 fps, Premium account):
 *  `02-dose-history.mp4`      8–10s History summary, list from row 1765
 *  `03-sleep-schedule.mp4`    Settings, then the Sleep Schedule sheet (08:00
 *                             to 22:00, rows 1040–2100) from 5.7s, held
 *  `04-dose-times.mp4`        44–50s suggested 08:00 and 20:00
 *  `05-mark-taken-refill.mp4` 10–18s Low stock alert card and the refill
 *                             notification (rows 180–1370)
 *
 * "So I built all three" closes on Arya healthy today, before the CTA.
 */

const DIR = "videos/arya/av-20261030-what-i-wish-i-had";

const HISTORY_TOP = 850;
const SLEEP_TOP = 450;
const REFILL_TOP = 150;

const input = {
  theme: "arya",
  audioFile: "audio/av-20261030-what-i-wish-i-had.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaStory,

  hook: {
    text: "3 things I wish I'd had",
    subline: "when my dog was sick",
    until: 3.28,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.28,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/01-arya-cone-close-up.jpg`, PHOTOS.portrait, {
          centerX: 0.5,
          centerY: 0.4,
        }),
      ],
    },
    {
      name: "Every dose",
      from: 3.28,
      to: 6.8,
      layout: "mobile-ui",
      panes: [
        {
          clip: `${DIR}/02-dose-history.mp4`,
          trimBefore: 8.6,
          playbackRate: 0.8,
          frame: appWindow(HISTORY_TOP),
        },
      ],
      // Sits in the gap between the summary card and the first day.
      callout: {
        text: "1 · Every dose, logged",
        left: 48,
        top: panelRow(1580, HISTORY_TOP),
        at: 0.3,
      },
      sfx: [CUT_SFX, calloutSfx(0.3)],
    },
    {
      name: "Sleep schedule",
      from: 6.8,
      to: 9.36,
      layout: "mobile-ui",
      panes: [
        {
          clip: `${DIR}/03-sleep-schedule.mp4`,
          trimBefore: 4.6,
          frame: appWindow(SLEEP_TOP),
        },
      ],
      callout: {
        text: "2 · Reminders that fit your day",
        left: 48,
        // Over the dimmed Language and Reminders rows, above the sheet.
        top: panelRow(860, SLEEP_TOP),
        at: 0.3,
      },
      sfx: [CUT_SFX, calloutSfx(0.3)],
    },
    {
      name: "Not random hours",
      from: 9.36,
      to: 11.52,
      layout: "mobile-ui",
      panes: [
        {
          clip: `${DIR}/04-dose-times.mp4`,
          trimBefore: 45.5,
          frame: appWindow(250),
        },
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Refill heads-up",
      from: 11.52,
      to: 14.64,
      layout: "mobile-ui",
      panes: [
        {
          clip: `${DIR}/05-mark-taken-refill.mp4`,
          trimBefore: 10.6,
          frame: appWindow(REFILL_TOP),
        },
      ],
      callout: {
        text: "3 · Refill heads-up (Premium)",
        left: 48,
        top: panelRow(1420, REFILL_TOP),
        at: 0.3,
      },
      sfx: [CUT_SFX, calloutSfx(0.3)],
    },
    {
      name: "Built all three",
      from: 14.64,
      to: 16.6,
      layout: "mobile-ui",
      panes: [
        photoPane("videos/arya/photos/arya-5.jpg", PHOTOS.square, {
          centerX: 0.46,
          centerY: 0.5,
        }),
      ],
      sfx: [CUT_SFX],
    },
  ],

  cta: aryaCta(16.6, "Try Premium free for 3 days", {
    line2: 16.72,
    note: 17.1,
    pill: 17.52,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaWhatIWishIHadProps: PosDemoProps = posDemoSchema.parse(input);
