import type { ReactNode } from "react";
import {
  AbsoluteFill,
  Easing,
  Img,
  interpolate,
  Sequence,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import type { PosDemoProps, Sfx } from "../template/schema";
import { TwoLineNoteEndCard } from "./cual-falta";
import {
  ARYA,
  centered,
  CORAL,
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

/**
 * "¿Qué dosis se saltó?": a find-the-gap game whose board is a real capture
 * of the app's dose history. A timer drains from frame 0, the unlogged dose
 * gets a ring, then a bridge with Arya's face and two Today screens: the
 * reminder that lands on time and the overdue dose the app flags.
 */

/** Captures are 1206 px wide (iPhone at 3x). */
const SOURCE_WIDTH = 1206;
const HEADLINE_BAND = { top: 220, height: 300 } as const;
const BAR = { top: 520, height: 26, width: 740 } as const;
const BOARD_TOP = 580;
const BOARD_WIDTH = 740;
const APP_CARD_WIDTH = 840;

interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** A still of the app, cropped to source rows and columns. */
interface Still {
  src: string;
  crop: Rect;
}

/** A type alias, not an interface: Remotion needs it assignable to Record<string, unknown>. */
export type QueDosisProps = {
  board: Still & {
    /** Source rectangle of the unlogged dose's row. */
    gap: Rect;
  };
  question: string;
  timerLabel: string;
  timeUpAt: number;
  reveal: string;
  bridgeAt: number;
  bridgeLine2At: number;
  bridge: [string, string];
  /** Arya's photo in the bridge. */
  photo: string;
  remindAt: number;
  remind: { line: string; still: Still; bannerAt: number };
  flagAt: number;
  flag: {
    line: string;
    still: Still;
    /** Source rectangle to ring, seconds after `flagAt`. */
    ring: Rect & { at: number };
  };
  notification: { icon: string; title: string; body: string; time: string };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  sfx: Sfx[];
};

export function QueDosis(props: QueDosisProps) {
  const sec = useSeconds();

  return (
    <ShortFrame
      background={ARYA.colors.background}
      music={props.music}
      duckAt={props.cta.from}
      sfx={props.sfx}
    >
      <Sequence name="Juego" durationInFrames={sec(props.bridgeAt)}>
        <Game {...props} />
      </Sequence>

      <Sequence
        name="Puente"
        from={sec(props.bridgeAt)}
        durationInFrames={sec(props.remindAt - props.bridgeAt)}
      >
        <Bridge
          lines={props.bridge}
          line2At={sec(props.bridgeLine2At - props.bridgeAt)}
          photo={props.photo}
        />
      </Sequence>

      <Sequence
        name="Recordatorio"
        from={sec(props.remindAt)}
        durationInFrames={sec(props.flagAt - props.remindAt)}
      >
        <AppBeat line={props.remind.line}>
          <StillCard still={props.remind.still} top={790}>
            {null}
          </StillCard>
          <Banner
            at={sec(props.remind.bannerAt - props.remindAt)}
            notification={props.notification}
          />
        </AppBeat>
      </Sequence>

      <Sequence
        name="Atrasada"
        from={sec(props.flagAt)}
        durationInFrames={sec(props.cta.from - props.flagAt)}
      >
        <AppBeat line={props.flag.line}>
          <StillCard still={props.flag.still} top={560}>
            <Ring
              at={sec(props.flag.ring.at)}
              rect={props.flag.ring}
              crop={props.flag.still.crop}
              scale={APP_CARD_WIDTH / props.flag.still.crop.width}
            />
          </StillCard>
        </AppBeat>
      </Sequence>

      <Sequence name="CTA" from={sec(props.cta.from)}>
        <TwoLineNoteEndCard cta={props.cta} />
      </Sequence>
    </ShortFrame>
  );
}

function Game(props: QueDosisProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const timeUp = sec(props.timeUpAt);
  const { crop, gap } = props.board;
  const scale = BOARD_WIDTH / crop.width;
  const height = crop.height * scale;
  const gapTop = (gap.top - crop.top) * scale;
  const gapHeight = gap.height * scale;
  const dim = 0.6 * ramp(frame, timeUp, timeUp + 6);
  // Frame 0 is already fully visible; it only settles and floats.
  const settle = interpolate(ramp(frame, 0, 10), [0, 1], [1.025, 1]);
  const float = Math.sin(frame / 18) * 4;

  return (
    <AbsoluteFill>
      <Sequence name="Pregunta" durationInFrames={timeUp}>
        <Headline text={props.question} size={100} sub={props.timerLabel} />
      </Sequence>
      <Sequence name="Revelación" from={timeUp}>
        <Headline text={props.reveal} size={104} pop />
      </Sequence>
      <Sequence name="Barra" durationInFrames={timeUp + 6}>
        <DrainBar frames={timeUp} />
      </Sequence>

      <div
        style={{
          position: "absolute",
          top: BOARD_TOP + float,
          ...centered(BOARD_WIDTH),
          height,
          borderRadius: 36,
          overflow: "hidden",
          backgroundColor: "#F4F6F5",
          boxShadow: "0 24px 60px rgba(25, 38, 38, 0.16)",
          scale: String(settle),
        }}
      >
        <Img
          src={staticFile(props.board.src)}
          style={{
            position: "absolute",
            left: -crop.left * scale,
            top: -crop.top * scale,
            width: SOURCE_WIDTH * scale,
            maxWidth: "none",
          }}
        />
        <Veil top={0} height={gapTop} opacity={dim} />
        <Veil
          top={gapTop + gapHeight}
          height={height - gapTop - gapHeight}
          opacity={dim}
        />
        <Ring
          at={timeUp}
          rect={gap}
          crop={crop}
          scale={scale}
        />
      </div>
    </AbsoluteFill>
  );
}

function Veil({
  top,
  height,
  opacity,
}: {
  top: number;
  height: number;
  opacity: number;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        top,
        height,
        backgroundColor: ARYA.colors.background,
        opacity,
      }}
    />
  );
}

