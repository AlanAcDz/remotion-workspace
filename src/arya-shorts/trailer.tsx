import { Audio, Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Sfx } from "../template/schema";
import { SfxCues } from "../template/components/sfx-cues";
import { ARYA, centered, cinzel, CORAL, POPPINS, ramp, useSeconds } from "./shared";

const NIGHT = "#0B0E12";
const COLD = "brightness(0.42) contrast(1.25) saturate(0.45)";
const NIGHT_VIDEO = "brightness(0.66) contrast(1.2) saturate(0.45)";

type Span = { from: number; to: number; text: string };

export type TrailerProps = {
  eye: Span & { src: string };
  rug: Span & { src: string };
  kitchen: Span & { src: string };
  cheese: Span & { src: string };
  hit: { at: number; banner: string; to: number };
  title: Span;
  tagline: Span;
  ending: { from: number; line: string; name: string; pill: string; logo: string };
  drone: { src: string; until: number; resume: number };
  sfx: Sfx[];
  end: number;
};

/** "El Tráiler": a horror trailer in which the pill is the monster. */
export function Trailer(props: TrailerProps) {
  const sec = useSeconds();
  const { eye, rug, kitchen, cheese, hit, title, tagline, ending, drone } = props;
  const span = ({ from, to }: { from: number; to: number }) => ({
    from: sec(from),
    durationInFrames: sec(to) - sec(from),
  });

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT, overflow: "hidden" }}>
      <Sequence name="Drone" durationInFrames={sec(drone.until)}>
        <Audio src={staticFile(drone.src)} volume={() => 0.4} />
      </Sequence>
      <Sequence name="Drone 2" from={sec(drone.resume)}>
        <Audio src={staticFile(drone.src)} volume={() => 0.3} />
      </Sequence>
      <SfxCues cues={props.sfx} />

      <Sequence {...span(eye)}>
        <PushIn src={eye.src} originX={0.445} originY={0.44} from={1.55} to={1.95} />
        <Card text={eye.text} isSetOnFrameZero />
      </Sequence>
      <Sequence {...span(rug)}>
        <AbsoluteFill>
          <Video
            src={staticFile(rug.src)}
            muted
            style={{ width: 1080, height: 1920, filter: NIGHT_VIDEO }}
          />
        </AbsoluteFill>
        <Card text={rug.text} />
      </Sequence>
      <Sequence {...span(kitchen)}>
        <PushIn src={kitchen.src} originX={0.4} originY={0.44} from={1} to={1.12} bright />
        <Card text={kitchen.text} />
      </Sequence>
      <Sequence {...span(cheese)}>
        <PushIn src={cheese.src} originX={0.34} originY={0.43} from={2.3} to={3.1} bright />
        <Card text={cheese.text} />
      </Sequence>

      <Sequence from={sec(hit.at)} durationInFrames={sec(hit.to - hit.at)}>
        <Hit banner={hit.banner} />
      </Sequence>
      <Sequence {...span(title)}>
        <Title text={title.text} />
      </Sequence>
      <Sequence {...span(tagline)}>
        <Tagline text={tagline.text} />
      </Sequence>
      <Sequence from={sec(ending.from)}>
        <Ending {...ending} />
      </Sequence>
    </AbsoluteFill>
  );
}

function PushIn({
  src,
  originX,
  originY,
  from,
  to,
  bright = false,
}: {
  src: string;
  originX: number;
  originY: number;
  from: number;
  to: number;
  bright?: boolean;
}) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(src)}
        style={{
          width: 1080,
          height: 1920,
          objectFit: "cover",
          maxWidth: "none",
          transformOrigin: `${originX * 100}% ${originY * 100}%`,
          scale: String(interpolate(frame, [0, 60], [from, to], { extrapolateRight: "clamp" })),
          filter: bright ? "contrast(1.1)" : COLD,
        }}
      />
    </AbsoluteFill>
  );
}

function Card({
  text,
  isSetOnFrameZero = false,
}: {
  text: string;
  isSetOnFrameZero?: boolean;
}) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill
      style={{
        background: "linear-gradient(transparent 55%, rgba(0, 0, 0, 0.75) 82%)",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 1180,
          ...centered(860),
          textAlign: "center",
          fontFamily: cinzel,
          fontSize: 76,
          fontWeight: 700,
          lineHeight: 1.18,
          letterSpacing: "0.05em",
          translate: "0.025em 0px",
          color: "#F4F1EA",
          textTransform: "uppercase",
          whiteSpace: "pre-line",
          opacity: isSetOnFrameZero ? 1 : ramp(frame, 0, 8, Easing.linear),
        }}
      >
        {text}
      </div>
    </AbsoluteFill>
  );
}

function Hit({ banner }: { banner: string }) {
  const frame = useCurrentFrame();
  const drop = ramp(frame, 0, 7);

  return (
    <AbsoluteFill style={{ backgroundColor: NIGHT }}>
      <Img
        src={staticFile(banner)}
        style={{
          position: "absolute",
          left: 14,
          top: 820,
          width: 1052,
          borderRadius: 54,
          translate: `0px ${(drop - 1) * 900}px`,
        }}
      />
      {/* One flash, three frames, by design: nothing here may strobe. */}
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: 1 - ramp(frame, 0, 3, Easing.linear) }} />
    </AbsoluteFill>
  );
}

function Title({ text }: { text: string }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 760,
        textAlign: "center",
        fontFamily: cinzel,
        fontSize: 168,
        fontWeight: 700,
        letterSpacing: "0.04em",
        translate: "0.02em 0px",
        color: CORAL,
        scale: String(interpolate(frame, [0, 45], [1.02, 1.1])),
      }}
    >
      {text}
    </div>
  );
}

function Tagline({ text }: { text: string }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 780,
        ...centered(860),
        textAlign: "center",
        fontFamily: cinzel,
        fontSize: 84,
        fontWeight: 700,
        lineHeight: 1.25,
        letterSpacing: "0.05em",
        translate: "0.025em 0px",
        color: "#F4F1EA",
        whiteSpace: "pre-line",
        textTransform: "uppercase",
        opacity: ramp(frame, 0, 8, Easing.linear),
      }}
    >
      {text}
    </div>
  );
}

function Ending({ line, name, pill, logo }: TrailerProps["ending"]) {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill style={{ opacity: ramp(frame, 0, 8, Easing.linear) }}>
      <div
        style={{
          position: "absolute",
          top: 430,
          ...centered(880),
          textAlign: "center",
          fontFamily: cinzel,
          fontSize: 62,
          fontWeight: 700,
          lineHeight: 1.25,
          letterSpacing: "0.05em",
          translate: "0.025em 0px",
          color: "#F4F1EA",
          whiteSpace: "pre-line",
          textTransform: "uppercase",
        }}
      >
        {line}
      </div>
      <Img
        src={staticFile(logo)}
        style={{ position: "absolute", left: 400, top: 720, width: 280 }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          width: 1080,
          top: 1030,
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 66,
          fontWeight: 700,
          letterSpacing: "-0.02em",
          color: "#FFFFFF",
        }}
      >
        {name}
      </div>
      <div
        style={{
          position: "absolute",
          left: 290,
          top: 1140,
          width: 500,
          padding: "22px 0",
          borderRadius: 999,
          textAlign: "center",
          backgroundColor: CORAL,
          color: ARYA.colors.ink,
          fontFamily: POPPINS,
          fontSize: 50,
          fontWeight: 600,
        }}
      >
        {pill}
      </div>
    </AbsoluteFill>
  );
}
