import type { CSSProperties, ReactNode } from "react";
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
import { ARYA, centered, POPPINS, ramp, ShortFrame, TEAL, useSeconds } from "./shared";

/**
 * "Encuentra las diferencias": one real photo shown twice, stacked inside the
 * safe area. Only the bottom copy carries the differences, and every one is an
 * overlay drawn here (a pill, a recoloured copy of a region, a patch cloned
 * from elsewhere in the same photo), so the photo file itself stays untouched.
 * All photo coordinates are pixels of the source photo.
 */
const PANE = { left: 60, width: 960, height: 520 } as const;
const PANE_TOPS = [436, 972] as const;
const TITLE_BAND = { top: 232, height: 160 } as const;
const TIMER = { top: 404, height: 16 } as const;
const RING_COLOR = "#E4553A";
const RING_STROKE = 9;

interface PhotoPoint {
  x: number;
  y: number;
}

type Difference =
  | { kind: "pill"; at: PhotoPoint; width: number; rotate: number }
  | { kind: "recolor"; at: PhotoPoint; rx: number; ry: number; color: string }
  | {
      kind: "clone";
      /** Top-left of the covered area. */
      at: PhotoPoint;
      width: number;
      height: number;
      /** Where the copied pixels come from, relative to `at`. */
      from: PhotoPoint;
    };

interface Reveal {
  difference: Difference;
  ring: PhotoPoint & { radius: number };
  /** Second the ring pops on both photos. */
  revealAt: number;
}

interface Line {
  text: string;
  from: number;
  to: number;
  pop?: boolean;
}

/** A type alias, not an interface: Remotion needs it assignable to Record<string, unknown>. */
export type DiferenciasProps = {
  photo: string;
  photoSize: { width: number; height: number };
  /** The part of the photo both panes show; its aspect matches the pane. */
  crop: { x: number; y: number; width: number };
  reveals: Reveal[];
  lines: Line[];
  timerEnd: number;
  /** The bottom photo pushes in toward a point while the top one dims. */
  pushIn: { from: number; to: number; at: PhotoPoint; zoom: number };
  cta: PosDemoProps["cta"];
  music: PosDemoProps["music"];
  duckAt: number;
  sfx: Sfx[];
  end: number;
};

export function Diferencias(props: DiferenciasProps) {
  const sec = useSeconds();

  return (
    <ShortFrame
      background={ARYA.colors.background}
      music={props.music}
      duckAt={props.duckAt}
      sfx={props.sfx}
    >
      {PANE_TOPS.map((top, index) => (
        <PhotoPane key={top} top={top} isAltered={index === 1} {...props} />
      ))}

      <TimerBar end={props.timerEnd} />

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

interface PhotoPaneProps extends DiferenciasProps {
  top: number;
  isAltered: boolean;
}

function PhotoPane({ top, isAltered, photo, photoSize, crop, reveals, pushIn }: PhotoPaneProps) {
  const frame = useCurrentFrame();
  const sec = useSeconds();
  const scale = PANE.width / crop.width;
  const push = ramp(frame, sec(pushIn.from), sec(pushIn.to), Easing.inOut(Easing.quad));
  const zoom = isAltered ? interpolate(push, [0, 1], [1, pushIn.zoom]) : 1;
  const dim = isAltered ? 1 : interpolate(push, [0, 1], [1, 0.35]);
  const toPane = (point: PhotoPoint) => ({ x: point.x - crop.x, y: point.y - crop.y });
  const origin = toPane(pushIn.at);

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: PANE.left,
        width: PANE.width,
        height: PANE.height,
        borderRadius: 28,
        overflow: "hidden",
        boxShadow: "0 14px 34px rgba(25, 38, 38, 0.18)",
        opacity: dim,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: crop.width,
          height: PANE.height / scale,
          transformOrigin: "0 0",
          transform: `scale(${scale})`,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transformOrigin: `${origin.x}px ${origin.y}px`,
            transform: `scale(${zoom})`,
          }}
        >
          <PhotoLayer photo={photo} photoSize={photoSize} offset={toPane({ x: 0, y: 0 })} />
          {isAltered
            ? reveals.map(({ difference }) => (
                <DifferenceOverlay
                  key={`${difference.kind}-${difference.at.x}`}
                  difference={difference}
                  photo={photo}
                  photoSize={photoSize}
                  toPane={toPane}
                />
              ))
            : null}
          {reveals.map(({ ring, revealAt }) => (
            <Sequence key={`${ring.x}-${ring.y}`} from={sec(revealAt)} layout="none">
              <Ring center={toPane(ring)} radius={ring.radius} stroke={RING_STROKE / scale} />
            </Sequence>
          ))}
        </div>
      </div>
    </div>
  );
}

function PhotoLayer({
  photo,
  photoSize,
  offset,
  style,
}: {
  photo: string;
  photoSize: DiferenciasProps["photoSize"];
  offset: PhotoPoint;
  style?: CSSProperties;
}) {
  return (
    <Img
      src={staticFile(photo)}
      style={{
        position: "absolute",
        left: offset.x,
        top: offset.y,
        width: photoSize.width,
        height: photoSize.height,
        maxWidth: "none",
        ...style,
      }}
    />
  );
}

/** Feathered on every side, so a patch melts into the photo around it. */
const SOFT_RECT_MASK: CSSProperties = {
  maskImage:
    "linear-gradient(to right, transparent, black 14%, black 86%, transparent), linear-gradient(to bottom, transparent, black 22%, black 78%, transparent)",
  maskComposite: "intersect",
};

