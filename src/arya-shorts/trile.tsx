import { Video } from "@remotion/media";
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
import {
  ARYA, centered,
  Capsule,
  EndCard,
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

const SLOTS = [225, 540, 855];
const CUP_SIZE = 340;
const CUP_BASE = 1400;
const PILL_CUP = 1;
const LABELS = ["A", "B", "C"];

export type TrileProps = {
  table: string;
  cup: string;
  /** Each swap's two slots and its length in seconds, in order. */
  swaps: { a: number; b: number; seconds: number }[];
  swapFrom: number;
  landAt: number;
  stopAt: number;
  countdown: number[];
  liftAt: number;
  hook: string;
  ask: string;
  clip: { src: string; from: number; to: number; rate: number; text: string };
  sheet: { src: string; from: number; to: number; text: string };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

interface CupState {
  x: number;
  lift: number;
  scale: number;
  depth: number;
}

/** Plays the swaps forward from the start, so every cup's path is honest. */
function cupsAt(seconds: number, { swaps, swapFrom }: TrileProps): CupState[] {
  const slotOf = [0, 1, 2];
  const states: CupState[] = slotOf.map((slot) => ({
    x: SLOTS[slot],
    lift: 0,
    scale: 1,
    depth: 0,
  }));
  let start = swapFrom;

  for (const swap of swaps) {
    const end = start + swap.seconds;
    const front = slotOf.indexOf(swap.a);
    const back = slotOf.indexOf(swap.b);

    if (seconds >= end) {
      slotOf[front] = swap.b;
      slotOf[back] = swap.a;
      states[front].x = SLOTS[swap.b];
      states[back].x = SLOTS[swap.a];
    } else if (seconds >= start) {
      const t = Easing.inOut(Easing.quad)((seconds - start) / swap.seconds);
      const arc = Math.sin(t * Math.PI);
      states[front] = {
        x: interpolate(t, [0, 1], [SLOTS[swap.a], SLOTS[swap.b]]),
        lift: -70 * arc,
        scale: 1 + 0.1 * arc,
        depth: 1,
      };
      states[back] = {
        x: interpolate(t, [0, 1], [SLOTS[swap.b], SLOTS[swap.a]]),
        lift: 60 * arc,
        scale: 1 - 0.1 * arc,
        depth: -1,
      };
      break;
    }
    start = end;
  }

  return states;
}

/** "El Trile": three cups, one pill, and the pill was never under any of them. */
export function Trile(props: TrileProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { clip, sheet } = props;
  const seconds = frame / 30;
  const states = cupsAt(seconds, props);
  const fall = ramp(frame, 0, sec(props.landAt), Easing.in(Easing.quad));
  const lifted = ramp(frame, sec(props.liftAt), sec(props.liftAt) + 9);
  const labels = ramp(frame, sec(props.stopAt), sec(props.stopAt) + 6);
  const order = states
    .map((state, cup) => ({ ...state, cup }))
    .sort((one, two) => one.depth - two.depth);

  return (
    <ShortFrame
      background="#E9DFCF"
      music={props.music}
      duckAt={props.liftAt - 0.2}
      sfx={props.sfx}
    >
      <Img
        src={staticFile(props.table)}
        style={{
          position: "absolute",
          left: -100,
          top: 0,
          width: 1280,
          height: 1920,
          maxWidth: "none",
        }}
      />
      <div style={{ position: "absolute", left: SLOTS[1] - 80, top: CUP_BASE - 76 }}>
        {frame < sec(props.landAt) ? <Capsule width={160} rotate={-8} /> : null}
      </div>

      {order.map(({ cup, x, lift, scale }) => {
        const drop = cup === PILL_CUP ? (1 - fall) * -1100 : 0;
        const stagger = ramp(
          frame,
          sec(props.liftAt) + cup * 2,
          sec(props.liftAt) + cup * 2 + 9,
        );

        return (
          <Img
            key={cup}
            src={staticFile(props.cup)}
            style={{
              position: "absolute",
              left: x - CUP_SIZE / 2,
              top: CUP_BASE - CUP_SIZE + 20 + lift + drop - stagger * 620,
              width: CUP_SIZE,
              height: CUP_SIZE,
              scale: String(scale),
              transformOrigin: "50% 100%",
              filter: "drop-shadow(0 18px 14px rgba(60, 38, 16, 0.32))",
            }}
          />
        );
      })}

      {SLOTS.map((x, index) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x - 56,
            top: CUP_BASE + 46,
            width: 112,
            height: 112,
            borderRadius: 999,
            backgroundColor: ARYA.colors.background,
            color: ARYA.colors.ink,
            fontFamily: POPPINS,
            fontSize: 70,
            fontWeight: 700,
            lineHeight: "112px",
            textAlign: "center",
            opacity: labels * (1 - lifted),
            scale: String(interpolate(labels, [0, 1], [0.6, 1])),
          }}
        >
          {LABELS[index]}
        </div>
      ))}

      <TopLine
        text={frame < sec(props.stopAt) ? props.hook : props.ask}
        hidden={frame >= sec(props.liftAt)}
      />
      {props.countdown.map((at, index) => (
        <Sequence key={at} from={sec(at)} durationInFrames={sec(0.55)}>
          <CountDigit value={props.countdown.length - index} />
        </Sequence>
      ))}

      <Sequence name="Arya" from={sec(clip.from)} durationInFrames={sec(clip.to - clip.from)}>
        <AbsoluteFill style={{ backgroundColor: "#000000" }}>
          <Video
            src={staticFile(clip.src)}
            muted
            playbackRate={clip.rate}
            style={{ width: 1080, height: 1920 }}
          />
          <Band text={clip.text} />
        </AbsoluteFill>
      </Sequence>

      <Sequence name="Hoja" from={sec(sheet.from)} durationInFrames={sec(sheet.to - sheet.from)}>
        <SheetCard src={sheet.src} text={sheet.text} />
      </Sequence>

      <EndCard cta={props.cta} />
    </ShortFrame>
  );
}

