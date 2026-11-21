import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CtaScene } from "../template/scenes/cta-scene";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

/** Seconds the ring takes to run out before the verdict stamps. */
export const COUNT_SECONDS = 2;

const VERDICTS = {
  verdad: { label: "VERDAD", stamp: "#1F9E80", text: "#16806A", mark: "✓" },
  mito: { label: "MITO", stamp: "#E0533F", text: "#C8402E", mark: "✕" },
} as const;

type Verdict = keyof typeof VERDICTS;

const PHOTO = { top: 372, height: 700, width: 860 };
const RING = { size: 168, stroke: 14 };
const STATEMENT_TOP = 1180;
const EXPLANATION_TOP = 1356;
const SLIDE_FRAMES = 8;
/** The whole end card sits this much lower so the closing line fits above the logo. */
const CTA_SHIFT = 190;

export interface QuizCard {
  statement: string;
  verdict: Verdict;
  explanation: string;
  photo: string;
  /** CSS object-position of the photo inside its frame. */
  focus: string;
  /** Second the card is fully on screen. */
  from: number;
  /** Second the ring starts; negative when it is already running on frame 0. */
  ringFrom: number;
  /** Second the card leaves. */
  to: number;
}

export type VerdadOMitoProps = {
  title: { lead: string; verdad: string; middle: string; mito: string; tail: string };
  cards: QuizCard[];
  closing: { lines: [string, string]; at: number; secondAt: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "¿Verdad o mito?": statement, a two second ring, then the stamp and one line. */
export function VerdadOMito(props: VerdadOMitoProps) {
  const lastIndex = props.cards.length - 1;

  return (
    <ShortFrame background={ARYA.colors.background} music={props.music} sfx={props.sfx}>
      <Title title={props.title} />
      <Progress cards={props.cards} />
      {props.cards.map((card, index) => (
        <Card key={card.statement} card={card} isLast={index === lastIndex} />
      ))}
      <ClosingCard closing={props.closing} cta={props.cta} />
    </ShortFrame>
  );
}

function Title({ title }: { title: VerdadOMitoProps["title"] }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 228,
        ...centered(860),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 80,
        fontWeight: 700,
        letterSpacing: "-0.03em",
        lineHeight: 1.05,
        color: ARYA.colors.ink,
      }}
    >
      {title.lead}
      <span style={{ color: VERDICTS.verdad.stamp }}>{title.verdad}</span>
      {title.middle}
      <span style={{ color: VERDICTS.mito.stamp }}>{title.mito}</span>
      {title.tail}
    </div>
  );
}

