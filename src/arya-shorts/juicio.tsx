import { loadFont as loadPlayfair } from "@remotion/google-fonts/PlayfairDisplay";
import { Video } from "@remotion/media";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  random,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { CtaScene } from "../template/scenes/cta-scene";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, CORAL, POPPINS, ramp, ShortFrame, TEAL, useSeconds } from "./shared";

/** Courtroom serif for the headers and the verdict stamp. Exported so the call stays. */
export const { fontFamily: playfair } = loadPlayfair("normal", {
  weights: ["900"],
  subsets: ["latin", "latin-ext"],
});

const WOOD = "#3A2317";
const WOOD_DARK = "#24150D";
const WOOD_LIGHT = "#5A3826";
const GOLD = "#E9B949";
const CREAM = "#FFF8EF";
const INK = "#1E120B";
const GUILTY = "#D9442B";
const MARKER = "#F2C230";

/**
 * Canvas zones. Copy stays between rows 236 and 1470 and left of x 940, clear
 * of TikTok's caption block and side buttons.
 */
const HEADER = { top: 236, height: 160 };
const DOCK = { centerX: 500, photoTop: 444, photoWidth: 540, railTop: 1000, railHeight: 150 };
const CAPTION_TOP = 1222;
const BUTTONS = { top: 1342, height: 116, width: 384, gap: 32 };
const PRINT = { centerX: 510, top: 446, imageWidth: 580, imageHeight: 680, border: 26 };

/** Mugshot source size; the dock scales it to `DOCK.photoWidth`. */
const MUGSHOT = { width: 640, height: 755 };
const PHOTO_HEIGHT = (DOCK.photoWidth / MUGSHOT.width) * MUGSHOT.height;

/** Gavel geometry in canvas px: it pivots on its handle end at the right edge. */
const GAVEL = { pivotX: 1062, pivotY: 880, reach: 240, raised: 34 };

interface Line {
  text: string;
  at: number;
}

interface Header extends Line {
  /** Font size in px, tuned per header so each fits on one line. */
  size: number;
}

interface Media {
  src: string;
  kind: "image" | "video";
  /** Source size in px. */
  width: number;
  height: number;
  /** Source window shown in the print: left/top edge and width, in source px. */
  focus: { x: number; y: number; width: number };
  /** Optional red circle drawn on the print, in source px. */
  mark?: { x: number; y: number; r: number; at: number };
}

interface Evidence extends Line {
  /** Letter on the yellow evidence marker. */
  letter: string;
  media: Media;
}

