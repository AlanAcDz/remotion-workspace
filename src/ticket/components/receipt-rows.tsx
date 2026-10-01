import {
  Easing,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
} from "remotion";
import { COLORS, MONO } from "../theme";

/**
 * The pieces a receipt is printed from. Heights live next to the content so a
 * row's height and what it draws never disagree.
 */
export const ROW = {
  line: 58,
  check: 62,
  rule: 36,
} as const;

const LEADER = ".".repeat(60);

interface LineProps {
  label: string;
  value: string;
  isBold?: boolean;
}

/** `LABEL ........ $0.00` — label left, value right, dots in between. */
export function Line({ label, value, isBold = false }: LineProps) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        fontFamily: MONO,
        fontSize: 36,
        fontWeight: isBold ? 700 : 500,
        whiteSpace: "nowrap",
      }}
    >
      <span>{label}</span>
      <span
        style={{
          flex: 1,
          overflow: "hidden",
          opacity: 0.35,
          padding: "0 8px",
        }}
      >
        {LEADER}
      </span>
      <span style={{ fontWeight: 700 }}>{value}</span>
    </div>
  );
}

interface CenteredProps {
  text: string;
  size?: number;
  weight?: number;
  color?: string;
  letterSpacing?: string;
}

export function Centered({
  text,
  size = 36,
  weight = 600,
  color = COLORS.paperInk,
  letterSpacing = "0.04em",
}: CenteredProps) {
  return (
    <div
      style={{
        width: "100%",
        textAlign: "center",
        fontFamily: MONO,
        fontSize: size,
        fontWeight: weight,
        color,
        letterSpacing,
        whiteSpace: "nowrap",
      }}
    >
      {text}
    </div>
  );
}

export function Rule() {
  return (
    <div
      style={{
        width: "100%",
        borderTop: `3px dashed ${COLORS.paperInk}`,
        opacity: 0.4,
      }}
    />
  );
}

interface TotalProps {
  label: string;
  value: string;
}

/** The number the whole first half builds to. */
export function Total({ label, value }: TotalProps) {
  return (
    <div style={{ width: "100%", fontFamily: MONO }}>
      <div style={{ fontSize: 30, fontWeight: 600, letterSpacing: "0.06em" }}>
        {label}
      </div>
      <div
        style={{
          fontSize: 84,
          fontWeight: 700,
          color: COLORS.tomato,
          textAlign: "right",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
        }}
      >
        -{value}
      </div>
    </div>
  );
}

/** A fix line: what Punto Listo does, checked off in green. */
export function Check({ label }: { label: string }) {
  return (
    <div
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        justifyContent: "space-between",
        fontFamily: MONO,
        fontSize: 36,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      <span>{label}</span>
      <svg width={40} height={40} viewBox="0 0 24 24" aria-hidden>
        <circle cx={12} cy={12} r={12} fill={COLORS.success} />
        <path
          d="M6.5 12.5l3.5 3.5 7.5-8"
          fill="none"
          stroke={COLORS.paper}
          strokeWidth={2.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}

export function Logo({ src }: { src: string }) {
  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <Img src={staticFile(src)} style={{ width: 460, maxWidth: "none" }} />
    </div>
  );
}

interface StampProps {
  text: string;
  /** Frame it slams onto the paper, in the receipt's Sequence. */
  at: number;
}

/** A rubber stamp: overshoots in, lands crooked. */
export function Stamp({ text, at }: StampProps) {
  const frame = useCurrentFrame();
  const progress = interpolate(frame, [at + 2, at + 9], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.back(2.2)),
  });

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          padding: "14px 26px",
          border: `6px solid ${COLORS.tomato}`,
          borderRadius: 14,
          color: COLORS.tomato,
          fontFamily: MONO,
          fontSize: 40,
          fontWeight: 700,
          letterSpacing: "0.02em",
          whiteSpace: "nowrap",
          rotate: "-4deg",
          scale: String(interpolate(progress, [0, 1], [1.8, 1])),
          opacity: interpolate(progress, [0, 0.3], [0, 1], {
            extrapolateRight: "clamp",
          }),
        }}
      >
        {text}
      </div>
    </div>
  );
}

/** The tomato block the last receipt ends on: the ask. */
export function Pill({ text }: { text: string }) {
  return (
    <div
      style={{
        width: "100%",
        padding: "20px 0",
        borderRadius: 12,
        backgroundColor: COLORS.tomato,
        color: "#FFFFFF",
        textAlign: "center",
        fontFamily: MONO,
        fontSize: 42,
        fontWeight: 700,
        letterSpacing: "0.04em",
      }}
    >
      {text}
    </div>
  );
}

/** Deterministic bars from a seed string, so every render prints the same code. */
export function Barcode({ seed }: { seed: string }) {
  const width = 560;
  const height = 110;
  let state = [...seed].reduce(
    (hash, char) => (hash * 31 + char.charCodeAt(0)) >>> 0,
    7,
  );
  const next = () => {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 2 ** 32;
  };

  const bars: { x: number; w: number }[] = [];
  let x = 0;
  while (x < width) {
    const w = 3 + Math.floor(next() * 4) * 2;
    if (x + w > width) {
      break;
    }
    bars.push({ x, w });
    x += w + 3 + Math.floor(next() * 3) * 3;
  }

  return (
    <div style={{ width: "100%", display: "flex", justifyContent: "center" }}>
      <svg width={width} height={height} aria-hidden>
        {bars.map((bar) => (
          <rect
            key={bar.x}
            x={bar.x}
            y={0}
            width={bar.w}
            height={height}
            fill={COLORS.paperInk}
          />
        ))}
      </svg>
    </div>
  );
}
