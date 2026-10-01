import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLORS, SANS } from "../theme";

interface PivotCardProps {
  kicker: string;
  logo: string;
}

/**
 * The turn between the two receipts: the screen flips from ink to paper and
 * the brand lands — the one moment the logo gets the whole frame.
 */
export function PivotCard({ kicker, logo }: PivotCardProps) {
  const frame = useCurrentFrame();
  const settle = interpolate(frame, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.bezier(0.16, 1, 0.3, 1),
  });

  return (
    <AbsoluteFill
      name="Giro"
      style={{
        backgroundColor: COLORS.shopFloor,
        alignItems: "center",
        justifyContent: "center",
        gap: 36,
        opacity: interpolate(frame, [0, 3], [0, 1], {
          extrapolateRight: "clamp",
        }),
      }}
    >
      <div
        style={{
          fontFamily: SANS,
          fontSize: 76,
          fontWeight: 700,
          letterSpacing: "-0.03em",
          color: COLORS.ink,
          opacity: settle,
          translate: `0px ${(1 - settle) * 30}px`,
        }}
      >
        {kicker}
      </div>
      <Img
        src={staticFile(logo)}
        style={{
          width: 820,
          maxWidth: "none",
          scale: String(interpolate(settle, [0, 1], [1.12, 1])),
        }}
      />
    </AbsoluteFill>
  );
}
