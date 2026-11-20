import { loadFont as loadCourierPrime } from "@remotion/google-fonts/CourierPrime";
import { loadFont as loadOswald } from "@remotion/google-fonts/Oswald";
import { loadFont as loadPermanentMarker } from "@remotion/google-fonts/PermanentMarker";
import { loadFont as loadSpecialElite } from "@remotion/google-fonts/SpecialElite";
import type { CSSProperties } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, EndCard, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

/** Typewriter body for every card. Exported so the call cannot be tree-shaken away. */
export const { fontFamily: courier } = loadCourierPrime("normal", {
  weights: ["700"],
  subsets: ["latin", "latin-ext"],
});

/** The folder tab's label, typed on an old machine. */
export const { fontFamily: typewriter } = loadSpecialElite("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

/** Rubber stamps: condensed caps read at a glance. */
export const { fontFamily: oswald } = loadOswald("normal", {
  weights: ["700"],
  subsets: ["latin", "latin-ext"],
});

/** The case question, written by hand over the folder. */
export const { fontFamily: marker } = loadPermanentMarker("normal", {
  weights: ["400"],
  subsets: ["latin"],
});

const INK = "#262019";
const STAMP_RED = "#C7362B";
const MARKER_RED = "#B8241C";

/** Folder geometry on the 1080 × 1920 canvas. Everything inside it is folder-relative. */
const FOLDER = { left: 60, top: 330, width: 960, height: 1430 };
const TAB = { left: 50, top: -70, width: 470, height: 84 };
const PRINT = { left: 62, top: 62, width: 388, image: { width: 352, height: 440 } };
/** The pile: every card shares one box so a new card hides the one under it. */
const CARD = { left: 50, top: 630, width: 820, height: 500 };
const SLAP_FRAMES = 4;
const STAMP_FRAMES = 4;

export interface ExpedienteLine {
  text: string;
  /** Second the line appears on its card. */
  at: number;
  size?: number;
}

export interface ExpedienteCard {
  /** Second the card lands on the pile. */
  at: number;
  /** A small stamp in the corner, e.g. PISTA 1. */
  label?: string;
  /** The answer stamp, set large above the lines. */
  headline?: { text: string; at: number };
  lines: ExpedienteLine[];
  /** A stamp pressed under the lines. */
  stamp?: { text: string; at: number };
  /** Degrees; small and alternating so the pile looks handled. */
  tilt: number;
  /** Horizontal jitter in px. */
  shift?: number;
}

export type ExpedienteProps = {
  desk: string;
  folder: string;
  paper: string;
  tab: string;
  /** Prints clipped to the folder; later ones slap over earlier ones. */
  photos: { src: string; at: number; tilt: number; shift: number }[];
  question: { text: string; at: number };
  cards: ExpedienteCard[];
  quiz: { text: string; at: number; count: number[]; until: number };
  cta: PosDemoProps["cta"];
  /** Drawn here instead of `cta.note`; `\n` sets the break. */
  ctaNote: string;
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "Expediente": Arya's real story as a case file; clues stamp in, then the answer. */
export function Expediente(props: ExpedienteProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const hits = [
    ...props.cards.map((card) => card.at),
    ...props.cards.flatMap((card) => (card.stamp ? [card.stamp.at] : [])),
    ...props.cards.flatMap((card) => (card.headline ? [card.headline.at] : [])),
    ...props.photos.slice(1).map((photo) => photo.at),
  ];
  const shake = hits.reduce((offset, at) => offset + jolt(frame - sec(at)), 0) + jolt(frame - 10, 0.8);
  const arrive = ramp(frame, 0, 10, Easing.out(Easing.cubic));
  const push = interpolate(frame, [0, sec(props.cta.from)], [1, 1.035], {
    extrapolateRight: "clamp",
  });

  return (
    <ShortFrame background="#24160D" music={props.music} duckAt={props.cta.from} sfx={props.sfx}>
      <InkFilters />
      <AbsoluteFill style={{ scale: String(push), translate: `${shake * 0.5}px ${shake}px` }}>
        <Img
          src={staticFile(props.desk)}
          style={{
            position: "absolute",
            inset: -60,
            width: 1200,
            height: 2040,
            maxWidth: "none",
            objectFit: "cover",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: FOLDER.left,
            top: FOLDER.top,
            width: FOLDER.width,
            height: FOLDER.height,
            translate: `0px ${interpolate(arrive, [0, 1], [50, 0])}px`,
            rotate: `${interpolate(arrive, [0, 1], [2.6, -0.7])}deg`,
          }}
        >
          <Folder {...props} />
        </div>
      </AbsoluteFill>

      <Quiz quiz={props.quiz} />
      <EndCard cta={{ ...props.cta, note: "" }} />
      <CtaNote text={props.ctaNote} from={sec(props.cta.revealAt.note)} />
    </ShortFrame>
  );
}

function Folder(props: ExpedienteProps) {
  const sec = useSeconds();

  return (
    <>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 12,
          boxShadow: "0 30px 70px rgba(10, 5, 2, 0.6)",
        }}
      />
      <Manila src={props.folder} box={{ left: TAB.left, top: TAB.top, width: TAB.width, height: TAB.height + 20 }} radius="18px 18px 0 0" />
      <Manila src={props.folder} box={{ left: 0, top: 0, width: FOLDER.width, height: FOLDER.height }} radius="6px 14px 14px 14px" />
      <TabLabel text={props.tab} />

      {props.photos.map((photo, index) => (
        <Print key={photo.src} photo={photo} paper={props.paper} slaps={index > 0} />
      ))}
      <Paperclip />
      <Question text={props.question.text} from={sec(props.question.at)} />

      {props.cards.map((card, index) => (
        <Card
          key={card.at}
          card={card}
          paper={props.paper}
          index={index}
          coveredAt={props.cards[index + 1]?.at}
        />
      ))}
    </>
  );
}

