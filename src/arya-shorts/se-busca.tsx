import { loadFont as loadFell } from "@remotion/google-fonts/IMFellEnglish";
import { loadFont as loadUltra } from "@remotion/google-fonts/Ultra";
import type { CSSProperties, ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { ARYA, centered, EndCard, POPPINS, ramp, ShortFrame, useSeconds } from "./shared";

/** Wood-type slab for the poster's shouted words. Exported so the call stays. */
export const { fontFamily: ultra } = loadUltra("normal", {
  weights: ["400"],
  subsets: ["latin", "latin-ext"],
});

/** Fell types: letterpress scans, uneven by nature, for everything set as prose. */
export const { fontFamily: fell } = loadFell("normal", {
  weights: ["400"],
  subsets: ["latin"],
});
loadFell("italic", { weights: ["400"], subsets: ["latin"] });

const INK = "#2B1B12";
/** Arya's coral, deepened so it reads as stamp ink on aged paper. */
const STAMP = "#E2765A";
/** The payoff stamp: the same coral, fully saturated, so it outweighs every DELITO. */
const CAPTURE_INK = "#E0482A";

const POSTER = { width: 1000, height: 1800 };
const CRIME_ROW = { top: 1195, height: 130 };
const MOVE_SECONDS = 0.4;

interface View {
  /** Canvas row of the poster's top edge. */
  top: number;
  scale: number;
}

/**
 * Each view keeps the copy it shows between rows 220 and 1500 of the canvas.
 * `crimes` lifts the title fully out of frame (its bottom sits at row -26, past
 * the stamp shake); `reward` pushes in on the lower half so the reward reads
 * larger than the crime lines.
 */
const VIEWS = {
  title: { top: 200, scale: 1 },
  crimes: { top: -290, scale: 1 },
  reward: { top: -599, scale: 1.15 },
  full: { top: 205, scale: 0.72 },
} as const satisfies Record<string, View>;

interface Crime {
  label: string;
  text: string;
  /** Second the stamp lands. */
  at: number;
}

interface Banner {
  title: string;
  body: string;
  time: string;
  icon: string;
}

export type SeBuscaProps = {
  photo: string;
  paper: string;
  wall: string;
  title: string;
  aliasLead: string;
  alias: string;
  aliasAt: number;
  crimes: Crime[];
  reward: { label: string; text: string; at: number };
  capture: {
    /** Second the camera finishes pulling back to the whole poster. */
    at: number;
    stamp: { text: string; at: number };
    slip: { text: string; at: number };
    banner: Banner & { at: number };
  };
  /** The emoji stays outside the ink filter, which would smear it. */
  question: { text: string; emoji: string; at: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
  end: number;
};

/** "Se busca": a reward poster for the dog who dodges pills, until the reminder catches her. */
export function SeBusca(props: SeBuscaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { fps } = useVideoConfig();
  const firstCrime = props.crimes[0].at;
  const camera = cameraAt(frame, [
    { at: sec(firstCrime), view: VIEWS.crimes },
    { at: sec(props.reward.at), view: VIEWS.reward },
    { at: sec(props.capture.at), view: VIEWS.full },
  ]);
  const slam = spring({ frame, fps, config: { damping: 11, stiffness: 210 } });
  const hits = [0, ...props.crimes.map((crime) => crime.at)];
  const shake =
    hits.reduce((offset, at) => offset + jolt(frame - sec(at)), 0) +
    jolt(frame - sec(props.capture.stamp.at), 2);
  const posterScale = camera.scale * interpolate(slam, [0, 1], [1.13, 1]);
  const posterWidth = POSTER.width * posterScale;

  return (
    <ShortFrame
      background="#3A2416"
      music={props.music}
      duckAt={props.cta.from}
      sfx={props.sfx}
    >
      <InkFilters />
      <AbsoluteFill style={{ translate: `${shake * 0.6}px ${shake}px` }}>
        <Img
          src={staticFile(props.wall)}
          style={{
            position: "absolute",
            inset: -40,
            width: 1160,
            height: 2000,
            maxWidth: "none",
            objectFit: "cover",
            filter: "brightness(0.82)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: (1080 - posterWidth) / 2,
            top: camera.top - (posterScale - camera.scale) * 620,
            width: POSTER.width,
            height: POSTER.height,
            transformOrigin: "0 0",
            scale: String(posterScale),
            rotate: `${interpolate(slam, [0, 1], [-3.2, -0.7])}deg`,
            boxShadow: "0 28px 60px rgba(20, 10, 4, 0.55)",
          }}
        >
          <Poster {...props} />
        </div>
      </AbsoluteFill>

      <Slip
        text={props.capture.slip.text}
        paper={props.paper}
        from={sec(props.capture.slip.at)}
      />
      <NotificationBanner
        banner={props.capture.banner}
        from={sec(props.capture.banner.at)}
        exitAt={sec(props.question.at)}
      />
      <Question
        text={props.question.text}
        emoji={props.question.emoji}
        paper={props.paper}
        from={sec(props.question.at)}
      />
      <EndCard cta={{ ...props.cta, note: "" }} />
      <CtaNote text={props.cta.note} from={sec(props.cta.revealAt.note)} />
    </ShortFrame>
  );
}

/**
 * The shared end card sets its note on one line above the pill; the Spanish
 * note needs two, so it is drawn here between the name and the pill, matching
 * the week's other Spanish end cards.
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

/** Eased hops between views; each move lands on its stop's second. */
function cameraAt(frame: number, stops: { at: number; view: View }[]): View {
  return stops.reduce<View>((current, stop) => {
    const t = ramp(frame, stop.at - Math.round(MOVE_SECONDS * 30), stop.at);

    return {
      top: interpolate(t, [0, 1], [current.top, stop.view.top]),
      scale: interpolate(t, [0, 1], [current.scale, stop.view.scale]),
    };
  }, VIEWS.title);
}

/** A decaying knock, in px, `since` frames after a hit; `strength` scales it. */
function jolt(since: number, strength = 1): number {
  if (since < 0 || since > 14) {
    return 0;
  }

  return Math.sin(since * 2.1) * 9 * strength * Math.exp(-since / 3.2);
}

/** Ink spread on the edges plus pinholes where the press missed. */
function InkFilters() {
  return (
    <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden>
      <defs>
        <filter id="se-busca-ink" x="-5%" y="-5%" width="110%" height="110%">
          <feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="4" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="5" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="2" seed="9" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 10.6" result="holes" />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
        <filter id="se-busca-stamp" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="7" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.38" numOctaves="3" seed="2" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -11 0 0 0 7" result="holes" />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
        <filter id="se-busca-capture" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed="11" result="warp" />
          <feDisplacementMap in="SourceGraphic" in2="warp" scale="6" xChannelSelector="R" yChannelSelector="G" result="rough" />
          <feTurbulence type="fractalNoise" baseFrequency="0.42" numOctaves="3" seed="5" result="speck" />
          <feColorMatrix in="speck" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 0 0 0 11.6" result="holes" />
          <feComposite in="rough" in2="holes" operator="in" />
        </filter>
      </defs>
    </svg>
  );
}

const printed: CSSProperties = {
  position: "absolute",
  color: INK,
  filter: "url(#se-busca-ink)",
  textAlign: "center",
};

function Poster(props: SeBuscaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <>
      <Img
        src={staticFile(props.paper)}
        style={{ position: "absolute", inset: 0, width: POSTER.width, height: POSTER.height, objectFit: "fill" }}
      />
      <div
        style={{
          position: "absolute",
          inset: 30,
          border: `12px double ${INK}`,
          opacity: 0.85,
          filter: "url(#se-busca-ink)",
        }}
      />
      {[
        [44, 44],
        [956, 44],
        [44, 1756],
        [956, 1756],
      ].map(([x, y]) => (
        <Nail key={`${x}-${y}`} x={x} y={y} />
      ))}

      <div
        style={{
          ...printed,
          left: 0,
          width: POSTER.width,
          top: 66,
          fontFamily: ultra,
          fontSize: 150,
          lineHeight: 1,
          letterSpacing: "0.01em",
          scale: "1 1.32",
          transformOrigin: "50% 0",
        }}
      >
        {props.title}
      </div>

      <div
        style={{
          position: "absolute",
          left: 220,
          top: 300,
          width: 560,
          height: 660,
          border: `9px solid ${INK}`,
          boxSizing: "border-box",
          overflow: "hidden",
          backgroundColor: "#E9D3AE",
        }}
      >
        <Img
          src={staticFile(props.photo)}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            filter: "sepia(0.9) saturate(0.85) contrast(1.18) brightness(0.97)",
            mixBlendMode: "multiply",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            boxShadow: "inset 0 0 70px rgba(60, 34, 14, 0.55)",
          }}
        />
      </div>

      <Reveal from={sec(props.aliasAt)}>
        <div style={{ ...printed, left: 0, width: POSTER.width, top: 978, fontFamily: fell, fontStyle: "italic", fontSize: 62, lineHeight: 1 }}>
          {props.aliasLead}
        </div>
        <div style={{ ...printed, left: 0, width: POSTER.width, top: 1052, fontFamily: fell, fontSize: 86, lineHeight: 1 }}>
          {props.alias}
        </div>
      </Reveal>

      <Rule top={1172} visible={frame >= sec(props.crimes[0].at) - 12} />

      {props.crimes.map((crime, index) => (
        <CrimeRow key={crime.label} crime={crime} index={index} />
      ))}

      <Reveal from={sec(props.reward.at)}>
        <div style={{ ...printed, left: 0, width: POSTER.width, top: 1608, fontFamily: ultra, fontSize: 60, lineHeight: 1, letterSpacing: "0.04em" }}>
          {props.reward.label}
        </div>
        <div
          style={{
            ...printed,
            left: 0,
            width: POSTER.width,
            top: 1680,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: 22,
            fontFamily: fell,
            fontStyle: "italic",
            fontSize: 70,
            lineHeight: 1,
          }}
        >
          {props.reward.text}
          <Bone />
        </div>
      </Reveal>

      <CaptureStamp text={props.capture.stamp.text} from={sec(props.capture.stamp.at)} />
    </>
  );
}

