import type { ReactNode } from "react";
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
import {
  ARYA,
  Capsule,
  centered,
  CORAL,
  PawPrint,
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

/**
 * "¿Cuál falta?": six cartoon pills to memorise in three seconds, the cards
 * flip and shuffle twice, one comes back empty, a 3-2-1, the reveal, then the
 * turn into "¿ya se la di?" and three real stills of the Spanish app.
 */
const TILE = 285;
const GAP = 22;
const GRID_LEFT = (1080 - (3 * TILE + 2 * GAP)) / 2;
/** Centres the grid on canvas row 950, the middle of the 600–1300 band. */
const GRID_TOP = 950 - TILE - GAP / 2;
const BAR_TOP = GRID_TOP + 2 * TILE + GAP + 36;
const PILL_SCALE = 1.2;
/** Headlines sit centred in this band, above the grid and the app card. */
const HEADLINE_BAND = { top: 220, height: 360 } as const;
const FLIP_FRAMES = 4;
const BACK_BEFORE_FRONT = 0.5;

/** Slot centres, row by row: 0 1 2 on top, 3 4 5 below. */
const SLOTS = Array.from({ length: 6 }, (_, slot) => ({
  x: GRID_LEFT + TILE / 2 + (slot % 3) * (TILE + GAP),
  y: GRID_TOP + TILE / 2 + Math.floor(slot / 3) * (TILE + GAP),
}));

/** A type alias, not an interface: Remotion needs it assignable to Record<string, unknown>. */
export type CualFaltaProps = {
  /** Pill index that comes back as an empty card. */
  missing: number;
  /** Slot of each pill after each shuffle step; the last one is final. */
  shuffles: number[][];
  memorizeEnd: number;
  coverAt: number;
  shuffleAt: number;
  /** Length of each shuffle step in seconds. */
  shuffleStep: number;
  openAt: number;
  countdown: number[];
  revealAt: number;
  turnAt: number;
  turnLine2At: number;
  appAt: number;
  hook: string;
  question: string;
  reveal: string;
  turn: [string, string];
  app: {
    lines: { text: string; from: number; to: number }[];
    shots: AppShot[];
  };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  duckAt: number;
  sfx: Sfx[];
  end: number;
};

/** One still of the 1206 px wide app take, cropped and centred on the card. */
interface AppShot {
  src: string;
  from: number;
  to: number;
  /** Source rows and columns to show. */
  crop: { left: number; top: number; width: number; height: number };
  /** A finger tap at a source point, seconds after the shot starts. */
  tap?: { at: number; x: number; y: number };
  /** A coral ring around a source rectangle, seconds after the shot starts. */
  ring?: {
    at: number;
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export function CualFalta(props: CualFaltaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const seconds = frame / 30;
  // Same frame the faces swap in `flipSide`, so the missing pill never shows mid-flip.
  const opened = frame >= sec(props.openAt) + FLIP_FRAMES * BACK_BEFORE_FRONT;
  const reveal = ramp(
    frame,
    sec(props.revealAt),
    sec(props.revealAt) + 9,
    Easing.out(Easing.back(2.2)),
  );

  return (
    <ShortFrame
      background={ARYA.colors.background}
      music={props.music}
      duckAt={props.duckAt}
      sfx={props.sfx}
    >
      <Sequence
        name="Cuadrícula"
        durationInFrames={sec(props.turnAt)}
        style={{ isolation: "isolate" }}
      >
        {PILLS.map((Pill, pill) => {
          const slot = slotAt(seconds, pill, props);
          const isMissing = pill === props.missing;
          const showsBack = flipSide(
            frame,
            sec(props.coverAt),
            sec(props.openAt),
          );
          const popIn = ramp(
            frame,
            pill * 2 - 8,
            pill * 2,
            Easing.out(Easing.back(1.8)),
          );
          const bob = Math.sin((frame + pill * 9) / 8) * 4;
          const dim = isMissing
            ? 1
            : 1 -
              0.5 * ramp(frame, sec(props.revealAt), sec(props.revealAt) + 6);

          return (
            <div
              key={pill}
              style={{
                position: "absolute",
                left: slot.x - TILE / 2,
                top: slot.y - TILE / 2,
                width: TILE,
                height: TILE,
                scale: `${showsBack.scaleX * slot.scale} ${slot.scale}`,
                zIndex: slot.depth,
                opacity: dim,
              }}
            >
              {showsBack.back ? (
                <CardBack />
              ) : (
                <CardFront
                  highlight={isMissing && opened ? reveal : 0}
                  empty={isMissing && opened}
                >
                  {isMissing && opened ? (
                    <div
                      style={{
                        scale: String(reveal * PILL_SCALE),
                        opacity: reveal > 0 ? 1 : 0,
                      }}
                    >
                      <Pill />
                    </div>
                  ) : (
                    <div
                      style={{
                        scale: String(popIn * PILL_SCALE),
                        rotate: `${bob}deg`,
                      }}
                    >
                      <Pill />
                    </div>
                  )}
                </CardFront>
              )}
            </div>
          );
        })}
      </Sequence>

      <Sequence name="Barra" durationInFrames={sec(props.memorizeEnd)}>
        <DrainBar seconds={props.memorizeEnd} />
      </Sequence>
      {props.countdown.map((at, index) => (
        <Sequence
          key={at}
          name={`Cuenta ${props.countdown.length - index}`}
          from={sec(at)}
          durationInFrames={sec(0.5)}
        >
          <CountDigit value={props.countdown.length - index} />
        </Sequence>
      ))}

      <Sequence name="Gancho" durationInFrames={sec(props.coverAt)}>
        <TopLine text={props.hook} size={80} />
      </Sequence>
      <Sequence
        name="¿Cuál falta?"
        from={sec(props.coverAt)}
        durationInFrames={sec(props.revealAt - props.coverAt)}
      >
        <TopLine text={props.question} size={104} pop />
      </Sequence>
      <Sequence
        name="¿Le atinaste?"
        from={sec(props.revealAt)}
        durationInFrames={sec(props.turnAt - props.revealAt)}
      >
        <TopLine text={props.reveal} size={96} pop />
      </Sequence>

      <Sequence
        name="Giro"
        from={sec(props.turnAt)}
        durationInFrames={sec(props.appAt - props.turnAt)}
      >
        <Turn
          lines={props.turn}
          line2At={sec(props.turnLine2At - props.turnAt)}
        />
      </Sequence>

      <Sequence
        name="App"
        from={sec(props.appAt)}
        durationInFrames={sec(props.cta.from - props.appAt)}
      >
        <AppCard app={props.app} offset={props.appAt} />
      </Sequence>

      <Sequence name="CTA" from={sec(props.cta.from)}>
        <TwoLineNoteEndCard cta={props.cta} />
      </Sequence>
    </ShortFrame>
  );
}

/** Where a pill's card sits: its own slot, then each shuffle step along an arc. */
function slotAt(seconds: number, pill: number, props: CualFaltaProps) {
  let from = SLOTS[pill];
  let start = props.shuffleAt;

  for (const step of props.shuffles) {
    const to = SLOTS[step[pill]];
    const end = start + props.shuffleStep;

    if (seconds < start) {
      break;
    }
    if (seconds < end) {
      const t = Easing.inOut(Easing.cubic)(
        (seconds - start) / props.shuffleStep,
      );
      const arc = Math.sin(t * Math.PI);

      return {
        x: interpolate(t, [0, 1], [from.x, to.x]),
        y: interpolate(t, [0, 1], [from.y, to.y]) - 40 * arc,
        scale: 1 + 0.08 * arc,
        depth: 2,
      };
    }
    from = to;
    start = end;
  }

  return { ...from, scale: 1, depth: 1 };
}

/** Card flip: squeeze to zero width, swap the face, open again. */
function flipSide(frame: number, coverFrame: number, openFrame: number) {
  const squeeze = (at: number) =>
    interpolate(
      frame,
      [at, at + FLIP_FRAMES / 2, at + FLIP_FRAMES],
      [1, 0, 1],
      {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      },
    );
  const isCovered = frame >= coverFrame + FLIP_FRAMES * BACK_BEFORE_FRONT;
  const isOpen = frame >= openFrame + FLIP_FRAMES * BACK_BEFORE_FRONT;

  return {
    back: isCovered && !isOpen,
    scaleX: frame < openFrame ? squeeze(coverFrame) : squeeze(openFrame),
  };
}

function CardFront({
  children,
  highlight,
  empty,
}: {
  children: ReactNode;
  highlight: number;
  empty: boolean;
}) {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 44,
        backgroundColor:
          empty && highlight === 0
            ? "rgba(25, 38, 38, 0.04)"
            : ARYA.colors.surface,
        border: empty
          ? highlight > 0
            ? `10px solid ${CORAL}`
            : "6px dashed rgba(25, 38, 38, 0.28)"
          : "none",
        boxSizing: "border-box",
        boxShadow:
          empty && highlight === 0
            ? "none"
            : "0 16px 34px rgba(25, 38, 38, 0.13)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {empty && highlight === 0 ? (
        <div
          style={{
            fontFamily: POPPINS,
            fontSize: 150,
            fontWeight: 700,
            color: "rgba(25, 38, 38, 0.3)",
          }}
        >
          ?
        </div>
      ) : (
        children
      )}
    </div>
  );
}