function DrainBar({ frames }: { frames: number }) {
  const frame = useCurrentFrame();
  const left = Math.max(0, 1 - frame / frames);
  const isLate = frame >= frames - 60;

  return (
    <div
      style={{
        position: "absolute",
        top: BAR.top,
        ...centered(BAR.width),
        height: BAR.height,
        borderRadius: 999,
        backgroundColor: "rgba(25, 38, 38, 0.1)",
        overflow: "hidden",
        opacity: 1 - ramp(frame, frames, frames + 6),
      }}
    >
      <div
        style={{
          width: BAR.width * left,
          height: "100%",
          borderRadius: 999,
          backgroundColor: isLate ? CORAL : TEAL,
        }}
      />
    </div>
  );
}

const HEADLINE_TEXT = {
  textAlign: "center",
  fontFamily: POPPINS,
  fontWeight: 700,
  lineHeight: 1.08,
  letterSpacing: "-0.03em",
  whiteSpace: "pre-line",
} as const;

function Headline({
  text,
  size,
  sub,
  pop = false,
}: {
  text: string;
  size: number;
  sub?: string;
  pop?: boolean;
}) {
  const frame = useCurrentFrame();
  const enter = pop ? ramp(frame, 0, 8, Easing.out(Easing.back(1.8))) : 1;

  return (
    <HeadlineBand>
      <div
        style={{
          ...HEADLINE_TEXT,
          fontSize: size,
          color: ARYA.colors.ink,
          opacity: Math.min(1, enter),
          scale: String(interpolate(enter, [0, 1], [1.25, 1])),
        }}
      >
        {text}
      </div>
      {sub ? (
        <div
          style={{
            ...HEADLINE_TEXT,
            marginTop: 14,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            color: ARYA.colors.muted,
          }}
        >
          {sub}
        </div>
      ) : null}
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

function Ring({
  at,
  rect,
  crop,
  scale,
}: {
  at: number;
  rect: Rect;
  crop: Rect;
  scale: number;
}) {
  const frame = useCurrentFrame();
  const ring = ramp(frame, at, at + 9, Easing.out(Easing.back(1.8)));

  return (
    <div
      style={{
        position: "absolute",
        left: (rect.left - crop.left) * scale,
        top: (rect.top - crop.top) * scale,
        width: rect.width * scale,
        height: rect.height * scale,
        borderRadius: 30,
        border: `9px solid ${CORAL}`,
        boxSizing: "border-box",
        opacity: frame >= at ? 1 : 0,
        scale: String(interpolate(ring, [0, 1], [1.12, 1])),
      }}
    />
  );
}

function Bridge({
  lines,
  line2At,
  photo,
}: {
  lines: [string, string];
  line2At: number;
  photo: string;
}) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 8);
  const second = ramp(frame, line2At, line2At + 8, Easing.out(Easing.back(1.6)));
  const drift = interpolate(frame, [0, 90], [1, 1.03], {
    extrapolateRight: "clamp",
  });

  // Every block keeps its space from frame 0, so nothing moves when line 2 lands.
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
          gap: 44,
        }}
      >
        <div
          style={{
            ...HEADLINE_TEXT,
            fontSize: 84,
            color: ARYA.colors.background,
            opacity: enter,
          }}
        >
          {lines[0]}
        </div>
        <div
          style={{
            width: 600,
            height: 600,
            borderRadius: 48,
            overflow: "hidden",
            border: "8px solid #FFFFFF",
            boxShadow: "0 30px 70px rgba(0, 0, 0, 0.35)",
            opacity: enter,
          }}
        >
          <Img
            src={staticFile(photo)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              scale: String(drift),
            }}
          />
        </div>
        <div
          style={{
            ...HEADLINE_TEXT,
            fontSize: 84,
            color: CORAL,
            opacity: second > 0 ? 1 : 0,
            scale: String(interpolate(second, [0, 1], [0.7, 1])),
          }}
        >
          {lines[1]}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function AppBeat({ line, children }: { line: string; children: ReactNode }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 6);

  return (
    <AbsoluteFill style={{ backgroundColor: TEAL }}>
      <HeadlineBand>
        <div
          style={{
            ...HEADLINE_TEXT,
            fontSize: 82,
            color: ARYA.colors.ink,
            opacity: enter,
            translate: `0px ${(1 - enter) * 30}px`,
          }}
        >
          {line}
        </div>
      </HeadlineBand>
      {children}
    </AbsoluteFill>
  );
}

