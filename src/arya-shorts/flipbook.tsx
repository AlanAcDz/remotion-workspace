import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, EndCard, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

export type FlipbookProps = {
  /** Ordered by `from`, in seconds; the first starts at 0. */
  flips: { from: number; photo: string; x?: number }[];
  /** Counter keyframes: `[second, day]`, eased between. */
  days: [number, number][];
  lines: { from: number; label?: string; text: string }[];
  held: {
    clip: { src: string; from: number; to: number };
    today: { src: string; from: number; to: number; label: string; text: string };
    hug: { src: string; from: number; to: number; rate: number; text: string };
  };
  dayLabel: string;
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "Flipbook": real photos flip while the day counter runs; only HOY holds still. */
export function Flipbook(props: FlipbookProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { clip, today, hug } = props.held;
  const seconds = frame / 30;
  const flip = [...props.flips].reverse().find((entry) => seconds >= entry.from) ?? props.flips[0];
  const flipFrame = frame - sec(flip.from);
  const day = Math.round(
    interpolate(
      seconds,
      props.days.map(([at]) => at),
      props.days.map(([, value]) => value),
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    ),
  );
  const line = [...props.lines].reverse().find((entry) => seconds >= entry.from);
  const isCounting = seconds < today.from;

  return (
    <ShortFrame
      background="#111111"
      music={props.music}
      duckAt={today.from}
      sfx={props.sfx}
    >
      <Img
        src={staticFile(flip.photo)}
        style={{
          position: "absolute",
          left: -180,
          top: 0,
          width: 1440,
          height: 1920,
          maxWidth: "none",
          objectFit: "cover",
          translate: `${flip.x ?? 0}px 0px`,
          scale: String(interpolate(flipFrame, [0, 3], [1.05, 1], { extrapolateRight: "clamp" })),
        }}
      />
      <Sequence from={sec(clip.from)} durationInFrames={sec(clip.to - clip.from)}>
        <AbsoluteFill>
          <Video src={staticFile(clip.src)} muted style={{ width: 1080, height: 1920 }} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={sec(today.from)} durationInFrames={sec(today.to - today.from)}>
        <Today src={today.src} />
      </Sequence>
      <Sequence from={sec(hug.from)} durationInFrames={sec(hug.to - hug.from)}>
        <AbsoluteFill>
          <Video
            src={staticFile(hug.src)}
            muted
            playbackRate={hug.rate}
            style={{ width: 1080, height: 1920 }}
          />
        </AbsoluteFill>
      </Sequence>

      {isCounting ? (
        <Counter text={`${props.dayLabel} ${day}`} />
      ) : seconds < today.to ? (
        <Counter text={today.label} />
      ) : null}
      {seconds < today.from && line ? <Line key={line.from} text={line.text} /> : null}
      <Sequence from={sec(today.from)} durationInFrames={sec(today.to - today.from)}>
        <Line text={today.text} />
      </Sequence>
      <Sequence from={sec(hug.from)} durationInFrames={sec(hug.to - hug.from)}>
        <Line text={hug.text} />
      </Sequence>

      <EndCard cta={props.cta} />
    </ShortFrame>
  );
}

function Today({ src }: { src: string }) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ backgroundColor: "#111111" }}>
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: -180,
          top: 0,
          width: 1440,
          height: 1920,
          maxWidth: "none",
          objectFit: "cover",
          scale: String(interpolate(frame, [0, 60], [1, 1.05])),
          opacity: ramp(frame, 0, 5),
        }}
      />
    </AbsoluteFill>
  );
}

function Counter({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 200,
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "10px 46px",
          borderRadius: 30,
          backgroundColor: ARYA.colors.ink,
          color: ARYA.colors.background,
          fontFamily: POPPINS,
          fontSize: 118,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Line({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 1210,
        ...centered(900),
        display: "flex",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          padding: "22px 34px",
          borderRadius: 28,
          backgroundColor: ARYA.colors.background,
          color: ARYA.colors.ink,
          fontFamily: POPPINS,
          fontSize: 70,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: "-0.03em",
          textAlign: "center",
        }}
      >
        {text}
      </div>
    </div>
  );
}
