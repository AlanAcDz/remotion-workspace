import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, CORAL, EndCard, POPPINS, ramp, ShortFrame, TEAL, useSeconds } from "./shared";

const COUNT_SECONDS = 5;

export type FiveSecondProps = {
  question: string;
  exact: string;
  exactAt: number;
  timesUp: { text: string; from: number; to: number };
  cantSay: { text: string; to: number };
  proof: {
    src: string;
    from: number;
    to: number;
    text: string;
    /** Source rows of the crop and of the ringed line. The take is 1206 px wide. */
    cropTop: number;
    cropHeight: number;
    ringTop: number;
    ringHeight: number;
  };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "El Test": a real five second countdown, then the answer the app kept. */
export function FiveSecond(props: FiveSecondProps) {
  const sec = useSeconds();
  const { timesUp, cantSay, proof } = props;

  return (
    <ShortFrame background={TEAL} music={props.music} sfx={props.sfx}>
      <div
        style={{
          position: "absolute",
          top: 240,
          ...centered(880),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 92,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
        }}
      >
        {props.question}
      </div>
      {Array.from({ length: COUNT_SECONDS }, (_, index) => (
        <Sequence key={index} from={sec(index) - (index === 0 ? 4 : 0)} durationInFrames={sec(1) + (index === 0 ? 4 : 0)}>
          <Digit value={COUNT_SECONDS - index} />
        </Sequence>
      ))}
      <ExactChip text={props.exact} at={sec(props.exactAt)} />

      <Sequence from={sec(timesUp.from)} durationInFrames={sec(timesUp.to - timesUp.from)}>
        <AbsoluteFill style={{ backgroundColor: CORAL }}>
          <Slam text={timesUp.text} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={sec(timesUp.to)} durationInFrames={sec(cantSay.to - timesUp.to)}>
        <AbsoluteFill style={{ backgroundColor: ARYA.colors.ink }}>
          <Lines text={cantSay.text} />
        </AbsoluteFill>
      </Sequence>
      <Sequence from={sec(proof.from)} durationInFrames={sec(proof.to - proof.from)}>
        <Proof proof={proof} />
      </Sequence>
      <EndCard cta={props.cta} />
    </ShortFrame>
  );
}

function Digit({ value }: { value: number }) {
  const frame = useCurrentFrame();
  const land = ramp(frame, 0, 8, Easing.out(Easing.back(1.5)));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 620,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 640,
        fontWeight: 700,
        lineHeight: 1,
        color: "#FFFFFF",
        translate: `0px ${(land - 1) * 500}px`,
        scale: String(interpolate(frame, [8, 30], [1, 0.94], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })),
      }}
    >
      {value}
    </div>
  );
}

function ExactChip({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const pop = ramp(frame, at, at + 7, Easing.out(Easing.back(2)));

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 1370,
        display: "flex",
        justifyContent: "center",
        opacity: pop > 0 ? 1 : 0,
        scale: String(pop),
      }}
    >
      <div
        style={{
          padding: "20px 46px",
          borderRadius: 999,
          backgroundColor: CORAL,
          color: ARYA.colors.ink,
          fontFamily: POPPINS,
          fontSize: 66,
          fontWeight: 700,
          letterSpacing: "-0.02em",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Slam({ text }: { text: string }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 800,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 150,
        fontWeight: 700,
        letterSpacing: "-0.04em",
        color: ARYA.colors.ink,
        scale: String(interpolate(ramp(frame, 0, 4), [0, 1], [1.5, 1])),
      }}
    >
      {text}
    </div>
  );
}

function Lines({ text }: { text: string }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 680,
        ...centered(900),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 116,
        fontWeight: 700,
        lineHeight: 1.14,
        letterSpacing: "-0.03em",
        color: ARYA.colors.background,
        whiteSpace: "pre-line",
        opacity: ramp(frame, 0, 4),
      }}
    >
      {text}
    </div>
  );
}

function Proof({ proof }: { proof: FiveSecondProps["proof"] }) {
  const frame = useCurrentFrame();
  const width = 900;
  // Wider than the card on purpose: the rows are left-aligned, and "Taken at
  // 07:52" has to read at phone size.
  const scale = 1340 / 1206;
  const rise = ramp(frame, 0, 9);
  const ring = ramp(frame, 12, 21, Easing.out(Easing.back(1.8)));

  return (
    <AbsoluteFill style={{ backgroundColor: ARYA.colors.background }}>
      <div
        style={{
          position: "absolute",
          top: 230,
          ...centered(880),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 80,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
        }}
      >
        {proof.text}
      </div>
      <div
        style={{
          position: "absolute",
          top: 620,
          ...centered(width),
          height: proof.cropHeight * scale,
          borderRadius: 40,
          overflow: "hidden",
          boxShadow: "0 28px 64px rgba(25, 38, 38, 0.24)",
          translate: `0px ${(1 - rise) * 120}px`,
        }}
      >
        <Img
          src={staticFile(proof.src)}
          style={{
            position: "absolute",
            left: 0,
            top: -proof.cropTop * scale,
            width: 1206 * scale,
            maxWidth: "none",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: (proof.ringTop - proof.cropTop) * scale,
            height: proof.ringHeight * scale,
            borderRadius: 24,
            border: `8px solid ${ARYA.colors.accent}`,
            boxShadow: `0 0 0 9999px rgba(25, 38, 38, ${ring * 0.22})`,
            opacity: ring,
            scale: String(interpolate(ring, [0, 1], [1.1, 1])),
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