function CardBack() {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        borderRadius: 44,
        backgroundColor: TEAL,
        border: "8px solid #FFFFFF",
        boxSizing: "border-box",
        boxShadow: "0 16px 34px rgba(25, 38, 38, 0.18)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <PawPrint size={120} color="rgba(255, 255, 255, 0.85)" />
    </div>
  );
}

const OUTLINE = "#192626";
const STROKE = 5;

function TealCapsule() {
  return <Capsule width={200} rotate={-28} />;
}

function RoundTablet() {
  return (
    <svg width={170} height={170} viewBox="0 0 100 100" aria-hidden>
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="#FFFFFF"
        stroke={OUTLINE}
        strokeWidth={STROKE * 0.6}
      />
      <circle cx="50" cy="50" r="36" fill="#EEF1F1" />
      <rect x="18" y="47" width="64" height="6" rx="3" fill="#B9C4C4" />
      <ellipse cx="36" cy="30" rx="12" ry="6" fill="#FFFFFF" />
    </svg>
  );
}

function OvalTablet() {
  return (
    <svg
      width={210}
      height={130}
      viewBox="0 0 160 100"
      aria-hidden
      style={{ rotate: "18deg" }}
    >
      <ellipse
        cx="80"
        cy="50"
        rx="74"
        ry="44"
        fill={CORAL}
        stroke={OUTLINE}
        strokeWidth={STROKE * 0.6}
      />
      <ellipse cx="80" cy="56" rx="60" ry="30" fill="#EBA584" />
      <ellipse cx="56" cy="30" rx="22" ry="8" fill="#FFFFFF" opacity="0.55" />
    </svg>
  );
}

