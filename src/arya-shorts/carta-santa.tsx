import { measureText } from "@remotion/layout-utils";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { caveat } from "../photo/fonts";
import type { PosDemoProps, Sfx } from "../template/schema";
import { Pencil } from "./diary";
import {
  ARYA,
  centered,
  CORAL,
  EndCard,
  PawPrint,
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

const FONT_SIZE = 100;
const LINE_STEP = 120;
const TEXT_LEFT = 120;
const TEXT_TOP = 270;
/** Caveat's baseline sits about this far below the top of a line box. */
const BASELINE = 82;
/** Middle of Caveat's lowercase letters, where the strike runs. */
const STRIKE_Y = 56;
const GRAPHITE = "#2F2C29";
const PAPER = "#FFFDF7";
const CHARS_PER_SECOND = 30;
const STRIKE_SECONDS = 0.25;
const SLIDE_FRAMES = 10;
const PAPER_BOX = { left: 44, top: 96, width: 992, height: 1712, border: 26 } as const;

interface LetterLine {
  text: string;
  /** Second the pen starts writing this line. */
  at: number;
  /** Teal ink for the greeting and the corrections. */
  isAccent?: boolean;
  /** Second the pen starts crossing the line out. */
  struckAt?: number;
}

interface Evidence {
  src: string;
  caption: string;
  tilt: number;
  /** Photo box and top edge; defaults to the large evidence slot. */
  photo?: { width: number; height: number; top: number };
}

interface LetterSheet {
  from: number;
  to: number;
  lines: LetterLine[];
  /** Arya's photo taped under the lines, with a handwritten caption. */
  evidence?: Evidence;
  /** Characters of the first line already written on the first frame. */
  headStart?: number;
  /** Paw print stamped next to the signature. */
  pawAt?: number;
}

export type CartaSantaProps = {
  sheets: LetterSheet[];
  question: { text: string; emoji: string; at: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

const textWidth = (text: string) =>
  measureText({
    text,
    fontFamily: caveat,
    fontSize: FONT_SIZE,
    fontWeight: "700",
    validateFontIsLoaded: false,
  }).width;

const lineTop = (index: number) => TEXT_TOP + index * LINE_STEP;

/**
 * "Carta a Santa": the Diario's pencil hand turned into an airmail letter from
 * La Escupe-Pastillas. Each sheet makes a promise, crosses it out, corrects it
 * and tapes on Arya's photo as evidence; the sheet slides away for the next
 * one, and the last sheet ends on the signature and a question for comments.
 */
export function CartaSanta(props: CartaSantaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const index = Math.max(
    0,
    props.sheets.findIndex((sheet) => frame < sec(sheet.to)),
  );
  const current = props.sheets[index];
  const next = props.sheets[index + 1];
  const slideFrom = sec(current.to) - SLIDE_FRAMES;
  const isSliding = next !== undefined && frame >= slideFrom;
  const slide = isSliding ? ramp(frame, slideFrom, sec(current.to), Easing.in(Easing.quad)) : 0;

  return (
    <ShortFrame
      background="#1F5E5E"
      music={props.music}
      duckAt={props.cta.from}
      sfx={props.sfx}
    >
      <Snow />
      {isSliding ? <Sheet sheet={next} /> : null}
      <AbsoluteFill
        style={{
          translate: `${-1300 * slide}px ${-80 * slide}px`,
          rotate: `${-7 * slide}deg`,
        }}
      >
        <Sheet sheet={current} />
      </AbsoluteFill>
      <Question question={props.question} />
      <EndCard cta={{ ...props.cta, note: "" }} />
      <CtaNote text={props.cta.note} from={sec(props.cta.revealAt.note)} />
    </ShortFrame>
  );
}

/** Where the pen is on this sheet, and whether it is moving. */
function usePen(sheet: LetterSheet) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = useSeconds();
  const headStart = sheet.headStart ?? 0;

  const strokes = sheet.lines.flatMap((line, index) => {
    const lead = index === 0 ? headStart : 0;
    const width = textWidth(line.text);
    const write = {
      from: sec(line.at),
      to: sec(line.at) + Math.ceil(((line.text.length - lead) / CHARS_PER_SECOND) * fps),
      at: (progress: number) => ({
        x: TEXT_LEFT + width * ((lead + progress * (line.text.length - lead)) / line.text.length),
        y: lineTop(index) + BASELINE,
      }),
    };
    if (line.struckAt === undefined) {
      return [write];
    }
    const strike = {
      from: sec(line.struckAt),
      to: sec(line.struckAt + STRIKE_SECONDS),
      at: (progress: number) => ({
        x: TEXT_LEFT - 14 + (width + 28) * progress,
        y: lineTop(index) + STRIKE_Y,
      }),
    };
    return [write, strike];
  });

  const ordered = [...strokes].sort((a, b) => a.from - b.from);
  const active = ordered.find((stroke) => frame >= stroke.from && frame < stroke.to);
  if (active) {
    const progress = (frame - active.from) / (active.to - active.from);
    return { ...active.at(progress), isMoving: true, away: 0 };
  }

  const done = ordered.filter((stroke) => frame >= stroke.to);
  const last = done[done.length - 1] ?? ordered[0];
  const finishedAt = ordered[ordered.length - 1].to;
  return {
    ...last.at(done.length === 0 ? 0 : 1),
    isMoving: false,
    away: ramp(frame, finishedAt + 6, finishedAt + 18),
  };
}

/** 0 → 1: how much of a line the pen has written. */
function revealOf(
  sheet: LetterSheet,
  index: number,
  frame: number,
  fps: number,
  sec: (seconds: number) => number,
) {
  const line = sheet.lines[index];
  const headStart = index === 0 ? sheet.headStart ?? 0 : 0;
  const written = headStart + (Math.max(0, frame - sec(line.at)) / fps) * CHARS_PER_SECOND;
  return Math.min(1, written / line.text.length);
}

function Sheet({ sheet }: { sheet: LetterSheet }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = useSeconds();
  const pen = usePen(sheet);

  return (
    <AbsoluteFill>
      <Paper />
      {sheet.lines.map((line, index) => {
        const reveal = revealOf(sheet, index, frame, fps, sec);
        if (reveal <= 0 && frame < sec(line.at)) {
          return null;
        }
        return (
          <div key={line.text}>
            <div
              style={{
                position: "absolute",
                left: TEXT_LEFT,
                top: lineTop(index),
                fontFamily: caveat,
                fontSize: FONT_SIZE,
                fontWeight: 700,
                lineHeight: 1,
                color: line.isAccent ? ARYA.colors.accent : GRAPHITE,
                whiteSpace: "pre",
                padding: "0 0.3em 0 0",
                mixBlendMode: "multiply",
                clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% -5%)`,
              }}
            >
              {line.text}
            </div>
            {line.struckAt === undefined ? null : (
              <Strike
                top={lineTop(index) + STRIKE_Y}
                width={textWidth(line.text)}
                progress={ramp(frame, sec(line.struckAt), sec(line.struckAt + STRIKE_SECONDS), Easing.linear)}
              />
            )}
          </div>
        );
      })}
      {sheet.evidence ? <EvidencePhoto evidence={sheet.evidence} from={sec(sheet.from)} /> : null}
      {sheet.pawAt === undefined ? null : <Paw from={sec(sheet.pawAt)} />}
      <Pencil
        x={pen.x + pen.away * 500}
        y={pen.y - pen.away * 500}
        wiggle={pen.isMoving ? Math.sin(frame * 1.9) * 7 : 0}
      />
    </AbsoluteFill>
  );
}

/** Airmail paper in Arya's teal and coral, ruled under every line of text. */
function Paper() {
  const inner = PAPER_BOX.top + PAPER_BOX.border;
  const rule = (((TEXT_TOP + BASELINE + 10 - inner - (LINE_STEP - 3)) % LINE_STEP) + LINE_STEP) % LINE_STEP;

  return (
    <div
      style={{
        position: "absolute",
        left: PAPER_BOX.left,
        top: PAPER_BOX.top,
        width: PAPER_BOX.width,
        height: PAPER_BOX.height,
        padding: PAPER_BOX.border,
        boxSizing: "border-box",
        background: `repeating-linear-gradient(135deg, ${TEAL} 0 34px, ${PAPER} 34px 56px, ${CORAL} 56px 90px, ${PAPER} 90px 112px)`,
        boxShadow: "0 26px 60px rgba(8, 30, 30, 0.55)",
      }}
    >
      <div
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: PAPER,
          backgroundImage: `repeating-linear-gradient(to bottom, transparent 0 ${LINE_STEP - 3}px, rgba(35, 122, 122, 0.2) ${LINE_STEP - 3}px ${LINE_STEP}px)`,
          backgroundPosition: `0 ${rule}px`,
        }}
      />
      <Stamp />
    </div>
  );
}

/** A North Pole stamp: a drawn pine with a capsule ornament, no words. */
function Stamp() {
  return (
    <div style={{ position: "absolute", right: 70, top: 66, rotate: "6deg" }}>
      <svg width={150} height={180} viewBox="0 0 150 180" aria-hidden>
        <rect x="4" y="4" width="142" height="172" fill={PAPER} stroke={CORAL} strokeWidth="8" strokeDasharray="10 7" />
        <rect x="18" y="18" width="114" height="144" fill="#DDF1EF" />
        <path d="M75 34 L112 92 H94 L118 134 H32 L56 92 H38 Z" fill={TEAL} />
        <rect x="68" y="134" width="14" height="18" fill="#8A5A3B" />
        <circle cx="75" cy="32" r="8" fill={CORAL} />
        <circle cx="62" cy="104" r="7" fill={CORAL} />
        <circle cx="90" cy="118" r="7" fill={PAPER} />
      </svg>
      <svg width={220} height={120} viewBox="0 0 220 120" style={{ position: "absolute", left: -150, top: 40 }} aria-hidden>
        <circle cx="70" cy="60" r="46" fill="none" stroke="rgba(47, 44, 41, 0.35)" strokeWidth="5" />
        <circle cx="70" cy="60" r="32" fill="none" stroke="rgba(47, 44, 41, 0.25)" strokeWidth="3" />
        {[0, 1, 2].map((row) => (
          <path
            key={row}
            d={`M120 ${38 + row * 22} q 12 -10 24 0 t 24 0 t 24 0 t 24 0`}
            fill="none"
            stroke="rgba(47, 44, 41, 0.35)"
            strokeWidth="5"
          />
        ))}
      </svg>
    </div>
  );
}

function Strike({ top, width, progress }: { top: number; width: number; progress: number }) {
  if (progress <= 0) {
    return null;
  }

  return (
    <svg
      width={width + 28}
      height={30}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      style={{
        position: "absolute",
        left: TEXT_LEFT - 14,
        top: top - 15,
        overflow: "visible",
        clipPath: `inset(-50% ${(1 - progress) * 100}% -50% -5%)`,
      }}
      aria-hidden
    >
      <path
        d="M0 17 C 20 11, 38 20, 58 13 S 86 16, 100 10"
        fill="none"
        stroke={GRAPHITE}
        strokeWidth={11}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        style={{ mixBlendMode: "multiply" }}
      />
    </svg>
  );
}

const EVIDENCE_SLOT = { width: 560, height: 640, top: 690 } as const;

function EvidencePhoto({ evidence, from }: { evidence: Evidence; from: number }) {
  const frame = useCurrentFrame();
  const land = from === 0 ? 1 : ramp(frame, from, from + 7);
  const photo = evidence.photo ?? EVIDENCE_SLOT;

  if (frame < from) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: photo.top,
        ...centered(photo.width + 40),
        padding: "20px 20px 92px",
        backgroundColor: "#FFFFFF",
        boxShadow: "0 18px 36px rgba(30, 40, 40, 0.34)",
        rotate: `${evidence.tilt}deg`,
        opacity: land,
        scale: String(interpolate(land, [0, 1], [1.14, 1])),
      }}
    >
      <Img
        src={staticFile(evidence.src)}
        style={{ width: photo.width, height: photo.height, objectFit: "cover", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 16,
          textAlign: "center",
          fontFamily: caveat,
          fontSize: 62,
          fontWeight: 700,
          lineHeight: 1,
          color: GRAPHITE,
        }}
      >
        {evidence.caption}
      </div>
      <div
        style={{
          position: "absolute",
          left: photo.width / 2 - 60,
          top: -26,
          width: 160,
          height: 54,
          backgroundColor: "rgba(245, 190, 163, 0.78)",
          rotate: "-3deg",
        }}
      />
    </div>
  );
}

function Paw({ from }: { from: number }) {
  const frame = useCurrentFrame();
  const slam = ramp(frame, from, from + 5, Easing.in(Easing.quad));

  if (frame < from) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 760,
        top: 470,
        rotate: "14deg",
        opacity: 0.85 * slam,
        scale: String(interpolate(slam, [0, 1], [1.8, 1])),
      }}
    >
      <PawPrint size={140} color={TEAL} />
    </div>
  );
}

/** The comment prompt as a gift tag hung over the signed letter. */
function Question({ question }: { question: CartaSantaProps["question"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const from = sec(question.at);

  if (frame < from - 3) {
    return null;
  }

  const drop = ramp(frame, from - 3, from + 9);

  return (
    <div
      style={{
        position: "absolute",
        top: 1110,
        ...centered(860),
        padding: "36px 36px 28px",
        textAlign: "center",
        backgroundColor: ARYA.colors.background,
        border: `8px solid ${ARYA.colors.accent}`,
        borderRadius: 34,
        boxShadow: "0 24px 50px rgba(8, 30, 30, 0.45)",
        rotate: `${-2 + Math.sin(frame / 9) * 0.6}deg`,
        translate: `0px ${(1 - drop) * -260}px`,
        opacity: drop,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 400,
          top: 14,
          width: 44,
          height: 44,
          borderRadius: "50%",
          border: `6px solid ${ARYA.colors.accent}`,
          backgroundColor: "#1F5E5E",
          boxSizing: "border-box",
        }}
      />
      <div
        style={{
          marginTop: 24,
          fontFamily: POPPINS,
          fontSize: 76,
          fontWeight: ARYA.weights.display,
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
        }}
      >
        {question.text}
      </div>
      <div style={{ marginTop: 12, fontSize: 80, lineHeight: 1 }}>{question.emoji}</div>
    </div>
  );
}

/** Gentle snow on the teal backdrop around the letter. */
function Snow() {
  const frame = useCurrentFrame();
  const flakes = Array.from({ length: 40 }, (_, index) => ({
    x: (index * 211) % 1080,
    speed: 1.2 + ((index * 7) % 5) * 0.35,
    offset: (index * 389) % 1920,
    size: 8 + ((index * 13) % 4) * 4,
  }));

  return (
    <AbsoluteFill>
      {flakes.map((flake, index) => (
        <div
          key={index}
          style={{
            position: "absolute",
            left: flake.x + Math.sin((frame + index * 20) / 24) * 14,
            top: ((flake.offset + frame * flake.speed) % 1980) - 40,
            width: flake.size,
            height: flake.size,
            borderRadius: "50%",
            backgroundColor: "rgba(255, 248, 239, 0.75)",
          }}
        />
      ))}
    </AbsoluteFill>
  );
}

/**
 * The shared end card sets its note on one line above the pill; the Spanish
 * note needs two, so it is drawn here between the name and the pill, matching
 * the other Spanish end cards.
 */
function CtaNote({ text, from }: { text: string; from: number }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 972,
        ...centered(936),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 46,
        fontWeight: ARYA.weights.emphasis,
        lineHeight: 1.15,
        letterSpacing: "-0.01em",
        whiteSpace: "pre-line",
        color: ARYA.colors.muted,
        opacity: ramp(frame, from, from + 14),
      }}
    >
      {text}
    </div>
  );
}