function StillCard({
  still,
  top,
  children,
}: {
  still: Still;
  top: number;
  children: ReactNode;
}) {
  const frame = useCurrentFrame();
  const scale = APP_CARD_WIDTH / still.crop.width;
  const enter = ramp(frame, 0, 6);

  return (
    <div
      style={{
        position: "absolute",
        top,
        ...centered(APP_CARD_WIDTH),
        height: still.crop.height * scale,
        borderRadius: 40,
        overflow: "hidden",
        backgroundColor: "#F4F6F5",
        boxShadow: "0 30px 70px rgba(10, 40, 40, 0.4)",
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [0.94, 1])),
      }}
    >
      <Img
        src={staticFile(still.src)}
        style={{
          position: "absolute",
          left: -still.crop.left * scale,
          top: -still.crop.top * scale,
          width: SOURCE_WIDTH * scale,
          maxWidth: "none",
        }}
      />
      {children}
    </div>
  );
}

/**
 * The app's real dose reminder (arya-tracker notifications.medicationTimeForPet
 * with its "<pet>: <treatment> (<dosage>)" body) as an iOS banner, styled like
 * `store-video/components/notification-banner.tsx`.
 */
function Banner({
  at,
  notification,
}: {
  at: number;
  notification: QueDosisProps["notification"];
}) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const local = frame - at + 8;
  const drop = spring({
    frame: local,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.8 },
  });

  if (local < 0) {
    return null;
  }

  return (
    <div
      style={{
        position: "absolute",
        top: 560,
        ...centered(APP_CARD_WIDTH),
        display: "flex",
        gap: 26,
        alignItems: "center",
        padding: "30px 34px",
        borderRadius: 60,
        background: "rgba(246, 246, 246, 0.98)",
        boxShadow: "0 26px 80px rgba(0, 0, 0, 0.28)",
        fontFamily: "-apple-system, 'SF Pro Text', 'Inter', sans-serif",
        color: "#111111",
        translate: `0px ${(1 - drop) * -500}px`,
      }}
    >
      <Img
        src={staticFile(notification.icon)}
        style={{ flex: "none", width: 96, height: 96, borderRadius: 22 }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            gap: 20,
          }}
        >
          <span style={{ fontSize: 38, lineHeight: 1.25, fontWeight: 600 }}>
            {notification.title}
          </span>
          <span style={{ flex: "none", fontSize: 32, color: "#7A7F7E" }}>
            {notification.time}
          </span>
        </div>
        <div style={{ fontSize: 38, lineHeight: 1.25 }}>{notification.body}</div>
      </div>
    </div>
  );
}
