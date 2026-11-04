import {
  AbsoluteFill,
  interpolate,
  interpolateColors,
  random,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { beats, COLORS } from "../schema";

/** One day in ~30 s: cream sunrise, warm afternoon, golden hour, navy night. */
const SKY_FRAMES = [0, beats(8), beats(26), beats(37), beats(39.5), beats(41.5)];
const SKY_TOP = ["#FFF8EF", "#FFF6EA", "#FFEFD9", "#FBD9B2", "#8E6E9E", "#0F1B36"];
const SKY_BOTTOM = ["#FFE6CC", "#FFEBD6", "#FFE0BC", "#F6BE93", "#EFA98D", "#2B3F68"];

/** The sun rises behind the card, arcs over the day and sets as night falls. */
const SUN_RISE = 0;
const SUN_SET = beats(40);

const STAR_COUNT = 46;

/** Night falls across the cut into the sleep scene (beat 40). */
export const NIGHT_FROM = beats(39.5);
export const NIGHT_TO = beats(41.5);

export function Sky() {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

  const top = interpolateColors(frame, SKY_FRAMES, SKY_TOP);
  const bottom = interpolateColors(frame, SKY_FRAMES, SKY_BOTTOM);

  const sunProgress = interpolate(frame, [SUN_RISE, SUN_SET], [0, 1], clamp);
  const sunX = width * (0.12 + 0.76 * sunProgress);
  const sunY = height * (0.62 - 0.5 * Math.sin(Math.PI * sunProgress));
  const sunSize = Math.min(width, height) * 0.2;
  const sunOpacity = interpolate(frame, [beats(38), beats(40.5)], [1, 0], clamp);

  const night = interpolate(frame, [NIGHT_FROM + beats(1), NIGHT_TO + beats(1)], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${top} 0%, ${bottom} 100%)` }}>
      <div
        style={{
          position: "absolute",
          left: sunX - sunSize * 2,
          top: sunY - sunSize * 2,
          width: sunSize * 4,
          height: sunSize * 4,
          borderRadius: "50%",
          opacity: sunOpacity,
          background:
            "radial-gradient(circle, rgba(255,214,150,0.95) 0%, rgba(255,205,140,0.85) 22%, rgba(255,200,140,0.35) 34%, rgba(255,200,140,0) 62%)",
        }}
      />
      {Array.from({ length: STAR_COUNT }, (_, index) => {
        const x = random(`star-x-${index}`) * width;
        const y = random(`star-y-${index}`) * height * 0.92;
        const size = 2 + random(`star-size-${index}`) * 4;
        const twinkle =
          0.55 + 0.45 * Math.sin(frame / (6 + random(`star-speed-${index}`) * 8) + index);
        const delay = random(`star-delay-${index}`) * beats(2);
        const appear = interpolate(frame, [NIGHT_FROM + beats(1.5) + delay, NIGHT_FROM + beats(2.5) + delay], [0, 1], clamp);

        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: size,
              height: size,
              borderRadius: "50%",
              backgroundColor: "#FFF4D6",
              boxShadow: `0 0 ${size * 3}px rgba(255, 244, 214, 0.8)`,
              opacity: appear * twinkle * night,
              transform: `scale(${0.4 + 0.6 * appear})`,
            }}
          />
        );
      })}
      <Moon night={night} width={width} height={height} />
    </AbsoluteFill>
  );
}

function Moon({ night, width, height }: { night: number; width: number; height: number }) {
  const size = Math.min(width, height) * 0.11;

  return (
    <div
      style={{
        position: "absolute",
        left: width * (height > width ? 0.9 : 0.86) - size / 2,
        top: height * ((height > width ? 0.008 : 0.09) + 0.03 * (1 - night)),
        width: size,
        height: size,
        borderRadius: "50%",
        opacity: night,
        background: "radial-gradient(circle at 35% 35%, #FFFBEA 0%, #F6E7B8 70%)",
        boxShadow: `0 0 ${size}px rgba(255, 240, 200, 0.45)`,
      }}
    />
  );
}

/** 0 by day, 1 once night has fallen; takes the global frame. */
export function nightAt(frame: number) {
  return interpolate(frame, [NIGHT_FROM + beats(0.5), NIGHT_FROM + beats(1.5)], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
}

/** Title ink: dark by day, cream once night falls; takes the global frame. */
export function inkAt(frame: number) {
  return interpolateColors(nightAt(frame), [0, 1], [COLORS.title, COLORS.cream]);
}
