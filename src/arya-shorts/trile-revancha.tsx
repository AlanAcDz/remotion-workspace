import { Video } from "@remotion/media";
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
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

/**
 * "Trile: la revancha": the shell game of `trile-vacio.tsx` with four cups and
 * a fair ending. The pill is tracked through every swap and the cup that lifts
 * must be the one hiding it; `revealSlot` throws otherwise. `trile.tsx` and
 * `trile-vacio.tsx` stay untouched because their videos are published, so the
 * pieces they do not export are carried over here.
 */
/** Shifted left of centre so cup D and its label clear TikTok's right-hand buttons. */
const SLOTS = [165, 390, 615, 840];
const CUP_SIZE = 280;
/** Same table line as `trile-vacio.tsx`: the labels clear TikTok's bottom 420 px. */
const CUP_BASE = 1330;
const LABELS = ["A", "B", "C", "D"];
const LIFT_HEIGHT = 420;
const LIFT_FRAMES = 9;
const PILL_WIDTH = 120;
const SNATCH_FRAMES = 6;

export type Swap = { a: number; b: number; seconds: number };

/** A type alias, not an interface: Remotion needs it assignable to Record<string, unknown>. */
export type TrileRevanchaProps = {
  table: string;
  cup: string;
  /** Slot the pill starts under (0 = A). */
  pillStart: number;
  /** Each swap's two slots and its length in seconds, in order. */
  swaps: Swap[];
  swapFrom: number;
  /** How far above the table the pill cup hovers on frame 0, in px. */
  hoverFrom: number;
  landAt: number;
  stopAt: number;
  countdown: number[];
  /** The one slot that lifts; it must be where the swaps leave the pill. */
  liftSlot: number;
  liftAt: number;
  /** Second the pill is snatched off the table, right before the clip. */
  snatchAt: number;
  hook: string;
  ask: string;
  found: string;
  clip: { src: string; from: number; to: number; rate: number; text: string };
  sheet: {
    src: string;
    from: number;
    to: number;
    text: string;
    /** Source row of the screenshot that sits at the top of the card. */
    cropTop: number;
    /** Card row of the button to ring, or null for no ring. */
    ringTop: number | null;
  };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  duckAt: number;
  sfx: Sfx[];
  end: number;
};

/** Follows the pill through every swap: a swap that touches its slot moves it. */
export function pillSlotAfter(start: number, swaps: Swap[]): number {
  return swaps.reduce((slot, { a, b }) => {
    if (slot === a) return b;
    if (slot === b) return a;
    return slot;
  }, start);
}

/** The slot to lift, after checking it is the one the pill really ended under. */
export function revealSlot({
  pillStart,
  swaps,
  liftSlot,
}: Pick<TrileRevanchaProps, "pillStart" | "swaps" | "liftSlot">): number {
  const pillSlot = pillSlotAfter(pillStart, swaps);
  if (pillSlot !== liftSlot) {
    throw new Error(
      `Unfair reveal: the pill ends under ${LABELS[pillSlot]}, but cup ${LABELS[liftSlot]} lifts.`,
    );
  }
  return pillSlot;
}

interface CupState {
  x: number;
  slot: number;
  lift: number;
  scale: number;
  depth: number;
}

/** Plays the swaps forward from the start, so every cup's path is honest. */
function cupsAt(seconds: number, swaps: Swap[], swapFrom: number): CupState[] {
  const slotOf = SLOTS.map((_, slot) => slot);
  const states: CupState[] = slotOf.map((slot) => ({
    x: SLOTS[slot],
    slot,
    lift: 0,
    scale: 1,
    depth: 0,
  }));
  let start = swapFrom;

  for (const swap of swaps) {
    const end = start + swap.seconds;
    const front = slotOf.indexOf(swap.a);
    const back = slotOf.indexOf(swap.b);

    if (seconds >= end) {
      slotOf[front] = swap.b;
      slotOf[back] = swap.a;
      states[front] = { ...states[front], x: SLOTS[swap.b], slot: swap.b };
      states[back] = { ...states[back], x: SLOTS[swap.a], slot: swap.a };
    } else if (seconds >= start) {
      const t = Easing.inOut(Easing.quad)((seconds - start) / swap.seconds);
      const arc = Math.sin(t * Math.PI);
      states[front] = {
        x: interpolate(t, [0, 1], [SLOTS[swap.a], SLOTS[swap.b]]),
        slot: swap.a,
        lift: -60 * arc,
        scale: 1 + 0.1 * arc,
        depth: 1,
      };
      states[back] = {
        x: interpolate(t, [0, 1], [SLOTS[swap.b], SLOTS[swap.a]]),
        slot: swap.b,
        lift: 50 * arc,
        scale: 1 - 0.1 * arc,
        depth: -1,
      };
      break;
    }
    start = end;
  }

  return states;
}

