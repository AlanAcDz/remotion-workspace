import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { UI_ZONE } from "../schema";

/**
 * The rounded card that holds a landscape (desktop) recording, centred in the
 * UI zone. Its own 1032x738 aspect is what every desktop crop rect is tuned
 * against, so the box is moved but never reshaped.
 */
export const PANEL = {
  left: 24,
  top: Math.round((UI_ZONE.height - 738) / 2),
  width: 1032,
  height: 738,
  radius: 32,
} as const;

/**
 * Captions sit just under the UI rather than floating in the middle of the
 * bottom third, which keeps them clear of the platform chrome that overlays the
 * last ~200px of a Reel.
 */
export const CAPTION_BAND = {
  top: UI_ZONE.height + 30,
  height: 400,
  width: 960,
  left: 60,
} as const;

interface DemoLayoutProps {
  name: string;
  children: ReactNode;
}

/**
 * Split-screen frame shared by every panel beat: UI above, captions below.
 * Cross-dissolves on enter and exit so beats never hard-cut — each beat's
 * <Sequence> is padded so neighbours overlap.
 */
export function DemoLayout({ name, children }: DemoLayoutProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name={name}>
      <Interactive.Div
        name="Panel"
        style={{
          position: "absolute",
          left: PANEL.left,
          top: PANEL.top,
          width: PANEL.width,
          height: PANEL.height,
          borderRadius: PANEL.radius,
          overflow: "hidden",
          backgroundColor: "#FFFFFF",
          border: "2px solid rgba(34, 30, 24, 0.10)",
          boxShadow: "0 40px 80px rgba(34, 30, 24, 0.18)",
          opacity: interpolate(
            frame,
            [0, 10, durationInFrames - 10, durationInFrames],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
                Easing.bezier(0.16, 1, 0.3, 1),
              ],
            },
          ),
        }}
      >
        {children}
      </Interactive.Div>
    </AbsoluteFill>
  );
}

/** Full-bleed variant for portrait clips recorded at a mobile viewport. */
export function FullFrameLayout({ name, children }: DemoLayoutProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill
      name={name}
      style={{
        overflow: "hidden",
        opacity: interpolate(
          frame,
          [0, 10, durationInFrames - 10, durationInFrames],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: [
              Easing.bezier(0.16, 1, 0.3, 1),
              Easing.linear,
              Easing.bezier(0.16, 1, 0.3, 1),
            ],
          },
        ),
      }}
    >
      {children}
    </AbsoluteFill>
  );
}

/** Full-width mobile UI framing filling the UI zone, captions below it. */
export function MobileUiLayout({ name, children }: DemoLayoutProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name={name} style={{ overflow: "hidden" }}>
      <Interactive.Div
        name="Mobile UI"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: UI_ZONE.width,
          height: UI_ZONE.height,
          overflow: "hidden",
          borderBottomLeftRadius: 36,
          borderBottomRightRadius: 36,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 28px 60px rgba(34, 30, 24, 0.16)",
          opacity: interpolate(
            frame,
            [0, 10, durationInFrames - 10, durationInFrames],
            [0, 1, 1, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: [
                Easing.bezier(0.16, 1, 0.3, 1),
                Easing.linear,
                Easing.bezier(0.16, 1, 0.3, 1),
              ],
            },
          ),
        }}
      >
        {children}
      </Interactive.Div>
    </AbsoluteFill>
  );
}
