import type { HeadlineId } from "./copy";
import type { Lang, Platform } from "./schema";

/**
 * The approved script, "A day of care, from first drop to bedtime", as data.
 *
 * Every time here is in beats of the 100 BPM bed (1 beat = 0.6 s = 18 frames):
 * scene bounds are global beats, everything inside a scene is relative to
 * its start. Scene cuts fall on the bed's strong beats (0.6 s + 1.2 s · n).
 *
 * Points (`fx`, `fy`) are fractions of the app capture and clip times are
 * seconds into the 30 fps clips, both measured on the recordings (see
 * public/videos/arya/store-videos/clips/README.md), so every tap, ping and
 * zoom follows real UI. Cuts only join identical, still frames.
 */

/** A clip shown from `at`. */
export interface Shot {
  clip: string;
  at: number;
  /** Seconds into the clip shown at `at`. */
  trimBefore: number;
}

/** Where the screen card looks: `zoom` 1 shows the whole screen, focus point centred. */
export interface ViewKey {
  at: number;
  zoom: number;
  fx: number;
  fy: number;
}

export interface Point {
  fx: number;
  fy: number;
}

/** Overlay rings: `tap` marks a real tap, `note` pops a music note, `pulse` is a soft beat. */
export interface Cue extends Point {
  at: number;
  kind: "tap" | "note" | "pulse";
}

export type Motion = "shake" | "jump" | "pop" | "nod" | "bob" | "sleep" | "cheer";

/**
 * `card`: centre as fractions of the screen card box, width as a fraction of
 * its width (x mirrors when the landscape card sits on the right).
 * `media`: bottom-centre pinned to a point of the capture, so it rides the zoom.
 * `panel`: landscape text side; centre as fractions of the panel width and
 * canvas height, width in px.
 */
export type Placement =
  | { on: "card"; cx: number; cy: number; width: number }
  | { on: "media"; fx: number; fy: number; width: number }
  | { on: "panel"; x: number; y: number; width: number };

export interface CharacterCue {
  file: string | Record<Lang, string>;
  at: number;
  motion: Motion;
  portrait: Placement;
  landscape: Placement;
}

export type SceneId =
  | "notify"
  | "dose"
  | "pets"
  | "calendar"
  | "frequency"
  | "home"
  | "sleep";

export interface SceneSpec {
  id: SceneId;
  headline: HeadlineId;
  /** Global beats. */
  from: number;
  to: number;
  /** When each headline line lands. */
  lineAt: [number, number];
  /** Beats between words, for a word-per-beat entrance. */
  wordStep?: number;
  accentAt: number;
  shots: Shot[];
  view: ViewKey[];
  cues: Cue[];
  bursts: (Point & { at: number })[];
  characters: CharacterCue[];
  /** The dose reminder banner drops in at this beat. */
  notificationAt?: number;
  /**
   * Portrait only: show just the top fraction of the screen, on a card as wide
   * as the headline; the rest of the screen is simply out of frame.
   */
  cardCrop?: number;
}

interface UiPoints {
  media: { width: number; height: number };
  doseRow: Point;
  markTaken: Point;
  /** Today (the 4th), then the days tapped: 7, 12, 16, 21. */
  calendarDays: [Point, Point, Point, Point, Point];
  /** Sunday → Saturday chips. */
  weekdays: Point[];
  /** Preview calendar: Monday, Wednesday and Friday of its second week. */
  previewDays: [Point, Point, Point];
  /** iOS: the widget's "Take". Android: the low-stock alert row, then "Confirm Refill". */
  homeTaps: Point[];
  sleepRow: Point;
  sleepSheetTop: Point;
  sleepFocus: Point;
}