export type JuicioProps = {
  photo: string;
  plate: string;
  headers: Header[];
  caseLine: Line;
  evidence: Evidence[];
  jury: { question: Line; guilty: string; innocent: string; timerFrom: number; timerEnd: number };
  verdict: { stamp: string; at: number; line: Line };
  question: Line;
  /** Seconds the gavel lands; also the screen knocks. */
  strikes: number[];
  cta: PosDemoProps["cta"] & { question?: Line };
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/**
 * "El juicio": La Escupe-Pastillas stands trial. The gavel is already
 * swinging on frame 0, three pieces of evidence are shown, the viewer is the
 * jury against a 3 s timer, and the verdict lands with the gavel.
 */
export function Juicio(props: JuicioProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const firstEvidence = props.evidence[0].at;
  const juryAt = props.jury.question.at;
  const shake = props.strikes.reduce(
    (offset, at, index) =>
      offset + jolt(frame - sec(at), index === props.strikes.length - 1 ? 1.8 : 0.9),
    0,
  );
  const dockIn = 1 - ramp(frame, sec(firstEvidence) - 8, sec(firstEvidence)) + ramp(frame, sec(juryAt) - 1, sec(juryAt) + 8);
  const isVoting = frame >= sec(juryAt) - 6;
  const captions = [
    props.caseLine,
    ...props.evidence,
    props.jury.question,
    props.verdict.line,
    props.question,
  ];

  return (
    <ShortFrame background={WOOD} music={props.music} duckAt={props.cta.from} sfx={props.sfx}>
      <Courtroom />

      <AbsoluteFill style={{ translate: `${shake * 0.6}px ${shake}px` }}>
        <Headers headers={props.headers} until={props.cta.from} />
        <Dock photo={props.photo} plate={props.plate} show={dockIn} />
        {props.evidence.map((item, index) => (
          <EvidencePrint
            key={item.letter}
            evidence={item}
            exitAt={index < props.evidence.length - 1 ? props.evidence[index + 1].at : juryAt}
          />
        ))}
        <Timer from={props.jury.timerFrom} end={props.jury.timerEnd} />
        <Hearts from={props.verdict.line.at} until={props.question.at} />
        <VerdictStamp text={props.verdict.stamp} at={props.verdict.at} />
        <Gavel strikes={props.strikes} />
        <Captions lines={captions} until={props.cta.from} />
        {isVoting ? (
          <VoteButtons
            guilty={props.jury.guilty}
            innocent={props.jury.innocent}
            from={juryAt}
            verdictAt={props.verdict.at}
            reopenAt={props.question.at}
          />
        ) : null}
      </AbsoluteFill>

      <Flash at={props.strikes[0]} />
      <Flash at={props.verdict.at} />

      <Sequence name="CTA" from={sec(props.cta.from)}>
        <TwoLineNoteEndCard cta={props.cta} />
      </Sequence>
    </ShortFrame>
  );
}

/** A decaying knock, in px, `since` frames after a hit; `strength` scales it. */
function jolt(since: number, strength = 1): number {
  if (since < 0 || since > 14) {
    return 0;
  }

  return Math.sin(since * 2.1) * 8 * strength * Math.exp(-since / 3.2);
}

/** Walnut wall panels, a warm pool of light and the judge's bench along the bottom. */
function Courtroom() {
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: `repeating-linear-gradient(90deg, ${WOOD} 0px 174px, ${WOOD_DARK} 174px 180px)`,
        }}
      />
      <AbsoluteFill
        style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent 0px 9px, rgba(255, 220, 180, 0.035) 9px 11px, transparent 11px 23px)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse 70% 45% at 48% 42%, rgba(255, 205, 140, 0.22), transparent 70%)",
        }}
      />
      <div style={{ position: "absolute", left: 0, top: 1536, width: 1080, height: 384, backgroundColor: WOOD_DARK }} />
      <div style={{ position: "absolute", left: 0, top: 1536, width: 1080, height: 12, backgroundColor: GOLD, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, top: 1560, width: 1080, height: 360, background: `repeating-linear-gradient(90deg, ${WOOD_LIGHT} 0px 262px, ${WOOD_DARK} 262px 270px)`, opacity: 0.55 }} />
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 85% 70% at 50% 45%, transparent 55%, rgba(10, 5, 2, 0.55))" }} />
    </AbsoluteFill>
  );
}

/** One header at a time; frame 0 slams in already moving, later ones drop in. */
function Headers({ headers, until }: { headers: Header[]; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <>
      {headers.map((header, index) => {
        const start = sec(header.at);
        const next = index < headers.length - 1 ? sec(headers[index + 1].at) : sec(until);

        if (frame < start || frame >= next) {
          return null;
        }

        const enter = index === 0 ? 1 : ramp(frame, start, start + 6);
        const leave = ramp(frame, next - 5, next, Easing.in(Easing.quad));
        const slam = index === 0 ? interpolate(frame, [0, 7], [1.1, 1], { extrapolateRight: "clamp", easing: Easing.out(Easing.quad) }) : 1;

        return (
          <div
            key={header.at}
            style={{
              position: "absolute",
              top: HEADER.top,
              height: HEADER.height,
              left: 40,
              width: 900,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              opacity: enter * (1 - leave),
              translate: `0px ${(1 - enter) * -40 + leave * 30}px`,
              scale: String(slam),
            }}
          >
            <div
              style={{
                fontFamily: playfair,
                fontWeight: 900,
                fontSize: header.size,
                lineHeight: 1,
                letterSpacing: "0.02em",
                color: CREAM,
                whiteSpace: "nowrap",
                textShadow: `0 5px 0 ${WOOD_DARK}, 0 12px 28px rgba(0, 0, 0, 0.5)`,
              }}
            >
              {header.text}
            </div>
            <div style={{ marginTop: 18, width: 300 * enter, height: 8, borderRadius: 4, backgroundColor: GOLD }} />
          </div>
        );
      })}
    </>
  );
}

