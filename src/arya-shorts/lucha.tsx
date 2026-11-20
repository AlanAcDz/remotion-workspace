import { loadFont as loadAnton } from "@remotion/google-fonts/Anton";
import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, EndCard, PawPrint, POPPINS, ramp, ShortFrame, TEAL, useSeconds } from "./shared";

/** Condensed poster face of the lucha libre match cards. Exported so the call stays. */
export const { fontFamily: anton } = loadAnton("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
});

const NIGHT = "#1E1433";
const NIGHT_RAY = "#2A1C47";
const MAGENTA = "#E0407E";
const MUSTARD = "#F2B84B";
const CREAM = "#FFF8EF";
const OUTLINE = "#140C24";

/**
 * Canvas zones. Key text stays between rows 236 and 1490 and left of x 940,
 * clear of TikTok's caption block and side buttons.
 */
const TITLE = { top: 236, height: 186 };
const RING = { top: 440, height: 620 };
const PLATES = { top: 1074, height: 124 };
const CARD = { top: 1226, left: 60, width: 880 };
const TEXT_CENTER = CARD.left + CARD.width / 2;

/** The split between the two corners, in ring coordinates. */
const LEFT_CORNER = "36,0 566,0 500,620 36,620";
const RIGHT_CORNER = "586,0 1044,0 1044,620 520,620";
const VS = { x: 543, y: 310, r: 92 };

/**
 * Arya's mugshot (640×755) sits in the left corner unscaled, shifted so her
 * eyes land near the corner's center. Eye centers measured on the photo.
 */
const PHOTO = { width: 640, height: 755, x: -55, y: -30 };
const EYES = [
  { cx: 255, cy: 237 },
  { cx: 412, cy: 228 },
];

interface Line {
  text: string;
  at: number;
}

interface Round {
  title: string;
  at: number;
  move: Line;
  payoff: Line;
}

interface Banner {
  title: string;
  body: string;
  time: string;
  icon: string;
}