function Manila({
  src,
  box,
  radius,
}: {
  src: string;
  box: { left: number; top: number; width: number; height: number };
  radius: string;
}) {
  return (
    <div
      style={{
        position: "absolute",
        ...box,
        overflow: "hidden",
        borderRadius: radius,
      }}
    >
      <Img
        src={staticFile(src)}
        style={{
          position: "absolute",
          left: -box.left,
          top: -box.top,
          width: FOLDER.width,
          height: FOLDER.height,
          maxWidth: "none",
          objectFit: "fill",
        }}
      />
    </div>
  );
}

function TabLabel({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: TAB.left + 26,
        top: TAB.top + 14,
        width: TAB.width - 52,
        height: 58,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#F6EEDC",
        border: "2px solid rgba(38, 32, 25, 0.25)",
        boxSizing: "border-box",
        fontFamily: typewriter,
        fontSize: 40,
        lineHeight: 1,
        color: INK,
        letterSpacing: "0.04em",
        filter: "url(#expediente-ink)",
      }}
    >
      {text}
    </div>
  );
}

/** A white-bordered print; later prints drop over the first in four frames. */
function Print({
  photo,
  paper,
  slaps,
}: {
  photo: ExpedienteProps["photos"][number];
  paper: string;
  slaps: boolean;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const at = sec(photo.at);

  if (slaps && frame < at - SLAP_FRAMES) {
    return null;
  }

  const press = slaps ? ramp(frame, at - SLAP_FRAMES, at, Easing.in(Easing.quad)) : 1;
  const { image } = PRINT;
  const pad = (PRINT.width - image.width) / 2;

  return (
    <div
      style={{
        position: "absolute",
        left: PRINT.left + photo.shift,
        top: PRINT.top,
        width: PRINT.width,
        padding: `${pad}px ${pad}px ${pad * 3.4}px`,
        boxSizing: "border-box",
        overflow: "hidden",
        rotate: `${photo.tilt}deg`,
        scale: String(interpolate(press, [0, 1], [1.3, 1])),
        opacity: press,
        boxShadow: "0 14px 26px rgba(30, 16, 6, 0.45)",
      }}
    >
      <Img
        src={staticFile(paper)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(1.06)" }}
      />
      <Img
        src={staticFile(photo.src)}
        style={{
          position: "relative",
          display: "block",
          width: image.width,
          height: image.height,
          objectFit: "cover",
        }}
      />
    </div>
  );
}

/** A steel clip pinning the print to the folder. */
function Paperclip() {
  return (
    <svg
      width="70"
      height="170"
      viewBox="0 0 70 170"
      aria-hidden
      style={{
        position: "absolute",
        left: PRINT.left + 70,
        top: PRINT.top - 52,
        rotate: "-8deg",
        filter: "drop-shadow(3px 5px 3px rgba(20, 10, 4, 0.45))",
      }}
    >
      <defs>
        <linearGradient id="expediente-steel" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#F2F4F5" />
          <stop offset="0.5" stopColor="#9EA6AA" />
          <stop offset="1" stopColor="#D8DCDE" />
        </linearGradient>
      </defs>
      <path
        d="M22 150 V40 a17 17 0 0 1 34 0 V130 a11 11 0 0 1 -22 0 V52"
        fill="none"
        stroke="url(#expediente-steel)"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** "¿Qué tenía?" written in marker, stroke by stroke from the left. */
function Question({ text, from }: { text: string; from: number }) {
  const frame = useCurrentFrame();
  const rows = text.split("\n");

  if (frame < from) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 470,
        top: 170,
        width: 400,
        rotate: "-7deg",
        fontFamily: marker,
        fontSize: 112,
        lineHeight: 1.08,
        color: MARKER_RED,
        textAlign: "center",
      }}
    >
      {rows.map((row, index) => {
        const start = from + index * 8;
        const reveal = ramp(frame, start, start + 9, Easing.linear);

        return (
          <div key={row} style={{ clipPath: `inset(-20% ${(1 - reveal) * 100}% -20% 0)` }}>
            {row}
          </div>
        );
      })}
      <svg width="400" height="40" viewBox="0 0 400 40" aria-hidden style={{ display: "block", marginTop: -6 }}>
        <path
          d="M30 24 C 130 10, 260 12, 372 20"
          fill="none"
          stroke={MARKER_RED}
          strokeWidth="9"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - ramp(frame, from + 16, from + 22, Easing.linear)}
        />
      </svg>
    </div>
  );
}