/** Arya's mugshot standing in the dock behind its rail and name plate. */
function Dock({ photo, plate, show }: { photo: string; plate: string; show: number }) {
  const left = DOCK.centerX - DOCK.photoWidth / 2;
  const railWidth = 720;

  if (show <= 0) {
    return null;
  }

  return (
    <div style={{ position: "absolute", inset: 0, opacity: show, translate: `0px ${(1 - show) * 380}px` }}>
      <div
        style={{
          position: "absolute",
          left: left - 14,
          top: DOCK.photoTop - 14,
          width: DOCK.photoWidth + 28,
          height: PHOTO_HEIGHT + 28,
          backgroundColor: GOLD,
          borderRadius: 10,
          boxShadow: "0 24px 50px rgba(0, 0, 0, 0.5)",
        }}
      />
      <Img
        src={staticFile(photo)}
        style={{ position: "absolute", left, top: DOCK.photoTop, width: DOCK.photoWidth, height: PHOTO_HEIGHT, borderRadius: 4 }}
      />
      <div
        style={{
          position: "absolute",
          left: DOCK.centerX - railWidth / 2,
          top: DOCK.railTop,
          width: railWidth,
          height: DOCK.railHeight,
          background: `linear-gradient(180deg, ${WOOD_LIGHT}, ${WOOD} 60%, ${WOOD_DARK})`,
          borderTop: `14px solid ${GOLD}`,
          borderRadius: "8px 8px 0 0",
          boxSizing: "border-box",
          boxShadow: "0 -10px 30px rgba(0, 0, 0, 0.45)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: "10px 34px 12px",
            backgroundColor: GOLD,
            border: `4px solid ${WOOD_DARK}`,
            borderRadius: 8,
            fontFamily: POPPINS,
            fontWeight: 800,
            fontSize: 46,
            lineHeight: 1,
            letterSpacing: "0.04em",
            color: INK,
          }}
        >
          {plate}
        </div>
      </div>
    </div>
  );
}

