import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";
import { ClosingCard, type VerdadOMitoProps } from "./verdad-o-mito";

/** Seconds the timer bar takes to run out before the answer stamps. */
export const TIMER_SECONDS = 3;

export const LETTERS = ["A", "B", "C"] as const;

type Letter = (typeof LETTERS)[number];

const CORAL = "#E0533F";
const TRACK = "#EFE7DA";
/** Left-weighted column: keeps every line clear of TikTok's right rail. */
const COLUMN = { left: 112, width: 816 } as const;
const PHOTO = { top: 352, height: 620 };
const BAR = { top: PHOTO.top + PHOTO.height + 22, height: 22 };
const OPTION = { top: BAR.top + BAR.height + 32, height: 100, gap: 16 };
const PUNCHLINE_TOP = OPTION.top + 3 * OPTION.height + 2 * OPTION.gap + 24;
const SLIDE_FRAMES = 8;

export interface QuizRound {
  photo: string;
  /** CSS object-position of the photo inside its frame. */
  focus: string;
  options: [string, string, string];
  answer: Letter;
  punchline: string;
  /** Second the round is fully on screen. */
  from: number;
  /** Second the timer starts; negative when it is already running on frame 0. */
  timerFrom: number;
  /** Second the round leaves. */
  to: number;
}

export type QueAcabaDePasarProps = {
  question: string;
  rounds: QuizRound[];
  closing: VerdadOMitoProps["closing"];
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "¿Qué acaba de pasar?": Arya's face, three options, a three second bar, then the stamp. */
export function QueAcabaDePasar(props: QueAcabaDePasarProps) {
  const lastIndex = props.rounds.length - 1;

  return (
    <ShortFrame background={ARYA.colors.background} music={props.music} sfx={props.sfx}>
      <Question text={props.question} />
      <Progress rounds={props.rounds} />
      {props.rounds.map((round, index) => (
        <Round key={round.photo} round={round} isLast={index === lastIndex} />
      ))}
      <ClosingCard closing={props.closing} cta={props.cta} />
    </ShortFrame>
  );
}

function Question({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 226,
        ...COLUMN,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 74,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        color: ARYA.colors.ink,
      }}
    >
      {text}
    </div>
  );
}