/** Measured on the iPhone 18 Pro (1206×2622) and the cropped Pixel 6 Pro (590×1280) clips. */
const UI: Record<Platform, UiPoints> = {
  ios: {
    media: { width: 1206, height: 2622 },
    doseRow: { fx: 0.62, fy: 0.3 },
    markTaken: { fx: 0.5, fy: 0.85 },
    calendarDays: [
      { fx: 0.495, fy: 0.255 },
      { fx: 0.87, fy: 0.255 },
      { fx: 0.62, fy: 0.308 },
      { fx: 0.24, fy: 0.361 },
      { fx: 0.87, fy: 0.361 },
    ],
    weekdays: [
      { fx: 0.17, fy: 0.434 },
      { fx: 0.4, fy: 0.434 },
      { fx: 0.57, fy: 0.434 },
      { fx: 0.205, fy: 0.487 },
      { fx: 0.48, fy: 0.487 },
      { fx: 0.71, fy: 0.487 },
      { fx: 0.18, fy: 0.54 },
    ],
    previewDays: [
      { fx: 0.25, fy: 0.8 },
      { fx: 0.5, fy: 0.8 },
      { fx: 0.75, fy: 0.8 },
    ],
    homeTaps: [{ fx: 0.63, fy: 0.247 }],
    sleepRow: { fx: 0.35, fy: 0.21 },
    sleepSheetTop: { fx: 0.8, fy: 0.405 },
    sleepFocus: { fx: 0.5, fy: 0.6 },
  },
  android: {
    media: { width: 590, height: 1280 },
    doseRow: { fx: 0.6, fy: 0.29 },
    markTaken: { fx: 0.5, fy: 0.835 },
    calendarDays: [
      { fx: 0.495, fy: 0.235 },
      { fx: 0.875, fy: 0.235 },
      { fx: 0.62, fy: 0.286 },
      { fx: 0.24, fy: 0.339 },
      { fx: 0.875, fy: 0.339 },
    ],
    weekdays: [
      { fx: 0.16, fy: 0.41 },
      { fx: 0.38, fy: 0.41 },
      { fx: 0.6, fy: 0.41 },
      { fx: 0.19, fy: 0.463 },
      { fx: 0.45, fy: 0.463 },
      { fx: 0.665, fy: 0.463 },
      { fx: 0.165, fy: 0.515 },
    ],
    previewDays: [
      { fx: 0.25, fy: 0.78 },
      { fx: 0.5, fy: 0.78 },
      { fx: 0.755, fy: 0.78 },
    ],
    homeTaps: [
      { fx: 0.5, fy: 0.56 },
      { fx: 0.5, fy: 0.56 },
    ],
    sleepRow: { fx: 0.35, fy: 0.22 },
    sleepSheetTop: { fx: 0.8, fy: 0.51 },
    sleepFocus: { fx: 0.5, fy: 0.74 },
  },
};

export function mediaSize(platform: Platform) {
  return UI[platform].media;
}

/** When things happen in each clip, in clip seconds. */
interface ClipTimes {
  /** 01-today-dose: the dose row tap, then "Mark as taken". */
  dose: { rowTap: number; takenTap: number };
  /** 03-pets: Pets list settled after the tab switch, then the first scroll's start. */
  pets: { list: number; scroll: number };
  /**
   * 04-calendar: the first day tap (the end of the still view of today), then
   * each tapped day once its list has refilled (skips the empty-state flash).
   */
  calendar: { firstTap: number; days: [number, number, number, number] };
  /** 05-frequency: Monday, Wednesday, Friday on, then Sunday off. */
  frequency: [number, number, number, number];
  /** 06-widget: "Take". 06-refill: alert tap, "30" typed, "Confirm Refill" (the sheet has risen well before it). */
  home: number[];
  /** 07-sleep: the Sleep Schedule row tap. */
  sleep: number;
}