/** A print of one piece of evidence that slides in from the right and leaves to the left. */
function EvidencePrint({ evidence, exitAt }: { evidence: Evidence; exitAt: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(evidence.at);
  const end = sec(exitAt);

  if (frame < start - 9 || frame >= end + 2) {
    return null;
  }

  const enter = ramp(frame, start - 9, start);
  const leave = ramp(frame, end - 8, end + 1, Easing.in(Easing.quad));
  const tilt = evidence.letter.charCodeAt(0) % 2 === 0 ? 2.5 : -2.5;
  const { media } = evidence;
  const scale = PRINT.imageWidth / media.focus.width;
  const printWidth = PRINT.imageWidth + PRINT.border * 2;
  const printHeight = PRINT.imageHeight + PRINT.border * 2;
  const drift = interpolate(frame, [start, end], [1, 1.02], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const mediaStyle = {
    position: "absolute",
    left: -media.focus.x * scale,
    top: -media.focus.y * scale,
    width: media.width * scale,
    height: media.height * scale,
    maxWidth: "none",
  } as const;

  return (
    <div
      style={{
        position: "absolute",
        left: PRINT.centerX - printWidth / 2,
        top: PRINT.top,
        width: printWidth,
        height: printHeight,
        translate: `${(1 - enter) * 1000 - leave * 1150}px 0px`,
        rotate: `${tilt + (1 - enter) * 12 - leave * 10}deg`,
        scale: String(drift),
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: CREAM,
          borderRadius: 6,
          boxShadow: "0 28px 60px rgba(0, 0, 0, 0.55)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: PRINT.border,
          top: PRINT.border,
          width: PRINT.imageWidth,
          height: PRINT.imageHeight,
          overflow: "hidden",
          backgroundColor: INK,
        }}
      >
        {media.kind === "video" ? (
          <Sequence from={start - 9} layout="none">
            <Video src={staticFile(media.src)} muted style={mediaStyle} />
          </Sequence>
        ) : (
          <Img src={staticFile(media.src)} style={mediaStyle} />
        )}
        {media.mark ? <Mark mark={media.mark} scale={scale} focus={media.focus} /> : null}
      </div>
      <EvidenceMarker letter={evidence.letter} />
    </div>
  );
}

/** A red marker circle drawn around a detail of the print. */
function Mark({ mark, scale, focus }: { mark: NonNullable<Media["mark"]>; scale: number; focus: Media["focus"] }) {
  const frame = useCurrentFrame();
  const start = useSeconds()(mark.at);
  const draw = ramp(frame, start, start + 9, Easing.out(Easing.quad));

  if (frame < start) {
    return null;
  }

  const cx = (mark.x - focus.x) * scale;
  const cy = (mark.y - focus.y) * scale;
  const r = mark.r * scale;
  const circumference = 2 * Math.PI * r;

  return (
    <svg
      width={PRINT.imageWidth}
      height={PRINT.imageHeight}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={GUILTY}
        strokeWidth={10}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - draw)}
        transform={`rotate(-100 ${cx} ${cy})`}
        style={{ filter: "drop-shadow(0 3px 6px rgba(0, 0, 0, 0.45))" }}
      />
    </svg>
  );
}

/** The yellow crime-scene tent with the evidence letter, on the print's bottom-left corner. */
function EvidenceMarker({ letter }: { letter: string }) {
  return (
    <svg
      width={150}
      height={140}
      viewBox="0 0 150 140"
      style={{ position: "absolute", left: -34, bottom: -14, rotate: "-6deg", overflow: "visible" }}
      aria-hidden
    >
      <polygon points="18,132 46,8 104,8 132,132" fill={INK} transform="translate(6 6)" opacity="0.5" />
      <polygon points="18,132 46,8 104,8 132,132" fill={MARKER} stroke={INK} strokeWidth="5" strokeLinejoin="round" />
      <text x="75" y="94" textAnchor="middle" fontFamily={POPPINS} fontWeight={800} fontSize="78" fill={INK}>
        {letter}
      </text>
    </svg>
  );
}