function DifferenceOverlay({
  difference,
  photo,
  photoSize,
  toPane,
}: {
  difference: Difference;
  photo: string;
  photoSize: DiferenciasProps["photoSize"];
  toPane: (point: PhotoPoint) => PhotoPoint;
}) {
  if (difference.kind === "pill") {
    const center = toPane(difference.at);

    return (
      <div
        style={{
          position: "absolute",
          left: center.x - difference.width / 2,
          top: center.y - (difference.width * 0.42) / 2,
        }}
      >
        <YellowPill width={difference.width} rotate={difference.rotate} />
      </div>
    );
  }

  if (difference.kind === "recolor") {
    const center = toPane(difference.at);
    const box = { x: center.x - difference.rx, y: center.y - difference.ry };

    return (
      <Patch
        box={{ ...box, width: difference.rx * 2, height: difference.ry * 2 }}
        mask={{ maskImage: "radial-gradient(closest-side, black 80%, transparent)" }}
      >
        <GreenRecolorFilter color={difference.color} />
        <PhotoLayer
          photo={photo}
          photoSize={photoSize}
          offset={{ x: -(difference.at.x - difference.rx), y: -(difference.at.y - difference.ry) }}
          style={{ filter: `url(#${RECOLOR_FILTER_ID})` }}
        />
      </Patch>
    );
  }

  const corner = toPane(difference.at);

  return (
    <Patch
      box={{ ...corner, width: difference.width, height: difference.height }}
      mask={SOFT_RECT_MASK}
    >
      <PhotoLayer
        photo={photo}
        photoSize={photoSize}
        offset={{
          x: -(difference.at.x + difference.from.x),
          y: -(difference.at.y + difference.from.y),
        }}
      />
    </Patch>
  );
}

const RECOLOR_FILTER_ID = "diferencias-green-recolor";

/**
 * Recolours only the green pixels. The alpha row keeps a pixel in proportion
 * to how much greener than red it is, so the beige leather and the white of
 * the toy pass through untouched; the "color" blend keeps the toy's shading.
 */
function GreenRecolorFilter({ color }: { color: string }) {
  return (
    <svg width={0} height={0} style={{ position: "absolute" }} aria-hidden>
      <filter id={RECOLOR_FILTER_ID} colorInterpolationFilters="sRGB">
        <feFlood floodColor={color} result="paint" />
        <feBlend in="paint" in2="SourceGraphic" mode="color" result="recolored" />
        <feColorMatrix
          in="SourceGraphic"
          type="matrix"
          values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  -16 16 0 0 -0.05"
          result="greenness"
        />
        <feMorphology in="greenness" operator="dilate" radius="3" result="grown" />
        <feGaussianBlur in="grown" stdDeviation="1.5" result="soft" />
        <feComposite in="recolored" in2="soft" operator="in" />
      </filter>
    </svg>
  );
}

function Patch({
  box,
  mask,
  children,
}: {
  box: PhotoPoint & { width: number; height: number };
  mask: CSSProperties;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: box.x,
        top: box.y,
        width: box.width,
        height: box.height,
        overflow: "hidden",
        ...mask,
      }}
    >
      {children}
    </div>
  );
}

/** A plain yellow capsule with a soft contact shadow, sized in photo pixels. */
function YellowPill({ width, rotate }: { width: number; rotate: number }) {
  const height = width * 0.42;

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 42"
      style={{
        display: "block",
        rotate: `${rotate}deg`,
        overflow: "visible",
        filter: "drop-shadow(0 6px 5px rgba(50, 36, 10, 0.45))",
      }}
      aria-hidden
    >
      <defs>
        <clipPath id="yellow-pill-shape">
          <rect x="1" y="1" width="98" height="40" rx="20" />
        </clipPath>
        <linearGradient id="yellow-pill-shade" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFF4B8" />
          <stop offset="0.45" stopColor="#F7CF3B" />
          <stop offset="1" stopColor="#C99A12" />
        </linearGradient>
      </defs>
      <g clipPath="url(#yellow-pill-shape)">
        <rect width="100" height="42" fill="url(#yellow-pill-shade)" />
        <rect x="49" width="2" height="42" fill="#B88A0E" opacity="0.55" />
        <rect x="10" y="7" width="78" height="6" rx="3" fill="#FFFFFF" opacity="0.55" />
      </g>
    </svg>
  );
}

function Ring({ center, radius, stroke }: { center: PhotoPoint; radius: number; stroke: number }) {
  const frame = useCurrentFrame();
  const enter = ramp(frame, 0, 7);

  return (
    <div
      style={{
        position: "absolute",
        left: center.x - radius,
        top: center.y - radius,
        width: radius * 2,
        height: radius * 2,
        borderRadius: "50%",
        border: `${stroke}px solid ${RING_COLOR}`,
        boxSizing: "border-box",
        boxShadow: `0 0 0 ${stroke * 0.5}px rgba(255, 255, 255, 0.7)`,
        opacity: enter,
        scale: String(interpolate(enter, [0, 1], [1.6, 1])),
      }}
    />
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
  const flash = frame >= sec(end) ? 1 - ramp(frame, sec(end), sec(end) + 12) : 0;

  return (
    <div
      style={{
        position: "absolute",
        top: TIMER.top,
        left: PANE.left,
        width: PANE.width,
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
          backgroundColor: isLate ? RING_COLOR : TEAL,
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
 * `shared.tsx`'s EndCard with the note drawn on two lines, copied from
 * `trile-vacio.tsx`: the template slot fits one line, and the Spanish note
 * wraps into the "Enlace en la bio" pill.
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