export type LuchaProps = {
  photo: string;
  queso: string;
  jamon: string;
  hook: { headline: string; sub: string };
  plates: { left: string; right: string };
  rounds: Round[];
  count: Line[];
  winner: Line;
  banner: Banner & { at: number };
  rematch: Line;
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "Lucha": a lucha libre match card come alive, Arya against El Queso, three falls. */
export function Lucha(props: LuchaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const tagIn = props.rounds[2].payoff.at;
  const countAt = props.count[0].at;
  const hits = [
    { at: 0, strength: 1.4 },
    ...props.rounds.flatMap((round) => [
      { at: round.at, strength: 0.8 },
      { at: round.payoff.at, strength: 1 },
    ]),
    ...props.count.map((line) => ({ at: line.at, strength: 1.8 })),
    { at: props.winner.at, strength: 2.2 },
  ];
  const shake = hits.reduce(
    (offset, hit) => offset + jolt(frame - sec(hit.at), hit.strength),
    0,
  );
  const titles = [
    { from: 0, node: <HookTitle {...props.hook} /> },
    ...props.rounds.map((round) => ({ from: round.at, node: <RoundTitle text={round.title} /> })),
  ];

  return (
    <ShortFrame background={NIGHT} music={props.music} duckAt={props.cta.from} sfx={props.sfx}>
      <Sunburst />
      <RingApron />

      <AbsoluteFill style={{ translate: `${shake * 0.7}px ${shake}px` }}>
        <TitleStrip titles={titles} until={props.banner.at} />
        <Ring
          photo={props.photo}
          queso={props.queso}
          pinnedAt={countAt}
          winnerAt={props.winner.at}
        />
        <TagPartner src={props.jamon} at={tagIn} pinnedAt={countAt} />
        <Plates {...props.plates} />

        {props.rounds.map((round, index) => (
          <RoundLines
            key={round.title}
            round={round}
            until={index < props.rounds.length - 1 ? props.rounds[index + 1].at : countAt}
          />
        ))}

        <RefereeCount count={props.count} until={props.winner.at} />
        <WinnerStamp text={props.winner.text} at={props.winner.at} until={props.banner.at} />
      </AbsoluteFill>

      <Flash at={props.count[props.count.length - 1].at} />
      <Flash at={props.winner.at} />
      <Confetti at={props.winner.at} />

      <NotificationBanner banner={props.banner} from={sec(props.banner.at)} exitAt={sec(props.cta.from)} />
      <Rematch line={props.rematch} />

      <EndCard cta={{ ...props.cta, note: "" }} />
      <CtaNote text={props.cta.note} from={sec(props.cta.revealAt.note)} />
    </ShortFrame>
  );
}

/** A decaying knock, in px, `since` frames after a hit; `strength` scales it. */
function jolt(since: number, strength = 1): number {
  if (since < 0 || since > 14) {
    return 0;
  }

  return Math.sin(since * 2.1) * 9 * strength * Math.exp(-since / 3.2);
}

/** Poster rays turning slowly behind the card, with a halftone wash on top. */
function Sunburst() {
  const frame = useCurrentFrame();

  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `repeating-conic-gradient(from ${frame * 0.25}deg at 50% 38%, ${NIGHT_RAY} 0deg 9deg, ${NIGHT} 9deg 18deg)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `radial-gradient(${MAGENTA} 2.4px, transparent 2.8px)`,
          backgroundSize: "26px 26px",
          opacity: 0.14,
          maskImage: "linear-gradient(180deg, transparent 0%, black 45%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
}

/** The ring's ropes and apron, decoration only, under the platform UI. */
function RingApron() {
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }} aria-hidden>
      <rect x="0" y="1560" width="1080" height="360" fill="#160E28" />
      {[
        { y: 1528, color: MAGENTA },
        { y: 1584, color: CREAM },
        { y: 1640, color: TEAL },
      ].map((rope) => (
        <rect key={rope.y} x="0" y={rope.y} width="1080" height="14" rx="7" fill={rope.color} opacity="0.9" />
      ))}
      {[60, 1020].map((x) => (
        <rect key={x} x={x - 22} y="1500" width="44" height="200" rx="10" fill={MUSTARD} />
      ))}
    </svg>
  );
}

interface TitleEntry {
  from: number;
  node: ReactNode;
}

/** One title at a time: each slams in from the left and pushes the last one out right. */
function TitleStrip({ titles, until }: { titles: TitleEntry[]; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const exit = ramp(frame, sec(until) - 4, sec(until) + 4);

  return (
    <div style={{ position: "absolute", left: 0, top: TITLE.top, width: 1080, height: TITLE.height, opacity: 1 - exit }}>
      {titles.map((title, index) => {
        const start = sec(title.from);
        const next = index < titles.length - 1 ? sec(titles[index + 1].from) : sec(until) + 1000;

        if (frame < start - 5 || frame > next + 5) {
          return null;
        }

        const enter = index === 0 ? 1 : ramp(frame, start - 5, start);
        const leave = ramp(frame, next - 4, next + 4, Easing.in(Easing.quad));
        const slam = index === 0 ? interpolate(frame, [0, 6], [1.25, 1], { extrapolateRight: "clamp" }) : 1;

        return (
          <div
            key={title.from}
            style={{
              position: "absolute",
              inset: 0,
              translate: `${(1 - enter) * -1100 + leave * 1100}px 0px`,
              scale: String(slam),
            }}
          >
            {title.node}
          </div>
        );
      })}
    </div>
  );
}

function HookTitle({ headline, sub }: { headline: string; sub: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        width: CARD.width,
        top: 0,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <div
        style={{
          fontFamily: anton,
          fontSize: 108,
          lineHeight: 1.02,
          color: MUSTARD,
          letterSpacing: "0.01em",
          textShadow: `6px 6px 0 ${MAGENTA}, 0 10px 24px rgba(0, 0, 0, 0.45)`,
        }}
      >
        {headline}
      </div>
      <div
        style={{
          marginTop: 4,
          fontFamily: POPPINS,
          fontWeight: 800,
          fontSize: 50,
          lineHeight: 1.1,
          color: CREAM,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function RoundTitle({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left + 60,
        width: CARD.width - 120,
        top: 4,
        height: 176,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        paddingTop: 30,
        backgroundColor: MAGENTA,
        border: `6px solid ${CREAM}`,
        boxSizing: "border-box",
        transform: "skewX(-10deg)",
        boxShadow: `10px 10px 0 ${OUTLINE}`,
      }}
    >
      <div
        style={{
          transform: "skewX(10deg)",
          fontFamily: anton,
          fontSize: 122,
          lineHeight: 1,
          color: CREAM,
          letterSpacing: "0.03em",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Both corners slide in from frame −5, so frame 0 already shows the match card in motion. */
function Ring({
  photo,
  queso,
  pinnedAt,
  winnerAt,
}: {
  photo: string;
  queso: string;
  pinnedAt: number;
  winnerAt: number;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { fps } = useVideoConfig();
  const slide = spring({ frame: frame + 5, fps, config: { damping: 14, stiffness: 170 } });
  const vs = spring({ frame: frame + 4, fps, config: { damping: 9, stiffness: 200 } });
  const push = interpolate(frame, [0, sec(pinnedAt)], [1, 1.07], { extrapolateRight: "clamp" });
  const pinned = ramp(frame, sec(pinnedAt) - 4, sec(pinnedAt) + 2);
  const lean = pinned * (1 - ramp(frame, sec(winnerAt) + 30, sec(winnerAt) + 50));
  const leftX = (1 - slide) * -640;
  const rightX = (1 - slide) * 640 - lean * 36;
  const eyeX = (EYES[0].cx + EYES[1].cx) / 2;
  const eyeY = (EYES[0].cy + EYES[1].cy) / 2;

  return (
    <svg
      width={1080}
      height={RING.height}
      viewBox={`0 0 1080 ${RING.height}`}
      style={{ position: "absolute", left: 0, top: RING.top, overflow: "visible" }}
      aria-hidden
    >
      <defs>
        <clipPath id="lucha-left">
          <polygon points={LEFT_CORNER} />
        </clipPath>
        <clipPath id="lucha-right">
          <polygon points={RIGHT_CORNER} />
        </clipPath>
        <pattern id="lucha-dots" width="22" height="22" patternUnits="userSpaceOnUse">
          <circle cx="11" cy="11" r="4" fill="#2C8C8C" />
        </pattern>
      </defs>

      <g transform={`translate(${leftX} ${lean * 14}) rotate(${lean * -2.5} 270 310)`}>
        <polygon points={LEFT_CORNER} fill={OUTLINE} transform="translate(12 12)" />
        <g clipPath="url(#lucha-left)">
          <g
            transform={`translate(${PHOTO.x + eyeX} ${PHOTO.y + eyeY}) scale(${push}) translate(${-eyeX} ${-eyeY})`}
          >
            <image href={staticFile(photo)} width={PHOTO.width} height={PHOTO.height} />
            <LuchaMask />
          </g>
          <rect width="1080" height={RING.height} fill={OUTLINE} opacity={pinned * 0.18} />
        </g>
        <polygon points={LEFT_CORNER} fill="none" stroke={CREAM} strokeWidth="10" strokeLinejoin="round" />
      </g>

      <g transform={`translate(${rightX} 0)`}>
        <polygon points={RIGHT_CORNER} fill={OUTLINE} transform="translate(12 12)" />
        <g clipPath="url(#lucha-right)">
          <rect x="500" width="580" height={RING.height} fill={TEAL} />
          <rect x="500" width="580" height={RING.height} fill="url(#lucha-dots)" opacity="0.55" />
          <image href={staticFile(queso)} x="560" y="112" width="480" height="434" />
        </g>
        <polygon points={RIGHT_CORNER} fill="none" stroke={CREAM} strokeWidth="10" strokeLinejoin="round" />
      </g>

      <g transform={`translate(${VS.x} ${VS.y}) scale(${vs}) rotate(-8)`}>
        <circle r={VS.r + 10} fill={OUTLINE} transform="translate(8 8)" />
        <circle r={VS.r} fill={MUSTARD} stroke={CREAM} strokeWidth="9" />
        <text
          textAnchor="middle"
          dominantBaseline="central"
          y="4"
          fontFamily={anton}
          fontSize="104"
          fill={MAGENTA}
        >
          VS
        </text>
      </g>
    </svg>
  );
}

/**
 * A drawn luchador mask in the mugshot's own pixel space: forehead crest and
 * flames, with wide eye openings so her eyes stay fully visible.
 */
function LuchaMask() {
  const [left, right] = EYES;
  const hole = { rx: 60, ry: 50 };

  return (
    <g>
      <defs>
        <mask id="lucha-eyeholes" maskUnits="userSpaceOnUse" x="0" y="0" width="640" height="755">
          <rect width="640" height="755" fill="white" />
          <ellipse cx={left.cx} cy={left.cy} rx={hole.rx} ry={hole.ry} fill="black" transform={`rotate(-8 ${left.cx} ${left.cy})`} />
          <ellipse cx={right.cx} cy={right.cy} rx={hole.rx} ry={hole.ry} fill="black" transform={`rotate(8 ${right.cx} ${right.cy})`} />
        </mask>
      </defs>
      <g mask="url(#lucha-eyeholes)" opacity="0.94">
        <path
          d="M150 262 C118 222 128 176 166 150 C210 120 268 108 330 106 C396 106 456 118 494 146 C532 176 540 220 512 258 C490 286 452 300 412 292 C378 286 356 270 334 268 C310 270 288 290 252 298 C210 306 172 292 150 262 Z"
          fill={TEAL}
          stroke={OUTLINE}
          strokeWidth="5"
        />
        <path d="M150 262 C126 236 112 214 104 188 C132 200 146 214 158 228 Z" fill={MAGENTA} stroke={OUTLINE} strokeWidth="4" />
        <path d="M512 258 C536 234 548 210 556 182 C528 196 512 210 500 226 Z" fill={MAGENTA} stroke={OUTLINE} strokeWidth="4" />
        <path d="M332 108 C312 134 304 160 310 196 L332 230 L354 196 C360 160 352 134 332 108 Z" fill={MUSTARD} stroke={OUTLINE} strokeWidth="4" />
        <path d="M186 158 C214 140 250 132 282 134 C252 146 226 160 206 180 Z" fill={MUSTARD} opacity="0.9" />
        <path d="M478 154 C450 138 414 130 382 132 C412 144 438 158 458 178 Z" fill={MUSTARD} opacity="0.9" />
      </g>
      {[left, right].map((eye, index) => (
        <ellipse
          key={eye.cx}
          cx={eye.cx}
          cy={eye.cy}
          rx={hole.rx + 4}
          ry={hole.ry + 4}
          fill="none"
          stroke={CREAM}
          strokeWidth="7"
          transform={`rotate(${index === 0 ? -8 : 8} ${eye.cx} ${eye.cy})`}
        />
      ))}
      <g transform="translate(332 150) scale(0.42) translate(-50 -50)">
        <PawGlyph />
      </g>
    </g>
  );
}

function PawGlyph() {
  return (
    <g fill={CREAM} stroke={OUTLINE} strokeWidth="4">
      <ellipse cx="50" cy="68" rx="25" ry="21" />
      <ellipse cx="19" cy="46" rx="10.5" ry="14" transform="rotate(-20 19 46)" />
      <ellipse cx="39" cy="26" rx="10.5" ry="15" transform="rotate(-6 39 26)" />
      <ellipse cx="62" cy="26" rx="10.5" ry="15" transform="rotate(6 62 26)" />
      <ellipse cx="81" cy="46" rx="10.5" ry="14" transform="rotate(20 81 46)" />
    </g>
  );
}

/** El Jamón jumps the ropes into El Queso's corner on the third fall. */
function TagPartner({ src, at, pinnedAt }: { src: string; at: number; pinnedAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { fps } = useVideoConfig();
  const local = frame - sec(at) + 6;

  if (local < 0) {
    return null;
  }

  const jump = spring({ frame: local, fps, config: { damping: 11, stiffness: 160 } });
  const lean = ramp(frame, sec(pinnedAt) - 4, sec(pinnedAt) + 2);
  const hop = Math.sin(Math.min(local / 10, 1) * Math.PI) * -120;

  return (
    <Img
      src={staticFile(src)}
      style={{
        position: "absolute",
        left: 690 + (1 - jump) * 520 - lean * 60,
        top: RING.top + 340 + hop,
        width: 330,
        height: 307,
        rotate: `${interpolate(jump, [0, 1], [28, -6]) - lean * 6}deg`,
        filter: "drop-shadow(8px 10px 0 rgba(20, 12, 36, 0.85))",
      }}
    />
  );
}

/** Name plates under each corner. */
function Plates({ left, right }: { left: string; right: string }) {
  const frame = useCurrentFrame();
  const plate = (delay: number) => ramp(frame, delay - 6, delay + 2);

  return (
    <>
      <Plate text={left} left={36} width={476} color={MUSTARD} ink={OUTLINE} show={plate(0)} fontSize={60} />
      <Plate text={right} left={560} width={380} color={MAGENTA} ink={CREAM} show={plate(3)} fontSize={84} />
    </>
  );
}

function Plate({
  text,
  left,
  width,
  color,
  ink,
  show,
  fontSize,
}: {
  text: string;
  left: number;
  width: number;
  color: string;
  ink: string;
  show: number;
  fontSize: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left,
        width,
        top: PLATES.top,
        height: PLATES.height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: color,
        border: `6px solid ${CREAM}`,
        boxSizing: "border-box",
        transform: `skewX(-8deg) translateY(${(1 - show) * 260}px)`,
        boxShadow: `8px 8px 0 ${OUTLINE}`,
      }}
    >
      <div
        style={{
          transform: "skewX(8deg)",
          fontFamily: anton,
          fontSize,
          lineHeight: 0.98,
          textAlign: "center",
          color: ink,
          whiteSpace: "pre-line",
          letterSpacing: "0.02em",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** A round's move, then its payoff stamped underneath; both clear before the next fall. */
function RoundLines({ round, until }: { round: Round; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const end = sec(until);

  if (frame < sec(round.move.at) - 2 || frame >= end) {
    return null;
  }

  const exit = ramp(frame, end - 4, end);
  const moveIn = ramp(frame, sec(round.move.at) - 2, sec(round.move.at) + 4);
  const payoffAt = sec(round.payoff.at);
  const payoffIn = ramp(frame, payoffAt - 3, payoffAt, Easing.in(Easing.quad));

  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - exit }}>
      <div
        style={{
          position: "absolute",
          left: CARD.left,
          width: CARD.width,
          top: CARD.top,
          textAlign: "center",
          fontFamily: POPPINS,
          fontWeight: 800,
          fontSize: 64,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          color: CREAM,
          textShadow: "0 6px 18px rgba(0, 0, 0, 0.5)",
          opacity: moveIn,
          translate: `0px ${(1 - moveIn) * 40}px`,
        }}
      >
        {round.move.text}
      </div>
      {frame >= payoffAt - 3 ? (
        <div
          style={{
            position: "absolute",
            top: CARD.top + 140,
            left: TEXT_CENTER - 360,
            width: 720,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 18,
              padding: "14px 38px 16px",
              backgroundColor: MUSTARD,
              border: `6px solid ${CREAM}`,
              borderRadius: 999,
              boxShadow: `8px 8px 0 ${OUTLINE}`,
              fontFamily: anton,
              fontSize: 76,
              lineHeight: 1,
              letterSpacing: "0.02em",
              color: OUTLINE,
              rotate: "-3deg",
              scale: String(interpolate(payoffIn, [0, 1], [1.9, 1])),
              opacity: payoffIn,
            }}
          >
            {round.payoff.text}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** The referee slaps the mat: one big number per count, each knocking the last away. */
function RefereeCount({ count, until }: { count: Line[]; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const end = sec(until);

  return (
    <>
      {count.map((line, index) => {
        const at = sec(line.at);
        const next = index < count.length - 1 ? sec(count[index + 1].at) : end;

        if (frame < at - 2 || frame >= next) {
          return null;
        }

        const slam = ramp(frame, at - 2, at + 1, Easing.in(Easing.quad));

        return (
          <div
            key={line.text}
            style={{
              position: "absolute",
              left: TEXT_CENTER - 400,
              width: 800,
              top: RING.top + 40,
              height: 700,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: anton,
              fontSize: 470,
              lineHeight: 1,
              color: CREAM,
              WebkitTextStroke: `16px ${OUTLINE}`,
              paintOrder: "stroke fill",
              textShadow: `14px 14px 0 ${MAGENTA}`,
              rotate: `${index % 2 === 0 ? -6 : 5}deg`,
              scale: String(interpolate(slam, [0, 1], [2.2, 1])),
              opacity: slam,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </>
  );
}

function WinnerStamp({ text, at, until }: { text: string; at: number; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(at);

  if (frame < start - 4) {
    return null;
  }

  const press = ramp(frame, start - 4, start, Easing.in(Easing.quad));
  const settle = interpolate(frame, [start, start + 2, start + 6], [1, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exit = ramp(frame, sec(until) - 6, sec(until) + 2);

  return (
    <div
      style={{
        position: "absolute",
        left: TEXT_CENTER - 430,
        width: 860,
        top: RING.top + 200,
        display: "flex",
        justifyContent: "center",
        rotate: "-6deg",
        scale: String(interpolate(press, [0, 1], [2.4, 1]) * settle * (1 - exit * 0.3)),
        opacity: press * (1 - exit),
      }}
    >
      <div
        style={{
          padding: "18px 40px 24px",
          backgroundColor: MUSTARD,
          border: `10px solid ${CREAM}`,
          boxShadow: `14px 14px 0 ${MAGENTA}`,
          fontFamily: anton,
          fontSize: 132,
          lineHeight: 1,
          letterSpacing: "0.02em",
          color: OUTLINE,
          whiteSpace: "nowrap",
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Flash({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const start = useSeconds()(at);

  if (frame < start || frame > start + 6) {
    return null;
  }

  return <AbsoluteFill style={{ backgroundColor: CREAM, opacity: 0.55 * (1 - ramp(frame, start, start + 6)) }} />;
}

const CONFETTI_COLORS = [MAGENTA, MUSTARD, TEAL, CREAM, "#F5BEA3"];

/** A burst of paper confetti from the top edge on the win. */
function Confetti({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const start = useSeconds()(at);
  const t = (frame - start) / fps;

  if (t < 0 || t > 3.2) {
    return null;
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Array.from({ length: 80 }, (_, index) => {
        const seed = `lucha-confetti-${index}`;
        const x0 = random(`${seed}-x`) * 1080;
        const vx = (random(`${seed}-vx`) - 0.5) * 520;
        const vy = 300 + random(`${seed}-vy`) * 900;
        const delay = random(`${seed}-d`) * 0.25;
        const local = Math.max(t - delay, 0);
        const x = x0 + vx * local + Math.sin(local * 6 + index) * 30;
        const y = -60 + vy * local + 620 * local * local;
        const spin = random(`${seed}-s`) * 720 * local + index * 37;
        const width = 16 + random(`${seed}-w`) * 14;

        return (
          <div
            key={seed}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width,
              height: width * 0.55,
              backgroundColor: CONFETTI_COLORS[index % CONFETTI_COLORS.length],
              rotate: `${spin}deg`,
              scale: `1 ${Math.cos(local * 9 + index)}`,
              opacity: t < delay ? 0 : 1,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
}

/**
 * The app's real dose reminder (arya-tracker `notifications.medicationTimeForPet`),
 * iOS style like se-busca's banner, kept left of the TikTok buttons.
 */
function NotificationBanner({ banner, from, exitAt }: { banner: Banner; from: number; exitAt: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from + 7;

  if (local < 0 || frame > exitAt + 8) {
    return null;
  }

  const drop = spring({ frame: local, fps, config: { damping: 10, stiffness: 150, mass: 0.8 } });
  const exit = ramp(frame, exitAt - 2, exitAt + 6);
  const pt = (value: number) => value * 2.7;

  return (
    <div
      style={{
        position: "absolute",
        left: 40,
        top: 250,
        width: 900,
        display: "flex",
        gap: pt(10),
        alignItems: "center",
        padding: `${pt(12)}px ${pt(14)}px`,
        borderRadius: pt(24),
        boxSizing: "border-box",
        background: "rgba(246, 246, 246, 0.97)",
        boxShadow: `0 ${pt(10)}px ${pt(36)}px rgba(0, 0, 0, 0.45)`,
        fontFamily: "-apple-system, 'SF Pro Text', 'Inter', sans-serif",
        color: "#111111",
        opacity: 1 - exit,
        translate: `0px ${(1 - drop) * -520}px`,
        scale: String(1 + (1 - drop) * 0.1),
      }}
    >
      <Img src={staticFile(banner.icon)} style={{ flex: "none", width: pt(38), height: pt(38), borderRadius: pt(9) }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: pt(8) }}>
          <span style={{ fontSize: pt(15), lineHeight: 1.3, fontWeight: 600 }}>{banner.title}</span>
          <span style={{ flex: "none", fontSize: pt(13), color: "#7A7F7E" }}>{banner.time}</span>
        </div>
        <div style={{ fontSize: pt(15), lineHeight: 1.3 }}>{banner.body}</div>
      </div>
    </div>
  );
}

/** The closing line in the card zone, under the corners, once the reminder lands. */
function Rematch({ line }: { line: Line }) {
  const frame = useCurrentFrame();
  const start = useSeconds()(line.at);

  if (frame < start - 3) {
    return null;
  }

  const press = ramp(frame, start - 3, start + 3);

  return (
    <div
      style={{
        position: "absolute",
        left: CARD.left,
        width: CARD.width,
        top: CARD.top + 16,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 18,
        opacity: press,
        translate: `0px ${(1 - press) * 50}px`,
      }}
    >
      <PawPrint size={70} color={MUSTARD} />
      <div
        style={{
          textAlign: "center",
          fontFamily: POPPINS,
          fontWeight: 800,
          fontSize: 66,
          lineHeight: 1.12,
          letterSpacing: "-0.01em",
          color: CREAM,
          whiteSpace: "pre-line",
          textShadow: "0 6px 18px rgba(0, 0, 0, 0.5)",
        }}
      >
        {line.text}
      </div>
    </div>
  );
}

/**
 * The shared end card sets its note on one line above the pill; the Spanish
 * note needs two, so it is drawn here between the name and the pill, as in
 * se-busca.
 */
function CtaNote({ text, from }: { text: string; from: number }) {
  const frame = useCurrentFrame();

  return (
    <div
      style={{
        position: "absolute",
        top: 972,
        left: 72,
        width: 936,
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
