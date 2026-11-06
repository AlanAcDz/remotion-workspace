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
import { ARYA, PawPrint, POPPINS, ramp, ShortFrame, TEAL, useSeconds } from "./shared";

const FONT_SIZE = 104;
const LINE_STEP = 120;
const TEXT_LEFT = 76;
const TEXT_TOP = 262;
const GRAPHITE = "#2F2C29";
const CHARS_PER_SECOND = 30;
const TURN_FRAMES = 9;

interface DiaryPage {
  from: number;
  to: number;
  lines: string[];
  photo: string;
  /** Characters already on the page on the first frame. */
  headStart?: number;
}

export type DiaryProps = {
  notebook: string;
  pages: DiaryPage[];
  banner: { src: string; at: number; until: number };
  signAt: number;
  stampAt: number;
  logo: string;
  stamp: { line1: string; line2: string };
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

/**
 * "El Diario": Arya keeps a diary. Each day is a page in a pencil hand, with
 * her evidence photo taped on; the page turns when the entry is done, and the
 * app only ever shows up as the real banner dropping over day 4.
 */
export function Diary(props: DiaryProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const index = Math.max(
    0,
    props.pages.findIndex((page) => frame < sec(page.to)),
  );
  const current = props.pages[index];
  const next = props.pages[index + 1];
  const turnFrom = sec(current.to) - TURN_FRAMES;
  const isTurning = next !== undefined && frame >= turnFrom;

  return (
    <ShortFrame background="#6B4A2E" music={props.music} sfx={props.sfx}>
      <AbsoluteFill style={{ perspective: 2400 }}>
        {isTurning ? <Page {...props} page={next} /> : null}
        <AbsoluteFill
          style={{
            transformOrigin: "0% 50%",
            rotate: `y ${-100 * ramp(frame, turnFrom, sec(current.to), Easing.in(Easing.quad))}deg`,
          }}
        >
          <Page {...props} page={current} />
        </AbsoluteFill>
      </AbsoluteFill>
      <Banner banner={props.banner} />
    </ShortFrame>
  );
}

function Page({ notebook, page, ...rest }: DiaryProps & { page: DiaryPage }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const sec = useSeconds();
  const isLast = page === rest.pages[rest.pages.length - 1];

  const written =
    (page.headStart ?? 0) +
    (Math.max(0, frame - sec(page.from)) / fps) * CHARS_PER_SECOND;

  let budget = written;
  const reveals = page.lines.map((line) => {
    const share = Math.min(1, Math.max(0, budget / line.length));
    budget -= line.length;
    return share;
  });
  const activeLine = reveals.findIndex((share) => share < 1);
  const isWriting = activeLine !== -1;
  const penLine = isWriting ? activeLine : page.lines.length - 1;
  const penX =
    TEXT_LEFT +
    textWidth(page.lines[penLine]) * (isWriting ? reveals[penLine] : 1);
  const penY = TEXT_TOP + penLine * LINE_STEP + 88;
  const doneAt = sec(page.from) + Math.ceil(
    ((page.lines.join("").length - (page.headStart ?? 0)) / CHARS_PER_SECOND) * fps,
  );
  const penAway = ramp(frame, doneAt + 3, doneAt + 14);

  return (
    <AbsoluteFill>
      <Img
        src={staticFile(notebook)}
        style={{
          position: "absolute",
          left: -200,
          top: 0,
          width: 1280,
          height: 1920,
          maxWidth: "none",
          filter: "sepia(0.22) brightness(1.06)",
        }}
      />
      {page.lines.map((line, index) => (
        <div
          key={line}
          style={{
            position: "absolute",
            left: TEXT_LEFT,
            top: TEXT_TOP + index * LINE_STEP,
            fontFamily: caveat,
            fontSize: FONT_SIZE,
            fontWeight: 700,
            lineHeight: 1,
            color: index === 0 ? ARYA.colors.accent : GRAPHITE,
            whiteSpace: "pre",
            padding: "0 0.3em 0 0",
            mixBlendMode: "multiply",
            clipPath: `inset(-20% ${(1 - reveals[index]) * 100}% -20% -5%)`,
          }}
        >
          {line}
        </div>
      ))}
      <Polaroid photo={page.photo} />
      {isLast ? <Signature {...rest} notebook={notebook} /> : null}
      <Pencil
        x={penX + penAway * 500}
        y={penY - penAway * 500}
        wiggle={isWriting ? Math.sin(frame * 1.9) * 7 : 0}
      />
    </AbsoluteFill>
  );
}

function Polaroid({ photo }: { photo: string }) {
  return (
    <div
      style={{
        position: "absolute",
        left: 84,
        top: 1040,
        width: 400,
        padding: "20px 20px 64px",
        backgroundColor: "#FDFBF6",
        boxShadow: "0 16px 34px rgba(40, 28, 16, 0.38)",
        rotate: "-4deg",
      }}
    >
      <Img
        src={staticFile(photo)}
        style={{ width: 360, height: 400, objectFit: "cover", display: "block" }}
      />
      <div
        style={{
          position: "absolute",
          left: 130,
          top: -24,
          width: 150,
          height: 50,
          backgroundColor: "rgba(245, 190, 163, 0.75)",
          rotate: "3deg",
        }}
      />
    </div>
  );
}

function Signature({ signAt, stampAt, logo, stamp }: DiaryProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const sign = ramp(frame, sec(signAt), sec(signAt) + 12, Easing.linear);
  const slam = ramp(frame, sec(stampAt), sec(stampAt) + 5, Easing.in(Easing.quad));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 540,
          top: 1040,
          fontFamily: caveat,
          fontSize: 130,
          fontWeight: 700,
          lineHeight: 1,
          color: GRAPHITE,
          padding: "0 0.3em 0 0",
          mixBlendMode: "multiply",
          clipPath: `inset(-20% ${(1 - sign) * 100}% -20% -5%)`,
        }}
      >
        Arya
      </div>
      <div
        style={{
          position: "absolute",
          left: 760,
          top: 1030,
          opacity: sign === 1 ? 0.8 : 0,
          rotate: "14deg",
        }}
      >
        <PawPrint size={130} color={TEAL} />
      </div>
      <div
        style={{
          position: "absolute",
          left: 516,
          top: 1190,
          width: 450,
          padding: "22px 18px",
          textAlign: "center",
          border: `7px solid ${ARYA.colors.accent}`,
          borderRadius: 26,
          backgroundColor: "rgba(255, 248, 239, 0.86)",
          color: ARYA.colors.accent,
          fontFamily: POPPINS,
          rotate: "-5deg",
          opacity: slam > 0 ? 1 : 0,
          scale: String(interpolate(slam, [0, 1], [1.9, 1])),
        }}
      >
        <Img
          src={staticFile(logo)}
          style={{ width: 96, display: "block", margin: "0 auto 10px" }}
        />
        <div style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.02em" }}>
          {stamp.line1}
        </div>
        <div style={{ fontSize: 38, fontWeight: 600 }}>{stamp.line2}</div>
      </div>
    </>
  );
}