/** A 3 s countdown ring over the mugshot's top-right corner. */
function Timer({ from, end }: { from: number; end: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(from);
  const stop = sec(end);

  if (frame < start || frame >= stop + 6) {
    return null;
  }

  const size = 168;
  const stroke = 16;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = interpolate(frame, [start, stop], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const digit = Math.min(Math.round((stop - start) / sec(1)), Math.max(1, Math.ceil((stop - frame) / sec(1))));
  const sinceDigit = (frame - start) % sec(1);
  const pulse = interpolate(sinceDigit, [0, 4, 9], [1.12, 1.12, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const show = ramp(frame, start, start + 7) * (1 - ramp(frame, stop, stop + 6));

  return (
    <div
      style={{
        position: "absolute",
        left: 796 - size / 2,
        top: 500 - size / 2,
        width: size,
        height: size,
        borderRadius: "50%",
        backgroundColor: CREAM,
        boxShadow: "0 14px 30px rgba(0, 0, 0, 0.45)",
        opacity: show,
        scale: String(pulse * show),
      }}
    >
      <svg width={size} height={size} style={{ position: "absolute", rotate: "-90deg" }} aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#EADFCC" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={GUILTY}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * progress}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: playfair,
          fontWeight: 900,
          fontSize: 92,
          lineHeight: 1,
          color: INK,
        }}
      >
        {frame >= stop ? 0 : digit}
      </div>
    </div>
  );
}

/** The verdict stamp slammed over the mugshot, as the gavel lands. */
function VerdictStamp({ text, at }: { text: string; at: number }) {
  const frame = useCurrentFrame();
  const start = useSeconds()(at);

  if (frame < start - 3) {
    return null;
  }

  const press = ramp(frame, start - 3, start, Easing.in(Easing.quad));
  const settle = interpolate(frame, [start, start + 2, start + 6], [1, 0.94, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 410 - 400,
        width: 800,
        top: 800,
        display: "flex",
        justifyContent: "center",
        rotate: "-9deg",
        opacity: press,
        scale: String(interpolate(press, [0, 1], [2.3, 1]) * settle),
      }}
    >
      <div
        style={{
          padding: "14px 36px 20px",
          border: `12px solid ${GUILTY}`,
          borderRadius: 14,
          backgroundColor: "rgba(255, 248, 239, 0.9)",
          fontFamily: playfair,
          fontWeight: 900,
          fontSize: 96,
          lineHeight: 1,
          letterSpacing: "0.03em",
          color: GUILTY,
          whiteSpace: "nowrap",
          boxShadow: "0 16px 40px rgba(0, 0, 0, 0.45)",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** Soft hearts drifting up around the dock while the verdict line reads. */
function Hearts({ from, until }: { from: number; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(from);
  const fade = 1 - ramp(frame, sec(until) - 6, sec(until) + 4);

  if (frame < start || fade <= 0) {
    return null;
  }

  return (
    <>
      {Array.from({ length: 9 }, (_, index) => {
        const seed = `juicio-heart-${index}`;
        const delay = random(`${seed}-d`) * 18;
        const local = frame - start - delay;

        if (local < 0) {
          return null;
        }

        const side = index % 2 === 0 ? -1 : 1;
        const x = DOCK.centerX + side * (220 + random(`${seed}-x`) * 120);
        const y = 980 - local * (5 + random(`${seed}-v`) * 3);
        const size = 56 + random(`${seed}-s`) * 40;
        const pop = ramp(local, 0, 8, Easing.out(Easing.back(2)));

        return (
          <svg
            key={seed}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              left: x - size / 2 + Math.sin(local / 9 + index) * 16,
              top: y,
              opacity: fade,
              scale: String(pop),
              rotate: `${side * 10}deg`,
            }}
            aria-hidden
          >
            <path
              d="M50 88 C20 66 6 50 6 32 C6 18 17 8 30 8 C39 8 46 13 50 21 C54 13 61 8 70 8 C83 8 94 18 94 32 C94 50 80 66 50 88 Z"
              fill={index % 3 === 0 ? CREAM : CORAL}
              stroke={GUILTY}
              strokeWidth="5"
            />
          </svg>
        );
      })}
    </>
  );
}

/** The gavel: raised off-screen right, it swings down onto its block at each strike. */
function Gavel({ strikes }: { strikes: number[] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const hookEnd = strikes.filter((at) => at < 2).length;
  const hookStrikes = strikes.slice(0, hookEnd);
  const verdictStrikes = strikes.slice(hookEnd);
  const lastHook = sec(hookStrikes[hookStrikes.length - 1] ?? 0);
  const firstVerdict = sec(verdictStrikes[0] ?? 0);
  const hookShow = 1 - ramp(frame, lastHook + 22, lastHook + 32);
  const verdictShow = verdictStrikes.length
    ? ramp(frame, firstVerdict - 16, firstVerdict - 6) * (1 - ramp(frame, firstVerdict + 24, firstVerdict + 34))
    : 0;
  const show = Math.max(hookShow, verdictShow);

  if (show <= 0) {
    return null;
  }

  const lift = strikes.reduce((lowest, at) => Math.min(lowest, swing(frame - sec(at))), 1);
  const angle = GAVEL.raised * lift;
  const block = { x: GAVEL.pivotX - GAVEL.reach - 90, y: GAVEL.pivotY + 80, width: 180, height: 46 };

  return (
    <svg
      width={1080}
      height={1920}
      style={{ position: "absolute", inset: 0, translate: `${(1 - show) * 520}px 0px`, overflow: "visible" }}
      aria-hidden
    >
      <rect x={block.x + 8} y={block.y + 8} width={block.width} height={block.height} rx="10" fill="#000" opacity="0.4" />
      <rect x={block.x} y={block.y} width={block.width} height={block.height} rx="10" fill={WOOD_LIGHT} stroke={INK} strokeWidth="5" />
      <rect x={block.x + 12} y={block.y + 8} width={block.width - 24} height="8" rx="4" fill={GOLD} opacity="0.7" />
      <g transform={`rotate(${angle} ${GAVEL.pivotX} ${GAVEL.pivotY})`}>
        <rect
          x={GAVEL.pivotX - GAVEL.reach + 40}
          y={GAVEL.pivotY - 13}
          width={GAVEL.reach - 20}
          height="26"
          rx="13"
          fill={WOOD_LIGHT}
          stroke={INK}
          strokeWidth="5"
        />
        <rect x={GAVEL.pivotX - 60} y={GAVEL.pivotY - 16} width="44" height="32" rx="10" fill={GOLD} stroke={INK} strokeWidth="5" />
        <g transform={`translate(${GAVEL.pivotX - GAVEL.reach} ${GAVEL.pivotY})`}>
          <rect x="-48" y="-80" width="96" height="160" rx="22" fill="#6B4430" stroke={INK} strokeWidth="6" />
          <rect x="-48" y="-62" width="96" height="16" fill={GOLD} stroke={INK} strokeWidth="4" />
          <rect x="-48" y="46" width="96" height="16" fill={GOLD} stroke={INK} strokeWidth="4" />
          <rect x="-30" y="-74" width="14" height="148" rx="7" fill="#FFFFFF" opacity="0.18" />
        </g>
      </g>
      <Impact frame={frame} strikes={strikes.map(sec)} x={block.x + block.width / 2} y={block.y} />
    </svg>
  );
}

/** 0 at impact, 1 fully raised; `since` is frames after a strike. */
function swing(since: number): number {
  if (since < -6) {
    return 1;
  }

  if (since < 0) {
    return (-since / 6) ** 2;
  }

  return interpolate(since, [0, 3, 14], [0, 0.06, 1], {
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.quad),
  });
}

/** Short impact lines bursting off the block for a few frames after each strike. */
function Impact({ frame, strikes, x, y }: { frame: number; strikes: number[]; x: number; y: number }) {
  const since = strikes.map((at) => frame - at).find((value) => value >= 0 && value < 8);

  if (since === undefined) {
    return null;
  }

  const spread = interpolate(since, [0, 7], [0, 1], { extrapolateRight: "clamp" });

  return (
    <g opacity={1 - spread} stroke={GOLD} strokeWidth="9" strokeLinecap="round">
      {[-150, -120, -60, -30].map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const inner = 110 + spread * 40;
        const outer = 150 + spread * 70;

        return (
          <line
            key={deg}
            x1={x + Math.cos(rad) * inner}
            y1={y + Math.sin(rad) * inner * 0.6}
            x2={x + Math.cos(rad) * outer}
            y2={y + Math.sin(rad) * outer * 0.6}
          />
        );
      })}
    </g>
  );
}

/** The caption under the stage: one line at a time, each replacing the last. */
function Captions({ lines, until }: { lines: Line[]; until: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <>
      {lines.map((line, index) => {
        const start = sec(line.at);
        const next = index < lines.length - 1 ? sec(lines[index + 1].at) : sec(until);

        if (frame < start - 4 || frame >= next) {
          return null;
        }

        const enter = ramp(frame, start - 4, start + 4);
        const leave = ramp(frame, next - 4, next);

        return (
          <div
            key={line.at}
            style={{
              position: "absolute",
              top: CAPTION_TOP,
              left: 60,
              width: 880,
              textAlign: "center",
              fontFamily: POPPINS,
              fontWeight: 800,
              fontSize: 66,
              lineHeight: 1.12,
              letterSpacing: "-0.01em",
              color: CREAM,
              whiteSpace: "pre-line",
              textShadow: "0 6px 18px rgba(0, 0, 0, 0.6)",
              opacity: enter * (1 - leave),
              translate: `0px ${(1 - enter) * 30}px`,
            }}
          >
            {line.text}
          </div>
        );
      })}
    </>
  );
}

/** The jury's two buttons; at the verdict CULPABLE lights up, then both reopen for the comments. */
function VoteButtons({
  guilty,
  innocent,
  from,
  verdictAt,
  reopenAt,
}: {
  guilty: string;
  innocent: string;
  from: number;
  verdictAt: number;
  reopenAt: number;
}) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const start = sec(from);
  const verdict = sec(verdictAt);
  const reopen = sec(reopenAt);
  const enter = ramp(frame, start - 6, start + 4, Easing.out(Easing.back(1.6)));
  const isDeciding = frame >= verdict && frame < reopen;
  const isOpen = !isDeciding;
  const beat = sec(0.5);
  const pulseOf = (offset: number) =>
    isOpen ? 1 + 0.045 * Math.max(0, Math.sin(((frame - start + offset) / beat) * Math.PI)) : 1;
  const left = 480 - BUTTONS.gap / 2 - BUTTONS.width;
  const buttons = [
    { text: guilty, color: GUILTY, x: left, scale: isDeciding ? 1.08 : pulseOf(0), dim: 0 },
    { text: innocent, color: TEAL, x: left + BUTTONS.width + BUTTONS.gap, scale: isDeciding ? 0.92 : pulseOf(beat), dim: isDeciding ? 0.55 : 0 },
  ];

  return (
    <>
      {buttons.map((button) => (
        <div
          key={button.text}
          style={{
            position: "absolute",
            left: button.x,
            top: BUTTONS.top,
            width: BUTTONS.width,
            height: BUTTONS.height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: button.color,
            border: `6px solid ${CREAM}`,
            borderRadius: 999,
            boxSizing: "border-box",
            boxShadow: `0 10px 0 ${WOOD_DARK}, 0 18px 30px rgba(0, 0, 0, 0.4)`,
            fontFamily: POPPINS,
            fontWeight: 800,
            fontSize: 56,
            letterSpacing: "0.04em",
            color: CREAM,
            opacity: enter * (1 - button.dim),
            scale: String(enter * button.scale),
          }}
        >
          {button.text}
        </div>
      ))}
    </>
  );
}

function Flash({ at }: { at: number }) {
  const frame = useCurrentFrame();
  const start = useSeconds()(at);

  if (frame < start || frame > start + 6) {
    return null;
  }

  return <AbsoluteFill style={{ backgroundColor: CREAM, opacity: 0.4 * (1 - ramp(frame, start, start + 6)) }} />;
}

/**
 * `shared.tsx`'s EndCard with the note drawn on two lines (the template slot
 * fits one) and the jury question kept under the pill for the comments, as in
 * `diferencias.tsx`.
 */
function TwoLineNoteEndCard({ cta }: { cta: JuicioProps["cta"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const noteAt = sec(cta.revealAt.note - cta.from);
  const questionAt = cta.question ? sec(cta.question.at - cta.from) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: ARYA.colors.background, opacity: ramp(frame, 0, 6) }}>
      <CtaScene cta={{ ...cta, note: "" }} />
      <div
        style={{
          position: "absolute",
          top: 984,
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
      {cta.question ? (
        <div
          style={{
            position: "absolute",
            top: 1300,
            ...centered(880),
            textAlign: "center",
            fontFamily: POPPINS,
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            color: ARYA.colors.ink,
            opacity: ramp(frame, questionAt, questionAt + 10),
            translate: `0px ${interpolate(ramp(frame, questionAt, questionAt + 14), [0, 1], [20, 0])}px`,
          }}
        >
          {cta.question.text}
        </div>
      ) : null}
    </AbsoluteFill>
  );
}