/** Ink lands in three frames with a slight press, like a sheet coming off the platen. */
function Reveal({ from, children }: { from: number; children: ReactNode }) {
  const frame = useCurrentFrame();

  if (frame < from) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: ramp(frame, from, from + 3),
        scale: String(interpolate(frame, [from, from + 5], [1.03, 1], { extrapolateRight: "clamp" })),
      }}
    >
      {children}
    </div>
  );
}

function Rule({ top, visible }: { top: number; visible: boolean }) {
  if (!visible) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        left: 120,
        width: 760,
        top,
        height: 5,
        backgroundColor: INK,
        filter: "url(#se-busca-ink)",
      }}
    />
  );
}

const STAMP_TILT = [-5, 3, -3];

function CrimeRow({ crime, index }: { crime: Crime; index: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const at = sec(crime.at);
  const top = CRIME_ROW.top + index * CRIME_ROW.height;

  if (frame < at - 3) {
    return null;
  }

  const press = ramp(frame, at - 3, at, Easing.in(Easing.quad));

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: 56,
          top: top + 17,
          width: 270,
          height: 96,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: `6px solid ${STAMP}`,
          borderRadius: 8,
          boxSizing: "border-box",
          color: STAMP,
          fontFamily: ultra,
          fontSize: 44,
          lineHeight: 1,
          letterSpacing: "0.02em",
          mixBlendMode: "multiply",
          filter: "url(#se-busca-stamp)",
          rotate: `${STAMP_TILT[index % STAMP_TILT.length]}deg`,
          scale: String(interpolate(press, [0, 1], [1.7, 1])),
          opacity: press,
        }}
      >
        {crime.label}
      </div>
      <div
        style={{
          ...printed,
          left: 350,
          top,
          width: 610,
          height: CRIME_ROW.height,
          display: "flex",
          alignItems: "center",
          textAlign: "left",
          fontFamily: fell,
          fontSize: 60,
          lineHeight: 1.02,
          opacity: ramp(frame, at, at + 3),
        }}
      >
        {crime.text}
      </div>
    </>
  );
}