function Pencil({ x, y, wiggle }: { x: number; y: number; wiggle: number }) {
  return (
    <svg
      width={120}
      height={520}
      viewBox="0 0 120 520"
      style={{
        position: "absolute",
        left: x - 60,
        top: y - 520,
        transformOrigin: "50% 100%",
        rotate: `${24 + wiggle * 0.35}deg`,
        filter: "drop-shadow(16px 14px 10px rgba(40, 28, 16, 0.32))",
      }}
      aria-hidden
    >
      <path d="M60 520 L38 440 H82 Z" fill="#E9CFA8" />
      <path d="M60 520 L52 490 H68 Z" fill="#2F2C29" />
      <rect x="38" y="60" width="44" height="380" fill="#F2B84B" />
      <rect x="38" y="60" width="15" height="380" fill="#F7CD77" />
      <rect x="38" y="30" width="44" height="30" fill="#B9BCC0" />
      <rect x="38" y="0" width="44" height="32" rx="10" fill={ARYA.colors.callout} />
    </svg>
  );
}

function Banner({ banner }: { banner: DiaryProps["banner"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const drop = ramp(frame, sec(banner.at), sec(banner.at) + 9);
  const leave = ramp(frame, sec(banner.until) - 8, sec(banner.until));

  if (frame < sec(banner.at) || frame >= sec(banner.until)) {
    return null;
  }

  return (
    <Img
      src={staticFile(banner.src)}
      style={{
        position: "absolute",
        left: 14,
        top: 70,
        width: 1052,
        borderRadius: 54,
        boxShadow: "0 24px 50px rgba(30, 22, 12, 0.42)",
        translate: `0px ${(drop - 1 - leave) * 300}px`,
      }}
    />
  );
}
