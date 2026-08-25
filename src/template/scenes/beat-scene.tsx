import { AbsoluteFill, Easing, Interactive, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BeatPane } from "../components/beat-pane";
import {
  DemoLayout,
  FullFrameLayout,
  MobileUpperHalfLayout,
  MOBILE_UPPER_HALF,
  PANEL,
} from "../components/demo-layout";
import type { Beat } from "../schema";

interface BeatSceneProps {
  beat: Beat;
}

export function BeatScene({ beat }: BeatSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const isFullFrame = beat.layout === "fullframe";
  const isMobileUpperHalf = beat.layout === "mobile-upper-half";
  const Layout = isFullFrame
    ? FullFrameLayout
    : isMobileUpperHalf
      ? MobileUpperHalfLayout
      : DemoLayout;
  const width = isFullFrame
    ? 1080
    : isMobileUpperHalf
      ? MOBILE_UPPER_HALF.width
      : PANEL.width;
  const height = isFullFrame
    ? 1920
    : isMobileUpperHalf
      ? MOBILE_UPPER_HALF.height
      : PANEL.height;

  return (
    <AbsoluteFill name={beat.name}>
      <Layout name={`${beat.name} panel`}>
        {beat.panes.map((pane, index) => (
          <BeatPane
            key={`${pane.clip}-${index}`}
            pane={pane}
            containerWidth={width}
            containerHeight={height}
          />
        ))}

        {beat.callout ? (
          <Interactive.Div
            name="Callout"
            style={{
              position: "absolute",
              left: beat.callout.left,
              top: beat.callout.top,
              display: "flex",
              alignItems: "center",
              padding: "22px 34px",
              borderRadius: 999,
              backgroundColor: "#221E18",
              color: "#FBF9F6",
              fontFamily: "Archivo",
              fontSize: 46,
              fontWeight: 700,
              letterSpacing: "-0.01em",
              boxShadow: "0 18px 40px rgba(34, 30, 24, 0.32)",
              transformOrigin: "20% 0%",
              rotate: "-2deg",
              scale: interpolate(
                frame,
                [
                  Math.round(beat.callout.at * fps),
                  Math.round(beat.callout.at * fps) + 30,
                ],
                [0, 1],
                {
                  extrapolateLeft: "clamp",
                  extrapolateRight: "clamp",
                  easing: Easing.spring({ damping: 11, mass: 0.6 }),
                  output: "perceptual-scale",
                },
              ),
            }}
          >
            {beat.callout.text}
          </Interactive.Div>
        ) : null}
      </Layout>
    </AbsoluteFill>
  );
}
