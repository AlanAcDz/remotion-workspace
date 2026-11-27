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
  POPPINS,
  ramp,
  ShortFrame,
  TEAL,
  useSeconds,
} from "./shared";

/**
 * "¿Qué camino lleva al queso?": the tangled-lines puzzle. Three ropes hang
 * from a round cutout of Arya's face, cross each other and end at three drawn
 * items. Every rope is a chain of S-curves between fixed rows, one x per row,
 * so where each rope lands is decided by the props and can be read off them.
 * After the timer a dot walks each rope in turn and Arya reacts to where it
 * lands. Canvas coordinates throughout.
 */
const TITLE_BAND = { top: 232, height: 160 } as const;
const TIMER = { top: 404, height: 16, left: 130, width: 820 } as const;
const FACE = { x: 540, y: 580, radius: 140 } as const;
const BUBBLE = { right: 410, top: 452, width: 290 } as const;
const ITEM = { y: 1428, width: 190, height: 150 } as const;
const ROPE_COLOR = "#3B4A4A";
const ROPE_WIDTH = 13;
const CASING_WIDTH = 33;
const WRONG = "#E4553A";
const SAMPLES_PER_SEGMENT = 48;

type ItemKind = "cheese" | "pill" | "bone";
type Reaction = "shake" | "tilt" | "hop";

interface Point {
  x: number;
  y: number;
}

interface Route {
  label: string;
  /** One x per row in `rows`; the last one is the x of the item it lands on. */
  xs: number[];
}

interface Item {
  kind: ItemKind;
  x: number;
}

interface Trace {
  route: number;
  from: number;
  to: number;
  isRight: boolean;
}

interface Line {
  text: string;
  from: number;
  to: number;
  pop?: boolean;
}

interface Bubble {
  text: string;
  from: number;
  to: number;
  reaction: Reaction;
}

/** A type alias, not an interface: Remotion needs it assignable to Record<string, unknown>. */
export type QueCaminoProps = {
  face: string;
  /** Where her face sits in the square photo, as fractions of its side. */
  faceCenter: Point;
  /** The fraction of the photo's side that fills the circle's diameter. */
  faceSpan: number;
  /** Row y values: the A/B/C labels sit on the first row, items under the last. */
  rows: number[];
  routes: Route[];
  items: Item[];
  /** Seconds the ropes take to finish drawing; they are part-drawn on frame 0. */
  drawIn: number;
  timerEnd: number;
  traces: Trace[];
  /** The cheese splits open and shows the pill inside. */
  twistAt: number;
  lines: Line[];
  bubbles: Bubble[];
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  duckAt: number;
  sfx: Sfx[];
  end: number;
};

interface Segment {
  from: Point;
  c1: Point;
  c2: Point;
  to: Point;
}

/** Vertical tangents at every row, so ropes leave and enter each row straight down. */
function buildSegments(route: Route, rows: number[]): Segment[] {
  const stub = {
    x: FACE.x + (route.xs[0] - FACE.x) * 0.3,
    y: FACE.y + FACE.radius - 10,
  };
  const points = [stub, ...route.xs.map((x, index) => ({ x, y: rows[index] }))];

  return points.slice(1).map((to, index) => {
    const from = points[index];
    const bend = (to.y - from.y) * 0.4;

    return {
      from,
      c1: { x: from.x, y: from.y + bend },
      c2: { x: to.x, y: to.y - bend },
      to,
    };
  });
}

function toPathData(segments: Segment[]): string {
  const curves = segments.map(
    ({ c1, c2, to }) => `C ${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`,
  );

  return `M ${segments[0].from.x} ${segments[0].from.y} ${curves.join(" ")}`;
}

function cubicAt({ from, c1, c2, to }: Segment, t: number): Point {
  const u = 1 - t;
  const weights = [u * u * u, 3 * u * u * t, 3 * u * t * t, t * t * t];
  const controls = [from, c1, c2, to];

  return controls.reduce(
    (sum, point, index) => ({
      x: sum.x + point.x * weights[index],
      y: sum.y + point.y * weights[index],
    }),
    { x: 0, y: 0 },
  );
}