const typed: CSSProperties = {
  fontFamily: courier,
  fontWeight: 700,
  color: INK,
  letterSpacing: "-0.01em",
};

/** An index card slapped onto the pile: lands in four frames from 1.25×. */
function Card({
  card,
  paper,
  index,
  coveredAt,
}: {
  card: ExpedienteCard;
  paper: string;
  index: number;
  /** Second the next card lands; its corner stamp would otherwise peek out above it. */
  coveredAt?: number;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const at = sec(card.at);
  const isFirst = index === 0;

  if (!isFirst && frame < at - SLAP_FRAMES) {
    return null;
  }

  const press = isFirst ? 1 : ramp(frame, at - SLAP_FRAMES, at, Easing.in(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left + (card.shift ?? 0),
        top: CARD.top,
        width: CARD.width,
        height: CARD.height,
        padding: "40px 50px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: 22,
        rotate: `${card.tilt}deg`,
        scale: String(interpolate(press, [0, 1], [1.25, 1])),
        opacity: press,
        boxShadow: "0 18px 34px rgba(30, 16, 6, 0.5)",
      }}
    >
      <Img
        src={staticFile(paper)}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
      />
      {card.label && (coveredAt === undefined || frame < sec(coveredAt)) ? <Label text={card.label} /> : null}
      {card.headline ? <Stamp text={card.headline.text} from={sec(card.headline.at)} size={124} tilt={-4} /> : null}
      {card.lines.map((line) => (
        <Line key={line.text} line={line} />
      ))}
      {card.stamp ? <Stamp text={card.stamp.text} from={sec(card.stamp.at)} size={78} tilt={-4} /> : null}
    </div>
  );
}