export function TrileRevancha(props: TrileRevanchaProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const { clip, sheet } = props;
  const liftSlot = revealSlot(props);
  const states = cupsAt(frame / 30, props.swaps, props.swapFrom);
  const fall = ramp(frame, 0, sec(props.landAt), Easing.in(Easing.quad));
  const labels = ramp(frame, sec(props.stopAt), sec(props.stopAt) + 6);
  const lift = ramp(frame, sec(props.liftAt), sec(props.liftAt) + LIFT_FRAMES);
  const bob = lift * Math.sin((frame - sec(props.liftAt)) / 7) * 10;
  const snatch = ramp(
    frame,
    sec(props.snatchAt),
    sec(props.snatchAt) + SNATCH_FRAMES,
    Easing.in(Easing.quad),
  );
  const isPillShown = frame < sec(props.landAt) || frame >= sec(props.liftAt);
  const pillSlot = frame < sec(props.landAt) ? props.pillStart : liftSlot;
  const order = states
    .map((state, cup) => ({ ...state, cup }))
    .sort((one, two) => one.depth - two.depth);

  return (
    <ShortFrame
      background="#E9DFCF"
      music={props.music}
      duckAt={props.duckAt}
      sfx={props.sfx}
    >
      <Img
        src={staticFile(props.table)}
        style={{
          position: "absolute",
          left: -100,
          top: 0,
          width: 1280,
          height: 1920,
          maxWidth: "none",
        }}
      />

      <div
        style={{
          position: "absolute",
          left: SLOTS[liftSlot] - 105,
          top: CUP_BASE - 30,
          width: 210,
          height: 46,
          borderRadius: "50%",
          backgroundColor: "rgba(70, 40, 14, 0.22)",
          filter: "blur(4px)",
          opacity: lift,
        }}
      />

      {isPillShown ? (
        <div
          style={{
            position: "absolute",
            left: SLOTS[pillSlot] - PILL_WIDTH / 2,
            top: CUP_BASE - 62,
            translate: `${-snatch * 420}px ${snatch * 700}px`,
            rotate: `${snatch * -160}deg`,
          }}
        >
          <Capsule width={PILL_WIDTH} rotate={-8} />
        </div>
      ) : null}

      {order.map(({ cup, x, slot, lift: arc, scale }) => {
        const drop = slot === props.pillStart ? (1 - fall) * -props.hoverFrom : 0;
        const raise = slot === liftSlot ? lift * LIFT_HEIGHT + bob : 0;

        return (
          <Img
            key={cup}
            src={staticFile(props.cup)}
            style={{
              position: "absolute",
              left: x - CUP_SIZE / 2,
              top: CUP_BASE - CUP_SIZE + 20 + arc + drop - raise,
              width: CUP_SIZE,
              height: CUP_SIZE,
              scale: String(scale),
              transformOrigin: "50% 100%",
              filter: "drop-shadow(0 16px 12px rgba(60, 38, 16, 0.32))",
            }}
          />
        );
      })}

      {SLOTS.map((x, slot) => (
        <div
          key={x}
          style={{
            position: "absolute",
            left: x - 48,
            top: CUP_BASE + 40,
            width: 96,
            height: 96,
            borderRadius: 999,
            backgroundColor: ARYA.colors.background,
            color: ARYA.colors.ink,
            fontFamily: POPPINS,
            fontSize: 60,
            fontWeight: 700,
            lineHeight: "96px",
            textAlign: "center",
            opacity: labels,
            scale: String(interpolate(labels, [0, 1], [0.6, 1])),
          }}
        >
          {LABELS[slot]}
        </div>
      ))}

      <Sequence name="Gancho" durationInFrames={sec(props.stopAt)}>
        <TopLine text={props.hook} />
      </Sequence>
      <Sequence
        name="¿Cuál?"
        from={sec(props.stopAt)}
        durationInFrames={sec(props.liftAt - props.stopAt)}
      >
        <TopLine text={props.ask} />
      </Sequence>
      {props.countdown.map((at, index) => (
        <Sequence key={at} from={sec(at)} durationInFrames={sec(0.5)}>
          <CountDigit value={props.countdown.length - index} />
        </Sequence>
      ))}
      <Sequence
        name="¡Ahí estaba!"
        from={sec(props.liftAt)}
        durationInFrames={sec(clip.from - props.liftAt)}
      >
        <TopLine text={props.found} pop />
      </Sequence>

      <Sequence name="Arya" from={sec(clip.from)} durationInFrames={sec(clip.to - clip.from)}>
        <AbsoluteFill style={{ backgroundColor: "#000000" }}>
          <Video
            src={staticFile(clip.src)}
            muted
            playbackRate={clip.rate}
            style={{ width: 1080, height: 1920 }}
          />
          <Band text={clip.text} />
        </AbsoluteFill>
      </Sequence>

      <Sequence name="Hoja" from={sec(sheet.from)} durationInFrames={sec(sheet.to - sheet.from)}>
        <SheetCard sheet={sheet} />
      </Sequence>

      <Sequence name="CTA" from={sec(props.cta.from)}>
        <TwoLineNoteEndCard cta={props.cta} />
      </Sequence>
    </ShortFrame>
  );
}

