import {
  AbsoluteFill,
  Easing,
  Interactive,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { CAPTION_BAND } from "../components/demo-layout";

interface HookOverlayProps {
  text: string;
  subline?: string;
}

/**
 * During the hook the big copy *is* the caption, so the word-by-word track
 * stays off until this fades out.
 */
export function HookOverlay({ text, subline }: HookOverlayProps) {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  return (
    <AbsoluteFill name="Hook copy" style={{ fontFamily: "Archivo" }}>
      <Interactive.Div
        name="Hook headline"
        style={{
          position: "absolute",
          left: CAPTION_BAND.left,
          top: CAPTION_BAND.top + 20,
          width: CAPTION_BAND.width,
          textAlign: "center",
          fontSize: 96,
          fontWeight: 800,
          lineHeight: 1.04,
          letterSpacing: "-0.035em",
          color: "#221E18",
          opacity: interpolate(
            frame,
            [0, 10, durationInFrames - 8, durationInFrames],
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
          translate: interpolate(frame, [0, 14], ["0px 24px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {text}
      </Interactive.Div>

      {subline ? (
        <Interactive.Div
          name="Hook subline"
          style={{
            position: "absolute",
            left: CAPTION_BAND.left,
            top: CAPTION_BAND.top + 242,
            width: CAPTION_BAND.width,
            textAlign: "center",
            fontSize: 54,
            fontWeight: 700,
            letterSpacing: "-0.02em",
            color: "#DE5134",
            opacity: interpolate(
              frame,
              [22, 34, durationInFrames - 8, durationInFrames],
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
            translate: interpolate(frame, [22, 38], ["0px 16px", "0px 0px"], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            }),
          }}
        >
          {subline}
        </Interactive.Div>
      ) : null}
    </AbsoluteFill>
  );
}