/** The point at a fraction of the rope's length, matching SVG `pathLength={1}` dashes. */
function pointAlong(segments: Segment[], fraction: number): Point {
  const points = [
    segments[0].from,
    ...segments.flatMap((segment) =>
      Array.from({ length: SAMPLES_PER_SEGMENT }, (_, step) =>
        cubicAt(segment, (step + 1) / SAMPLES_PER_SEGMENT),
      ),
    ),
  ];
  const lengths = points.reduce<number[]>((acc, point, index) => {
    const previous = points[Math.max(index - 1, 0)];

    return [
      ...acc,
      (acc[index - 1] ?? 0) +
        Math.hypot(point.x - previous.x, point.y - previous.y),
    ];
  }, []);
  const target =
    Math.min(Math.max(fraction, 0), 1) * lengths[lengths.length - 1];
  const index = Math.max(
    lengths.findIndex((length) => length >= target),
    1,
  );
  const span = lengths[index] - lengths[index - 1] || 1;
  const t = (target - lengths[index - 1]) / span;
  const a = points[index - 1];
  const b = points[index];

  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

export function QueCamino(props: QueCaminoProps) {
  const sec = useSeconds();
  const segments = props.routes.map((route) =>
    buildSegments(route, props.rows),
  );

  return (
    <ShortFrame
      background={ARYA.colors.background}
      music={props.music}
      duckAt={props.duckAt}
      sfx={props.sfx}
    >
      <Ropes {...props} segments={segments} />
      <Items {...props} />
      <Face {...props} />
      <TimerBar end={props.timerEnd} />

      {props.bubbles.map((bubble) => (
        <Sequence
          key={bubble.text}
          name={bubble.text}
          from={sec(bubble.from)}
          durationInFrames={sec(bubble.to - bubble.from)}
        >
          <SpeechBubble text={bubble.text} />
        </Sequence>
      ))}

      {props.lines.map((line) => (
        <Sequence
          key={line.text}
          name={line.text}
          from={sec(line.from)}
          durationInFrames={sec(line.to - line.from)}
        >
          <TopLine text={line.text} pop={line.pop} />
        </Sequence>
      ))}

      <Sequence name="CTA" from={sec(props.cta.from)}>
        <TwoLineNoteEndCard cta={props.cta} />
      </Sequence>
    </ShortFrame>
  );
}

function Ropes({
  segments,
  routes,
  rows,
  drawIn,
  traces,
}: QueCaminoProps & { segments: Segment[][] }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const drawn = interpolate(
    ramp(frame, 0, sec(drawIn), Easing.out(Easing.quad)),
    [0, 1],
    [0.3, 1],
  );

  return (
    <svg
      width={1080}
      height={1920}
      viewBox="0 0 1080 1920"
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
    >
      {segments.map((route, index) => {
        const data = toPathData(route);

        return (
          <g key={routes[index].label}>
            <path
              d={data}
              pathLength={1}
              fill="none"
              stroke={ARYA.colors.background}
              strokeWidth={CASING_WIDTH}
              strokeDasharray={`${drawn} 2`}
            />
            <path
              d={data}
              pathLength={1}
              fill="none"
              stroke={ROPE_COLOR}
              strokeWidth={ROPE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={`${drawn} 2`}
            />
          </g>
        );
      })}

      {traces.map((trace, index) => {
        if (frame < sec(trace.from)) {
          return null;
        }

        const progress = ramp(
          frame,
          sec(trace.from),
          sec(trace.to),
          Easing.inOut(Easing.quad),
        );
        const next = traces[index + 1];
        const fade = next
          ? interpolate(
              ramp(frame, sec(next.from), sec(next.from) + 8),
              [0, 1],
              [1, 0],
            )
          : 1;

        return (
          <path
            key={`trace-${trace.route}`}
            d={toPathData(segments[trace.route])}
            pathLength={1}
            fill="none"
            stroke={trace.isRight ? TEAL : WRONG}
            strokeWidth={ROPE_WIDTH + 3}
            strokeLinecap="round"
            strokeDasharray={`${progress} 2`}
            opacity={fade}
          />
        );
      })}

      {routes.map((route) => (
        <g key={`label-${route.label}`}>
          <circle
            cx={route.xs[0]}
            cy={rows[0]}
            r={44}
            fill={ROPE_COLOR}
            stroke="#FFFFFF"
            strokeWidth={6}
          />
          <text
            x={route.xs[0]}
            y={rows[0] + 16}
            textAnchor="middle"
            fontFamily={POPPINS}
            fontWeight={700}
            fontSize={46}
            fill="#FFFFFF"
          >
            {route.label}
          </text>
        </g>
      ))}

      {traces.map((trace) => {
        const start = sec(trace.from);
        const end = sec(trace.to);

        if (frame < start || frame > end + 6) {
          return null;
        }

        const point = pointAlong(
          segments[trace.route],
          ramp(frame, start, end, Easing.inOut(Easing.quad)),
        );

        return (
          <circle
            key={`dot-${trace.route}`}
            cx={point.x}
            cy={point.y}
            r={24}
            fill={trace.isRight ? TEAL : WRONG}
            stroke="#FFFFFF"
            strokeWidth={7}
            opacity={1 - ramp(frame, end, end + 6)}
          />
        );
      })}
    </svg>
  );
}

function Items({ items, routes, traces, twistAt }: QueCaminoProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();

  return (
    <>
      {items.map((item) => {
        const trace = traces.find(
          ({ route }) =>
            routes[route].xs[routes[route].xs.length - 1] === item.x,
        );
        const arrival = trace ? sec(trace.to) : Number.POSITIVE_INFINITY;
        const bump =
          frame >= arrival
            ? interpolate(frame - arrival, [0, 5, 12], [1, 1.18, 1], {
                extrapolateRight: "clamp",
              })
            : 1;
        const twistGrow =
          item.kind === "cheese"
            ? 1 + 0.3 * ramp(frame, sec(twistAt), sec(twistAt) + 10)
            : 1;

        return (
          <div
            key={item.kind}
            style={{
              position: "absolute",
              left: item.x - ITEM.width / 2,
              top: ITEM.y - ITEM.height / 2,
              width: ITEM.width,
              height: ITEM.height,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              scale: String(bump * twistGrow),
            }}
          >
            {item.kind === "cheese" ? <Cheese splitAt={sec(twistAt)} /> : null}
            {item.kind === "pill" ? <Capsule width={140} rotate={-14} /> : null}
            {item.kind === "bone" ? <Bone /> : null}
            {trace ? (
              <Sequence from={arrival} layout="none">
                <Badge isRight={trace.isRight} />
              </Sequence>
            ) : null}
          </div>
        );
      })}
    </>
  );
}

function Badge({ isRight }: { isRight: boolean }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 8);

  return (
    <svg
      width={68}
      height={68}
      viewBox="0 0 68 68"
      style={{
        position: "absolute",
        right: -6,
        top: -18,
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [1.6, 1])),
      }}
      aria-hidden
    >
      <circle
        cx={34}
        cy={34}
        r={29}
        fill={isRight ? TEAL : WRONG}
        stroke="#FFFFFF"
        strokeWidth={5}
      />
      {isRight ? (
        <path
          d="M21 35 L30 44 L47 25"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ) : (
        <path
          d="M24 24 L44 44 M44 24 L24 44"
          stroke="#FFFFFF"
          strokeWidth={7}
          strokeLinecap="round"
        />
      )}
    </svg>
  );
}

