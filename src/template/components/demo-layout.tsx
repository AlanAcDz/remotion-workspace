import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/** The UI panel occupies the upper safe zone; captions get the band below it. */
export const PANEL = {
  left: 24,
  top: 210,
  width: 1032,
  height: 738,
} as const;

/** Edge-to-edge mobile UI crop for the upper half of a 1080x1920 frame. */
export const MOBILE_UPPER_HALF = {
  width: 1080,
  height: 960,
} as const;

/** Lower third of the safe zone — 52%–72% of frame height. */
export const CAPTION_BAND = {
  top: 990,
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
          left: 24,
          top: 210,
          width: 1032,
          height: 738,
          borderRadius: 32,
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

/** Full-width mobile UI framing with the lower half reserved for captions. */
export function MobileUpperHalfLayout({ name, children }: DemoLayoutProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name={name} style={{ overflow: "hidden" }}>
      <Interactive.Div
        name="Mobile UI upper half"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: MOBILE_UPPER_HALF.width,
          height: MOBILE_UPPER_HALF.height,
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