const CLIP_TIMES: Record<Platform, Record<Lang, ClipTimes>> = {
  ios: {
    en: {
      dose: { rowTap: 3.35, takenTap: 10.25 },
      pets: { list: 2.35, scroll: 4.93 },
      calendar: { firstTap: 4.07, days: [4.37, 6.47, 8.5, 10.6] },
      frequency: [2.6, 4.6, 6.6, 8.6],
      home: [2.95],
      sleep: 2.38,
    },
    es: {
      dose: { rowTap: 3.25, takenTap: 6.08 },
      pets: { list: 2.4, scroll: 4.97 },
      calendar: { firstTap: 4.6, days: [4.87, 7.17, 9.33, 11.47] },
      frequency: [2.6, 4.6, 6.63, 8.67],
      home: [2.95],
      sleep: 2.35,
    },
  },
  android: {
    en: {
      dose: { rowTap: 3.65, takenTap: 6.25 },
      pets: { list: 2.5, scroll: 5.27 },
      calendar: { firstTap: 4.87, days: [5.2, 7.13, 9.07, 10.73] },
      frequency: [1.93, 3.3, 4.67, 6.07],
      home: [2.7, 9.77, 16.9],
      sleep: 2.2,
    },
    es: {
      dose: { rowTap: 3.55, takenTap: 6.2 },
      pets: { list: 3.5, scroll: 7.5 },
      calendar: { firstTap: 6.27, days: [7.13, 9.13, 10.8, 13.13] },
      frequency: [1.93, 3.53, 5.07, 6.83],
      home: [5.8, 9.63, 19.1],
      sleep: 2.4,
    },
  },
};

const SECONDS_PER_BEAT = 0.6;

/** A clip shot that shows `clipSecond` exactly on scene beat `onBeat`, starting at beat `at`. */
function clipShot(clip: string, at: number, clipSecond: number, onBeat = at): Shot {
  return { clip, at, trimBefore: Math.max(0, clipSecond - (onBeat - at) * SECONDS_PER_BEAT) };
}

/** Bed beats where the end card starts and the video ends (29.8 s). */
export const END_CARD_FROM = 45;

/**
 * Scene lengths in beats, in script order; they sum to END_CARD_FROM. Cuts
 * fall on the bed's strong beats except home → sleep (beat 40).
 * - Calendar runs 17–25 so its four day taps hit the percussion run on beats
 *   20–23 (11.9–13.9 s).
 * - Frequency runs 25–33: chip toggles on beats 27–30, then the preview
 *   calendar's three note pops on the plucked violin notes at 31, 31.5 and 32
 *   (18.6–19.2 s).
 * - The widget and refill demos get 7 beats so each step has time to read;
 *   pets keeps a single scroll.
 */
const SCENE_BEATS: Record<SceneId, number> = {
  notify: 5,
  dose: 8,
  pets: 4,
  calendar: 8,
  frequency: 8,
  home: 7,
  sleep: 5,
};

type SceneBody = Omit<SceneSpec, "from" | "to">;

/**
 * Portrait shows the whole screen. The landscape card is as wide as the screen
 * but shows ~74 % of its height, so its views pick the part of the screen
 * where the beat happens (fy 0 = top, 1 = bottom) and pan slowly when the
 * action moves, e.g. into a bottom sheet.
 */
function frame(...keys: [at: number, fy: number][]): ViewKey[] {
  return keys.map(([at, fy]) => ({ at, zoom: 1, fx: 0.5, fy }));
}

const FULL = frame([0, 0.5]);
const TOP = frame([0, 0]);

export function buildScenes(platform: Platform, lang: Lang): SceneSpec[] {
  let from = 0;

  return sceneBodies(platform, lang).map((body) => {
    const scene = { ...body, from, to: from + SCENE_BEATS[body.id] };
    from = scene.to;
    return scene;
  });
}