const CHEESE_SHAPE = "M8 92 L150 92 L150 52 L28 18 Q10 22 8 40 Z";
const CHEESE_TOP = "M8 40 L28 18 L150 52 L130 62 Z";

/** A cheese wedge with holes; at `splitAt` its halves part and a capsule shows inside. */
function Cheese({ splitAt }: { splitAt: number }) {
  const frame = useCurrentFrame();
  const split = ramp(frame, splitAt, splitAt + 12);
  const capsule = ramp(frame, splitAt + 4, splitAt + 14);

  const half = (side: "left" | "right") => (
    <svg
      width={170}
      height={110}
      viewBox="0 0 160 104"
      style={{
        position: "absolute",
        left: 10,
        top: 20,
        overflow: "visible",
        translate: `${(side === "left" ? -48 : 48) * split}px 0`,
        rotate: `${(side === "left" ? -9 : 9) * split}deg`,
      }}
      aria-hidden
    >
      <defs>
        <clipPath id={`cheese-${side}`}>
          <rect
            x={side === "left" ? -20 : 80}
            y={-20}
            width={100}
            height={140}
          />
        </clipPath>
      </defs>
      <g clipPath={`url(#cheese-${side})`}>
        <path
          d={CHEESE_SHAPE}
          fill="#F4C542"
          stroke="#9A7414"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path
          d={CHEESE_TOP}
          fill="#FBDD72"
          stroke="#9A7414"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <circle cx={42} cy={72} r={9} fill="#D9A520" />
        <circle cx={112} cy={78} r={7} fill="#D9A520" />
        <circle cx={78} cy={66} r={5} fill="#D9A520" />
        <circle cx={132} cy={70} r={4} fill="#D9A520" />
        {side === "left" ? null : (
          <path
            d="M80 30 L80 92"
            stroke="#9A7414"
            strokeWidth={4}
            opacity={split}
          />
        )}
      </g>
    </svg>
  );

  return (
    <>
      {half("left")}
      {half("right")}
      <div
        style={{
          position: "absolute",
          left: 40,
          top: 64,
          opacity: capsule,
          scale: String(interpolate(capsule, [0, 1], [0.4, 1])),
        }}
      >
        <Capsule width={110} rotate={-10} />
      </div>
    </>
  );
}

