import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { ARYA, centered, POPPINS, ramp, TEAL, useSeconds } from "./shared";
import { ThemeContext } from "../template/theme";

const SOURCE_WIDTH = 1206;
const CARD_SCALE = 0.62;
const CARD = {
  left: (1080 - SOURCE_WIDTH * CARD_SCALE) / 2,
  top: 330,
  height: 1135,
};
const BEAT = 0.6;

export type DoseBeatProps = {
  clip: string;
  audio: string;
  /** Source row the card starts on. */
  cropTop: number;
  taps: { at: number; x: number; y: number }[];
  character: string;
  sticker: string;
  note: string;
  end: number;
};

/**
 * "Dose Beat": the weekly day chips played as a step sequencer. The clip is a
 * palindrome, so the last frame meets the first and the video loops on itself.
 * Nothing here fades: an intro or outro would show up as a seam on repeat.
 */
export function DoseBeat(props: DoseBeatProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const beatFrames = sec(BEAT);
  const sincePulse = frame % beatFrames;
  const pulse = 1 - ramp(sincePulse, 0, beatFrames - 4);

  return (
    <ThemeContext.Provider value={ARYA}>
      <AbsoluteFill style={{ backgroundColor: TEAL, overflow: "hidden" }}>
        <Audio src={staticFile(props.audio)} volume={() => 0.85} />

        <div
          style={{
            position: "absolute",
            top: 130,
            ...centered(880),
            padding: "22px 30px",
            borderRadius: 32,
            backgroundColor: ARYA.colors.background,
            color: ARYA.colors.ink,
            fontFamily: POPPINS,
            fontSize: 58,
            fontWeight: 700,
            lineHeight: 1.12,
            letterSpacing: "-0.03em",
            textAlign: "center",
            rotate: "-1.5deg",
            scale: String(1 + pulse * 0.018),
          }}
        >
          {props.sticker}
        </div>

        <div
          style={{
            position: "absolute",
            left: CARD.left,
            top: CARD.top,
            width: SOURCE_WIDTH * CARD_SCALE,
            height: CARD.height,
            borderRadius: 44,
            overflow: "hidden",
            backgroundColor: "#F5F8F7",
            boxShadow: "0 30px 70px rgba(10, 50, 50, 0.35)",
          }}
        >
          <Video
            src={staticFile(props.clip)}
            muted
            style={{
              position: "absolute",
              left: 0,
              top: -props.cropTop * CARD_SCALE,
              width: SOURCE_WIDTH * CARD_SCALE,
              maxWidth: "none",
            }}
          />
          {props.taps.map((tap) => (
            <TapRing key={tap.at} {...tap} cropTop={props.cropTop} />
          ))}
        </div>

        <Img
          src={staticFile(props.character)}
          style={{
            position: "absolute",
            right: CARD.left,
            top: 1466,
            width: 180,
            transformOrigin: "50% 100%",
            rotate: `${(Math.floor(frame / beatFrames) % 2 === 0 ? 1 : -1) * 3 * pulse}deg`,
            translate: `0px ${-16 * pulse}px`,
          }}
        />

        <div
          style={{
            position: "absolute",
            left: 166,
            width: 590,
            top: 1484,
            fontFamily: POPPINS,
            fontSize: 38,
            fontWeight: 600,
            color: ARYA.colors.ink,
          }}
        >
          {props.note}
        </div>
      </AbsoluteFill>
    </ThemeContext.Provider>
  );
}

function TapRing({
  at,
  x,
  y,
  cropTop,
}: {
  at: number;
  x: number;
  y: number;
  cropTop: number;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(at);
  const grow = ramp(frame, start, start + 12);

  if (frame < start || frame > start + 12) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: x * CARD_SCALE - 60,
        top: (y - cropTop) * CARD_SCALE - 60,
        width: 120,
        height: 120,
        borderRadius: 999,
        border: `7px solid ${ARYA.colors.accent}`,
        opacity: 1 - grow,
        scale: String(interpolate(grow, [0, 1], [0.5, 1.5])),
      }}
    />
  );
}