function Progress({ cards }: { cards: QuizCard[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <div
      style={{
        position: "absolute",
        top: 330,
        left: 0,
        width: 1080,
        display: "flex",
        justifyContent: "center",
        gap: 14,
      }}
    >
      {cards.map((card) => {
        const isDone = frame >= sec(card.ringFrom + COUNT_SECONDS);
        const isCurrent = frame >= sec(card.from) - SLIDE_FRAMES / 2 && frame < sec(card.to) - SLIDE_FRAMES / 2;
        const color = isDone
          ? VERDICTS[card.verdict].stamp
          : isCurrent
            ? ARYA.colors.ink
            : "#E3DACB";

        return (
          <div
            key={card.statement}
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

function Card({ card, isLast }: { card: QuizCard; isLast: boolean }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const half = SLIDE_FRAMES / 2;
  const enterAt = sec(card.from);
  const exitAt = sec(card.to);
  const stampAt = sec(card.ringFrom + COUNT_SECONDS);

  if (frame < enterAt - half || (!isLast && frame > exitAt + half)) {
    return null;
  }

  const enter = enterAt === 0 ? 1 : ramp(frame, enterAt - half, enterAt + half);
  // Same curve in and out keeps the two cards exactly one screen apart.
  const exit = isLast ? 0 : ramp(frame, exitAt - half, exitAt + half);
  const sinceStamp = frame - stampAt;
  const shake =
    sinceStamp >= 3 && sinceStamp < 12
      ? Math.sin(sinceStamp * 2.4) * 16 * (1 - (sinceStamp - 3) / 9)
      : 0;
  const slideX = (1 - enter) * 1080 - exit * 1080 + shake;

  return (
    <AbsoluteFill style={{ translate: `${slideX}px 0px` }}>
      <Photo card={card} stampAt={stampAt} />
      <Countdown card={card} stampAt={stampAt} />
      <div
        style={{
          position: "absolute",
          top: STATEMENT_TOP,
          ...centered(820),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 66,
          fontWeight: 700,
          lineHeight: 1.12,
          letterSpacing: "-0.025em",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
        }}
      >
        “{card.statement}”
      </div>
      <Explanation card={card} at={stampAt + 3} />
    </AbsoluteFill>
  );
}

function Photo({ card, stampAt }: { card: QuizCard; stampAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const verdict = VERDICTS[card.verdict];
  const pushIn = interpolate(frame, [sec(card.from) - 8, sec(card.to)], [1, 1.07], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tint = interpolate(frame - stampAt, [0, 3, 14], [0, 0.2, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        top: PHOTO.top,
        ...centered(PHOTO.width),
        height: PHOTO.height,
        borderRadius: 44,
        overflow: "hidden",
        boxShadow: "0 24px 56px rgba(25, 38, 38, 0.18)",
        backgroundColor: ARYA.colors.ink,
      }}
    >
      <Img
        src={staticFile(card.photo)}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          objectPosition: card.focus,
          scale: String(pushIn),
        }}
      />
      <AbsoluteFill style={{ backgroundColor: verdict.stamp, opacity: tint }} />
      <Stamp verdict={card.verdict} at={stampAt} />
    </div>
  );
}

function Stamp({ verdict, at }: { verdict: Verdict; at: number }) {
  const frame = useCurrentFrame();

  if (frame < at) {
    return null;
  }

  const style = VERDICTS[verdict];
  const slam = ramp(frame, at, at + 5, Easing.in(Easing.quad));
  const settle = interpolate(frame, [at + 5, at + 8, at + 12], [1, 1.05, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scale = interpolate(slam, [0, 1], [2.6, 1]) * settle;

  return (
    // Below center: Arya's face sits in the top half of every photo.
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", translate: "0px 150px" }}>
      <div
        style={{
          padding: "6px 40px 10px",
          borderRadius: 30,
          border: `14px solid ${style.stamp}`,
          backgroundColor: "rgba(255, 248, 239, 0.92)",
          color: style.stamp,
          fontFamily: POPPINS,
          fontSize: 140,
          fontWeight: 700,
          lineHeight: 1.05,
          letterSpacing: "0.02em",
          rotate: "-9deg",
          scale: String(scale),
          opacity: ramp(frame, at, at + 2),
          boxShadow: "0 18px 40px rgba(25, 38, 38, 0.28)",
        }}
      >
        {style.label}
      </div>
    </AbsoluteFill>
  );
}

function Countdown({ card, stampAt }: { card: QuizCard; stampAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const ringStart = sec(card.ringFrom);
  const total = stampAt - ringStart;
  const remaining = Math.min(total, Math.max(0, stampAt - frame));
  const digit = Math.ceil(remaining / sec(1));
  const sinceDigit = (frame - ringStart) % sec(1);
  const pulse = interpolate(sinceDigit, [0, 4, 9], [1.1, 1.1, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const radius = (RING.size - RING.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const isStamped = frame >= stampAt;
  const verdict = VERDICTS[card.verdict];
  const badge = ramp(frame, stampAt, stampAt + 7, Easing.out(Easing.back(2.2)));

  return (
    <div
      style={{
        position: "absolute",
        left: 540 - RING.size / 2,
        top: PHOTO.top + PHOTO.height - RING.size / 2,
        width: RING.size,
        height: RING.size,
        borderRadius: "50%",
        backgroundColor: isStamped ? verdict.stamp : "#FFFFFF",
        boxShadow: "0 12px 28px rgba(25, 38, 38, 0.2)",
        scale: String(isStamped ? badge : pulse),
      }}
    >
      {isStamped ? (
        <div
          style={{
            width: RING.size,
            lineHeight: `${RING.size}px`,
            textAlign: "center",
            fontFamily: POPPINS,
            fontSize: 92,
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          {verdict.mark}
        </div>
      ) : (
        <>
          <svg width={RING.size} height={RING.size} style={{ position: "absolute", rotate: "-90deg" }} aria-hidden>
            <circle
              cx={RING.size / 2}
              cy={RING.size / 2}
              r={radius}
              fill="none"
              stroke="#EFE7DA"
              strokeWidth={RING.stroke}
            />
            <circle
              cx={RING.size / 2}
              cy={RING.size / 2}
              r={radius}
              fill="none"
              stroke={ARYA.colors.accent}
              strokeWidth={RING.stroke}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - remaining / total)}
            />
          </svg>
          <div
            style={{
              position: "absolute",
              width: RING.size,
              lineHeight: `${RING.size}px`,
              textAlign: "center",
              fontFamily: POPPINS,
              fontSize: 84,
              fontWeight: 700,
              color: ARYA.colors.ink,
            }}
          >
            {digit}
          </div>
        </>
      )}
    </div>
  );
}

function Explanation({ card, at }: { card: QuizCard; at: number }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, at, at + 8);

  return (
    <div
      style={{
        position: "absolute",
        top: EXPLANATION_TOP,
        ...centered(820),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 64,
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: "-0.02em",
        color: VERDICTS[card.verdict].text,
        opacity: rise,
        translate: `0px ${(1 - rise) * 30}px`,
      }}
    >
      {card.explanation}
    </div>
  );
}

/** The closing line over a cream card, then the shared CTA a little lower than usual. */
function ClosingCard({
  closing,
  cta,
}: {
  closing: VerdadOMitoProps["closing"];
  cta: PosDemoProps["cta"];
}) {
  const sec = useSeconds();

  return (
    <Sequence name="Cierre y CTA" from={sec(closing.at)}>
      <ClosingCardBody closing={closing} cta={cta} />
    </Sequence>
  );
}

function ClosingCardBody({
  closing,
  cta,
}: {
  closing: VerdadOMitoProps["closing"];
  cta: PosDemoProps["cta"];
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const secondAt = sec(closing.secondAt - closing.at);
  const ctaAt = sec(cta.from - closing.at);
  const noteAt = sec(cta.revealAt.note - closing.at);
  const lineStyle = {
    fontFamily: POPPINS,
    fontSize: 70,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: "-0.03em",
  } as const;

  return (
    <AbsoluteFill
      style={{ backgroundColor: ARYA.colors.background, opacity: ramp(frame, 0, 4) }}
    >
      <div style={{ position: "absolute", top: 244, ...centered(820), textAlign: "center" }}>
        <div style={{ ...lineStyle, color: ARYA.colors.ink }}>{closing.lines[0]}</div>
        <div
          style={{
            ...lineStyle,
            color: ARYA.colors.accent,
            opacity: ramp(frame, secondAt, secondAt + 8),
            translate: `0px ${(1 - ramp(frame, secondAt, secondAt + 10)) * 24}px`,
          }}
        >
          {closing.lines[1]}
        </div>
      </div>
      <Sequence from={ctaAt}>
        <AbsoluteFill style={{ translate: `0px ${CTA_SHIFT}px` }}>
          <CtaScene cta={{ ...cta, note: "" }} />
        </AbsoluteFill>
      </Sequence>
      <div
        style={{
          position: "absolute",
          top: 984 + CTA_SHIFT,
          ...centered(936),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 48,
          fontWeight: ARYA.weights.emphasis,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          whiteSpace: "pre-line",
          color: ARYA.colors.muted,
          opacity: ramp(frame, noteAt, noteAt + 14),
        }}
      >
        {cta.note}
      </div>
    </AbsoluteFill>
  );
}