function TopLine({ text, hidden }: { text: string; hidden: boolean }) {
  if (hidden) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 270,
        ...centered(860),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 88,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        color: ARYA.colors.ink,
      }}
    >
      {text}
    </div>
  );
}

function CountDigit({ value }: { value: number }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        width: 1080,
        top: 540,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 300,
        fontWeight: 700,
        lineHeight: 1,
        color: ARYA.colors.accent,
        scale: String(interpolate(ramp(frame, 0, 6), [0, 1], [1.4, 1])),
        opacity: 1 - ramp(frame, 11, 16),
      }}
    >
      {value}
    </div>
  );
}

function Band({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        ...centered(880),
        padding: "26px 34px",
        borderRadius: 30,
        backgroundColor: ARYA.colors.background,
        color: ARYA.colors.ink,
        fontFamily: POPPINS,
        fontSize: 68,
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: "-0.03em",
        textAlign: "center",
      }}
    >
      {text}
    </div>
  );
}

function SheetCard({ src, text }: { src: string; text: string }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 9);

  return (
    <AbsoluteFill style={{ backgroundColor: TEAL }}>
      <div
        style={{
          position: "absolute",
          top: 230,
          ...centered(880),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
        }}
      >
        {text}
      </div>
      <div
        style={{
          position: "absolute",
          top: 500,
          ...centered(860),
          height: 815,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(10, 40, 40, 0.4)",
          translate: `0px ${(1 - rise) * 120}px`,
        }}
      >
        <Img
          src={staticFile(src)}
          style={{
            position: "absolute",
            left: -20,
            top: -1046,
            width: 900,
            maxWidth: "none",
          }}
        />
      </div>
    </AbsoluteFill>
  );
}
