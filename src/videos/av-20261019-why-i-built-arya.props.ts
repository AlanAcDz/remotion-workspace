import { z } from "zod";
import {
  MUSIC,
  posDemoSchema,
  SFX,
  type PosDemoProps,
} from "../template/schema";
import { appWindow, aryaCta, CUT_SFX, photoPane, PHOTOS } from "./arya-shared";

/**
 * AV-20261019 — Why I built Arya. Alan's cloned voice over his own photos of
 * Arya from 2023–2024, then the app.
 *
 * Photos (1800x2400 unless noted): on the couch and close up in the cone after
 * her eye surgery, the ehrlichia skin lesion, asleep in the cone, and her
 * current meds (2400x1800) blurred so no label is readable.
 *
 * App take `05-today-two-meds-mark-taken.mp4` (1206x2622, 30 fps):
 *   0– 6  Today: Antibiotic and Eye drops at 08:00, three more doses later
 *   7– 9  Antibiotic sheet; Mark as taken tapped at ≈ 9.8, the window rides up at 10
 *  11–14  toast "Dose recorded as taken"
 */

const DIR = "videos/arya/av-20261019-why-i-built-arya";
const CLIP = `${DIR}/05-today-two-meds-mark-taken.mp4`;

const TODAY = appWindow(240);
const SHEET = appWindow(1000);
const TOAST = appWindow(160);

const input = {
  theme: "arya",
  audioFile: "audio/av-20261019-why-i-built-arya.mp3",
  captionStyle: "paper",
  music: MUSIC.aryaStory,

  hook: {
    text: "A vet told me my dog might die.",
    subline: "This is Arya.",
    until: 3.92,
  },

  beats: [
    {
      name: "Hook",
      from: 0,
      to: 3.92,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/00-arya-cone-on-couch.jpg`, PHOTOS.portrait, {
          centerX: 0.45,
          centerY: 0.55,
          startZoom: 1.8,
        }),
      ],
    },
    {
      name: "Ehrlichia",
      from: 3.92,
      to: 7.28,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/02-ehrlichia-skin-rash.jpg`, PHOTOS.portrait, {
          centerX: 0.42,
          centerY: 0.6,
          zoom: 1.25,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Antibiotics",
      from: 7.28,
      to: 9.32,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/03-meds-labels-blurred.jpg`, PHOTOS.landscape, {
          centerX: 0.55,
          centerY: 0.55,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Surgery",
      from: 9.32,
      to: 11.36,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/04-arya-cone-sleeping.jpg`, PHOTOS.portrait, {
          centerX: 0.6,
          centerY: 0.55,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Different times",
      from: 11.36,
      to: 14.56,
      layout: "mobile-ui",
      // Five doses at four different times — the line, on one screen.
      panes: [{ clip: CLIP, trimBefore: 0.5, playbackRate: 0.6, frame: TODAY }],
      sfx: [CUT_SFX],
    },
    {
      name: "Did I give it",
      from: 14.56,
      to: 17.52,
      layout: "mobile-ui",
      panes: [
        photoPane(`${DIR}/01-arya-cone-close-up.jpg`, PHOTOS.portrait, {
          centerX: 0.5,
          centerY: 0.4,
          zoom: 1.2,
        }),
      ],
      sfx: [CUT_SFX],
    },
    {
      name: "Built for her",
      from: 17.52,
      to: 20.9,
      layout: "mobile-ui",
      panes: [
        {
          clip: CLIP,
          trimBefore: 8.6,
          frame: SHEET,
          zoomTo: TOAST,
          zoomStart: 1.3,
          zoomEnd: 1.9,
        },
      ],
      sfx: [CUT_SFX, { sound: SFX.ding, at: 1.2, volume: 0.18 }],
    },
  ],

  cta: aryaCta(20.9, "Try Premium free for 3 days", {
    line2: 21.0,
    note: 21.92,
    pill: 22.84,
  }),
} satisfies z.input<typeof posDemoSchema>;

export const aryaWhyIBuiltAryaProps: PosDemoProps = posDemoSchema.parse(input);