function Softgel() {
  return (
    <svg
      width={150}
      height={190}
      viewBox="0 0 100 126"
      aria-hidden
      style={{ rotate: "-14deg" }}
    >
      <ellipse
        cx="50"
        cy="63"
        rx="40"
        ry="56"
        fill="#F6C945"
        stroke={OUTLINE}
        strokeWidth={STROKE * 0.6}
      />
      <ellipse cx="50" cy="70" rx="28" ry="42" fill="#F2B52A" />
      <ellipse cx="36" cy="34" rx="10" ry="16" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

function LilacCapsule() {
  return (
    <svg
      width={110}
      height={220}
      viewBox="0 0 50 100"
      aria-hidden
      style={{ rotate: "20deg" }}
    >
      <defs>
        <clipPath id="lilac-capsule">
          <rect x="2" y="2" width="46" height="96" rx="23" />
        </clipPath>
      </defs>
      <g clipPath="url(#lilac-capsule)">
        <rect width="50" height="50" fill="#9B7FD1" />
        <rect y="50" width="50" height="50" fill="#E9E0F7" />
        <rect
          x="9"
          y="10"
          width="7"
          height="80"
          rx="3.5"
          fill="#FFFFFF"
          opacity="0.45"
        />
      </g>
      <rect
        x="2"
        y="2"
        width="46"
        height="96"
        rx="23"
        fill="none"
        stroke="#4B3A75"
        strokeWidth="3"
      />
    </svg>
  );
}

function BoneChew() {
  return (
    <svg
      width={220}
      height={120}
      viewBox="0 0 180 100"
      aria-hidden
      style={{ rotate: "-10deg" }}
    >
      <g fill="#C98A4B" stroke="#6B4423" strokeWidth="3">
        <circle cx="30" cy="30" r="22" />
        <circle cx="30" cy="70" r="22" />
        <circle cx="150" cy="30" r="22" />
        <circle cx="150" cy="70" r="22" />
        <rect x="28" y="30" width="124" height="40" rx="8" />
      </g>
      <rect x="40" y="32" width="100" height="36" fill="#C98A4B" />
      <rect
        x="48"
        y="40"
        width="70"
        height="7"
        rx="3.5"
        fill="#FFFFFF"
        opacity="0.35"
      />
    </svg>
  );
}

/** Six pills that differ in both shape and colour, so the puzzle is fair. */
const PILLS = [
  TealCapsule,
  RoundTablet,
  OvalTablet,
  Softgel,
  LilacCapsule,
  BoneChew,
];

function DrainBar({ seconds }: { seconds: number }) {
  const frame = useCurrentFrame();
  const left = 1 - frame / (seconds * 30);
  const width = 3 * TILE + 2 * GAP;

  return (
    <div
      style={{
        position: "absolute",
        left: GRID_LEFT,
        top: BAR_TOP,
        width,
        height: 30,
        borderRadius: 999,
        backgroundColor: "rgba(25, 38, 38, 0.1)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: width * left,
          height: "100%",
          borderRadius: 999,
          backgroundColor: left > 0.34 ? TEAL : CORAL,
        }}
      />
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
        top: BAR_TOP - 20,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 200,
        fontWeight: 700,
        lineHeight: 1,
        color: ARYA.colors.accent,
        scale: String(interpolate(ramp(frame, 0, 6), [0, 1], [1.4, 1])),
        opacity: 1 - ramp(frame, 10, 15),
      }}
    >
      {value}
    </div>
  );
}