const BONE_KNOBS = [
  { cx: 34, cy: 26 },
  { cx: 34, cy: 54 },
  { cx: 136, cy: 26 },
  { cx: 136, cy: 54 },
] as const;

/** Drawn twice, outline first, so the knobs and shaft read as one outlined shape. */
function Bone() {
  const shape = (fill: string, grow: number) => (
    <g fill={fill}>
      <rect
        x={34 - grow}
        y={27 - grow}
        width={102 + grow * 2}
        height={26 + grow * 2}
      />
      {BONE_KNOBS.map((knob) => (
        <circle key={`${knob.cx}-${knob.cy}`} {...knob} r={17 + grow} />
      ))}
    </g>
  );

  return (
    <svg
      width={170}
      height={80}
      viewBox="0 0 170 80"
      style={{ rotate: "-12deg", overflow: "visible" }}
      aria-hidden
    >
      {shape("#8A7A66", 4)}
      {shape("#FFF8EF", 0)}
    </svg>
  );
}

function Face({ face, faceCenter, faceSpan, bubbles }: QueCaminoProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const size = FACE.radius * 2;
  const photo = size / faceSpan;
  const motion = bubbles.reduce(
    (sum, bubble) => {
      const local = frame - sec(bubble.from);

      if (local < 0 || local > sec(bubble.to - bubble.from)) {
        return sum;
      }

      if (bubble.reaction === "shake") {
        const decay = 1 - ramp(local, 0, 18, Easing.linear);

        return {
          ...sum,
          rotate: sum.rotate + Math.sin(local * 1.3) * 7 * decay,
        };
      }

      if (bubble.reaction === "tilt") {
        return { ...sum, rotate: sum.rotate - 11 * ramp(local, 0, 9) };
      }

      const hop = interpolate(local, [0, 5, 10, 14, 18], [0, -26, 0, -10, 0], {
        extrapolateRight: "clamp",
      });

      return { ...sum, lift: sum.lift + hop };
    },
    { rotate: 0, lift: 0 },
  );

  return (
    <div
      style={{
        position: "absolute",
        left: FACE.x - FACE.radius,
        top: FACE.y - FACE.radius,
        width: size,
        height: size,
        borderRadius: "50%",
        overflow: "hidden",
        border: "8px solid #FFFFFF",
        boxSizing: "border-box",
        boxShadow: "0 14px 34px rgba(25, 38, 38, 0.22)",
        rotate: `${motion.rotate}deg`,
        translate: `0 ${motion.lift}px`,
      }}
    >
      <Img
        src={staticFile(face)}
        style={{
          position: "absolute",
          left: size / 2 - 8 - faceCenter.x * photo,
          top: size / 2 - 8 - faceCenter.y * photo,
          width: photo,
          height: photo,
          maxWidth: "none",
        }}
      />
    </div>
  );
}

