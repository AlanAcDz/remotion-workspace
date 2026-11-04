import { Easing, interpolate } from "remotion";
import type { Placement, Point, ViewKey } from "./scenes";
import { beats, type Orientation } from "./schema";

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

export type Side = "left" | "right";

export interface StageLayout {
  card: Box;
  /** Where the headline and the landscape characters live. */
  panel: Box;
  headline: { top: number; maxSize: number };
  radius: number;
}

/**
 * Portrait: headline on top, the screen card below it. The card has the phone
 * screen's own shape (both captures are ~0.46 wide:tall), so zoom 1 shows the
 * whole UI uncropped.
 * Landscape: card on one side, headline and characters on the other,
 * alternating sides scene by scene. The card is wider than the screen's shape
 * so the UI reads at 1080p; it fits the screen's width and shows ~74 % of its
 * height, which each scene frames on its action.
 */
export function stageLayout(orientation: Orientation, side: Side): StageLayout {
  if (orientation === "portrait") {
    return {
      card: { left: 107, top: 410, width: 672, height: 1460 },
      panel: { left: 43, top: 0, width: 800, height: 410 },
      headline: { top: 120, maxSize: 86 },
      radius: 84,
    };
  }

  const card = { top: 40, width: 620, height: 1000 };
  const isCardLeft = side === "left";

  return {
    card: { ...card, left: isCardLeft ? 240 : 1920 - 240 - card.width },
    panel: {
      left: isCardLeft ? 900 : 60,
      top: 0,
      width: 960,
      height: 1080,
    },
    headline: { top: 250, maxSize: 96 },
    radius: 62,
  };
}

export interface View {
  /** Media size and offset inside the card, in px. */
  width: number;
  height: number;
  x: number;
  y: number;
}

const VIEW_EASING = Easing.bezier(0.45, 0, 0.2, 1);

function interpolateKeys(frame: number, keys: ViewKey[], pick: (key: ViewKey) => number) {
  if (keys.length === 1) {
    return pick(keys[0]);
  }

  return interpolate(
    frame,
    keys.map((key) => beats(key.at)),
    keys.map(pick),
    { easing: VIEW_EASING, extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );
}

/** The capture fills the card at zoom 1; when zoomed, the focus point is centred, then clamped so no edge shows. */
export function viewAt(
  frame: number,
  keys: ViewKey[],
  card: { width: number; height: number },
  media: { width: number; height: number },
): View {
  const zoom = interpolateKeys(frame, keys, (key) => key.zoom);
  const fx = interpolateKeys(frame, keys, (key) => key.fx);
  const fy = interpolateKeys(frame, keys, (key) => key.fy);
  const cover = Math.max(card.width / media.width, card.height / media.height);
  const width = media.width * cover * zoom;
  const height = media.height * cover * zoom;
  const clamp = (value: number, size: number, box: number) =>
    Math.min(0, Math.max(box - size, value));

  return {
    width,
    height,
    x: clamp(card.width / 2 - fx * width, width, card.width),
    y: clamp(card.height / 2 - fy * height, height, card.height),
  };
}

/** A capture point in card px. */
export function mapPoint(point: Point, view: View) {
  return { x: view.x + point.fx * view.width, y: view.y + point.fy * view.height };
}

export interface PlacedCharacter {
  centerX: number;
  /** Centre or bottom, depending on `anchor`. */
  y: number;
  anchor: "center" | "bottom";
  width: number;
}

/** Resolves a character placement to canvas px. */
export function placeCharacter(
  placement: Placement,
  layout: StageLayout,
  side: Side,
  view: View,
): PlacedCharacter {
  const { card, panel } = layout;

  if (placement.on === "panel") {
    return {
      centerX: panel.left + placement.x * panel.width,
      y: panel.top + placement.y * panel.height,
      anchor: "center",
      width: placement.width,
    };
  }

  if (placement.on === "media") {
    const point = mapPoint(placement, view);

    return {
      centerX: card.left + Math.min(Math.max(point.x, 0), card.width),
      y: card.top + Math.min(Math.max(point.y, 0), card.height),
      anchor: "bottom",
      width: placement.width * card.width,
    };
  }

  const cx = side === "right" ? 1 - placement.cx : placement.cx;

  return {
    centerX: card.left + cx * card.width,
    y: card.top + placement.cy * card.height,
    anchor: "center",
    width: placement.width * card.width,
  };
}