function Progress({ rounds }: { rounds: QuizRound[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <div
      style={{
        position: "absolute",
        top: 318,
        ...COLUMN,
        display: "flex",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {rounds.map((round) => {
        const isDone = frame >= sec(round.timerFrom + TIMER_SECONDS);
        const isCurrent =
          frame >= sec(round.from) - SLIDE_FRAMES / 2 && frame < sec(round.to) - SLIDE_FRAMES / 2;
        const color = isDone ? ARYA.colors.accent : isCurrent ? ARYA.colors.ink : "#E3DACB";

        return (
          <div
            key={round.photo}
            style={{
              width: isCurrent ? 46 : 16,
              height: 16,
              borderRadius: 8,
              backgroundColor: color,
            }}
          />
        );
      })}
    </div>
  );
}

function Round({ round, isLast }: { round: QuizRound; isLast: boolean }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const half = SLIDE_FRAMES / 2;
  const enterAt = sec(round.from);
  const exitAt = sec(round.to);
  const stampAt = sec(round.timerFrom + TIMER_SECONDS);

  if (frame < enterAt - half || (!isLast && frame > exitAt + half)) {
    return null;
  }

  const enter = enterAt === 0 ? 1 : ramp(frame, enterAt - half, enterAt + half);
  // Same curve in and out keeps the two rounds exactly one screen apart.
  const exit = isLast ? 0 : ramp(frame, exitAt - half, exitAt + half);
  const slideX = (1 - enter) * 1080 - exit * 1080;

  return (
    <AbsoluteFill style={{ translate: `${slideX}px 0px` }}>
      <Photo round={round} stampAt={stampAt} />
      <TimerBar round={round} stampAt={stampAt} />
      {round.options.map((text, index) => (
        <Option
          key={LETTERS[index]}
          letter={LETTERS[index]}
          text={text}
          index={index}
          isAnswer={LETTERS[index] === round.answer}
          revealAt={stampAt}
        />
      ))}
      <Punchline text={round.punchline} at={stampAt + 3} />
    </AbsoluteFill>
  );
}

function Photo({ round, stampAt }: { round: QuizRound; stampAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const pushIn = interpolate(frame, [sec(round.from) - 8, sec(round.to)], [1, 1.06], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flash = interpolate(frame - stampAt, [0, 3, 14], [0, 0.22, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: PHOTO.top,
        ...COLUMN,
        height: PHOTO.height,
        borderRadius: 44,
        overflow: "hidden",
        boxShadow: "0 24px 56px rgba(25, 38, 38, 0.18)",
        backgroundColor: ARYA.colors.ink,
      }}
    >
      <Img
        src={staticFile(round.photo)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: round.focus,
          scale: String(pushIn),
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#FFFFFF", opacity: flash }} />
      <Stamp letter={round.answer} at={stampAt} />
    </div>
  );
}

/** The answer letter slams into the photo's lower left corner, clear of Arya's face. */
function Stamp({ letter, at }: { letter: Letter; at: number }) {
  const frame = useCurrentFrame();

  if (frame < at) {
    return null;
  }

  const slam = ramp(frame, at, at + 5, Easing.in(Easing.quad));
  const settle = interpolate(frame, [at + 5, at + 8, at + 12], [1, 1.06, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const size = 200;

  return (
    <div
      style={{
        position: "absolute",
        left: 28,
        bottom: 28,
        width: size,
        height: size,
        borderRadius: "50%",
        border: `14px solid ${ARYA.colors.accent}`,
        backgroundColor: "rgba(255, 248, 239, 0.94)",
        boxSizing: "border-box",
        color: ARYA.colors.accent,
        fontFamily: POPPINS,
        fontSize: 120,
        fontWeight: 700,
        lineHeight: `${size - 28}px`,
        textAlign: "center",
        rotate: "-10deg",
        scale: String(interpolate(slam, [0, 1], [2.6, 1]) * settle),
        opacity: ramp(frame, at, at + 2),
        boxShadow: "0 18px 40px rgba(25, 38, 38, 0.28)",
      }}
    >
      {letter}
    </div>
  );
}

function TimerBar({ round, stampAt }: { round: QuizRound; stampAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(round.timerFrom);
  const remaining = interpolate(frame, [start, stampAt], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isLastSecond = frame >= stampAt - sec(1);

  return (
    <div
      style={{
        position: "absolute",
        top: BAR.top,
        ...COLUMN,
        height: BAR.height,
        borderRadius: BAR.height / 2,
        backgroundColor: TRACK,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${remaining * 100}%`,
          height: "100%",
          borderRadius: BAR.height / 2,
          backgroundColor: isLastSecond ? CORAL : ARYA.colors.accent,
        }}
      />
    </div>
  );
}

interface OptionProps {
  letter: Letter;
  text: string;
  index: number;
  isAnswer: boolean;
  revealAt: number;
}

function Option({ letter, text, index, isAnswer, revealAt }: OptionProps) {
  const frame = useCurrentFrame();
  const reveal = ramp(frame, revealAt, revealAt + 6);
  const isRevealed = frame >= revealAt;
  const pop = isAnswer
    ? interpolate(frame - revealAt, [0, 4, 10], [1, 1.05, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      })
    : 1;
  const isHighlighted = isAnswer && isRevealed;
  const ink = isHighlighted ? "#FFFFFF" : ARYA.colors.ink;

  return (
    <div
      style={{
        position: "absolute",
        top: OPTION.top + index * (OPTION.height + OPTION.gap),
        ...COLUMN,
        height: OPTION.height,
        display: "flex",
        alignItems: "center",
        gap: 24,
        padding: "0 26px",
        borderRadius: 30,
        backgroundColor: isHighlighted ? ARYA.colors.accent : "#FFFFFF",
        boxShadow: "0 10px 24px rgba(25, 38, 38, 0.1)",
        opacity: isAnswer ? 1 : interpolate(reveal, [0, 1], [1, 0.35]),
        scale: String(pop),
        fontFamily: POPPINS,
        fontWeight: 700,
        color: ink,
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          flexShrink: 0,
          borderRadius: "50%",
          backgroundColor: isHighlighted ? "#FFFFFF" : ARYA.colors.ink,
          color: isHighlighted ? ARYA.colors.accent : "#FFFFFF",
          fontSize: 38,
          lineHeight: "64px",
          textAlign: "center",
        }}
      >
        {letter}
      </div>
      <div style={{ flex: 1, fontSize: 50, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {text}
      </div>
      {isHighlighted ? <div style={{ fontSize: 52 }}>✓</div> : null}
    </div>
  );
}

function Punchline({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, at, at + 8);

  return (
    <div
      style={{
        position: "absolute",
        top: PUNCHLINE_TOP,
        ...COLUMN,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 58,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        color: ARYA.colors.accent,
        opacity: rise,
        translate: `0px ${(1 - rise) * 30}px`,
      }}
    >
      {text}
    </div>
  );
}