/** A white bubble left of her face, its tail pointing at her. */
function SpeechBubble({ text }: { text: string }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 7);

  return (
    <div
      style={{
        position: "absolute",
        left: BUBBLE.right - BUBBLE.width,
        top: BUBBLE.top,
        width: BUBBLE.width,
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [0.6, 1])),
        transformOrigin: "100% 60%",
      }}
    >
      <div
        style={{
          padding: "22px 24px",
          borderRadius: 34,
          backgroundColor: "#FFFFFF",
          boxShadow: "0 10px 26px rgba(25, 38, 38, 0.18)",
          fontFamily: POPPINS,
          fontSize: 46,
          fontWeight: 700,
          lineHeight: 1.1,
          letterSpacing: "-0.02em",
          textAlign: "center",
          color: ARYA.colors.ink,
          whiteSpace: "pre-line",
        }}
      >
        {text}
      </div>
      <svg
        width={40}
        height={44}
        viewBox="0 0 40 44"
        style={{ position: "absolute", right: -30, top: 52 }}
        aria-hidden
      >
        <path d="M0 4 L38 22 L0 40 Z" fill="#FFFFFF" />
      </svg>
    </div>
  );
}

/** Drains from full to empty by `end`, turning coral for the last two seconds. */
function TimerBar({ end }: { end: number }) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const left = interpolate(frame, [0, sec(end)], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const isLate = frame >= sec(end - 2);
  const flash =
    frame >= sec(end) ? 1 - ramp(frame, sec(end), sec(end) + 12) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: TIMER.top,
        left: TIMER.left,
        width: TIMER.width,
        height: TIMER.height,
        borderRadius: 999,
        backgroundColor: `rgba(228, 85, 58, ${0.18 + flash * 0.6})`,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${left * 100}%`,
          height: "100%",
          borderRadius: 999,
          backgroundColor: isLate ? WRONG : TEAL,
        }}
      />
    </div>
  );
}

function TopLine({ text, pop = false }: { text: string; pop?: boolean }) {
  const frame = useCurrentFrame();
  const enter = pop ? ramp(frame, 0, 8) : 1;

  return (
    <div
      style={{
        position: "absolute",
        top: TITLE_BAND.top,
        height: TITLE_BAND.height,
        ...centered(820),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        fontFamily: POPPINS,
        fontSize: 70,
        fontWeight: 700,
        lineHeight: 1.08,
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

/**
 * `shared.tsx`'s EndCard with the note drawn on two lines, as in
 * `diferencias.tsx`: the template slot fits one line, and the Spanish note
 * wraps into the "Enlace en la bio" pill.
 */
function TwoLineNoteEndCard({ cta }: { cta: PosDemoProps["cta"] }) {
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
