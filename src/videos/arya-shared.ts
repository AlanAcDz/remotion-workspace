import { SFX, UI_ZONE, uiWindow, type Rect } from "../template/schema";

/**
 * Shared framing for Arya videos. Every app take was recorded on the
 * "Arya Video Capture" simulator (iPhone 18 Pro), so one source size and one
 * window helper serve all of them.
 */
export const SIMULATOR = { width: 1206, height: 2622 } as const;

/** Full-width UI-zone window starting at source row `topPx` of a simulator take. */
export const appWindow = (topPx: number): Rect => uiWindow(SIMULATOR, topPx);

/** Panel pixels per simulator pixel, for placing callouts over the UI. */
export const APP_SCALE = UI_ZONE.width / SIMULATOR.width;

/** Panel row of a simulator row inside a window that starts at `windowTop`. */
export const panelRow = (sourceRow: number, windowTop: number): number =>
  Math.round((sourceRow - windowTop) * APP_SCALE);

const UI_ASPECT = UI_ZONE.width / UI_ZONE.height;

/**
 * The largest UI-zone-shaped crop of a photo, shrunk by `zoom` and centred on
 * (`centerX`, `centerY`) — fractions of the photo — then clamped inside it.
 * Photos come in every aspect, so this is what keeps them from stretching.
 */
export function photoFrame(
  photo: { width: number; height: number },
  centerX: number,
  centerY: number,
  zoom = 1,
): Rect {
  const photoAspect = photo.width / photo.height;
  const fitWidth = photoAspect > UI_ASPECT ? UI_ASPECT / photoAspect : 1;
  const fitHeight = photoAspect > UI_ASPECT ? 1 : photoAspect / UI_ASPECT;
  const width = fitWidth / zoom;
  const height = fitHeight / zoom;
  const clamp = (value: number, size: number) =>
    Math.min(Math.max(value - size / 2, 0), 1 - size);

  return { x: clamp(centerX, width), y: clamp(centerY, height), width, height };
}

interface PhotoPaneOptions {
  /** Where the push-in ends, as a fraction of the photo. */
  centerX: number;
  centerY: number;
  /** How far the slow push-in travels; 1 holds the photo still. */
  zoom?: number;
  /** Starts already pushed in, for wide photos where Arya is small. */
  startZoom?: number;
}

/** A still photo with the slow push-in story videos use on every photo beat. */
export function photoPane(
  clip: string,
  photo: { width: number; height: number },
  { centerX, centerY, zoom = 1.12, startZoom = 1 }: PhotoPaneOptions,
) {
  return {
    clip,
    still: true,
    frame: photoFrame(photo, centerX, centerY, startZoom),
    zoomTo: photoFrame(photo, centerX, centerY, startZoom * zoom),
    zoomStart: 0,
    zoomEnd: 6,
  };
}

/** Photo sizes, measured once. */
export const PHOTOS = {
  portrait: { width: 1800, height: 2400 },
  landscape: { width: 2400, height: 1800 },
  stockPortrait: { width: 750, height: 1000 },
  stockLandscape: { width: 1000, height: 750 },
  square: { width: 1024, height: 1024 },
} as const;

/** Callouts over photos sit low in the UI zone, clear of Arya's face. */
export const PHOTO_CALLOUT = { left: 48, top: 1080 } as const;

/** Arya stays calm: one quiet whoosh per cut and a soft pop for callouts. */
export const CUT_SFX = { sound: SFX.whoosh, volume: 0.12 } as const;
export const calloutSfx = (at: number) => ({
  sound: SFX.pop,
  at,
  volume: 0.2,
});

type CtaNote = "Pill Reminder for pets" | "Try Premium free for 3 days";

/** The CTA card shared by every Arya video; only the note and timing change. */
export function aryaCta(
  from: number,
  note: CtaNote,
  revealAt: { line2: number; note: number; pill: number },
) {
  return {
    from,
    logo: "videos/arya/logo.png",
    line1: "Download",
    line2: "Arya",
    note,
    pill: "Link in bio",
    sfx: [{ sound: SFX.softHit, volume: 0.25 }],
    revealAt,
  };
}