function sceneBodies(platform: Platform, lang: Lang): SceneBody[] {
  const ui = UI[platform];
  const times = CLIP_TIMES[platform][lang];
  const isIos = platform === "ios";
  const [dayToday, ...tappedDays] = ui.calendarDays;
  const toggledChips = [1, 3, 5, 0]; // Monday, Wednesday, Friday on; Sunday off

  return [
    {
      id: "notify",
      headline: "notify",
      lineAt: [0, 1],
      accentAt: 2.5,
      notificationAt: 1,
      shots: [{ clip: "01-today-dose", at: 0, trimBefore: 0 }],
      view: isIos ? FULL : TOP,
      cues: [],
      bursts: [],
      characters: [
        {
          file: "never-miss-dose.png",
          at: 0.3,
          motion: "shake",
          portrait: { on: "card", cx: 0.84, cy: 0.56, width: 0.36 },
          landscape: { on: "panel", x: 0.5, y: 0.74, width: 300 },
        },
      ],
    },
    {
      id: "dose",
      headline: "dose",
      lineAt: [0, 5],
      accentAt: 5,
      // The row tap lands on beat 2.5 and "Mark as taken" on beat 5; the
      // sheet's idle wait in between is spliced out on identical frames.
      shots: [
        clipShot("01-today-dose", 0, times.dose.rowTap, 2.5),
        clipShot("01-today-dose", 4, times.dose.takenTap, 5),
      ],
      // Landscape: the row, down to the sheet for "Mark as taken", back up to the checked row and toast.
      view: isIos ? FULL : frame([0, 0], [3, 0], [4, 1], [5.5, 1], [6.5, 0]),
      cues: [
        { ...ui.doseRow, at: 2.5, kind: "tap" },
        { ...ui.markTaken, at: 5, kind: "tap" },
      ],
      bursts: [{ ...ui.markTaken, at: 5 }],
      characters: [
        {
          file: "finished-treatment.png",
          at: 5,
          motion: "jump",
          portrait: { on: "card", cx: 0.12, cy: 0.5, width: 0.38 },
          landscape: { on: "panel", x: 0.5, y: 0.74, width: 320 },
        },
      ],
    },
    {
      id: "pets",
      headline: "pets",
      lineAt: [0, 1],
      accentAt: 2,
      // Open on the list, then cut into the scroll so the photos keep moving.
      shots: [clipShot("03-pets", 0, times.pets.list), clipShot("03-pets", 1, times.pets.scroll - 0.1)],
      view: isIos ? FULL : TOP,
      cues: [],
      bursts: [],
      characters: [
        {
          file: { en: "thats-me-en.png", es: "thats-me-es.png" },
          at: 0.5,
          motion: "pop",
          portrait: { on: "card", cx: 0.84, cy: 0.3, width: 0.46 },
          landscape: { on: "card", cx: 1.02, cy: 0.32, width: 0.56 },
        },
      ],
    },
    {
      id: "calendar",
      headline: "calendar",
      lineAt: [0, 1],
      accentAt: 2,
      // Today's month while the headline lands, then one tapped day per beat
      // (3–6), each cut in once its events are showing. The view of today
      // ends 0.05 s before the first tap, after the 6-frame crossfade.
      shots: [
        clipShot("04-calendar", 0, times.calendar.firstTap - 0.25, 3),
        ...times.calendar.days.map((settled, index) => clipShot("04-calendar", index + 3, settled)),
      ],
      // Landscape: month grid and the day's events; only the tab bar is out of frame.
      view: isIos ? FULL : TOP,
      cues: [
        { ...dayToday, at: 0.3, kind: "pulse" as const },
        ...tappedDays.map((day, index) => ({ ...day, at: index + 3, kind: "note" as const })),
      ],
      bursts: [],
      characters: [
        {
          file: "smart-scheduling.png",
          at: 0.5,
          motion: "nod",
          portrait: { on: "card", cx: 0.8, cy: 0.88, width: 0.46 },
          landscape: { on: "panel", x: 0.5, y: 0.74, width: 330 },
        },
      ],
    },
    {
      id: "frequency",
      headline: "frequency",
      lineAt: [0, 2],
      wordStep: 1,
      accentAt: 99,
      // A step sequencer: the day chips toggle on beats 2–5, then the
      // preview calendar answers on its Monday, Wednesday and Friday.
      shots: times.frequency.map((toggle, index) =>
        clipShot("05-frequency", index === 0 ? 0 : index + 1.5, toggle, index + 2),
      ),
      // Chips and preview calendar both stay in frame, so the sequencer reads as one screen.
      view: isIos ? FULL : frame([0, 0.62]),
      cues: [
        { ...ui.weekdays[0], at: 1, kind: "pulse" },
        { ...ui.weekdays[4], at: 1.5, kind: "pulse" },
        ...toggledChips.map((chip, index) => ({
          ...ui.weekdays[chip],
          at: index + 2,
          kind: index < 3 ? ("note" as const) : ("pulse" as const),
        })),
        ...ui.previewDays.map((day, index) => ({ ...day, at: 6 + index * 0.5, kind: "note" as const })),
      ],
      bursts: [],
      characters: [
        {
          file: "no-pending-doses.png",
          at: 1,
          motion: "bob",
          portrait: { on: "card", cx: 0.9, cy: 0.97, width: 0.34 },
          landscape: { on: "panel", x: 0.5, y: 0.74, width: 320 },
        },
      ],
    },
    isIos ? widgetScene(ui, times) : refillScene(ui, times),
    {
      id: "sleep",
      headline: "sleep",
      lineAt: [0, 1],
      accentAt: 2,
      shots: [clipShot("07-sleep", 0, times.sleep, 1)],
      // Portrait: a light push onto the sheet. Landscape: the Settings row, then down to the sheet.
      view: isIos
        ? [
            { at: 0, zoom: 1, ...ui.sleepFocus },
            { at: 2, zoom: 1, ...ui.sleepFocus },
            { at: 3, zoom: 1.15, ...ui.sleepFocus },
          ]
        : frame([0, 0], [1.5, 0], [2.5, 1]),
      cues: [{ ...ui.sleepRow, at: 1, kind: "tap" }],
      bursts: [],
      characters: [
        {
          file: "sleeping.png",
          at: 2,
          motion: "sleep",
          portrait: { on: "media", ...ui.sleepSheetTop, width: 0.44 },
          landscape: { on: "media", ...ui.sleepSheetTop, width: 0.5 },
        },
      ],
    },
  ];
}