function Label({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 34,
        top: -28,
        padding: "4px 18px 6px",
        border: `5px solid ${STAMP_RED}`,
        borderRadius: 6,
        backgroundColor: "rgba(246, 238, 220, 0.9)",
        color: STAMP_RED,
        fontFamily: oswald,
        fontWeight: 700,
        fontSize: 46,
        lineHeight: 1,
        letterSpacing: "0.06em",
        rotate: "-4deg",
        filter: "url(#expediente-stamp)",
      }}
    >
      {text}
    </div>
  );
}

function Line({ line }: { line: ExpedienteLine }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const from = sec(line.at);

  return (
    <div
      style={{
        ...typed,
        position: "relative",
        fontSize: line.size ?? 60,
        lineHeight: 1.18,
        whiteSpace: "pre-line",
        opacity: from <= 0 ? 1 : ramp(frame, from, from + 3),
        visibility: frame < from ? "hidden" : "visible",
      }}
    >
      {line.text}
    </div>
  );
}

/** Rubber stamp: drops from 2.4× in four frames, squashes once on contact. */
function Stamp({ text, from, size, tilt }: { text: string; from: number; size: number; tilt: number }) {
  const frame = useCurrentFrame();
  const press = ramp(frame, from - STAMP_FRAMES, from, Easing.in(Easing.quad));
  const settle = interpolate(frame, [from, from + 2, from + 6], [1, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: `${size * 0.04}px ${size * 0.22}px ${size * 0.08}px`,
          border: `${Math.round(size * 0.075)}px solid ${STAMP_RED}`,
          borderRadius: size * 0.1,
          color: STAMP_RED,
          fontFamily: oswald,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.05,
          letterSpacing: "0.05em",
          rotate: `${tilt}deg`,
          scale: String(interpolate(press, [0, 1], [2.4, 1]) * settle),
          opacity: press,
          mixBlendMode: "multiply",
          filter: "url(#expediente-stamp)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** The whole desk dims; "¿Ya sabes?" and a 3-2-1 before the answer stamp. */
function Quiz({ quiz }: { quiz: ExpedienteProps["quiz"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const from = sec(quiz.at);
  const until = sec(quiz.until);

  if (frame < from || frame >= until + 4) {
    return null;
  }

  const visible = ramp(frame, from, from + 5) * (1 - ramp(frame, until, until + 4));
  const digitIndex = quiz.count.filter((at) => frame >= sec(at)).length - 1;

  return (
    <AbsoluteFill style={{ opacity: visible }}>
      <AbsoluteFill style={{ backgroundColor: "rgba(16, 9, 4, 0.9)" }} />
      <div
        style={{
          ...typed,
          position: "absolute",
          top: 470,
          ...centered(900),
          textAlign: "center",
          fontSize: 120,
          lineHeight: 1,
          color: "#FFF4E2",
          scale: String(interpolate(ramp(frame, from, from + 6), [0, 1], [1.2, 1])),
        }}
      >
        {quiz.text}
      </div>
      {digitIndex >= 0 ? (
        <Digit key={digitIndex} value={quiz.count.length - digitIndex} from={sec(quiz.count[digitIndex])} />
      ) : null}
    </AbsoluteFill>
  );
}

function Digit({ value, from }: { value: number; from: number }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, from, from + 6);

  return (
    <div
      style={{
        position: "absolute",
        top: 700,
        left: 0,
        width: 1080,
        textAlign: "center",
        fontFamily: oswald,
        fontWeight: 700,
        fontSize: 380,
        lineHeight: 1,
        color: ARYA.colors.callout,
        scale: String(interpolate(enter, [0, 1], [1.45, 1])),
        opacity: enter,
      }}
    >
      {value}
    </div>
  );
}

/** A decaying knock, in px, `since` frames after a hit. */
function jolt(since: number, strength = 1): number {
  if (since < 0 || since > 14) {
    return 0;
  }

  return Math.sin(since * 2.1) * 7 * strength * Math.exp(-since / 3.2);
}

/** Uneven ink for the tab label and stamps, with pinholes where the pad missed. */
function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="expediente-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="3" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="2.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
        <filter id="expediente-stamp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.4" numOctaves="3" seed="6" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -14 0 0 0 10.4" result="holes" />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
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

