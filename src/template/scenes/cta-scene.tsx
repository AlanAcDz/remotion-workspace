import {
  AbsoluteFill,
  Easing,
  Img,
  Interactive,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PosDemoProps } from "../schema";

interface CtaSceneProps {
  cta: PosDemoProps["cta"];
}

export function CtaScene({ cta }: CtaSceneProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Absolute cue-sheet seconds → frames inside this beat, so every line lands
  // on the word that says it.
  const line2At = Math.round((cta.revealAt.line2 - cta.from) * fps);
  const noteAt = Math.round((cta.revealAt.note - cta.from) * fps);
  const pillAt = Math.round((cta.revealAt.pill - cta.from) * fps);

  return (
    <AbsoluteFill name="CTA" style={{ fontFamily: "Archivo" }}>
      <Img
        name="Logo"
        src={staticFile(cta.logo)}
        style={{
          position: "absolute",
          left: 300,
          top: 520,
          width: 480,
          maxWidth: "none",
          opacity: interpolate(frame, [0, 12], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      />

      <Interactive.Div
        name="CTA linea 1"
        style={{
          position: "absolute",
          left: 72,
          top: 700,
          width: 936,
          textAlign: "center",
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 1.0,
          letterSpacing: "-0.03em",
          color: "#221E18",
          opacity: interpolate(frame, [6, 20], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(frame, [6, 24], ["0px 24px", "0px 0px"], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {cta.line1}
      </Interactive.Div>

      <Interactive.Div
        name="CTA linea 2"
        style={{
          position: "absolute",
          left: 72,
          top: 806,
          width: 936,
          textAlign: "center",
          fontSize: 148,
          fontWeight: 800,
          lineHeight: 1.0,
          letterSpacing: "-0.045em",
          color: "#DE5134",
          opacity: interpolate(frame, [line2At, line2At + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [line2At, line2At + 18],
            ["0px 24px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        {cta.line2}
      </Interactive.Div>

      <Interactive.Div
        name="CTA nota"
        style={{
          position: "absolute",
          left: 72,
          top: 980,
          width: 936,
          textAlign: "center",
          fontSize: 56,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          color: "#6B6357",
          opacity: interpolate(frame, [noteAt, noteAt + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
        }}
      >
        {cta.note}
      </Interactive.Div>

      <Interactive.Div
        name="CTA pill"
        style={{
          position: "absolute",
          left: 240,
          top: 1110,
          width: 600,
          textAlign: "center",
          padding: "28px 0",
          borderRadius: 999,
          backgroundColor: "#DE5134",
          color: "#FFFFFF",
          fontSize: 52,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          boxShadow: "0 20px 44px rgba(222, 81, 52, 0.32)",
          opacity: interpolate(frame, [pillAt, pillAt + 14], [0, 1], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
            easing: Easing.bezier(0.16, 1, 0.3, 1),
          }),
          translate: interpolate(
            frame,
            [pillAt, pillAt + 18],
            ["0px 20px", "0px 0px"],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
              easing: Easing.bezier(0.16, 1, 0.3, 1),
            },
          ),
        }}
      >
        {cta.pill}
      </Interactive.Div>
    </AbsoluteFill>
  );
}