function TopLine({ text, pop = false }: { text: string; pop?: boolean }) {
  const frame = useCurrentFrame();
  const enter = pop ? ramp(frame, 0, 8) : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: 270,
        ...centered(860),
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: pop ? 104 : 88,
        fontWeight: 700,
        lineHeight: 1.1,
        letterSpacing: "-0.03em",
        whiteSpace: "pre-line",
        color: ARYA.colors.ink,
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [1.25, 1])),
      }}
    >
      {text}
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
        top: 560,
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 300,
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

function Band({ text }: { text: string }) {
  return (
    <div
      style={{
        position: "absolute",
        top: 250,
        ...centered(880),
        padding: "26px 34px",
        borderRadius: 30,
        backgroundColor: ARYA.colors.background,
        color: ARYA.colors.ink,
        fontFamily: POPPINS,
        fontSize: 68,
        fontWeight: 700,
        lineHeight: 1.12,
        letterSpacing: "-0.03em",
        textAlign: "center",
        whiteSpace: "pre-line",
      }}
    >
      {text}
    </div>
  );
}

const CARD_WIDTH = 860;
const SHOT_WIDTH = 900;
const SHOT_SCALE = SHOT_WIDTH / 1206;

function SheetCard({ sheet }: { sheet: TrileRevanchaProps["sheet"] }) {
  const frame = useCurrentFrame();
  const rise = ramp(frame, 0, 9);
  const ring = ramp(frame, 14, 22);

  return (
    <AbsoluteFill style={{ backgroundColor: TEAL }}>
      <div
        style={{
          position: "absolute",
          top: 230,
          ...centered(880),
          textAlign: "center",
          fontFamily: POPPINS,
          fontSize: 84,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
          color: ARYA.colors.ink,
        }}
      >
        {sheet.text}
      </div>
      <div
        style={{
          position: "absolute",
          top: 500,
          ...centered(CARD_WIDTH),
          height: 780,
          borderRadius: 44,
          overflow: "hidden",
          boxShadow: "0 30px 70px rgba(10, 40, 40, 0.4)",
          translate: `0px ${(1 - rise) * 120}px`,
        }}
      >
        <Img
          src={staticFile(sheet.src)}
          style={{
            position: "absolute",
            left: -20,
            top: -Math.round(sheet.cropTop * SHOT_SCALE),
            width: SHOT_WIDTH,
            maxWidth: "none",
          }}
        />
        {sheet.ringTop === null ? null : (
          <div
            style={{
              position: "absolute",
              left: 22,
              top: sheet.ringTop,
              width: CARD_WIDTH - 44,
              height: 92,
              borderRadius: 28,
              border: `7px solid ${CORAL}`,
              boxSizing: "border-box",
              opacity: ring,
              scale: String(interpolate(ring, [0, 1], [1.08, 1])),
            }}
          />
        )}
      </div>
    </AbsoluteFill>
  );
}

/**
 * `shared.tsx`'s EndCard, with the note drawn here on two lines: the template
 * slot fits one line, and the Spanish note wraps into the "Enlace en la bio" pill.
 */
function TwoLineNoteEndCard({ cta }: { cta: PosDemoProps["cta"] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const noteAt = sec(cta.revealAt.note - cta.from);

  return (
    <AbsoluteFill
      style={{ backgroundColor: ARYA.colors.background, opacity: ramp(frame, 0, 6) }}
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
