import { Easing, interpolate, Interactive, useCurrentFrame } from "remotion";
import { COLORS, STAGE } from "../theme";

export interface ReceiptRow {
  key: string;
  height: number;
  /** Frame (inside the receipt's Sequence) the printer feeds this row out. */
  at: number;
  content: React.ReactNode;
}

interface ReceiptProps {
  name: string;
  rows: ReceiptRow[];
  /** Frame the paper is ripped off and thrown out of frame. */
  tearAt?: number;
}

const FEED_FRAMES = 6; // a thermal printer advances a line in ~0.2s
const TEAR_FRAMES = 14;
const PAD_TOP = 40;
const PAD_BOTTOM = 40;
const TOOTH = 20; // torn-edge zigzag period, px
const SLOT_GAP = 18; // the last printed row clears the slot by this much

const WINDOW_HEIGHT = STAGE.slotY - STAGE.paperTop;

/**
 * A receipt that emerges from the printer slot. Rows sit below the slot until
 * their `at` frame, then the paper advances by that row's height — the slot is
 * the window's bottom edge, so "printing" is just the paper moving up past it.
 */
export function Receipt({ name, rows, tearAt }: ReceiptProps) {
  const frame = useCurrentFrame();

  const feedOf = (row: ReceiptRow) =>
    interpolate(frame, [row.at, row.at + FEED_FRAMES], [0, 1], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
      easing: Easing.out(Easing.cubic),
    });

  const fed = rows.reduce((sum, row) => sum + row.height * feedOf(row), 0);
  const isFeeding = rows.some(
    (row) => frame >= row.at && frame < row.at + FEED_FRAMES,
  );
  const printedHeight = rows.reduce((sum, row) => sum + row.height, 0);

  const tear =
    tearAt === undefined
      ? 0
      : interpolate(frame, [tearAt, tearAt + TEAR_FRAMES], [0, 1], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
          easing: Easing.in(Easing.cubic),
        });

  // A torn receipt leaves with everything on it, flung up and to the left.
  const lift = tear * (WINDOW_HEIGHT + printedHeight + 600);
  const jitter = isFeeding ? Math.sin(frame * 2.7) * 1.4 : 0;

  return (
    <Interactive.Div
      name={name}
      style={{
        position: "absolute",
        left: 0,
        top: STAGE.paperTop,
        width: 1080,
        height: WINDOW_HEIGHT,
        overflow: "hidden",
        // The top of a long receipt fades out under the headline instead of
        // colliding with it.
        maskImage: "linear-gradient(to bottom, transparent 0px, black 110px)",
      }}
    >
      <div
        style={{
          position: "absolute",
          left: STAGE.paperLeft + jitter - tear * 140,
          top: WINDOW_HEIGHT - SLOT_GAP - fed - PAD_TOP - TOOTH / 2 - lift,
          width: STAGE.paperWidth,
          rotate: `${tear * -9}deg`,
          transformOrigin: "50% 100%",
          filter: "drop-shadow(0 18px 30px rgba(0, 0, 0, 0.45))",
        }}
      >
        <TornEdge side="top" />
        <div
          style={{
            backgroundColor: COLORS.paper,
            backgroundImage:
              "linear-gradient(90deg, rgba(0,0,0,0.035), transparent 12%, transparent 88%, rgba(0,0,0,0.035))",
            paddingTop: PAD_TOP,
            paddingBottom: PAD_BOTTOM,
            paddingLeft: 44,
            paddingRight: 44,
            color: COLORS.paperInk,
          }}
        >
          {rows.map((row) => (
            <div
              key={row.key}
              style={{
                height: row.height,
                display: "flex",
                alignItems: "center",
              }}
            >
              {row.content}
            </div>
          ))}
        </div>
        <TornEdge side="bottom" />
      </div>
    </Interactive.Div>
  );
}

function TornEdge({ side }: { side: "top" | "bottom" }) {
  const teeth = Math.ceil(STAGE.paperWidth / TOOTH);
  const height = TOOTH / 2;
  const points = Array.from({ length: teeth + 1 }, (_, index) => {
    const x = index * TOOTH;
    return `${x},${side === "top" ? height : 0} ${x + TOOTH / 2},${side === "top" ? 0 : height}`;
  }).join(" ");
  const base =
    side === "top"
      ? `0,${height + 1} ${points} ${STAGE.paperWidth},${height + 1}`
      : `0,-1 ${points} ${STAGE.paperWidth},-1`;

  return (
    <svg
      width={STAGE.paperWidth}
      height={height}
      style={{ display: "block", overflow: "visible" }}
    >
      <polygon points={base} fill={COLORS.paper} />
    </svg>
  );
}
