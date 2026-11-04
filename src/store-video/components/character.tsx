import { Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import type { PlacedCharacter } from "../layout";
import type { Motion } from "../scenes";
import { ASSETS, BEAT, beats } from "../schema";

interface CharacterProps {
  file: string;
  placed: PlacedCharacter;
  /** Scene-relative beat it pops in on. */
  at: number;
  motion: Motion;
  exit: number;
}

/** One of the app's own illustrations, reacting on the beat. */
export function Character({ file, placed, at, motion, exit }: CharacterProps) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - beats(at);

  if (local < 0) {
    return null;
  }

  const pop = spring({ frame: local, fps, config: { damping: 9, stiffness: 150, mass: 0.7 } });
  const beat = local / BEAT;
  const { translateY, rotate, scaleX, scaleY } = react(motion, beat, placed.width);
  const isBottom = placed.anchor === "bottom";

  return (
    <div
      style={{
        position: "absolute",
        left: placed.centerX - placed.width / 2,
        top: placed.y,
        width: placed.width,
        transform: `translateY(${isBottom ? "-100%" : "-50%"})`,
      }}
    >
      <Img
        src={staticFile(`${ASSETS}/characters/${file}`)}
        style={{
          display: "block",
          width: "100%",
          transformOrigin: "50% 100%",
          opacity: 1 - exit,
          transform: `translateY(${translateY}px) rotate(${rotate + (1 - pop) * -18}deg) scale(${pop * scaleX * (1 - exit * 0.35)}, ${pop * scaleY * (1 - exit * 0.35)})`,
          filter: "drop-shadow(0 10px 18px rgba(41, 54, 41, 0.18))",
        }}
      />
      {motion === "sleep" ? <Snore beat={beat} width={placed.width} opacity={1 - exit} /> : null}
    </div>
  );
}

interface Pose {
  translateY: number;
  rotate: number;
  scaleX: number;
  scaleY: number;
}

/** Motion per beat: `beat` counts beats since the character appeared. */
function react(motion: Motion, beat: number, width: number): Pose {
  const phase = beat % 1;
  const hop = Math.sin(Math.PI * phase);
  const rest: Pose = { translateY: 0, rotate: 0, scaleX: 1, scaleY: 1 };

  switch (motion) {
    case "shake": {
      // A short ring as it lands, settling into a slow sway.
      const ring = interpolate(beat, [0, 1.5], [1, 0], { extrapolateRight: "clamp" });
      return {
        ...rest,
        rotate: Math.sin(beat * Math.PI * 4) * 5 * ring + Math.sin(beat * Math.PI) * 2,
      };
    }
    case "jump": {
      const squash = phase < 0.12 ? 1 - phase / 0.12 : 0;
      return {
        translateY: -hop * width * 0.22,
        rotate: Math.sin(beat * Math.PI) * 5,
        scaleX: 1 + squash * 0.08,
        scaleY: 1 - squash * 0.08,
      };
    }
    case "pop":
      return { ...rest, translateY: Math.sin(beat * Math.PI) * width * 0.02, rotate: Math.sin(beat * Math.PI) * 3 };
    case "nod":
      return { ...rest, rotate: Math.sin(beat * Math.PI) * 3 };
    case "bob":
      return {
        translateY: -hop * width * 0.07,
        rotate: (Math.floor(beat) % 2 === 0 ? 1 : -1) * 4 * hop,
        scaleX: 1 + (1 - hop) * 0.03,
        scaleY: 1 - (1 - hop) * 0.03,
      };
    case "cheer": {
      const twoBeat = (beat / 2) % 1;
      return {
        ...rest,
        translateY: -Math.sin(Math.PI * twoBeat) * width * 0.08,
        rotate: Math.sin(beat * Math.PI) * 4,
      };
    }
    case "sleep": {
      const breath = Math.sin((beat / 4) * Math.PI * 2);
      return { ...rest, scaleX: 1 + breath * 0.015, scaleY: 1 + breath * 0.03 };
    }
  }
}

function Snore({ beat, width, opacity }: { beat: number; width: number; opacity: number }) {
  return (
    <>
      {[0, 1, 2].map((index) => {
        const cycle = (beat / 3 + index / 3) % 1;
        const size = width * (0.09 + index * 0.025);

        return (
          <span
            key={index}
            style={{
              position: "absolute",
              left: width * (0.62 + cycle * 0.22),
              top: -width * (0.05 + cycle * 0.35),
              fontFamily: "Poppins",
              fontWeight: 700,
              fontSize: size,
              color: "#BFD8F2",
              opacity: opacity * Math.sin(Math.PI * cycle),
              transform: `rotate(${-12 + cycle * 18}deg)`,
              textShadow: "0 0 12px rgba(191, 216, 242, 0.6)",
            }}
          >
            z
          </span>
        );
      })}
    </>
  );
}