const HOME_CHARACTER: CharacterCue = {
  file: "multiple-pets.png",
  at: 3,
  motion: "cheer",
  portrait: { on: "card", cx: 0.16, cy: 0.9, width: 0.42 },
  landscape: { on: "panel", x: 0.5, y: 0.74, width: 340 },
};

/** The app's "Later today" times (22:20, 23:20) start at y ≈ 0.585, past the 22:00 bedtime shown next. */
const WIDGET_CROP = 0.55;

/**
 * App Store, 7 beats: the Home Screen widget, "Take" on beat 3, then the app
 * records the dose. The card shows only the top 55 % of the screen, static
 * (no zoom moves), so the late "Later today" times never enter the frame; the
 * clip also ends ~2.7 s after the tap.
 */
function widgetScene(ui: UiPoints, times: ClipTimes): SceneBody {
  const [take] = ui.homeTaps;

  return {
    id: "home",
    headline: "widget",
    lineAt: [0, 1],
    accentAt: 2,
    shots: [clipShot("06-widget", 0, times.home[0], 3)],
    view: TOP,
    cardCrop: WIDGET_CROP,
    cues: [{ ...take, at: 3, kind: "tap" }],
    bursts: [{ ...take, at: 3 }],
    characters: [
      {
        ...HOME_CHARACTER,
        at: 4,
        portrait: { on: "card", cx: 0.5, cy: 1.29, width: 0.5 },
      },
    ],
  };
}

/**
 * Google Play, 7 beats: low-stock alert tap (1.5) → the refill sheet settles →
 * "30" typed (3.5) → the risen sheet → "Confirm Refill" (5.5) → toast, alert gone.
 * Idle waits are spliced out; each step holds for at least a beat.
 */
function refillScene(ui: UiPoints, times: ClipTimes): SceneBody {
  const [alertTap, typed, confirm] = times.home;
  const [alertRow, confirmButton] = ui.homeTaps;

  return {
    id: "home",
    headline: "refill",
    lineAt: [0, 1],
    accentAt: 2,
    shots: [
      clipShot("06-refill", 0, alertTap, 1.5),
      clipShot("06-refill", 3, typed, 3.5),
      clipShot("06-refill", 4.5, confirm, 5.5),
    ],
    // The alert row, down into the sheet for "30" and Confirm, back up to the toast and the cleared alert.
    view: frame([0, 0.35], [1.7, 0.35], [2.6, 1], [5.8, 1], [6.6, 0]),
    cues: [
      { ...alertRow, at: 1.5, kind: "tap" },
      { ...confirmButton, at: 5.5, kind: "tap" },
    ],
    bursts: [{ ...confirmButton, at: 5.5 }],
    characters: [HOME_CHARACTER],
  };
}