/**
 * The payoff: one heavy diagonal stamp across the poster's middle, below the
 * dog's eyes and above the pasted slip. It drops from 2.6× in four frames and
 * squashes once on contact.
 */
function CaptureStamp({ text, from }: { text: string; from: number }) {
  const frame = useCurrentFrame();

  if (frame < from - 4) {
    return null;
  }

  const press = ramp(frame, from - 4, from, Easing.in(Easing.quad));
  const settle = interpolate(frame, [from, from + 2, from + 6], [1, 0.95, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: -40,
        width: POSTER.width + 80,
        top: 880,
        display: "flex",
        justifyContent: "center",
        rotate: "-21deg",
        scale: String(interpolate(press, [0, 1], [2.6, 1]) * settle),
        opacity: press,
        filter: "url(#se-busca-capture)",
      }}
    >
      <div
        style={{
          padding: "12px 22px 18px",
          border: `20px solid ${CAPTURE_INK}`,
          borderRadius: 16,
          color: CAPTURE_INK,
          fontFamily: ultra,
          fontSize: 126,
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </div>
  );
}

function Nail({ x, y }: { x: number; y: number }) {
  return (
    <div
      style={{
        position: "absolute",
        left: x - 13,
        top: y - 13,
        width: 26,
        height: 26,
        borderRadius: 13,
        background: "radial-gradient(circle at 35% 35%, #B08A64 0%, #5E3B22 55%, #2A170C 100%)",
        boxShadow: "2px 4px 5px rgba(20, 10, 4, 0.5)",
      }}
    />
  );
}

function Bone() {
  return (
    <svg width="110" height="50" viewBox="0 0 110 50" aria-hidden style={{ rotate: "-12deg" }}>
      <path
        fill={INK}
        d="M22 8a11 11 0 0 1 10 11v0h46v0a11 11 0 1 1 11 11 11 11 0 1 1-11 11v0H32v0a11 11 0 1 1-11-11A11 11 0 1 1 22 8z"
      />
    </svg>
  );
}

/** A strip pasted over the poster once she's caught. */
function Slip({ text, paper, from }: { text: string; paper: string; from: number }) {
  const frame = useCurrentFrame();

  if (frame < from - 3) {
    return null;
  }

  const press = ramp(frame, from - 3, from, Easing.in(Easing.quad));

  return (
    <div
      style={{
        position: "absolute",
        left: 80,
        width: 920,
        top: 1250,
        height: 226,
        overflow: "hidden",
        rotate: "1.4deg",
        scale: String(interpolate(press, [0, 1], [1.25, 1])),
        opacity: press,
        boxShadow: "0 16px 30px rgba(20, 10, 4, 0.5)",
      }}
    >
      <Img src={staticFile(paper)} style={{ position: "absolute", inset: 0, width: 920, height: 226, objectFit: "cover" }} />
      <div
        style={{
          ...printed,
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: ultra,
          fontSize: 66,
          lineHeight: 1.12,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
    </div>
  );
}

/**
 * The app's real dose reminder (arya-tracker `notifications.medicationTimeForPet`),
 * iOS style like the store videos' overlay, dropping onto the poster.
 */
function NotificationBanner({ banner, from, exitAt }: { banner: Banner; from: number; exitAt: number }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - from + 7;

  if (local < 0) {
    return null;
  }

  const drop = spring({ frame: local, fps, config: { damping: 10, stiffness: 150, mass: 0.8 } });
  const exit = ramp(frame, exitAt, exitAt + 8);
  const pt = (value: number) => value * 2.8;

  return (
    <div
      style={{
        position: "absolute",
        left: 50,
        top: 250,
        width: 980,
        display: "flex",
        gap: pt(10),
        alignItems: "center",
        padding: `${pt(12)}px ${pt(14)}px`,
        borderRadius: pt(24),
        boxSizing: "border-box",
        background: "rgba(246, 246, 246, 0.97)",
        boxShadow: `0 ${pt(10)}px ${pt(36)}px rgba(0, 0, 0, 0.35)`,
        fontFamily: "-apple-system, 'SF Pro Text', 'Inter', sans-serif",
        color: "#111111",
        opacity: 1 - exit,
        translate: `0px ${(1 - drop) * -520}px`,
        scale: String(1 + (1 - drop) * 0.1 - exit * 0.08),
      }}
    >
      <Img
        src={staticFile(banner.icon)}
        style={{ flex: "none", width: pt(38), height: pt(38), borderRadius: pt(9) }}
      />
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

/** The poster dims and a fresh notice asks the viewer to file their own charge. */
function Question({ text, emoji, paper, from }: { text: string; emoji: string; paper: string; from: number }) {
  const frame = useCurrentFrame();

  if (frame < from - 3) {
    return null;
  }

  const press = ramp(frame, from - 3, from, Easing.in(Easing.quad));

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ backgroundColor: "rgba(26, 14, 6, 0.62)", opacity: ramp(frame, from - 3, from + 4) }} />
      <div
        style={{
          position: "absolute",
          left: 70,
          width: 940,
          top: 560,
          height: 640,
          overflow: "hidden",
          rotate: "-1.6deg",
          scale: String(interpolate(press, [0, 1], [1.2, 1])),
          opacity: press,
          boxShadow: "0 24px 50px rgba(10, 5, 2, 0.6)",
        }}
      >
        <Img src={staticFile(paper)} style={{ position: "absolute", inset: 0, width: 940, height: 640, objectFit: "cover" }} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 26,
            padding: "0 50px",
          }}
        >
          <div
            style={{
              ...printed,
              position: "static",
              fontFamily: ultra,
              fontSize: 84,
              lineHeight: 1.16,
              whiteSpace: "pre-line",
            }}
          >
            {text}
          </div>
          <div style={{ fontSize: 96, lineHeight: 1 }}>{emoji}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
}