function TopLine({
  text,
  size,
  pop = false,
}: {
  text: string;
  size: number;
  pop?: boolean;
}) {
  const frame = useCurrentFrame();
  const enter = pop ? ramp(frame, 0, 8) : 1;

  return (
    <HeadlineBand>
      <div
        style={{
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: size,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
          opacity: enter,
          scale: String(interpolate(enter, [0, 1], [1.25, 1])),
        }}
      >
        {text}
      </div>
    </HeadlineBand>
  );
}

function HeadlineBand({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "absolute",
        ...HEADLINE_BAND,
        ...centered(820),
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
      }}
    >
      {children}
    </div>
  );
}

function Turn({
  lines,
  line2At,
}: {
  lines: [string, string];
  line2At: number;
}) {
  const frame = useCurrentFrame();
  const second = ramp(
    frame,
    line2At,
    line2At + 8,
    Easing.out(Easing.back(1.6)),
  );
  const wobble = Math.sin(frame / 6) * 10;
  const text = {
    textAlign: "center",
    fontFamily: POPPINS,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
  } as const;

  // One centred column with the second line's space reserved from frame 0,
  // so nothing moves when it lands.
  return (
    <AbsoluteFill style={{ backgroundColor: ARYA.colors.ink }}>
      <div
        style={{
          position: "absolute",
          top: 220,
          height: 1280,
          ...centered(840),
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 48,
        }}
      >
        <div style={{ ...text, fontSize: 80, color: ARYA.colors.background }}>
          {lines[0]}
        </div>
        <div
          style={{
            ...text,
            fontSize: 104,
            whiteSpace: "pre-line",
            color: CORAL,
            opacity: second > 0 ? 1 : 0,
            scale: String(interpolate(second, [0, 1], [0.7, 1])),
          }}
        >
          {lines[1]}
        </div>
        <div style={{ marginTop: 40, rotate: `${wobble}deg` }}>
          <Capsule width={300} />
        </div>
      </div>
    </AbsoluteFill>
  );
}

/** Tight crops at about 1:1, so the UI rows read at phone size. */
const CARD_WIDTH = 900;

function AppCard({
  app,
  offset,
}: {
  app: CualFaltaProps["app"];
  offset: number;
}) {
  const sec = useSeconds();

  return (
    <AbsoluteFill style={{ backgroundColor: TEAL }}>
      {app.lines.map((line) => (
        <Sequence
          key={line.text}
          name={line.text}
          from={sec(line.from - offset)}
          durationInFrames={sec(line.to - line.from)}
        >
          <AppLine text={line.text} />
        </Sequence>
      ))}
      {app.shots.map((shot) => (
        <Sequence
          key={shot.src}
          name={shot.src.split("/").pop()}
          from={sec(shot.from - offset)}
          durationInFrames={sec(shot.to - shot.from)}
        >
          <ShotCard shot={shot} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
}

function AppLine({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 6);

  return (
    <HeadlineBand>
      <div
        style={{
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 82,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
          opacity: enter,
          translate: `0px ${(1 - enter) * 30}px`,
        }}
      >
        {text}
      </div>
    </HeadlineBand>
  );
}

/** Cards are centred on the safe area's middle row, whatever the crop height. */
const CARD_CENTER = 860;

function ShotCard({ shot }: { shot: AppShot }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const scale = CARD_WIDTH / shot.crop.width;
  const height = shot.crop.height * scale;
  const enter = ramp(frame, 0, 6);
  const toCard = (x: number, y: number) => ({
    x: (x - shot.crop.left) * scale,
    y: (y - shot.crop.top) * scale,
  });

  return (
    <div
      style={{
        position: "absolute",
        top: CARD_CENTER - height / 2,
        ...centered(CARD_WIDTH),
        height,
        borderRadius: 40,
        overflow: "hidden",
        backgroundColor: "#F4F6F5",
        boxShadow: "0 30px 70px rgba(10, 40, 40, 0.4)",
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [0.94, 1])),
      }}
    >
      <Img
        src={staticFile(shot.src)}
        style={{
          position: "absolute",
          left: -shot.crop.left * scale,
          top: -shot.crop.top * scale,
          width: 1206 * scale,
          maxWidth: "none",
        }}
      />
      {shot.tap ? (
        <Tap at={sec(shot.tap.at)} point={toCard(shot.tap.x, shot.tap.y)} />
      ) : null}
      {shot.ring ? (
        <Ring
          at={sec(shot.ring.at)}
          origin={toCard(shot.ring.left, shot.ring.top)}
          width={shot.ring.width * scale}
          height={shot.ring.height * scale}
        />
      ) : null}
    </div>
  );
}

function Tap({ at, point }: { at: number; point: { x: number; y: number } }) {
  const frame = useCurrentFrame();
  const press = ramp(frame, at - 4, at);
  const release = ramp(frame, at, at + 10);
  const size = 120;

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: point.x - size / 2,
          top: point.y - size / 2,
          width: size,
          height: size,
          borderRadius: 999,
          backgroundColor: "rgba(25, 38, 38, 0.28)",
          border: "5px solid rgba(255, 255, 255, 0.9)",
          boxSizing: "border-box",
          opacity: press * (1 - release * 0.8),
          scale: String(interpolate(press, [0, 1], [1.3, 0.85])),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: point.x - size / 2,
          top: point.y - size / 2,
          width: size,
          height: size,
          borderRadius: 999,
          border: `6px solid ${CORAL}`,
          boxSizing: "border-box",
          opacity: release > 0 ? 1 - release : 0,
          scale: String(interpolate(release, [0, 1], [0.9, 2])),
        }}
      />
    </>
  );
}

function Ring({
  at,
  origin,
  width,
  height,
}: {
  at: number;
  origin: { x: number; y: number };
  width: number;
  height: number;
}) {
  const frame = useCurrentFrame();
  const ring = ramp(frame, at, at + 9, Easing.out(Easing.back(1.8)));

  return (
    <div
      style={{
        position: "absolute",
        left: origin.x,
        top: origin.y,
        width,
        height,
        borderRadius: 26,
        border: `8px solid ${CORAL}`,
        boxSizing: "border-box",
        opacity: ring,
        scale: String(interpolate(ring, [0, 1], [1.08, 1])),
      }}
    />
  );
}

/**
 * `shared.tsx`'s EndCard with the note on two lines, carried over from
 * `trile-vacio.tsx`: the template slot fits one line, and the Spanish note
 * wraps into the "Enlace en la bio" pill.
 */
export function TwoLineNoteEndCard({ cta }: { cta: PosDemoProps["cta"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const noteAt = sec(cta.revealAt.note - cta.from);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ARYA.colors.background,
        opacity: ramp(frame, 0, 6),
      }}
    >
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
    </AbsoluteFill>
  );
}
